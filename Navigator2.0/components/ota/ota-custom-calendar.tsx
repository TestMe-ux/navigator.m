"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth, 
  isWithinInterval, 
  subMonths, 
  isBefore, 
  addMonths 
} from "date-fns"

interface OTACustomCalendarProps {
  currentCalendarMonth: Date
  setCurrentCalendarMonth: (date: Date) => void
  customStartDate: Date | undefined
  setCustomStartDate: (date: Date | undefined) => void
  customEndDate: Date | undefined
  setCustomEndDate: (date: Date | undefined) => void
  handleCustomDateSelect: (day: Date) => void
}

export function OTACustomCalendar({
  currentCalendarMonth,
  setCurrentCalendarMonth,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  handleCustomDateSelect
}: OTACustomCalendarProps) {
  const monthStart = startOfMonth(currentCalendarMonth)
  const monthEnd = endOfMonth(currentCalendarMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  const firstDayOfWeek = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1
  const paddingDaysBefore = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const paddingDate = new Date(monthStart)
    paddingDate.setDate(paddingDate.getDate() - (firstDayOfWeek - i))
    return paddingDate
  })

  const totalCells = 42
  const remainingCells = totalCells - (paddingDaysBefore.length + days.length)
  const paddingDaysAfter = Array.from({ length: remainingCells }, (_, i) => {
    const paddingDate = new Date(monthEnd)
    paddingDate.setDate(paddingDate.getDate() + i + 1)
    return paddingDate
  })

  const allDays = [...paddingDaysBefore, ...days, ...paddingDaysAfter]
  const today = new Date()
  const lastYearJan = new Date(today.getFullYear() - 1, 0, 1) // January of last year

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCurrentCalendarMonth(subMonths(currentCalendarMonth, 1))}
          disabled={isBefore(endOfMonth(subMonths(currentCalendarMonth, 1)), lastYearJan)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-gray-700">{format(currentCalendarMonth, "MMMM yyyy")}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCurrentCalendarMonth(addMonths(currentCalendarMonth, 1))}
          disabled={true}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {allDays.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentCalendarMonth)
          const isToday = isSameDay(day, today)
          const isFutureDate = day > today
          const isBeforeLimit = day < lastYearJan
          const isSelected = customStartDate && isSameDay(day, customStartDate) || customEndDate && isSameDay(day, customEndDate)
          const isInRange = customStartDate && customEndDate && 
            isWithinInterval(day, { start: customStartDate, end: customEndDate })

          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 font-normal ${
                !isCurrentMonth ? "text-gray-300" : ""
              } ${isSelected ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white" : ""} ${
                isInRange && !isSelected ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white" : ""
              } ${isToday ? "border border-primary" : ""}`}
              onClick={() => handleCustomDateSelect(day)}
              disabled={isFutureDate || isBeforeLimit || !isCurrentMonth}
            >
              {format(day, "d")}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
