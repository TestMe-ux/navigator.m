"use client"

import React, { createContext, useContext, useState, ReactNode, useMemo } from "react"

export type ComparisonOption = 7 | 30 | 91
export type ChannelSelection = { channelId?: number[] | []; channelName?: any[] | [] };
export type CompsetSelection = true | false;
export type SideFilterSelection = any;
interface ComparisonContextType {
  selectedComparison: ComparisonOption
  setSelectedComparison: (option: ComparisonOption) => void
  channelFilter: ChannelSelection;
  setChannelFilter: (c: ChannelSelection) => void;
  compsetFilter: CompsetSelection;
  setCompsetFilter: (c: CompsetSelection) => void;
  sideFilter: SideFilterSelection;
  setSideFilter: (c: SideFilterSelection) => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined)

export function ComparisonProvider({ children }: { children: ReactNode }) {
  // Ensure the default value is always valid
  const [selectedComparison, setSelectedComparison] = useState<ComparisonOption>(() => {
    // Clear any invalid localStorage values that might exist from old versions
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selectedComparison')
      if (stored) {
        const parsed = parseInt(stored)
        // Only use stored value if it's one of our new valid options
        if ([7, 30, 91].includes(parsed)) {
          return parsed as ComparisonOption
        }
        // Clear invalid value from localStorage
        localStorage.removeItem('selectedComparison')
      }
    }
    return 7 // Default to Last Week
  })
  const [channelFilter, setChannelFilter] = useState<ChannelSelection>({ channelId: [], channelName: [] });
  const [compsetFilter, setCompsetFilter] = useState<CompsetSelection>(false);
  const [sideFilter, setSideFilter] = useState<CompsetSelection>(Object);

  const value = useMemo(
    () => ({ channelFilter, setChannelFilter, selectedComparison, setSelectedComparison, compsetFilter, setCompsetFilter, sideFilter, setSideFilter }),
    [channelFilter, selectedComparison, compsetFilter, sideFilter]
  );

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  )
}

export function useComparison() {
  const context = useContext(ComparisonContext)
  if (context === undefined) {
    throw new Error("useComparison must be used within a ComparisonProvider")
  }
  return context
}