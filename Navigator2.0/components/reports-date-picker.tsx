"use client"

import * as React from "react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  addDays,
  subDays,
  addYears,
  isBefore,
  isAfter,
} from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type DateMode = "last7days" | "last14days" | "lastmonth"

interface ReportsDatePickerProps {
  startDate?: Date
  endDate?: Date
  onChange?: (startDate: Date | undefined, endDate: Date | undefined) => void
  className?: string
}

export function ReportsDatePicker({ startDate, endDate, onChange, className }: ReportsDatePickerProps) {
  // Initialize with Last 7 Days by default
  const getDefaultDates = () => {
    const today = new Date()
    const sevenDaysAgo = subDays(today, 6) // 7 days including today, going backwards
    return { start: sevenDaysAgo, end: today }
  }

  const defaultDates = getDefaultDates()
  const [selectedStartDate, setSelectedStartDate] = React.useState<Date | undefined>(
    startDate || defaultDates.start
  )
  const [selectedEndDate, setSelectedEndDate] = React.useState<Date | undefined>(
    endDate || defaultDates.end
  )
  const [currentMonth, setCurrentMonth] = React.useState<Date>(selectedStartDate || new Date())
  const [mode, setMode] = React.useState<DateMode>("last7days")
  const [isOpen, setIsOpen] = React.useState(false)

  // Function to determine mode based on dates
  const determineModeFromDates = (start: Date | undefined, end: Date | undefined): DateMode => {
    if (!start || !end) return "last7days"
    
    const today = new Date()
    const daysDiff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    // Check if it matches common patterns for "last" periods ending today
    if (isSameDay(end, today)) {
      if (daysDiff === 7 && isSameDay(start, subDays(today, 6))) {
        return "last7days"
      }
      if (daysDiff === 14 && isSameDay(start, subDays(today, 13))) {
        return "last14days"
      }
    }
    
    // Check if it's last month
    const lastMonth = subMonths(today, 1)
    if (isSameDay(start, startOfMonth(lastMonth)) && isSameDay(end, endOfMonth(lastMonth))) {
      return "lastmonth"
    }
    
    return "last7days" // Default fallback
  }

  // Initialize with last 7 days if no dates provided
  React.useEffect(() => {
    if (!startDate && !endDate) {
      // Ensure Last 7 Days is selected and applied by default
      const today = new Date()
      const sevenDaysAgo = subDays(today, 6)
      setSelectedStartDate(sevenDaysAgo)
      setSelectedEndDate(today)
      setMode("last7days") // Explicitly set mode to last7days
      setCurrentMonth(today)
      // Auto-apply the default selection
      onChange?.(sevenDaysAgo, today)
    } else {
      setSelectedStartDate(startDate)
      setSelectedEndDate(endDate)
      // Determine the correct mode based on the provided dates
      const detectedMode = determineModeFromDates(startDate, endDate)
      setMode(detectedMode)
      if (startDate) {
        setCurrentMonth(startDate)
      }
    }
  }, [startDate, endDate, onChange])

  // Ensure default dates are applied on component mount
  React.useEffect(() => {
    if (!startDate && !endDate) {
      const today = new Date()
      const sevenDaysAgo = subDays(today, 6)
      onChange?.(sevenDaysAgo, today)
    }
  }, []) // Empty dependency - runs only once on mount

  const handleModeChange = (newMode: DateMode) => {
    setMode(newMode)
    const today = new Date()
    let newStartDate: Date | undefined
    let newEndDate: Date | undefined

    switch (newMode) {
      case "last7days":
        newStartDate = subDays(today, 6) // 7 days including today, going backwards
        newEndDate = today
        break
      case "last14days":
        newStartDate = subDays(today, 13) // 14 days including today, going backwards
        newEndDate = today
        break
      case "lastmonth":
        // Last month from first day to last day of previous month
        const lastMonth = subMonths(today, 1)
        newStartDate = startOfMonth(lastMonth)
        newEndDate = endOfMonth(lastMonth)
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

    // Auto-apply the selection
    if (newStartDate && newEndDate) {
      onChange?.(newStartDate, newEndDate)
      setIsOpen(false)
    }
  }

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const formatDate = (date: Date) => {
      return format(date, "dd MMM ''yy")
    }
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  const getDateRangeForMode = (mode: DateMode): string | null => {
    const today = new Date()

    switch (mode) {
      case "last7days":
        return formatDateRange(subDays(today, 6), today)
      case "last14days":
        return formatDateRange(subDays(today, 13), today)
      case "lastmonth":
        const lastMonth = subMonths(today, 1)
        return formatDateRange(startOfMonth(lastMonth), endOfMonth(lastMonth))
      default:
        return null
    }
  }

  const quickDateOptions = [
    { mode: "last7days" as DateMode, label: "Last 7 Days" },
    { mode: "last14days" as DateMode, label: "Last 14 Days" },
    { mode: "lastmonth" as DateMode, label: "Last Month" },
  ]

  const displayDateRange = React.useMemo(() => {
    if (selectedStartDate && selectedEndDate) {
      // Date range text like "09 Sep '25 - 15 Sep '25"
      const dateRangeText = formatDateRange(selectedStartDate, selectedEndDate)

      // Determine the label based on the current mode
      const today = new Date()
      const daysDiff = Math.round((selectedEndDate.getTime() - selectedStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

      // Check if it matches common patterns for "last" periods ending today
      if (isSameDay(selectedEndDate, today)) {
        if (daysDiff === 7 && isSameDay(selectedStartDate, subDays(today, 6))) {
          return `Last 7 Days • ${dateRangeText}`
        }
        if (daysDiff === 14 && isSameDay(selectedStartDate, subDays(today, 13))) {
          return `Last 14 Days • ${dateRangeText}`
        }
      }

      // Check if it's last month
      const lastMonth = subMonths(today, 1)
      if (isSameDay(selectedStartDate, startOfMonth(lastMonth)) && 
          isSameDay(selectedEndDate, endOfMonth(lastMonth))) {
        return `Last Month • ${dateRangeText}`
      }

      // Default to just the date range for other selections
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
          <div className="w-56 p-4">
            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">Shop Date Range</h4>
            <div className="space-y-1">
              {quickDateOptions.map((option) => {
                const dateRange = getDateRangeForMode(option.mode)
                return (
                  <Button
                    key={option.mode}
                    variant={mode === option.mode ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2 px-3"
                    onClick={() => handleModeChange(option.mode)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{option.label}</span>
                      {dateRange && (
                        <span className={cn(
                          "text-xs mt-0.5",
                          mode === option.mode ? "text-white" : "text-muted-foreground"
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



