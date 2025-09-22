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
import { useDateContext } from "@/components/date-context"
import { ComparisonProvider } from "@/components/comparison-context"
import { differenceInDays, format } from "date-fns"
import { rateTrendsAPI, getKPIData, type KPIData } from "@/lib/rate-trends-data"
import localStorageService from "@/lib/localstorage"
import { useLocalStorage } from "@/hooks/use-local-storage"

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
const generateKPIData = (startDate: Date, endDate: Date) => {
  console.log('📊 Using sample KPI data for range:', {
    start: formatDateConsistently(startDate),
    end: formatDateConsistently(endDate),
    timestamp: Date.now()
  })

  const daysDifference = differenceInDays(endDate, startDate) + 1
  console.log(`📅 Period analysis: ${daysDifference} days`)
  
  // Map to our standard comparison periods
  let comparisonPeriod = 7 // Default to weekly
  if (daysDifference <= 7) {
    comparisonPeriod = 7
  } else if (daysDifference <= 30) {
    comparisonPeriod = 30  
  } else {
    comparisonPeriod = 91
  }
  
  console.log('✅ Using sample data with period:', comparisonPeriod)
  return getKPIData(comparisonPeriod)
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
  const [currentView, setCurrentView] = useLocalStorage<"calendar" | "chart" | "table">("rate-trend-view", "calendar")
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [losGuest, setLosGuest] = useState<{ "Los": any[], "Guest": any[] }>({ "Los": [], "Guest": [] });
  const [loadedKpiData, setLoadedKpiData] = useState<KPIData | null>(null)
  const [dataLoading, setDataLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingCycle, setLoadingCycle] = useState(1)
  
  // State for competitor scrolling (only for table view)
  const [competitorStartIndex, setCompetitorStartIndex] = useState(0)
  const [competitorsPerPage, setCompetitorsPerPage] = useState(5) // Responsive competitor count
  
  // Calculate responsive competitor count based on screen size
  useEffect(() => {
    const calculateCompetitorsPerPage = () => {
      const screenWidth = window.innerWidth
      
      // Always show 5 competitors initially for table view
      return 5
    }
    
    const updateCompetitorCount = () => {
      setCompetitorsPerPage(calculateCompetitorsPerPage())
    }
    
    // Set initial value
    updateCompetitorCount()
    
    // Listen for resize events
    window.addEventListener('resize', updateCompetitorCount)
    
    return () => {
      window.removeEventListener('resize', updateCompetitorCount)
    }
  }, [])
  
  // State for Lightning Refresh Modal
  const [isLightningRefreshModalOpen, setIsLightningRefreshModalOpen] = useState(false)
  
  // State for Snackbar
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarType, setSnackbarType] = useState<'info' | 'success'>('info')
  
  // State for Lightning Refresh progress
  const [isLightningRefreshInProgress, setIsLightningRefreshInProgress] = useState(false)
  
  // Month navigation state
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0)
  const [availableMonths, setAvailableMonths] = useState<{ month: number; year: number; monthName: string }[]>([])
  const [shouldShowMonthNavigation, setShouldShowMonthNavigation] = useState(false)
  
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
  
  // Reset competitor start index when competitors per page changes
  useEffect(() => {
    setCompetitorStartIndex(0)
  }, [competitorsPerPage])

  // Get date context for dynamic KPIs
  const { startDate, endDate, isLoading } = useDateContext()

  // Month navigation functions
  const nextMonth = () => {
    setCurrentMonthIndex(prev => Math.min(prev + 1, availableMonths.length - 1))
  }

  const prevMonth = () => {
    setCurrentMonthIndex(prev => Math.max(prev - 1, 0))
  }

  // Calculate available months for multi-month date ranges
  const calculateAvailableMonths = useMemo(() => {
    if (!startDate || !endDate) return []
    
    const months: { month: number; year: number; monthName: string }[] = []
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
    
    while (current <= end) {
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ]
      months.push({
        month: current.getMonth(),
        year: current.getFullYear(),
        monthName: monthNames[current.getMonth()] + ' ' + current.getFullYear()
      })
      current.setMonth(current.getMonth() + 1)
    }
    
    return months
  }, [startDate, endDate])

  // Update month navigation when date range changes
  useEffect(() => {
    const months = calculateAvailableMonths
    setAvailableMonths(months)
    setShouldShowMonthNavigation(months.length > 1)
    setCurrentMonthIndex(0) // Reset to first month when date range changes
  }, [calculateAvailableMonths])

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
  
  /**
   * Ensure client-side hydration is complete before rendering date-dependent content
   * Prevents hydration mismatches by deferring client-specific rendering
   */
  useEffect(() => {
    // Set client to true immediately to prevent loading state issues
    const timer = setTimeout(() => {
      setIsClient(true)
      console.log('🔄 Client hydration completed - React imported')
    }, 0)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Load KPI data when component mounts
  useEffect(() => {
    const loadKPIData = async () => {
      if (!isClient) return
      
      setIsPageLoading(true)
      setDataLoading(true)
      setLoadingProgress(0)
      
      // Progress interval
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          const increment = Math.floor(Math.random() * 9) + 3; // 3-11% increment
          const newProgress = prev + increment;

          if (newProgress >= 100) {
            setLoadingCycle(prevCycle => prevCycle + 1);
            return 0;
          }

          return newProgress;
        });
      }, 80);
      
      try {
        // Default to 7 days (Last Week) for now
        const data = await rateTrendsAPI.getKPIData(7)
        setLoadedKpiData(data)
        console.log('📊 KPI data loaded successfully')
      } catch (error) {
        console.error('Error loading KPI data:', error)
        // Fallback to static data
        setLoadedKpiData(getKPIData(7))
      } finally {
        clearInterval(progressInterval);
        setLoadingProgress(100); // finish instantly
        setTimeout(() => {
          setIsPageLoading(false);
          setDataLoading(false);
          setLoadingProgress(0); // reset for next load
        }, 300); // brief delay so user sees 100%
      }
    }

    loadKPIData()
  }, [isClient])

  // Trigger loading when date range changes
  useEffect(() => {
    if (!isClient || !startDate || !endDate) return
    
    setIsPageLoading(true)
    setLoadingProgress(0)
    
    // Progress interval
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        const increment = Math.floor(Math.random() * 9) + 3; // 3-11% increment
        const newProgress = prev + increment;

        if (newProgress >= 100) {
          setLoadingCycle(prevCycle => prevCycle + 1);
          return 0;
        }

        return newProgress;
      });
    }, 80);
    
    // Simulate data loading delay
    const loadingTimeout = setTimeout(() => {
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setTimeout(() => {
        setIsPageLoading(false);
        setLoadingProgress(0);
      }, 300);
    }, 1500); // 1.5 second loading simulation
    
    return () => {
      clearInterval(progressInterval);
      clearTimeout(loadingTimeout);
    }
  }, [startDate, endDate, isClient])

  // Calculate dynamic KPIs based on selected date range with fallback
  const kpiData = useMemo(() => {
    if (loadedKpiData) {
      return loadedKpiData
    }
    
    if (!isClient) {
      console.log('⏳ Waiting for client hydration...')
      return getKPIData(7) // Return default data during hydration
    }
    // Ensure dates are not null before calling generateKPIData
    if (!startDate || !endDate) {
      console.log('⏳ Using default KPI data while dates initialize...')
      return getKPIData(7) // Return default data while dates load
    }
    return generateKPIData(startDate, endDate)
  }, [loadedKpiData, startDate, endDate, isClient])

  /**
   * Handle filter sidebar toggle with debugging
   */
  const handleMoreFiltersClick = () => {
    setIsFilterSidebarOpen(true)
    console.log("🔍 Opening filter sidebar")
  }

  // Show loading state during initial hydration or data loading
  if (!isClient || isPageLoading) {
    return (
      <ComparisonProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
          <GlobalProgressBar />
          <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8 xl:py-10">
            <div className="max-w-7xl xl:max-w-none mx-auto">
              <LoadingSkeleton type="rate-trend" showCycleCounter={true} />
            </div>
          </div>
        </div>
      </ComparisonProvider>
    )
  }

  return (
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
            <h1 className="text-2xl font-bold text-foreground">
              Rate Trends
            </h1>
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
                                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-2">(4 Sep - 10 Sep)</span>
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
                  competitorsPerPage={competitorsPerPage}
                />
              </div>
            ) : currentView === "chart" ? (
              <div className="pt-16">
                <RTRateTrendsChart key="rate-trends-chart" rateData={{}} />
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
  )
}
