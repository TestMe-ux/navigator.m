"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Activity, Calendar, DollarSign, Star, Percent, ArrowUp, ArrowDown, Download, Wifi, Utensils, Coffee, Car, Dumbbell, BarChart3, Zap } from "lucide-react"
import { RateTrendGraph } from "./rate-trend-graph"
import { RTRateTrendsChart } from "./rt-rate-trends-chart"
import { RateDetailModal } from "./rate-detail-modal"
import { useDateContext } from "@/components/date-context"
import { useComparison } from "@/components/comparison-context"
import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format, isSameDay, parseISO, subDays } from "date-fns"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { getInclusionIcon } from "@/lib/inclusion-icons"



interface CalendarDay {
  date: number
  month: number
  year: number
  fulldate: Date
  currentPrice: string
  comparison: string
  isFuture?: boolean
  dayOfWeek?: string
  subscriberRate: string
  hotelLowestRate: number
  rateDifference: string
  roomType: string
  abbreviation: string
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
  hasLightningRefresh?: boolean
  rateEntry?: any
}

interface CompetitorRate {
  hotelName: string
  rate: string
  rateValue: number
  difference: string
  isLowest: boolean
  isHighest: boolean
  hasInclusion?: boolean
  inclusionIcon: string
  rank?: number
  // Add missing fields for tooltip
  productName?: string
  abbreviation?: string
  inclusion?: string
  channelName?: string
  rateEntry?: any
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

// Transform live data to competitor data format
const transformLiveDataToCompetitorData = (rateData: any, rateCompData: any, week: CalendarDay[], selectedComparison: number): CompetitorData[] => {
  if (!rateData || !rateData.pricePositioningEntites) {
    return []
  }

  const myProperty = rateData.pricePositioningEntites.find((entity: any) => entity.propertyType === 0)
  const avgCompset = rateData.pricePositioningEntites.find((entity: any) => entity.propertyType === 2)
  const competitors = rateData.pricePositioningEntites.filter((entity: any) => entity.propertyType === 1)

  // Get comparison entities for rate comparison
  const compEntities: any = rateCompData?.body?.pricePositioningEntites || rateCompData?.pricePositioningEntites

  return week.map(day => {
    const dayDate = new Date(day.year, day.month, day.date)

    // Find rate entry for this day
    const myRateEntry = myProperty?.subscriberPropertyRate?.find((rate: any) => {
      return isSameDay(parseISO(rate.checkInDateTime), dayDate)
    })
    // Use index-based approach like rate-trends-table does
    // const dayIndex = week.findIndex(d => d.date === day.date && d.month === day.month && d.year === day.year)
    let avgCompsetEntry = avgCompset?.subscriberPropertyRate?.find((rate: any) => {
      return isSameDay(parseISO(rate.checkInDateTime), dayDate)
    })

    // Generate competitor rates from live data
    const competitorRates = competitors.map((comp: any) => {
      const compRateEntry = comp.subscriberPropertyRate?.find((rate: any) => {
        return isSameDay(parseISO(rate.checkInDateTime), dayDate)
      })

      // Get comparison data for this competitor rate entry
      const compCompData = compEntities
        ?.filter((ce: any) => ce.propertyID === compRateEntry?.propertyID)[0]
        ?.subscriberPropertyRate
        ?.find((re: any) =>
          compRateEntry && isSameDay(
            parseISO(re.checkInDateTime),
            subDays(parseISO(compRateEntry.checkInDateTime), selectedComparison)
          )
        );

      const rateValue = compRateEntry?.status === 'O' ? parseFloat(compRateEntry.rate) : 0
      const compareRate = compCompData?.rate ? parseFloat(compCompData.rate) : 0;
      const compareStatus = compCompData?.status;

      // Calculate rate difference for comparison
      const rateDifference = rateValue && compareRate && compRateEntry?.status === 'O' && compareStatus === 'O'
        ? rateValue - compareRate
        : 0;

      return {
        hotelName: comp.propertName,
        rate: compRateEntry?.status === 'O' ? `${rateValue.toLocaleString('en-US')}` : compRateEntry?.status === 'C' ? 'Closed' : '--',
        rateValue,
        difference: rateDifference !== 0
          ? `${rateDifference > 0 ? '+' : ''}${rateDifference}`
          : '--',
        isLowest: false, // Will be set later
        isHighest: false, // Will be set later
        hasInclusion: !!compRateEntry?.inclusion,
        inclusionIcon: compRateEntry?.inclusion || '',
        rank: 0, // Will be set later
        // Add missing fields for tooltip
        productName: compRateEntry?.productName || '',
        abbreviation: compRateEntry?.abbreviation || '',
        inclusion: compRateEntry?.inclusion || '',
        channelName: compRateEntry?.channelName || '',
        rateEntry: compRateEntry // Store original rate entry for full data access
      }
    })

    // Get comparison data for my hotel rate entry
    const myCompData = compEntities
      ?.filter((ce: any) => ce.propertyID === myRateEntry?.propertyID)[0]
      ?.subscriberPropertyRate
      ?.find((re: any) =>
        myRateEntry && isSameDay(
          parseISO(re.checkInDateTime),
          subDays(parseISO(myRateEntry.checkInDateTime), selectedComparison)
        )
      );

    // Add my hotel rate to comparison
    const myRateValue = myRateEntry?.status === 'O' ? parseFloat(myRateEntry.rate) : 0
    const myCompareRate = myCompData?.rate ? parseFloat(myCompData.rate) : 0;
    const myCompareStatus = myCompData?.status;

    // Calculate rate difference for my hotel
    const myRateDifference = myRateValue && myCompareRate && myRateEntry?.status === 'O' && myCompareStatus === 'O'
      ? myRateValue - myCompareRate
      : 0;

    const allRates = [...competitorRates, {
      hotelName: myProperty?.propertName || 'My Hotel',
      rate: myRateEntry?.status === 'O' ? `${myRateValue.toLocaleString('en-US')}` : myRateEntry?.status === 'C' ? 'Closed' : '--',
      rateValue: myRateValue,
      difference: myRateDifference !== 0
        ? `${myRateDifference > 0 ? '+' : ''}${myRateDifference}`
        : '--',
      isLowest: false, // Will be set later
      isHighest: false, // Will be set later
      hasInclusion: !!myRateEntry?.inclusion,
      inclusionIcon: myRateEntry?.inclusion || '',
      rank: 0, // Will be set later
      // Add missing fields for tooltip
      productName: myRateEntry?.productName || '',
      abbreviation: myRateEntry?.abbreviation || '',
      inclusion: myRateEntry?.inclusion || '',
      channelName: myRateEntry?.channelName || '',
      rateEntry: myRateEntry // Store original rate entry for full data access
    }]

    // Find lowest and highest rates (only among open rates)
    const openRates = allRates.filter(r => r.rateValue > 0)
    if (openRates.length > 0) {
      const lowestRate = Math.min(...openRates.map(r => r.rateValue))
      const highestRate = Math.max(...openRates.map(r => r.rateValue))

      // Sort rates for ranking (lowest rate = rank 1)
      const sortedRates = [...openRates].sort((a, b) => a.rateValue - b.rateValue)

      // Mark lowest and highest and assign ranks
      allRates.forEach(rate => {
        rate.isLowest = rate.rateValue === lowestRate && rate.rateValue > 0
        rate.isHighest = rate.rateValue === highestRate && rate.rateValue > 0
        rate.rank = rate.rateValue > 0 ? sortedRates.findIndex(r => r.rateValue === rate.rateValue) + 1 : 0
      })
    }

    // Get my hotel's competitive status
    const myRate = allRates.find(r => r.hotelName === (myProperty?.propertName || 'My Hotel'))
    const isMyRateLowest = myRate?.isLowest || false
    const isMyRateHighest = myRate?.isHighest || false

    // Get comparison data for avg compset rate entry
    const avgCompsetCompData = compEntities
      ?.filter((ce: any) => ce.propertyID === avgCompsetEntry?.propertyID)[0]
      ?.subscriberPropertyRate
      ?.find((re: any) =>
        avgCompsetEntry && isSameDay(
          parseISO(re.checkInDateTime),
          subDays(parseISO(avgCompsetEntry.checkInDateTime), selectedComparison)
        )
      );

    // Calculate average compset rate
    const avgCompsetRate = parseFloat(avgCompsetEntry?.rate) || 0
    const avgCompsetCompareRate = avgCompsetCompData?.rate ? parseFloat(avgCompsetCompData.rate) : 0;
    const avgCompsetCompareStatus = avgCompsetCompData?.status;
    // Calculate rate difference for avg compset
    const avgCompsetRateDifference = avgCompsetRate && avgCompsetCompareRate
      ? avgCompsetRate - avgCompsetCompareRate
      : 0;

    return {
      date: day.date,
      competitors: competitorRates,
      avgCompsetRate,
      avgCompsetDifference: avgCompsetRateDifference !== 0
        ? `${avgCompsetRateDifference > 0 ? '+' : ''}${avgCompsetRateDifference}`
        : '--',
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



// Transform live data to calendar format
const transformLiveDataToCalendarData = (rateData: any, rateCompData: any, startDateRange: Date, endDateRange: Date, selectedComparison: number): CalendarDay[][] => {
  if (!rateData || !rateData.pricePositioningEntites) {
    return []
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const weeks: CalendarDay[][] = []
  const myProperty = rateData.pricePositioningEntites.find((entity: any) => entity.propertyType === 0)

  if (!myProperty || !myProperty.subscriberPropertyRate) {
    return []
  }

  // Get comparison entities for rate comparison
  const compEntities: any = rateCompData?.body?.pricePositioningEntites || rateCompData?.pricePositioningEntites

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

      // Find rate entry for this day
      const rateEntry = myProperty.subscriberPropertyRate.find((rate: any) => {
        const rateDate = new Date(rate.checkInDateTime)
        return rateDate.getDate() === date &&
          rateDate.getMonth() === month &&
          rateDate.getFullYear() === year
      })

      // Get comparison data for this rate entry
      const compData = compEntities
        ?.filter((ce: any) => ce.propertyID === rateEntry?.propertyID)[0]
        ?.subscriberPropertyRate
        ?.find((re: any) =>
          rateEntry && isSameDay(
            parseISO(re.checkInDateTime),
            subDays(parseISO(rateEntry.checkInDateTime), selectedComparison)
          )
        );

      const compareRate = compData?.rate ? parseFloat(compData.rate) : 0;
      const compareStatus = compData?.status;

      // Get rate data from live data
      const rateValue = rateEntry?.status === 'O' ? parseFloat(rateEntry.rate) : 0
      const currentPrice = rateEntry?.status === 'O' ? `${rateValue.toLocaleString('en-US')}` : rateEntry?.status === 'O' ? 'Closed' : '--';

      // Calculate rate difference for comparison
      const rateDifference = rateValue && compareRate && rateEntry?.status === 'O' && compareStatus === 'O'
        ? rateValue - compareRate
        : 0;

      const comparison = rateDifference !== 0
        ? `${rateDifference > 0 ? '+' : ''}${rateDifference} vs. Comp`
        : '-- vs. Comp'

      let dayData: CalendarDay = {
        date,
        month,
        year,
        fulldate: currentDate,
        currentPrice,
        comparison,
        isFuture,
        dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][currentDate.getDay()],
        // New fields for the image layout
        subscriberRate: rateEntry?.status === 'O' ? `${rateValue.toLocaleString('en-US')} USD` : rateEntry?.status === 'C' ? 'Closed' : '--',
        hotelLowestRate: rateValue,
        rateDifference: rateDifference !== 0
          ? `${rateDifference > 0 ? '+' : ''}${rateDifference}`
          : '--',
        roomType: rateEntry?.productName || "",
        hasInclusion: !!rateEntry?.inclusion,
        inclusionIcon: rateEntry?.inclusion || "",
        hasEvent: !!(rateEntry?.event?.eventDetails?.length > 0),
        eventIcon: "⭐",
        eventCount: rateEntry?.event?.eventDetails?.length || 0,
        isHighest: false, // Will be calculated later
        isLowest: false, // Will be calculated later
        isMyRateLowest: false, // Will be calculated later
        isMyRateHighest: false, // Will be calculated later
        showRateDot: false, // Will be calculated later
        hasFlag: !!(rateEntry?.event?.eventDetails?.length > 0),
        flagCountry: rateEntry?.event?.eventDetails?.length > 0 ? '⭐' : undefined,
        hasIndicator: currentDate.getDay() === 5 || currentDate.getDay() === 6, // Weekend indicator
        indicatorColor: currentDate.getDay() === 5 || currentDate.getDay() === 6 ? 'bg-red-400' : undefined,
        indicatorType: currentDate.getDay() === 5 || currentDate.getDay() === 6 ? 'square' : 'circle',
        hasLightningRefresh: false, // Can be enhanced based on actual data
        rateEntry: rateEntry, // Store original rate entry for live data access
        abbreviation: rateEntry?.abbreviation
      }

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

// Helper function to calculate digit count from rate data
const calculateDigitCount = (rateData: any): number => {
  if (!rateData || !rateData.pricePositioningEntites) {
    return 4 // Default
  }

  let maxDigits = 4
  rateData.pricePositioningEntites.forEach((entity: any) => {
    if (entity.subscriberPropertyRate) {
      entity.subscriberPropertyRate.forEach((rate: any) => {
        if (rate.status === 'O' && rate.rate) {
          const rateValue = parseFloat(rate.rate)
          const digitCount = rateValue.toString().length
          if (digitCount > maxDigits) {
            maxDigits = digitCount
          }
        }
      })
    }
  })

  return maxDigits
}

interface RateTrendCalendarProps {
  currentView: "calendar" | "chart" | "table"
  onDateSelect?: (date: Date) => void
  highlightToday?: boolean
  showWeekNumbers?: boolean
  shouldShowMonthNavigation?: boolean
  availableMonths?: { month: number; year: number; monthName: string }[]
  currentMonthIndex?: number
  onPrevMonth?: () => void
  onNextMonth?: () => void
  digitCount?: number
  startDate?: Date
  endDate?: Date
  rateData?: any
  rateCompData?: any
  selectedProperty?: any
}

function RateTrendCalendarInner({
  currentView,
  onDateSelect,
  highlightToday = true,
  showWeekNumbers = false,
  shouldShowMonthNavigation: propShouldShowMonthNavigation,
  availableMonths: propAvailableMonths,
  currentMonthIndex: propCurrentMonthIndex,
  onPrevMonth: propOnPrevMonth,
  onNextMonth: propOnNextMonth,
  digitCount = 4,
  startDate: propStartDate,
  endDate: propEndDate,
  rateData,
  rateCompData,
  selectedProperty
}: RateTrendCalendarProps) {
  // Use props if available, otherwise fall back to date context
  const dateContext = useDateContext()
  const { selectedComparison } = useComparison()
  const startDate = propStartDate || dateContext.startDate
  const endDate = propEndDate || dateContext.endDate
  const isLoading = dateContext.isLoading
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null)
  const [expandedWeekIndex, setExpandedWeekIndex] = useState<number | null>(null)
  const [selectedWeekForCompetitors, setSelectedWeekForCompetitors] = useState<CalendarDay[] | null>(null)

  // Month navigation state - use props if available, otherwise use internal state
  const [internalCurrentMonthIndex, setInternalCurrentMonthIndex] = useState(0)
  const [internalAvailableMonths, setInternalAvailableMonths] = useState<{ month: number; year: number; monthName: string }[]>([])

  // const [selectedProperty] = useSelectedProperty();

  // Use props if available, otherwise use internal state
  const currentMonthIndex = propCurrentMonthIndex ?? internalCurrentMonthIndex
  const availableMonths = propAvailableMonths ?? internalAvailableMonths
  const shouldShowMonthNavigation = propShouldShowMonthNavigation ?? (availableMonths.length > 1)

  // Helper function to determine if we should show limited days
  const daySelectionInfo = useMemo(() => {
    if (!startDate || !endDate) return { type: 'normal', totalDays: 0 }

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    if (totalDays === 7) {
      return { type: '7days', totalDays: 7 } // Show today + next 6 days (7 days total)
    } else if (totalDays === 14) {
      return { type: '14days', totalDays: 14 } // Show today + next 13 days (14 days total)
    } else if (totalDays === 30) {
      return { type: '30days', totalDays: 30 } // Show today + next 29 days (30 days total)
    } else {
      return { type: 'custom', totalDays } // Show custom date range
    }
  }, [startDate, endDate])

  // Calculate available months for multi-month date ranges
  const calculateAvailableMonths = useMemo(() => {
    if (!startDate || !endDate) return []

    const months: { month: number; year: number; monthName: string }[] = []
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1)

    while (current <= end) {
      months.push({
        month: current.getMonth(),
        year: current.getFullYear(),
        monthName: getMonthName(current.getMonth()) + ' ' + current.getFullYear()
      })
      current.setMonth(current.getMonth() + 1)
    }

    return months
  }, [startDate, endDate])

  // Update available months when date range changes (only if using internal state)
  useEffect(() => {
    if (!propAvailableMonths) {
      setInternalAvailableMonths(calculateAvailableMonths)
      setInternalCurrentMonthIndex(0) // Reset to first month when date range changes
    }
  }, [calculateAvailableMonths, propAvailableMonths])

  // Month navigation functions - use props if available, otherwise use internal state
  const nextMonth = propOnNextMonth ?? (() => {
    setInternalCurrentMonthIndex(prev => Math.min(prev + 1, availableMonths.length - 1))
  })

  const prevMonth = propOnPrevMonth ?? (() => {
    setInternalCurrentMonthIndex(prev => Math.max(prev - 1, 0))
  })

  // Helper function to check if a date should be rendered
  const shouldRenderDate = useCallback((day: CalendarDay) => {
    if (!startDate || !endDate || daySelectionInfo.type === 'normal') return true

    const dayDate = new Date(day.year, day.month, day.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if we're in month navigation mode and if the day belongs to current month
    if (shouldShowMonthNavigation && availableMonths.length > 0) {
      const currentMonth = availableMonths[currentMonthIndex]
      if (currentMonth && (day.month !== currentMonth.month || day.year !== currentMonth.year)) {
        return false
      }
    }

    if (daySelectionInfo.type === '7days') {
      // For 7-day selection: show today + next 7 days (8 days total)
      const endDate7 = new Date(today)
      endDate7.setDate(today.getDate() + 7) // Today + 7 more days = 8 days total

      return dayDate >= today && dayDate <= endDate7
    } else if (daySelectionInfo.type === '14days') {
      // For 14-day selection: show today + next 14 days (15 days total)
      const endDate14 = new Date(today)
      endDate14.setDate(today.getDate() + 14) // Today + 14 more days = 15 days total

      return dayDate >= today && dayDate <= endDate14
    } else if (daySelectionInfo.type === '30days') {
      // For 30-day selection: show today + next 30 days (31 days total)
      const endDate30 = new Date(today)
      endDate30.setDate(today.getDate() + 30) // Today + 30 more days = 31 days total

      return dayDate >= today && dayDate <= endDate30
    } else if (daySelectionInfo.type === 'custom') {
      // For custom selection: show dates within the selected range
      return dayDate >= startDate && dayDate <= endDate
    }

    return true
  }, [daySelectionInfo, startDate, endDate, shouldShowMonthNavigation, availableMonths, currentMonthIndex])

  // Generate calendar data based on live data
  const calendarData = useMemo(() => {
    if (!rateData || !startDate || !endDate) {
      return []
    }

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    if (totalDays === 7 || totalDays === 14 || totalDays === 30) {
      // For predefined ranges (7, 14, 30 days), show data from today onwards
      const today = new Date()
      const endDateFromToday = new Date(today)
      endDateFromToday.setDate(today.getDate() + totalDays - 1) // Today + N-1 days

      // Start from Monday of the week containing today
      const startOfWeek = new Date(today)
      const dayOfWeek = startOfWeek.getDay() // 0 = Sunday, 1 = Monday
      const monday = new Date(startOfWeek)
      monday.setDate(startOfWeek.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)) // Go to Monday

      // Calculate how many weeks we need to cover the range
      const weeksNeeded = Math.ceil(totalDays / 7) + 1 // Add extra week to ensure coverage
      const endOfRange = new Date(monday)
      endOfRange.setDate(monday.getDate() + (weeksNeeded * 7) - 1) // Go to Sunday of last week

      return transformLiveDataToCalendarData(rateData, rateCompData, monday, endOfRange, selectedComparison)
    } else {
      // For custom date ranges, show full weeks but only display data for selected dates
      const startOfWeek = new Date(startDate)
      const dayOfWeek = startOfWeek.getDay() // 0 = Sunday, 1 = Monday
      const monday = new Date(startOfWeek)
      monday.setDate(startOfWeek.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)) // Go to Monday

      // Calculate how many weeks we need to cover the entire range
      const weeksNeeded = Math.ceil(totalDays / 7) + 1 // Add extra week to ensure coverage

      const endOfRange = new Date(monday)
      endOfRange.setDate(monday.getDate() + (weeksNeeded * 7) - 1) // Go to Sunday of last week

      return transformLiveDataToCalendarData(rateData, rateCompData, monday, endOfRange, selectedComparison)
    }
  }, [startDate, endDate, rateData, rateCompData, selectedComparison])

  // Filter weeks that have at least one visible day for mobile navigation
  const visibleWeeks = useMemo(() => {
    return calendarData.filter(week => week.some(day => shouldRenderDate(day)))
  }, [calendarData, shouldRenderDate])

  // Reset current week index when visible weeks change
  useEffect(() => {
    if (currentWeekIndex >= visibleWeeks.length && visibleWeeks.length > 0) {
      setCurrentWeekIndex(0)
    }
  }, [visibleWeeks.length, currentWeekIndex])

  // Memoize competitor data to prevent refresh
  const memoizedCompetitorData = useMemo(() => {
    if (!selectedWeekForCompetitors || !rateData || !rateCompData) return []
    return transformLiveDataToCompetitorData(rateData, rateCompData, selectedWeekForCompetitors, selectedComparison)
  }, [selectedWeekForCompetitors, rateData, rateCompData, selectedComparison])

  // Memoize all competitive data for the entire calendar to prevent constant reloading
  const memoizedAllCompetitiveData = useMemo(() => {
    const competitiveMap = new Map()
    if (!rateData || !rateCompData) return competitiveMap

    calendarData.flat().forEach(day => {
      const competitiveInfo = transformLiveDataToCompetitorData(rateData, rateCompData, [day], selectedComparison)[0]
      const key = `${day.date}-${day.month}-${day.year}`
      competitiveMap.set(key, {
        isMyRateLowest: competitiveInfo?.isMyRateLowest || false,
        isMyRateHighest: competitiveInfo?.isMyRateHighest || false,
        showRateDot: competitiveInfo?.showRateDot || false,
        avgCompsetRate: competitiveInfo?.avgCompsetRate || 0,
        avgCompsetDifference: competitiveInfo?.avgCompsetDifference || '--'
      })
    })
    return competitiveMap
  }, [calendarData, rateData, rateCompData, selectedComparison])

  // Helper function to get competitive data for a day (now uses memoized data)
  const getCompetitiveData = useCallback((day: CalendarDay) => {
    const key = `${day.date}-${day.month}-${day.year}`
    return memoizedAllCompetitiveData.get(key) || {
      isMyRateLowest: false,
      isMyRateHighest: false,
      showRateDot: false,
      avgCompsetRate: 0,
      avgCompsetDifference: '--'
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
      const dayName = weekDays[(date.getDay() + 6) % 7]

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
  }, [calendarData, digitCount])

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

  // Handle loading state and ensure dates are available
  if (isLoading || !startDate || !endDate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading calendar data...</p>
        </div>
      </div>
    )
  }

  // Handle case when no live data is available
  if (!rateData || !rateData.pricePositioningEntites) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-slate-500 dark:text-slate-400 text-lg mb-2">No rate data available</div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Please check your data source and try again</p>
        </div>
      </div>
    )
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
                <th rowSpan={2} className="sticky left-0 z-30 bg-gray-50 text-left py-1.5 pl-4 pr-2 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-36" style={{ width: '141px' }}>
                  Date
                </th>

                {/* Sticky Demand Column */}
                <th rowSpan={2} className="sticky left-40 z-30 bg-gray-50 text-center py-1.5 px-2 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-15" style={{ width: '60px' }}>
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
                <th className="sticky left-84 z-30 bg-blue-50 text-center py-1.5 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-16" style={{ width: '64px' }}>
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
                <th className="text-center py-1.5 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-16" style={{ width: '64px' }}>
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
                <th className="text-center py-1.5 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-16" style={{ width: '64px' }}>
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
              {tableData.map((row, index) => {
                // Get live data from the row
                const day = calendarData.flat()[index];
                if (!day) return null;
                // Get competitor data for this day
                const competitorData = transformLiveDataToCompetitorData(rateData, rateCompData, [day], selectedComparison)[0];

                // Use live data instead of static generation
                const avgCompsetRate = competitorData?.avgCompsetRate || 0;
                const avgCompsetVariance = competitorData?.avgCompsetDifference || '--';
                const hotelLowestRate = day.hotelLowestRate > 0 ? day.hotelLowestRate : '--';
                const hotelVariance = day.rateDifference || '--';
                const subscriberRank = competitorData?.competitors?.find(c => c.hotelName === (rateData?.pricePositioningEntites?.find((e: any) => e.propertyType === 0)?.propertName || 'My Hotel'))?.rank || 1;



                // Use live competitor data
                const competitors = competitorData?.competitors || [];

                return (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 group hover:bg-gray-50"
                  >
                    {/* Sticky Date Column */}
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 py-2 pl-4 pr-2 font-medium text-foreground text-sm border-r border-gray-200" style={{ width: '141px' }}>
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <BarChart3 className="w-3 h-3 text-gray-500" />
                            <span className="text-foreground" style={{ marginLeft: '10px' }}>
                              {row.date.getDate()} {row.date.toLocaleDateString('en', { month: 'short' })} '{row.date.getFullYear().toString().slice(-2)},
                            </span>
                            <span className="text-gray-500">{row.dayName}</span>
                          </div>
                          {day.hasEvent && (
                            <Calendar className="w-3 h-3 text-blue-500" />
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Sticky Demand Column */}
                    <td className="sticky left-40 z-10 bg-white group-hover:bg-gray-50 py-2 px-1 text-center text-sm border-r border-gray-200" style={{ width: '60px' }}>
                      {(() => {
                        // Use MSI (Market Share Index) from live data
                        const demandValue = day.rateEntry?.msi || 0;
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
                      <span className="font-semibold">{avgCompsetRate + ` \u200E ${selectedProperty?.currencySymbol ?? "$"}\u200E `} </span>
                    </td>

                    {/* Sticky Avg. Compset - Variance */}
                    <td className="sticky left-68 z-10 bg-white group-hover:bg-gray-50 py-2 px-1 text-center text-sm border-r border-gray-200">
                      <span className={`text-xs font-medium ${typeof avgCompsetVariance === 'string' && avgCompsetVariance.startsWith('+') ? 'text-red-600' : typeof avgCompsetVariance === 'string' && avgCompsetVariance.startsWith('-') ? 'text-green-600' : 'text-gray-500'}`}>
                        {avgCompsetVariance}
                      </span>
                    </td>

                    {/* Sticky Subscriber - Rate */}
                    <td className="sticky left-84 z-10 bg-blue-50 group-hover:bg-blue-100 py-2 text-center text-sm border-r border-b border-gray-200" style={{ width: '64px' }}>
                      <span className="font-semibold">{hotelLowestRate === 0 ? 'Sold Out' : `${hotelLowestRate} \u200E ${selectedProperty?.currencySymbol ?? "$"}\u200E `}</span>
                    </td>

                    {/* Sticky Subscriber - Variance */}
                    <td className="sticky left-96 z-10 bg-blue-50 group-hover:bg-blue-100 py-2 px-1 text-center text-sm border-r border-b border-gray-200">
                      <span className={`text-xs font-medium ${typeof hotelVariance === 'string' && hotelVariance.startsWith('+') ? 'text-red-600' : typeof hotelVariance === 'string' && hotelVariance.startsWith('-') ? 'text-green-600' : 'text-gray-500'}`}>
                        {hotelVariance}
                      </span>
                    </td>

                    {/* Sticky Subscriber - Inclusions */}
                    <td className="sticky left-108 z-10 bg-blue-50 group-hover:bg-blue-100 py-2 px-1 text-center text-xs border-r border-b border-gray-200">
                      {getInclusionIcon(day.inclusionIcon)}
                    </td>

                    {/* Sticky Subscriber - Rank */}
                    <td className="sticky left-116 z-10 bg-blue-50 group-hover:bg-blue-100 py-2 px-1 text-center text-sm border-r border-b border-gray-200">
                      {subscriberRank}
                    </td>

                    {/* Competitor Hotels Data - First 2 Only */}
                    {competitors.slice(0, 2).map((competitor, compIndex) => (
                      <div key={compIndex}>
                        {/* Rate */}
                        <td className="py-2 text-center text-sm border-r border-gray-200 group-hover:bg-gray-50">
                          <span className="font-semibold">{competitor.rate === 'Closed' ? 'Sold Out' : `${competitor.rate} \u200E ${selectedProperty?.currencySymbol ?? "$"}\u200E `}</span>
                        </td>

                        {/* Variance */}
                        <td className="py-2 px-1 text-center text-sm border-r border-gray-200 group-hover:bg-gray-50">
                          <span className={`text-xs font-medium ${typeof competitor.difference === 'string' && competitor.difference.startsWith('+') ? 'text-red-600' : typeof competitor.difference === 'string' && competitor.difference.startsWith('-') ? 'text-green-600' : 'text-gray-500'}`}>
                            {competitor.difference}
                          </span>
                        </td>

                        {/* Inclusions */}
                        <td className="py-2 px-1 text-center text-xs border-r border-gray-200 group-hover:bg-gray-50">
                          {getInclusionIcon(competitor.inclusionIcon)}
                        </td>

                        {/* Rank */}
                        <td className="py-2 px-1 text-center text-sm border-r border-gray-200 group-hover:bg-gray-50">
                          {competitor.rank}
                        </td>
                      </div>
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
                Week {currentWeekIndex + 1} of {visibleWeeks.length}
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
              disabled={currentWeekIndex === visibleWeeks.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Grid - 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            {visibleWeeks[currentWeekIndex]?.map((day, dayIndex) => {

              const shouldShow = shouldRenderDate(day)
              if (!shouldShow) {
                // Don't show anything for dates outside selected range
                return null
              }
              return (
                <TooltipProvider key={`mobile-day-${day.date}-${day.month}-${day.year}`} delayDuration={0} skipDelayDuration={0}>
                  <Tooltip delayDuration={0} disableHoverableContent>
                    <TooltipTrigger asChild>
                      <Card
                        className={`p-3 h-28 cursor-pointer hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none border ${isToday(day) ? 'border-gray-200 dark:border-gray-500 bg-white dark:bg-slate-900' :
                          (() => {
                            const competitive = getCompetitiveData(day)
                            return competitive.isMyRateHighest ? 'border-red-500 dark:border-red-400 bg-white dark:bg-slate-900' :
                              competitive.isMyRateLowest ? 'border-green-500 dark:border-green-400 bg-white dark:bg-slate-900' :
                                'border-gray-200 dark:border-gray-500 hover:border-gray-400 dark:hover:border-gray-400 bg-white dark:bg-slate-900'
                          })()
                          }`}
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
                              <div className={`text-xs font-medium ${isToday(day)
                                ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center'
                                : 'text-gray-600 dark:text-gray-300'
                                }`}>
                                {day.date}
                              </div>
                              {/* Lightning refresh icon next to date */}
                              {day.hasLightningRefresh && (
                                <div className="ml-1">
                                  <Zap className="w-3 h-3 text-blue-500 fill-current" />
                                </div>
                              )}
                              {/* Event icon after specific margin */}
                              <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                {day.hasEvent ? day.eventIcon : ''}
                              </div>
                            </div>
                            {/* Colored dot on top right - competitive rate indicator */}
                            {(() => {
                              const competitive = getCompetitiveData(day)
                              return competitive.showRateDot && (
                                <div className={`w-2 h-2 rounded-full ${competitive.isMyRateLowest ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
                                  }`} />
                              )
                            })()}
                          </div>

                          {/* Center Section: Hotel Lowest Rate (center aligned) */}
                          <div className="text-center mb-1">
                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {day.hotelLowestRate > 0 ? day.hotelLowestRate.toLocaleString('en-US') : '--'}
                            </div>
                          </div>

                          {/* Center Section: Difference vs Last Period (center aligned) */}
                          <div className="text-center mb-2">
                            <div className={`text-xs font-medium ${day.rateDifference.startsWith('+') ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'
                              }`}>
                              {day.rateDifference}
                            </div>
                          </div>

                          {/* Bottom Section: Room Type & Inclusions (center aligned) */}
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                {day.abbreviation}
                              </span>
                              {day.hasInclusion && (
                                getInclusionIcon(day.inclusionIcon)
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
                    {day?.rateEntry?.status == "O" &&
                      <TooltipContent side="top" className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-4 pr-6 w-[548px] z-[10001]">
                        <div>
                          <div className="mb-2">
                            <div className="flex justify-between items-center">
                              <h3 className="text-gray-900 dark:text-white">
                                <span className="text-base font-bold">{format(day.fulldate, "dd MMM yyyy")}</span>
                                <span className="text-sm font-normal">, {(() => {
                                  const date = new Date(day.year, day.month, day.date)
                                  return weekDays[(date.getDay() + 6) % 7]
                                })()}</span>
                              </h3>
                              {(() => {
                                const competitive = getCompetitiveData(day)
                                if (competitive.showRateDot) {
                                  return (
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2.5 h-2.5 rounded-full ${competitive.isMyRateLowest ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
                                        }`} />
                                      <span className={`text-xs font-medium ${competitive.isMyRateLowest ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
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
                              {day?.rateEntry?.hoverPropertyName}
                            </div>
                          </div>

                          <div className="space-y-3 mb-3">
                            <div className="grid gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-1" style={{ gridTemplateColumns: '115px 135px 135px 120px' }}>
                              <div className="text-left">Lowest Rate</div>
                              <div className="text-left">Room</div>
                              <div className="text-left">Inclusion</div>
                              <div className="text-left">Channel</div>
                            </div>

                            <div className="grid gap-2 text-xs mt-2" style={{ gridTemplateColumns: '115px 135px 135px 120px' }}>
                              <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden text-left" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {day.hotelLowestRate > 0 ? `\u200E ${selectedProperty?.currencySymbol ?? "$"}\u200E ` + day.hotelLowestRate.toLocaleString('en-US') : '--'}
                              </div>
                              <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden text-left" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {day?.roomType} {day?.roomType ? " (" + day?.abbreviation + ")" : ""}
                              </div>
                              <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden text-left" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                <div className="flex items-start gap-1">
                                  {getInclusionIcon(day.inclusionIcon)}
                                  <div className="text-wrap">
                                    {(() => {
                                      const inclusionText = day?.rateEntry?.inclusion?.toString() || '';
                                      if (inclusionText.length <= 19) {
                                        return <span>{inclusionText}</span>;
                                      }

                                      const firstLine = inclusionText.substring(0, 19);
                                      const remaining = inclusionText.substring(19);
                                      const secondLine = remaining.length > 14
                                        ? remaining.substring(0, 14) + "..."
                                        : remaining;

                                      return (
                                        <div>
                                          <div>{firstLine}</div>
                                          <div>{secondLine}</div>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                              <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden text-left" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {day?.rateEntry?.channelName || 'N/A'}
                              </div>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="flex items-start gap-6">
                              {/* Avg. Compset Section */}
                              <div className="text-xs text-black dark:text-gray-100">
                                <div className="text-left whitespace-nowrap">
                                  <span className="font-bold">{`\u200E ${selectedProperty?.currencySymbol ?? "$"}\u200E `} {(() => {
                                    const competitive = getCompetitiveData(day)
                                    const avgCompsetRate = competitive?.avgCompsetRate || 0
                                    return avgCompsetRate > 0 ? avgCompsetRate.toLocaleString('en-US') : '--'
                                  })()}</span> <span className="font-medium">- Avg. Compset</span>
                                </div>
                              </div>

                              {/* Events Section with 24px margin */}
                              {day.hasEvent && day?.rateEntry?.event?.eventDetails?.length > 0 && (
                                <div style={{ marginLeft: '24px' }}>
                                  <div className="flex items-center gap-2">
                                    <Star className="w-3 h-3 text-amber-500 fill-current" />
                                    <div className="text-xs text-gray-800 dark:text-gray-200">
                                      {day?.rateEntry?.event?.eventDetails[0]?.eventName || 'Event'}
                                    </div>
                                    {day?.rateEntry?.event?.eventDetails?.length > 1 && (
                                      <div style={{ paddingLeft: '0px' }}>
                                        <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                          (+{day?.rateEntry?.event?.eventDetails?.length - 1} more)
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                            <div className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed text-left">
                              {day?.rateEntry?.shortRateDescription}
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    }
                  </Tooltip>
                </TooltipProvider>
              )
            })}
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
          {calendarData
            .filter(week => week.some(day => shouldRenderDate(day))) // Only show weeks with at least one visible day
            .map((week, weekIndex) => (
              <div key={weekIndex}>
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
                  {week.map((day, dayIndex) => {
                    const shouldShow = shouldRenderDate(day)
                    if (!shouldShow) {
                      // Don't show anything for dates outside selected range
                      return (
                        <div
                          key={`desktop-blank-${dayIndex}`}
                          className="h-16"
                        >
                        </div>
                      )
                    }
                    return (
                      <TooltipProvider key={`desktop-day-${day.date}-${day.month}-${day.year}`} delayDuration={0} skipDelayDuration={0}>
                        <Tooltip delayDuration={0} disableHoverableContent>
                          <TooltipTrigger asChild>
                            <Card
                              className={`p-2 min-h-fit hover:shadow-lg transition-all duration-200 relative cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none border ${isToday(day) ? 'border-gray-200 dark:border-gray-500 bg-white dark:bg-slate-900' :
                                (() => {
                                  const competitive = getCompetitiveData(day)
                                  return competitive.isMyRateHighest ? 'border-red-500 dark:border-red-400 bg-white dark:bg-slate-900' :
                                    competitive.isMyRateLowest ? 'border-green-500 dark:border-green-400 bg-white dark:bg-slate-900' :
                                      'border-gray-200 dark:border-gray-500 hover:border-gray-400 dark:hover:border-gray-400 bg-white dark:bg-slate-900'
                                })()
                                }`}
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
                                    <div className={`text-xs font-medium ${isToday(day)
                                      ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center'
                                      : 'text-gray-600 dark:text-gray-300'
                                      }`}>
                                      {day.date}
                                    </div>
                                    {/* Lightning refresh icon next to date */}
                                    {day.hasLightningRefresh && (
                                      <div className="ml-1">
                                        <Zap className="w-3 h-3 text-blue-500 fill-current" />
                                      </div>
                                    )}
                                  </div>
                                  {/* Colored dot on top right - competitive rate indicator */}
                                  {(() => {
                                    const competitive = getCompetitiveData(day)
                                    return competitive.showRateDot && (
                                      <div className={`w-2 h-2 rounded-full ${competitive.isMyRateLowest ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
                                        }`} />
                                    )
                                  })()}
                                </div>
                                {/* Row 2: Hotel Lowest Rate */}
                                <div className="text-center rounded">
                                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                    {day.hotelLowestRate > 0 ? day.hotelLowestRate.toLocaleString('en-US') : ''}
                                  </div>
                                </div>
                                {/* Row 3: Difference vs Last Period */}
                                <div className="text-center rounded pb-2">
                                  <div className={`text-xs font-medium ${day.rateDifference.startsWith('+') ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'
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
                                      {day.abbreviation}
                                    </span>
                                    {day.hasInclusion && (
                                      getInclusionIcon(day.inclusionIcon)
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </TooltipTrigger>
                          {
                            day.rateEntry?.status === "O"
                            &&
                            <TooltipContent side="top" className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-4 pr-6 w-[548px] z-[10001]">
                              <div>
                                <div className="mb-2">
                                  <div className="flex justify-between items-center">
                                    <h3 className="text-gray-900 dark:text-white">
                                      <span className="text-base font-bold">{format(day.fulldate, "dd MMM yyyy")}</span>
                                      <span className="text-sm font-normal">, {(() => {
                                        const date = new Date(day.year, day.month, day.date)
                                        return weekDays[(date.getDay() + 6) % 7]
                                      })()}</span>
                                    </h3>
                                    {(() => {
                                      const competitive = getCompetitiveData(day)
                                      if (competitive.showRateDot) {
                                        return (
                                          <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${competitive.isMyRateLowest ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
                                              }`} />
                                            <span className={`text-xs font-medium ${competitive.isMyRateLowest ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
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
                                    {day?.rateEntry?.hoverPropertyName}
                                  </div>
                                </div>

                                <div className="space-y-3 mb-3">
                                  <div className="grid gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-1" style={{ gridTemplateColumns: '115px 135px 135px 120px' }}>
                                    <div className="text-left">Lowest Rate</div>
                                    <div className="text-left">Room</div>
                                    <div className="text-left">Inclusion</div>
                                    <div className="text-left">Channel</div>
                                  </div>

                                  <div className="grid gap-2 text-xs mt-2" style={{ gridTemplateColumns: '115px 135px 135px 120px' }}>
                                    <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden text-left" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                      {day.hotelLowestRate > 0 ? `\u200E ${selectedProperty?.currencySymbol ?? "$"}\u200E ` + day.hotelLowestRate.toLocaleString('en-US') : '--'}
                                    </div>
                                    <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden text-left" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                      {day?.roomType} {day?.roomType ? " (" + day?.abbreviation + ")" : ""}
                                    </div>
                                    <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden text-left" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                      <div className="flex items-start gap-1">
                                        {getInclusionIcon(day.inclusionIcon)}
                                        <div className="text-wrap">
                                          {(() => {
                                            const inclusionText = day?.rateEntry?.inclusion?.toString() || '';
                                            if (inclusionText.length <= 19) {
                                              return <span>{inclusionText}</span>;
                                            }

                                            const firstLine = inclusionText.substring(0, 19);
                                            const remaining = inclusionText.substring(19);
                                            const secondLine = remaining.length > 14
                                              ? remaining.substring(0, 14) + "..."
                                              : remaining;

                                            return (
                                              <div>
                                                <div>{firstLine}</div>
                                                <div>{secondLine}</div>
                                              </div>
                                            );
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden text-left" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                      {day?.rateEntry?.channelName || 'N/A'}
                                    </div>
                                  </div>
                                </div>

                                <div className="mb-3">
                                  <div className="flex items-start gap-6">
                                    {/* Avg. Compset Section */}
                                    <div className="text-xs text-black dark:text-gray-100">
                                      <div className="text-left whitespace-nowrap">
                                        <span className="font-bold">{`\u200E ${selectedProperty?.currencySymbol ?? "$"}\u200E `} {(() => {
                                          const competitive = getCompetitiveData(day)
                                          const avgCompsetRate = competitive?.avgCompsetRate || 0
                                          return avgCompsetRate > 0 ? avgCompsetRate.toLocaleString('en-US') : '--'
                                        })()}</span> <span className="font-medium">- Avg. Compset</span>
                                      </div>
                                    </div>

                                    {/* Events Section with 24px margin */}
                                    {day.hasEvent && day?.rateEntry?.event?.eventDetails?.length > 0 && (
                                      <div style={{ marginLeft: '24px' }}>
                                        <div className="flex items-center gap-2">
                                          <Star className="w-3 h-3 text-amber-500 fill-current" />
                                          <div className="text-xs text-gray-800 dark:text-gray-200">
                                            {day?.rateEntry?.event?.eventDetails[0]?.eventName || 'Event'}
                                          </div>
                                          {day?.rateEntry?.event?.eventDetails?.length > 1 && (
                                            <div style={{ paddingLeft: '0px' }}>
                                              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                                (+{day?.rateEntry?.event?.eventDetails?.length - 1} more)
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                                  <div className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed text-left">
                                    {day?.rateEntry?.shortRateDescription}
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>}
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </div>


                {/* Inline Competitor Table */}
                {expandedWeekIndex === weekIndex && selectedWeekForCompetitors && (
                  <div className="mt-2">
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden mb-[18px]">


                      <div className="overflow-x-auto">
                        {/* Fixed Avg. Compset Row */}
                        <div className="grid" style={{ gridTemplateColumns: `1fr repeat(7, 1fr)` }}>
                          {/* Hotel Names Column - Avg. Compset */}
                          <div>
                            <div className="px-2 py-0.5 text-xs font-medium text-gray-900 dark:text-gray-100 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800/60 border-0 h-12 flex items-center border-b border-b-gray-300 dark:border-b-gray-500 transition-colors duration-200" style={{ width: '120px' }}>
                              <div className="truncate w-full font-semibold" style={{ width: '120px' }}>
                                Avg. Compset
                              </div>
                            </div>
                          </div>

                          {/* Date Columns for Avg. Compset - Always show 7 columns, populate only visible dates */}
                          {selectedWeekForCompetitors.map((day, dayIndex) => {

                            const isVisible = shouldRenderDate(day);
                            const competitorData = memoizedCompetitorData[dayIndex];
                            const avgRate = competitorData?.avgCompsetRate || 0;
                            const avgDiff = competitorData?.avgCompsetDifference || '--';

                            return (
                              <div key={`avg-${dayIndex}`}>
                                <div className="px-2 py-0.5 text-center border-0 bg-blue-100 dark:bg-blue-900/50 h-12 flex items-center justify-center border-b border-b-gray-300 dark:border-b-gray-500">
                                  <div className="flex flex-col items-center">
                                    {isVisible ? (
                                      <>
                                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                          {avgRate > 0 ? avgRate.toLocaleString('en-US') : '--'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <span className={`text-xs font-medium ${avgDiff.startsWith('+') ? 'text-red-500 dark:text-red-400' : avgDiff.startsWith('-') ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                                            }`}>
                                            {avgDiff}
                                          </span>
                                          {Math.random() > 0.5 && (
                                            <Zap className="w-3 h-3 text-blue-500 fill-current" />
                                          )}
                                        </div>
                                      </>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Scrollable Competitor Rows */}
                        <div className="grid max-h-60 overflow-y-auto" style={{ gridTemplateColumns: `1fr repeat(7, 1fr)` }}>
                          {/* Hotel Names Column */}
                          <div>
                            {memoizedCompetitorData[0]?.competitors.map((_, compIndex) => {
                              const isLastRow = compIndex === memoizedCompetitorData[0]?.competitors.length - 1;
                              return (
                                <div key={compIndex} className={`px-2 py-0.5 text-xs font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/60 border-0 h-12 flex items-center transition-colors duration-200 ${!isLastRow ? 'border-b border-b-gray-300 dark:border-b-gray-500' : ''}`} style={{ width: '120px' }}>
                                  <div className="truncate w-full" title={memoizedCompetitorData[0]?.competitors[compIndex]?.hotelName} style={{ width: '120px' }}>
                                    {memoizedCompetitorData[0]?.competitors[compIndex]?.hotelName}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Date Columns aligned with calendar - Always show 7 columns, populate only visible dates */}
                          {selectedWeekForCompetitors.map((day, dayIndex) => {
                            const isVisible = shouldRenderDate(day);
                            return (
                              <div key={dayIndex}>
                                {memoizedCompetitorData[0]?.competitors.map((_, compIndex) => {
                                  debugger
                                  const competitorData = memoizedCompetitorData[dayIndex]
                                  const competitor = competitorData?.competitors[compIndex]
                                  const isLastRow = compIndex === memoizedCompetitorData[0]?.competitors.length - 1;
                                  const hotelName = memoizedCompetitorData[0]?.competitors[compIndex]?.hotelName || '';

                                  return (
                                    <div>
                                      {isVisible ? (
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
                                                      <div className={`w-2 h-2 rounded-full ${competitor?.isLowest ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
                                                        }`} />
                                                    )}
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-medium ${competitor?.difference.startsWith('+') ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'
                                                      }`}>
                                                      {competitor?.difference}
                                                    </span>
                                                    {Math.random() > 0.6 && (
                                                      <Zap className="w-3 h-3 text-blue-500 fill-current" />
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            </TooltipTrigger>
                                            {
                                              competitor?.rateEntry?.status == "O" &&

                                              <TooltipContent side="top" className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-4 pr-6 w-[548px] z-[10001]">
                                                <div>
                                                  <div className="mb-2">
                                                    <div className="flex justify-between items-center">
                                                      <h3 className="text-gray-900 dark:text-white">
                                                        <span className="text-base font-bold">{format(day.fulldate, "dd MMM yyyy")}</span>
                                                        <span className="text-sm font-normal">, {(() => {
                                                          const date = new Date(day.year, day.month, day.date)
                                                          return weekDays[(date.getDay() + 6) % 7]
                                                        })()}</span>
                                                      </h3>
                                                      {(() => {
                                                        // Show competitor's status if they have highest/lowest rate
                                                        if (competitor?.isLowest || competitor?.isHighest) {
                                                          return (
                                                            <div className="flex items-center gap-2">
                                                              <div className={`w-2.5 h-2.5 rounded-full ${competitor?.isLowest ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
                                                                }`} />
                                                              <span className={`text-xs font-medium ${competitor?.isLowest ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                                }`}>
                                                                {competitor?.isLowest ? 'Lowest Rate' : 'Highest Rate'}
                                                              </span>
                                                            </div>
                                                          )
                                                        }
                                                        return null
                                                      })()}
                                                    </div>
                                                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-1 mb-4 text-left">
                                                      {hotelName}
                                                    </div>
                                                  </div>

                                                  <div className="space-y-3 mb-3">
                                                    <div className="grid gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-1" style={{ gridTemplateColumns: '115px 135px 135px 120px' }}>
                                                      <div className="text-left">Lowest Rate</div>
                                                      <div className="text-left">Room</div>
                                                      <div className="text-left">Inclusion</div>
                                                      <div className="text-left">Channel</div>
                                                    </div>

                                                    <div className="grid gap-2 text-xs mt-2" style={{ gridTemplateColumns: '115px 135px 135px 120px' }}>
                                                      <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden text-left" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                        {`\u200E ${selectedProperty?.currencySymbol ?? "$"}\u200E ` + competitor?.rate}
                                                      </div>
                                                      <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden text-left" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                        {competitor?.productName} {competitor?.productName && competitor?.productName.length > 0 && competitor?.abbreviation ? " (" + competitor?.abbreviation + ")" : ""}
                                                      </div>
                                                      <div className="font-semibold text-gray-900 dark:text-white text-left">
                                                        <div className="flex items-start gap-1">
                                                          {getInclusionIcon(competitor.inclusionIcon)}
                                                          <div className="text-wrap">
                                                            {(() => {
                                                              const inclusionText = competitor?.inclusion?.toString() || '';
                                                              if (inclusionText.length <= 19) {
                                                                return <span>{inclusionText}</span>;
                                                              }

                                                              const firstLine = inclusionText.substring(0, 19);
                                                              const remaining = inclusionText.substring(19);
                                                              const secondLine = remaining.length > 14
                                                                ? remaining.substring(0, 14) + "..."
                                                                : remaining;

                                                              return (
                                                                <div>
                                                                  <div>{firstLine}</div>
                                                                  <div>{secondLine}</div>
                                                                </div>
                                                              );
                                                            })()}
                                                          </div>
                                                        </div>
                                                      </div>
                                                      <div className="font-semibold text-gray-900 dark:text-white text-left">
                                                        {(() => {
                                                          const channelName = competitor?.channelName || 'N/A';
                                                          return channelName.length > 14
                                                            ? channelName.substring(0, 14) + "..."
                                                            : channelName;
                                                        })()}
                                                      </div>
                                                    </div>
                                                  </div>

                                                  <div className="mb-3">
                                                    <div className="flex items-start gap-6">
                                                      {/* Avg. Compset Section */}
                                                      <div className="text-xs text-black dark:text-gray-100">
                                                        <div className="text-left whitespace-nowrap">
                                                          <span className="font-bold">{`\u200E ${selectedProperty?.currencySymbol ?? "$"}\u200E `} {(() => {
                                                            const competitive = getCompetitiveData(day)
                                                            const avgCompsetRate = competitive?.avgCompsetRate || 0
                                                            return avgCompsetRate > 0 ? avgCompsetRate.toLocaleString('en-US') : '--'
                                                          })()}</span> <span className="font-medium">- Avg. Compset</span>
                                                        </div>
                                                      </div>

                                                      {/* Events Section with 24px margin */}
                                                      {competitor?.rateEntry?.event?.eventDetails?.length > 0 && (
                                                        <div style={{ marginLeft: '24px' }}>
                                                          <div className="flex items-center gap-2">
                                                            <Star className="w-3 h-3 text-amber-500 fill-current" />
                                                            <div className="text-xs text-gray-800 dark:text-gray-200">
                                                              {competitor?.rateEntry?.event?.eventDetails[0]?.eventName || 'Event'}
                                                            </div>
                                                            {competitor?.rateEntry?.event?.eventDetails?.length > 1 && (
                                                              <div style={{ paddingLeft: '0px' }}>
                                                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                                                  (+{competitor?.rateEntry?.event?.eventDetails?.length - 1} more)
                                                                </span>
                                                              </div>
                                                            )}
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>

                                                  <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                                                    <div className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed text-left">
                                                      {competitor?.rateEntry?.shortRateDescription}
                                                    </div>
                                                  </div>
                                                </div>
                                              </TooltipContent>
                                            }
                                          </Tooltip>
                                        </TooltipProvider>
                                      ) : (
                                        <div className={`px-2 py-0.5 text-center border-0 bg-white dark:bg-slate-900 h-12 flex items-center justify-center transition-colors duration-200 ${!isLastRow ? 'border-b border-b-gray-300 dark:border-b-gray-500' : ''}`}>
                                          <div className="flex flex-col items-center">
                                            {/* Blank cell - no content */}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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

// Export month navigation component for use in parent
export function MonthNavigation({
  shouldShowMonthNavigation,
  availableMonths,
  currentMonthIndex,
  onPrevMonth,
  onNextMonth
}: {
  shouldShowMonthNavigation: boolean
  availableMonths: { month: number; year: number; monthName: string }[]
  currentMonthIndex: number
  onPrevMonth: () => void
  onNextMonth: () => void
}) {
  if (!shouldShowMonthNavigation || availableMonths.length === 0) {
    return null
  }

  const currentMonth = availableMonths[currentMonthIndex]
  const canGoPrev = currentMonthIndex > 0
  const canGoNext = currentMonthIndex < availableMonths.length - 1

  return (
    <TooltipProvider delayDuration={500} skipDelayDuration={100}>
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevMonth}
              disabled={!canGoPrev}
              className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-black text-white text-xs px-3 py-2" sideOffset={5}>
            Previous Month
          </TooltipContent>
        </Tooltip>

        <span className="text-base font-semibold text-black dark:text-white px-0.5" style={{ marginLeft: '8px', marginRight: '8px' }}>
          {currentMonth?.monthName || 'Loading...'}
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNextMonth}
              disabled={!canGoNext}
              className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-black text-white text-xs px-3 py-2" sideOffset={5}>
            Next Month
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
