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
import OTARankView from "@/components/ota-rank-view"
import OTAReviewsView from "@/components/ota-reviews-view"

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
  const [otaReviewsData, setOtaReviewsData] = useState<any[]>([])
  const [isLoadingChannels, setIsLoadingChannels] = useState(false)
  const [isLoadingRanking, setIsLoadingRanking] = useState(false)
  const [isLoadingRankTrends, setIsLoadingRankTrends] = useState(false)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)

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

  // Overview-style channel dropdown state
  // const [overviewChannelData, setOverviewChannelData] = useState<any>([])
  // const [selectedOverviewChannels, setSelectedOverviewChannels] = useState<number[]>([])
  const didFetchChannels = useRef(false)

  // Date picker state - Initialize with future dates for Rank mode
  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(new Date(Date.now() + 29 * 24 * 60 * 60 * 1000)) // 30 days from now

  // Filter dropdown states
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const [isCompsetOpen, setIsCompsetOpen] = useState(false)
  
  // Tab switching loading state
  const [isTabSwitching, setIsTabSwitching] = useState(false)
  
  // Ref to track current tab to prevent cross-tab API calls
  const currentTabRef = useRef<string | null>(null)

  // Channel pagination state
  const [currentChannelPage, setCurrentChannelPage] = useState(0)
  const channelsPerPage = 3

  // Legend visibility state
  const [legendVisibility, setLegendVisibility] = useState<Record<string, boolean>>({})

  // Error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fetch channel data for Overview-style dropdown
  // useEffect(() => {
  //   if (!selectedProperty?.sid || didFetchChannels.current) return;

  //   didFetchChannels.current = true;
  //   getChannels({ SID: selectedProperty?.sid })
  //     .then((res) => {
  //       if (res?.status && res?.body) {
  //         // Add "All Channels" option
  //         const allChannel = { cid: -1, name: "All Channels" };
  //         const channelList = [allChannel, ...res.body];

  //         // Set data
  //         setOverviewChannelData(channelList);

  //         // Set selected channels as array of cids (default to all)
  //         setSelectedOverviewChannels(channelList.map(c => c.cid));
  //       }
  //     })
  //     .catch((err) => console.error(err));
  // }, [selectedProperty?.sid]);

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
  // const getOverviewChannelDisplayText = useCallback(() => {
  //   if (selectedOverviewChannels.length === 0) {
  //     return "All Channels"
  //   } else if (selectedOverviewChannels.includes(-1)) {
  //     return "All Channels"
  //   } else if (selectedOverviewChannels.length === 1) {
  //     const channel = overviewChannelData.find((c: any) => c.cid === selectedOverviewChannels[0]);
  //     if (channel) {
  //       return channel.name
  //     }
  //     return "Select Channels"
  //   } else {
  //     return `${selectedOverviewChannels.length} Channels`
  //   }
  // }, [selectedOverviewChannels, overviewChannelData])

  // // Handle overview channel selection
  // const handleOverviewChannelSelect = useCallback((channelCid: any, channelData: any) => {
  //   setSelectedOverviewChannels(prev => {
  //     const isSelected = prev.includes(channelCid)
  //     let newSelection: number[]

  //     if (channelCid === -1) {
  //       // If selecting "All Channels", clear all others
  //       newSelection = isSelected ? [] : channelData.map((c: any) => c.cid)
  //     } else {
  //       // If selecting a specific channel
  //       if (isSelected) {
  //         // Remove this channel and "All Channels" if present
  //         newSelection = prev.filter(id => id !== channelCid && id !== -1)
  //       } else {
  //         // Add this channel and remove "All Channels" if present
  //         const withoutAll = prev.filter(id => id !== -1)
  //         newSelection = [...withoutAll, channelCid]

  //         // If all individual channels are now selected, add "All Channels"
  //         if (newSelection.length === channelData.length - 1) {
  //           newSelection = channelData.map((c: any) => c.cid)
  //         }
  //       }
  //     }

  //     return newSelection
  //   })
  // }, [])


  // Get responsive compare text for channel widgets
  const getCompareText = useCallback(() => {
    if (windowWidth <= 1280) {
      return "vs 1 week" // Compact version for 1280px and below
    }
    return "vs. Last 1 week" // Full version for larger screens
  }, [windowWidth])


  // Date range change handler
  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start)
    setEndDate(end)
  }

  // Handle date range initialization when switching tabs
  useEffect(() => {
    // Set loading state when switching tabs
    setIsTabSwitching(true)
    
    // Update the current tab ref
    currentTabRef.current = viewMode
    
    // Clear data immediately when switching tabs
    if (viewMode === "Reviews") {
      // Clear rank data aggressively
      setOtaRankTrendsData([])
      setOtaRankGraphData([])
      // Force a re-render by setting a temporary empty state
      setTimeout(() => {
        setOtaRankTrendsData([])
        setOtaRankGraphData([])
      }, 0)
      
      // Set to past dates for Reviews mode (Last 30 Days)
      const today = new Date()
      const thirtyDaysAgo = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000)
      console.log('Switching to Reviews mode - setting date range:', {
        startDate: format(thirtyDaysAgo, 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd')
      })
      setStartDate(thirtyDaysAgo)
      setEndDate(today)
    } else if (viewMode === "Rank") {
      // Clear reviews data aggressively
      setOtaReviewsData([])
      // Force a re-render by setting a temporary empty state
      setTimeout(() => {
        setOtaReviewsData([])
      }, 0)
      
      // Set to future dates for Rank mode (Next 30 Days)
      const today = new Date()
      const thirtyDaysFromNow = new Date(today.getTime() + 29 * 24 * 60 * 60 * 1000)
      console.log('Switching to Rank mode - setting date range:', {
        startDate: format(today, 'yyyy-MM-dd'),
        endDate: format(thirtyDaysFromNow, 'yyyy-MM-dd')
      })
      setStartDate(today)
      setEndDate(thirtyDaysFromNow)
    }
    
    // Clear loading state after a short delay to allow data to clear
    setTimeout(() => {
      setIsTabSwitching(false)
    }, 100)
  }, [viewMode])


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

  // Transform reviews trends data from API
  const transformReviewsTrendsData = useCallback((trendDataPerCheckin: any[]) => {
    const reviewsGraphData: any[] = []

    trendDataPerCheckin.forEach((trendDataPerCheckin) => {
      // Process all data points for the selected property
      trendDataPerCheckin.otaRankEntityCollection?.forEach((data: any) => {
        if (data.propertyID === selectedProperty?.hmid) {
          data.checkInDate = new Date(data.checkInDate)
          
          // Create a new data point for each date
          reviewsGraphData.push({ 
            checkInDate: data.checkInDate.getTime(),
            date: format(data.checkInDate, 'MMM d'),
            fullDate: format(data.checkInDate, 'yyyy-MM-dd'),
            reviewScore: data.score ? parseFloat(data.score) : 0,
            reviewCount: data.reviewCount || 0,
            numberOfReviews: data.reviewCount || 0 // For chart compatibility
          })
        }
      })
    })

    // Sort by date
    reviewsGraphData.sort((a, b) => (a.checkInDate - b.checkInDate))
    
    setOtaReviewsData(reviewsGraphData)
  }, [selectedProperty?.hmid])

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
    console.log('Ranking trends data useMemo triggered:', {
      viewMode,
      otaRankGraphDataLength: otaRankGraphData.length,
      otaRankGraphData: otaRankGraphData
    })
    
    // Only return data if we're in Rank mode and have data
    if (viewMode !== "Rank" || otaRankGraphData.length === 0) {
      console.log('Returning empty array for ranking trends data')
      return []
    }
    
    // Transform API data to match the expected format for charts
    const transformedData = otaRankGraphData.map((item, index) => {
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
    
    console.log('Transformed ranking trends data:', transformedData)
    return transformedData
  }, [otaRankGraphData, viewMode])

  // Use real API data for reviews
  const reviewsData = useMemo(() => {
    console.log('Reviews data useMemo triggered:', {
      viewMode,
      otaReviewsDataLength: otaReviewsData.length,
      otaReviewsData: otaReviewsData
    })
    
    // Only return data if we're in Reviews mode and have data
    if (viewMode !== "Reviews" || otaReviewsData.length === 0) {
      console.log('Returning empty array for reviews data')
      return []
    }
    
    // Transform API data to match the expected format for charts
    const transformedData = otaReviewsData.map((item) => ({
      week: item.date, // Use date as week label
      reviewScore: item.reviewScore,
      numberOfReviews: item.numberOfReviews
    }))
    
    console.log('Transformed reviews data:', transformedData)
    return transformedData
  }, [otaReviewsData, viewMode])

  // Debug OTA Ranking Data
  console.log('Current OTA Ranking Data State:', {
    otaRankingDataLength: otaRankingData?.length || 0,
    otaRankingData: otaRankingData,
    viewMode,
    startDate: startDate ? format(startDate, 'yyyy-MM-dd') : null,
    endDate: endDate ? format(endDate, 'yyyy-MM-dd') : null
  })

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

      console.log('Fetching OTA Ranking data for Reviews table:', {
        selectedProperty: selectedProperty?.sid,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        viewMode
      })

      setIsLoadingRanking(true)
      try {
        const response = await getOTARankOnAllChannel({ SID: selectedProperty.sid, CheckInDateStart: format(startDate, 'yyyy-MM-dd'), CheckInEndDate: format(endDate, 'yyyy-MM-dd') })
        console.log('OTA Ranking API Response:', response)
        if (response?.status && response?.body) {
          console.log('Setting OTA Ranking data:', response.body)
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

  // Fetch OTA Ranking Trends data (only when in Rank mode)
  useEffect(() => {
    const fetchRankTrendsData = async () => {
      // Only fetch if we're in Rank mode and not switching tabs
      if (!selectedProperty?.sid || !otaChannels || !startDate || !endDate || viewMode !== "Rank" || isTabSwitching || currentTabRef.current !== "Rank") {
        return
      }

      // Add a small delay to ensure date range has been properly set
      await new Promise(resolve => setTimeout(resolve, 50))

      setIsLoadingRankTrends(true)
      try {
        const selectedChannelData = otaChannels.find(channel => channel.name.toLowerCase() === selectedChannel.toLowerCase())?.cid;
        if (!selectedChannelData) return

        console.log('Fetching Rank data with date range:', {
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          viewMode
        })

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

    // Add a small delay to prevent rapid API calls during tab switching
    const timeoutId = setTimeout(() => {
      fetchRankTrendsData()
    }, 150)

    return () => clearTimeout(timeoutId)
  }, [selectedProperty?.sid, startDate, endDate, selectedChannel, viewMode, transformRankTrendsData, isTabSwitching])

  // Fetch OTA Reviews data (only when in Reviews mode)
  useEffect(() => {
    const fetchReviewsData = async () => {
      // Only fetch if we're in Reviews mode and not switching tabs
      if (!selectedProperty?.sid || !otaChannels || !startDate || !endDate || viewMode !== "Reviews" || isTabSwitching || currentTabRef.current !== "Reviews") {
        return
      }

      // Add a small delay to ensure date range has been properly set
      await new Promise(resolve => setTimeout(resolve, 50))

      setIsLoadingReviews(true)
      try {
        const selectedChannelData = otaChannels.find(channel => channel.name.toLowerCase() === selectedChannel.toLowerCase())?.cid;
        if (!selectedChannelData) return

        console.log('Fetching Reviews data with date range:', {
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          viewMode
        })

        const response = await getOTARankTrends({
          SID: selectedProperty.sid,
          OTAId: selectedChannelData,
          CheckInDateStart: format(startDate, 'yyyy-MM-dd'),
          CheckInEndDate: format(endDate, 'yyyy-MM-dd')
        })

        if (response?.status && response?.body?.trendDataPerCheckin) {
          transformReviewsTrendsData(response.body.trendDataPerCheckin)
        }
      } catch (error) {
        console.error('Error fetching OTA reviews data:', error)
      } finally {
        setIsLoadingReviews(false)
      }
    }

    // Add a small delay to prevent rapid API calls during tab switching
    const timeoutId = setTimeout(() => {
      fetchReviewsData()
    }, 150)

    return () => clearTimeout(timeoutId)
  }, [selectedProperty?.sid, startDate, endDate, selectedChannel, viewMode, transformReviewsTrendsData, isTabSwitching])

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
        isCompareOpen={isCompareOpen}
        setIsCompareOpen={setIsCompareOpen}
        isCompsetOpen={isCompsetOpen}
        setIsCompsetOpen={setIsCompsetOpen}
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
                key={`rank-${viewMode}-${startDate?.getTime()}-${endDate?.getTime()}`}
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
                isLoading={isLoadingRankTrends || isTabSwitching}
              />
            ) : (
              viewMode === "Reviews" && (
                <>
                  {console.log('Passing data to OTAReviewsView:', {
                    otaRankingDataLength: otaRankingData?.length || 0,
                    otaRankingData: otaRankingData,
                    selectedProperty: selectedProperty?.hmid
                  })}
                  <OTAReviewsView
                    key={`reviews-${viewMode}-${startDate?.getTime()}-${endDate?.getTime()}`}
                    cardRef={cardRef}
                    selectedChannelData={selectedChannelData}
                    selectedChannel={selectedChannel}
                    selectedProperty={selectedProperty}
                    reviewsViewMode={reviewsViewMode}
                    setReviewsViewMode={setReviewsViewMode}
                    reviewsData={reviewsData}
                    otaRankingData={otaRankingData}
                    isLoading={isLoadingReviews || isTabSwitching}
                  />
                </>
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
