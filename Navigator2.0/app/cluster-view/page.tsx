"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AllPropertiesFilterBar } from "@/components/navigator/all-properties-filter-bar"
import { AllPropertiesTable } from "@/components/navigator/all-properties-table"
import { ComparisonProvider, useComparison } from "@/components/comparison-context"
import { FilterSidebar } from "@/components/filter-sidebar"
import { useDateContext } from "@/components/date-context"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"

function AllPropertiesPageContent() {
  const router = useRouter()
  const { selectedComparison, channelFilter, compsetFilter, setSideFilter, sideFilter } = useComparison()
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const { startDate, endDate, setDateRange } = useDateContext()
  const [selectedProperty] = useSelectedProperty()
  const [selectedChannel, setSelectedChannel] = useState([])
  const [viewMode, setViewMode] = useState("All Properties")
  const [screenWidth, setScreenWidth] = useState(0)
  
  // Property selector state - copied from Cluster page
  const [selectedProperties, setSelectedProperties] = useState<string[]>([
    "Seaside Resort & Spa",
    "City Hotel Gotland", 
    "Grand Palace Hotel",
    "Mountain View Lodge",
    "Urban Business Center",
    "Riverside Inn",
    "Downtown Plaza",
    "Garden Hotel",
    "Business Tower",
    "Luxury Suites"
  ])
  const [isPropertySelectorOpen, setIsPropertySelectorOpen] = useState(false)
  const [displayedPropertiesCount, setDisplayedPropertiesCount] = useState(10)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Available properties for selector - expanded to 25 hotels
  const availableProperties = [
    "Seaside Resort & Spa",
    "City Hotel Gotland", 
    "Grand Palace Hotel",
    "Mountain View Lodge",
    "Urban Business Center",
    "Riverside Inn",
    "Downtown Plaza",
    "Garden Hotel",
    "Business Tower",
    "Luxury Suites",
    "Oceanfront Paradise",
    "Metropolitan Plaza",
    "Historic Grand Hotel",
    "Business Center Inn",
    "Riverside Retreat",
    "Downtown Business Hotel",
    "Garden View Resort",
    "Executive Suites",
    "City Center Hotel",
    "Luxury Business Inn",
    "Coastal Resort & Spa",
    "Urban Business Plaza",
    "Historic Downtown Inn",
    "Executive Business Center",
    "Premium City Hotel"
  ]

  // Track screen width for resolution indicator
  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth)
    }
    
    updateScreenWidth()
    window.addEventListener('resize', updateScreenWidth)
    return () => window.removeEventListener('resize', updateScreenWidth)
  }, [])

  // Get resolution category and column count
  const getResolutionInfo = () => {
    if (screenWidth < 1352) {
      return { category: "< 1352px", columns: 6 }
    } else if (screenWidth >= 1352 && screenWidth <= 1500) {
      return { category: "1352px - 1500px", columns: 7 }
    } else if (screenWidth >= 1501 && screenWidth <= 1800) {
      return { category: "1501px - 1800px", columns: 10 }
    } else {
      return { category: "> 1800px", columns: 12 }
    }
  }

  const resolutionInfo = getResolutionInfo()

  // Property selector handlers - copied from Cluster page
  const handlePropertyToggle = (property: string) => {
    setSelectedProperties(prev => 
      prev.includes(property) 
        ? prev.filter(p => p !== property)
        : [...prev, property]
    )
  }

  // Handle "All Properties" selection - copied from Cluster page
  const handleSelectAllProperties = () => {
    // If all properties are selected, deselect all
    if (selectedProperties.length === availableProperties.length) {
      setSelectedProperties([])
    } else {
      // Otherwise, select all properties
      setSelectedProperties(availableProperties)
    }
  }

  // Get display text for property dropdown - updated for 25 properties
  const getPropertyDisplayText = () => {
    if (selectedProperties.length === 0) {
      return "All Properties"
    } else if (selectedProperties.length === availableProperties.length) {
      return "25 Properties"
    } else if (selectedProperties.length === 1) {
      return selectedProperties[0]
    } else {
      return `${selectedProperties.length} Properties`
    }
  }

  // Load more properties handler - copied from Cluster page
  const handleLoadMoreProperties = async () => {
    setIsLoadingMore(true)
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setDisplayedPropertiesCount(prev => Math.min(prev + 10, selectedProperties.length))
    setIsLoadingMore(false)
  }

  // Reset displayed count when selected properties change
  useEffect(() => {
    // Always show 10 properties by default, regardless of selection
    if (selectedProperties.length <= 10) {
      setDisplayedPropertiesCount(10)
    } else if (displayedPropertiesCount > selectedProperties.length) {
      setDisplayedPropertiesCount(10)
    }
  }, [selectedProperties.length, displayedPropertiesCount])

  // Simulate loading for skeleton effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000) // 2 second loading simulation

    return () => clearTimeout(timer)
  }, [])

  const handleMoreFiltersClick = () => {
    setIsFilterSidebarOpen(true)
    console.log("🔍 Opening all properties filter sidebar")
  }

  const handleViewModeChange = (mode: string) => {
    if (mode === "Cluster") {
      router.push("/cluster-view")
    } else {
      setViewMode(mode)
    }
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex flex-col" data-coach-mark="all-properties-overview">
      {isLoading && (
        <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
          <GlobalProgressBar />
          <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8 xl:py-10">
            <div className="max-w-7xl xl:max-w-none mx-auto">
              <LoadingSkeleton type="all-properties" showCycleCounter={true} />
            </div>
          </div>
        </div>
      )}
      {!isLoading && (
        <>
      {/* Enhanced Filter Bar with Sticky Positioning */}
      <div className="sticky top-0 z-40 filter-bar-minimal bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-border/50 shadow-sm transition-shadow duration-200">
        <AllPropertiesFilterBar 
          onMoreFiltersClick={handleMoreFiltersClick} 
          setSelectedChannel={setSelectedChannel}
          viewMode={viewMode}
          setViewMode={handleViewModeChange}
        />
      </div>
      
      <FilterSidebar
        losGuest={{ "Los": [], "Guest": [] }}
        isOpen={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
        onApply={(filters) => {
          // Handle filter apply logic here
          setSideFilter(filters);
          console.log('Applied all properties filters:', filters)
          setIsFilterSidebarOpen(false)
        }}
      />

      <main className="relative flex-1 overflow-auto">
        <div
          className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4"
          data-coach-mark="all-properties-content"
        >
          <div className="max-w-7xl xl:max-w-none mx-auto space-y-6">
            




            {/* Rate Trends Table Section */}
            <Card className="card-elevated animate-fade-in mt-6">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-4">
                    <div>
                      <CardTitle className="text-xl font-semibold -ml-1.5">Property Analysis</CardTitle>
                    </div>
                    
                    {/* Property Selector Dropdown - next to heading */}
                    <DropdownMenu open={isPropertySelectorOpen} onOpenChange={setIsPropertySelectorOpen}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md min-w-0 max-w-[192px] hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                        >
                    <span className="truncate max-w-[120px] font-semibold">
                      {getPropertyDisplayText()}
                    </span>
                          <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-auto p-0 shadow-xl border-slate-200 dark:border-slate-700 z-[60]">
                        <div className="flex">
                          <div className="w-64 p-4">
                            <h4 className="font-semibold text-sm text-gray-700 mb-3">Properties</h4>
                            <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                              <div className="space-y-1 pr-4">
                                {/* All Properties Option */}
                                <label
                                  className="py-2 px-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm flex items-center cursor-pointer"
                                  onClick={() => handleSelectAllProperties()}
                                >
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-0 focus:outline-none mr-3 cursor-pointer"
                                    checked={selectedProperties.length === availableProperties.length}
                                    onChange={() => {}} // Prevent default behavior
                                    readOnly
                                  />
                                  <span 
                                    className="font-medium text-sm flex-1 cursor-pointer"
                                  >
                                    All Properties
                                  </span>
                                </label>
                                
                                {/* Individual Properties */}
                                {availableProperties.map((property) => (
                                  <label
                                    key={property}
                                    className="py-2 px-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm flex items-center cursor-pointer"
                                    onClick={() => handlePropertyToggle(property)}
                                  >
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-0 focus:outline-none mr-3 cursor-pointer"
                                      checked={selectedProperties.includes(property)}
                                      onChange={() => {}} // Prevent default behavior
                                      readOnly
                                    />
                                    <span 
                                      className="font-medium text-sm flex-1 cursor-pointer"
                                    >
                                      {property}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    
                    {/* Resolution Section - next to dropdown */}
                    <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
                      {screenWidth}px | {resolutionInfo.category} | {resolutionInfo.columns} cols
                    </div>
                  </div>
                  
                  {/* Helper Text - below heading and dropdown, left aligned */}
                  <p className="text-sm text-muted-foreground mt-2 text-left -ml-1.5">
                    Comprehensive analysis and management of properties across your portfolio
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  {/* Rate Legends */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-red-600 dark:text-red-400">Highest Rate</span>
                      </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-green-600 dark:text-green-400">Lowest Rate</span>
                    </div>
                  </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <AllPropertiesTable 
                  competitorStartIndex={0}
                  digitCount={4}
                  selectedProperties={selectedProperties.slice(0, displayedPropertiesCount)}
                />
                
                {/* Load More Properties Button */}
                {selectedProperties.length > displayedPropertiesCount && (
                  <div className="px-6 pb-6">
                    <div className="flex items-center justify-center">
                      {isLoadingMore ? (
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                          <span className="text-blue-600 dark:text-blue-400 font-medium">Loading properties...</span>
                        </div>
                      ) : (
                        <button
                          onClick={handleLoadMoreProperties}
                          className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200 text-sm bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md w-full"
                        >
                          <span>Load {Math.min(10, selectedProperties.length - displayedPropertiesCount)} more properties</span>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                          </div>
                        </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
        </>
      )}
    </div>
  )
}

export default function AllPropertiesPage() {
  return (
    <ComparisonProvider>
      <AllPropertiesPageContent />
    </ComparisonProvider>
  )
}
