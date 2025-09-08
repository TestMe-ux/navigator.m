"use client"

import { format } from "date-fns"

interface HotelInfo {
  dataKey: string
  name: string
  color: string
}

interface OTARankingTooltipProps {
  active: boolean
  payload: any[]
  label: string
  coordinate: any
  availableHotelLines: HotelInfo[]
}

export function OTARankingTooltip({ 
  active, 
  payload, 
  label, 
  coordinate, 
  availableHotelLines 
}: OTARankingTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload

    // Dynamic positioning based on cursor location
    // Get chart width (approximate) and determine positioning
    const chartWidth = 800 // Approximate chart area width
    const tooltipWidth = 280 // Increased tooltip width for wider property column
    const isNearRightEdge = coordinate && coordinate.x > (chartWidth * 0.6) // 60% from left
    
    const tooltipStyle = isNearRightEdge ? {
      transform: 'translateX(-100%)',
      marginLeft: '-10px'
    } : {
      transform: 'translateX(0%)',
      marginLeft: '10px'
    }

    return (
      <div 
        className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-3 min-w-[260px] max-w-[300px] z-[10001] relative"
        style={tooltipStyle}
      >
        {/* Date Heading */}
        <div className="mb-2">
          <h3 className="text-gray-900 dark:text-white">
            <span className="text-base font-bold">{data?.fullDate ? format(new Date(data.fullDate), "dd MMM yyyy") : ''}</span>
            <span className="text-sm font-normal">{data?.fullDate ? `, ${format(new Date(data.fullDate), 'EEE')}` : ''}</span>
          </h3>
        </div>

        {/* Column Headings */}
        <div className="flex justify-between px-2">
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Property</span>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Rank&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          </div>
        </div>

        {/* Hotel Rankings */}
        <div className="space-y-2 mt-1">
          {payload.map((entry: any, index: number) => {
            // Find hotel info from availableHotelLines
            const hotelInfo = availableHotelLines.find(hotel => hotel.dataKey === entry.dataKey)
            const hotelName = hotelInfo?.name || entry.name || 'Unknown Hotel'
            
            // Truncate long hotel names for tooltip display - increased limit for wider column
            const truncatedName = hotelName.length > 28 ? `${hotelName.substring(0, 25)}...` : hotelName
            
            const rank = entry.value
            // Get variance from data
            const getVarianceText = (dataKey: string) => {
              const variance = data?.[`${dataKey}Variance`]
              if (variance === 0 || variance === null || variance === undefined) {
                return 'NF'
              }
              const sign = variance > 0 ? '+' : ''
              return `${sign}${variance}`
            }
            const variance = getVarianceText(entry.dataKey)
            const isMyHotel = entry.dataKey === 'myHotel'

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
                
                {/* Rank Column - Right aligned */}
                <div className="flex items-center gap-3">
                  <div className={`text-xs font-bold w-6 text-right ${
                    isMyHotel ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-slate-100'
                  }`}>
                    #{rank}
                  </div>
                  <div className={`text-xs font-medium w-6 text-right ${
                    variance === 'NF' ? 'text-gray-500' :
                    variance.toString().startsWith('+') ? 'text-red-600 dark:text-red-400 font-bold' : 
                    'text-green-600 dark:text-green-400 font-bold'
                  }`}>
                    {variance}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  return null
}
