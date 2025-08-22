"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Calendar, Globe } from "lucide-react"
import { EnhancedDatePicker } from "@/components/enhanced-date-picker"
import { cn } from "@/lib/utils"
import { getChannels } from "@/lib/channels"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { useState, useEffect, useCallback, useRef } from "react"

interface ParityOverviewFilterBarProps {
  className?: string
}

/**
 * Parity Filter Bar Component with Check-in Date and Channels
 * 
 * Independent filter bar for parity page with:
 * - Check-in date range picker (independent state with _2 suffix)
 * - Channels multi-select dropdown (independent state with _2 suffix)
 * - Same styling and functionality as Overview page
 * - Completely separate state management
 * 
 * @component
 * @version 5.0.0 - Independent Filter Components
 */
export function ParityOverviewFilterBar({ className }: ParityOverviewFilterBarProps) {
  const [selectedProperty] = useSelectedProperty()
  
  // Independent state with _2 suffix for parity page
  const didFetch_2 = useRef(false)
  const [startDate_2, setStartDate_2] = useState<Date | undefined>(undefined)
  const [endDate_2, setEndDate_2] = useState<Date | undefined>(undefined)
  const [channelData_2, setChannelData_2] = useState<any>([])
  const [selectedChannels_2, setSelectedChannels_2] = useState<number[]>([])

  // Reset didFetch when property changes
  useEffect(() => {
    didFetch_2.current = false
  }, [selectedProperty?.sid])

  // Fetch channels for parity page (independent from Overview)
  useEffect(() => {
    if (!selectedProperty?.sid || didFetch_2.current) return

    didFetch_2.current = true
    getChannels({ SID: selectedProperty?.sid })
      .then((res) => {
        console.log("Parity Channels_2", res.body)
        res.body.sort((a: any, b: any) => a.name.localeCompare(b.name))
        const allChannel_2 = {
          cid: -1,
          channelMasterId: null,
          name: "All Channels",
          url: null,
          resultsPerPage: null,
          isActive: true,
          isMetaSite: false,
          orderId: null,
          isMobileChannel: false,
          isApproved: true,
          isNew: false,
          createdDate: null,
          lastUpdateDate: null,
          subscriberChannelMappingId: null,
          channelGroupName: "",
          channelIcon: "",
          isOta: false,
          isMeta: false,
          isBrand: false,
          isGds: false,
          isOthers: false,
          displayName: "All Channels",
        }
        const channelList_2 = [allChannel_2, ...res.body]
        
        // Set data for parity page
        setChannelData_2(channelList_2)
        
        // Set selected channels as array of cids for parity page
        setSelectedChannels_2(channelList_2.map(c => c.cid))
        console.log(`📋 Parity channels_2 initialized with ${channelList_2.length} channels`)
      })
      .catch((err) => console.error("Parity channels_2 fetch error:", err))
  }, [selectedProperty?.sid])

  /**
   * Handle date range updates for parity page
   */
  const handleDateRangeChange_2 = useCallback((newStartDate?: Date, newEndDate?: Date) => {
    if (newStartDate && newEndDate) {
      setStartDate_2(newStartDate)
      setEndDate_2(newEndDate)
      console.log(`📅 Parity date range_2 changed: ${newStartDate.toLocaleDateString()} - ${newEndDate.toLocaleDateString()}`)
    }
  }, [])

  /**
   * Get display text for channel button (parity page)
   */
  const getChannelDisplayText_2 = useCallback(() => {
    if (selectedChannels_2.length === 0) {
      return "All Channels"
    } else if (selectedChannels_2.includes(-1)) {
      return "All Channels"
    } else if (selectedChannels_2.length === 1) {
      const channel = channelData_2.find((c: any) => c.cid === selectedChannels_2[0])
      if (channel) {
        return channel.name
      }
      return "Select Channels"
    } else {
      return `${selectedChannels_2.length} Channels`
    }
  }, [selectedChannels_2, channelData_2])

  /**
   * Handle channel selection with multi-select logic for parity page
   */
  const handleChannelSelect_2 = useCallback((channel: any, channelData: any) => {
    setSelectedChannels_2(prev => {
      const isSelected = prev.includes(channel)
      let newSelection: number[]

      if (channel === -1) {
        // If selecting "All Channels", clear all others
        newSelection = isSelected ? [] : channelData.map((c: any) => c.cid)
      } else {
        // If selecting a specific channel
        if (isSelected) {
          // Remove the channel
          newSelection = prev.filter(c => c !== channel)
        } else {
          // Add the channel and remove "All Channels" if present
          const filteredSelection = prev.filter(c => c !== 0)
          newSelection = [...filteredSelection, channel]
        }
      }
      if (newSelection.length === channelData.length - 2 || newSelection.length === channelData.length) {
        newSelection = channelData.map((c: any) => c.cid) // Reset to "All Channels" if all are selected
      } else {
        newSelection = newSelection.filter(c => c !== -1) // Ensure "All Channels" is not included
      }
      console.log(`📋 Parity channel_2 selection changed: ${newSelection.join(", ")}`)
      return newSelection
    })
  }, [])

  const onOpenChangeSelect_2 = (open: any) => {
    if (!open) {
      // Reset channel filter when dropdown closes for parity page
      console.log(`🔄 Parity channel filter_2 reset to: ${selectedChannels_2.join(", ")}`)
    }
  }

  return (
    <div className={cn("bg-background border-b border-border shadow-sm", className)}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-7xl xl:max-w-none mx-auto">
          <div className="flex items-center justify-between py-4 gap-4">
            
            {/* Left Side - Check-in Date and Channels */}
            <div className="flex items-center gap-4 flex-1">
              
              {/* Check-in Date Range Picker */}
              <div className="shrink-0">
                <EnhancedDatePicker
                  startDate={startDate_2}
                  endDate={endDate_2}
                  onChange={handleDateRangeChange_2}
                />
              </div>

              {/* Channels Filter */}
              <div className="shrink-0">
                <DropdownMenu key="channel_2" onOpenChange={(event) => onOpenChangeSelect_2(event)}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md min-w-0 max-w-[160px] hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                    >
                      <Globe className="w-4 h-4 shrink-0" />
                      <span className="truncate max-w-[80px] font-semibold">
                        {getChannelDisplayText_2()}
                      </span>
                      <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-auto p-0 shadow-xl border-slate-200 dark:border-slate-700 z-[60]">
                    <div className="flex">
                      <div className="w-56 p-4">
                        <h4 className="font-semibold text-sm text-gray-700 mb-3">Channels</h4>
                        <div className="space-y-1 max-h-80 overflow-y-auto">
                          {channelData_2?.map((option: any) => (
                            <label
                              key={option.cid}
                              className="py-2 px-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm flex items-center cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-0 focus:outline-none mr-3 cursor-pointer"
                                checked={selectedChannels_2.includes(option?.cid)}
                                onChange={() => handleChannelSelect_2(option?.cid, channelData_2)}
                              />
                              <span className="font-medium text-sm flex-1">
                                {option?.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

            </div>

            {/* Right Side - Empty for now */}
            <div className="flex items-center gap-3">
              {/* Reserved for future controls */}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}