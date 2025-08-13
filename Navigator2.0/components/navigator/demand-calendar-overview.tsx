"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Star,
  MapPin,
  Users,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Calendar Event Interface
 * Simple structure for calendar events
 */
interface CalendarEvent {
  date: Date
  title: string
  type: "conference" | "festival" | "exhibition" | "sports" | "cultural" | "business"
  impact: "low" | "normal" | "elevated" | "high"
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
  demandLevel: 'low' | 'normal' | 'elevated' | 'high'
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
 * Generate deterministic demand level for a given date
 */
const generateDemandLevel = (date: Date): CalendarDay['demandLevel'] => {
  // Use date as seed for deterministic generation
  const seed = date.getTime() / (1000 * 60 * 60 * 24) // Days since epoch
  const random = Math.sin(seed) * 10000
  const value = random - Math.floor(random)
  
  // Define demand level probabilities (4 levels)
  if (value < 0.25) return 'low'
  if (value < 0.5) return 'normal'
  if (value < 0.75) return 'elevated'
  return 'high'
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
      case 'elevated':
        return {
          bg: 'bg-red-300/[76%]', // Light shade of High red
          border: 'border border-red-300',
          text: 'text-white',
          day: 'bg-red-300',
          indicator: 'bg-red-300'
        }
      case 'high':
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

/**
 * Get Event Impact Styling
 * Returns styling based on impact level (76% background opacity, 100% border opacity)
 */
const getEventStyling = (events: CalendarEvent[], isToday: boolean = false, isSelected: boolean = false) => {
  // Base styling for days without events
  if (!events.length) {
    if (isToday) {
      return {
        bg: "bg-blue-500/[76%]",
        text: "text-white font-bold",
        border: "border border-blue-500",
        indicator: "",
        hover: "",
        shadow: ""
      }
    }
    return {
      bg: "bg-white dark:bg-slate-800",
      text: "text-slate-600 dark:text-slate-400",
      border: "border border-slate-200 dark:border-slate-700",
      indicator: "",
      hover: "",
      shadow: ""
    }
  }
  
  // Get highest impact event for styling priority
  const impacts = ["high", "elevated", "normal", "low"] as const
  const highestImpact = impacts.find(level => events.some(e => e.impact === level)) || "low"
  
  // Impact-based styling with 76% background opacity and 100% border opacity
  // Using 2-color shading system
  switch (highestImpact) {
    case "high":
      return {
        bg: "bg-red-600/[76%]", // Dark red
        text: "text-white",
        border: "border border-red-600",
        indicator: "bg-red-600",
        hover: "",
        shadow: ""
      }
    case "elevated":
      return {
        bg: "bg-red-300/[76%]", // Light red
        text: "text-white",
        border: "border border-red-300",
        indicator: "bg-red-300",
        hover: "",
        shadow: ""
      }
    case "normal":
      return {
        bg: "bg-blue-500/[76%]", // Dark blue
        text: "text-white",
        border: "border border-blue-500",
        indicator: "bg-blue-500",
        hover: "",
        shadow: ""
      }
    case "low":
    default:
      return {
        bg: "bg-blue-300/[76%]", // Light blue
        text: "text-white",
        border: "border border-blue-300",
        indicator: "bg-blue-300",
        hover: "",
        shadow: ""
      }
  }
}

/**
 * Generate Calendar Events Data
 * Creates realistic events for the next 3 months in Dubai
 */
const generateCalendarEvents = (): CalendarEvent[] => {
  try {
    console.log('📅 Generating calendar events for Dubai market (3 months)')
    
    const today = new Date()
    const events: CalendarEvent[] = []
    
    // Dubai-specific events with realistic dates
    const eventTemplates = [
      { title: "GITEX Technology Week", type: "conference" as const, impact: "high" as const, location: "Dubai World Trade Centre" },
      { title: "Dubai Shopping Festival", type: "festival" as const, impact: "high" as const, location: "Dubai Mall" },
      { title: "Arab Health Exhibition", type: "exhibition" as const, impact: "high" as const, location: "DWTC" },
      { title: "Dubai International Film Festival", type: "cultural" as const, impact: "elevated" as const, location: "Madinat Jumeirah" },
      { title: "Business Leadership Summit", type: "business" as const, impact: "elevated" as const, location: "Burj Al Arab" },
      { title: "Dubai Marathon", type: "sports" as const, impact: "high" as const, location: "Dubai Marina" },
      { title: "Middle East Energy Conference", type: "conference" as const, impact: "normal" as const, location: "DWTC" },
      { title: "Dubai Food Festival", type: "festival" as const, impact: "elevated" as const, location: "Various Locations" },
      { title: "Gulfood Exhibition", type: "exhibition" as const, impact: "high" as const, location: "Dubai World Trade Centre" },
      { title: "Dubai Airshow", type: "exhibition" as const, impact: "high" as const, location: "Al Maktoum Airport" },
      { title: "Art Dubai Fair", type: "cultural" as const, impact: "normal" as const, location: "Madinat Jumeirah" },
      { title: "Dubai Fitness Challenge", type: "sports" as const, impact: "low" as const, location: "City Wide" },
      { title: "Global Education Summit", type: "conference" as const, impact: "low" as const, location: "Emirates Towers" },
      { title: "Dubai Design Week", type: "cultural" as const, impact: "normal" as const, location: "Design District" },
      { title: "FinTech Summit Middle East", type: "business" as const, impact: "elevated" as const, location: "DIFC" }
    ]
    
    // Generate events for next 90 days
    for (let i = 1; i <= 90; i++) {
      const eventDate = new Date(today)
      eventDate.setDate(today.getDate() + i)
      
      // Add events with realistic frequency (about 25% of days have events)
      if (Math.random() > 0.75) {
        const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)]
        events.push({
          date: eventDate,
          ...template
        })
      }
    }
    
    console.log('✅ Calendar events generated:', events.length, 'events over 3 months')
    return events
    
  } catch (error) {
    console.error('❌ Error generating calendar events:', error)
    return []
  }
}

/**
 * Generate Calendar Days for Month
 * Creates calendar grid for a specific month (current month days only)
 */
const generateMonthDays = (year: number, month: number, events: CalendarEvent[], today: Date): CalendarDay[] => {
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
    
    days.push({
      date,
      dayNumber: day,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: date.toDateString() === today.toDateString(),
      isCurrentMonth: true,
      events: [], // Events are only shown as star icons, not in cell styling
      hasEvents: false, // Events are only shown as star icons, not in cell styling
      demandLevel: generateDemandLevel(date)
    })
  }
  
  return days
}

/**
 * Enhanced 3-Month Calendar Overview Component
 * 
 * Clean, compact calendar view showing upcoming events over 3 months.
 * Focused on event visibility and professional presentation.
 * 
 * Features:
 * - 3-month calendar grid view in compact layout
 * - Event highlighting with color coding
 * - Professional responsive design
 * - Event details on hover/click
 * - Dubai market focus
 * 
 * @returns Compact calendar overview component
 */
export function DemandCalendarOverview() {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isClient, setIsClient] = useState(false)
  const [hiddenDemandLevels, setHiddenDemandLevels] = useState<Set<CalendarDay['demandLevel']>>(
    new Set(['low', 'normal'])
  )
  
  const events = useMemo(() => [], []) // Events are now only shown as star icons
  
  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])
  
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
   * Generate deterministic event icons for each month (max 3 per month)
   */
  const generateEventIcons = (days: CalendarDay[]): CalendarDay[] => {
    const currentMonthDays = days.filter(day => day?.isCurrentMonth)
    
    // Use deterministic selection based on month/year
    const monthSeed = currentMonthDays[0]?.date.getMonth() ?? 0
    const yearSeed = currentMonthDays[0]?.date.getFullYear() ?? 2025
    const seed = monthSeed + yearSeed * 12
    
    // Deterministic selection of 3 dates
    const selectedIndices = [
      (seed + 3) % currentMonthDays.length,
      (seed + 7) % currentMonthDays.length,
      (seed + 11) % currentMonthDays.length
    ].filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
    
    const randomDates = selectedIndices.map(i => currentMonthDays[i])
    
    const eventData = [
      { name: 'Tech Conference', category: 'Technology', impact: 'High' },
      { name: 'Trade Show', category: 'Business', impact: 'Very High' },
      { name: 'Art Exhibition', category: 'Cultural', impact: 'Medium' },
      { name: 'Business Summit', category: 'Corporate', impact: 'High' },
      { name: 'Cultural Festival', category: 'Entertainment', impact: 'Very High' },
      { name: 'Sports Event', category: 'Sports', impact: 'Medium' },
      { name: 'Workshop Series', category: 'Education', impact: 'Medium' },
      { name: 'Food Festival', category: 'Entertainment', impact: 'High' },
      { name: 'Fashion Week', category: 'Fashion', impact: 'Very High' }
    ]
    
    return days.map(day => {
      if (!day) return day
      const hasIcon = randomDates.includes(day)
      
      // Check if this day is part of the multi-day Art Exhibition (Sep 16-18)
      const isArtExhibitionDates = day.date.getMonth() === 8 && // September is month 8
        (day.date.getDate() === 16 || day.date.getDate() === 17 || day.date.getDate() === 18)
      
      if (hasIcon || isArtExhibitionDates) {
        let dayEvents = []
        let numEvents = 1
        
        if (isArtExhibitionDates) {
          // Art Exhibition spans all three days
          dayEvents = ['Art Exhibition']
          
          // Add other events if this day was already selected for events
          if (hasIcon) {
            const dayHash = day.date.getDate() + day.date.getMonth() * 31
            const additionalEvents = ((dayHash + seed) % 3) + 1 // 1-3 additional events
            
            for (let i = 0; i < additionalEvents; i++) {
              const eventIndex = (dayHash + seed + i * 3) % eventData.length
              if (eventData[eventIndex].name !== 'Art Exhibition') {
                dayEvents.push(eventData[eventIndex].name)
              }
            }
          }
          numEvents = dayEvents.length
        } else {
          // Regular event day
          const dayHash = day.date.getDate() + day.date.getMonth() * 31
          numEvents = ((dayHash + seed) % 4) + 1 // 1-4 events
          
          for (let i = 0; i < numEvents; i++) {
            const eventIndex = (dayHash + seed + i * 3) % eventData.length
            dayEvents.push(eventData[eventIndex].name)
          }
        }
        
        // Add date range for Art Exhibition dates
        const dateRange = isArtExhibitionDates ? '16 Sep - 18 Sep' : undefined
        
        return {
          ...day,
          hasEventIcon: true,
          eventName: dayEvents[0], // Show first event name
          totalEvents: numEvents,
          displayedEvents: dayEvents,
          eventDateRange: dateRange
        }
      }
      
      return {
        ...day,
        hasEventIcon: false,
        eventName: undefined,
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
  const maxAllowedDate = new Date(2025, 9, 25) // October 25, 2025 (month is 0-indexed)
  
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
  
  const currentMonthBase = generateMonthDays(currentDate.getFullYear(), currentDate.getMonth(), events, todayForCalendar)
  const currentMonth = generateEventIcons(currentMonthBase.map(day => 
    day ? { ...day, isDisabled: isDateDisabled(day.date) } : day
  ))
  
  const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
  const nextMonthBase = generateMonthDays(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), events, todayForCalendar)
  const nextMonth = generateEventIcons(nextMonthBase.map(day => 
    day ? { ...day, isDisabled: isDateDisabled(day.date) } : day
  ))
  
  const thirdMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 1)
  const thirdMonthBase = generateMonthDays(thirdMonthDate.getFullYear(), thirdMonthDate.getMonth(), events, todayForCalendar)
  const thirdMonth = generateEventIcons(thirdMonthBase.map(day => 
    day ? { ...day, isDisabled: isDateDisabled(day.date) } : day
  ))
  
  // Calculate statistics
  const totalEvents = events.length
  const upcomingEvents = events.filter(e => e.date >= today).length
  const highImpactEvents = events.filter(e => e.impact === 'high').length
  
  console.log('📊 Calendar statistics:', { totalEvents, upcomingEvents, highImpactEvents })
  
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
                      <div className="flex items-center relative z-10" style={{ gap: '3px' }}>
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
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 whitespace-nowrap">
                          <div className="font-semibold">{day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                          <div className="text-xs text-gray-300 capitalize">{day.demandLevel.replace('-', ' ')} demand</div>
                          {day.hasEventIcon && (
                            <>
                              <div className="border-t border-gray-600 my-1 pt-1">
                                <div className="font-semibold text-amber-400 flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-amber-400" />
                                  {day.eventName}
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
                      <div className="flex items-center relative z-10" style={{ gap: '3px' }}>
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
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 whitespace-nowrap">
                          <div className="font-semibold">{day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                          <div className="text-xs text-gray-300 capitalize">{day.demandLevel.replace('-', ' ')} demand</div>
                          {day.hasEventIcon && (
                            <>
                              <div className="border-t border-gray-600 my-1 pt-1">
                                <div className="font-semibold text-amber-400 flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-amber-400" />
                                  {day.eventName}
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
                      <div className="flex items-center relative z-10" style={{ gap: '3px' }}>
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
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 whitespace-nowrap">
                          <div className="font-semibold">{day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                          <div className="text-xs text-gray-300 capitalize">{day.demandLevel.replace('-', ' ')} demand</div>
                          {day.hasEventIcon && (
                            <>
                              <div className="border-t border-gray-600 my-1 pt-1">
                                <div className="font-semibold text-amber-400 flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-amber-400" />
                                  {day.eventName}
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
                  { key: 'elevated' as const, label: 'Elevated', color: 'bg-red-300' }, // Light red
                  { key: 'high' as const, label: 'High', color: 'bg-red-600' } // Dark red
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