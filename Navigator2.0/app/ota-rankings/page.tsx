"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { EnhancedDatePicker } from "@/components/enhanced-date-picker"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

import { Calendar, ChevronDown, Eye, Users, ChevronLeft, ChevronRight, Download, Star, Info, BarChart3, Table } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts"
import { format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isWithinInterval, subMonths, isBefore, addMonths } from "date-fns"
import { toPng } from "html-to-image"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { getOTAChannels, getOTARankOnAllChannel } from "@/lib/otarank"
import { conevrtDateforApi, cn } from "@/lib/utils"
import { getChannels } from "@/lib/channels"
import { Globe } from "lucide-react"

export default function OTARankingsPage() {
  const [selectedProperty] = useSelectedProperty()
  const cardRef = useRef<HTMLDivElement>(null)
  
  // OTA Data state
  const [otaChannels, setOtaChannels] = useState<any[]>([])
  const [otaRankingData, setOtaRankingData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const isFetchingRef = useRef(false)
  
  // Page loading state for full-page loading effect
  const [isPageLoading, setIsPageLoading] = useState(false)
  
  // Window width state for responsive text
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920)
  
  const [compareWith, setCompareWith] = useState("Last 1 Week")
  const [compSet, setCompSet] = useState("Primary Compset")
  const [viewMode, setViewMode] = useState("Rank")
  const [rankViewMode, setRankViewMode] = useState<"graph" | "table">("graph")
  const [competitorPage, setCompetitorPage] = useState(0)
  
  // View mode state for Reviews tab (graph/table)
  const [reviewsViewMode, setReviewsViewMode] = useState<"graph" | "table">("graph")
  
  const [selectedChannel, setSelectedChannel] = useState("booking")
  
  // Reviews-specific state
  const [checkInRange, setCheckInRange] = useState("Last 30 Days")
  const [previousCheckInRange, setPreviousCheckInRange] = useState("Last 30 Days")
  const [selectedChannelsReviews, setSelectedChannelsReviews] = useState<string[]>(["booking", "expedia"])
  
  // Overview-style channel dropdown state
  const [overviewChannelData, setOverviewChannelData] = useState<any>([])
  const [selectedOverviewChannels, setSelectedOverviewChannels] = useState<number[]>([])
  const didFetchChannels = useRef(false)
  
  // Custom calendar state for Reviews
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>()
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>()
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date())
  
  // Fetch channel data for Overview-style dropdown
  useEffect(() => {
    if (!selectedProperty?.sid || didFetchChannels.current) return;

    didFetchChannels.current = true;
    getChannels({ SID: selectedProperty?.sid })
      .then((res) => {
        if (res?.status && res?.body) {
          // Add "All Channels" option
          const allChannel = { cid: -1, name: "All Channels" };
          const channelList = [allChannel, ...res.body];

          // Set data
          setOverviewChannelData(channelList);

          // Set selected channels as array of cids (default to all)
          setSelectedOverviewChannels(channelList.map(c => c.cid));
        }
      })
      .catch((err) => console.error(err));
  }, [selectedProperty?.sid]);

  // Reset channel fetch when property changes
  useEffect(() => {
    didFetchChannels.current = false;
  }, [selectedProperty?.sid]);

  // Handle window resize for responsive text
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Get display text for overview channel dropdown
  const getOverviewChannelDisplayText = useCallback(() => {
    if (selectedOverviewChannels.length === 0) {
      return "All Channels"
    } else if (selectedOverviewChannels.includes(-1)) {
      return "All Channels"
    } else if (selectedOverviewChannels.length === 1) {
      const channel = overviewChannelData.find((c: any) => c.cid === selectedOverviewChannels[0]);
      if (channel) {
        return channel.name
      }
      return "Select Channels"
    } else {
      return `${selectedOverviewChannels.length} Channels`
    }
  }, [selectedOverviewChannels, overviewChannelData])

  // Handle overview channel selection
  const handleOverviewChannelSelect = useCallback((channelCid: any, channelData: any) => {
    setSelectedOverviewChannels(prev => {
      const isSelected = prev.includes(channelCid)
      let newSelection: number[]

      if (channelCid === -1) {
        // If selecting "All Channels", clear all others
        newSelection = isSelected ? [] : channelData.map((c: any) => c.cid)
      } else {
        // If selecting a specific channel
        if (isSelected) {
          // Remove this channel and "All Channels" if present
          newSelection = prev.filter(id => id !== channelCid && id !== -1)
        } else {
          // Add this channel and remove "All Channels" if present
          const withoutAll = prev.filter(id => id !== -1)
          newSelection = [...withoutAll, channelCid]
          
          // If all individual channels are now selected, add "All Channels"
          if (newSelection.length === channelData.length - 1) {
            newSelection = channelData.map((c: any) => c.cid)
          }
        }
      }

      return newSelection
    })
  }, [])

  const onOpenChangeSelect = (isOpen: boolean) => {
    // Handle dropdown open/close if needed
  }

  // Get responsive compare text for channel widgets
  const getCompareText = useCallback(() => {
    if (windowWidth <= 1280) {
      return "vs 1 week" // Compact version for 1280px and below
    }
    return "vs. Last 1 week" // Full version for larger screens
  }, [windowWidth])

  // Get display text for check-in range
  const getCheckInDisplayText = () => {
    const selectedOption = checkInRangeOptions.find(opt => opt.label === checkInRange)
    if (selectedOption?.dateRange) {
      return `${selectedOption.label} • ${selectedOption.dateRange}`
    }
    if (checkInRange === "Custom Date Range") {
      if (customStartDate && customEndDate) {
        // Show custom selected range
        const formatDate = (date: Date) => {
          const formatted = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).replace(',', '')
          return `${formatted} '25`
        }
        return `Custom Date Range • ${formatDate(customEndDate)} - ${formatDate(customStartDate)}`
      } else {
        // Show previous selection when no custom dates are selected
        const previousOption = checkInRangeOptions.find(opt => opt.label === previousCheckInRange)
        if (previousOption?.dateRange) {
          return `${previousOption.label} • ${previousOption.dateRange}`
        }
        return previousCheckInRange
      }
    }
    return checkInRange
  }

  // Calendar helper functions for Reviews
  const handleCustomDateSelect = (date: Date) => {
    if (!customStartDate || customEndDate) {
      // First selection or reset selection
      setCustomStartDate(date)
      setCustomEndDate(undefined)
    } else {
      // Second selection - determine start and end based on chronological order
      if (date > customStartDate) {
        setCustomEndDate(date)
      } else if (date < customStartDate) {
        setCustomEndDate(customStartDate)
        setCustomStartDate(date)
      } else {
        // Same date selected - reset to single date
        setCustomStartDate(date)
        setCustomEndDate(undefined)
      }
    }
  }

  const renderCustomCalendar = () => {
    const monthStart = startOfMonth(currentCalendarMonth)
    const monthEnd = endOfMonth(currentCalendarMonth)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    const firstDayOfWeek = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1
    const paddingDaysBefore = Array.from({ length: firstDayOfWeek }, (_, i) => {
      const paddingDate = new Date(monthStart)
      paddingDate.setDate(paddingDate.getDate() - (firstDayOfWeek - i))
      return paddingDate
    })

    const totalCells = 42
    const remainingCells = totalCells - (paddingDaysBefore.length + days.length)
    const paddingDaysAfter = Array.from({ length: remainingCells }, (_, i) => {
      const paddingDate = new Date(monthEnd)
      paddingDate.setDate(paddingDate.getDate() + i + 1)
      return paddingDate
    })

    const allDays = [...paddingDaysBefore, ...days, ...paddingDaysAfter]
    const today = new Date()
    const lastYearJan = new Date(today.getFullYear() - 1, 0, 1) // January of last year

    return (
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentCalendarMonth(subMonths(currentCalendarMonth, 1))}
            disabled={isBefore(endOfMonth(subMonths(currentCalendarMonth, 1)), lastYearJan)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold text-gray-700">{format(currentCalendarMonth, "MMMM yyyy")}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentCalendarMonth(addMonths(currentCalendarMonth, 1))}
            disabled={true}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {allDays.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentCalendarMonth)
            const isToday = isSameDay(day, today)
            const isFutureDate = day > today
            const isBeforeLimit = day < lastYearJan
            const isSelected = customStartDate && isSameDay(day, customStartDate) || customEndDate && isSameDay(day, customEndDate)
            const isInRange = customStartDate && customEndDate && 
              isWithinInterval(day, { start: customStartDate, end: customEndDate })

            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 font-normal ${
                  !isCurrentMonth ? "text-gray-300" : ""
                } ${isSelected ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white" : ""} ${
                  isInRange && !isSelected ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white" : ""
                } ${isToday ? "border border-primary" : ""}`}
                onClick={() => handleCustomDateSelect(day)}
                disabled={isFutureDate || isBeforeLimit || !isCurrentMonth}
              >
                {format(day, "d")}
              </Button>
            )
          })}
        </div>
      </div>
    )
  }


  // Date picker state
  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)) // 7 days from now
  
  // Filter dropdown states
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const [isCompsetOpen, setIsCompsetOpen] = useState(false)
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  
  // Channel pagination state
  const [currentChannelPage, setCurrentChannelPage] = useState(0)
  const channelsPerPage = 3
  
  // Separate error states for each tab
  const [rankErrorMessage, setRankErrorMessage] = useState<string>('')
  const [reviewsErrorMessage, setReviewsErrorMessage] = useState<string>('')

  // Get current error state based on active tab
  const errorMessage = viewMode === "Rank" ? rankErrorMessage : reviewsErrorMessage
  const setErrorMessage = viewMode === "Rank" ? setRankErrorMessage : setReviewsErrorMessage

  // Maximum lines allowed on graph
  const MAX_LINES = 10

  // Available hotel lines (expanded for testing 10-line limit) - Memoized for performance
  const availableHotelLines = useMemo(() => [
    { dataKey: 'myHotel', name: 'Alhambra Hotel', color: '#3b82f6' },
    { dataKey: 'competitor1', name: 'Grand Hotel Guayaquil International Resorts', color: '#10b981' },
    { dataKey: 'competitor2', name: 'Clarion Inn Lake Buena Vista', color: '#f59e0b' },
    { dataKey: 'competitor3', name: 'Marriott Downtown', color: '#ef4444' },
    { dataKey: 'competitor4', name: 'Hilton Garden Inn', color: '#8b5cf6' },
    { dataKey: 'competitor5', name: 'Hampton Inn & Suites', color: '#06b6d4' },
    { dataKey: 'competitor6', name: 'Holiday Inn Express', color: '#84cc16' },
    { dataKey: 'competitor7', name: 'Courtyard by Marriott', color: '#f97316' },
    { dataKey: 'competitor8', name: 'Residence Inn', color: '#ec4899' },
    { dataKey: 'competitor9', name: 'SpringHill Suites', color: '#6366f1' },
    { dataKey: 'competitor10', name: 'Four Points Sheraton', color: '#14b8a6' },
    { dataKey: 'competitor11', name: 'DoubleTree Hilton', color: '#f59e0b' },
    { dataKey: 'competitor12', name: 'Embassy Suites', color: '#dc2626' },
    { dataKey: 'competitor13', name: 'Hyatt House', color: '#7c3aed' },
    { dataKey: 'competitor14', name: 'Fairfield Inn Marriott', color: '#059669' }
  ], [])

  // Separate legend visibility states for each tab
  const [rankLegendVisibility, setRankLegendVisibility] = useState<{[key: string]: boolean}>(() => {
    const initial: {[key: string]: boolean} = {}
    availableHotelLines.forEach(hotel => {
      initial[hotel.dataKey] = !['competitor10', 'competitor11', 'competitor12', 'competitor13', 'competitor14'].includes(hotel.dataKey)
    })
    return initial
  })

  const [reviewsLegendVisibility, setReviewsLegendVisibility] = useState<{[key: string]: boolean}>(() => {
    const initial: {[key: string]: boolean} = {}
    availableHotelLines.forEach(hotel => {
      initial[hotel.dataKey] = true // All visible by default for Reviews
    })
    return initial
  })

  // Get current legend visibility based on active tab
  const legendVisibility = viewMode === "Rank" ? rankLegendVisibility : reviewsLegendVisibility
  const setLegendVisibility = viewMode === "Rank" ? setRankLegendVisibility : setReviewsLegendVisibility

  // Calculate currently visible lines using new legend visibility state - Memoized for performance
  const visibleLinesCount = useMemo(() => 
    availableHotelLines.filter(hotel => legendVisibility[hotel.dataKey]).length, 
    [availableHotelLines, legendVisibility]
  )

  // Pagination handlers for competitor table
  const handlePrevCompetitors = useCallback(() => {
    setCompetitorPage(prev => Math.max(0, prev - 1))
  }, [])
  
  const handleNextCompetitors = useCallback(() => {
    const totalCompetitors = availableHotelLines.filter(hotel => hotel.dataKey !== 'myHotel' && legendVisibility[hotel.dataKey]).length
    const maxPage = Math.ceil(totalCompetitors / 4) - 1
    setCompetitorPage(prev => Math.min(maxPage, prev + 1))
  }, [availableHotelLines, legendVisibility])

  // Format date for table display
  const formatTableDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString)
      const day = date.getDate()
      const month = format(date, 'MMM')
      const year = format(date, "''yy")
      const dayName = format(date, 'EEE')
      return { day, month, year, dayName, formatted: `${day} ${month} ${year}` }
    } catch {
      return { day: '', month: '', year: '', dayName: '', formatted: dateString }
    }
  }, [])

  // Separate height calculations for each tab
  const calculateRankChartHeight = () => {
    return 500 // Set chart container height to 500px
  }

  const calculateReviewsChartHeight = () => {
    const baseHeight = 400 // Base height for the chart area
    const visibleReviewsLines = availableHotelLines.filter(hotel => reviewsLegendVisibility[hotel.dataKey]).length
    const legendHeight = visibleReviewsLines * 25 // ~25px per legend item
    const legendPadding = 80 // Additional padding for legend area
    const fullHeight = baseHeight + Math.max(legendHeight, 100) + legendPadding // Minimum 100px for legends
    return Math.floor(fullHeight * 0.5) // Reduce chart container height by 50%
  }

  // Get current chart height based on active tab
  const chartHeight = viewMode === "Rank" ? calculateRankChartHeight() : calculateReviewsChartHeight()

  // Fetch OTA data when component mounts or dates change
  useEffect(() => {
    if (!selectedProperty?.sid || !startDate || !endDate) return
    fetchOTAData()
  }, [selectedProperty?.sid, startDate, endDate])

  // Fetch OTA channels and ranking data
  const fetchOTAData = useCallback(async () => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    setIsPageLoading(true)

    try {
      // 1. Fetch OTA channels
      const channelsRes = await getOTAChannels({ SID: selectedProperty?.sid })
      if (channelsRes?.status && channelsRes.body) {
        setOtaChannels(channelsRes.body)
      }

      // 2. Fetch OTA ranking data
      const rankingRes = await getOTARankOnAllChannel({
        SID: selectedProperty?.sid,
        CheckInDateStart: startDate?.toUTCString(),
        CheckInEndDate: endDate?.toUTCString(),
      })

      if (rankingRes?.status && rankingRes.body) {
        const flatRankingData = Array.isArray(rankingRes.body) ? rankingRes.body.flat() : []
        setOtaRankingData(flatRankingData)
      }
    } catch (error) {
      console.error('Error fetching OTA data:', error)
    } finally {
      // Show completion for 300ms before hiding (similar to Demand/Events)
      setTimeout(() => {
        setIsPageLoading(false)
        isFetchingRef.current = false
      }, 300)
    }
  }, [selectedProperty?.sid, startDate, endDate])

  // Handle date range changes
  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start || null)
    setEndDate(end || null)
  }



  // Export chart functionality
  const exportChart = useCallback(async () => {
    if (cardRef.current) {
      try {
        const dataUrl = await toPng(cardRef.current)
        const link = document.createElement('a')
        link.download = `${viewMode.toLowerCase()}-chart.png`
        link.href = dataUrl
        link.click()
      } catch (error) {
        console.error('Error exporting chart:', error)
      }
    }
  }, [viewMode])



  // Reviews data structure
  const reviewsData = useMemo(() => {
    const baseData = []
    const today = new Date()
    
    // Generate 4 weeks of data for Reviews mode
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - (i * 7))
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      
      const weekLabel = `Week of ${weekStart.getDate()}-${weekEnd.getDate()} ${weekStart.toLocaleString('en', { month: 'short' })}`
      
      baseData.push({
        week: weekLabel,
        reviewScore: Number((7.5 + Math.random() * 2).toFixed(1)), // 7.5-9.5 range
        numberOfReviews: Math.floor(80 + Math.random() * 140), // 80-220 reviews

      })
    }
    
    return baseData
  }, [])

  // Compare options (simplified as requested)
  const compareOptions = [
    { id: "1week", label: "Last 1 Week" },
    { id: "2weeks", label: "Last 2 Weeks" }
  ]

  // Reviews check-in range options with date calculations
  const getCheckInRangeOptions = () => {
    const today = new Date()
    const format = (date: Date) => {
      const formatted = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).replace(',', '')
      return `${formatted} '25`
    }
    
    return [
      { 
        id: "15days", 
        label: "Last 15 Days",
        dateRange: `${format(today)} - ${format(subDays(today, 14))}`, // Reversed order: latest to earliest
        startDate: subDays(today, 14),
        endDate: today
      },
      { 
        id: "30days", 
        label: "Last 30 Days",
        dateRange: `${format(today)} - ${format(subDays(today, 29))}`, // Reversed order: latest to earliest
        startDate: subDays(today, 29),
        endDate: today
      },
      { 
        id: "custom", 
        label: "Custom Date Range",
        dateRange: null,
        startDate: null,
        endDate: null
      }
    ]
  }

  const checkInRangeOptions = useMemo(() => getCheckInRangeOptions(), [])



  // Compset options
  const compsetOptions = [
    { id: "primary", label: "Primary Compset" },
    { id: "secondary", label: "Secondary Compset" }
  ]



  // Enhanced Channel data with performance metrics - hybrid of API and mock data
  const channelData = useMemo(() => {
    // Base channel templates
    const baseChannels = [
      {
        id: "booking",
        name: "Booking.com",
        shortName: "Booking",
        icon: "B",
        iconBg: "bg-blue-600",
        avgRank: 5,
        totalRankings: 122,
        rankingChange: -1,
        reviewScore: 9.6,
        maxReviewScore: 10,
        reviewChange: 0.1,
        compareText: getCompareText(),
        reviewText: "As on today",
        status: "stable"
      },
      {
        id: "expedia",
        name: "Expedia",
        shortName: "Expedia", 
        icon: "✈",
        iconBg: "bg-yellow-500",
        avgRank: 36,
        totalRankings: 122,
        rankingChange: -25,
        reviewScore: 9.8,
        maxReviewScore: 10,
        reviewChange: 0,
        compareText: getCompareText(),
        reviewText: "As on today",
        status: "improving"
      },
      {
        id: "tripadvisor",
        name: "Tripadvisor",
        shortName: "TripAdvisor",
        icon: "🦉",
        iconBg: "bg-green-600",
        avgRank: 1,
        totalRankings: 122,
        rankingChange: 0,
        reviewScore: 5.0,
        maxReviewScore: 10,
        reviewChange: 0,
        compareText: getCompareText(),
        reviewText: "As on today",
        status: "leading"
      },
      {
        id: "agoda",
        name: "Agoda",
        shortName: "Agoda",
        icon: "A",
        iconBg: "bg-red-500",
        avgRank: 12,
        totalRankings: 122,
        rankingChange: 3,
        reviewScore: 9.2,
        maxReviewScore: 10,
        reviewChange: 0.1,
        compareText: getCompareText(),
        reviewText: "As on today",
        status: "improving"
      },
      {
        id: "hotels",
        name: "Hotels.com",
        shortName: "Hotels",
        icon: "H",
        iconBg: "bg-purple-600",
        avgRank: 8,
        totalRankings: 122,
        rankingChange: -2,
        reviewScore: 9.4,
        maxReviewScore: 10,
        reviewChange: -0.2,
        compareText: getCompareText(),
        reviewText: "As on today",
        status: "stable"
      },
      {
        id: "kayak",
        name: "Kayak",
        shortName: "Kayak",
        icon: "K",
        iconBg: "bg-orange-500",
        avgRank: 15,
        totalRankings: 122,
        rankingChange: -5,
        reviewScore: 8.9,
        maxReviewScore: 10,
        reviewChange: -0.1,
        compareText: getCompareText(),
        reviewText: "As on today",
        status: "declining"
      },
    ]

    // If we have real API data, enhance base channels with real ranking data
    if (otaChannels.length > 0 && otaRankingData.length > 0) {
      return baseChannels.map(baseChannel => {
        // Find matching API channel
        const apiChannel = otaChannels.find((ch: any) => 
          ch.name?.toLowerCase().includes(baseChannel.name.toLowerCase().split('.')[0]) ||
          baseChannel.name.toLowerCase().includes(ch.name?.toLowerCase())
        )
        
        // Find ranking data for this channel
        const rankingData = otaRankingData.filter((rank: any) => 
          apiChannel && String(rank.otaId) === String(apiChannel.cid)
        )

        // Calculate average ranking if we have data
        if (rankingData.length > 0) {
          const avgRank = Math.round(rankingData.reduce((sum: number, rank: any) => sum + (rank.rank || 0), 0) / rankingData.length)
          const totalRankings = rankingData.length
          
          return {
            ...baseChannel,
            avgRank: avgRank || baseChannel.avgRank,
            totalRankings: totalRankings || baseChannel.totalRankings,
            // Keep mock data for other fields that may not be in API
          }
        }

        return baseChannel
      })
    }

    return baseChannels
  }, [otaChannels, otaRankingData, getCompareText])

  // Channel pagination logic (after channelData is defined)
  const totalChannelPages = Math.ceil(channelData.length / channelsPerPage)
  const currentChannels = channelData.slice(
    currentChannelPage * channelsPerPage,
    (currentChannelPage + 1) * channelsPerPage
  )

  const handlePrevChannels = () => {
    if (currentChannelPage > 0) {
      setCurrentChannelPage(currentChannelPage - 1)
    }
  }

  const handleNextChannels = () => {
    if (currentChannelPage < totalChannelPages - 1) {
      setCurrentChannelPage(currentChannelPage + 1)
    }
  }

  // Toggle legend visibility (for hiding/showing lines in chart) - tab-specific
  const toggleLegendVisibility = useCallback((dataKey: string) => {
    // Get the correct state setters for current tab
    const currentSetLegendVisibility = viewMode === "Rank" ? setRankLegendVisibility : setReviewsLegendVisibility
    const currentSetErrorMessage = viewMode === "Rank" ? setRankErrorMessage : setReviewsErrorMessage
    const currentLegendVisibility = viewMode === "Rank" ? rankLegendVisibility : reviewsLegendVisibility
    
    // Use functional state update to avoid stale closure issues
    currentSetLegendVisibility(prev => {
      // Calculate current state using fresh state from setter
      const isCurrentlyVisible = prev[dataKey]
      
      // If trying to enable a hidden legend, check the 10-visible limit
      if (!isCurrentlyVisible) {
        // Count currently visible legends using fresh state
        const allSelectedKeys = availableHotelLines.map(hotel => hotel.dataKey)
        const currentVisibleCount = allSelectedKeys.filter(key => prev[key]).length
        
        // Block if already at 10 visible legends
        if (currentVisibleCount >= MAX_LINES) {
          currentSetErrorMessage('Maximum 10 hotels can be displayed on the graph. Please hide a hotel first to show another one.')
          setTimeout(() => currentSetErrorMessage(''), 5000)
          return prev // Return unchanged state
        }
      }
      
      // Allow the toggle - update state
      const newState = {
        ...prev,
        [dataKey]: !prev[dataKey]
      }
      
      // If we're now under 10 visible legends, clear any error immediately
      const allSelectedKeys = availableHotelLines.map(hotel => hotel.dataKey)
      const newVisibleCount = allSelectedKeys.filter(key => newState[key]).length
      
      if (newVisibleCount < MAX_LINES) {
        currentSetErrorMessage('')
      }
      
      return newState
    })
  }, [availableHotelLines, MAX_LINES, viewMode])

  // Handle legend click to toggle line visibility with 10-line limit (legacy support)
  const handleLegendClick = (dataKey: string) => {
    toggleLegendVisibility(dataKey)
  }

  // Download functions
  const handleDownloadImage = () => {
    if (cardRef.current) {
      toPng(cardRef.current, { cacheBust: true })
        .then((dataUrl) => {
          const link = document.createElement("a")
          const propertyName = selectedProperty?.name || 'OTAProperty'
          const dateRange = startDate && endDate ? 
            `${format(startDate, 'ddMMMyy')}_${format(endDate, 'ddMMMyy')}` : 
            format(new Date(), 'ddMMMyy')
          link.download = `OTARanking_${propertyName}_${dateRange}_${new Date().getTime()}.png`
          link.href = dataUrl
          link.click()
        })
        .catch((err) => {
          console.error("Error generating image:", err)
        })
    }
  }

  const handleDownloadCSV = () => {
    const propertyName = selectedProperty?.name || 'My Hotel'
    const csvData = rankingTrendsData.map(row => {
      const csvRow: any = { Date: row.fullDate }
      
      // Add data for all hotels
      availableHotelLines.forEach(hotel => {
        const displayName = hotel.dataKey === 'myHotel' ? propertyName : hotel.name
        csvRow[`${displayName} Rank`] = row[hotel.dataKey]
        csvRow[`${displayName} Price`] = row[`${hotel.dataKey}Price`]
        csvRow[`${displayName} Variance`] = row[`${hotel.dataKey}Variance`]
      })
      
      return csvRow
    })

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const dateRange = startDate && endDate ? 
      `${format(startDate, 'ddMMMyy')}_${format(endDate, 'ddMMMyy')}` : 
      format(new Date(), 'ddMMMyy')
    link.download = `OTARanking_${propertyName}_${dateRange}_${new Date().getTime()}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  // Get selected channel data for charts with memoization
  const selectedChannelData = useMemo(() => 
    channelData.find((channel) => channel.id === selectedChannel),
    [selectedChannel]
  )

  // Get selected channel data for Reviews tab with memoization
  const selectedChannelDataReviews = useMemo(() => 
    selectedChannelsReviews.length === 1 ? channelData.find((channel) => channel.id === selectedChannelsReviews[0]) : null,
    [selectedChannelsReviews, channelData]
  )

  // Ranking chart data - varies by channel (memoized for performance)
  const getRankingData = useMemo(() => (channelId: string) => {
    const baseData = [
      { month: "Aug 2024", value: 5 },
      { month: "Sep 2024", value: 5 },
      { month: "Oct 2024", value: 6 },
      { month: "Nov 2024", value: 7 },
      { month: "Dec 2024", value: 6 },
      { month: "Jan 2025", value: 6 },
      { month: "Feb 2025", value: 5 },
      { month: "Mar 2025", value: 4 },
      { month: "Apr 2025", value: 5 },
      { month: "May 2025", value: 4 },
      { month: "Jun 2025", value: 4 },
      { month: "Jul 2025", value: 5 },
    ]

    // Modify data based on selected channel
    switch (channelId) {
      case "booking":
        return baseData
      case "expedia":
        return baseData.map((item) => ({ ...item, value: item.value + 30 }))
      case "tripadvisor":
        return baseData.map((item) => ({ ...item, value: Math.max(1, item.value - 4) }))
      case "agoda":
        return baseData.map((item) => ({ ...item, value: item.value + 7 }))
      case "hotels":
        return baseData.map((item) => ({ ...item, value: item.value + 3 }))
      default:
        return baseData
    }
  }, [selectedChannel])

  // Review score chart data - varies by channel
  const getReviewData = (channelId: string) => {
    const baseData = [
      { month: "Aug 2024", primary: 9.8, secondary: 9.4 },
      { month: "Sep 2024", primary: 9.8, secondary: 9.4 },
      { month: "Oct 2024", primary: 9.8, secondary: 9.4 },
      { month: "Nov 2024", primary: 9.8, secondary: 9.4 },
      { month: "Dec 2024", primary: 9.8, secondary: 9.4 },
      { month: "Jan 2025", primary: 9.8, secondary: 9.4 },
      { month: "Feb 2025", primary: 9.8, secondary: 9.4 },
      { month: "Mar 2025", primary: 9.8, secondary: 9.4 },
      { month: "Apr 2025", primary: 9.8, secondary: 9.4 },
      { month: "May 2025", primary: 9.8, secondary: 9.4 },
      { month: "Jun 2025", primary: 9.8, secondary: 9.4 },
      { month: "Jul 2025", primary: 9.8, secondary: 9.4 },
    ]

    // Modify data based on selected channel
    switch (channelId) {
      case "tripadvisor":
        return baseData.map((item) => ({ ...item, primary: 5.0, secondary: 4.8 }))
      case "agoda":
        return baseData.map((item) => ({ ...item, primary: 9.2, secondary: 9.0 }))
      case "hotels":
        return baseData.map((item) => ({ ...item, primary: 9.4, secondary: 9.2 }))
      default:
        return baseData
    }
  }

  const rankingData = useMemo(() => getRankingData(selectedChannel), [getRankingData, selectedChannel])
  const reviewData = useMemo(() => getReviewData(selectedChannel), [selectedChannel])

  // Ranking Trends Data for the new full-width chart (7 days based on selected date range)
  // Calculate number of days based on date range
  const numberOfDays = useMemo(() => {
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return Math.min(diffDays, 30) // Cap at 30 days for performance
    }
    return 7 // Default to 7 days
  }, [startDate, endDate])

  // Calculate compare period length
  const comparePeriodDays = useMemo(() => {
    return compareWith === "Last 1 Week" ? 7 : 14
  }, [compareWith])

  const rankingTrendsData = useMemo(() => {
    const baseDate = startDate || new Date()
    
    // Generate historical data for variance calculation
    const generateVarianceData = (currentRank: number, dayIndex: number, hotelType: string) => {
      // Create consistent variance patterns based on hotel type and compare period
      const getVariancePattern = (hotelKey: string) => {
        // Define different variance patterns for different hotel types
        const patterns = {
          myHotel: comparePeriodDays === 7 ? [2, 1, 0, -1, 1, 0, 1] : [2, 1, 0, -1, 1, 0, 1, -2, 1, 0, -1, 2, 1, 0],
          competitor1: comparePeriodDays === 7 ? [0, 0, 0, 0, 0, 0, 0] : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // NF - no variance
          competitor2: comparePeriodDays === 7 ? [-1, -2, -1, 0, -1, -2, -1] : [-1, -2, -1, 0, -1, -2, -1, -2, -1, 0, -1, -2, -1, 0],
          // Additional patterns for new competitors
          competitor3: comparePeriodDays === 7 ? [1, -1, 2, 0, -1, 1, 0] : [1, -1, 2, 0, -1, 1, 0, 1, -2, 0, 1, -1, 2, 0],
          competitor4: comparePeriodDays === 7 ? [-2, 1, -1, 1, 0, -1, 2] : [-2, 1, -1, 1, 0, -1, 2, -1, 0, 1, -2, 1, -1, 0],
          competitor5: comparePeriodDays === 7 ? [0, 1, -1, 2, -1, 0, 1] : [0, 1, -1, 2, -1, 0, 1, -2, 1, 0, -1, 2, 0, -1],
          competitor6: comparePeriodDays === 7 ? [1, 0, -2, 1, -1, 2, 0] : [1, 0, -2, 1, -1, 2, 0, -1, 1, -2, 0, 1, -1, 2],
          competitor7: comparePeriodDays === 7 ? [-1, 2, 0, -2, 1, 0, -1] : [-1, 2, 0, -2, 1, 0, -1, 2, -1, 0, 1, -2, 0, 1],
          competitor8: comparePeriodDays === 7 ? [2, -1, 1, 0, -2, 1, -1] : [2, -1, 1, 0, -2, 1, -1, 0, 2, -1, 1, 0, -2, 1],
          competitor9: comparePeriodDays === 7 ? [0, -1, 1, -2, 0, 1, -1] : [0, -1, 1, -2, 0, 1, -1, 2, 0, -1, 1, -2, 0, 1],
          competitor10: comparePeriodDays === 7 ? [1, -2, 0, 1, -1, 2, 0] : [1, -2, 0, 1, -1, 2, 0, -1, 1, -2, 0, 1, -1, 2],
          competitor11: comparePeriodDays === 7 ? [-1, 0, 2, -1, 0, -2, 1] : [-1, 0, 2, -1, 0, -2, 1, 0, -1, 2, -1, 0, -2, 1],
          competitor12: comparePeriodDays === 7 ? [2, 1, -1, 0, 2, -1, 0] : [2, 1, -1, 0, 2, -1, 0, 1, 2, -1, 0, 2, -1, 0],
          competitor13: comparePeriodDays === 7 ? [0, -2, 1, 2, -1, 0, 1] : [0, -2, 1, 2, -1, 0, 1, -2, 0, 1, 2, -1, 0, 1],
          competitor14: comparePeriodDays === 7 ? [-2, 1, 0, -1, 2, 1, -1] : [-2, 1, 0, -1, 2, 1, -1, 0, -2, 1, 0, -1, 2, 1]
        }
        
        return patterns[hotelKey as keyof typeof patterns] || patterns.competitor2 // Default fallback
      }
      
      const variancePattern = getVariancePattern(hotelType)
      const factor = variancePattern[dayIndex % variancePattern.length]
      return factor
    }

    const baseData = Array.from({ length: numberOfDays }, (_, index) => {
      const currentDate = addDays(baseDate, index)
      
      // Generate realistic ranking data for all 15 hotels
      const dataPoint: any = {
        date: format(currentDate, 'MMM dd'),
        fullDate: format(currentDate, 'yyyy-MM-dd')
      }
      
      // Generate rankings and prices for each hotel
      availableHotelLines.forEach((hotel, hotelIndex) => {
        // Create varied ranking ranges for different hotels
        const rankingRanges = [
          [4, 7],   // myHotel: 4-7
          [1, 3],   // competitor1: 1-3
          [7, 10],  // competitor2: 7-10
          [2, 5],   // competitor3: 2-5
          [8, 12],  // competitor4: 8-12
          [5, 8],   // competitor5: 5-8
          [10, 15], // competitor6: 10-15
          [3, 6],   // competitor7: 3-6
          [12, 18], // competitor8: 12-18
          [6, 9],   // competitor9: 6-9
          [9, 13],  // competitor10: 9-13
          [15, 20], // competitor11: 15-20
          [4, 8],   // competitor12: 4-8
          [11, 16], // competitor13: 11-16
          [13, 17]  // competitor14: 13-17
        ]
        
        const [minRank, maxRank] = rankingRanges[hotelIndex] || [10, 15]
        const rank = minRank + Math.floor(Math.random() * (maxRank - minRank + 1))
        
        // Generate price based on ranking (better rank = higher price generally)
        const basePrice = 150 - (rank * 3) + Math.floor(Math.random() * 20)
        const price = Math.max(80, basePrice + index * 1.5)
        
        // Generate variance
        const variance = generateVarianceData(rank, index, hotel.dataKey as any)
        
        dataPoint[hotel.dataKey] = rank
        dataPoint[`${hotel.dataKey}Price`] = price
        dataPoint[`${hotel.dataKey}Variance`] = variance
      })
      
      return dataPoint
    })

    return baseData
  }, [startDate, numberOfDays, comparePeriodDays])

  // Custom Tooltip Component for Ranking Trends (matching Rate Trends Analysis style)
  const RankingTrendsTooltip = ({ active, payload, label, coordinate }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload

      // Dynamic positioning based on cursor location
      // Get chart width (approximate) and determine positioning
      const chartWidth = 800 // Approximate chart area width
      const tooltipWidth = 280 // Increased tooltip width for wider property column
      const isNearRightEdge = coordinate && coordinate.x > (chartWidth * 0.6) // 60% from left
      
      const tooltipStyle = isNearRightEdge ? {
        transform: 'translateX(-100%)',
        marginLeft: '-10px'
      } : {
        transform: 'translateX(0%)',
        marginLeft: '10px'
      }

      return (
        <div 
          className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-3 min-w-[260px] max-w-[300px] z-[10001] relative"
          style={tooltipStyle}
        >
          {/* Date Heading */}
          <div className="mb-2">
            <h3 className="text-gray-900 dark:text-white">
              <span className="text-base font-bold">{data?.fullDate ? format(new Date(data.fullDate), "dd MMM yyyy") : ''}</span>
              <span className="text-sm font-normal">{data?.fullDate ? `, ${format(new Date(data.fullDate), 'EEE')}` : ''}</span>
            </h3>
              </div>

                    {/* Column Headings */}
                     <div className="flex justify-between px-2">
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Property</span>
            </div>
            <div>
                              <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Rank&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            </div>
          </div>

          {/* Hotel Rankings */}
                     <div className="space-y-2 mt-1">
            {payload.map((entry: any, index: number) => {
                // Find hotel info from availableHotelLines
                const hotelInfo = availableHotelLines.find(hotel => hotel.dataKey === entry.dataKey)
                const hotelName = hotelInfo?.name || entry.name || 'Unknown Hotel'
                
                // Truncate long hotel names for tooltip display - increased limit for wider column
                const truncatedName = hotelName.length > 28 ? `${hotelName.substring(0, 25)}...` : hotelName
                
              const rank = entry.value
                              // Get variance from data
                const getVarianceText = (dataKey: string) => {
                  const variance = data?.[`${dataKey}Variance`]
                  if (variance === 0 || variance === null || variance === undefined) {
                    return 'NF'
                  }
                  const sign = variance > 0 ? '+' : ''
                  return `${sign}${variance}`
                }
                const variance = getVarianceText(entry.dataKey)
              const isMyHotel = entry.dataKey === 'myHotel'

              return (
                <div key={index} className={`flex justify-between items-center py-1.5 pl-2 pr-4 rounded-md ${
                  isMyHotel ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700' : ''
                }`}>
                  {/* Property Column */}
                  <div className="flex items-center gap-2 flex-1 min-w-0 mr-4">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <div className={`text-xs font-medium whitespace-nowrap ${
                      isMyHotel ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-slate-100'
                    }`}>
                      {truncatedName}
                    </div>
                  </div>
                  
                  {/* Rank Column - Right aligned */}
                  <div className="flex items-center gap-3">
                    <div className={`text-xs font-bold w-6 text-right ${
                      isMyHotel ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-slate-100'
                    }`}>
                      #{rank}
                    </div>
                    <div className={`text-xs font-medium w-6 text-right ${
                      variance === 'NF' ? 'text-gray-500' :
                      variance.toString().startsWith('+') ? 'text-red-600 dark:text-red-400 font-bold' : 
                      'text-green-600 dark:text-green-400 font-bold'
                    }`}>
                      {variance}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
    return null
  }





  const renderOption1 = () => (
    <>
      {/* Enhanced Charts Section */}
      {/* Full-width Ranking Trends Analysis */}
      <Card ref={cardRef} className="bg-gradient-to-br from-card to-card/50 shadow-xl border border-border/50 mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={`w-6 h-6 rounded ${selectedChannelData?.iconBg || 'bg-primary'} flex items-center justify-center mt-0.5`}>
                <span className="text-white text-xs font-bold">{selectedChannelData?.icon}</span>
            </div>
                              <div className="flex-1">
                  <CardTitle className="text-xl font-bold">Ranking Trends Analysis</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Comprehensive ranking comparison across all channels with market insights</p>
          </div>
      </div>

                          {/* View Toggle and Download Button Container */}
              <div className="flex items-center gap-4">
              {/* View Toggle */}
              <TooltipProvider>
                <div className="flex items-center border border-border rounded-lg overflow-hidden h-9 w-auto">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={rankViewMode === "graph" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setRankViewMode("graph")}
                        className={cn(
                          "h-9 w-9 rounded-none border-r-0 border-b-0",
                          rankViewMode === "graph" ? "border-r-0 border-b-0" : "border-r-0 border-b-0 hover:border-r-0 hover:border-b-0"
                        )}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                      <p className="text-xs font-normal">Graph View</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={rankViewMode === "table" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setRankViewMode("table")}
                        className={cn(
                          "h-9 w-9 rounded-none border-l-0 border-t-0",
                          rankViewMode === "table" ? "border-l-0 border-t-0" : "border-l-0 border-t-0 hover:border-l-0 hover:border-t-0"
                        )}
                      >
                        <Table className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                      <p className="text-xs font-normal">Table View</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>

            {/* Download Button */}
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="btn-minimal">
                  <Download className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                    <p className="text-xs font-normal">Download</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownloadImage}>Export as Image</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadCSV}>Export as CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
            </div>
        </CardHeader>
        <CardContent className="px-6 pt-1 pb-2">
          {/* Error Message */}
          {errorMessage && (
            <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20">
              <AlertDescription className="text-red-800 dark:text-red-200">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Ranking Content - Graph or Table */}
          {rankViewMode === "graph" ? (
            <div style={{ height: '470px' }} className="[&_.recharts-wrapper]:mt-3 [&_.recharts-legend-wrapper]:!bottom-[54px]">
            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={rankingTrendsData} margin={{ top: 20, right: 40, left: 30, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-15 dark:opacity-10" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date"
                  className="text-xs"
                  interval="preserveStartEnd"
                  height={85}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", dy: 10 }}
                  axisLine={true}
                  tickLine={false}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[1, 'dataMax']}
                  reversed={true}
                  label={{ 
                    value: 'Ranking Position', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { textAnchor: 'middle' } 
                  }}
                  tickFormatter={(value: number) => {
                    // Calculate the maximum rank from the current data
                    if (rankingTrendsData.length === 0) return value.toString()
                    
                    // Get all rank values from visible hotel lines
                    const visibleHotels = availableHotelLines.filter(hotel => legendVisibility[hotel.dataKey])
                    const allRankValues = rankingTrendsData.flatMap(d => 
                      visibleHotels
                        .map(hotel => d[hotel.dataKey])
                        .filter(rank => rank != null && typeof rank === 'number' && rank > 0)
                    )
                    
                    if (allRankValues.length === 0) return value.toString()
                    
                    const maxRank = Math.max(...allRankValues)
                    
                    // Hide the highest rank value (worst ranking) from Y-axis
                    // Show rank 1 (best) and intermediate values, but hide the worst rank
                    if (value >= maxRank && value > 1) {
                      return ''
                    }
                    
                    return value.toString()
                  }}
                  width={50}
                />
                <RechartsTooltip
                  content={RankingTrendsTooltip}
                  allowEscapeViewBox={{ x: true, y: true }}
                  offset={0}
                  isAnimationActive={false}
                  position={{ x: undefined, y: undefined }}
                  wrapperStyle={{
                    zIndex: 10000,
                    pointerEvents: 'none'
                  }}
                />
                                                {/* Hotel Lines - Dynamic rendering using Overview page pattern */}
                {availableHotelLines.map((hotel) => {
                  const isVisible = legendVisibility[hotel.dataKey]
                  
                  return (
                    <Line
                      key={hotel.dataKey}
                      type="monotone"
                      dataKey={hotel.dataKey}
                      stroke={isVisible ? hotel.color : 'transparent'}
                      strokeWidth={isVisible ? (hotel.dataKey === 'myHotel' ? 3 : 2) : 0}
                      name={hotel.name}
                      dot={isVisible ? { 
                        fill: "white", 
                        stroke: hotel.color,
                        strokeWidth: 2, 
                        r: hotel.dataKey === 'myHotel' ? 4 : 3 
                      } : false}
                      activeDot={isVisible ? { 
                        r: hotel.dataKey === 'myHotel' ? 6 : 5, 
                        fill: hotel.color,
                        stroke: hotel.color, 
                        strokeWidth: 2
                      } : false}
                      hide={!isVisible}
                      isAnimationActive={false}
                      animationDuration={0}
                    />
                  )
                })}
                
                {/* Recharts Legend with Overview page pattern */}
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  iconType="line"
                  wrapperStyle={{
                    paddingTop: "5px",
                    fontSize: "12px",
                    cursor: "pointer",
                    lineHeight: "1.6",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "18px",
                    justifyContent: "center"
                  }}
                  onClick={(event: any) => {
                    if (event.dataKey && typeof event.dataKey === 'string') {
                      // Toggle legend visibility using Overview page pattern
                      toggleLegendVisibility(event.dataKey)
                    }
                  }}
                  formatter={(value, entry: any) => {
                    const dataKey = entry.dataKey as string
                    const isVisible = legendVisibility[dataKey]

                    return (
                      <span style={{
                        color: isVisible ? entry.color : '#9ca3af',
                        fontWeight: isVisible ? 500 : 400,
                        textDecoration: isVisible ? 'none' : 'line-through',
                        cursor: 'pointer'
                      }}>
                        {value}
                      </span>
                    )
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
            </div>
          ) : (
            // Table View with Reviews styling and sticky columns
            <div style={{ height: '470px' }} className="mt-4 mb-5">
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <div className="max-h-[462px] overflow-y-auto">
                    <table className="w-full relative">
                      {/* Sticky Header */}
                      <thead className="bg-gray-50 sticky top-0 z-20">
                        <tr className="border-b border-gray-200">
                          {/* Sticky Check-in Date Column */}
                          <th className="sticky left-0 z-30 bg-gray-50 text-left py-1.5 pl-2 pr-4 font-semibold text-xs text-muted-foreground border-r border-gray-200">
                            Check-in Date
                          </th>
                          {/* Sticky My Hotel Column */}
                                                     <th className="sticky left-24 z-30 bg-blue-50 text-right py-1.5 pl-2 pr-4 font-semibold text-xs text-muted-foreground border-r border-gray-200">
                            {selectedProperty?.name || 'Alhambra Hotel'}
                            <div className="text-xs text-muted-foreground font-normal mt-0.5">Rank</div>
                          </th>
                                                     {/* Competitor Columns */}
                           {Array.from({ length: 4 }, (_, index) => {
                             const competitorSlice = availableHotelLines.filter(hotel => hotel.dataKey !== 'myHotel' && legendVisibility[hotel.dataKey]).slice(competitorPage * 4, (competitorPage + 1) * 4);
                             const hotel = competitorSlice[index];
                             
                             if (hotel) {
                               return (
                                 <th key={hotel.dataKey} className="text-right py-1.5 px-0 font-semibold text-xs text-muted-foreground min-w-32" style={{marginLeft: '-20px'}}>
                                   <TooltipProvider>
                                     <Tooltip>
                                       <TooltipTrigger asChild>
                                         <div className="truncate cursor-pointer">{hotel.name.length > 15 ? `${hotel.name.substring(0, 15)}...` : hotel.name}</div>
                                       </TooltipTrigger>
                                       {hotel.name.length > 15 && (
                                         <TooltipContent className="bg-black text-white border-black font-normal">
                                           <p>{hotel.name}</p>
                                         </TooltipContent>
                                       )}
                                     </Tooltip>
                                   </TooltipProvider>
                                   <div className="text-xs text-muted-foreground font-normal mt-0.5">Rank</div>
                                 </th>
                               );
                             } else {
                               return (
                                 <th key={`empty-${index}`} className="text-right py-1.5 px-0 font-semibold text-xs text-muted-foreground min-w-32" style={{marginLeft: '-20px'}}>
                                   <div className="text-xs text-muted-foreground font-normal mt-0.5 opacity-0">-</div>
                                 </th>
                               );
                             }
                           })}
                                                     {/* Navigation Column */}
                           {availableHotelLines.filter(hotel => hotel.dataKey !== 'myHotel' && legendVisibility[hotel.dataKey]).length > 4 && (
                             <th className="text-center py-1.5 px-2 font-semibold text-xs text-muted-foreground w-20">
                               <TooltipProvider>
                                 <div className="flex items-center justify-center">
                                   <div className="flex border border-input rounded-md">
                                     <Tooltip>
                                       <TooltipTrigger asChild>
                                         <Button
                                           variant="ghost"
                                           size="sm"
                                           className="h-6 w-6 p-0 rounded-none border-0"
                                           onClick={handlePrevCompetitors}
                                           disabled={competitorPage === 0}
                                         >
                                           <ChevronLeft className="h-3 w-3" />
                                         </Button>
                                       </TooltipTrigger>
                                       <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                                         <p className="text-xs font-normal">Previous</p>
                                       </TooltipContent>
                                     </Tooltip>
                                     <div className="w-px bg-border"></div>
                                     <Tooltip>
                                       <TooltipTrigger asChild>
                                         <Button
                                           variant="ghost"
                                           size="sm"
                                           className="h-6 w-6 p-0 rounded-none border-0"
                                           onClick={handleNextCompetitors}
                                           disabled={competitorPage >= Math.ceil(availableHotelLines.filter(hotel => hotel.dataKey !== 'myHotel' && legendVisibility[hotel.dataKey]).length / 4) - 1}
                                         >
                                           <ChevronRight className="h-3 w-3" />
                                         </Button>
                                       </TooltipTrigger>
                                       <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                                         <p className="text-xs font-normal">Next</p>
                                       </TooltipContent>
                                     </Tooltip>
                                   </div>
                                 </div>
                               </TooltipProvider>
                             </th>
                           )}
                        </tr>
                      </thead>
                      <tbody>
                        {rankingTrendsData.map((dataPoint, index) => {
                          const myHotelData = availableHotelLines.find(hotel => hotel.dataKey === 'myHotel');
                          const competitors = availableHotelLines.filter(hotel => hotel.dataKey !== 'myHotel' && legendVisibility[hotel.dataKey]).slice(competitorPage * 4, (competitorPage + 1) * 4);
                          
                          return (
                                                         <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 group">
                              {/* Sticky Check-in Date */}
                              <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 py-2 pl-2 pr-4 font-medium text-foreground text-sm border-r border-gray-200">
                                {(() => {
                                  const dateInfo = formatTableDate(dataPoint.fullDate || dataPoint.date)
                                  return (
                                    <div className="flex items-center">
                                      <span>{dateInfo.formatted}, </span>
                                      <span className="font-normal text-gray-600 ml-1" style={{fontSize: '12px'}}>{dateInfo.dayName}</span>
                                    </div>
                                  )
                                })()}
                              </td>
                              {/* Sticky My Hotel Rank */}
                                                             <td className="sticky left-24 z-10 bg-blue-50 group-hover:bg-blue-100 py-2 pl-2 pr-4 text-right border-r border-gray-200 border-b border-gray-200">
                                <div className="flex items-center justify-end space-x-6">
                                  <span className="font-semibold text-sm">{dataPoint[myHotelData?.dataKey || 'myHotel']}</span>
                                  {(() => {
                                    const variance = dataPoint[`${myHotelData?.dataKey || 'myHotel'}Variance`];
                                    if (variance === 0 || variance === null || variance === undefined) {
                                      return <span className="text-gray-500 text-xs px-1 py-0.5 rounded text-center" style={{width: '30px', display: 'inline-block'}}>NF</span>;
                                    }
                                    const isPositive = variance > 0;
                                    return (
                                      <span className={`text-xs font-medium px-1 py-0.5 rounded text-center ${
                                        isPositive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                                      }`} style={{width: '30px', display: 'inline-block'}}>
                                        {isPositive ? '+' : ''}{variance}
                                      </span>
                                    );
                                  })()}
                                </div>
                              </td>
                              {/* Competitor Ranks */}
                              {Array.from({ length: 4 }, (_, index) => {
                                const hotel = competitors[index];
                                
                                if (hotel) {
                                  return (
                                    <td key={hotel.dataKey} className="py-2 px-0 text-right group-hover:bg-gray-50" style={{marginLeft: '-20px'}}>
                                      <div className="flex items-center justify-end space-x-6">
                                        <span className="font-semibold text-sm">{dataPoint[hotel.dataKey]}</span>
                                        {(() => {
                                          const variance = dataPoint[`${hotel.dataKey}Variance`];
                                          if (variance === 0 || variance === null || variance === undefined) {
                                            return <span className="text-gray-500 text-xs px-1 py-0.5 rounded text-center" style={{width: '30px', display: 'inline-block'}}>NF</span>;
                                          }
                                          const isPositive = variance > 0;
                                          return (
                                            <span className={`text-xs font-medium px-1 py-0.5 rounded text-center ${
                                              isPositive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                                            }`} style={{width: '30px', display: 'inline-block'}}>
                                              {isPositive ? '+' : ''}{variance}
                                            </span>
                                          );
                                        })()}
                                      </div>
                                    </td>
                                  );
                                } else {
                                  return (
                                    <td key={`empty-${index}`} className="py-2 px-0 text-right group-hover:bg-gray-50" style={{marginLeft: '-20px'}}>
                                      <div className="flex items-center justify-end space-x-6">
                                        <span className="font-semibold text-sm text-gray-300 opacity-0">-</span>
                                        <span className="text-gray-300 text-xs px-1 py-0.5 rounded text-center opacity-0" style={{width: '30px', display: 'inline-block'}}>-</span>
                                      </div>
                                    </td>
                                  );
                                }
                              })}
                                                             {/* Navigation Column Cell */}
                               {availableHotelLines.filter(hotel => hotel.dataKey !== 'myHotel' && legendVisibility[hotel.dataKey]).length > 4 && (
                                 <td className="py-2 px-2 text-center group-hover:bg-gray-50">
                                 </td>
                               )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )







  // Show full-page loading similar to Demand/Events pages
  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <GlobalProgressBar />
        <LoadingSkeleton type="demand" className="p-4 md:p-6 lg:p-8 xl:p-12 2xl:p-16" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Enhanced Filter Bar with Sticky Positioning - Matching Overview */}
      <div className="sticky top-0 z-40 filter-bar-minimal bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-border/50 shadow-sm transition-shadow duration-200">
        <div className="bg-background border-b border-border shadow-sm">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="max-w-7xl xl:max-w-none mx-auto">
              <div className="flex items-center justify-between py-4 gap-4">
                
                {/* Left Section - Primary Filters */}
                <div className="flex items-center gap-4 flex-1 min-w-0">

                  {/* View Toggle */}
                  <div className="shrink-0">
                    <ToggleGroup
                      type="single"
                      value={viewMode}
                      onValueChange={(value) => value && setViewMode(value)}
                      className="border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 shadow-sm h-10 gap-0"
                    >
                      <ToggleGroupItem
                        value="Rank"
                        className="h-10 px-4 text-sm font-medium data-[state=on]:bg-blue-600 data-[state=on]:text-white dark:data-[state=on]:bg-blue-600 dark:data-[state=on]:text-white hover:text-black data-[state=on]:hover:text-white border-0 rounded-l-md rounded-r-none"
                      >
                        Rank
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="Reviews"
                        className="h-10 px-4 text-sm font-medium data-[state=on]:bg-blue-600 data-[state=on]:text-white dark:data-[state=on]:bg-blue-600 dark:data-[state=on]:text-white hover:text-black data-[state=on]:hover:text-white border-0 rounded-r-md rounded-l-none border-l border-slate-200 dark:border-slate-700"
                      >
                        Reviews
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
          
                  {/* Date/Check-in Range Picker */}
                  <div className="shrink-0">
                    {viewMode === "Reviews" ? (
                      <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="justify-start text-left font-semibold h-10 min-w-[280px] px-4 gap-2 shadow-sm hover:shadow-md transition-all duration-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800"
                          >
                            <Calendar className="h-4 w-4" />
                            <span className="truncate">{getCheckInDisplayText()}</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="flex">
                            {/* Quick Date Options Sidebar */}
                            <div className="w-56 border-r border-gray-200 p-4">
                              <h4 className="font-semibold text-sm text-gray-700 mb-3">Check-in Date</h4>
                              <div className="space-y-1">
                                {checkInRangeOptions.map((option) => (
                                  <Button
                                    key={option.id}
                                    variant={checkInRange === option.label ? "default" : "ghost"}
                                    size="sm"
                                    className="w-full justify-start text-left h-auto py-2 px-3"
                                    onClick={() => {
                                      // Store previous selection before changing to Custom Date Range
                                      if (option.label === "Custom Date Range" && checkInRange !== "Custom Date Range") {
                                        setPreviousCheckInRange(checkInRange)
                                      }
                                      setCheckInRange(option.label)
                                      // Close dropdown for predefined ranges (not Custom Date Range)
                                      if (option.label !== "Custom Date Range") {
                                        setIsDateRangeOpen(false)
                                        // Clear custom dates when selecting predefined range
                                        setCustomStartDate(undefined)
                                        setCustomEndDate(undefined)
                                      }
                                    }}
                                  >
                                    <div className="flex flex-col items-start">
                                      <span className="text-sm font-medium">{option.label}</span>
                                      {option.dateRange && (
                                        <span className={`text-xs mt-0.5 ${
                                          checkInRange === option.label ? "text-white" : "text-muted-foreground"
                                        }`}>
                                          {option.dateRange}
                                        </span>
                                      )}
                                    </div>
                                  </Button>
                                ))}
                              </div>
                            </div>
                            
                            {/* Calendar for Custom Range Only */}
                            {checkInRange === "Custom Date Range" && (
                              <div className="w-80 p-4">
                                {renderCustomCalendar()}
                                
                                {/* Apply/Cancel buttons */}
                                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      // Cancel: Reset to previous selection and close dropdown
                                      setCheckInRange(previousCheckInRange)
                                      setCustomStartDate(undefined)
                                      setCustomEndDate(undefined)
                                      setIsDateRangeOpen(false)
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    disabled={!customStartDate || !customEndDate}
                                    onClick={() => {
                                      // Apply the selected dates and close dropdown
                                      setIsDateRangeOpen(false)
                                    }}
                                  >
                                    Apply
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <EnhancedDatePicker
                        startDate={startDate || undefined}
                        endDate={endDate || undefined}
                        onChange={handleDateRangeChange}
                      />
                    )}
                  </div>

                  {/* Compare with Dropdown - Only for Rank mode */}
                  {viewMode === "Rank" && (
                  <div className="shrink-0">
                    <Popover open={isCompareOpen} onOpenChange={setIsCompareOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 min-w-0 max-w-[160px]"
                        >
                          <Calendar className="w-4 h-4 shrink-0" />
                          <span className="truncate max-w-[80px] font-semibold">
                            Vs. {compareOptions.find(opt => opt.label === compareWith)?.label.replace('Last ', '') || "1 week"}
                          </span>
                          <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[60]" align="start">
                        <div className="flex">
                          <div className="w-44 p-4">
                            <h4 className="font-semibold text-sm text-gray-700 mb-3">Compare with</h4>
                            <div className="space-y-1">
                              {compareOptions.map((option) => (
                                <Button
                                  key={option.id}
                                  variant={compareWith === option.label ? "default" : "ghost"}
                                  size="sm"
                                  className="w-full justify-start text-left h-auto py-2 px-3"
                                  onClick={() => {
                                    setCompareWith(option.label)
                                    setIsCompareOpen(false)
                                  }}
                                >
                                  <span className="text-sm font-medium">
                                    {option.label}
                                  </span>
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  )}



                  {/* Compset Dropdown */}
                  <div className="shrink-0">
                    <Popover open={isCompsetOpen} onOpenChange={setIsCompsetOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 min-w-0 max-w-[160px]"
                        >
                          <Users className="w-4 h-4 shrink-0" />
                          <span className="truncate max-w-[80px] font-semibold">
                            {compSet.replace(' Compset', '')}
                        </span>
                          <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[60]" align="start">
                        <div className="flex">
                          <div className="w-44 p-4">
                            <h4 className="font-semibold text-sm text-gray-700 mb-3">Compset</h4>
                            <div className="space-y-1">
                              {compsetOptions.map((option) => (
                                <Button
                                  key={option.id}
                                  variant={compSet === option.label ? "default" : "ghost"}
                                  size="sm"
                                  className="w-full justify-start text-left h-auto py-2 px-3"
                                  onClick={() => {
                                    setCompSet(option.label)
                                    setIsCompsetOpen(false)
                                  }}
                                >
                                  <span className="text-sm font-medium">
                                    {option.label}
                                  </span>
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content - Matching Overview Structure */}
      <main className="relative">
        <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8 space-y-4">
          <div className="max-w-none mx-auto space-y-4">

            {/* Dashboard Header with Enhanced Typography - Matching Overview */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-minimal-md mb-8">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground">
                  {viewMode === "Reviews" ? "Reviews Analysis" : "OTA Rank"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {viewMode === "Reviews" 
                    ? "Analyze your property's review scores and feedback across OTA channels"
                    : "Monitor your property's ranking performance across major OTA channels"
                  }
                </p>
              </div>
            </div>

            {/* Channel Widgets - Enhanced with proper spacing */}
            <div className="w-full animate-slide-up">
                  {/* Channel Cards with Pagination */
                  <div className="relative mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                      {currentChannels.map((channel, index) => (
                        <div key={channel.id} className="relative">
                          <Card
                            className={`group relative overflow-hidden bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-2 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:-translate-y-1 ${
                              selectedChannel === channel.id 
                                ? "ring-2 ring-primary/70 shadow-xl border-primary/60 scale-105" 
                                : "border-border/50 hover:border-primary/20"
                            }`}
                            onClick={() => setSelectedChannel(channel.id)}
                          >
                            <CardContent className="p-4">
                              {/* Channel Header */}
                              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                                  <div className={`w-7 h-7 rounded-md ${channel.iconBg} flex items-center justify-center shadow-sm`}>
                              <span className="text-white text-xs font-bold">{channel.icon}</span>
                </div>
                                  <div>
                                    <h3 className="font-semibold text-foreground text-sm leading-tight">{channel.name}</h3>
                </div>
            </div>
                                {selectedChannel === channel.id && (
                                  <Badge className="bg-primary/15 text-primary text-xs border-primary/30 animate-pulse h-5">
                                    Active
                                  </Badge>
                                )}
          </div>

                              {/* Metrics Grid - Side by Side - Conditional order for Reviews mode */}
                              <div className="grid grid-cols-2 gap-2">
                                {/* First Metric - Review Score for Reviews mode, Rank for Rank mode */}
                                <div className="py-2 px-2 h-full flex flex-col">
                                  <div className="mb-3">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      {viewMode === "Reviews" ? "Review Score" : (viewMode === "Rank" ? "Rank" : "Avg Rank")}
                                    </span>
                                  </div>
                                  <div className="flex flex-col h-full">
                                    <div className="flex items-baseline space-x-1">
                                      <span className="text-lg font-bold text-foreground leading-none">
                                        {viewMode === "Reviews" ? channel.reviewScore : channel.avgRank}
                                      </span>
                                      {viewMode === "Reviews" ? (
                                        <span className="text-xs text-muted-foreground">/ 10</span>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">/ {channel.totalRankings}</span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-1 mt-auto pt-1">
                                      {viewMode === "Reviews" ? (
                                        <span className="text-xs text-muted-foreground leading-none">As on today</span>
                                      ) : (
                                        <>
                                          {channel.rankingChange !== 0 ? (
                                            <span className={`text-xs font-bold ${
                                              channel.rankingChange < 0 
                                                ? "text-green-600 dark:text-green-400" 
                                                : "text-red-600 dark:text-red-400"
                                            }`}>
                                              {channel.rankingChange > 0 ? `+${channel.rankingChange}` : channel.rankingChange}%
                                            </span>
                                          ) : (
                                            <span className="text-xs font-bold text-muted-foreground">NF</span>
                                          )}
                                          <span className="text-xs text-muted-foreground leading-none">{channel.compareText}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Second Metric - Rank for Reviews mode, Review Score for Rank mode */}
                                <div className="py-2 px-2 h-full flex flex-col">
                                  <div className="mb-3">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      {viewMode === "Reviews" ? "Rank" : "Review Score"}
                                    </span>
                                  </div>
                                  <div className="flex flex-col h-full">
                                    <div className="flex items-baseline space-x-1">
                                      <span className="text-lg font-bold text-foreground leading-none">
                                        {viewMode === "Reviews" ? channel.avgRank : channel.reviewScore}
                                      </span>
                                      {viewMode === "Reviews" ? (
                                        <span className="text-xs text-muted-foreground">/ {channel.totalRankings}</span>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">/ 10</span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-1 mt-auto pt-1">
                                      {viewMode === "Reviews" ? (
                                        <span className="text-xs text-muted-foreground leading-none">As on today</span>
                                      ) : (
                                        <span className="text-xs text-muted-foreground leading-none">{channel.reviewText}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
          </div>

                              {/* Selection Indicator */}
                              {selectedChannel === channel.id && (
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                              )}
        </CardContent>
      </Card>

                          {/* Navigation Arrows - Show on top-right of last channel widget */}
                          {index === currentChannels.length - 1 && totalChannelPages > 1 && (
                            <div className="absolute -top-4 -right-2 flex gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
              <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={handlePrevChannels}
                                      disabled={currentChannelPage === 0}
                                      className="w-8 h-8 p-0 rounded-full shadow-lg bg-background hover:bg-muted border-2"
                                    >
                                      <ChevronLeft className="w-3 h-3" />
              </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom" className="bg-black text-white border-black">
                                    <p>Previous channels</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
              <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={handleNextChannels}
                                      disabled={currentChannelPage >= totalChannelPages - 1}
                                      className="w-8 h-8 p-0 rounded-full shadow-lg bg-background hover:bg-muted border-2"
                                    >
                                      <ChevronRight className="w-3 h-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom" className="bg-black text-white border-black">
                                    <p>Next channels</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                }

                  {/* Rest of Option 1 Content */}
                  {viewMode === "Rank" ? renderOption1() : (
                    viewMode === "Reviews" && (
                        <Card className="bg-gradient-to-br from-card to-card/50 shadow-xl border border-border/50 mb-6">
                        <CardHeader className="p-6 pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className={`w-6 h-6 rounded ${selectedChannelData?.iconBg || 'bg-primary'} flex items-center justify-center mt-0.5`}>
                                <span className="text-white text-xs font-bold">
                                  {selectedChannelData?.icon || selectedChannel.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-xl font-bold">
                                  Reviews Trends
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Track review scores and volume trends across your selected channels over time
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              {/* View Toggle */}
                              <TooltipProvider>
                                <div className="flex items-center border border-border rounded-lg overflow-hidden h-9 w-auto">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant={reviewsViewMode === "graph" ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setReviewsViewMode("graph")}
                                        className={cn(
                                          "h-[42px] w-[42px] p-0 rounded-none border-0",
                                          reviewsViewMode === "graph" ? "bg-primary text-primary-foreground" : ""
                                        )}
                                      >
                                        <BarChart3 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                                      <p className="text-xs font-normal">Graph View</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant={reviewsViewMode === "table" ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setReviewsViewMode("table")}
                                        className={cn(
                                          "h-[42px] w-[42px] p-0 rounded-none border-0",
                                          reviewsViewMode === "table" ? "bg-primary text-primary-foreground" : ""
                                        )}
                                      >
                                        <Table className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                                      <p className="text-xs font-normal">Table View</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </TooltipProvider>

                              {/* Download Button */}
                              <DropdownMenu>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="btn-minimal">
                                          <Download className="w-4 h-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                                      <p className="text-xs font-normal">Download</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                      <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    const element = reviewsViewMode === "graph" ? document.getElementById('reviews-chart') : cardRef.current
                                    if (element) {
                                      toPng(element)
                                        .then((dataUrl) => {
                                          const link = document.createElement('a')
                                          link.download = `reviews-${reviewsViewMode}.png`
                                          link.href = dataUrl
                                          link.click()
                                        })
                                        .catch((err) => {
                                          console.error('Export failed:', err)
                                        })
                                    }
                                  }}>Export as Image</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    if (reviewsViewMode === "graph") {
                                      const csvData = reviewsData.map(item => ({
                                        Week: item.week,
                                        'Review Score': item.reviewScore,
                                        'Number of Reviews': item.numberOfReviews
                                      }))
                                      
                                      const headers = Object.keys(csvData[0])
                                      const csvContent = [
                                        headers.join(','),
                                        ...csvData.map(row => headers.map(header => row[header as keyof typeof row]).join(','))
                                      ].join('\n')
                                      
                                      const blob = new Blob([csvContent], { type: 'text/csv' })
                                      const url = window.URL.createObjectURL(blob)
                                      const link = document.createElement('a')
                                      link.href = url
                                      link.download = 'reviews-trends.csv'
                                      link.click()
                                      window.URL.revokeObjectURL(url)
                                    } else {
                                      // Handle table CSV export here if needed
                                      console.log('Table CSV export')
                                    }
                                  }}>Export as CSV</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="px-6 pt-1 pb-0">
                            {reviewsViewMode === "table" ? (
                            <div style={{ height: '400px' }} className="mt-3 mb-6">
                              <div className="border border-border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                  <div className="max-h-80 overflow-y-auto">
                                <table className="w-full">
                                <thead className="bg-gray-50">
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-1.5 px-2 font-semibold text-xs text-muted-foreground border-r border-gray-200">Hotel</th>
                                    <th className="text-right py-1.5 px-2 pr-16 font-semibold text-xs text-muted-foreground">
                                      Review Score
                                      <div className="text-xs text-muted-foreground font-normal mt-0.5">Out of 10</div>
                                    </th>
                                    <th className="text-right py-1.5 px-2 pr-8 font-semibold text-xs text-muted-foreground">
                                      Number of<br/>Reviews
                                    </th>
                                    <th className="text-right py-1.5 px-2 pr-28 font-semibold text-xs text-muted-foreground">
                                      Rank
                                      <div className="text-xs text-muted-foreground font-normal mt-0.5">As on today</div>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {/* My Hotel - First Row */}
                                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-2 px-2 font-medium text-foreground text-sm border-r border-gray-200">{selectedProperty?.name || 'Alhambra Hotel'}</td>
                                    <td className="py-2 px-2 pr-16 text-right">
                                      <div className="flex items-center justify-end space-x-1">
                                        <span className="bg-red-100 text-red-800 px-1 py-0.5 rounded text-xs font-medium" style={{fontSize: '10px'}}>WORST</span>
                                        <span className="font-semibold text-sm">6.2</span>
                                      </div>
                                    </td>
                                    <td className="py-2 px-2 pr-8 text-right font-semibold text-sm">626</td>
                                    <td className="py-2 px-2 pr-28 text-right font-semibold text-sm">#7</td>
                                  </tr>
                                  {/* Competitor Hotels */}
                                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-2 px-2 text-sm border-r border-gray-200">Hotel Alexander Plaza</td>
                                    <td className="py-2 px-2 pr-16 text-right font-semibold text-sm">8.7</td>
                                    <td className="py-2 px-2 pr-8 text-right font-semibold text-sm">3855</td>
                                    <td className="py-2 px-2 pr-28 text-right font-semibold text-sm">#1</td>
                                  </tr>
                                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-2 px-2 text-sm border-r border-gray-200">Comfort Hotel Auberge</td>
                                    <td className="py-2 px-2 pr-16 text-right font-semibold text-sm">7.5</td>
                                    <td className="py-2 px-2 pr-8 text-right font-semibold text-sm">2515</td>
                                    <td className="py-2 px-2 pr-28 text-right font-semibold text-sm">
                                      <div className="flex items-center justify-end space-x-1">
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <span className="text-red-600 dark:text-red-400 font-normal cursor-help">#500+</span>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="p-3 bg-slate-900 text-white border border-slate-700 rounded-lg shadow-xl max-w-xs">
                                              <p className="text-sm font-normal">Property not available in top 500 ranking.</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Info className="w-3 h-3 text-red-600 dark:text-red-400 cursor-help transition-colors" />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="p-3 bg-slate-900 text-white border border-slate-700 rounded-lg shadow-xl max-w-xs">
                                              <p className="text-sm font-normal">Property not available in top 500 ranking.</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                    </td>
                                  </tr>
                                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-2 px-2 text-sm border-r border-gray-200">acom Hotel Berlin City Süd</td>
                                    <td className="py-2 px-2 pr-16 text-right font-semibold text-sm">8.1</td>
                                    <td className="py-2 px-2 pr-8 text-right font-semibold text-sm">810</td>
                                    <td className="py-2 px-2 pr-28 text-right font-semibold text-sm">#2</td>
                                  </tr>
                                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-2 px-2 text-sm border-r border-gray-200">InterCityHotel Berlin Ostbahnhof</td>
                                    <td className="py-2 px-2 pr-16 text-right font-semibold text-sm">7.9</td>
                                    <td className="py-2 px-2 pr-8 text-right font-semibold text-sm">3670</td>
                                    <td className="py-2 px-2 pr-28 text-right font-semibold text-sm">#3</td>
                                  </tr>
                                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-2 px-2 text-sm border-r border-gray-200">Mercure Hotel Berlin City West</td>
                                    <td className="py-2 px-2 pr-16 text-right font-semibold text-sm">7.0</td>
                                    <td className="py-2 px-2 pr-8 text-right font-semibold text-sm">2096</td>
                                    <td className="py-2 px-2 pr-28 text-right font-semibold text-sm">#6</td>
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                    <td className="py-2 px-2 text-sm border-r border-gray-200">Hotel Brandies an der Messe</td>
                                    <td className="py-2 px-2 pr-16 text-right">
                                      <div className="flex items-center justify-end space-x-1">
                                        <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-xs font-medium" style={{fontSize: '10px'}}>BEST</span>
                                        <span className="font-semibold text-sm">8.8</span>
                                      </div>
                                    </td>
                                    <td className="py-2 px-2 pr-8 text-right font-semibold text-sm">1485</td>
                                    <td className="py-2 px-2 pr-28 text-right font-semibold text-sm">#5</td>
                                  </tr>
                                </tbody>
                                </table>
                              </div>
                            </div>
                              </div>
                              </div>
                            ) : (
                            <div id="reviews-chart" className="mt-1" style={{ height: '440px' }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={reviewsData} margin={{ top: 15, right: 40, left: 30, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-15 dark:opacity-10" stroke="#e5e7eb" />
                                  <XAxis 
                                    dataKey="week"
                                    className="text-xs"
                                    interval="preserveStartEnd"
                                    height={85}
                                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", dy: 10 }}
                                    axisLine={true}
                                    tickLine={false}
                                  />
                                  <YAxis
                                    yAxisId="left"
                                    className="text-xs"
                                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                    axisLine={false}
                                    tickLine={false}
                                    domain={[0, 10]}
                                    label={{
                                      value: 'Review Score',
                                      angle: -90,
                                      position: 'insideLeft',
                                      style: { textAnchor: 'middle' }
                                    }}
                                    width={50}
                                  />
                                  <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    className="text-xs"
                                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                    axisLine={false}
                                    tickLine={false}
                                    domain={[0, 'dataMax']}
                                    label={{
                                      value: 'Number of Reviews',
                                      angle: 90,
                                      position: 'insideRight',
                                      style: { textAnchor: 'middle' }
                                    }}
                                    width={50}
                                  />
                                  <RechartsTooltip
                                    content={({ active, payload, label }) => {
                                      if (active && payload && payload.length) {
                                        const data = payload[0].payload
                                        return (
                                          <div className="bg-white text-gray-900 p-3 border border-gray-200 rounded-lg shadow-xl">
                                            <div className="text-gray-900 font-bold text-sm border-b border-gray-300 pb-2 mb-2">
                                              {label}
                                            </div>
                                            <div className="space-y-1">
                                              <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                                <span className="text-sm text-gray-900">Review Score: <span className="font-bold">{data.reviewScore}</span></span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                                <span className="text-sm text-gray-900">No. of Reviews: <span className="font-bold">{data.numberOfReviews}</span></span>
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      }
                                      return null
                                    }}
                                  />
                                  <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="reviewScore"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    dot={{ fill: "white", stroke: "#2563eb", strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: "#2563eb", stroke: "#2563eb", strokeWidth: 2 }}
                                    name="Review Score"
                                  />
                                  <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="numberOfReviews"
                                    stroke="#f97316"
                                    strokeWidth={3}
                                    dot={{ fill: "white", stroke: "#f97316", strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: "#f97316", stroke: "#f97316", strokeWidth: 2 }}
                                    name="Number of Reviews"
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  )}
            </div>



            {/* Footer spacing */}
            <div className="h-8"></div>
                    </div>
                    </div>
      </main>


    </div>
  )
}
