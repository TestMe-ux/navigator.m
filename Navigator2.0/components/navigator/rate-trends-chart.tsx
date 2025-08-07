"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
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

/**
 * Chart Data Configuration
 * Professional rate trends data with multiple channels and time periods
 */
interface RateData {
  date: string
  timestamp: number
  direct: number
  avgCompset: number
  competitor1: number
  competitor2: number
  competitor3: number
  competitor4: number
  competitor5: number
  competitor6: number
  competitor7: number
  competitor8: number
  competitor9: number
  competitor10: number
  competitor11: number
  competitor12: number
  competitor13: number
  competitor14: number
  competitor15: number
  occupancy: number
  events?: string[]
}



const generateRateData = (startDate: Date, endDate: Date): RateData[] => {
  const baseData: RateData[] = []
  const days = eachDayOfInterval({ start: startDate, end: endDate })
  
  console.log('🏨 Generating realistic rate data with dynamic pricing variations')
  
  // Generate daily data for the selected date range
  days.forEach((d, index) => {
    const date = format(d, 'yyyy-MM-dd')
    const dayOfWeek = d.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    
    // Base rates with realistic variations and seasonal trends
    const baseRate = 280 + (Math.random() - 0.5) * 40
    const weekendMultiplier = isWeekend ? 1.15 : 1.0
    const seasonalFactor = 1 + 0.2 * Math.sin((index / days.length) * Math.PI * 2)
    
    // Add special events (simulate events every 10-15 days)
    const events: string[] = []
    const dayOfMonth = d.getDate()
    if (dayOfMonth >= 15 && dayOfMonth <= 17 && d.getMonth() % 2 === 0) {
      events.push("Tech Conference")
    }
    if (dayOfMonth >= 25 && dayOfMonth <= 27 && d.getMonth() % 3 === 0) {
      events.push("Music Festival") 
    }
    if (dayOfMonth >= 5 && dayOfMonth <= 7 && d.getMonth() % 4 === 0) {
      events.push("Trade Show")
    }
    
    const eventMultiplier = events.length > 0 ? 1.25 : 1.0
    
    // Add market trends based on date range length
    const trendFactor = days.length > 30 ? 1 + (index / days.length) * 0.1 : 1.0
    
    // Dynamic pricing with realistic market variations
    const dayVariation = Math.sin(index * 0.3) * 0.15 // Daily market fluctuations
    const randomFactor = (Math.random() - 0.5) * 0.1 // Random market noise
    const competitionFactor = index % 7 === 0 ? 0.9 : 1.0 // Weekly promotional cycles
    
    // Base multipliers for each hotel with daily variations
    const hotelMultipliers = {
      direct: 1.0 + dayVariation + randomFactor, // My Hotel - competitive positioning
      competitor1: 1.12 + (Math.sin(index * 0.2) * 0.08) + randomFactor, // Grand Plaza - variable premium
      competitor2: 1.25 + (Math.sin(index * 0.4) * 0.1) + randomFactor, // Emirates Palace - luxury fluctuations
      competitor3: 1.18 + (Math.sin(index * 0.15) * 0.12) + randomFactor, // Atlantis - resort seasonality
      competitor4: 1.45 + (Math.sin(index * 0.1) * 0.05) + randomFactor, // Burj Al Arab - stable ultra-luxury
      competitor5: 1.22 + (Math.sin(index * 0.25) * 0.09) + randomFactor, // Four Seasons - luxury variations
      competitor6: 1.35 + (Math.sin(index * 0.35) * 0.07) + randomFactor, // Armani - designer premium
      competitor7: 1.08 + (Math.sin(index * 0.45) * 0.15) + randomFactor * competitionFactor, // JW Marriott - business competitive
      competitor8: 1.28 + (Math.sin(index * 0.3) * 0.11) + randomFactor, // Palazzo Versace - Italian luxury
      competitor9: 1.15 + (Math.sin(index * 0.5) * 0.13) + randomFactor, // Madinat Jumeirah - resort variations
      competitor10: 1.20 + (Math.sin(index * 0.2) * 0.1) + randomFactor, // Ritz-Carlton - consistent luxury
      competitor11: 1.32 + (Math.sin(index * 0.18) * 0.09) + randomFactor, // St. Regis - ultra-luxury beachfront
      competitor12: 1.16 + (Math.sin(index * 0.42) * 0.12) + randomFactor, // Address Downtown - modern premium
      competitor13: 1.21 + (Math.sin(index * 0.28) * 0.10) + randomFactor, // Jumeirah Beach - wave-shaped resort
      competitor14: 1.14 + (Math.sin(index * 0.38) * 0.11) + randomFactor, // Conrad - executive business
      competitor15: 1.26 + (Math.sin(index * 0.32) * 0.08) + randomFactor, // Shangri-La - Asian luxury
    }
    
    // Calculate individual competitor rates
    const directRate = Math.round(baseRate * weekendMultiplier * seasonalFactor * eventMultiplier * trendFactor * hotelMultipliers.direct)
    const competitor1Rate = Math.round(baseRate * weekendMultiplier * seasonalFactor * eventMultiplier * trendFactor * hotelMultipliers.competitor1)
    const competitor2Rate = Math.round(baseRate * weekendMultiplier * seasonalFactor * eventMultiplier * trendFactor * hotelMultipliers.competitor2)
    const competitor3Rate = Math.round(baseRate * weekendMultiplier * seasonalFactor * eventMultiplier * trendFactor * hotelMultipliers.competitor3)
    const competitor4Rate = Math.round(baseRate * weekendMultiplier * seasonalFactor * eventMultiplier * trendFactor * hotelMultipliers.competitor4)
    const competitor5Rate = Math.round(baseRate * weekendMultiplier * seasonalFactor * eventMultiplier * trendFactor * hotelMultipliers.competitor5)
    const competitor6Rate = Math.round(baseRate * weekendMultiplier * seasonalFactor * eventMultiplier * trendFactor * hotelMultipliers.competitor6)
    const competitor7Rate = Math.round(baseRate * weekendMultiplier * seasonalFactor * eventMultiplier * trendFactor * hotelMultipliers.competitor7)
    const competitor8Rate = Math.round(baseRate * weekendMultiplier * seasonalFactor * eventMultiplier * trendFactor * hotelMultipliers.competitor8)
    const competitor9Rate = Math.round(baseRate * weekendMultiplier * seasonalFactor * eventMultiplier * trendFactor * hotelMultipliers.competitor9)
    const competitor10Rate = Math.round(baseRate * weekendMultiplier * seasonalFactor * eventMultiplier * trendFactor * hotelMultipliers.competitor10)
    const competitor11Rate = Math.round(baseRate * weekendMultiplier * seasonalFactor * eventMultiplier * trendFactor * hotelMultipliers.competitor11)
    const competitor12Rate = Math.round(baseRate * weekendMultiplier * seasonalFactor * eventMultiplier * trendFactor * hotelMultipliers.competitor12)
    const competitor13Rate = Math.round(baseRate * weekendMultiplier * seasonalFactor * eventMultiplier * trendFactor * hotelMultipliers.competitor13)
    const competitor14Rate = Math.round(baseRate * weekendMultiplier * seasonalFactor * eventMultiplier * trendFactor * hotelMultipliers.competitor14)
    const competitor15Rate = Math.round(baseRate * weekendMultiplier * seasonalFactor * eventMultiplier * trendFactor * hotelMultipliers.competitor15)
    
    // Calculate average compset (average of all competitor rates)
    const competitorRates = [
      competitor1Rate, competitor2Rate, competitor3Rate, competitor4Rate, competitor5Rate,
      competitor6Rate, competitor7Rate, competitor8Rate, competitor9Rate, competitor10Rate,
      competitor11Rate, competitor12Rate, competitor13Rate, competitor14Rate, competitor15Rate
    ]
    const avgCompsetRate = Math.round(competitorRates.reduce((sum, rate) => sum + rate, 0) / competitorRates.length)

    baseData.push({
      date,
      timestamp: d.getTime(),
      direct: directRate,
      avgCompset: avgCompsetRate,
      competitor1: competitor1Rate,
      competitor2: competitor2Rate,
      competitor3: competitor3Rate,
      competitor4: competitor4Rate,
      competitor5: competitor5Rate,
      competitor6: competitor6Rate,
      competitor7: competitor7Rate,
      competitor8: competitor8Rate,
      competitor9: competitor9Rate,
      competitor10: competitor10Rate,
      competitor11: competitor11Rate,
      competitor12: competitor12Rate,
      competitor13: competitor13Rate,
      competitor14: competitor14Rate,
      competitor15: competitor15Rate,
      occupancy: Math.round(75 + (Math.random() - 0.5) * 30 + (events.length * 10)),
      events: events.length > 0 ? events : undefined,
    })
  })
  
  // Log sample positioning data for verification
  if (baseData.length > 0) {
    const sampleDay = baseData[Math.floor(baseData.length / 2)]
    const rates = [
      { name: 'My Hotel', rate: sampleDay.direct },
      { name: 'Grand Plaza', rate: sampleDay.competitor1 },
      { name: 'JW Marriott', rate: sampleDay.competitor7 }
    ].sort((a, b) => a.rate - b.rate)
    
    console.log('📊 Sample day pricing positions:', rates.map((h, i) => `#${i + 1}: ${h.name} ($${h.rate})`).join(', '))
  }
  
  return baseData
}



/**
 * Channel Configuration
 * Defines display properties for each rate channel
 */
interface ChannelConfig {
  key: keyof RateData
  name: string
  color: string
  strokeWidth: number
  type: 'ota' | 'direct' | 'competitor'
  description: string
  isVisible: boolean
}

/**
 * Enhanced Channel Configuration with modern color palette
 * Now focused on My Hotel line + up to 10 competitors (3 selected by default)
 */
const channelConfigs: ChannelConfig[] = [
  {
    key: 'direct',
    name: 'My Hotel',
    color: '#2563eb',
    strokeWidth: 4,
    type: 'direct',
    description: 'My hotel rates',
    isVisible: true,
  },
  {
    key: 'avgCompset',
    name: 'Avg. Compset',
    color: '#9ca3af',
    strokeWidth: 2,
    type: 'competitor',
    description: 'Average competitive set rates',
    isVisible: true,
  },
  {
    key: 'competitor1',
    name: 'Grand Plaza Dubai',
    color: '#10b981',
    strokeWidth: 2,
    type: 'competitor',
    description: 'Luxury competitor in DIFC',
    isVisible: true,
  },
  {
    key: 'competitor2',
    name: 'Emirates Palace',
    color: '#f97316',
    strokeWidth: 2,
    type: 'competitor',
    description: 'Premium beachfront resort',
    isVisible: true,
  },
  {
    key: 'competitor3',
    name: 'Atlantis The Palm',
    color: '#8b5cf6',
    strokeWidth: 2,
    type: 'competitor',
    description: 'Iconic Palm Jumeirah resort',
    isVisible: true,
  },
  {
    key: 'competitor4',
    name: 'Burj Al Arab',
    color: '#ef4444',
    strokeWidth: 2,
    type: 'competitor',
    description: 'Ultra-luxury sail-shaped hotel',
    isVisible: false,
  },
  {
    key: 'competitor5',
    name: 'Four Seasons Resort',
    color: '#f59e0b',
    strokeWidth: 2,
    type: 'competitor',
    description: 'Luxury resort at Jumeirah Beach',
    isVisible: false,
  },
  {
    key: 'competitor6',
    name: 'Armani Hotel Dubai',
    color: '#06b6d4',
    strokeWidth: 2,
    type: 'competitor',
    description: 'Designer hotel in Burj Khalifa',
    isVisible: false,
  },
  {
    key: 'competitor7',
    name: 'JW Marriott Marquis',
    color: '#84cc16',
    strokeWidth: 2,
    type: 'competitor',
    description: 'Twin-tower business hotel',
    isVisible: false,
  },
  {
    key: 'competitor8',
    name: 'Palazzo Versace',
    color: '#ec4899',
    strokeWidth: 2,
    type: 'competitor',
    description: 'Italian luxury on Dubai Creek',
    isVisible: false,
  },
  {
    key: 'competitor9',
    name: 'Madinat Jumeirah',
    color: '#6366f1',
    strokeWidth: 2,
    type: 'competitor',
    description: 'Arabian resort complex',
    isVisible: false,
  },
  {
    key: 'competitor10',
    name: 'The Ritz-Carlton',
    color: '#8b5cf6',
    strokeWidth: 2,
    type: 'competitor',
    description: 'Beachfront luxury resort',
    isVisible: false,
  },
  {
    key: 'competitor11',
    name: 'St. Regis Dubai',
    color: '#94a3b8',
    strokeWidth: 2,
    type: 'competitor',
    description: 'Ultra-luxury beachfront resort',
    isVisible: false,
  },
  {
    key: 'competitor12',
    name: 'Address Downtown',
    color: '#64748b',
    strokeWidth: 2,
    type: 'competitor',
    description: 'Modern hotel near Burj Khalifa',
    isVisible: false,
  },
  {
    key: 'competitor13',
    name: 'Jumeirah Beach Hotel',
    color: '#475569',
    strokeWidth: 2,
    type: 'competitor',
    description: 'Wave-shaped beachfront hotel',
    isVisible: false,
  },
  {
    key: 'competitor14',
    name: 'Conrad Dubai',
    color: '#334155',
    strokeWidth: 2,
    type: 'competitor',
    description: 'Executive business hotel',
    isVisible: false,
  },
  {
    key: 'competitor15',
    name: 'Shangri-La Dubai',
    color: '#1e293b',
    strokeWidth: 2,
    type: 'competitor',
    description: 'Asian luxury hospitality',
    isVisible: false,
  },
]

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
function CustomTooltip({ active, payload, label, coordinate }: CustomTooltipProps & { coordinate?: { x: number, y: number } }) {
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
    const sortedRates = allRates.sort((a, b) => a - b)
    const myPosition = sortedRates.indexOf(myHotelRate) + 1
    const totalHotels = sortedRates.length
    
    // Get position text for each hotel
    const getPositionText = (rate: number, hotelName: string) => {
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
                {data.events.join(', ')}
              </span>
            </div>
          )}
        </div>
        
        {/* Compact Rate Details */}
        <div className="space-y-1">
          {payload
            .sort((a, b) => {
              // Custom sort: My Hotel first, then Avg. Compset, then others by price
              if (a.name === 'My Hotel') return -1
              if (b.name === 'My Hotel') return 1
              if (a.name === 'Avg. Compset') return -1
              if (b.name === 'Avg. Compset') return 1
              return a.value - b.value // Sort remaining by price (cheapest first)
            })
            .map((entry, index) => {
            const isMyHotel = entry.name === 'My Hotel'
            const isAvgCompset = entry.name === 'Avg. Compset'
            const isCheapest = index === 0
            
            // Calculate variance against Avg. Compset for all entries except Avg. Compset itself
            const priceDiff = !isAvgCompset && avgCompsetRate > 0 ? 
              ((entry.value - avgCompsetRate) / avgCompsetRate * 100) : 0
            
            const isCompetitiveThreat = !isMyHotel && !isAvgCompset && entry.value < myHotelRate
            const positionText = getPositionText(entry.value, entry.name)
            
            return (
              <div key={entry.name} className={`flex items-center justify-between gap-2 p-2 rounded transition-all ${
                isMyHotel 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                  : isAvgCompset
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className={`text-xs truncate ${
                    isMyHotel 
                      ? 'font-semibold text-blue-700 dark:text-blue-300' 
                      : isAvgCompset
                      ? 'font-semibold text-red-700 dark:text-red-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {entry.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-right flex-shrink-0">
                  <div className={`text-sm font-bold min-w-[60px] text-right ${
                    isMyHotel 
                      ? 'text-blue-900 dark:text-blue-200' 
                      : isAvgCompset
                      ? 'text-red-900 dark:text-red-200'
                      : isCheapest 
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-gray-900 dark:text-slate-100'
                  }`}>
                    ${entry.value?.toLocaleString()}
                  </div>
                  {/* Variance column - empty for Avg. Compset to maintain alignment */}
                  <div className="text-xs font-medium min-w-[40px]">
                    {!isAvgCompset && (
                      <span className={`${
                        priceDiff > 0 
                          ? 'text-red-600 dark:text-red-400 font-bold' 
                          : 'text-green-600 dark:text-green-400 font-bold'
                      }`}>
                        {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(0)}%
                      </span>
                    )}
                  </div>
                  {/* Ranking column - empty for Avg. Compset to maintain alignment */}
                  <div className={`text-xs font-medium min-w-[50px] ${
                    !isAvgCompset && positionText === 'Lowest' 
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                      : !isAvgCompset && positionText === 'Highest'
                      ? 'text-red-600 dark:text-red-400 font-bold'
                      : !isAvgCompset
                      ? 'text-gray-600 dark:text-gray-400'
                      : ''
                  }`}>
                    {!isAvgCompset && positionText}
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
export function RateTrendsChart() {
  const { startDate, endDate } = useDateContext()
  

  
  // State management
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [legendVisibility, setLegendVisibility] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    channelConfigs.forEach(config => {
      initial[config.key] = true // All legends visible by default
    })
    return initial
  })

  const [channelVisibility, setChannelVisibility] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    channelConfigs.forEach(config => {
      initial[config.key] = config.isVisible
    })
    return initial
  })

  // Tab state
  const [activeTab, setActiveTab] = useState<string>('chart')

  // Generate data - with fallback dates if context dates are null
  const data = useMemo(() => {
    // Use context dates or fallback to current week
    const effectiveStartDate = startDate || new Date()
    const effectiveEndDate = endDate || new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
    
    console.log('🔍 Using dates:', {
      contextStart: startDate?.toLocaleDateString(),
      contextEnd: endDate?.toLocaleDateString(),
      effectiveStart: effectiveStartDate.toLocaleDateString(),
      effectiveEnd: effectiveEndDate.toLocaleDateString()
    })
    
    const generatedData = generateRateData(effectiveStartDate, effectiveEndDate)
    

    
    return generatedData
  }, [startDate, endDate])

  // Filter visible channels with proper memoization
  const visibleChannels = useMemo(() => 
    channelConfigs.filter(config => channelVisibility[config.key]), 
    [channelVisibility]
  )
  
  // Filter competitor channels only for the dropdown (exclude My Hotel)
  const competitorChannels = useMemo(() => 
    channelConfigs.filter(config => config.type === 'competitor'), 
    []
  )
  
  const visibleCompetitors = useMemo(() => 
    competitorChannels.filter(config => channelVisibility[config.key]), 
    [competitorChannels, channelVisibility]
  )
  
  // Always include My Hotel line + visible competitors for chart rendering
  const myHotelChannel = useMemo(() => 
    channelConfigs.find(config => config.type === 'direct'), 
    []
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
    
    console.log(`🔄 Cleanup: Selected hotels: ${allSelectedKeys.length}`)
    console.log(`Selected: [${allSelectedKeys.join(', ')}]`)
    
    setLegendVisibility(prev => {
      const updated = { ...prev }
      let needsUpdate = false
      
      // Only clean up legend states for hotels that are completely deselected from dropdown
      for (const key in updated) {
        if (!allSelectedKeys.includes(key as any) && updated[key] === true) {
          console.log(`🧹 Cleaning up legend for deselected hotel: ${key}`)
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
    
    console.log(`🔍 Monitoring: Visible legends: ${currentVisibleCount}/10`)
    
    // Clear error message if we're now under the limit
    if (currentVisibleCount < 10 && errorMessage) {
      console.log(`✅ Auto-clearing error: Under 10 visible legends (${currentVisibleCount})`)
      setErrorMessage('')
    }
  }, [legendVisibility, allSelectedChannels, errorMessage])

  // Toggle channel visibility - no limit, dropdown selection should always work
  const toggleChannelVisibility = useCallback((channelKey: string) => {
    console.log(`🔄 Dropdown: Toggling hotel ${channelKey}`)
    
    // Update channel visibility first
    setChannelVisibility(prev => {
      const wasVisible = prev[channelKey]
      const newVisibility = {
        ...prev,
        [channelKey]: !wasVisible
      }
      
      console.log(`✅ Dropdown: Hotel ${channelKey} ${wasVisible ? 'deselected' : 'selected'}`)
      console.log(`📊 Total selected hotels: ${Object.values(newVisibility).filter(Boolean).length}`)
      
      return newVisibility
    })
    
    // Update legend visibility separately - always sync with channel visibility
    setLegendVisibility(prevLegend => {
      const wasChannelVisible = prevLegend[channelKey]
      const newLegendVisibility = {
        ...prevLegend,
        [channelKey]: !wasChannelVisible
      }
      
      console.log(`📈 Dropdown: Legend ${channelKey} set to ${!wasChannelVisible}`)
      
      return newLegendVisibility
    })
    
    // Always clear any existing error message for dropdown actions
    setErrorMessage('')
    console.log(`🧹 Dropdown: Cleared error messages`)
  }, [])

  // Toggle all competitors - Select All functionality
  const toggleAllCompetitors = useCallback(() => {
    console.log('🔄 ALL Button: Selecting/Deselecting ALL competitors')
    const newVisibility = { ...channelVisibility }
    const newLegendVisibility = { ...legendVisibility }
    
    // Check if all competitors are currently selected
    const allSelected = competitorChannels.every(config => channelVisibility[config.key])
    
    let selectedCount = 0
    competitorChannels.forEach(config => {
      const newValue = !allSelected
      if (newVisibility[config.key] !== newValue) {
        selectedCount++
        console.log(`${newValue ? '✅' : '❌'} ALL Button: ${newValue ? 'Selecting' : 'Deselecting'} ${config.name}`)
      }
      newVisibility[config.key] = newValue
      newLegendVisibility[config.key] = newValue
    })
    
    setChannelVisibility(newVisibility)
    setLegendVisibility(newLegendVisibility)
    setErrorMessage('')
    
    console.log(`📊 ALL Button: ${allSelected ? 'Deselected' : 'Selected'} ${selectedCount} competitors`)
  }, [channelVisibility, legendVisibility, competitorChannels])

  // Toggle legend visibility (for hiding/showing lines in chart) - ONLY for legend clicks
  const toggleLegendVisibility = useCallback((dataKey: string) => {
    console.log(`🎯 Legend Click: ${dataKey}`)
    
    // Check if this channel is in the disabled list (11th+ selected channels)
    const isDisabledChannel = disabledChannels.some(channel => channel.key === dataKey)
    
    if (isDisabledChannel) {
      console.log(`❌ Legend Click Blocked: ${dataKey} is disabled (11th+ hotel)`)
      setErrorMessage('Maximum 10 hotels can be shown on the chart. Please deselect a hotel first to enable this one.')
      // Clear error message after 5 seconds
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }
    
    // Use functional state update to avoid stale closure issues
    setLegendVisibility(prev => {
      // Calculate current state using fresh state from setter
      const isCurrentlyVisible = prev[dataKey]
      console.log(`📈 Legend Click: ${dataKey} currently visible: ${isCurrentlyVisible}`)
      
      // If trying to enable a hidden legend, check the 10-visible limit
      if (!isCurrentlyVisible) {
        // Count currently visible legends using fresh state
        const allSelectedKeys = allSelectedChannels.map(channel => channel.key)
        const currentVisibleCount = allSelectedKeys.filter(key => prev[key]).length
        
        console.log(`📊 Legend Click Check: Total selected: ${allSelectedKeys.length}, Currently visible: ${currentVisibleCount}`)
        console.log(`📋 Currently visible legends:`, allSelectedKeys.filter(key => prev[key]))
        
        // Block if already at 10 visible legends
        if (currentVisibleCount >= 10) {
          console.log(`❌ Legend Click Blocked: Already ${currentVisibleCount} visible legends`)
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
      console.log(`✅ Legend Click: ${dataKey} toggled to ${!isCurrentlyVisible}`)
      console.log(`📊 New visible count: ${newVisibleCount}`)
      
      // If we're now under 10 visible legends, clear any error immediately
      if (newVisibleCount < 10) {
        console.log(`🧹 Clearing error: Now under 10 visible legends`)
        setErrorMessage('')
      }
      
      return newState
    })
    
    // Always clear error message on successful toggle (backup)
    setTimeout(() => setErrorMessage(''), 0)
  }, [disabledChannels, allSelectedChannels])

  // Custom tooltip position to keep it within chart bounds
  const getTooltipPosition = useCallback((coordinate: { x: number, y: number }, viewBox: any) => {
    if (!coordinate || !viewBox) return { x: 0, y: 0 }
    
    const tooltipWidth = 350 // max width from our tooltip
    const tooltipHeight = 200 // estimated height
    
    let x = coordinate.x
    let y = coordinate.y
    
    // Adjust x position to keep tooltip within chart
    if (x + tooltipWidth > viewBox.width) {
      x = coordinate.x - tooltipWidth
    }
    
    // Adjust y position to keep tooltip within chart
    if (y - tooltipHeight < 0) {
      y = coordinate.y + 20
    } else {
      y = coordinate.y - tooltipHeight - 10
    }
    
    return { x, y }
  }, [])
  
  // Always show chart with fallback dates - never stuck in loading
  const isLoading = false
  


  // Debug helper function - can be called from console
  const debugState = useCallback(() => {
    const allSelectedKeys = allSelectedChannels.map(channel => channel.key)
    const visibleCount = allSelectedKeys.filter(key => legendVisibility[key]).length
    const activeChannelKeys = chartChannels.map(channel => channel.key)
    const disabledChannelKeys = disabledChannels.map(channel => channel.key)
    
    console.log('🔍 DEBUG STATE:')
    console.log(`📊 Total selected hotels: ${allSelectedKeys.length}`)
    console.log(`✅ Active channels (1-10): ${activeChannelKeys.length} [${activeChannelKeys.join(', ')}]`)
    console.log(`❌ Disabled channels (11+): ${disabledChannelKeys.length} [${disabledChannelKeys.join(', ')}]`)
    console.log(`👁️ Visible legends: ${visibleCount} [${allSelectedKeys.filter(key => legendVisibility[key]).join(', ')}]`)
    console.log(`🚨 Error message: "${errorMessage}"`)
    console.log(`📋 Legend visibility state:`, legendVisibility)
    console.log(`🏨 Channel visibility state:`, channelVisibility)
    
    return {
      totalSelected: allSelectedKeys.length,
      activeChannels: activeChannelKeys,
      disabledChannels: disabledChannelKeys,
      visibleLegends: visibleCount,
      errorMessage,
      legendVisibility,
      channelVisibility
    }
  }, [allSelectedChannels, legendVisibility, chartChannels, disabledChannels, errorMessage, channelVisibility])

  // Make debug function available globally for troubleshooting
  useEffect(() => {
    (window as any).debugRateChart = debugState
    return () => {
      delete (window as any).debugRateChart
    }
  }, [debugState])

  const getTrendIcon = (trend: 'stable' | 'up' | 'down') => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-emerald-600" />
      case 'down': return <ArrowDown className="w-4 h-4 text-red-600" />
      default: return <Minus className="w-4 h-4 text-slate-600" />
    }
  }

  const getTrendBadge = (trend: 'stable' | 'up' | 'down') => {
    const badgeClasses = {
      up: 'badge-minimal bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      down: 'badge-minimal bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      stable: 'badge-minimal bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
    }
    return badgeClasses[trend]
  }

  return (
    <Card className="chart-container-minimal animate-fade-in bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-minimal-title flex items-center gap-2">
              Rate Trends Analysis
            </CardTitle>
            <p className="text-minimal-body text-gray-600 dark:text-slate-400">
              {isLoading ? 'Loading chart data...' : 'Comprehensive rate comparison across all channels with market insights'}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="btn-minimal">
                  <Download className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export as Image</DropdownMenuItem>
                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

              
              {isLoading ? (
                <div className="h-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-500 dark:text-gray-400 mb-2">Loading chart data...</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      Dates: {startDate ? startDate.toLocaleDateString() : 'null'} - {endDate ? endDate.toLocaleDateString() : 'null'}
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
                    />
                    <Tooltip 
                      content={<CustomTooltip />}
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
                          toggleLegendVisibility(event.dataKey)
                        }
                      }}
                      formatter={(value, entry: any) => {
                        const dataKey = entry.dataKey as string
                        const isDisabledChannel = disabledChannels.some(channel => channel.key === dataKey)
                        const isActiveChannel = chartChannels.some(channel => channel.key === dataKey)
                        
                        if (isDisabledChannel) {
                          // Disabled channels (11th+) - always grey and strike-through
                          return (
                            <span style={{ 
                              color: '#9ca3af',
                              fontWeight: 400,
                              textDecoration: 'line-through',
                              opacity: 0.6
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
                              textDecoration: legendVisibility[dataKey] ? 'none' : 'line-through'
                            }}>
                              {value}
                            </span>
                          )
                        } else {
                          // Fallback
                          return <span>{value}</span>
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
