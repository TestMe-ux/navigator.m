"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Filter, X, Calendar, Users, Bed, Globe } from "lucide-react"
import { EnhancedDatePicker } from "@/components/enhanced-date-picker"
import { useDateContext } from "@/components/date-context"
import { useComparison, ComparisonOption } from "@/components/comparison-context"
import { cn } from "@/lib/utils"
import { getChannels } from "@/lib/channels"
import localStorageService from "@/lib/localstorage"
import { useState, useEffect } from "react"
import { useSelectedProperty } from "@/hooks/use-local-storage"


/**
 * Filter Configuration
 * Professional filter options with proper categorization
 */

const visibleFiltersList = [
  {
    name: "Compset",
    defaultOption: "Primary Compset",
    options: ["Primary Compset", "Secondary Compset"],
    isEditable: true,
    icon: Users,
  },
]

const moreFiltersList = [
  {
    name: "Length of Stay",
    defaultOption: "1 Night",
    options: ["1 Night", "2 Nights", "3 Nights", "4+ Nights", "Weekly", "Monthly"],
    isEditable: true,
    icon: Calendar,
  },
  {
    name: "Guests",
    defaultOption: "2 Guests",
    options: ["1 Guest", "2 Guests", "3 Guests", "4+ Guests", "Family (5+)"],
    isEditable: true,
    icon: Users,
  },
  {
    name: "Room Type",
    defaultOption: "All Rooms",
    options: ["All Rooms", "Standard", "Deluxe", "Suite", "Family Room", "Premium"],
    isEditable: true,
    icon: Bed,
  },
  {
    name: "Rate Type",
    defaultOption: "All Rates",
    options: ["All Rates", "BAR", "Package Rates", "Promotional", "Last Minute"],
    isEditable: true,
    icon: Filter,
  },
]

const allFiltersList = [...visibleFiltersList, ...moreFiltersList]

interface FilterBarProps {
  onMoreFiltersClick?: () => void
}

/**
 * Enhanced Filter Bar Component
 * 
 * Professional filter interface with:
 * - Perfect vertical alignment and consistent heights
 * - Responsive design with proper spacing and hierarchy
 * - Icon integration for visual clarity
 * - Clean typography and visual balance
 * - Interactive filter management with clear actions
 * - Active filter visualization with mobile-friendly layout
 * - Proper container width matching page layout
 * 
 * @component
 * @version 3.0.0
 */
export function FilterBar({ onMoreFiltersClick }: FilterBarProps) {
  const [selectedProperty] = useSelectedProperty()
  

  const didFetch = React.useRef(false);
  const { startDate, endDate, setDateRange } = useDateContext()
  const { selectedComparison, setSelectedComparison, setChannelFilter, setCompsetFilter } = useComparison()
  const [channelData, setChannelData] = React.useState<any>([])
  const [selectedChannels, setSelectedChannels] = React.useState<number[]>([])

  // Compset single-select state
  const [selectedCompset, setSelectedCompset] = React.useState<string>("Primary Compset")

  // Compare dropdown state - using context now
  const [isCompareOpen, setIsCompareOpen] = React.useState(false)
  const [selectedFilters, setSelectedFilters] = React.useState(() =>
    allFiltersList.reduce(
      (acc, group) => {
        acc[group.name] = group.defaultOption
        return acc
      },
      {} as Record<string, string>,
    ),
  )
  // Reset didFetch when property changes
  React.useEffect(() => {
    didFetch.current = false;
  }, [selectedProperty?.sid]);

  React.useEffect(() => {
    if (!selectedProperty?.sid || didFetch.current) return;

    didFetch.current = true;
    getChannels({ SID: selectedProperty?.sid })
      .then((res) => {
        console.log("Channels", res.body);
        res.body.sort((a: any, b: any) => a.name.localeCompare(b.name))
        const allChannel = {
          cid: -1,
          channelMasterId: null,
          name: "All Channel",
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
        };

        const channelList = [allChannel, ...res.body];

        // Set data
        setChannelData(channelList);

        // Set selected channels as array of cids
        setSelectedChannels(channelList.map(c => c.cid));
        setChannelFilter({ channelId: channelList.map(c => c.cid), channelName: channelList.map(c => c.name) })
      }
      )
      .catch((err) => console.error(err));
  }, [selectedProperty]);
  // Channel multi-select state

  const compareOptions = [
    { id: 7 as ComparisonOption, label: "Last 7 Days" },
    { id: 30 as ComparisonOption, label: "Last 30 Days" },
    { id: 90 as ComparisonOption, label: "Last Quarter" }
  ]

  /**
   * Handle filter selection changes
   */
  const handleFilterChange = React.useCallback((groupName: string, option: string) => {
    setSelectedFilters((prev) => ({ ...prev, [groupName]: option }))
    console.log(`🔄 Filter changed: ${groupName} = ${option}`)

  }, [])

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
   * Get display text for compset button
   */
  const getCompsetDisplayText = React.useCallback(() => {
    return selectedCompset
  }, [selectedCompset])

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
    debugger
    if (!open) {
      // Reset channel filter when dropdown closes
      setChannelFilter({ channelId: selectedChannels, channelName: [] })
      console.log(`🔄 Channel filter reset to: ${selectedChannels.join(", ")}`)
    }
  }
  /**
   * Handle compset selection with single-select logic
   */
  const handleCompsetSelect = React.useCallback((compset: string) => {
    setSelectedCompset(compset)
    console.log(`📊 Compset selection changed: ${compset}`)
    setCompsetFilter(compset === "Secondary Compset" ? true : false);
  }, [])

  /**
   * Handle compare option selection
   */
  const handleCompareOptionSelect = React.useCallback((option: ComparisonOption) => {
    setSelectedComparison(option)
    setIsCompareOpen(false) // Close the popover after selection
    console.log(`📊 Compare option changed: ${option}`)

    // Simulate data refresh with dummy values instead of full page reload
    // setTimeout(() => {
    //   console.log(`🔄 Refreshing data with ${option} comparison...`)
    //   console.log(`📈 Updated metrics for ${option}:`)
    //   console.log(`- Revenue Impact: ${(Math.random() * 20 - 10).toFixed(1)}%`)
    //   console.log(`- Booking Volume: ${(Math.random() * 100 + 500).toFixed(0)} bookings`)
    //   console.log(`- Average Rate: $${(Math.random() * 50 + 150).toFixed(0)}`)

    //   // In a real app, this would trigger data refetch
    //   // For demo purposes, we'll show a subtle indication that data has refreshed
    //   const event = new CustomEvent('dataRefresh', {
    //     detail: { compareOption: option, timestamp: new Date().toISOString() }
    //   })
    //   window.dispatchEvent(event)
    // }, 300)
  }, [setSelectedComparison])

  /**
   * Reset individual filter to default
   */
  const handleResetFilter = React.useCallback((groupName: string) => {
    const filter = allFiltersList.find((f) => f.name === groupName)
    if (filter) {
      setSelectedFilters((prev) => ({ ...prev, [groupName]: filter.defaultOption }))
      console.log(`🔄 Filter reset: ${groupName}`)
    }
  }, [])

  /**
   * Get currently active (non-default) filters
   */
  const getActiveFilters = React.useMemo(() => {
    return moreFiltersList.filter((filter) => selectedFilters[filter.name] !== filter.defaultOption)
  }, [selectedFilters])

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = React.useMemo(() => {
    return allFiltersList.some((filter) => selectedFilters[filter.name] !== filter.defaultOption)
  }, [selectedFilters])

  return (
    <div
      className="bg-background border-b border-border shadow-sm"
      data-component-name="FilterBar"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-7xl xl:max-w-none mx-auto">
          <div className="flex items-center justify-between py-4 gap-4">

            {/* Left Section - Primary Filters */}
            <div className="flex items-center gap-4 flex-1 min-w-0">

              {/* Date Range Picker - Removed extra calendar icon */}
              <div className="shrink-0">
                <EnhancedDatePicker
                  startDate={startDate || undefined}
                  endDate={endDate || undefined}
                  onChange={handleDateRangeChange}
                />
              </div>

              {/* Compare with Date Dropdown */}
              <div className="shrink-0">
                <Popover open={isCompareOpen} onOpenChange={setIsCompareOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 min-w-0 max-w-[160px]"

                    >
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span className="truncate max-w-[80px] font-semibold">
                        Vs. {compareOptions.find(opt => opt.id === selectedComparison)?.label}
                      </span>
                      <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[60]" align="start">
                    <div className="flex">
                      {/* Compare Options Sidebar */}
                      <div className="w-44 p-4">
                        <h4 className="font-semibold text-sm text-gray-700 mb-3">Compare with</h4>
                        <div className="space-y-1">
                          {compareOptions.map((option) => (
                            <Button
                              key={option.id}
                              variant={selectedComparison === option.id ? "default" : "ghost"}
                              size="sm"
                              className="w-full justify-start text-left h-auto py-2 px-3"
                              onClick={() => handleCompareOptionSelect(option.id)}
                            >
                              <span className={cn(
                                "text-sm font-medium",
                                selectedComparison === option.id ? "text-white" : "text-foreground"
                              )}>
                                {option.label}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Visible Filters */}
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
                        <div className="space-y-1">
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
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                {visibleFiltersList.map((group) => {
                  const Icon = group.icon
                  // Special handling for Comparison filter (multi-select with checkboxes)
                  if (group.name === "Compset") {
                    return (
                      <DropdownMenu key={group.name}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md min-w-0 max-w-[160px] hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="truncate max-w-[80px] font-semibold">
                              {getCompsetDisplayText()}
                            </span>
                            <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-auto p-0 shadow-xl border-slate-200 dark:border-slate-700">
                          <div className="flex">
                            <div className="w-56 p-4">
                              <h4 className="font-semibold text-sm text-gray-700 mb-3">Compset</h4>
                              <div className="space-y-1">
                                {group.options?.map((option) => (
                                  <label
                                    key={option}
                                    className="py-2 px-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm flex items-center cursor-pointer"
                                  >
                                    <input
                                      type="radio"
                                      name="compset"
                                      value={option}
                                      className="h-4 w-4 shrink-0 border-gray-300 text-indigo-600 focus:ring-0 focus:outline-none mr-3 cursor-pointer"
                                      checked={selectedCompset === option}
                                      onChange={() => handleCompsetSelect(option)}
                                    />
                                    <span className="font-medium text-sm flex-1">
                                      {option}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )
                  }

                  // Default handling for other filters
                  const isActive = selectedFilters[group.name] !== group.defaultOption

                  return (
                    <DropdownMenu key={group.name}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          className={`h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md min-w-0 max-w-[160px] ${isActive
                            ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-blue-200/50"
                            : "hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                            }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate max-w-[80px] font-semibold">
                            {selectedFilters[group.name]}
                          </span>
                          <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-64 shadow-xl border-slate-200 dark:border-slate-700">
                        {group.options?.map((option) => (
                          <DropdownMenuItem
                            key={option}
                            onSelect={() => handleFilterChange(group.name, option)}
                            className={`cursor-pointer py-3 px-4 transition-colors ${selectedFilters[group.name] === option
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800"
                              }`}
                          >
                            <Icon className="w-4 h-4 mr-3 opacity-70" />
                            <span className="font-medium">{option}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                })}

                {/* More Filters Button - Moved next to Primary Compset */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 gap-2 px-4 font-medium hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 transition-all duration-200 relative shadow-sm hover:shadow-md border-slate-200 dark:border-slate-700"
                  onClick={onMoreFiltersClick}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline font-semibold">More Filters</span>
                  <span className="sm:hidden font-semibold">Filters</span>
                  {getActiveFilters.length > 0 && (
                    <Badge
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      {getActiveFilters.length}
                    </Badge>
                  )}
                </Button>

                {/* Active More Filters Display */}
                {getActiveFilters.length > 0 && (
                  <>
                    <div className="hidden lg:block w-px h-6 bg-border shrink-0" />
                    <div className="hidden lg:flex items-center gap-2 flex-wrap">
                      {getActiveFilters.slice(0, 2).map((filter) => (
                        <Badge
                          key={filter.name}
                          variant="secondary"
                          className="h-9 px-3 gap-2 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 flex items-center shrink-0 shadow-sm"
                        >
                          <span className="text-xs font-medium truncate max-w-[140px]">
                            {filter.name}: {selectedFilters[filter.name]}
                          </span>
                          <button
                            onClick={() => handleResetFilter(filter.name)}
                            className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                      {getActiveFilters.length > 2 && (
                        <Badge variant="outline" className="h-9 px-3 text-xs flex items-center shrink-0 shadow-sm">
                          +{getActiveFilters.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Right Section - Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-4 text-muted-foreground hover:text-foreground font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => {
                      // Reset all filters to default
                      setSelectedFilters(
                        allFiltersList.reduce(
                          (acc, group) => {
                            acc[group.name] = group.defaultOption
                            return acc
                          },
                          {} as Record<string, string>,
                        )
                      )
                      // Date range is managed by context
                      console.log("🔄 All filters reset")
                    }}
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Active Filters Row */}
            {getActiveFilters.length > 0 && (
              <div className="lg:hidden pb-4 border-t border-border/50 pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground shrink-0">Active:</span>
                  {getActiveFilters.slice(0, 4).map((filter) => (
                    <Badge
                      key={filter.name}
                      variant="secondary"
                      className="h-8 px-2 gap-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 flex items-center"
                    >
                      <span className="text-xs font-medium truncate max-w-[120px]">
                        {filter.name}: {selectedFilters[filter.name]}
                      </span>
                      <button
                        onClick={() => handleResetFilter(filter.name)}
                        className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {getActiveFilters.length > 4 && (
                    <Badge variant="outline" className="h-8 px-2 text-xs flex items-center">
                      +{getActiveFilters.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
