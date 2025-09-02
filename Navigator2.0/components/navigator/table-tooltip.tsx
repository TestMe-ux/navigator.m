"use client"
import React from "react"
import { Star, Wifi } from "lucide-react"
import { TooltipContent } from "@/components/ui/tooltip"

interface TableTooltipProps {
  date: Date
  dayName: string
  rate: number
  variance: number
  hasEvent?: boolean
  eventNames?: string[]
  hotelName?: string
  isLowestRate?: boolean
  isHighestRate?: boolean
  avgCompsetRate?: number
  roomType?: string
  channel?: string
  inclusion?: string
  rowIndex?: number
}

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function TableTooltip({
  date,
  dayName,
  rate,
  variance,
  hasEvent = false,
  eventNames = [],
  hotelName = "Alhambra Hotel",
  isLowestRate = false,
  isHighestRate = false,
  avgCompsetRate = 210,
  roomType = "STD (Standard Room)",
  channel = "Booking.com",
  inclusion = "Breakfast",
  rowIndex = 0
}: TableTooltipProps) {
  // Position tooltips below for top 4 rows to avoid header overlap
  const tooltipSide = rowIndex < 4 ? "bottom" : "top";
  const sideOffset = 12;
  const tooltipAlign = "center";
  
  return (
    <TooltipContent side={tooltipSide} className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-4 w-[460px] z-[50]" sideOffset={sideOffset} avoidCollisions={true} collisionPadding={20} align={tooltipAlign}>
      <div>
        <div className="mb-2">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-900 dark:text-white">
              <span className="text-base font-bold">
                {String(date.getDate()).padStart(2, '0')} {months[date.getMonth()]} {date.getFullYear()}
              </span>
              <span className="text-sm font-normal">, {weekDays[date.getDay()]}</span>
            </h3>
            {(isLowestRate || isHighestRate) && (
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  isLowestRate ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
                }`} />
                <span className={`text-xs font-medium ${
                  isLowestRate ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {isLowestRate ? 'Lowest Rate' : 'Highest Rate'}
                </span>
              </div>
            )}
          </div>
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-1 mb-4 text-left">
            {hotelName}
          </div>
        </div>
        
        <div className="space-y-3 mb-3">
          <div className="grid gap-1 text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-1" style={{gridTemplateColumns: '90px 150px 90px 90px'}}>
            <div className="text-left">Lowest Rate</div>
            <div className="text-left">Room</div>
            <div className="text-left">Inclusion</div>
            <div className="text-left">Channel</div>
          </div>
          
          <div className="grid gap-1 text-xs mt-2" style={{gridTemplateColumns: '90px 150px 90px 90px'}}>
            <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden text-left" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
              ${rate}
            </div>
            <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden text-left" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
              {roomType}
            </div>
            <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden text-left" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
              <div className="flex items-center gap-1">
                <Wifi className="w-3 h-3 flex-shrink-0" />
                <span>{inclusion}</span>
              </div>
            </div>
            <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden text-left" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
              {channel}
            </div>
          </div>
        </div>
          
        <div className="mb-3">
          <div className="grid gap-1 text-xs text-black dark:text-gray-100 mb-2" style={{gridTemplateColumns: '90px 150px 90px 90px'}}>
            <div className="text-left whitespace-nowrap">
              <span className="font-medium">Avg. Compset:</span> <span className="font-bold">${avgCompsetRate}</span>
            </div>
          </div>
        </div>
          
        {hasEvent && eventNames.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-3 h-3 text-amber-500 fill-current" />
              <div className="text-xs text-gray-800 dark:text-gray-200 truncate">
                {eventNames.join(', ')}
              </div>
            </div>
          </div>
        )}
      
        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed text-left">
            {roomType} | Continental breakfast included. Breakfast rated 6. Non-refundable. If you cancel, modify the booking, or don't show up, the fee will be the total price of the reservation...
          </div>
        </div>
      </div>
    </TooltipContent>
  )
}