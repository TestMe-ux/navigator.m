"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, Filter, Download, ChevronDown, Eye, EyeOff, ArrowUp, ArrowDown, Minus, BarChart3, Star, Maximize2, Calendar } from "lucide-react"
import { useDateContext } from "@/components/date-context"
import { format, eachDayOfInterval, differenceInDays } from "date-fns"
import localStorageService from "@/lib/localstorage"
import { toPng } from "html-to-image";
import { escapeCSVValue } from "@/lib/utils"
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
  if (!rateData || Object.keys(rateData).length === 0) {
    return []
  }

  // Handle both nested (body.pricePositioningEntites) and direct (pricePositioningEntites) data structures
  const entities = rateData?.body?.pricePositioningEntites || rateData?.pricePositioningEntites

  if (!entities) {

    return []
  }

  // console.log("entities", entities);
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
      const rate = parseFloat(rateEntry.rate) || 0;
      // Map property types to chart data
      if (entity.propertyType === 0) {
        // Direct/Subscriber property
        dateData.directStatus = rateEntry.status === null ? rateEntry.rate : rateEntry.status;
        dateData.direct = rate
      } else if (entity.propertyType === 2) {
        // Avg Compset
        dateData.avgCompsetStatus = rateEntry.status === null ? rateEntry.rate : rateEntry.status;
        dateData.avgCompset = rate
      } else if (entity.propertyType === 1) {
        // Competitor property - create dynamic property key
        const competitorKey = `competitor_${entity.propertyID}`
        dateData[`${competitorKey}_Status`] = rateEntry.status === null ? rateEntry.rate : rateEntry.status;
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
  if (!rateData || Object.keys(rateData).length === 0) {

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
      color: '#9ca3af',
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

const formatYAxis = (value: string | number): string => {
  const num = Number(value)
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`
  return String(num)
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
        <div className="space-y-1">
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

              const competitorKey = entry.dataKey;
              const statusKey = `${competitorKey}_Status`;
              const statusData = entry.payload[statusKey];
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
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
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

                      {statusData
                        ? (() => {
                          const normalized = statusData.toUpperCase();

                          if (normalized === "O" && entry.value > 0) {
                            return `\u200E${currencySymbol}\u200E ${entry.value?.toLocaleString()}`;
                          }

                          if (normalized === "C") {
                            return "Sold Out";
                          }

                          if (["NP", "ND", "RF", "TNA"].includes(normalized)) {
                            return "-";
                          }

                          return "-";
                        })()
                        : `\u200E${currencySymbol}\u200E ${entry.value?.toLocaleString()}`}

                      {/* {entry.value === 0
                        ? '-' + `${statusData}`
                        : `\u200E${currencySymbol}\u200E ${entry.value?.toLocaleString()}`} */}
                      {/* {`\u200E${currencySymbol}\u200E ${entry.value?.toLocaleString()}`} ${data?.directStatus} */}
                    </div>
                    {/* Variance column - empty for Avg. Compset to maintain alignment */}
                    <div className="text-xs font-medium min-w-[40px]">
                      {!isAvgCompset && (
                        <span
                          className={`${priceDiff > 0
                            ? 'text-red-600 dark:text-red-400 font-bold'
                            : 'text-green-600 dark:text-green-400 font-bold'
                            }`}
                        >
                          {statusData
                            ? (() => {
                              const normalized = statusData.toUpperCase();

                              if (normalized === "O" && entry.value > 0) {
                                return priceDiff === 0
                                  ? ""
                                  : `${priceDiff > 0 ? "+" : ""}${priceDiff.toFixed(0)}%`;
                              }

                              if (normalized === "C") {
                                return " ";
                              }

                              if (["NP", "ND", "RF", "TNA"].includes(normalized)) {
                                return "-";
                              }

                              return "-";
                            })()
                            : `${priceDiff > 0 ? '+' : ''}${priceDiff.toFixed(0)}%`}

                          {/* {priceDiff === 0 ? '' : `${priceDiff > 0 ? '+' : ''}${priceDiff.toFixed(0)}%`} */}
                        </span>
                      )}
                      {/* {!isAvgCompset && (
                        <span className={`${priceDiff > 0
                          ? 'text-red-600 dark:text-red-400 font-bold'
                          : 'text-green-600 dark:text-green-400 font-bold'
                          }`}>
                          {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(0)}%
                        </span>
                      )} */}
                    </div>
                    {/* Ranking column - only for competitors, not for Avg Compset */}
                    <div className={`text-xs font-medium min-w-[50px] 
                       ${!isAvgCompset && positionText === 'Lowest'
                        ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                        : !isAvgCompset && positionText === 'Highest'
                          ? 'text-red-600 dark:text-red-400 font-bold'
                          : !isAvgCompset && positionText
                            ? 'text-gray-600 dark:text-gray-400'
                            : ''
                      }`}>
                      {statusData
                        ? (() => {
                          const normalized = statusData.toUpperCase();

                          if (normalized === "O" && entry.value > 0) {
                            return positionText
                          }

                          if (normalized === "C") {
                            return !isAvgCompset && positionText === "" ? " " : positionText;
                          }

                          if (["NP", "ND", "RF", "TNA"].includes(normalized)) {
                            return "-";
                          }

                          return "-";
                        })()
                        : (
                          !isAvgCompset && positionText === "" ? "-" : positionText
                        )}
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
 * Rate Trends Chart Component
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
export function RateTrendsChart({ rateData }: any) {
  const { startDate, endDate } = useDateContext()
  const [selectedProperty, setSelectedProperty] = useState<any>(null)

  // Safely get selectedProperty on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const property = localStorageService.get('SelectedProperty')
      setSelectedProperty(property)
    }
  }, [])

  // Generate channel configs based on actual data
  const channelConfigs = useMemo(() => generateChannelConfigs(rateData), [rateData])

  // State management
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [legendVisibility, setLegendVisibility] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    // This will be populated by generateChannelConfigs
    return initial
  })

  const [channelVisibility, setChannelVisibility] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    // This will be populated by generateChannelConfigs
    return initial
  })

  // Tab state
  const [activeTab, setActiveTab] = useState<string>('chart')

  // Generate data - with fallback dates if context dates are null
  const data = useMemo(() => {
    // Transform actual rate data to chart format
    const transformedData = transformRateData(rateData)
    return transformedData
  }, [rateData])

  // Initialize visibility states when channel configs change
  useEffect(() => {
    if (channelConfigs.length > 0) {
      const initialLegendVisibility: Record<string, boolean> = {}
      const initialChannelVisibility: Record<string, boolean> = {}

      channelConfigs.forEach(config => {
        initialLegendVisibility[config.key] = true // All legends visible by default
        initialChannelVisibility[config.key] = config.isVisible
      })

      setLegendVisibility(initialLegendVisibility)
      setChannelVisibility(initialChannelVisibility)
    }
  }, [channelConfigs])

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

  // Always include My Hotel line + visible competitors for chart rendering
  const myHotelChannel = useMemo(() =>
    channelConfigs.find(config => config.type === 'direct'),
    [channelConfigs]
  )

  const allSelectedChannels = useMemo(() =>
    myHotelChannel ? [myHotelChannel, ...visibleCompetitors] : visibleCompetitors,
    [myHotelChannel, visibleCompetitors]
  )

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
    const allSelectedKeys = allSelectedChannels.map(channel => channel.key)


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

  // Auto-clear error messages when visible legend count drops below 10
  useEffect(() => {
    const allSelectedKeys = allSelectedChannels.map(channel => channel.key)
    const currentVisibleCount = allSelectedKeys.filter(key => legendVisibility[key]).length


    // Clear error message if we're now under the limit
    if (currentVisibleCount < 10 && errorMessage) {

      setErrorMessage('')
    }
  }, [legendVisibility, allSelectedChannels, errorMessage])

  // Toggle channel visibility - no limit, dropdown selection should always work
  const toggleChannelVisibility = useCallback((channelKey: string) => {


    // Update channel visibility first
    setChannelVisibility(prev => {
      const wasVisible = prev[channelKey]
      const newVisibility = {
        ...prev,
        [channelKey]: !wasVisible
      }



      return newVisibility
    })

    // Update legend visibility separately - always sync with channel visibility
    setLegendVisibility(prevLegend => {
      const wasChannelVisible = prevLegend[channelKey]
      const newLegendVisibility = {
        ...prevLegend,
        [channelKey]: !wasChannelVisible
      }



      return newLegendVisibility
    })

    // Always clear any existing error message for dropdown actions
    setErrorMessage('')

  }, [])

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
    setErrorMessage('')


  }, [channelVisibility, legendVisibility, competitorChannels])

  // Toggle legend visibility (for hiding/showing lines in chart) - ONLY for legend clicks
  const toggleLegendVisibility = useCallback((dataKey: string) => {


    // Check if this channel is in the disabled list (11th+ selected channels)
    const isDisabledChannel = disabledChannels.some(channel => channel.key === dataKey)

    if (isDisabledChannel) {

      setErrorMessage('Maximum 10 hotels can be shown on the chart. Please deselect a hotel first to enable this one.')
      // Clear error message after 5 seconds
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    // Use functional state update to avoid stale closure issues
    setLegendVisibility(prev => {
      // Calculate current state using fresh state from setter
      const isCurrentlyVisible = prev[dataKey]


      // If trying to enable a hidden legend, check the 10-visible limit
      if (!isCurrentlyVisible) {
        // Count currently visible legends using fresh state
        const allSelectedKeys = allSelectedChannels.map(channel => channel.key)
        const currentVisibleCount = allSelectedKeys.filter(key => prev[key]).length



        // Block if already at 10 visible legends
        if (currentVisibleCount >= 10) {

          setErrorMessage('Maximum 10 channels can be displayed on the graph. Please hide a channel first to show a new one.')
          setTimeout(() => setErrorMessage(''), 5000)
          return prev // Return unchanged state
        }
      }

      // Allow the toggle - update state
      const newState = {
        ...prev,
        [dataKey]: !prev[dataKey]
      }

      // Log the new state for debugging
      const allSelectedKeys = allSelectedChannels.map(channel => channel.key)
      const newVisibleCount = allSelectedKeys.filter(key => newState[key]).length


      // If we're now under 10 visible legends, clear any error immediately
      if (newVisibleCount < 10) {

        setErrorMessage('')
      }

      return newState
    })

    // Always clear error message on successful toggle (backup)
    setTimeout(() => setErrorMessage(''), 0)
  }, [disabledChannels, allSelectedChannels])

  // Custom tooltip position to keep it within chart bounds
  // const getTooltipPosition = useCallback((coordinate: { x: number, y: number }, viewBox: any) => {
  //   if (!coordinate || !viewBox) return { x: 0, y: 0 }

  //   const tooltipWidth = 350 // max width from our tooltip
  //   const tooltipHeight = 200 // estimated height

  //   let x = coordinate.x
  //   let y = coordinate.y

  //   // Adjust x position to keep tooltip within chart
  //   if (x + tooltipWidth > viewBox.width) {
  //     x = coordinate.x - tooltipWidth
  //   }

  //   // Adjust y position to keep tooltip within chart
  //   if (y - tooltipHeight < 0) {
  //     y = coordinate.y + 20
  //   } else {
  //     y = coordinate.y - tooltipHeight - 10
  //   }

  //   return { x, y }
  // }, [])

  // Check if we have data
  const hasData = data.length > 0 && channelConfigs.length > 0



  // Debug helper function - can be called from console
  // const debugState = useCallback(() => {
  //   const allSelectedKeys = allSelectedChannels.map(channel => channel.key)
  //   const visibleCount = allSelectedKeys.filter(key => legendVisibility[key]).length
  //   const activeChannelKeys = chartChannels.map(channel => channel.key)
  //   const disabledChannelKeys = disabledChannels.map(channel => channel.key)

  //   return {
  //     totalSelected: allSelectedKeys.length,
  //     activeChannels: activeChannelKeys,
  //     disabledChannels: disabledChannelKeys,
  //     visibleLegends: visibleCount,
  //     errorMessage,
  //     legendVisibility,
  //     channelVisibility
  //   }
  // }, [allSelectedChannels, legendVisibility, chartChannels, disabledChannels, errorMessage, channelVisibility])

  // Make debug function available globally for troubleshooting
  // useEffect(() => {
  //   (window as any).debugRateChart = debugState
  //   return () => {
  //     delete (window as any).debugRateChart
  //   }
  // }, [debugState])

  // const getTrendIcon = (trend: 'stable' | 'up' | 'down') => {
  //   switch (trend) {
  //     case 'up': return <ArrowUp className="w-4 h-4 text-emerald-600" />
  //     case 'down': return <ArrowDown className="w-4 h-4 text-red-600" />
  //     default: return <Minus className="w-4 h-4 text-slate-600" />
  //   }
  // }

  // const getTrendBadge = (trend: 'stable' | 'up' | 'down') => {
  //   const badgeClasses = {
  //     up: 'badge-minimal bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  //     down: 'badge-minimal bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  //     stable: 'badge-minimal bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
  //   }
  //   return badgeClasses[trend]
  // }
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

  // Escape CSV fields if needed
  // const escapeCSVValue = (value: any) => {
  //   if (typeof value === "string") {
  //     if (value.includes(",") || value.includes('"') || value.includes("\n")) {
  //       return `"${value.replace(/"/g, '""')}"`;
  //     }
  //     return value;
  //   }
  //   return value ?? "";
  // };
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
    <Card ref={cardRef} className="chart-container-minimal animate-fade-in bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-minimal-title flex items-center gap-2">
              Rate Trends Analysis
            </CardTitle>
            <p className="text-minimal-body text-gray-600 dark:text-slate-400">
              {!hasData ? 'No rate data available' : 'Comprehensive rate comparison across all channels with market insights'}
            </p>
          </div>

          {/* General Action Controls - Competitors and Export */}
          <div className="flex items-center gap-3">
            {/* Enhanced Competitor Selection Control */}
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
                      Only first 10 selected competitors will be displayed on chart
                    </p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Download Button */}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="btn-minimal">
                  <Download className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownloadImageRate()}>Export as Image</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload()}>Export as CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Rate Chart */}
        <div className="space-y-4 mt-6">
          {/* Error Message */}
          {errorMessage && (
            <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <AlertDescription className="text-red-800 dark:text-red-200">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Chart Container */}
          <div className="h-[384px] w-full">


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
                <LineChart data={data} margin={{ top: 20, right: 40, left: 30, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-15 dark:opacity-10" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={(props) => <CustomXAxisTick {...props} data={data} />}
                    className="text-xs"
                    interval="preserveStartEnd"
                    height={35}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{
                      fontSize: 11,
                      fill: "currentColor"
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatYAxis}
                  />
                  <Tooltip
                    content={<CustomTooltip currencySymbol={selectedProperty?.currencySymbol ?? '$'} />}
                    allowEscapeViewBox={{ x: true, y: true }}
                    offset={10}
                    isAnimationActive={false}
                    wrapperStyle={{
                      zIndex: 10000,
                      pointerEvents: 'none'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={35}
                    iconType="line"
                    wrapperStyle={{
                      paddingTop: "5px",
                      marginBottom: "-10px",
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
                        // Disable clicks for Direct and Avg Compset legends
                        const isDirectProperty = event.dataKey === 'direct'
                        const isAvgCompset = event.dataKey === 'avgCompset' || event.dataKey.includes('avgCompset')

                        if (isDirectProperty || isAvgCompset) {
                          return // Don't allow toggling for these important properties
                        }

                        // Toggle legend visibility
                        toggleLegendVisibility(event.dataKey)

                        // Also update channel visibility to sync with dropdown
                        setChannelVisibility(prev => ({
                          ...prev,
                          [event.dataKey]: !prev[event.dataKey]
                        }))

                      }
                    }}
                    formatter={(value, entry: any) => {
                      const dataKey = entry.dataKey as string
                      const isDisabledChannel = disabledChannels.some(channel => channel.key === dataKey)
                      const isActiveChannel = chartChannels.some(channel => channel.key === dataKey)

                      // Check if this is a non-clickable legend (Direct or Avg Compset)
                      const isDirectProperty = dataKey === 'direct'
                      const isAvgCompset = dataKey === 'avgCompset' || dataKey.includes('avgCompset')
                      const isNonClickable = isDirectProperty || isAvgCompset

                      if (isDisabledChannel) {
                        // Disabled channels (11th+) - always grey and strike-through
                        return (
                          <span style={{
                            color: '#9ca3af',
                            fontWeight: 400,
                            textDecoration: 'line-through',
                            opacity: 0.6,
                            cursor: 'default'
                          }}>
                            {value}
                          </span>
                        )
                      } else if (isActiveChannel) {
                        // Active channels (first 10) - normal legend visibility logic
                        return (
                          <span style={{
                            color: legendVisibility[dataKey] ? entry.color : '#9ca3af',
                            fontWeight: legendVisibility[dataKey] ? 500 : 400,
                            textDecoration: legendVisibility[dataKey] ? 'none' : 'line-through',
                            cursor: isNonClickable ? 'default' : 'pointer'
                          }}>
                            {value}
                          </span>
                        )
                      } else {
                        // Fallback
                        return <span style={{ cursor: 'pointer' }}>{value}</span>
                      }
                    }}
                  />
                  {/* Render active channels (first 10) */}
                  {chartChannels.map((config) => {
                    const isVisible = legendVisibility[config.key] && channelVisibility[config.key]

                    return (
                      <Line
                        key={config.key}
                        type="monotone"
                        dataKey={config.key}
                        stroke={isVisible ? config.color : 'transparent'}
                        strokeWidth={isVisible ? config.strokeWidth : 0}
                        strokeDasharray={config.key === 'avgCompset' ? '5 5' : undefined}
                        name={config.name}
                        dot={isVisible ? { r: 3 } : false}
                        activeDot={isVisible ? { r: 5, stroke: config.color, strokeWidth: 2 } : false}
                        hide={!isVisible}
                      />
                    )
                  })}
                  {/* Render disabled channels (11th+) as hidden lines for legend display */}
                  {disabledChannels.map((config) => (
                    <Line
                      key={config.key}
                      type="monotone"
                      dataKey={config.key}
                      stroke="transparent"
                      strokeWidth={0}
                      name={config.name}
                      dot={false}
                      activeDot={false}
                      hide={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
