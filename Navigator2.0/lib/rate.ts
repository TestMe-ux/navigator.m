import apiClient from "./client";
import { Constants } from "./constants";

export async function getRateTrends(filtersValue: any) {
    const { data } = await apiClient.post(`${Constants.API_GetRateTrend}`, filtersValue);
    return data;
}
export async function CachePage(filtersValue: any, postData: any) {
    const { data } = await apiClient.post(`${Constants.API_POST_CachePage}`, postData, { params: filtersValue });
    return data;
}

export async function PPExcelDownload(filterData: any, objForExcel: any) {
    const { data } = await apiClient.post(`${Constants.API_POST_PPExcelDownload}`, objForExcel, { params: filterData });
    return data;
}
export async function getPricePositioningCluster(filtersValue: any, userID: any) {
    const { data } = await apiClient.post(`${Constants.API_GetPricePositioningCluster}`, filtersValue, { params: { "UserID": userID } });
    return data;
}
