"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Calendar, Globe, X } from "lucide-react"
import { EnhancedDatePicker } from "@/components/enhanced-date-picker"
import { cn } from "@/lib/utils"
import { getChannels } from "@/lib/channels"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { addDays, format } from "date-fns"

// Parity-specific date context
interface ParityDateContextType {
  startDate: Date | null
  endDate: Date | null
  setDateRange: (start: Date | null, end: Date | null) => void
}

const ParityDateContext = React.createContext<ParityDateContextType | undefined>(undefined)

export function useParityDateContext() {
  const context = React.useContext(ParityDateContext)
  if (!context) {
    throw new Error("useParityDateContext must be used within a ParityDateProvider")
  }
  return context
}

export function ParityDateProvider({ children }: { children: React.ReactNode }) {
  // Default to next 7 days
  const today = new Date()
  const [startDate, setStartDate] = useState<Date | null>(today)
  const [endDate, setEndDate] = useState<Date | null>(addDays(today, 6))

  const setDateRange = (start: Date | null, end: Date | null) => {
    setStartDate(start)
    setEndDate(end)
  }

  return (
    <ParityDateContext.Provider value={{ startDate, endDate, setDateRange }}>
      {children}
    </ParityDateContext.Provider>
  )
}

// Parity-specific channel context
interface ParityChannelContextType {
  selectedChannels: any[]
  setSelectedChannels: (channels: any[]) => void
  channelFilter: {
    channelId: number[]
    channelName: string[]
  }
  availableChannels: any[]
  setAvailableChannels: (channels: any[]) => void
  fallbackChannels: any[]
}

const ParityChannelContext = React.createContext<ParityChannelContextType | undefined>(undefined)

export function useParityChannelContext() {
  const context = React.useContext(ParityChannelContext)
  if (!context) {
    throw new Error("useParityChannelContext must be used within a ParityChannelProvider")
  }
  return context
}

export function ParityChannelProvider({ children }: { children: React.ReactNode }) {
  const [selectedChannels, setSelectedChannels] = useState<any[]>([])
  const [availableChannels, setAvailableChannels] = useState<any[]>([])
  const [selectedProperty] = useSelectedProperty()

  // Fallback channels to ensure we always have at least 8 channels
  const fallbackChannels = [
    { cid: -1, name: "All Channels", channelId: -1, channelName: "All Channels", isActive: true },
    { cid: 1, name: "Booking.com", channelId: 1, channelName: "Booking.com", isActive: true },
    { cid: 2, name: "Expedia", channelId: 2, channelName: "Expedia", isActive: true },
    { cid: 3, name: "Agoda", channelId: 3, channelName: "Agoda", isActive: true },
    { cid: 4, name: "Hotels.com", channelId: 4, channelName: "Hotels.com", isActive: true },
    { cid: 5, name: "Priceline", channelId: 5, channelName: "Priceline", isActive: true },
    { cid: 6, name: "Kayak", channelId: 6, channelName: "Kayak", isActive: true },
    { cid: 7, name: "TripAdvisor", channelId: 7, channelName: "TripAdvisor", isActive: true },
    { cid: 8, name: "Trivago", channelId: 8, channelName: "Trivago", isActive: true },
    { cid: 9, name: "MakeMyTrip", channelId: 9, channelName: "MakeMyTrip", isActive: true }
  ]

  const channelFilter = {
    channelId: selectedChannels.map(ch => ch.channelId || ch.cid),
    channelName: selectedChannels.map(ch => ch.channelName || ch.name)
  }

  return (
    <ParityChannelContext.Provider value={{ 
      selectedChannels, 
      setSelectedChannels, 
      channelFilter,
      availableChannels,
      setAvailableChannels,
      fallbackChannels
    }}>
      {children}
    </ParityChannelContext.Provider>
  )
}

interface ParityFilterBarProps {
  className?: string
}

export function ParityFilterBar({ className }: ParityFilterBarProps) {
  const { startDate, endDate, setDateRange } = useParityDateContext()
  const { selectedChannels, setSelectedChannels, availableChannels, setAvailableChannels, fallbackChannels } = useParityChannelContext()
  const [selectedProperty] = useSelectedProperty()
  const [isChannelOpen, setIsChannelOpen] = useState(false)

  // Fetch available channels and ensure we have at least 8
  useEffect(() => {
    if (selectedProperty?.sid) {
      const filtersValue = {
        sid: selectedProperty.sid
      }
      getChannels(filtersValue)
        .then((response) => {
          if (response.status && response.body && response.body.length > 0) {
            // Convert API response to consistent format
            const apiChannels = response.body.map((channel: any) => ({
              ...channel,
              channelId: channel.channelId || channel.cid,
              channelName: channel.channelName || channel.name
            }))
            
            // Ensure we have at least 8 channels
            if (apiChannels.length >= 8) {
              setAvailableChannels(apiChannels)
            } else {
              // Merge API channels with fallback channels to ensure we have at least 8
              const mergedChannels = [...apiChannels]
              
              // Add fallback channels that don't exist in API response
              fallbackChannels.forEach(fallbackChannel => {
                const exists = apiChannels.some((apiChannel: any) => 
                  apiChannel.cid === fallbackChannel.cid || 
                  apiChannel.name?.toLowerCase() === fallbackChannel.name.toLowerCase()
                )
                if (!exists && mergedChannels.length < 10) {
                  mergedChannels.push(fallbackChannel)
                }
              })
              
              setAvailableChannels(mergedChannels)
            }
            console.log(`📋 Loaded ${availableChannels.length} channels for parity monitoring`)
          } else {
            // Use fallback channels if API fails
            setAvailableChannels(fallbackChannels)
            console.log('📋 Using fallback channels for parity monitoring')
          }
        })
        .catch((error) => {
          console.error('Failed to fetch channels:', error)
          // Use fallback channels if API fails
          setAvailableChannels(fallbackChannels)
          console.log('📋 Using fallback channels due to API error')
        })
    } else {
      // Use fallback channels if no property selected
      setAvailableChannels(fallbackChannels)
    }
  }, [selectedProperty?.sid, setAvailableChannels, fallbackChannels])

  const handleChannelToggle = (channel: any) => {
    const isSelected = selectedChannels.some(ch => ch.channelId === channel.channelId)
    if (isSelected) {
      setSelectedChannels(selectedChannels.filter(ch => ch.channelId !== channel.channelId))
    } else {
      setSelectedChannels([...selectedChannels, channel])
    }
  }

  const clearChannelFilter = () => {
    setSelectedChannels([])
    setIsChannelOpen(false)
  }

  const selectedChannelCount = selectedChannels.length

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {/* Check-in Date Filter */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Check-in Date:</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 px-3 bg-card">
              <Calendar className="h-4 w-4 mr-2" />
              {startDate && endDate ? (
                <span className="text-sm">
                  {format(startDate, 'dd/MM/yyyy')} - {format(endDate, 'dd/MM/yyyy')}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">Select dates</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <EnhancedDatePicker
              selectedStartDate={startDate}
              selectedEndDate={endDate}
              onDateRangeChange={(start, end) => setDateRange(start, end)}
              maxDays={30}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Channels Filter */}
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Channels:</span>
        <DropdownMenu open={isChannelOpen} onOpenChange={setIsChannelOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9 px-3 bg-card gap-2">
              <Globe className="h-4 w-4" />
              <span className="text-sm">
                {selectedChannelCount === 0 
                  ? "All Channels" 
                  : selectedChannelCount === 1 
                    ? selectedChannels[0].channelName
                    : `${selectedChannelCount} Channels`
                }
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72 p-3" align="start">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Select Channels</span>
                {selectedChannelCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChannelFilter}
                    className="h-6 px-2 text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              
              <div className="grid gap-2 max-h-64 overflow-y-auto">
                {availableChannels.map((channel) => {
                  const isSelected = selectedChannels.some(ch => ch.channelId === channel.channelId)
                  return (
                    <div
                      key={channel.channelId}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                        isSelected 
                          ? "bg-primary/10 border border-primary/20" 
                          : "hover:bg-muted"
                      )}
                      onClick={() => handleChannelToggle(channel)}
                    >
                      <div 
                        className={cn(
                          "w-4 h-4 rounded border-2 transition-colors",
                          isSelected 
                            ? "bg-primary border-primary" 
                            : "border-muted-foreground"
                        )}
                      >
                        {isSelected && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-sm" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        {channel.channelIcon && (
                          <img 
                            src={channel.channelIcon} 
                            alt={channel.channelName}
                            className="w-5 h-5 rounded"
                          />
                        )}
                        <span className="text-sm">{channel.channelName}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters */}
      {selectedChannelCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          <Badge variant="secondary" className="gap-1">
            {selectedChannelCount} Channel{selectedChannelCount > 1 ? 's' : ''}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChannelFilter}
              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      )}
    </div>
  )
}
