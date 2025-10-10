import { useState, useEffect } from 'react'

/**
 * Custom hook for safe localStorage access that works with SSR
 * @param key - localStorage key
 * @param initialValue - fallback value when localStorage is not available or key doesn't exist
 * @returns [value, setValue] - state value and setter function
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isInitialized, setIsInitialized] = useState(false)

  // Effect to initialize value from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      try {
        const item = window.localStorage.getItem(key)
        if (item && item !== 'undefined' && item !== 'null') {
          try {
            setStoredValue(JSON.parse(item))
          } catch (parseError) {
            console.warn(`Invalid JSON in localStorage key "${key}", clearing it:`, parseError)
            // Clear corrupted data
            window.localStorage.removeItem(key)
            setStoredValue(initialValue)
          }
        }
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error)
      } finally {
        setIsInitialized(true)
      }
    }
  }, [key, isInitialized])

  // Function to set value
  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)

      // Save to localStorage on client side
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        } catch (serializeError) {
          console.warn(`Error serializing localStorage key "${key}":`, serializeError)
          // If we can't serialize the value, clear it
          window.localStorage.removeItem(key)
        }
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

// Define the property type
type SelectedProperty = {
  activeMenus?: string;
  address1?: string;
  address2?: string | null;
  brandID?: number;
  brandName?: string;
  city?: string;
  cityCode?: string | null;
  country?: string;
  countryCode?: string;
  currencyCode?: string;
  currencySymbol?: string;
  defaultLandingPage?: string;
  demandCity?: string;
  enableLightingRefreshPrimium?: boolean;
  enableOTARank?: boolean;
  enablePropertyWiseReport?: boolean;
  hmid?: number;
  imagePath?: string;
  isAutoMapping?: boolean;
  isOptimaUpgraded?: boolean;
  isRTL?: boolean;
  isUnreadAlert?: boolean;
  lat?: number | null;
  long?: number | null;
  name?: string;
  odRestrictionDays?: number;
  optimaTrialStatus?: number;
  pghEndDate?: string | Date; // ISO date string
  pghStartDate?: string; // ISO date string
  roleID?: number;
  sid?: number;
  state?: string | null;
  stateCode?: string | null;
  userID?: number;
  zipCode?: string | null;
} | null

type UserDetails = {
  accessToken: string
  email: string
  firstName: string
  imagePath: string
  isFirtTimeUser: boolean
  isNewOptimaDelete: boolean
  lastName: string
  loginName: string
  userId: number
  userRoletext: string
} | null

/**
 * Hook specifically for getting selected property safely
 */
export function useSelectedProperty(): [SelectedProperty, (value: SelectedProperty) => void] {
  return useLocalStorage<SelectedProperty>('SelectedProperty', null)
}

export function useUserDetail(): [UserDetails, (value: UserDetails) => void] {
  return useLocalStorage<UserDetails>('UserDetails', null)
}

export function useAllProperty(): [SelectedProperty[], (value: SelectedProperty[]) => void] {
  return useLocalStorage<SelectedProperty[]>('Properties', [])
}