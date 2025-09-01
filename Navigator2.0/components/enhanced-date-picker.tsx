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

type DateMode = "next7days" | "next14days" | "next30days" | "customRange"

interface EnhancedDatePickerProps {
  startDate?: Date
  endDate?: Date
  onChange?: (startDate: Date | undefined, endDate: Date | undefined) => void
  className?: string
}

export function EnhancedDatePicker({ startDate, endDate, onChange, className }: EnhancedDatePickerProps) {
  // Initialize with Next 7 Days by default
  const getDefaultDates = () => {
    const today = new Date()
    const sevenDaysFromNow = addDays(today, 6)
    return { start: today, end: sevenDaysFromNow }
  }

  const defaultDates = getDefaultDates()
  const [selectedStartDate, setSelectedStartDate] = React.useState<Date | undefined>(
    startDate || defaultDates.start
  )
  const [selectedEndDate, setSelectedEndDate] = React.useState<Date | undefined>(
    endDate || defaultDates.end
  )
  const [currentMonth, setCurrentMonth] = React.useState<Date>(selectedStartDate || new Date())
  const [mode, setMode] = React.useState<DateMode>("next7days")
  const [previousMode, setPreviousMode] = React.useState<DateMode>("next7days")
  const [isOpen, setIsOpen] = React.useState(false)

  // Initialize with next 7 days if no dates provided
  React.useEffect(() => {
    debugger;
    if (!startDate && !endDate) {
      // Ensure Next 7 Days is selected and applied by default
      const today = new Date()
      const sevenDaysFromNow = addDays(today, 6)
      setSelectedStartDate(today)
      setSelectedEndDate(sevenDaysFromNow)
      setMode("next7days") // Explicitly set mode to next7days
      setCurrentMonth(today)
      // Auto-apply the default selection
      onChange?.(today, sevenDaysFromNow)
    } else {
      setSelectedStartDate(startDate)
      setSelectedEndDate(endDate)
      if (startDate) {
        setCurrentMonth(startDate)
      }
    }
  }, [startDate, endDate, onChange])

  // Ensure default dates are applied on component mount
  React.useEffect(() => {
    if (!startDate && !endDate) {
      const today = new Date()
      const sevenDaysFromNow = addDays(today, 6)
      onChange?.(today, sevenDaysFromNow)
    }
  }, []) // Empty dependency - runs only once on mount

  const handleDateSelect = (date: Date) => {
    if (!selectedStartDate || selectedEndDate) {
      setSelectedStartDate(date)
      setSelectedEndDate(undefined)
    } else if (date < selectedStartDate) {
      setSelectedEndDate(selectedStartDate)
      setSelectedStartDate(date)
    } else {
      setSelectedEndDate(date)
    }
  }

  const handleModeChange = (newMode: DateMode) => {
    // Store previous mode before changing to Custom Date Range
    if (newMode === "customRange" && mode !== "customRange") {
      setPreviousMode(mode)
    }
    
    setMode(newMode)
    const today = new Date()
    let newStartDate: Date | undefined
    let newEndDate: Date | undefined

    switch (newMode) {
      case "next7days":
        newStartDate = today
        newEndDate = addDays(today, 6) // 7 days including today
        break
      case "next14days":
        newStartDate = today
        newEndDate = addDays(today, 13) // 14 days including today
        break
      case "next30days":
        newStartDate = today
        newEndDate = addDays(today, 29) // 30 days including today
        break
      case "customRange":
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

    // Auto-apply for non-custom ranges
    if (newMode !== "customRange" && newStartDate && newEndDate) {
      onChange?.(newStartDate, newEndDate)
      setIsOpen(false)
    }
  }

  const handleApply = () => {
    onChange?.(selectedStartDate, selectedEndDate)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setSelectedStartDate(startDate)
    setSelectedEndDate(endDate)
    if (startDate) {
      setCurrentMonth(startDate)
    } else {
      setCurrentMonth(new Date())
    }
    setIsOpen(false)
  }

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const formatDate = (date: Date) => {
      return format(date, "dd MMM")
    }
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  const getDateRangeForMode = (mode: DateMode): string | null => {
    const today = new Date()

    switch (mode) {
      case "next7days":
        return formatDateRange(today, addDays(today, 6))
      case "next14days":
        return formatDateRange(today, addDays(today, 13))
      case "next30days":
        return formatDateRange(today, addDays(today, 29))
      case "customRange":
        // Never show dates under Custom Date Range option in dropdown
        // Keep it clean with just the label
        return null
      default:
        return null
    }
  }

  const quickDateOptions = [
    { mode: "next7days" as DateMode, label: "Next 7 Days" },
    { mode: "next14days" as DateMode, label: "Next 14 Days" },
    { mode: "next30days" as DateMode, label: "Next 30 Days" },
    { mode: "customRange" as DateMode, label: "Custom Date Range" },
  ]
  const minDate = new Date();
  const maxDate = addYears(new Date(), 1);

  // Navigation checks
  // const canGoPrevMonth = () => ;
  // const canGoNextMonth = () => !;

  const renderCalendarMonth = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const firstDayOfWeek = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1 // Adjust for Monday start
    const paddingDaysBefore = Array.from({ length: firstDayOfWeek }, (_, i) => {
      const paddingDate = new Date(monthStart)
      paddingDate.setDate(paddingDate.getDate() - (firstDayOfWeek - i))
      return paddingDate
    })

    const totalCells = 42 // 6 rows × 7 days
    const remainingCells = totalCells - (paddingDaysBefore.length + days.length)
    const paddingDaysAfter = Array.from({ length: remainingCells }, (_, i) => {
      const paddingDate = new Date(monthEnd)
      paddingDate.setDate(paddingDate.getDate() + i + 1)
      return paddingDate
    })

    const allDays = [...paddingDaysBefore, ...days, ...paddingDaysAfter]
    const maxSelectableAfterStart =
      selectedStartDate ? addDays(selectedStartDate, 89) : maxDate;
    const minSelectableAfterStart =
      selectedStartDate ? subDays(selectedStartDate, 89) : maxDate;
    return (
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            disabled={isBefore(endOfMonth(subMonths(currentMonth, 1)), minDate)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold text-gray-700">{format(monthDate, "MMMM yyyy")}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            disabled={isAfter(startOfMonth(addMonths(currentMonth, 1)), maxSelectableAfterStart) || isAfter(startOfMonth(addMonths(currentMonth, 1)), maxDate)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {allDays.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, monthDate)
            const isSelected =
              (selectedStartDate && isSameDay(day, selectedStartDate)) ||
              (selectedEndDate && isSameDay(day, selectedEndDate))
            const isInRange =
              selectedStartDate &&
              selectedEndDate &&
              isWithinInterval(day, { start: selectedStartDate, end: selectedEndDate })
            const isToday = isSameDay(day, new Date())


            let rangeMin = minDate;
            let rangeMax = maxDate;
            if (selectedStartDate) {
              const before = addDays(selectedStartDate, -89);
              const after = addDays(selectedStartDate, 89);
              rangeMin = before < minDate ? minDate : before;
              rangeMax = after > maxDate ? maxDate : after;
            }

            const isDisabled =
              (isBefore(day, rangeMin) && !isSameDay(day, rangeMin)) ||
              (isAfter(day, rangeMax) && !isSameDay(day, rangeMax)) ||
              (!isCurrentMonth && mode === "customRange");
            return (
              <Button
                key={index}
                variant="ghost"
                className={cn(
                  "h-10 w-10 p-0 font-normal",
                  !isCurrentMonth && "text-gray-400 opacity-50",
                  (isSelected || isInRange) && "bg-blue-600 text-white hover:bg-blue-700",
                  isToday && !isSelected && !isInRange && "bg-gray-100 text-gray-900",
                  "hover:bg-gray-100 hover:text-gray-900",
                  (isSelected || isInRange) && "hover:bg-blue-700 hover:text-white",
                )}
                onClick={() => handleDateSelect(day)}
                // disabled={!isCurrentMonth && mode === "customRange"}
                disabled={isDisabled}
              >
                {format(day, "d")}
              </Button>
            )
          })}
        </div>
      </div>
    )
  }

  const displayDateRange = React.useMemo(() => {
    if (selectedStartDate && selectedEndDate) {
      // Input field shows with year format like "01 Aug '25 - 07 Aug '25"
      const dateRangeText = `${format(selectedStartDate, "dd MMM ''yy")} - ${format(selectedEndDate, "dd MMM ''yy")}`

      // Determine the label based on the current mode
      const today = new Date()
      const daysDiff = Math.round((selectedEndDate.getTime() - selectedStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

      // Check if it matches common patterns
      if (isSameDay(selectedStartDate, today)) {
        if (daysDiff === 7) return `Next 7 Days • ${dateRangeText}`
        if (daysDiff === 14) return `Next 14 Days • ${dateRangeText}`
        if (daysDiff === 30) return `Next 30 Days • ${dateRangeText}`
      }

      // Default to just the date range for custom selections
      return dateRangeText
    } else if (selectedStartDate) {
      return `${format(selectedStartDate, "dd MMM ''yy")} - Select end date`
    } else {
      // Show previous selection when Custom Date Range is selected but no dates are chosen
      if (mode === "customRange") {
        const previousDateRange = getDateRangeForMode(previousMode)
        const previousOption = quickDateOptions.find(opt => opt.mode === previousMode)
        if (previousOption && previousDateRange) {
          return `${previousOption.label} • ${previousDateRange}`
        }
        return previousOption?.label || "Select date range"
      }
      return "Select date range"
    }
  }, [selectedStartDate, selectedEndDate, mode, previousMode])

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

          {/* Calendar for Custom Range Only */}
          {mode === "customRange" && (
            <div className="p-4">
              {renderCalendarMonth(currentMonth)}
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleApply}
                  disabled={!selectedStartDate || !selectedEndDate}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
