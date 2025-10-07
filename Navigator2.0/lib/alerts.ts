import apiClient from "./client";
import { Constants } from "./constants";

export async function getAlerts(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_Alerts}`, { params: filtersValue });
    return data;
}

export async function getHistoryAlerts(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_HISTORY_Alerts}`, { params: filtersValue });
    return data;
}

export async function updateAlerts(filtersValue: any) {
    const { data } = await apiClient.put(`${Constants.API_UPDATE_Alerts}`, filtersValue);
    return data;
}

export async function saveAlerts(alertType: string, filtersValue: any) {
    const { data } = await apiClient.post(`${Constants.API_SAVE_Alerts}` + `/${alertType}`,  filtersValue);
    return data;
}