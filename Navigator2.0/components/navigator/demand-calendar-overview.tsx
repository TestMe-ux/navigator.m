"use client"

import { useState, useMemo, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Info
} from "lucide-react"
import { cn, conevrtDateforApi, escapeCSVValue } from "@/lib/utils"
import { GetDemandAIData } from "@/lib/demand"
import localStorageService from "@/lib/localstorage"
import { addDays, format } from "date-fns"


/**
 * Calendar Event Interface
 * Simple structure for calendar events
 */
interface CalendarEvent {
  date: Date
  title: string
  type: "conference" | "festival" | "exhibition" | "sports" | "cultural" | "business"
  impact: "low" | "normal" | "high" | "veryhigh"
  location?: string
}

/**
 * Calendar Day Interface
 * Simplified structure for calendar days
 */
interface CalendarDay {
  date: Date
  dayNumber: number
  dayName: string
  isToday: boolean
  isCurrentMonth: boolean
  events: CalendarEvent[]
  hasEvents: boolean
  demandLevel: 'low' | 'normal' | 'high' | 'veryhigh' | ''
  demedandIndex?: number
  hasEventIcon?: boolean
  eventName?: string
  eventCategory?: string
  eventImpact?: string
  eventDateRange?: string
  totalEvents?: number
  displayedEvents?: string[]
  isDisabled?: boolean
}

/**
 * Get demand level from demand index
 */
const getDemandLevelFromIndex = (demandIndex: number): CalendarDay['demandLevel'] => {
  if (demandIndex < 25) return 'low'
  if (demandIndex < 50) return 'normal'
  if (demandIndex < 75) return 'high'
  return 'veryhigh'
}

/**
 * Get Demand Level Styling
 * Returns styling for demand level cells (76% background opacity, 100% border opacity)
 * Uses 2-color shading: Light and Dark shades for better visual distinction
 */
const getDemandStyling = (demandLevel: CalendarDay['demandLevel'], isSelected = false, isDisabled = false) => {
  const baseStyle = (() => {
    switch (demandLevel) {
      case 'low':
        return {
          bg: 'bg-blue-300/[76%]', // Light shade of Normal blue
          border: 'border border-blue-300',
          text: 'text-white',
          day: 'bg-blue-300',
          indicator: 'bg-blue-300'
        }
      case 'normal':
        return {
          bg: 'bg-blue-500/[76%]', // Original blue - unchanged
          border: 'border border-blue-500',
          text: 'text-white',
          day: 'bg-blue-500',
          indicator: 'bg-blue-500'
        }
      case 'high':
        return {
          bg: 'bg-red-300/[76%]', // Light shade of High red
          border: 'border border-red-300',
          text: 'text-white',
          day: 'bg-red-300',
          indicator: 'bg-red-300'
        }
      case 'veryhigh':
        return {
          bg: 'bg-red-600/[76%]', // Original red - unchanged
          border: 'border border-red-600',
          text: 'text-white',
          day: 'bg-red-600',
          indicator: 'bg-red-600'
        }
      default:
        return {
          bg: 'bg-blue-300/[76%]',
          border: 'border border-blue-300',
          text: 'text-white',
          day: 'bg-blue-300',
          indicator: 'bg-blue-300'
        }
    }
  })()

  if (isDisabled) {
    return {
      ...baseStyle,
      bg: 'bg-white',
      border: 'border border-gray-200',
      text: 'text-gray-400',
      day: 'bg-white',
      indicator: 'bg-white'
    }
  }

  return baseStyle
}


const generateMonthDays = (year: number, month: number, today: Date, sid: number, demandData: any[] = []): CalendarDay[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const startPadding = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 // Monday = 0
  const days: CalendarDay[] = []

  // Add empty cells for proper day alignment
  for (let i = 0; i < startPadding; i++) {
    days.push(null as any) // Empty placeholder for alignment
  }

  // Add current month days only
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)

    // Find demand data for this specific date
    const dateString = date.toISOString().split('T')[0] // Format: YYYY-MM-DD
    const demandItem = demandData.find((item: any) => {
      const itemDate = new Date(item.checkinDate).toISOString().split('T')[0]
      return itemDate === dateString
    })

    // Use actual demand index if available, otherwise default to 'normal'
    const demandLevel = demandItem
      ? getDemandLevelFromIndex(demandItem.demandIndex)
      : ''

    days.push({
      date,
      dayNumber: day,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: date.toDateString() === today.toDateString(),
      isCurrentMonth: true,
      events: [], // Events are only shown as star icons, not in cell styling
      hasEvents: false, // Events are only shown as star icons, not in cell styling
      demandLevel,
      demedandIndex: demandItem?.demandIndex
    })
  }

  return days
}
function DemandCalendarOverviewInner({ eventData, holidayData }: any, csvRef: any) {
  // const { startDate, endDate } = useDateContext();
  const [demandData, setDemandData] = useState<any>([])
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isClient, setIsClient] = useState(false)
  const [hiddenDemandLevels, setHiddenDemandLevels] = useState<Set<CalendarDay['demandLevel']>>(
    new Set([])
  )
  const selectedProperty: any = localStorageService.get('SelectedProperty')
  const fetchedSIDRef = useRef<number | null>(null)
  useImperativeHandle(csvRef, () => ({
    handleDownloadCSV,
  }));

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  const fetchDemandData = () => {
    const today = new Date()
    const endDates = new Date(today)
    endDates.setDate(today.getDate() + 74) // 75 days from today
    const currentSID = selectedProperty?.sid
    try {
      GetDemandAIData({
        SID: currentSID,
        startDate: conevrtDateforApi(today.toString()),
        endDate: conevrtDateforApi(endDates.toString())
      }).then((response: any) => {

        if (response.status && response.body?.optimaDemand) {
          setDemandData(response.body.optimaDemand)
          console.log('✅ Demand data fetched:', response.body.optimaDemand.length, 'days')
        }
      })
    } catch (error) {
      console.error('❌ Error fetching demand data:', error)
      throw error // Re-throw to be caught by the parent
    }
  }



  // Fetch demand data for 75 days - only once when component mounts or SID changes
  useEffect(() => {

    const currentSID = selectedProperty?.sid

    // Only fetch if we have a SID and haven't fetched for this SID yet
    if (currentSID && fetchedSIDRef.current !== currentSID) {
      fetchedSIDRef.current = currentSID // Mark this SID as being fetched
      fetchDemandData();
    }
  }, [selectedProperty?.sid])

  /**
   * Handle demand level legend click to toggle visibility
   */
  const toggleDemandLevel = (level: CalendarDay['demandLevel']) => {
    setHiddenDemandLevels(prev => {
      const newSet = new Set(prev)
      if (newSet.has(level)) {
        newSet.delete(level)
      } else {
        newSet.add(level)
      }
      return newSet
    })
  }

  /**
   * Get default styling for hidden demand levels
   */
  const getDefaultStyling = () => ({
    bg: 'bg-white dark:bg-slate-800',
    border: 'border border-slate-200 dark:border-slate-700',
    text: 'text-slate-500 dark:text-slate-400'
  })

  /**
   * Generate tooltip content for calendar days
   */
  const generateTooltipContent = (day: CalendarDay) => {
    return (
      <>
        <div className="font-semibold">{day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
        <div className="text-xs text-gray-300 capitalize">{day.demandLevel ? day.demandLevel.replace('-', ' ') + ' demand' : 'No demand data'}</div>
        {day.hasEventIcon && (
          <>
            <div className="border-t border-gray-600 my-1 pt-1">
              {/* <div className="font-semibold text-amber-400 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400" />
                {day.eventName}
              </div> */}
              <div className="font-semibold text-amber-400 flex items-start gap-1">
                <Star className="w-3 h-3 fill-amber-400 shrink-0" />
                <span
                  className={`flex-1 ${(day.eventName?.length ?? 0) > 28
                    ? "flex-1 whitespace-normal break-words max-w-[28ch]"
                    : "flex-1 truncate"
                    }`}
                >
                  {day.eventName}
                </span>
              </div>
              {day.eventCategory && (
                <div className="text-xs text-gray-300">{day.eventCategory}</div>
              )}
              {day.eventImpact && (
                <div className="text-xs text-gray-300">{day.eventImpact} Impact</div>
              )}
              {day.eventDateRange && (
                <div className="text-xs text-gray-300 mb-1">{day.eventDateRange}</div>
              )}
              {day.totalEvents && day.totalEvents > 1 && (
                <div className="text-xs text-gray-300">+{day.totalEvents - 1} more events</div>
              )}
            </div>
          </>
        )}
      </>
    )
  }

  /**
   * Generate event icons based on actual event data
   */
  const generateEventIcons = (days: CalendarDay[]): CalendarDay[] => {
    // const eventsData = eventData || []
    const mergedEventandHoliday = [
      ...(Array.isArray(eventData) ? eventData : []),
      ...(Array.isArray(holidayData) ? holidayData : [])
    ];


    return days.map(day => {
      if (!day) return day

      // Find events that match this specific date
      const matchingEvents = mergedEventandHoliday.filter((event: any) => {
        const fromDate = new Date(event.eventFrom)
        const toDate = new Date(event.eventTo)
        const dataDate = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate())

        return dataDate >= fromDate && dataDate <= toDate
      })

      if (matchingEvents.length > 0) {
        // Get the first event for display
        const firstEvent = matchingEvents[0]

        // Create event names array for tooltip
        const eventNames = matchingEvents.map((event: any) => event.eventName)

        // Create date range if it's a multi-day event
        const dateRange = firstEvent.eventFrom !== firstEvent.eventTo
          ? `${new Date(firstEvent.eventFrom).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${new Date(firstEvent.eventTo).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`
          : undefined

        return {
          ...day,
          hasEventIcon: true,
          eventName: firstEvent.eventName,
          eventCategory: firstEvent.formattedEventType || firstEvent.eventType,
          eventImpact: firstEvent.eventImpact,
          totalEvents: matchingEvents.length,
          displayedEvents: eventNames,
          eventDateRange: dateRange
        }
      }

      return {
        ...day,
        hasEventIcon: false,
        eventName: undefined,
        eventCategory: undefined,
        eventImpact: undefined,
        totalEvents: 0,
        displayedEvents: []
      }
    })
  }

  /**
   * Handle day selection
   */
  const handleDayClick = (day: CalendarDay) => {
    if (day.events.length > 0) {
      console.log('📅 Selected day with events:', {
        date: day.date.toLocaleDateString(),
        events: day.events.map(e => e.title)
      })
      setSelectedDay(day.date)
    }
  }

  /**
   * Navigate months
   */
  const navigateMonth = (direction: 'prev' | 'next') => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        // Don't allow going before current month
        if (prev.getMonth() <= currentMonth && prev.getFullYear() <= currentYear) {
          return prev // Don't change if already at current month or before
        }
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        // Don't allow going beyond 1 month ahead from current month
        const maxMonth = currentMonth + 1
        const maxYear = currentYear + Math.floor(maxMonth / 12)
        const normalizedMaxMonth = maxMonth % 12

        if (prev.getMonth() >= normalizedMaxMonth && prev.getFullYear() >= maxYear) {
          return prev // Don't change if already at max month (1 month ahead)
        }
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  // Generate calendar data for current and next two months (total 3 months)
  const todayForCalendar = new Date()
  const maxAllowedDate = addDays(todayForCalendar, 74) //new Date(2025, 9, 25) // October 25, 2025 (month is 0-indexed)

  // Helper function to check if a date should be disabled
  const isDateDisabled = (date: Date) => {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const todayOnly = new Date(todayForCalendar.getFullYear(), todayForCalendar.getMonth(), todayForCalendar.getDate())
    const maxDateOnly = new Date(maxAllowedDate.getFullYear(), maxAllowedDate.getMonth(), maxAllowedDate.getDate())

    return dateOnly < todayOnly || dateOnly > maxDateOnly
  }

  // Check if navigation buttons should be disabled
  const today = new Date()
  const isPrevDisabled = currentDate.getMonth() <= today.getMonth() && currentDate.getFullYear() <= today.getFullYear()

  // Check if next month would have any enabled dates
  const fourthMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 1) // 4th month (3 months ahead)
  const nextMonthYear = fourthMonthDate.getFullYear()
  const nextMonthIndex = fourthMonthDate.getMonth()

  // Get the last day of the next month
  const lastDayOfNextMonth = new Date(nextMonthYear, nextMonthIndex + 1, 0)

  // Check if any date in the next month would be enabled (not disabled)
  let hasEnabledDatesInNextMonth = false
  for (let day = 1; day <= lastDayOfNextMonth.getDate(); day++) {
    const checkDate = new Date(nextMonthYear, nextMonthIndex, day)
    if (!isDateDisabled(checkDate)) {
      hasEnabledDatesInNextMonth = true
      break
    }
  }
  const isNextDisabled = !hasEnabledDatesInNextMonth

  const currentMonthBase = generateMonthDays(currentDate.getFullYear(), currentDate.getMonth(), todayForCalendar, selectedProperty?.sid || 0, demandData)
  const currentMonth = generateEventIcons(currentMonthBase.map(day =>
    day ? { ...day, isDisabled: isDateDisabled(day.date) } : day
  ))

  const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
  const nextMonthBase = generateMonthDays(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), todayForCalendar, selectedProperty?.sid || 0, demandData)
  const nextMonth = generateEventIcons(nextMonthBase.map(day =>
    day ? { ...day, isDisabled: isDateDisabled(day.date) } : day
  ))

  const thirdMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 1)
  const thirdMonthBase = generateMonthDays(thirdMonthDate.getFullYear(), thirdMonthDate.getMonth(), todayForCalendar, selectedProperty?.sid || 0, demandData)
  const thirdMonth = generateEventIcons(thirdMonthBase.map(day =>
    day ? { ...day, isDisabled: isDateDisabled(day.date) } : day
  ))
  const handleDownloadCSV = () => {

    console.log('📊 Downloading data as CSV...')
    // const eventsData = eventData?.eventDetails || []
    const mergedEventandHoliday = [
      ...(Array.isArray(eventData) ? eventData : []),
      ...(Array.isArray(holidayData) ? holidayData : [])
    ];

    console.log('📊 Merged Events and Holidays:', mergedEventandHoliday)
    console.log('📊 Demand Data:', demandData)
    // Create CSV content from trend data
    const headers = ['Date', 'Day', 'Demand Index Value', 'Demand Status', 'Event/Holiday Name', 'Event Duration', 'Event Count']
    //const headers = ['Date', 'Day', 'Demand Index Value', 'Demand Status', 'Event/Holiday Name', 'Event Duration', 'Event Count', 'Event Distance', 'Estimated Visitors']

    const formatDate = (dateStr: string) => {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const capitalizeFirstLetter = (str: string) => {
      if (!str) return '';
      return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };
    const csvContent = [
      headers.join(','),
      ...demandData.map((demand: any) => {
        const matchingEvents = mergedEventandHoliday.filter((event: any) => {
          const fromDate = new Date(event.eventFrom)
          const toDate = new Date(event.eventTo)
          const dataDate = demand.checkinDate ? new Date(demand.checkinDate) : new Date();

          return dataDate >= fromDate && dataDate <= toDate
        })

        const eventNames = matchingEvents.length > 0 ? matchingEvents.map((e: any) => e.eventName).join(', ') : '';
        console.log("eventNames", eventNames);
        return [
          formatDate(demand.checkinDate),
          //new Date(demand.checkinDate).toLocaleDateString('en-US'),
          new Date(demand.checkinDate).toLocaleDateString('en-US', { weekday: 'short' }),
          demand.demandIndex,
          capitalizeFirstLetter(getDemandLevelFromIndex(demand.demandIndex).replace('veryhigh', 'Very High')),
          escapeCSVValue(eventNames),
          matchingEvents.length > 0 ? escapeCSVValue(matchingEvents[0].displayDate) : '',
          matchingEvents.length || 0
          // '',
          // ''
        ]
      })
    ].join('\n')

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `demand-trends-${format(new Date(), 'yyyyMMddHHmmss')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  // Loading state
  if (!isClient) {
    return (
      <section className="w-full bg-gradient-to-r from-slate-50/80 to-blue-50/60 dark:from-slate-900/80 dark:to-slate-800/60 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3"></div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 42 }).map((_, i) => (
                  <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <TooltipProvider>
      <section className="w-full bg-gradient-to-r from-slate-50/80 to-blue-50/60 dark:from-slate-900/80 dark:to-slate-800/60 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-3 lg:py-4">
          <div className="max-w-7xl mx-auto">
            {/* Three Month Calendar Grid - Responsive View */}
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-16">

              {/* Current Month */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-block">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateMonth('prev')}
                          disabled={isPrevDisabled}
                          className="flex items-center justify-center w-8 h-8 p-0"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-black">
                      <p>{isPrevDisabled ? "Previous Month Disabled" : "Previous"}</p>
                    </TooltipContent>
                  </Tooltip>
                  <h4 className="text-base md:text-lg lg:text-[15px] font-semibold text-foreground text-center">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h4>
                  <div className="w-8"></div> {/* Spacer for alignment */}
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-0.5 mb-0.5">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-slate-700 dark:text-slate-300 py-0.5">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {currentMonth.map((day, index) => {
                    // Empty cell for alignment
                    if (!day) {
                      return <div key={index} className="h-8 md:h-10 lg:h-8" />
                    }

                    const isSelected = selectedDay ? day.date.toDateString() === selectedDay.toDateString() : false

                    // Check if demand level is hidden
                    const isDemandHidden = hiddenDemandLevels.has(day.demandLevel)

                    // Use default styling if demand level is hidden, otherwise use demand styling
                    // Events are only shown as star icons, not in cell styling
                    const styling = isDemandHidden
                      ? getDefaultStyling()
                      : getDemandStyling(day.demandLevel, isSelected, day.isDisabled)

                    return (
                      <div
                        key={index}
                        className={cn(
                          "relative h-8 md:h-10 lg:h-8 flex items-center justify-center text-xs md:text-sm lg:text-xs rounded-lg transition-all duration-200",
                          day.isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-105 group",
                          styling.bg,
                          styling.text,
                          styling.border,
                          isSelected && !day.isDisabled ? "ring-2 ring-yellow-400 ring-offset-2 z-10" : "",
                          day.hasEventIcon && !day.isDisabled ? "font-semibold" : "font-medium"
                        )}
                        onClick={() => !day.isDisabled && handleDayClick(day)}
                      >
                        <div className="flex items-center relative z-0" style={{ gap: '3px' }}>
                          <span>{day.dayNumber}</span>
                          {day.hasEventIcon && !day.isDisabled && (
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" style={{ stroke: 'white', strokeWidth: '1px' }} />
                          )}
                        </div>

                        {/* Today indicator - only for enabled dates */}
                        {day.isToday && !day.isDisabled && (
                          <div className="absolute inset-0 rounded-lg border-2 border-blue-500 animate-pulse" />
                        )}

                        {/* Enhanced Hover tooltip with demand and event details - only for enabled dates */}
                        {!day.isDisabled && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                            <div className="font-semibold">{day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                            <div className="text-xs text-gray-300 capitalize">{day.demandLevel.replace('veryhigh', 'Very High')} demand</div>
                            <div className="border-t border-gray-600 my-1 pt-1">
                              <div className="text-xs text-gray-300 capitalize">Demand Index : {day.demedandIndex}</div>
                            </div>
                            {day.hasEventIcon && (
                              <>
                                <div className="border-t border-gray-600 my-1 pt-1">
                                  <div className="font-semibold text-amber-400 flex items-start gap-1">
                                    <Star className="w-3 h-3 fill-amber-400 shrink-0" />
                                    <span
                                      className={`flex-1 ${(day.eventName?.length ?? 0) > 28
                                        ? "flex-1 whitespace-normal break-words max-w-[28ch]"
                                        : "flex-1 truncate"
                                        }`}
                                    >
                                      {day.eventName}
                                    </span>
                                  </div>
                                  {day.eventDateRange && (
                                    <div className="text-xs text-gray-300 mb-1">{day.eventDateRange}</div>
                                  )}
                                  {day.totalEvents && day.totalEvents > 1 && (
                                    <div className="text-xs text-gray-300">+{day.totalEvents - 1} more</div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Next Month */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8"></div> {/* Spacer for alignment */}
                  <h4 className="text-base md:text-lg lg:text-[15px] font-semibold text-foreground text-center">
                    {nextMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h4>
                  <div className="w-8"></div> {/* Spacer for alignment */}
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-0.5 mb-0.5">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-slate-700 dark:text-slate-300 py-0.5">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {nextMonth.map((day, index) => {
                    // Empty cell for alignment
                    if (!day) {
                      return <div key={index} className="h-8 md:h-10 lg:h-8" />
                    }

                    const isSelected = selectedDay ? day.date.toDateString() === selectedDay.toDateString() : false

                    // Check if demand level is hidden
                    const isDemandHidden = hiddenDemandLevels.has(day.demandLevel)

                    // Use default styling if demand level is hidden, otherwise use demand styling
                    // Events are only shown as star icons, not in cell styling
                    const styling = isDemandHidden
                      ? getDefaultStyling()
                      : getDemandStyling(day.demandLevel, isSelected, day.isDisabled)

                    return (
                      <div
                        key={index}
                        className={cn(
                          "relative h-8 md:h-10 lg:h-8 flex items-center justify-center text-xs md:text-sm lg:text-xs rounded-lg transition-all duration-200",
                          day.isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-105 group",
                          styling.bg,
                          styling.text,
                          styling.border,
                          isSelected && !day.isDisabled ? "ring-2 ring-yellow-400 ring-offset-2 z-10" : "",
                          day.hasEventIcon && !day.isDisabled ? "font-semibold" : "font-medium"
                        )}
                        onClick={() => !day.isDisabled && handleDayClick(day)}
                      >
                        <div className="flex items-center relative z-0" style={{ gap: '3px' }}>
                          <span>{day.dayNumber}</span>
                          {day.hasEventIcon && !day.isDisabled && (
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" style={{ stroke: 'white', strokeWidth: '1px' }} />
                          )}
                        </div>

                        {/* Today indicator - only for enabled dates */}
                        {day.isToday && !day.isDisabled && (
                          <div className="absolute inset-0 rounded-lg border-2 border-blue-500 animate-pulse" />
                        )}

                        {/* Enhanced Hover tooltip with demand and event details - only for enabled dates */}
                        {!day.isDisabled && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                            <div className="font-semibold">{day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                            <div className="text-xs text-gray-300 capitalize">{day.demandLevel.replace('veryhigh', 'Very High')} demand</div>
                            <div className="border-t border-gray-600 my-1 pt-1">
                              <div className="text-xs text-gray-300 capitalize">Demand Index : {day.demedandIndex}</div>
                            </div>
                            {day.hasEventIcon && (
                              <>
                                <div className="border-t border-gray-600 my-1 pt-1">
                                  <div className="font-semibold text-amber-400 flex items-start gap-1">
                                    <Star className="w-3 h-3 fill-amber-400 shrink-0" />
                                    <span
                                      className={`flex-1 ${(day.eventName?.length ?? 0) > 28
                                        ? "flex-1 whitespace-normal break-words max-w-[28ch]"
                                        : "flex-1 truncate"
                                        }`}
                                    >
                                      {day.eventName}
                                    </span>
                                  </div>
                                  {day.eventDateRange && (
                                    <div className="text-xs text-gray-300 mb-1">{day.eventDateRange}</div>
                                  )}
                                  {day.totalEvents && day.totalEvents > 1 && (
                                    <div className="text-xs text-gray-300">+{day.totalEvents - 1} more</div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Third Month */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8"></div> {/* Spacer for alignment */}
                  <h4 className="text-base md:text-lg lg:text-[15px] font-semibold text-foreground text-center">
                    {thirdMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h4>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-block">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateMonth('next')}
                          disabled={isNextDisabled}
                          className="flex items-center justify-center w-8 h-8 p-0"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-black">
                      <p>{isNextDisabled ? "Disabled after 75 Days" : "Next"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-0.5 mb-0.5">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-slate-700 dark:text-slate-300 py-0.5">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {thirdMonth.map((day, index) => {
                    // Empty cell for alignment
                    if (!day) {
                      return <div key={index} className="h-8 md:h-10 lg:h-8" />
                    }

                    const isSelected = selectedDay ? day.date.toDateString() === selectedDay.toDateString() : false

                    // Check if demand level is hidden
                    const isDemandHidden = hiddenDemandLevels.has(day.demandLevel)

                    // Use default styling if demand level is hidden, otherwise use demand styling
                    // Events are only shown as star icons, not in cell styling
                    const styling = isDemandHidden
                      ? getDefaultStyling()
                      : getDemandStyling(day.demandLevel, isSelected, day.isDisabled)

                    return (
                      <div
                        key={index}
                        className={cn(
                          "relative h-8 md:h-10 lg:h-8 flex items-center justify-center text-xs md:text-sm lg:text-xs rounded-lg transition-all duration-200",
                          day.isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-105 group",
                          styling.bg,
                          styling.text,
                          styling.border,
                          isSelected && !day.isDisabled ? "ring-2 ring-yellow-400 ring-offset-2 z-10" : "",
                          day.hasEventIcon && !day.isDisabled ? "font-semibold" : "font-medium"
                        )}
                        onClick={() => !day.isDisabled && handleDayClick(day)}
                      >
                        <div className="flex items-center relative z-0" style={{ gap: '3px' }}>
                          <span>{day.dayNumber}</span>
                          {day.hasEventIcon && !day.isDisabled && (
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" style={{ stroke: 'white', strokeWidth: '1px' }} />
                          )}
                        </div>

                        {/* Today indicator - only for enabled dates */}
                        {day.isToday && !day.isDisabled && (
                          <div className="absolute inset-0 rounded-lg border-2 border-blue-500 animate-pulse" />
                        )}

                        {/* Enhanced Hover tooltip with demand and event details - only for enabled dates */}
                        {!day.isDisabled && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                            <div className="font-semibold">{day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                            <div className="text-xs text-gray-300 capitalize">{day.demandLevel.replace('veryhigh', 'Very High')} demand</div>
                            <div className="border-t border-gray-600 my-1 pt-1">
                              <div className="text-xs text-gray-300 capitalize">Demand Index : {day.demedandIndex}</div>
                            </div>
                            {day.hasEventIcon && (
                              <>
                                <div className="border-t border-gray-600 my-1 pt-1">
                                  <div className="font-semibold text-amber-400 flex items-start gap-1">
                                    <Star className="w-3 h-3 fill-amber-400 shrink-0" />
                                    <span
                                      className={`flex-1 ${(day.eventName?.length ?? 0) > 28
                                        ? "flex-1 whitespace-normal break-words max-w-[28ch]"
                                        : "flex-1 truncate"
                                        }`}
                                    >
                                      {day.eventName}
                                    </span>
                                  </div>
                                  {day.eventDateRange && (
                                    <div className="text-xs text-gray-300 mb-1">{day.eventDateRange}</div>
                                  )}
                                  {day.totalEvents && day.totalEvents > 1 && (
                                    <div className="text-xs text-gray-300">+{day.totalEvents - 1} more</div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Demand Levels Legend - Clickable */}
            <div className="mt-6">
              <div className="flex flex-wrap items-center justify-center gap-1 text-xs">
                <div className="flex items-center gap-1 mr-1">
                  <span className="font-semibold text-foreground">Demand</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs bg-slate-800 text-white border-slate-700">
                      <p className="text-sm">
                        Color-coded demand levels help visualize market intensity. Click legend items to show/hide specific demand levels on the calendar.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="font-semibold text-foreground">:</span>
                </div>
                {(() => {
                  const demandLevels = [
                    { key: 'low' as const, label: 'Low', color: 'bg-blue-300' }, // Light blue
                    { key: 'normal' as const, label: 'Normal', color: 'bg-blue-500' }, // Dark blue
                    { key: 'high' as const, label: 'High', color: 'bg-red-300' }, // Light red
                    { key: 'veryhigh' as const, label: 'Very High', color: 'bg-red-600' } // Dark red
                  ]

                  return demandLevels.map(level => {
                    const isHidden = hiddenDemandLevels.has(level.key)
                    return (
                      <button
                        key={level.key}
                        onClick={() => toggleDemandLevel(level.key)}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700",
                          isHidden ? "opacity-50" : "opacity-100"
                        )}
                      >
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          isHidden ? "bg-white border-2 border-slate-300" : level.color
                        )} />
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{level.label}</span>
                      </button>
                    )
                  })
                })()}

                {/* Events/Holidays Legend */}
                <div className="flex items-center gap-2 px-2 py-1" style={{ marginLeft: '43px' }}>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-slate-800 dark:text-slate-200 font-medium text-xs">Events/Holidays</span>
                </div>
              </div>
            </div>

            {/* Selected Day Star Events */}
            {selectedDay && (() => {
              // Find the selected day's star event data
              const selectedDayData = [...currentMonth, ...nextMonth, ...thirdMonth]
                .find(day => day && day.date.toDateString() === selectedDay.toDateString())

              if (!selectedDayData?.hasEventIcon) return null

              return (
                <div className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h4 className="text-lg font-semibold text-foreground mb-4">
                    Event on {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h4>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <div className="flex-1">
                      <h5 className="font-medium text-foreground">{selectedDayData.eventName}</h5>
                      {selectedDayData.eventDateRange && (
                        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                          {selectedDayData.eventDateRange}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {selectedDayData.eventCategory}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {selectedDayData.eventImpact} Impact
                    </Badge>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </section>
    </TooltipProvider>
  )

}
export const DemandCalendarOverview = forwardRef(DemandCalendarOverviewInner);
