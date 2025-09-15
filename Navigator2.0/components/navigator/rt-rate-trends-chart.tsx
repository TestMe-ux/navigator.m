"use client"

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, Filter, Download, ChevronDown, Eye, EyeOff, ArrowUp, ArrowDown, Minus, BarChart3, Star, Maximize2, Calendar, Wifi, Coffee, Utensils, Car } from "lucide-react"
import { useDateContext } from "@/components/date-context"
import { format, eachDayOfInterval, differenceInDays } from "date-fns"
import { Tooltip as RechartsTooltip } from "recharts"
import localStorageService from "@/lib/localstorage"
import { toPng } from "html-to-image";
import { escapeCSVValue } from "@/lib/utils"
import { RateDetailModal } from "./rate-detail-modal"

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

        {/* Column Headings */}
        <div className="grid grid-cols-[1fr_80px_60px_50px] gap-0 px-2">
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

            // Sort payload by rate to calculate ranking
            const sortedRates = payload.map((entry: any) => entry.value).sort((a: number, b: number) => a - b)
            
            return payload.map((entry: any, index: number) => {
              const rate = entry.value
              const isMyHotel = entry.dataKey === 'direct'
              
              // Calculate variance (difference from My Hotel rate)
              const variance = rate - myHotelRate
              const varianceFormatted = variance === 0 ? '-' : 
                variance > 0 ? `+${variance}` : `-${Math.abs(variance)}`
              
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
                <div key={index} className={`grid grid-cols-[1fr_80px_60px_50px] gap-0 items-center py-0.5 pl-2 pr-2 rounded-md ${
                  isMyHotel ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700' : ''
                }`}>
                  {/* Property Column */}
                  <div className="flex items-center min-w-0 px-2 py-1 text-left">
                    <div className={`text-xs font-medium whitespace-nowrap ${
                      isMyHotel ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-slate-100'
                    }`}>
                      {truncatedName}
                    </div>
                  </div>
                  
                  {/* Rate Column with Icon */}
                  <div className={`flex items-center justify-end px-2 py-1 ${
                    isMyHotel ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-slate-100'
                  }`}>
                    <span className="text-sm font-bold">${rate}</span>
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
                  <div className={`text-sm text-right px-2 py-1 ${
                    variance === 0 ? 'text-gray-500 dark:text-slate-400' :
                    variance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                  }`}>
                    {varianceFormatted}
                  </div>

                  {/* Rank Column */}
                  <div className="text-right text-sm font-medium text-gray-700 dark:text-gray-300 px-2 py-1">
                    {rank}
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
const transformRateData = (rateData: RateDataResponse): RateData[] => {

  // Check if rateData is empty or invalid
  if (!rateData || (typeof rateData === 'object' && Object.keys(rateData).length === 0)) {
    return []
  }

  // Handle both nested (body.pricePositioningEntites) and direct (pricePositioningEntites) data structures
  const entities = rateData?.body?.pricePositioningEntites || rateData?.pricePositioningEntites

  if (!entities) {

    return []
  }

  const transformedData: RateData[] = []

  // Group data by check-in date
  const dateMap = new Map<string, any>()

  entities.forEach((entity, entityIndex) => {


    entity.subscriberPropertyRate.forEach((rateEntry, rateIndex) => {

      const checkInDate = rateEntry.checkInDateTime.split('T')[0] // Extract date part

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
        dateData.direct = rate
      } else if (entity.propertyType === 2) {
        // Avg Compset
        dateData.avgCompset = rate
      } else if (entity.propertyType === 1) {
        // Competitor property - create dynamic property key
        const competitorKey = `competitor_${entity.propertyID}`
        dateData[competitorKey] = rate
        dateData[`${competitorKey}_name`] = entity.propertName
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
const generateChannelConfigs = (rateData: RateDataResponse): ChannelConfig[] => {


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

  } else {

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

  } else {

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
      isVisible: index < 8, // Show first 8 competitors by default
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
  const hasEvents = dateData?.events && dateData.events.length > 0

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

      {/* Event icon */}
      {hasEvents && (
        <g transform="translate(-6, -8)">
          <circle
            cx={6}
            cy={6}
            r={4}
            fill="#f59e0b"
            stroke="#ffffff"
            strokeWidth={1}
          />
          <text
            x={6}
            y={6}
            dy={1}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={8}
            fontWeight="bold"
          >
            !
          </text>
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
          {/* Event Information under date heading */}
          {data?.events && data.events.length > 0 && (
            <div className="mt-2 flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/30 rounded-md border border-amber-200 dark:border-amber-700/50">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm text-amber-700 dark:text-amber-200 font-medium">
                {data.events.map((event: any) => event.eventName).join(', ')}
              </span>
            </div>
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
export function RTRateTrendsChart({ rateData }: any) {
  const { startDate, endDate } = useDateContext()
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  
  // Safely get selectedProperty on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const property = localStorageService.get('SelectedProperty')
      setSelectedProperty(property)
    }
  }, [])

  // Generate sample channel configs for demonstration
  const sampleChannelConfigs = useMemo(() => [
    {
      key: 'direct',
      name: 'My Hotel',
      color: '#2563eb',
      strokeWidth: 4,
      type: 'direct' as const,
      description: 'Your hotel rates',
      isVisible: true,
    },
    {
      key: 'avgCompset',
      name: 'Avg. Compset',
      color: '#0891b2',
      strokeWidth: 3,
      type: 'ota' as const,
      description: 'Average competitor rates',
      isVisible: true,
    },
    {
      key: 'competitor_101',
      name: 'Marriott Resort',
      color: '#ef4444',
      strokeWidth: 2,
      type: 'competitor' as const,
      description: 'Marriott Resort rates',
      isVisible: true,
    },
    {
      key: 'competitor_102',
      name: 'Hilton Paradise',
      color: '#10b981',
      strokeWidth: 2,
      type: 'competitor' as const,
      description: 'Hilton Paradise rates',
      isVisible: true,
    },
    {
      key: 'competitor_103',
      name: 'Hyatt Luxury',
      color: '#f59e0b',
      strokeWidth: 2,
      type: 'competitor' as const,
      description: 'Hyatt Luxury rates',
      isVisible: true,
    },
    {
      key: 'competitor_104',
      name: 'Sheraton Beach',
      color: '#8b5cf6',
      strokeWidth: 2,
      type: 'competitor' as const,
      description: 'Sheraton Beach rates',
      isVisible: true,
    },
    {
      key: 'competitor_105',
      name: 'Westin Resort',
      color: '#06b6d4',
      strokeWidth: 2,
      type: 'competitor' as const,
      description: 'Westin Resort rates',
      isVisible: true,
    },
    {
      key: 'competitor_106',
      name: 'InterContinental Grand',
      color: '#f97316',
      strokeWidth: 2,
      type: 'competitor' as const,
      description: 'InterContinental Grand rates',
      isVisible: true,
    },
    {
      key: 'competitor_107',
      name: 'Radisson Blu',
      color: '#84cc16',
      strokeWidth: 2,
      type: 'competitor' as const,
      description: 'Radisson Blu rates',
      isVisible: true,
    },
    {
      key: 'competitor_108',
      name: 'Holiday Inn Express',
      color: '#ec4899',
      strokeWidth: 2,
      type: 'competitor' as const,
      description: 'Holiday Inn Express rates',
      isVisible: true,
    },
    {
      key: 'competitor_109',
      name: 'Best Western Plus',
      color: '#6366f1',
      strokeWidth: 2,
      type: 'competitor' as const,
      description: 'Best Western Plus rates',
      isVisible: true,
    },
    {
      key: 'competitor_110',
      name: 'DoubleTree Hilton',
      color: '#14b8a6',
      strokeWidth: 2,
      type: 'competitor' as const,
      description: 'DoubleTree Hilton rates',
      isVisible: true,
    },
    {
      key: 'competitor_111',
      name: 'Renaissance Hotel',
      color: '#f59e0b',
      strokeWidth: 2,
      type: 'competitor' as const,
      description: 'Renaissance Hotel rates',
      isVisible: true,
    },
    {
      key: 'competitor_112',
      name: 'Courtyard Marriott',
      color: '#dc2626',
      strokeWidth: 2,
      type: 'competitor' as const,
      description: 'Courtyard Marriott rates',
      isVisible: true,
    },
    {
      key: 'competitor_113',
      name: 'Comfort Hotel Central',
      color: '#059669',
      strokeWidth: 2,
      type: 'competitor' as const,
      description: 'Comfort Hotel Central rates',
      isVisible: true,
    },
    {
      key: 'competitor_114',
      name: 'Hotel Alexander Plaza',
      color: '#7c3aed',
      strokeWidth: 2,
      type: 'competitor' as const,
      description: 'Hotel Alexander Plaza rates',
      isVisible: true,
    },
    {
      key: 'competitor_115',
      name: 'Acom Hotel Berlin',
      color: '#be123c',
      strokeWidth: 2,
      type: 'competitor' as const,
      description: 'Acom Hotel Berlin rates',
      isVisible: true,
    }
  ], [])

  // Generate channel configs based on actual data
  const channelConfigs = useMemo(() => {
    const actualConfigs = generateChannelConfigs(rateData)
    // Use sample configs if no real data
    return actualConfigs.length > 0 ? actualConfigs : sampleChannelConfigs
  }, [rateData, sampleChannelConfigs])

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
  const [legendVisibility, setLegendVisibility] = useState<Record<string, boolean>>(() => {
    // Initialize with sample config defaults to ensure proper fallback
    const initial: Record<string, boolean> = {}
    sampleChannelConfigs.forEach(config => {
      initial[config.key] = true // All legends visible by default
    })
    return initial
  })

  const [channelVisibility, setChannelVisibility] = useState<Record<string, boolean>>(() => {
    // Initialize with sample config defaults to ensure proper fallback
    const initial: Record<string, boolean> = {}
    sampleChannelConfigs.forEach(config => {
      initial[config.key] = config.isVisible
    })
    return initial
  })

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

  // Generate sample data for demonstration
  const sampleData = useMemo(() => [
    {
      date: "2024-01-01",
      timestamp: new Date("2024-01-01").getTime(),
      direct: 680,
      avgCompset: 750,
      competitor_101: 720,
      competitor_101_name: "Marriott Resort",
      competitor_102: 780,
      competitor_102_name: "Hilton Paradise",
      competitor_103: 695,
      competitor_103_name: "Hyatt Luxury",
      competitor_104: 820,
      competitor_104_name: "Sheraton Beach",
      competitor_105: 710,
      competitor_105_name: "Westin Resort",
      competitor_106: 740,
      competitor_106_name: "InterContinental Grand",
      competitor_107: 680,
      competitor_107_name: "Radisson Blu",
      competitor_108: 650,
      competitor_108_name: "Holiday Inn Express",
      competitor_109: 620,
      competitor_109_name: "Best Western Plus",
      competitor_110: 760,
      competitor_110_name: "DoubleTree Hilton",
      competitor_111: 790,
      competitor_111_name: "Renaissance Hotel",
      competitor_112: 700,
      competitor_112_name: "Courtyard Marriott",
      competitor_113: 630,
      competitor_113_name: "Comfort Hotel Central",
      competitor_114: 770,
      competitor_114_name: "Hotel Alexander Plaza",
      competitor_115: 660,
      competitor_115_name: "Acom Hotel Berlin"
    },
    {
      date: "2024-01-02",
      timestamp: new Date("2024-01-02").getTime(),
      direct: 690,
      avgCompset: 760,
      competitor_101: 730,
      competitor_101_name: "Marriott Resort",
      competitor_102: 790,
      competitor_102_name: "Hilton Paradise",
      competitor_103: 705,
      competitor_103_name: "Hyatt Luxury",
      competitor_104: 830,
      competitor_104_name: "Sheraton Beach",
      competitor_105: 720,
      competitor_105_name: "Westin Resort",
      competitor_106: 750,
      competitor_106_name: "InterContinental Grand",
      competitor_107: 690,
      competitor_107_name: "Radisson Blu",
      competitor_108: 660,
      competitor_108_name: "Holiday Inn Express",
      competitor_109: 630,
      competitor_109_name: "Best Western Plus",
      competitor_110: 770,
      competitor_110_name: "DoubleTree Hilton",
      competitor_111: 800,
      competitor_111_name: "Renaissance Hotel",
      competitor_112: 710,
      competitor_112_name: "Courtyard Marriott",
      competitor_113: 640,
      competitor_113_name: "Comfort Hotel Central",
      competitor_114: 780,
      competitor_114_name: "Hotel Alexander Plaza",
      competitor_115: 670,
      competitor_115_name: "Acom Hotel Berlin"
    },
    {
      date: "2024-01-03",
      timestamp: new Date("2024-01-03").getTime(),
      direct: 705,
      avgCompset: 775,
      competitor_101: 745,
      competitor_101_name: "Marriott Resort",
      competitor_102: 805,
      competitor_102_name: "Hilton Paradise",
      competitor_103: 720,
      competitor_103_name: "Hyatt Luxury",
      competitor_104: 845,
      competitor_104_name: "Sheraton Beach",
      competitor_105: 735,
      competitor_105_name: "Westin Resort",
      competitor_106: 765,
      competitor_106_name: "InterContinental Grand",
      competitor_107: 705,
      competitor_107_name: "Radisson Blu",
      competitor_108: 675,
      competitor_108_name: "Holiday Inn Express",
      competitor_109: 645,
      competitor_109_name: "Best Western Plus",
      competitor_110: 785,
      competitor_110_name: "DoubleTree Hilton",
      competitor_111: 815,
      competitor_111_name: "Renaissance Hotel",
      competitor_112: 725,
      competitor_112_name: "Courtyard Marriott",
      competitor_113: 655,
      competitor_113_name: "Comfort Hotel Central",
      competitor_114: 795,
      competitor_114_name: "Hotel Alexander Plaza",
      competitor_115: 685,
      competitor_115_name: "Acom Hotel Berlin"
    },
    {
      date: "2024-01-04",
      timestamp: new Date("2024-01-04").getTime(),
      direct: 720,
      avgCompset: 790,
      competitor_101: 760,
      competitor_101_name: "Marriott Resort",
      competitor_102: 820,
      competitor_102_name: "Hilton Paradise",
      competitor_103: 735,
      competitor_103_name: "Hyatt Luxury",
      competitor_104: 860,
      competitor_104_name: "Sheraton Beach",
      competitor_105: 750,
      competitor_105_name: "Westin Resort",
      competitor_106: 780,
      competitor_106_name: "InterContinental Grand",
      competitor_107: 720,
      competitor_107_name: "Radisson Blu",
      competitor_108: 690,
      competitor_108_name: "Holiday Inn Express",
      competitor_109: 660,
      competitor_109_name: "Best Western Plus",
      competitor_110: 800,
      competitor_110_name: "DoubleTree Hilton",
      competitor_111: 830,
      competitor_111_name: "Renaissance Hotel",
      competitor_112: 740,
      competitor_112_name: "Courtyard Marriott",
      competitor_113: 670,
      competitor_113_name: "Comfort Hotel Central",
      competitor_114: 810,
      competitor_114_name: "Hotel Alexander Plaza",
      competitor_115: 700,
      competitor_115_name: "Acom Hotel Berlin"
    },
    {
      date: "2024-01-05",
      timestamp: new Date("2024-01-05").getTime(),
      direct: 735,
      avgCompset: 805,
      competitor_101: 775,
      competitor_101_name: "Marriott Resort",
      competitor_102: 835,
      competitor_102_name: "Hilton Paradise",
      competitor_103: 750,
      competitor_103_name: "Hyatt Luxury",
      competitor_104: 875,
      competitor_104_name: "Sheraton Beach",
      competitor_105: 765,
      competitor_105_name: "Westin Resort",
      competitor_106: 795,
      competitor_106_name: "InterContinental Grand",
      competitor_107: 735,
      competitor_107_name: "Radisson Blu",
      competitor_108: 705,
      competitor_108_name: "Holiday Inn Express",
      competitor_109: 675,
      competitor_109_name: "Best Western Plus",
      competitor_110: 815,
      competitor_110_name: "DoubleTree Hilton",
      competitor_111: 845,
      competitor_111_name: "Renaissance Hotel",
      competitor_112: 755,
      competitor_112_name: "Courtyard Marriott",
      competitor_113: 685,
      competitor_113_name: "Comfort Hotel Central",
      competitor_114: 825,
      competitor_114_name: "Hotel Alexander Plaza",
      competitor_115: 715,
      competitor_115_name: "Acom Hotel Berlin"
    },
    {
      date: "2024-01-06",
      timestamp: new Date("2024-01-06").getTime(),
      direct: 750,
      avgCompset: 820,
      competitor_101: 790,
      competitor_101_name: "Marriott Resort",
      competitor_102: 850,
      competitor_102_name: "Hilton Paradise",
      competitor_103: 765,
      competitor_103_name: "Hyatt Luxury",
      competitor_104: 890,
      competitor_104_name: "Sheraton Beach",
      competitor_105: 780,
      competitor_105_name: "Westin Resort",
      competitor_106: 810,
      competitor_106_name: "InterContinental Grand",
      competitor_107: 750,
      competitor_107_name: "Radisson Blu",
      competitor_108: 720,
      competitor_108_name: "Holiday Inn Express",
      competitor_109: 690,
      competitor_109_name: "Best Western Plus",
      competitor_110: 830,
      competitor_110_name: "DoubleTree Hilton",
      competitor_111: 860,
      competitor_111_name: "Renaissance Hotel",
      competitor_112: 770,
      competitor_112_name: "Courtyard Marriott",
      competitor_113: 700,
      competitor_113_name: "Comfort Hotel Central",
      competitor_114: 840,
      competitor_114_name: "Hotel Alexander Plaza",
      competitor_115: 730,
      competitor_115_name: "Acom Hotel Berlin"
    },
    {
      date: "2024-01-07",
      timestamp: new Date("2024-01-07").getTime(),
      direct: 765,
      avgCompset: 835,
      competitor_101: 805,
      competitor_101_name: "Marriott Resort",
      competitor_102: 865,
      competitor_102_name: "Hilton Paradise",
      competitor_103: 780,
      competitor_103_name: "Hyatt Luxury",
      competitor_104: 905,
      competitor_104_name: "Sheraton Beach",
      competitor_105: 795,
      competitor_105_name: "Westin Resort",
      competitor_106: 825,
      competitor_106_name: "InterContinental Grand",
      competitor_107: 765,
      competitor_107_name: "Radisson Blu",
      competitor_108: 735,
      competitor_108_name: "Holiday Inn Express",
      competitor_109: 705,
      competitor_109_name: "Best Western Plus",
      competitor_110: 845,
      competitor_110_name: "DoubleTree Hilton",
      competitor_111: 875,
      competitor_111_name: "Renaissance Hotel",
      competitor_112: 785,
      competitor_112_name: "Courtyard Marriott",
      competitor_113: 715,
      competitor_113_name: "Comfort Hotel Central",
      competitor_114: 855,
      competitor_114_name: "Hotel Alexander Plaza",
      competitor_115: 745,
      competitor_115_name: "Acom Hotel Berlin"
    }
  ], [])

  // Generate data - with fallback dates if context dates are null
  const data = useMemo(() => {
    // Transform actual rate data to chart format
    const transformedData = transformRateData(rateData)

    // Use sample data if no real data available
    if (transformedData.length === 0) {
      return sampleData
    }

    return transformedData
  }, [rateData, sampleData])

  // Initialize visibility states when channel configs change
  useEffect(() => {
    if (channelConfigs.length > 0) {
      const initialLegendVisibility: Record<string, boolean> = {}
      const initialChannelVisibility: Record<string, boolean> = {}

      channelConfigs.forEach(config => {
        initialLegendVisibility[config.key] = true // All legends visible by default
        initialChannelVisibility[config.key] = config.isVisible
      })

      // Only update if we're using real data configs (not sample configs)
      const isUsingSampleConfigs = channelConfigs === sampleChannelConfigs
      if (!isUsingSampleConfigs) {
        setLegendVisibility(initialLegendVisibility)
        setChannelVisibility(initialChannelVisibility)
      }
    }
  }, [channelConfigs, sampleChannelConfigs])

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

  // Get selected competitors (from dropdown) but limit to first 8 for chart visibility
  const selectedCompetitors = useMemo(() =>
    competitorChannels.filter(config => channelVisibility[config.key]),
    [competitorChannels, channelVisibility]
  )

  const visibleCompetitors = useMemo(() =>
    selectedCompetitors.slice(0, 8), // Only first 8 selected competitors are visible on chart
    [selectedCompetitors]
  )

  // Competitors beyond the 8th are considered disabled (selected but not visible)
  const disabledCompetitors = useMemo(() =>
    selectedCompetitors.slice(8), // Competitors 9+ are disabled
    [selectedCompetitors]
  )

  // Always include My Hotel line + visible competitors for chart rendering
  const myHotelChannel = useMemo(() =>
    channelConfigs.find(config => config.type === 'direct'),
    [channelConfigs]
  )

  // Always include Avg. Compset line for chart rendering
  const avgCompsetChannel = useMemo(() =>
    channelConfigs.find(config => config.type === 'ota'),
    [channelConfigs]
  )

  const allSelectedChannels = useMemo(() => {
    const channels = []
    if (myHotelChannel) channels.push(myHotelChannel)
    if (avgCompsetChannel) channels.push(avgCompsetChannel) // Always include avgCompset, visibility is checked separately
    channels.push(...visibleCompetitors)
    return channels
  }, [myHotelChannel, avgCompsetChannel, visibleCompetitors])

  // Only first 10 channels will be active on chart (dynamically fills slots when hotels are deselected)
  const chartChannels = useMemo(() =>
    allSelectedChannels.slice(0, 10),
    [allSelectedChannels]
  )

  // Get channels that are selected but beyond the 10-limit (for disabled legends)
  const disabledChannels = useMemo(() =>
    allSelectedChannels.slice(10),
    [allSelectedChannels]
  )

  // Clean up legend states only for hotels that are completely deselected
  useEffect(() => {
    if (!allSelectedChannels || allSelectedChannels.length === 0) return
    const allSelectedKeys = allSelectedChannels.map(channel => channel?.key).filter(Boolean)


    setLegendVisibility(prev => {
      const updated = { ...prev }
      let needsUpdate = false

      // Only clean up legend states for hotels that are completely deselected from dropdown
      for (const key in updated) {
        if (!allSelectedKeys.includes(key as any) && updated[key] === true) {

          updated[key] = false
          needsUpdate = true
        }
      }

      return needsUpdate ? updated : prev
    })
  }, [allSelectedChannels])

  // Note: Error messages are managed by timeout only. Auto-clearing removed to prevent immediate dismissal.

  // Toggle channel visibility - allow all selections, but limit chart visibility to first 8
  const toggleChannelVisibility = useCallback((channelKey: string) => {

    // Check current visibility state before making changes
    setChannelVisibility(prev => {
      const wasVisible = prev[channelKey]
      
      // Allow all competitor selections from dropdown - visibility will be limited in chart rendering
      
      // Clear error when deselecting (corrective action) - only if it was about selection limits
      if (wasVisible && errorMessage && (errorMessage.includes('Maximum') || errorMessage.includes('disabled'))) {
        clearError()
      }
      
      const newVisibility = {
        ...prev,
        [channelKey]: !wasVisible
      }

      return newVisibility
    })

    // Update legend visibility to sync with channel visibility
    setLegendVisibility(prevLegend => {
      const newLegendVisibility = {
        ...prevLegend,
        [channelKey]: !prevLegend[channelKey]
      }

      return newLegendVisibility
    })

  }, [clearError, errorMessage])

  // Toggle all competitors - Select All functionality
  const toggleAllCompetitors = useCallback(() => {

    const newVisibility = { ...channelVisibility }
    const newLegendVisibility = { ...legendVisibility }

    // Check if all competitors are currently selected
    const allSelected = competitorChannels.every(config => channelVisibility[config.key])

    let selectedCount = 0
    competitorChannels.forEach(config => {
      const newValue = !allSelected
      if (newVisibility[config.key] !== newValue) {
        selectedCount++

      }
      newVisibility[config.key] = newValue
      newLegendVisibility[config.key] = newValue
    })

    setChannelVisibility(newVisibility)
    setLegendVisibility(newLegendVisibility)
    // Don't clear error message automatically - let timeout handle it


  }, [channelVisibility, legendVisibility, competitorChannels])

  // Toggle legend visibility (for hiding/showing lines in chart) - ONLY for legend clicks
  const toggleLegendVisibility = useCallback((dataKey: string) => {


    // Check if this channel is in the disabled list (11th+ selected channels)
    const isDisabledChannel = disabledChannels.some(channel => channel.key === dataKey)

    if (isDisabledChannel) {

      setErrorWithTimeout('Maximum 10 hotels can be shown on the chart. Please deselect a hotel first to enable this one.')
      return
    }

    // Use functional state update to avoid stale closure issues
    setLegendVisibility(prev => {
      // Calculate current state using fresh state from setter
      const isCurrentlyVisible = prev[dataKey]


      // If trying to enable a hidden legend, check if it would exceed the 8 visible competitor limit
      if (!isCurrentlyVisible && competitorChannels && competitorChannels.length > 0) {
        // Check if the legend being clicked is a competitor
        const isCompetitor = competitorChannels.some(comp => comp.key === dataKey)
        
        if (isCompetitor) {
          // Calculate current selected competitors using fresh state
          const currentSelectedCompetitorKeys = competitorChannels
            .filter(comp => prev[comp.key])
            .map(comp => comp.key)
          
          // If enabling this competitor would put it beyond the 8th position, block it
          const newSelectedCompetitors = [...currentSelectedCompetitorKeys, dataKey]
          const competitorIndex = newSelectedCompetitors.indexOf(dataKey)
          
          if (competitorIndex >= 8) {
            console.log('🚨 Cannot enable competitor beyond 8th position:', { dataKey, position: competitorIndex + 1 })
            setErrorWithTimeout('This competitor is currently disabled. Only the first 8 selected competitors are shown on the chart.')
            return prev // Return unchanged state
          }
        }
      }

      // Allow the toggle - update state
      const newState = {
        ...prev,
        [dataKey]: !prev[dataKey]
      }

      // Clear error if user is deselecting competitors (reducing disabled count) - only for selection limit errors
      if (prev[dataKey] && !newState[dataKey] && errorMessage && 
          (errorMessage.includes('Maximum') || errorMessage.includes('disabled'))) {
        clearError()
      }

      return newState
    })

    // Note: Error messages are managed by timeout, no immediate clearing needed
  }, [disabledChannels, competitorChannels, clearError, setErrorWithTimeout, errorMessage])

  // Check if we have data
  const hasData = data.length > 0 && channelConfigs.length > 0

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
    link.setAttribute("download", 'RateShopping_Rate_' + selectedProperty?.sid + '_' + new Date().getTime()+".csv");
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
              Competitors ({selectedCompetitors.length}/{competitorChannels.length})
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="dropdown-minimal w-96 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700" align="start">
            <div className="p-3">
              {/* Header with selection info */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-slate-700">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">Select Competitors</p>
                  <p className="text-xs text-gray-600 dark:text-slate-400">
                    {selectedCompetitors.length} selected, {visibleCompetitors.length} visible on chart
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
                {competitorChannels.map((config, index) => {
                  // All competitors are "selected" in dropdown since they're all available in legends
                  const isSelected = true
                  // Calculate if this competitor is disabled (beyond 8th position in current selections)
                  const selectedCompetitorKeys = competitorChannels
                    .filter(comp => channelVisibility[comp.key])
                    .map(comp => comp.key)
                  const competitorIndex = selectedCompetitorKeys.indexOf(config.key)
                  const isDisabled = channelVisibility[config.key] && competitorIndex >= 8
                  
                  return (
                    <div
                      key={config.key}
                      className={`relative flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isDisabled 
                          ? 'opacity-60 bg-gray-50 dark:bg-slate-800/30' 
                          : 'hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer'
                      }`}
                      onClick={() => !isDisabled && toggleChannelVisibility(config.key)}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => !isDisabled && toggleChannelVisibility(config.key)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                          disabled={isDisabled}
                          readOnly={true}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm truncate ${
                          isDisabled 
                            ? 'text-gray-500 dark:text-slate-500' 
                            : 'text-gray-900 dark:text-slate-100'
                        }`}>
                          {config.name}
                        </div>
                      </div>
                      {!isDisabled && channelVisibility[config.key] && (
                        <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 flex-shrink-0">
                          Active
                        </Badge>
                      )}
                      {isDisabled && (
                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 flex-shrink-0">
                          Disabled
                        </Badge>
                      )}
                      {!channelVisibility[config.key] && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex-shrink-0">
                          Available
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="mt-3 pt-2 border-t border-gray-200 dark:border-slate-700">
                <p className="text-xs text-gray-600 dark:text-slate-400 text-center">
                  Only first 10 selected competitors will be displayed on chart
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
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", dy: 10 }}
                    axisLine={true}
                    tickLine={false}
                    tickFormatter={(value: string) => {
                      try {
                        const date = new Date(value)
                        return format(date, "MMM dd")
                      } catch {
                        return value
                      }
                    }}
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
                    height={30}
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
                        // Toggle legend visibility using Ranking Trends pattern
                        toggleLegendVisibility(event.dataKey)
                      }
                    }}
                    formatter={(value, entry: any) => {
                      const dataKey = entry.dataKey as string
                      const isVisible = legendVisibility[dataKey]

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
                  
                  {/* Hotel Lines - Dynamic rendering using Ranking Trends pattern */}
                  {channelConfigs.map((config) => {
                    const isVisible = legendVisibility[config.key]
                    
                    return (
                      <Line
                        key={config.key}
                        type="monotone"
                        dataKey={config.key}
                        stroke={isVisible ? config.color : 'transparent'}
                        strokeWidth={isVisible ? (config.key === 'direct' ? 3 : 2) : 0}
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
