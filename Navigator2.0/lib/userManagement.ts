import apiClient from "./client";
import { Constants } from "./constants";

export async function getUsers(filtersValue: any) {
    try {
        const { data } = await apiClient.get(`${Constants.API_GetUsers}`, { params: filtersValue });
        console.log('✅ getUsers success:', data);
        return data;
    } catch (error: any) {
        console.error('❌ getUsers error details:', {
            message: error.message,
        });
        throw error;
    }
}

export async function getActivePageMaster() {
    try {
        const { data } = await apiClient.get(`${Constants.API_GetActivePageMaster}`);
        console.log('✅ getActivePageMaster success:', data);
        return data;
    } catch (error: any) {
        console.error('❌ getActivePageMaster error details:', {
            message: error.message,

        });
        throw error;
    }
}

export async function getUserHistory(filtersValue: any) {
    try {
        const { data } = await apiClient.get(`${Constants.API_GetUsersHistory}`, { params: filtersValue });
        console.log('✅ getUserHistory success:', data);
        return data;
    } catch (error: any) {
        console.error('❌ getUserHistory error details:', {
            message: error.message,
        });
        throw error;
    }
}

export async function addUpdateUser(filtersValue: any) {
    try {
        const { data } = await apiClient.post(`${Constants.API_AddUpdateUser}`, filtersValue);
        console.log('✅ addUpdateUser success:', data);
        return data;
    } catch (error: any) {
        console.error('❌ addUpdateUser error details:', {
            message: error.message,
        });
        throw error;
    }
}
export async function uploadImage(filtersValue: any) {
    try {
        const { data } = await apiClient.post(`${Constants.API_AddProfilePhoto}`, filtersValue, {
            headers: {
                'Content-Type': undefined,
            },
        });
        console.log('✅ uploadImage success:', data);
        return data;
    } catch (error: any) {
        console.error('❌ uploadImage error details:', {
            message: error.message,
        });
        throw error;
    }

}

export async function getAccessurl(filtersValue: any) {
    try {
        const { data } = await apiClient.get(`${Constants.API_GetAccessurlForSid}`, { params: filtersValue });
        console.log('✅ getAccessurl success:', data);
        return data;
    } catch (error: any) {
        console.error('❌ getUserHistory error details:', {
            message: error.message,
        });
        throw error;
    }
}

export async function saveSwitchAccessUrl(filtersValue: any) {
    try {
        const { data } = await apiClient.post(`${Constants.API_SET_AddUpdateUserSwitchAccessUrl}`, filtersValue);
        console.log('✅ saveSwitchAccessUrl success:', data);
        return data;
    } catch (error: any) {
        console.error('❌ saveSwitchAccessUrl error details:', {
            message: error.message,
        });
        throw error;
    }
}

