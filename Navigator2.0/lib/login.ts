import apiClient from "./client";
import { Constants } from "./constants";
import { CryptoUtils } from "./crypto";
import { LocalStorageService, LoginResponse, UserDetails } from "./localstorage";

export interface LoginRequest {
    UserName: string;
    Password: string;
}

export interface LoginFormData {
    username: string;
    password: string;
    checkedStayLoggedIn: boolean;
}

export async function GetSIDListforUser(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_Mapping_GetSIDListforUser}`, { params: filtersValue });
    return data;
}

export async function Login(loginData: LoginFormData): Promise<LoginResponse> {
    try {
        // Encrypt password using AES encryption (matching previous implementation)
        const passwordEncrypted = CryptoUtils.encryptString(loginData.password);

        // Prepare login request payload
        const loginRequest: LoginRequest = {
            UserName: loginData.username,
            Password: passwordEncrypted
        };


        // Make API call with params
        const { data } = await apiClient.post(`${Constants.API_SET_Login}`, null, { params: loginRequest });
        return data;
    } catch (error) {
        console.error('Login API error:', error);
        throw error;
    }
}
export async function ResetPassword(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_SET_ResetPassword}`, { params: filtersValue });
    return data;
}
export async function PasswordRecovery(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_SET_PasswordRecovery}`, { params: filtersValue });
    return data;
}
export async function GetPackageDetails(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GetPackageDetails}`, { params: filtersValue });
    return data;
}