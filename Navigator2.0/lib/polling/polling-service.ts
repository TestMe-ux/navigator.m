/**
 * Modern React/Next.js Polling Service
 * Replaces Angular ReportStatusService with improved architecture
 */

import { getAllReportsForPolling, getRTRRReportStatusForPolling, regenerateRTRRForPolling } from './api-services';
import { NotificationService } from './notification-service';
import {
  PollingConfig,
  ReportPollingData,
  TaskPollingData,
  PollingState,
  PollingType,
  ReportStatus,
  TaskStatus
} from './types';
import { useSelectedProperty, useUserDetail } from "@/hooks/use-local-storage"
export class PollingService {

  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private pollingStates: Map<string, PollingState> = new Map();
  private localStorageKeys = {
    report: 'active_report_id',
    task: 'active_task_id'
  };

  constructor() {
    // Clean up old localStorage items on initialization
    this.cleanupOldLocalStorageItems();
    // Resume any polling on service initialization
    this.resumePollingOnStart();
  }

  /**
   * Clean up old localStorage items that might be left over from previous sessions
   */
  private cleanupOldLocalStorageItems(): void {
    if (typeof window === 'undefined') return;

    const currentTime = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('task_data_') || key.startsWith('report_data_') || key.startsWith('Lighting_Refresh_'))) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsedData = JSON.parse(data);
            // Check if the item is older than 24 hours
            if (parsedData.TimeStamp && (currentTime - parsedData.TimeStamp) > maxAge) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // If we can't parse the data, remove it
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🧹 Cleaned up old localStorage item: ${key}`);
    });
  }

  /**
   * Resume polling operations from localStorage on app start
   * This method is called when the service initializes
   */
  private resumePollingOnStart(): void {
    if (typeof window === 'undefined') return;

    // Try to resume task polling
    this.resumeTaskPolling();

    // Try to resume report polling
    this.resumeReportPolling();
  }

  /**
   * Resume task polling from localStorage
   */
  private resumeTaskPolling(): void {
    // Look for any active task polling data in localStorage
    const taskKeys = this.findLocalStorageKeys('active_task_id');

    for (const key of taskKeys) {
      const taskId = localStorage.getItem(key);
      if (taskId) {
        // Try to get the stored task data
        const taskData = this.getStoredTaskData(parseInt(taskId));
        if (taskData) {
          console.log('🔄 Resuming task polling for task ID:', taskId);
          this.startTaskPolling(taskData);
        }
      }
    }
  }

  /**
   * Resume report polling from localStorage
   */
  private resumeReportPolling(): void {
    // Look for any active report polling data in localStorage
    const reportKeys = this.findLocalStorageKeys('active_report_id');

    for (const key of reportKeys) {
      const reportId = localStorage.getItem(key);
      if (reportId) {
        // Try to get the stored report data
        const reportData = this.getStoredReportData(reportId);
        if (reportData) {
          console.log('🔄 Resuming report polling for report ID:', reportId);
          this.startReportPolling(reportData);
        }
      }
    }
  }

  /**
   * Find localStorage keys that match a pattern
   */
  private findLocalStorageKeys(pattern: string): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(pattern)) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Start report polling
   */
  startReportPolling(data: ReportPollingData): void {
    const key = this.getReportKey(data.sid, data.userEmail);
    this.clearPolling('report', undefined, data.reportId);

    // Store report ID in localStorage
    localStorage.setItem(key, data.reportId);
    this.storeReportData(data);

    // Set initial polling state
    this.pollingStates.set(key, {
      isActive: true,
      isPaused: false,
      retryCount: 0,
      lastPollTime: Date.now()
    });

    // Start polling immediately
    this.pollReportStatus(data);
  }

  /**
   * Start task polling
   */
  startTaskPolling(data: TaskPollingData): void {
    const key = this.getTaskKey(data.sid, data.userId);
    this.clearPolling('task', data.taskId);

    // Store task ID in localStorage
    localStorage.setItem(key, data.taskId.toString());
    this.storeTaskData(data);

    // Set initial polling state
    this.pollingStates.set(key, {
      isActive: true,
      isPaused: false,
      retryCount: 0,
      lastPollTime: Date.now(),
      onTaskComplete: data.onTaskComplete
    });

    // Start polling immediately
    this.pollTaskStatus(data);
  }

  /**
   * Poll report status
   */
  private async pollReportStatus(data: ReportPollingData): Promise<void> {
    const key = this.getReportKey(data.sid, data.userEmail);
    const state = this.pollingStates.get(key);

    if (!state?.isActive) return;

    try {
      const response = await getAllReportsForPolling({
        sid: data.sid,
        startdate: data.startDate,
        enddate: data.endDate
      });

      if (response.status && response.body) {
        const userReports = response.body.filter(report =>
          report.recipientEmail?.toLowerCase()
            .split(',')
            .map(email => email.trim())
            .includes(data.userEmail.toLowerCase())
        );

        if (userReports.length > 0) {
          const report = userReports[0];
          const isReady = report.reportStatus.toLowerCase() === 'generated';

          if (isReady) {
            // Report is ready
            NotificationService.showReportReady(report.reportFilePath);
            this.clearPolling('report', undefined, data.reportId);
            return;
          }

          if (report.reportStatus.toLowerCase() === 'error') {
            // Report failed
            NotificationService.showReportError();
            this.clearPolling('report', undefined, data.reportId);
            return;
          }

          // Report still processing, schedule next poll
          const retryTime = (report.retryTime && report.retryTime > 0) ? report.retryTime * 1000 : 60000;
          this.scheduleNextPoll('report', retryTime, () => this.pollReportStatus(data), data);
        }
      }
    } catch (error) {
      console.error('❌ Report polling error:', error);
      this.handlePollingError('report', error as Error);
    }
  }

  /**
   * Poll task status
   */
  private async pollTaskStatus(data: TaskPollingData): Promise<void> {
    const key = this.getTaskKey(data.sid, data.userId);
    const state = this.pollingStates.get(key);

    if (!state?.isActive) return;

    try {
      const response = await getRTRRReportStatusForPolling({ ReportId: data.taskId });

      if (response.status && response.body) {
        const taskStatus = Array.isArray(response.body) ? response.body[0] : response.body;

        if (!taskStatus || !taskStatus.reportStatus) {
          // Task failed
          NotificationService.showTaskError();
          this.clearPolling('task', data.taskId);
          // Trigger completion callback to re-enable Lightning Refresh
          data.onTaskComplete?.();
          return;
        }

        const status = taskStatus.reportStatus.toLowerCase();

        if (status === 'generated') {
          // Task completed successfully
          NotificationService.showTaskCompleted(data.channel, data.los, data.guest);
          this.clearPolling('task', data.taskId);
          // Trigger completion callback to re-enable Lightning Refresh
          data.onTaskComplete?.();
          return;
        }

        if (status === 'retry') {
          // Task needs retry
          const lightningData = this.getStoredLightningData(data.taskId);
          if (lightningData?.IsFired) {
            NotificationService.showTaskRetry(data.channel);

            // Regenerate the report
            try {
              await regenerateRTRRForPolling({ ReportId: data.taskId });
              // Continue polling after regeneration
              this.scheduleNextPoll('task', 5000, () => this.pollTaskStatus(data), data);
            } catch (error) {
              console.error('❌ Failed to regenerate RTRR:', error);
              this.handlePollingError('task', error as Error);
            }
            return;
          }
        }

        if (status === 'pending' || status === 'retry') {
          debugger;
          // Task still processing, schedule next poll
          const retryTime = (taskStatus.requestTime ? parseInt(taskStatus.requestTime.toString()) * 1000 : 5000);
          this.scheduleNextPoll('task', retryTime, () => this.pollTaskStatus(data), data);
        } else {
          // Task failed with unknown status
          NotificationService.showTaskError();
          this.clearPolling('task', data.taskId);
          // Trigger completion callback to re-enable Lightning Refresh
          data.onTaskComplete?.();
        }
      }
    } catch (error) {
      console.error('❌ Task polling error:', error);
      this.handlePollingError('task', error as Error);
    }
  }

  /**
   * Schedule next polling attempt
   */
  private scheduleNextPoll(
    type: PollingType,
    delay: number,
    callback: () => void,
    data: ReportPollingData | TaskPollingData
  ): void {
    const key = type === 'report'
      ? this.getReportKey((data as ReportPollingData).sid, (data as ReportPollingData).userEmail)
      : this.getTaskKey((data as TaskPollingData).sid, (data as TaskPollingData).userId);

    // Clear existing interval
    const existingInterval = this.pollingIntervals.get(key);
    if (existingInterval) {
      clearTimeout(existingInterval);
    }

    const poll = () => {
      callback();

      const nextInterval = setTimeout(poll, delay);
      this.pollingIntervals.set(key, nextInterval);
    };

    const interval = setTimeout(poll, delay);
    this.pollingIntervals.set(key, interval);
  }


  /**
   * Handle polling errors
   */
  private handlePollingError(type: PollingType, error: Error): void {
    // Find the key by searching through the polling states
    let key: string | null = null;
    for (const [stateKey, state] of this.pollingStates.entries()) {
      if (type === 'report' && stateKey.includes('active_report_id')) {
        key = stateKey;
        break;
      } else if (type === 'task' && stateKey.includes('active_task_id')) {
        key = stateKey;
        break;
      }
    }

    if (!key) return;

    const state = this.pollingStates.get(key);

    if (state) {
      state.retryCount++;
      state.error = error;
      this.pollingStates.set(key, state);
    }

    // Stop polling after too many errors
    if (state && state.retryCount >= 5) {
      console.error(`❌ Too many polling errors for ${type}, stopping`);
      this.clearPolling(type, undefined, undefined);

      // If this is a task polling error, trigger the completion callback to re-enable Lightning Refresh
      if (type === 'task' && state.onTaskComplete) {
        state.onTaskComplete();
      }
    }
  }

  /**
   * Clear polling for a specific type
   */
  clearPolling(type: PollingType, taskId?: number, reportId?: string, sid?: string | number, userId?: string): void {
    // We need to find the key by searching through the polling states
    let keyToRemove: string | null = null;

    for (const [key, state] of this.pollingStates.entries()) {
      if (type === 'report' && key.includes('active_report_id')) {
        keyToRemove = key;
        break;
      } else if (type === 'task' && key.includes('active_task_id')) {
        keyToRemove = key;
        break;
      }
    }

    if (keyToRemove) {
      // Clear interval
      const interval = this.pollingIntervals.get(keyToRemove);
      if (interval) {
        clearTimeout(interval);
        this.pollingIntervals.delete(keyToRemove);
      }

      // Clear state
      this.pollingStates.delete(keyToRemove);

      // Clear localStorage for the specific type
      if (typeof window !== 'undefined') {
        localStorage.removeItem(keyToRemove);

        if (type === 'task' && taskId) {
          localStorage.removeItem(`task_data_${taskId}`);
          localStorage.removeItem(this.getLightningKey(taskId));
        } else if (type === 'report' && reportId) {
          localStorage.removeItem(`report_data_${reportId}`);
        }
      }
    }
  }

  /**
   * Stop all polling operations
   */
  stopAllPolling(): void {
    // Clear all intervals
    this.pollingIntervals.forEach((interval) => {
      clearTimeout(interval);
    });
    this.pollingIntervals.clear();

    // Clear all states
    this.pollingStates.clear();

    // Clear all localStorage items related to polling
    if (typeof window !== 'undefined') {
      // Clear all task_data_, report_data_, and active polling keys
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('task_data_') ||
          key.startsWith('report_data_') ||
          key.startsWith('Lighting_Refresh_') ||
          key.startsWith('active_report_id_') ||
          key.startsWith('active_task_id_')
        )) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }

  /**
   * Get polling state for a specific type
   */
  getPollingState(type: PollingType): PollingState | null {
    for (const [key, state] of this.pollingStates.entries()) {
      if (type === 'report' && key.includes('active_report_id')) {
        return state;
      } else if (type === 'task' && key.includes('active_task_id')) {
        return state;
      }
    }
    return null;
  }

  /**
   * Check if polling is active for a specific type
   */
  isPolling(type: PollingType): boolean {
    const state = this.getPollingState(type);
    return state?.isActive || false;
  }

  /**
   * Manually trigger resume of polling operations
   * This can be called from components after they have loaded their data
   */
  resumePolling(): void {
    console.log('🔄 Manually resuming polling operations...');
    this.resumePollingOnStart();
  }

  /**
   * Get localStorage keys with user context
   */
  private getReportKey(sid: string, userEmail: string): string {
    if (typeof window === 'undefined') return this.localStorageKeys.report;
    return `${this.localStorageKeys.report}_${sid}_${userEmail}`;
  }

  private getTaskKey(sid: number, userId: string): string {
    if (typeof window === 'undefined') return this.localStorageKeys.task;
    return `${this.localStorageKeys.task}_${sid}_${userId}`;
  }

  private getLightningKey(taskId: number): string {
    return `Lighting_Refresh_${taskId}`;
  }

  /**
   * Store and retrieve polling data from localStorage
   */
  private storeReportData(data: ReportPollingData): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`report_data_${data.reportId}`, JSON.stringify(data));
  }

  private getStoredReportData(reportId: string): ReportPollingData | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(`report_data_${reportId}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private storeTaskData(data: TaskPollingData): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`task_data_${data.taskId}`, JSON.stringify(data));

    // Store lightning refresh data
    const lightningData = {
      Channel: data.channel,
      LOS: data.los,
      Guest: data.guest,
      SID: data.sid,
      UserId: data.userId,
      IsFired: true,
      ReportId: data.taskId,
      CheckInStartDate: data.checkInStartDate,
      CheckInEndDate: data.checkInEndDate,
      Month: data.month,
      Year: data.year,
      IsRunning: true,
      TimeStamp: Date.now()
    };

    localStorage.setItem(this.getLightningKey(data.taskId), JSON.stringify(lightningData));
  }

  private getStoredTaskData(taskId: number): TaskPollingData | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(`task_data_${taskId}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private getStoredLightningData(taskId: number): any {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(this.getLightningKey(taskId));
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}

// Create singleton instance
export const pollingService = new PollingService();
