"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from "react"

interface NavigationState {
  isCollapsed: boolean
  toggleCollapse: () => void
}

const NavigationContext = createContext<NavigationState | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('navCollapsed')
      return saved === 'true'
    }
    return false
  })

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    if (typeof window !== 'undefined') {
      localStorage.setItem('navCollapsed', newState.toString())
    }
    console.log(`🔄 Navigation drawer ${newState ? 'collapsed' : 'expanded'}`)
  }

  return (
    <NavigationContext.Provider value={{ isCollapsed, toggleCollapse }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigationState() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigationState must be used within a NavigationProvider')
  }
  return context
}

// Hook to get responsive width based on navigation state
export function useResponsiveWidth() {
  const { isCollapsed } = useNavigationState()
  
  // Calculate responsive widths based on navigation state
  const getHotelColumnWidth = () => {
    if (isCollapsed) {
      // When navigation is collapsed, use a narrower width for better space utilization
      return 'min-w-[120px] max-w-[130px] w-[125px]'
    } else {
      // When navigation is expanded, use fixed width for consistency
      return 'w-[120px] min-w-[120px]'
    }
  }

  const getGridTemplateColumns = () => {
    if (isCollapsed) {
      // When collapsed, use narrower fixed width for first column
      return '125px repeat(7, 1fr)'
    } else {
      // When expanded, use fixed width for first column
      return '120px repeat(7, 1fr)'
    }
  }

  return {
    isCollapsed,
    hotelColumnWidth: getHotelColumnWidth(),
    gridTemplateColumns: getGridTemplateColumns(),
    // Additional responsive utilities
    containerPadding: isCollapsed ? 'pl-4 pr-6' : 'pl-6 pr-6',
    calendarMargin: isCollapsed ? 'ml-2' : 'ml-0'
  }
}
