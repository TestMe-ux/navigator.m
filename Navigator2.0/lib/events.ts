import apiClient from "./client";
import { Constants } from "./constants";

export async function getAllEvents(filtersValue: any) {
    const { data } = await apiClient.post(`${Constants.API_GET_GetAllEvents}`, filtersValue);
    return data;
}
