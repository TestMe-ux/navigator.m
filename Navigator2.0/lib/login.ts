import apiClient from "./client";
import { Constants } from "./constants";

export async function GetSIDListforUser(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_Mapping_GetSIDListforUser}`, { params: filtersValue });
    return data;
}