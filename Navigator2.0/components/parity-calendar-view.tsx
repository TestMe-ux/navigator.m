"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { useParityDateContext, useParityChannelContext } from "@/components/parity-filter-bar"
import { useSelectedProperty } from "@/hooks/use-local-storage"
// Note: Keeping imports for potential future use, but currently using static data only
import { GetParityData } from "@/lib/parity"
import { conevrtDateforApi } from "@/lib/utils"
import { format, addDays, eachDayOfInterval } from "date-fns"

// Types for parity calendar data
interface ParityDayData {
  date: string
  dateFormatted: string
  winCount: number
  meetCount: number
  lossCount: number
  parityScore: number
  result: 'W' | 'M' | 'L' // Overall result for the day
  violations: number
}

interface ChannelParityData {
  channelId: number
  channelName: string
  channelIcon?: string
  isBrand?: boolean
  overallParityScore: number
  winPercent: number
  meetPercent: number
  lossPercent: number
  dailyData: ParityDayData[]
  trend: 'up' | 'down' | 'stable'
  trendValue: number
}

interface ParityCalendarViewProps {
  className?: string
}

export function ParityCalendarView({ className }: ParityCalendarViewProps) {
  // Benchmark channel name with truncation logic
  const BENCHMARK_CHANNEL_NAME = "MakeMyTrip"
  const getBenchmarkDisplayName = () => {
    return BENCHMARK_CHANNEL_NAME.length > 12 ? `${BENCHMARK_CHANNEL_NAME.substring(0, 9)}...` : BENCHMARK_CHANNEL_NAME
  }
  
  // Currency settings for Indonesian Rupiah
  const BASE_RATE_IDR = 12398873 // Base rate in Indonesian Rupiah (8 digits)
  const CURRENCY_SYMBOL = "Rp"
  
  // Format currency with Indonesian Rupiah (using commas for thousands separator)
  const formatIDR = (amount: number) => {
    // Use custom formatting to ensure commas are used as thousand separators
    const formattedAmount = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return `${CURRENCY_SYMBOL} ${formattedAmount}`
  }


  
  // Calculate optimal number of rows based on screen space and data
  const calculateOptimalRows = () => {
    const dateCount = dateRange.length
    const availableViewportHeight = window.innerHeight - 300 // Reserve space for header/filters
    const estimatedRowHeight = 80 // Approximate height per row including content
    
    // Calculate how many rows can fit in viewport
    const maxRowsBySpace = Math.floor(availableViewportHeight / estimatedRowHeight)
    
    // Consider data complexity - IDR values are longer, need more space
    const maxRowsByData = dateCount <= 14 ? 12 : dateCount <= 30 ? 8 : 6
    
    // Return the minimum to ensure good UX
    return Math.min(Math.max(maxRowsBySpace, 6), maxRowsByData, parityData.length)
  }
  
  const { startDate, endDate } = useParityDateContext()
  const { selectedChannels, channelFilter } = useParityChannelContext()
  const [selectedProperty] = useSelectedProperty()
  const [parityData, setParityData] = useState<ChannelParityData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [highlightThreshold, setHighlightThreshold] = useState("30")
  const [selectedHotel, setSelectedHotel] = useState("Hotel 2") // Default as per requirement
  const [showDays, setShowDays] = useState(14)
  const [currentPage, setCurrentPage] = useState(0)
  const [optimalRowCount, setOptimalRowCount] = useState(10)

  // Calculate total days and determine pagination based on rate length and total days
  const totalDays = startDate && endDate ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0
  
  // Determine optimal columns based on rate length to optimize table display
  const getOptimalColumns = () => {
    const sampleRate = formatIDR(BASE_RATE_IDR) // Example: "Rp 12,398,873" (13 chars)
    const rateLength = sampleRate.length
    
    // Dynamic column count based on rate length for optimal cell width
    if (rateLength > 12) {
      // Long rates (like IDR: "Rp 12,398,873") - show 8 columns for better readability
      return 8
    } else if (rateLength > 8) {
      // Medium rates (like USD: "$1,234.56") - show 10 columns
      return 10
    } else {
      // Short rates (like "€123" or "¥456") - show full 14 columns
      return 14
    }
  }
  
  const optimalColumns = getOptimalColumns()
  const needsPagination = totalDays > optimalColumns
  const isSticky = needsPagination

  // Generate date range for display based on total days and pagination
  const generateDateRange = () => {
    if (!startDate || !endDate) return []
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    const allDates = eachDayOfInterval({ start, end })
    
    // If total days <= optimal columns, show all dates
    if (totalDays <= optimalColumns) {
      return allDates
    }
    
    // For more days, paginate in chunks of optimal columns
    const startIndex = currentPage * optimalColumns
    const endIndex = Math.min(startIndex + optimalColumns, allDates.length)
    
    return allDates.slice(startIndex, endIndex)
  }

  const dateRange = generateDateRange()



  // Sample data for 10 channels (when no API data is available)
  const generateSampleData = (): ChannelParityData[] => {
    const sampleChannels = [
      { name: "MakeMYTrip.comdummy text", isHotel: true, winPercent: 45, meetPercent: 35, lossPercent: 20, parityScore: 65 },
      { name: "Trivago", winPercent: 50, meetPercent: 25, lossPercent: 25, parityScore: 70 },
      { name: "Booking.com Super Long Channel Name for Testing Truncation", winPercent: 55, meetPercent: 10, lossPercent: 35, parityScore: 60 },
      { name: "Google Hotels Extended Name Test", winPercent: 45, meetPercent: 35, lossPercent: 20, parityScore: 65 },
      { name: "Expedia", winPercent: 55, meetPercent: 10, lossPercent: 35, parityScore: 60 },
      { name: "Trip Advisor", winPercent: 50, meetPercent: 25, lossPercent: 25, parityScore: 70 },
      { name: "Agoda", winPercent: 40, meetPercent: 30, lossPercent: 30, parityScore: 55 },
      { name: "Hotels.com", winPercent: 35, meetPercent: 25, lossPercent: 40, parityScore: 50 },
      { name: "Priceline", winPercent: 30, meetPercent: 35, lossPercent: 35, parityScore: 45 },
      { name: "Kayak", winPercent: 25, meetPercent: 40, lossPercent: 35, parityScore: 40 }
    ]

    return sampleChannels.map((channel, index) => {
      // Generate sample daily data for each channel
      const dailyData: ParityDayData[] = dateRange.map((date, dayIndex) => {
        const patterns = [
          // Hotel 2 pattern
          ['67%', '25%', '45%', '29%', '55%', '45%', '26%', '26%', '55%', '26%', '77%', '72%', '67%', '87%', '55%'],
          // Booking.com pattern
          ['M', 'L', 'M', 'L', 'M', 'M', 'L', 'L', 'M', 'L', 'W', 'W', 'M', 'W', 'M'],
          // Trivago pattern  
          ['M', 'L', 'M', 'L', 'M', 'M', 'L', 'L', 'M', 'L', 'W', 'W', 'M', 'W', 'M'],
          // Google Hotels pattern
          ['M', 'L', 'M', 'L', 'M', 'M', 'L', 'L', 'M', 'L', 'W', 'W', 'M', 'W', 'M'],
          // Expedia pattern
          ['L', 'W', 'M', 'W', 'W', 'L', 'M', 'L', 'L', 'M', 'M', 'L', 'M', 'L', 'M'],
          // Trip Advisor pattern
          ['M', 'W', 'M', 'W', 'W', 'L', 'M', 'L', 'L', 'M', 'M', 'L', 'M', 'L', 'M'],
          // Agoda pattern
          ['L', 'M', 'W', 'L', 'M', 'W', 'L', 'M', 'W', 'L', 'M', 'W', 'L', 'M', 'W'],
          // Hotels.com pattern
          ['M', 'L', 'L', 'M', 'L', 'M', 'L', 'L', 'M', 'M', 'L', 'M', 'L', 'W', 'M'],
          // Priceline pattern
          ['L', 'L', 'M', 'L', 'M', 'L', 'L', 'M', 'L', 'M', 'L', 'L', 'M', 'M', 'L'],
          // Kayak pattern
          ['M', 'M', 'L', 'M', 'L', 'M', 'M', 'L', 'M', 'L', 'M', 'M', 'L', 'L', 'M']
        ]

        let result: 'W' | 'M' | 'L' = 'M'
        let parityScore = 50
        
        if (index === 0) {
          // MakeMyTrip - show percentage scores
          const scores = [67, 25, 45, 29, 55, 45, 26, 26, 55, 26, 77, 72, 67, 87, 55]
          parityScore = scores[dayIndex % scores.length]
          result = parityScore >= 50 ? 'W' : parityScore >= 30 ? 'M' : 'L'
        } else {
          // Other channels - use WLM patterns
          const pattern = patterns[index % patterns.length]
          result = pattern[dayIndex % pattern.length] as 'W' | 'M' | 'L'
          
          // Convert result to score (deterministic for SSR)
          const scoreVariation = (dayIndex + index) % 20; // Deterministic variation
          switch (result) {
            case 'W': parityScore = 70 + scoreVariation; break
            case 'M': parityScore = 40 + scoreVariation; break
            case 'L': parityScore = 15 + scoreVariation; break
          }
        }

        return {
          date: format(date, 'yyyy-MM-dd'),
          dateFormatted: format(date, 'dd MMM'),
          winCount: result === 'W' ? 1 : 0,
          meetCount: result === 'M' ? 1 : 0,
          lossCount: result === 'L' ? 1 : 0,
          parityScore,
          result,
          violations: (dayIndex + index) % 5 === 0 ? 1 : 0 // Deterministic violations
        }
      })

      return {
        channelId: index + 1,
        channelName: channel.name,
        channelIcon: undefined,
        isBrand: channel.isHotel || false,
        overallParityScore: channel.parityScore,
        winPercent: channel.winPercent,
        meetPercent: channel.meetPercent,
        lossPercent: channel.lossPercent,
        dailyData,
        trend: 'stable' as const,
        trendValue: 0
      }
    })
  }

  // Process API data into calendar format
  const processParityDataForCalendar = (apiData: any): ChannelParityData[] => {
    const channels = apiData?.otaViolationChannelRate?.violationChannelRatesCollection || []
    
    // If no API data, return sample data
    if (channels.length === 0) {
      return generateSampleData()
    }
    
    return channels.map((channel: any) => {
      const dailyRates = channel.checkInDateWiseRates || []
      
      // Process daily data
      const dailyData: ParityDayData[] = dateRange.map(date => {
        const dateStr = conevrtDateforApi(date.toString())
        const dayData = dailyRates.find((rate: any) => rate.checkInDate === dateStr)
        
        if (dayData) {
          const winCount = dayData.winCount || 0
          const meetCount = dayData.meetCount || 0
          const lossCount = dayData.lossCount || 0
          const total = winCount + meetCount + lossCount
          
          const parityScore = total > 0 ? Math.round(((winCount + meetCount) / total) * 100) : 0
          
          // Determine overall result
          let result: 'W' | 'M' | 'L' = 'M'
          if (winCount > meetCount && winCount > lossCount) result = 'W'
          else if (lossCount > winCount && lossCount > meetCount) result = 'L'
          
          // Add room types and inclusions that vary by date
          const roomTypes = [
            "Apartment",
            "Bungalow", 
            "Deluxe Room",
            "Standard Room",
            "Studio",
            "Suite",
            "Superior Room"
          ]
          
          const inclusions = [
            "Full Board",
            "Breakfast", 
            "Room Only",
            "Free Wifi"
          ]
          
          // Use dayIndex and channel index to determine room type and inclusion for variety
          const roomType = roomTypes[(dayIndex + index) % roomTypes.length]
          const inclusion = inclusions[(dayIndex + index) % inclusions.length]
          
          return {
            date: dateStr,
            dateFormatted: format(date, 'dd MMM'),
            winCount,
            meetCount,
            lossCount,
            parityScore,
            result,
            violations: (dayData.rateViolation ? 1 : 0) + (dayData.availViolation ? 1 : 0),
            roomType,
            inclusion,
          }
        }
        
        // Default data if no API data
        const roomTypes = ["Apartment", "Bungalow", "Deluxe Room", "Standard Room", "Studio", "Suite", "Superior Room"]
        const inclusions = ["Full Board", "Breakfast", "Room Only", "Free Wifi"]
        const roomType = roomTypes[(dayIndex + index) % roomTypes.length]
        const inclusion = inclusions[(dayIndex + index) % inclusions.length]
        
        return {
          date: dateStr,
          dateFormatted: format(date, 'dd MMM'),
          winCount: 0,
          meetCount: 0,
          lossCount: 0,
          parityScore: 0,
          result: 'M' as const,
          violations: 0,
          roomType,
          inclusion,
        }
      })

      // Calculate overall metrics
      const totalWin = dailyData.reduce((sum, day) => sum + day.winCount, 0)
      const totalMeet = dailyData.reduce((sum, day) => sum + day.meetCount, 0)
      const totalLoss = dailyData.reduce((sum, day) => sum + day.lossCount, 0)
      const total = totalWin + totalMeet + totalLoss

      const overallParityScore = total > 0 ? Math.round(((totalWin + totalMeet) / total) * 100) : 0
      const winPercent = total > 0 ? Math.round((totalWin / total) * 100) : 0
      const meetPercent = total > 0 ? Math.round((totalMeet / total) * 100) : 0
      const lossPercent = total > 0 ? Math.round((totalLoss / total) * 100) : 0

      return {
        channelId: channel.channelId || 0,
        channelName: channel.channelName || 'Unknown',
        channelIcon: channel.channelIcon,
        isBrand: channel.isBrand,
        overallParityScore,
        winPercent,
        meetPercent,
        lossPercent,
        dailyData,
        trend: 'stable', // Could be calculated based on historical data
        trendValue: 0
      }
    })
  }

  // Load static parity data when dependencies change
  useEffect(() => {
    console.log('🔄 Loading static parity calendar data')
    setIsLoading(true)
    
    // Always use static sample data
    const staticData = generateSampleData()
    setParityData(staticData)
    
    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      setIsLoading(false)
      console.log('✅ Static parity calendar data loaded successfully')
    }, 500)

    // Cleanup timer
    return () => clearTimeout(timer)
  }, [startDate, endDate, channelFilter.channelId])
  
  // Reset pagination when date range changes
  useEffect(() => {
    setCurrentPage(0)
  }, [startDate, endDate])
  
  // Update optimal row count when data or viewport changes
  useEffect(() => {
    const updateOptimalRows = () => {
      if (typeof window !== 'undefined' && parityData.length > 0) {
        const optimal = calculateOptimalRows()
        setOptimalRowCount(optimal)
      }
    }
    
    updateOptimalRows()
    
    // Add resize listener for responsive behavior
    window.addEventListener('resize', updateOptimalRows)
    return () => window.removeEventListener('resize', updateOptimalRows)
  }, [parityData, dateRange.length])

  // Get overall competitive status for a specific date across all channels
  const getOverallStatusForDate = (dateString: string) => {
    const allResults: string[] = []
    
    // Check all channels for this date (skip channel 0 which is our own)
    if (parityData && Array.isArray(parityData)) {
      parityData.forEach((channel, index) => {
        if (index === 0) return // Skip first channel (our own channel)
        
        // Add null check for channel.dailyData
        if (channel && channel.dailyData && Array.isArray(channel.dailyData)) {
          const dayData = channel.dailyData.find(day => day && day.date === dateString)
          if (dayData?.result) {
            allResults.push(dayData.result)
          }
        }
      })
    }
    
    // Determine overall status based on priority rules
    if (allResults.includes('L')) {
      return 'L' // Loss state - if any channel has Loss
    } else if (allResults.includes('W') && !allResults.includes('L')) {
      return 'W' // Win state - if there's Win but no Loss
    } else if (allResults.every(result => result === 'M')) {
      return 'M' // Meet state - if all channels are Meet
    } else {
      return 'M' // Default to Meet if mixed W/M results
    }
  }

  // Get color class based on competitive status (for date cell backgrounds)
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'L': return 'bg-red-100 text-red-800 border-red-300' // Loss - Red
      case 'W': return 'bg-orange-100 text-orange-800 border-orange-300' // Win - Orange  
      case 'M': return 'bg-blue-100 text-blue-800 border-blue-300' // Meet - Blue (default)
      default: return 'bg-blue-100 text-blue-800 border-blue-300'
    }
  }

  // Get result color for benchmark 2nd row based on overall channel results for that date
  const getBenchmarkCellColor = (dateString: string, defaultResult: string, defaultScore?: number, isBrand?: boolean) => {
    // For 2nd row (MakeMyTrip Benchmark), use overall status color
    const overallStatus = getOverallStatusForDate(dateString)
    return getStatusColorClass(overallStatus)
  }

  const getResultColor = (result: string, score?: number, isHotel?: boolean) => {
    if (isHotel) {
      // Hotel row - show percentage scores with colors
      if (score && score >= 70) return "bg-green-100 text-green-800 border-green-300"
      if (score && score >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-300"
      if (score && score >= 30) return "bg-orange-100 text-orange-800 border-orange-300"
      return "bg-red-100 text-red-800 border-red-300"
    }
    
    // Channel rows - W/M/L with colors matching legends
    switch (result) {
      case "W":
        return "bg-orange-100 text-orange-800 border-orange-300" // Win = Orange
      case "M":
        return "bg-green-100 text-green-800 border-green-300"    // Meet = Green  
      case "L":
        return "bg-red-100 text-red-800 border-red-300"         // Loss = Red
      default:
        return "bg-gray-50 text-gray-600 border-gray-200"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-50 text-green-700 border-green-200"
    if (score >= 50) return "bg-orange-50 text-orange-700 border-orange-200"
    if (score >= 30) return "bg-red-50 text-red-600 border-red-200"
    return "bg-red-100 text-red-700 border-red-300"
  }

  const shouldHighlight = (score: number) => {
    const threshold = Number.parseInt(highlightThreshold)
    return score < threshold
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-500" />
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-500" />
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />
    }
  }

  const totalPages = needsPagination ? Math.ceil(totalDays / optimalColumns) : 1
  const isPaginationDisabled = totalDays <= optimalColumns

  return (
    <TooltipProvider delayDuration={0} skipDelayDuration={0} disableHoverableContent={true}>
      <Card className={cn("shadow-lg", className)}>
        <CardHeader className="pb-2 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl font-bold">Parity Calendar View</CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Download Button - Responsive */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="mr-1 sm:mr-2 p-2 sm:px-3">
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline ml-2">Download</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                    <p className="text-xs font-normal">Download CSV</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Pagination - Responsive */}
              {needsPagination && (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={isPaginationDisabled || currentPage === 0}
                        className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                      <p className="text-xs font-normal">Previous</p>
                    </TooltipContent>
                  </Tooltip>

                  <span className="text-xs sm:text-sm text-muted-foreground px-1 sm:px-2 whitespace-nowrap">
                    {currentPage + 1}/{totalPages}
                  </span>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={isPaginationDisabled || currentPage === totalPages - 1}
                        className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                      >
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                      <p className="text-xs font-normal">Next</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-2 sm:px-4 md:px-6 pt-1 pb-2">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading parity data...</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border relative overflow-x-auto">
              <table className="w-full table-fixed min-w-[800px] sm:min-w-[900px] md:min-w-[1000px]">
                {/* Header */}
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className={cn(
                      "text-left py-1.5 sm:py-2 px-2 sm:px-3 text-xs font-medium text-muted-foreground w-32 sm:w-40 md:w-44 border-r border-border",
                      isSticky && "sticky left-0 bg-muted/50 z-10"
                    )}>Channels</th>
                    <th className={cn(
                      "text-left py-1.5 sm:py-2 px-2 sm:px-3 text-xs font-medium text-muted-foreground w-28 sm:w-32 md:w-36 border-r border-border",
                      isSticky && "sticky left-32 sm:left-40 md:left-44 bg-muted/50 z-10"
                    )}>Win/Meet/Loss</th>
                    <th className={cn(
                      "text-left py-1.5 sm:py-2 px-2 sm:px-3 text-xs font-medium text-muted-foreground w-12 sm:w-14 md:w-16 border-r border-border mr-2.5",
                      isSticky && "sticky left-60 sm:left-72 md:left-80 bg-muted/50 z-10"
                    )}>Parity Score</th>
                    {/* Spacer column */}
                    <th className={cn(
                      "w-1.5 p-0 m-0",
                      isSticky && "sticky left-72 sm:left-86 md:left-96 bg-muted/50 z-10"
                    )}></th>
                    {Array.from({ length: needsPagination ? optimalColumns : dateRange.length }, (_, index) => {
                      const date = dateRange[index]
                      const hasDate = date && index < dateRange.length
                      // Dynamic width based on column count - larger cells for fewer columns
                      const cellWidth = needsPagination ? Math.max(60, Math.floor(672 / optimalColumns)) : Math.max(48, Math.floor(672 / dateRange.length))
                      const adaptiveWidth = needsPagination ? `w-[${cellWidth}px]` : `min-w-[${cellWidth}px]`
                      
                      return (
                        <th key={index} className={`text-center py-1.5 sm:py-2 px-0.5 sm:px-1 text-xs font-medium text-muted-foreground ${adaptiveWidth}`}>
                          {hasDate ? (
                            <>
                              <div className="text-xs sm:text-sm font-bold">{format(date, 'dd')}</div>
                              <div className="text-[9px] sm:text-[10px] text-muted-foreground">{format(date, 'MMM')}</div>
                            </>
                          ) : (
                            // Empty header for dates beyond the available range
                            <div className="h-6 sm:h-8"></div>
                          )}
                        </th>
                      )
                    })}
                  </tr>
                </thead>

                <tbody className="[&_tr:last-child]:border-0">
                  {parityData.map((channel, channelIndex) => {
                    const isBenchmark = channelIndex === 0
                    return (
                    <tr key={channel.channelId} className={cn(
                      "border-b border-border",
                      isBenchmark || channelIndex === 1
                        ? "bg-blue-50 dark:bg-blue-950/30 cursor-default" 
                        : "hover:bg-muted/50 transition-colors"
                    )}>
                      {/* Channel Name */}
                      {channelIndex !== 1 && (
                        <td 
                          className={cn(
                            "py-1.5 sm:py-2 px-2 sm:px-3 border-r border-border",
                            isSticky && (isBenchmark || channelIndex === 1) && "sticky left-0 bg-blue-50 dark:bg-blue-950/30 z-10",
                            isSticky && !isBenchmark && channelIndex !== 1 && "sticky left-0 bg-white dark:bg-slate-950 z-10"
                          )}
                          rowSpan={isBenchmark ? 2 : 1}
                        >
                        <div className={cn("flex items-center gap-1.5", isBenchmark && "cursor-default")}>
                            {channel.channelIcon && (
                              <img
                                src={channel.channelIcon}
                                alt={channel.channelName}
                                className="w-3 h-3 sm:w-4 sm:h-4 rounded"
                              />
                            )}
                          {(isBenchmark && channel.channelName.length > 8) || (!isBenchmark && channel.channelName.length > 12) ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs font-medium text-gray-900 cursor-default truncate">
                                  {isBenchmark 
                                    ? `${channel.channelName.substring(0, 8)}...`
                                    : `${channel.channelName.substring(0, 12)}...`
                                  }
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                                <div className="text-xs font-normal">
                                  {(() => {
                                    const name = channel.channelName
                                    if (name.length <= 24) {
                                      return <p>{name}</p>
                                    }
                                    
                                    const lines = []
                                    let remainingText = name
                                    
                                    // Split into lines of 24 characters each, max 3 lines
                                    for (let i = 0; i < 3 && remainingText.length > 0; i++) {
                                      if (remainingText.length <= 24) {
                                        lines.push(remainingText)
                                        break
                                      } else {
                                        lines.push(remainingText.substring(0, 24))
                                        remainingText = remainingText.substring(24)
                                      }
                                    }
                                    
                                    return lines.map((line, index) => (
                                      <p key={index}>{line}</p>
                                    ))
                                  })()}
                          </div>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className={`text-xs font-medium ${channelIndex === 1 ? 'text-transparent' : 'text-gray-900'}`}>
                              {channelIndex === 1 ? '' : channel.channelName}
                            </span>
                          )}
                          {isBenchmark && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 cursor-default hover:bg-blue-100">
                              Benchmark
                            </Badge>
                          )}
                        </div>
                        </td>
                      )}

                      {/* Win/Meet/Loss Distribution */}
                      {channelIndex !== 1 && (
                        <td 
                          className={cn(
                            "py-2 px-3 border-r border-border",
                            isSticky && (isBenchmark || channelIndex === 1) && "sticky left-44 bg-blue-50 dark:bg-blue-950/30 z-10",
                            isSticky && !isBenchmark && channelIndex !== 1 && "sticky left-44 bg-white dark:bg-slate-950 z-10"
                          )}
                          rowSpan={isBenchmark ? 2 : 1}
                        >
                        {channelIndex === 1 ? (
                          // Hide Win/Meet/Loss for Trivago (2nd row)
                          <div className="relative h-5">
                            {/* Hidden content */}
                          </div>
                        ) : (
                          <div className="relative group">
                            <div className={cn(
                              "flex items-center h-5 bg-gray-100 rounded overflow-hidden border border-gray-200 cursor-pointer"
                            )}>
                              <div
                                className="h-full bg-orange-400 flex items-center justify-center"
                                style={{ width: `${channel.winPercent}%` }}
                              >
                                {channel.winPercent > 15 && (
                                  <span className="text-[10px] font-bold text-white">{channel.winPercent}%</span>
                                )}
                              </div>
                              <div
                                className="h-full bg-green-400 flex items-center justify-center"
                                style={{ width: `${channel.meetPercent}%` }}
                              >
                                {channel.meetPercent > 15 && (
                                  <span className="text-[10px] font-bold text-white">{channel.meetPercent}%</span>
                                )}
                              </div>
                              <div
                                className="h-full bg-red-400 flex items-center justify-center"
                                style={{ width: `${channel.lossPercent}%` }}
                              >
                                {channel.lossPercent > 15 && (
                                  <span className="text-[10px] font-bold text-white">{channel.lossPercent}%</span>
                                )}
                              </div>
                            </div>
                            
                            {/* CSS-based Tooltip for all rows including benchmark */}
                            <div className={cn(
                              "absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-white text-gray-900 text-sm rounded-lg shadow-xl border border-gray-200 min-w-[200px] max-w-[300px] pointer-events-none z-[99999]",
                              // Smart positioning: top 4 rows show tooltip below, bottom 4+ rows show tooltip above
                              channelIndex < 4 ? "top-full mt-4" : "bottom-full mb-2"
                            )}>
                              <div className="font-semibold mb-1">
                                <div className="break-words overflow-hidden" style={{ 
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  lineHeight: 'calc(1.2em + 2px)',
                                  maxHeight: 'calc(2.4em + 4px)'
                                }}>
                                  {channel.channelName}
                                  {isBenchmark && (
                                    <span className="text-xs text-blue-600 font-normal"> (Benchmark)</span>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-orange-500 rounded-sm"></div>
                                  <span>Win: <span className="font-semibold">{channel.winPercent}%</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
                                  <span>Meet: <span className="font-semibold">{channel.meetPercent}%</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-sm"></div>
                                  <span>Loss: <span className="font-semibold">{channel.lossPercent}%</span></span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        </td>
                      )}

                      {/* Overall Parity Score */}
                      {channelIndex !== 1 && (
                        <td 
                          className={cn(
                            "py-2 px-3 border-r border-border mr-2.5",
                            isSticky && (isBenchmark || channelIndex === 1) && "sticky left-80 bg-blue-50 dark:bg-blue-950/30 z-10",
                            isSticky && !isBenchmark && channelIndex !== 1 && "sticky left-80 bg-white dark:bg-slate-950 z-10"
                          )}
                          rowSpan={isBenchmark ? 2 : 1}
                        >
                        <div className={cn("flex items-center gap-1", isBenchmark && "cursor-default")}>
                          <span
                            className={`font-bold cursor-default ${channelIndex === 1 ? 'text-transparent' : 'text-gray-900'}`}
                            style={{ fontSize: '13px' }}
                          >
                            {channelIndex === 1 ? '' : `${channel.overallParityScore}%`}
                          </span>
                        </div>
                        </td>
                      )}

                      {/* Spacer column */}
                      <td className={cn(
                        "w-1.5 p-0 m-0",
                        isSticky && (isBenchmark || channelIndex === 1) && "sticky left-96 bg-blue-50 dark:bg-blue-950/30 z-10",
                        isSticky && !isBenchmark && channelIndex !== 1 && "sticky left-96 bg-white dark:bg-slate-950 z-10"
                      )}></td>

                      {/* Daily Results */}
                      {Array.from({ length: needsPagination ? optimalColumns : dateRange.length }, (_, index) => {
                        const dayData = channel.dailyData[index]
                        const hasData = dayData && index < dateRange.length
                        
                        // Dynamic width based on column count - larger cells for fewer columns
                        const cellWidth = needsPagination ? Math.max(60, Math.floor(672 / optimalColumns)) : Math.max(48, Math.floor(672 / dateRange.length))
                        const adaptiveWidth = needsPagination ? `w-[${cellWidth}px]` : `min-w-[${cellWidth}px]`
                        
                        // Calculate colored cell width based on column count
                        const baseColoredCellWidth = needsPagination 
                          ? Math.max(50, Math.floor(672 / optimalColumns) - 8)
                          : Math.max(40, Math.floor(672 / dateRange.length) - 8)
                        const shouldReduceWidth = !needsPagination && [3, 7, 10].includes(dateRange.length)
                        const reducedWidth = shouldReduceWidth ? Math.floor(baseColoredCellWidth * 0.95) : baseColoredCellWidth
                        const adaptiveCellWidth = needsPagination ? `w-[${reducedWidth}px]` : `w-[${reducedWidth}px]`
                        
                        // Position tooltip on left for last 2 columns to prevent overflow
                        const totalColumns = needsPagination ? optimalColumns : dateRange.length
                        const isLastTwoColumns = index >= totalColumns - 2
                        const tooltipSide = isLastTwoColumns ? "left" : "top"
                        
                        return (
                          <td key={index} className={cn(
                            "py-1 px-0.5 text-center",
                            adaptiveWidth,
                            isBenchmark && "cursor-default"
                          )}>
                            {hasData ? (
                              isBenchmark ? (
                                                                  // Benchmark row - no tooltip, no border, default cursor
                                  <div
                                    className={`relative ${adaptiveCellWidth} h-6 flex items-center justify-center rounded font-bold bg-transparent text-gray-900 cursor-default`}
                                    style={{ fontSize: '13px' }}
                                  >
                                  {channel.isBrand ? `${dayData.parityScore}%` : dayData.result}
                                </div>
                              ) : (
                                // Regular rows - with tooltip and styling
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={cn(
                                        `relative ${adaptiveCellWidth} h-6 flex items-center justify-center rounded text-[10px] font-bold border cursor-pointer transition-all hover:scale-105`,
                                        channelIndex === 1 && parityData.length > 0 
                                          ? getBenchmarkCellColor(dayData.date, dayData.result, dayData.parityScore, channel.isBrand)
                                          : getResultColor(dayData.result, dayData.parityScore, channel.isBrand),
                                      )}
                                    >
                                      {channel.isBrand ? formatIDR(BASE_RATE_IDR) : (() => {
                                        const myRate = BASE_RATE_IDR  // MakeMyTrip rate (our rate)
                                        const result = dayData.result
                                        const channelVariation = channel.channelName.length * 100000 // Larger variation for IDR
                                        const currentDate = new Date(dayData.date)
                                        const dayVariation = (currentDate.getDate() % 10) * 50000 // Larger day variation
                                        
                                        let channelRate = myRate
                                        
                                        if (result === 'W') {
                                          // Win: Channel rate is HIGHER than my rate (I'm cheaper)
                                          channelRate = myRate + 500000 + (channelVariation % 2000000) + dayVariation
                                        } else if (result === 'L') {
                                          // Loss: Channel rate is LOWER than my rate (I'm more expensive)
                                          channelRate = myRate - 500000 - (channelVariation % 1500000) - dayVariation
                                        } else {
                                          // Meet: Channel rate equals my rate
                                          channelRate = myRate
                                        }
                                        
                                        const finalRate = Math.max(channelRate, 8000000) // Minimum 8M IDR
                                        return formatIDR(finalRate)
                                      })()}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent 
                                    side={tooltipSide}
                                    sideOffset={8}
                                    avoidCollisions={true}
                                    collisionPadding={16}
                                    className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-3 min-w-[400px] max-w-[500px] pointer-events-none"
                                  >
                                    {/* Date Heading - Left Aligned */}
                                    <div className="mb-2">
                                      <h3 className="text-gray-900 dark:text-white text-left">
                                        <span className="text-base font-bold">{format(new Date(dayData.date), "dd MMM yyyy")}</span>
                                        <span className="text-sm font-normal">{`, ${format(new Date(dayData.date), 'EEE')}`}</span>
                                      </h3>
                                </div>

                                    {/* Semantic Table Structure */}
                                    <div className="mt-4">
                                      <table className="w-full text-xs" style={{ tableLayout: 'auto' }}>
                                        <thead>
                                          <tr className="text-gray-500 dark:text-slate-400 font-medium">
                                            <th className="text-left pb-2" style={{ width: '80px', paddingLeft: '4px' }}>Channel</th>
                                            <th className="text-left pb-2 pl-4" style={{ minWidth: '90px', maxWidth: '140px' }}>Rate</th>
                                            <th className="text-left pb-2 pl-4" style={{ minWidth: '120px', maxWidth: '200px', paddingRight: '16px' }}>Room</th>
                                            <th className="text-left pb-2 pl-4" style={{ minWidth: '70px', maxWidth: '120px' }}>Inclusion</th>
                                          </tr>
                                        </thead>
                                        <tbody className="space-y-1">
                                          {isBenchmark || channelIndex === 1 ? (
                                            /* Benchmark channels (1st and 2nd row) - single row with actual channel name only */
                                            <tr className="bg-blue-50 dark:bg-blue-900/30">
                                              {/* Channel */}
                                              <td className="py-1.5 pr-2 rounded-l" style={{ width: '80px', paddingLeft: '4px' }}>
                                                <span className="font-medium truncate text-blue-900 dark:text-blue-200" title={channelIndex === 1 ? "MakeMyTrip Benchmark" : channel.channelName}>
                                                  {channelIndex === 1 ? 
                                                    ("MakeMyTrip Benchmark".length > 12 ? "MakeMyTri..." : "MakeMyTrip Benchmark") : 
                                                    channel.channelName
                                                  }
                                                </span>
                                              </td>
                                              
                                              {/* Rate */}
                                              <td className="py-1.5 pl-4 pr-2 text-left font-bold text-blue-900 dark:text-blue-200" style={{ minWidth: '90px', maxWidth: '140px' }}>
                                                {formatIDR(BASE_RATE_IDR)}
                                              </td>
                                              
                                              {/* Room with abbreviation */}
                                              <td className="py-1.5 pl-4 pr-2 text-left text-blue-900 dark:text-blue-200" style={{ minWidth: '120px', maxWidth: '200px', paddingRight: '16px' }}>
                                                {(() => {
                                                  const roomType = dayData.roomType || 'Deluxe Room'
                                                  const getRoomAbbreviation = (room: string) => {
                                                    if (room.includes('Apartment')) return 'APT'
                                                    if (room.includes('Bungalow')) return 'BNW'
                                                    if (room.includes('Deluxe')) return 'DLX'
                                                    if (room.includes('Standard')) return 'STD'
                                                    if (room.includes('Studio')) return 'STU'
                                                    if (room.includes('Suite')) return 'SUI'
                                                    if (room.includes('Superior')) return 'SUP'
                                                    return 'ROO'
                                                  }
                                                  const roomAbbr = getRoomAbbreviation(roomType)
                                                  const roomWithAbbr = `${roomAbbr} - ${roomType}`
                                                  
                                                  // Adaptive truncation based on available space
                                                  const maxDisplayLength = 25 // Increased for adaptive width
                                                  if (roomWithAbbr.length > maxDisplayLength) {
                                                    return `${roomWithAbbr.substring(0, maxDisplayLength - 3)}...`
                                                  }
                                                  return roomWithAbbr
                                                })()}
                                              </td>
                                              
                                              {/* Inclusion */}
                                              <td className="py-1.5 pl-4 pr-2 text-left text-blue-900 dark:text-blue-200" style={{ minWidth: '70px', maxWidth: '120px' }}>
                                                {(() => {
                                                  const inclusion = dayData.inclusion || 'Free Wifi'
                                                  return inclusion.length > 15 ? `${inclusion.substring(0, 12)}...` : inclusion
                                                })()}
                                              </td>
                                            </tr>
                                          ) : (
                                            /* Regular channel - show all 3 rows as before */
                                            <>
                                              {/* Benchmark Channel Row (MakeMyTrip) */}
                                              <tr className="bg-blue-50 dark:bg-blue-900/30">
                                                {/* Channel */}
                                                <td className="py-1.5 pr-2 rounded-l" style={{ width: '80px', paddingLeft: '4px' }}>
                                                  <span className="font-medium truncate text-blue-900 dark:text-blue-200" title={BENCHMARK_CHANNEL_NAME}>
                                                    {getBenchmarkDisplayName()}
                                                  </span>
                                                </td>
                                                
                                                {/* Rate */}
                                                <td className="py-1.5 pl-4 pr-2 text-left font-bold text-blue-900 dark:text-blue-200" style={{ minWidth: '90px', maxWidth: '140px' }}>
                                                  {formatIDR(BASE_RATE_IDR)}
                                                </td>
                                                
                                                {/* Room with abbreviation */}
                                                <td className="py-1.5 pl-4 pr-2 text-left text-blue-900 dark:text-blue-200" style={{ minWidth: '120px', maxWidth: '200px', paddingRight: '16px' }}>
                                                  {(() => {
                                                    const roomType = dayData.roomType || 'Deluxe Room'
                                                    const getRoomAbbreviation = (room: string) => {
                                                      if (room.includes('Apartment')) return 'APT'
                                                      if (room.includes('Bungalow')) return 'BNW'
                                                      if (room.includes('Deluxe')) return 'DLX'
                                                      if (room.includes('Standard')) return 'STD'
                                                      if (room.includes('Studio')) return 'STU'
                                                      if (room.includes('Suite')) return 'SUI'
                                                      if (room.includes('Superior')) return 'SUP'
                                                      return 'ROO'
                                                    }
                                                    const roomAbbr = getRoomAbbreviation(roomType)
                                                    const roomWithAbbr = `${roomAbbr} - ${roomType}`
                                                    
                                                    // Adaptive truncation based on available space
                                                    const maxDisplayLength = 25 // Increased for adaptive width
                                                    if (roomWithAbbr.length > maxDisplayLength) {
                                                      return `${roomWithAbbr.substring(0, maxDisplayLength - 3)}...`
                                                    }
                                                    return roomWithAbbr
                                                  })()}
                                                </td>
                                                
                                                {/* Inclusion */}
                                                <td className="py-1.5 pl-4 pr-2 text-left text-blue-900 dark:text-blue-200" style={{ minWidth: '70px', maxWidth: '120px' }}>
                                                  {(() => {
                                                    const inclusion = dayData.inclusion || 'Free Wifi'
                                                    return inclusion.length > 15 ? `${inclusion.substring(0, 12)}...` : inclusion
                                                  })()}
                                                </td>
                                              </tr>
                                              
                                              {/* Hovered Channel Row */}
                                              <tr>
                                                {/* Channel */}
                                                <td className="py-1.5 pr-2 rounded-l" style={{ width: '80px', paddingLeft: '4px' }}>
                                                  <span className="font-medium truncate text-gray-900 dark:text-slate-100" title={channel.channelName}>
                                                    {channel.channelName.length > 12 ? `${channel.channelName.substring(0, 9)}...` : channel.channelName}
                                                  </span>
                                                </td>
                                                
                                                {/* Rate */}
                                                <td className="py-1.5 pl-4 pr-2 text-left font-bold text-gray-900 dark:text-slate-100" style={{ minWidth: '90px', maxWidth: '140px' }}>
                                                  {(() => {
                                                    const myRate = BASE_RATE_IDR  // MakeMyTrip rate (our rate)
                                                    const result = dayData.result
                                                    
                                                    // Calculate channel rate based on W/M/L result
                                                    // Win: My rate is lower than channel rate (I win by being cheaper)
                                                    // Meet: My rate equals channel rate (same price)
                                                    // Loss: My rate is higher than channel rate (I lose by being more expensive)
                                                    
                                                    const channelVariation = channel.channelName.length * 100000 // Larger variation for IDR
                                                    const currentDate = new Date(dayData.date)
                                                    const startOfRange = dateRange[0] || currentDate
                                                    const dayVariation = Math.floor((currentDate.getTime() - startOfRange.getTime()) / (1000 * 60 * 60 * 24)) * 50000
                                                    
                                                    let channelRate = myRate
                                                    
                                                    if (result === 'W') {
                                                      // Win: Channel rate is HIGHER than my rate (I'm cheaper)
                                                      channelRate = myRate + 500000 + (channelVariation % 2000000) + dayVariation
                                                    } else if (result === 'L') {
                                                      // Loss: Channel rate is LOWER than my rate (I'm more expensive)
                                                      channelRate = myRate - 500000 - (channelVariation % 1500000) - dayVariation
                                                    } else {
                                                      // Meet: Channel rate equals my rate
                                                      channelRate = myRate
                                                    }
                                                    
                                                    channelRate = Math.max(channelRate, 8000000) // Ensure minimum 8M IDR
                                                    
                                                    return formatIDR(channelRate)
                                                  })()}
                                                </td>
                                                
                                                {/* Room with abbreviation */}
                                                <td className="py-1.5 pl-4 pr-2 text-left text-gray-900 dark:text-slate-100" style={{ minWidth: '120px', maxWidth: '200px', paddingRight: '16px' }}>
                                                  {(() => {
                                                    const roomType = dayData.roomType || 'Deluxe Room'
                                                    const getRoomAbbreviation = (room: string) => {
                                                      if (room.includes('Apartment')) return 'APT'
                                                      if (room.includes('Bungalow')) return 'BNW'
                                                      if (room.includes('Deluxe')) return 'DLX'
                                                      if (room.includes('Standard')) return 'STD'
                                                      if (room.includes('Studio')) return 'STU'
                                                      if (room.includes('Suite')) return 'SUI'
                                                      if (room.includes('Superior')) return 'SUP'
                                                      return 'ROO'
                                                    }
                                                    const roomAbbr = getRoomAbbreviation(roomType)
                                                    const roomWithAbbr = `${roomAbbr} - ${roomType}`
                                                    
                                                    // Adaptive truncation based on available space
                                                    const maxDisplayLength = 25 // Increased for adaptive width
                                                    if (roomWithAbbr.length > maxDisplayLength) {
                                                      return `${roomWithAbbr.substring(0, maxDisplayLength - 3)}...`
                                                    }
                                                    return roomWithAbbr
                                                  })()}
                                                </td>
                                                
                                                {/* Inclusion */}
                                                <td className="py-1.5 pl-4 pr-2 text-left text-gray-900 dark:text-slate-100" style={{ minWidth: '70px', maxWidth: '120px' }}>
                                                  {(() => {
                                                    const inclusion = dayData.inclusion || 'Free Wifi'
                                                    return inclusion.length > 15 ? `${inclusion.substring(0, 12)}...` : inclusion
                                                  })()}
                                                </td>
                                              </tr>
                                              
                                              {/* Rate Difference Row */}
                                              <tr>
                                                {/* Empty cell for Channel column */}
                                                <td className="py-1.5 pr-2" style={{ width: '80px', paddingLeft: '4px', borderTop: '1px solid #e5e7eb' }}>
                                                </td>
                                                
                                                {/* Merged Rate, Room & Inclusion columns for difference */}
                                                <td 
                                                  colSpan={3}
                                                  className="py-1.5 pl-4 pr-2 text-left font-bold" 
                                                  style={{ borderTop: '1px solid #e5e7eb' }}
                                                >
                                                  {(() => {
                                                    const myRate = BASE_RATE_IDR  // MakeMyTrip rate (our rate)
                                                    const result = dayData.result
                                                    
                                                    // Calculate channel rate based on W/M/L result
                                                    const channelVariation = channel.channelName.length * 100000 // Larger variation for IDR
                                                    const currentDate = new Date(dayData.date)
                                                    const startOfRange = dateRange[0] || currentDate
                                                    const dayVariation = Math.floor((currentDate.getTime() - startOfRange.getTime()) / (1000 * 60 * 60 * 24)) * 50000
                                                    
                                                    let channelRate = myRate
                                                    
                                                    if (result === 'W') {
                                                      // Win: Channel rate is HIGHER than my rate (I'm cheaper)
                                                      channelRate = myRate + 500000 + (channelVariation % 2000000) + dayVariation
                                                    } else if (result === 'L') {
                                                      // Loss: Channel rate is LOWER than my rate (I'm more expensive)
                                                      channelRate = myRate - 500000 - (channelVariation % 1500000) - dayVariation
                                                    } else {
                                                      // Meet: Channel rate equals my rate
                                                      channelRate = myRate
                                                    }
                                                    
                                                    channelRate = Math.max(channelRate, 8000000) // Ensure minimum 8M IDR
                                                    const difference = myRate - channelRate  // My rate - Channel rate
                                                    
                                                    // Color and text based on difference
                                                    let varianceColor, varianceText
                                                    
                                                    if (difference === 0) {
                                                      // Meet: Same price
                                                      varianceColor = 'text-gray-500 dark:text-slate-400'
                                                      varianceText = 'No Difference from benchmark'
                                                    } else if (difference < 0) {
                                                      // Win: My price is lower (negative difference)
                                                      varianceColor = 'text-green-600 dark:text-green-400'
                                                      varianceText = `-${Math.abs(difference)} Difference from benchmark`
                                                    } else {
                                                      // Loss: My price is higher (positive difference)
                                                      varianceColor = 'text-red-600 dark:text-red-400'
                                                      varianceText = `+${Math.abs(difference)} Difference from benchmark`
                                                    }
                                                    
                                                    return (
                                                      <span className={varianceColor}>
                                                        {difference === 0 ? (
                                                          <span className="font-normal">No Difference from benchmark</span>
                                                        ) : (
                                                          <>
                                                            <span className="font-bold">{difference < 0 ? `-${formatIDR(Math.abs(difference)).replace('Rp ', '')}` : `+${formatIDR(Math.abs(difference)).replace('Rp ', '')}`}</span>
                                                            <span className="font-normal"> Difference from benchmark</span>
                                                          </>
                                                        )}
                                                      </span>
                                                    )
                                                  })()}
                                                </td>
                                              </tr>
                                            </>
                                          )}
                                        </tbody>
                                      </table>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                              )
                            ) : (
                              // Empty cell for dates beyond the available range
                              <div className={`${adaptiveCellWidth} h-6`}></div>
                            )}
                        </td>
                        )
                      })}
                    </tr>
                  )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Legend */}
          <div className="py-2 px-4 mb-6">
            <div className="flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-orange-400 rounded border border-orange-500"></div>
                <span className="text-foreground font-medium">Win</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-green-400 rounded border border-green-500"></div>
                <span className="text-foreground font-medium">Meet</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-red-400 rounded border border-red-500"></div>
                <span className="text-foreground font-medium">Loss</span>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
