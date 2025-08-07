import apiClient from "./client";
import { Constants } from "./constants";

export async function GetTagProducts(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_GetTagProducts}`, { params: filtersValue });
    return data;
}
export async function GetTagInclusions(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_GetTagInclusions}`, { params: filtersValue });
    return data;
}
