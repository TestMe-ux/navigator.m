"use client"

import React from "react"
import { TooltipContent } from "@/components/ui/tooltip"
import { Calendar, Star } from "lucide-react"

interface TableTooltipProps {
  date: Date
  dayName: string
  rate: number
  variance?: number
  hasEvent?: boolean
  eventNames?: string[]
  hotelName?: string
  isLowestRate?: boolean
  isHighestRate?: boolean
  rowIndex?: number
}

export function TableTooltip({
  date,
  dayName,
  rate,
  variance,
  hasEvent,
  eventNames,
  hotelName,
  isLowestRate,
  isHighestRate,
  rowIndex
}: TableTooltipProps) {
  
  // Format the date properly
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Tooltip positioning logic
  const tooltipSide = (rowIndex !== undefined && rowIndex < 4) ? "bottom" : "top";
  const sideOffset = 12;
  const tooltipAlign = "center";
  return (
    <TooltipContent side="top" className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-4 min-w-[300px] z-[10001]">
      <div>
        {/* Date Heading */}
        <div className="mb-2">
          <h3 className="text-gray-900 dark:text-white">
            <span className="text-base font-bold">{date}</span>
            <span className="text-sm font-normal">, {dayName}</span>
          </h3>
        </div>

        {/* Hotel Name (if provided) */}
        {hotelName && (
          <div className="mb-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {hotelName}
            </div>
          </div>
        )}

        {/* Rate Information */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Rate:</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {rate > 0 ? `$${rate.toLocaleString()}` : 'N/A'}
            </span>
          </div>

          {variance !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Variance:</span>
              <span className={`text-sm font-semibold ${
                variance > 0 ? 'text-red-600' : variance < 0 ? 'text-green-600' : 'text-gray-500'
              }`}>
                {variance === 0 ? 'NF' : `${variance > 0 ? '+' : ''}${variance.toFixed(0)}`}
              </span>
            </div>
          )}

          {isLowestRate && (
            <div className="flex items-center gap-1 text-green-600">
              <span className="text-xs font-medium">Lowest Rate</span>
            </div>
          )}
        </div>

        {/* Event Information */}
        {hasEvent && eventNames && eventNames.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-3 h-3 text-amber-500" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Events</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500 fill-current" />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Music Festival
              </div>
              <div style={{ paddingLeft: '0px' }}>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                  (+2 more)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipContent>
  )
}

