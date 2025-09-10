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
  roomType?: string // Optional for tooltip
  inclusion?: string // Optional for tooltip
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
  const [optimalColumns, setOptimalColumns] = useState(7)

  // Static total days for demo purposes (Jan 28 - Feb 10, 2025 = 14 days)
  const totalDays = 14
  
  // Determine optimal columns - fixed to 7 days with wider cells
  const getOptimalColumns = () => {
    // Always return 7 to show only 7 days with wider cells for better A/R indicator visibility
    return 7
  }
  
  const needsPagination = totalDays > optimalColumns
  const isSticky = needsPagination

  // Generate static date range for demo purposes with realistic check-in dates
  const generateDateRange = () => {
    // Generate static dates starting from January 28, 2025 to include dates 30 and 31
    // This ensures we can demonstrate all use cases including sold out scenarios
    const staticStartDate = new Date('2025-01-28') // Start on 28th
    const staticDates = []
    
    // Generate 14 consecutive dates starting from Jan 28, 2025
    // This will include Jan 28, 29, 30, 31, Feb 1, 2, 3... up to Feb 10
    for (let i = 0; i < 14; i++) {
      const date = new Date(staticStartDate)
      date.setDate(staticStartDate.getDate() + i)
      staticDates.push(date)
    }
    
    // If total days <= optimal columns, show all dates
    if (staticDates.length <= optimalColumns) {
      return staticDates
    }
    
    // For pagination, show a subset based on current page
    const startIndex = Math.max(0, Math.min(currentPage * optimalColumns, staticDates.length - optimalColumns))
    const endIndex = Math.min(startIndex + optimalColumns, staticDates.length)
    
    return staticDates.slice(startIndex, endIndex)
  }

  const dateRange = generateDateRange()



  // Sample data for 10 channels (when no API data is available)
  const generateSampleData = (): ChannelParityData[] => {
    const sampleChannels = [
      { name: "", isHotel: false, winPercent: 0, meetPercent: 0, lossPercent: 0, parityScore: 0 },
      { name: "MakeMYTrip Benchmark", isHotel: true, winPercent: 45, meetPercent: 35, lossPercent: 20, parityScore: 65 },
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

    const generatedData = sampleChannels.map((channel, index) => {
      // Generate sample daily data for each channel for all 14 static dates
      const staticStartDate = new Date('2025-01-28')
      const allStaticDates = []
      for (let i = 0; i < 14; i++) {
        const date = new Date(staticStartDate)
        date.setDate(staticStartDate.getDate() + i)
        allStaticDates.push(date)
      }
      
      const dailyData: ParityDayData[] = allStaticDates.map((date, dayIndex) => {
        // Check if this is January 29th - if so, return null data to trigger no-data display
        const dateStr = format(date, 'dd MMM')
        const isJan29 = dateStr === '29 Jan'
        
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
          // MakeMyTrip - show percentage scores with page variation and specific dates
          const dayOfMonth = parseInt(format(date, 'dd'))
          
          if (dayOfMonth === 30) {
            // Force 100% for January 30th
            parityScore = 100
            result = 'W'
          } else if (dayOfMonth === 31) {
            // Force 78% for January 31st
            parityScore = 78
            result = 'W'
          } else {
            // Use normal pattern for other dates
          const scores = [67, 25, 45, 29, 55, 45, 26, 26, 55, 26, 77, 72, 67, 87, 55]
            const adjustedScoreIndex = dayIndex % scores.length
            parityScore = scores[adjustedScoreIndex]
          result = parityScore >= 50 ? 'W' : parityScore >= 30 ? 'M' : 'L'
          }
        } else {
          // Other channels - use WLM patterns
          const patternIndex = (index - 1) % (patterns.length - 1) + 1
          const pattern = patterns[patternIndex]
          // Use consistent pattern without page variation
          const adjustedDayIndex = dayIndex % pattern.length
          result = pattern[adjustedDayIndex] as 'W' | 'M' | 'L'
          
          // Convert result to score (deterministic for SSR)
          const scoreVariation = (dayIndex + index) % 20; // Deterministic variation
          switch (result) {
            case 'W': parityScore = 70 + scoreVariation; break
            case 'M': parityScore = 40 + scoreVariation; break
            case 'L': parityScore = 15 + scoreVariation; break
          }
        }

        // For January 29th, return null data only for specific channels (index 2 and 3 - Trivago and Google Hotels)
        // But add sample data for Expedia (index 5) and Trip Advisor (index 6) to test truncation
        if (isJan29 && (index === 2 || index === 3)) {
          return null as any // This will cause hasData to be false in the rendering logic
        }
        
        // Add long sample data for Expedia and Trip Advisor on Jan 29 to test truncation
        if (isJan29 && (index === 5 || index === 6)) {
          return {
            date: format(date, 'yyyy-MM-dd'),
            dateFormatted: format(date, 'dd MMM'),
            winCount: result === 'W' ? 1 : 0,
            meetCount: result === 'M' ? 1 : 0,
            lossCount: result === 'L' ? 1 : 0,
            parityScore,
            result,
            violations: (dayIndex + index) % 5 === 0 ? 1 : 0,
            roomType: 'Deluxe Room Superior Executive Suite with Ocean View and Private Balcony Premium', // Long room name to test truncation
            inclusion: 'Free WiFi, Breakfast, Pool Access, Spa Services, Gym Access, Concierge Service, Parking' // Long inclusion to test truncation
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
          violations: (dayIndex + index) % 5 === 0 ? 1 : 0, // Deterministic violations
          roomType: 'Deluxe Room', // Add room type for tooltip
          inclusion: 'Free WiFi, Breakfast' // Add inclusion for tooltip
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
    
    // Swap daily data between first two rows (only for date columns)
    if (generatedData.length >= 2) {
      const firstRowDailyData = generatedData[0].dailyData
      const secondRowDailyData = generatedData[1].dailyData
      
      generatedData[0] = { ...generatedData[0], dailyData: secondRowDailyData }
      generatedData[1] = { ...generatedData[1], dailyData: firstRowDailyData }
    }

    return generatedData
  }

  // Process API data into calendar format
  const processParityDataForCalendar = (apiData: any): ChannelParityData[] => {
    const channels = apiData?.otaViolationChannelRate?.violationChannelRatesCollection || []
    
    // If no API data, return sample data
    if (channels.length === 0) {
      return generateSampleData()
    }
    
    return channels.map((channel: any, channelIndex: number) => {
      const dailyRates = channel.checkInDateWiseRates || []
      
      // Process daily data
      const dailyData: ParityDayData[] = dateRange.map((date, dayIndex) => {
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
          const roomType = roomTypes[(dayIndex + channelIndex) % roomTypes.length]
          const inclusion = inclusions[(dayIndex + channelIndex) % inclusions.length]
          
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
        const roomType = roomTypes[(dayIndex + channelIndex) % roomTypes.length]
        const inclusion = inclusions[(dayIndex + channelIndex) % inclusions.length]
        
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

  // Load static parity data only on initial mount
  useEffect(() => {
    console.log('🔄 Loading static parity calendar data on initial mount')
    
    setIsLoading(true)
    
    // Generate data only once on mount (no page variation needed)
    const staticData = generateSampleData()
    setParityData(staticData)
    
    const timer = setTimeout(() => {
      setIsLoading(false)
      console.log('✅ Static parity calendar data loaded successfully')
    }, 500)
    
    return () => clearTimeout(timer)
  }, []) // Only run on mount, no dependencies
  
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

  // Helper function to determine if a channel should be sold out for date 31
  const isSoldOutForDate31 = (channelIndex: number, date: string) => {
    const dayOfMonth = parseInt(date.split('-')[2])
    if (dayOfMonth !== 31) return false
    
    // Make 80% of channels sold out for date 31 (9 out of 11 channels)
    // Keep channels at index 4 (Google Hotels) and 6 (Trip Advisor) showing rates
    const channelsWithRates = [4, 6]
    return !channelsWithRates.includes(channelIndex)
  }

  // Get result color for benchmark 2nd row based on overall channel results for that date
  const getBenchmarkCellColor = (dateString: string, defaultResult: string, defaultScore?: number, isBrand?: boolean) => {
    // Force meet color (green) for date 30 regardless of actual status
    const dayOfMonth = parseInt(dateString.split('-')[2])
    if (dayOfMonth === 30) {
      return "bg-green-100 text-green-800 border-green-300" // Meet = Green
    }
    
    // For date 31 - benchmark sold out logic
    if (dayOfMonth === 31) {
      const isBenchmarkSoldOut = isSoldOutForDate31(1, dateString) // Index 1 is benchmark
      if (isBenchmarkSoldOut) {
        // Benchmark sold out gets loss state color (red)
        return "bg-red-100 text-red-800 border-red-300" // Loss = Red
      }
    }
    
    // For 2nd row (MakeMyTrip Benchmark), use overall status color
    const overallStatus = getOverallStatusForDate(dateString)
    return getStatusColorClass(overallStatus)
  }

  const getResultColor = (result: string, score?: number, isHotel?: boolean, date?: string, channelIndex?: number) => {
    // Force meet color (green) for date 30 regardless of actual result
    if (date) {
      const dayOfMonth = parseInt(date.split('-')[2])
      if (dayOfMonth === 30) {
        return "bg-green-100 text-green-800 border-green-300" // Meet = Green
      }
      
      // For date 31 - special sold out logic
      if (dayOfMonth === 31) {
        const isBenchmarkSoldOut = isSoldOutForDate31(1, date) // Index 1 is benchmark
        const isCurrentChannelSoldOut = channelIndex !== undefined ? isSoldOutForDate31(channelIndex, date) : false
        
        if (isCurrentChannelSoldOut) {
          // Sold out channels get meet state color (green)
          return "bg-green-100 text-green-800 border-green-300" // Meet = Green
        } else if (isBenchmarkSoldOut && !isCurrentChannelSoldOut) {
          // Channels with rates when benchmark is sold out get loss state color (red)
          return "bg-red-100 text-red-800 border-red-300" // Loss = Red
        }
      }
    }
    
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
                    <Button variant="outline" size="sm" className="mr-2">
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
                    {Array.from({ length: needsPagination ? optimalColumns : dateRange.length }, (_, index) => {
                      const date = dateRange[index]
                      // When on Next page (currentPage > 0), hide last 3 columns for blank state demo
                      const isBlankColumn = currentPage > 0 && index >= dateRange.length - 3
                      const hasDate = date && index < dateRange.length && !isBlankColumn
                      // Dynamic width based on column count - larger cells for fewer columns
                      const cellWidth = needsPagination ? Math.max(60, Math.floor(672 / optimalColumns)) : Math.max(48, Math.floor(672 / dateRange.length))
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
                                      // Don't show parity score for blank columns
                                      if (isBlankColumn) return ''
                                      // Get parity score from first row (channelIndex 0) for this date
                                      const actualDayIndex = needsPagination ? currentPage * optimalColumns + index : index
                                      const firstRowData = parityData[0]?.dailyData?.[actualDayIndex]
                                      const parityScore = firstRowData?.parityScore || 0
                                      return parityScore === 0 ? '' : `${parityScore}%`
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
                  {parityData.filter((_, channelIndex) => channelIndex !== 0).map((channel, filteredIndex) => {
                    const channelIndex = filteredIndex + 1 // Adjust index since we filtered out the first row
                    const isBenchmark = channelIndex === 1
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
                            {channel.channelIcon && (
                              <img
                                src={channel.channelIcon}
                                alt={channel.channelName}
                                className="w-4 h-4 rounded"
                              />
                            )}
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

                      {/* Win/Meet/Loss Distribution */}
                                                 <td 
                           className={cn(
                        "py-2 px-3 border-r border-border",
                        isSticky && isBenchmark && "sticky left-44 bg-blue-50 dark:bg-blue-950/30 z-10",
                             isSticky && !isBenchmark && "sticky left-44 bg-white dark:bg-slate-950 hover:bg-muted/50 z-10",
                             channelIndex === 0 && "bg-muted/50" // Row 1 gets table header background
                           )}
                        >
                        {/* Hide Win/Meet/Loss for first row (channelIndex === 0) when all percentages are 0 */}
                        {channel.winPercent === 0 && channel.meetPercent === 0 && channel.lossPercent === 0 ? (
                          <div className="h-5"></div>
                        ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
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
                             channelIndex === 0 && "bg-muted/50" // Row 1 gets table header background
                           )}
                        >
                        <div className={cn("flex items-center gap-1", isBenchmark && "cursor-default")}>
                          <span
                            className="font-bold cursor-default text-gray-900"
                            style={{ fontSize: '13px' }}
                          >
                            {channel.overallParityScore === 0 ? '' : `${channel.overallParityScore}%`}
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
                      {Array.from({ length: needsPagination ? optimalColumns : dateRange.length }, (_, index) => {
                        // Map display index to actual day index in full dataset
                        const actualDayIndex = needsPagination ? currentPage * optimalColumns + index : index
                        const dayData = channel.dailyData[actualDayIndex]
                        // When on Next page (currentPage > 0), hide last 3 columns for blank state demo
                        const isBlankColumn = currentPage > 0 && index >= dateRange.length - 3
                        const hasData = dayData && index < dateRange.length && !isBlankColumn
                        
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
                                          ? getBenchmarkCellColor(dayData.date, dayData.result, dayData.parityScore, channel.isBrand)
                                          : getResultColor(dayData.result, dayData.parityScore, channel.isBrand, dayData.date, channelIndex),
                                      )}
                                    >
                                      {(() => {
                                        const dayOfMonth = parseInt(dayData.date.split('-')[2])
                                        if (dayOfMonth === 30) return 'Sold Out'
                                        if (dayOfMonth === 31 && isSoldOutForDate31(channelIndex, dayData.date)) return 'Sold Out'
                                        return formatIDR(BASE_RATE_IDR)
                                      })()}
                                </div>
                                  </TooltipTrigger>
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
                                        <span className="text-base font-bold">{format(new Date(dayData.date), "dd MMM yyyy")}</span>
                                        <span className="text-sm font-normal">{`, ${format(new Date(dayData.date), 'EEE')}`}</span>
                                      </h3>
                                </div>

                                    {/* Semantic Table Structure */}
                                    <div className="mt-4">
                                      {(() => {
                                        // Calculate content for fixed widths
                                        const channelName = "MakeMyTrip Benchmark"
                                        const truncatedChannelName = channelName.length > 12 ? `${channelName.substring(0, 9)}...` : channelName
                                        const dayOfMonth = parseInt(dayData.date.split('-')[2])
                                        const rateText = (dayOfMonth === 30 || dayOfMonth === 31) ? 'Sold Out' : formatNumber(BASE_RATE_IDR)
                                        const truncatedRate = rateText.length > 11 ? `${rateText.substring(0, 8)}...` : rateText
                                        const roomType = dayData.roomType || 'Deluxe Room'
                                        const roomAbbr = getRoomAbbreviation(roomType)
                                        const roomWithAbbr = `${roomAbbr} - ${roomType}`
                                        const formattedRoom = formatRoomText(roomWithAbbr)
                                        const inclusion = dayData.inclusion || 'Free WiFi, Breakfast'
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
                                                <th className="text-left pb-2" style={{ width: rateWidth, paddingRight: '16px' }}>Rate (Rp)</th>
                                                <th className="text-left pb-2" style={{ width: roomWidth, paddingRight: '16px' }}>Room</th>
                                                <th className="text-left pb-2" style={{ width: inclusionWidth }}>Inclusion</th>
                                              </tr>
                                            </thead>
                                            <tbody className="space-y-1">
                                              <tr className="bg-blue-50 dark:bg-blue-900/30">
                                                {/* Channel */}
                                                <td className="py-1.5 align-top rounded-l align-top" style={{ width: channelWidth, paddingLeft: '4px', paddingRight: '16px' }}>
                                                  <span className="font-medium text-blue-900 dark:text-blue-200" title="MakeMyTrip Benchmark">
                                                    {(() => {
                                                      const benchmarkChannelName = "MakeMyTrip Benchmark"
                                                      
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
                                                  <div className="truncate" title={rateText}>{truncatedRate}</div>
                                                </td>
                                                
                                                {/* Room with abbreviation */}
                                                <td className="py-1.5 align-top text-left text-blue-900 dark:text-blue-200" style={{ width: roomWidth, paddingRight: '16px' }}>
                                                  {typeof formattedRoom === 'string' ? (
                                                    <div title={roomWithAbbr}>{formattedRoom}</div>
                                                  ) : (
                                                    <div title={roomWithAbbr}>
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
                                </Tooltip>
                              ) : (
                                // Regular rows - with tooltip and styling
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                        `relative ${adaptiveCellWidth} h-6 flex items-center justify-center rounded text-[10px] font-bold border cursor-pointer transition-all hover:scale-105`,
                                        channelIndex === 1 && parityData.length > 0 
                                          ? getBenchmarkCellColor(dayData.date, dayData.result, dayData.parityScore, channel.isBrand)
                                          : getResultColor(dayData.result, dayData.parityScore, channel.isBrand, dayData.date, channelIndex),
                                      )}
                                    >
                                      {channel.isBrand ? (() => {
                                        const dayOfMonth = parseInt(dayData.date.split('-')[2])
                                        if (dayOfMonth === 30) return 'Sold Out'
                                        if (dayOfMonth === 31 && isSoldOutForDate31(channelIndex, dayData.date)) return 'Sold Out'
                                        return formatIDR(BASE_RATE_IDR)
                                      })() : (() => {
                                        const dayOfMonth = parseInt(dayData.date.split('-')[2])
                                        if (dayOfMonth === 30) {
                                          return 'Sold Out'
                                        }
                                        if (dayOfMonth === 31 && isSoldOutForDate31(channelIndex, dayData.date)) {
                                          return 'Sold Out'
                                        }
                                        
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
                                        
                                        // For Loss cells, add A/R violation indicators
                                        if (result === 'L') {
                                          const rateText = formatIDR(finalRate)
                                          // Determine A or R based on date and channel for consistent display
                                          const dayNum = parseInt(dayData.date.split('-')[2])
                                          const violationType = (dayNum + channelIndex) % 2 === 0 ? 'A' : 'R'
                                          
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
                                        
                                        return formatIDR(finalRate)
                                      })()}
                              </div>
                            </TooltipTrigger>
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
                                            <th className="text-left pb-2 pl-4" style={{ minWidth: '90px', maxWidth: '140px' }}>Rate (Rp)</th>
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
                                                <span className="font-medium text-blue-900 dark:text-blue-200" title={channelIndex === 1 ? "MakeMyTrip Benchmark" : channel.channelName}>
                                                  {channelIndex === 1 ? (() => {
                                                    const benchmarkChannelName = "MakeMyTrip Benchmark"
                                                    
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
                                                  const dayOfMonth = parseInt(dayData.date.split('-')[2])
                                                  if (dayOfMonth === 30) return 'Sold Out'
                                                  if (dayOfMonth === 31 && isSoldOutForDate31(channelIndex, dayData.date)) return 'Sold Out'
                                                  return formatNumber(BASE_RATE_IDR)
                                                })()}
                                            </td>
                                            
                                              {/* Room with abbreviation */}
                                              <td className="py-1.5 align-top pl-4 pr-2 text-left text-blue-900 dark:text-blue-200" style={{ width: '150px', paddingRight: '16px' }}>
                                                {(() => {
                                                  const roomType = dayData.roomType || 'Deluxe Room'
                                                  const roomAbbr = getRoomAbbreviation(roomType)
                                                  const roomWithAbbr = `${roomAbbr} - ${roomType}`
                                                  const formattedRoom = formatRoomText(roomWithAbbr)
                                                  
                                                  if (typeof formattedRoom === 'string') {
                                                    return <div title={roomWithAbbr}>{formattedRoom}</div>
                                                  } else {
                                                    return (
                                                      <div title={roomWithAbbr}>
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
                                                  const inclusion = dayData.inclusion || 'Free Wifi'
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
                                                    const dayOfMonth = parseInt(dayData.date.split('-')[2])
                                                    if (dayOfMonth === 30) return 'Sold Out'
                                                    if (dayOfMonth === 31) {
                                                      const isBenchmarkSoldOut = isSoldOutForDate31(1, dayData.date) // Index 1 is benchmark
                                                      const isCurrentChannelSoldOut = isSoldOutForDate31(channelIndex, dayData.date)
                                                      
                                                      if (isBenchmarkSoldOut) {
                                                        return 'Sold Out' // Show benchmark as sold out if it is sold out
                                                      } else if (isCurrentChannelSoldOut) {
                                                        return 'Sold Out' // Show sold out if current channel is sold out
                                                      }
                                                    }
                                                    return formatNumber(BASE_RATE_IDR)
                                                  })()}
                                            </td>
                                            
                                            {/* Room with abbreviation */}
                                                <td className="py-1.5 align-top pl-4 pr-2 text-left text-blue-900 dark:text-blue-200" style={{ width: '180px', paddingRight: '16px' }}>
                                              {(() => {
                                                const roomType = dayData.roomType || 'Deluxe Room'
                                                const roomAbbr = getRoomAbbreviation(roomType)
                                                const roomWithAbbr = `${roomAbbr} - ${roomType}`
                                                const formattedRoom = formatRoomText(roomWithAbbr)
                                                
                                                if (typeof formattedRoom === 'string') {
                                                  return <div title={roomWithAbbr}>{formattedRoom}</div>
                                                } else {
                                                  return (
                                                    <div title={roomWithAbbr}>
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
                                                const inclusion = dayData.inclusion || 'Free Wifi'
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
                                                    const dayOfMonth = parseInt(dayData.date.split('-')[2])
                                                    if (dayOfMonth === 30) {
                                                      return 'Sold Out'
                                                    }
                                                    if (dayOfMonth === 31 && isSoldOutForDate31(channelIndex, dayData.date)) {
                                                      return 'Sold Out'
                                                    }
                                                    
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
                                                    
                                                    return formatNumber(channelRate)
                                              })()}
                                            </td>
                                            
                                            {/* Room with abbreviation */}
                                                <td className="py-1.5 align-top pl-4 pr-2 text-left text-gray-900 dark:text-slate-100" style={{ width: '180px', paddingRight: '16px' }}>
                                              {(() => {
                                                const roomType = dayData.roomType || 'Deluxe Room'
                                                const roomAbbr = getRoomAbbreviation(roomType)
                                                const roomWithAbbr = `${roomAbbr} - ${roomType}`
                                                const formattedRoom = formatRoomText(roomWithAbbr)
                                                
                                                if (typeof formattedRoom === 'string') {
                                                  return <div title={roomWithAbbr}>{formattedRoom}</div>
                                                } else {
                                                  return (
                                                    <div title={roomWithAbbr}>
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
                                                const inclusion = dayData.inclusion || 'Free Wifi'
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
                                                const dayOfMonth = parseInt(dayData.date.split('-')[2])
                                                if (dayOfMonth === 30) {
                                                  return null // Don't render difference row for sold out dates
                                                }
                                                if (dayOfMonth === 31 && isSoldOutForDate31(channelIndex, dayData.date)) {
                                                  return null // Don't render difference row for sold out channels on date 31
                                                }
                                                
                                                return (
                                                  <tr>
                                                    {/* Difference label in Channel column - only show for Win/Loss, empty for Meet */}
                                                    <td className="py-1.5 align-top pr-2 text-left font-normal" style={{ width: '80px', paddingLeft: '4px', borderTop: '1px solid #e5e7eb' }}>
                                                      {(() => {
                                                        // Check if this is a meet state by calculating the difference
                                                        const dayOfMonth = parseInt(dayData.date.split('-')[2])
                                                        if (dayOfMonth === 31) {
                                                          const isBenchmarkSoldOut = isSoldOutForDate31(1, dayData.date)
                                                          const isCurrentChannelSoldOut = isSoldOutForDate31(channelIndex, dayData.date)
                                                          if (isBenchmarkSoldOut && !isCurrentChannelSoldOut) {
                                                            return 'Difference' // Show for sold out case
                                                          }
                                                        }
                                                        
                                                        const myRate = BASE_RATE_IDR
                                                        const result = dayData.result
                                                        const channelVariation = channel.channelName.length * 100000
                                                        const currentDate = new Date(dayData.date)
                                                        const startOfRange = dateRange[0] || currentDate
                                                        const dayVariation = Math.floor((currentDate.getTime() - startOfRange.getTime()) / (1000 * 60 * 60 * 24)) * 50000
                                                        
                                                        let channelRate = myRate
                                                        if (result === 'W') {
                                                          channelRate = myRate + 500000 + (channelVariation % 2000000) + dayVariation
                                                        } else if (result === 'L') {
                                                          channelRate = myRate - 500000 - (channelVariation % 1500000) - dayVariation
                                                        } else {
                                                          channelRate = myRate
                                                        }
                                                        channelRate = Math.max(channelRate, 8000000)
                                                        const difference = myRate - channelRate
                                                        
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
                                                        const dayOfMonth = parseInt(dayData.date.split('-')[2])
                                                        if (dayOfMonth === 31) {
                                                          const isBenchmarkSoldOut = isSoldOutForDate31(1, dayData.date) // Index 1 is benchmark
                                                          const isCurrentChannelSoldOut = isSoldOutForDate31(channelIndex, dayData.date)
                                                          
                                                          if (isBenchmarkSoldOut && !isCurrentChannelSoldOut) {
                                                            // When benchmark is sold out but current channel has rates
                                                            // Show loss state logic with red color and + values
                                                            const channelVariation = channel.channelName.length * 100000
                                                            const currentDate = new Date(dayData.date)
                                                            const startOfRange = dateRange[0] || currentDate
                                                            const dayVariation = Math.floor((currentDate.getTime() - startOfRange.getTime()) / (1000 * 60 * 60 * 24)) * 50000
                                                            
                                                            let channelRate = BASE_RATE_IDR
                                                            const result = dayData.result
                                                            
                                                            if (result === 'W') {
                                                              channelRate = BASE_RATE_IDR + 500000 + (channelVariation % 2000000) + dayVariation
                                                            } else if (result === 'L') {
                                                              channelRate = BASE_RATE_IDR - 500000 - (channelVariation % 1500000) - dayVariation
                                                            } else {
                                                              channelRate = BASE_RATE_IDR
                                                            }
                                                            
                                                            channelRate = Math.max(channelRate, 8000000)
                                                            const difference = channelRate // Since benchmark is sold out, show full channel rate as positive difference
                                                            
                                                            return (
                                                              <span className="text-red-600 dark:text-red-400 font-bold">
                                                                +{formatNumber(difference)}
                                                              </span>
                                                            )
                                                          }
                                                        }
                                                        
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
                                                          varianceText = 'No difference'
                                                        } else if (difference < 0) {
                                                          // Win: My price is lower (negative difference)
                                                          varianceColor = 'text-green-600 dark:text-green-400'
                                                          varianceText = `-${formatNumber(Math.abs(difference))}`
                                                        } else {
                                                          // Loss: My price is higher (positive difference)
                                                          varianceColor = 'text-red-600 dark:text-red-400'
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
                                                      {dayData.result === 'L' && (
                                                        <div className="flex items-center justify-start">
                                                          {(() => {
                                                            // Calculate same violation type as used in cell display
                                                            const dayNum = parseInt(dayData.date.split('-')[2])
                                                            const violationType = (dayNum + channelIndex) % 2 === 0 ? 'A' : 'R'
                                                            
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
