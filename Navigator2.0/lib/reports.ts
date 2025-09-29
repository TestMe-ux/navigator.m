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



export async function generateAndMailReportCSV(detailData: any) {
    const { data } = await apiClient.post(`${Constants.API_GenerateAndMailReportCSV}`, detailData);
    return data;
}

export async function getChannelList(params: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_ChannelList}`, { params });
    return data;
}

export async function getCompleteCompSet(params: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_GetCompletecCompset}`, { params });
    return data;
}

export async function checkMappingValidation(propertyValidation: any) {
    const { data } = await apiClient.post(`${Constants.API_CheckMappingValidation}`, propertyValidation);
    return data;
}

export async function checkMapping(mappingData: any) {
    const { data } = await apiClient.post(`${Constants.API_CheckMapping}`, mappingData);
    return data;
}

export async function generateOndemandReport(requestModel: any) {
    const { data } = await apiClient.post(`${Constants.API_GenerateOndemandReport}`, requestModel);
    return data;
}

export async function getCurrencyList() {
    const { data } = await apiClient.get(`${Constants.API_GET_CurrencyList}`);
    return data;
}

export async function getTimeZoneList() {
    const { data } = await apiClient.get(`${Constants.API_GET_TimeZoneList}`);
    return data;
}

export async function getScheduleReportDataBySid(sid: string) {
    const { data } = await apiClient.get(`${Constants.API_GetScheduleReportData}?SID=${sid}`);
    return data;
}

export async function saveReportData(scheduleReportData: any) {
    const { data } = await apiClient.post(`${Constants.API_SaveReportData}`, scheduleReportData);
    return data;
}

export async function getEditScheduleData(reportId: string) {
    const { data } = await apiClient.get(`${Constants.API_GetEditScheduleData}?PGHReportScheduleId=${reportId}`);
    return data;
}

export async function deleteScheduleReport(universalId: number, reportId: number) {
    const { data } = await apiClient.post(`${Constants.API_DeleteReport}?UniversalId=${universalId}&ReportId=${reportId}`);
    return data;
}

export async function getSummaryData(sid: string) {
    const { data } = await apiClient.get(`${Constants.API_GetSummaryData}?Sid=${sid}`);
    return data;
}
