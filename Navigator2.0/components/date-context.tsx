"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { addDays } from 'date-fns'

interface DateContextType {
  startDate: Date | null
  endDate: Date | null
  setDateRange: (startDate: Date, endDate: Date) => void
  isLoading: boolean
}

const DateContext = createContext<DateContextType | undefined>(undefined)

export function DateProvider({ children }: { children: React.ReactNode }) {
  // Initialize with null to prevent hydration mismatch
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start with loading true
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize dates on client side only - Default to Next 7 Days
  useEffect(() => {
    console.log('🔄 Date context useEffect triggered:', {
      isClient: typeof window !== 'undefined',
      isInitialized,
      startDate: startDate?.toLocaleDateString(),
      endDate: endDate?.toLocaleDateString()
    })
    
    if (typeof window !== 'undefined' && !isInitialized) {
      console.log('🚀 Initializing date context with Next 7 Days...')
      
      try {
        const now = new Date()
        const end = addDays(now, 6) // Next 7 days including today
        
        console.log('📅 Setting dates:', {
          start: now.toLocaleDateString(),
          end: end.toLocaleDateString()
        })
        
        setStartDate(now)
        setEndDate(end)
        setIsInitialized(true)
        setIsLoading(false)
        
        console.log('✅ Date context initialized successfully')
      } catch (error) {
        console.error('❌ Error initializing date context:', error)
        // Fallback initialization
        setStartDate(new Date())
        setEndDate(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000))
        setIsInitialized(true)
        setIsLoading(false)
      }
    }
  }, [isInitialized, startDate, endDate])
  
  // Emergency fallback - if dates are still null after 2 seconds, force initialize
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!startDate || !endDate) {
        console.log('🚨 Emergency fallback: Forcing date initialization')
        const now = new Date()
        const end = addDays(now, 6)
        setStartDate(now)
        setEndDate(end)
        setIsInitialized(true)
        setIsLoading(false)
      }
    }, 2000)
    
    return () => clearTimeout(fallbackTimer)
  }, [startDate, endDate])

  const setDateRange = (newStartDate: Date, newEndDate: Date) => {
    console.log('🔄 Updating date range:', {
      startDate: newStartDate.toLocaleDateString(),
      endDate: newEndDate.toLocaleDateString()
    })
    
    setIsLoading(true)
    setStartDate(newStartDate)
    setEndDate(newEndDate)
    
    // Simulate data loading delay
    setTimeout(() => {
      setIsLoading(false)
      console.log('✅ Date range updated successfully')
    }, 500)
  }

  const value = {
    startDate,
    endDate,
    setDateRange,
    isLoading,
  }

  return (
    <DateContext.Provider value={value}>
      {children}
    </DateContext.Provider>
  )
}

export function useDateContext() {
  const context = useContext(DateContext)
  if (context === undefined) {
    throw new Error('useDateContext must be used within a DateProvider')
  }
  return context
} 