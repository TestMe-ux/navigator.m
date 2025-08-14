"use client"

import * as React from "react"
import {
  addDays,
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  subDays,
} from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type DemandDateMode = "next15days" | "next30days" | "next60days" | "next75days"

interface DemandDatePickerProps {
  startDate?: Date
  endDate?: Date
  onChange?: (startDate: Date | undefined, endDate: Date | undefined) => void
  className?: string
}

export function DemandDatePicker({ startDate, endDate, onChange, className }: DemandDatePickerProps) {
  // Initialize with Next 15 Days by default
  const getDefaultDates = () => {
    const today = new Date()
    const fifteenDaysFromNow = addDays(today, 14)
    return { start: today, end: fifteenDaysFromNow }
  }

  const defaultDates = getDefaultDates()
  const [selectedStartDate, setSelectedStartDate] = React.useState<Date | undefined>(
    startDate || defaultDates.start
  )
  const [selectedEndDate, setSelectedEndDate] = React.useState<Date | undefined>(
    endDate || defaultDates.end
  )
  const [currentMonth, setCurrentMonth] = React.useState<Date>(selectedStartDate || new Date())
  const [mode, setMode] = React.useState<DemandDateMode>("next15days")
  const [isOpen, setIsOpen] = React.useState(false)

  // Initialize with next 15 days if no dates provided
  React.useEffect(() => {
    if (!startDate && !endDate) {
      // Ensure Next 15 Days is selected and applied by default
      const today = new Date()
      const fifteenDaysFromNow = addDays(today, 14)
      setSelectedStartDate(today)
      setSelectedEndDate(fifteenDaysFromNow)
      setMode("next15days") // Explicitly set mode to next15days
      setCurrentMonth(today)
      // Auto-apply the default selection
      onChange?.(today, fifteenDaysFromNow)
    } else {
      setSelectedStartDate(startDate)
      setSelectedEndDate(endDate)
      if (startDate) {
        setCurrentMonth(startDate)
      }
      
      // Determine the appropriate mode based on the received dates
      if (startDate && endDate) {
        const daysDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
        const today = new Date()
        const isStartingToday = isSameDay(startDate, today)
        const isStartingYesterday = isSameDay(startDate, addDays(today, -1))
        const isStartingTomorrow = isSameDay(startDate, addDays(today, 1))
        
        if (isStartingToday || isStartingYesterday || isStartingTomorrow) {
          if (daysDiff === 15) {
            setMode("next15days")
          }
          else if (daysDiff === 30) setMode("next30days")
          else if (daysDiff === 60) setMode("next60days")
          else if (daysDiff === 75) setMode("next75days")
        }
      }
    }
  }, [startDate, endDate, onChange])

  // Ensure default dates are applied on component mount
  React.useEffect(() => {
    if (!startDate && !endDate) {
      const today = new Date()
      const fifteenDaysFromNow = addDays(today, 14)
      onChange?.(today, fifteenDaysFromNow)
    }
  }, []) // Empty dependency - runs only once on mount

  const handleModeSelect = (newMode: DemandDateMode) => {
    setMode(newMode)
    const today = new Date()
    let newStartDate: Date | undefined
    let newEndDate: Date | undefined

    switch (newMode) {
      case "next15days":
        newStartDate = today
        newEndDate = addDays(today, 14) // 15 days including today
        break
      case "next30days":
        newStartDate = today
        newEndDate = addDays(today, 29) // 30 days including today
        break
      case "next60days":
        newStartDate = today
        newEndDate = addDays(today, 59) // 60 days including today
        break
      case "next75days":
        newStartDate = today
        newEndDate = addDays(today, 74) // 75 days including today
        break
      default:
        newStartDate = undefined
        newEndDate = undefined
        break
    }
    setSelectedStartDate(newStartDate)
    setSelectedEndDate(newEndDate)
    if (newStartDate) {
      setCurrentMonth(newStartDate)
    }
    
    // Auto-apply for all predefined ranges
    if (newStartDate && newEndDate) {
      onChange?.(newStartDate, newEndDate)
      setIsOpen(false)
    }
  }

  const formatDateRange = (startDate: Date, endDate: Date): string => {
    const formatDate = (date: Date): string => {
      return format(date, "dd MMM")
    }
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  const getDateRangeForMode = (mode: DemandDateMode): string | null => {
    const today = new Date()
    
    switch (mode) {
      case "next15days":
        return formatDateRange(today, addDays(today, 14))
      case "next30days":
        return formatDateRange(today, addDays(today, 29))
      case "next60days":
        return formatDateRange(today, addDays(today, 59))
      case "next75days":
        return formatDateRange(today, addDays(today, 74))
      default:
        return null
    }
  }

  const quickDateOptions = [
    { mode: "next15days" as DemandDateMode, label: "Next 15 Days" },
    { mode: "next30days" as DemandDateMode, label: "Next 30 Days" },
    { mode: "next60days" as DemandDateMode, label: "Next 60 Days" },
    { mode: "next75days" as DemandDateMode, label: "Next 75 Days" },
  ]

  const displayDateRange = React.useMemo(() => {
    if (selectedStartDate && selectedEndDate) {
      // Input field shows with year format like "01 Aug '25 - 07 Aug '25"
      const dateRangeText = `${format(selectedStartDate, "dd MMM ''yy")} - ${format(selectedEndDate, "dd MMM ''yy")}`
      
      // Calculate the day difference
      const daysDiff = Math.round((selectedEndDate.getTime() - selectedStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      
      // Always show the prefix for standard day ranges, regardless of start date
      if (daysDiff === 15) {
        return `Next 15 Days - ${dateRangeText}`
      }
      if (daysDiff === 30) {
        return `Next 30 Days - ${dateRangeText}`
      }
      if (daysDiff === 60) {
        return `Next 60 Days - ${dateRangeText}`
      }
      if (daysDiff === 75) {
        return `Next 75 Days - ${dateRangeText}`
      }
      
      // Default to just the date range for custom selections
      return dateRangeText
    } else if (selectedStartDate) {
      return `${format(selectedStartDate, "dd MMM ''yy")} - Select end date`
    } else {
      return "Select date range"
    }
  }, [selectedStartDate, selectedEndDate, mode])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-semibold h-10 min-w-[280px] px-4 gap-2 shadow-sm hover:shadow-md transition-all duration-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800",
            !selectedStartDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="truncate">{displayDateRange}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Quick Date Options Sidebar */}
          <div className="w-56 border-r border-gray-200 p-4">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Check-in Date</h4>
            <div className="space-y-1">
              {quickDateOptions.map((option) => {
                const dateRange = getDateRangeForMode(option.mode)
                return (
                  <Button
                    key={option.mode}
                    variant={mode === option.mode ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2 px-3"
                    onClick={() => handleModeSelect(option.mode)}
                  >
                    <div className="flex flex-col items-start">
                      <span className={cn(
                        "text-sm font-medium",
                        mode === option.mode ? "text-white" : "text-foreground"
                      )}>
                        {option.label}
                      </span>
                      {dateRange && (
                        <span className={cn(
                          "text-xs mt-0.5",
                          mode === option.mode ? "text-white/80" : "text-muted-foreground"
                        )}>
                          {dateRange}
                        </span>
                      )}
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
