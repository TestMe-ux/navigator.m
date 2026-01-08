"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface DayData {
  date: Date
  demandLevel: "very-low" | "low" | "normal" | "elevated" | "high" | "very-high"
  searches?: number
  hasOpportunity?: boolean
  isSelected?: boolean
}

const getDemandStyling = (level: DayData["demandLevel"]) => {
  switch (level) {
    case "very-low":
      return "bg-demand-very-low/10 border-demand-very-low text-demand-very-low"
    case "low":
      return "bg-demand-low/10 border-demand-low text-demand-low"
    case "normal":
      return "bg-demand-normal/10 border-demand-normal text-demand-normal-text"
    case "elevated":
      return "bg-demand-elevated/10 border-demand-elevated text-demand-elevated-text"
    case "high":
      return "bg-demand-high/10 border-demand-high text-demand-high-text"
    case "very-high":
      return "bg-demand-very-high/10 border-demand-very-high text-demand-very-high"
    default:
      return "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
  }
}

const demandLevelText: Record<DayData["demandLevel"], string> = {
  "very-low": "V. Low",
  low: "Low",
  normal: "Normal",
  elevated: "Elevated",
  high: "High",
  "very-high": "V. High",
}

const generateMonthDays = (year: number, month: number, demandData: DayData[]): (DayData | null)[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const emptyCellsAtStart = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const days: (DayData | null)[] = Array(emptyCellsAtStart).fill(null)
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i)
    const existingData = demandData.find(
      (d) => d.date.getFullYear() === year && d.date.getMonth() === month && d.date.getDate() === i,
    )
    days.push(existingData || { date, demandLevel: "normal" })
  }
  return days
}

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function LargeDemandCalendar() {
  const [currentDate, setCurrentDate] = React.useState(new Date(2025, 5)) // June 2025
  const [selectedDay, setSelectedDay] = React.useState<Date | null>(new Date("2025-06-17"))

  const mockDemandData: DayData[] = React.useMemo(() => {
    return [
      { date: new Date("2025-06-01"), demandLevel: "normal", searches: 850, hasOpportunity: true },
      { date: new Date("2025-06-02"), demandLevel: "elevated", searches: 1200 },
      { date: new Date("2025-06-10"), demandLevel: "high", searches: 1800, hasOpportunity: true },
      { date: new Date("2025-06-17"), demandLevel: "high", searches: 2100, isSelected: true },
      { date: new Date("2025-06-24"), demandLevel: "very-high", searches: 3500, hasOpportunity: true },
      { date: new Date("2025-06-30"), demandLevel: "elevated", searches: 1400 },
    ]
  }, [])

  const currentMonthDays = generateMonthDays(currentDate.getFullYear(), currentDate.getMonth(), mockDemandData)

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  const handleDayClick = (day: DayData | null) => day && setSelectedDay(day.date)

  return (
    <Card className="shadow-lg border-none w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth} aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-t border-l border-slate-200 dark:border-slate-700">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-semibold border-b border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              {day}
            </div>
          ))}
          {currentMonthDays.map((day, index) => (
            <div
              key={index}
              onClick={() => handleDayClick(day)}
              className={cn(
                "relative p-2 h-32 border-b border-r border-slate-200 dark:border-slate-700 transition-colors cursor-pointer",
                day ? "hover:bg-slate-50 dark:hover:bg-slate-800/50" : "bg-slate-50 dark:bg-slate-800/20",
                day?.date.toDateString() === selectedDay?.toDateString() && "ring-2 ring-blue-500 z-10",
              )}
            >
              {day && (
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start">
                    <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                      {day.date.getDate()}
                    </span>
                    {day.hasOpportunity && <Sparkles className="h-4 w-4 text-demand-opportunity" />}
                  </div>
                  <div className="mt-auto space-y-1 text-xs">
                    <div
                      className={cn(
                        "px-2 py-0.5 rounded-full text-center font-medium border",
                        getDemandStyling(day.demandLevel),
                      )}
                    >
                      {demandLevelText[day.demandLevel]}
                    </div>
                    {day.searches && (
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <TrendingUp className="h-3 w-3" />
                        <span>{day.searches.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
