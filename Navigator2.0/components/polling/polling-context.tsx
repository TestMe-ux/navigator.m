/**
 * React Context for global polling state management
 * Provides centralized polling state across the application
 */

"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { pollingService } from '@/lib/polling/polling-service';
import { PollingState, PollingType, ReportPollingData, TaskPollingData } from '@/lib/polling/types';

interface PollingContextType {
  // Polling states
  reportPollingState: PollingState | null;
  taskPollingState: PollingState | null;
  
  // Polling controls
  startReportPolling: (data: ReportPollingData) => void;
  startTaskPolling: (data: TaskPollingData) => void;
  stopPolling: (type: PollingType) => void;
  stopAllPolling: () => void;
  resumePolling: () => void;
  
  // Polling status
  isReportPolling: boolean;
  isTaskPolling: boolean;
  isAnyPolling: boolean;
  
  // Utility functions
  getPollingState: (type: PollingType) => PollingState | null;
  isPolling: (type: PollingType) => boolean;
}

const PollingContext = createContext<PollingContextType | undefined>(undefined);

interface PollingProviderProps {
  children: ReactNode;
}

export function PollingProvider({ children }: PollingProviderProps) {
  const [reportPollingState, setReportPollingState] = useState<PollingState | null>(null);
  const [taskPollingState, setTaskPollingState] = useState<PollingState | null>(null);

  // Update polling states
  const updatePollingStates = () => {
    const reportState = pollingService.getPollingState('report');
    const taskState = pollingService.getPollingState('task');
    
    setReportPollingState(reportState);
    setTaskPollingState(taskState);
  };

  // Start report polling
  const startReportPolling = (data: ReportPollingData) => {
    pollingService.startReportPolling(data);
    updatePollingStates();
  };

  // Start task polling
  const startTaskPolling = (data: TaskPollingData) => {
    pollingService.startTaskPolling(data);
    updatePollingStates();
  };

  // Stop polling for a specific type
  const stopPolling = (type: PollingType) => {
    pollingService.clearPolling(type);
    updatePollingStates();
  };

  // Stop all polling operations
  const stopAllPolling = () => {
    pollingService.stopAllPolling();
    updatePollingStates();
  };

  // Resume polling operations
  const resumePolling = () => {
    pollingService.resumePolling();
    updatePollingStates();
  };

  // Get polling state for a specific type
  const getPollingState = (type: PollingType): PollingState | null => {
    return pollingService.getPollingState(type);
  };

  // Check if polling is active for a specific type
  const isPolling = (type: PollingType): boolean => {
    return pollingService.isPolling(type);
  };

  // Computed values
  const isReportPolling = reportPollingState?.isActive || false;
  const isTaskPolling = taskPollingState?.isActive || false;
  const isAnyPolling = isReportPolling || isTaskPolling;

  // Monitor polling state changes
  useEffect(() => {
    // Initial state update
    updatePollingStates();

    // Set up interval to monitor state changes
    const interval = setInterval(updatePollingStates, 1000);

    return () => clearInterval(interval);
  }, []);

  const contextValue: PollingContextType = {
    reportPollingState,
    taskPollingState,
    startReportPolling,
    startTaskPolling,
    stopPolling,
    stopAllPolling,
    resumePolling,
    isReportPolling,
    isTaskPolling,
    isAnyPolling,
    getPollingState,
    isPolling
  };

  return (
    <PollingContext.Provider value={contextValue}>
      {children}
    </PollingContext.Provider>
  );
}

/**
 * Hook to use the polling context
 */
export function usePollingContext(): PollingContextType {
  const context = useContext(PollingContext);
  
  if (context === undefined) {
    throw new Error('usePollingContext must be used within a PollingProvider');
  }
  
  return context;
}

/**
 * Higher-order component to provide polling context
 */
export function withPollingProvider<P extends object>(Component: React.ComponentType<P>) {
  return function WrappedComponent(props: P) {
    return (
      <PollingProvider>
        <Component {...props} />
      </PollingProvider>
    );
  };
}
