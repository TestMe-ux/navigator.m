import apiClient from "./client";
import { Constants } from "./constants";

export async function getChannels(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_ChannelList}`, { params: filtersValue });
    return data;
}
