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
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts"
import { cn } from "@/lib/utils"
import { format, addDays, eachDayOfInterval } from "date-fns"
import { ParityFilterBar, ParityDateProvider, ParityChannelProvider, useParityDateContext, useParityChannelContext } from "@/components/parity-filter-bar"
import { ParityCalendarView } from "@/components/parity-calendar-view"
import { ParityOverviewFilterBar } from "@/components/parity-overview-filter-bar"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { getBRGCalculationSetting, GetParityData } from "@/lib/parity"
import { conevrtDateforApi } from "@/lib/utils"
import { LocalStorageService } from "@/lib/localstorage"


function ParityMonitoringContent() {
  const [selectedProperty] = useSelectedProperty()
  const { startDate, endDate } = useParityDateContext()
  const { selectedChannels } = useParityChannelContext()
  const [parityResponseData, setParityResponseData] = useState<any>(null)
  const [brgSettingData, setBrgSettingData] = useState<any>(null)
  // const [violationCount, setViolationCount] = useState<any>();
  // Function to handle data from child component (if needed)
  const handleChildData = useCallback((data: any) => {

    // You can process data from the child component here if needed
  }, [])

  // Function to handle channel selection changes
  const handleChannelSelectionChange = useCallback((selectedChannels: any[]) => {
    // This will trigger the useEffect that fetches parity data
  }, [])

  // const [filters, setFilters] = useState({
  //   rateType: "lowest",
  //   device: "desktop",
  //   nights: "1",
  //   guests: "2",
  //   room: "any",
  //   meal: "any",
  // })
  const [apiParityData, setApiParityData] = useState<any>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingCycle, setLoadingCycle] = useState(1)

  // Formatting functions for tooltips
  // Channel: 130px width - Break words with hyphen, use full width
  const formatChannelText = (text: string) => {
    if (text.length <= 22) return text // Single line for short text
    if (text.length <= 44) {
      // Break at character 22, add hyphen if breaking a word
      const firstLine = text.substring(0, 22)
      const secondLine = text.substring(22)

      // Check if we're breaking in the middle of a word
      if (text[21] !== ' ' && text[22] !== ' ' && text[22]) {
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
    // Truncate after 44 chars with ellipsis
    const truncated = text.substring(0, 41) + '...'
    const firstLine = truncated.substring(0, 22)
    const secondLine = truncated.substring(22)

    // Check if we're breaking in the middle of a word
    if (truncated[21] !== ' ' && truncated[22] !== ' ' && truncated[22]) {
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

  // Rate: 100px width - Break words with hyphen, use full width
  const formatRateText = (text: string) => {
    if (text.length <= 13) return text // Single line for short text
    if (text.length <= 26) {
      // Break at character 13, add hyphen if breaking a word
      const firstLine = text.substring(0, 13)
      const secondLine = text.substring(13)

      // Check if we're breaking in the middle of a word
      if (text[12] !== ' ' && text[13] !== ' ' && text[13]) {
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
    // Truncate after 26 chars with ellipsis
    const truncated = text.substring(0, 23) + '...'
    const firstLine = truncated.substring(0, 13)
    const secondLine = truncated.substring(13)

    // Check if we're breaking in the middle of a word
    if (truncated[12] !== ' ' && truncated[13] !== ' ' && truncated[13]) {
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

  // Room: 150px width - Break words with hyphen, use full width
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

  // Inclusion: 150px width - Break words with hyphen, use full width
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

  // Helper function to get room abbreviation
  const getRoomAbbreviation = (roomType: string) => {
    const words = roomType.split(' ')
    if (words.length <= 2) return words.join(' ').substring(0, 6).toUpperCase()
    return words.map(word => word.charAt(0)).join('').substring(0, 6).toUpperCase()
  }

  // Fetch parity data when dependencies change
  useEffect(() => {
    if (!selectedProperty?.sid || !startDate || !endDate || selectedChannels.length === 0) {

      return
    }

    let isCancelled = false

    const fetchParityData = async () => {
      if (isCancelled) return

      setIsLoadingData(true)
      setIsLoading(true)
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
        const filtersValue = {
          "sid": selectedProperty.sid,
          "checkInStartDate": conevrtDateforApi(startDate.toString()),
          "checkInEndDate": conevrtDateforApi(endDate.toString()),
          "channelName": selectedChannels,
          "guest": null,
          "los": null,
          "promotion": null,
          "qualification": null,
          "restriction": null,
        }
        const response = await GetParityData(filtersValue)

        if (!isCancelled && response.status && response.body) {
          setApiParityData(response.body)
          setParityResponseData(response.body)

        } else if (!isCancelled) {
          setApiParityData(null)
          setParityResponseData(null)
        }
      } catch (error) {
        if (!isCancelled) {
          // Fallback to null to use static data
          setApiParityData(null)
        }
      } finally {
        clearInterval(progressInterval);
        setLoadingProgress(100); // finish instantly
        setTimeout(() => {
          if (!isCancelled) {
            setIsLoadingData(false)
            setIsLoading(false);
            setLoadingProgress(0); // reset for next load
          }
        }, 300); // brief delay so user sees 100%
      }
    }

    fetchParityData()

    return () => {
      isCancelled = true
    }
  }, [selectedProperty?.sid, startDate, endDate, JSON.stringify(selectedChannels)])

  useEffect(() => {
    if (!selectedProperty?.sid) return;
    LocalStorageService.setItem("preferredDateMode", "next7days")
    const fetechBRGCalculationSetting = async () => {
      try {
        const response: any = await getBRGCalculationSetting({
          SID: selectedProperty?.sid
        });

        if (response?.status) {
          setBrgSettingData(response?.body);
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    };

    fetechBRGCalculationSetting();
  }, [selectedProperty?.sid])
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
  const [legendVisibility, setLegendVisibility] = useState<{ [key: string]: boolean }>(() => {
    const initial: { [key: string]: boolean } = {}
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
      return generateFallbackChartData(chartDates)
    }
  }, [startDate, endDate, apiParityData])

  // Process API data for card view
  const processApiDataForCards = (apiData: any) => {
    if (!apiData?.otaViolationChannelRate?.violationChannelRatesCollection) {
      return null
    }

    const channels = apiData.otaViolationChannelRate.violationChannelRatesCollection
    let toatlRateViolationCount = 0;
    let toatlAvailabilityViolationCount = 0;
    channels.forEach((element: any) => {
      const rateViolationCount = element?.checkInDateWiseRates.filter((x: any) => (x.rateViolation)).length;
      const availabilityViolationCount = element?.checkInDateWiseRates.filter((x: any) => (x.availViolation)).length;
      if (element.channelWisewinMeetLoss) {
        toatlRateViolationCount += rateViolationCount;
        toatlAvailabilityViolationCount += availabilityViolationCount
      }
    });
    // setViolationCount({ "toatlBrandAvailabilityViolations": toatlAvailabilityViolationCount, "toatlBrandRateViolations": toatlRateViolationCount, "toatlBrandViolations": toatlAvailabilityViolationCount + toatlRateViolationCount })
    return channels.map((channel: any) => {
      // Calculate overall parity metrics from daily data
      const isBrand = channel.isBrand || false;
      // const dailyRates = channel.channelWisewinMeetLoss || []
      const dailyRates = isBrand
        ? apiParityData?.otaViolationChannelRate?.overallWinMeetLoss
        : channel.channelWisewinMeetLoss || [];
      const totalWin = dailyRates.winCount
      const totalMeet = dailyRates.meetCount
      const totalLoss = dailyRates.lossCount
      const total = totalWin + totalMeet + totalLoss
      const winPercent = total > 0 ? Math.round((totalWin / total) * 100) : 0
      const meetPercent = total > 0 ? Math.round((totalMeet / total) * 100) : 0
      const lossPercent = total > 0 ? Math.round((totalLoss / total) * 100) : 0
      const parityScore = total > 0 ? Math.round(((totalWin + totalMeet) / total) * 100) : 0

      // Calculate violations from checkInDateWiseRates
      const checkInDateWiseRates = channel.checkInDateWiseRates || []
      const totalCheckInDates = total

      // Count rate violations (true rateViolation values)
      const rateViolationCount = checkInDateWiseRates.filter((rate: any) => rate.rateViolation === true).length
      const rateViolations = totalCheckInDates > 0 ? Math.round((rateViolationCount / totalCheckInDates) * 100) : 0

      // Count availability violations (true availViolation values)
      const availabilityViolationCount = checkInDateWiseRates.filter((rate: any) => rate.availViolation === true).length
      const availabilityViolations = totalCheckInDates > 0 ? Math.round((availabilityViolationCount / totalCheckInDates) * 100) : 0

      // Total violations = rate violations + availability violations
      const totalViolations = rateViolations + availabilityViolations
      const toatlBrandAvailabilityViolations = totalCheckInDates > 0 ? Math.round((toatlAvailabilityViolationCount / totalCheckInDates) * 100) : 0
      const toatlBrandRateViolations = totalCheckInDates > 0 ? Math.round((toatlRateViolationCount / totalCheckInDates) * 100) : 0
      const toatlBrandViolations = totalCheckInDates > 0 ? Math.round(((toatlRateViolationCount + toatlAvailabilityViolationCount) / totalCheckInDates) * 100) : 0
      const tydata = {
        channelName: channel.channelName,
        channelIcon: channel.channelIcon,
        parityScore,
        trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down',
        trendValue: Math.random() * 5,
        winPercent,
        meetPercent,
        lossPercent,
        totalViolations: isBrand ? toatlBrandViolations : totalViolations,
        violationsTrend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down',
        violationsTrendValue: Math.round(Math.random() * 10) + 1,
        rateViolations: isBrand ? toatlBrandRateViolations : rateViolations,
        rateViolationsTrend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down',
        rateViolationsTrendValue: Math.round(Math.random() * 8) + 1,
        availabilityViolations: isBrand ? toatlBrandAvailabilityViolations : availabilityViolations,
        availabilityViolationsTrend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down',
        availabilityViolationsTrendValue: Math.round(Math.random() * 5) + 1,
        color: channel.isBrand ? 'blue-600' :
          channel.channelName?.toLowerCase().includes('booking') ? 'blue-500' :
            channel.channelName?.toLowerCase().includes('expedia') ? 'orange-500' :
              channel.channelName?.toLowerCase().includes('agoda') ? 'purple-500' : 'gray-500',
        isBrand: channel.isBrand || false
      }
      console.log("Testd Data " + channel.channelName, toatlAvailabilityViolationCount, toatlRateViolationCount)
      return tydata
    })

  }

  // Get benchmark channel info
  // Helper function to convert to PascalCase (Title Case)
  const toPascalCase = (str: string) => {
    if (!str) return str;
    // Split by common separators and convert each word to title case
    return str
      .split(/[-_\s]+/) // Split by hyphens, underscores, or spaces
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  const benchmarkChannel = useMemo(() => {
    if (brgSettingData != null) {
      return {
        channelId: brgSettingData?.otaBench,
        channelName: toPascalCase(brgSettingData?.otaBenchName),
        isBrand: true
      }
    }
    return null;
  }, [brgSettingData])

  // Get card data (API or fallback)
  const cardData = useMemo(() => {
    if (apiParityData && apiParityData.otaViolationChannelRate?.violationChannelRatesCollection?.length > 0) {
      const processedData = processApiDataForCards(apiParityData)
      if (processedData && processedData.length > 0) {
        return processedData
      }
    }

    // Always return fallback data when API data is not available
    return [
      // { 
      //   channelName: "MakeMyTripBooking", 
      //   channelIcon: "https://storage.googleapis.com/rgdatalake/rg_optimanew/ChannelIcon/MakeMyTrip.svg", 
      //   parityScore: 35, 
      //   trend: 'down', 
      //   trendValue: 3.2,
      //   winPercent: 15,
      //   meetPercent: 20,
      //   lossPercent: 65,
      //   totalViolations: 65,
      //   violationsTrend: 'up',
      //   violationsTrendValue: 3,
      //   rateViolations: 21,
      //   rateViolationsTrend: 'down',
      //   rateViolationsTrendValue: 2,
      //   availabilityViolations: 44,
      //   availabilityViolationsTrend: 'up',
      //   availabilityViolationsTrendValue: 3.2,
      //   color: 'blue-600',
      //   isBrand: true
      // },
      // { 
      //   channelName: "Tripadvisor", 
      //   channelIcon: "🦉", 
      //   parityScore: 80, 
      //   trend: 'up', 
      //   trendValue: 3.2,
      //   winPercent: 30,
      //   meetPercent: 26,
      //   lossPercent: 44,
      //   totalViolations: 20,
      //   violationsTrend: 'up',
      //   violationsTrendValue: 3,
      //   rateViolations: 8,
      //   rateViolationsTrend: 'down',
      //   rateViolationsTrendValue: 2,
      //   availabilityViolations: 12,
      //   availabilityViolationsTrend: 'up',
      //   availabilityViolationsTrendValue: 2.5,
      //   color: 'green-600',
      //   isBrand: false
      // },
      // { 
      //   channelName: "Expedia", 
      //   channelIcon: "https://storage.googleapis.com/rgdatalake/rg_optimanew/ChannelIcon/Expedia.svg", 
      //   parityScore: 62, 
      //   trend: 'down', 
      //   trendValue: 3.2,
      //   winPercent: 22,
      //   meetPercent: 50,
      //   lossPercent: 28,
      //   totalViolations: 28,
      //   violationsTrend: 'up',
      //   violationsTrendValue: 3,
      //   rateViolations: 21,
      //   rateViolationsTrend: 'down',
      //   rateViolationsTrendValue: 2,
      //   availabilityViolations: 7,
      //   availabilityViolationsTrend: 'up',
      //   availabilityViolationsTrendValue: 3.2,
      //   color: 'yellow-500'
      // },
      // { 
      //   channelName: "Agoda", 
      //   channelIcon: "A", 
      //   parityScore: 80, 
      //   trend: 'up', 
      //   trendValue: 3.2,
      //   winPercent: 30,
      //   meetPercent: 26,
      //   lossPercent: 44,
      //   totalViolations: 20,
      //   violationsTrend: 'up',
      //   violationsTrendValue: 3,
      //   rateViolations: 8,
      //   rateViolationsTrend: 'down',
      //   rateViolationsTrendValue: 2,
      //   availabilityViolations: 12,
      //   availabilityViolationsTrend: 'down',
      //   availabilityViolationsTrendValue: 1.5,
      //   color: 'red-500'
      // },
      // { 
      //   channelName: "Hotels.com", 
      //   channelIcon: "H", 
      //   parityScore: 62, 
      //   trend: 'down', 
      //   trendValue: 3.2,
      //   winPercent: 22,
      //   meetPercent: 50,
      //   lossPercent: 28,
      //   totalViolations: 28,
      //   violationsTrend: 'up',
      //   violationsTrendValue: 3,
      //   rateViolations: 21,
      //   rateViolationsTrend: 'down',
      //   rateViolationsTrendValue: 2,
      //   availabilityViolations: 7,
      //   availabilityViolationsTrend: 'up',
      //   availabilityViolationsTrendValue: 3.2,
      //   color: 'purple-600',
      //   isBrand: false
      // },
      // { 
      //   channelName: "Kayak", 
      //   channelIcon: "K", 
      //   parityScore: 75, 
      //   trend: 'up', 
      //   trendValue: 2.1,
      //   winPercent: 35,
      //   meetPercent: 40,
      //   lossPercent: 25,
      //   totalViolations: 25,
      //   violationsTrend: 'down',
      //   violationsTrendValue: 1.8,
      //   rateViolations: 15,
      //   rateViolationsTrend: 'down',
      //   rateViolationsTrendValue: 1.2,
      //   availabilityViolations: 10,
      //   availabilityViolationsTrend: 'down',
      //   availabilityViolationsTrendValue: 0.8,
      //   color: 'orange-500'
      // },
      // { 
      //   channelName: "Priceline", 
      //   channelIcon: "P", 
      //   parityScore: 68, 
      //   trend: 'down', 
      //   trendValue: 1.5,
      //   winPercent: 28,
      //   meetPercent: 45,
      //   lossPercent: 27,
      //   totalViolations: 32,
      //   violationsTrend: 'up',
      //   violationsTrendValue: 2.3,
      //   rateViolations: 18,
      //   rateViolationsTrend: 'up',
      //   rateViolationsTrendValue: 1.8,
      //   availabilityViolations: 14,
      //   availabilityViolationsTrend: 'up',
      //   availabilityViolationsTrendValue: 1.2,
      //   color: 'indigo-600',
      //   isBrand: false
      // }
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
    isBrand?: boolean
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
          className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-3 min-w-[500px] max-w-[700px] z-[10001] relative"
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
            <table className="text-xs" style={{ borderSpacing: '0 0', tableLayout: 'fixed', width: '530px' }}>
              <thead>
                <tr className="text-gray-500 dark:text-slate-400 font-medium">
                  <th className="text-left pb-2 pl-2" style={{ width: '130px', paddingRight: '16px' }}>Channel</th>
                  <th className="text-left pb-2" style={{ width: '100px', paddingRight: '16px' }}>Rate (Rp)</th>
                  <th className="text-left pb-2" style={{ width: '150px', paddingRight: '10px' }}>Room</th>
                  <th className="text-left pb-2" style={{ width: '150px' }}>Inclusion</th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                {payload.map((entry: any, index: number) => {
                  const channelInfo = availableChannelLines.find(channel => channel.dataKey === entry.dataKey)
                  const channelName = channelInfo?.name || entry.name
                  const rate = entry.value
                  const isBrandCom = entry.dataKey === 'brandCom'




                  const formattedChannelName = formatChannelText(channelName)
                  const rateString = `$${rate}`
                  const formattedRate = formatRateText(rateString)

                  // Format room type with abbreviation and 2-line truncation
                  const roomType = data?.roomType || 'Deluxe Room Superior Executive Suite with Ocean View and Balcony'
                  const inclusion = data?.inclusion || 'Free WiFi, Breakfast, Pool Access, Spa Services, Gym Access'

                  const roomAbbr = getRoomAbbreviation(roomType)
                  const roomWithAbbr = `${roomAbbr} - ${roomType}`

                  const formattedRoom = formatRoomText(roomWithAbbr)
                  const formattedInclusion = formatInclusionText(inclusion)

                  // Fixed column widths
                  const channelWidth = '130px'
                  const rateWidth = '100px'
                  const roomWidth = '150px'
                  const inclusionWidth = '150px'

                  return (
                    <tr key={index} className={`${isBrandCom ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                      }`}>
                      {/* Channel */}
                      <td className="py-1.5 pl-2 rounded-l align-top" style={{ width: channelWidth, paddingRight: '16px' }}>
                        <span className={`font-medium ${isBrandCom ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-slate-100'
                          }`} title={channelName}>
                          {typeof formattedChannelName === 'string' ? (
                            formattedChannelName
                          ) : (
                            <div>
                              <div className="leading-tight">{formattedChannelName.firstLine}</div>
                              <div className="leading-tight">{formattedChannelName.secondLine}</div>
                            </div>
                          )}
                        </span>
                      </td>

                      {/* Rate */}
                      <td className={`py-1.5 text-left font-bold align-top ${isBrandCom ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-slate-100'
                        }`} style={{ width: rateWidth, paddingRight: '16px' }}>
                        {typeof formattedRate === 'string' ? (
                          formattedRate
                        ) : (
                          <div>
                            <div className="leading-tight">{formattedRate.firstLine}</div>
                            <div className="leading-tight">{formattedRate.secondLine}</div>
                          </div>
                        )}
                      </td>

                      {/* Room Type - 2-line format */}
                      <td className="py-1.5 text-gray-700 dark:text-slate-300 align-top" style={{ width: roomWidth, paddingRight: '10px' }}>
                        {typeof formattedRoom === 'string' ? (
                          <div title={roomWithAbbr}>
                            {formattedRoom}
                          </div>
                        ) : (
                          <div title={roomWithAbbr}>
                            <div className="leading-tight">{formattedRoom.firstLine}</div>
                            <div className="leading-tight">{formattedRoom.secondLine}</div>
                          </div>
                        )}
                      </td>

                      {/* Inclusion - 2-line format */}
                      <td className="py-1.5 text-gray-700 dark:text-slate-300 rounded-r align-top" style={{ width: inclusionWidth }}>
                        {typeof formattedInclusion === 'string' ? (
                          <div title={inclusion}>
                            {formattedInclusion}
                          </div>
                        ) : (
                          <div title={inclusion}>
                            <div className="leading-tight">{formattedInclusion.firstLine}</div>
                            <div className="leading-tight">{formattedInclusion.secondLine}</div>
                          </div>
                        )}
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

  // Widget Progress Component (same as Demand page)
  const WidgetProgress = ({ className: progressClassName }: { className?: string }) => (
    <div className={cn("absolute top-0 left-0 right-0 z-10", progressClassName)}>
      <div className="h-[3px] w-full bg-gray-200/50 dark:bg-gray-800/50 overflow-hidden rounded-sm">
        <div
          className="h-full bg-blue-500/90 shadow-sm shadow-blue-500/20 transition-all duration-150 ease-out"
          style={{
            width: `${loadingProgress}%`,
            transform: `translateX(0%)`
          }}
        />
      </div>
    </div>
  )

  // Show loading state when data is being fetched

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
        <GlobalProgressBar />
        <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8 xl:py-10">
          <div className="max-w-7xl xl:max-w-none mx-auto">
            <LoadingSkeleton type="parity" showCycleCounter={true} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Filter Bar */}
      <div className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-border/50 shadow-sm transition-shadow duration-200 relative overflow-hidden">
        {/* {isLoadingData && <WidgetProgress />} */}
        <ParityOverviewFilterBar
          benchmarkChannel={benchmarkChannel}
          onChannelSelectionChange={handleChannelSelectionChange}
        />
      </div>

      {/* Professional Header Section */}
      <section className="w-full relative overflow-hidden">
        {isLoadingData && <WidgetProgress />}
        <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="max-w-7xl xl:max-w-none mx-auto">
            <TooltipProvider>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 mt-4">
                {/* Left Section - Title & Description */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-foreground">
                      Parity Analysis
                    </h1>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-sm bg-slate-800 text-white border-slate-700">
                        <p className="text-sm">
                          Monitor rate parity across all distribution channels, track violations, and ensure competitive positioning with real-time alerts and comprehensive analytics.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Rate parity monitoring with channel insights and violation tracking
                  </p>
                </div>


              </div>
            </TooltipProvider>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-0 md:pt-0 lg:pt-0 xl:pt-2 pb-4 md:pb-6 lg:pb-8 xl:pb-10">
        <div className="max-w-7xl xl:max-w-none mx-auto space-y-4 md:space-y-6 lg:space-y-8">

          {/* Main Content - Channel Performance Insights and Calendar */}
          <div className="space-y-6">
            {/* Rate Parity Cards Container */}
            <Card className="shadow-lg relative overflow-hidden">
              {isLoadingData && <WidgetProgress />}
              <CardHeader className="pb-2 mb-2.5">
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold">Channel Performance Insights</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pt-1 pb-6">
                {/* Channel Cards Grid */}
                {isLoadingData ? (
                  <div
                    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${cardData.length > 6 ? 'max-h-[616px] overflow-y-auto custom-scrollbar' : ''}`}
                    style={cardData.length > 6 ? {
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#cbd5e1 transparent'
                    } : {}}
                  >
                    {Array.from({ length: 8 }).map((_, index) => (
                      <Card key={index} className="bg-white border border-gray-200 shadow-sm">
                        <CardContent className="p-6">
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
                    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${cardData.length > 6 ? 'max-h-[616px] overflow-y-auto custom-scrollbar' : ''}`}
                    style={cardData.length > 6 ? {
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#cbd5e1 transparent'
                    } : {}}
                  >
                    {(() => {
                      // Sort channels: benchmark first, then alphabetical order
                      const sortedCardData = [...cardData].sort((a, b) => {
                        // Benchmark channel (isBrand: true) comes first
                        if (a.isBrand && !b.isBrand) return -1
                        if (!a.isBrand && b.isBrand) return 1

                        // For non-benchmark channels, sort alphabetically by channel name
                        return a.channelName?.localeCompare(b.channelName || '') || 0
                      })

                      return sortedCardData.map((channel: CardDataType, index: number) => {
                        const isBenchmark = channel.isBrand === true

                        return (
                          <Card key={index} className={cn(
                            "border shadow-sm transition-shadow duration-200",
                            isBenchmark
                              ? "bg-blue-50 border-blue-300 hover:bg-blue-100 cursor-default"
                              : "bg-white border-gray-200 hover:shadow-md"
                          )}>
                            <CardContent className="p-6">
                              {/* Header with Icon and Name */}
                              <div className="flex items-center gap-3 mb-6">
                                <div
                                  className={`w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-xs bg-${channel.color} shadow-sm`}
                                >
                                  {/* Check if channelIcon is a URL (starts with http) */}
                                  {channel.channelIcon && channel.channelIcon.startsWith('http') ? (
                                    <img
                                      src={channel.channelIcon}
                                      alt={channel.channelName}
                                      className="w-5 h-5 rounded"
                                      onError={(e) => {
                                        // Hide the image and show fallback on error
                                        e.currentTarget.style.display = 'none'
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                      }}
                                    />
                                  ) : null}
                                  {/* Fallback: Show channelIcon as text (for emojis/letters) or first letter of channel name */}
                                  <div className={cn(
                                    "w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm",
                                    `bg-${channel.color}`,
                                    channel.channelIcon && channel.channelIcon.startsWith('http') ? "hidden" : "block"
                                  )}>
                                    <span className="w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                      {channel.channelIcon && !channel.channelIcon.startsWith('http')
                                        ? channel.channelIcon
                                        : channel.channelName.charAt(0).toUpperCase()
                                      }
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-1 flex items-center justify-between">
                                  <h3 className={cn(
                                    "text-base font-semibold",
                                    isBenchmark ? "text-blue-900" : "text-gray-900"
                                  )}>
                                    {isBenchmark && channel.channelName.length > 14
                                      ? `${channel.channelName.substring(0, 14)}...`
                                      : channel.channelName
                                    }
                                  </h3>
                                  {isBenchmark && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-md">
                                      Benchmark
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Main Parity Score with Vertical Win/Meet/Loss */}
                              <div className="mb-3.5">
                                <div className="flex items-start">
                                  {/* Left: Parity Score */}
                                  <div>
                                    <div className="flex items-baseline gap-2 mb-1">
                                      <span className={cn(
                                        "text-2xl font-bold",
                                        isBenchmark ? "text-blue-900" : "text-gray-900"
                                      )}>{channel.parityScore}%</span>
                                    </div>
                                    <p className={cn(
                                      "text-xs font-medium",
                                      isBenchmark ? "text-blue-700" : "text-gray-500"
                                    )}>Parity Score</p>
                                  </div>

                                  {/* Left Side: Vertical Win/Meet/Loss Bar with 64px margin */}
                                  <div className="flex items-start gap-2" style={{ marginLeft: '64px' }}>
                                    <div className="text-left">
                                      <div className="font-medium text-orange-600" style={{ fontSize: '11px', lineHeight: '18.5px' }}>Win: {channel.winPercent}%</div>
                                      <div className="font-medium text-green-600" style={{ fontSize: '11px', lineHeight: '18.5px' }}>Meet: {channel.meetPercent}%</div>
                                      <div className="font-medium text-red-600" style={{ fontSize: '11px', lineHeight: '18.5px' }}>Loss: {channel.lossPercent}%</div>
                                    </div>
                                    <div className="flex flex-col bg-gray-100 rounded-sm overflow-hidden" style={{ width: '7px', height: '53.5px' }}>
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
                              <div className="border-b border-dotted border-gray-300 mb-3.5"></div>

                              {/* Total Violations */}
                              <div className="mb-4">
                                <div className="flex items-baseline gap-2 mb-1">
                                  <span className={cn(
                                    "text-xl font-bold",
                                    isBenchmark ? "text-blue-900" : "text-gray-900"
                                  )}>{channel.totalViolations}%</span>
                                </div>
                                <p className={cn(
                                  "text-xs font-medium",
                                  isBenchmark ? "text-blue-700" : "text-gray-500"
                                )}>Violations</p>
                              </div>

                              {/* Rate and Availability Violations */}
                              <div className="grid grid-cols-2">
                                {/* Rate Violations */}
                                <div style={{ width: '114px' }}>
                                  <div className="flex items-baseline gap-1 mb-1">
                                    <span className={cn(
                                      "text-base font-bold",
                                      isBenchmark ? "text-blue-900" : "text-gray-900"
                                    )}>{channel.rateViolations}%</span>
                                  </div>
                                  <p className={cn(
                                    "text-xs font-medium",
                                    isBenchmark ? "text-blue-700" : "text-gray-500"
                                  )}>
                                    <span className="hidden xl:inline">Rate Violations</span>
                                    <span className="xl:hidden">Rate Vio.</span>
                                  </p>
                                </div>

                                {/* Availability Violations */}
                                <div style={{ marginLeft: '-14px' }}>
                                  <div className="flex items-baseline gap-1 mb-1">
                                    <span className={cn(
                                      "text-base font-bold",
                                      isBenchmark ? "text-blue-900" : "text-gray-900"
                                    )}>{channel.availabilityViolations}%</span>
                                  </div>
                                  <p className={cn(
                                    "text-xs font-medium",
                                    isBenchmark ? "text-blue-700" : "text-gray-500"
                                  )}>
                                    <span className="hidden xl:inline">Availability Violations</span>
                                    <span className="xl:hidden">Availability Vio.</span>
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Parity Calendar View */}
          <Card className="shadow-lg relative overflow-hidden">
            {isLoadingData && <WidgetProgress />}
            <ParityCalendarView parityDataMain={apiParityData}
              onDataUpdate={handleChildData} />
          </Card>

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
