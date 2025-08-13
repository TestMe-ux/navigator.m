"use client"

import React, { createContext, useContext, useState, ReactNode, useMemo } from "react"

export type ComparisonOption = 7 | 30 | 90
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
  const [selectedComparison, setSelectedComparison] = useState<ComparisonOption>(7)
  const [channelFilter, setChannelFilter] = useState<ChannelSelection>({ channelId: [-1], channelName: ["All Channel"] });
  const [compsetFilter, setCompsetFilter] = useState<CompsetSelection>(false);
  const [sideFilter, setSideFilter] = useState<CompsetSelection>(Object);

  const value = useMemo(
    () => ({ channelFilter, setChannelFilter, selectedComparison, setSelectedComparison,compsetFilter, setCompsetFilter,sideFilter, setSideFilter }),
    [channelFilter, selectedComparison,compsetFilter,sideFilter]
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