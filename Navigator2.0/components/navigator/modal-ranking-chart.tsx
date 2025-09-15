"use client"

import React, { useState, useMemo, useCallback } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts"
import { format, addDays } from "date-fns"

interface ModalRankingChartProps {
  selectedDate: Date
  numberOfDays?: number
}

// Hotel lines data for the modal chart (independent from OTA Rankings page)
const modalHotelLines = [
  { dataKey: 'myHotel', name: 'Alhambra Hotel', color: '#3b82f6' },
  { dataKey: 'avgCompset', name: 'Avg. Compset', color: '#0891b2' },
  { dataKey: 'competitor1', name: 'Grand Hotel Guayaquil International Resorts', color: '#10b981' },
  { dataKey: 'competitor2', name: 'Clarion Inn Lake Buena Vista Resort & Spa Premium Collection', color: '#f59e0b' },
  { dataKey: 'competitor3', name: 'Marriott Downtown', color: '#ef4444' },
  { dataKey: 'competitor4', name: 'Hilton Garden Inn', color: '#8b5cf6' },
  { dataKey: 'competitor5', name: 'Hampton Inn & Suites by Hilton Orlando International Drive', color: '#06b6d4' },
  { dataKey: 'competitor6', name: 'Holiday Inn Express', color: '#84cc16' },
  { dataKey: 'competitor7', name: 'Courtyard by Marriott Orlando Downtown', color: '#f97316' },
  { dataKey: 'competitor8', name: 'The Ritz-Carlton Orlando Grande Lakes Luxury Resort & Spa', color: '#ec4899' },
  { dataKey: 'competitor9', name: 'Four Seasons Resort Orlando at Walt Disney World Resort', color: '#6366f1' },
  { dataKey: 'competitor10', name: 'Waldorf Astoria Orlando', color: '#14b8a6' },
].map(hotel => ({
  ...hotel,
  name: hotel.name.length > 24 ? `${hotel.name.substring(0, 24)}...` : hotel.name
}))

export function ModalRankingChart({ selectedDate, numberOfDays = 15 }: ModalRankingChartProps) {
  // Independent legend visibility state for modal
  const [modalLegendVisibility, setModalLegendVisibility] = useState<{[key: string]: boolean}>(() => {
    const initial: {[key: string]: boolean} = {}
    modalHotelLines.forEach((hotel, index) => {
      // Show: myHotel, avgCompset, and first 4 competitors (6 lines total)
      initial[hotel.dataKey] = index <= 5 // Shows indices 0-5 (6 hotels)
    })
    return initial
  })

  // Error message state for hotel selection limit
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Generate ranking data for the modal chart
  const modalRankingData = useMemo(() => {
    const baseDate = selectedDate

    // Generate variance data function
    const generateVarianceData = (currentRank: number, dayIndex: number, hotelType: string) => {
      const patterns = {
        myHotel: [2, 1, 0, -1, 1, 0, 1, -2, 1, 0, -1, 2, 1, 0],
        competitor1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // NF - no variance
        competitor2: [-1, -2, -1, 0, -1, -2, -1, -2, -1, 0, -1, -2, -1, 0],
        competitor3: [1, -1, 2, 0, -1, 1, 0, 1, -2, 0, 1, -1, 2, 0],
        competitor4: [-2, 1, -1, 1, 0, -1, 2, -1, 0, 1, -2, 1, -1, 0],
        competitor5: [0, 1, -1, 2, -1, 0, 1, -2, 1, 0, -1, 2, 0, -1],
        competitor6: [1, 0, -2, 1, -1, 2, 0, -1, 1, -2, 0, 1, -1, 2],
        competitor7: [-1, 2, 0, -2, 1, 0, -1, 2, -1, 0, 1, -2, 0, 1],
      }
      
      const variancePattern = patterns[hotelType as keyof typeof patterns] || patterns.competitor2
      return variancePattern[dayIndex % variancePattern.length]
    }

    const baseData = Array.from({ length: numberOfDays }, (_, index) => {
      const currentDate = addDays(baseDate, -(numberOfDays - 1 - index)) // Calculate days before check-in
      const daysBeforeCheckIn = numberOfDays - 1 - index
      
      const dataPoint: any = {
        date: format(currentDate, 'dd MMM'),
        fullDate: format(currentDate, 'yyyy-MM-dd'),
        daysLabel: `${daysBeforeCheckIn} days`,
        daysBefore: daysBeforeCheckIn
      }
      
      // Generate rates for each hotel (400-900 range)
      modalHotelLines.forEach((hotel, hotelIndex) => {
        const rateRanges = [
          [650, 750],   // myHotel: 650-750
          [600, 700],   // avgCompset: 600-700
          [400, 500],   // competitor1: 400-500
          [750, 850],   // competitor2: 750-850
          [500, 600],   // competitor3: 500-600
          [800, 900],   // competitor4: 800-900
          [600, 700],   // competitor5: 600-700
          [450, 550],   // competitor6: 450-550
          [550, 650],   // competitor7: 550-650
          [800, 900],   // competitor8: 800-900 (Ritz-Carlton)
          [850, 900],   // competitor9: 850-900 (Four Seasons)
          [700, 800],   // competitor10: 700-800 (Waldorf Astoria)
        ]
        
        const [minRate, maxRate] = rateRanges[hotelIndex] || [700, 800]
        const baseRate = minRate + Math.floor(Math.random() * (maxRate - minRate + 1))
        
        // Add some daily variation
        const dailyVariation = Math.floor(Math.random() * 40) - 20 // ±20
        const rate = Math.max(400, Math.min(900, baseRate + dailyVariation))
        
        // Generate variance (for tooltip)
        const variance = generateVarianceData(rate, index, hotel.dataKey as any)
        
        dataPoint[hotel.dataKey] = rate
        dataPoint[`${hotel.dataKey}Variance`] = variance
      })
      
      return dataPoint
    })

    return baseData
  }, [selectedDate, numberOfDays])

  // Toggle legend visibility for modal chart
  const toggleModalLegendVisibility = useCallback((dataKey: string) => {
    setModalLegendVisibility(prev => {
      const currentlyVisible = Object.values(prev).filter(Boolean).length
      const isCurrentlySelected = prev[dataKey]
      
      // If trying to enable a hotel and already at limit (10 hotels)
      if (!isCurrentlySelected && currentlyVisible >= 10) {
        setErrorMessage('Maximum 10 hotels can be selected for display')
        // Auto-clear error after 5 seconds
        setTimeout(() => setErrorMessage(''), 5000)
        return prev // Don't change the state
      }
      
      // Clear error when deselecting
      if (isCurrentlySelected && errorMessage) {
        setErrorMessage('')
      }
      
      return {
        ...prev,
        [dataKey]: !prev[dataKey]
      }
    })
  }, [errorMessage])

  // Custom Tooltip Component for Modal Ranking Chart
  const ModalRankingTooltip = ({ active, payload, label, coordinate }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload

      // Dynamic positioning based on cursor location
      const chartWidth = 800
      const tooltipWidth = 280
      const isNearRightEdge = coordinate && coordinate.x > (chartWidth * 0.6)
      
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
              <span className="text-sm font-bold">
                {data?.daysBefore !== undefined ? `${data.daysBefore} days` : ''}
              </span>
              {data?.fullDate && (
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {` (${format(new Date(data.fullDate), "dd MMM yyyy")}, ${format(new Date(data.fullDate), 'EEE')})`}
                </span>
              )}
            </h3>
          </div>

          {/* Column Headings */}
          <div className="flex justify-between px-2">
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Property</span>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Rates&nbsp;&nbsp;&nbsp;</span>
            </div>
          </div>

          {/* Hotel Rankings */}
          <div className="space-y-0 mt-1">
            {payload.map((entry: any, index: number) => {
              const hotelInfo = modalHotelLines.find(hotel => hotel.dataKey === entry.dataKey)
              const hotelName = hotelInfo?.name || entry.name || 'Unknown Hotel'
              
              const truncatedName = hotelName.length > 28 ? `${hotelName.substring(0, 25)}...` : hotelName
              
              const rate = entry.value
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
                  
                  {/* Rates Column - Right aligned */}
                  <div className="flex items-center">
                    <div className={`text-xs font-bold text-right ${
                      isMyHotel ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-slate-100'
                    }`}>
                      ${rate}
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

  return (
    <div style={{ marginRight: '4px' }}>
      {/* Error Message */}
      {errorMessage && (
        <div className="mb-3 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md w-4/5 mx-auto">
          <div className="text-red-700 dark:text-red-300 text-sm font-normal">
            {errorMessage}
          </div>
        </div>
      )}
      
      <div style={{ height: '420px', minHeight: '420px', maxHeight: '420px', overflowY: 'auto', overflowX: 'hidden' }} className="[&_.recharts-wrapper]:mt-3 [&_.recharts-legend-wrapper]:!bottom-[48px]">
        <ResponsiveContainer width="100%" height={420}>
        <LineChart data={modalRankingData} margin={{ top: 20, right: 40, left: 30, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-15 dark:opacity-10" stroke="#e5e7eb" />
          <XAxis 
            dataKey="daysBefore"
            className="text-xs"
            interval="preserveStartEnd"
            height={85}
            tick={({ x, y, payload }) => {
              if (!payload || x === undefined || y === undefined) return null
              
              // Find the data point for this tick
              const dataPoint = modalRankingData.find(d => d.daysBefore === payload.value)
              if (!dataPoint) return null
              
              return (
                <g transform={`translate(${x},${y})`}>
                  {/* Days text (top line) */}
                  <text
                    x={0}
                    y={0}
                    dy={8}
                    textAnchor="middle"
                    fill="hsl(var(--muted-foreground))"
                    fontSize={10}
                    fontWeight="bold"
                  >
                    {dataPoint.daysBefore} days
                  </text>
                  {/* Date text (bottom line) */}
                  <text
                    x={0}
                    y={0}
                    dy={22}
                    textAnchor="middle"
                    fill="hsl(var(--muted-foreground))"
                    fontSize={10}
                  >
                    {dataPoint.date}
                  </text>
                </g>
              )
            }}
            axisLine={true}
            tickLine={false}
            label={{ 
              value: 'Lead-in Period', 
              position: 'insideBottom', 
              offset: 30,
              style: { textAnchor: 'middle', fontSize: 12, fill: 'hsl(var(--muted-foreground))' } 
            }}
          />
          <YAxis
            className="text-xs"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            domain={[400, 900]}
            reversed={false}
            label={{ 
              value: 'Rates (USD)', 
              angle: -90, 
              position: 'insideLeft', 
              style: { textAnchor: 'middle' } 
            }}
            tickFormatter={(value: number) => {
              // Hide the first value ($400)
              if (value === 400) {
                return ''
              }
              return `$${value.toString()}`
            }}
            width={60}
          />
          <RechartsTooltip
            content={ModalRankingTooltip}
            allowEscapeViewBox={{ x: true, y: true }}
            offset={0}
            isAnimationActive={false}
            position={{ x: undefined, y: undefined }}
            wrapperStyle={{
              zIndex: 10000,
              pointerEvents: 'none'
            }}
          />
          
          {/* Hotel Lines - Dynamic rendering */}
          {modalHotelLines.map((hotel) => {
            const isVisible = modalLegendVisibility[hotel.dataKey]
            
            return (
              <Line
                key={hotel.dataKey}
                type="monotone"
                dataKey={hotel.dataKey}
                stroke={isVisible ? hotel.color : 'transparent'}
                strokeWidth={isVisible ? (hotel.dataKey === 'myHotel' ? 3 : 2) : 0}
                name={hotel.name}
                dot={isVisible ? { 
                  fill: "white", 
                  stroke: hotel.color,
                  strokeWidth: 2, 
                  r: hotel.dataKey === 'myHotel' ? 4 : 3 
                } : false}
                activeDot={isVisible ? { 
                  r: hotel.dataKey === 'myHotel' ? 6 : 5, 
                  fill: hotel.color,
                  stroke: hotel.color, 
                  strokeWidth: 2
                } : false}
                hide={!isVisible}
                isAnimationActive={false}
                animationDuration={0}
              />
            )
          })}
          
          {/* Legend */}
          <Legend
            verticalAlign="bottom"
            height={60}
            iconType="line"
            wrapperStyle={{
              paddingTop: "5px",
              fontSize: "12px",
              cursor: "pointer",
              lineHeight: "1.6",
              display: "flex",
              flexWrap: "wrap",
              gap: "18px",
              justifyContent: "center"
            }}
            onClick={(event: any) => {
              if (event.dataKey && typeof event.dataKey === 'string') {
                toggleModalLegendVisibility(event.dataKey)
              }
            }}
            formatter={(value, entry: any) => {
              const dataKey = entry.dataKey as string
              const isVisible = modalLegendVisibility[dataKey]

              return (
                <span style={{
                  color: isVisible ? entry.color : '#9ca3af',
                  fontWeight: isVisible ? 500 : 400,
                  textDecoration: isVisible ? 'none' : 'line-through',
                  cursor: 'pointer'
                }}>
                  {value}
                </span>
              )
            }}
          />
        </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
