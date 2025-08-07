"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Activity, Calendar, DollarSign } from "lucide-react"
import { RateTrendGraph } from "./rate-trend-graph"
import { RateDetailModal } from "./rate-detail-modal"
import { useDateContext } from "@/components/date-context"
import { useState, useEffect, useMemo } from "react"

interface CalendarDay {
  date: number
  month: number // 0-indexed (0 for Jan, 11 for Dec)
  year: number
  currentPrice: string
  recommendedPrice?: string
  comparison: string
  hasFlag?: boolean
  flagCountry?: string
  hasIndicator?: boolean
  indicatorType?: "circle" | "square"
  indicatorColor?: string
  isFuture?: boolean
  dayOfWeek?: string
  reasoning?: {
    strategy: string
    factors: string[]
    confidence: 'high' | 'medium' | 'low'
    impact: string
    eventInfluence?: string
  }
}

// Enhanced pricing recommendation logic
const getPricingRecommendation = (date: number, month: number, year: number): CalendarDay['reasoning'] => {
  const dateObj = new Date(year, month, date)
  const dayOfWeek = dateObj.getDay() // 0 = Sunday, 6 = Saturday
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayName = dayNames[dayOfWeek]
  
  // Dubai weekend is Friday-Saturday
  const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 // Friday or Saturday
  const isThursday = dayOfWeek === 4
  const isSunday = dayOfWeek === 0
  
  // Event detection (simplified for demo)
  const hasEvent = (month === 5 && date >= 18 && date <= 25) // Dubai International Film Festival
  const hasUSHoliday = (month === 6 && date === 4) // July 4th
  
  if (hasEvent) {
    return {
      strategy: 'Event Premium Pricing',
      factors: [
        'Dubai International Film Festival (June 18-25)',
        'International attendee demand surge (+35%)',
        'Limited city inventory during event',
        'Corporate expense account bookings'
      ],
      confidence: 'high',
      impact: '+45-50% vs baseline',
      eventInfluence: 'Dubai International Film Festival'
    }
  }
  
  if (hasUSHoliday) {
    return {
      strategy: 'US Market Holiday Premium',
      factors: [
        'US Independence Day weekend',
        'US market represents 35% of demand',
        'Long weekend booking patterns (4 days)',
        'Premium positioning vs regional competitors'
      ],
      confidence: 'high',
      impact: '+35% vs baseline'
    }
  }
  
  if (isWeekend) {
    return {
      strategy: 'Weekend Leisure Premium',
      factors: [
        'Fri-Sat Dubai weekend pattern',
        'Leisure traveler focus',
        'Resort amenities emphasis',
        'Family and couples segments'
      ],
      confidence: 'high',
      impact: '+40-60% vs weekday'
    }
  }
  
  if (isThursday) {
    return {
      strategy: 'Weekend Transition Pricing',
      factors: [
        'Bridge between business and leisure',
        'Extended business stays',
        'Early weekend arrivals',
        'Premium positioning preparation'
      ],
      confidence: 'medium',
      impact: '+15-25% vs baseline'
    }
  }
  
  if (isSunday) {
    return {
      strategy: 'Week Start Optimization',
      factors: [
        'Lowest demand day traditionally',
        'Corporate arrival optimization',
        'Promotional rate opportunities',
        'Loyalty program focus'
      ],
      confidence: 'medium',
      impact: '-5 to +10% vs baseline'
    }
  }
  
  // Weekdays (Mon-Wed)
  return {
    strategy: 'Business Focus Pricing',
    factors: [
      'Peak corporate demand period',
      'Business meeting optimization',
      'Corporate account targeting',
      'Meeting facilities premium'
    ],
    confidence: 'high',
    impact: 'Baseline to +20%'
  }
}

// Generate recommended price based on current price and strategy
const getRecommendedPrice = (currentPrice: string, reasoning: CalendarDay['reasoning']): string => {
  const basePrice = parseInt(currentPrice.replace('$', '').replace(',', ''))
  let multiplier = 1.0
  
  switch (reasoning.strategy) {
    case 'Event Premium Pricing':
      multiplier = 1.47 // +47% for events
      break
    case 'US Market Holiday Premium':
      multiplier = 1.35 // +35% for US holidays
      break
    case 'Weekend Leisure Premium':
      multiplier = 1.50 // +50% for weekends
      break
    case 'Weekend Transition Pricing':
      multiplier = 1.20 // +20% for Thursday
      break
    case 'Week Start Optimization':
      multiplier = 0.95 // -5% for Sunday
      break
    case 'Business Focus Pricing':
      multiplier = 1.10 // +10% for business days
      break
    default:
      multiplier = 1.0
  }
  
  const recommendedPrice = Math.round(basePrice * multiplier)
  return `$${recommendedPrice.toLocaleString()}`
}

// Enhanced calendar data with future dates and recommendations
const generateCalendarData = (startDateRange: Date, endDateRange: Date): CalendarDay[][] => {
  const today = new Date()
  // Set today to current date for proper comparison
  today.setHours(0, 0, 0, 0)
  
  const weeks: CalendarDay[][] = []
  
  // Calculate the total date range based on filter selection
  const totalDays = Math.ceil((endDateRange.getTime() - startDateRange.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const totalWeeks = Math.ceil(totalDays / 7)
  
  // Start from the selected start date
  const calendarStartDate = new Date(startDateRange)
  calendarStartDate.setHours(0, 0, 0, 0)
  
  // Extend to show some future dates for recommendations
  const maxWeeks = Math.max(totalWeeks, 6) // Show at least 6 weeks
  
  for (let weekIndex = 0; weekIndex < maxWeeks; weekIndex++) {
    const week: CalendarDay[] = []
    
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const currentDate = new Date(calendarStartDate)
      currentDate.setDate(calendarStartDate.getDate() + (weekIndex * 7) + dayIndex)
      
      const date = currentDate.getDate()
      const month = currentDate.getMonth()
      const year = currentDate.getFullYear()
      
      // Proper future date detection - only dates after today
      const dayWithoutTime = new Date(year, month, date)
      const isFuture = dayWithoutTime > today
      
      // Check if this date is within the selected range
      const isInSelectedRange = dayWithoutTime >= startDateRange && dayWithoutTime <= endDateRange
      
      // Base current prices (simulated current RM rates)
      const basePrices = ['$680', '$750', '$810', '$920', '$1100', '$1350', '$1500']
      const priceIndex = (date + month + year) % basePrices.length // More consistent pricing
      const currentPrice = basePrices[priceIndex]
      
      let dayData: CalendarDay = {
        date,
        month,
        year,
        currentPrice,
        comparison: `${Math.random() > 0.5 ? '-' : '+'}${Math.floor(Math.random() * 30 + 40)}% vs. Comp`,
        isFuture,
        dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][currentDate.getDay()]
      }
      
      // Add recommendations ONLY for actual future dates
      if (isFuture) {
        const reasoning = getPricingRecommendation(date, month, year)
        const recommendedPrice = getRecommendedPrice(currentPrice, reasoning)
        
        dayData.recommendedPrice = recommendedPrice
        dayData.reasoning = reasoning
      }
      
      // Add special indicators and events
      if (month === 5 && date >= 18 && date <= 25) { // Dubai Film Festival
        dayData.hasIndicator = true
        dayData.indicatorType = "circle"
        dayData.indicatorColor = "bg-purple-500"
      }
      
      if (currentDate.getDay() === 5 || currentDate.getDay() === 6) { // Weekend
        dayData.hasIndicator = true
        dayData.indicatorType = "square"
        dayData.indicatorColor = "bg-red-400"
      }
      
      // Add country flags for holidays
      if (month === 5 && date === 5) dayData.hasFlag = true, dayData.flagCountry = "🇨🇦"
      if (month === 6 && date === 4) dayData.hasFlag = true, dayData.flagCountry = "🇺🇸"
      
      week.push(dayData)
    }
    
    weeks.push(week)
  }
  
  return weeks
}

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

interface RateTrendCalendarProps {
  currentView: "calendar" | "chart" | "table"
}

export function RateTrendCalendar({ currentView }: RateTrendCalendarProps) {
  const { startDate, endDate, isLoading } = useDateContext()
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null)
  
  // Generate calendar data based on selected date range
  const calendarData = useMemo(() => {
    return generateCalendarData(startDate, endDate)
  }, [startDate, endDate])
  
  const allDays = useMemo(() => {
    return calendarData.flat()
  }, [calendarData])

  const handleDateClick = (dayData: CalendarDay) => {
    setSelectedDateForModal(new Date(dayData.year, dayData.month, dayData.date))
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedDateForModal(null)
  }

  const findDayIndex = (date: Date | null): number => {
    if (!date) return -1
    return allDays.findIndex(
      (d) => d.year === date.getFullYear() && d.month === date.getMonth() && d.date === date.getDate(),
    )
  }

  const navigateDay = (direction: "prev" | "next") => {
    if (!selectedDateForModal) return
    const currentIndex = findDayIndex(selectedDateForModal)
    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1

    if (newIndex >= 0 && newIndex < allDays.length) {
      const newDayData = allDays[newIndex]
      setSelectedDateForModal(new Date(newDayData.year, newDayData.month, newDayData.date))
    }
  }

  const nextWeek = () => {
    setCurrentWeekIndex((prev) => Math.min(prev + 1, calendarData.length - 1))
  }

  const prevWeek = () => {
    setCurrentWeekIndex((prev) => Math.max(prev - 1, 0))
  }

  // Generate table data from calendar data (always compute, regardless of view)
  const tableData = useMemo(() => {
    return calendarData.flat().map((day, index) => {
      const date = new Date(day.year, day.month, day.date)
      const dayName = weekDays[date.getDay()]
      
      // Calculate change percentages
      const currentPrice = parseInt(day.currentPrice.replace('$', '').replace(',', ''))
      const recommendedPrice = day.recommendedPrice ? parseInt(day.recommendedPrice.replace('$', '').replace(',', '')) : null
      const priceChange = recommendedPrice ? ((recommendedPrice - currentPrice) / currentPrice * 100) : 0
      
      return {
        id: index,
        date: date.toLocaleDateString(),
        dayName,
        dayOfWeek: date.getDay(),
        currentPrice: day.currentPrice,
        recommendedPrice: day.recommendedPrice || 'N/A',
        priceChange: priceChange,
        comparison: day.comparison,
        isFuture: day.isFuture,
        hasFlag: day.hasFlag,
        flagCountry: day.flagCountry,
        reasoning: day.reasoning,
        isWeekend: date.getDay() === 5 || date.getDay() === 6, // Friday or Saturday in Dubai
        eventInfluence: day.reasoning?.eventInfluence,
        confidence: day.reasoning?.confidence
      }
    })
  }, [calendarData])

  if (currentView === "chart") {
    return <RateTrendGraph />
  }

  if (currentView === "table") {

    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm">
        {/* Table Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Rate Trends Data Table</h3>
              <p className="text-sm text-muted-foreground">
                Detailed view with current rates, AI recommendations, and pricing strategies
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                {tableData.filter(row => row.isFuture && row.recommendedPrice !== 'N/A').length} AI Recommendations
              </Badge>
              <Badge variant="outline">
                {tableData.length} Total Days
              </Badge>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Current Rate
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  AI Recommended
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Change %
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Strategy
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Market Trends
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Events
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
              {tableData.map((row) => (
                <tr 
                  key={row.id} 
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    row.isFuture ? 'bg-gradient-to-r from-emerald-50/20 to-teal-50/10 dark:from-emerald-950/20 dark:to-teal-950/10' : ''
                  }`}
                >
                  {/* Date */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{row.date}</span>
                      {row.isFuture && (
                        <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                          Future
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Day */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        row.isWeekend ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {row.dayName}
                      </span>
                      {row.isWeekend && (
                        <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 border-red-200">
                          Weekend
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Current Rate */}
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <span className="text-sm font-bold text-foreground">{row.currentPrice}</span>
                  </td>

                  {/* AI Recommended */}
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    {row.recommendedPrice !== 'N/A' ? (
                      <div className="text-right">
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                          {row.recommendedPrice}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">N/A</span>
                    )}
                  </td>

                  {/* Change % */}
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {row.priceChange !== 0 ? (
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        row.priceChange > 0 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : row.priceChange < 0 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {row.priceChange > 0 ? '+' : ''}{row.priceChange.toFixed(1)}%
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>

                  {/* Strategy */}
                  <td className="px-4 py-3">
                    {row.reasoning ? (
                      <div className="max-w-xs">
                        <div className="text-xs font-medium text-foreground mb-1">
                          {row.reasoning.strategy}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {row.reasoning.factors.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Historical</span>
                    )}
                  </td>

                  {/* Confidence */}
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {row.confidence ? (
                      <div className="flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${
                          row.confidence === 'high' ? 'bg-green-500' : 
                          row.confidence === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className={`ml-1 text-xs font-medium ${
                          row.confidence === 'high' ? 'text-green-700 dark:text-green-400' : 
                          row.confidence === 'medium' ? 'text-yellow-700 dark:text-yellow-400' : 'text-red-700 dark:text-red-400'
                        }`}>
                          {row.confidence}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>

                  {/* Market Trends */}
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {row.comparison}
                    </div>
                  </td>

                  {/* Events */}
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      {row.hasFlag && row.flagCountry && (
                        <span className="text-lg">{row.flagCountry}</span>
                      )}
                      {row.eventInfluence && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                Event
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">{row.eventInfluence}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {!row.hasFlag && !row.eventInfluence && (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Days</div>
              <div className="text-lg font-bold text-foreground">{tableData.length}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Future Days</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {tableData.filter(row => row.isFuture).length}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">AI Recommendations</div>
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {tableData.filter(row => row.recommendedPrice !== 'N/A').length}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Weekend Days</div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {tableData.filter(row => row.isWeekend).length}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === "table") {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm">
        {/* Table Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Rate Trends Data Table</h3>
              <p className="text-sm text-muted-foreground">
                Detailed view with current rates, AI recommendations, and pricing strategies
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                {tableData.filter(row => row.isFuture && row.recommendedPrice !== 'N/A').length} AI Recommendations
              </Badge>
              <Badge variant="outline">
                {tableData.length} Total Days
              </Badge>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Current Rate
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  AI Recommended
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Change %
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Strategy
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Market Trends
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Events
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
              {tableData.map((row) => (
                <tr 
                  key={row.id} 
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    row.isFuture ? 'bg-gradient-to-r from-emerald-50/20 to-teal-50/10 dark:from-emerald-950/20 dark:to-teal-950/10' : ''
                  }`}
                >
                  {/* Date */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{row.date}</span>
                      {row.isFuture && (
                        <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                          Future
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Day */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        row.isWeekend ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {row.dayName}
                      </span>
                      {row.isWeekend && (
                        <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 border-red-200">
                          Weekend
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Current Rate */}
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <span className="text-sm font-bold text-foreground">{row.currentPrice}</span>
                  </td>

                  {/* AI Recommended */}
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    {row.recommendedPrice !== 'N/A' ? (
                      <div className="text-right">
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                          {row.recommendedPrice}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">N/A</span>
                    )}
                  </td>

                  {/* Change % */}
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {row.priceChange !== 0 ? (
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        row.priceChange > 0 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : row.priceChange < 0 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {row.priceChange > 0 ? '+' : ''}{row.priceChange.toFixed(1)}%
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>

                  {/* Strategy */}
                  <td className="px-4 py-3">
                    {row.reasoning ? (
                      <div className="max-w-xs">
                        <div className="text-xs font-medium text-foreground mb-1">
                          {row.reasoning.strategy}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {row.reasoning.factors.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Historical</span>
                    )}
                  </td>

                  {/* Confidence */}
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {row.confidence ? (
                      <div className="flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${
                          row.confidence === 'high' ? 'bg-green-500' : 
                          row.confidence === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className={`ml-1 text-xs font-medium ${
                          row.confidence === 'high' ? 'text-green-700 dark:text-green-400' : 
                          row.confidence === 'medium' ? 'text-yellow-700 dark:text-yellow-400' : 'text-red-700 dark:text-red-400'
                        }`}>
                          {row.confidence}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>

                  {/* Market Trends */}
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {row.comparison}
                    </div>
                  </td>

                  {/* Events */}
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      {row.hasFlag && row.flagCountry && (
                        <span className="text-lg">{row.flagCountry}</span>
                      )}
                      {row.eventInfluence && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                Event
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">{row.eventInfluence}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {!row.hasFlag && !row.eventInfluence && (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Days</div>
              <div className="text-lg font-bold text-foreground">{tableData.length}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Future Days</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {tableData.filter(row => row.isFuture).length}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">AI Recommendations</div>
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {tableData.filter(row => row.recommendedPrice !== 'N/A').length}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Weekend Days</div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {tableData.filter(row => row.isWeekend).length}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === "chart") {
    return <RateTrendGraph />
  }

  // Tooltip component for pricing reasoning
  const PricingTooltip = ({ day, children }: { day: CalendarDay, children: React.ReactNode }) => {
    if (!day.isFuture || !day.reasoning) {
      return <>{children}</>
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {children}
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-sm p-4 bg-slate-900 text-white">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  day.reasoning.confidence === 'high' ? 'bg-green-400' : 
                  day.reasoning.confidence === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
                }`} />
                <span className="font-semibold text-sm">{day.reasoning.strategy}</span>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-300">Key Factors:</p>
                <ul className="text-xs space-y-0.5">
                  {day.reasoning.factors.map((factor, index) => (
                    <li key={index} className="text-slate-200">• {factor}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                <span className="text-xs font-medium text-slate-300">Expected Impact:</span>
                <span className="text-xs font-bold text-green-400">{day.reasoning.impact}</span>
              </div>
              
              {day.reasoning.eventInfluence && (
                <div className="flex items-center gap-1 text-xs text-purple-300">
                  <Activity className="w-3 h-3" />
                  <span>{day.reasoning.eventInfluence}</span>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Show loading state when date range is changing
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading calendar data...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm">
        {/* Mobile View - Single Week with Navigation */}
        <div className="block lg:hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="sm" onClick={prevWeek} disabled={currentWeekIndex === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                Week {currentWeekIndex + 1} of {calendarData.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={nextWeek}
                disabled={currentWeekIndex === calendarData.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Grid - 2 columns */}
            <div className="grid grid-cols-2 gap-3">
              {calendarData[currentWeekIndex]?.map((day, dayIndex) => (
                                  <PricingTooltip key={`mobile-${dayIndex}`} day={day}>
                  <Card 
                    className={`p-3 cursor-pointer hover:shadow-md transition-all duration-200 ${
                      day.isFuture ? 'ring-2 ring-emerald-200 dark:ring-emerald-800 bg-gradient-to-br from-emerald-50/30 to-teal-50/20 dark:from-emerald-950/30 dark:to-teal-950/20' : 
                      'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`} 
                    onClick={() => handleDateClick(day)}
                  >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {weekDays[dayIndex % 7]} {day.date}
                      </span>
                                                     {day.isFuture && (
                             <Badge variant="secondary" className="text-xs px-1 py-0 bg-emerald-100 text-emerald-700 border-emerald-200">Future</Badge>
                           )}
                        </div>
                        <div className="flex items-center gap-1">
                      {day.hasFlag && <span className="text-lg">{day.flagCountry}</span>}
                      {day.hasIndicator && (
                        <div
                              className={`w-2 h-2 rounded-full ${day.indicatorColor || "bg-gray-400"} ${
                                day.indicatorType === "square" ? "rounded-none" : ""
                              }`}
                        />
                      )}
                    </div>
                      </div>
                      
                      {/* Current Price */}
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-md p-2 text-center">
                        <div className="text-lg font-bold text-gray-800 dark:text-gray-200">{day.currentPrice}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Current Rate</div>
                      </div>
                      
                                             {/* Recommended Price for Future Dates */}
                       {day.isFuture && day.recommendedPrice && (
                         <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-md p-2 text-center border border-emerald-200 dark:border-emerald-800">
                           <div className="flex items-center justify-center gap-1 mb-0.5">
                             <TrendingUp className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                             <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">AI Rec</span>
                           </div>
                           <div className="text-sm font-bold text-emerald-800 dark:text-emerald-200">{day.recommendedPrice}</div>
                           <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${
                             day.reasoning?.confidence === 'high' ? 'bg-green-500' : 
                             day.reasoning?.confidence === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                           }`} />
                         </div>
                       )}
                      
                      <div className="text-xs text-green-700 dark:text-green-400 text-center">{day.comparison}</div>
                  </div>
                </Card>
                </PricingTooltip>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop View - Full Calendar Grid */}
        <div className="hidden lg:block p-6">
          {/* Date Range Header */}
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>
                Showing: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </span>
              {calendarData.some(week => week.some(day => day.isFuture && day.recommendedPrice)) && (
                <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                  AI Recommendations Available
                </Badge>
              )}
            </div>
          </div>
          
          {/* Header */}
          <div className="grid grid-cols-7 gap-4 mb-4">
            {weekDays.map((day) => (
              <div key={day} className="text-sm font-medium text-gray-600 dark:text-gray-300 text-center">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="space-y-4">
            {calendarData.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-4">
                {week.map((day, dayIndex) => (
                  <PricingTooltip key={`desktop-${weekIndex}-${dayIndex}`} day={day}>
                  <Card
                      className={`p-3 hover:shadow-lg transition-all duration-200 relative cursor-pointer ${
                        day.isFuture ? 'ring-2 ring-emerald-200 dark:ring-emerald-800 bg-gradient-to-br from-emerald-50/30 to-teal-50/20 dark:from-emerald-950/30 dark:to-teal-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    onClick={() => handleDateClick(day)}
                  >
                      <div className="space-y-3">
                        {/* Date Header */}
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{day.date}</span>
                                                         {day.isFuture && (
                               <Badge variant="outline" className="text-xs px-1 py-0 bg-emerald-50 text-emerald-700 border-emerald-200">
                                 Future
                               </Badge>
                             )}
                          </div>
                          <div className="flex items-center gap-1">
                        {day.hasFlag && <span className="text-lg">{day.flagCountry}</span>}
                        {day.hasIndicator && (
                          <div
                                className={`w-2 h-2 rounded-full ${day.indicatorColor || "bg-gray-400"} ${
                                  day.indicatorType === "square" ? "rounded-none" : ""
                                }`}
                          />
                        )}
                      </div>
                        </div>

                        {/* Current Price */}
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-md p-3 text-center">
                          <div className="text-lg font-bold text-gray-800 dark:text-gray-200">{day.currentPrice}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Current Rate</div>
                        </div>

                                                 {/* Recommended Price for Future Dates */}
                         {day.isFuture && day.recommendedPrice && (
                           <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-md p-2 text-center border border-emerald-200 dark:border-emerald-800">
                             <div className="flex items-center justify-center gap-1 mb-1">
                               <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                               <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">AI Rec</span>
                             </div>
                             <div className="text-base font-bold text-emerald-800 dark:text-emerald-200">{day.recommendedPrice}</div>
                             <div className="flex items-center justify-center gap-1 mt-1">
                               <div className={`w-2 h-2 rounded-full ${
                                 day.reasoning?.confidence === 'high' ? 'bg-green-500' : 
                                 day.reasoning?.confidence === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                               }`} />
                               <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                 {day.reasoning?.confidence === 'high' ? 'High' : 
                                  day.reasoning?.confidence === 'medium' ? 'Med' : 'Low'}
                               </span>
                             </div>
                           </div>
                         )}

                        {/* Comparison */}
                        <div className="text-xs text-center text-green-700 dark:text-green-400">{day.comparison}</div>
                    </div>
                  </Card>
                  </PricingTooltip>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <RateDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedDate={selectedDateForModal}
        onPrevDay={() => navigateDay("prev")}
        onNextDay={() => navigateDay("next")}
      />
    </>
  )
}
