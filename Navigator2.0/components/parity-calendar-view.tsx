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

// Direct API response types - no intermediate interface
type ApiChannelData = any
type ApiDailyData = any

interface ParityCalendarViewProps {
  className?: string;
  parityData?: any;
  parityDataMain?: any;
  onDataUpdate?: (data: any) => void;
}

export function ParityCalendarView({ className, parityDataMain }: ParityCalendarViewProps) {
  // Debug logging for parityDataMain


  // Format number without currency symbol (for tooltip display)
  const formatNumber = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  // Helper function to get room type abbreviation
  const getRoomAbbreviation = (roomType: string) => {
    const abbreviations: { [key: string]: string } = {
      'Deluxe Room': 'DLX',
      'Superior Room': 'SUP',
      'Standard Room': 'STD',
      'Executive Room': 'EXE',
      'Junior Suite': 'JS',
      'Executive Suite': 'ES',
      'Presidential Suite': 'PS',
      'Family Room': 'FAM',
      'Twin Room': 'TWN',
      'King Room': 'KNG',
      'Queen Room': 'QUE'
    }
    return abbreviations[roomType] || 'RM'
  }

  // Helper function to format Channel text with hyphen word-breaking (120px width)
  const formatChannelText = (text: string) => {
    if (text.length <= 16) return text // Single line for short text
    if (text.length <= 32) {
      // Break at character 16, add hyphen if breaking a word
      const firstLine = text.substring(0, 16)
      const secondLine = text.substring(16)

      // Check if we're breaking in the middle of a word
      if (text[15] !== ' ' && text[16] !== ' ' && text[16]) {
        return {
          firstLine: firstLine + '-',
          secondLine: secondLine
        }
      }
      return {
        firstLine: firstLine,
        secondLine: secondLine
      }
    }
    // Truncate after 32 chars with ellipsis
    const truncated = text.substring(0, 29) + '...'
    const firstLine = truncated.substring(0, 16)
    const secondLine = truncated.substring(16)

    // Check if we're breaking in the middle of a word
    if (truncated[15] !== ' ' && truncated[16] !== ' ' && truncated[16]) {
      return {
        firstLine: firstLine + '-',
        secondLine: secondLine
      }
    }
    return {
      firstLine: firstLine,
      secondLine: secondLine
    }
  }

  // Helper function to format Rate text with 2-line truncation (100px width)
  const formatRateText = (text: string) => {
    if (text.length <= 13) return text // Single line for short text
    if (text.length <= 26) {
      // Break to 2 lines
      const firstLine = text.substring(0, 13)
      const lastSpaceInFirstLine = firstLine.lastIndexOf(' ')
      const splitPoint = lastSpaceInFirstLine > 8 ? lastSpaceInFirstLine : 13
      return {
        firstLine: text.substring(0, splitPoint),
        secondLine: text.substring(splitPoint).trim()
      }
    }
    // Truncate after 26 chars with ellipsis
    const truncated = text.substring(0, 23) + '...'
    const firstLine = truncated.substring(0, 13)
    const lastSpaceInFirstLine = firstLine.lastIndexOf(' ')
    const splitPoint = lastSpaceInFirstLine > 8 ? lastSpaceInFirstLine : 13
    return {
      firstLine: truncated.substring(0, splitPoint),
      secondLine: truncated.substring(splitPoint).trim()
    }
  }

  // Helper function to format Room text with hyphen word-breaking (150px width)
  const formatRoomText = (text: string) => {
    if (text.length <= 20) return text // Single line for short text
    if (text.length <= 40) {
      // Break at character 20, add hyphen if breaking a word
      const firstLine = text.substring(0, 20)
      const secondLine = text.substring(20)

      // Check if we're breaking in the middle of a word
      if (text[19] !== ' ' && text[20] !== ' ' && text[20]) {
        return {
          firstLine: firstLine + '-',
          secondLine: secondLine
        }
      }
      return {
        firstLine: firstLine,
        secondLine: secondLine
      }
    }
    // Truncate after 40 chars with ellipsis
    const truncated = text.substring(0, 37) + '...'
    const firstLine = truncated.substring(0, 20)
    const secondLine = truncated.substring(20)

    // Check if we're breaking in the middle of a word
    if (truncated[19] !== ' ' && truncated[20] !== ' ' && truncated[20]) {
      return {
        firstLine: firstLine + '-',
        secondLine: secondLine
      }
    }
    return {
      firstLine: firstLine,
      secondLine: secondLine
    }
  }

  // Helper function to format Inclusion text with hyphen word-breaking (150px width)
  const formatInclusionText = (text: string) => {
    if (text.length <= 20) return text // Single line for short text
    if (text.length <= 40) {
      // Break at character 20, add hyphen if breaking a word
      const firstLine = text.substring(0, 20)
      const secondLine = text.substring(20)

      // Check if we're breaking in the middle of a word
      if (text[19] !== ' ' && text[20] !== ' ' && text[20]) {
        return {
          firstLine: firstLine + '-',
          secondLine: secondLine
        }
      }
      return {
        firstLine: firstLine,
        secondLine: secondLine
      }
    }
    // Truncate after 40 chars with ellipsis
    const truncated = text.substring(0, 37) + '...'
    const firstLine = truncated.substring(0, 20)
    const secondLine = truncated.substring(20)

    // Check if we're breaking in the middle of a word
    if (truncated[19] !== ' ' && truncated[20] !== ' ' && truncated[20]) {
      return {
        firstLine: firstLine + '-',
        secondLine: secondLine
      }
    }
    return {
      firstLine: firstLine,
      secondLine: secondLine
    }
  }

  // Calculate optimal number of rows based on screen space and data
  const calculateOptimalRows = () => {
    const dateCount = totalDays
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
  const [selectedProperty] = useSelectedProperty() // For sid related data

  // Currency settings - dynamic based on selected property
  const BASE_RATE_IDR = 12398873 // Base rate in Indonesian Rupiah (8 digits)
  const CURRENCY_SYMBOL = selectedProperty?.currencySymbol ?? '$'

  // Format currency with dynamic currency symbol (using commas for thousands separator)
  const formatIDR = (amount: number) => {
    // Use custom formatting to ensure commas are used as thousand separators
    const formattedAmount = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return `${CURRENCY_SYMBOL} ${formattedAmount}`
  }
  const [parityData, setParityData] = useState<ApiChannelData[]>([])
  const [parityScoreData, setScoreParityData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [highlightThreshold, setHighlightThreshold] = useState("30")
  const [selectedHotel, setSelectedHotel] = useState("Hotel 2") // Default as per requirement
  const [showDays, setShowDays] = useState(14)
  const [currentPage, setCurrentPage] = useState(0)
  const [optimalRowCount, setOptimalRowCount] = useState(10)
  const [optimalColumns, setOptimalColumns] = useState(7)

  // Get benchmark channel from API response where isBrand is true
  const getBenchmarkChannel = () => {
    return parityData.find((channel: any) => channel.isBrand === true)
  }

  const benchmarkChannel = parityData.length > 0 ? getBenchmarkChannel() : null
  const BENCHMARK_CHANNEL_NAME = benchmarkChannel?.channelName || "MakeMyTrip"

  const getBenchmarkDisplayName = () => {
    return BENCHMARK_CHANNEL_NAME.length > 12 ? `${BENCHMARK_CHANNEL_NAME.substring(0, 9)}...` : BENCHMARK_CHANNEL_NAME
  }

  // Calculate total days from API response data
  const totalDays = parityData.length > 0 && parityData[0]?.checkInDateWiseRates
    ? parityData[0].checkInDateWiseRates.length
    : 0

  // Determine optimal columns - fixed to 7 days with wider cells
  const getOptimalColumns = () => {
    // Always return 7 to show only 7 days with wider cells for better A/R indicator visibility
    return 7
  }

  const needsPagination = totalDays > optimalColumns
  const isSticky = needsPagination

  // Generate full filtered dates for UI rendering (without pagination)
  const generateFullFilteredDates = () => {
    if (!parityData || parityData.length === 0) {
      return []
    }

    // Collect all dates from ALL channels' checkInDateWiseRates
    const allDates: Date[] = []
    parityData.forEach((channel, channelIndex) => {
      if (channel?.checkInDateWiseRates && Array.isArray(channel.checkInDateWiseRates)) {
        const channelDates = channel.checkInDateWiseRates
          .map((rate: any) => rate.checkInDate ? new Date(rate.checkInDate) : null)
          .filter((date: Date | null) => date && !isNaN(date.getTime()))
        allDates.push(...channelDates)
      }
    })


    // Sort chronologically first, then remove duplicates
    const sortedDates = allDates.sort((a: Date, b: Date) => a.getTime() - b.getTime())
    const uniqueDates = sortedDates.filter((date: Date, index: number, arr: Date[]) =>
      index === 0 || date.getTime() !== arr[index - 1].getTime()
    )
    // Apply date range filtering if startDate and endDate are provided
    let filteredDates = uniqueDates
    if (startDate && endDate) {
      filteredDates = uniqueDates.filter(date => {
        const dateTimestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
        const startTimestamp = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime()
        const endTimestamp = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime()

        const isInRange = dateTimestamp >= startTimestamp && dateTimestamp <= endTimestamp

        return isInRange
      })
    }

    return filteredDates
  }

  // Generate date range from API response data (with pagination)
  const generateDateRangeFromApi = () => {
    // Use the same logic as generateFullFilteredDates but with pagination
    const allFilteredDates = generateFullFilteredDates()

    // If total days <= optimal columns, show all dates
    if (allFilteredDates.length <= optimalColumns) {
      return allFilteredDates
    }

    // For pagination, show 7 days per page
    // First page: 7 dates, subsequent pages: 7 dates each (or remaining dates if < 7)
    const startIndex = currentPage * optimalColumns
    const endIndex = Math.min(startIndex + optimalColumns, allFilteredDates.length)

    const finalDates = allFilteredDates.slice(startIndex, endIndex)

    return finalDates
  }

  // Debug logging for the final result

  // Generate the date ranges
  const dateRange = generateDateRangeFromApi()
  const fullFilteredDates = generateFullFilteredDates()

  // Helper function to get channel result from API data
  const getChannelResult = (channelWisewinData: any) => {
    const { winCount = 0, lossCount = 0, meetCount = 0 } = channelWisewinData || {}

    if (lossCount > 0) return 'L' // Loss has priority
    if (winCount > 0) return 'W'  // Win second priority
    if (meetCount > 0) return 'M' // Meet third priority
    return 'M' // Default to meet
  }

  // Helper function to calculate win/meet/loss percentages (same as parity monitoring page)
  const calculateWinMeetLossPercentages = (channelWisewinData: any) => {
    const { winCount = 0, meetCount = 0, lossCount = 0 } = channelWisewinData || {}
    const total = winCount + meetCount + lossCount

    const winPercent = total > 0 ? Math.round((winCount / total) * 100) : 0
    const meetPercent = total > 0 ? Math.round((meetCount / total) * 100) : 0
    const lossPercent = total > 0 ? Math.round((lossCount / total) * 100) : 0

    return { winPercent, meetPercent, lossPercent }
  }

  // Load parity data from parityDataMain prop - direct API binding
  useEffect(() => {

    if (!parityDataMain) {
      return;
    }

    setIsLoading(true)

    try {
      debugger;
      // Work directly with API response structure
      const channels = parityDataMain?.otaViolationChannelRate?.violationChannelRatesCollection || []
      setParityData(channels)
      const parityScrore = parityDataMain?.otaViolationChannelRate?.dateWiseWinMeetLoss || []
      setScoreParityData(parityScrore)

      // Debug parity scores specifically
      channels.forEach((channel: any, index: number) => {


        // Special debugging for brand channels
        if (channel.isBrand) {
        }
      })
    } catch (error) {
      console.error('❌ Error loading parity data:', error)
      setParityData([])
    }

    const timer = setTimeout(() => {
      setIsLoading(false)
      console.log('✅ Parity calendar data loaded successfully')
    }, 500)

    return () => clearTimeout(timer)
  }, [parityDataMain]) // Run when parityDataMain changes

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
  }, [parityData, totalDays])

  // Update optimal columns on mount and window resize
  useEffect(() => {
    const updateOptimalColumns = () => {
      const newOptimalColumns = getOptimalColumns()
      setOptimalColumns(newOptimalColumns)
    }

    updateOptimalColumns()

    // Add resize listener for screen resolution changes
    window.addEventListener('resize', updateOptimalColumns)
    return () => window.removeEventListener('resize', updateOptimalColumns)
  }, [])

  // Helper function to format date for comparison
  const formatDateForComparison = (date: Date | string) => {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0] // Convert to YYYY-MM-DD format
    }
    return typeof date === 'string' ? date : ''
  }

  // Helper function to get day of month from date
  const getDayOfMonth = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date)
    return dateObj.getDate()
  }

  // Get overall competitive status for a specific date across all channels
  const getOverallStatusForDate = (dateString: string | Date) => {
    const allResults: string[] = []
    const targetDate = dateString instanceof Date ? dateString : new Date(dateString)

    // Check all channels for this date
    if (parityData && Array.isArray(parityData)) {
      parityData.forEach((channel, index) => {

        // Add null check for channel.checkInDateWiseRates
        if (channel && channel.checkInDateWiseRates && Array.isArray(channel.checkInDateWiseRates)) {
          const dayData = channel.checkInDateWiseRates.find((day: ApiDailyData) => {
            if (!day || !day.checkInDate) return false
            const dayDate = new Date(day.checkInDate)
            return !isNaN(dayDate.getTime()) && dayDate.getTime() === targetDate.getTime()
          })
          if (dayData) {
            const result = getChannelResult(channel.channelWisewinMeetLoss)
            allResults.push(result)
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

  // Helper function to determine if a channel should be sold out for date 31
  const isSoldOutForDate31 = (channelIndex: number, date: string | Date) => {
    const dateObj = date instanceof Date ? date : new Date(date)
    const dayOfMonth = dateObj.getDate()
    if (dayOfMonth !== 31) return false

    // Make 80% of channels sold out for date 31 (9 out of 11 channels)
    // Keep channels at index 4 (Google Hotels) and 6 (Trip Advisor) showing rates
    const channelsWithRates = [4, 6]
    return !channelsWithRates.includes(channelIndex)
  }

  // Helper function to check if benchmark channel is sold out for date 31
  const isBenchmarkSoldOutForDate31 = (date: string | Date) => {
    if (!benchmarkChannel) return false
    const benchmarkIndex = parityData.findIndex(channel => channel.isBrand === true)
    return isSoldOutForDate31(benchmarkIndex, date)
  }

  // Get result color for benchmark 2nd row based on overall channel results for that date
  const getBenchmarkCellColor = (dateString: string | Date, defaultResult: string, defaultScore?: number, isBrand?: boolean) => {
    const dateObj = dateString instanceof Date ? dateString : new Date(dateString)
    const dayOfMonth = dateObj.getDate()

    // Force meet color (green) for date 30 regardless of actual status
    // if (dayOfMonth === 30) {
    //   return "bg-green-100 text-green-800 border-green-300" // Meet = Green
    // }

    // For date 31 - benchmark sold out logic
    // if (dayOfMonth === 31) {
    //   const isBenchmarkSoldOut = isBenchmarkSoldOutForDate31(dateString)
    //   if (isBenchmarkSoldOut) {
    //     // Benchmark sold out gets loss state color (red)
    //     return "bg-red-100 text-red-800 border-red-300" // Loss = Red
    //   }
    // }

    // For 2nd row (MakeMyTrip Benchmark), use overall status color
    //const overallStatus = getOverallStatusForDate(dateString)
    return getStatusColorClass("")
  }

  const getResultColor = (result: string, score?: number, isHotel?: boolean, date?: string | Date, channelIndex?: number) => {
    // Force meet color (green) for date 30 regardless of actual result
    // if (date) {
    //   const dateObj = date instanceof Date ? date : new Date(date)
    //   const dayOfMonth = dateObj.getDate()

    //   // if (dayOfMonth === 30) {
    //   //   return "bg-green-100 text-green-800 border-green-300" // Meet = Green
    //   // }

    //   // For date 31 - special sold out logic
    //   if (dayOfMonth === 31) {
    //     const isBenchmarkSoldOut = isBenchmarkSoldOutForDate31(date)
    //     const isCurrentChannelSoldOut = channelIndex !== undefined ? isSoldOutForDate31(channelIndex, date) : false

    //     if (isCurrentChannelSoldOut) {
    //       // Sold out channels get meet state color (green)
    //       return "bg-green-100 text-green-800 border-green-300" // Meet = Green
    //     } else if (isBenchmarkSoldOut && !isCurrentChannelSoldOut) {
    //       // Channels with rates when benchmark is sold out get loss state color (red)
    //       return "bg-red-100 text-red-800 border-red-300" // Loss = Red
    //     }
    //   }
    // }

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

  // CSV Download functionality
  const downloadCSV = () => {
    if (!parityData || parityData.length === 0) {
      console.log('No data available for CSV download')
      return
    }


    // Sort channels: benchmark first, then alphabetical
    const sortedChannels = [...parityData].sort((a, b) => {
      if (a.isBrand && !b.isBrand) return -1
      if (!a.isBrand && b.isBrand) return 1
      return a.channelName?.localeCompare(b.channelName || '') || 0
    })

    // Use the same logic as UI for consistency
    const filteredDates = generateFullFilteredDates()

    // Generate date columns for filtered dates
    const dateColumns = filteredDates.map((date: Date) => format(date, 'dd-MMM'))

    // CSV headers
    const headers = [
      'Channel Name',
      'Win %',
      'Meet %',
      'Loss %',
      'Parity Score %',
      ...dateColumns
    ]

    // Generate CSV rows
    const rows = sortedChannels.map(channel => {
      const isBenchmark = channel.isBrand === true
      const channelName = isBenchmark ? `${channel.channelName} (Benchmark)` : channel.channelName

      // Calculate Win/Meet/Loss percentages
      const { winPercent, meetPercent, lossPercent } = calculateWinMeetLossPercentages(channel.channelWisewinMeetLoss)

      // Calculate parity score
      let parityScore = channel.channelWisewinMeetLoss?.parityScore || 0
      if (isBenchmark && (!parityScore || parityScore === 0)) {
        const { winCount = 0, meetCount = 0, lossCount = 0 } = channel.channelWisewinMeetLoss || {}
        const total = winCount + meetCount + lossCount
        if (total > 0) {
          parityScore = Math.round(((winCount + meetCount) * 100) / total)
        }
      }

      // Generate date cell data for filtered dates
      const dateCells = filteredDates.map((date: Date): string => {
        const dayData = channel.checkInDateWiseRates?.find((rate: any) => {
          if (!rate.checkInDate) return false
          const rateDate = new Date(rate.checkInDate)
          return rateDate.getTime() === date.getTime()
        })

        if (!dayData) {
          return 'No Data'
        }

        const dayOfMonth = date.getDate()
        const isSoldOut = dayOfMonth === 30 || (dayOfMonth === 31 && isSoldOutForDate31(parityData.findIndex(c => c.channelId === channel.channelId), date))

        if (isSoldOut) {
          return 'Sold Out'
        }

        // Get benchmark rate for difference calculation
        const benchmarkChannel = parityData.find(c => c.isBrand === true)
        const benchmarkDayData = benchmarkChannel?.checkInDateWiseRates?.find((rate: any) => {
          const rateDate = new Date(rate.checkInDate)
          return rateDate.getTime() === date.getTime()
        })

        const benchmarkRate = benchmarkDayData?.rate || 0
        const channelRate = dayData.rate || 0
        const difference = benchmarkRate - channelRate

        // Format difference
        let differenceText = ''
        if (difference === 0) {
          differenceText = 'No difference'
        } else if (difference < 0) {
          differenceText = `+${formatNumber(Math.abs(difference))}`
        } else {
          differenceText = `+${formatNumber(Math.abs(difference))}`
        }

        // Get violation type
        const hasAvailViolation = dayData.availViolation || false
        const hasRateViolation = dayData.rateViolation || false
        let violationText = ''
        if (hasAvailViolation) {
          violationText = 'A'
        } else if (hasRateViolation) {
          violationText = 'R'
        }

        // Get room type and inclusions
        const roomType = dayData.toolTipProductName || 'DLX'
        const inclusion = dayData.inclusion || 'WiFi+Breakfast'

        // Get benchmark room type and inclusions
        const benchmarkRoomType = benchmarkDayData?.toolTipProductName || 'DLX'
        const benchmarkInclusion = benchmarkDayData?.inclusion || 'WiFi+Breakfast'

        // Get result status (Win/Meet/Loss)
        const result = getChannelResult(channel.channelWisewinMeetLoss)
        const resultText = result === 'W' ? 'Win' : result === 'L' ? 'Loss' : 'Meet'

        // Build the detailed format: Benchmark: rate (room, inclusion) | OTA: rate (room, inclusion) | Diff: difference | Violation | Result
        const benchmarkPart = `Benchmark: ${formatNumber(benchmarkRate)} (${benchmarkRoomType}, ${benchmarkInclusion})`
        const otaPart = `OTA: ${formatNumber(channelRate)} (${roomType}, ${inclusion})`
        const diffPart = `Diff: ${differenceText}`
        const violationPart = violationText ? `${violationText} |` : ''
        const resultPart = resultText

        return `${benchmarkPart} | ${otaPart} | ${diffPart} | ${violationPart} ${resultPart}`
      })

      return [
        channelName,
        winPercent,
        meetPercent,
        lossPercent,
        parityScore,
        ...dateCells
      ]
    })

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    // Add BOM for UTF-8 encoding
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

    // Create download link
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `parity-calendar-${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const totalPages = needsPagination ? Math.ceil(fullFilteredDates.length / optimalColumns) : 1
  const isPaginationDisabled = fullFilteredDates.length <= optimalColumns

  return (
    <TooltipProvider delayDuration={0} skipDelayDuration={0} disableHoverableContent={true}>
      <div className={cn("", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <CardTitle className="text-xl font-bold">Parity Calendar View</CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Download Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="mr-2" onClick={downloadCSV}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                    <p className="text-xs font-normal">Download CSV</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Pagination */}
              {needsPagination && (
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={isPaginationDisabled || currentPage === 0}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                      <p className="text-xs font-normal">Previous</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={isPaginationDisabled || currentPage === totalPages - 1}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronRight className="h-3 w-3" />
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

        <CardContent className="px-6 pt-1 pb-2">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading parity data...</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border relative" style={{ overflowX: 'visible' }}>
              <table className="w-full table-fixed">
                {/* Header */}
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className={cn(
                      "text-left py-2 px-3 text-xs font-medium text-muted-foreground w-44 border-r border-border border-b-0",
                      isSticky && "sticky left-0 bg-muted/50 z-10"
                    )}>Channels</th>
                    <th className={cn(
                      "text-left py-2 px-3 text-xs font-medium text-muted-foreground w-36 border-r border-border border-b-0",
                      isSticky && "sticky left-44 bg-muted/50 z-10"
                    )}>Win/Meet/Loss</th>
                    <th className={cn(
                      "text-left py-2 px-3 text-xs font-medium text-muted-foreground w-16 border-r border-border border-b-0 mr-2.5",
                      isSticky && "sticky left-80 bg-muted/50 z-10"
                    )}>Parity Score</th>
                    {/* Spacer column */}
                    <th className={cn(
                      "w-1.5 p-0 m-0",
                      isSticky && "sticky left-96 bg-muted/50 z-10"
                    )}></th>
                    {Array.from({ length: needsPagination ? optimalColumns : fullFilteredDates.length }, (_, index) => {
                      const date = needsPagination ? dateRange[index] : fullFilteredDates[index] || undefined
                      const hasDate = date && index < (needsPagination ? dateRange.length : fullFilteredDates.length)
                      // Dynamic width based on column count - larger cells for fewer columns
                      const cellWidth = needsPagination ? Math.max(60, Math.floor(672 / optimalColumns)) : Math.max(48, Math.floor(672 / fullFilteredDates.length))
                      const adaptiveWidth = needsPagination ? `w-[${cellWidth}px]` : `min-w-[${cellWidth}px]`

                      return (
                        <th key={index} className={`text-center py-2 px-1 text-xs font-medium text-muted-foreground ${adaptiveWidth}`}>
                          {hasDate ? (
                            <>
                              <div className="text-xs font-bold">{format(date, 'dd')}</div>
                              <div className="text-[10px] text-muted-foreground">{format(date, 'MMM')}</div>
                              {/* Parity % display from first row */}
                              <Tooltip>
                                <TooltipTrigger asChild className="cursor-default">
                                  <div className="mt-1 px-1 py-1 bg-blue-100 text-blue-800 rounded font-bold cursor-default hover:cursor-default" style={{ fontSize: '13px' }}>
                                    {(() => {
                                      // Extract parity score from channel data (first channel)
                                      //  debugger;


                                      let parityScoreDisplay = parityScoreData.find(x => format(x.checkInDate, 'dd/MM/yyyy') === format(date, 'dd/MM/yyyy'))?.parityScore || 0
                                      return `${parityScoreDisplay}%`
                                    })()}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                                  <p className="text-xs font-normal">Parity Score</p>
                                </TooltipContent>
                              </Tooltip>
                            </>
                          ) : (
                            // Empty header for dates beyond the available range
                            <div className="h-8"></div>
                          )}
                        </th>
                      )
                    })}

                    {/* End spacer column header */}
                    <th className="w-1.5 p-0 m-0"></th>
                  </tr>
                </thead>

                <tbody className="[&_tr:last-child]:border-0">
                  {(() => {
                    // Sort channels: benchmark first, then alphabetical order
                    const sortedChannels = [...parityData].sort((a, b) => {
                      // Benchmark channel (isBrand: true) comes first
                      if (a.isBrand && !b.isBrand) return -1
                      if (!a.isBrand && b.isBrand) return 1

                      // For non-benchmark channels, sort alphabetically by channel name
                      return a.channelName?.localeCompare(b.channelName || '') || 0
                    })

                    return sortedChannels.map((channel, sortedIndex) => {
                      const channelIndex = parityData.findIndex(c => c.channelId === channel.channelId)
                      const isBenchmark = channel.isBrand === true
                      return (
                        <tr key={channel.channelId} className={cn(
                          "border-b border-border",
                          isBenchmark
                            ? "bg-blue-50 dark:bg-blue-950/30 cursor-default"
                            : "hover:bg-muted/50 transition-colors"
                        )}>
                          {/* Channel Name */}
                          <td
                            className={cn(
                              "py-2 px-3 border-r border-border",
                              isSticky && isBenchmark && "sticky left-0 bg-blue-50 dark:bg-blue-950/30 z-10",
                              isSticky && !isBenchmark && "sticky left-0 bg-white dark:bg-slate-950 hover:bg-muted/50 z-10",

                            )}
                          >
                            <div className={cn("flex items-center gap-1.5", isBenchmark && "cursor-default")}>
                              {channel.channelIcon ? (
                                <img
                                  src={channel.channelIcon}
                                  alt={channel.channelName}
                                  className="w-4 h-4 rounded"
                                  onError={(e) => {
                                    // Hide the image and show fallback on error
                                    e.currentTarget.style.display = 'none'
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                  }}
                                />
                              ) : null}
                              {/* Fallback: First letter of channel name */}
                              <div className={cn(
                                "w-4 h-4 rounded flex items-center justify-center text-xs font-bold text-white bg-blue-600",
                                channel.channelIcon ? "hidden" : "block"
                              )}>
                                <span className="w-4 h-4 rounded flex items-center justify-center text-xs font-bold text-white bg-blue-600">
                                  {channel.channelName?.charAt(0)?.toUpperCase() || 'C'}
                                </span>
                              </div>
                              {(isBenchmark && channel.channelName.length > 10) || (!isBenchmark && channel.channelName.length > 18) ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-xs font-medium text-gray-900 cursor-default">
                                      {isBenchmark
                                        ? `${channel.channelName.substring(0, 10)}...`
                                        : `${channel.channelName.substring(0, 18)}...`
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
                                <span className="text-xs font-medium text-gray-900">
                                  {channel.channelName}
                                </span>
                              )}
                              {isBenchmark && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 cursor-default hover:bg-blue-100">
                                  Benchmark
                                </Badge>
                              )}
                            </div>
                          </td>

                          {/* Win/Meet/Loss Distribution */}
                          <td
                            className={cn(
                              "py-2 px-3 border-r border-border",
                              isSticky && isBenchmark && "sticky left-44 bg-blue-50 dark:bg-blue-950/30 z-10",
                              isSticky && !isBenchmark && "sticky left-44 bg-white dark:bg-slate-950 hover:bg-muted/50 z-10",
                              isBenchmark && "bg-blue-50 dark:bg-blue-950/30" // Benchmark gets special background
                            )}
                          >
                            {/* Show Win/Meet/Loss bars for all channels */}
                            {(
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className={cn(
                                    "flex items-center h-5 bg-gray-100 rounded overflow-hidden border border-gray-200 cursor-pointer"
                                  )}>
                                    {(() => {
                                      let overallWinMeetLoss;
                                      if (channel.isBrand) {
                                        overallWinMeetLoss = parityDataMain?.otaViolationChannelRate?.overallWinMeetLoss
                                        // Try to calculate parity score from win/meet/loss counts
                                      }
                                      else {
                                        overallWinMeetLoss = channel.channelWisewinMeetLoss
                                      }
                                      const { winPercent, meetPercent, lossPercent } = calculateWinMeetLossPercentages(overallWinMeetLoss)
                                      return (
                                        <>
                                          <div
                                            className="h-full bg-orange-400 flex items-center justify-center"
                                            style={{ width: `${winPercent}%` }}
                                          >
                                            {winPercent > 15 && (
                                              <span className="text-[10px] font-bold text-white">{winPercent}%</span>
                                            )}
                                          </div>
                                          <div
                                            className="h-full bg-green-400 flex items-center justify-center"
                                            style={{ width: `${meetPercent}%` }}
                                          >
                                            {meetPercent > 15 && (
                                              <span className="text-[10px] font-bold text-white">{meetPercent}%</span>
                                            )}
                                          </div>
                                          <div
                                            className="h-full bg-red-400 flex items-center justify-center"
                                            style={{ width: `${lossPercent}%` }}
                                          >
                                            {lossPercent > 15 && (
                                              <span className="text-[10px] font-bold text-white">{lossPercent}%</span>
                                            )}
                                          </div>
                                        </>
                                      )
                                    })()}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  sideOffset={8}
                                  avoidCollisions={true}
                                  collisionPadding={16}
                                  className="bg-white text-gray-900 border border-gray-200 shadow-xl"
                                >
                                  <div className="min-w-[180px] max-w-[240px]">
                                    <div className="font-semibold mb-1">
                                      <div className="break-words overflow-hidden" style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        lineHeight: '1.4',
                                        maxHeight: '2.8em'
                                      }}>
                                        {(() => {
                                          const name = channel.channelName
                                          const benchmarkText = isBenchmark ? " (Benchmark)" : ""
                                          const fullText = name + benchmarkText

                                          if (fullText.length <= 24) {
                                            return (
                                              <>
                                                {name}
                                                {isBenchmark && (
                                                  <span className="text-xs text-blue-600 font-normal"> (Benchmark)</span>
                                                )}
                                              </>
                                            )
                                          }

                                          // Break at 24 characters for the first line
                                          const firstLine = fullText.substring(0, 24)
                                          const secondLine = fullText.substring(24)

                                          // If second line is too long (over 24 chars), truncate with ellipsis
                                          const maxSecondLineLength = 24
                                          const displaySecondLine = secondLine.length > maxSecondLineLength
                                            ? secondLine.substring(0, maxSecondLineLength - 3) + "..."
                                            : secondLine

                                          return (
                                            <>
                                              {firstLine}
                                              <br />
                                              {displaySecondLine}
                                            </>
                                          )
                                        })()}
                                      </div>
                                    </div>
                                    <div className="space-y-1 text-xs">
                                      {(() => {
                                        let overallWinMeetLoss;
                                        if (channel.isBrand) {
                                          overallWinMeetLoss = parityDataMain?.otaViolationChannelRate?.overallWinMeetLoss
                                          // Try to calculate parity score from win/meet/loss counts
                                        }
                                        else {
                                          overallWinMeetLoss = channel.channelWisewinMeetLoss
                                        }
                                        const { winPercent, meetPercent, lossPercent } = calculateWinMeetLossPercentages(overallWinMeetLoss)
                                        return (
                                          <>
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 bg-orange-500 rounded-sm"></div>
                                              <span>Win: <span className="font-semibold">{winPercent}%</span></span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
                                              <span>Meet: <span className="font-semibold">{meetPercent}%</span></span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 bg-red-500 rounded-sm"></div>
                                              <span>Loss: <span className="font-semibold">{lossPercent}%</span></span>
                                            </div>
                                          </>
                                        )
                                      })()}
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </td>

                          {/* Overall Parity Score */}
                          <td
                            className={cn(
                              "py-2 px-3 border-r border-border mr-2.5",
                              isSticky && isBenchmark && "sticky left-80 bg-blue-50 dark:bg-blue-950/30 z-10",
                              isSticky && !isBenchmark && "sticky left-80 bg-white dark:bg-slate-950 hover:bg-muted/50 z-10",
                              isBenchmark && "bg-blue-50 dark:bg-blue-950/30" // Benchmark gets special background
                            )}
                          >
                            <div className={cn("flex items-center gap-1", isBenchmark && "cursor-default")}>
                              <span
                                className="font-bold cursor-default text-gray-900"
                                style={{
                                  fontSize: '13px',
                                  color: '#1f2937',
                                  backgroundColor: 'transparent',
                                  display: 'inline-block',
                                  minWidth: '30px'
                                }}
                              >
                                {(() => {
                                  debugger;
                                  let score = channel.channelWisewinMeetLoss?.parityScore || 0

                                  // Special handling for brand channels that might have different data structure
                                  let overallWinMeetLoss;
                                  if (channel.isBrand) {
                                    overallWinMeetLoss = parityDataMain?.otaViolationChannelRate?.overallWinMeetLoss
                                    // Try to calculate parity score from win/meet/loss counts
                                  }
                                  else {
                                    overallWinMeetLoss = channel.channelWisewinMeetLoss
                                  }
                                  const winCount = overallWinMeetLoss?.winCount || 0
                                  const meetCount = overallWinMeetLoss?.meetCount || 0
                                  const lossCount = overallWinMeetLoss?.lossCount || 0
                                  const total = winCount + meetCount + lossCount

                                  if (total > 0) {
                                    score = Math.round(((winCount + meetCount) * 100) / total)
                                  }
                                  return `${score}%`
                                })()}
                              </span>
                            </div>
                          </td>

                          {/* Spacer column */}
                          <td className={cn(
                            "w-1.5 p-0 m-0",
                            isSticky && isBenchmark && "sticky left-96 bg-blue-50 dark:bg-blue-950/30 z-10",
                            isSticky && !isBenchmark && "sticky left-96 bg-white dark:bg-slate-950 hover:bg-muted/50 z-10",

                          )}></td>

                          {/* Daily Results */}
                          {Array.from({ length: needsPagination ? optimalColumns : fullFilteredDates.length }, (_, index) => {
                            // Map display index to actual day index in full dataset
                            const actualDayIndex = needsPagination ? currentPage * optimalColumns + index : index
                            const currentDate = needsPagination ? dateRange[index] : fullFilteredDates[index]
                            const dayData = currentDate ? channel.checkInDateWiseRates?.find((rate: any) => {
                              const rateDate = new Date(rate.checkInDate)
                              return rateDate.getTime() === currentDate.getTime()
                            }) : null
                            const hasData = dayData && index < (needsPagination ? dateRange.length : fullFilteredDates.length)

                            // Dynamic width based on column count - larger cells for fewer columns
                            const cellWidth = needsPagination ? Math.max(60, Math.floor(672 / optimalColumns)) : Math.max(48, Math.floor(672 / fullFilteredDates.length))
                            const adaptiveWidth = needsPagination ? `w-[${cellWidth}px]` : `min-w-[${cellWidth}px]`

                            // Calculate colored cell width based on column count
                            const baseColoredCellWidth = needsPagination
                              ? Math.max(50, Math.floor(672 / optimalColumns) - 8)
                              : Math.max(40, Math.floor(672 / fullFilteredDates.length) - 8)
                            const shouldReduceWidth = !needsPagination && [3, 7, 10].includes(fullFilteredDates.length)
                            const reducedWidth = shouldReduceWidth ? Math.floor(baseColoredCellWidth * 0.95) : baseColoredCellWidth
                            const adaptiveCellWidth = needsPagination ? `w-[${reducedWidth}px]` : `w-[${reducedWidth}px]`

                            // Position tooltip on left for last 2 columns to prevent overflow
                            const totalColumns = needsPagination ? optimalColumns : fullFilteredDates.length
                            const isLastTwoColumns = index >= totalColumns - 2
                            const tooltipSide = isLastTwoColumns ? "left" : "top"

                            return (
                              <td key={index} className={cn(
                                "py-1 px-0.5 text-center",
                                adaptiveWidth,
                                isBenchmark && "cursor-default",

                              )}>
                                {hasData ? (
                                  isBenchmark ? (
                                    // Row 2 (Benchmark) - Show rate values with colored boxes and tooltip
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div
                                          className={cn(
                                            `relative ${adaptiveCellWidth} h-6 flex items-center justify-center rounded text-[10px] font-bold border cursor-pointer transition-all hover:scale-105`,
                                            parityData.length > 0
                                              ? getStatusColorClass("")
                                              : getResultColor(dayData.parityVsBaseLine, channel.channelWisewinMeetLoss?.parityScore, channel.isBrand, dayData.checkInDate, channelIndex),
                                          )}
                                        >
                                          {(() => {
                                            const dayOfMonth = getDayOfMonth(dayData.checkInDate)
                                            // if (dayOfMonth === 30) return 'Sold Out'
                                            // if (dayOfMonth === 31 && isSoldOutForDate31(channelIndex, dayData.checkInDate)) return 'Sold Out'

                                            // Get rate from API - use 0 if not available, but still display it
                                            if (dayData.rate == 0 && dayData.statusMessage == "Closed") {
                                              return <span>Sold Out</span>;
                                            } else if (dayData.rate == 0 && dayData.statusMessage !== "Closed") {
                                              return <span>--</span>;
                                            }
                                            const apiRate = dayData.rate || 0

                                            // Check for violations using API boolean values
                                            const hasAvailViolation = dayData.availViolation || false
                                            const hasRateViolation = dayData.rateViolation || false

                                            // Show violation indicators if any violation exists
                                            if (hasAvailViolation || hasRateViolation) {
                                              const rateText = formatIDR(apiRate)
                                              // Use API boolean values to determine violation type
                                              const violationType = hasAvailViolation ? 'A' : 'R'

                                              return (
                                                <div className="flex items-center justify-center gap-1">
                                                  <span>{rateText}</span>
                                                  <div className="w-[13px] h-[13px] rounded-full border  flex items-center justify-center">
                                                    <span className="text-[8px] font-bold ">
                                                      {violationType}
                                                    </span>
                                                  </div>
                                                </div>
                                              )
                                            }

                                            return formatIDR(apiRate)
                                          })()}
                                        </div>
                                      </TooltipTrigger>
                                      {dayData.rate > 0 &&
                                        <TooltipContent
                                          side={tooltipSide}
                                          sideOffset={8}
                                          avoidCollisions={true}
                                          collisionPadding={16}
                                          className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-3 min-w-[500px] max-w-[700px] w-fit pointer-events-none"
                                        >
                                          {/* Date Heading - Left Aligned */}
                                          <div className="mb-2">
                                            <h3 className="text-gray-900 dark:text-white text-left">
                                              <span className="text-base font-bold">{format(new Date(dayData.checkInDate), "dd MMM yyyy")}</span>
                                              <span className="text-sm font-normal">{`, ${format(new Date(dayData.checkInDate), 'EEE')}`}</span>
                                            </h3>
                                          </div>

                                          {/* Semantic Table Structure */}
                                          <div className="mt-4">
                                            {(() => {
                                              // Get actual API data from checkInDateWiseRates
                                              const channelName = `${BENCHMARK_CHANNEL_NAME} Benchmark`
                                              const truncatedChannelName = channelName.length > 12 ? `${channelName.substring(0, 9)}...` : channelName
                                              const dayOfMonth = getDayOfMonth(dayData.checkInDate)

                                              if (dayData.rate == 0 && dayData.statusMessage == "Closed") {
                                                return <span>Sold Out</span>;
                                              } else if (dayData.rate == 0 && dayData.statusMessage !== "Closed") {
                                                return <span>--</span>;
                                              }
                                              const apiRate = dayData.rate || 0

                                              // Get rate from API - use 0 if not available, but still display it
                                              const rateText = formatNumber(apiRate)
                                              const truncatedRate = rateText.length > 11 ? `${rateText.substring(0, 8)}...` : rateText

                                              // Get room type from API
                                              const roomType = dayData.toolTipProductName || ''
                                              const formattedRoom = formatRoomText(roomType)

                                              // Get inclusion from API
                                              const inclusion = dayData.inclusion
                                              const formattedInclusion = formatInclusionText(inclusion)

                                              // Fixed column widths
                                              const channelWidth = '120px'
                                              const rateWidth = '100px'
                                              const roomWidth = '150px'
                                              const inclusionWidth = '150px'

                                              return (
                                                <table className="w-full text-xs" style={{ tableLayout: 'auto', borderSpacing: '0 0' }}>
                                                  <thead>
                                                    <tr className="text-gray-500 dark:text-slate-400 font-medium">
                                                      <th className="text-left pb-2" style={{ width: channelWidth, paddingLeft: '4px', paddingRight: '16px' }}>Channel</th>
                                                      <th className="text-left pb-2" style={{ width: rateWidth, paddingRight: '16px' }}>Rate ({CURRENCY_SYMBOL})</th>
                                                      <th className="text-left pb-2" style={{ width: roomWidth, paddingRight: '16px' }}>Room</th>
                                                      <th className="text-left pb-2" style={{ width: inclusionWidth }}>Inclusion</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="space-y-1">
                                                    <tr className="bg-blue-50 dark:bg-blue-900/30">
                                                      {/* Channel */}
                                                      <td className="py-1.5 align-top rounded-l align-top" style={{ width: channelWidth, paddingLeft: '4px', paddingRight: '16px' }}>
                                                        <span className="font-medium text-blue-900 dark:text-blue-200" title={`${BENCHMARK_CHANNEL_NAME} Benchmark`}>
                                                          {(() => {
                                                            const benchmarkChannelName = `${BENCHMARK_CHANNEL_NAME} Benchmark`

                                                            // Custom formatting for benchmark to show only 2 lines max with ellipsis and hyphen for word breaks
                                                            if (benchmarkChannelName.length <= 12) {
                                                              return benchmarkChannelName
                                                            } else {
                                                              // Find the best break point around character 12
                                                              let breakPoint = 12
                                                              const char12 = benchmarkChannelName.charAt(12)
                                                              const char11 = benchmarkChannelName.charAt(11)

                                                              // Check if we're breaking in the middle of a word
                                                              const isWordBreak = char12 && char12 !== ' ' && char11 !== ' '

                                                              let firstLine = benchmarkChannelName.substring(0, breakPoint)
                                                              let secondLine = benchmarkChannelName.substring(breakPoint)

                                                              // Add hyphen if breaking in middle of word
                                                              if (isWordBreak && firstLine.length > 0) {
                                                                firstLine += '-'
                                                              }

                                                              // If second line is too long, truncate with ellipsis
                                                              if (secondLine.length > 9) {
                                                                secondLine = secondLine.substring(0, 6) + '...'
                                                              }

                                                              return (
                                                                <div className="text-left">
                                                                  <div className="leading-tight">{firstLine}</div>
                                                                  <div className="leading-tight">{secondLine}</div>
                                                                </div>
                                                              )
                                                            }
                                                          })()}
                                                        </span>
                                                      </td>

                                                      {/* Rate */}
                                                      <td className="py-1.5 align-top text-left font-bold text-blue-900 dark:text-blue-200" style={{ width: rateWidth, paddingRight: '16px' }}>
                                                        <div className="truncate" title={rateText}>
                                                          {dayData.rate == 0 && dayData.statusMessage == "Closed" ? 'Sold Out' :
                                                            dayData.rate == 0 && dayData.statusMessage !== "Closed" ? "--" : truncatedRate}
                                                        </div>
                                                      </td>

                                                      {/* Room type */}
                                                      <td className="py-1.5 align-top text-left text-blue-900 dark:text-blue-200" style={{ width: roomWidth, paddingRight: '16px' }}>
                                                        {typeof formattedRoom === 'string' ? (
                                                          <div title={roomType}>{formattedRoom}</div>
                                                        ) : (
                                                          <div title={roomType}>
                                                            <div className="leading-tight">{formattedRoom.firstLine}</div>
                                                            <div className="leading-tight">{formattedRoom.secondLine}</div>
                                                          </div>
                                                        )}
                                                      </td>

                                                      {/* Inclusion */}
                                                      <td className="py-1.5 align-top text-left text-blue-900 dark:text-blue-200 rounded-r" style={{ width: inclusionWidth }}>
                                                        {typeof formattedInclusion === 'string' ? (
                                                          <div title={inclusion}>{formattedInclusion}</div>
                                                        ) : (
                                                          <div title={inclusion}>
                                                            <div className="leading-tight">{formattedInclusion.firstLine}</div>
                                                            <div className="leading-tight">{formattedInclusion.secondLine}</div>
                                                          </div>
                                                        )}
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              )
                                            })()}
                                          </div>
                                        </TooltipContent>
                                      }
                                    </Tooltip>
                                  ) : (
                                    // Regular rows - with tooltip and styling
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div
                                          className={cn(
                                            `relative ${adaptiveCellWidth} h-6 flex items-center justify-center rounded text-[10px] font-bold border cursor-pointer transition-all hover:scale-105`,
                                            isBenchmark && parityData.length > 0
                                              ? getStatusColorClass("")
                                              : getResultColor(dayData.parityVsBaseLine, channel.channelWisewinMeetLoss?.parityScore, channel.isBrand, dayData.checkInDate, channelIndex),
                                          )}
                                        >
                                          {(() => {
                                            const dayOfMonth = getDayOfMonth(dayData.checkInDate)
                                            if (dayData.rate == 0 && dayData.statusMessage == "Closed") {
                                              return <span>Sold Out</span>;
                                            } else if (dayData.rate == 0 && dayData.statusMessage !== "Closed") {
                                              return <span>--</span>;
                                            }
                                            const apiRate = dayData.rate || 0

                                            // Check for violations using API boolean values
                                            const hasAvailViolation = dayData.availViolation || false
                                            const hasRateViolation = dayData.rateViolation || false

                                            // Show violation indicators if any violation exists
                                            if (hasAvailViolation || hasRateViolation) {
                                              const rateText = formatIDR(apiRate)
                                              // Use API boolean values to determine violation type
                                              const violationType = hasAvailViolation ? 'A' : 'R'

                                              return (
                                                <div className="flex items-center justify-center gap-1">
                                                  <span>{rateText}</span>
                                                  <div className="w-[13px] h-[13px] rounded-full border border-red-500 flex items-center justify-center">
                                                    <span className="text-[8px] font-bold text-red-500">
                                                      {violationType}
                                                    </span>
                                                  </div>
                                                </div>
                                              )
                                            }

                                            return formatIDR(apiRate)
                                          })()}
                                        </div>
                                      </TooltipTrigger>
                                      {dayData.rate > 0 &&
                                        <TooltipContent
                                          side={tooltipSide}
                                          sideOffset={8}
                                          avoidCollisions={true}
                                          collisionPadding={16}
                                          className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-3 min-w-[500px] max-w-[700px] w-fit pointer-events-none"
                                        >
                                          {/* Date Heading - Left Aligned */}
                                          <div className="mb-2">
                                            <h3 className="text-gray-900 dark:text-white text-left">
                                              <span className="text-base font-bold">{format(new Date(dayData.checkInDate), "dd MMM yyyy")}</span>
                                              <span className="text-sm font-normal">{`, ${format(new Date(dayData.checkInDate), 'EEE')}`}</span>
                                            </h3>
                                          </div>

                                          {/* Semantic Table Structure */}
                                          <div className="mt-4">
                                            <table className="w-full text-xs" style={{ tableLayout: 'auto' }}>
                                              <thead>
                                                <tr className="text-gray-500 dark:text-slate-400 font-medium">
                                                  <th className="text-left pb-2" style={{ width: '80px', paddingLeft: '4px' }}>Channel</th>
                                                  <th className="text-left pb-2 pl-4" style={{ minWidth: '90px', maxWidth: '140px' }}>Rate ({CURRENCY_SYMBOL})</th>
                                                  <th className="text-left pb-2 pl-4" style={{ minWidth: '120px', maxWidth: '200px', paddingRight: '16px' }}>Room</th>
                                                  <th className="text-left pb-2 pl-4" style={{ minWidth: '70px', maxWidth: '120px' }}>Inclusion</th>
                                                </tr>
                                              </thead>
                                              <tbody className="space-y-1">
                                                {isBenchmark ? (
                                                  /* Benchmark channels (1st and 2nd row) - single row with actual channel name only */
                                                  <tr className="bg-blue-50 dark:bg-blue-900/30">
                                                    {/* Channel */}
                                                    <td className="py-1.5 align-top pr-2 rounded-l" style={{ width: '80px', paddingLeft: '4px' }}>
                                                      <span className="font-medium text-blue-900 dark:text-blue-200" title={isBenchmark ? `${BENCHMARK_CHANNEL_NAME} Benchmark` : channel.channelName}>
                                                        {isBenchmark ? (() => {
                                                          const benchmarkChannelName = `${BENCHMARK_CHANNEL_NAME} Benchmark`

                                                          // Custom formatting for benchmark to show only 2 lines max with ellipsis and hyphen for word breaks
                                                          if (benchmarkChannelName.length <= 12) {
                                                            return benchmarkChannelName
                                                          } else {
                                                            // Find the best break point around character 12
                                                            let breakPoint = 12
                                                            const char12 = benchmarkChannelName.charAt(12)
                                                            const char11 = benchmarkChannelName.charAt(11)

                                                            // Check if we're breaking in the middle of a word
                                                            const isWordBreak = char12 && char12 !== ' ' && char11 !== ' '

                                                            let firstLine = benchmarkChannelName.substring(0, breakPoint)
                                                            let secondLine = benchmarkChannelName.substring(breakPoint)

                                                            // Add hyphen if breaking in middle of word
                                                            if (isWordBreak && firstLine.length > 0) {
                                                              firstLine += '-'
                                                            }

                                                            // If second line is too long, truncate with ellipsis  
                                                            if (secondLine.length > 9) {
                                                              secondLine = secondLine.substring(0, 6) + '...'
                                                            }

                                                            return (
                                                              <div className="text-left">
                                                                <div className="leading-tight">{firstLine}</div>
                                                                <div className="leading-tight">{secondLine}</div>
                                                              </div>
                                                            )
                                                          }
                                                        })() : channel.channelName
                                                        }
                                                      </span>
                                                    </td>

                                                    {/* Rate */}
                                                    <td className="py-1.5 align-top pl-4 pr-2 text-left font-bold text-blue-900 dark:text-blue-200" style={{ minWidth: '90px', maxWidth: '140px' }}>
                                                      {(() => {
                                                        const dayOfMonth = getDayOfMonth(dayData.checkInDate)
                                                        if (dayData.rate == 0 && dayData.statusMessage == "Closed") {
                                                          return <span>Sold Out</span>;
                                                        } else if (dayData.rate == 0 && dayData.statusMessage !== "Closed") {
                                                          return <span>--</span>;
                                                        }
                                                        const apiRate = dayData.rate || 0
                                                        // Use actual rate from API response for benchmark
                                                        const benchmarkRate = benchmarkChannel?.checkInDateWiseRates?.find((rate: any) => {
                                                          const rateDate = new Date(rate.checkInDate)
                                                          return rateDate.getTime() === currentDate.getTime()
                                                        })?.rate || BASE_RATE_IDR
                                                        return <span>{formatNumber(benchmarkRate)}</span>
                                                      })()}
                                                    </td>

                                                    {/* Room with abbreviation */}
                                                    <td className="py-1.5 align-top pl-4 pr-2 text-left text-blue-900 dark:text-blue-200" style={{ width: '150px', paddingRight: '16px' }}>
                                                      {(() => {
                                                        const roomType = dayData.toolTipProductName || ''
                                                        const formattedRoom = formatRoomText(roomType)

                                                        if (typeof formattedRoom === 'string') {
                                                          return <div title={roomType}>{formattedRoom}</div>
                                                        } else {
                                                          return (
                                                            <div title={roomType}>
                                                              <div className="leading-tight">{formattedRoom.firstLine}</div>
                                                              <div className="leading-tight">{formattedRoom.secondLine}</div>
                                                            </div>
                                                          )
                                                        }
                                                      })()}
                                                    </td>

                                                    {/* Inclusion */}
                                                    <td className="py-1.5 align-top pl-4 pr-2 text-left text-blue-900 dark:text-blue-200" style={{ width: '130px' }}>
                                                      {(() => {
                                                        const inclusion = dayData.inclusion
                                                        const formattedInclusion = formatInclusionText(inclusion)

                                                        if (typeof formattedInclusion === 'string') {
                                                          return <div title={inclusion}>{formattedInclusion}</div>
                                                        } else {
                                                          return (
                                                            <div title={inclusion}>
                                                              <div className="leading-tight">{formattedInclusion.firstLine}</div>
                                                              <div className="leading-tight">{formattedInclusion.secondLine}</div>
                                                            </div>
                                                          )
                                                        }
                                                      })()}
                                                    </td>
                                                  </tr>
                                                ) : (
                                                  /* Regular channel - show all 3 rows as before */
                                                  <>
                                                    {/* Benchmark Channel Row (MakeMyTrip) */}
                                                    <tr className="bg-blue-50 dark:bg-blue-900/30">
                                                      {/* Channel */}
                                                      <td className="py-1.5 align-top pr-2 rounded-l" style={{ width: '80px', paddingLeft: '4px' }}>
                                                        <span className="font-medium truncate text-blue-900 dark:text-blue-200" title={BENCHMARK_CHANNEL_NAME}>
                                                          {getBenchmarkDisplayName()}
                                                        </span>
                                                      </td>

                                                      {/* Rate */}
                                                      <td className="py-1.5 align-top pl-4 pr-2 text-left font-bold text-blue-900 dark:text-blue-200" style={{ minWidth: '90px', maxWidth: '140px' }}>
                                                        {(() => {
                                                          const benchmarkRate = benchmarkChannel?.checkInDateWiseRates?.find((rate: any) => {
                                                            const rateDate = new Date(rate.checkInDate)
                                                            return rateDate.getTime() === new Date(dayData.checkInDate).getTime()
                                                          })

                                                          const benchmarkDatas = benchmarkRate.rate == 0 && benchmarkRate.statusMessage == "Closed" ? 'Sold Out' :
                                                            benchmarkRate.rate == 0 && benchmarkRate.statusMessage !== "Closed" ? "--" : formatNumber(benchmarkRate.rate)

                                                          return benchmarkDatas;
                                                        })()}
                                                      </td>

                                                      {/* Room with abbreviation */}
                                                      <td className="py-1.5 align-top pl-4 pr-2 text-left text-blue-900 dark:text-blue-200" style={{ width: '180px', paddingRight: '16px' }}>
                                                        {(() => {
                                                          const benchmarkRate = benchmarkChannel?.checkInDateWiseRates?.find((rate: any) => {
                                                            const rateDate = new Date(rate.checkInDate)
                                                            return rateDate.getTime() === new Date(dayData.checkInDate).getTime()
                                                          })
                                                          const roomType = benchmarkRate.toolTipProductName || ''
                                                          // console.log("BenchMark", benchmarkRate);
                                                          // const formattedRoom = formatRoomText(roomType)
                                                          let formattedRoom;
                                                          if (dayData.rate == 0 && dayData.statusMessage == "Closed") {
                                                            formattedRoom = ""
                                                          } else if (dayData.rate == 0 && dayData.statusMessage !== "Closed") {
                                                            formattedRoom = ""
                                                          }
                                                          else {
                                                            formattedRoom = formatRoomText(roomType)
                                                          }
                                                          if (typeof formattedRoom === 'string') {
                                                            return <div title={roomType}>{formattedRoom}</div>
                                                          } else {
                                                            return (
                                                              <div title={roomType}>
                                                                <div className="leading-tight">{formattedRoom.firstLine}</div>
                                                                <div className="leading-tight">{formattedRoom.secondLine}</div>
                                                              </div>
                                                            )
                                                          }
                                                        })()}
                                                      </td>

                                                      {/* Inclusion */}
                                                      <td className="py-1.5 align-top pl-4 pr-2 text-left text-blue-900 dark:text-blue-200" style={{ width: '180px' }}>
                                                        {(() => {
                                                          const benchmarkRate = benchmarkChannel?.checkInDateWiseRates?.find((rate: any) => {
                                                            const rateDate = new Date(rate.checkInDate)
                                                            return rateDate.getTime() === new Date(dayData.checkInDate).getTime()
                                                          })
                                                          const inclusion = benchmarkRate.inclusion
                                                          // const formattedInclusion = formatInclusionText(inclusion)
                                                          let formattedInclusion;
                                                          if (dayData.rate == 0 && dayData.statusMessage == "Closed") {
                                                            formattedInclusion = ""
                                                          } else if (dayData.rate == 0 && dayData.statusMessage !== "Closed") {
                                                            formattedInclusion = ""
                                                          }
                                                          else {
                                                            formattedInclusion = formatInclusionText(inclusion)
                                                          }

                                                          if (typeof formattedInclusion === 'string') {
                                                            return <div title={inclusion}>{formattedInclusion}</div>
                                                          } else {
                                                            return (
                                                              <div title={inclusion}>
                                                                <div className="leading-tight">{formattedInclusion.firstLine}</div>
                                                                <div className="leading-tight">{formattedInclusion.secondLine}</div>
                                                              </div>
                                                            )
                                                          }
                                                        })()}
                                                      </td>
                                                    </tr>

                                                    {/* Hovered Channel Row */}
                                                    <tr>
                                                      {/* Channel */}
                                                      <td className="py-1.5 align-top pr-2 rounded-l" style={{ width: '80px', paddingLeft: '4px' }}>
                                                        <span className="font-medium truncate text-gray-900 dark:text-slate-100" title={channel.channelName}>
                                                          {channel.channelName.length > 12 ? `${channel.channelName.substring(0, 9)}...` : channel.channelName}
                                                        </span>
                                                      </td>

                                                      {/* Rate */}
                                                      <td className="py-1.5 align-top pl-4 pr-2 text-left font-bold text-gray-900 dark:text-slate-100" style={{ minWidth: '90px', maxWidth: '140px' }}>
                                                        {(() => {
                                                          const dayOfMonth = getDayOfMonth(dayData.checkInDate)
                                                          if (dayData.rate == 0 && dayData.statusMessage == "Closed") {
                                                            return <span>Sold Out</span>;
                                                          } else if (dayData.rate == 0 && dayData.statusMessage !== "Closed") {
                                                            return <span>--</span>;
                                                          }


                                                          // Get rate from API - use 0 if not available, but still display it
                                                          const apiRate = dayData.rate || 0
                                                          return formatNumber(apiRate)
                                                        })()}
                                                      </td>

                                                      {/* Room with abbreviation */}
                                                      <td className="py-1.5 align-top pl-4 pr-2 text-left text-gray-900 dark:text-slate-100" style={{ width: '180px', paddingRight: '16px' }}>
                                                        {(() => {
                                                          const roomType = dayData.toolTipProductName || ''
                                                          const formattedRoom = formatRoomText(roomType)

                                                          if (typeof formattedRoom === 'string') {
                                                            return <div title={roomType}>{formattedRoom}</div>
                                                          } else {
                                                            return (
                                                              <div title={roomType}>
                                                                <div className="leading-tight">{formattedRoom.firstLine}</div>
                                                                <div className="leading-tight">{formattedRoom.secondLine}</div>
                                                              </div>
                                                            )
                                                          }
                                                        })()}
                                                      </td>

                                                      {/* Inclusion */}
                                                      <td className="py-1.5 align-top pl-4 pr-2 text-left text-gray-900 dark:text-slate-100" style={{ width: '180px' }}>
                                                        {(() => {
                                                          const inclusion = dayData.inclusion
                                                          const formattedInclusion = formatInclusionText(inclusion)

                                                          if (typeof formattedInclusion === 'string') {
                                                            return <div title={inclusion}>{formattedInclusion}</div>
                                                          } else {
                                                            return (
                                                              <div title={inclusion}>
                                                                <div className="leading-tight">{formattedInclusion.firstLine}</div>
                                                                <div className="leading-tight">{formattedInclusion.secondLine}</div>
                                                              </div>
                                                            )
                                                          }
                                                        })()}
                                                      </td>
                                                    </tr>

                                                    {/* Rate Difference Row - Hide for sold out dates */}
                                                    {(() => {
                                                      const dayOfMonth = getDayOfMonth(dayData.checkInDate)
                                                      // if (dayOfMonth === 30) {
                                                      //   return null // Don't render difference row for sold out dates
                                                      // }
                                                      // if (dayOfMonth === 31 && isSoldOutForDate31(channelIndex, dayData.checkInDate)) {
                                                      //   return null // Don't render difference row for sold out channels on date 31
                                                      // }

                                                      return (
                                                        <tr>
                                                          {/* Difference label in Channel column - only show for Win/Loss, empty for Meet */}
                                                          <td className="py-1.5 align-top pr-2 text-left font-normal" style={{ width: '80px', paddingLeft: '4px', borderTop: '1px solid #e5e7eb' }}>
                                                            {(() => {
                                                              // Check if this is a meet state by calculating the difference
                                                              const dayOfMonth = getDayOfMonth(dayData.checkInDate)
                                                              // if (dayOfMonth === 31) {
                                                              //   const isBenchmarkSoldOut = isBenchmarkSoldOutForDate31(dayData.checkInDate)
                                                              //   const isCurrentChannelSoldOut = isSoldOutForDate31(channelIndex, dayData.checkInDate)
                                                              //   if (isBenchmarkSoldOut && !isCurrentChannelSoldOut) {
                                                              //     return 'Difference' // Show for sold out case
                                                              //   }
                                                              // }

                                                              // Get rates from API for difference calculation
                                                              const benchmarkRate = benchmarkChannel?.checkInDateWiseRates?.find((rate: any) => {
                                                                const rateDate = new Date(rate.checkInDate)
                                                                return rateDate.getTime() === new Date(dayData.checkInDate).getTime()
                                                              })?.rate || 0

                                                              const channelRate = dayData.rate || 0
                                                              const difference = benchmarkRate - channelRate

                                                              return difference === 0 ? '' : 'Difference'
                                                            })()}
                                                          </td>

                                                          {/* +/- values with currency in Rate column */}
                                                          <td
                                                            className="py-1.5 align-top pl-4 pr-2 text-left"
                                                            style={{ minWidth: '90px', maxWidth: '140px', borderTop: '1px solid #e5e7eb' }}
                                                          >
                                                            {(() => {
                                                              // Special case for date 31 when benchmark is sold out but current channel has rates
                                                              const dayOfMonth = getDayOfMonth(dayData.checkInDate)
                                                              // if (dayOfMonth === 31) {
                                                              //   const isBenchmarkSoldOut = isBenchmarkSoldOutForDate31(dayData.checkInDate)
                                                              //   const isCurrentChannelSoldOut = isSoldOutForDate31(channelIndex, dayData.checkInDate)

                                                              //   if (isBenchmarkSoldOut && !isCurrentChannelSoldOut) {
                                                              //     // When benchmark is sold out but current channel has rates
                                                              //     // Show loss state logic with red color and + values
                                                              //     const channelVariation = channel.channelName.length * 100000
                                                              //     const currentDate = new Date(dayData.checkInDate)
                                                              //     const startOfRange = dateRange[0] || currentDate
                                                              //     const dayVariation = Math.floor((currentDate.getTime() - startOfRange.getTime()) / (1000 * 60 * 60 * 24)) * 50000

                                                              //     let channelRate = BASE_RATE_IDR
                                                              //     const result = dayData.result

                                                              //     if (result === 'W') {
                                                              //       channelRate = BASE_RATE_IDR + 500000 + (channelVariation % 2000000) + dayVariation
                                                              //     } else if (result === 'L') {
                                                              //       channelRate = BASE_RATE_IDR - 500000 - (channelVariation % 1500000) - dayVariation
                                                              //     } else {
                                                              //       channelRate = BASE_RATE_IDR
                                                              //     }

                                                              //     channelRate = Math.max(channelRate, 8000000)
                                                              //     const difference = channelRate // Since benchmark is sold out, show full channel rate as positive difference

                                                              //     return (
                                                              //       <span className="text-red-600 dark:text-red-400 font-bold">
                                                              //         +{formatNumber(difference)}
                                                              //       </span>
                                                              //     )
                                                              //   }
                                                              // }

                                                              // Get rates from API
                                                              const benchmarkRate = benchmarkChannel?.checkInDateWiseRates?.find((rate: any) => {
                                                                const rateDate = new Date(rate.checkInDate)
                                                                return rateDate.getTime() === new Date(dayData.checkInDate).getTime()
                                                              })?.rate || 0

                                                              const channelRate = dayData.rate || 0
                                                              const difference = benchmarkRate - channelRate  // Benchmark rate - Channel rate

                                                              // Color and text based on difference
                                                              let varianceColor, varianceText

                                                              if (difference === 0) {
                                                                // Meet: Same price
                                                                varianceColor = 'text-gray-500 dark:text-slate-400'
                                                                varianceText = 'No difference'
                                                              } else if (difference < 0) {
                                                                // Negative difference: Channel rate is higher than benchmark (red)
                                                                varianceColor = 'text-red-600 dark:text-red-400'
                                                                varianceText = `-${formatNumber(Math.abs(difference))}`
                                                              } else {
                                                                // Positive difference: Channel rate is lower than benchmark (green)
                                                                varianceColor = 'text-green-600 dark:text-green-400'
                                                                varianceText = `+${formatNumber(Math.abs(difference))}`
                                                              }

                                                              return (
                                                                <span className={`${varianceColor} ${difference === 0 ? 'font-normal' : 'font-bold'}`}>
                                                                  {varianceText}
                                                                </span>
                                                              )
                                                            })()}
                                                          </td>

                                                          {/* Conditional A/R Legend in Room column - only show if cell has violation */}
                                                          <td className="py-1.5 align-top pl-4 pr-2" style={{ minWidth: '120px', maxWidth: '200px', paddingRight: '16px', borderTop: '1px solid #e5e7eb' }}>
                                                            {(dayData.availViolation || dayData.rateViolation) && (
                                                              <div className="flex items-center justify-start">
                                                                {(() => {
                                                                  // Use API boolean values to determine violation type
                                                                  const hasAvailViolation = dayData.availViolation || false
                                                                  const hasRateViolation = dayData.rateViolation || false

                                                                  // Show availability violation if both are true, otherwise show rate violation
                                                                  const violationType = hasAvailViolation ? 'A' : 'R'

                                                                  return (
                                                                    <div className="flex items-center gap-1">
                                                                      <div className="w-[13px] h-[13px] rounded-full border border-red-500 flex items-center justify-center">
                                                                        <span className="text-[8px] font-bold text-red-500">{violationType}</span>
                                                                      </div>
                                                                      <span className="text-xs font-normal text-red-600 dark:text-red-400">
                                                                        {violationType === 'A' ? 'Availability Violation' : 'Rate Violation'}
                                                                      </span>
                                                                    </div>
                                                                  )
                                                                })()}
                                                              </div>
                                                            )}
                                                          </td>

                                                          {/* Empty Inclusion column */}
                                                          <td className="py-1.5 align-top pl-4 pr-2" style={{ minWidth: '70px', maxWidth: '120px', borderTop: '1px solid #e5e7eb' }}>
                                                          </td>
                                                        </tr>
                                                      )
                                                    })()}
                                                  </>
                                                )}
                                              </tbody>
                                            </table>
                                          </div>
                                        </TooltipContent>
                                      }
                                    </Tooltip>
                                  )
                                ) : (
                                  // Empty cell for dates beyond the available range or no-data case
                                  (() => {
                                    // Check if this is specifically January 29th for specific channels no-data showcase
                                    const currentDate = dateRange[actualDayIndex]
                                    const isJan29NoData = currentDate &&
                                      format(currentDate, 'dd MMM') === '29 Jan' &&
                                      (channelIndex === 2 || channelIndex === 3) // Show no-data for Trivago and Booking.com channels (after filtering out first row)

                                    if (isJan29NoData) {
                                      // Special styling for 29 Jan no-data case for specific channels:
                                      // - Remove background and border color
                                      // - Show -- only
                                      // - No tooltip, no hover effect
                                      return (
                                        <div className={`${adaptiveCellWidth} h-6 flex items-center justify-center text-black dark:text-white text-[10px] font-normal`}>
                                          --
                                        </div>
                                      )
                                    } else {
                                      // Regular empty cell
                                      return <div className={`${adaptiveCellWidth} h-6`}></div>
                                    }
                                  })()
                                )}
                              </td>
                            )
                          })}

                          {/* End spacer column */}
                          <td className={cn(
                            "w-1.5 p-0 m-0",

                          )}></td>
                        </tr>
                      )
                    })
                  })()}
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
              <div className="flex items-center gap-1.5">
                <div className="w-[13px] h-[13px] rounded-full border border-red-500 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-red-500">A</span>
                </div>
                <span className="text-foreground font-medium">Availability Violation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-[13px] h-[13px] rounded-full border border-red-500 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-red-500">R</span>
                </div>
                <span className="text-foreground font-medium">Rate Violation</span>
              </div>

            </div>
          </div>
        </CardContent>
      </div>
    </TooltipProvider>
  )
}
