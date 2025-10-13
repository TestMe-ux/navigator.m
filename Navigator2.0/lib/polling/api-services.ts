/**
 * API services for polling operations
 * Uses existing API methods from reports.ts
 */

import { getAllReports, getRTRRReportStatus, regenerateRTRR } from '@/lib/reports';
import { ReportStatus, TaskStatus } from './types';

export interface GetAllReportsParams {
  sid: string;
  startdate: string;
  enddate: string;
}

export interface GetRTRRReportStatusParams {
  ReportId: number;
}

export interface RegenerateRTRRParams {
  ReportId: number;
}

/**
 * Get all reports for a given date range
 * Uses existing getAllReports from reports.ts
 */
export async function getAllReportsForPolling(params: GetAllReportsParams): Promise<{
  status: boolean;
  body: ReportStatus[];
}> {
  try {
    const response = await getAllReports(params);
    return {
      status: response.status || true,
      body: response.body || []
    };
  } catch (error) {
    console.error('❌ Failed to get all reports:', error);
    throw new Error('Failed to fetch reports');
  }
}

/**
 * Get RTRR report status
 * Uses existing getRTRRReportStatus from reports.ts
 */
export async function getRTRRReportStatusForPolling(params: GetRTRRReportStatusParams): Promise<{
  status: boolean;
  body: TaskStatus | TaskStatus[];
}> {
  try {
    debugger;
    const response = await getRTRRReportStatus(params);
    return {
      status: response.status || true,
      body: response.body || null
    };
  } catch (error) {
    console.error('❌ Failed to get RTRR report status:', error);
    throw new Error('Failed to fetch task status');
  }
}

/**
 * Regenerate RTRR report
 * Uses existing regenerateRTRR from reports.ts
 */
export async function regenerateRTRRForPolling(params: RegenerateRTRRParams): Promise<{
  status: boolean;
  body?: any;
}> {
  try {
    const response = await regenerateRTRR(params);
    return {
      status: response.status || true,
      body: response.body
    };
  } catch (error) {
    console.error('❌ Failed to regenerate RTRR:', error);
    throw new Error('Failed to regenerate report');
  }
}

// Re-export the original functions for backward compatibility
export { getAllReports, getRTRRReportStatus, regenerateRTRR };
