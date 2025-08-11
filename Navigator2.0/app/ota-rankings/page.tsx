"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Calendar } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

export default function OTARankingsPage() {
  const [dateRange, setDateRange] = useState("1 - 8 Aug'25")
  const [compareWith, setCompareWith] = useState("Last 1 week")
  const [compSet, setCompSet] = useState("primary")
  const [selectedChannel, setSelectedChannel] = useState("expedia")

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
      <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8 space-y-6">
        {/* Filter Bar */}
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
      </div>
    </div>
  )
}
