import apiClient from "./client";
import { Constants } from "./constants";

export async function GetParityData(filtersValue: any) {
    const { data } = await apiClient.post(`${Constants.ParityAPI_GET_Parity}`, filtersValue);
    return data;
}