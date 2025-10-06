"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Globe } from "lucide-react"
import { EnhancedDatePicker } from "@/components/enhanced-date-picker"
import { useDateContext } from "@/components/date-context"
import { cn } from "@/lib/utils"
import { getChannels } from "@/lib/channels"
import { useState, useEffect } from "react"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FilterBarProps {
  onMoreFiltersClick?: () => void,
  setSelectedChannel?: any
}

/**
 * Simplified Filter Bar Component for Business Insights
 * 
 * Contains only:
 * - Date Range Picker
 * - Channel Filter
 * 
 * Removed:
 * - Compare with dropdown
 * - Compset dropdown  
 * - More filters button and functionality
 */
export function FilterBar({ onMoreFiltersClick, setSelectedChannel }: FilterBarProps) {
  const [selectedProperty] = useSelectedProperty()

  const didFetch = React.useRef(false);
  const { startDate, endDate, setDateRange } = useDateContext()
  const [channelData, setChannelData] = React.useState<any>([])
  const [selectedChannels, setSelectedChannels] = React.useState<number[]>([])

  // Reset didFetch when property changes
  React.useEffect(() => {
    didFetch.current = false;
  }, [selectedProperty?.sid]);

  React.useEffect(() => {
    // Use sample channel data for Business Insights
    const sampleChannels = [
      {
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
        createdBy: null,
        channelIcon: null
      },
      {
        cid: 1,
        channelMasterId: 1,
        name: "Booking.com",
        url: "booking.com",
        resultsPerPage: 25,
        isActive: true,
        isMetaSite: false,
        orderId: 1,
        isMobileChannel: false,
        isApproved: true,
        isNew: false,
        createdDate: "2023-01-01",
        createdBy: "admin",
        channelIcon: "booking"
      },
      {
        cid: 2,
        channelMasterId: 2,
        name: "Expedia",
        url: "expedia.com",
        resultsPerPage: 25,
        isActive: true,
        isMetaSite: false,
        orderId: 2,
        isMobileChannel: false,
        isApproved: true,
        isNew: false,
        createdDate: "2023-01-01",
        createdBy: "admin",
        channelIcon: "expedia"
      },
      {
        cid: 3,
        channelMasterId: 3,
        name: "Hotels.com",
        url: "hotels.com",
        resultsPerPage: 25,
        isActive: true,
        isMetaSite: false,
        orderId: 3,
        isMobileChannel: false,
        isApproved: true,
        isNew: false,
        createdDate: "2023-01-01",
        createdBy: "admin",
        channelIcon: "hotels"
      },
      {
        cid: 4,
        channelMasterId: 4,
        name: "Agoda",
        url: "agoda.com",
        resultsPerPage: 25,
        isActive: true,
        isMetaSite: false,
        orderId: 4,
        isMobileChannel: false,
        isApproved: true,
        isNew: false,
        createdDate: "2023-01-01",
        createdBy: "admin",
        channelIcon: "agoda"
      },
      {
        cid: 5,
        channelMasterId: 5,
        name: "TripAdvisor",
        url: "tripadvisor.com",
        resultsPerPage: 25,
        isActive: true,
        isMetaSite: false,
        orderId: 5,
        isMobileChannel: false,
        isApproved: true,
        isNew: false,
        createdDate: "2023-01-01",
        createdBy: "admin",
        channelIcon: "tripadvisor"
      },
      {
        cid: 6,
        channelMasterId: 6,
        name: "Airbnb",
        url: "airbnb.com",
        resultsPerPage: 25,
        isActive: true,
        isMetaSite: false,
        orderId: 6,
        isMobileChannel: false,
        isApproved: true,
        isNew: false,
        createdDate: "2023-01-01",
        createdBy: "admin",
        channelIcon: "airbnb"
      }
    ];

    // Set sample data
    setChannelData(sampleChannels);
    if (!!setSelectedChannel)
      setSelectedChannel(sampleChannels);
    // Set selected channels as array of cids
    setSelectedChannels(sampleChannels.map(c => c.cid));
    
    console.log("Sample channels loaded for Business Insights");
  }, [selectedProperty]);

  /**
   * Handle date range updates
   */
  const handleDateRangeChange = React.useCallback((newStartDate?: Date, newEndDate?: Date) => {
    if (newStartDate && newEndDate) {
      setDateRange(newStartDate, newEndDate)
      console.log(`📅 Date range changed: ${newStartDate.toLocaleDateString()} - ${newEndDate.toLocaleDateString()}`)
    }
  }, [setDateRange])

  /**
   * Get display text for channel button
   */
  const getChannelDisplayText = React.useCallback(() => {
    if (selectedChannels.length === 0) {
      return "All Channels"
    } else if (selectedChannels.includes(-1)) {
      return "All Channels"
    } else if (selectedChannels.length === 1) {
      const channel = channelData.find((c: any) => c.cid === selectedChannels[0]);
      if (channel) {
        return channel.name
      }
      // Fallback if channel not found
      return "Select Channels"
    } else {
      return `${selectedChannels.length} Channels`
    }
  }, [selectedChannels])

  /**
   * Handle channel selection with multi-select logic
   */
  const handleChannelSelect = React.useCallback((channel: any, channelData: any) => {
    setSelectedChannels(prev => {
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
      }
      else {
        newSelection = newSelection.filter(c => c !== -1) // Ensure "All Channels" is not included
      }
      console.log(`📋 Channel selection changed: ${newSelection.join(", ")}`)
      return newSelection
    })
  }, [])

  const onOpenChangeSelect = (open: any) => {
    if (!open) {
      // Channel selection logic when dropdown closes
      console.log("Channel dropdown closed")
    }
  }

  return (
    <div
      className=""
      data-component-name="FilterBar"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-7xl xl:max-w-none mx-auto">
          <div className="flex items-center justify-between py-4 gap-4">

            {/* Left Section - Primary Filters */}
            <div className="flex items-center gap-4 flex-1 min-w-0">

              {/* Date Range Picker */}
              <div className="shrink-0">
                <EnhancedDatePicker
                  startDate={startDate || undefined}
                  endDate={endDate || undefined}
                  onChange={handleDateRangeChange}
                />
              </div>

              {/* Channel Filter */}
              <div className="flex items-center gap-3 flex-wrap min-w-0">
                <DropdownMenu key="channel" onOpenChange={(event) => onOpenChangeSelect(event)}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md min-w-0 max-w-[160px] hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                    >
                      <Globe className="w-4 h-4 shrink-0" />
                      <span className="truncate max-w-[80px] font-semibold">
                        {getChannelDisplayText()}
                      </span>
                      <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-auto p-0 shadow-xl border-slate-200 dark:border-slate-700 z-[60]">

                    <div className="flex">
                      <div className="w-56 p-4">
                        <h4 className="font-semibold text-sm text-gray-700 mb-3">Channels</h4>
                        <ScrollArea className={cn(
                          "max-h-68 overflow-hidden ",
                          channelData.length > 8 ? "h-64" : "h-auto"
                        )}>
                          <div className="space-y-1 pr-4">
                            {channelData?.map((option: any) => (
                              <label
                                key={option.cid}
                                className="py-2 px-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm flex items-center cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-0 focus:outline-none mr-3 cursor-pointer"
                                  checked={selectedChannels.includes(option?.cid)}
                                  onChange={() => handleChannelSelect(option?.cid, channelData)}
                                />
                                <span className="font-medium text-sm flex-1">
                                  {option?.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Right Section - Empty for now */}
              <div className="flex items-center gap-3 shrink-0">
                {/* No additional buttons needed */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
