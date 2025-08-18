"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

import { Calendar, TrendingUp, BarChart3, Activity, Grid3x3 } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"

export default function OTARankingsPage() {
  const [dateRange, setDateRange] = useState("1 - 8 Aug'25")
  const [compareWith, setCompareWith] = useState("Last 1 week")
  const [compSet, setCompSet] = useState("primary")
  const [selectedChannel, setSelectedChannel] = useState("expedia")
  const [activeOption, setActiveOption] = useState("option1")
  const [chartView, setChartView] = useState("rank") // For Option 3

  // Channel data - up to 5 channels
  const channelData = [
    {
      id: "booking",
      name: "Booking.com",
      icon: "B",
      iconBg: "bg-blue-600",
      ranking: 5,
      rankingChange: -1,
      reviewScore: 9.6,
      reviewChange: 0,
    },
    {
      id: "expedia",
      name: "Expedia",
      icon: "✈",
      iconBg: "bg-yellow-500",
      ranking: 36,
      rankingChange: -25,
      reviewScore: 9.8,
      reviewChange: 0,
    },
    {
      id: "tripadvisor",
      name: "Tripadvisor",
      icon: "🦉",
      iconBg: "bg-green-600",
      ranking: 1,
      rankingChange: 0,
      reviewScore: 5.0,
      reviewChange: 0,
    },
    {
      id: "agoda",
      name: "Agoda",
      icon: "A",
      iconBg: "bg-red-500",
      ranking: 12,
      rankingChange: 3,
      reviewScore: 9.2,
      reviewChange: 0.1,
    },
    {
      id: "hotels",
      name: "Hotels.com",
      icon: "H",
      iconBg: "bg-purple-600",
      ranking: 8,
      rankingChange: -2,
      reviewScore: 9.4,
      reviewChange: -0.2,
    },
  ]

  // Get selected channel data for charts
  const selectedChannelData = channelData.find((channel) => channel.id === selectedChannel)

  // Ranking chart data - varies by channel
  const getRankingData = (channelId: string) => {
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
  }

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

  const rankingData = getRankingData(selectedChannel)
  const reviewData = getReviewData(selectedChannel)

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
      {/* Channel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {channelData.map((channel, index) => (
          <Card
            key={index}
            className={`bg-card transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl ${
              selectedChannel === channel.id ? "ring-2 ring-primary shadow-lg transform scale-105" : "hover:shadow-md"
            }`}
            onClick={() => setSelectedChannel(channel.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-6 h-6 rounded ${channel.iconBg} flex items-center justify-center`}>
                  <span className="text-white text-sm font-bold">{channel.icon}</span>
                </div>
                <span className="font-medium text-foreground">{channel.name}</span>
                {selectedChannel === channel.id && (
                  <Badge className="bg-primary/10 text-primary text-xs">Selected</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Ranking</div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">{channel.ranking}</span>
                    {channel.rankingChange !== 0 && (
                      <Badge
                        variant={channel.rankingChange > 0 ? "destructive" : "default"}
                        className={
                          channel.rankingChange > 0 ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                        }
                      >
                        {channel.rankingChange > 0 ? `+${channel.rankingChange}` : channel.rankingChange}
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Review score</div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">{channel.reviewScore}</span>
                    {channel.reviewChange !== 0 && (
                      <Badge
                        variant={channel.reviewChange < 0 ? "destructive" : "default"}
                        className={channel.reviewChange < 0 ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"}
                      >
                        {channel.reviewChange > 0 ? `+${channel.reviewChange}` : channel.reviewChange}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ranking Chart */}
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <span className="text-lg font-semibold">Ranking - {selectedChannelData?.name}</span>
              <span className="text-sm text-muted-foreground ml-2">21 Properties listed</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
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
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Review Score Chart */}
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <span className="text-lg font-semibold">Review score - {selectedChannelData?.name}</span>
              <span className="text-sm text-muted-foreground ml-2">472 Properties listed</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
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
                <span className="text-lg font-semibold">{dateRange}</span>
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
                    <div className="text-3xl font-bold">{selectedChannelData?.ranking}</div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
      <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8 space-y-6">
        {/* Design Options Navigation */}
        <Card className="bg-card shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">OTA Rankings - Design Options</h2>
              <p className="text-sm text-muted-foreground">Select a design concept to review</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant={activeOption === "option1" ? "default" : "outline"}
                onClick={() => setActiveOption("option1")}
                className="flex items-center space-x-2 h-auto p-4"
              >
                <Grid3x3 className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Option 1</div>
                  <div className="text-xs text-muted-foreground">Current View</div>
                </div>
              </Button>
              <Button
                variant={activeOption === "option2" ? "default" : "outline"}
                onClick={() => setActiveOption("option2")}
                className="flex items-center space-x-2 h-auto p-4"
              >
                <TrendingUp className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Option 2</div>
                  <div className="text-xs text-muted-foreground">Dual-Axis</div>
                </div>
              </Button>
              <Button
                variant={activeOption === "option3" ? "default" : "outline"}
                onClick={() => setActiveOption("option3")}
                className="flex items-center space-x-2 h-auto p-4"
              >
                <BarChart3 className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Option 3</div>
                  <div className="text-xs text-muted-foreground">Card & Sparkline</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filter Bar - Shows for Options 1 and 2 only */}
        {activeOption !== "option3" && (
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
                    <span className="text-lg font-semibold">{dateRange}</span>
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
                      <RadioGroupItem value="primary" id="primary" />
                      <Label htmlFor="primary">Primary</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="secondary" id="secondary" />
                      <Label htmlFor="secondary">Secondary</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Render Active Option */}
        {activeOption === "option1" && renderOption1()}
        {activeOption === "option2" && renderOption2()}
        {activeOption === "option3" && renderOption3()}
      </div>
    </div>
  )
}
