"use client"

import React from "react"
import { format } from "date-fns"
import { Calendar } from "lucide-react"

interface ModalTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
  coordinate?: { x: number; y: number }
}

/**
 * Modal Tooltip Component - matches Rate Trends Chart tooltip styling
 * Based on RateTrendsTooltip from rate-trends-chart.tsx
 */
export const ModalTooltip = ({ active, payload, label, coordinate }: ModalTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload

    // Dynamic positioning based on cursor location
    const chartWidth = 900 // Modal chart area width
    const tooltipWidth = 320 // Tooltip width for Rate and Variance columns
    const isNearRightEdge = coordinate && coordinate.x > (chartWidth * 0.6) // 60% from left
    
    const tooltipStyle = isNearRightEdge ? {
      transform: 'translateX(-2px)',
      marginLeft: '-2px'  // Reduced from -10px to -2px for closer positioning
    } : {
      transform: 'translateX(0%)',
      marginLeft: '2px'   // Reduced from 10px to 2px for closer positioning
    }

    return (
      <div 
        className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-3 min-w-[300px] max-w-[340px] z-[10001] relative"
        style={tooltipStyle}
      >
        {/* Date Heading */}
        <div className="mb-2">
          <h3 className="text-gray-900 dark:text-white">
            <span className="text-base font-bold">{label ? format(new Date(label), "dd MMM yyyy") : ''}</span>
            <span className="text-sm font-normal">{label ? `, ${format(new Date(label), 'EEE')}` : ''}</span>
          </h3>
        </div>

        {/* Column Headings */}
        <div className="flex justify-between px-2">
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Property</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Rate</span>
          </div>
        </div>

        {/* Hotel Rates */}
        <div className="space-y-2 mt-1">
          {(() => {
            // Find My Hotel rate for variance calculations
            const myHotelEntry = payload.find((entry: any) => 
              entry.name === 'OTB' || entry.dataKey === 'OTB'
            )
            const myHotelRate = myHotelEntry ? parseFloat(myHotelEntry.value) : null

            return payload.map((entry: any, index: number) => {
              const rate = parseFloat(entry.value)
              const propertyName = entry.name || entry.dataKey || `Property ${index + 1}`
              const isMyHotel = propertyName === 'OTB'
              
              // Truncate long hotel names for tooltip display
              const truncatedName = propertyName.length > 20 ? `${propertyName.substring(0, 17)}...` : propertyName

              return (
                <div key={index} className={`flex justify-between items-center py-1.5 pl-2 pr-4 rounded-md ${
                  isMyHotel ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700' : ''
                }`}>
                  {/* Property Column */}
                  <div className="flex items-center gap-2 flex-1 min-w-0 mr-4">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <div className={`text-xs font-medium whitespace-nowrap ${
                      isMyHotel ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-slate-100'
                    }`}>
                      {truncatedName}
                    </div>
                  </div>
                  
                  {/* Rate Column - Right aligned */}
                  <div className={`text-xs font-bold text-right ${
                    isMyHotel ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-slate-100'
                  }`}>
                    ${rate.toLocaleString()}
                  </div>
                </div>
              )
            })
          })()}
        </div>
      </div>
    )
  }
  return null
}
