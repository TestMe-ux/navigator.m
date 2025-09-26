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