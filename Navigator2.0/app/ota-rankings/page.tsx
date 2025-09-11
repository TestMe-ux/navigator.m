"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"
import { format } from "date-fns"
import { toPng } from "html-to-image"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { getChannels } from "@/lib/channels"
import { getOTAChannels, getOTARankOnAllChannel, getOTARankTrends } from "@/lib/otarank"

// Import the new components
import { OTARankingsFilterBar } from "@/components/ota-rankings-filter-bar"
import OTAChannelCards from "@/components/ota-channel-cards"
import { OTACustomCalendar } from "@/components/ota-custom-calendar"
import OTARankView from "@/components/ota-rank-view"
import OTAReviewsView from "@/components/ota-reviews-view"

// Static data - moved outside component to prevent recreation
// Removed static data - using API data instead
// const MOCK_CHANNELS = [
//   {
//     id: "booking",
//     name: "Booking.com",
//     icon: "B",
//     iconBg: "bg-blue-600",
//     avgRank: 3.2,
//     totalRankings: 15,
//     rankingChange: -12,
//     reviewScore: 8.5,
//     reviewText: "As on today"
//   },
//   {
//     id: "expedia",
//     name: "Expedia",
//     icon: "E",
//     iconBg: "bg-green-600",
//     avgRank: 4.1,
//     totalRankings: 12,
//     rankingChange: 5,
//     reviewScore: 7.8,
//     reviewText: "As on today"
//   },
//   {
//     id: "agoda",
//     name: "Agoda",
//     icon: "A",
//     iconBg: "bg-red-600",
//     avgRank: 2.8,
//     totalRankings: 18,
//     rankingChange: -8,
//     reviewScore: 9.1,
//     reviewText: "As on today"
//   },
//   {
//     id: "hotels",
//     name: "Hotels.com",
//     icon: "H",
//     iconBg: "bg-purple-600",
//     avgRank: 5.2,
//     totalRankings: 10,
//     rankingChange: 15,
//     reviewScore: 7.2,
//     reviewText: "As on today"
//   },
//   {
//     id: "tripadvisor",
//     name: "TripAdvisor",
//     icon: "T",
//     iconBg: "bg-orange-600",
//     avgRank: 3.9,
//     totalRankings: 14,
//     rankingChange: -3,
//     reviewScore: 8.3,
//     reviewText: "As on today"
//   },
//   {
//     id: "airbnb",
//     name: "Airbnb",
//     icon: "A",
//     iconBg: "bg-pink-600",
//     avgRank: 6.1,
//     totalRankings: 8,
//     rankingChange: 22,
//     reviewScore: 6.9,
//     reviewText: "As on today"
//   },
//   {
//     id: "hoteltonight",
//     name: "HotelTonight",
//     icon: "H",
//     iconBg: "bg-indigo-600",
//     avgRank: 4.5,
//     totalRankings: 11,
//     rankingChange: -5,
//     reviewScore: 7.4,
//     reviewText: "As on today"
//   },
//   {
//     id: "kayak",
//     name: "Kayak",
//     icon: "K",
//     iconBg: "bg-teal-600",
//     avgRank: 3.7,
//     totalRankings: 13,
//     rankingChange: 8,
//     reviewScore: 8.1,
//     reviewText: "As on today"
//   }
// ]

// const MOCK_RANKING_TRENDS_DATA = [
//   { date: "Jan 1", fullDate: "2025-01-01", myHotel: 3, hotel1: 2, hotel2: 4, hotel3: 1, hotel4: 5, hotel5: 6, hotel6: 7, hotel7: 8, hotel8: 9, myHotelVariance: -1, hotel1Variance: 0, hotel2Variance: 1, hotel3Variance: -1, hotel4Variance: 2, hotel5Variance: 1, hotel6Variance: 0, hotel7Variance: -1, hotel8Variance: 2 },
//   { date: "Jan 2", fullDate: "2025-01-02", myHotel: 2, hotel1: 3, hotel2: 3, hotel3: 2, hotel4: 4, hotel5: 5, hotel6: 6, hotel7: 7, hotel8: 8, myHotelVariance: -1, hotel1Variance: 1, hotel2Variance: -1, hotel3Variance: 1, hotel4Variance: -1, hotel5Variance: -1, hotel6Variance: 0, hotel7Variance: 0, hotel8Variance: 0 },
//   { date: "Jan 3", fullDate: "2025-01-03", myHotel: 4, hotel1: 1, hotel2: 2, hotel3: 3, hotel4: 5, hotel5: 4, hotel6: 5, hotel7: 6, hotel8: 7, myHotelVariance: 2, hotel1Variance: -2, hotel2Variance: -1, hotel3Variance: 1, hotel4Variance: 0, hotel5Variance: -1, hotel6Variance: -1, hotel7Variance: -1, hotel8Variance: -1 },
//   { date: "Jan 4", fullDate: "2025-01-04", myHotel: 3, hotel1: 2, hotel2: 4, hotel3: 1, hotel4: 6, hotel5: 3, hotel6: 4, hotel7: 5, hotel8: 6, myHotelVariance: -1, hotel1Variance: 1, hotel2Variance: 2, hotel3Variance: -2, hotel4Variance: 1, hotel5Variance: -1, hotel6Variance: -1, hotel7Variance: -1, hotel8Variance: -1 },
//   { date: "Jan 5", fullDate: "2025-01-05", myHotel: 2, hotel1: 4, hotel2: 3, hotel3: 2, hotel4: 5, hotel5: 2, hotel6: 3, hotel7: 4, hotel8: 5, myHotelVariance: -1, hotel1Variance: 2, hotel2Variance: -1, hotel3Variance: 1, hotel4Variance: -1, hotel5Variance: -1, hotel6Variance: -1, hotel7Variance: -1, hotel8Variance: -1 }
// ]

// const MOCK_REVIEWS_DATA = [
//   { week: "Week 1", reviewScore: 8.2, numberOfReviews: 45 },
//   { week: "Week 2", reviewScore: 8.5, numberOfReviews: 52 },
//   { week: "Week 3", reviewScore: 8.1, numberOfReviews: 38 },
//   { week: "Week 4", reviewScore: 8.7, numberOfReviews: 61 },
//   { week: "Week 5", reviewScore: 8.3, numberOfReviews: 47 }
// ]

// const AVAILABLE_HOTEL_LINES = [
//   { dataKey: 'myHotel', name: 'Alhambra Hotel', color: '#2563eb' },
//   { dataKey: 'hotel1', name: 'Hotel Alexander Plaza', color: '#dc2626' },
//   { dataKey: 'hotel2', name: 'Comfort Hotel Auberge', color: '#16a34a' },
//   { dataKey: 'hotel3', name: 'acom Hotel Berlin City Süd', color: '#ca8a04' },
//   { dataKey: 'hotel4', name: 'InterCityHotel Berlin Ostbahnhof', color: '#9333ea' },
//   { dataKey: 'hotel5', name: 'Mercure Hotel Berlin City West', color: '#7c3aed' },
//   { dataKey: 'hotel6', name: 'Hotel Brandies an der Messe', color: '#059669' },
//   { dataKey: 'hotel7', name: 'Hotel Adlon Kempinski', color: '#dc2626' },
//   { dataKey: 'hotel8', name: 'The Ritz-Carlton Berlin', color: '#1f2937' }
// ]

const CHECK_IN_RANGE_OPTIONS = [
  { id: "last-30-days", label: "Last 30 Days", dateRange: "25 Dec 2024 - 24 Jan 2025" },
  { id: "last-7-days", label: "Last 7 Days", dateRange: "18 Jan 2025 - 24 Jan 2025" },
  { id: "last-3-months", label: "Last 3 Months", dateRange: "25 Oct 2024 - 24 Jan 2025" },
  { id: "last-6-months", label: "Last 6 Months", dateRange: "25 Jul 2024 - 24 Jan 2025" },
  { id: "last-year", label: "Last Year", dateRange: "25 Jan 2024 - 24 Jan 2025" },
  { id: "custom", label: "Custom Date Range" }
]

const COMPARE_OPTIONS = [
  { id: "last-1-week", label: "Last 1 Week" },
  { id: "last-2-weeks", label: "Last 2 Weeks" },
  // { id: "last-1-month", label: "Last 1 Month" },
  // { id: "last-3-months", label: "Last 3 Months" }
]

const COMPSET_OPTIONS = [
  { id: "primary", label: "Primary Compset" },
  { id: "secondary", label: "Secondary Compset" },
  // { id: "tertiary", label: "Tertiary Compset" }
]

export default function OTARankingsPage() {
  const [selectedProperty] = useSelectedProperty()
  const cardRef = useRef<HTMLDivElement>(null)

  // Page loading state for full-page loading effect
  const [isPageLoading, setIsPageLoading] = useState(false)

  // API data state
  const [otaChannels, setOtaChannels] = useState<any[]>([])
  const [otaRankingData, setOtaRankingData] = useState<any[]>([])
  const [otaRankTrendsData, setOtaRankTrendsData] = useState<any[]>([])
  const [otaRankGraphData, setOtaRankGraphData] = useState<any[]>([])
  const [isLoadingChannels, setIsLoadingChannels] = useState(false)
  const [isLoadingRanking, setIsLoadingRanking] = useState(false)
  const [isLoadingRankTrends, setIsLoadingRankTrends] = useState(false)

  // Window width state for responsive text
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920)

  const [compareWith, setCompareWith] = useState("Last 1 Week")
  const [compSet, setCompSet] = useState("Primary Compset")
  const [viewMode, setViewMode] = useState("Rank")
  const [rankViewMode, setRankViewMode] = useState<"graph" | "table">("graph")
  const [competitorPage, setCompetitorPage] = useState(0)

  // View mode state for Reviews tab (graph/table)
  const [reviewsViewMode, setReviewsViewMode] = useState<"graph" | "table">("graph")

  const [selectedChannel, setSelectedChannel] = useState("")

  // Reviews-specific state
  const [checkInRange, setCheckInRange] = useState("Last 30 Days")
  const [previousCheckInRange, setPreviousCheckInRange] = useState("Last 30 Days")

  // Overview-style channel dropdown state
  const [overviewChannelData, setOverviewChannelData] = useState<any>([])
  const [selectedOverviewChannels, setSelectedOverviewChannels] = useState<number[]>([])
  const didFetchChannels = useRef(false)

  // Custom calendar state for Reviews
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>()
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>()
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date())

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

  // Legend visibility state
  const [legendVisibility, setLegendVisibility] = useState<Record<string, boolean>>({})

  // Error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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


  // Get responsive compare text for channel widgets
  const getCompareText = useCallback(() => {
    if (windowWidth <= 1280) {
      return "vs 1 week" // Compact version for 1280px and below
    }
    return "vs. Last 1 week" // Full version for larger screens
  }, [windowWidth])

  // Get display text for check-in range
  const getCheckInDisplayText = () => {
    const selectedOption = CHECK_IN_RANGE_OPTIONS.find((opt: any) => opt.label === checkInRange)
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
        const previousOption = CHECK_IN_RANGE_OPTIONS.find((opt: any) => opt.label === previousCheckInRange)
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
    } else if (customStartDate && !customEndDate) {
      // Second selection
      if (date >= customStartDate) {
        setCustomEndDate(date)
      } else {
        setCustomStartDate(date)
        setCustomEndDate(customStartDate)
      }
    }
  }

  // Date range change handler
  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start)
    setEndDate(end)
  }


  // Transform ranking trends data from API
  const transformRankTrendsData = useCallback((trendDataPerCheckin: any[]) => {
    const otaRankTrendData: any[] = []
    const otaRankGraphData: any[] = []

    trendDataPerCheckin.forEach((trendDataPerCheckin) => {
      const otaRankDataForTrendData: any[] = []
      let flag = false

      trendDataPerCheckin.otaRankEntityCollection.forEach((data: any) => {
        // Check if this property is the selected property or include all properties for comparison
        flag = selectedProperty?.hmid === data.propertyID || true // Include all properties for now

        if (flag) {
          data.checkInDate = new Date(data.checkInDate)
          otaRankDataForTrendData.push(data)

          let index = otaRankGraphData.findIndex((value) => value.checkInDate === data.checkInDate.getTime())
          if (index === -1) {
            otaRankGraphData.push({ checkInDate: data.checkInDate.getTime() })
          }
        }
      })

      if (flag && otaRankDataForTrendData.length > 0) {
        otaRankTrendData.push({
          channel: trendDataPerCheckin.channel,
          otaId: trendDataPerCheckin.otaId || selectedChannel,
          hotelName: otaRankDataForTrendData[0].hotelName,
          propertyId: otaRankDataForTrendData[0].propertyID,
          otaRankData: otaRankDataForTrendData
        })
      }
    })

    // Sort properties to put selected property first (myHotel)
    const sortedRankTrendData = [...otaRankTrendData].sort((a, b) => {
      if (a.propertyId === selectedProperty?.hmid) return -1
      if (b.propertyId === selectedProperty?.hmid) return 1
      return 0
    })
    debugger;
    // Populate graph data with ranking information
    sortedRankTrendData.forEach((rankTrendData, i) => {
      const dataKey = rankTrendData?.propertyId === selectedProperty?.hmid ? 'myHotel' : `property${rankTrendData?.propertyId}`

      rankTrendData.otaRankData.forEach((element: any) => {
        let dataIndex = otaRankGraphData.findIndex((value) => element.checkInDate.getTime() === value.checkInDate)
        if (dataIndex !== -1) {
          otaRankGraphData[dataIndex][dataKey] = element.otaRank
          // Store changeInRank for variance calculation
          otaRankGraphData[dataIndex][`${dataKey}ChangeInRank`] = element.changeInRateDays > 0 ? element.changeInRank : null
        }
      })
    })

    // // Calculate variance data for each property
    // sortedRankTrendData.forEach((rankTrendData, i) => {
    //   debugger;
    //   const dataKey = i === 0 ? 'myHotel' : `property${i}`
    //   const varianceKey = `${dataKey}ChangeInRank`

    //   // Calculate variance for each data point
    //   otaRankGraphData.forEach((dataPoint, index) => {
    //     if (index > 0) {
    //       const currentRank = dataPoint[dataKey]
    //       const previousRank = otaRankGraphData[index - 1][dataKey]

    //       if (previousRank) {
    //         // Calculate the change in rank (negative means improvement, positive means decline)
    //         const variance = previousRank
    //         dataPoint[varianceKey] = variance
    //       } else {
    //         dataPoint[varianceKey] = 0
    //       }
    //     } else {
    //       // First data point has no variance
    //       dataPoint[varianceKey] = 0
    //     }
    //   })
    // })

    // Sort by date
    otaRankGraphData.sort((a, b) => (a.checkInDate - b.checkInDate))

    setOtaRankTrendsData(otaRankTrendData)
    setOtaRankGraphData(otaRankGraphData)
  }, [selectedProperty?.sid, selectedChannel])

  // Transform API data to channel format
  const transformChannelsData = useCallback(() => {
    if (!otaChannels.length || !otaRankingData.length) {
      // Return empty array if API data is not available
      return []
    }

    const compareText = getCompareText()
    return otaChannels.map((channel, index) => {
      // Find ranking data for this channel
      const channelRankingData = otaRankingData.find((rankingGroup: any) =>
        rankingGroup.some((item: any) => item.otaId === channel.cid && item.propertyID === selectedProperty?.hmid)
      )

      // Get the first item from the ranking data for this channel
      const rankingItem = channelRankingData?.[0]

      // Calculate average rank and other metrics
      const avgRank = rankingItem?.otaRank || 0
      const totalRankings = 500
      const rankingChange = rankingItem?.changeInRank ? parseInt(rankingItem.changeInRank) : 0
      const reviewScore = rankingItem?.score ? parseFloat(rankingItem.score) : 0

      return {
        id: channel.cid.toString(),
        name: channel.name,
        icon: channel.name.charAt(0).toUpperCase(),
        iconBg: `bg-${['blue', 'green', 'red', 'purple', 'orange', 'pink', 'indigo', 'teal'][index % 8]}-600`,
        avgRank,
        totalRankings,
        rankingChange,
        compareText,
        reviewScore,
        reviewText: "As on today",
        url: channel.url,
        isActive: channel.isActive
      }
    })
  }, [otaChannels, otaRankingData, getCompareText])

  // Create channels with dynamic compare text
  const channels = useMemo(() => transformChannelsData(), [transformChannelsData])

  // Available hotel lines for charts with dynamic property name
  const availableHotelLines = useMemo(() => {
    if (otaRankTrendsData.length > 0) {
      // Sort properties to put selected property first (myHotel)
      const sortedTrendData = [...otaRankTrendsData].sort((a, b) => {
        if (a.propertyId === selectedProperty?.hmid) return -1
        if (b.propertyId === selectedProperty?.hmid) return 1
        return 0
      })

      // Create hotel lines from API data
      return sortedTrendData.map((trendData, index) => ({
        dataKey: trendData.propertyId === selectedProperty?.hmid ? 'myHotel' : `property${trendData.propertyId}`,
        name: trendData.hotelName,
        color: trendData.propertyId === selectedProperty?.hmid ? '#2563eb' : `#${Math.floor(Math.random() * 16777215).toString(16)}`
      }))
    }
    // Fallback to empty array if no data
    return []
  }, [otaRankTrendsData, selectedProperty?.hmid, selectedProperty?.name])

  // Computed values
  const selectedChannelData = useMemo(() =>
    channels.find(channel => channel.name.toLowerCase() === selectedChannel.toLowerCase()), [channels, selectedChannel])

  const currentChannels = useMemo(() =>
    channels.slice(currentChannelPage * channelsPerPage, (currentChannelPage + 1) * channelsPerPage),
    [channels, currentChannelPage, channelsPerPage])

  const totalChannelPages = useMemo(() =>
    Math.ceil(channels.length / channelsPerPage), [channels.length, channelsPerPage])

  // Use real API data or fallback to mock data
  const rankingTrendsData = useMemo(() => {
    if (otaRankGraphData.length > 0) {
      // Transform API data to match the expected format for charts
      return otaRankGraphData.map((item, index) => {
        const date = new Date(item.checkInDate)
        const formattedDate = format(date, 'MMM d')
        const fullDate = format(date, 'yyyy-MM-dd')

        // Create the data object with dynamic property keys
        const dataObject: any = {
          date: formattedDate,
          fullDate: fullDate
        }

        // Add property rankings and variances dynamically
        Object.keys(item).forEach(key => {
          if ((key.startsWith('property') || key === 'myHotel') && key !== 'checkInDate') {
            dataObject[key] = item[key]
          }
          if (key.endsWith('ChangeInRank')) {
            dataObject[key] = item[key]
          }
        })

        return dataObject
      })
    }
    return []
  }, [otaRankGraphData])

  const reviewsData: any[] = [] // Will be populated from API when available

  // Fetch OTA Channels data
  useEffect(() => {
    const fetchChannels = async () => {
      if (!selectedProperty?.sid) return

      setIsLoadingChannels(true)
      try {
        const response = await getOTAChannels({ SID: selectedProperty.sid })
        if (response?.status && response?.body) {
          setOtaChannels(response.body)
          setSelectedChannel(response.body[0]?.name || "");
        }
      } catch (error) {
        console.error('Error fetching OTA channels:', error)
      } finally {
        setIsLoadingChannels(false)
      }
    }

    fetchChannels()
  }, [selectedProperty?.sid])

  // Fetch OTA Ranking data
  useEffect(() => {
    const fetchRankingData = async () => {
      if (!selectedProperty?.sid || !startDate || !endDate) return

      setIsLoadingRanking(true)
      try {
        const response = await getOTARankOnAllChannel({ SID: selectedProperty.sid, CheckInDateStart: format(startDate, 'yyyy-MM-dd'), CheckInEndDate: format(endDate, 'yyyy-MM-dd') })
        if (response?.status && response?.body) {
          setOtaRankingData(response.body)
        }
      } catch (error) {
        console.error('Error fetching OTA ranking data:', error)
      } finally {
        setIsLoadingRanking(false)
      }
    }

    fetchRankingData()
  }, [selectedProperty?.sid, startDate, endDate])

  // Fetch OTA Ranking Trends data
  useEffect(() => {
    const fetchRankTrendsData = async () => {
      if (!selectedProperty?.sid || !otaChannels || !startDate || !endDate) return

      setIsLoadingRankTrends(true)
      try {
        const selectedChannelData = otaChannels.find(channel => channel.name.toLowerCase() === selectedChannel.toLowerCase())?.cid;
        if (!selectedChannelData) return

        const response = await getOTARankTrends({
          SID: selectedProperty.sid,
          OTAId: selectedChannelData,
          CheckInDateStart: format(startDate, 'yyyy-MM-dd'),
          CheckInEndDate: format(endDate, 'yyyy-MM-dd')
        })

        if (response?.status && response?.body?.trendDataPerCheckin) {
          transformRankTrendsData(response.body.trendDataPerCheckin)
        }
      } catch (error) {
        console.error('Error fetching OTA ranking trends data:', error)
      } finally {
        setIsLoadingRankTrends(false)
      }
    }

    fetchRankTrendsData()
  }, [selectedProperty?.sid, startDate, endDate, selectedChannel])

  // Initialize legend visibility
  useEffect(() => {
    const initialVisibility: Record<string, boolean> = {}
    availableHotelLines.forEach(hotel => {
      initialVisibility[hotel.dataKey] = true
    })
    setLegendVisibility(initialVisibility)
  }, [availableHotelLines])

  // Channel pagination handlers
  const handlePrevChannels = useCallback(() => {
    setCurrentChannelPage(prev => Math.max(0, prev - 1))
  }, [])

  const handleNextChannels = useCallback(() => {
    setCurrentChannelPage(prev => Math.min(totalChannelPages - 1, prev + 1))
  }, [totalChannelPages])

  // Competitor pagination handlers
  const handlePrevCompetitors = useCallback(() => {
    setCompetitorPage(prev => Math.max(0, prev - 1))
  }, [])

  const handleNextCompetitors = useCallback(() => {
    const visibleCompetitors = availableHotelLines.filter(hotel => hotel.dataKey !== 'myHotel' && legendVisibility[hotel.dataKey])
    const maxPages = Math.ceil(visibleCompetitors.length / 4) - 1
    setCompetitorPage(prev => Math.min(maxPages, prev + 1))
  }, [availableHotelLines, legendVisibility])

  // Legend visibility toggle
  const toggleLegendVisibility = useCallback((dataKey: string) => {
    setLegendVisibility(prev => ({
      ...prev,
      [dataKey]: !prev[dataKey]
    }))
    // Reset competitor page when legend visibility changes
    setCompetitorPage(0)
  }, [])

  // Download handlers
  const handleDownloadImage = useCallback(() => {
    if (cardRef.current) {
      toPng(cardRef.current)
        .then((dataUrl) => {
          const link = document.createElement('a')
          link.download = `ota-rankings-${rankViewMode}.png`
          link.href = dataUrl
          link.click()
        })
        .catch((err) => {
          console.error('Export failed:', err)
        })
    }
  }, [rankViewMode])

  const handleDownloadCSV = useCallback(() => {
    if (rankViewMode === "graph") {
      const csvData = rankingTrendsData.map(item => {
        const row: any = { Date: item.date }
        availableHotelLines.forEach(hotel => {
          if (legendVisibility[hotel.dataKey]) {
            row[hotel.name] = (item as any)[hotel.dataKey]
          }
        })
        return row
      })

      const headers = Object.keys(csvData[0])
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => row[header as keyof typeof row]).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'ota-rankings.csv'
      link.click()
      window.URL.revokeObjectURL(url)
    }
  }, [rankViewMode, rankingTrendsData, availableHotelLines, legendVisibility])

  // Format table date helper
  const formatTableDate = useCallback((date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return {
      formatted: format(dateObj, 'dd MMM'),
      dayName: format(dateObj, 'EEE')
    }
  }, [])

  // Custom calendar render function
  const renderCustomCalendar = () => (
    <OTACustomCalendar
      currentCalendarMonth={currentCalendarMonth}
      setCurrentCalendarMonth={setCurrentCalendarMonth}
      customStartDate={customStartDate}
      setCustomStartDate={setCustomStartDate}
      customEndDate={customEndDate}
      setCustomEndDate={setCustomEndDate}
      handleCustomDateSelect={handleCustomDateSelect}
    />
  )

  // Loading state
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
      {/* Enhanced Filter Bar */}
      <OTARankingsFilterBar
        viewMode={viewMode}
        setViewMode={setViewMode}
        startDate={startDate}
        endDate={endDate}
        handleDateRangeChange={handleDateRangeChange}
        compareWith={compareWith}
        setCompareWith={setCompareWith}
        compSet={compSet}
        setCompSet={setCompSet}
        checkInRange={checkInRange}
        setCheckInRange={setCheckInRange}
        previousCheckInRange={previousCheckInRange}
        setPreviousCheckInRange={setPreviousCheckInRange}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        currentCalendarMonth={currentCalendarMonth}
        setCurrentCalendarMonth={setCurrentCalendarMonth}
        isDateRangeOpen={isDateRangeOpen}
        setIsDateRangeOpen={setIsDateRangeOpen}
        isCompareOpen={isCompareOpen}
        setIsCompareOpen={setIsCompareOpen}
        isCompsetOpen={isCompsetOpen}
        setIsCompsetOpen={setIsCompsetOpen}
        getCheckInDisplayText={getCheckInDisplayText}
        renderCustomCalendar={renderCustomCalendar}
        checkInRangeOptions={CHECK_IN_RANGE_OPTIONS}
        compareOptions={COMPARE_OPTIONS}
        compsetOptions={COMPSET_OPTIONS}
      />

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-7xl xl:max-w-none mx-auto">
          <div className="py-6 space-y-6">

            {/* Channel Widgets */}
            <OTAChannelCards
              viewMode={viewMode}
              selectedChannel={selectedChannel}
              setSelectedChannel={setSelectedChannel}
              currentChannels={currentChannels}
              currentChannelPage={currentChannelPage}
              totalChannelPages={totalChannelPages}
              handlePrevChannels={handlePrevChannels}
              handleNextChannels={handleNextChannels}
              isLoading={isLoadingChannels || isLoadingRanking}
            />

            {/* Main Content Views */}
            {viewMode === "Rank" ? (
              <OTARankView
                cardRef={cardRef}
                selectedChannelData={selectedChannelData}
                selectedProperty={selectedProperty}
                rankViewMode={rankViewMode}
                setRankViewMode={setRankViewMode}
                errorMessage={errorMessage}
                rankingTrendsData={rankingTrendsData}
                availableHotelLines={availableHotelLines}
                legendVisibility={legendVisibility}
                toggleLegendVisibility={toggleLegendVisibility}
                competitorPage={competitorPage}
                handlePrevCompetitors={handlePrevCompetitors}
                handleNextCompetitors={handleNextCompetitors}
                handleDownloadImage={handleDownloadImage}
                handleDownloadCSV={handleDownloadCSV}
                formatTableDate={formatTableDate}
                isLoading={isLoadingRankTrends}
              />
            ) : (
              viewMode === "Reviews" && (
                <OTAReviewsView
                  cardRef={cardRef}
                  selectedChannelData={selectedChannelData}
                  selectedChannel={selectedChannel}
                  selectedProperty={selectedProperty}
                  reviewsViewMode={reviewsViewMode}
                  setReviewsViewMode={setReviewsViewMode}
                  reviewsData={reviewsData}
                />
              )
            )}
          </div>

          {/* Footer spacing */}
          <div className="h-8"></div>
        </div>
      </main>
    </div>
  )
}
