"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Activity, Calendar, DollarSign, Star, Percent, ArrowUp, ArrowDown, Download, Wifi, Utensils, Coffee, Car, Dumbbell, BarChart3 } from "lucide-react"
import { RateTrendGraph } from "./rate-trend-graph"
import { RTRateTrendsChart } from "./rt-rate-trends-chart"
import { RateDetailModal } from "./rate-detail-modal"
import { useDateContext } from "@/components/date-context"
import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"



interface CalendarDay {
  date: number
  month: number
  year: number
  currentPrice: string
  comparison: string
  isFuture?: boolean
  dayOfWeek?: string
  // New fields for the image layout
  subscriberRate: string
  hotelLowestRate: number
  rateDifference: string
  roomType: string
  hasInclusion: boolean
  inclusionIcon: string
  hasEvent: boolean
  eventIcon: string
  eventCount: number
  isHighest: boolean
  isLowest: boolean
  isMyRateLowest: boolean
  isMyRateHighest: boolean
  showRateDot: boolean

  hasFlag?: boolean
  flagCountry?: string
  hasIndicator?: boolean
  indicatorColor?: string
  indicatorType?: 'circle' | 'square'
}

interface CompetitorRate {
  hotelName: string
  rate: string
  rateValue: number
  difference: string
  isLowest: boolean
  isHighest: boolean
}

interface CompetitorData {
  date: number
  competitors: CompetitorRate[]
  avgCompsetRate: number
  avgCompsetDifference: string
  isMyRateLowest: boolean
  isMyRateHighest: boolean
  showRateDot: boolean
}

// Generate competitor rates data for a week with competitive comparison logic
const generateCompetitorData = (week: CalendarDay[]): CompetitorData[] => {
  const competitors = [
    'Acom Hotel Berlin',
    'Comfort Hotel Central',
    'Hotel Alexander Plaza',
    'Grand Plaza Resort',
    'Marriott Downtown',
    'Hilton City Center',
    'Westin Metropolitan'
  ]
  
  return week.map(day => {
    // Generate competitor rates
    const competitorRates = competitors.map(hotelName => {
      const rateValue = Math.floor(Math.random() * 400 + 100)
      return {
        hotelName,
        rate: `$${rateValue}`,
        rateValue,
        difference: `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 50 + 5)}`,
        isLowest: false,
        isHighest: false
      }
    })

    // Add my hotel rate to comparison
    const allRates = [...competitorRates, {
      hotelName: 'My Hotel',
      rate: `$${day.hotelLowestRate}`,
      rateValue: day.hotelLowestRate,
      difference: day.rateDifference,
      isLowest: false,
      isHighest: false
    }]

    // Find lowest and highest rates
    const lowestRate = Math.min(...allRates.map(r => r.rateValue))
    const highestRate = Math.max(...allRates.map(r => r.rateValue))

    // Mark lowest and highest
    allRates.forEach(rate => {
      rate.isLowest = rate.rateValue === lowestRate
      rate.isHighest = rate.rateValue === highestRate
    })

    // Get my hotel's competitive status (don't mutate original day object)
    const myRate = allRates.find(r => r.hotelName === 'My Hotel')
    const isMyRateLowest = myRate?.isLowest || false
    const isMyRateHighest = myRate?.isHighest || false

    // Calculate average compset rate (excluding my hotel)
    const compsetRates = competitorRates.map(c => c.rateValue)
    const avgRate = Math.round(compsetRates.reduce((sum, rate) => sum + rate, 0) / compsetRates.length)
    const avgDifference = Math.random() > 0.5 ? '+' : '-'
    const avgDiffValue = Math.floor(Math.random() * 40 + 10)

    // Mark competitors as lowest/highest
    competitorRates.forEach(comp => {
      comp.isLowest = comp.rateValue === lowestRate
      comp.isHighest = comp.rateValue === highestRate
    })

    return {
      date: day.date,
      competitors: competitorRates,
      avgCompsetRate: avgRate,
      avgCompsetDifference: `${avgDifference}${avgDiffValue}`,
      isMyRateLowest,
      isMyRateHighest,
      showRateDot: isMyRateLowest || isMyRateHighest
    }
  })
}

// Enhanced pricing recommendation logic (deprecated but kept for reference)
const getPricingRecommendation = (date: number, month: number, year: number) => {
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
        dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][currentDate.getDay()],
        // New fields for the image layout
        subscriberRate: `$${Math.floor(Math.random() * 900 + 100)}`,
        hotelLowestRate: Math.floor(Math.random() * 400 + 150),
        rateDifference: `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 90 + 10)}`,
        roomType: "STD",
        hasInclusion: true,
        inclusionIcon: "wifi",
        hasEvent: Math.random() > 0.6,
        eventIcon: "⭐",
        eventCount: Math.random() > 0.5 ? Math.floor(Math.random() * 3 + 1) : 1,
        isHighest: Math.random() > 0.7,
        isLowest: Math.random() > 0.8,
        isMyRateLowest: false,
        isMyRateHighest: false,
        showRateDot: false,
        hasFlag: Math.random() > 0.8,
        flagCountry: Math.random() > 0.8 ? '🇺🇸' : undefined,
        hasIndicator: Math.random() > 0.7,
        indicatorColor: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'bg-red-500' : 'bg-green-500') : undefined,
        indicatorType: Math.random() > 0.8 ? 'square' : 'circle'
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

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

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

function RateTrendCalendarInner({ 
  currentView, 
  onDateSelect,
  highlightToday = true,
  showWeekNumbers = false 
}: RateTrendCalendarProps) {
  const { startDate, endDate, isLoading } = useDateContext()
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null)
  const [expandedWeekIndex, setExpandedWeekIndex] = useState<number | null>(null)
  const [selectedWeekForCompetitors, setSelectedWeekForCompetitors] = useState<CalendarDay[] | null>(null)
  
  // Generate calendar data based on selected date range
  const calendarData = useMemo(() => {
    if (startDate && endDate) {
    return generateCalendarData(startDate, endDate)
    } else {
      const defaultStart = new Date()
      const defaultEnd = new Date()
      defaultEnd.setDate(defaultStart.getDate() + 7) // Default to next 7 days
      return generateCalendarData(defaultStart, defaultEnd)
    }
  }, [startDate, endDate])

  // Memoize competitor data to prevent refresh
  const memoizedCompetitorData = useMemo(() => {
    if (!selectedWeekForCompetitors) return []
    return generateCompetitorData(selectedWeekForCompetitors)
  }, [selectedWeekForCompetitors])

  // Memoize all competitive data for the entire calendar to prevent constant reloading
  const memoizedAllCompetitiveData = useMemo(() => {
    const competitiveMap = new Map()
    calendarData.flat().forEach(day => {
      const competitiveInfo = generateCompetitorData([day])[0]
      const key = `${day.date}-${day.month}-${day.year}`
      competitiveMap.set(key, {
        isMyRateLowest: competitiveInfo?.isMyRateLowest || false,
        isMyRateHighest: competitiveInfo?.isMyRateHighest || false,
        showRateDot: competitiveInfo?.showRateDot || false
      })
    })
    return competitiveMap
  }, [calendarData])

  // Helper function to get competitive data for a day (now uses memoized data)
  const getCompetitiveData = useCallback((day: CalendarDay) => {
    const key = `${day.date}-${day.month}-${day.year}`
    return memoizedAllCompetitiveData.get(key) || {
      isMyRateLowest: false,
      isMyRateHighest: false,
      showRateDot: false
    }
  }, [memoizedAllCompetitiveData])
  
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

  const handleShowCompetitorRates = useCallback((week: CalendarDay[], weekIndex: number) => {
    if (expandedWeekIndex === weekIndex) {
      // Close if already expanded
      setExpandedWeekIndex(null)
      setSelectedWeekForCompetitors(null)
    } else {
      // Open new week
      setExpandedWeekIndex(weekIndex)
      setSelectedWeekForCompetitors(week)
    }
  }, [expandedWeekIndex])

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
              const priceChange = 0
      
      return {
        id: index,
        date: date, // Store as Date object instead of string
        dayName,
        dayOfWeek: date.getDay(),
        currentPrice: day.currentPrice,
        
        priceChange: priceChange,
        comparison: day.comparison,
        isFuture: day.isFuture,
        hasFlag: day.hasFlag,
        flagCountry: day.flagCountry,
        isWeekend: date.getDay() === 5 || date.getDay() === 6, // Friday or Saturday in Dubai
        eventInfluence: undefined,
        confidence: undefined
      }
    })
  }, [calendarData])

  if (currentView === "chart") {
    return <RTRateTrendsChart rateData={{}} />
  }



  if (currentView === "table") {
    const handleExportCSV = () => {
      const csvHeaders = ['Date', 'Day', 'Current Rate', 'Change %', 'Market Trends', 'Events']
      const csvData = tableData.map(row => [
        row.date.toLocaleDateString(),
        row.dayName,
        row.currentPrice,
        row.priceChange !== 0 ? `${row.priceChange.toFixed(1)}%` : '-',
        row.comparison,
        row.hasFlag ? row.flagCountry : '-'
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
             <div className="w-full shadow-xl border border-border/50 rounded-lg bg-white dark:bg-slate-900">
            <div>
          <table className="w-full relative table-fixed">
                    {/* Two-Level Sticky Header */}
                    <thead className="bg-gray-50 sticky top-0 z-20">
                      {/* First Header Row - Main Column Groups */}
                      <tr className="border-b border-gray-200">
                        {/* Sticky Date Column */}
                        <th rowSpan={2} className="sticky left-0 z-30 bg-gray-50 text-left py-1.5 pl-4 pr-2 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-36" style={{width: '141px'}}>
                  Date
                </th>
                        
                        {/* Sticky Demand Column */}
                        <th rowSpan={2} className="sticky left-40 z-30 bg-gray-50 text-center py-1.5 px-2 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-15" style={{width: '60px'}}>
                  Demand
                </th>
                        
                        {/* Sticky Avg. Compset Column Group */}
                        <th colSpan={2} className="sticky left-56 z-30 bg-gray-50 text-center py-1.5 px-2 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-24">
                          Avg. Compset
                </th>
                        
                        {/* Sticky Subscriber Column Group */}
                        <th colSpan={4} className="sticky left-84 z-30 bg-blue-50 text-center py-1.5 px-2 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-40">
                          Subscriber
                </th>
                        
                        {/* Competitor Hotel 1 */}
                        <th colSpan={4} className="text-center py-1.5 px-2 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-40">
                          Comfort Hotel..
                </th>
                        
                        {/* Competitor Hotel 2 */}
                        <th colSpan={4} className="text-center py-1.5 px-2 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-40">
                          acom Hotel B..
                </th>

                </tr>
                      
                      {/* Second Header Row - Sub Columns */}
                      <tr className="border-b border-gray-200">
                        {/* Avg. Compset Sub-columns */}
                        <th className="sticky left-56 z-30 bg-gray-50 text-center py-1.5 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-12">
                          €
                </th>
                        <th className="sticky left-68 z-30 bg-gray-50 text-center py-1.5 px-1 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-12">
                          ⟂⇂
                </th>
                        
                        {/* Subscriber Sub-columns */}
                        <th className="sticky left-84 z-30 bg-blue-50 text-center py-1.5 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-16" style={{width: '64px'}}>
                          €
                </th>
                        <th className="sticky left-96 z-30 bg-blue-50 text-center py-1.5 px-1 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-12">
                          ⟂⇂
                </th>
                        <th className="sticky left-108 z-30 bg-blue-50 text-center py-1.5 px-1 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-8">
                          <Utensils className="w-3 h-3 mx-auto" />
                </th>
                        <th className="sticky left-116 z-30 bg-blue-50 text-center py-1.5 px-1 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-8">
                          #
                </th>
                        
                        {/* Comfort Hotel Sub-columns */}
                        <th className="text-center py-1.5 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-16" style={{width: '64px'}}>
                          €
                </th>
                        <th className="text-center py-1.5 px-1 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-12">
                          ⟂⇂
                </th>
                        <th className="text-center py-1.5 px-1 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-8">
                          <Utensils className="w-3 h-3 mx-auto" />
                </th>
                        <th className="text-center py-1.5 px-1 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-8">
                          #
                </th>
                        
                        {/* acom Hotel Sub-columns */}
                        <th className="text-center py-1.5 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-16" style={{width: '64px'}}>
                          €
                </th>
                        <th className="text-center py-1.5 px-1 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-12">
                          ⟂⇂
                </th>
                        <th className="text-center py-1.5 px-1 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-8">
                          <Utensils className="w-3 h-3 mx-auto" />
                </th>
                        <th className="text-center py-1.5 px-1 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-8">
                          #
                </th>

              </tr>
            </thead>
                  
                  <tbody>
                    {tableData.slice(0, 14).map((row, index) => {
                      // Generate stable data based on row index to prevent refreshing
                      const seedValue = index + 1000; // Use index as a stable seed
                      const seededRandom = (seed: number, offset: number = 0) => {
                        const x = Math.sin(seed + offset) * 10000;
                        return x - Math.floor(x);
                      };
                      
                      // Sample data for demonstration - now stable
                      const avgCompsetRate = Math.floor(seededRandom(seedValue, 1) * 100) + 50;
                      const avgCompsetVariance = Math.floor(seededRandom(seedValue, 2) * 50) - 25;
                      const hotelLowestRate = Math.floor(seededRandom(seedValue, 3) * 400) + 150;
                      const hotelVariance = Math.floor(seededRandom(seedValue, 4) * 80) - 40;
                      const subscriberRank = Math.floor(seededRandom(seedValue, 5) * 4) + 1;
                      


                      // Competitor data - now stable
                      const competitors = [
                        { name: 'Comfort Hotel', rate: Math.floor(seededRandom(seedValue, 10) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 11) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 12) * 4) + 1 },
                        { name: 'acom Hotel', rate: Math.floor(seededRandom(seedValue, 13) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 14) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 15) * 4) + 1 },
                        { name: 'InterCity Hotel', rate: Math.floor(seededRandom(seedValue, 16) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 17) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 18) * 4) + 1 },
                        { name: 'Hilton Garden', rate: Math.floor(seededRandom(seedValue, 19) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 20) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 21) * 4) + 1 },
                        { name: 'Marriott Suites', rate: Math.floor(seededRandom(seedValue, 22) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 23) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 24) * 4) + 1 },
                        { name: 'Sheraton Plaza', rate: Math.floor(seededRandom(seedValue, 25) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 26) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 27) * 4) + 1 },
                        { name: 'Holiday Inn', rate: Math.floor(seededRandom(seedValue, 28) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 29) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 30) * 4) + 1 },
                        { name: 'Crowne Plaza', rate: Math.floor(seededRandom(seedValue, 31) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 32) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 33) * 4) + 1 },
                        { name: 'Four Seasons', rate: Math.floor(seededRandom(seedValue, 34) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 35) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 36) * 4) + 1 }
                      ];
                      
                      return (
                <tr 
                  key={row.id} 
                                                    className="border-b border-gray-200 group hover:bg-gray-50"
                >
                                                    {/* Sticky Date Column */}
                          <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 py-2 pl-4 pr-2 font-medium text-foreground text-sm border-r border-gray-200" style={{width: '141px'}}>
                            <div className="flex flex-col">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <BarChart3 className="w-3 h-3 text-gray-500" />
                                  <span className="text-foreground" style={{marginLeft: '10px'}}>
                                    {row.date.getDate()} {row.date.toLocaleDateString('en', {month: 'short'})} '{row.date.getFullYear().toString().slice(-2)},
                                  </span>
                                  <span className="text-gray-500">{row.dayName}</span>
                                </div>
                                {seededRandom(seedValue, 51) > 0.7 && (
                                  <Calendar className="w-3 h-3 text-blue-500" />
                                )}
                              </div>
                    </div>
                  </td>

                          {/* Sticky Demand Column */}
                          <td className="sticky left-40 z-10 bg-white group-hover:bg-gray-50 py-2 px-1 text-center text-sm border-r border-gray-200" style={{width: '60px'}}>
                            {(() => {
                              const demandValue = Math.floor(seededRandom(seedValue, 40) * 60) + 40;
                              const getDemandColor = (value: number) => {
                                if (value <= 50) return 'text-blue-300'; // Light blue
                                if (value <= 65) return 'text-blue-600'; // Medium blue
                                if (value <= 80) return 'text-red-400'; // Light red
                                return 'text-red-600'; // Dark red
                              };
                              return <span className={`font-semibold ${getDemandColor(demandValue)}`}>{demandValue}</span>;
                            })()}
                  </td>

                          {/* Sticky Avg. Compset - Rate */}
                          <td className="sticky left-56 z-10 bg-white group-hover:bg-gray-50 py-2 text-center text-sm border-r border-gray-200">
                            <span className="font-semibold">${avgCompsetRate}</span>
                  </td>

                          {/* Sticky Avg. Compset - Variance */}
                          <td className="sticky left-68 z-10 bg-white group-hover:bg-gray-50 py-2 px-1 text-center text-sm border-r border-gray-200">
                            <span className={`text-xs font-medium ${avgCompsetVariance > 0 ? 'text-red-600' : avgCompsetVariance < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {avgCompsetVariance > 0 ? '+' : ''}{avgCompsetVariance !== 0 ? avgCompsetVariance : '--'}
                      </span>
                  </td>

                          {/* Sticky Subscriber - Rate */}
                          <td className="sticky left-84 z-10 bg-blue-50 group-hover:bg-blue-100 py-2 text-center text-sm border-r border-b border-gray-200" style={{width: '64px'}}>
                            <span className="font-semibold">{hotelLowestRate === 0 ? 'Sold Out' : `$${hotelLowestRate}`}</span>
                  </td>

                          {/* Sticky Subscriber - Variance */}
                          <td className="sticky left-96 z-10 bg-blue-50 group-hover:bg-blue-100 py-2 px-1 text-center text-sm border-r border-b border-gray-200">
                            <span className={`text-xs font-medium ${hotelVariance > 0 ? 'text-red-600' : hotelVariance < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {hotelVariance > 0 ? '+' : ''}{hotelVariance !== 0 ? hotelVariance : 'NA'}
                        </span>
                  </td>

                          {/* Sticky Subscriber - Inclusions */}
                          <td className="sticky left-108 z-10 bg-blue-50 group-hover:bg-blue-100 py-2 px-1 text-center text-xs border-r border-b border-gray-200">
                            {(() => {
                              const inclusionType = Math.floor(seededRandom(seedValue, 41) * 4);
                              if (inclusionType === 0) return <Wifi className="w-3 h-3 text-gray-600 mx-auto" />;
                              if (inclusionType === 1) return <Coffee className="w-3 h-3 text-gray-600 mx-auto" />;
                              if (inclusionType === 2) return <Utensils className="w-3 h-3 text-gray-600 mx-auto" />;
                              return <Car className="w-3 h-3 text-gray-600 mx-auto" />;
                            })()}
                  </td>

                          {/* Sticky Subscriber - Rank */}
                          <td className="sticky left-116 z-10 bg-blue-50 group-hover:bg-blue-100 py-2 px-1 text-center text-sm border-r border-b border-gray-200">
                            {subscriberRank}
                  </td>

                          {/* Competitor Hotels Data - First 2 Only */}
                          {competitors.slice(0, 2).map((competitor, compIndex) => (
                            <React.Fragment key={compIndex}>
                              {/* Rate */}
                              <td className="py-2 text-center text-sm border-r border-gray-200 group-hover:bg-gray-50">
                                <span className="font-semibold">{competitor.rate === 0 ? 'Sold Out' : `$${competitor.rate}`}</span>
                  </td>
                              
                              {/* Variance */}
                              <td className="py-2 px-1 text-center text-sm border-r border-gray-200 group-hover:bg-gray-50">
                                <span className={`text-xs font-medium ${competitor.variance > 0 ? 'text-red-600' : competitor.variance < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                  {competitor.variance > 0 ? '+' : ''}{competitor.variance !== 0 ? competitor.variance : 'NA'}
                        </span>
                  </td>

                              {/* Inclusions */}
                              <td className="py-2 px-1 text-center text-xs border-r border-gray-200 group-hover:bg-gray-50">
                                {(() => {
                                  const inclusionType = Math.floor(seededRandom(seedValue, 42 + compIndex) * 4);
                                  if (inclusionType === 0) return <Wifi className="w-3 h-3 text-gray-600 mx-auto" />;
                                  if (inclusionType === 1) return <Coffee className="w-3 h-3 text-gray-600 mx-auto" />;
                                  if (inclusionType === 2) return <Utensils className="w-3 h-3 text-gray-600 mx-auto" />;
                                  return <Dumbbell className="w-3 h-3 text-gray-600 mx-auto" />;
                                })()}
                  </td>

                              {/* Rank */}
                              <td className="py-2 px-1 text-center text-sm border-r border-gray-200 group-hover:bg-gray-50">
                                {competitor.rank}
                  </td>
                            </React.Fragment>
              ))}

                        </tr>
                      );
                    })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }





  // Show loading state when date range is changing
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-card to-card/50 shadow-xl border border-border/50 rounded-lg p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading calendar data...</p>
            </div>
              </div>
    )
  }

  return (
      <div className="rounded-lg">
        {/* Mobile View - Single Week with Navigation */}
        <div className="block lg:hidden">
          <div className="p-4 pt-16">
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
                <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                  <Tooltip delayDuration={0} disableHoverableContent>
                    <TooltipTrigger asChild>
                  <Card 
                    className={`p-3 h-28 cursor-pointer hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none border ${
                      isToday(day) ? 'border-blue-300 dark:border-blue-400' :
                      (() => {
                        const competitive = getCompetitiveData(day)
                        return competitive.isMyRateHighest ? 'border-red-500 dark:border-red-400' : 
                               competitive.isMyRateLowest ? 'border-green-500 dark:border-green-400' : 
                               'border-gray-200 dark:border-gray-500 hover:border-gray-400 dark:hover:border-gray-400'
                      })()
                    } bg-white dark:bg-slate-900`} 
                    onClick={() => handleDateClick(day)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Rate information for ${weekDays[dayIndex % 7]} ${day.date}, ${day.currentPrice}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleDateClick(day)
                      }
                    }}
                  >
                  <div className="relative h-full flex flex-col justify-between">
                    {/* Top Section: Date on left, Event Icon with margin, Colored Dot on top right */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {/* Date on left side */}
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {day.date}
            </div>
                        {/* Event icon after specific margin */}
                        <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          {day.hasEvent ? day.eventIcon : ''}
              </div>
            </div>
                      {/* Colored dot on top right - competitive rate indicator */}
                      {(() => {
                        const competitive = getCompetitiveData(day)
                        return competitive.showRateDot && (
                          <div className={`w-2 h-2 rounded-full ${
                            competitive.isMyRateLowest ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
                          }`} />
                        )
                      })()}
          </div>
                      
                    {/* Center Section: Hotel Lowest Rate (center aligned) */}
                    <div className="text-center mb-1">
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        ${day.hotelLowestRate}
        </div>
      </div>
                      
                    {/* Center Section: Difference vs Last Period (center aligned) */}
                    <div className="text-center mb-2">
                      <div className={`text-xs font-medium ${
                        day.rateDifference.startsWith('+') ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'
                      }`}>
                        {day.rateDifference}
            </div>
            </div>

                    {/* Bottom Section: Room Type & Inclusions (center aligned) */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {day.roomType}
                      </span>
                        {day.hasInclusion && (
                          <Wifi className="w-3 h-3 text-blue-400 dark:text-blue-300" />
                        )}
          </div>
        </div>

                    {/* Badge indicators for Today/Future */}
                    {(isToday(day) || day.isFuture) && (
                      <div className="absolute -top-1 -left-1">
                        {isToday(day) && (
                          <Badge variant="secondary" className="text-xs px-1 py-0 bg-blue-100 text-blue-700 border-blue-200">Today</Badge>
                        )}
                        {day.isFuture && !isToday(day) && (
                             <Badge variant="secondary" className="text-xs px-1 py-0 bg-emerald-100 text-emerald-700 border-emerald-200">Future</Badge>
                      )}
                    </div>
                    )}
                  </div>
                </Card>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-4 w-[460px] z-[10001]">
                      <div>
                        <div className="mb-2">
                          <div className="flex justify-between items-center">
                            <h3 className="text-gray-900 dark:text-white">
                              <span className="text-base font-bold">{String(day.date).padStart(2, '0')} {(() => {
                                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                                return months[day.month]
                              })()} 2024</span>
                              <span className="text-sm font-normal">, {(() => {
                                const date = new Date(day.year, day.month, day.date)
                                return weekDays[date.getDay()]
                              })()}</span>
                            </h3>
                            {(() => {
                              const competitive = getCompetitiveData(day)
                              if (competitive.showRateDot) {
                                return (
                    <div className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${
                                      competitive.isMyRateLowest ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
                                    }`} />
                                    <span className={`text-xs font-medium ${
                                      competitive.isMyRateLowest ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    }`}>
                                      {competitive.isMyRateLowest ? 'Lowest Rate' : 'Highest Rate'}
                      </span>
                    </div>
                                )
                              }
                              return null
                            })()}
                      </div>
                          <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-1 mb-4">
                            Alhambra Hotel
                    </div>
                      </div>
                      
                        <div className="space-y-3 mb-3">
                          <div className="grid gap-1 text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-1" style={{gridTemplateColumns: '90px 150px 90px 90px'}}>
                            <div>Lowest Rate</div>
                            <div>Room</div>
                            <div>Inclusion</div>
                            <div>Channel</div>
                      </div>
                      
                          <div className="grid gap-1 text-xs mt-2" style={{gridTemplateColumns: '90px 150px 90px 90px'}}>
                            <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                              $210
                        </div>
                            <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                              STD (Standard Room)
                        </div>
                            <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                              <div className="flex items-center gap-1">
                                <Wifi className="w-3 h-3 flex-shrink-0" />
                                <span>Breakfast</span>
                      </div>
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                              Booking.com
                            </div>
                          </div>
                        </div>
                          
                        <div className="mb-3">
                          <div className="text-xs text-black dark:text-gray-100 mb-2">
                            <span className="font-medium">Avg. Compset:</span> <span className="font-bold">$210</span>
                          </div>
                        </div>
                          
                        {day.hasEvent && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="w-3 h-3 text-amber-500 fill-current" />
                              <div className="text-xs text-gray-800 dark:text-gray-200">
                                Music Festival
                              </div>
                              <div style={{ paddingLeft: '0px' }}>
                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                  (+2 more)
                        </span>
                      </div>
                            </div>
                         </div>
                       )}
                      
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                          <div className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                            Standard Room | Continental breakfast included. Breakfast rated 6. Non-refundable. If you cancel, modify the booking, or don't show up, the fee will be the total price of the reservation...
                    </div>
                        </div>
                      </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
              ))}
                    </div>
          </div>
        </div>

        {/* Desktop View - Full Calendar Grid */}
        <div className="hidden lg:block p-6 pt-16">

          
          {/* Header */}
          <div className="grid grid-cols-8 gap-2 mb-3">
            {/* Week Column Header */}
            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 text-center">
              Week
            </div>
            {/* Day Headers */}
            {weekDays.map((day) => (
              <div key={day} className="text-xs font-medium text-gray-600 dark:text-gray-300 text-center">
                {day}
              </div>
            ))}
        </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            {calendarData.map((week, weekIndex) => (
              <React.Fragment key={weekIndex}>
                <div className="grid grid-cols-8 gap-2">
                {/* Week Cell - Always shown */}
                <Card className="p-2 min-h-fit hover:shadow-lg transition-all duration-200 relative cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none border border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-slate-900">
                  <div className="relative h-full flex flex-col justify-center items-center" style={{ gap: '2px' }}>
                    {/* Week Date Range */}
                    <div className="text-center">
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {week[0]?.date} {getMonthName(week[0]?.month)}-{week[6]?.date} {getMonthName(week[6]?.month)}
            </div>
              </div>
                    {/* Competitor Rates Button */}
                    <div className="text-center">
                      <button
                        onClick={() => handleShowCompetitorRates(week, weekIndex)}
                        className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-medium py-1"
                      >
                        {expandedWeekIndex === weekIndex ? 'Hide Comp. Rates' : 'Show Comp. Rates'}
                      </button>
            </div>
              </div>
                </Card>
                {week.map((day, dayIndex) => (
                <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                  <Tooltip delayDuration={0} disableHoverableContent>
                    <TooltipTrigger asChild>
                  <Card
                      className={`p-2 min-h-fit hover:shadow-lg transition-all duration-200 relative cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none border ${
                        isToday(day) ? 'border-blue-500 dark:border-blue-500' :
                        (() => {
                          const competitive = getCompetitiveData(day)
                          return competitive.isMyRateHighest ? 'border-red-500 dark:border-red-400' : 
                                 competitive.isMyRateLowest ? 'border-green-500 dark:border-green-400' : 
                                 'border-gray-200 dark:border-gray-500 hover:border-gray-400 dark:hover:border-gray-400'
                        })()
                      } bg-white dark:bg-slate-900`}
                    onClick={() => handleDateClick(day)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Rate information for ${day.date}, ${day.currentPrice}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleDateClick(day)
                      }
                    }}
                  >
                                        <div className="relative h-full flex flex-col">
                    {/* Row 1: Date on left, Colored Dot on top right */}
                    <div className="flex items-center justify-between rounded">
                      <div className="flex items-center gap-2">
                        {/* Date on left side */}
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {day.date}
            </div>
              </div>
                      {/* Colored dot on top right - competitive rate indicator */}
                      {(() => {
                        const competitive = getCompetitiveData(day)
                        return competitive.showRateDot && (
                          <div className={`w-2 h-2 rounded-full ${
                            competitive.isMyRateLowest ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
                          }`} />
                        )
                      })()}
            </div>
                                        {/* Row 2: Hotel Lowest Rate */}
                    <div className="text-center rounded">
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        ${day.hotelLowestRate}
          </div>
        </div>
                    {/* Row 3: Difference vs Last Period */}
                    <div className="text-center rounded pb-2">
                      <div className={`text-xs font-medium ${
                        day.rateDifference.startsWith('+') ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'
                      }`}>
                        {day.rateDifference}
      </div>
                    </div>
                    {/* Row 4: Events, Room Type & Inclusions */}
                    <div className="text-center rounded">
                      <div className="flex items-center justify-center gap-1">
                        {/* Event Icon with 16px margin */}
                        {day.hasEvent && (
                          <div className="flex items-center" style={{ marginRight: '16px' }}>
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                </div>
              )}
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {day.roomType}
                        </span>
                        {day.hasInclusion && (
                          <Wifi className="w-3 h-3 text-blue-400 dark:text-blue-300" />
                             )}
              </div>
                    </div>
                    </div>
                  </Card>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-4 w-[460px] z-[10001]">
                      <div>
                        <div className="mb-2">
                          <div className="flex justify-between items-center">
                            <h3 className="text-gray-900 dark:text-white">
                              <span className="text-base font-bold">{String(day.date).padStart(2, '0')} {(() => {
                                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                                return months[day.month]
                              })()} 2024</span>
                              <span className="text-sm font-normal">, {(() => {
                                const date = new Date(day.year, day.month, day.date)
                                return weekDays[date.getDay()]
                              })()}</span>
                            </h3>
                            {(() => {
                              const competitive = getCompetitiveData(day)
                              if (competitive.showRateDot) {
                                return (
                  <div className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${
                                      competitive.isMyRateLowest ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
                    }`} />
                                    <span className={`text-xs font-medium ${
                                      competitive.isMyRateLowest ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    }`}>
                                      {competitive.isMyRateLowest ? 'Lowest Rate' : 'Highest Rate'}
                                    </span>
                                  </div>
                                )
                              }
                              return null
                            })()}
                          </div>
                          <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-1 mb-4">
                            Alhambra Hotel
                          </div>
                  </div>
                  
                        <div className="space-y-3 mb-3">
                          <div className="grid gap-1 text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-1" style={{gridTemplateColumns: '90px 150px 90px 90px'}}>
                            <div>Lowest Rate</div>
                            <div>Room</div>
                            <div>Inclusion</div>
                            <div>Channel</div>
                  </div>
                  
                          <div className="grid gap-1 text-xs mt-2" style={{gridTemplateColumns: '90px 150px 90px 90px'}}>
                            <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                              $210
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                              STD (Standard Room)
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                          <div className="flex items-center gap-1">
                                <Wifi className="w-3 h-3 flex-shrink-0" />
                                <span>Breakfast</span>
                              </div>
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                              Booking.com
                            </div>
                          </div>
                  </div>
                  
                        <div className="mb-3">
                          <div className="text-xs text-black dark:text-gray-100 mb-2">
                            <span className="font-medium">Avg. Compset:</span> <span className="font-bold">$210</span>
                    </div>
                        </div>
                          
                        {day.hasEvent && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="w-3 h-3 text-amber-500 fill-current" />
                              <div className="text-xs text-gray-800 dark:text-gray-200">
                                Music Festival
                              </div>
                              <div style={{ paddingLeft: '0px' }}>
                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                  (+2 more)
                                </span>
                              </div>
                            </div>
                </div>
              )}

                        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                          <div className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                            Standard Room | Continental breakfast included. Breakfast rated 6. Non-refundable. If you cancel, modify the booking, or don't show up, the fee will be the total price of the reservation...
                      </div>
                        </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
                ))}
                        </div>

              
                {/* Inline Competitor Table */}
                {expandedWeekIndex === weekIndex && selectedWeekForCompetitors && (
                  <div>
                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden mb-[18px]">

                    
                    <div className="overflow-x-auto">
                      {/* Fixed Avg. Compset Row */}
                      <div className="grid grid-cols-8">
                        {/* Hotel Names Column - Avg. Compset */}
                        <div>
                          <div className="px-2 py-0.5 text-xs font-medium text-gray-900 dark:text-gray-100 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800/60 border-0 h-12 flex items-center border-b border-b-gray-300 dark:border-b-gray-500 transition-colors duration-200">
                            <div className="truncate w-full font-semibold">
                              Avg. Compset
        </div>
      </div>
                        </div>

                        {/* Date Columns for Avg. Compset */}
                        {selectedWeekForCompetitors.map((day, dayIndex) => {
                          const competitorData = memoizedCompetitorData[dayIndex];
                          const avgRate = competitorData?.avgCompsetRate || 200;
                          const avgDiff = competitorData?.avgCompsetDifference || '+15';

  return (
                            <div key={`avg-${dayIndex}`}>
                              <div className="px-2 py-0.5 text-center border-0 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800/60 h-12 flex items-center justify-center border-b border-b-gray-300 dark:border-b-gray-500 transition-colors duration-200">
                                <div className="flex flex-col items-center">
                                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                    ${avgRate}
              </span>
                                  <span className={`text-xs font-medium ${
                                    avgDiff.startsWith('+') ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'
                                  }`}>
                                    {avgDiff}
                      </span>
                        </div>
                    </div>
                      </div>
                          );
                        })}
                      </div>
                      
                      {/* Scrollable Competitor Rows */}
                      <div className="grid grid-cols-8 max-h-60 overflow-y-auto">
                        {/* Hotel Names Column */}
                        <div>
                          {memoizedCompetitorData[0]?.competitors.map((_, compIndex) => {
                            const isLastRow = compIndex === memoizedCompetitorData[0]?.competitors.length - 1;
                            return (
                              <div key={compIndex} className={`px-2 py-0.5 text-xs font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/60 border-0 h-12 flex items-center transition-colors duration-200 ${!isLastRow ? 'border-b border-b-gray-300 dark:border-b-gray-500' : ''}`}>
                                <div className="truncate w-full" title={memoizedCompetitorData[0]?.competitors[compIndex]?.hotelName}>
                                  {memoizedCompetitorData[0]?.competitors[compIndex]?.hotelName}
                           </div>
                         </div>
                            );
                          })}
                         </div>
                        
                        {/* Date Columns aligned with calendar */}
                        {selectedWeekForCompetitors.map((day, dayIndex) => (
                          <div key={dayIndex}>
                            {memoizedCompetitorData[0]?.competitors.map((_, compIndex) => {
                              const competitorData = memoizedCompetitorData[dayIndex]
                              const competitor = competitorData?.competitors[compIndex]
                              const isLastRow = compIndex === memoizedCompetitorData[0]?.competitors.length - 1;
                              const hotelName = memoizedCompetitorData[0]?.competitors[compIndex]?.hotelName || 'Competitor Hotel';

                              return (
                                <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                                  <Tooltip delayDuration={0} disableHoverableContent>
                                    <TooltipTrigger asChild>
                                      <div className={`px-2 py-0.5 text-center border-0 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/60 h-12 flex items-center justify-center transition-colors duration-200 ${!isLastRow ? 'border-b border-b-gray-300 dark:border-b-gray-500' : ''}`}>
                                        <div className="flex flex-col items-center">
                                          <div className="flex items-center justify-center gap-2">
                                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                              {competitor?.rate}
                                            </span>
                                            {/* Competitive rate dot with 8px padding */}
                                            {(competitor?.isLowest || competitor?.isHighest) && (
                               <div className={`w-2 h-2 rounded-full ${
                                                competitor?.isLowest ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
                               }`} />
                                            )}
                  </div>
                                          <span className={`text-xs font-medium ${
                                            competitor?.difference.startsWith('+') ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'
                                          }`}>
                                            {competitor?.difference}
                               </span>
            </div>
          </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-4 w-[460px] z-[10001]">
                                      <div>
                                        <div className="mb-2">
                                          <div className="flex justify-between items-center">
                                            <h3 className="text-gray-900 dark:text-white">
                                              <span className="text-base font-bold">{String(day.date).padStart(2, '0')} {(() => {
                                                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                                                return months[day.month]
                                              })()} 2024</span>
                                              <span className="text-sm font-normal">, {(() => {
                                                const date = new Date(day.year, day.month, day.date)
                                                return weekDays[date.getDay()]
                                              })()}</span>
                                            </h3>
                                            {(() => {
                                              // Show competitor's status if they have highest/lowest rate
                                              if (competitor?.isLowest || competitor?.isHighest) {
                                                return (
                                                  <div className="flex items-center gap-2">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${
                                                      competitor?.isLowest ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
                                                    }`} />
                                                    <span className={`text-xs font-medium ${
                                                      competitor?.isLowest ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                      {competitor?.isLowest ? 'Lowest Rate' : 'Highest Rate'}
              </span>
            </div>
                                                )
                                              }
                                              return null
                                            })()}
          </div>
                                          <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-1 mb-4">
                                            {hotelName}
              </div>
          </div>

                                        <div className="space-y-3 mb-3">
                                          <div className="grid gap-1 text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600 pb-1" style={{gridTemplateColumns: '90px 150px 90px 90px'}}>
                                            <div>Lowest Rate</div>
                                            <div>Room</div>
                                            <div>Inclusion</div>
                                            <div>Channel</div>
                          </div>
                                            
                                          <div className="grid gap-1 text-xs mt-2" style={{gridTemplateColumns: '90px 150px 90px 90px'}}>
                                            <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                                              {competitor?.rate || '$210'}
                                            </div>
                                            <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                                              STD (Standard Room)
                                            </div>
                                            <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                          <div className="flex items-center gap-1">
                                                <Wifi className="w-3 h-3 flex-shrink-0" />
                                                <span>Breakfast</span>
                                              </div>
                                            </div>
                                            <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                                              Booking.com
                                            </div>
                      </div>
                        </div>

                                        <div className="mb-3">
                                          <div className="text-xs text-black dark:text-gray-100 mb-2">
                                            <span className="font-medium">Avg. Compset:</span> <span className="font-bold">$210</span>
                                          </div>
                        </div>

                                        {day.hasEvent && (
                                          <div className="mb-3">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Star className="w-3 h-3 text-amber-500 fill-current" />
                                              <div className="text-xs text-gray-800 dark:text-gray-200">
                                                Music Festival
                             </div>
                                              <div style={{ paddingLeft: '4px' }}>
                                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                                  (+2 more)
                               </span>
                                              </div>
                             </div>
                           </div>
                         )}

                                        <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                                          <div className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                                            Standard Room | Continental breakfast included. Breakfast rated 6. Non-refundable. If you cancel, modify the booking, or don't show up, the fee will be the total price of the reservation...
                    </div>
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )
                            })}
              </div>
            ))}
          </div>
                    </div>
                  </div>
                  </div>
                )}
              </React.Fragment>
            ))}
        </div>
      </div>
      
      <RateDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedDate={selectedDateForModal}
        onPrevDay={() => navigateDay("prev")}
        onNextDay={() => navigateDay("next")}
      />


      </div>
  )
}

// Export the main component directly
export function RateTrendCalendar(props: RateTrendCalendarProps) {
  return <RateTrendCalendarInner {...props} />
}
