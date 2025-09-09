"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Wifi } from "lucide-react"
import React from "react"
import { useTooltips } from "./tooltip-context"

interface CalendarDay {
  date: number
  month: number
  year: number
  hotelLowestRate: number
  variance: number
  hasEvent: boolean
  eventIcon: string
  eventCount: number
  isMyRateLowest: boolean
  isMyRateHighest: boolean
  showRateDot: boolean
  isHighest: boolean
  isLowest: boolean
}

interface CalendarTooltipProps {
  day: CalendarDay
  children: React.ReactNode
  getCompetitiveData: (day: CalendarDay) => any
  weekDays: string[]
}

export const CalendarTooltip = ({ day, children, getCompetitiveData, weekDays }: CalendarTooltipProps) => {
  const { calendarTooltipsEnabled } = useTooltips()
  
  // Get day name from date
  const getTooltipSide = (): "top" | "right" | "bottom" | "left" => "top" // Standard top positioning for all days
  
  // Get month name
  const getMonthName = (monthIndex: number) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months[monthIndex]
  }
  
  // Get day name
  const getDayName = () => {
    const date = new Date(day.year, day.month, day.date)
    return weekDays[date.getDay()]
  }

  // Calculate Avg. Compset rate
  const avgCompsetRate = Math.floor(day.hotelLowestRate * 1.1)

  return (
    <TooltipProvider delayDuration={0} skipDelayDuration={0}>
      <Tooltip delayDuration={0} disableHoverableContent>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={getTooltipSide()} className={`calendar-tooltip-content bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-4 w-[460px] z-[9001] ${calendarTooltipsEnabled ? '' : 'hidden'}`}>
          <div>
            {/* Date Heading */}
            <div className="mb-2">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-900 dark:text-white">
                  <span className="text-base font-bold">{String(day.date).padStart(2, '0')} {getMonthName(day.month)} 2024</span>
                  <span className="text-sm font-normal">, {getDayName()}</span>
                </h3>
                {/* Status Dot and Text - Show if cell has highest/lowest status */}
                {(() => {
                  const competitive = getCompetitiveData(day)
                  if (competitive.showRateDot) {
                    return (
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          competitive.isMyRateLowest ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
                        }`} />
                        <span className={`text-xs font-medium ${
                          competitive.isMyRateLowest ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {competitive.isMyRateLowest ? 'Lowest Rate' : 'Highest Rate'}
                        </span>
                      </div>
                    )
                  }
                  return null
                })()}
              </div>
            </div>

            {/* Rate Information Grid */}
            <div className="mb-3">
              <div className="text-xs text-gray-700 dark:text-gray-300 mb-2 font-medium">Pricing Information</div>
              
              <div className="grid gap-1 text-xs mt-2" style={{gridTemplateColumns: '90px 150px 90px 90px'}}>
                <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                  $210
                </div>
                <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                  STD (Standard Room)
                </div>
                <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                  <div className="flex items-center gap-1">
                    <Wifi className="w-3 h-3 flex-shrink-0" />
                    <span>WiFi</span>
                  </div>
                </div>
                <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                  Booking.com
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 mb-3">
              <span>Avg. Compset: ${avgCompsetRate}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                day.variance > 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                day.variance < 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {day.variance > 0 ? '+' : ''}{day.variance}%
              </span>
            </div>

            {/* Event Information - Only show if events exist */}
            {day.hasEvent && (
              <div className="mb-3">
                <div className="text-xs text-gray-700 dark:text-gray-300 mb-2 font-medium">Event Information</div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-lg">{day.eventIcon}</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {day.eventCount} event{day.eventCount > 1 ? 's' : ''} today
                  </span>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
              <div className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                Standard Room | Continental breakfast included. Breakfast rated 6. Non-refundable. If you cancel, modify the booking, or don't show up, the fee will be the total price of the reservation...
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
