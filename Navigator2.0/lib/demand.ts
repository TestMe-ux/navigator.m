import apiClient from "./client";
import { Constants } from "./constants";

export async function GetDemandAIPerCountryAverageData(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.DemandAPI_GET_DemandAICountryAverage}`, { params: filtersValue });
    return data;
}

export async function GetDemandAIData(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.DemandAPI_GET_DemandAI}`, { params: filtersValue });
    return data;
}
