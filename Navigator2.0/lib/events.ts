import apiClient from "./client";
import { Constants } from "./constants";

export async function getAllEvents(filtersValue: any) {
    const { data } = await apiClient.post(`${Constants.API_GET_GetAllEvents}`, filtersValue);
    return data;
}
export async function getAllHoliday(filtersValue: any) {
    const { data } = await apiClient.post(`${Constants.API_GET_GetAllHoliday}`, filtersValue);
    return data;
}

export async function getEventCitiesCountryList(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_GetEventCitiesCountryList}`, { params: filtersValue });
    return data;
}

export async function saveEvents(paramsValues:any) {
     const { data } = await apiClient.post(`${Constants.API_AddEvents}`, paramsValues);
    return data;    
}

export async function updateEvents(paramsValues:any) {
     const { data } = await apiClient.post(`${Constants.API_UpdateEvents}`, paramsValues);
    return data;    
}

export async function deleteEvents(paramsValues:any) {
     const { data } = await apiClient.post(`${Constants.API_DeleteEvents}`, paramsValues);
    return data;    
}

export async function getAllSubscribeEvents(filtersValue: any) {
    const { data } = await apiClient.post(`${Constants.API_GET_GetAllSubscribeEvent}`, filtersValue);
    return data;
}

export async function getSubscribeUnsubscribeEvent(filtersValue: any) {
    const { data } = await apiClient.post(`${Constants.API_SubscribeUnsubscribeEvent}`, filtersValue);
    return data;
}