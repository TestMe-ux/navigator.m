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
import { useParityDateContext, useParityChannelContext } from "@/components/parity-filter-bar"

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
  const { startDate, endDate, setDateRange } = useParityDateContext()
  const { selectedChannels, setSelectedChannels, availableChannels, setAvailableChannels, fallbackChannels } = useParityChannelContext()
  
  // Keep track of channels fetch
  const didFetch = useRef(false)

  // Reset didFetch when property changes
  useEffect(() => {
    didFetch.current = false
  }, [selectedProperty?.sid])

  // Fetch channels for parity page and ensure we have at least 8
  useEffect(() => {
    if (!selectedProperty?.sid || didFetch.current) return

    didFetch.current = true
    getChannels({ SID: selectedProperty?.sid })
      .then((res) => {
        console.log("Parity Channels", res.body)
        
        if (res.body && res.body.length > 0) {
          res.body.sort((a: any, b: any) => a.name.localeCompare(b.name))
          
          const allChannel = {
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
          
          let channelList = [allChannel, ...res.body]
          
          // Ensure we have at least 8 channels (excluding "All Channels")
          if (res.body.length < 8) {
            // Add fallback channels that don't exist in API response
            fallbackChannels.forEach(fallbackChannel => {
              if (fallbackChannel.cid === -1) return // Skip "All Channels" from fallbacks
              
              const exists = res.body.some((apiChannel: any) => 
                apiChannel.cid === fallbackChannel.cid || 
                apiChannel.name?.toLowerCase() === fallbackChannel.name.toLowerCase()
              )
              
              if (!exists && channelList.length < 10) {
                channelList.push({
                  ...fallbackChannel,
                  channelMasterId: null,
                  url: null,
                  resultsPerPage: null,
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
                  isOta: true,
                  isMeta: false,
                  isBrand: false,
                  isGds: false,
                  isOthers: false,
                  displayName: fallbackChannel.name,
                })
              }
            })
          }
          
          // Set data for parity page
          setAvailableChannels(channelList)
          
          // Set selected channels as array of cids for parity page
          setSelectedChannels(channelList.map(c => c.cid))
          console.log(`📋 Parity channels initialized with ${channelList.length} channels (${channelList.length - 1} actual channels + All Channels)`)
        } else {
          // Use fallback channels if API returns empty
          setAvailableChannels(fallbackChannels)
          setSelectedChannels(fallbackChannels.map(c => c.cid))
          console.log('📋 Using fallback channels for parity monitoring - API returned empty')
        }
      })
      .catch((err) => {
        console.error("Parity channels fetch error:", err)
        // Use fallback channels if API fails
        setAvailableChannels(fallbackChannels)
        setSelectedChannels(fallbackChannels.map(c => c.cid))
        console.log('📋 Using fallback channels due to API error')
      })
  }, [selectedProperty?.sid, setAvailableChannels, setSelectedChannels, fallbackChannels])

  /**
   * Handle date range updates for parity page
   */
  const handleDateRangeChange = useCallback((newStartDate?: Date, newEndDate?: Date) => {
    if (newStartDate && newEndDate) {
      setDateRange(newStartDate, newEndDate)
      console.log(`📅 Parity date range changed: ${newStartDate.toLocaleDateString()} - ${newEndDate.toLocaleDateString()}`)
    }
  }, [setDateRange])

  /**
   * Get display text for channel button (parity page)
   */
  const getChannelDisplayText = useCallback(() => {
    if (selectedChannels.length === 0) {
      return "All Channels"
    } else if (selectedChannels.includes(-1)) {
      return "All Channels"
    } else if (selectedChannels.length === 1) {
      const channel = availableChannels.find((c: any) => c.cid === selectedChannels[0])
      if (channel) {
        return channel.name
      }
      return "Select Channels"
    } else {
      return `${selectedChannels.length} Channels`
    }
  }, [selectedChannels, availableChannels])

  /**
   * Handle channel selection with multi-select logic for parity page
   */
  const handleChannelSelect = useCallback((channel: any, channelData: any) => {
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
      } else {
        newSelection = newSelection.filter(c => c !== -1) // Ensure "All Channels" is not included
      }
      console.log(`📋 Parity channel selection changed: ${newSelection.join(", ")}`)
      return newSelection
    })
  }, [setSelectedChannels])

  const onOpenChangeSelect = (open: any) => {
    if (!open) {
      // Reset channel filter when dropdown closes for parity page
      console.log(`🔄 Parity channel filter reset to: ${selectedChannels.join(", ")}`)
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
                  startDate={startDate}
                  endDate={endDate}
                  onChange={handleDateRangeChange}
                />
              </div>

              {/* Channels Filter */}
              <div className="shrink-0">
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
                        <div className="space-y-1 max-h-80 overflow-y-auto">
                          {availableChannels?.map((option: any) => (
                            <label
                              key={option.cid}
                              className="py-2 px-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm flex items-center cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-0 focus:outline-none mr-3 cursor-pointer"
                                checked={selectedChannels.includes(option?.cid)}
                                onChange={() => handleChannelSelect(option?.cid, availableChannels)}
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