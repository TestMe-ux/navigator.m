"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Activity, Calendar, DollarSign, Star, Percent, ArrowUp, ArrowDown, Download } from "lucide-react"
import { RateTrendGraph } from "./rate-trend-graph"
import { RateTrendsChart } from "./rate-trends-chart"
import { RateDetailModal } from "./rate-detail-modal"
import { useDateContext } from "@/components/date-context"
import { useState, useEffect, useMemo, useCallback } from "react"

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
  // New fields for the image layout
  subscriberRate: string
  rateDifference: string
  roomType: string
  hasInclusion: boolean
  inclusionIcon: string
  hasEvent: boolean
  eventIcon: string
  isHighest: boolean
  isLowest: boolean
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
  
  if (!reasoning) {
    return currentPrice
  }
  
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
  
  // Ensure we start from Monday of the week containing the start date
  const dayOfWeek = calendarStartDate.getDay()
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert Sunday=0 to Monday=0
  calendarStartDate.setDate(calendarStartDate.getDate() - daysToMonday)
  
  // Show exactly the number of weeks needed
  const maxWeeks = Math.max(totalWeeks, 2) // Show at least 2 weeks for the image layout
  
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
        dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][currentDate.getDay()],
        // New fields for the image layout
        subscriberRate: `€${Math.floor(Math.random() * 100 + 50)}`,
        rateDifference: `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 80 + 20)}`,
        roomType: "STD",
        hasInclusion: true,
        inclusionIcon: "☕",
        hasEvent: Math.random() > 0.6,
        eventIcon: "⭐",
        isHighest: Math.random() > 0.7,
        isLowest: Math.random() > 0.8,
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
        dayData.hasEvent = true
        dayData.eventIcon = "🎬"
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

// Helper function to get month name
const getMonthName = (month: number): string => {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  return monthNames[month] || ''
}

interface RateTrendCalendarProps {
  currentView: "calendar" | "chart" | "table"
  onDateSelect?: (date: Date) => void
  highlightToday?: boolean
  showWeekNumbers?: boolean
}

export function RateTrendCalendar({ 
  currentView, 
  onDateSelect,
  highlightToday = true,
  showWeekNumbers = false 
}: RateTrendCalendarProps) {
  const { startDate, endDate, isLoading } = useDateContext()
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null)
  
  // Generate calendar data based on selected date range
  const calendarData = useMemo(() => {
    if (!startDate || !endDate) {
      const defaultStart = new Date()
      const defaultEnd = new Date()
      defaultEnd.setDate(defaultStart.getDate() + 7) // Default to next 7 days
      return generateCalendarData(defaultStart, defaultEnd)
    }
    return generateCalendarData(startDate, endDate)
  }, [startDate, endDate])
  
  const allDays = useMemo(() => {
    return calendarData.flat()
  }, [calendarData])

  const handleDateClick = useCallback((dayData: CalendarDay) => {
    const selectedDate = new Date(dayData.year, dayData.month, dayData.date)
    setSelectedDateForModal(selectedDate)
    setIsModalOpen(true)
    
    // Call optional onDateSelect callback
    if (onDateSelect) {
      onDateSelect(selectedDate)
  }
  }, [onDateSelect])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedDateForModal(null)
  }, [])

  const findDayIndex = (date: Date | null): number => {
    if (!date) return -1
    return allDays.findIndex(
      (d) => d.year === date.getFullYear() && d.month === date.getMonth() && d.date === date.getDate(),
    )
  }

  const navigateDay = useCallback((direction: "prev" | "next") => {
    if (!selectedDateForModal) return
    const currentIndex = findDayIndex(selectedDateForModal)
    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1

    if (newIndex >= 0 && newIndex < allDays.length) {
      const newDayData = allDays[newIndex]
      setSelectedDateForModal(new Date(newDayData.year, newDayData.month, newDayData.date))
    }
  }, [selectedDateForModal, allDays, findDayIndex])

  const nextWeek = () => {
    setCurrentWeekIndex((prev) => Math.min(prev + 1, calendarData.length - 1))
  }

  const prevWeek = () => {
    setCurrentWeekIndex((prev) => Math.max(prev - 1, 0))
  }

  // Navigate to today's week
  const goToToday = () => {
    const today = new Date()
    const todayIndex = allDays.findIndex(day => 
      day.year === today.getFullYear() && 
      day.month === today.getMonth() && 
      day.date === today.getDate()
    )
    
    if (todayIndex !== -1) {
      const weekIndex = Math.floor(todayIndex / 7)
      setCurrentWeekIndex(weekIndex)
    }
  }

  // Helper to check if a day is today
  const isToday = (day: CalendarDay) => {
    if (!highlightToday) return false
    const today = new Date()
    return day.year === today.getFullYear() && 
           day.month === today.getMonth() && 
           day.date === today.getDate()
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
        confidence: day.reasoning?.confidence || undefined
      }
    })
  }, [calendarData])

  if (currentView === "chart") {
    return <RateTrendsChart rateData={{}} />
  }

  if (currentView === "table") {
    const handleExportCSV = () => {
      const csvHeaders = ['Date', 'Day', 'Current Rate', 'AI Recommended', 'Change %', 'Strategy', 'Confidence', 'Market Trends', 'Events']
      const csvData = tableData.map(row => [
        row.date,
        row.dayName,
        row.currentPrice,
        row.recommendedPrice,
        row.priceChange !== 0 ? `${row.priceChange.toFixed(1)}%` : '-',
        row.reasoning?.strategy || 'Historical',
        row.confidence || '-',
        row.comparison,
        row.hasFlag ? row.flagCountry : (row.eventInfluence ? 'Event' : '-')
      ])
      
      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `rate-trends-table-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      window.URL.revokeObjectURL(url)
    }

    return (
      <div className="w-full">
        {/* Table Filter Bar - Copy from calendar view */}
        <div className="mb-6 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Left Section - Table Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            <div>
                <h3 className="text-xl font-bold text-foreground">Rate Trends Data Table</h3>
              <p className="text-sm text-muted-foreground">
                  Comprehensive rate analysis with AI recommendations
              </p>
            </div>
            </div>
            
            {/* Right Section - Filter Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Quick Stats */}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700 font-medium">
                  <Star className="w-3 h-3 mr-1" />
                {tableData.filter(row => row.isFuture && row.recommendedPrice !== 'N/A').length} AI Recommendations
              </Badge>
                <Badge variant="outline" className="font-medium">
                  <Calendar className="w-3 h-3 mr-1" />
                {tableData.length} Total Days
              </Badge>
              </div>
              
              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportCSV}>
                    <Download className="w-4 h-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Enhanced Table Container */}
        <div className="bg-gradient-to-br from-card to-card/50 shadow-xl border border-border/50 rounded-lg overflow-hidden">
          {/* Table Content with proper overflow handling */}
        <div className="overflow-x-auto">
            <table className="w-full min-w-full table-fixed">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
              <tr>
                  <th className="w-32 px-4 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                  Date
                    </div>
                </th>
                  <th className="w-24 px-4 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Day
                </th>
                  <th className="w-32 px-4 py-4 text-right text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <div className="flex items-center justify-end gap-2">
                      <DollarSign className="w-4 h-4" />
                  Current Rate
                    </div>
                </th>
                  <th className="w-32 px-4 py-4 text-right text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <div className="flex items-center justify-end gap-2">
                      <TrendingUp className="w-4 h-4" />
                  AI Recommended
                    </div>
                </th>
                  <th className="w-24 px-4 py-4 text-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-2">
                      <Percent className="w-4 h-4" />
                      Change
                    </div>
                </th>
                  <th className="w-48 px-4 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                  Strategy
                    </div>
                </th>
                  <th className="w-24 px-4 py-4 text-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Confidence
                </th>
                  <th className="w-28 px-4 py-4 text-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Market Trends
                </th>
                  <th className="w-24 px-4 py-4 text-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Events
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                {tableData.map((row, index) => (
                <tr 
                  key={row.id} 
                    className={`group hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 ${
                      row.isFuture 
                        ? 'bg-gradient-to-r from-emerald-50/30 to-teal-50/20 dark:from-emerald-950/20 dark:to-teal-950/10 border-l-4 border-emerald-500' 
                        : index % 2 === 0 
                        ? 'bg-slate-25 dark:bg-slate-900/50' 
                        : 'bg-white dark:bg-slate-900'
                  }`}
                >
                  {/* Date */}
                    <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-foreground">{row.date}</div>
                      {row.isFuture && (
                          <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700">
                          Future
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Day */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`text-sm font-semibold ${
                          row.isWeekend ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {row.dayName}
                      </span>
                      {row.isWeekend && (
                          <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700">
                          Weekend
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Current Rate */}
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 inline-block">
                    <span className="text-sm font-bold text-foreground">{row.currentPrice}</span>
                      </div>
                  </td>

                  {/* AI Recommended */}
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                    {row.recommendedPrice !== 'N/A' ? (
                        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg px-3 py-2 inline-block border border-emerald-200 dark:border-emerald-700">
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                          {row.recommendedPrice}
                        </span>
                      </div>
                    ) : (
                        <span className="text-sm text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 inline-block">N/A</span>
                    )}
                  </td>

                  {/* Change % */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                    {row.priceChange !== 0 ? (
                        <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold shadow-sm ${
                        row.priceChange > 0 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700'
                          : row.priceChange < 0 
                            ? 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
                            : 'bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600'
                      }`}>
                          {row.priceChange > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                          {Math.abs(row.priceChange).toFixed(1)}%
                      </div>
                    ) : (
                        <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1 inline-block">-</span>
                    )}
                  </td>

                  {/* Strategy */}
                    <td className="px-4 py-4">
                    {row.reasoning ? (
                        <div className="max-w-xs space-y-1">
                          <div className="text-xs font-semibold text-foreground bg-slate-100 dark:bg-slate-800 rounded-md px-2 py-1 inline-block">
                          {row.reasoning.strategy}
                        </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                            {row.reasoning.factors.slice(0, 2).join(' • ')}
                        </div>
                      </div>
                    ) : (
                        <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1 inline-block">Historical Data</span>
                    )}
                  </td>

                  {/* Confidence */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                    {row.confidence ? (
                        <div className="flex items-center justify-center gap-1">
                          <div className={`w-2 h-2 rounded-full shadow-sm ${
                            row.confidence === 'high' ? 'bg-green-500 shadow-green-200' : 
                            row.confidence === 'medium' ? 'bg-yellow-500 shadow-yellow-200' : 'bg-red-500 shadow-red-200'
                        }`} />
                          <span className={`text-xs font-semibold ${
                          row.confidence === 'high' ? 'text-green-700 dark:text-green-400' : 
                          row.confidence === 'medium' ? 'text-yellow-700 dark:text-yellow-400' : 'text-red-700 dark:text-red-400'
                        }`}>
                            {row.confidence.charAt(0).toUpperCase() + row.confidence.slice(1)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>

                  {/* Market Trends */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1 inline-block">
                      {row.comparison}
                    </div>
                  </td>

                  {/* Events */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      {row.hasFlag && row.flagCountry && (
                        <span className="text-lg">{row.flagCountry}</span>
                      )}
                      {row.eventInfluence && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                                <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700 shadow-sm">
                                  <Activity className="w-3 h-3 mr-1" />
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

          {/* Enhanced Table Footer with Detailed Summary */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50/50 to-blue-50/30 dark:from-slate-800/50 dark:to-slate-700/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Days</div>
            </div>
                <div className="text-2xl font-bold text-foreground">{tableData.length}</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-emerald-200 dark:border-emerald-700">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Future Days</div>
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {tableData.filter(row => row.isFuture).length}
              </div>
            </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">AI Recommendations</div>
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {tableData.filter(row => row.recommendedPrice !== 'N/A').length}
              </div>
            </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-red-200 dark:border-red-700">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <div className="text-sm font-semibold text-red-600 dark:text-red-400">Weekend Days</div>
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {tableData.filter(row => row.isWeekend).length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Enhanced Tooltip component with Today's New Logic for pricing reasoning
  const PricingTooltip = ({ day, children }: { day: CalendarDay, children: React.ReactNode }) => {
    // Call Today's New Logic for rate trend calendar
    const callTodaysNewLogic = () => {
      const today = new Date()
      const dayDate = new Date(day.year, day.month, day.date)
      
      // Normalize dates for accurate comparison
      const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const dayDateNormalized = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate())
      
      const isToday = todayNormalized.getTime() === dayDateNormalized.getTime()
      const isPast = dayDateNormalized < todayNormalized
      const isFuture = dayDateNormalized > todayNormalized
      
      return {
        isToday,
        isPast,
        isFuture,
        daysDifference: Math.ceil((dayDateNormalized.getTime() - todayNormalized.getTime()) / (1000 * 60 * 60 * 24))
      }
    }

    const { isToday, isPast, isFuture } = callTodaysNewLogic()
    
    // Show tooltips for all days but with different styling based on today's logic
    const hasReasoningToShow = day.isFuture && day.reasoning
    const shouldShowTooltip = hasReasoningToShow || isToday || isPast

    if (!shouldShowTooltip) {
      return <>{children}</>
    }

    // Enhanced tooltip positioning based on today's logic
    const getTooltipSide = () => {
      if (isToday) return "bottom" // Today gets bottom positioning for better visibility
      return "top" // Standard top positioning for other days
    }

    // Enhanced background styling for today
    const getTooltipBgClasses = () => {
      if (isToday) {
        return "max-w-sm p-4 bg-gradient-to-br from-blue-900 to-slate-900 text-white border-2 border-blue-400"
      }
      return "max-w-sm p-4 bg-slate-900 text-white"
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {children}
          </TooltipTrigger>
          <TooltipContent side={getTooltipSide()} className={getTooltipBgClasses()}>
            <div className="space-y-3">
              {/* Today's Special Header */}
              {isToday && (
                <div className="flex items-center gap-2 text-blue-300 bg-blue-800/30 px-2 py-1 rounded mb-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold">TODAY'S RATE</span>
                </div>
              )}
              
              {/* Current Price Information */}
              <div className={`flex items-center gap-2 ${isToday ? 'text-blue-200' : ''}`}>
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold text-sm">Current: {day.currentPrice}</span>
              </div>
              
              {/* Future Reasoning (if available) */}
              {hasReasoningToShow && (
                <>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      day.reasoning!.confidence === 'high' ? 'bg-green-400' : 
                      day.reasoning!.confidence === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <span className="font-semibold text-sm">{day.reasoning!.strategy}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-300">Key Factors:</p>
                    <ul className="text-xs space-y-0.5">
                      {day.reasoning!.factors.map((factor, index) => (
                        <li key={index} className="text-slate-200">• {factor}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                    <span className="text-xs font-medium text-slate-300">Expected Impact:</span>
                    <span className="text-xs font-bold text-green-400">{day.reasoning!.impact}</span>
                  </div>
                  
                  {day.reasoning!.eventInfluence && (
                    <div className="flex items-center gap-1 text-xs text-purple-300">
                      <Activity className="w-3 h-3" />
                      <span>{day.reasoning!.eventInfluence}</span>
                    </div>
                  )}
                </>
              )}
              
              {/* Past/Today Context */}
              {(isToday || isPast) && !hasReasoningToShow && (
                <div className="text-xs text-gray-300">
                  {isToday && (
                    <div className="text-blue-200">📍 Current active rate</div>
                  )}
                  {isPast && (
                    <div className="text-gray-400">🕒 Historical rate</div>
                  )}
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
              <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                Week {currentWeekIndex + 1} of {calendarData.length}
              </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={goToToday}
                  className="text-xs px-2 py-1 h-6"
                >
                  Today
                </Button>
              </div>
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
                    className={`p-3 cursor-pointer hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      isToday(day) ? 'ring-2 ring-blue-400 bg-gradient-to-br from-blue-50/40 to-sky-50/30 dark:ring-blue-500 dark:from-blue-950/40 dark:to-sky-950/30' :
                      day.isFuture ? 'ring-2 ring-emerald-200 dark:ring-emerald-800 bg-gradient-to-br from-emerald-50/30 to-teal-50/20 dark:from-emerald-950/30 dark:to-teal-950/20' : 
                      'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`} 
                    onClick={() => handleDateClick(day)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Rate information for ${weekDays[dayIndex % 7]} ${day.date}, ${day.currentPrice}${day.isFuture && day.recommendedPrice ? `, AI recommended: ${day.recommendedPrice}` : ''}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleDateClick(day)
                      }
                    }}
                  >
                  <div className="space-y-2">
                    {/* Top Row: Subscriber Rate and Date */}
                    <div className="flex items-center justify-between">
                      <div className="text-base font-bold text-gray-800 dark:text-gray-200">
                        {day.subscriberRate}
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {day.date}
                      </div>
                    </div>

                    {/* Second Row: Rate Difference and Event Icon */}
                    <div className="flex items-center justify-between">
                      <div className={`text-xs font-medium ${
                        day.rateDifference.startsWith('+') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                      }`}>
                        {day.rateDifference}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {day.hasEvent ? `[${day.eventIcon}]` : ''}
                      </div>
                    </div>

                    {/* Third Row: Room Type, Inclusion Icon, and Color Indication */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {day.roomType}
                        </span>
                        {day.hasInclusion && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {day.inclusionIcon}
                          </span>
                        )}
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        day.isHighest ? 'bg-red-500' : day.isLowest ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                  </div>
                </Card>
                </PricingTooltip>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop View - Full Calendar Grid */}
        <div className="hidden lg:block p-6">
          {/* Date Range Header with Navigation */}
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>
                  Showing: {startDate?.toLocaleDateString() || 'N/A'} - {endDate?.toLocaleDateString() || 'N/A'}
              </span>

              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToToday}
                className="text-xs"
              >
                Go to Today
              </Button>
            </div>
          </div>
          
          {/* Header */}
          <div className={`grid ${showWeekNumbers ? 'grid-cols-8' : 'grid-cols-7'} gap-4 mb-4`}>
            {showWeekNumbers && (
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300 text-center">
                Week
              </div>
            )}
            {weekDays.map((day) => (
              <div key={day} className="text-sm font-medium text-gray-600 dark:text-gray-300 text-center">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="space-y-4">
            {calendarData.map((week, weekIndex) => (
              <div key={weekIndex} className={`grid ${showWeekNumbers ? 'grid-cols-8' : 'grid-cols-7'} gap-4`}>
                {showWeekNumbers && (
                  <div className="flex items-center justify-center">
                    <div className="text-xs font-medium text-slate-500 dark:text-gray-300 text-center">
                      {/* Date Range Header */}
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        {week[0]?.date} {getMonthName(week[0]?.month)} - {week[6]?.date} {getMonthName(week[6]?.month)}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 underline cursor-pointer">
                        Show Comp. Rates
                      </div>
                    </div>
                  </div>
                )}
                {week.map((day, dayIndex) => (
                  <PricingTooltip key={`desktop-${weekIndex}-${dayIndex}`} day={day}>
                  <Card
                      className={`p-3 hover:shadow-lg transition-all duration-200 relative cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                        isToday(day) ? 'ring-2 ring-blue-400 bg-gradient-to-br from-blue-50/40 to-sky-50/30 dark:ring-blue-500 dark:from-blue-950/40 dark:to-sky-950/30' :
                        day.isFuture ? 'ring-2 ring-emerald-200 dark:ring-emerald-800 bg-gradient-to-br from-emerald-50/30 to-teal-50/20 dark:from-emerald-950/30 dark:to-teal-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    onClick={() => handleDateClick(day)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Rate information for ${day.date}, ${day.subscriberRate}${day.isFuture && day.recommendedPrice ? `, AI recommended: ${day.recommendedPrice}` : ''}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleDateClick(day)
                      }
                    }}
                  >
                      <div className="space-y-2">
                        {/* Top Row: Subscriber Rate and Date */}
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                            {day.subscriberRate}
                          </div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {day.date}
                          </div>
                        </div>

                        {/* Second Row: Rate Difference and Event Icon */}
                        <div className="flex items-center justify-between">
                          <div className={`text-sm font-medium ${
                            day.rateDifference.startsWith('+') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                          }`}>
                            {day.rateDifference}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {day.hasEvent ? `[${day.eventIcon}]` : ''}
                          </div>
                        </div>

                        {/* Third Row: Room Type, Inclusion Icon, and Color Indication */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                              {day.roomType}
                            </span>
                            {day.hasInclusion && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {day.inclusionIcon}
                              </span>
                            )}
                          </div>
                          <div className={`w-3 h-3 rounded-full ${
                            day.isHighest ? 'bg-red-500' : day.isLowest ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
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
