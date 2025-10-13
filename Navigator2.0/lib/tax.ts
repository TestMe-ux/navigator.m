import apiClient from "./client";
import { Constants } from "./constants";

// Tax data interfaces
export interface TaxData {
  id: number
  tax: string
  subscriberCompetitor: string
  channels: string
  lastActivity: string
  lastModifiedBy: string
  createdOn: string
  status: boolean
}

export interface HotelData {
  id: number
  name: string
}

export interface ChannelData {
  cid: number
  name: string
  channelMasterId?: number
  url?: string
  resultsPerPage?: number
  isActive?: boolean
  isMetaSite?: boolean
  orderId?: number
  isMobileChannel?: boolean
  isApproved?: boolean
  isNew?: boolean
  createdDate?: string
  createdBy?: string
  channelIcon?: string
}

export interface PropertyData {
  propertyID: number
  name: string
  isActive?: boolean
}

export interface SelectedProperty {
  PropertyId: number
  PropertyName: string
}

export interface TaxSetting {
  taxValue: string
  taxName: string
  propertiesText: string
  channelsText: string
  activity: string
  updatedByName: string
  action: string
  taxSettingId: number
}

// PreferenceValue enum matching Angular implementation
export enum PreferenceValue {
  NotSet = 0,
  Inclusive = 1,
  Exclusive = 2
}

// API call to get tax preference
export async function getTaxPreference(params: any) {
  const { data } = await apiClient.get(`${Constants.API_GET_TaxPreference}`, { params });
  return data;
}

// API call to set tax preference
export async function setTaxPreference(preferenceData: any) {
  const { data } = await apiClient.post(`${Constants.API_SET_TaxPreference}`, preferenceData);
  return data;
}

// API call to get tax data
export async function getTaxData(params: any) {
  const { data } = await apiClient.get(`Tax/GetTaxData`, { params });
  return data;
}

// API call to get hotels data
export async function getHotelsData(params: any) {
  const { data } = await apiClient.get(`${Constants.API_GET_AllSubscriberCompSet}`, { params });
  return data;
}

// API call to get channels data
export async function getChannelsData(params: any) {
  const { data } = await apiClient.get(`${Constants.API_GET_ChannelList}`, { params });
  return data;
}

// API call to get tax setting history
export async function getTaxSettingHistory(params: any) {
  const { data } = await apiClient.get(`Tax/GetTaxSettingHistory`, { params });
  return data;
}

// API call to get complete compset (properties)
export async function getCompleteCompSet(params: any) {
  const { data } = await apiClient.get(`${Constants.API_GET_GetCompletecCompset}`, { params });
  return data;
}

// API call to get tax settings
export async function getTaxSetting(params: any) {
  const { data } = await apiClient.get(`${Constants.API_GET_TaxSetting}`, { params });
  return data;
}

// API call to get currency code
export async function getCurrencyCode(params: any) {
  const { data } = await apiClient.get(`${Constants.API_GET_CurrencyCode}`, { params });
  return data;
}

// API call to save tax settings
export async function saveTaxSettings(taxModel: any) {
  const { data } = await apiClient.post(`${Constants.API_SET_TaxSetting}`, taxModel);
  return data;
}

// API call to delete tax setting
export async function deleteTaxSetting(params: any) {
  const { data } = await apiClient.post(`${Constants.API_DELETE_TaxSetting}`, null, { params });
  return data;
}
