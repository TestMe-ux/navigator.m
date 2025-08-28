"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts"
import { cn } from "@/lib/utils"
import { format, addDays, eachDayOfInterval } from "date-fns"
import { ParityFilterBar, ParityDateProvider, ParityChannelProvider, useParityDateContext, useParityChannelContext } from "@/components/parity-filter-bar"
import { ParityCalendarView } from "@/components/parity-calendar-view"
import { ParityOverviewFilterBar } from "@/components/parity-overview-filter-bar"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { GetParityData } from "@/lib/parity"
import { conevrtDateforApi } from "@/lib/utils"


// Sample data for the parity table
const parityData = [
  {
    date: "Fri 01/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1124, trend: "up", parity: false },
    agoda: { rate: 727, trend: "up", parity: true },
    makeMyTrip: { rate: 580, trend: "up", parity: false },
    lossChannels: ["Vio.com"],
    lowestRate: 727,
  },
  {
    date: "Sat 02/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1124, trend: "up", parity: false },
    agoda: { rate: 583, trend: "up", parity: true },
    makeMyTrip: { rate: 580, trend: "up", parity: false },
    lossChannels: ["Vio.com", "Trip.com"],
    lowestRate: 767,
  },
  {
    date: "Sun 03/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1126, trend: "up", parity: false },
    agoda: { rate: 583, trend: "up", parity: true },
    makeMyTrip: { rate: 580, trend: "up", parity: false },
    lossChannels: ["Roomsxxl", "Vio.com", "Trip.com"],
    lowestRate: 585,
  },
  {
    date: "Mon 04/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1124, trend: "up", parity: false },
    agoda: { rate: 583, trend: "up", parity: true },
    makeMyTrip: { rate: 523, trend: "up", parity: false },
    lossChannels: ["Trip.com", "Vio.com"],
    lowestRate: 721,
  },
  {
    date: "Tue 05/08",
    brandCom: { rate: 688, trend: "down", parity: true },
    bookingCom: { rate: 688, trend: "up", parity: true },
    expedia: { rate: 945, trend: "up", parity: false },
    agoda: { rate: 688, trend: "up", parity: true },
    makeMyTrip: { rate: 385, trend: "up", parity: false },
    lossChannels: ["Roomsxxl", "GoSeek", "Vio.com", "Trip.com"],
    lowestRate: 585,
  },
  {
    date: "Wed 06/08",
    brandCom: { rate: 688, trend: "down", parity: true },
    bookingCom: { rate: 688, trend: "up", parity: true },
    expedia: { rate: 926, trend: "up", parity: false },
    agoda: { rate: 688, trend: "up", parity: true },
    makeMyTrip: { rate: 385, trend: "up", parity: false },
    lossChannels: ["Roomsxxl", "Vio.com", "Trip.com"],
    lowestRate: 585,
  },
  {
    date: "Thu 07/08",
    brandCom: { rate: 688, trend: "down", parity: true },
    bookingCom: { rate: 688, trend: "up", parity: true },
    expedia: { rate: 955, trend: "up", parity: false },
    agoda: { rate: 688, trend: "up", parity: true },
    makeMyTrip: { rate: 385, trend: "up", parity: false },
    lossChannels: ["Roomsxxl", "Vio.com", "Trip.com"],
    lowestRate: 585,
  },
  {
    date: "Fri 08/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1112, trend: "up", parity: false },
    agoda: { rate: 817, trend: "down", parity: true },
    makeMyTrip: { rate: 523, trend: "stable", parity: false },
    lossChannels: ["Roomsxxl", "GoSeek", "Vio.com", "Trip.com"],
    lowestRate: 585,
  },
  {
    date: "Sat 09/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1118, trend: "up", parity: false },
    agoda: { rate: 817, trend: "up", parity: true },
    makeMyTrip: { rate: null, trend: "stable", parity: false },
    lossChannels: ["Vio.com"],
    lowestRate: 767,
  },
  {
    date: "Sun 10/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1112, trend: "up", parity: false },
    agoda: { rate: 817, trend: "up", parity: true },
    makeMyTrip: { rate: 555, trend: "up", parity: false },
    lossChannels: ["Roomsxxl", "Trip.com", "Vio.com"],
    lowestRate: 585,
  },
  {
    date: "Mon 11/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1112, trend: "up", parity: false },
    agoda: { rate: 817, trend: "down", parity: true },
    makeMyTrip: { rate: 555, trend: "up", parity: false },
    lossChannels: ["Vio.com"],
    lowestRate: 767,
  },
  {
    date: "Tue 12/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1109, trend: "up", parity: false },
    agoda: { rate: 817, trend: "up", parity: true },
    makeMyTrip: { rate: 555, trend: "up", parity: false },
    lossChannels: ["Vio.com"],
    lowestRate: 767,
  },
  {
    date: "Wed 13/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1112, trend: "up", parity: false },
    agoda: { rate: 817, trend: "down", parity: true },
    makeMyTrip: { rate: 555, trend: "up", parity: false },
    lossChannels: ["Roomsxxl", "Trip.com", "Vio.com"],
    lowestRate: 585,
  },
  {
    date: "Thu 14/08",
    brandCom: { rate: 688, trend: "up", parity: true },
    bookingCom: { rate: 688, trend: "up", parity: true },
    expedia: { rate: 926, trend: "up", parity: false },
    agoda: { rate: 688, trend: "up", parity: true },
    makeMyTrip: { rate: 463, trend: "up", parity: false },
    lossChannels: ["Roomsxxl", "Vio.com", "Trip.com"],
    lowestRate: 585,
  },
  {
    date: "Fri 15/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1118, trend: "up", parity: false },
    agoda: { rate: 817, trend: "up", parity: true },
    makeMyTrip: { rate: 555, trend: "down", parity: false },
    lossChannels: ["Bluepillow.it", "Trip.com"],
    lowestRate: 688,
  },
]

function ParityMonitoringContent() {
  const [selectedProperty] = useSelectedProperty()
  const { startDate, endDate } = useParityDateContext()
  const { channelFilter } = useParityChannelContext()

  const [filters, setFilters] = useState({
    rateType: "lowest",
    device: "desktop",
    nights: "1",
    guests: "2",
    room: "any",
    meal: "any",
  })
  const [apiParityData, setApiParityData] = useState<any>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Fetch parity data when dependencies change
  useEffect(() => {
    if (!selectedProperty?.sid || !startDate || !endDate) {
      console.warn('Missing required parameters for parity data fetch')
      return
    }

    let isCancelled = false

    const fetchParityData = async () => {
      if (isCancelled) return
      
      setIsLoadingData(true)
      try {
        const filtersValue = {
          "sid": selectedProperty.sid,
          "checkInStartDate": conevrtDateforApi(startDate.toString()),
          "checkInEndDate": conevrtDateforApi(endDate.toString()),
          "channelName": channelFilter.channelId.length > 0 ? channelFilter.channelId : [-1],
          "guest": null,
          "los": null,
          "promotion": null,
          "qualification": null,
          "restriction": null,
        }

        console.log('🔄 Fetching parity data with filters:', filtersValue)
        const response = await GetParityData(filtersValue)
        
        if (!isCancelled && response.status && response.body) {
          console.log('✅ Parity data fetched successfully:', response.body)
          setApiParityData(response.body)
        } else if (!isCancelled) {
          console.warn('⚠️ Parity API returned unsuccessful response:', response)
          setApiParityData(null)
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('❌ Failed to fetch parity data:', error)
          // Fallback to null to use static data
          setApiParityData(null)
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingData(false)
        }
      }
    }

    fetchParityData()

    return () => {
      isCancelled = true
    }
  }, [selectedProperty?.sid, startDate, endDate, JSON.stringify(channelFilter.channelId)])

  // Chart configuration from OTA Rankings
  const MAX_LINES = 10

  // Available channel lines for the chart (parity channels)
  const availableChannelLines = useMemo(() => [
    { dataKey: 'brandCom', name: 'Brand.com', color: '#3b82f6' },
    { dataKey: 'bookingCom', name: 'Booking.com', color: '#10b981' },
    { dataKey: 'expedia', name: 'Expedia', color: '#f59e0b' },
    { dataKey: 'agoda', name: 'Agoda', color: '#06b6d4' },
    { dataKey: 'makeMyTrip', name: 'MakeMyTrip', color: '#ef4444' }
  ], [])

  // Legend visibility state
  const [legendVisibility, setLegendVisibility] = useState<{[key: string]: boolean}>(() => {
    const initial: {[key: string]: boolean} = {}
    availableChannelLines.forEach(channel => {
      initial[channel.dataKey] = true // All channels visible by default
    })
    return initial
  })

  // Error state management (copied from OTA Rankings)
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Toggle legend visibility function (copied from OTA Rankings)
  const toggleLegendVisibility = useCallback((dataKey: string) => {
    setLegendVisibility(prev => {
      const isCurrentlyVisible = prev[dataKey]
      
      if (!isCurrentlyVisible) {
        const allSelectedKeys = availableChannelLines.map(channel => channel.dataKey)
        const currentVisibleCount = allSelectedKeys.filter(key => prev[key]).length
        
        if (currentVisibleCount >= MAX_LINES) {
          setErrorMessage('Maximum 10 channels can be displayed on the graph. Please hide a channel first to show another one.')
          setTimeout(() => setErrorMessage(''), 5000)
          return prev
        }
      }
      
      const newState = {
        ...prev,
        [dataKey]: !prev[dataKey]
      }
      
      // Clear error if we're now under the limit
      const allSelectedKeys = availableChannelLines.map(channel => channel.dataKey)
      const newVisibleCount = allSelectedKeys.filter(key => newState[key]).length
      
      if (newVisibleCount < MAX_LINES) {
        setErrorMessage('')
      }
      
      return newState
    })
  }, [availableChannelLines, MAX_LINES])

  // Process API data for chart
  const processApiDataForChart = (apiData: any, chartDates: Date[]) => {
    if (!apiData?.otaViolationChannelRate?.violationChannelRatesCollection) {
      return generateFallbackChartData(chartDates)
    }

    const channels = apiData.otaViolationChannelRate.violationChannelRatesCollection
    
    return chartDates.map((currentDate, index) => {
      const dateStr = conevrtDateforApi(currentDate.toString())
      
      // Extract rates for each channel for this date
      const brandComData = channels.find((ch: any) => ch.isBrand)?.checkInDateWiseRates?.find((rate: any) => rate.checkInDate === dateStr)
      const bookingComData = channels.find((ch: any) => ch.channelName?.toLowerCase().includes('booking'))?.checkInDateWiseRates?.find((rate: any) => rate.checkInDate === dateStr)
      const expediaData = channels.find((ch: any) => ch.channelName?.toLowerCase().includes('expedia'))?.checkInDateWiseRates?.find((rate: any) => rate.checkInDate === dateStr)
      const agodaData = channels.find((ch: any) => ch.channelName?.toLowerCase().includes('agoda'))?.checkInDateWiseRates?.find((rate: any) => rate.checkInDate === dateStr)
      const makeMyTripData = channels.find((ch: any) => ch.channelName?.toLowerCase().includes('makemytrip'))?.checkInDateWiseRates?.find((rate: any) => rate.checkInDate === dateStr)

      const roomTypes = ["Apartment", "Bungalow", "Deluxe Room", "Standard Room", "Studio", "Suite", "Superior Room"]
      const inclusions = ["Full Board", "Breakfast", "Room Only", "Free Wifi"]
      const roomType = roomTypes[index % roomTypes.length]
      const inclusion = inclusions[index % inclusions.length]

      return {
        date: format(currentDate, 'MMM dd'),
        fullDate: format(currentDate, 'yyyy-MM-dd'),
        brandCom: brandComData?.rate || 817,
        bookingCom: bookingComData?.rate || 817,
        expedia: expediaData?.rate || 1124,
        agoda: agodaData?.rate || 727,
        makeMyTrip: makeMyTripData?.rate || 580,
        roomType,
        inclusion,
      }
    })
  }

  // Fallback chart data generation 
  const generateFallbackChartData = (chartDates: Date[]) => {
    return chartDates.map((currentDate, index) => {
      // Define room types and inclusions that vary by date
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
      
      // Use index to determine room type and inclusion for variety across dates
      const roomType = roomTypes[index % roomTypes.length]
      const inclusion = inclusions[index % inclusions.length]

      // Generate sample rate data with some variation
      const baseRates = {
        brandCom: 817,
        bookingCom: 817,
        expedia: 1124,
        agoda: 727,
        makeMyTrip: 580
      }

      // Add some random variation to make data more realistic
      const variation = (Math.sin(index * 0.5) + Math.cos(index * 0.3)) * 50
      
      return {
        date: format(currentDate, 'MMM dd'), // "Sep 22" format for X-axis
        fullDate: format(currentDate, 'yyyy-MM-dd'), // Full date for tooltip
        brandCom: Math.round(baseRates.brandCom + variation),
        bookingCom: Math.round(baseRates.bookingCom + variation),
        expedia: Math.round(baseRates.expedia + variation * 1.2),
        agoda: Math.round(baseRates.agoda + variation * 0.8),
        makeMyTrip: Math.round(baseRates.makeMyTrip + variation * 0.6),
        // Additional data for tooltip columns
        roomType: roomType,
        inclusion: inclusion,
      }
    })
  }

  // Generate chart data based on selected date range and API data
  const chartData = useMemo(() => {
    if (!startDate || !endDate) {
      return []
    }

    // Generate dates from startDate to endDate
    const start = new Date(startDate)
    const end = new Date(endDate)
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    // Limit to reasonable number of days for chart performance
    const maxDays = Math.min(daysDiff, 60)
    
    const chartDates = []
    for (let i = 0; i < maxDays; i++) {
      chartDates.push(addDays(start, i))
    }

    // Use API data if available and has data, otherwise use fallback data
    if (apiParityData && apiParityData.otaViolationChannelRate?.violationChannelRatesCollection?.length > 0) {
      return processApiDataForChart(apiParityData, chartDates)
    } else {
      // Always return fallback data when API data is not available or empty
      console.log('📊 Using fallback chart data - API data not available')
      return generateFallbackChartData(chartDates)
    }
  }, [startDate, endDate, apiParityData])

  // Process API data for card view
  const processApiDataForCards = (apiData: any) => {
    if (!apiData?.otaViolationChannelRate?.violationChannelRatesCollection) {
      return null
    }

    const channels = apiData.otaViolationChannelRate.violationChannelRatesCollection
    return channels.map((channel: any) => {
      // Calculate overall parity metrics from daily data
      const dailyRates = channel.checkInDateWiseRates || []
      const totalWin = dailyRates.reduce((sum: number, day: any) => sum + (day.winCount || 0), 0)
      const totalMeet = dailyRates.reduce((sum: number, day: any) => sum + (day.meetCount || 0), 0)
      const totalLoss = dailyRates.reduce((sum: number, day: any) => sum + (day.lossCount || 0), 0)
      const total = totalWin + totalMeet + totalLoss

      const parityScore = total > 0 ? Math.round(((totalWin + totalMeet) / total) * 100) : 0
      const currentRate = dailyRates.length > 0 ? dailyRates[dailyRates.length - 1]?.rate || 0 : 0

      return {
        channelName: channel.channelName,
        currentRate,
        parityScore,
        isInParity: parityScore >= 85,
        trend: Math.random() > 0.5 ? 'up' : 'down', // Would be calculated from historical data
        trendValue: Math.random() * 5,
        color: channel.isBrand ? 'primary' : 
               channel.channelName?.toLowerCase().includes('booking') ? 'blue-500' :
               channel.channelName?.toLowerCase().includes('expedia') ? 'orange-500' :
               channel.channelName?.toLowerCase().includes('agoda') ? 'purple-500' : 'gray-500'
      }
    })
  }

  // Get card data (API or fallback)
  const cardData = useMemo(() => {
    if (apiParityData && apiParityData.otaViolationChannelRate?.violationChannelRatesCollection?.length > 0) {
      const processedData = processApiDataForCards(apiParityData)
      if (processedData && processedData.length > 0) {
        return processedData
      }
    }
    
    // Always return fallback data when API data is not available
    console.log('🎯 Using fallback card data - API data not available')
    return [
      { 
        channelName: "Booking.com", 
        channelIcon: "B", 
        parityScore: 35, 
        trend: 'down', 
        trendValue: 3.2,
        winPercent: 15,
        meetPercent: 20,
        lossPercent: 65,
        totalViolations: 65,
        violationsTrend: 'up',
        violationsTrendValue: 3,
        rateViolations: 21,
        rateViolationsTrend: 'down',
        rateViolationsTrendValue: 2,
        availabilityViolations: 44,
        availabilityViolationsTrend: 'up',
        availabilityViolationsTrendValue: 3.2,
        color: 'blue-600'
      },
      { 
        channelName: "Tripadvisor", 
        channelIcon: "🦉", 
        parityScore: 80, 
        trend: 'up', 
        trendValue: 3.2,
        winPercent: 30,
        meetPercent: 26,
        lossPercent: 44,
        totalViolations: 20,
        violationsTrend: 'up',
        violationsTrendValue: 3,
        rateViolations: 8,
        rateViolationsTrend: 'down',
        rateViolationsTrendValue: 2,
        availabilityViolations: 12,
        availabilityViolationsTrend: 'up',
        availabilityViolationsTrendValue: 2.5,
        color: 'green-600'
      },
      { 
        channelName: "Expedia", 
        channelIcon: "✈", 
        parityScore: 62, 
        trend: 'down', 
        trendValue: 3.2,
        winPercent: 22,
        meetPercent: 50,
        lossPercent: 28,
        totalViolations: 28,
        violationsTrend: 'up',
        violationsTrendValue: 3,
        rateViolations: 21,
        rateViolationsTrend: 'down',
        rateViolationsTrendValue: 2,
        availabilityViolations: 7,
        availabilityViolationsTrend: 'up',
        availabilityViolationsTrendValue: 3.2,
        color: 'yellow-500'
      },
      { 
        channelName: "Agoda", 
        channelIcon: "A", 
        parityScore: 80, 
        trend: 'up', 
        trendValue: 3.2,
        winPercent: 30,
        meetPercent: 26,
        lossPercent: 44,
        totalViolations: 20,
        violationsTrend: 'up',
        violationsTrendValue: 3,
        rateViolations: 8,
        rateViolationsTrend: 'down',
        rateViolationsTrendValue: 2,
        availabilityViolations: 12,
        availabilityViolationsTrend: 'down',
        availabilityViolationsTrendValue: 1.5,
        color: 'red-500'
      },
      { 
        channelName: "Hotels.com", 
        channelIcon: "H", 
        parityScore: 62, 
        trend: 'down', 
        trendValue: 3.2,
        winPercent: 22,
        meetPercent: 50,
        lossPercent: 28,
        totalViolations: 28,
        violationsTrend: 'up',
        violationsTrendValue: 3,
        rateViolations: 21,
        rateViolationsTrend: 'down',
        rateViolationsTrendValue: 2,
        availabilityViolations: 7,
        availabilityViolationsTrend: 'up',
        availabilityViolationsTrendValue: 3.2,
        color: 'purple-600'
      },
      { 
        channelName: "Kayak", 
        channelIcon: "K", 
        parityScore: 75, 
        trend: 'up', 
        trendValue: 2.1,
        winPercent: 35,
        meetPercent: 40,
        lossPercent: 25,
        totalViolations: 25,
        violationsTrend: 'down',
        violationsTrendValue: 1.8,
        rateViolations: 15,
        rateViolationsTrend: 'down',
        rateViolationsTrendValue: 1.2,
        availabilityViolations: 10,
        availabilityViolationsTrend: 'down',
        availabilityViolationsTrendValue: 0.8,
        color: 'orange-500'
      },
      { 
        channelName: "Priceline", 
        channelIcon: "P", 
        parityScore: 68, 
        trend: 'down', 
        trendValue: 1.5,
        winPercent: 28,
        meetPercent: 45,
        lossPercent: 27,
        totalViolations: 32,
        violationsTrend: 'up',
        violationsTrendValue: 2.3,
        rateViolations: 18,
        rateViolationsTrend: 'up',
        rateViolationsTrendValue: 1.8,
        availabilityViolations: 14,
        availabilityViolationsTrend: 'up',
        availabilityViolationsTrendValue: 1.2,
        color: 'indigo-600'
      }
    ]
  }, [apiParityData])

  // Type definition for card data
  interface CardDataType {
    channelName: string
    channelIcon: string
    parityScore: number
    trend: 'up' | 'down'
    trendValue: number
    winPercent: number
    meetPercent: number
    lossPercent: number
    totalViolations: number
    violationsTrend: 'up' | 'down'
    violationsTrendValue: number
    rateViolations: number
    rateViolationsTrend: 'up' | 'down'
    rateViolationsTrendValue: number
    availabilityViolations: number
    availabilityViolationsTrend: 'up' | 'down'
    availabilityViolationsTrendValue: number
    color: string
  }

  // Parity Tooltip component (adapted for rates instead of rankings)
  const ParityTrendsTooltip = ({ active, payload, label, coordinate }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload
      const chartWidth = 800
      const isNearRightEdge = coordinate && coordinate.x > (chartWidth * 0.6)
      
      const tooltipStyle = isNearRightEdge ? {
        transform: 'translateX(-100%)',
        marginLeft: '-10px'
      } : {
        transform: 'translateX(0%)',
        marginLeft: '10px'
      }

      return (
        <div 
          className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-3 min-w-[400px] max-w-[500px] z-[10001] relative"
          style={tooltipStyle}
        >
          {/* Date Heading - Same format as OTA Rankings */}
          <div className="mb-2">
            <h3 className="text-gray-900 dark:text-white">
              <span className="text-base font-bold">{data?.fullDate ? format(new Date(data.fullDate), "dd MMM yyyy") : ''}</span>
              <span className="text-sm font-normal">{data?.fullDate ? `, ${format(new Date(data.fullDate), 'EEE')}` : ''}</span>
            </h3>
          </div>

          {/* Semantic Table Structure */}
          <div className="mt-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 dark:text-slate-400 font-medium">
                  <th className="text-left pb-2 pl-2" style={{ width: '80px' }}>Channel</th>
                  <th className="text-left pb-2 pl-4" style={{ width: '64px' }}>Rate</th>
                  <th className="text-left pb-2 pl-4" style={{ width: '80px', paddingRight: '4px' }}>Variance</th>
                  <th className="text-left pb-2 pl-4" style={{ width: '128px', paddingRight: '16px' }}>Room</th>
                  <th className="text-left pb-2 pl-4" style={{ width: '80px' }}>Inclusion</th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                {payload.map((entry: any, index: number) => {
                  const channelInfo = availableChannelLines.find(channel => channel.dataKey === entry.dataKey)
                  const channelName = channelInfo?.name || entry.name
                  const rate = entry.value
                  const isBrandCom = entry.dataKey === 'brandCom'
                  
                  // Calculate variance from Brand.com rate
                  const brandComRate = data?.brandCom || rate
                  const variance = rate - brandComRate
                  const varianceColor = variance > 0 ? 'text-red-600 dark:text-red-400' : variance < 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
                  const varianceText = variance === 0 ? '-' : `${variance > 0 ? '+' : '-'}${Math.abs(variance)}`
                  
                  // Truncate channel name to 12 characters
                  const truncatedChannelName = channelName.length > 12 ? `${channelName.substring(0, 9)}...` : channelName
                  
                  // Format room type with abbreviation and truncation
                  const roomType = data?.roomType || 'Deluxe Room'
                  const inclusion = data?.inclusion || 'Breakfast'
                  
                  // Add abbreviations for room types
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
                  
                  // Apply character limits: Room 24 chars (including ...), Inclusion 12 chars (including ...)
                  const truncatedRoom = roomWithAbbr.length > 24 ? `${roomWithAbbr.substring(0, 21)}...` : roomWithAbbr
                  const truncatedInclusion = inclusion.length > 12 ? `${inclusion.substring(0, 9)}...` : inclusion

                  return (
                    <tr key={index} className={`${
                      isBrandCom ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                    }`}>
                      {/* Channel with color indicator */}
                      <td className="py-1.5 pl-2 pr-2 rounded-l" style={{ width: '80px' }}>
                        <div className="flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className={`font-medium truncate ${
                            isBrandCom ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-slate-100'
                          }`} title={channelName}>
                            {truncatedChannelName}
                          </span>
                        </div>
                      </td>
                      
                      {/* Rate */}
                      <td className={`py-1.5 pl-4 pr-2 text-left font-bold ${
                        isBrandCom ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-slate-100'
                      }`} style={{ width: '64px' }}>
                        ${rate}
                      </td>
                      
                      {/* Variance from Brand.com */}
                      <td className={`py-1.5 pl-4 pr-2 text-left font-medium ${varianceColor}`} style={{ width: '80px', paddingRight: '4px' }}>
                        {varianceText}
                      </td>
                      
                      {/* Room Type - Fixed width with 24 char limit */}
                      <td className="py-1.5 pl-4 pr-2 text-gray-700 dark:text-slate-300" style={{ width: '128px', paddingRight: '16px' }}>
                        <div className="truncate" title={roomWithAbbr}>
                          {truncatedRoom}
                        </div>
                      </td>
                      
                      {/* Inclusion - Fixed width with 12 char limit */}
                      <td className="py-1.5 pl-4 pr-2 text-gray-700 dark:text-slate-300 rounded-r" style={{ width: '80px' }}>
                        <div className="truncate" title={inclusion}>
                          {truncatedInclusion}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )
    }
    return null
  }

  const getRateColor = (channel: string, rate: number | null) => {
    if (rate === null) return "text-muted-foreground"

    switch (channel) {
      case "brandCom":
      case "bookingCom":
      case "agoda":
        return "text-primary"
      case "expedia":
        return "text-orange-500 dark:text-orange-400"
      case "makeMyTrip":
        return "text-red-500 dark:text-red-400"
      default:
        return "text-foreground"
    }
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

  const formatRate = (rate: number | null) => {
    if (rate === null) return "--"
    return `$ ${rate.toLocaleString()}`
  }

  const propertyCity = selectedProperty?.demandCity || 'Property'

  return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          {/* Enhanced Filter Bar with Sticky Positioning */}
          <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-border/50 shadow-sm transition-shadow duration-200">
            <ParityOverviewFilterBar />
          </div>

          {/* Professional Header Section - Responsive */}
          <section className="w-full">
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
              <div className="max-w-7xl xl:max-w-none mx-auto">
                <TooltipProvider>
                  <div className="flex flex-col items-start justify-between gap-3 sm:gap-4 py-3 sm:py-4 mt-2 sm:mt-4">
                    {/* Left Section - Title & Description */}
                    <div className="space-y-1 w-full">
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-foreground">
                          Parity Analysis
                        </h1>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs sm:max-w-sm bg-slate-800 text-white border-slate-700">
                            <p className="text-xs sm:text-sm">
                              Monitor rate parity across all distribution channels, track violations, and ensure competitive positioning with real-time alerts and comprehensive analytics.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Rate parity monitoring with channel insights and violation tracking
                      </p>
                    </div>
                  </div>
                </TooltipProvider>
              </div>
            </div>
          </section>

          {/* Main Content Area - Responsive */}
          <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-0 pb-3 sm:pb-4 md:pb-6 lg:pb-8 xl:pb-10">
            <div className="max-w-7xl xl:max-w-none mx-auto space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">

        {/* Main Content - Channel Performance Insights and Calendar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Rate Parity Cards Container - Responsive */}
            <Card className="shadow-lg">
              <CardHeader className="pb-2 mb-1.5 sm:mb-2.5 px-4 sm:px-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl font-bold">Channel Performance Insights</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pt-1 pb-4 sm:pb-6">
            {/* Channel Cards Grid */}
            {isLoadingData ? (
                  <div 
                    className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 ${cardData.length > 6 ? 'max-h-[400px] sm:max-h-[500px] md:max-h-[616px] overflow-y-auto custom-scrollbar' : ''}`}
                    style={cardData.length > 6 ? {
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#cbd5e1 transparent'
                    } : {}}
                  >
                    {Array.from({ length: 8 }).map((_, index) => (
                      <Card key={index} className="bg-white border border-gray-200 shadow-sm">
                        <CardContent className="p-4 sm:p-5 md:p-6">
                      <div className="animate-pulse">
                            {/* Header skeleton */}
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-7 h-7 bg-gray-300 rounded-md"></div>
                              <div className="h-4 bg-gray-300 rounded w-24"></div>
                    </div>
                            
                            {/* Main score with vertical indicators skeleton */}
                            <div className="mb-3.5">
                              <div className="flex items-start">
                                <div>
                                  <div className="flex items-baseline gap-2 mb-1">
                                    <div className="h-8 bg-gray-300 rounded w-16"></div>
                                    <div className="h-4 bg-gray-300 rounded w-12"></div>
                  </div>
                            <div className="h-3 bg-gray-300 rounded w-20"></div>
                    </div>
                                <div className="flex items-start gap-2" style={{ marginLeft: '48px' }}>
                                  <div className="text-left">
                                    <div className="h-3 bg-gray-300 rounded w-12" style={{ lineHeight: '18.5px' }}></div>
                                    <div className="h-3 bg-gray-300 rounded w-14" style={{ lineHeight: '18.5px' }}></div>
                                    <div className="h-3 bg-gray-300 rounded w-12" style={{ lineHeight: '18.5px' }}></div>
                        </div>
                                  <div className="flex flex-col bg-gray-300 rounded-sm" style={{ width: '7px', height: '53.5px' }}></div>
                        </div>
                    </div>
                  </div>

                            {/* Separator */}
                            <div className="border-b border-dotted border-gray-300 mb-3.5"></div>

                            {/* Violations skeleton */}
                            <div className="mb-4">
                              <div className="flex items-baseline gap-2 mb-1">
                                <div className="h-6 bg-gray-300 rounded w-12"></div>
                            <div className="h-3 bg-gray-300 rounded w-8"></div>
                    </div>
                              <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>

                            {/* Bottom grid skeleton */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="h-4 bg-gray-300 rounded w-10 mb-1"></div>
                                <div className="h-3 bg-gray-300 rounded w-16"></div>
                    </div>
                              <div>
                                <div className="h-4 bg-gray-300 rounded w-10 mb-1"></div>
                                <div className="h-3 bg-gray-300 rounded w-20"></div>
              </div>
                </div>
              </div>
            </CardContent>
          </Card>
                ))}
                    </div>
            ) : (
                  <div 
                    className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 ${cardData.length > 6 ? 'max-h-[400px] sm:max-h-[500px] md:max-h-[616px] overflow-y-auto custom-scrollbar' : ''}`}
                    style={cardData.length > 6 ? {
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#cbd5e1 transparent'
                    } : {}}
                  >
                {cardData.map((channel: CardDataType, index: number) => (
                      <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <CardContent className="p-4 sm:p-5 md:p-6">
                          {/* Header with Icon and Name - Responsive */}
                          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
                            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-white font-bold text-xs bg-${channel.color} shadow-sm`}>
                              {channel.channelIcon}
                            </div>
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{channel.channelName}</h3>
                          </div>

                          {/* Main Parity Score with Vertical Win/Meet/Loss - Responsive */}
                          <div className="mb-3 sm:mb-3.5">
                            <div className="flex items-start">
                              {/* Left: Parity Score */}
                              <div>
                                <div className="flex items-baseline gap-1 sm:gap-2 mb-1">
                                  <span className="text-xl sm:text-2xl font-bold text-gray-900">{channel.parityScore}%</span>
                                  <div className="flex items-center gap-1" style={{ paddingLeft: '2px' }}>
                                    <span className={`text-xs sm:text-sm font-bold ${channel.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                      {channel.trend === 'up' ? '-' : '+'}{channel.trendValue}%
                                    </span>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 font-medium">Parity Score</p>
                              </div>

                              {/* Right Side: Vertical Win/Meet/Loss Bar with responsive margin */}
                              <div className="flex items-start gap-1.5 sm:gap-2 ml-6 sm:ml-8 md:ml-12">
                                <div className="text-left">
                                  <div className="font-medium text-orange-600 text-xs sm:text-sm" style={{ lineHeight: '16px' }}>Win: {channel.winPercent}%</div>
                                  <div className="font-medium text-green-600 text-xs sm:text-sm" style={{ lineHeight: '16px' }}>Meet: {channel.meetPercent}%</div>
                                  <div className="font-medium text-red-600 text-xs sm:text-sm" style={{ lineHeight: '16px' }}>Loss: {channel.lossPercent}%</div>
                                </div>
                                <div className="flex flex-col bg-gray-100 rounded-sm overflow-hidden" style={{ width: '6px', height: '48px' }}>
                                  <div 
                                    className="bg-orange-400 w-full" 
                                    style={{ height: `${channel.winPercent}%` }}
                                  ></div>
                                  <div 
                                    className="bg-green-400 w-full" 
                                    style={{ height: `${channel.meetPercent}%` }}
                                  ></div>
                                  <div 
                                    className="bg-red-400 w-full" 
                                    style={{ height: `${channel.lossPercent}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Dotted Separator */}
                          <div className="border-b border-dotted border-gray-300 mb-3 sm:mb-3.5"></div>

                          {/* Total Violations - Responsive */}
                          <div className="mb-3 sm:mb-4">
                            <div className="flex items-baseline gap-1 sm:gap-2 mb-1">
                              <span className="text-lg sm:text-xl font-bold text-gray-900">{channel.totalViolations}%</span>
                              <div className="flex items-center gap-1" style={{ paddingLeft: '4px' }}>
                                <span className={`text-xs font-medium ${channel.violationsTrend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                  {channel.violationsTrend === 'up' ? '-' : '+'}{channel.violationsTrendValue}%
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 font-medium">Violations</p>
                          </div>

                          {/* Rate and Availability Violations - Responsive */}
                          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                            {/* Rate Violations */}
                            <div>
                              <div className="flex flex-col sm:flex-row sm:items-baseline gap-0 sm:gap-1 mb-1">
                                <span className="text-sm sm:text-base font-bold text-gray-900">{channel.rateViolations}%</span>
                                <div className="flex items-center gap-1">
                                  <span className={`text-xs font-bold ${channel.rateViolationsTrend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    {channel.rateViolationsTrend === 'up' ? '-' : '+'}{channel.rateViolationsTrendValue}%
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 font-medium">Rate Violations</p>
                            </div>

                            {/* Availability Violations */}
                            <div>
                              <div className="flex flex-col sm:flex-row sm:items-baseline gap-0 sm:gap-1 mb-1">
                                <span className="text-sm sm:text-base font-bold text-gray-900">{channel.availabilityViolations}%</span>
                                <div className="flex items-center gap-1">
                                  <span className={`text-xs font-bold ${channel.availabilityViolationsTrend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    {channel.availabilityViolationsTrend === 'up' ? '-' : '+'}{channel.availabilityViolationsTrendValue}%
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 font-medium">Availability Violations</p>
                            </div>
                          </div>
            </CardContent>
          </Card>
                ))}
          </div>
        )}
              </CardContent>
            </Card>
          </div>
          
          {/* Parity Calendar View */}
          <ParityCalendarView />

            </div>
          </div>

        </div>
   )
 }

export default function ParityMonitoringPage() {
  return (
    <ParityDateProvider>
      <ParityChannelProvider>
        <ParityMonitoringContent />
      </ParityChannelProvider>
    </ParityDateProvider>
  )
}
