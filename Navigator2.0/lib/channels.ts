import apiClient from "./client";
import { Constants } from "./constants";

export async function getChannels(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_ChannelList}`, { params: filtersValue });
    return data;
}
export async function getAllChannelList(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_AllChannelList}`, { params: filtersValue });
    return data;
}
export async function getChannelHistory(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_ChannelHistory}`, { params: filtersValue });
    return data;
}
export async function deleteChannel(filtersValue: any) {
    const { data } = await apiClient.post(`${Constants.API_DeleteChannel}`, null, { params: filtersValue });
    return data;
}

