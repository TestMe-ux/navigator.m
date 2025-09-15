"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Wifi, Star } from "lucide-react"
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
        <TooltipContent side={getTooltipSide()} className={`calendar-tooltip-content bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-4 pr-6 w-[528px] z-[9001] ${calendarTooltipsEnabled ? '' : 'hidden'}`}>
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
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-1 mb-4 text-left">
                Alhambra Hotel
              </div>
            </div>

            <div className="space-y-3 mb-3">
              <div className="grid gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-1" style={{gridTemplateColumns: '95px 135px 135px 120px'}}>
                <div className="text-left">Lowest Rate</div>
                <div className="text-left">Room</div>
                <div className="text-left">Inclusion</div>
                <div className="text-left">Channel</div>
              </div>
              
              <div className="grid gap-2 text-xs mt-2" style={{gridTemplateColumns: '95px 135px 135px 120px'}}>
                <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden text-left" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                  $210
                </div>
                <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden text-left" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                  Standard King
                </div>
                <div className="font-semibold text-gray-900 dark:text-white text-left">
                  <div className="flex items-start gap-1">
                    <Wifi className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <div className="text-wrap">
                      {(() => {
                        const inclusionText = "Free Wifi and Airport Pickup - Drop";
                        if (inclusionText.length <= 19) {
                          return <span>{inclusionText}</span>;
                        }
                        
                        const firstLine = inclusionText.substring(0, 19);
                        const remaining = inclusionText.substring(19);
                        const secondLine = remaining.length > 14 
                          ? remaining.substring(0, 14) + "..."
                          : remaining;
                        
                        return (
                          <div>
                            <div>{firstLine}</div>
                            <div>{secondLine}</div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                <div className="font-semibold text-gray-900 dark:text-white text-left">
                  {(() => {
                    const channelName = "Booking.com";
                    return channelName.length > 14 
                      ? channelName.substring(0, 14) + "..."
                      : channelName;
                  })()}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-start gap-6">
                {/* Avg. Compset Section */}
                <div className="text-xs text-black dark:text-gray-100">
                  <div className="text-left whitespace-nowrap">
                    <span className="font-bold">${avgCompsetRate}</span> <span className="font-medium">- Avg. Compset</span>
                  </div>
                </div>
                
                {/* Events Section with 24px margin */}
                {day.hasEvent && (
                  <div style={{ marginLeft: '24px' }}>
                    <div className="flex items-center gap-2">
                      <Star className="w-3 h-3 text-amber-500 fill-current" />
                      <div className="text-xs text-gray-800 dark:text-gray-200">
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
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed text-left">
                Standard King | Continental breakfast included. Breakfast rated 6. Non-refundable. If you cancel, modify the booking, or don't show up, the fee will be the total price of the reservation...
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
