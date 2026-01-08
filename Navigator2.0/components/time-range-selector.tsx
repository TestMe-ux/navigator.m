"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type TimeRange = {
  id: string
  label: string
}

const timeRanges: TimeRange[] = [
  { id: "days", label: "Days" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
]

export function TimeRangeSelector() {
  const [selectedRange, setSelectedRange] = React.useState("days")

  return (
    <div className="flex space-x-1">
      {timeRanges.map((range) => (
        <Button
          key={range.id}
          variant={selectedRange === range.id ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-7 px-3 text-xs",
            selectedRange === range.id
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "text-gray-600 hover:text-gray-900",
          )}
          onClick={() => setSelectedRange(range.id)}
        >
          {range.label}
        </Button>
      ))}
    </div>
  )
}
