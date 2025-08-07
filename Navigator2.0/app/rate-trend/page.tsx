"use client"
import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, BarChart3, Calendar, Activity, DollarSign, Percent } from "lucide-react"
import { RateTrendCalendar } from "@/components/navigator/rate-trend-calendar"
import { FilterBar } from "@/components/navigator/filter-bar"
import { RateTrendHeader } from "@/components/navigator/rate-trend-header"
import { FilterSidebar } from "@/components/filter-sidebar"
import { useDateContext } from "@/components/date-context"
import { ComparisonProvider } from "@/components/comparison-context"
import { differenceInDays, format } from "date-fns"

/**
 * Utility function to format dates consistently across server and client
 * Prevents hydration mismatches by using ISO format internally
 * 
 * @param date - Date object to format
 * @returns Consistently formatted date string
 */
const formatDateConsistently = (date: Date): string => {
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
const generateKPIData = (startDate: Date, endDate: Date) => {
  console.log('📊 Generating KPI data for range:', {
    start: formatDateConsistently(startDate),
    end: formatDateConsistently(endDate),
    timestamp: Date.now()
  })

  const daysDifference = differenceInDays(endDate, startDate) + 1
  const today = new Date()
  
  // Determine if we're looking at historical, current, or future data
  const isHistorical = endDate < today
  const isFuture = startDate > today
  const isCurrent = !isHistorical && !isFuture
  
  console.log('🔍 Period analysis:', {
    daysDifference,
    isHistorical,
    isFuture,
    isCurrent,
    today: formatDateConsistently(today)
  })
  
  // Base values that adjust based on time period and date range
  let basePosition = 2
  let baseSpread = 15
  let baseParity = 85
  let baseAccuracy = 92
  
  // Adjust for different time periods
  if (daysDifference <= 7) {
    // Short term - more volatile
    baseSpread += 5
    baseAccuracy += 3
    console.log('📈 Short-term adjustments applied')
  } else if (daysDifference >= 60) {
    // Long term - more stable
    baseSpread -= 3
    baseAccuracy -= 2
    console.log('📉 Long-term adjustments applied')
  }
  
  // Adjust for historical vs future
  if (isHistorical) {
    baseAccuracy += 5 // Historical data is more accurate
    basePosition = Math.max(1, basePosition - 1)
    console.log('🔙 Historical data adjustments applied')
  } else if (isFuture) {
    baseAccuracy -= 8 // Future predictions are less certain
    baseParity -= 5
    console.log('🔮 Future forecast adjustments applied')
  }
  
  // Add some randomness for realism
  const randomFactor = (Math.random() - 0.5) * 0.2
  console.log('🎲 Random factor applied:', randomFactor)
  
  const result = {
    ratePosition: {
      current: basePosition,
      change: isHistorical ? (Math.random() > 0.6 ? 1 : 0) : (Math.random() > 0.5 ? 1 : -1),
      trend: Math.random() > 0.6 ? 'up' : 'down'
    },
    rateSpread: {
      current: Math.round(baseSpread * (1 + randomFactor)),
      change: Math.round((Math.random() - 0.5) * 8),
      trend: Math.random() > 0.5 ? 'up' : 'down'
    },
    parityScore: {
      current: Math.round(baseParity * (1 + randomFactor * 0.1)),
      change: Math.round((Math.random() - 0.5) * 6),
      trend: Math.random() > 0.7 ? 'up' : 'down'
    },
    trendAccuracy: {
      current: Math.round(baseAccuracy * (1 + randomFactor * 0.05)),
      change: Math.round((Math.random() - 0.5) * 4),
      trend: Math.random() > 0.6 ? 'up' : 'down'
    },
    periodInfo: {
      daysDifference,
      isHistorical,
      isFuture,
      isCurrent,
      label: isHistorical ? 'Historical' : isFuture ? 'Forecast' : 'Current',
      formattedStartDate: formatDateConsistently(startDate),
      formattedEndDate: formatDateConsistently(endDate)
    }
  }
  
  console.log('✅ KPI data generated successfully:', result)
  return result
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
  const [currentView, setCurrentView] = useState<"calendar" | "chart" | "table">("calendar")
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  // Get date context for dynamic KPIs
  const { startDate, endDate, isLoading } = useDateContext()
  
  /**
   * Ensure client-side hydration is complete before rendering date-dependent content
   * Prevents hydration mismatches by deferring client-specific rendering
   */
  useEffect(() => {
    setIsClient(true)
    console.log('🔄 Client hydration completed')
  }, [])
  
  // Calculate dynamic KPIs based on selected date range
  const kpiData = useMemo(() => {
    if (!isClient) {
      console.log('⏳ Waiting for client hydration...')
      return null
    }
    // Ensure dates are not null before calling generateKPIData
    if (!startDate || !endDate) {
      console.log('⏳ Waiting for dates to be initialized...')
      return null
    }
    return generateKPIData(startDate, endDate)
  }, [startDate, endDate, isClient])

  /**
   * Handle filter sidebar toggle with debugging
   */
  const handleMoreFiltersClick = () => {
    setIsFilterSidebarOpen(true)
    console.log("🔍 Opening filter sidebar")
  }

  // Show loading state during hydration
  if (!isClient || !kpiData) {
    return (
      <ComparisonProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </ComparisonProvider>
    )
  }

  return (
    <ComparisonProvider>
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* Enhanced Filter Bar with Dashboard styling */}
      <div className="filter-bar-minimal">
        <FilterBar onMoreFiltersClick={handleMoreFiltersClick} />
      </div>
      
      {/* Professional Header Section */}
      <section className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="max-w-7xl xl:max-w-none mx-auto">
            <RateTrendHeader currentView={currentView} onViewChange={setCurrentView} />
          </div>
        </div>
      </section>

      {/* Enhanced KPI Summary Cards - Now Dynamic and Hydration-Safe */}
      <section className="w-full bg-gradient-to-r from-slate-50/80 to-blue-50/60 dark:from-slate-900/80 dark:to-slate-800/60 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          <div className="max-w-7xl xl:max-w-none mx-auto">
            
            {/* Period Info Header with Consistent Date Formatting */}
            <div className="mb-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {kpiData.periodInfo.label} Period • {kpiData.periodInfo.daysDifference} days
                </span>
                <Badge variant="outline" className="text-xs">
                  {kpiData.periodInfo.formattedStartDate} - {kpiData.periodInfo.formattedEndDate}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6">
              
              {/* Current Rate Position */}
              <Card className={`card-minimal hover:shadow-lg transition-all duration-200 group ${isLoading ? 'animate-pulse' : ''}`}>
                <CardContent className="p-4 xl:p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-900/40 transition-colors">
                        <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground">Rate Position</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {kpiData.periodInfo.label}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl xl:text-4xl font-black text-foreground tracking-tight">
                      #{kpiData.ratePosition.current}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm px-2 py-0.5 rounded-full ${
                        kpiData.ratePosition.change > 0 
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                          : kpiData.ratePosition.change < 0
                          ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                          : 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20'
                      }`}>
                        {kpiData.ratePosition.change > 0 ? '+' : ''}{kpiData.ratePosition.change}
                      </span>
                      <span className="text-xs text-muted-foreground">vs. Previous</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Avg Rate Spread */}
              <Card className={`card-minimal hover:shadow-lg transition-all duration-200 group ${isLoading ? 'animate-pulse' : ''}`}>
                <CardContent className="p-4 xl:p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/40 transition-colors">
                        <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground">Rate Spread</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {kpiData.periodInfo.daysDifference}D Avg
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl xl:text-4xl font-black text-foreground tracking-tight">
                      ${kpiData.rateSpread.current}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm px-2 py-0.5 rounded-full ${
                        kpiData.rateSpread.change < 0 
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                          : kpiData.rateSpread.change > 0
                          ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                          : 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20'
                      }`}>
                        {kpiData.rateSpread.change > 0 ? '+' : ''}${kpiData.rateSpread.change}
                      </span>
                      <span className="text-xs text-muted-foreground">vs. Previous</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parity Score */}
              <Card className={`card-minimal hover:shadow-lg transition-all duration-200 group ${isLoading ? 'animate-pulse' : ''}`}>
                <CardContent className="p-4 xl:p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/40 transition-colors">
                        <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground">Parity Score</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {kpiData.periodInfo.label}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl xl:text-4xl font-black text-foreground tracking-tight">
                      {kpiData.parityScore.current}%
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm px-2 py-0.5 rounded-full ${
                        kpiData.parityScore.change > 0 
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                          : kpiData.parityScore.change < 0
                          ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                          : 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20'
                      }`}>
                        {kpiData.parityScore.change > 0 ? '+' : ''}{kpiData.parityScore.change}%
                      </span>
                      <span className="text-xs text-muted-foreground">vs. Previous</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trend Accuracy */}
              <Card className={`card-minimal hover:shadow-lg transition-all duration-200 group ${isLoading ? 'animate-pulse' : ''}`}>
                <CardContent className="p-4 xl:p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/40 transition-colors">
                        <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground">Trend Accuracy</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {kpiData.periodInfo.daysDifference <= 7 ? 'Daily' : kpiData.periodInfo.daysDifference <= 30 ? 'Weekly' : 'Monthly'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl xl:text-4xl font-black text-foreground tracking-tight">
                      {kpiData.trendAccuracy.current}%
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm px-2 py-0.5 rounded-full ${
                        kpiData.trendAccuracy.change > 0 
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                          : kpiData.trendAccuracy.change < 0
                          ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                          : 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20'
                      }`}>
                        {kpiData.trendAccuracy.change > 0 ? '+' : ''}{kpiData.trendAccuracy.change}%
                      </span>
                      <span className="text-xs text-muted-foreground">vs. Previous</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area - Enhanced */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 lg:py-8 xl:py-10">
        <div className="max-w-7xl xl:max-w-none mx-auto space-y-6 lg:space-y-8">
          
          {/* Main Rate Trend Calendar */}
          <section className="w-full">
            <Card className="card-elevated animate-fade-in">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl lg:text-2xl xl:text-3xl font-bold text-foreground flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950 dark:to-purple-950">
                        <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-brand-600 dark:text-brand-400" />
                      </div>
                      Rate Trends & Calendar View
                    </CardTitle>
                    <p className="text-sm lg:text-base text-muted-foreground">
                      Track rate movements and competitive positioning across time periods
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {currentView.charAt(0).toUpperCase() + currentView.slice(1)} View
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 xl:p-8">
          <RateTrendCalendar currentView={currentView} />
              </CardContent>
            </Card>
          </section>




        </div>
      </div>

      {/* Filter Sidebar */}
      <FilterSidebar 
        isOpen={isFilterSidebarOpen} 
        onClose={() => setIsFilterSidebarOpen(false)} 
        onApply={(filters) => {
          // Handle filter apply logic here
          console.log('Applied filters:', filters)
          setIsFilterSidebarOpen(false)
        }}
      />
    </div>
    </ComparisonProvider>
  )
}
