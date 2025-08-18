"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { addDays } from 'date-fns'

interface DemandDateContextType {
  startDate: Date | null
  endDate: Date | null
  setDateRange: (startDate: Date, endDate: Date) => void
  isLoading: boolean
}

const DemandDateContext = createContext<DemandDateContextType | undefined>(undefined)

export function DemandDateProvider({ children }: { children: React.ReactNode }) {
  // Initialize with null to prevent hydration mismatch
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start with loading true
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize dates on client side only - Default to Next 15 Days for Demand Page
  useEffect(() => {
    console.log('🔄 Demand date context useEffect triggered:', {
      isClient: typeof window !== 'undefined',
      isInitialized,
      startDate: startDate?.toLocaleDateString(),
      endDate: endDate?.toLocaleDateString()
    })
    
    if (typeof window !== 'undefined' && !isInitialized) {
      console.log('🚀 Initializing demand date context with Next 15 Days...')
      
      try {
        const now = new Date()
        const end = addDays(now, 14) // Next 15 days (today + 14 days)
        
        console.log('📅 Setting demand dates:', {
          start: now.toLocaleDateString(),
          end: end.toLocaleDateString()
        })
        
        setStartDate(now)
        setEndDate(end)
        setIsInitialized(true)
        setIsLoading(false)
        
        console.log('✅ Demand date context initialized successfully')
      } catch (error) {
        console.error('❌ Error initializing demand date context:', error)
        // Fallback initialization
        setStartDate(new Date())
        setEndDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))
        setIsInitialized(true)
        setIsLoading(false)
      }
    }
  }, [isInitialized, startDate, endDate])
  
  // Emergency fallback - if dates are still null after 2 seconds, force initialize
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!startDate || !endDate) {
        console.log('🚨 Emergency fallback: Forcing demand date initialization')
        const now = new Date()
        const end = addDays(now, 14)
        setStartDate(now)
        setEndDate(end)
        setIsInitialized(true)
        setIsLoading(false)
      }
    }, 2000)
    
    return () => clearTimeout(fallbackTimer)
  }, [startDate, endDate])

  const setDateRange = (newStartDate: Date, newEndDate: Date) => {
    console.log('🔄 Updating demand date range:', {
      startDate: newStartDate.toLocaleDateString(),
      endDate: newEndDate.toLocaleDateString()
    })
    
    setIsLoading(true)
    setStartDate(newStartDate)
    setEndDate(newEndDate)
    
    // Simulate data loading delay
    setTimeout(() => {
      setIsLoading(false)
      console.log('✅ Demand date range updated successfully')
    }, 500)
  }

  const value = {
    startDate,
    endDate,
    setDateRange,
    isLoading,
  }

  return (
    <DemandDateContext.Provider value={value}>
      {children}
    </DemandDateContext.Provider>
  )
}

export function useDemandDateContext() {
  const context = useContext(DemandDateContext)
  if (context === undefined) {
    throw new Error('useDemandDateContext must be used within a DemandDateProvider')
  }
  return context
}
