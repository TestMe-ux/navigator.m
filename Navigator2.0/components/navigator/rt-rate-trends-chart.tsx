"use client"

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, Filter, Download, ChevronDown, Eye, EyeOff, ArrowUp, ArrowDown, Minus, BarChart3, Star, Maximize2, Calendar, Wifi, Coffee, Utensils, Car, Zap } from "lucide-react"
import { useDateContext } from "@/components/date-context"
import { format, eachDayOfInterval, differenceInDays, isSameDay, parseISO, subDays } from "date-fns"
import { Tooltip as RechartsTooltip } from "recharts"
import { toPng } from "html-to-image";
import { escapeCSVValue } from "@/lib/utils"
import { RateDetailModal } from "./rate-detail-modal"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { useComparison } from "../comparison-context"

/**
 * Custom Tooltip Component for RT Rate Trends (independent from Overview)
 */
const RTRateTrendsTooltip = ({ active, payload, label, coordinate }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload

    // Check if any rate has more than 4 digits
    const hasLargeRates = payload.some((entry: any) => {
      const rate = entry.value
      return rate && rate.toString().length > 4
    })

    // Dynamic positioning based on cursor location
    const chartWidth = 800 // Approximate chart area width
    const tooltipWidth = 320 // Increased tooltip width for Rate and Variance columns
    const isNearRightEdge = coordinate && coordinate.x > (chartWidth * 0.6) // 60% from left

    const tooltipStyle = isNearRightEdge ? {
      transform: 'translateX(-100%)',
      marginLeft: '-10px'
    } : {
      transform: 'translateX(0%)',
      marginLeft: '10px'
    }

    // Dynamic width classes based on rate size
    const widthClasses = hasLargeRates
      ? "min-w-[410px] max-w-[466px]" // Additional 20% increase reduced by 5% (432px * 0.95 = 410px, 490px * 0.95 = 466px)
      : "min-w-[342px] max-w-[388px]"  // Standard 20% increase reduced by 5% (360px * 0.95 = 342px, 408px * 0.95 = 388px)

    return (
      <div
        className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-3 ${widthClasses} z-[10001] relative`}
        style={tooltipStyle}
      >
        {/* Date Heading */}
        <div className="mb-0.5">
          <h3 className="text-gray-900 dark:text-white">
            <span className="text-base font-bold">{data?.date ? format(new Date(data.date), "dd MMM yyyy") : ''}</span>
            <span className="text-sm font-normal">{data?.date ? `, ${format(new Date(data.date), 'EEE')}` : ''}</span>
          </h3>
        </div>

        {/* Event Information */}
        {data?.hasEvent && (
          <div className="flex items-center gap-2 p-2 mb-0.5">
            <Star className="w-3 h-3 text-amber-500 fill-current" />
            <span className="text-xs text-black dark:text-white font-medium">
              {(() => {
                // Generate event name based on date
                const date = new Date(data.date)
                const dayOfMonth = date.getDate()
                const dayOfWeek = date.getDay()

                let eventName = ""
                if (dayOfMonth === 5) eventName = "Music Festival"
                else if (dayOfMonth === 15) eventName = "Business Conference"
                else if (dayOfMonth === 25) eventName = "Sports Event"
                else if (dayOfWeek === 0 && dayOfMonth % 7 === 0) eventName = "Weekend Special"
                else if (dayOfMonth % 3 === 0) eventName = "Regular Event"
                else eventName = "Special Event"

                // Limit to 32 characters and add ellipsis
                const truncatedName = eventName.length > 32 ? eventName.substring(0, 32) + "..." : eventName
                return `${truncatedName} (+2 more)`
              })()}
            </span>
          </div>
        )}


        {/* Column Headings */}
        <div className="grid grid-cols-[1fr_120px_60px_50px] gap-0 px-2">
          <div className="px-2 pt-1 pb-0 text-left">
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Property</span>
          </div>
          <div className="px-2 pt-1 pb-0 text-right">
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400" style={{ paddingRight: '20px' }}>Rate</span>
          </div>
          <div className="px-2 pt-1 pb-0 text-right">
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Variance</span>
          </div>
          <div className="px-2 pt-1 pb-0 text-right">
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Rank</span>
          </div>
        </div>

        {/* Hotel Rates */}
        <div className="space-y-0 mt-1">
          {(() => {
            // Find My Hotel rate for variance calculations
            const myHotelEntry = payload.find((entry: any) => entry.dataKey === 'direct')
            const myHotelRate = myHotelEntry ? myHotelEntry.value : 0

            const actualAvgCompsetEntry = payload.find((entry: any) => entry.name.includes('Compset') || entry.dataKey === 'avgCompset')
            const actualAvgCompsetRate = actualAvgCompsetEntry?.value || 0
            const allRates = payload.map((entry: any) => entry.value).filter((rate: any) => rate > 0)
            const competitorRatesForRanking = (() => {
              const cloneallRates = [...allRates];
              const idx = cloneallRates.findIndex(r => r === actualAvgCompsetRate);
              if (idx !== -1) cloneallRates.splice(idx, 1);
              return cloneallRates;
            })();
            const sortedRates = competitorRatesForRanking.sort((a, b) => a - b)
            // Sort payload by rate to calculate ranking
            // const sortedRates = payload.map((entry: any) => entry.value).sort((a: number, b: number) => a - b)

            return payload.map((entry: any, index: number) => {
              debugger
              const rate = entry.value
              const isMyHotel = entry.dataKey === 'direct'
              const isAvgCompset = entry.dataKey === 'avgCompset'

              // Get status data for current and comparison periods
              const competitorKey = entry.dataKey;
              const statusKey = `${competitorKey}_Status`;
              const statusData = data[statusKey];
              const comparestatusData = data[`compare${statusKey}`];
              const directStatus = isMyHotel ? data.directStatus : "";
              const compareStatus = isMyHotel ? data.compareStatus : "";
              const avgCompStatus = isAvgCompset ? data.avgCompsetStatus : "";
              const compareavgCompsetStatus = isAvgCompset ? data.compareavgCompsetStatus : "";
              const compareRate = isMyHotel ? data.compareRate : data[`compare${competitorKey}`];

              // Calculate variance using comparison data if available
              let variance = 0
              let varianceFormatted = '-'

              if (isMyHotel && compareRate > 0) {
                variance = rate - compareRate
              } else if (isAvgCompset && data.compareavgCompset > 0) {
                variance = rate - data.compareavgCompset
              } else if (!isMyHotel && !isAvgCompset && compareRate > 0) {
                variance = rate - compareRate
              }

              // Normalize status
              const normalizedStatus = (statusData || directStatus || avgCompStatus || "").toString().toUpperCase();

              // Get property name
              let propertyName = entry.name || 'Unknown Property'
              if (entry.dataKey === 'direct') {
                propertyName = 'My Hotel'
              } else if (entry.dataKey === 'avgCompset') {
                propertyName = 'Avg. Compset'
              }

              // Truncate long hotel names for tooltip display
              const truncatedName = propertyName.length > 18 ? `${propertyName.substring(0, 15)}...` : propertyName

              // Calculate ranking (1 = cheapest, higher number = more expensive)
              const rank = sortedRates.indexOf(rate) + 1

              // Generate inclusion icon based on index (for demo purposes)
              const getInclusionIcon = (idx: number) => {
                const iconIndex = (idx * 3 + 7) % 5 // Generate pseudo-random pattern
                if (iconIndex === 0) return <Wifi className="w-3 h-3 text-gray-600" />
                if (iconIndex === 1) return <Coffee className="w-3 h-3 text-gray-600" />
                if (iconIndex === 2) return <Utensils className="w-3 h-3 text-gray-600" />
                if (iconIndex === 3) return <Car className="w-3 h-3 text-gray-600" />
                return null // Empty for some rows
              }

              return (
                <div key={index} className={`grid grid-cols-[1fr_120px_60px_50px] gap-0 items-center py-0.5 pl-2 pr-2 rounded-md ${isMyHotel ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700' : ''
                  }`}>
                  {/* Property Column */}
                  <div className="flex items-center min-w-0 px-2 py-1 text-left">
                    <div className={`text-xs font-medium whitespace-nowrap ${isMyHotel ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-slate-100'
                      }`}>
                      {truncatedName}
                    </div>
                  </div>

                  {/* Rate Column with Icon */}
                  <div className={`flex items-center justify-end px-2 py-1 ${isMyHotel ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-slate-100'
                    }`}>
                    {/* Show bolt icon on 25th date only for specific competitors */}
                    {(() => {
                      const date = new Date(data.date)
                      const dayOfMonth = date.getDate()
                      // Show bolt icon only for specific competitors (index 0, 2, 4) on 25th date
                      const shouldShowBolt = dayOfMonth === 25 && (index === 0 || index === 2 || index === 4)
                      return shouldShowBolt ? (
                        <Zap className="w-3 h-3 text-blue-500 fill-current mr-2" />
                      ) : null
                    })()}
                    <span className="text-sm font-bold">
                      {normalizedStatus
                        ? (() => {
                          const normalized = normalizedStatus.toUpperCase();

                          if ((normalized === "O" && rate > 0) || avgCompStatus > 0) {
                            return `$${rate?.toLocaleString()}`;
                          }

                          if (normalized === "C") {
                            return "Sold Out";
                          }

                          if (["NP", "ND", "RF", "TNA"].includes(normalized)) {
                            return "-";
                          }

                          return "-";
                        })()
                        : `$${rate?.toLocaleString()}`}
                    </span>
                    <div className="ml-1" style={{ paddingLeft: '4px' }}>
                      {getInclusionIcon(index) || (
                        <div className="w-3 h-3 opacity-0">
                          {/* Transparent placeholder to maintain spacing */}
                          <div className="w-full h-full"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Variance Column */}
                  <div className={`text-sm text-right px-2 py-1 ${variance === 0 ? 'text-gray-500 dark:text-slate-400' :
                    variance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                    {normalizedStatus
                      ? (() => {
                        const normalized = normalizedStatus.toUpperCase();

                        if ((normalized === "O" && rate > 0 && (comparestatusData === "O" || compareavgCompsetStatus === "O" || compareStatus === "O")) || avgCompStatus > 0) {
                          return `${variance > 0 ? "+" : ""}${Math.round(variance)}`;
                        }

                        if (normalized === "C" || comparestatusData === "C" || compareavgCompsetStatus === "C" || compareStatus === "C") {
                          return " ";
                        }

                        if (["NP", "ND", "RF", "TNA"].includes(normalized) || ["NP", "ND", "RF", "TNA"].includes(comparestatusData) || ["NP", "ND", "RF", "TNA"].includes(compareavgCompsetStatus) || ["NP", "ND", "RF", "TNA"].includes(compareStatus)) {
                          return "-";
                        }

                        return "-";
                      })()
                      : `${variance > 0 ? '+' : ''}${variance.toFixed(2)}%`}
                  </div>

                  {/* Rank Column */}
                  <div className="text-right text-sm font-medium text-gray-700 dark:text-gray-300 px-2 py-1">
                    {rank > 0 ? rank : ''}
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

/**
 * Chart Data Configuration
 * Professional rate trends data with multiple channels and time periods
 */
interface RateData {
  date: string
  timestamp: number
  direct: number
  avgCompset: number
  hasRefresh?: boolean // For refresh icon display
  [key: string]: any // For dynamic competitor properties
}

/**
 * Interface for the actual rate data structure
 */
interface PricePositioningEntity {
  propertName: string
  propertyID: number
  subscriberPropertyRate: Array<{
    rate: string
    checkInDateTime: string
    event: {
      eventDate: string
      eventDetails: any[]
      displayDate: string | null
    }
    [key: string]: any
  }>
  propertyType: number // 0 = direct, 1 = competitor, 2 = avgCompset
}

interface RateDataResponse {
  message: string | null
  status: boolean
  body?: {
    pricePositioningEntites: PricePositioningEntity[]
    eventEntity: Array<{
      eventDate: string
      eventDetails: any[]
      displayDate: string | null
    }>
    losList: number[]
    guestList: number[]
  }
  // Direct properties (when data is not nested in body)
  pricePositioningEntites?: PricePositioningEntity[]
  eventEntity?: Array<{
    eventDate: string
    eventDetails: any[]
    displayDate: string | null
  }>
  losList?: number[]
  guestList?: number[]
}

/**
 * Transform actual rate data to chart format
 */
const transformRateData = (rateData: RateDataResponse, rateCompData: RateDataResponse, selectedComparison: number): RateData[] => {
  // Check if rateData is empty or invalid
  if (!rateData || (typeof rateData === 'object' && Object.keys(rateData).length === 0)) {
    return []
  }

  // Handle both nested (body.pricePositioningEntites) and direct (pricePositioningEntites) data structures
  const entities = rateData?.body?.pricePositioningEntites || rateData?.pricePositioningEntites
  const compEntities = rateCompData?.body?.pricePositioningEntites || rateCompData?.pricePositioningEntites

  if (!entities) {
    return []
  }

  const transformedData: RateData[] = []

  // Group data by check-in date
  const dateMap = new Map<string, any>()

  entities.forEach((entity, entityIndex) => {
    entity.subscriberPropertyRate.forEach((rateEntry, rateIndex) => {
      const checkInDate = rateEntry.checkInDateTime.split('T')[0] // Extract date part

      // Find corresponding comparison data
      const compData = compEntities
        ?.filter(ce => ce.propertyID === entity.propertyID)[0]
        ?.subscriberPropertyRate
        .find(re =>
          isSameDay(
            parseISO(re.checkInDateTime),
            subDays(parseISO(rateEntry.checkInDateTime), selectedComparison)
          )
        );

      if (!dateMap.has(checkInDate)) {
        dateMap.set(checkInDate, {
          date: checkInDate,
          timestamp: new Date(checkInDate).getTime(),
          direct: 0,
          avgCompset: 0,
          events: rateEntry.event?.eventDetails?.length > 0 ? rateEntry.event.eventDetails : undefined
        })
      }

      const dateData = dateMap.get(checkInDate)
      const rate = parseFloat(rateEntry.rate) || 0

      // Map property types to chart data
      if (entity.propertyType === 0) {
        // Direct/Subscriber property
        dateData.directStatus = rateEntry.status === null ? rateEntry.rate : rateEntry.status
        dateData.direct = rate
        dateData.compareRate = compData?.rate ? parseFloat(compData.rate) : 0
        dateData.compareStatus = compData?.status === null ? compData.rate : compData?.status
      } else if (entity.propertyType === 2) {
        // Avg Compset
        dateData.avgCompsetStatus = rateEntry.status === null ? rateEntry.rate : rateEntry.status
        dateData.avgCompset = rate
        dateData.compareavgCompset = compData?.rate ? parseFloat(compData.rate) : 0
        dateData.compareavgCompsetStatus = compData?.status === null ? compData.rate : compData?.status
      } else if (entity.propertyType === 1) {
        // Competitor property - create dynamic property key
        const competitorKey = `competitor_${entity.propertyID}`
        dateData[`${competitorKey}_Status`] = rateEntry.status === null ? rateEntry.rate : rateEntry.status
        dateData[competitorKey] = rate
        dateData[`${competitorKey}_name`] = entity.propertName
        dateData[`compare${competitorKey}`] = compData?.rate ? parseFloat(compData.rate) : 0
        dateData[`compare${competitorKey}_Status`] = compData?.status === null ? compData.rate : compData?.status
      }
    })
  })

  // Convert map to array and sort by date
  transformedData.push(...Array.from(dateMap.values()))
  transformedData.sort((a, b) => a.timestamp - b.timestamp)

  return transformedData
}

/**
 * Channel Configuration
 * Defines display properties for each rate channel
 */
interface ChannelConfig {
  key: string
  name: string
  color: string
  strokeWidth: number
  type: 'ota' | 'direct' | 'competitor'
  description: string
  isVisible: boolean
}

/**
 * Generate channel configs based on actual data
 */
const generateChannelConfigs = (rateData: RateDataResponse, rateCompData: RateDataResponse): ChannelConfig[] => {
  const configs: ChannelConfig[] = []

  // Check if rateData is empty or invalid
  if (!rateData || (typeof rateData === 'object' && Object.keys(rateData).length === 0)) {
    return configs
  }

  // Handle both nested (body.pricePositioningEntites) and direct (pricePositioningEntites) data structures
  const entities = rateData?.body?.pricePositioningEntites || rateData?.pricePositioningEntites

  if (!entities) {
    return configs
  }

  // Add direct property (propertyType = 0)
  const directEntity = entities.find(e => e.propertyType === 0)
  if (directEntity) {
    configs.push({
      key: 'direct',
      name: directEntity.propertName || 'My Hotel',
      color: '#2563eb',
      strokeWidth: 4,
      type: 'direct',
      description: 'My hotel rates',
      isVisible: true,
    })
  }

  // Add avg compset (propertyType = 2)
  const avgCompsetEntity = entities.find(e => e.propertyType === 2)
  if (avgCompsetEntity) {
    configs.push({
      key: 'avgCompset',
      name: avgCompsetEntity.propertName || 'Avg. Compset',
      color: '#0891b2',
      strokeWidth: 2,
      type: 'competitor',
      description: 'Average competitive set rates',
      isVisible: true,
    })
  }

  // Add competitor properties (propertyType = 1)
  const competitorEntities = entities.filter(e => e.propertyType === 1)

  const competitorColors = [
    '#10b981', '#f97316', '#8b5cf6', '#ef4444', '#f59e0b',
    '#06b6d4', '#84cc16', '#ec4899', '#6366f1', '#8b5cf6',
    '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b'
  ]

  competitorEntities.forEach((entity, index) => {
    configs.push({
      key: `competitor_${entity.propertyID}`,
      name: entity.propertName,
      color: competitorColors[index % competitorColors.length],
      strokeWidth: 2,
      type: 'competitor',
      description: `Competitor property`,
      isVisible: index < 3, // Show first 3 competitors by default
    })
  })

  return configs
}

/**
 * Custom Tooltip Component
 * Enhanced tooltip with comprehensive data display
 */
interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

/**
 * Custom X-Axis Tick with Event Icons
 */
interface CustomXAxisTickProps {
  x?: number
  y?: number
  payload?: {
    value: string
  }
  data?: RateData[]
}

function CustomXAxisTick({ x, y, payload, data }: CustomXAxisTickProps) {
  if (!payload || !x || !y) return null

  const dateData = data?.find(d => d.date === payload.value)
  const hasEvents = dateData?.hasEvent || false
  const hasRefresh = dateData?.hasRefresh || false

  return (
    <g transform={`translate(${x},${y})`}>
      {/* Date text */}
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill="currentColor"
        className="text-gray-600 dark:text-slate-400"
        fontSize={11}
      >
        {format(new Date(payload.value), 'MMM dd')}
      </text>

      {/* Star icon - positioned below the date */}
      {hasEvents && (
        <g transform="translate(0, 30)">
          <circle cx="0" cy="0" r="8" fill="transparent" />
          <foreignObject x="-6" y="-6" width="12" height="12">
            <div className="flex items-center justify-center">
              <Star className="w-3 h-3 text-amber-500 fill-current" />
            </div>
          </foreignObject>
          <title>{(() => {
            // Generate event name based on date
            const date = new Date(payload.value)
            const dayOfMonth = date.getDate()
            const dayOfWeek = date.getDay()

            if (dayOfMonth === 5) return "Music Festival    +2"
            if (dayOfMonth === 15) return "Business Conference    +2"
            if (dayOfMonth === 25) return "Sports Event    +2"
            if (dayOfWeek === 0 && dayOfMonth % 7 === 0) return "Weekend Special    +2"
            if (dayOfMonth % 3 === 0) return "Regular Event    +2"

            return "Special Event    +2"
          })()}</title>
        </g>
      )}
    </g>
  )
}

/**
 * Enhanced Custom Tooltip with price positioning analysis
 */
function CustomTooltip({ active, payload, label, coordinate, currencySymbol = '$' }: CustomTooltipProps & { coordinate?: { x: number, y: number }, currencySymbol?: string }) {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload

    // Find Avg. Compset rate for variance calculations
    const avgCompsetEntry = payload.find(entry => entry.name === 'Avg. Compset')
    const avgCompsetRate = avgCompsetEntry?.value || 0

    // Dynamic positioning based on coordinate
    const isNearRightEdge = coordinate && coordinate.x > 400 // Rough chart midpoint
    const tooltipStyle = isNearRightEdge ? {
      transform: 'translateX(-100%)',
      marginLeft: '-20px'
    } : {}

    // Calculate price positioning
    const myHotelRate = data?.direct || 0
    const allRates = payload.map(entry => entry.value).filter(rate => rate > 0)
    const competitorRates = allRates.filter(rate => rate !== myHotelRate)

    // Price positioning analysis
    const avgCompetitorRate = competitorRates.length > 0 ?
      competitorRates.reduce((sum, rate) => sum + rate, 0) / competitorRates.length : 0
    const priceDifference = myHotelRate - avgCompetitorRate
    const priceDifferencePercent = avgCompetitorRate > 0 ?
      ((priceDifference / avgCompetitorRate) * 100) : 0

    // Market position (sorted by price - cheapest to most expensive)
    // Exclude Avg Compset from ranking calculation
    // Find the actual Avg Compset rate from the payload
    const actualAvgCompsetEntry = payload.find(entry => entry.name.includes('Compset') || entry.dataKey === 'avgCompset')
    const actualAvgCompsetRate = actualAvgCompsetEntry?.value || 0

    const competitorRatesForRanking = allRates.filter(rate => rate !== actualAvgCompsetRate)
    const sortedRates = competitorRatesForRanking.sort((a, b) => a - b)
    const myPosition = sortedRates.indexOf(myHotelRate) + 1
    const totalHotels = sortedRates.length



    // Get position text for each hotel (excluding Avg Compset)
    const getPositionText = (rate: number, hotelName: string) => {
      // Don't calculate position for Avg Compset
      if (rate === actualAvgCompsetRate) return ''

      const position = sortedRates.indexOf(rate) + 1


      if (position === 1) return 'Lowest'
      if (position === totalHotels) return 'Highest'
      if (position === 2) return '#2'
      if (position === 3) return '#3'
      return `#${position}`
    }

    return (
      <div
        className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-3 min-w-[260px] max-w-[350px] z-[10001] relative"
        style={tooltipStyle}
      >
        {/* Date Heading */}
        <div className="mb-3">
          <h3 className="text-gray-900 dark:text-white">
            <span className="text-base font-bold">{label ? format(new Date(label), 'dd MMM yyyy') : ''}</span>
            <span className="text-sm font-normal">{label ? `, ${format(new Date(label), 'EEE')}` : ''}</span>
          </h3>
          {/* Blue divider below tooltip heading */}
          <div className="w-full h-[30px] bg-blue-500 mt-2 mb-2"></div>
          {/* Event Information under date heading */}
          {data?.hasEvent && (
            <>
              <p className="text-sm font-medium text-foreground mt-2 mb-1">Events</p>
              <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/30 rounded-md border border-amber-200 dark:border-amber-700/50">
                <Star className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-current" />
                <span className="text-sm text-amber-700 dark:text-amber-200 font-medium">
                  {(() => {
                    // Generate event name based on date
                    const date = new Date(data.date)
                    const dayOfMonth = date.getDate()
                    const dayOfWeek = date.getDay()

                    if (dayOfMonth === 5) return "Music Festival&nbsp;&nbsp;&nbsp;&nbsp;+2"
                    if (dayOfMonth === 15) return "Business Conference&nbsp;&nbsp;&nbsp;&nbsp;+2"
                    if (dayOfMonth === 25) return "Sports Event&nbsp;&nbsp;&nbsp;&nbsp;+2"
                    if (dayOfWeek === 0 && dayOfMonth % 7 === 0) return "Weekend Special&nbsp;&nbsp;&nbsp;&nbsp;+2"
                    if (dayOfMonth % 3 === 0) return "Regular Event&nbsp;&nbsp;&nbsp;&nbsp;+2"

                    return "Special Event&nbsp;&nbsp;&nbsp;&nbsp;+2"
                  })()}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Compact Rate Details */}
        <div className="space-y-0">
          {(() => {
            // Custom sorting logic based on property types and ranking
            const sortedPayload = [...payload].sort((a, b) => {
              const aValue = a.value || 0
              const bValue = b.value || 0

              // Get property type from the data key
              const getPropertyType = (entry: any) => {
                if (entry.name === 'My Hotel' || entry.dataKey === 'direct') return 0
                if (entry.name === 'Avg. Compset' || entry.dataKey === 'avgCompset') return 2
                if (entry.dataKey?.startsWith('competitor_')) return 1
                return 1 // Default to competitor
              }

              const aType = getPropertyType(a)
              const bType = getPropertyType(b)

              // Sort by property type first, then by rate
              if (aType !== bType) {
                // Order: Direct first, then Avg Compset, then competitors by rate
                if (aType === 0) return -1  // Direct first
                if (bType === 0) return 1
                if (aType === 2) return -1  // Avg Compset second
                if (bType === 2) return 1
                // Competitors come last, sorted by rate
                return aValue - bValue
              }

              // Within same type, sort by rate (lowest to highest)
              return aValue - bValue
            })

            return sortedPayload.map((entry, index) => {
              // Check if this is the direct property (propertyType=0) or Avg Compset (propertyType=2)
              const isDirectProperty = entry.dataKey === 'direct' || entry.name.includes('Hotel') && !entry.name.includes('Compset')
              const isAvgCompset = entry.name.includes('Compset') || entry.dataKey === 'avgCompset'
              const isCheapest = index === 0

              // Calculate variance against Avg. Compset for all entries except Avg. Compset itself
              const priceDiff = !isAvgCompset && avgCompsetRate > 0 ?
                ((entry.value - avgCompsetRate) / avgCompsetRate * 100) : 0

              const isCompetitiveThreat = !isDirectProperty && !isAvgCompset && entry.value < myHotelRate
              // Exclude Avg Compset from ranking - only show position for competitors
              const positionText = !isAvgCompset ? getPositionText(entry.value, entry.name) : ''

              return (
                <div key={entry.name} className={`flex items-center justify-between gap-2 p-2 rounded transition-all ${index < 2
                  ? isDirectProperty
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : isAvgCompset
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`text-xs truncate ${index < 2
                      ? isDirectProperty
                        ? 'font-semibold text-blue-700 dark:text-blue-300'
                        : isAvgCompset
                          ? 'font-semibold text-red-700 dark:text-red-300'
                          : 'text-gray-700 dark:text-gray-300'
                      : 'text-gray-700 dark:text-gray-300'
                      }`}>
                      {entry.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-right flex-shrink-0">
                    <div className={`text-sm font-bold min-w-[60px] text-right ${index < 2
                      ? isDirectProperty
                        ? 'text-blue-900 dark:text-blue-200'
                        : isAvgCompset
                          ? 'text-red-900 dark:text-red-200'
                          : isCheapest
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : 'text-gray-900 dark:text-slate-100'
                      : isCheapest
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-gray-900 dark:text-slate-100'
                      }`}>
                      {`\u200E${currencySymbol}\u200E ${entry.value?.toLocaleString()}`}
                    </div>

                    {/* Ranking column - only for competitors, not for Avg Compset */}
                    <div className={`text-xs font-medium min-w-[50px] ${!isAvgCompset && positionText === 'Lowest'
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : !isAvgCompset && positionText === 'Highest'
                        ? 'text-red-600 dark:text-red-400 font-bold'
                        : !isAvgCompset && positionText
                          ? 'text-gray-600 dark:text-gray-400'
                          : ''
                      }`}>
                      {!isAvgCompset && positionText}
                    </div>
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

/**
 * RT Rate Trends Chart Component (Independent from Overview)
 * 
 * Advanced chart component with:
 * - Multiple visualization types (Line, Area, Bar)
 * - Interactive channel visibility controls
 * - Real-time data filtering
 * - Professional styling with brand colors
 * - Comprehensive tooltips and legends
 * - Event markers and annotations
 * - Performance optimization
 * 
 * @component
 * @version 2.0.0
 */
export function RTRateTrendsChart({ rateData, rateCompData }: any) {
  const { startDate, endDate, isLoading } = useDateContext()
  const [selectedProperty] = useSelectedProperty();
  const { selectedComparison } = useComparison()



  // Generate channel configs based on actual data
  const channelConfigs = useMemo(() => {
    return generateChannelConfigs(rateData, rateCompData)
  }, [rateData, rateCompData])

  // State management
  const [errorMessage, setErrorMessage] = useState<string>('')
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Helper function to set error message with proper timeout management
  const setErrorWithTimeout = useCallback((message: string, duration: number = 10000) => {
    // Clear any existing timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current)
    }

    // Set the error message
    setErrorMessage(message)

    // Set new timeout
    errorTimeoutRef.current = setTimeout(() => {
      setErrorMessage('')
      errorTimeoutRef.current = null
    }, duration)
  }, [])

  // Helper function to clear error message immediately
  const clearError = useCallback(() => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current)
      errorTimeoutRef.current = null
    }
    setErrorMessage('')
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current)
      }
    }
  }, [])

  // Debug error message changes
  React.useEffect(() => {
    if (errorMessage) {
      console.log('📢 Error message set:', errorMessage)
    } else {
      console.log('✅ Error message cleared')
    }
  }, [errorMessage])
  const [legendVisibility, setLegendVisibility] = useState<Record<string, boolean>>({})
  const [channelVisibility, setChannelVisibility] = useState<Record<string, boolean>>({})
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  // Tab state
  const [activeTab, setActiveTab] = useState<string>('chart')

  // Modal state for rate detail popup
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null)

  // Modal handler functions
  const openModal = useCallback((date: Date) => {
    setSelectedDateForModal(date)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedDateForModal(null)
  }, [])

  const navigateDay = useCallback((direction: 'prev' | 'next') => {
    if (!selectedDateForModal) return

    const newDate = new Date(selectedDateForModal)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setSelectedDateForModal(newDate)
  }, [selectedDateForModal])



  // Generate data - use only real data from rateData and rateCompData
  const data = useMemo(() => {
    // Transform actual rate data to chart format
    const transformedData = transformRateData(rateData, rateCompData, selectedComparison)
    return transformedData
  }, [rateData, rateCompData])

  // Initialize visibility states when channel configs change
  useEffect(() => {
    if (channelConfigs.length > 0 && !isInitialized) {
      const initialLegendVisibility: Record<string, boolean> = {}
      const initialChannelVisibility: Record<string, boolean> = {}

      channelConfigs.forEach(config => {
        initialChannelVisibility[config.key] = config.isVisible
        // Show legend for channels that are initially selected
        initialLegendVisibility[config.key] = config.isVisible
      })

      // Force avgCompset to always be visible by default
      if (channelConfigs.find(config => config.key === 'avgCompset')) {
        initialChannelVisibility['avgCompset'] = true
        initialLegendVisibility['avgCompset'] = true
      }

      // Ensure that all selected channels also have their legends visible
      // This prevents the "disabled" appearance for selected channels
      Object.keys(initialChannelVisibility).forEach(key => {
        if (initialChannelVisibility[key]) {
          initialLegendVisibility[key] = true
        }
      })

      setLegendVisibility(initialLegendVisibility)
      setChannelVisibility(initialChannelVisibility)
      setIsInitialized(true)
    }
  }, [channelConfigs, isInitialized])

  // Auto-clear error messages when visible legend count drops below 10
  useEffect(() => {
    // Only count channels that are both selected in dropdown AND visible in legend
    const currentVisibleCount = Object.keys(legendVisibility).filter(key =>
      legendVisibility[key] && channelVisibility[key]
    ).length

    // Clear error message if we're now under the limit
    if (currentVisibleCount < 10 && errorMessage) {
      setErrorMessage('')
    }
  }, [legendVisibility, channelVisibility, errorMessage])

  // Filter visible channels with proper memoization
  const visibleChannels = useMemo(() =>
    channelConfigs.filter(config => channelVisibility[config.key]),
    [channelConfigs, channelVisibility]
  )

  // Filter competitor channels only for the dropdown (exclude My Hotel)
  const competitorChannels = useMemo(() =>
    channelConfigs.filter(config => config.type === 'competitor'),
    [channelConfigs]
  )

  const visibleCompetitors = useMemo(() =>
    competitorChannels.filter(config => channelVisibility[config.key]),
    [competitorChannels, channelVisibility]
  )

  // Always include My Hotel line + avgCompset + visible competitors for chart rendering
  const myHotelChannel = useMemo(() =>
    channelConfigs.find(config => config.type === 'direct'),
    [channelConfigs]
  )

  const avgCompsetChannel = useMemo(() =>
    channelConfigs.find(config => config.key === 'avgCompset'),
    [channelConfigs]
  )

  const allSelectedChannels = useMemo(() => {
    const channels = []
    if (myHotelChannel) channels.push(myHotelChannel)
    if (avgCompsetChannel) channels.push(avgCompsetChannel)
    channels.push(...visibleCompetitors)
    return channels
  }, [myHotelChannel, avgCompsetChannel, visibleCompetitors])

  // Only first 8 competitors will be active on chart (plus My Hotel and Avg Compset = 10 total)
  const activeChannels = useMemo(() => {
    const channels = []
    if (myHotelChannel) channels.push(myHotelChannel)
    if (avgCompsetChannel) channels.push(avgCompsetChannel)
    channels.push(...visibleCompetitors.slice(0, 8)) // Only first 8 competitors
    return channels
  }, [myHotelChannel, avgCompsetChannel, visibleCompetitors])

  // Get channels that are selected but beyond the 8-competitor limit (for disabled legends)
  const disabledChannels = useMemo(() =>
    visibleCompetitors.slice(8), // Competitors 9+ are disabled
    [visibleCompetitors]
  )

  // Note: Error messages are managed by timeout only. Auto-clearing removed to prevent immediate dismissal.

  // Toggle channel visibility - no limit, dropdown selection should always work
  const toggleChannelVisibility = useCallback((channelKey: string) => {
    // Update channel visibility first
    setChannelVisibility(prev => {
      const wasVisible = prev[channelKey]
      const newVisibility = {
        ...prev,
        [channelKey]: !wasVisible
      }

      // Update legend visibility to match channel visibility
      setLegendVisibility(prevLegend => ({
        ...prevLegend,
        [channelKey]: !wasVisible
      }))

      return newVisibility
    })
  }, [])

  // Toggle all competitors - Select All functionality
  const toggleAllCompetitors = useCallback(() => {
    const newVisibility = { ...channelVisibility }
    const newLegendVisibility = { ...legendVisibility }

    // Check if all competitors are currently selected
    const allSelected = competitorChannels.every(config => channelVisibility[config.key])

    competitorChannels.forEach(config => {
      const newValue = !allSelected
      newVisibility[config.key] = newValue
      // For legend visibility, respect the 10-channel limit
      // Only show legend for first 10 selected channels (including My Hotel)
      const myHotelKey = myHotelChannel?.key
      const selectedCompetitors = competitorChannels.filter(c => newVisibility[c.key])
      const totalSelected = (myHotelKey && newVisibility[myHotelKey] ? 1 : 0) + selectedCompetitors.length

      if (totalSelected <= 10) {
        newLegendVisibility[config.key] = newValue
      } else {
        // If we're over the limit, only show legend for first channels
        const competitorIndex = selectedCompetitors.findIndex(c => c.key === config.key)
        newLegendVisibility[config.key] = competitorIndex < (10 - (myHotelKey && newVisibility[myHotelKey] ? 1 : 0)) ? newValue : false
      }
    })

    setChannelVisibility(newVisibility)
    setLegendVisibility(newLegendVisibility)

    // Check if we're selecting all and would exceed the 10-competitor limit
    if (!allSelected && competitorChannels.length > 10) {
      setErrorMessage('Maximum 10 properties can be displayed on the graph. Please hide a property first to show a new one.')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }, [channelVisibility, legendVisibility, competitorChannels, myHotelChannel])

  // Toggle legend visibility (for hiding/showing lines in chart) - ONLY for legend clicks
  const toggleLegendVisibility = useCallback((dataKey: string) => {
    // Use functional state update to avoid stale closure issues
    setLegendVisibility(prev => {
      // Calculate current state using fresh state from setter
      const isCurrentlyVisible = prev[dataKey]

      // If trying to enable a hidden legend, check the 10-visible limit
      if (!isCurrentlyVisible) {
        // Count currently visible legends using fresh state
        // Only count channels that are both selected in dropdown AND visible in legend
        const currentVisibleCount = Object.keys(prev).filter(key =>
          prev[key] && channelVisibility[key]
        ).length

        // Block if already at 10 visible legends
        if (currentVisibleCount >= 10) {
          setErrorMessage('Maximum 10 properties can be displayed on the graph. Please hide a property first to show a new one.')
          setTimeout(() => setErrorMessage(''), 5000)
          return prev // Return unchanged state
        }
      }

      // Allow the toggle - update state
      const newState = {
        ...prev,
        [dataKey]: !prev[dataKey]
      }

      // Count new visible legends for error clearing
      const newVisibleCount = Object.keys(newState).filter(key =>
        newState[key] && channelVisibility[key]
      ).length

      // If we're now under 10 visible legends, clear any error immediately
      if (newVisibleCount < 10) {
        setErrorMessage('')
      }

      return newState
    })
  }, [channelVisibility])

  // Check if we have data
  const hasData = data.length > 0 && channelConfigs.length > 0

  // Show loading state when date range is changing
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-card to-card/50 shadow-xl border border-border/50 rounded-lg p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading chart data...</p>
        </div>
      </div>
    )
  }

  const cardRef = useRef<HTMLDivElement>(null);
  const handleDownloadImageRate = () => {
    console.log("upgrading the a Sum Insured", data);
    if (cardRef.current) {
      toPng(cardRef.current, { cacheBust: true })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = 'RateShopping_Rate_' + selectedProperty?.sid + '_' + new Date().getTime() + ".png"; // File name
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error("Error generating image:", err);
        });
    }
  };
  const formatDate = (timestamp: any) => {
    const dateObj = new Date(timestamp);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");
    return `${yyyy}/${mm}/${dd}`;
  };

  const handleDownload = () => {
    const headers = ["CheckinDate", "PropertyID", "PropertyName", "Rate"];

    const rows = data.flatMap((entry) => {
      const dateStr = escapeCSVValue(formatDate(entry.timestamp));

      // Competitor rows
      const competitorRows = Object.keys(entry)
        .filter((key) => key.startsWith("competitor_") && !key.endsWith("_name"))
        .map((key) => {
          const id = key.replace("competitor_", "");
          const nameKey = `competitor_${id}_name`;
          return [
            dateStr,
            escapeCSVValue(id),
            escapeCSVValue(entry[nameKey] || ""),
            escapeCSVValue(entry[key]),
          ];
        });

      // Extra "direct" row
      competitorRows.push([
        dateStr,
        selectedProperty?.hmid,
        selectedProperty?.name,
        escapeCSVValue(entry.direct),
      ]);

      // Extra "avgCompset" row
      competitorRows.push([
        dateStr,
        0,
        "Avg Compset",
        escapeCSVValue(entry.avgCompset),
      ]);

      return competitorRows;
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", 'RateShopping_Rate_' + selectedProperty?.sid + '_' + new Date().getTime() + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="relative bg-white dark:bg-slate-900 border border-border/50 rounded-lg -mt-[66px]">
        {/* Chart View Heading - Independent from page layout */}
        <div className="absolute left-4 lg:left-6 z-10 flex items-center" style={{ top: 'calc(1rem + 2px)' }}>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Trend Analysis</h3>
        </div>

        {/* Competitors Dropdown - Independent positioning */}
        <div className="absolute right-[16%] z-20" style={{ top: 'calc(1rem + 2px)' }}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="btn-minimal gap-2 relative">
                <Eye className="w-4 h-4" />
                Competitors ({visibleCompetitors.length}/{competitorChannels.length})
                <ChevronDown className="w-4 h-4" />
                {visibleCompetitors.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full"></div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="dropdown-minimal w-96 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700" align="end">
              <div className="p-3">
                {/* Header with selection info */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-slate-700">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">Select Competitors</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">
                      {visibleCompetitors.length} of {competitorChannels.length} competitors selected
                    </p>
                  </div>
                </div>

                {/* Competitor list */}
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {/* Select All Option */}
                  <div
                    className="relative flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    onClick={toggleAllCompetitors}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={competitorChannels.every(config => channelVisibility[config.key])}
                        onChange={toggleAllCompetitors}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 dark:text-slate-100">Select All</div>
                    </div>
                  </div>

                  {/* Individual Competitors */}
                  {competitorChannels.map((config) => (
                    <div
                      key={config.key}
                      className="relative flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      onClick={() => toggleChannelVisibility(config.key)}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={channelVisibility[config.key]}
                          onChange={() => toggleChannelVisibility(config.key)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {/* Colored circle indicator */}
                        <div
                          className="w-4 h-4 rounded-full ring-2 ring-white dark:ring-slate-800 shadow-sm flex-shrink-0"
                          style={{ backgroundColor: config.color }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate text-gray-900 dark:text-slate-100">{config.name}</div>
                      </div>
                      {channelVisibility[config.key] && (
                        <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 flex-shrink-0">
                          Active
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-slate-700">
                  <p className="text-xs text-gray-600 dark:text-slate-400 text-center">
                    Initially shows 4 channels. Select up to 10 total channels for display.
                  </p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="pt-16">
          {/* Error Message - Simple and Clean */}
          {errorMessage && (
            <Alert className="mb-3 border border-red-300 bg-red-50 dark:bg-red-950/20 py-2">
              <AlertDescription className="text-red-700 dark:text-red-300 text-sm">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}


          {/* Chart Container - Now visible */}
          <div style={{ height: '470px' }} className="[&_.recharts-wrapper]:mt-3 [&_.recharts-legend-wrapper]:!bottom-[54px]">


            {!hasData ? (
              <div className="h-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-500 dark:text-gray-400 mb-2">No rate data available</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    Please check your data source
                  </div>
                </div>
              </div>
            ) : data.length === 0 ? (
              <div className="h-full bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-500 dark:text-gray-400 mb-2">No data available</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    Please check date range and try again
                  </div>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 20, right: 40, left: 30, bottom: 30 }}
                  onClick={(event: any) => {
                    if (event && event.activeLabel) {
                      try {
                        const date = new Date(event.activeLabel)
                        openModal(date)
                      } catch (error) {
                        console.warn('Invalid date format:', event.activeLabel)
                      }
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-15 dark:opacity-10" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    interval="preserveStartEnd"
                    height={85}
                    tick={(props) => <CustomXAxisTick {...props} data={data} />}
                    axisLine={true}
                    tickLine={false}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 'dataMax']}
                    label={{
                      value: 'Rate (USD)',
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }}
                    tickFormatter={(value: number) => {
                      return `$${value}`
                    }}
                    width={50}
                  />
                  <RechartsTooltip
                    content={RTRateTrendsTooltip}
                    allowEscapeViewBox={{ x: true, y: true }}
                    offset={0}
                    isAnimationActive={false}
                    position={{ x: undefined, y: undefined }}
                    wrapperStyle={{
                      zIndex: 10000,
                      pointerEvents: 'none'
                    }}
                  />
                  {/* Recharts Legend with Ranking Trends pattern */}

                  <Legend
                    verticalAlign="bottom"
                    iconType="line"
                    wrapperStyle={{
                      ...(channelConfigs.length > 15
                        ? {
                          maxHeight: '80px',
                          overflowY: 'auto',
                          overflowX: 'hidden'
                        }
                        : { height: 35 }),
                      fontSize: '12px',
                      cursor: 'pointer',
                      lineHeight: '1.6',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '18px',
                      justifyContent: 'center',
                      paddingTop: '5px',
                      marginBottom: '-10px'
                    }}
                    onClick={(event: any) => {
                      if (event.dataKey && typeof event.dataKey === 'string') {
                        // Disable clicks for Direct and Avg Compset legends
                        const isDirectProperty = event.dataKey === 'direct'
                        const isAvgCompset = event.dataKey === 'avgCompset' || event.dataKey.includes('avgCompset')

                        if (isDirectProperty || isAvgCompset) {
                          return // Don't allow toggling for these important properties
                        }

                        // Toggle legend visibility
                        toggleLegendVisibility(event.dataKey)
                      }
                    }}
                    formatter={(value, entry: any) => {
                      const dataKey = entry.dataKey as string

                      // Check if this is a non-clickable legend (Direct or Avg Compset)
                      const isDirectProperty = dataKey === 'direct'
                      const isAvgCompset = dataKey === 'avgCompset' || dataKey.includes('avgCompset')
                      const isNonClickable = isDirectProperty || isAvgCompset

                      // Check if channel is selected in dropdown
                      const isChannelSelected = channelVisibility[dataKey]

                      if (!isChannelSelected) {
                        // Don't show legend for unselected channels
                        return null
                      } else {
                        // Channel is selected - use legend visibility state
                        const isLegendVisible = legendVisibility[dataKey]
                        return (
                          <span style={{
                            color: isLegendVisible ? entry.color : '#9ca3af',
                            fontWeight: isLegendVisible ? 500 : 400,
                            textDecoration: isLegendVisible ? 'none' : 'line-through',
                            cursor: isNonClickable ? 'default' : 'pointer'
                          }}>
                            {value}
                          </span>
                        )
                      }
                    }}
                  />
                  {/* Hotel Lines - Dynamic rendering using Ranking Trends pattern */}
                  {channelConfigs.filter(config => channelVisibility[config.key]).map((config) => {
                    const isVisible = legendVisibility[config.key]

                    return (
                      <Line
                        key={config.key}
                        type="monotone"
                        dataKey={config.key}
                        stroke={isVisible ? config.color : 'transparent'}
                        strokeWidth={isVisible ? (config.key === 'direct' ? 3 : 2) : 0}
                        strokeDasharray={config.key === 'avgCompset' ? '5 5' : undefined}
                        name={config.name}
                        dot={isVisible ? {
                          fill: "white",
                          stroke: config.color,
                          strokeWidth: 2,
                          r: config.key === 'direct' ? 4 : 3
                        } : false}
                        activeDot={isVisible ? {
                          r: config.key === 'direct' ? 6 : 5,
                          fill: config.color,
                          stroke: config.color,
                          strokeWidth: 2
                        } : false}
                        hide={!isVisible}
                        isAnimationActive={false}
                        animationDuration={0}
                      />
                    )
                  })}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      <RateDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedDate={selectedDateForModal}
        onPrevDay={() => navigateDay("prev")}
        onNextDay={() => navigateDay("next")}
      />
    </>
  )
}
