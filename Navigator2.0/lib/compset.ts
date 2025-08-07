import apiClient from "./client";
import { Constants } from "./constants";

export async function getActiveCompset(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_GetCompletecCompset}`, { params: filtersValue });
    return data;
}