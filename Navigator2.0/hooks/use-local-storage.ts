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
        if (item) {
          setStoredValue(JSON.parse(item))
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
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

// Define the property type
type SelectedProperty = {
  sid?: string | number
  hmid?: string | number
  name?: string
  city?: string
  country?: string
  currencySymbol?: string
  demandCity?: string
} | null

/**
 * Hook specifically for getting selected property safely
 */
export function useSelectedProperty(): [SelectedProperty, (value: SelectedProperty) => void] {
  return useLocalStorage<SelectedProperty>('SelectedProperty', null)
}

