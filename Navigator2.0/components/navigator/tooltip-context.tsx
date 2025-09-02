"use client"

import React, { createContext, useContext, useState } from "react"

interface TooltipContextType {
  calendarTooltipsEnabled: boolean
  tableTooltipsEnabled: boolean
  toggleCalendarTooltips: () => void
  toggleTableTooltips: () => void
  setCalendarTooltips: (enabled: boolean) => void
  setTableTooltips: (enabled: boolean) => void
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined)

export const CustomTooltipProvider = ({ children }: { children: React.ReactNode }) => {
  const [calendarTooltipsEnabled, setCalendarTooltipsEnabled] = useState(true) // Enabled for calendar view
  const [tableTooltipsEnabled, setTableTooltipsEnabled] = useState(true) // Enabled for table tooltips

  const toggleCalendarTooltips = () => {
    setCalendarTooltipsEnabled(!calendarTooltipsEnabled)
  }

  const toggleTableTooltips = () => {
    setTableTooltipsEnabled(!tableTooltipsEnabled)
  }

  const setCalendarTooltips = (enabled: boolean) => {
    setCalendarTooltipsEnabled(enabled)
  }

  const setTableTooltips = (enabled: boolean) => {
    setTableTooltipsEnabled(enabled)
  }

  return (
    <TooltipContext.Provider value={{
      calendarTooltipsEnabled,
      tableTooltipsEnabled,
      toggleCalendarTooltips,
      toggleTableTooltips,
      setCalendarTooltips,
      setTableTooltips
    }}>
      {children}
    </TooltipContext.Provider>
  )
}

export const useTooltips = () => {
  const context = useContext(TooltipContext)
  if (context === undefined) {
    throw new Error('useTooltips must be used within a TooltipProvider')
  }
  return context
}
