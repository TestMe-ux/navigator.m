import apiClient from "./client";
import { Constants } from "./constants";

export async function getRateTrends(filtersValue: any) {
    const { data } = await apiClient.post(`${Constants.API_GetRateTrend}`, filtersValue);
    return data;
}