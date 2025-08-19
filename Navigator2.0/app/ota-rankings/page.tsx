"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { EnhancedDatePicker } from "@/components/enhanced-date-picker"

import { Calendar, TrendingUp, BarChart3, Activity, Grid3x3, ChevronDown, Eye, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip as RechartsTooltip } from "recharts"

export default function OTARankingsPage() {
  const [compareWith, setCompareWith] = useState("Last 1 Week")
  const [compSet, setCompSet] = useState("Primary Compset")
  const [viewMode, setViewMode] = useState("Rank")
  const [selectedChannel, setSelectedChannel] = useState("booking")
  const [activeOption, setActiveOption] = useState("option1")
  const [chartView, setChartView] = useState("rank") // For Option 3

  // Date picker state
  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)) // 7 days from now
  
  // Filter dropdown states
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const [isCompsetOpen, setIsCompsetOpen] = useState(false)
  
  // Channel pagination state
  const [currentChannelPage, setCurrentChannelPage] = useState(0)
  const channelsPerPage = 3

  // Handle date range changes
  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start || null)
    setEndDate(end || null)
  }

  // Compare options (simplified as requested)
  const compareOptions = [
    { id: "1week", label: "Last 1 Week" },
    { id: "2weeks", label: "Last 2 Weeks" }
  ]

  // View options
  const viewOptions = [
    { id: "rank", label: "Rank" },
    { id: "reviews", label: "Reviews" }
  ]

  // Compset options
  const compsetOptions = [
    { id: "primary", label: "Primary Compset" },
    { id: "secondary", label: "Secondary Compset" }
  ]

  // Enhanced Channel data with performance metrics
  const channelData = [
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
      compareText: "vs. Last 1 week",
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
      compareText: "vs. Last 1 week",
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
      compareText: "vs. Last 1 week",
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
      compareText: "vs. Last 1 week",
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
      compareText: "vs. Last 1 week",
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
      compareText: "vs. Last 1 week",
      reviewText: "As on today",
      status: "declining"
    },
  ]

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

  // Get selected channel data for charts with memoization
  const selectedChannelData = useMemo(() => 
    channelData.find((channel) => channel.id === selectedChannel),
    [selectedChannel]
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

  // Ranking Trends Data for the new full-width chart
  const rankingTrendsData = useMemo(() => [
    {
      date: "Aug 19",
      myHotel: 5,
      competitor1: 1,
      competitor2: 8,
      competitor3: 12,
      myHotelPrice: 125,
      competitor1Price: 110,
      competitor2Price: 140,
      competitor3Price: 95
    },
    {
      date: "Aug 20",
      myHotel: 4,
      competitor1: 1,
      competitor2: 9,
      competitor3: 11,
      myHotelPrice: 128,
      competitor1Price: 112,
      competitor2Price: 142,
      competitor3Price: 98
    },
    {
      date: "Aug 21",
      myHotel: 5,
      competitor1: 2,
      competitor2: 8,
      competitor3: 10,
      myHotelPrice: 130,
      competitor1Price: 115,
      competitor2Price: 145,
      competitor3Price: 100
    },
    {
      date: "Aug 22",
      myHotel: 6,
      competitor1: 1,
      competitor2: 7,
      competitor3: 9,
      myHotelPrice: 132,
      competitor1Price: 108,
      competitor2Price: 138,
      competitor3Price: 102
    },
    {
      date: "Aug 23",
      myHotel: 5,
      competitor1: 1,
      competitor2: 8,
      competitor3: 10,
      myHotelPrice: 135,
      competitor1Price: 118,
      competitor2Price: 148,
      competitor3Price: 105
    }
  ], [])

  // Custom Tooltip Component for Ranking Trends
  const RankingTrendsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload

      return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-4 min-w-[320px] z-[10001]">
          {/* Date Heading */}
          <div className="mb-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {label}
            </h3>
          </div>

          {/* Hotel Rankings */}
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => {
              const hotelNames = {
                myHotel: "Alhambra Hotel",
                competitor1: "Grand Hotel Guayaquil", 
                competitor2: "Clarion Inn Lake Buena Vista",
                competitor3: "Compset Avg. Rate"
              }
              
              const prices = {
                myHotel: data?.myHotelPrice || 0,
                competitor1: data?.competitor1Price || 0,
                competitor2: data?.competitor2Price || 0,
                competitor3: data?.competitor3Price || 0
              }

              const hotelName = hotelNames[entry.dataKey as keyof typeof hotelNames]
              const price = prices[entry.dataKey as keyof typeof prices]
              const rank = entry.value
              const variance = entry.dataKey === 'myHotel' ? '+2%' : entry.dataKey === 'competitor1' ? 'NF' : entry.dataKey === 'competitor2' ? '-1%' : '+1%'

              return (
                <div key={index} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {hotelName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ${price}
                    </div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white min-w-[30px]">
                      #{rank}
                    </div>
                    <div className={`text-xs font-bold min-w-[35px] ${
                      variance === 'NF' ? 'text-gray-500' :
                      variance.startsWith('+') ? 'text-red-600 dark:text-red-400' : 
                      'text-green-600 dark:text-green-400'
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

  // Sample data for Option 2 (Dual-Axis) - Stable data
  const getDualAxisData = (channelId: string) => {
    const months = [
      "Aug 2024", "Sep 2024", "Oct 2024", "Nov 2024", "Dec 2024", 
      "Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025", "May 2025", "Jun 2025", "Jul 2025"
    ]
    
    // Pre-defined stable data based on channel
    const channelVariations = {
      expedia: {
        rankings: [38, 37, 35, 36, 34, 36, 35, 33, 32, 31, 30, 29],
        reviews: [9.7, 9.8, 9.9, 9.8, 9.7, 9.8, null, null, null, null, null, null]
      },
      booking: {
        rankings: [6, 5, 4, 5, 6, 5, 4, 3, 4, 3, 2, 3],
        reviews: [9.5, 9.6, 9.7, 9.6, 9.5, 9.6, null, null, null, null, null, null]
      },
      tripadvisor: {
        rankings: [2, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1],
        reviews: [4.8, 4.9, 5.0, 5.1, 5.0, 5.0, null, null, null, null, null, null]
      },
      agoda: {
        rankings: [14, 13, 12, 11, 12, 12, 11, 10, 11, 10, 9, 10],
        reviews: [9.1, 9.2, 9.3, 9.2, 9.1, 9.2, null, null, null, null, null, null]
      },
      hotels: {
        rankings: [9, 8, 7, 8, 9, 8, 7, 6, 7, 6, 5, 6],
        reviews: [9.3, 9.4, 9.5, 9.4, 9.3, 9.4, null, null, null, null, null, null]
      }
    }
    
    const channelData = channelVariations[channelId as keyof typeof channelVariations] || channelVariations.expedia
    
    return months.map((month, index) => {
      const isHistorical = index <= 5 // Up to Jan 2025
      
      return {
        month,
        ranking: channelData.rankings[index],
        review: channelData.reviews[index],
        isHistorical,
        isToday: month === "Jan 2025"
      }
    })
  }

  // Sample sparkline data for Option 3 - Stable data
  const getSparklineData = (type: "ranking" | "review", channelId: string) => {
    const sparklineData = {
      ranking: {
        expedia: [40, 38, 36, 37, 35, 36, 34, 33, 32, 31, 30, 29],
        booking: [7, 6, 5, 6, 4, 5, 4, 3, 4, 3, 2, 3],
        tripadvisor: [3, 2, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1],
        agoda: [15, 14, 13, 12, 11, 12, 11, 10, 11, 10, 9, 10],
        hotels: [10, 9, 8, 9, 7, 8, 7, 6, 7, 6, 5, 6]
      },
      review: {
        expedia: [9.6, 9.7, 9.8, 9.9, 9.8, 9.7, 9.8, 9.9, 9.8, 9.7, 9.8, 9.8],
        booking: [9.4, 9.5, 9.6, 9.7, 9.6, 9.5, 9.6, 9.7, 9.6, 9.5, 9.6, 9.6],
        tripadvisor: [4.7, 4.8, 4.9, 5.0, 5.1, 5.0, 4.9, 5.0, 5.1, 5.0, 4.9, 5.0],
        agoda: [9.0, 9.1, 9.2, 9.3, 9.2, 9.1, 9.2, 9.3, 9.2, 9.1, 9.2, 9.2],
        hotels: [9.2, 9.3, 9.4, 9.5, 9.4, 9.3, 9.4, 9.5, 9.4, 9.3, 9.4, 9.4]
      }
    }
    
    const channelKey = channelId as keyof typeof sparklineData.ranking
    const values = sparklineData[type][channelKey] || sparklineData[type].expedia
    
    return values.map(value => ({ value }))
  }

  const dualAxisData = getDualAxisData(selectedChannel)
  const rankingSparkline = getSparklineData("ranking", selectedChannel)
  const reviewSparkline = getSparklineData("review", selectedChannel)

  // Helper components for sparklines
  const SparklineChart = ({ data, color = "#3b82f6" }: { data: any[], color?: string }) => (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )

  const renderOption1 = () => (
    <>

      {/* Enhanced Charts Section */}
      {/* Full-width Ranking Trends Analysis */}
      <Card className="bg-gradient-to-br from-card to-card/50 shadow-xl border border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                <div>
                  <CardTitle className="text-xl font-bold">Ranking Trends Analysis</CardTitle>
                  <p className="text-sm text-muted-foreground">Comprehensive ranking comparison across all channels with market insights</p>
                  </div>
                </div>
              </div>
      </div>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rankingTrendsData} margin={{ top: 20, right: 40, left: 30, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-15 dark:opacity-10" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date"
                  className="text-xs"
                  interval="preserveStartEnd"
                  height={35}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[1, 'dataMax + 2']}
                  reversed={true}
                  label={{ value: 'Ranking Position', angle: -90, position: 'insideLeft' }}
                />
                <RechartsTooltip
                  content={RankingTrendsTooltip}
                  allowEscapeViewBox={{ x: true, y: true }}
                  offset={10}
                  isAnimationActive={false}
                  wrapperStyle={{
                    zIndex: 10000,
                    pointerEvents: 'none'
                  }}
                />
                {/* Hotel Lines */}
                <Line
                  type="monotone"
                  dataKey="myHotel"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: "#3b82f6", strokeWidth: 3, fill: "hsl(var(--background))" }}
                  name="My Hotel"
                />
                <Line
                  type="monotone"
                  dataKey="competitor1"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2, fill: "hsl(var(--background))" }}
                  name="Grand Hotel Guayaquil"
                />
                <Line
                  type="monotone"
                  dataKey="competitor2"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#f59e0b", strokeWidth: 2, fill: "hsl(var(--background))" }}
                  name="Clarion Inn Lake Buena Vista"
                />
                <Line
                  type="monotone"
                  dataKey="competitor3"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2, fill: "hsl(var(--background))" }}
                  name="Alhambra Hotel"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  )

  const renderOption2 = () => {
    console.log("Option 2 Data:", dualAxisData) // Debug log
    
    return (
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Dual-Axis Analysis - {selectedChannelData?.name}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              How past reviews influence future rankings
            </p>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dualAxisData} margin={{ top: 20, right: 60, left: 60, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  yAxisId="ranking"
                  orientation="left"
                  domain={[1, 50]}
                  reversed={true}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#3b82f6" }}
                  width={50}
                />
                <YAxis
                  yAxisId="review"
                  orientation="right"
                  domain={[4.0, 10.0]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#10b981" }}
                  width={50}
                />
                
                {/* Today marker */}
                <ReferenceLine x="Jan 2025" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} yAxisId="ranking" />
                
                {/* Ranking line (full timeline) */}
                <Line
                  yAxisId="ranking"
                  type="monotone"
                  dataKey="ranking"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  connectNulls={true}
                  name="Ranking"
                />
                
                {/* Review line (historical only) */}
                <Line
                  yAxisId="review"
                  type="monotone"
                  dataKey="review"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  connectNulls={false}
                  name="Review Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Ranking (Historical & Projected)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Review Score (Historical Only)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-red-500"></div>
              <span>Today Marker</span>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Left Axis (Blue):</strong> Ranking position (lower is better) | 
              <strong className="ml-2">Right Axis (Green):</strong> Review score (higher is better) | 
              <strong className="ml-2">Red Line:</strong> Current date separator
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderOption3 = () => (
    <>
      {/* Toggle Buttons at Top */}
      <Card className="bg-card shadow-lg">
        <CardContent className="p-6">
          <div className="flex space-x-2">
            <Button
              variant={chartView === "rank" ? "default" : "outline"}
              onClick={() => setChartView("rank")}
              className="flex items-center space-x-2"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Ranking Analysis</span>
            </Button>
            <Button
              variant={chartView === "review" ? "default" : "outline"}
              onClick={() => setChartView("review")}
              className="flex items-center space-x-2"
            >
              <Activity className="h-4 w-4" />
              <span>Review Analysis</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter Bar - For Option 3 */}
      <Card className="bg-card shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Channel Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Channel</Label>
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center ${channelData.find((c) => c.id === selectedChannel)?.iconBg}`}
                      >
                        <span className="text-white text-xs font-bold">
                          {channelData.find((c) => c.id === selectedChannel)?.icon}
                        </span>
                      </div>
                      <span>{channelData.find((c) => c.id === selectedChannel)?.name}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {channelData.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-5 h-5 rounded flex items-center justify-center ${channel.iconBg}`}>
                          <span className="text-white text-xs font-bold">{channel.icon}</span>
                        </div>
                        <span>{channel.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Next 7 Days */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Next 7 Days</Label>
              <Button variant="outline" className="w-full justify-between text-left bg-transparent">
                <span className="text-lg font-semibold">Aug 23 - Aug 30</span>
                <Calendar className="h-4 w-4" />
              </Button>
            </div>

            {/* Compare with */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Compare with</Label>
              <Select value={compareWith} onValueChange={setCompareWith}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Last 1 week">Last 1 week</SelectItem>
                  <SelectItem value="Last 2 weeks">Last 2 weeks</SelectItem>
                  <SelectItem value="Last month">Last month</SelectItem>
                  <SelectItem value="Last 3 months">Last 3 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* CompSet */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">CompSet</Label>
              <RadioGroup value={compSet} onValueChange={setCompSet} className="flex space-x-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="primary" id="primary-opt3" />
                  <Label htmlFor="primary-opt3">Primary</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="secondary" id="secondary-opt3" />
                  <Label htmlFor="secondary-opt3">Secondary</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <Card className="bg-card shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Current Ranking</h4>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold">#{selectedChannelData?.avgRank}</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedChannelData?.rankingChange && selectedChannelData.rankingChange !== 0 && (
                        <span className={selectedChannelData.rankingChange > 0 ? "text-red-600" : "text-green-600"}>
                          {selectedChannelData.rankingChange > 0 ? "+" : ""}{selectedChannelData.rankingChange} vs Last Week
                        </span>
                      )}
                    </div>
                  </div>
                  <SparklineChart data={rankingSparkline} color="#3b82f6" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Review Score</h4>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold">{selectedChannelData?.reviewScore}</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedChannelData?.reviewChange && selectedChannelData.reviewChange !== 0 && (
                        <span className={selectedChannelData.reviewChange < 0 ? "text-red-600" : "text-green-600"}>
                          {selectedChannelData.reviewChange > 0 ? "+" : ""}{selectedChannelData.reviewChange} vs Last Month
                        </span>
                      )}
                    </div>
                  </div>
                  <SparklineChart data={reviewSparkline} color="#10b981" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Chart */}
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle>
            {chartView === "rank" ? "Ranking Analysis" : "Review Score Analysis"} - {selectedChannelData?.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {chartView === "rank" 
              ? "Track your ranking position and forecast future performance" 
              : "Historical review score trends and comparisons"}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === "rank" ? (
                <LineChart data={rankingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                  />
                  <YAxis
                    domain={[1, Math.max(...rankingData.map((d) => d.value)) + 2]}
                    reversed={true}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                  />
                </LineChart>
              ) : (
                <LineChart data={reviewData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                  />
                  <YAxis
                    domain={[
                      Math.min(...reviewData.map((d) => Math.min(d.primary, d.secondary))) - 0.1,
                      Math.max(...reviewData.map((d) => Math.max(d.primary, d.secondary))) + 0.1,
                    ]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="primary"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="secondary"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "hsl(var(--chart-2))", strokeWidth: 2 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  )



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

                  {/* View Dropdown */}
                  <div className="shrink-0">
                    <Popover open={isViewOpen} onOpenChange={setIsViewOpen}>
                      <PopoverTrigger asChild>
              <Button
                          variant="outline"
                          size="sm"
                          className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 min-w-0 max-w-[160px]"
                        >
                          <Eye className="w-4 h-4 shrink-0" />
                          <span className="truncate max-w-[80px] font-semibold">
                            {viewMode}
                          </span>
                          <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
              </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[60]" align="start">
                        <div className="flex">
                          <div className="w-44 p-4">
                            <h4 className="font-semibold text-sm text-gray-700 mb-3">View</h4>
                            <div className="space-y-1">
                              {viewOptions.map((option) => (
              <Button
                                  key={option.id}
                                  variant={viewMode === option.label ? "default" : "ghost"}
                                  size="sm"
                                  className="w-full justify-start text-left h-auto py-2 px-3"
                                  onClick={() => {
                                    setViewMode(option.label)
                                    setIsViewOpen(false)
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

                  {/* Enhanced Date Picker - Matching Overview */}
                  <div className="shrink-0">
                    <EnhancedDatePicker
                      startDate={startDate || undefined}
                      endDate={endDate || undefined}
                      onChange={handleDateRangeChange}
                    />
                  </div>

                  {/* Compare with Dropdown */}
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
                  OTA Rank
                </h1>
                <p className="text-sm text-muted-foreground">
                  Monitor your property's ranking performance across major OTA channels
                </p>
              </div>
            </div>

            {/* Channel Widgets - Enhanced with proper spacing */}
            <div className="w-full animate-slide-up">
              {activeOption === "option1" && (
                <>
                  {/* Channel Cards with Pagination */}
                  <div className="relative mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
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

                              {/* Metrics Grid - Side by Side */}
                              <div className="grid grid-cols-2 gap-2">
                                {/* Avg Rank Metric */}
                                <div className="py-2 px-2">
                                  <div className="mb-1">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Rank</span>
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="flex items-baseline space-x-1">
                                      <span className="text-lg font-bold text-foreground leading-none">{channel.avgRank}</span>
                                      <span className="text-xs text-muted-foreground">/ {channel.totalRankings}</span>
                                    </div>
                                    <div className="flex items-center space-x-1 mt-1">
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
                                    </div>
                                  </div>
                </div>

                                {/* Review Score Metric */}
                                <div className="py-2 px-2">
                                  <div className="mb-1">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Review Score</span>
                    </div>
                                  <div className="space-y-0.5">
                                    <div className="flex items-baseline space-x-1">
                                      <span className="text-lg font-bold text-foreground leading-none">{channel.reviewScore}</span>
                                      <span className="text-xs text-muted-foreground">/ {channel.maxReviewScore}</span>
                    </div>
                                    <p className="text-xs text-muted-foreground leading-none mt-2">{channel.reviewText}</p>
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

                  {/* Rest of Option 1 Content */}
                  <div className="space-minimal-xl mt-8">
                    {renderOption1()}
                  </div>
                </>
              )}
              
        {activeOption === "option2" && renderOption2()}
        {activeOption === "option3" && renderOption3()}
            </div>

            {/* Footer spacing */}
            <div className="h-8"></div>
          </div>
        </div>
      </main>

      {/* Bottom Option Selector */}
      <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
        <Card className="bg-gradient-to-r from-primary/5 to-chart-2/5 shadow-xl border border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Design Options</h3>
                <p className="text-sm text-muted-foreground">Switch between different layout variations</p>
              </div>
              <Badge variant="outline" className="text-xs">
                Active: {activeOption === "option1" ? "Enhanced Cards" : activeOption === "option2" ? "Dual-Axis" : "Sparklines"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant={activeOption === "option1" ? "default" : "outline"}
                onClick={() => setActiveOption("option1")}
                className={`relative overflow-hidden h-auto p-4 transition-all duration-300 ${
                  activeOption === "option1" 
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg" 
                    : "hover:bg-primary/5 hover:border-primary/30"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${activeOption === "option1" ? "bg-primary-foreground/20" : "bg-primary/10"}`}>
                    <Grid3x3 className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Option 1</div>
                    <div className={`text-sm ${activeOption === "option1" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      Enhanced Cards & Charts
                    </div>
                  </div>
                </div>
                {activeOption === "option1" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent pointer-events-none" />
                )}
              </Button>
              
              <Button
                variant={activeOption === "option2" ? "default" : "outline"}
                onClick={() => setActiveOption("option2")}
                className={`h-auto p-4 transition-all duration-300 ${
                  activeOption === "option2" 
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg" 
                    : "hover:bg-primary/5 hover:border-primary/30"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${activeOption === "option2" ? "bg-primary-foreground/20" : "bg-orange-100 dark:bg-orange-900/30"}`}>
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Option 2</div>
                    <div className={`text-sm ${activeOption === "option2" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      Dual-Axis Analysis
                    </div>
                  </div>
                </div>
              </Button>
              
              <Button
                variant={activeOption === "option3" ? "default" : "outline"}
                onClick={() => setActiveOption("option3")}
                className={`h-auto p-4 transition-all duration-300 ${
                  activeOption === "option3" 
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg" 
                    : "hover:bg-primary/5 hover:border-primary/30"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${activeOption === "option3" ? "bg-primary-foreground/20" : "bg-purple-100 dark:bg-purple-900/30"}`}>
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Option 3</div>
                    <div className={`text-sm ${activeOption === "option3" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      Cards & Sparklines
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
