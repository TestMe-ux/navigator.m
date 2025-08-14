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
