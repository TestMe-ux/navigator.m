"use client"

import * as React from "react"
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  subYears,
  isSameMonth,
  isBefore,
  isAfter,
  addMonths,
} from "date-fns"
import { CalendarIcon, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type DateMode = "last6months" | "last12months" | "customRange"

interface CheckinMonthsDatePickerProps {
  startDate?: Date
  endDate?: Date
  onChange?: (startDate: Date | undefined, endDate: Date | undefined) => void
  className?: string
}

export function CheckinMonthsDatePicker({ 
  startDate, 
  endDate, 
  onChange, 
  className 
}: CheckinMonthsDatePickerProps) {
  
  // Get default dates (Last 12 Months)
  const getDefaultDates = () => {
    const today = new Date()
    const twelveMonthsAgo = subMonths(today, 11) // 12 months including current month
    return { start: startOfMonth(twelveMonthsAgo), end: endOfMonth(today) }
  }

  const defaultDates = getDefaultDates()
  const [selectedStartDate, setSelectedStartDate] = React.useState<Date | undefined>(
    startDate || defaultDates.start
  )
  const [selectedEndDate, setSelectedEndDate] = React.useState<Date | undefined>(
    endDate || defaultDates.end
  )
  const [currentMonth, setCurrentMonth] = React.useState<Date>(selectedStartDate || new Date())
  const [mode, setMode] = React.useState<DateMode>("last12months")
  const [isOpen, setIsOpen] = React.useState(false)

  // Initialize with last 12 months if no dates provided
  React.useEffect(() => {
    if (!startDate && !endDate) {
      const today = new Date()
      const twelveMonthsAgo = subMonths(today, 11)
      const start = startOfMonth(twelveMonthsAgo)
      const end = endOfMonth(today)
      setSelectedStartDate(start)
      setSelectedEndDate(end)
      setMode("last12months")
      setCurrentMonth(start)
      onChange?.(start, end)
    } else {
      setSelectedStartDate(startDate)
      setSelectedEndDate(endDate)
      if (startDate) {
        setCurrentMonth(startDate)
      }
      // Determine mode from dates
      if (startDate && endDate) {
        const today = new Date()
        const sixMonthsAgo = subMonths(today, 5)
        const twelveMonthsAgo = subMonths(today, 11)
        
        if (isSameMonth(startDate, startOfMonth(twelveMonthsAgo)) && 
            isSameMonth(endDate, endOfMonth(today))) {
          setMode("last12months")
        } else if (isSameMonth(startDate, startOfMonth(sixMonthsAgo)) && 
                   isSameMonth(endDate, endOfMonth(today))) {
          setMode("last6months")
        } else {
          setMode("customRange")
        }
      }
    }
  }, [startDate, endDate, onChange])

  const handleModeChange = (newMode: DateMode) => {
    setMode(newMode)
    const today = new Date()
    let newStartDate: Date | undefined
    let newEndDate: Date | undefined

    if (newMode === "customRange") {
      // Reset to no selection when switching to custom range
      newStartDate = undefined
      newEndDate = undefined
      setSelectedStartDate(undefined)
      setSelectedEndDate(undefined)
      // Keep dropdown open - don't close it
      // setIsCalendarOpen is already controlled by the mode state
    } else {
      switch (newMode) {
        case "last6months":
          const sixMonthsAgo = subMonths(today, 5)
          newStartDate = startOfMonth(sixMonthsAgo)
          newEndDate = endOfMonth(today)
          break
        case "last12months":
          const twelveMonthsAgo = subMonths(today, 11)
          newStartDate = startOfMonth(twelveMonthsAgo)
          newEndDate = endOfMonth(today)
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
  }

  const formatMonthRange = (startDate: Date, endDate: Date) => {
    const formatMonth = (date: Date) => {
      return format(date, "MMM''yy")
    }
    const startMonth = formatMonth(startOfMonth(startDate))
    const endMonth = formatMonth(endOfMonth(endDate))
    return `${startMonth} - ${endMonth}`
  }

  const getDateRangeForMode = (mode: DateMode): string | null => {
    const today = new Date()

    switch (mode) {
      case "last6months":
        const sixMonthsAgo = subMonths(today, 5)
        return formatMonthRange(startOfMonth(sixMonthsAgo), endOfMonth(today))
      case "last12months":
        const twelveMonthsAgo = subMonths(today, 11)
        return formatMonthRange(startOfMonth(twelveMonthsAgo), endOfMonth(today))
      case "customRange":
        if (selectedStartDate && selectedEndDate) {
          return formatMonthRange(selectedStartDate, selectedEndDate)
        }
        return null
      default:
        return null
    }
  }

  const handleMonthSelect = (selectedMonth: Date) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Starting a new selection
      setSelectedStartDate(startOfMonth(selectedMonth))
      setSelectedEndDate(undefined)
    } else if (selectedStartDate && !selectedEndDate) {
      // Completing the selection
      const start = selectedStartDate
      const end = endOfMonth(selectedMonth)
      
      let finalStart = start
      let finalEnd = end
      
      if (isBefore(end, start)) {
        // If end is before start, swap them
        finalStart = startOfMonth(selectedMonth)
        finalEnd = endOfMonth(start)
      }
      
      setSelectedStartDate(finalStart)
      setSelectedEndDate(finalEnd)
      
      // Auto-apply the selection when range is complete
      onChange?.(finalStart, finalEnd)
      setIsOpen(false)
    }
  }


  const renderMonthPicker = () => {
    const months: Date[] = []
    const today = new Date()
    
    // Generate last 12 months from current month (inclusive)
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(today, i)
      months.push(startOfMonth(monthDate))
    }

    const getMonthStatus = (monthDate: Date) => {
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      
      if (selectedStartDate && selectedEndDate) {
        if (monthStart >= selectedStartDate && monthEnd <= selectedEndDate) {
          return "selected"
        }
        if (isSameMonth(monthStart, selectedStartDate) || isSameMonth(monthEnd, selectedEndDate)) {
          return "range-edge"
        }
      } else if (selectedStartDate && !selectedEndDate) {
        if (isSameMonth(monthStart, selectedStartDate)) {
          return "selected"
        }
      }
      
      return "default"
    }

    return (
      <div className="grid grid-cols-3 gap-2 p-4 min-w-[280px]">
        {months.map((month, index) => {
          const status = getMonthStatus(month)
          const monthLabel = format(month, "MMM''yy")
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleMonthSelect(month)}
              className={cn(
                "px-3 py-2 text-sm rounded-md transition-colors text-left",
                status === "selected" && "bg-blue-600 text-white font-medium",
                status === "range-edge" && "bg-blue-100 text-blue-900 font-medium dark:bg-blue-900/30 dark:text-blue-300",
                status === "default" && "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              )}
            >
              {monthLabel}
            </button>
          )
        })}
      </div>
    )
  }

  const quickDateOptions = [
    { mode: "last6months" as DateMode, label: "Last 6 Months" },
    { mode: "last12months" as DateMode, label: "Last 12 Months" },
    { mode: "customRange" as DateMode, label: "Custom Month Range" },
  ]

  const displayText = selectedStartDate && selectedEndDate 
    ? formatMonthRange(selectedStartDate, selectedEndDate)
    : "Select months"

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={isOpen} onOpenChange={(open) => {
        setIsOpen(open)
        if (!open && mode === "customRange") {
          // Reset mode to last12months if closing without applying
          setMode("last12months")
        }
      }}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700",
              !selectedStartDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="w-4 h-4 shrink-0" />
            <span className="font-medium text-gray-600 dark:text-gray-400">
              Check-in:
            </span>
            <span className="font-semibold">
              {displayText}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 shadow-xl border-slate-200 dark:border-slate-700 z-[60]"
          align="start"
        >
          <div className="flex">
            {/* Left Side - Dropdown Options */}
            <div className={cn(
              "w-[15.12rem]",
              mode === "customRange" && "border-r border-gray-200 dark:border-gray-700"
            )}>
              <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                Check-in Months
              </h4>
              <div className="py-2">
                {quickDateOptions.map((option) => {
                  const dateRange = option.mode !== "customRange" 
                    ? getDateRangeForMode(option.mode)
                    : null
                  
                  return (
                    <div key={option.mode}>
                      <button
                        onClick={() => handleModeChange(option.mode)}
                        className={cn(
                          "w-full px-4 py-3 cursor-pointer flex flex-col items-start text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                          mode === option.mode && "bg-blue-50 dark:bg-blue-900/20"
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                            {option.label}
                          </span>
                          {option.mode === "customRange" && (
                            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                          )}
                        </div>
                        {dateRange && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {dateRange}
                          </span>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Side - Month Picker (only show when customRange is selected) */}
            {mode === "customRange" && (
              <div className="w-auto">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Select Month Range
                  </h4>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedStartDate && selectedEndDate 
                      ? formatMonthRange(selectedStartDate, selectedEndDate)
                      : selectedStartDate
                      ? format(selectedStartDate, "MMM''yy")
                      : "Select start month"}
                  </div>
                </div>
                {renderMonthPicker()}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

