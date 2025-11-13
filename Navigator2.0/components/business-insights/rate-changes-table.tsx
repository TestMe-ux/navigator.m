"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, getDaysInMonth } from "date-fns"
import { 
  ComposedChart,
  Line, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer
} from "recharts"

interface RateChangesData {
  month: string
  subscriber: number
  blessHotelIbiza: number
  meIbiza: number
  mondrianIbiza: number
  wIbiza: number
  hotel6: number
  hotel7: number
  hotel8: number
  hotel9: number
  hotel10: number
  hotel11: number
  hotel12: number
  hotel13: number
  hotel14: number
}

interface HotelData {
  name: string
  avgRateRange: string
}

interface RateChangesTableProps {
  className?: string
  selectedCompetitors?: number[]
}

// Sample data for Rate Changes table
const defaultRateChangesData: RateChangesData[] = [
  { month: "Oct'25", subscriber: 4573, blessHotelIbiza: 2637, meIbiza: 3545, mondrianIbiza: 956, wIbiza: 2065, hotel6: 3200, hotel7: 2800, hotel8: 3400, hotel9: 2900, hotel10: 3100, hotel11: 2700, hotel12: 3300, hotel13: 2600, hotel14: 3500 },
  { month: "Sep'25", subscriber: 3824, blessHotelIbiza: 4394, meIbiza: 4049, mondrianIbiza: 3736, wIbiza: 3772, hotel6: 3150, hotel7: 2750, hotel8: 3350, hotel9: 2850, hotel10: 3050, hotel11: 2650, hotel12: 3250, hotel13: 2550, hotel14: 3450 },
  { month: "Aug'25", subscriber: 3982, blessHotelIbiza: 4523, meIbiza: 4265, mondrianIbiza: 3857, wIbiza: 3900, hotel6: 3280, hotel7: 2880, hotel8: 3480, hotel9: 2980, hotel10: 3180, hotel11: 2780, hotel12: 3380, hotel13: 2680, hotel14: 3580 },
  { month: "Jul'25", subscriber: 3851, blessHotelIbiza: 4280, meIbiza: 4215, mondrianIbiza: 3866, wIbiza: 3958, hotel6: 3220, hotel7: 2820, hotel8: 3420, hotel9: 2920, hotel10: 3120, hotel11: 2720, hotel12: 3320, hotel13: 2620, hotel14: 3520 },
  { month: "Jun'25", subscriber: 3722, blessHotelIbiza: 3872, meIbiza: 4054, mondrianIbiza: 3491, wIbiza: 3814, hotel6: 3170, hotel7: 2770, hotel8: 3370, hotel9: 2870, hotel10: 3070, hotel11: 2670, hotel12: 3270, hotel13: 2570, hotel14: 3470 },
  { month: "May'25", subscriber: 3668, blessHotelIbiza: 3790, meIbiza: 4103, mondrianIbiza: 3526, wIbiza: 3920, hotel6: 3240, hotel7: 2840, hotel8: 3440, hotel9: 2940, hotel10: 3140, hotel11: 2740, hotel12: 3340, hotel13: 2640, hotel14: 3540 },
  { month: "Apr'25", subscriber: 3105, blessHotelIbiza: 1527, meIbiza: 506, mondrianIbiza: 441, wIbiza: 91, hotel6: 1200, hotel7: 800, hotel8: 1400, hotel9: 900, hotel10: 1100, hotel11: 700, hotel12: 1300, hotel13: 600, hotel14: 1500 },
  { month: "Mar'25", subscriber: 528, blessHotelIbiza: 0, meIbiza: 0, mondrianIbiza: 0, wIbiza: 0, hotel6: 0, hotel7: 0, hotel8: 0, hotel9: 0, hotel10: 0, hotel11: 0, hotel12: 0, hotel13: 0, hotel14: 0 },
  { month: "Feb'25", subscriber: 484, blessHotelIbiza: 0, meIbiza: 0, mondrianIbiza: 0, wIbiza: 0, hotel6: 0, hotel7: 0, hotel8: 0, hotel9: 0, hotel10: 0, hotel11: 0, hotel12: 0, hotel13: 0, hotel14: 0 },
  { month: "Jan'25", subscriber: 1031, blessHotelIbiza: 0, meIbiza: 0, mondrianIbiza: 0, wIbiza: 0, hotel6: 0, hotel7: 0, hotel8: 0, hotel9: 0, hotel10: 0, hotel11: 0, hotel12: 0, hotel13: 0, hotel14: 0 },
  { month: "Dec'24", subscriber: 2110, blessHotelIbiza: 0, meIbiza: 0, mondrianIbiza: 0, wIbiza: 0, hotel6: 0, hotel7: 0, hotel8: 0, hotel9: 0, hotel10: 0, hotel11: 0, hotel12: 0, hotel13: 0, hotel14: 0 },
  { month: "Nov'24", subscriber: 2679, blessHotelIbiza: 0, meIbiza: 0, mondrianIbiza: 0, wIbiza: 100, hotel6: 0, hotel7: 0, hotel8: 0, hotel9: 0, hotel10: 0, hotel11: 0, hotel12: 0, hotel13: 0, hotel14: 0 }
]

const subscriberHotel: HotelData = { name: "Subscriber", avgRateRange: "€189 - €660" }

const competitorHotels: HotelData[] = [
  { name: "Bless Hotel Ibiza", avgRateRange: "€0 - €799" },
  { name: "ME Ibiza - The Leading Hotels of...", avgRateRange: "€0 - €821" },
  { name: "Mondrian Ibiza", avgRateRange: "€0 - €594" },
  { name: "W Ibiza", avgRateRange: "€0 - €621" },
  { name: "Grand Hotel Ibiza", avgRateRange: "€150 - €750" },
  { name: "Paradise Beach Resort", avgRateRange: "€120 - €680" },
  { name: "Sunset View Hotel", avgRateRange: "€180 - €820" },
  { name: "Ocean Breeze Resort", avgRateRange: "€140 - €720" },
  { name: "Crystal Bay Hotel", avgRateRange: "€160 - €780" },
  { name: "Seaside Luxury Inn", avgRateRange: "€130 - €650" },
  { name: "Island Paradise Hotel", avgRateRange: "€170 - €800" },
  { name: "Coastal View Resort", avgRateRange: "€145 - €690" },
  { name: "Mediterranean Grand", avgRateRange: "€155 - €760" }
]

// Primary compsets (first 4 competitor hotels)
const primaryCompsets: HotelData[] = competitorHotels.slice(0, 4)

// Get all competitor hotels from dropdown (matching the dropdown structure)
const getAllCompetitorHotels = () => {
  // This matches the structure from competitors-dropdown.tsx
  const allHotels = [
    { id: 1, name: "Grand Plaza Hotel & Conference Center" },
    { id: 2, name: "Ocean View Resort & Spa" },
    { id: 3, name: "City Center Inn Downtown" },
    { id: 4, name: "Mountain Lodge & Ski Resort" },
    { id: 5, name: "Beachside Paradise Resort & Marina" },
    { id: 6, name: "The Metropolitan Luxury Hotel" },
    { id: 7, name: "Sunset Beachfront Resort & Conference Center" },
    { id: 8, name: "Historic Downtown Grand Hotel" },
    { id: 9, name: "Downtown Suites & Business Center" },
    { id: 10, name: "Riverside Hotel & Waterfront Restaurant" },
    { id: 11, name: "Garden View Inn & Event Center" },
    { id: 12, name: "Skyline Tower Luxury Apartments" },
    { id: 13, name: "Heritage Manor Historic Boutique Hotel" },
    { id: 14, name: "Coastal Breeze Resort & Wellness Spa" },
    { id: 15, name: "Urban Executive Hotel & Conference Facilities" },
    { id: 16, name: "Seaside Luxury Resort & Beach Club" },
    { id: 17, name: "Platinum Executive Suites & Conference Hall" },
    { id: 18, name: "Emerald Bay Luxury Resort & Golf Club" },
    { id: 19, name: "Crystal Palace Grand Hotel & Convention Center" },
    { id: 20, name: "Royal Crown Hotel & Spa Resort" },
    { id: 21, name: "Diamond View Luxury Apartments & Business Center" },
    { id: 22, name: "Golden Gate Hotel & Conference Facilities" },
    { id: 23, name: "Majestic Towers Premium Resort & Marina" },
    { id: 24, name: "Elite Collection Hotel & Wellness Center" }
  ]
  return allHotels
}

// Combined hotels array (Subscriber + Competitors)
const hotels: HotelData[] = [subscriberHotel, ...competitorHotels]

// Get min and max values for color coding
const getMinMaxValues = (data: RateChangesData[]) => {
  const allValues: number[] = []
  data.forEach(row => {
    allValues.push(
      row.subscriber,
      row.blessHotelIbiza,
      row.meIbiza,
      row.mondrianIbiza,
      row.wIbiza,
      row.hotel6,
      row.hotel7,
      row.hotel8,
      row.hotel9,
      row.hotel10,
      row.hotel11,
      row.hotel12,
      row.hotel13,
      row.hotel14
    )
  })
  const validValues = allValues.filter(v => v > 0)
  return {
    min: Math.min(...validValues),
    max: Math.max(...validValues)
  }
}

// Get color intensity based on value - 3 brackets for min-max range
const getCellColor = (value: number, min: number, max: number) => {
  // 0 changes: white background
  if (value === 0) return "bg-white dark:bg-gray-900"
  
  // If all values are the same, use medium blue
  if (min === max) return "bg-blue-200 dark:bg-blue-800/50"
  
  // Calculate ratio for 3 brackets
  const ratio = (value - min) / (max - min)
  
  // Divide into 3 brackets:
  // 0-33%: light blue
  // 33-66%: medium blue (increased by 1 level)
  // 66-100%: dark blue (increased by 2 levels)
  if (ratio < 0.33) return "bg-blue-100 dark:bg-blue-900/30"
  if (ratio < 0.66) return "bg-blue-300 dark:bg-blue-700/60"
  return "bg-blue-600 dark:bg-blue-500/80"
}

// Get text color based on cell background - white for dark blue cells
const getCellTextColor = (value: number, min: number, max: number) => {
  // 0 changes: default text color
  if (value === 0) return "text-gray-900 dark:text-gray-100"
  
  // If all values are the same, use default text color
  if (min === max) return "text-gray-900 dark:text-gray-100"
  
  // Calculate ratio for 3 brackets
  const ratio = (value - min) / (max - min)
  
  // Dark blue bracket (66-100%): white text
  if (ratio >= 0.66) return "text-white dark:text-white"
  
  // Other brackets: default text color
  return "text-gray-900 dark:text-gray-100"
}

// Tooltip Content Component for Rate Changes Table
interface RateChangesTooltipContentProps {
  row: RateChangesData
  hotelName: string
}

function RateChangesTooltipContent({ row, hotelName }: RateChangesTooltipContentProps) {
  // Calculate min and max values for the row
  const rowValues = [
    row.subscriber,
    row.blessHotelIbiza,
    row.meIbiza,
    row.mondrianIbiza,
    row.wIbiza,
    row.hotel6,
    row.hotel7,
    row.hotel8,
    row.hotel9,
    row.hotel10,
    row.hotel11,
    row.hotel12,
    row.hotel13,
    row.hotel14
  ].filter(v => v > 0)
  
  const minValue = rowValues.length > 0 ? Math.min(...rowValues) : 0
  const maxValue = rowValues.length > 0 ? Math.max(...rowValues) : 0
  
  // Get avg rate range for Subscriber (primary hotel)
  const subscriberRateRange = "€189 - €660"
  
  // Sample data for maximum rate changes dates (these would come from actual data)
  const maxChangeDates = [
    { date: "18 Sep", day: "Thu", changes: 149 },
    { date: "21 Sep", day: "Sun", changes: 146 },
    { date: "24 Sep", day: "Wed", changes: 145 }
  ]
  
  return (
    <div>
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-xs font-medium text-gray-900 dark:text-white leading-tight break-words">
          {hotelName.replace(/<br\s*\/?>/gi, ' ')} - {row.month}
        </h3>
      </div>
      
      {/* Rate Summary */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex flex-col min-w-0" style={{ width: 'fit-content' }}>
          <span className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
            {subscriberRateRange.replace(/€/g, '').trim()}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 whitespace-nowrap">
            Avg. Rate Range (€)
          </span>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
            {minValue > 0 ? minValue.toLocaleString() : '--'}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            Min
          </span>
        </div>
        <div className="flex flex-col min-w-0" style={{ width: 'fit-content' }}>
          <span className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
            {maxValue > 0 ? maxValue.toLocaleString() : '--'}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            Max
          </span>
        </div>
      </div>
      
      {/* Separator */}
      <div className="border-t border-dashed border-gray-300 dark:border-gray-600 mb-3"></div>
      
      {/* Maximum Rate Changes Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-xs font-medium text-gray-900 dark:text-white">
            Maximum Rate Changes on
          </span>
        </div>
        <div className="space-y-1.5">
          {maxChangeDates.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="text-gray-700 dark:text-gray-300">
                {item.date}, {item.day}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {item.changes} changes
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Custom X-Axis Tick Component for Rate Changes Graph
interface CustomXAxisTickProps {
  x?: number
  y?: number
  payload?: {
    value: string
  }
  monthName?: string
  lastDate?: number
  topDates?: number[]
  dateData?: any
  legendVisibility?: Record<string, boolean>
  selectedHotelsData?: Array<{ id: number; name: string } | undefined>
}

function CustomXAxisTick({ x, y, payload, monthName, lastDate, topDates = [], dateData, legendVisibility = {}, selectedHotelsData = [] }: CustomXAxisTickProps) {
  if (!payload || !x || !y) return null

  const [isHovered, setIsHovered] = React.useState(false)
  const dayOfMonth = parseInt(payload.value, 10)
  const showMonth = dayOfMonth === 1 || dayOfMonth === 15 || (lastDate && dayOfMonth === lastDate)
  const isTopDate = topDates.includes(dayOfMonth)

  // Calculate total visible changes for this date
  let totalVisibleChanges = 0
  if (dateData && isTopDate) {
    // Count Subscriber Changes if visible
    if (legendVisibility["Subscriber Changes"] !== false) {
      totalVisibleChanges += dateData["Subscriber Changes"] || 0
    }

    // Count hotel changes if visible
    selectedHotelsData.forEach((hotel) => {
      if (hotel) {
        const dataKey = `${hotel.name} Changes`
        if (legendVisibility[dataKey] !== false) {
          totalVisibleChanges += dateData[dataKey] || 0
        }
      }
    })
  }

  return (
    <g transform={`translate(${x},${y})`}>
      {/* Day number (first line) */}
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill="#4b5563"
        fontSize={10}
      >
        {dayOfMonth}
      </text>
      {/* Month name (second line) - only show on 1st, 15th, and last date */}
      {showMonth && monthName && (
        <text
          x={0}
          y={0}
          dy={30}
          textAnchor="middle"
          fill="#4b5563"
          fontSize={10}
        >
          {monthName}
        </text>
      )}
      {/* Red dot for top 3 dates with maximum changes - positioned above date labels */}
      {isTopDate && (
        <g>
          <circle
            cx={0}
            cy={0}
            r={4}
            fill="#ef4444"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          />
          {/* Tooltip on hover - positioned below the red dot */}
          {isHovered && (
            <foreignObject x={-50} y={10} width="100" height="25" style={{ overflow: 'visible', pointerEvents: 'none' }}>
              <div className="relative">
                <div
                  className="bg-gray-900 dark:bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-50"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: '8px',
                    pointerEvents: 'none'
                  }}
                >
                  {totalVisibleChanges.toLocaleString('en-US')} Maximum Changes
                </div>
              </div>
            </foreignObject>
          )}
        </g>
      )}
    </g>
  )
}

// Generate chart data for expanded row
const generateChartData = (monthData: RateChangesData, allData: RateChangesData[]) => {
  return hotels.map(hotel => {
    const dataKey = hotel.name === "Subscriber" 
      ? "subscriber"
      : hotel.name === "Bless Hotel Ibiza"
      ? "blessHotelIbiza"
      : hotel.name === "ME Ibiza - The Leading Hotels of..."
      ? "meIbiza"
      : hotel.name === "Mondrian Ibiza"
      ? "mondrianIbiza"
      : "wIbiza"
    
    // Get all values for this hotel across months for trend
    const values = allData.map(row => ({
      month: row.month,
      value: row[dataKey as keyof RateChangesData] as number
    }))
    
    return {
      name: hotel.name,
      currentValue: monthData[dataKey as keyof RateChangesData] as number,
      values,
      color: hotel.name === "Subscriber" 
        ? "#3b82f6" 
        : hotel.name === "Bless Hotel Ibiza"
        ? "#10b981"
        : hotel.name === "ME Ibiza - The Leading Hotels of..."
        ? "#f59e0b"
        : hotel.name === "Mondrian Ibiza"
        ? "#ef4444"
        : "#8b5cf6"
    }
  })
}

// Helper function to calculate columns per page based on screen width
const calculateColumnsPerPage = (width: number): number => {
  if (width < 1352) {
    return 3
  } else if (width < 1500) {
    return 5
  } else if (width < 1800) {
    return 7
  } else {
    return 9
  }
}

// Helper function to get initial screen width (handles SSR)
const getInitialScreenWidth = (): number => {
  if (typeof window === 'undefined') return 1920
  return window.innerWidth
}

// Helper function to get initial columns per page (handles SSR)
const getInitialColumnsPerPage = (): number => {
  if (typeof window === 'undefined') return 9
  return calculateColumnsPerPage(window.innerWidth)
}

export function RateChangesTable({ className, selectedCompetitors = [] }: RateChangesTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [competitorPage, setCompetitorPage] = useState(0)
  const [columnsPerPage, setColumnsPerPage] = useState(() => getInitialColumnsPerPage())
  const [screenWidth, setScreenWidth] = useState(() => getInitialScreenWidth())
  const { min, max } = getMinMaxValues(defaultRateChangesData)
  
  // Legend visibility state for toggling lines on/off
  const [legendVisibility, setLegendVisibility] = useState<Record<string, boolean>>({})
  
  // Initialize legend visibility - only first 5 enabled by default
  // Initialize when competitors change OR when row is expanded
  useEffect(() => {
    // Only initialize if a row is expanded
    if (!expandedRow) return
    
    const allHotels = getAllCompetitorHotels()
    const selectedHotelsData = selectedCompetitors.length > 0
      ? selectedCompetitors.map(id => allHotels.find(h => h.id === id)).filter(Boolean)
      : [allHotels[0], allHotels[1], allHotels[2]]
    
    const initialVisibility: Record<string, boolean> = {
      "Subscriber Changes": true,
      "Subscriber Cheapest Rate": true
    }
    
    // Enable only first 3 hotels (total 5 with Subscriber legends)
    // Rest are disabled by default
    selectedHotelsData.forEach((hotel, index) => {
      if (hotel) {
        const dataKey = `${hotel.name} Changes`
        // First 3 hotels are enabled, rest are disabled
        initialVisibility[dataKey] = index < 3
      }
    })
    
    setLegendVisibility(prev => {
      // Merge with existing state, only add new keys (preserve user's toggle state)
      const merged = { ...prev }
      Object.keys(initialVisibility).forEach(key => {
        if (!(key in merged)) {
          merged[key] = initialVisibility[key]
        }
      })
      return merged
    })
  }, [selectedCompetitors, expandedRow]) // Initialize when row expands or competitors change
  
  // Toggle legend visibility - same logic as Rate Evolution modal
  const toggleLegendVisibility = useCallback((dataKey: string) => {
    setLegendVisibility(prev => {
      // Toggle: true -> false, false/undefined -> true
      // Default to true if not set (visible by default)
      const currentValue = prev[dataKey] !== false
      return {
        ...prev,
        [dataKey]: !currentValue
      }
    })
  }, [])

  // Memoize graph data generation to prevent auto-refresh
  // Only regenerate when expandedRow, selectedCompetitors, or row data changes
  const generateDailyDataForMonth = useCallback((row: RateChangesData, monthStr: string) => {
    const monthMatch = monthStr.match(/^([A-Za-z]{3})'(\d{2})$/)
    if (!monthMatch) return null

    const [, monthAbbr, yearStr] = monthMatch
    const year = 2000 + parseInt(yearStr)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthIndex = monthNames.indexOf(monthAbbr)
    if (monthIndex === -1) return null

    const monthStart = new Date(year, monthIndex, 1)
    const daysInMonth = getDaysInMonth(monthStart)

    const allHotels = getAllCompetitorHotels()
    const selectedHotelsData = selectedCompetitors.length > 0
      ? selectedCompetitors.map(id => allHotels.find(h => h.id === id)).filter(Boolean)
      : competitorHotels.slice(0, 3).map(h => ({ id: 0, name: h.name }))

    // Use a seed based on month and row data for consistent random values
    const seed = row.subscriber + (row.blessHotelIbiza || 0) + monthIndex
    let seedValue = seed

    // Simple seeded random function for consistent data generation
    const seededRandom = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280
      return seedValue / 233280
    }

    const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, monthIndex, i + 1)
      const dayOfMonth = i + 1
      const dayName = format(date, 'EEE')
      const dateLabel = `${dayOfMonth}`
      
      const baseChanges = row.subscriber
      const baseRate = 350 + seededRandom() * 100

      const dataPoint: any = {
        date: dateLabel,
        dayName,
        fullDate: format(date, 'EEE, d MMM yyyy'),
        dayOfMonth,
        "Subscriber Cheapest Rate": Math.floor(baseRate)
      }

      dataPoint["Subscriber Changes"] = Math.floor(baseChanges + (seededRandom() * 40 - 20))

      selectedHotelsData.forEach((hotel, index) => {
        if (hotel) {
          const dataKey = `${hotel.name} Changes`
          const hotelBaseValue = row.blessHotelIbiza || Math.floor(seededRandom() * 4000)
          dataPoint[dataKey] = Math.floor(hotelBaseValue + (seededRandom() * 40 - 20))

          const cheapestRateKey = `${hotel.name} Cheapest Rate`
          let competitorBaseRate: number

          if (hotel.name === "Grand Plaza Hotel & Conference Center") {
            competitorBaseRate = 1000000000 + seededRandom() * 8999999999
          } else {
            competitorBaseRate = 300 + (index * 25) + seededRandom() * 100
          }

          dataPoint[cheapestRateKey] = Math.floor(competitorBaseRate)
        }
      })

      return dataPoint
    })

    return { dailyData, monthAbbr, daysInMonth, selectedHotelsData }
  }, [selectedCompetitors])

  // Memoize the expanded graph data
  const expandedGraphData = useMemo(() => {
    if (!expandedRow) return null
    const row = defaultRateChangesData.find(r => r.month === expandedRow)
    if (!row) return null
    return generateDailyDataForMonth(row, expandedRow)
  }, [expandedRow, generateDailyDataForMonth])
 
  // Calculate columns per page based on screen size - only handle resize events
  // Initial value is already set correctly via useState initializer
  useEffect(() => {
    const updateColumnsPerPage = () => {
      if (typeof window === 'undefined') return
      
      const width = window.innerWidth
      setScreenWidth(width)
      setColumnsPerPage(calculateColumnsPerPage(width))
    }

    // Only add resize listener, initial calculation is already done
    window.addEventListener('resize', updateColumnsPerPage)
    return () => window.removeEventListener('resize', updateColumnsPerPage)
  }, [])

  const toggleRowExpansion = (month: string) => {
    setExpandedRow(prev => prev === month ? null : month)
  }

  // Helper function to remove currency symbol from rate range
  const removeCurrencyFromRateRange = (rateRange: string): string => {
    return rateRange.replace(/€/g, '').trim()
  }

  // Get selected competitors based on dropdown selection
  const allHotels = getAllCompetitorHotels()
  const selectedCompetitorHotels: HotelData[] = selectedCompetitors.length > 0
    ? selectedCompetitors
        .map(id => allHotels.find(h => h.id === id))
        .filter(Boolean)
        .map(hotel => {
          // Set rate range based on hotel name - Grand Plaza uses rates from rates table (1B - 10B)
          let avgRateRange = "€0 - €800" // Default rate range
          if (hotel!.name === "Grand Plaza Hotel & Conference Center") {
            avgRateRange = "€1,000,000,000 - €9,999,999,999"
          }
          return {
            name: hotel!.name,
            avgRateRange
          }
        })
    : competitorHotels // Fallback to all if none selected

  // Reset pagination when competitors change
  useEffect(() => {
    setCompetitorPage(0)
  }, [selectedCompetitors.length])

  // Calculate pagination (exclude Subscriber - it's always visible)
  const totalCompetitors = selectedCompetitorHotels.length
  const totalPages = Math.ceil(totalCompetitors / columnsPerPage)
  const startIndex = competitorPage * columnsPerPage
  const endIndex = Math.min(startIndex + columnsPerPage, totalCompetitors)
  const visibleCompetitors = selectedCompetitorHotels.slice(startIndex, endIndex)
  
  // Fill remaining columns with empty placeholders if needed
  const remainingColumns = columnsPerPage - visibleCompetitors.length
  const emptyColumns = remainingColumns > 0 
    ? Array(remainingColumns).fill(null).map((_, i) => ({ 
        id: `empty-${i}`, 
        name: "", 
        avgRateRange: "" 
      }))
    : []
  
  // Always show Subscriber first, then paginated competitors, then empty placeholders
  const visibleHotels = [subscriberHotel, ...visibleCompetitors, ...emptyColumns]

  const handlePreviousPage = () => {
    if (competitorPage > 0) {
      setCompetitorPage(prev => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (competitorPage < totalPages - 1) {
      setCompetitorPage(prev => prev + 1)
    }
  }

  const needsPagination = totalCompetitors > columnsPerPage

  // Count total changes
  const totalChanges = defaultRateChangesData.reduce((sum, row) => {
    return sum + (row.subscriber > 0 ? 1 : 0) +
           (row.blessHotelIbiza > 0 ? 1 : 0) +
           (row.meIbiza > 0 ? 1 : 0) +
           (row.mondrianIbiza > 0 ? 1 : 0) +
           (row.wIbiza > 0 ? 1 : 0) +
           (row.hotel6 > 0 ? 1 : 0) +
           (row.hotel7 > 0 ? 1 : 0) +
           (row.hotel8 > 0 ? 1 : 0) +
           (row.hotel9 > 0 ? 1 : 0) +
           (row.hotel10 > 0 ? 1 : 0) +
           (row.hotel11 > 0 ? 1 : 0) +
           (row.hotel12 > 0 ? 1 : 0) +
           (row.hotel13 > 0 ? 1 : 0) +
           (row.hotel14 > 0 ? 1 : 0)
  }, 0)

  return (
    <div className={cn("w-full", className)}>
      {/* White Main Container */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        {/* Header Section with Heading, Legends, and Pagination */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-start justify-between mb-1">
            {/* Left Side - Heading and Description */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Rate Changes
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-sm bg-slate-800 text-white border-slate-700">
                      <p className="text-sm">
                        This section shows the rate changes for different hotels and competitors over time, helping identify leaders and laggards by number of changes.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Shows leaders and laggards by number of changes.
                    </p>
            </div>

            {/* Right Side - Legends and Pagination */}
            <div className="flex flex-col items-end gap-4">
                  {/* All Legends in Single Row */}
                  <div className="flex items-center gap-4">
                    {/* Min/Max Change Legend Group */}
                    <div className="flex items-center gap-2">
                      {/* Intersecting red and green dots */}
                      <div className="relative w-3 h-3">
                        <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full transform translate-x-1.5"></div>
                      </div>
                      <span className="text-xs text-gray-700 dark:text-gray-300">Min/Max change</span>
                      <div className="relative group">
                        <Info className="w-3 h-3 text-gray-900 dark:text-gray-100 cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                          <div className="mb-1">
                            <span className="text-green-400">Min (green)</span> / <span className="text-red-400">Maximum (red)</span> number of changes within selected Competitors
                          </div>
                          <div>
                            <span className="text-green-400">Min (green)</span> / <span className="text-red-400">Maximum (red)</span> number of changes within selected Months
                          </div>
                          <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* No. of changes: 0 with light grey swatch */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        No. of changes: {totalChanges}
                      </span>
                      <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
                    </div>
                    
                    {/* Min - Max range with 3 blue shade swatches */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-700 dark:text-gray-300">Min</span>
                      <div className="flex items-center gap-1">
                        {/* Light blue */}
                        <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 rounded-sm"></div>
                        {/* Medium blue (increased by 1 level) */}
                        <div className="w-3 h-3 bg-blue-300 dark:bg-blue-700/60 rounded-sm"></div>
                        {/* Dark blue (increased by 2 levels) */}
                        <div className="w-3 h-3 bg-blue-600 dark:bg-blue-500/80 rounded-sm"></div>
                      </div>
                      <span className="text-xs text-gray-700 dark:text-gray-300">Max</span>
                    </div>
                  </div>

                     {/* Pagination Controls */}
                     {needsPagination && (
                       <div className="flex items-center gap-2">
                         <span className="text-xs text-gray-600 dark:text-gray-400">
                           Resolution: {screenWidth}px (cols:{columnsPerPage})
                         </span>
                         <span className="text-xs text-gray-600 dark:text-gray-400">
                           Page {competitorPage + 1} of {totalPages}
                         </span>
                  <div className="relative group">
                    <button
                      onClick={handlePreviousPage}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          if (competitorPage > 0) handlePreviousPage()
                        }
                      }}
                      disabled={competitorPage === 0}
                      aria-label="Previous page of competitors"
                      className={cn(
                        "p-1 rounded-md border transition-colors focus:outline-none",
                        competitorPage === 0
                          ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                          : "border-gray-300 hover:bg-gray-50 text-gray-700 bg-white dark:bg-slate-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300"
                      )}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {competitorPage > 0 && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        Previous
                      </div>
                    )}
                  </div>
                  <div className="relative group">
                    <button
                      onClick={handleNextPage}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          if (competitorPage < totalPages - 1) handleNextPage()
                        }
                      }}
                      disabled={competitorPage >= totalPages - 1}
                      aria-label="Next page of competitors"
                      className={cn(
                        "p-1 rounded-md border transition-colors focus:outline-none",
                        competitorPage >= totalPages - 1
                          ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                          : "border-gray-300 hover:bg-gray-50 text-gray-700 bg-white dark:bg-slate-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300"
                      )}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    {competitorPage < totalPages - 1 && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        Next
                      </div>
                    )}
                  </div>
                       </div>
                     )}
            </div>
          </div>
        </div>

        {/* Table - Edge to Edge */}
        <div className="border-t border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
              {/* First header row with content */}
              <tr>
                <th className="pl-[22px] pr-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 align-top w-[146px]">
                  Check-in<br/>month
                </th>
                {/* Subscriber - Always visible */}
                <th
                  key={subscriberHotel.name}
                  className={cn(
                    "px-3 py-2 text-center text-xs font-semibold w-[180px] border-r border-gray-200 dark:border-gray-700 align-top",
                    // Subscriber: green highlight with light green background
                    "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
                  )}
                >
                  <div className="break-words flex items-center justify-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"></div>
                    <span>
                      {subscriberHotel.name.length > 32 
                        ? `${subscriberHotel.name.substring(0, 32)}...` 
                        : subscriberHotel.name}
                    </span>
                  </div>
                </th>
                {/* Competitor Hotels - Paginated */}
                 {visibleCompetitors.map((hotel, index) => {
                   // Mondrian Ibiza: red highlight
                   const isMondrianIbiza = hotel.name === "Mondrian Ibiza"
                   
                   return (
                    <th
                      key={hotel.name}
                      className={cn(
                        "px-3 py-2 text-center text-xs font-semibold w-[180px] border-r border-gray-200 dark:border-gray-700 align-top",
                        isMondrianIbiza 
                          ? "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
                          : "text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700"
                      )}
                    >
                       <div className="break-words flex items-center justify-center gap-1.5">
                         {isMondrianIbiza && (
                           <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></div>
                         )}
                         <span>
                           {hotel.name.length > 32 
                             ? `${hotel.name.substring(0, 32)}...` 
                             : hotel.name}
                         </span>
                       </div>
                     </th>
                   )
                 })}
                {/* Empty columns to fill remaining slots */}
                {emptyColumns.map((empty, index) => (
                  <th
                    key={empty.id}
                    className="px-3 py-2 w-[180px] bg-white dark:bg-gray-900"
                  >
                    <div className="h-full"></div>
                  </th>
                ))}
              </tr>
              {/* Second header row with price ranges and labels */}
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-3 py-2 h-8 border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
                  <span>&nbsp;</span>
                </th>
                {/* Subscriber - Always visible */}
                <th className="px-3 py-2 h-8 w-[180px] border-r border-gray-200 dark:border-gray-700 bg-green-100 dark:bg-green-900/30">
                  <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {removeCurrencyFromRateRange(subscriberHotel.avgRateRange)}
                  </div>
                  <div className="text-[10px] font-normal text-gray-500 dark:text-gray-400">
                    Avg. Rate Range (€)
                  </div>
                </th>
                {/* Competitor Hotels - Paginated */}
                {visibleCompetitors.map((hotel, index) => {
                  const isMondrianIbiza = hotel.name === "Mondrian Ibiza"
                  
                  return (
                    <th
                      key={`price-${hotel.name}`}
                      className={cn(
                        "px-3 py-2 h-8 w-[180px] border-r border-gray-200 dark:border-gray-700",
                        isMondrianIbiza 
                          ? "bg-red-100 dark:bg-red-900/30"
                          : "bg-gray-100 dark:bg-gray-700"
                      )}
                    >
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {removeCurrencyFromRateRange(hotel.avgRateRange)}
                      </div>
                      <div className="text-[10px] font-normal text-gray-500 dark:text-gray-400">
                        Avg. Rate Range (€)
                      </div>
                    </th>
                  )
                })}
                {/* Empty columns to fill remaining slots */}
                {emptyColumns.map((empty, index) => (
                  <th
                    key={`empty-header-${empty.id}`}
                    className="px-3 py-2 h-8 w-[180px] bg-white dark:bg-gray-900"
                  >
                    <span>&nbsp;</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {defaultRateChangesData.map((row, rowIndex) => {
                const isExpanded = expandedRow === row.month
                const isLastRow = rowIndex === defaultRateChangesData.length - 1
                const isLastRowAndNotExpanded = isLastRow && !isExpanded
                
                return (
                  <React.Fragment key={row.month}>
                    {/* Main Table Row */}
                    <tr
                      className={cn(
                        "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                        isExpanded && "bg-blue-50 dark:bg-blue-900/20"
                      )}
                    >
                      {/* Check-in month column with expand button */}
                      <td className={cn(
                        "pl-[22px] pr-3 py-2 border-r border-gray-200 dark:border-gray-700 w-[146px]",
                        // August'25: light green background
                        row.month === "Aug'25" && "bg-green-100 dark:bg-green-900/30",
                        // February'25: light red background
                        row.month === "Feb'25" && "bg-red-100 dark:bg-red-900/30",
                        isLastRowAndNotExpanded && "rounded-bl-lg"
                      )}>
                        <button
                          onClick={() => toggleRowExpansion(row.month)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              toggleRowExpansion(row.month)
                            }
                          }}
                          aria-label={isExpanded ? `Collapse ${row.month} rate changes graph` : `Expand ${row.month} rate changes graph`}
                          aria-expanded={isExpanded}
                          className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-full focus:outline-none"
                        >
                          {/* Expand/collapse icon - first */}
                          <div className="w-4 h-4 border border-blue-600 dark:border-blue-400 rounded-full flex items-center justify-center">
                            {isExpanded ? (
                              <ChevronUp className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" strokeWidth="2.5" />
                            ) : (
                              <ChevronDown className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" strokeWidth="2.5" />
                            )}
                          </div>
                          {/* Month name - second */}
                          <span className={cn(
                            "font-medium text-xs",
                            // August'25: green highlight
                            row.month === "Aug'25" && "text-green-600 dark:text-green-400",
                            // February'25: red highlight
                            row.month === "Feb'25" && "text-red-600 dark:text-red-400",
                            // Default color
                            row.month !== "Aug'25" && row.month !== "Feb'25" && "text-gray-900 dark:text-gray-100"
                          )}>
                            {row.month}
                          </span>
                          {/* Red/green dot - third */}
                          {(row.month === "Aug'25" || row.month === "Feb'25") && (
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              row.month === "Aug'25" && "bg-green-500",
                              row.month === "Feb'25" && "bg-red-500"
                            )}></div>
                          )}
                        </button>
                      </td>
                      
                      {/* Subscriber - Always visible */}
                      <td
                        className={cn(
                          "px-3 py-2 text-center w-[180px] border-r border-gray-200 dark:border-gray-700",
                          getCellColor(row.subscriber, min, max)
                        )}
                      >
                        {row.subscriber > 0 ? (
                          <TooltipProvider delayDuration={0}>
                            <Tooltip delayDuration={0} disableHoverableContent>
                              <TooltipTrigger asChild>
                                <span className={cn(
                                  "font-medium text-xs cursor-pointer",
                                  getCellTextColor(row.subscriber, min, max)
                                )}>
                                  {row.subscriber}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="top"
                                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-4 min-w-[340px] max-w-[340px] z-[50]"
                                sideOffset={12}
                                avoidCollisions={true}
                                collisionPadding={20}
                              >
                                <RateChangesTooltipContent row={row} hotelName={subscriberHotel.name} />
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="font-medium text-xs text-gray-900 dark:text-gray-100">
                            --
                          </span>
                        )}
                      </td>
                      
                      {/* Competitor Hotels - Paginated */}
                      {visibleCompetitors.map((hotel, index) => {
                        // Helper function to get rate change value for a hotel
                        const getHotelValue = (hotelName: string): number => {
                          // Map old hotel names to data keys
                          const nameToKey: Record<string, keyof RateChangesData> = {
                            "Bless Hotel Ibiza": "blessHotelIbiza",
                            "ME Ibiza - The Leading Hotels of...": "meIbiza",
                            "Mondrian Ibiza": "mondrianIbiza",
                            "W Ibiza": "wIbiza"
                          }
                          
                          // Check if it's a known hotel with data
                          if (nameToKey[hotelName]) {
                            const dataValue = row[nameToKey[hotelName]]
                            return typeof dataValue === 'number' ? dataValue : 0
                          }
                          
                          // For new selected competitors, generate sample data based on hotel index
                          // This ensures each hotel has consistent data across months
                          const hotelIndex = selectedCompetitorHotels.findIndex(h => h.name === hotelName)
                          const baseValue = 2000 + (hotelIndex * 200) + (rowIndex * 100)
                          return baseValue
                        }
                        
                        const hotelValue = getHotelValue(hotel.name)
                        
                        const dataKey = hotel.name === "Bless Hotel Ibiza"
                          ? "blessHotelIbiza"
                          : hotel.name === "ME Ibiza - The Leading Hotels of..."
                          ? "meIbiza"
                          : hotel.name === "Mondrian Ibiza"
                          ? "mondrianIbiza"
                          : hotel.name === "W Ibiza"
                          ? "wIbiza"
                          : hotel.name === "Grand Hotel Ibiza"
                          ? "hotel6"
                          : hotel.name === "Paradise Beach Resort"
                          ? "hotel7"
                          : hotel.name === "Sunset View Hotel"
                          ? "hotel8"
                          : hotel.name === "Ocean Breeze Resort"
                          ? "hotel9"
                          : hotel.name === "Crystal Bay Hotel"
                          ? "hotel10"
                          : hotel.name === "Seaside Luxury Inn"
                          ? "hotel11"
                          : hotel.name === "Island Paradise Hotel"
                          ? "hotel12"
                          : hotel.name === "Coastal View Resort"
                          ? "hotel13"
                          : "hotel14"
                        
                        const value = hotelValue
                        const isLastCompetitorColumn = index === visibleCompetitors.length - 1 && emptyColumns.length === 0

                        return (
                          <td
                            key={hotel.name}
                            className={cn(
                              "px-3 py-2 text-center w-[180px] border-r border-gray-200 dark:border-gray-700",
                              getCellColor(value, min, max),
                              isLastRowAndNotExpanded && isLastCompetitorColumn && "rounded-br-lg"
                            )}
                          >
                            {value > 0 ? (
                              <TooltipProvider delayDuration={0}>
                                <Tooltip delayDuration={0} disableHoverableContent>
                                  <TooltipTrigger asChild>
                                    <span className={cn(
                                      "font-medium text-xs cursor-pointer",
                                      getCellTextColor(value, min, max)
                                    )}>
                                      {value}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent 
                                    side="top"
                                    className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-4 min-w-[340px] max-w-[340px] z-[50]"
                                    sideOffset={12}
                                    avoidCollisions={true}
                                    collisionPadding={20}
                                  >
                                    <RateChangesTooltipContent row={row} hotelName={hotel.name} />
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span className="font-medium text-xs text-gray-900 dark:text-gray-100">
                                --
                              </span>
                            )}
                          </td>
                        )
                      })}
                      {/* Empty columns to fill remaining slots */}
                      {emptyColumns.map((empty, index) => {
                        const isLastEmptyColumn = index === emptyColumns.length - 1
                        return (
                          <td
                            key={empty.id}
                            className={cn(
                              "px-3 py-2 w-[180px] bg-white dark:bg-gray-900",
                              isLastRowAndNotExpanded && isLastEmptyColumn && "rounded-br-lg"
                            )}
                          >
                            <span></span>
                          </td>
                        )
                          })}
                    </tr>

                    {/* Expanded Row with Chart */}
                    {isExpanded && (() => {
                      // Parse the month string (e.g., "Aug'25") and generate daily data
                      const monthStr = row.month
                      const monthMatch = monthStr.match(/^([A-Za-z]{3})'(\d{2})$/)
                      
                      if (!monthMatch) {
                        return null
                      }
                      
                      const [, monthAbbr, yearStr] = monthMatch
                      const year = 2000 + parseInt(yearStr)
                      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                      const monthIndex = monthNames.indexOf(monthAbbr)
                      
                      if (monthIndex === -1) {
                        return null
                      }
                      
                      // Generate date for the first day of the month
                      const monthStart = new Date(year, monthIndex, 1)
                      const daysInMonth = getDaysInMonth(monthStart)
                      
                      // Get selected hotels data - use same logic as table
                      const allHotels = getAllCompetitorHotels()
                      const selectedHotelsData = selectedCompetitors.length > 0
                        ? selectedCompetitors.map(id => allHotels.find(h => h.id === id)).filter(Boolean)
                        : competitorHotels.slice(0, 3).map(h => ({ id: 0, name: h.name })) // Default to match table's default
                      
                      // Generate color palette for hotels
                      const colors = [
                        "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
                        "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6366f1"
                      ]
                      
                      // Generate all days for this month
                      const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
                        const date = new Date(year, monthIndex, i + 1)
                        const dayOfMonth = i + 1
                        const dayName = format(date, 'EEE')
                        const dateLabel = `${dayOfMonth}`
                        
                        // Generate sample data for each day
                        // Use the row's month data as base and add variation
                        const baseChanges = row.subscriber
                        const baseRate = 350 + Math.random() * 100 // Random rate between 350-450
                        
                        const dataPoint: any = {
                          date: dateLabel,
                          dayName,
                          fullDate: format(date, 'EEE, d MMM yyyy'),
                          dayOfMonth,
                          // Subscriber Cheapest Rate (for right Y-axis)
                          "Subscriber Cheapest Rate": Math.floor(baseRate)
                        }
                        
                        // Always include Subscriber Changes
                        dataPoint["Subscriber Changes"] = Math.floor(baseChanges + (Math.random() * 40 - 20))
                        
                        // Add changes data for each selected hotel
                        selectedHotelsData.forEach((hotel, index) => {
                          if (hotel) {
                            const dataKey = `${hotel.name} Changes`
                            // Use a base value from row data or generate random
                            const hotelBaseValue = row.blessHotelIbiza || Math.floor(Math.random() * 4000)
                            dataPoint[dataKey] = Math.floor(hotelBaseValue + (Math.random() * 40 - 20))
                            
                            // Add cheapest rate for competitor hotels (sample data)
                            // TODO: Replace this with actual API data or configuration
                            // Configuration Section: Competitor Hotel Cheapest Rates
                            // You can modify the rate calculation below to use:
                            // - API data: dataPoint[cheapestRateKey] = hotelData.cheapestRate
                            // - Fixed values: dataPoint[cheapestRateKey] = 400
                            // - Row data: dataPoint[cheapestRateKey] = row.hotelRateData?.[hotel.id]
                            
                            const cheapestRateKey = `${hotel.name} Cheapest Rate`
                            let competitorBaseRate: number
                            
                            // Special rate range for Grand Plaza Hotel & Conference Center
                            if (hotel.name === "Grand Plaza Hotel & Conference Center") {
                              // Rate range: up to 10 digits (9,999,999,999)
                              // Generate values between 1,000,000,000 to 9,999,999,999
                              competitorBaseRate = 1000000000 + Math.random() * 8999999999
                            } else {
                              // Base rate varies between 300-500 for other competitor hotels
                              competitorBaseRate = 300 + (index * 25) + Math.random() * 100
                            }
                            
                            dataPoint[cheapestRateKey] = Math.floor(competitorBaseRate)
                          }
                        })
                        
                        return dataPoint
                      })
                      
                      // Calculate Y-axis domains - include all hotel changes
                      const allChanges = dailyData.flatMap(d => {
                        const changes = [d["Subscriber Changes"]]
                        selectedHotelsData.forEach(hotel => {
                          if (hotel) {
                            const key = `${hotel.name} Changes`
                            if (d[key] !== undefined) {
                              changes.push(d[key])
                            }
                          }
                        })
                        return changes
                      })
                      const minChanges = Math.max(0, Math.min(...allChanges) - 10)
                      const maxChanges = Math.max(...allChanges) + 10
                      
                      const allRates = dailyData.map(d => d["Subscriber Cheapest Rate"])
                      // Use actual data range for Y-axis so bars are visible
                      const minRate = Math.max(0, Math.min(...allRates) - 50)
                      const maxRate = Math.max(...allRates) + 50
                      
                      // Calculate top 3 dates with maximum total changes
                      const dateTotals = dailyData.map(d => {
                        let totalChanges = d["Subscriber Changes"] || 0
                        selectedHotelsData.forEach(hotel => {
                          if (hotel) {
                            const key = `${hotel.name} Changes`
                            totalChanges += d[key] || 0
                          }
                        })
                        return {
                          dayOfMonth: d.dayOfMonth,
                          totalChanges
                        }
                      })
                      
                      // Sort by total changes descending and get top 3 dates
                      const top3Dates = dateTotals
                        .sort((a, b) => b.totalChanges - a.totalChanges)
                        .slice(0, 3)
                        .map(d => d.dayOfMonth)
                      
                      return (
                        <tr>
                          <td colSpan={visibleHotels.length + 1} className="px-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700" style={{ paddingTop: '13.6px', paddingBottom: '13.6px' }}>
                            <div className="w-full">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 px-6">
                                Rate Changes Graph - {monthStr}
                              </h4>
                              <div className="h-[400px] w-[99%] -ml-[5px] relative pointer-events-auto">
                                <ResponsiveContainer width="100%" height="106%">
                                  <ComposedChart
                                    data={dailyData}
                                    margin={{ top: 20, right: 20, left: 50, bottom: 20 }}
                                  >
                                    <CartesianGrid 
                                      strokeDasharray="3 3" 
                                      className="opacity-15 dark:opacity-10" 
                                      stroke="#e5e7eb"
                                      vertical={false}
                                    />
                                    <XAxis
                                      dataKey="date"
                                      className="text-xs"
                                      tick={(props) => {
                                        // Find the data for this specific date
                                        const dayOfMonth = parseInt(props.payload?.value || '0', 10)
                                        const dateData = dailyData.find(d => d.dayOfMonth === dayOfMonth)
                                        return (
                                          <CustomXAxisTick
                                            {...props}
                                            monthName={monthAbbr}
                                            lastDate={daysInMonth}
                                            topDates={top3Dates}
                                            dateData={dateData}
                                            legendVisibility={legendVisibility}
                                            selectedHotelsData={selectedHotelsData}
                                          />
                                        )
                                      }}
                                      height={70}
                                      axisLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                                      tickLine={false}
                                    />
                                    {/* Left Y-Axis - No. of Changes */}
                                    <YAxis
                                      yAxisId="changes"
                                      orientation="left"
                                      label={{ 
                                        value: "No. of Changes", 
                                        angle: -90, 
                                        position: "insideLeft",
                                        style: { textAnchor: "middle", fontSize: 11, fill: "#4b5563" }
                                      }}
                                      domain={[minChanges, maxChanges]}
                                      tick={{ fontSize: 10, fill: "#4b5563" }}
                                      axisLine={false}
                                      tickLine={false}
                                    />
                                    {/* Right Y-Axis - Subscriber Cheapest Rate */}
                                    <YAxis
                                      yAxisId="rate"
                                      orientation="right"
                                      label={{ 
                                        value: "Subscriber Cheapest Rate (€)", 
                                        angle: 90, 
                                        position: "insideRight",
                                        style: { textAnchor: "middle", fontSize: 11, fill: "#4b5563" }
                                      }}
                                      domain={[minRate, maxRate]}
                                      tick={{ fontSize: 10, fill: "#4b5563" }}
                                      tickFormatter={(value) => {
                                        // Format values appropriately based on size (no currency symbol)
                                        if (value >= 1000000) {
                                          // For values >= 1 million, show in millions
                                          return `${Math.round(value / 1000000)}M`
                                        } else {
                                          // For smaller values, show with thousand separators
                                          return `${Math.round(value).toLocaleString('en-US')}`
                                        }
                                      }}
                                      axisLine={false}
                                      tickLine={false}
                                    />
                                    <RechartsTooltip
                                      content={({ active, payload, label, coordinate }: any) => {
                                        if (!active || !payload || !payload.length) return null
                                        
                                        const data = payload[0]?.payload
                                        const chartWidth = 900
                                        const isNearRightEdge = coordinate && coordinate.x > (chartWidth * 0.6)
                                        
                                        // Horizontal positioning - position tooltip at data point X coordinate
                                        let horizontalTransform = ''
                                        let horizontalLeft = ''
                                        if (coordinate && coordinate.x !== undefined) {
                                          if (isNearRightEdge) {
                                            // Position tooltip to the left of the data point
                                            horizontalTransform = 'translateX(-100%)'
                                            horizontalLeft = `${coordinate.x - 10}px`
                                          } else {
                                            // Position tooltip to the right of the data point
                                            horizontalTransform = 'translateX(0%)'
                                            horizontalLeft = `${coordinate.x + 10}px`
                                          }
                                        }
                                        
                                        // Vertical positioning - center tooltip with mouse pointer
                                        let tooltipStyle: any = {}
                                        if (coordinate && coordinate.x !== undefined && coordinate.y !== undefined) {
                                          // Position tooltip at data point coordinates
                                          tooltipStyle = {
                                            transform: `${horizontalTransform} translateY(-50%)`,
                                            left: horizontalLeft,
                                            top: `${coordinate.y}px`,
                                            position: 'absolute'
                                          }
                                        } else {
                                          // Fallback to previous style if coordinates not available
                                          tooltipStyle = isNearRightEdge ? {
                                            transform: 'translateX(-100%)',
                                            marginLeft: '-10px'
                                          } : {
                                            transform: 'translateX(0%)',
                                            marginLeft: '10px'
                                          }
                                        }
                                        
                                        // Group data by property name
                                        const groupedData: Record<string, { name: string; rateChanges?: number; cheapestRate?: number; color?: string; isSubscriber?: boolean; isBar?: boolean }> = {}
                                        
                                        payload.forEach((entry: any) => {
                                          const isBar = entry.dataKey === "Subscriber Cheapest Rate"
                                          const isSubscriber = entry.dataKey === "Subscriber Changes" || entry.dataKey === "Subscriber Cheapest Rate"
                                          let propertyName = entry.name || entry.dataKey
                                          
                                          // Clean up property name
                                          if (propertyName === "Subscriber Cheapest Rate") {
                                            propertyName = "Subscriber"
                                          } else if (propertyName.endsWith(" Changes")) {
                                            propertyName = propertyName.replace(" Changes", "")
                                          }
                                          
                                          if (!groupedData[propertyName]) {
                                            groupedData[propertyName] = {
                                              name: propertyName,
                                              color: entry.color,
                                              isSubscriber,
                                              isBar: false
                                            }
                                          }
                                          
                                          if (isBar) {
                                            groupedData[propertyName].cheapestRate = entry.value
                                          } else {
                                            groupedData[propertyName].rateChanges = entry.value
                                            // Prefer line color (for changes) over bar color
                                            groupedData[propertyName].color = entry.color
                                            
                                            // Also check if this competitor hotel has cheapest rate data in the data payload
                                            if (!isSubscriber && data) {
                                              const cheapestRateKey = `${propertyName} Cheapest Rate`
                                              if (data[cheapestRateKey] !== undefined) {
                                                groupedData[propertyName].cheapestRate = data[cheapestRateKey]
                                              }
                                            }
                                          }
                                        })
                                        
                                        const dataRows = Object.values(groupedData)
                                        
                                        return (
                                          <div 
                                            className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-3 min-w-[290px] max-w-max z-[10001] relative"
                                            style={tooltipStyle}
                                          >
                                            {/* Date Heading */}
                                            <div className="mb-2">
                                              <h3 className="text-gray-900 dark:text-white">
                                                <span className="text-sm font-bold">
                                                  {data?.fullDate || label}
                                                </span>
                                              </h3>
                                            </div>
                                            
                                            {/* Table Structure */}
                                            <table className="w-full border-separate border-spacing-0">
                                              <thead>
                                                <tr>
                                                  <th className="text-left text-[11px] font-medium text-gray-500 dark:text-slate-400 pb-1 pr-[2px] align-top">
                                                    Property
                                                  </th>
                                                  <th className="text-right text-[11px] font-medium text-gray-500 dark:text-slate-400 pb-1 w-[90px] pr-[10px] align-top">
                                                    No. of<br/>Changes
                                                  </th>
                                                  <th className="text-right text-[11px] font-medium text-gray-500 dark:text-slate-400 pb-1 pr-1 whitespace-nowrap align-top">
                                                    Cheapest<br/>Rate (€)
                                                  </th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {dataRows.map((row, index: number) => {
                                                  const isSubscriber = row.isSubscriber || false
                                                  const isFirstRow = index === 0
                                                  const isLastRow = index === dataRows.length - 1
                                                  
                                                  return (
                                                    <tr
                                                      key={index}
                                                      className={isSubscriber ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
                                                    >
                                                      {/* Property Column */}
                                                      <td 
                                                        className={`py-1.5 pl-1 pr-[2px] ${
                                                          isSubscriber 
                                                            ? `border-l border-t border-b border-blue-200 dark:border-blue-700 rounded-tl-md rounded-bl-md` 
                                                            : ''
                                                        }`}
                                                      >
                                                        <div className="flex items-center gap-2">
                                                          <div
                                                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                                              row.rateChanges !== undefined ? 'border-2 border-white' : ''
                                                            }`}
                                                            style={{ backgroundColor: row.color }}
                                                          />
                                                          <div className={`text-xs font-medium whitespace-nowrap ${
                                                            isSubscriber ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-slate-100'
                                                          }`}>
                                                            {row.name.length > 28 ? `${row.name.substring(0, 25)}...` : row.name}
                                                          </div>
                                                        </div>
                                                      </td>
                                                      
                                                      {/* # Changes Column */}
                                                      <td className={`py-1.5 text-right w-[90px] pr-[10px] ${isSubscriber ? 'px-1 border-t border-b border-blue-200 dark:border-blue-700' : ''}`}>
                                                        <div className={`text-xs font-bold ${
                                                          isSubscriber ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-slate-100'
                                                        }`}>
                                                          {row.rateChanges !== undefined ? row.rateChanges : '--'}
                                                        </div>
                                                      </td>
                                                      
                                                      {/* Cheapest Column */}
                                                      <td 
                                                        className={`py-1.5 text-right pr-1 whitespace-nowrap ${
                                                          isSubscriber 
                                                            ? `border-r border-t border-b border-blue-200 dark:border-blue-700 ${isFirstRow ? 'rounded-tr-md' : ''} rounded-br-md` 
                                                            : ''
                                                        }`}
                                                      >
                                                        <div className={`text-xs font-bold ${
                                                          isSubscriber ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-slate-100'
                                                        }`}>
                                                          {row.cheapestRate !== undefined 
                                                            ? (row.name === "Grand Plaza Hotel & Conference Center"
                                                              ? Math.round(row.cheapestRate).toLocaleString('en-US')
                                                              : (row.cheapestRate >= 1000000 
                                                                ? `${Math.round(row.cheapestRate / 1000000)}M`
                                                                : Math.round(row.cheapestRate).toLocaleString('en-US')))
                                                            : '--'}
                                                        </div>
                                                      </td>
                                                    </tr>
                                                  )
                                                })}
                                              </tbody>
                                            </table>
                                          </div>
                                        )
                                      }}
                                      allowEscapeViewBox={{ x: true, y: true }}
                                      offset={0}
                                      isAnimationActive={false}
                                      wrapperStyle={{
                                        zIndex: 10000,
                                        pointerEvents: 'none'
                                      }}
                                    />
                                    <Legend 
                                      verticalAlign="bottom"
                                      height={36}
                                      iconType="line"
                                      wrapperStyle={{
                                        fontSize: '12px',
                                        paddingTop: '1px',
                                        paddingBottom: '0px',
                                        bottom: '39px',
                                        cursor: 'pointer',
                                        lineHeight: '22px',
                                        height: '70px',
                                        maxHeight: '70px',
                                        overflowY: 'auto',
                                        overflowX: 'hidden'
                                      }}
                                      iconSize={12}
                                      onClick={(event: any) => {
                                        if (event.dataKey && typeof event.dataKey === 'string') {
                                          // Toggle legend visibility - same logic as Rate Trends page
                                          toggleLegendVisibility(event.dataKey)
                                        }
                                      }}
                                      formatter={(value, entry: any) => {
                                        const dataKey = entry.dataKey as string
                                        // Check visibility - default to true if not explicitly false
                                        const isVisible = legendVisibility[dataKey] !== false
                                        
                                        // Use blue color for Subscriber Cheapest Rate legend when visible
                                        let textColor = isVisible ? (entry?.color || '#4b5563') : '#9ca3af'
                                        if (value === "Subscriber Cheapest Rate" && isVisible) {
                                          textColor = '#3b82f6'
                                        }
                                        
                                        // Truncate legend name after 28 characters
                                        const displayValue = typeof value === 'string' && value.length > 28
                                          ? `${value.substring(0, 28)}...`
                                          : value
                                        
                                        // Always return the legend item - never hide it
                                        return (
                                          <span style={{
                                            color: textColor,
                                            fontWeight: isVisible ? 500 : 400,
                                            textDecoration: isVisible ? 'none' : 'line-through',
                                            cursor: 'pointer',
                                            opacity: isVisible ? 1 : 0.6
                                          }}>
                                            {displayValue}
                                          </span>
                                        )
                                      }}
                                    />
                                    {/* Bar Chart for Subscriber Cheapest Rate */}
                                    <Bar
                                      yAxisId="rate"
                                      dataKey="Subscriber Cheapest Rate"
                                      fill="#93c5fd"
                                      opacity={0.7}
                                      name="Subscriber Cheapest Rate"
                                      hide={legendVisibility["Subscriber Cheapest Rate"] === false}
                                    />
                                    {/* Line Charts for No. of Changes */}
                                    {/* Subscriber Line */}
                                    <Line
                                      yAxisId="changes"
                                      type="monotone"
                                      dataKey="Subscriber Changes"
                                      stroke="#1e40af"
                                      strokeWidth={2}
                                      dot={{ r: 4 }}
                                      activeDot={{ r: 6 }}
                                      name="Subscriber"
                                      hide={legendVisibility["Subscriber Changes"] === false}
                                    />
                                    {/* Dynamic Lines for Selected Hotels */}
                                    {(() => {
                                      const allHotels = getAllCompetitorHotels()
                                      const selectedHotelsData = selectedCompetitors.length > 0
                                        ? selectedCompetitors.map(id => allHotels.find(h => h.id === id)).filter(Boolean)
                                        : [allHotels[0], allHotels[1], allHotels[2]]
                                      
                                      const colors = [
                                        "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
                                        "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6366f1"
                                      ]
                                      
                                      return selectedHotelsData.map((hotel, index) => {
                                        if (!hotel) return null
                                        const dataKey = `${hotel.name} Changes`
                                        
                                        return (
                                          <Line
                                            key={hotel.id}
                                            yAxisId="changes"
                                            type="monotone"
                                            dataKey={dataKey}
                                            stroke={colors[index % colors.length]}
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6 }}
                                            name={hotel.name}
                                            hide={legendVisibility[dataKey] === false}
                                          />
                                        )
                                      })
                                    })()}
                                  </ComposedChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    })()}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  )
}

