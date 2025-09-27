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
export async function getBRGHistory(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_BRGCalculationHistory}`, { params: filtersValue });
    return data;
}
export async function AddBRGSettings(filtersValue: any) {
    const { data } = await apiClient.post(`${Constants.API_SET_UpdateBRGCalculation}`, filtersValue);
    return data;
}
export async function getRateEvalutionData(filtersValue: any) {
    const { data } = await apiClient.post(`${Constants.API_GetRateEvalution}`, filtersValue);
    return data;
}