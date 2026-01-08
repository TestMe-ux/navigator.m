"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface DemandDay {
  date: Date
  demandLevel: "very-low" | "low" | "normal" | "elevated" | "high" | "very-high"
  searches?: number
  hasOpportunity?: boolean
  changeDirection?: "up" | "down"
  isToday?: boolean
  isCurrentMonth?: boolean
}

/**
 * Get styling for demand levels with consistent color scheme
 */
const getDemandStyling = (level: DemandDay["demandLevel"], isToday: boolean = false, isSelected: boolean = false) => {
  const baseClasses = "relative flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer"
  
  if (isSelected) {
    return {
      classes: cn(baseClasses, "ring-2 ring-blue-500 ring-offset-2 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"),
      indicator: "bg-blue-500"
    }
  }
  
  if (isToday) {
    switch (level) {
      case "very-low":
        return { classes: cn(baseClasses, "bg-red-500 text-white font-bold border-2 border-red-300"), indicator: "bg-red-600" }
      case "low":
        return { classes: cn(baseClasses, "bg-orange-500 text-white font-bold border-2 border-orange-300"), indicator: "bg-orange-600" }
      case "normal":
        return { classes: cn(baseClasses, "bg-blue-500 text-white font-bold border-2 border-blue-300"), indicator: "bg-blue-600" }
      case "elevated":
        return { classes: cn(baseClasses, "bg-yellow-500 text-white font-bold border-2 border-yellow-300"), indicator: "bg-yellow-600" }
      case "high":
        return { classes: cn(baseClasses, "bg-green-500 text-white font-bold border-2 border-green-300"), indicator: "bg-green-600" }
      case "very-high":
        return { classes: cn(baseClasses, "bg-emerald-500 text-white font-bold border-2 border-emerald-300"), indicator: "bg-emerald-600" }
    }
  }
  
  switch (level) {
    case "very-low":
      return { 
        classes: cn(baseClasses, "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900"), 
        indicator: "bg-red-500" 
      }
    case "low":
      return { 
        classes: cn(baseClasses, "bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900"), 
        indicator: "bg-orange-500" 
      }
    case "normal":
      return { 
        classes: cn(baseClasses, "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900"), 
        indicator: "bg-blue-500" 
      }
    case "elevated":
      return { 
        classes: cn(baseClasses, "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900"), 
        indicator: "bg-yellow-500" 
      }
    case "high":
      return { 
        classes: cn(baseClasses, "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900"), 
        indicator: "bg-green-500" 
      }
    case "very-high":
      return { 
        classes: cn(baseClasses, "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900"), 
        indicator: "bg-emerald-500" 
      }
    default:
      return { 
        classes: cn(baseClasses, "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"), 
        indicator: "bg-slate-400" 
      }
  }
}

/**
 * Generate calendar days for the month
 */
const generateMonthDays = (year: number, month: number, demandData: DemandDay[]): DemandDay[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const startPadding = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 // Monday = 0
  
  const days: DemandDay[] = []
  const today = new Date()
  
  // Add padding days from previous month
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate()
  
  for (let i = startPadding - 1; i >= 0; i--) {
    const dayNumber = daysInPrevMonth - i
    const date = new Date(prevYear, prevMonth, dayNumber)
    const existingData = demandData.find(d => 
      d.date.getFullYear() === date.getFullYear() &&
      d.date.getMonth() === date.getMonth() &&
      d.date.getDate() === date.getDate()
    )
    
    days.push({
      date,
      demandLevel: existingData?.demandLevel || "normal",
      searches: existingData?.searches,
      hasOpportunity: existingData?.hasOpportunity,
      changeDirection: existingData?.changeDirection,
      isToday: date.toDateString() === today.toDateString(),
      isCurrentMonth: false
    })
  }
  
  // Add current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const existingData = demandData.find(d => 
      d.date.getFullYear() === date.getFullYear() &&
      d.date.getMonth() === date.getMonth() &&
      d.date.getDate() === date.getDate()
    )
    
    days.push({
      date,
      demandLevel: existingData?.demandLevel || "normal",
      searches: existingData?.searches,
      hasOpportunity: existingData?.hasOpportunity,
      changeDirection: existingData?.changeDirection,
      isToday: date.toDateString() === today.toDateString(),
      isCurrentMonth: true
    })
  }
  
  // Add padding days from next month
  const totalCells = Math.ceil(days.length / 7) * 7
  const nextMonth = month === 11 ? 0 : month + 1
  const nextYear = month === 11 ? year + 1 : year
  
  for (let day = 1; days.length < totalCells; day++) {
    const date = new Date(nextYear, nextMonth, day)
    const existingData = demandData.find(d => 
      d.date.getFullYear() === date.getFullYear() &&
      d.date.getMonth() === date.getMonth() &&
      d.date.getDate() === date.getDate()
    )
    
    days.push({
      date,
      demandLevel: existingData?.demandLevel || "normal",
      searches: existingData?.searches,
      hasOpportunity: existingData?.hasOpportunity,
      changeDirection: existingData?.changeDirection,
      isToday: date.toDateString() === today.toDateString(),
      isCurrentMonth: false
    })
  }
  
  return days
}

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

/**
 * Demand Calendar Month View Component
 * 
 * A single month calendar view optimized for the left column of the demand page.
 * Features month navigation, demand level indicators, and calendar legends.
 */
export function DemandCalendarMonthView() {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [selectedDay, setSelectedDay] = React.useState<Date | null>(null)
  
  // Mock demand data - replace with real data
  const mockDemandData: DemandDay[] = React.useMemo(() => {
    const today = new Date()
    const data: DemandDay[] = []
    
    // Generate sample data for current month and adjacent months
    for (let i = -15; i <= 45; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      // Add random demand data
      if (Math.random() > 0.7) { // 30% of days have specific data
        const demandLevels: DemandDay["demandLevel"][] = ["very-low", "low", "normal", "elevated", "high", "very-high"]
        data.push({
          date: new Date(date),
          demandLevel: demandLevels[Math.floor(Math.random() * demandLevels.length)],
          searches: Math.floor(Math.random() * 2000) + 500,
          hasOpportunity: Math.random() > 0.7,
          changeDirection: Math.random() > 0.5 ? (Math.random() > 0.5 ? "up" : "down") : undefined
        })
      }
    }
    
    return data
  }, [])
  
  const currentMonthDays = generateMonthDays(
    currentDate.getFullYear(), 
    currentDate.getMonth(), 
    mockDemandData
  )
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    console.log('📅 Navigated to previous month')
  }
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    console.log('📅 Navigated to next month')
  }
  
  const handleDayClick = (day: DemandDay) => {
    if (day.isCurrentMonth) {
      setSelectedDay(day.date)
      console.log('📅 Selected day:', day.date.toLocaleDateString(), 'Demand:', day.demandLevel)
    }
  }
  
  // Calculate statistics for current month
  const currentMonthStats = React.useMemo(() => {
    const currentMonthData = currentMonthDays.filter(day => day.isCurrentMonth)
    return {
      totalOpportunities: currentMonthData.filter(day => day.hasOpportunity).length,
      highDemandDays: currentMonthData.filter(day => day.demandLevel === 'high' || day.demandLevel === 'very-high').length,
      averageSearches: Math.round(
        currentMonthData
          .filter(day => day.searches)
          .reduce((sum, day) => sum + (day.searches || 0), 0) / 
        Math.max(currentMonthData.filter(day => day.searches).length, 1)
      )
    }
  }, [currentMonthDays])
  
  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handlePrevMonth}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </Button>
        
        <h3 className="text-lg font-semibold text-foreground">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleNextMonth}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Month Statistics */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="font-semibold text-slate-900 dark:text-slate-100">{currentMonthStats.totalOpportunities}</div>
          <div className="text-slate-600 dark:text-slate-400">Opportunities</div>
        </div>
        <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="font-semibold text-slate-900 dark:text-slate-100">{currentMonthStats.highDemandDays}</div>
          <div className="text-slate-600 dark:text-slate-400">High Demand</div>
        </div>
        <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="font-semibold text-slate-900 dark:text-slate-100">{currentMonthStats.averageSearches}</div>
          <div className="text-slate-600 dark:text-slate-400">Avg Searches</div>
        </div>
      </div>
      
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {currentMonthDays.map((day, index) => {
          const isSelected = selectedDay ? day.date.toDateString() === selectedDay.toDateString() : false
          const styling = getDemandStyling(day.demandLevel, day.isToday, isSelected)
          
          return (
            <div
              key={index}
              className={cn(
                "h-12 relative group",
                styling.classes,
                !day.isCurrentMonth ? "opacity-40" : "",
                day.isCurrentMonth ? "hover:shadow-md" : ""
              )}
              onClick={() => handleDayClick(day)}
            >
              <span className="relative z-0">{day.date.getDate()}</span>
              
              {/* Opportunity indicator */}
              {day.hasOpportunity && (
                <div className="absolute top-1 right-1 z-0">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                </div>
              )}
              
              {/* Change direction indicator */}
              {day.changeDirection && (
                <div className="absolute top-1 left-1 z-0">
                  {day.changeDirection === "up" ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                </div>
              )}
              
              {/* Demand level indicator dot */}
              {day.isCurrentMonth && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 z-0">
                  <div className={cn("w-2 h-2 rounded-full", styling.indicator)} />
                </div>
              )}
              
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                <div className="font-semibold">{day.date.toLocaleDateString()}</div>
                <div className="capitalize">{day.demandLevel.replace('-', ' ')} demand</div>
                {day.searches && <div>{day.searches.toLocaleString()} searches</div>}
                {day.hasOpportunity && <div className="text-amber-300">Has opportunity</div>}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Calendar Legend */}
      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-semibold text-foreground">Demand Levels</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { level: "very-low", label: "Very Low", color: "bg-red-500" },
            { level: "low", label: "Low", color: "bg-orange-500" },
            { level: "normal", label: "Normal", color: "bg-blue-500" },
            { level: "elevated", label: "Elevated", color: "bg-yellow-500" },
            { level: "high", label: "High", color: "bg-green-500" },
            { level: "very-high", label: "Very High", color: "bg-emerald-500" }
          ].map(item => (
            <div key={item.level} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", item.color)} />
              <span className="text-foreground">{item.label}</span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span className="text-foreground">Opportunity</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-foreground">Rising</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-red-500" />
              <span className="text-foreground">Falling</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Selected Day Details */}
      {selectedDay && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
            {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h5>
          {(() => {
            const dayData = currentMonthDays.find(day => day.date.toDateString() === selectedDay.toDateString())
            if (!dayData) return null
            
            return (
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p className="capitalize">Demand: {dayData.demandLevel.replace('-', ' ')}</p>
                {dayData.searches && <p>Searches: {dayData.searches.toLocaleString()}</p>}
                {dayData.hasOpportunity && <p className="text-amber-600 dark:text-amber-400">⚡ Pricing opportunity available</p>}
                {dayData.changeDirection && (
                  <p>
                    Trend: {dayData.changeDirection === 'up' ? '📈 Rising' : '📉 Falling'}
                  </p>
                )}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}