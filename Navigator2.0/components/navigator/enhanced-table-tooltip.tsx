"use client"

import React from "react"
import { TooltipContent } from "@/components/ui/tooltip"
import { Star, Wifi } from "lucide-react"

interface EnhancedTableTooltipProps {
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

export function EnhancedTableTooltip({
  date,
  dayName,
  rate,
  variance,
  hasEvent,
  eventNames,
  hotelName = "The Ritz-Carlton",
  isLowestRate,
  isHighestRate,
  rowIndex
}: EnhancedTableTooltipProps) {
  
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
          <div className="grid gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-1" style={{gridTemplateColumns: '115px 135px 135px 120px'}}>
            <div className="text-left">Lowest Rate</div>
            <div className="text-left">Room</div>
            <div className="text-left">Inclusion</div>
            <div className="text-left">Channel</div>
          </div>
          
          <div className="grid gap-2 text-xs mt-2" style={{gridTemplateColumns: '115px 135px 135px 120px'}}>
            <div className="font-semibold text-gray-900 dark:text-white break-words overflow-hidden text-left" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
              USD {rate.toLocaleString('en-US')}
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
                // Show BrandGoogleHotelFinder.com for first 2 dates (rowIndex 0 and 1)
                const channelName = (rowIndex !== undefined && rowIndex < 2) 
                  ? "BrandGoogleHotelFinder.com"
                  : "Booking.com";
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
                <span className="font-bold">USD {Math.floor(rate * 0.95).toLocaleString('en-US')}</span> <span className="font-medium">- Avg. Compset</span>
              </div>
            </div>
            
            {/* Events Section with 24px margin */}
            {hasEvent && eventNames && eventNames.length > 0 && (
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
  )
}

