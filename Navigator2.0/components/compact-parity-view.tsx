"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Minus, Plus, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChannelData {
  id: string
  name: string
  winPercent: number
  meetPercent: number
  lossPercent: number
  parityScore: number
  dailyScores: number[]
  hotels?: HotelData[]
  expanded?: boolean
  trend?: "up" | "down" | "stable"
  trendValue?: number
  gradientClass?: string
}

interface HotelData {
  id: string
  name: string
  winPercent: number
  meetPercent: number
  lossPercent: number
  parityScore: number
  dailyResults: string[] // 'W', 'M', 'L' for each day
}

const mockChannelData: ChannelData[] = [
  {
    id: "booking",
    name: "Booking.com",
    winPercent: 15,
    meetPercent: 20,
    lossPercent: 65,
    parityScore: 35,
    dailyScores: [55, 77, 67, 72, 87, 25, 55, 29, 26, 45, 55, 26, 45, 26, 67],
    expanded: false,
    trend: "down",
    trendValue: -2.3,
    gradientClass: "bg-gradient-to-r from-blue-500 to-purple-500",
  },
  {
    id: "trivago",
    name: "Trivago",
    winPercent: 35,
    meetPercent: 45,
    lossPercent: 20,
    parityScore: 80,
    dailyScores: [67, 25, 45, 29, 55, 45, 26, 26, 55, 26, 77, 72, 67, 87, 55],
    expanded: false,
    trend: "up",
    trendValue: 1.8,
    gradientClass: "bg-gradient-to-r from-blue-500 to-teal-500",
    hotels: [
      {
        id: "hotel1",
        name: "Copthorne Hotel Newcastle",
        winPercent: 10,
        meetPercent: 15,
        lossPercent: 75,
        parityScore: 25,
        dailyResults: ["M", "L", "M", "L", "M", "M", "L", "L", "M", "L", "W", "W", "M", "W", "M"],
      },
      {
        id: "hotel2",
        name: "Grand Mercure Jakarta",
        winPercent: 25,
        meetPercent: 50,
        lossPercent: 25,
        parityScore: 75,
        dailyResults: ["L", "W", "M", "W", "W", "L", "M", "L", "L", "M", "M", "L", "M", "L", "M"],
      },
      {
        id: "hotel3",
        name: "Aston Imperium Purwokerto",
        winPercent: 20,
        meetPercent: 35,
        lossPercent: 45,
        parityScore: 55,
        dailyResults: ["M", "L", "M", "L", "M", "M", "L", "L", "M", "L", "W", "W", "M", "W", "M"],
      },
      {
        id: "hotel4",
        name: "Hilton London",
        winPercent: 30,
        meetPercent: 45,
        lossPercent: 25,
        parityScore: 75,
        dailyResults: ["M", "L", "M", "L", "M", "M", "L", "L", "M", "L", "W", "W", "M", "W", "M"],
      },
    ],
  },
  {
    id: "expedia",
    name: "Expedia",
    winPercent: 20,
    meetPercent: 40,
    lossPercent: 40,
    parityScore: 60,
    dailyScores: [45, 62, 38, 71, 55, 33, 48, 52, 39, 66, 44, 58, 61, 35, 49],
    expanded: false,
    trend: "stable",
    trendValue: 0.2,
    gradientClass: "bg-gradient-to-r from-blue-500 to-green-500",
  },
  {
    id: "agoda",
    name: "Agoda",
    winPercent: 15,
    meetPercent: 25,
    lossPercent: 60,
    parityScore: 40,
    dailyScores: [38, 45, 52, 29, 61, 44, 35, 58, 42, 33, 56, 48, 39, 65, 41],
    expanded: false,
    trend: "down",
    trendValue: -3.1,
    gradientClass: "bg-gradient-to-r from-blue-500 to-gray-400",
  },
  {
    id: "makemytrip",
    name: "MakeMyTrip",
    winPercent: 10,
    meetPercent: 20,
    lossPercent: 70,
    parityScore: 30,
    dailyScores: [32, 41, 38, 52, 29, 46, 33, 39, 48, 35, 42, 37, 51, 28, 44],
    expanded: false,
    trend: "up",
    trendValue: 2.7,
    gradientClass: "bg-gradient-to-r from-blue-500 to-pink-500",
  },
  {
    id: "google",
    name: "Google Hotel Finder",
    winPercent: 45,
    meetPercent: 35,
    lossPercent: 20,
    parityScore: 80,
    dailyScores: [68, 75, 71, 69, 78, 65, 73, 70, 74, 67, 76, 72, 69, 77, 71],
    expanded: false,
    trend: "up",
    trendValue: 1.5,
    gradientClass: "bg-gradient-to-r from-blue-500 to-orange-500",
  },
]

export function CompactParityView() {
  const [channels, setChannels] = React.useState<ChannelData[]>(mockChannelData)
  const [highlightThreshold, setHighlightThreshold] = React.useState("40")

  const dates = Array.from({ length: 15 }, (_, i) => {
    const date = new Date(2024, 3, i + 1) // April 2024
    return {
      day: String(i + 1).padStart(2, "0"),
      month: "Apr",
    }
  })

  const toggleChannelExpansion = (channelId: string) => {
    setChannels((prev) =>
      prev.map((channel) => (channel.id === channelId ? { ...channel, expanded: !channel.expanded } : channel)),
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-50 text-green-700 border-green-200"
    if (score >= 50) return "bg-orange-50 text-orange-700 border-orange-200"
    if (score >= 30) return "bg-red-50 text-red-600 border-red-200"
    return "bg-red-100 text-red-700 border-red-300"
  }

  const getResultColor = (result: string) => {
    switch (result) {
      case "W":
        return "bg-green-50 text-green-700 border-green-200"
      case "M":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "L":
        return "bg-red-50 text-red-600 border-red-200"
      default:
        return "bg-gray-50 text-gray-600 border-gray-200"
    }
  }

  const shouldHighlight = (score: number) => {
    const threshold = Number.parseInt(highlightThreshold)
    return score < threshold
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Parity Calendar View */}
        <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="py-2 px-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white">Parity Calendar View</CardTitle>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-xs text-white">Highlight below</span>
                  <Select value={highlightThreshold} onValueChange={setHighlightThreshold}>
                    <SelectTrigger className="w-14 h-6 text-xs border-white/30 bg-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30%</SelectItem>
                      <SelectItem value="40">40%</SelectItem>
                      <SelectItem value="50">50%</SelectItem>
                      <SelectItem value="60">60%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Header */}
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 w-44">Channels</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 w-36">Distribution</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 w-20">Score</th>
                    {dates.map((date, index) => (
                      <th key={index} className="text-center py-2 px-1 text-xs font-semibold text-gray-700 w-12">
                        <div className="text-xs font-bold">{date.day}</div>
                        <div className="text-[10px] text-gray-500">{date.month}</div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {channels.map((channel) => (
                    <React.Fragment key={channel.id}>
                      {/* Main Channel Row */}
                      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            {channel.hotels && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 hover:bg-gray-200 rounded"
                                onClick={() => toggleChannelExpansion(channel.id)}
                              >
                                {channel.expanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                              </Button>
                            )}
                            <div className="flex items-center gap-1.5">
                              <div className={cn("w-2 h-2 rounded-full", channel.gradientClass)}></div>
                              <span className="text-xs font-medium text-gray-900">{channel.name}</span>
                            </div>
                            {channel.trend && (
                              <div className="flex items-center">
                                {channel.trend === "up" ? (
                                  <TrendingUp className="h-3 w-3 text-green-600" />
                                ) : channel.trend === "down" ? (
                                  <TrendingDown className="h-3 w-3 text-red-600" />
                                ) : null}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center h-4 bg-gray-100 rounded overflow-hidden border border-gray-200 cursor-help">
                                <div
                                  className="h-full bg-green-400 flex items-center justify-center"
                                  style={{ width: `${channel.winPercent}%` }}
                                >
                                  {channel.winPercent > 20 && (
                                    <span className="text-[10px] font-bold text-white">{channel.winPercent}%</span>
                                  )}
                                </div>
                                <div
                                  className="h-full bg-orange-400 flex items-center justify-center"
                                  style={{ width: `${channel.meetPercent}%` }}
                                >
                                  {channel.meetPercent > 20 && (
                                    <span className="text-[10px] font-bold text-white">{channel.meetPercent}%</span>
                                  )}
                                </div>
                                <div
                                  className="h-full bg-red-400 flex items-center justify-center"
                                  style={{ width: `${channel.lossPercent}%` }}
                                >
                                  {channel.lossPercent > 20 && (
                                    <span className="text-[10px] font-bold text-white">{channel.lossPercent}%</span>
                                  )}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-sm">
                                <div className="font-semibold mb-1">{channel.name}</div>
                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
                                    <span>Win: {channel.winPercent}%</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-sm"></div>
                                    <span>Meet: {channel.meetPercent}%</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-sm"></div>
                                    <span>Loss: {channel.lossPercent}%</span>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1">
                            <span
                              className={cn(
                                "text-sm font-bold",
                                channel.parityScore >= 70
                                  ? "text-green-600"
                                  : channel.parityScore >= 50
                                    ? "text-orange-600"
                                    : "text-red-600",
                              )}
                            >
                              {channel.parityScore}%
                            </span>
                            {channel.trend && (
                              <span
                                className={cn(
                                  "text-[10px] font-medium",
                                  channel.trend === "up"
                                    ? "text-green-600"
                                    : channel.trend === "down"
                                      ? "text-red-600"
                                      : "text-gray-600",
                                )}
                              >
                                ({channel.trendValue && channel.trendValue > 0 ? "+" : ""}
                                {channel.trendValue}%)
                              </span>
                            )}
                          </div>
                        </td>
                        {channel.dailyScores.map((score, index) => (
                          <td key={index} className="py-1 px-0.5 text-center">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "w-10 h-6 flex items-center justify-center rounded text-[10px] font-bold border cursor-help transition-all hover:scale-105",
                                    getScoreColor(score),
                                    shouldHighlight(score) && "ring-1 ring-red-500 ring-offset-1",
                                  )}
                                >
                                  {score}%
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs">
                                  <div className="font-semibold">{channel.name}</div>
                                  <div>
                                    {dates[index].day} {dates[index].month}: {score}%
                                  </div>
                                  {shouldHighlight(score) && (
                                    <div className="text-red-600 font-semibold mt-1">⚠️ Below threshold</div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </td>
                        ))}
                      </tr>

                      {/* Hotel Breakdown */}
                      {channel.expanded && channel.hotels && (
                        <>
                          <tr>
                            <td
                              colSpan={18}
                              className={cn("py-1 px-3 border-b border-blue-200", channel.gradientClass)}
                            >
                              <div className="text-xs font-medium text-white">
                                📊 Hotel Breakdown for {channel.name}
                              </div>
                            </td>
                          </tr>
                          {channel.hotels.map((hotel) => (
                            <tr key={hotel.id} className="border-b border-gray-100 bg-blue-50/30 hover:bg-blue-50/50">
                              <td className="py-1.5 px-3 pl-8">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  <span className="text-xs text-gray-700">{hotel.name}</span>
                                </div>
                              </td>
                              <td className="py-1.5 px-3">
                                <div className="flex items-center h-4 bg-gray-100 rounded overflow-hidden border border-gray-200">
                                  <div className="h-full bg-green-500" style={{ width: `${hotel.winPercent}%` }}></div>
                                  <div
                                    className="h-full bg-orange-500"
                                    style={{ width: `${hotel.meetPercent}%` }}
                                  ></div>
                                  <div className="h-full bg-red-500" style={{ width: `${hotel.lossPercent}%` }}></div>
                                </div>
                              </td>
                              <td className="py-1.5 px-3">
                                <span
                                  className={cn(
                                    "text-xs font-bold",
                                    hotel.parityScore >= 70
                                      ? "text-green-600"
                                      : hotel.parityScore >= 50
                                        ? "text-orange-600"
                                        : "text-red-600",
                                  )}
                                >
                                  {hotel.parityScore}%
                                </span>
                              </td>
                              {hotel.dailyResults.map((result, index) => (
                                <td key={index} className="py-1 px-0.5 text-center">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div
                                        className={cn(
                                          "w-10 h-6 flex items-center justify-center rounded text-[10px] font-bold border cursor-help transition-all hover:scale-105",
                                          getResultColor(result),
                                        )}
                                      >
                                        {result}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="text-xs">
                                        <div className="font-semibold">{hotel.name}</div>
                                        <div>
                                          {dates[index].day} {dates[index].month}:{" "}
                                          {result === "W" ? "Win" : result === "M" ? "Meet" : "Loss"}
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Compact Legend */}
            <div className="py-2 px-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-green-400 rounded border border-green-500"></div>
                  <span className="text-gray-700 font-medium">Win</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-orange-400 rounded border border-orange-500"></div>
                  <span className="text-gray-700 font-medium">Meet</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-red-400 rounded border border-red-500"></div>
                  <span className="text-gray-700 font-medium">Loss</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 border border-red-500 rounded bg-white"></div>
                  <span className="text-gray-700 font-medium">Alert</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Channel Performance Insights Widget */}
        <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="py-2 px-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white">
            <CardTitle className="text-sm font-medium text-white">Channel Performance Insights</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {channels.slice(0, 6).map((channel) => (
                <div
                  key={channel.id}
                  className="p-3 border border-gray-200 rounded hover:shadow-md transition-all duration-200 bg-white hover:border-gray-300 overflow-hidden relative"
                >
                  {/* Gradient accent bar */}
                  <div className={cn("absolute top-0 left-0 right-0 h-0.5", channel.gradientClass)}></div>

                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-gray-900">{channel.name}</h4>
                    <div className="flex items-center gap-1">
                      {channel.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : channel.trend === "down" ? (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      ) : (
                        <div className="h-3 w-3" />
                      )}
                      <span
                        className={cn(
                          "text-[10px] font-semibold",
                          channel.trend === "up"
                            ? "text-green-600"
                            : channel.trend === "down"
                              ? "text-red-600"
                              : "text-gray-600",
                        )}
                      >
                        {channel.trendValue && channel.trendValue > 0 ? "+" : ""}
                        {channel.trendValue}%
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div
                      className={cn(
                        "text-lg font-bold",
                        channel.parityScore >= 70
                          ? "text-green-600"
                          : channel.parityScore >= 50
                            ? "text-orange-600"
                            : "text-red-600",
                      )}
                    >
                      {channel.parityScore}%
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium">Parity Score</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-medium">
                      <span className="text-green-600">Win: {channel.winPercent}%</span>
                      <span className="text-orange-600">Meet: {channel.meetPercent}%</span>
                      <span className="text-red-600">Loss: {channel.lossPercent}%</span>
                    </div>
                    <div className="flex h-2 bg-gray-100 rounded overflow-hidden border border-gray-200">
                      <div className="bg-green-400" style={{ width: `${channel.winPercent}%` }}></div>
                      <div className="bg-orange-400" style={{ width: `${channel.meetPercent}%` }}></div>
                      <div className="bg-red-400" style={{ width: `${channel.lossPercent}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
