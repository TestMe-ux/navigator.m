"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useParityDateContext, useParityChannelContext } from "@/components/parity-filter-bar"
import { useSelectedProperty } from "@/hooks/use-local-storage"
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
  const { startDate, endDate } = useParityDateContext()
  const { selectedChannels, channelFilter } = useParityChannelContext()
  const [selectedProperty] = useSelectedProperty()
  const [parityData, setParityData] = useState<ChannelParityData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [highlightThreshold, setHighlightThreshold] = useState("30")
  const [selectedHotel, setSelectedHotel] = useState("Hotel 2") // Default as per requirement
  const [showDays, setShowDays] = useState(14)
  const [currentPage, setCurrentPage] = useState(0)

  // Generate date range for display (14 days by default)
  const generateDateRange = useCallback(() => {
    if (!startDate || !endDate) return []
    
    const start = new Date(startDate)
    const end = new Date(Math.min(endDate.getTime(), addDays(start, showDays - 1).getTime()))
    
    return eachDayOfInterval({ start, end }).slice(currentPage * showDays, (currentPage + 1) * showDays)
  }, [startDate, endDate, showDays, currentPage])

  const dateRange = generateDateRange()

  // Fetch parity data
  const fetchParityData = useCallback(async () => {
    if (!selectedProperty?.sid || !startDate || !endDate) {
      console.warn('Missing required parameters for parity data fetch')
      return
    }

    setIsLoading(true)
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

      const response = await GetParityData(filtersValue)
      
      if (response.status && response.body) {
        const processedData = processParityDataForCalendar(response.body)
        setParityData(processedData)
      }
    } catch (error) {
      console.error('Failed to fetch parity data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedProperty?.sid, startDate, endDate, channelFilter])

  // Sample data for 10 channels (when no API data is available)
  const generateSampleData = (): ChannelParityData[] => {
    const sampleChannels = [
      { name: "Hotel 2", isHotel: true, winPercent: 45, meetPercent: 35, lossPercent: 20, parityScore: 65 },
      { name: "Booking.com", winPercent: 55, meetPercent: 10, lossPercent: 35, parityScore: 60 },
      { name: "Trivago", winPercent: 50, meetPercent: 25, lossPercent: 25, parityScore: 70 },
      { name: "Google Hotels", winPercent: 45, meetPercent: 35, lossPercent: 20, parityScore: 65 },
      { name: "Expedia", winPercent: 55, meetPercent: 10, lossPercent: 35, parityScore: 60 },
      { name: "Trip Advisor", winPercent: 50, meetPercent: 25, lossPercent: 25, parityScore: 70 },
      { name: "Agoda", winPercent: 40, meetPercent: 30, lossPercent: 30, parityScore: 55 },
      { name: "Hotels.com", winPercent: 35, meetPercent: 25, lossPercent: 40, parityScore: 50 },
      { name: "Priceline", winPercent: 30, meetPercent: 35, lossPercent: 35, parityScore: 45 },
      { name: "Kayak", winPercent: 25, meetPercent: 40, lossPercent: 35, parityScore: 40 }
    ]

    return sampleChannels.map((channel, index) => {
      // Generate sample daily data for each channel
      const dailyData: ParityDayData[] = dateRange.map((date, dayIndex) => {
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
          // Hotel 2 - show percentage scores
          const scores = [67, 25, 45, 29, 55, 45, 26, 26, 55, 26, 77, 72, 67, 87, 55]
          parityScore = scores[dayIndex % scores.length]
          result = parityScore >= 50 ? 'W' : parityScore >= 30 ? 'M' : 'L'
        } else {
          // Other channels - use WLM patterns
          const pattern = patterns[index % patterns.length]
          result = pattern[dayIndex % pattern.length] as 'W' | 'M' | 'L'
          
          // Convert result to score (deterministic for SSR)
          const scoreVariation = (dayIndex + index) % 20; // Deterministic variation
          switch (result) {
            case 'W': parityScore = 70 + scoreVariation; break
            case 'M': parityScore = 40 + scoreVariation; break
            case 'L': parityScore = 15 + scoreVariation; break
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
          violations: (dayIndex + index) % 5 === 0 ? 1 : 0 // Deterministic violations
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
  }

  // Process API data into calendar format
  const processParityDataForCalendar = (apiData: any): ChannelParityData[] => {
    const channels = apiData?.otaViolationChannelRate?.violationChannelRatesCollection || []
    
    // If no API data, return sample data
    if (channels.length === 0) {
      return generateSampleData()
    }
    
    return channels.map((channel: any) => {
      const dailyRates = channel.checkInDateWiseRates || []
      
      // Process daily data
      const dailyData: ParityDayData[] = dateRange.map(date => {
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
          
          return {
            date: dateStr,
            dateFormatted: format(date, 'dd MMM'),
            winCount,
            meetCount,
            lossCount,
            parityScore,
            result,
            violations: (dayData.rateViolation ? 1 : 0) + (dayData.availViolation ? 1 : 0)
          }
        }
        
        // Default data if no API data
        return {
          date: dateStr,
          dateFormatted: format(date, 'dd MMM'),
          winCount: 0,
          meetCount: 0,
          lossCount: 0,
          parityScore: 0,
          result: 'M' as const,
          violations: 0
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

  useEffect(() => {
    fetchParityData()
  }, [fetchParityData])

  const getResultColor = (result: string, score?: number, isHotel?: boolean) => {
    if (isHotel) {
      // Hotel row - show percentage scores with colors
      if (score && score >= 70) return "bg-green-100 text-green-800 border-green-300"
      if (score && score >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-300"
      if (score && score >= 30) return "bg-orange-100 text-orange-800 border-orange-300"
      return "bg-red-100 text-red-800 border-red-300"
    }
    
    // Channel rows - W/M/L with exact colors from reference
    switch (result) {
      case "W":
        return "bg-green-100 text-green-800 border-green-300"
      case "M":
        return "bg-green-100 text-green-800 border-green-300"
      case "L":
        return "bg-red-100 text-red-800 border-red-300"
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

  const totalPages = Math.ceil(Math.max(30, (endDate && startDate) ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0) / showDays)

  return (
    <TooltipProvider>
      <Card className={cn("bg-white border border-gray-200 shadow-sm overflow-hidden", className)}>
        <CardHeader className="py-3 px-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-white">Parity Calendar View</CardTitle>
            <div className="flex items-center gap-3">
              {/* Hotel Selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-white">Hotel:</span>
                <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                  <SelectTrigger className="w-24 h-6 text-xs border-white/30 bg-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hotel 1">Hotel 1</SelectItem>
                    <SelectItem value="Hotel 2">Hotel 2</SelectItem>
                    <SelectItem value="Hotel 3">Hotel 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Highlight Threshold */}
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-200 hover:text-white hover:bg-white/10 px-2 py-1 h-6 text-xs"
                >
                  Change
                </Button>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="h-6 w-6 p-0 text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <span className="text-xs text-white px-2">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="h-6 w-6 p-0 text-white hover:bg-white/10"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading parity data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Header */}
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 w-44">Channels</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 w-36">Win/Meet/Loss</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 w-20">Parity Score</th>
                    {dateRange.map((date, index) => (
                      <th key={index} className="text-center py-2 px-1 text-xs font-semibold text-gray-700 w-12">
                        <div className="text-xs font-bold">{format(date, 'dd')}</div>
                        <div className="text-[10px] text-gray-500">{format(date, 'MMM')}</div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {parityData.map((channel) => (
                    <tr key={channel.channelId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      {/* Channel Name */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            {channel.channelIcon && (
                              <img
                                src={channel.channelIcon}
                                alt={channel.channelName}
                                className="w-4 h-4 rounded"
                              />
                            )}
                            <span className="text-xs font-medium text-gray-900">{channel.channelName}</span>
                          </div>
                          {getTrendIcon(channel.trend)}
                        </div>
                      </td>

                      {/* Win/Meet/Loss Distribution */}
                      <td className="py-2 px-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center h-4 bg-gray-100 rounded overflow-hidden border border-gray-200 cursor-help">
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
                          <TooltipContent>
                            <div className="text-sm">
                              <div className="font-semibold mb-1">{channel.channelName}</div>
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-orange-500 rounded-sm"></div>
                                  <span>Win: {channel.winPercent}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
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

                      {/* Overall Parity Score */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1">
                          <span
                            className={cn(
                              "text-sm font-bold",
                              channel.overallParityScore >= 70
                                ? "text-green-600"
                                : channel.overallParityScore >= 50
                                  ? "text-orange-600"
                                  : "text-red-600",
                            )}
                          >
                            {channel.overallParityScore}%
                          </span>
                        </div>
                      </td>

                      {/* Daily Results */}
                      {channel.dailyData.map((dayData, index) => (
                        <td key={index} className="py-1 px-0.5 text-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "relative w-10 h-6 flex items-center justify-center rounded text-[10px] font-bold border cursor-help transition-all hover:scale-105",
                                  getResultColor(dayData.result, dayData.parityScore, channel.isBrand),
                                  shouldHighlight(dayData.parityScore) && "ring-1 ring-red-500 ring-offset-1",
                                )}
                              >
                                {channel.isBrand ? `${dayData.parityScore}%` : dayData.result}
                                {/* Red dot for highlighted values */}
                                {shouldHighlight(dayData.parityScore) && (
                                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <div className="font-semibold">{channel.channelName}</div>
                                <div>{dayData.dateFormatted}: {dayData.parityScore}%</div>
                                <div className="mt-1">
                                  <div>Win: {dayData.winCount} | Meet: {dayData.meetCount} | Loss: {dayData.lossCount}</div>
                                </div>
                                {shouldHighlight(dayData.parityScore) && (
                                  <div className="text-red-600 font-semibold mt-1">⚠️ Below threshold</div>
                                )}
                                {dayData.violations > 0 && (
                                  <div className="text-orange-600 font-semibold mt-1">
                                    {dayData.violations} violation{dayData.violations > 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Legend */}
          <div className="py-2 px-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-orange-400 rounded border border-orange-500"></div>
                <span className="text-gray-700 font-medium">Win</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-green-400 rounded border border-green-500"></div>
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
    </TooltipProvider>
  )
}
