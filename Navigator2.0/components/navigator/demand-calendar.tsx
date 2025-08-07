"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, CalendarDays, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DemandDay {
  date: Date
  demandLevel: "very-low" | "low" | "normal" | "elevated" | "high" | "very-high"
  changeDirection?: "up" | "down"
  hasOpportunity?: boolean
  isSelected?: boolean
  events?: string[]
}

const getDemandStyling = (level: DemandDay["demandLevel"], isSelected?: boolean) => {
  if (isSelected) {
    return "bg-demand-selected text-demand-selected-text"
  }
  switch (level) {
    case "very-low":
      return "bg-demand-very-low text-white"
    case "low":
      return "bg-demand-low text-white"
    case "normal":
      return "bg-demand-normal text-demand-normal-text"
    case "elevated":
      return "bg-demand-elevated text-demand-elevated-text"
    case "high":
      return "bg-demand-high text-demand-high-text"
    case "very-high":
      return "bg-demand-very-high text-white"
    default:
      return "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
  }
}

const generateMonthDays = (year: number, month: number, demandData: DemandDay[]): (DemandDay | null)[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const emptyCellsAtStart = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const days: (DemandDay | null)[] = Array(emptyCellsAtStart).fill(null)
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i)
    const existingData = demandData.find(
      (d) => d.date.getFullYear() === year && d.date.getMonth() === month && d.date.getDate() === i,
    )
    days.push(existingData || { date, demandLevel: "normal" })
  }
  return days
}

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const MonthDisplay: React.FC<{
  monthDate: Date
  demandData: DemandDay[]
  selectedDay: Date | null
  onDayClick: (day: DemandDay | null) => void
}> = ({ monthDate, demandData, selectedDay, onDayClick }) => {
  const monthDays = generateMonthDays(monthDate.getFullYear(), monthDate.getMonth(), demandData)
  return (
    <div className="mb-4">
      <h4 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-2 text-center">
        {monthDate.toLocaleString("default", { month: "long", year: "numeric" })}
      </h4>
      <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
        {dayNames.map((day) => (
          <div key={`${monthDate.toISOString()}-${day}`} className="pb-1">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((day, index) => (
          <button
            key={index}
            onClick={() => onDayClick(day)}
            disabled={!day}
            className={cn(
              "relative flex items-center justify-center h-10 rounded-lg text-sm font-semibold transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
              day
                ? getDemandStyling(day.demandLevel, day.date.toDateString() === selectedDay?.toDateString())
                : "bg-transparent cursor-default",
              day ? "hover:opacity-80" : "",
            )}
          >
            {day && (
              <>
                <span>{day.date.getDate()}</span>
                {day.changeDirection === "up" && (
                  <ArrowUp className="absolute top-1 right-1 h-2.5 w-2.5 text-green-500" />
                )}
                {day.changeDirection === "down" && (
                  <ArrowDown className="absolute top-1 right-1 h-2.5 w-2.5 text-red-500" />
                )}
                {day.hasOpportunity && (
                  <Sparkles className="absolute bottom-1 right-1 h-2.5 w-2.5 text-demand-opportunity" />
                )}
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export function DemandCalendar() {
  const [primaryMonthDate, setPrimaryMonthDate] = React.useState(new Date(2025, 5)) // Default to June 2025
  const [selectedOpportunityFilter, setSelectedOpportunityFilter] = React.useState("any")
  const [selectedDay, setSelectedDay] = React.useState<Date | null>(new Date("2025-06-17"))

  const mockDemandData: DemandDay[] = React.useMemo(() => {
    const baseData: DemandDay[] = [
      { date: new Date("2025-05-28"), demandLevel: "low" },
      { date: new Date("2025-06-01"), demandLevel: "normal", hasOpportunity: true },
      { date: new Date("2025-06-02"), demandLevel: "elevated" },
      { date: new Date("2025-06-17"), demandLevel: "high", changeDirection: "up" },
      { date: new Date("2025-06-24"), demandLevel: "very-high", hasOpportunity: true },
      { date: new Date("2025-07-05"), demandLevel: "low", hasOpportunity: true },
      { date: new Date("2025-07-10"), demandLevel: "very-low", changeDirection: "down" },
      { date: new Date("2025-07-22"), demandLevel: "elevated", hasOpportunity: true },
      { date: new Date("2025-08-01"), demandLevel: "normal" },
      { date: new Date("2025-08-15"), demandLevel: "high", hasOpportunity: true },
    ]
    return baseData // No need to map isSelected here, it's handled in getDemandStyling
  }, [])

  const handlePrevMonth = () => {
    setPrimaryMonthDate(new Date(primaryMonthDate.getFullYear(), primaryMonthDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setPrimaryMonthDate(new Date(primaryMonthDate.getFullYear(), primaryMonthDate.getMonth() + 1, 1))
  }

  const handleDayClick = (day: DemandDay | null) => {
    if (day) {
      setSelectedDay(day.date)
      console.log("Selected day:", day.date)
    }
  }

  const secondaryMonthDate = new Date(primaryMonthDate.getFullYear(), primaryMonthDate.getMonth() + 1, 1)

  const opportunitiesInView = mockDemandData.filter(
    (d) =>
      d.hasOpportunity &&
      ((d.date.getFullYear() === primaryMonthDate.getFullYear() && d.date.getMonth() === primaryMonthDate.getMonth()) ||
        (d.date.getFullYear() === secondaryMonthDate.getFullYear() &&
          d.date.getMonth() === secondaryMonthDate.getMonth())),
  ).length

  return (
    <Card className="w-[340px] shadow-lg border-none bg-white dark:bg-slate-800 flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center">
            <CalendarDays className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
            Demand Calendar
          </CardTitle>
        </div>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} aria-label="Previous month">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-md font-medium text-slate-700 dark:text-slate-200 text-center">
            {primaryMonthDate.toLocaleString("default", { month: "long" })}
            {" & "}
            {secondaryMonthDate.toLocaleString("default", { month: "long", year: "numeric" })}
          </span>
          <Button variant="ghost" size="icon" onClick={handleNextMonth} aria-label="Next month">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="mt-4">
          <Select value={selectedOpportunityFilter} onValueChange={setSelectedOpportunityFilter}>
            <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
              <SelectValue placeholder="Filter opportunities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Opportunity</SelectItem>
              <SelectItem value="high-price">High Price Opportunity</SelectItem>
              <SelectItem value="low-price">Low Price Opportunity</SelectItem>
              <SelectItem value="no-opportunity">No Opportunity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col overflow-y-auto pt-0">
        <MonthDisplay
          monthDate={primaryMonthDate}
          demandData={mockDemandData}
          selectedDay={selectedDay}
          onDayClick={handleDayClick}
        />
        <MonthDisplay
          monthDate={secondaryMonthDate}
          demandData={mockDemandData}
          selectedDay={selectedDay}
          onDayClick={handleDayClick}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-auto pt-2 text-center">
          {opportunitiesInView} opportunities in current view.
        </p>
      </CardContent>
    </Card>
  )
}
