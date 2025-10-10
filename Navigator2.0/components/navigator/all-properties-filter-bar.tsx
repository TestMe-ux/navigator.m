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
import { GetChannelListCluster } from "@/lib/channels"
import { useState, useEffect } from "react"
import { useSelectedProperty, useAllProperty, useUserDetail } from "@/hooks/use-local-storage"
import { ScrollArea } from "@/components/ui/scroll-area"

/**
 * All Properties Filter Configuration
 * Professional filter options for all properties management
 */

const visibleFiltersList: any[] = []

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

interface AllPropertiesFilterBarProps {
  onMoreFiltersClick?: () => void,
  setSelectedChannel?: any,
  viewMode?: string,
  setViewMode?: (mode: string) => void
}

/**
 * Enhanced All Properties Filter Bar Component
 * 
 * Professional filter interface for all properties management with:
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
export function AllPropertiesFilterBar({ onMoreFiltersClick, setSelectedChannel, viewMode = "All Properties", setViewMode }: AllPropertiesFilterBarProps) {
  const [selectedProperty] = useSelectedProperty()
  const [userDetails] = useUserDetail()
  const [allProperties] = useAllProperty()

  const didFetch = React.useRef(false);
  const { startDate, endDate, setDateRange } = useDateContext()
  const { selectedComparison, setSelectedComparison, setChannelFilter, setCompsetFilter } = useComparison()
  const [channelData, setChannelData] = React.useState<any>([])

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
  const [isChannelOpen, setIsChannelOpen] = React.useState(false)

  // Selection state - No countries or cities checked by default
  const [selectedCountries, setSelectedCountries] = React.useState<string[]>([])
  const [selectedCities, setSelectedCities] = React.useState<string[]>([])
  const [selectedChannels, setSelectedChannels] = React.useState<string[]>([])

  // Extract distinct countries from all properties
  const distinctCountries = React.useMemo(() => {
    if (!allProperties || allProperties.length === 0) {
      return ["All Countries"]
    }

    const countries = allProperties
      .map(property => property?.country)
      .filter((country): country is string => Boolean(country))
      .filter((country, index, array) => array.indexOf(country) === index) // Remove duplicates
      .sort()
    setSelectedCountries(["All Countries", ...countries])
    return ["All Countries", ...countries]
  }, [allProperties])

  // Extract distinct cities filtered by selected country
  const distinctCities = React.useMemo(() => {
    if (!allProperties || allProperties.length === 0) {
      return ["All Cities"]
    }

    let filteredProperties = allProperties

    // Filter by selected countries if not "All Countries"
    if (!selectedCountries.includes("All Countries") && selectedCountries.length > 0) {
      filteredProperties = allProperties.filter(property =>
        property?.country && selectedCountries.includes(property.country)
      )
    }

    const cities = filteredProperties
      .map(property => property?.city)
      .filter((city): city is string => Boolean(city))
      .filter((city, index, array) => array.indexOf(city) === index) // Remove duplicates
      .sort()
    setSelectedCities(["All Cities", ...cities])
    return ["All Cities", ...cities]
  }, [allProperties, selectedCountries])

  // Extract distinct channels from channelData
  const distinctChannels = React.useMemo(() => {
    if (!channelData || channelData.length === 0) {
      return ["All Channel"]
    }
    const channels = channelData
      .map((channel: any) => channel?.name)
      .filter((name: any): name is string => Boolean(name))
      .filter((name: string, index: number, array: string[]) => array.indexOf(name) === index) // Remove duplicates
    return [...channels]
  }, [channelData])

  // Dropdown handlers
  const handleCountryOpenChange = (open: boolean) => {
    setIsCountryOpen(open)
    if (open) {
      setIsCityOpen(false)
      setIsChannelOpen(false)
    }
  }

  const handleCityOpenChange = (open: boolean) => {
    setIsCityOpen(open)
    if (open) {
      setIsCountryOpen(false)
      setIsChannelOpen(false)
    }
  }

  const handleChannelOpenChange = (open: boolean) => {
    setIsChannelOpen(open)
    if (open) {
      setIsCountryOpen(false)
      setIsCityOpen(false)
    }
  }

  // Selection handlers - updated to work with dynamic data
  const handleCountryToggle = (country: string) => {
    debugger;
    if (country === "All Countries") {
      if (selectedCountries.includes("All Countries")) {
        setSelectedCountries([])
      } else {
        setSelectedCountries(distinctCountries)
      }
    } else {
      setSelectedCountries((prev: string[]) => {
        const newSelection = prev.includes(country)
          ? prev.filter(c => c !== country && c !== "All Countries")
          : [...prev.filter(c => c !== "All Countries"), country]

        // If all individual countries are selected, select "All Countries"
        const individualCountries = distinctCountries.filter(c => c !== "All Countries")
        if (individualCountries.every(c => newSelection.includes(c))) {
          return ["All Countries", ...individualCountries]
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
        setSelectedCities(distinctCities)
      }
    } else {
      setSelectedCities((prev: string[]) => {
        const newSelection = prev.includes(city)
          ? prev.filter(c => c !== city && c !== "All Cities")
          : [...prev.filter(c => c !== "All Cities"), city]

        // If all individual cities are selected, select "All Cities"
        const individualCities = distinctCities.filter(c => c !== "All Cities")
        if (individualCities.every(c => newSelection.includes(c))) {
          return ["All Cities", ...individualCities]
        }

        return newSelection
      })
    }
  }

  const handleChannelToggle = (channel: string) => {
    if (channel === "All Channel") {
      if (selectedChannels.includes("All Channel")) {
        setSelectedChannels([])
      } else {
        setSelectedChannels(distinctChannels)
      }
    } else {
      setSelectedChannels((prev: string[]) => {
        const newSelection = prev.includes(channel)
          ? prev.filter(c => c !== channel && c !== "All Channel")
          : [...prev.filter(c => c !== "All Channel"), channel]

        // If all individual channels are selected, select "All Channel"
        const individualChannels = distinctChannels.filter(c => c !== "All Channel")
        if (individualChannels.every(c => newSelection.includes(c))) {
          return ["All Channel", ...individualChannels]
        }

        return newSelection
      })
    }
  }

  // Get display text for dropdowns - updated to handle empty selections
  const getCountryDisplayText = () => {
    if (selectedCountries.length === 0) {
      return "Select Countries"
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
      return "Select Cities"
    } else if (selectedCities.includes("All Cities")) {
      return "All Cities"
    } else if (selectedCities.length === 1) {
      return selectedCities[0]
    } else {
      return `${selectedCities.length} Cities`
    }
  }

  const getChannelDisplayText = () => {
    if (selectedChannels.length === 0) {
      return "All Channel"
    } else if (selectedChannels.includes("All Channel")) {
      return "All Channel"
    } else if (selectedChannels.length === 1) {
      return selectedChannels[0]
    } else {
      return `${selectedChannels.length} Channels`
    }
  }

  // Reset didFetch when property changes
  React.useEffect(() => {
    didFetch.current = false;
  }, [selectedProperty?.sid]);

  // Reset city selection when country selection changes - clear cities by default
  // React.useEffect(() => {
  //   setSelectedCities([])
  // }, [selectedCountries]);

  React.useEffect(() => {
    if (!userDetails?.userId || didFetch.current) return;

    didFetch.current = true;
    GetChannelListCluster({ userid: userDetails?.userId })
      .then((res) => {
        console.log("Channels", res.body);
        debugger
        const rawChannels = res.body.flatMap((x: { channels: any[] }) => x.channels || [])

        const uniqueChannelsMap = new globalThis.Map(rawChannels.map((item: any) => [item.cid, item]))

        const channelListData: any[] = Array.from(uniqueChannelsMap?.values()).sort((a:any, b:any) =>a.name.localeCompare(b.name))
        // res.body.sort((a: any, b: any) => a.name.localeCompare(b.name))
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

        const channelList = [allChannel, ...channelListData];

        // Set data
        setChannelData(channelList);
        if (!!setSelectedChannel)
          setSelectedChannel(channelList);
        setChannelFilter({ channelId: channelList.map(c => c.cid), channelName: channelList.map(c => c.name) })
        setSelectedChannels(channelList.map(c => c.name))
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
    setSelectedFilters((prev: Record<string, string>) => ({ ...prev, [groupName]: option }))
    console.log(`🔄 All Properties filter changed: ${groupName} = ${option}`)
  }, [])

  /**
   * Handle date range updates
   */
  const handleDateRangeChange = React.useCallback((newStartDate?: Date, newEndDate?: Date) => {
    console.log('📅 AllPropertiesFilterBar - Date range change received:', {
      newStartDate: newStartDate?.toLocaleDateString(),
      newEndDate: newEndDate?.toLocaleDateString(),
      daysDiff: newStartDate && newEndDate ? Math.round((newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 'N/A'
    })

    if (newStartDate && newEndDate) {
      setDateRange(newStartDate, newEndDate)
      console.log(`📅 All Properties date range changed: ${newStartDate.toLocaleDateString()} - ${newEndDate.toLocaleDateString()}`)
    }
  }, [setDateRange])


  /**
   * Handle compare option selection
   */
  const handleCompareOptionSelect = React.useCallback((option: ComparisonOption) => {
    setSelectedComparison(option)
    setIsCompareOpen(false) // Close the popover after selection
    console.log(`📊 All Properties compare option changed: ${option}`)
  }, [setSelectedComparison])

  /**
   * Reset individual filter to default
   */
  const handleResetFilter = React.useCallback((groupName: string) => {
    const filter = allFiltersList.find((f) => f.name === groupName)
    if (filter) {
      setSelectedFilters((prev: Record<string, string>) => ({ ...prev, [groupName]: filter.defaultOption }))
      console.log(`🔄 All Properties filter reset: ${groupName}`)
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
      data-component-name="AllPropertiesFilterBar"
      style={{ pointerEvents: 'auto' }}
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

              {/* Visible Filters */}
              <div className="flex items-center gap-3 flex-wrap min-w-0">
                {/* Country Dropdown */}
                <DropdownMenu key="country" open={isCountryOpen} onOpenChange={handleCountryOpenChange}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md min-w-0 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                    >
                      <Map className="w-4 h-4 shrink-0" />
                      <span className="font-semibold">
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
                            {distinctCountries.map((option) => (
                              <label
                                key={option}
                                className="py-2 px-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm flex items-center cursor-pointer"
                              // onClick={() => handleCountryToggle(option)}
                              >
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-0 focus:outline-none mr-3 cursor-pointer"
                                  checked={selectedCountries.includes(option)}
                                  onChange={() => handleCountryToggle(option)} // Prevent default behavior
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
                      className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md min-w-0 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                    >
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="font-semibold">
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
                            {distinctCities.map((option) => (
                              <label
                                key={option}
                                className="py-2 px-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm flex items-center cursor-pointer"
                              // onClick={() => }
                              >
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-0 focus:outline-none mr-3 cursor-pointer"
                                  checked={selectedCities.includes(option)}
                                  onChange={() => handleCityToggle(option)} // Prevent default behavior
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

                {/* Channel Dropdown */}
                <DropdownMenu key="channel" open={isChannelOpen} onOpenChange={handleChannelOpenChange}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md min-w-0 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                    >
                      <Globe className="w-4 h-4 shrink-0" />
                      <span className="font-semibold">
                        {getChannelDisplayText()}
                      </span>
                      <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-auto p-0 shadow-xl border-slate-200 dark:border-slate-700 z-[60]">
                    <div className="flex">
                      <div className="w-56 p-4">
                        <h4 className="font-semibold text-sm text-gray-700 mb-3">Channel</h4>
                        <ScrollArea className="max-h-68 overflow-hidden h-64">
                          <div className="space-y-1 pr-4">
                            {distinctChannels.map((option) => (
                              <label
                                key={option}
                                className="py-2 px-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm flex items-center cursor-pointer"
                              // onClick={() => }
                              >
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-0 focus:outline-none mr-3 cursor-pointer"
                                  checked={selectedChannels.includes(option)}
                                  onChange={() => handleChannelToggle(option)} // Prevent default behavior
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

                {/* More Filters Button - Responsive with tooltip */}
                {/* <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 gap-2 font-medium hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 transition-all duration-200 relative shadow-sm hover:shadow-md border-slate-200 dark:border-slate-700 xl-1366:px-4 px-2"
                        onClick={onMoreFiltersClick}
                      >
                        <Filter className="w-4 h-4" />
                        <span className="hidden xl-1450:inline font-semibold">More Filters</span>
                        {getActiveFilters.length > 0 && (
                          <Badge
                            className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg"
                          >
                            {getActiveFilters.length}
                          </Badge>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-slate-800 text-white border-slate-700 xl-1450:hidden">
                      <p className="text-xs">More Filters</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider> */}

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
                      // Reset dropdown selections to default checked state
                      setSelectedCountries(["All Countries"])
                      setSelectedCities(["All Cities"])
                      setSelectedChannels(["All Channel"])
                      // Date range is managed by context
                      console.log("🔄 All all properties filters reset")
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
