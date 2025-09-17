import apiClient from "./client";
import { Constants } from "./constants";

export async function getAllReports(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GETALLREPORTS}`, { params: filtersValue });
    return data;
}

export async function getReportData(filtersValue:any) {
    const { data } = await apiClient.get(`${Constants.API_GETREPORTDATA}`, { params: filtersValue });
    return data;
}
export async function getScheduleReportData(filtersValue:any) {
    const { data } = await apiClient.get(`${Constants.API_GETSCHEDULEDATA}`, { params: filtersValue });
    return data;
}
export async function getRateShopsData(filtersValue:any) {
    const { data } = await apiClient.get(`${Constants.API_GetSummaryData}`, { params: filtersValue });
    return data;
}
export async function getUsageTrendChartData(filtersValue:any) {
    const { data } = await apiClient.get(`${Constants.API_GetChartData}`, { params: filtersValue });
    return data;
}