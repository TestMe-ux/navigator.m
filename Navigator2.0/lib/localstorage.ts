/**
 * LocalStorage utilities for managing user authentication and tokens
 * Based on the previous implementation logic
 */

export interface UserDetails {
  // Add your user details interface based on your API response
  id?: string;
  username?: string;
  email?: string;
  role?: string;
  // Add other user properties as needed
  [key: string]: any;
}

export interface LoginResponse {
  status: boolean;
  body: {
    userDetails: UserDetails;
    token: string;
    expiration: string;
    // Add other response properties as needed
  };
  message?: string;
}

export class LocalStorageService {
  /**
   * Set an item in localStorage
   * @param key - The key to store
   * @param value - The value to store
   */
  static setItem(key: string, value: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  /**
   * Get an item from localStorage
   * @param key - The key to retrieve
   * @returns The stored value or null
   */
  static getItem(key: string): string | any {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : "";
    }
    return null;
  }

  /**
   * Remove an item from localStorage
   * @param key - The key to remove
   */
  static removeItem(key: string): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }

  /**
   * Clear all localStorage
   */
  static clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  }

  /**
   * Set user details in localStorage
   * @param userDetails - User details object
   */
  static setUserDetails(userDetails: UserDetails): void {
    this.setItem('UserDetails', userDetails);
  }

  /**
   * Get user details from localStorage
   * @returns User details object or null
   */
  static getUserDetails(): UserDetails | null {
    const userDetails = this.getItem('UserDetails');
    if (userDetails) {
      return userDetails
    }
    return null;
  }

  /**
   * Set user token in localStorage
   * @param token - The authentication token
   */
  static setUserToken(token: string): void {
    this.setItem('userToken', token);
  }

  /**
   * Get user token from localStorage
   * @returns The authentication token or null
   */
  static getUserToken(): string | null {
    return this.getItem('userToken');
  }

  /**
   * Set access token in localStorage
   * @param token - The access token
   */
  static setAccessToken(token: string): void {
    this.setItem('token', token);
  }

  /**
   * Get access token from localStorage
   * @returns The access token or null
   */
  static getAccessToken(): string | null {
    return this.getItem('token');
  }

  /**
   * Set refresh time in localStorage
   * @param refreshTime - The refresh time timestamp
   */
  static setRefreshTime(refreshTime: number): void {
    this.setItem('refreshTime', refreshTime);
  }

  /**
   * Get refresh time from localStorage
   * @returns The refresh time timestamp or null
   */
  static getRefreshTime(): number | null {
    const refreshTime = this.getItem('refreshTime');
    if (refreshTime) {
      return refreshTime

    }
    return null;
  }

  /**
   * Set login status in localStorage
   * @param isLoggedIn - Whether the user is logged in
   */
  static setLoginStatus(isLoggedIn: boolean): void {
    this.setItem('isLoggedIn', isLoggedIn.toString());
  }

  /**
   * Get login status from localStorage
   * @returns Whether the user is logged in
   */
  static getLoginStatus(): boolean {
    const isLoggedIn = this.getItem('isLoggedIn');
    return isLoggedIn === 'true';
  }

  /**
   * Check if user is authenticated
   * @returns Whether the user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const userDetails = this.getUserDetails();
    const isLoggedIn = this.getLoginStatus();

    return !!(token && userDetails && isLoggedIn);
  }

  /**
   * Logout user by clearing all authentication data
   */
  static logout(): void {
    this.clear();
    this.setLoginStatus(false);
  }

  /**
   * Check if token is expired
   * @returns Whether the token is expired
   */
  static isTokenExpired(): boolean {
    const refreshTime = this.getRefreshTime();
    if (!refreshTime) {
      return true;
    }

    const currentTime = new Date().getTime();
    return currentTime >= refreshTime;
  }
}