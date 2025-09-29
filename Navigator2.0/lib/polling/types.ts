/**
 * Type definitions for the polling service
 */

export interface PollingConfig {
  /** Unique identifier for the polling operation */
  id: string;
  /** Polling interval in milliseconds */
  interval: number;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Whether to start polling immediately */
  autoStart?: boolean;
  /** Callback when polling succeeds */
  onSuccess?: (data: any) => void;
  /** Callback when polling fails */
  onError?: (error: Error) => void;
  /** Callback when polling times out */
  onTimeout?: () => void;
  /** Timeout duration in milliseconds */
  timeout?: number;
}

export interface ReportStatus {
  reportID: string;
  reportStatus: 'pending' | 'generated' | 'error' | 'retry';
  reportFilePath: string;
  recipientEmail?: string;
  retryTime?: number;
  requestTime?: number;
}

export interface TaskStatus {
  rtrrReportId: number;
  reportStatus: 'pending' | 'generated' | 'error' | 'retry';
  requestTime?: number;
  status: boolean;
}

export interface ReportPollingData {
  reportId: string;
  startDate: string;
  endDate: string;
  sid: string;
  userEmail: string;
}

export interface TaskPollingData {
  taskId: number;
  channel: string;
  los: string;
  guest: string;
  sid: number;
  userId: string;
  checkInStartDate: string;
  checkInEndDate: string;
  month: number;
  year: number;
  /** Callback to trigger when task completes (success or failure, but not retry) */
  onTaskComplete?: () => void;
}

export interface PollingState {
  isActive: boolean;
  isPaused: boolean;
  retryCount: number;
  lastPollTime: number;
  error?: Error;
  /** Callback for task completion (only for task polling) */
  onTaskComplete?: () => void;
}

export interface NotificationMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

export type PollingType = 'report' | 'task';

export interface PollingManager {
  startPolling: (type: PollingType, data: ReportPollingData | TaskPollingData) => void;
  stopPolling: (type: PollingType) => void;
  stopAllPolling: () => void;
  getPollingState: (type: PollingType) => PollingState | null;
  isPolling: (type: PollingType) => boolean;
}
