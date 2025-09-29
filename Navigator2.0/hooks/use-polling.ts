/**
 * Custom React hook for polling operations
 * Provides easy integration with the polling service
 */

import { useEffect, useCallback, useRef } from 'react';
import { pollingService } from '@/lib/polling/polling-service';
import { ReportPollingData, TaskPollingData, PollingState, PollingType } from '@/lib/polling/types';
import { useSelectedProperty, useUserDetail } from '@/hooks/use-local-storage';

export interface UsePollingOptions {
  /** Whether to start polling automatically when data is provided */
  autoStart?: boolean;
  /** Callback when polling state changes */
  onStateChange?: (state: PollingState | null) => void;
  /** Callback when polling succeeds */
  onSuccess?: (data: any) => void;
  /** Callback when polling fails */
  onError?: (error: Error) => void;
}

export interface UsePollingReturn {
  /** Start report polling */
  startReportPolling: (data: ReportPollingData) => void;
  /** Start task polling */
  startTaskPolling: (data: TaskPollingData) => void;
  /** Stop polling for a specific type */
  stopPolling: (type: PollingType) => void;
  /** Stop all polling operations */
  stopAllPolling: () => void;
  /** Get current polling state */
  getPollingState: (type: PollingType) => PollingState | null;
  /** Check if polling is active */
  isPolling: (type: PollingType) => boolean;
  /** Check if on-demand reports are disabled */
  isOnDemandDisabled: boolean;
  /** Check all reports status */
  checkAllReports: () => Promise<void>;
}

/**
 * Hook for managing polling operations
 */
export function usePolling(options: UsePollingOptions = {}): UsePollingReturn {
  const { autoStart = true, onStateChange, onSuccess, onError } = options;
  const isOnDemandDisabledRef = useRef(false);
  
  // Get selected property and user details
  const [selectedProperty] = useSelectedProperty();
  const [userDetails] = useUserDetail();

  // Start report polling
  const startReportPolling = useCallback((data: ReportPollingData) => {
    try {
      pollingService.startReportPolling(data);
      console.log('🔄 Started report polling for:', data.reportId);
    } catch (error) {
      console.error('❌ Failed to start report polling:', error);
      onError?.(error as Error);
    }
  }, [onError]);

  // Start task polling
  const startTaskPolling = useCallback((data: TaskPollingData) => {
    try {
      pollingService.startTaskPolling(data);
      console.log('🔄 Started task polling for:', data.taskId);
    } catch (error) {
      console.error('❌ Failed to start task polling:', error);
      onError?.(error as Error);
    }
  }, [onError]);

  // Stop polling for a specific type
  const stopPolling = useCallback((type: PollingType) => {
    pollingService.clearPolling(type);
    console.log(`⏹️ Stopped ${type} polling`);
  }, []);

  // Stop all polling operations
  const stopAllPolling = useCallback(() => {
    pollingService.stopAllPolling();
    console.log('⏹️ Stopped all polling operations');
  }, []);

  // Get current polling state
  const getPollingState = useCallback((type: PollingType): PollingState | null => {
    return pollingService.getPollingState(type);
  }, []);

  // Check if polling is active
  const isPolling = useCallback((type: PollingType): boolean => {
    return pollingService.isPolling(type);
  }, []);

  // Check all reports status (equivalent to getAllReports from original service)
  const checkAllReports = useCallback(async () => {
    try {
      console.log('🔍 Checking all reports status...');
      
      // Import the existing getAllReports function
      const { getAllReports } = await import('@/lib/reports');
      
      // Get current date range (yesterday to today)
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      // Get SID and user email from hooks
      const sid = selectedProperty?.sid || '';
      const userEmail = userDetails?.email || '';
      
      if (!sid || !userEmail) {
        console.warn('⚠️ Missing SID or user email for report checking');
        return;
      }
      
      const response = await getAllReports({
        sid,
        startdate: startDate,
        enddate: endDate
      });
      
      if (response.status && response.body) {
        // Check if there are pending reports for the current user
        const userReports = response.body.filter((report: any) => 
          report.recipientEmail?.toLowerCase()
            .split(',')
            .map((email: string) => email.trim())
            .includes(userEmail.toLowerCase())
        );
        
        const pendingReports = userReports.filter((report: any) => 
          report.reportStatus?.toLowerCase() === 'pending' || 
          report.reportFilePath === 'NONE' || 
          report.reportFilePath === 'PENDING'
        );
        
        if (pendingReports.length > 0) {
          console.log('📋 Found pending reports, starting polling...');
          // Start polling for the first pending report
          const reportId = pendingReports[0].reportID || sid.toString();
          startReportPolling({
            reportId: reportId,
            startDate,
            endDate,
            sid: sid.toString(),
            userEmail
          });
        } else {
          console.log('✅ No pending reports found');
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to check all reports:', error);
      onError?.(error as Error);
    }
  }, [onError, startReportPolling, selectedProperty?.sid, userDetails?.email]);

  // Resume polling on component mount if we have the necessary data
  useEffect(() => {
    if (selectedProperty?.sid && userDetails?.userId) {
      // Small delay to ensure localStorage is available
      const timer = setTimeout(() => {
        pollingService.resumePolling();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [selectedProperty?.sid, userDetails?.userId]);

  // Monitor polling state changes
  useEffect(() => {
    const interval = setInterval(() => {
      const reportState = getPollingState('report');
      const taskState = getPollingState('task');
      
      if (reportState) {
        onStateChange?.(reportState);
      }
      
      if (taskState) {
        onStateChange?.(taskState);
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [getPollingState, onStateChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Optionally stop all polling when component unmounts
      // Uncomment the next line if you want this behavior
      // stopAllPolling();
    };
  }, [stopAllPolling]);

  return {
    startReportPolling,
    startTaskPolling,
    stopPolling,
    stopAllPolling,
    getPollingState,
    isPolling,
    isOnDemandDisabled: isOnDemandDisabledRef.current,
    checkAllReports
  };
}

/**
 * Hook specifically for report polling
 */
export function useReportPolling(options: UsePollingOptions = {}) {
  const polling = usePolling(options);
  
  return {
    startReportPolling: polling.startReportPolling,
    stopReportPolling: () => polling.stopPolling('report'),
    isReportPolling: () => polling.isPolling('report'),
    getReportPollingState: () => polling.getPollingState('report'),
    checkAllReports: polling.checkAllReports,
    isOnDemandDisabled: polling.isOnDemandDisabled
  };
}

/**
 * Hook specifically for task polling
 */
export function useTaskPolling(options: UsePollingOptions = {}) {
  const polling = usePolling(options);
  
  return {
    startTaskPolling: polling.startTaskPolling,
    stopTaskPolling: () => polling.stopPolling('task'),
    isTaskPolling: () => polling.isPolling('task'),
    getTaskPollingState: () => polling.getPollingState('task')
  };
}
