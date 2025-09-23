import apiClient from "./client";
import { Constants } from "./constants";

export async function GetParityData(filtersValue: any) {
    const { data } = await apiClient.post(`${Constants.ParityAPI_GET_Parity}`, filtersValue);
    return data;
}
export async function getBRGCalculationSetting(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_BRGCalculationSetting}`, { params: filtersValue });
    return data;
}