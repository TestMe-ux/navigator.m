"use client"

import React, { createContext, useContext, useState, ReactNode, useMemo } from "react"

export type ComparisonOption = "Last 7 Days" | "Last 30 Days" | "Last Quarter"
export type ChannelSelection = { channelId?: number[] | []; channelName?: any[] | [] };
export type CompsetSelection = true | false;
interface ComparisonContextType {
  selectedComparison: ComparisonOption
  setSelectedComparison: (option: ComparisonOption) => void
  channelFilter: ChannelSelection;
  setChannelFilter: (c: ChannelSelection) => void;
  compsetFilter: CompsetSelection;
  setCompsetFilter: (c: CompsetSelection) => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined)

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [selectedComparison, setSelectedComparison] = useState<ComparisonOption>("Last 7 Days")
  const [channelFilter, setChannelFilter] = useState<ChannelSelection>({ channelId: [], channelName: [] });
  const [compsetFilter, setCompsetFilter] = useState<CompsetSelection>(false);

  const value = useMemo(
    () => ({ channelFilter, setChannelFilter, selectedComparison, setSelectedComparison,compsetFilter, setCompsetFilter }),
    [channelFilter, selectedComparison,compsetFilter]
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