"use client"
import React, { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, BarChart3, Calendar, Activity, DollarSign, Percent, Grid3X3, RefreshCw, FileText, Download, ChevronLeft, ChevronRight, Eye, ChevronDown, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RateTrendCalendar, MonthNavigation } from "@/components/navigator/rate-trend-calendar"
import { RateTrendsTable } from "@/components/navigator/rate-trends-table"
import { RTRateTrendsChart } from "@/components/navigator/rt-rate-trends-chart"
import { FilterBar } from "@/components/navigator/filter-bar"
import { RateTrendHeader } from "@/components/navigator/rate-trend-header"
import { FilterSidebar } from "@/components/filter-sidebar"
import { LightningRefreshModal } from "@/components/navigator/generate-report-modal"
import { Snackbar } from "@/components/ui/snackbar"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"
import { DateProvider } from "@/components/date-context"
import { ComparisonProvider } from "@/components/comparison-context"
import { format } from "date-fns"
import { getKPIData } from "@/lib/rate-trends-data"
// import { LocalStorageService } from "@/lib/localstorage" // Removed - using static data only
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useScreenSize } from "@/hooks/use-screen-size"

/**
 * Utility function to format dates consistently across server and client
 * Prevents hydration mismatches by using ISO format internally
 * 
 * @param date - Date object to format
 * @returns Consistently formatted date string
 */
const formatDateConsistently = (date: Date | null): string => {
  if (!date) {
    return 'N/A'
  }
  try {
    // Use ISO format to ensure consistency
    return format(date, 'dd/MM/yyyy')
  } catch (error) {
    console.error('🚨 Date formatting error:', error)
    // Fallback to basic formatting
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
}

/**
 * Generate KPI data based on date range with comprehensive logging
 * Implements intelligent calculation logic for different time periods
 * 
 * @param startDate - Start date of the analysis period
 * @param endDate - End date of the analysis period
 * @returns Object containing all KPI metrics and metadata
 */
// Use sample data from our comprehensive database
const generateKPIData = () => {
  // Using static KPI data for consistent performance - always 7 days
  return getKPIData(7)
}

/**
 * Rate Trend Page Component
 * 
 * Professional dashboard page for rate trend analysis with:
 * - Dynamic KPI calculations based on date selection
 * - Hydration-safe date formatting
 * - Comprehensive error handling and debugging
 * - Responsive design optimized for 1440px resolution
 * - Real-time data updates with loading states
 * 
 * @returns React component for rate trends analysis
 */
export default function RateTrendPage() {
  const [currentView, setCurrentView] = useLocalStorage<"calendar" | "chart" | "table">("rate-trend-view", "table")
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  // No isClient state needed for static data
  const [losGuest, setLosGuest] = useState<{ "Los": any[], "Guest": any[] }>({ "Los": [], "Guest": [] });
  const [dataLoading, setDataLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingCycle, setLoadingCycle] = useState(1)
  const [selectedValue, setSelectedValue] = useState("4,444 (4 digit)")
  const [selectedDigitCount, setSelectedDigitCount] = useState(4)
  
  // Screen size detection for responsive competitor count
  const screenSize = useScreenSize()
  
  // State for competitor scrolling (only for table view)
  const [competitorStartIndex, setCompetitorStartIndex] = useState(0)
  
  // Dynamic competitor count based on digitCount and screen resolution
  const getCompetitorsPerPage = () => {
    const { isSmall, isMedium, isLarge } = screenSize
    
    if (isSmall) {
      // Resolution from 1352px to 1500px
      return selectedDigitCount === 4 ? 4 : selectedDigitCount === 6 ? 3 : 2
    } else if (isMedium) {
      // Resolution from 1501px to 1800px
      return selectedDigitCount === 4 ? 5 : selectedDigitCount === 6 ? 4 : 4
    } else if (isLarge) {
      // Resolution above 1800px
      return selectedDigitCount === 4 ? 8 : selectedDigitCount === 6 ? 6 : 5
    } else {
      // Default fallback (for screens < 1352px)
      return selectedDigitCount === 4 ? 4 : selectedDigitCount === 6 ? 3 : 2
    }
  }
  
  const competitorsPerPage = getCompetitorsPerPage()
  
  // State for Lightning Refresh Modal
  const [isLightningRefreshModalOpen, setIsLightningRefreshModalOpen] = useState(false)
  
  // State for Snackbar
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarType, setSnackbarType] = useState<'info' | 'success'>('info')
  
  // State for Lightning Refresh progress
  const [isLightningRefreshInProgress, setIsLightningRefreshInProgress] = useState(false)
  
  // Navigation functions for competitor scrolling
  const nextCompetitors = () => {
    setCompetitorStartIndex(prev => {
      const totalCompetitors = 9 // We have 9 competitors total
      // Always move by 5 positions, even if it goes beyond total competitors
      return Math.min(prev + 5, totalCompetitors)
    })
  }
  
  const prevCompetitors = () => {
    setCompetitorStartIndex(prev => Math.max(0, prev - 5))
  }
  
  const canGoNext = () => {
    const totalCompetitors = 9
    // Allow going to next page if we can show at least 1 more competitor
    return competitorStartIndex + 5 < totalCompetitors
  }
  
  const canGoPrev = () => {
    return competitorStartIndex > 0
  }
  

  // Static date range - spanning multiple months to show month navigation
  const startDate = new Date()
  const endDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) // Next 45 days (spans multiple months)
  const isLoading = false // Always false for static data
  
  // Month navigation state
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0)

  // Month navigation functions
  const nextMonth = () => {
    setCurrentMonthIndex(prev => Math.min(prev + 1, availableMonths.length - 1))
  }

  const prevMonth = () => {
    setCurrentMonthIndex(prev => Math.max(prev - 1, 0))
  }

  // Calculate available months based on date range
  const calculateAvailableMonths = useMemo(() => {
    if (!startDate || !endDate) return []

    const months: { month: number; year: number; monthName: string }[] = []
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    // Add months between start and end dates
    const current = new Date(start.getFullYear(), start.getMonth(), 1)
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1)
    
    while (current <= endMonth) {
      months.push({
        month: current.getMonth(),
        year: current.getFullYear(),
        monthName: `${monthNames[current.getMonth()]} ${current.getFullYear()}`
      })
      current.setMonth(current.getMonth() + 1)
    }
    
    return months
  }, [startDate, endDate])

  // Use calculated values directly
  const availableMonths = calculateAvailableMonths
  const shouldShowMonthNavigation = availableMonths.length > 1

  // Handle lightning refresh
  const handleLightningRefresh = (data: { channels: string; checkInStartDate: string; compSet: string; guests: string; los: string }) => {
    const message = `⚡ Lightning Refresh ⚡ is in progress. Please wait while the data is being refreshed for ${data.channels}`
    setSnackbarMessage(message)
    setSnackbarType('info')
    setIsSnackbarOpen(true)
    setIsLightningRefreshInProgress(true)
    
    // Auto-close progress snackbar after 10 seconds
    setTimeout(() => {
      setIsSnackbarOpen(false)
    }, 10000)
    
    // Show success snackbar and reset button state after 10 seconds
    setTimeout(() => {
      setIsLightningRefreshInProgress(false)
      
      // Show success snackbar
      const successMessage = `Your 'Lightning Refresh' has been completed successfully for ${data.channels}, LOS ${data.los}, GUEST ${data.guests}, and the next 30 days`
      setSnackbarMessage(successMessage)
      setSnackbarType('success')
      setIsSnackbarOpen(true)
      
      // Auto-close success snackbar after 10 seconds
      setTimeout(() => {
        setIsSnackbarOpen(false)
      }, 10000)
    }, 10000)
  }
  
  // No client hydration needed for static data
  

  // No date range change handling needed for static data

  // Calculate static KPIs - no dependencies needed since dates are fixed
  const kpiData = generateKPIData()

  /**
   * Handle filter sidebar toggle with debugging
   */
  const handleMoreFiltersClick = () => {
    setIsFilterSidebarOpen(true)
    console.log("🔍 Opening filter sidebar")
  }

  // No loading state needed for static data

  return (
    <DateProvider>
    <ComparisonProvider>
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* Enhanced Filter Bar with Sticky Positioning */}
      <div className="sticky top-0 z-50 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md transition-all duration-200 min-h-[80px]">
        <FilterBar onMoreFiltersClick={handleMoreFiltersClick} />
      </div>
      




      {/* Main Content Area - Simplified */}
      <main className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8">
        {/* Dashboard Header with Enhanced Typography - Matching OTA Rankings */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-foreground">
                Rate Trends
              </h1>
              {/* Sample Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-3">
                    {selectedValue}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => {
                    setSelectedValue("4,444 (4 digit)")
                    setSelectedDigitCount(4)
                  }}>
                    4,444 (4 digit)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setSelectedValue("444,400 (6 digit)")
                    setSelectedDigitCount(6)
                  }}>
                    444,400 (6 digit)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setSelectedValue("44,225,588 (8 digit)")
                    setSelectedDigitCount(8)
                  }}>
                    44,225,588 (8 digit)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-muted-foreground">
              Track rate movements and competitive positioning across time periods
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Lightning Refresh and Report Buttons */}
            <TooltipProvider>
              <div className="flex items-center gap-2">
                {/* Lightning Refresh Button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 hover:bg-blue-500 hover:text-white hover:border-blue-500 group"
                        onClick={() => {
                          if (!isLightningRefreshInProgress) {
                            console.log('🔄 Lightning Refresh clicked');
                            setIsLightningRefreshModalOpen(true);
                          }
                        }}
                        disabled={isLightningRefreshInProgress}
                      >
                        <Zap 
                          className={`h-4 w-4 text-gray-600 group-hover:text-white ${isLightningRefreshInProgress ? 'animate-pulse' : ''}`} 
                          style={{marginRight: '2px'}} 
                        />
                        {isLightningRefreshInProgress ? 'Refreshing...' : 'Lightning Refresh'}
                      </Button>
                    </TooltipTrigger>
                    {isLightningRefreshInProgress && (
                      <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                        <p className="text-xs">Lightning refresh under progress</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>

                {/* On Demand Report Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 hover:bg-blue-500 hover:text-white hover:border-blue-500"
                  onClick={() => {
                    console.log('📊 On Demand Report clicked');
                    // Add report logic here
                  }}
                >
                  <FileText className="h-4 w-4" style={{marginRight: '2px'}} />
                  On Demand Report
                </Button>

                {/* Download Dropdown Button */}
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                      <p className="text-xs">Download Reports</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-auto min-w-fit">
                    <DropdownMenuItem
                      onClick={() => {
                        console.log('📥 Download Macro Report clicked');
                        // Add macro report download logic here
                      }}
                      className="whitespace-nowrap px-3 py-2"
                    >
                      Download Macro Report
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        console.log('📥 Download Lite Report clicked');
                        // Add lite report download logic here
                      }}
                      className="whitespace-nowrap px-3 py-2"
                    >
                      Download Lite Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TooltipProvider>

          </div>
        </div>

          {/* Main Rate Trend Content */}
          <div className="relative bg-white dark:bg-slate-900 shadow-xl border border-border/50 rounded-lg">
            {/* Table View Heading - Only visible when table view is active */}
            {currentView === "table" && (
              <div className="absolute left-4 lg:left-6 z-10 flex items-center" style={{ top: 'calc(1rem + 2px)' }}>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Detailed Analysis</h3>
              </div>
            )}
            
            {/* Calendar View Heading - Only visible when calendar view is active */}
            {currentView === "calendar" && (
              <div className="absolute left-4 lg:left-6 z-10 flex items-center" style={{ top: 'calc(1rem + 2px)' }}>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Rates Calendar
                                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-2">(in USD from 4 Sep to 10 Sep)</span>
                </h3>
              </div>
            )}

            {/* Month Navigation - Only visible when calendar view is active and multi-month range */}
            {currentView === "calendar" && shouldShowMonthNavigation && (
              <div className="absolute top-4 z-10 flex items-center justify-center" style={{ left: '50%', transform: 'translateX(-50%)' }}>
                <MonthNavigation
                  shouldShowMonthNavigation={shouldShowMonthNavigation}
                  availableMonths={availableMonths}
                  currentMonthIndex={currentMonthIndex}
                  onPrevMonth={prevMonth}
                  onNextMonth={nextMonth}
                />
              </div>
            )}
            
            
            {/* Rate Legends & Competitor Navigation - Only visible when table view is active */}
            {currentView === "table" && (
              <div className="absolute right-48 z-10 flex items-center gap-8" style={{ top: 'calc(1rem + 4px)' }}>
                {/* Rate Legends */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Highest Rate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Lowest Rate</span>
                  </div>
                </div>
                
                {/* Competitor Navigation */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Competitors {competitorStartIndex + 1}-{Math.min(competitorStartIndex + competitorsPerPage, 9)} of 9
                  </span>
                  <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded">
                    {screenSize.width}px ({screenSize.isSmall ? 'Small' : screenSize.isMedium ? 'Medium' : screenSize.isLarge ? 'Large' : 'Default'}) - {competitorsPerPage} cols
                  </span>
                  <button
                    onClick={prevCompetitors}
                    disabled={!canGoPrev()}
                    className={`p-1 rounded-md border ${
                      canGoPrev() 
                        ? 'border-gray-300 hover:bg-gray-50 text-gray-700' 
                        : 'border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextCompetitors}
                    disabled={!canGoNext()}
                    className={`p-1 rounded-md border ${
                      canGoNext() 
                        ? 'border-gray-300 hover:bg-gray-50 text-gray-700' 
                        : 'border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            

            {/* Rate Legends - Only visible when calendar view is active */}
            {currentView === "calendar" && (
              <div className="absolute top-4 z-10 flex items-center gap-2 hidden md:flex m-2" style={{ right: '11rem' }}>
                {/* Rate Legends */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Highest Rate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Lowest Rate</span>
                  </div>
                </div>
              </div>
            )}


            {/* View Toggle - Positioned consistently for all views */}
            <div className="absolute top-4 right-4 lg:right-6 z-10">
              <TooltipProvider>
                <div className="flex items-center border border-border rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={currentView === "calendar" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentView("calendar")}
                        className={cn(
                          "h-8 px-3 rounded-none border-r-0 border-b-0",
                          currentView === "calendar" ? "border-r-0 border-b-0" : "border-r-0 border-b-0 hover:border-r-0 hover:border-b-0"
                        )}
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                      <p className="text-xs">Calendar View</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={currentView === "chart" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentView("chart")}
                        className={cn(
                          "h-8 px-3 rounded-none border-l-0 border-r-0 border-t-0 border-b-0",
                          currentView === "chart" ? "border-l-0 border-r-0 border-t-0 border-b-0" : "border-l-0 border-r-0 border-t-0 border-b-0 hover:border-l-0 hover:border-r-0 hover:border-t-0 hover:border-b-0"
                        )}
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                      <p className="text-xs">Chart View</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={currentView === "table" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentView("table")}
                        className={cn(
                          "h-8 px-3 rounded-none border-l-0 border-t-0",
                          currentView === "table" ? "border-l-0 border-t-0" : "border-l-0 border-t-0 hover:border-l-0 hover:border-t-0"
                        )}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                      <p className="text-xs">Table View</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
            
            {/* Content based on current view */}
            {currentView === "table" ? (
              <div className="pt-16">
                <RateTrendsTable 
                  competitorStartIndex={competitorStartIndex}
                  digitCount={selectedDigitCount}
                />
              </div>
            ) : currentView === "chart" ? (
              <div className="pt-16">
                <RTRateTrendsChart key="rate-trends-chart" rateData={{}} digitCount={selectedDigitCount} />
              </div>
            ) : (
              <RateTrendCalendar 
                currentView={currentView} 
                highlightToday={true}
                showWeekNumbers={false}
                shouldShowMonthNavigation={shouldShowMonthNavigation}
                availableMonths={availableMonths}
                currentMonthIndex={currentMonthIndex}
                onPrevMonth={prevMonth}
                onNextMonth={nextMonth}
                digitCount={selectedDigitCount}
                startDate={startDate}
                endDate={endDate}
                onDateSelect={(date) => {
                  console.log('📅 Date selected:', date.toLocaleDateString())
                  // Add any additional date selection logic here
                }}
              />
            )}
          </div>
          
          {/* Blank spacer div with 250px height */}
          <div className="h-[250px]"></div>
      </main>

      {/* Filter Sidebar */}
      <FilterSidebar 
       losGuest={losGuest}
        isOpen={isFilterSidebarOpen} 
        onClose={() => setIsFilterSidebarOpen(false)} 
        onApply={(filters) => {
          // Handle filter apply logic here
          console.log('Applied filters:', filters)
          setIsFilterSidebarOpen(false)
        }}
      />
      {/* Lightning Refresh Modal */}
      <LightningRefreshModal 
        isOpen={isLightningRefreshModalOpen}
        onClose={() => setIsLightningRefreshModalOpen(false)}
        onRefresh={handleLightningRefresh}
      />
      
      {/* Snackbar */}
      <Snackbar
        isOpen={isSnackbarOpen}
        onClose={() => setIsSnackbarOpen(false)}
        message={snackbarMessage}
        type={snackbarType}
      />
    </div>
    </ComparisonProvider>
    </DateProvider>
  )
}
