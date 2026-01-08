"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface RateVolatilityBoxPlotData {
  name: string
  shortName: string
  min: number
  max: number
  q1: number
  q3: number
  median: number
  avgRangeMin: number
  avgRangeMax: number
  observations: number
}

interface BoxPlotProps {
  data: RateVolatilityBoxPlotData[]
  hoveredHotel?: string | null
  onHotelHover?: (hotel: RateVolatilityBoxPlotData, event?: React.MouseEvent, hotelIndex?: number) => void
  onHotelLeave?: () => void
}

export const BoxPlot = ({ data, hoveredHotel, onHotelHover, onHotelLeave }: BoxPlotProps) => {
  // Calculate dynamic Y-axis range based on data
  const calculateYAxisRange = () => {
    if (data.length === 0) {
      return { maxValue: 600, ticks: [0, 100, 200, 300, 400, 500, 600] }
    }

    const dataMax = Math.max(...data.map((d) => d.max))
    const dataMin = Math.min(...data.map((d) => d.min))
    
    // Add padding (10% above max)
    const paddedMax = Math.ceil(dataMax * 1.1)
    
    // Always start from 0
    const startValue = 0
    
    // Calculate range and determine number of ticks (5-6 ticks)
    const numTicks = 6 // Fixed number of ticks for equal spacing
    const range = paddedMax - startValue
    
    // Calculate step size for equal spacing
    const step = range / (numTicks - 1)
    
    // Round step to a nice number
    const magnitude = Math.pow(10, Math.floor(Math.log10(step)))
    const normalizedStep = step / magnitude
    
    let niceStep: number
    if (normalizedStep <= 1) niceStep = 1 * magnitude
    else if (normalizedStep <= 2) niceStep = 2 * magnitude
    else if (normalizedStep <= 5) niceStep = 5 * magnitude
    else niceStep = 10 * magnitude
    
    // Calculate max value that ensures equal spacing
    const niceMax = startValue + (niceStep * (numTicks - 1))
    
    // Generate ticks with equal spacing
    const ticks: number[] = []
    for (let i = 0; i < numTicks; i++) {
      const value = startValue + (niceStep * i)
      ticks.push(value)
    }
    
    return { maxValue: niceMax, ticks: ticks }
  }

  const { maxValue, ticks } = calculateYAxisRange()
  const chartHeight = 300 // Fixed chart height in SVG coordinates
  const xAxisY = 350 // Fixed X-axis Y position
  const chartTopY = xAxisY - chartHeight // Top of chart area

  // Format Y-axis values with K, M, B abbreviations for values >= 1000
  const formatYAxisValue = (value: number): string => {
    if (value >= 1_000_000_000) {
      // Billions
      const billions = value / 1_000_000_000
      return billions % 1 === 0 ? `${billions.toFixed(0)}B` : `${billions.toFixed(1)}B`
    } else if (value >= 1_000_000) {
      // Millions
      const millions = value / 1_000_000
      return millions % 1 === 0 ? `${millions.toFixed(0)}M` : `${millions.toFixed(1)}M`
    } else if (value >= 1_000) {
      // Thousands
      const thousands = value / 1_000
      return thousands % 1 === 0 ? `${thousands.toFixed(0)}K` : `${thousands.toFixed(1)}K`
    } else {
      // Less than 1000, show as is
      return value.toString()
    }
  }

  // Calculate dynamic bar width based on number of hotels
  const calculateBarWidth = () => {
    const numHotels = data.length
    const baseWidth = 60 // Base box width
    
    if (numHotels <= 10) {
      // No reduction for 10 or fewer hotels
      return baseWidth
    } else if (numHotels < 20) {
      // Reduce by 20% for 11-19 hotels (10+)
      return baseWidth * 0.8 // 48px
    } else if (numHotels < 30) {
      // Reduce by 40% for 20-29 hotels (20+)
      return baseWidth * 0.6 // 36px
    } else if (numHotels < 40) {
      // Reduce by 50% for 30-39 hotels
      return baseWidth * 0.5 // 30px
    } else if (numHotels < 50) {
      // Reduce by 60% for 40-49 hotels
      return baseWidth * 0.4 // 24px
    } else {
      // Reduce by 70% for 50+ hotels
      return baseWidth * 0.3 // 18px
    }
  }

  // Calculate dynamic bar width (needed for position calculation)
  const boxWidth = calculateBarWidth()

  // Calculate dynamic bar positions to distribute horizontally
  const calculateBarPositions = () => {
    const graphStartX = 80 // Left edge of graph area
    const graphEndX = 1150 // Right edge of graph area
    const availableWidth = graphEndX - graphStartX // Total available width
    const minSpacing = 40 // Minimum spacing between bars
    const numHotels = data.length

    if (numHotels === 0) {
      return []
    }

    if (numHotels === 1) {
      // Center the single bar
      const centerX = (graphStartX + graphEndX) / 2
      return [{ x: centerX - boxWidth / 2, boxCenterX: centerX }]
    }

    // Calculate total width needed for bars and minimum spacing
    const totalBarsWidth = numHotels * boxWidth
    const totalMinSpacing = (numHotels - 1) * minSpacing
    const totalRequiredWidth = totalBarsWidth + totalMinSpacing

    // Calculate actual spacing (distribute extra space evenly)
    let spacing: number
    let startX: number

    if (totalRequiredWidth <= availableWidth) {
      // We have extra space - distribute it evenly between bars and edges
      const extraSpace = availableWidth - totalRequiredWidth
      const paddingPerSide = extraSpace / (numHotels + 1) // Equal padding on each side and between bars
      spacing = minSpacing + paddingPerSide
      startX = graphStartX + paddingPerSide // Start after left padding
    } else {
      // Not enough space - reduce spacing proportionally (shouldn't happen with current dimensions)
      spacing = Math.max(10, (availableWidth - totalBarsWidth) / (numHotels + 1)) // Minimum 10px spacing
      startX = graphStartX + spacing
    }

    // Calculate positions for each bar
    const positions = []
    for (let i = 0; i < numHotels; i++) {
      const x = startX + i * (boxWidth + spacing)
      const boxCenterX = x + boxWidth / 2
      positions.push({ x, boxCenterX })
    }

    return positions
  }

  const barPositions = calculateBarPositions()

  return (
    <div className="relative w-full h-96">
      <svg width="100%" height="100%" viewBox="0 0 1200 400" className="overflow-hidden">
        {/* X-axis */}
        <line x1="80" y1={xAxisY} x2="1150" y2={xAxisY} stroke="#e5e7eb" strokeWidth="1" />

        {/* Y-axis labels */}
        {ticks.map((value) => {
          const y = xAxisY - (value / maxValue) * chartHeight
          // Clamp Y position to ensure it's within valid range
          const clampedY = Math.max(chartTopY, Math.min(xAxisY, y))
          
          // Format with K, M, B abbreviations for values >= 1000
          const formattedValue = formatYAxisValue(value)
          
          return (
            <g key={value}>
              <text 
                x="70" 
                y={clampedY + 5} 
                textAnchor="end" 
                fontSize="14" 
                fill="#6b7280"
              >
                {formattedValue}
              </text>
              {value > 0 && (
                <line
                  x1="80"
                  y1={clampedY}
                  x2="1150"
                  y2={clampedY}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
              )}
            </g>
          )
        })}

        {/* Box plots */}
        {data.map((hotel, index) => {
          // Use dynamically calculated positions
          const position = barPositions[index]
          if (!position) return null

          const x = position.x
          // boxWidth is already calculated above and used in position calculation
          const boxCenterX = position.boxCenterX // Center of the box plot
          const hoverPadding = 5 // Reduced padding for tighter hover area

          // Calculate Y positions using the dynamic maxValue and fixed chart height
          const minY = Math.max(chartTopY, xAxisY - (hotel.min / maxValue) * chartHeight)
          const maxY = Math.max(chartTopY, xAxisY - (hotel.max / maxValue) * chartHeight)
          const q1Y = Math.max(chartTopY, xAxisY - (hotel.q1 / maxValue) * chartHeight)
          const q3Y = Math.max(chartTopY, xAxisY - (hotel.q3 / maxValue) * chartHeight)
          const medianY = Math.max(chartTopY, xAxisY - (hotel.median / maxValue) * chartHeight)
          const avgMinY = Math.max(chartTopY, xAxisY - (hotel.avgRangeMin / maxValue) * chartHeight)
          const avgMaxY = Math.max(chartTopY, xAxisY - (hotel.avgRangeMax / maxValue) * chartHeight)

          const isHovered = hoveredHotel === hotel.name

          return (
            <g key={hotel.name}>
              {/* Min/Max whiskers (orange) */}
              <line x1={x + boxWidth / 2} y1={minY} x2={x + boxWidth / 2} y2={maxY} stroke="#f97316" strokeWidth="2" />
              <line
                x1={x + boxWidth / 4}
                y1={minY}
                x2={x + (3 * boxWidth) / 4}
                y2={minY}
                stroke="#f97316"
                strokeWidth="2"
              />
              <line
                x1={x + boxWidth / 4}
                y1={maxY}
                x2={x + (3 * boxWidth) / 4}
                y2={maxY}
                stroke="#f97316"
                strokeWidth="2"
              />

              {/* Average range box (blue) */}
              <rect
                x={x + 10}
                y={avgMaxY}
                width={boxWidth - 20}
                height={avgMinY - avgMaxY}
                fill="#3b82f6"
                stroke="#2563eb"
                strokeWidth="1"
                className={cn("transition-all duration-200", isHovered && "fill-blue-600")}
              />

              {/* Invisible hover area - reduced padding for tighter bounds */}
              <rect
                x={x - hoverPadding}
                y={Math.min(maxY, minY) - 5}
                width={boxWidth + (hoverPadding * 2)}
                height={Math.abs(minY - maxY) + 10}
                fill="transparent"
                className="cursor-pointer pointer-events-auto"
                onMouseEnter={(e) => {
                  e.stopPropagation()
                  onHotelHover?.(hotel, e, index)
                }}
                onMouseMove={(e) => {
                  e.stopPropagation()
                  onHotelHover?.(hotel, e, index)
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation()
                  onHotelLeave?.()
                }}
                style={{ pointerEvents: 'auto' }}
              />

              {/* Hotel name - wrapped in foreignObject for multi-line text, center-aligned with box plot */}
              {/* Show hotel names based on count:
                  - 10 or fewer: Show all names
                  - 11-20 hotels: Show every other name (even indices)
                  - More than 20 hotels: Show every 3rd name (indices 0, 3, 6, 9, etc.)
              */}
              {(() => {
                const totalHotels = data.length
                if (totalHotels <= 10) {
                  // Show all names
                  return true
                } else if (totalHotels <= 20) {
                  // Show every other name (even indices: 0, 2, 4, 6, etc.)
                  return index % 2 === 0
                } else {
                  // Show every 3rd name (indices: 0, 3, 6, 9, 12, etc.)
                  return index % 3 === 0
                }
              })() && (
                <foreignObject x={boxCenterX - 40} y={360} width="80" height="60">
                  <div 
                    className="text-center text-[15px] text-gray-500 dark:text-gray-400 leading-tight"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      wordBreak: 'break-word',
                      lineHeight: '1.3',
                      maxHeight: '5.4em'
                    }}
                  >
                    {hotel.shortName}
                  </div>
                </foreignObject>
              )}
            </g>
          )
        })}

        {/* Rate label - vertically centered with Y-axis values */}
        <text x="25" y="200" textAnchor="middle" fontSize="16" fill="#6b7280" transform="rotate(-90 25 200)" dominantBaseline="middle">
          Rate
        </text>
      </svg>
    </div>
  )
}

