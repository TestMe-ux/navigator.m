"use client"

import * as React from "react"
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  isSameMonth,
} from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface RateVolatilityCheckinMonthsDatePickerProps {
  startDate?: Date
  endDate?: Date
  onChange?: (startDate: Date, endDate: Date) => void
  className?: string
}

export function RateVolatilityCheckinMonthsDatePicker({ 
  startDate, 
  endDate, 
  onChange, 
  className 
}: RateVolatilityCheckinMonthsDatePickerProps) {
  
  // Default month (October 2025 - Oct'25)
  // October 2025 (month is 0-indexed, so 9 = October)
  const DEFAULT_MONTH = new Date(2025, 9, 1)
  
  const [selectedMonth, setSelectedMonth] = React.useState<Date | undefined>(
    startDate ? startOfMonth(startDate) : startOfMonth(DEFAULT_MONTH)
  )
  const [isOpen, setIsOpen] = React.useState(false)
  const hasInitialized = React.useRef(false)

  // Initialize with provided date or default to October 2025
  React.useEffect(() => {
    if (startDate) {
      setSelectedMonth(startOfMonth(startDate))
      hasInitialized.current = true
    } else if (!hasInitialized.current) {
      // Set default to October 2025 and notify parent on initial mount
      const monthStart = startOfMonth(DEFAULT_MONTH)
      const monthEnd = endOfMonth(DEFAULT_MONTH)
      setSelectedMonth(monthStart)
      onChange?.(monthStart, monthEnd)
      hasInitialized.current = true
    }
  }, [startDate, onChange])

  const handleMonthSelect = (selectedMonthDate: Date) => {
    const monthStart = startOfMonth(selectedMonthDate)
    const monthEnd = endOfMonth(selectedMonthDate)
    
    setSelectedMonth(monthStart)
    onChange?.(monthStart, monthEnd)
    setIsOpen(false)
  }

  const renderMonthPicker = () => {
    const months: Date[] = []
    const today = new Date()
    
    // Generate last 12 months excluding current month
    for (let i = 12; i >= 1; i--) {
      const monthDate = subMonths(today, i)
      months.push(startOfMonth(monthDate))
    }
    
    return (
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => {
            const isSelected = selectedMonth && isSameMonth(month, selectedMonth)
            const monthText = format(month, "MMM''yy")
            
            return (
              <button
                key={index}
                onClick={() => handleMonthSelect(month)}
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors",
                  isSelected
                    ? "bg-blue-600 text-white font-semibold"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                {monthText}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const displayText = selectedMonth
    ? format(selectedMonth, "MMM''yy")
    : "Select month"

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700",
              !selectedMonth && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="w-4 h-4 shrink-0" />
            <span className="font-medium text-gray-600 dark:text-gray-400">
              Check-in Month:
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
          <div className="w-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                Select Check-in Month (historical)
              </h4>
            </div>
            {renderMonthPicker()}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}








