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

/**
 * Get SID list for user
 * @param filtersValue - Filter parameters
 * @returns SID list data
 */
export async function GetSIDListforUser(filtersValue: any) {
    const { data } = await apiClient.get(`${Constants.API_GET_Mapping_GetSIDListforUser}`, { params: filtersValue });
    return data;
}

/**
 * Login user with encrypted password
 * @param loginData - Login form data
 * @returns Promise<LoginResponse>
 */
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

/**
 * Handle successful login response
 * @param response - Login API response
 * @param stayLoggedIn - Whether to stay logged in
 */
export function handleSuccessfulLogin(response: LoginResponse, stayLoggedIn: boolean = false) {
    if (response.status) {
        // Clear existing localStorage
        LocalStorageService.clear();

        // Store user details
        LocalStorageService.setUserDetails(response.body.userDetails);

        // Store user token
        LocalStorageService.setUserToken(LocalStorageService.getAccessToken() || '');

        // Calculate and store refresh time
        const refreshTime = new Date(response.body.expiration);
        LocalStorageService.setRefreshTime(refreshTime.getTime());

        // Store access token
        LocalStorageService.setAccessToken(response.body.token);

        // Set login status
        LocalStorageService.setLoginStatus(true);

        // Get SID list for user
        // GetSIDListforUser(response.body).catch(error => {
        //     console.error('Error getting SID list:', error);
        // });

        return true;
    } else {
        // Set login status to false on failure
        LocalStorageService.setLoginStatus(false);
        return false;
    }
}

/**
 * Handle login error
 * @param error - Error object
 */
export function handleLoginError(error: any) {
    console.error('Login error:', error);
    LocalStorageService.setLoginStatus(false);

    // Return user-friendly error message
    if (error.response?.status === 401) {
        return "Invalid username or password. Please try again.";
    } else if (error.response?.status === 400) {
        return "Invalid request. Please check your input.";
    } else if (error.response?.status >= 500) {
        return "Server error. Please try again later.";
    } else {
        return "Login failed. Please try again.";
    }
}