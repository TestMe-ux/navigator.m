import apiClient from "./client";
import { Constants } from "./constants";

export async function getActiveCompset(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_GetCompletecCompset}`, { params: filtersValue });
    return data;
}
export async function getAllCompSet(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_AllSubscriberCompSet}`, { params: filtersValue });
    return data;
}
export async function getAllHistoryCompSet(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_AllSubscriberHistoryCompSet}`, { params: filtersValue });
    return data;
}
export async function updateCompSet(filtersValue: any) {
    const { data } = await apiClient.post(`${Constants.API_GET_UpdateSubscriberCompSet}`, null, { params: filtersValue });
    return data;
}
export async function getSearchHotelList(filtersValue: any, sid: number, hotelMasterId: number) {
    let url = process.env.NEXT_PUBLIC_API_OPTIMA_URL + 'OptimaAPI/SearchCMDHotels?SID=' + sid + '&hotelMasterId=' + hotelMasterId;
    const { data } = await apiClient.post(url, filtersValue);
    return data;
}
export async function AddCompSet(filtersValue: any) {
    const { data } = await apiClient.post(`${Constants.API_GET_AddSubscriberCompSet}`, filtersValue);
    return data;
}
 