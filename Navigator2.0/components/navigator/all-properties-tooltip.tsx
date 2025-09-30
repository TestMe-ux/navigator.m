"use client"

import React from "react"
import { TooltipContent } from "@/components/ui/tooltip"
import { Star, Wifi } from "lucide-react"

interface AllPropertiesTooltipProps {
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
  rateEntry?: any
  currency?: string
  symbol?: string
}

export function AllPropertiesTooltip({
  date,
  dayName,
  rate,
  variance,
  hasEvent,
  eventNames,
  hotelName = "",
  isLowestRate,
  isHighestRate,
  rowIndex,
  rateEntry,
  currency = "USD",
  symbol = "$"
}: AllPropertiesTooltipProps) {
  // Format the date properly
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Tooltip positioning logic
  const tooltipSide = (rowIndex !== undefined && rowIndex < 4) ? "bottom" : "top";
  const sideOffset = 12;
  const tooltipAlign = "center";

  return (
            <TooltipContent 
              side={tooltipSide} 
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-4 pr-6 w-[548px] z-[50]" 
              sideOffset={sideOffset} 
              avoidCollisions={true} 
              collisionPadding={20} 
              align={tooltipAlign}
            >
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
                <div className={`w-2.5 h-2.5 rounded-full ${isLowestRate ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
                  }`} />
                <span className={`text-xs font-medium ${isLowestRate ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                  {isLowestRate ? 'Lowest Rate' : 'Highest Rate'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-3">
          <div className="grid gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-1" style={{gridTemplateColumns: '135px 115px 135px 120px'}}>
            <div className="text-left">Properties</div>
            <div className="text-left">Rate</div>
            <div className="text-left">Room</div>
            <div className="text-left">Channel</div>
          </div>
          
          <div className="grid gap-2 text-xs mt-2" style={{gridTemplateColumns: '135px 115px 135px 120px'}}>
            <div className="font-semibold text-gray-900 dark:text-white text-left">
              <div className="flex items-start gap-1">
                <div className="text-wrap">
                  {(() => {
                    const propertyText = hotelName || 'Luxury Resort & Spa';
                    return propertyText.length > 18
                      ? propertyText.substring(0, 18) + "..."
                      : propertyText;
                  })()}
                </div>
              </div>
            </div>
            <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden text-left" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
              {currency} {rate.toLocaleString('en-US')}
            </div>
            <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden text-left" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {rateEntry?.productName || 'Standard Room'} {rateEntry?.abbreviation ? "(" + rateEntry?.abbreviation + ")" : ""}
            </div>
            <div className="font-semibold text-gray-900 dark:text-white text-left">
              {(() => {
                const channelName = rateEntry?.channelName || 'Booking.com';
                return channelName.length > 14
                  ? channelName.substring(0, 14) + "..."
                  : channelName;
              })()}
            </div>
          </div>
          
          {/* Comp. Lowest Row */}
          <div className="grid gap-2 text-xs mt-2" style={{gridTemplateColumns: '135px 115px 135px 120px'}}>
            <div className="text-xs text-green-600 dark:text-green-400 text-left">
              Comp. Lowest
            </div>
            <div className="text-green-600 dark:text-green-400 break-words overflow-hidden text-left" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
              {currency} {Math.floor(rate * 0.85).toLocaleString('en-US')}
            </div>
            <div className="text-gray-900 dark:text-white break-words overflow-hidden text-left" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {rateEntry?.productName || 'Standard Room'} {rateEntry?.abbreviation ? "(" + rateEntry?.abbreviation + ")" : ""}
            </div>
            <div className="text-gray-900 dark:text-white text-left">
              {(() => {
                const channelName = rateEntry?.channelName || 'Booking.com';
                return channelName.length > 14
                  ? channelName.substring(0, 14) + "..."
                  : channelName;
              })()}
            </div>
          </div>
          
          {/* Comp. Highest Row */}
          <div className="grid gap-2 text-xs mt-2" style={{gridTemplateColumns: '135px 115px 135px 120px'}}>
            <div className="text-xs text-red-600 dark:text-red-400 text-left">
              Comp. Highest
            </div>
            <div className="text-red-600 dark:text-red-400 break-words overflow-hidden text-left" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
              {currency} {Math.floor(rate * 1.15).toLocaleString('en-US')}
            </div>
            <div className="text-gray-900 dark:text-white break-words overflow-hidden text-left" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {rateEntry?.productName || 'Standard Room'} {rateEntry?.abbreviation ? "(" + rateEntry?.abbreviation + ")" : ""}
            </div>
            <div className="text-gray-900 dark:text-white text-left">
              {(() => {
                const channelName = rateEntry?.channelName || 'Booking.com';
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
                        <span className="font-medium">Avg. Compset - </span><span className="font-bold">{currency} {Math.floor(rate * 0.95).toLocaleString('en-US')}</span>
                      </div>
                    </div>

            {/* Events Section with 24px margin */}
            {hasEvent && eventNames && eventNames.length > 0 && (
              <div style={{ marginLeft: '24px' }}>
                <div className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-amber-500 fill-current" />
                  <div className="text-xs text-gray-800 dark:text-gray-200">
                    {eventNames[0]}
                  </div>
                  <div style={{ paddingLeft: '0px' }}>
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {eventNames.length > 1 && ` +${eventNames.length - 1} more`}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed text-left">
            <span className="font-semibold">Subscriber Description:</span> {(() => {
              const description = rateEntry?.shortRateDescription || 'Best available rate for this property with flexible cancellation policy.';
              return description.length > 180
                ? description.substring(0, 180) + "..."
                : description;
            })()}
          </div>
        </div>
      </div>
    </TooltipContent>
  )
}
