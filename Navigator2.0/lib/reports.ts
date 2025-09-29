import apiClient from "./client";
import { Constants } from "./constants";

export async function getAllReports(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GETALLREPORTS}`, { params: filtersValue });
    return data;
}

export async function getReportData(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GETREPORTDATA}`, { params: filtersValue });
    return data;
}
export async function getScheduleReportData(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GETSCHEDULEDATA}`, { params: filtersValue });
    return data;
}
export async function getRateShopsData(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GetSummaryData}`, { params: filtersValue });
    return data;
}
export async function getUsageTrendChartData(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GetChartData}`, { params: filtersValue });
    return data;
}
export async function getRTRRChannel(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_RTRRCHANNEL}`, { params: filtersValue });
    return data;
}
export async function getRTRRValidation(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_RRTRVALIDATION}`, { params: filtersValue });
    return data;
}

export async function getRTRRReportStatusBySID(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_RRTRSTATUS}`, { params: filtersValue });
    return data;
}
export async function getRTRRReportStatus(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_RTRRReportSTATUS}`, { params: filtersValue });
    return data;
}
export async function regenerateRTRR(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_REGENERATERTRR}`, { params: filtersValue });
    return data;
}
export async function generateRTRRReport(filtersValue: any) {
    const { data } = await apiClient.post(`${Constants.API_RRTRREPORT}`, filtersValue);
    return data;
}

