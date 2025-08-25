import apiClient from "./client";
import { Constants } from "./constants";

export async function getChannels(filtersValue: any) {
    try {
        console.log('🔍 getChannels called with params:', filtersValue);
        console.log('🌐 API URL:', `${Constants.API_GET_ChannelList}`);
        console.log('🔗 Full API call URL:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/${Constants.API_GET_ChannelList}`);
        
        const { data } = await apiClient.get(`${Constants.API_GET_ChannelList}`, { params: filtersValue });
        console.log('✅ getChannels success:', data);
        return data;
    } catch (error: any) {
        console.error('❌ getChannels error details:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            config: {
                url: error.config?.url,
                params: error.config?.params,
                baseURL: error.config?.baseURL
            }
        });
        throw error;
    }
}
