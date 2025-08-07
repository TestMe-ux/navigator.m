"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Star,
  MapPin,
  Users
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
  impact: "very_low" | "low" | "normal" | "elevated" | "high" | "very_high"
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
}

/**
 * Get Event Impact Styling
 * Returns styling based on impact level with simple border colors and dot indicators
 */
const getEventStyling = (events: CalendarEvent[], isToday: boolean = false, isSelected: boolean = false) => {
  // Base styling for days without events
  if (!events.length) {
    if (isToday) {
      return {
        bg: "bg-white dark:bg-slate-800",
        text: "text-blue-900 dark:text-blue-100 font-bold",
        border: "border border-blue-500 dark:border-blue-400",
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
  const impacts = ["very_high", "high", "elevated", "normal", "low", "very_low"] as const
  const highestImpact = impacts.find(level => events.some(e => e.impact === level)) || "very_low"
  
  // Impact-based styling with simple borders and dot colors
  switch (highestImpact) {
    case "very_high":
      return {
        bg: "bg-white dark:bg-slate-800",
        text: "text-slate-900 dark:text-slate-100",
        border: "border border-red-500 dark:border-red-400",
        indicator: "bg-red-600",
        hover: "",
        shadow: ""
      }
    case "high":
      return {
        bg: "bg-white dark:bg-slate-800",
        text: "text-slate-900 dark:text-slate-100",
        border: "border border-orange-500 dark:border-orange-400",
        indicator: "bg-orange-500",
        hover: "",
        shadow: ""
      }
    case "elevated":
      return {
        bg: "bg-white dark:bg-slate-800",
        text: "text-slate-900 dark:text-slate-100",
        border: "border border-yellow-500 dark:border-yellow-400",
        indicator: "bg-yellow-500",
        hover: "",
        shadow: ""
      }
    case "normal":
      return {
        bg: "bg-white dark:bg-slate-800",
        text: "text-slate-900 dark:text-slate-100",
        border: "border border-blue-500 dark:border-blue-400",
        indicator: "bg-blue-500",
        hover: "",
        shadow: ""
      }
    case "low":
      return {
        bg: "bg-white dark:bg-slate-800",
        text: "text-slate-900 dark:text-slate-100",
        border: "border border-green-500 dark:border-green-400",
        indicator: "bg-green-500",
        hover: "",
        shadow: ""
      }
    case "very_low":
    default:
      return {
        bg: "bg-white dark:bg-slate-800",
        text: "text-slate-900 dark:text-slate-100",
        border: "border border-gray-500 dark:border-gray-400",
        indicator: "bg-gray-400",
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
      { title: "GITEX Technology Week", type: "conference" as const, impact: "very_high" as const, location: "Dubai World Trade Centre" },
      { title: "Dubai Shopping Festival", type: "festival" as const, impact: "very_high" as const, location: "Dubai Mall" },
      { title: "Arab Health Exhibition", type: "exhibition" as const, impact: "high" as const, location: "DWTC" },
      { title: "Dubai International Film Festival", type: "cultural" as const, impact: "elevated" as const, location: "Madinat Jumeirah" },
      { title: "Business Leadership Summit", type: "business" as const, impact: "elevated" as const, location: "Burj Al Arab" },
      { title: "Dubai Marathon", type: "sports" as const, impact: "high" as const, location: "Dubai Marina" },
      { title: "Middle East Energy Conference", type: "conference" as const, impact: "normal" as const, location: "DWTC" },
      { title: "Dubai Food Festival", type: "festival" as const, impact: "elevated" as const, location: "Various Locations" },
      { title: "Gulfood Exhibition", type: "exhibition" as const, impact: "high" as const, location: "Dubai World Trade Centre" },
      { title: "Dubai Airshow", type: "exhibition" as const, impact: "very_high" as const, location: "Al Maktoum Airport" },
      { title: "Art Dubai Fair", type: "cultural" as const, impact: "normal" as const, location: "Madinat Jumeirah" },
      { title: "Dubai Fitness Challenge", type: "sports" as const, impact: "low" as const, location: "City Wide" },
      { title: "Global Education Summit", type: "conference" as const, impact: "very_low" as const, location: "Emirates Towers" },
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
 * Creates calendar grid for a specific month
 */
const generateMonthDays = (year: number, month: number, events: CalendarEvent[], today: Date): CalendarDay[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const startPadding = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 // Monday = 0
  
  const days: CalendarDay[] = []
  
  // Add padding days from previous month
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate()
  
  for (let i = startPadding - 1; i >= 0; i--) {
    const dayNumber = daysInPrevMonth - i
    const date = new Date(prevYear, prevMonth, dayNumber)
    const dayEvents = events.filter(e => 
      e.date.getFullYear() === date.getFullYear() &&
      e.date.getMonth() === date.getMonth() &&
      e.date.getDate() === date.getDate()
    )
    
    days.push({
      date,
      dayNumber,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: date.toDateString() === today.toDateString(),
      isCurrentMonth: false,
      events: dayEvents,
      hasEvents: dayEvents.length > 0
    })
  }
  
  // Add current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dayEvents = events.filter(e => 
      e.date.getFullYear() === date.getFullYear() &&
      e.date.getMonth() === date.getMonth() &&
      e.date.getDate() === date.getDate()
    )
    
    days.push({
      date,
      dayNumber: day,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: date.toDateString() === today.toDateString(),
      isCurrentMonth: true,
      events: dayEvents,
      hasEvents: dayEvents.length > 0
    })
  }
  
  // Add padding days from next month
  const totalCells = Math.ceil(days.length / 7) * 7
  const nextMonth = month === 11 ? 0 : month + 1
  const nextYear = month === 11 ? year + 1 : year
  
  for (let day = 1; days.length < totalCells; day++) {
    const date = new Date(nextYear, nextMonth, day)
    const dayEvents = events.filter(e => 
      e.date.getFullYear() === date.getFullYear() &&
      e.date.getMonth() === date.getMonth() &&
      e.date.getDate() === date.getDate()
    )
    
    days.push({
      date,
      dayNumber: day,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: date.toDateString() === today.toDateString(),
      isCurrentMonth: false,
      events: dayEvents,
      hasEvents: dayEvents.length > 0
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
  
  const events = useMemo(() => generateCalendarEvents(), [])
  
  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])
  
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
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }
  
  // Generate calendar data for current and next two months
  const today = new Date()
  const currentMonth = generateMonthDays(currentDate.getFullYear(), currentDate.getMonth(), events, today)
  const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
  const nextMonth = generateMonthDays(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), events, today)
  const thirdMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 1)
  const thirdMonth = generateMonthDays(thirdMonthDate.getFullYear(), thirdMonthDate.getMonth(), events, today)
  
  // Calculate statistics
  const totalEvents = events.length
  const upcomingEvents = events.filter(e => e.date >= today).length
  const highImpactEvents = events.filter(e => e.impact === 'high' || e.impact === 'very_high').length
  
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
    <section className="w-full bg-gradient-to-r from-slate-50/80 to-blue-50/60 dark:from-slate-900/80 dark:to-slate-800/60 border-b border-slate-200/50 dark:border-slate-700/50">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 lg:py-6">
        <div className="max-w-7xl mx-auto">
          

          
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="text-center">
              <h3 className="text-lg lg:text-xl font-semibold text-foreground">
                Event Calendar
              </h3>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateMonth('next')}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Three Month Calendar Grid - Compact View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            
            {/* Current Month */}
            <div className="space-y-3">
              <h4 className="text-base font-semibold text-foreground text-center">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h4>
              
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {currentMonth.map((day, index) => {
                  const isSelected = selectedDay ? day.date.toDateString() === selectedDay.toDateString() : false
                  const styling = getEventStyling(day.events, day.isToday, isSelected)
                  
                  return (
                    <div
                      key={index}
                      className={cn(
                        "relative h-10 lg:h-12 flex items-center justify-center text-xs lg:text-sm rounded-lg cursor-pointer group",
                        styling.bg,
                        styling.text,
                        styling.border,
                        isSelected ? "ring-2 ring-yellow-400 ring-offset-2 z-10" : "",
                        !day.isCurrentMonth ? "opacity-50" : "",
                        day.hasEvents ? "font-semibold" : "font-medium"
                      )}
                      onClick={() => handleDayClick(day)}
                    >
                      <span className="relative z-10">{day.dayNumber}</span>
                      
                      {/* Today indicator */}
                      {day.isToday && !day.hasEvents && (
                        <div className="absolute inset-0 rounded-lg border-2 border-blue-500 animate-pulse" />
                      )}
                      
                      {/* Event Impact Indicator */}
                      {day.hasEvents && (
                        <div className="absolute top-1 right-1">
                          <div className={cn("w-2 h-2 rounded-full shadow-sm", styling.indicator)} />
                        </div>
                      )}
                      
                      {/* Multiple Events Indicator */}
                      {day.events.length > 1 && (
                        <div className="absolute bottom-0.5 right-0.5">
                          <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 min-w-4 bg-white/90 text-slate-700 shadow-sm">
                            +{day.events.length - 1}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Enhanced Hover tooltip with event details */}
                      {day.hasEvents && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 whitespace-nowrap backdrop-blur-sm">
                          <div className="font-semibold">{day.events[0]?.title}</div>
                          <div className="text-xs text-gray-300 capitalize">{day.events[0]?.type} • {day.events[0]?.impact.replace('_', ' ')} Impact</div>
                          {day.events[0]?.location && <div className="text-xs text-gray-400">{day.events[0].location}</div>}
                          {day.events.length > 1 && <div className="text-xs text-gray-300 mt-1">+{day.events.length - 1} more events</div>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Next Month */}
            <div className="space-y-3">
              <h4 className="text-base font-semibold text-foreground text-center">
                {nextMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h4>
              
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {nextMonth.map((day, index) => {
                  const isSelected = selectedDay ? day.date.toDateString() === selectedDay.toDateString() : false
                  const styling = getEventStyling(day.events, day.isToday, isSelected)
                  
                  return (
                    <div
                      key={index}
                      className={cn(
                        "relative h-10 lg:h-12 flex items-center justify-center text-xs lg:text-sm rounded-lg cursor-pointer group",
                        styling.bg,
                        styling.text,
                        styling.border,
                        isSelected ? "ring-2 ring-yellow-400 ring-offset-2 z-10" : "",
                        !day.isCurrentMonth ? "opacity-50" : "",
                        day.hasEvents ? "font-semibold" : "font-medium"
                      )}
                      onClick={() => handleDayClick(day)}
                    >
                      <span className="relative z-10">{day.dayNumber}</span>
                      
                      {/* Today indicator */}
                      {day.isToday && !day.hasEvents && (
                        <div className="absolute inset-0 rounded-lg border-2 border-blue-500 animate-pulse" />
                      )}
                      
                      {/* Event Impact Indicator */}
                      {day.hasEvents && (
                        <div className="absolute top-1 right-1">
                          <div className={cn("w-2 h-2 rounded-full shadow-sm", styling.indicator)} />
                        </div>
                      )}
                      
                      {/* Multiple Events Indicator */}
                      {day.events.length > 1 && (
                        <div className="absolute bottom-0.5 right-0.5">
                          <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 min-w-4 bg-white/90 text-slate-700 shadow-sm">
                            +{day.events.length - 1}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Enhanced Hover tooltip with event details */}
                      {day.hasEvents && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 whitespace-nowrap backdrop-blur-sm">
                          <div className="font-semibold">{day.events[0]?.title}</div>
                          <div className="text-xs text-gray-300 capitalize">{day.events[0]?.type} • {day.events[0]?.impact.replace('_', ' ')} Impact</div>
                          {day.events[0]?.location && <div className="text-xs text-gray-400">{day.events[0].location}</div>}
                          {day.events.length > 1 && <div className="text-xs text-gray-300 mt-1">+{day.events.length - 1} more events</div>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Third Month */}
            <div className="space-y-3">
              <h4 className="text-base font-semibold text-foreground text-center">
                {thirdMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h4>
              
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {thirdMonth.map((day, index) => {
                  const isSelected = selectedDay ? day.date.toDateString() === selectedDay.toDateString() : false
                  const styling = getEventStyling(day.events, day.isToday, isSelected)
                  
                  return (
                    <div
                      key={index}
                      className={cn(
                        "relative h-10 lg:h-12 flex items-center justify-center text-xs lg:text-sm rounded-lg cursor-pointer group",
                        styling.bg,
                        styling.text,
                        styling.border,
                        isSelected ? "ring-2 ring-yellow-400 ring-offset-2 z-10" : "",
                        !day.isCurrentMonth ? "opacity-50" : "",
                        day.hasEvents ? "font-semibold" : "font-medium"
                      )}
                      onClick={() => handleDayClick(day)}
                    >
                      <span className="relative z-10">{day.dayNumber}</span>
                      
                      {/* Today indicator */}
                      {day.isToday && !day.hasEvents && (
                        <div className="absolute inset-0 rounded-lg border-2 border-blue-500 animate-pulse" />
                      )}
                      
                      {/* Event Impact Indicator */}
                      {day.hasEvents && (
                        <div className="absolute top-1 right-1">
                          <div className={cn("w-2 h-2 rounded-full shadow-sm", styling.indicator)} />
                        </div>
                      )}
                      
                      {/* Multiple Events Indicator */}
                      {day.events.length > 1 && (
                        <div className="absolute bottom-0.5 right-0.5">
                          <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 min-w-4 bg-white/90 text-slate-700 shadow-sm">
                            +{day.events.length - 1}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Enhanced Hover tooltip with event details */}
                      {day.hasEvents && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 whitespace-nowrap backdrop-blur-sm">
                          <div className="font-semibold">{day.events[0]?.title}</div>
                          <div className="text-xs text-gray-300 capitalize">{day.events[0]?.type} • {day.events[0]?.impact.replace('_', ' ')} Impact</div>
                          {day.events[0]?.location && <div className="text-xs text-gray-400">{day.events[0].location}</div>}
                          {day.events.length > 1 && <div className="text-xs text-gray-300 mt-1">+{day.events.length - 1} more events</div>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
                        </div>
          </div>
          
          {/* Impact Levels Legend with Counts */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
            {(() => {
              // Calculate counts for each impact level
              const impactCounts = {
                very_low: events.filter(e => e.impact === 'very_low').length,
                low: events.filter(e => e.impact === 'low').length,
                normal: events.filter(e => e.impact === 'normal').length,
                elevated: events.filter(e => e.impact === 'elevated').length,
                high: events.filter(e => e.impact === 'high').length,
                very_high: events.filter(e => e.impact === 'very_high').length
              }
              
              // Only show impact levels that have events
              const impactLevels = [
                { key: 'very_low', label: 'Very Low', color: 'bg-gray-400', count: impactCounts.very_low },
                { key: 'low', label: 'Low', color: 'bg-green-500', count: impactCounts.low },
                { key: 'normal', label: 'Normal', color: 'bg-blue-500', count: impactCounts.normal },
                { key: 'elevated', label: 'Elevated', color: 'bg-yellow-500', count: impactCounts.elevated },
                { key: 'high', label: 'High', color: 'bg-orange-500', count: impactCounts.high },
                { key: 'very_high', label: 'Very High', color: 'bg-red-600', count: impactCounts.very_high }
              ].filter(level => level.count > 0)
              
              return impactLevels.map(level => (
                <div key={level.key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${level.color}`} />
                  <span className="text-foreground">{level.label} ({level.count})</span>
                </div>
              ))
            })()}
          </div>
          
          {/* Selected Day Events */}
          {selectedDay && (
            <div className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Events on {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h4>
              <div className="space-y-3">
                {events
                  .filter(e => e.date.toDateString() === selectedDay.toDateString())
                  .map((event, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        event.impact === 'very_high' ? 'bg-red-600' : 
                        event.impact === 'high' ? 'bg-orange-500' : 
                        event.impact === 'elevated' ? 'bg-yellow-500' : 
                        event.impact === 'normal' ? 'bg-blue-500' : 
                        event.impact === 'low' ? 'bg-green-500' : 'bg-gray-400'
                      )} />
                      <div className="flex-1">
                        <h5 className="font-medium text-foreground">{event.title}</h5>
                        {event.location && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {event.impact} Impact
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
} 