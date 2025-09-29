/**
 * Polling Status Indicator Component
 * Shows the current status of polling operations
 */

"use client";

import React from 'react';
import { usePollingContext } from './polling-context';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface PollingStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export function PollingStatusIndicator({ 
  className, 
  showDetails = false, 
  compact = false 
}: PollingStatusIndicatorProps) {
  const { 
    isReportPolling, 
    isTaskPolling, 
    isAnyPolling,
    reportPollingState,
    taskPollingState 
  } = usePollingContext();

  if (!isAnyPolling && !showDetails) {
    return null;
  }

  const getStatusIcon = (isActive: boolean, hasError?: boolean) => {
    if (hasError) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (isActive) {
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = (type: 'report' | 'task', isActive: boolean, hasError?: boolean) => {
    if (hasError) {
      return `${type === 'report' ? 'Report' : 'Task'} polling failed`;
    }
    if (isActive) {
      return `${type === 'report' ? 'Report' : 'Task'} polling active`;
    }
    return `${type === 'report' ? 'Report' : 'Task'} polling stopped`;
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {isAnyPolling && (
          <div className="flex items-center gap-1 text-sm text-blue-600">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Processing...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Report Polling Status */}
      {showDetails && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          {getStatusIcon(isReportPolling, reportPollingState?.error)}
          <div className="flex-1">
            <div className="text-sm font-medium">
              {getStatusText('report', isReportPolling, !!reportPollingState?.error)}
            </div>
            {reportPollingState && (
              <div className="text-xs text-gray-500">
                Retry count: {reportPollingState.retryCount}
                {reportPollingState.lastPollTime && (
                  <span className="ml-2">
                    Last poll: {new Date(reportPollingState.lastPollTime).toLocaleTimeString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task Polling Status */}
      {showDetails && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          {getStatusIcon(isTaskPolling, taskPollingState?.error)}
          <div className="flex-1">
            <div className="text-sm font-medium">
              {getStatusText('task', isTaskPolling, !!taskPollingState?.error)}
            </div>
            {taskPollingState && (
              <div className="text-xs text-gray-500">
                Retry count: {taskPollingState.retryCount}
                {taskPollingState.lastPollTime && (
                  <span className="ml-2">
                    Last poll: {new Date(taskPollingState.lastPollTime).toLocaleTimeString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Simple Status */}
      {!showDetails && isAnyPolling && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            {isReportPolling && isTaskPolling 
              ? 'Processing reports and tasks...' 
              : isReportPolling 
                ? 'Processing report...' 
                : 'Processing task...'
            }
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact polling indicator for headers or toolbars
 */
export function PollingIndicator({ className }: { className?: string }) {
  return (
    <PollingStatusIndicator 
      className={className} 
      compact={true} 
    />
  );
}

/**
 * Detailed polling status for settings or debug pages
 */
export function PollingStatusDetails({ className }: { className?: string }) {
  return (
    <PollingStatusIndicator 
      className={className} 
      showDetails={true} 
    />
  );
}

