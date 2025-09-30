"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Filter, X, Calendar, Users, Bed, Globe, MapPin, Map } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { EnhancedDatePicker } from "@/components/enhanced-date-picker"
import { useDateContext } from "@/components/date-context"
import { useComparison, ComparisonOption } from "@/components/comparison-context"
import { cn } from "@/lib/utils"
import { getChannels } from "@/lib/channels"
import { useState, useEffect } from "react"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { ScrollArea } from "@/components/ui/scroll-area"

/**
 * Cluster Filter Configuration
 * Professional filter options for cluster management
 */

const visibleFiltersList = []

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

interface ClusterFilterBarProps {
  onMoreFiltersClick?: () => void,
  setSelectedChannel?: any,
  viewMode?: string,
  setViewMode?: (mode: string) => void,
  setPropertySelectorOpen?: (open: boolean) => void
}

/**
 * Enhanced Cluster Filter Bar Component
 * 
 * Professional filter interface for cluster management with:
 * - Perfect vertical alignment and consistent heights
 * - Responsive design with proper spacing and hierarchy
 * - Icon integration for visual clarity
 * - Clean typography and visual balance
 * - Interactive filter management with clear actions
 * - Active filter visualization with mobile-friendly layout
 * - Proper container width matching page layout
 * 
 * @component
 * @version 1.0.0
 */
export function ClusterFilterBar({ onMoreFiltersClick, setSelectedChannel, viewMode = "Cluster", setViewMode, setPropertySelectorOpen }: ClusterFilterBarProps) {
  const [selectedProperty] = useSelectedProperty()

  const didFetch = React.useRef(false);
  const { startDate, endDate, setDateRange } = useDateContext()
  const { selectedComparison, setSelectedComparison, setChannelFilter, setCompsetFilter } = useComparison()
  const [channelData, setChannelData] = React.useState<any>([])

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

  // Dropdown state management
  const [isCountryOpen, setIsCountryOpen] = React.useState(false)
  const [isCityOpen, setIsCityOpen] = React.useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false)
  
  // Selection state
  const [selectedCountries, setSelectedCountries] = React.useState<string[]>(["All Countries"])
  const [selectedCities, setSelectedCities] = React.useState<string[]>(["All Cities"])

  // Dropdown handlers
  const handleCountryOpenChange = (open: boolean) => {
    setIsCountryOpen(open)
    if (open) {
      setIsCityOpen(false)
      setIsDatePickerOpen(false)
      // Close property selector if open
      if (setPropertySelectorOpen) {
        setPropertySelectorOpen(false)
      }
    }
  }

  const handleCityOpenChange = (open: boolean) => {
    setIsCityOpen(open)
    if (open) {
      setIsCountryOpen(false)
      setIsDatePickerOpen(false)
      // Close property selector if open
      if (setPropertySelectorOpen) {
        setPropertySelectorOpen(false)
      }
    }
  }


  const handleDatePickerOpenChange = (open: boolean) => {
    setIsDatePickerOpen(open)
    if (open) {
      setIsCountryOpen(false)
      setIsCityOpen(false)
      // Close property selector if open
      if (setPropertySelectorOpen) {
        setPropertySelectorOpen(false)
      }
    }
  }

  // Selection handlers - copied from parity-monitoring page
  const handleCountryToggle = (country: string) => {
    if (country === "All Countries") {
      if (selectedCountries.includes("All Countries")) {
        setSelectedCountries([])
      } else {
        setSelectedCountries(["All Countries", "Germany", "France", "Italy", "Spain", "Netherlands", "Austria", "Switzerland", "Belgium", "Poland"])
      }
    } else {
      setSelectedCountries(prev => {
        const newSelection = prev.includes(country) 
          ? prev.filter(c => c !== country)
          : [...prev.filter(c => c !== "All Countries"), country]
        
        // If all individual countries are selected, select "All Countries"
        const allCountries = ["Germany", "France", "Italy", "Spain", "Netherlands", "Austria", "Switzerland", "Belgium", "Poland"]
        if (allCountries.every(c => newSelection.includes(c))) {
          return ["All Countries", ...allCountries]
        }
        
        return newSelection
      })
    }
  }

  const handleCityToggle = (city: string) => {
    if (city === "All Cities") {
      if (selectedCities.includes("All Cities")) {
        setSelectedCities([])
      } else {
        setSelectedCities(["All Cities", "Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig", "Bremen", "Dresden"])
      }
    } else {
      setSelectedCities(prev => {
        const newSelection = prev.includes(city) 
          ? prev.filter(c => c !== city)
          : [...prev.filter(c => c !== "All Cities"), city]
        
        // If all individual cities are selected, select "All Cities"
        const allCities = ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig", "Bremen", "Dresden"]
        if (allCities.every(c => newSelection.includes(c))) {
          return ["All Cities", ...allCities]
        }
        
        return newSelection
      })
    }
  }


  // Get display text for dropdowns - copied from parity-monitoring page
  const getCountryDisplayText = () => {
    if (selectedCountries.length === 0) {
      return "All Countries"
    } else if (selectedCountries.includes("All Countries")) {
      return "All Countries"
    } else if (selectedCountries.length === 1) {
      return selectedCountries[0]
    } else {
      return `${selectedCountries.length} Countries`
    }
  }

  const getCityDisplayText = () => {
    if (selectedCities.length === 0) {
      return "All Cities"
    } else if (selectedCities.includes("All Cities")) {
      return "All Cities"
    } else if (selectedCities.length === 1) {
      return selectedCities[0]
    } else {
      return `${selectedCities.length} Cities`
    }
  }


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
        if (!!setSelectedChannel)
          setSelectedChannel(channelList);
        setChannelFilter({ channelId: channelList.map(c => c.cid), channelName: channelList.map(c => c.name) })
      }
      )
      .catch((err) => console.error(err));
  }, [selectedProperty]);

  const compareOptions = [
    { id: 1 as ComparisonOption, label: "Yesterday" },
    { id: 7 as ComparisonOption, label: "Last 1 Week" },
    { id: 28 as ComparisonOption, label: "Last 4 Week" },
    { id: 91 as ComparisonOption, label: "Last Quarter" }
  ]

  /**
   * Handle filter selection changes
   */
  const handleFilterChange = React.useCallback((groupName: string, option: string) => {
    setSelectedFilters((prev) => ({ ...prev, [groupName]: option }))
    console.log(`🔄 Cluster filter changed: ${groupName} = ${option}`)
  }, [])

  /**
   * Handle date range updates
   */
  const handleDateRangeChange = React.useCallback((newStartDate?: Date, newEndDate?: Date) => {
    if (newStartDate && newEndDate) {
      setDateRange(newStartDate, newEndDate)
      console.log(`📅 Cluster date range changed: ${newStartDate.toLocaleDateString()} - ${newEndDate.toLocaleDateString()}`)
    }
  }, [setDateRange])

  /**
   * Get display text for compset button
   */
  const getCompsetDisplayText = React.useCallback(() => {
    return selectedCompset
  }, [selectedCompset])

  /**
   * Handle compset selection with single-select logic
   */
  const handleCompsetSelect = React.useCallback((compset: string) => {
    setSelectedCompset(compset)
    console.log(`📊 Cluster compset selection changed: ${compset}`)
    setCompsetFilter(compset === "Secondary Compset" ? true : false);
  }, [])

  /**
   * Handle compare option selection
   */
  const handleCompareOptionSelect = React.useCallback((option: ComparisonOption) => {
    setSelectedComparison(option)
    setIsCompareOpen(false) // Close the popover after selection
    console.log(`📊 Cluster compare option changed: ${option}`)
  }, [setSelectedComparison])

  /**
   * Reset individual filter to default
   */
  const handleResetFilter = React.useCallback((groupName: string) => {
    const filter = allFiltersList.find((f) => f.name === groupName)
    if (filter) {
      setSelectedFilters((prev) => ({ ...prev, [groupName]: filter.defaultOption }))
      console.log(`🔄 Cluster filter reset: ${groupName}`)
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
      data-component-name="ClusterFilterBar"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-7xl xl:max-w-none mx-auto">
          <div className="flex items-center justify-between py-4 gap-4">

            {/* Left Section - Primary Filters */}
            <div className="flex items-center gap-4 flex-1 min-w-0">

              {/* View Toggle */}
              <div className="shrink-0">
                <ToggleGroup
                  type="single"
                  value={viewMode}
                  onValueChange={(value) => value && setViewMode && setViewMode(value)}
                  className="border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 shadow-sm h-10 gap-0"
                >
                  <ToggleGroupItem
                    value="Cluster"
                    className="h-10 px-4 text-sm font-medium data-[state=on]:bg-blue-600 data-[state=on]:text-white dark:data-[state=on]:bg-blue-600 dark:data-[state=on]:text-white hover:text-black data-[state=on]:hover:text-white border-0 rounded-l-md rounded-r-none"
                  >
                    Cluster
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="All Properties"
                    className="h-10 px-4 text-sm font-medium data-[state=on]:bg-blue-600 data-[state=on]:text-white dark:data-[state=on]:bg-blue-600 dark:data-[state=on]:text-white hover:text-black data-[state=on]:hover:text-white border-0 rounded-r-md rounded-l-none border-l border-slate-200 dark:border-slate-700"
                  >
                    All Properties
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Date Range Picker */}
              <div className="shrink-0">
                <EnhancedDatePicker
                  startDate={startDate || undefined}
                  endDate={endDate || undefined}
                  onChange={handleDateRangeChange}
                  onOpenChange={handleDatePickerOpenChange}
                />
              </div>


              {/* Visible Filters */}
              <div className="flex items-center gap-3 flex-wrap min-w-0">
                {/* Country Dropdown */}
                <DropdownMenu key="country" open={isCountryOpen} onOpenChange={handleCountryOpenChange}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md min-w-0 max-w-[160px] hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                    >
                      <Map className="w-4 h-4 shrink-0" />
                  <span className="truncate max-w-[80px] font-semibold">
                    {getCountryDisplayText()}
                  </span>
                      <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-auto p-0 shadow-xl border-slate-200 dark:border-slate-700 z-[60]">
                    <div className="flex">
                      <div className="w-56 p-4">
                        <h4 className="font-semibold text-sm text-gray-700 mb-3">Country</h4>
                        <ScrollArea className="max-h-68 overflow-hidden h-64">
                          <div className="space-y-1 pr-4">
                            {["All Countries", "Germany", "France", "Italy", "Spain", "Netherlands", "Austria", "Switzerland", "Belgium", "Poland"].map((option) => (
                              <label
                                key={option}
                                className="py-2 px-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm flex items-center cursor-pointer"
                                onClick={() => handleCountryToggle(option)}
                              >
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-0 focus:outline-none mr-3 cursor-pointer"
                                  checked={selectedCountries.includes(option)}
                                  onChange={() => {}} // Prevent default behavior
                                  readOnly
                                />
                                <span 
                                  className="font-medium text-sm flex-1 cursor-pointer"
                                >
                                  {option}
                                </span>
                              </label>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* City Dropdown */}
                <DropdownMenu key="city" open={isCityOpen} onOpenChange={handleCityOpenChange}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md min-w-0 max-w-[160px] hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                    >
                      <MapPin className="w-4 h-4 shrink-0" />
                  <span className="truncate max-w-[80px] font-semibold">
                    {getCityDisplayText()}
                  </span>
                      <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-auto p-0 shadow-xl border-slate-200 dark:border-slate-700 z-[60]">
                    <div className="flex">
                      <div className="w-56 p-4">
                        <h4 className="font-semibold text-sm text-gray-700 mb-3">City</h4>
                        <ScrollArea className="max-h-68 overflow-hidden h-64">
                          <div className="space-y-1 pr-4">
                            {["All Cities", "Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig", "Bremen", "Dresden"].map((option) => (
                              <label
                                key={option}
                                className="py-2 px-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm flex items-center cursor-pointer"
                                onClick={() => handleCityToggle(option)}
                              >
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-0 focus:outline-none mr-3 cursor-pointer"
                                  checked={selectedCities.includes(option)}
                                  onChange={() => {}} // Prevent default behavior
                                  readOnly
                                />
                                <span 
                                  className="font-medium text-sm flex-1 cursor-pointer"
                                >
                                  {option}
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
                      console.log("🔄 All cluster filters reset")
                    }}
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
