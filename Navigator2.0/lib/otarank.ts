import apiClient from "./client";
import { Constants } from "./constants";

export async function getOTARankOnAllChannel(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_OTARankOnAllChannel}`, { params: filtersValue });
    return data;
}
export async function getOTAChannels(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_OTAChannels}`, { params: filtersValue });
    return data;
}

export async function GetMasterActiveReviews() {
    const { data } = await apiClient.get(`${Constants.API_GetMasterActiveReviews}`);
    return data;
}