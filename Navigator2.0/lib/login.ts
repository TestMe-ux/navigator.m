import apiClient from "./client";
import { Constants } from "./constants";

export async function GetSIDListforUser(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_Mapping_GetSIDListforUser}`, { params: filtersValue });
    return data;
}
export async function Login(filtersValue: any) {
    const { data } = await apiClient.post(`${Constants.API_SET_Login}`, { params: filtersValue });
    return data;;
}