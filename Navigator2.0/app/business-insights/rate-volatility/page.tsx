"use client"

import { useState, useMemo, useCallback, useRef } from "react"
import React from "react"
import { useRouter } from "next/navigation"
import { format, endOfMonth, startOfMonth } from "date-fns"
import { Target, BarChart3, TrendingUp, Calendar, Info } from "lucide-react"
import { BusinessInsightsTabs } from "@/components/business-insights/business-insights-tabs"
import { RateVolatilityCheckinMonthsDatePicker } from "@/components/business-insights/rate-volatility-checkin-months-date-picker"
import { CompetitorsDropdown } from "@/components/business-insights/competitors-dropdown"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { BoxPlot } from "@/components/business-insights/rate-volatility-box-plot"

// Helper function to format numbers with international currency format (commas for thousands)
const formatCurrency = (value: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

// Business Insights Tab Configuration
const businessInsightsTabs = [
  { id: "market-insights", label: "Market Insights", icon: Target },
  { id: "rate-leaderboard", label: "Rate Leaderboard", icon: BarChart3 },
  { id: "rate-volatility", label: "Rate Volatility", icon: TrendingUp }
]

export default function RateVolatilityBusinessInsightsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("rate-volatility")
  
  // Filter states
  // Check-in Months - default to October 2025 (Oct'25)
  const getDefaultCheckinDates = () => {
    // October 2025 (month is 0-indexed, so 9 = October)
    const october2025 = new Date(2025, 9, 1) // October 1, 2025
    const october2025Start = startOfMonth(october2025)
    const october2025End = endOfMonth(october2025)
    return { 
      start: october2025Start,
      end: october2025End
    }
  }
  
  const defaultCheckinDates = getDefaultCheckinDates()
  const [checkinStartDate, setCheckinStartDate] = useState<Date | undefined>(defaultCheckinDates.start)
  const [checkinEndDate, setCheckinEndDate] = useState<Date | undefined>(defaultCheckinDates.end)
  
  // Shop Date Range - read-only, default to last 12 months (Nov'24 - Oct'25)
  const getShopDateRange = () => {
    // November 2024 (month is 0-indexed, so 10 = November)
    const november2024 = new Date(2024, 10, 1) // November 1, 2024
    // October 2025 (month is 0-indexed, so 9 = October)
    const october2025 = new Date(2025, 9, 1) // October 1, 2025
    return {
      start: startOfMonth(november2024),
      end: endOfMonth(october2025)
    }
  }
  
  const shopDateRange = getShopDateRange()
  const shopStartDate = shopDateRange.start
  const shopEndDate = shopDateRange.end
  
  // Competitors selection state - default to all Primary hotels selected
  const getDefaultCompetitors = () => {
    // Default Primary hotels (IDs 1-5 based on sample data)
    // This will be handled by the component itself, but we initialize empty
    return []
  }
  const [selectedCompetitors, setSelectedCompetitors] = useState<number[]>(getDefaultCompetitors())

  // Handle tab navigation
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "market-insights") {
      router.push("/business-insights")
    } else if (value === "rate-leaderboard") {
      router.push("/business-insights/rate-leaderboard")
    } else if (value === "rate-volatility") {
      router.push("/business-insights/rate-volatility")
    }
  }

  // Check-in Months date range handler
  const handleCheckinDateRangeChange = (newStartDate?: Date, newEndDate?: Date) => {
    if (newStartDate && newEndDate) {
      setCheckinStartDate(newStartDate)
      setCheckinEndDate(newEndDate)
      console.log(`📅 Check-in Months changed: ${format(newStartDate, "MMM''yy")} - ${format(newEndDate, "MMM''yy")}`)
    }
  }

  // Format shop date range for display
  const formatShopDateRange = () => {
    const formatMonth = (date: Date) => format(date, "MMM''yy")
    return `${formatMonth(shopStartDate)} - ${formatMonth(shopEndDate)}`
  }

  // Handle competitors selection
  const handleCompetitorsChange = (selectedHotels: number[]) => {
    setSelectedCompetitors(selectedHotels)
    console.log(`🏨 Selected competitors:`, selectedHotels)
  }

  // Rate Volatility graph state
  interface RateVolatilityData {
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

  const [hoveredHotel, setHoveredHotel] = useState<string | null>(null)
  const [tooltipData, setTooltipData] = useState<RateVolatilityData | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [tooltipSide, setTooltipSide] = useState<"left" | "right">("right")
  const currentHotelIndexRef = useRef<number | null>(null)

  // Get all competitor hotels from dropdown (matching the dropdown structure)
  const getAllCompetitorHotels = () => {
    return [
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
  }

  // Sample Rate Volatility data - mapped by hotel ID
  const getRateVolatilityDataForHotel = (hotelId: number, hotelName: string): RateVolatilityData => {
    // Generate sample data in 1000-5000 range based on hotel ID for consistency
    // Base rate between 2000-4000, variation between 200-600
    const baseRate = 2000 + (hotelId * 100) // Range: 2000-4400 (for IDs 0-24)
    const variation = 200 + (hotelId % 5) * 80 // Range: 200-520
    
    // Ensure values stay within 1000-5000 range
    const min = Math.max(1000, baseRate - variation * 2)
    const max = Math.min(5000, baseRate + variation * 3)
    const q1 = Math.max(1000, baseRate - variation)
    const q3 = Math.min(5000, baseRate + variation)
    const median = Math.max(1000, Math.min(5000, baseRate))
    const avgRangeMin = Math.max(1000, baseRate - variation * 0.5)
    const avgRangeMax = Math.min(5000, baseRate + variation * 0.5)
    
    return {
      name: hotelName,
      shortName: hotelName,
      min: min,
      max: max,
      q1: q1,
      q3: q3,
      median: median,
      avgRangeMin: avgRangeMin,
      avgRangeMax: avgRangeMax,
      observations: 20 + (hotelId % 10),
    }
  }

  // Filter rate volatility data based on selected competitors
  const filteredRateVolatilityData = useMemo(() => {
    if (selectedCompetitors.length === 0) {
      // If no competitors selected, return empty array or default to primary hotels
      const allHotels = getAllCompetitorHotels()
      const primaryHotels = allHotels.slice(0, 8) // Default to first 8 (Primary group)
      return primaryHotels.map(hotel => getRateVolatilityDataForHotel(hotel.id, hotel.name))
    }

    const allHotels = getAllCompetitorHotels()
    return selectedCompetitors
      .map(id => {
        const hotel = allHotels.find(h => h.id === id)
        return hotel ? getRateVolatilityDataForHotel(hotel.id, hotel.name) : null
      })
      .filter((data): data is RateVolatilityData => data !== null)
  }, [selectedCompetitors])

  const handleHotelHover = useCallback((hotel: RateVolatilityData, event?: React.MouseEvent, hotelIndex?: number) => {
    // Only update hotel and side if it's a different hotel
    if (currentHotelIndexRef.current !== hotelIndex) {
      setHoveredHotel(hotel.name)
      setTooltipData(hotel)
      currentHotelIndexRef.current = hotelIndex ?? null
      
      // Determine if this is in the last 35% of hotels (right side of graph)
      // Show tooltip on left side for these hotels - similar to Rate Leaderboard logic
      const totalHotels = filteredRateVolatilityData.length
      const last35PercentThreshold = Math.ceil(totalHotels * 0.65) // Hotels after 65% = last 35%
      const isRightSideHotel = hotelIndex !== undefined && hotelIndex >= last35PercentThreshold
      
      setTooltipSide(isRightSideHotel ? "left" : "right")
    }
    
    // Only update position on mouse move if it actually changed (prevent infinite loops)
    if (event) {
      const newX = event.clientX
      const newY = event.clientY
      setTooltipPosition(prev => {
        // Only update if position actually changed (threshold of 1px to avoid micro-movements)
        if (Math.abs(prev.x - newX) > 1 || Math.abs(prev.y - newY) > 1) {
          return { x: newX, y: newY }
        }
        return prev
      })
    }
  }, [filteredRateVolatilityData])

  const handleHotelLeave = useCallback(() => {
    setHoveredHotel(null)
    setTooltipData(null)
    setTooltipPosition({ x: 0, y: 0 })
    currentHotelIndexRef.current = null
  }, [])


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* Business Insights Tabs Section - Below Navigation */}
      <div className="relative z-10">
        <BusinessInsightsTabs 
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          businessInsightsTabs={businessInsightsTabs}
        />
      </div>
      
      {/* Filter Bar - Below Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="max-w-7xl xl:max-w-none mx-auto">
            <div className="flex items-center gap-4 py-4">
              {/* Check-in Months Date Picker */}
              <div className="shrink-0">
                <RateVolatilityCheckinMonthsDatePicker
                  startDate={checkinStartDate}
                  endDate={checkinEndDate}
                  onChange={handleCheckinDateRangeChange}
                />
              </div>

              {/* Shop Date Range - Read Only */}
              <div className="shrink-0">
                <div className="h-10 px-4 font-medium bg-gray-50 dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-md flex items-center gap-2 shadow-sm text-sm cursor-default">
                  <Calendar className="w-4 h-4 shrink-0 text-gray-500 dark:text-gray-400" />
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Shop:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatShopDateRange()}
                  </span>
                </div>
              </div>

              {/* Competitors Dropdown */}
              <div className="shrink-0">
                <CompetitorsDropdown
                  selectedHotels={selectedCompetitors}
                  onChange={handleCompetitorsChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <main className="relative z-10">
        <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-2 md:py-4 lg:py-6 max-w-7xl xl:max-w-none mx-auto">
          {/* White Main Container */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            {/* Header Section with Heading, Helper Text, and Labels */}
            <div className="px-6 pt-6 pb-2">
              <div className="flex items-start justify-between mb-1">
                {/* Left Side - Heading and Description */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      Rate Volatility
                    </h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-sm bg-slate-800 text-white border-slate-700">
                          <p className="text-sm">
                            This section shows the rate volatility for different hotels and competitors over time, helping identify patterns and trends in pricing fluctuations.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Analyze rate fluctuations and volatility patterns across competitors.
                  </p>
                </div>

                {/* Right Side - Legends and Labels */}
                <div className="flex flex-col items-end gap-4">
                  {/* Graph Legends - Matching Rate Leaderboard styling */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-2 bg-orange-400 rounded"></div>
                      <span className="text-xs text-gray-700 dark:text-gray-300">Min/Max rate range</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-2 bg-blue-500 rounded"></div>
                      <span className="text-xs text-gray-700 dark:text-gray-300">Avg. Rate Range</span>
                      <div className="relative group">
                        <Info className="w-3 h-3 text-gray-900 dark:text-gray-100 cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 w-auto px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap">
                          Middle 50% rate range
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Rate Volatility Graph Section */}
            <div className="px-6 pb-6 -mt-5">
              <div 
                className="relative" 
                onMouseLeave={(e) => {
                  // Only hide tooltip if mouse is truly leaving the graph container
                  // Check if the related target is not a child of this container
                  const currentTarget = e.currentTarget as HTMLElement
                  const relatedTarget = e.relatedTarget as HTMLElement | null
                  
                  if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
                    handleHotelLeave()
                  }
                }}
              >
                <BoxPlot
                  data={filteredRateVolatilityData}
                  hoveredHotel={hoveredHotel}
                  onHotelHover={handleHotelHover}
                  onHotelLeave={handleHotelLeave}
                />

                {/* Tooltip - Matching Rate Leaderboard styling */}
                {tooltipData && (
                  <div
                    className="fixed z-[10001] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl rounded-lg p-3 min-w-[230px] max-w-[450px] pointer-events-none"
                    style={{
                      left: tooltipSide === "left" 
                        ? `${tooltipPosition.x - 10}px` // Position 10px to the left of cursor (Rate Leaderboard style)
                        : `${tooltipPosition.x + 10}px`, // Position 10px to the right of cursor
                      top: `${tooltipPosition.y}px`, // Align with cursor Y position
                      transform: tooltipSide === "left" 
                        ? 'translateX(-100%) translateY(-50%)' // Move left by full width, center vertically (Rate Leaderboard style)
                        : 'translateY(-50%)', // Center vertically for right side
                    }}
                  >
                    {/* Date Heading */}
                    <div className="mb-2">
                      <h3 className="text-gray-900 dark:text-white">
                        <span 
                          className="text-sm font-bold leading-tight block"
                          style={{ 
                            lineHeight: '1.3',
                            whiteSpace: 'pre-line',
                            wordBreak: 'normal',
                            overflowWrap: 'normal'
                          }}
                        >
                          {(() => {
                            // Split by whitespace - any space counts as word separator
                            const allWords = tooltipData.name.split(/\s+/).filter(word => word.length > 0)
                            
                            // Count words excluding '&' - '&' is not counted as a word
                            const words = allWords.filter(word => word !== '&')
                            const wordCount = words.length
                            
                            // Reconstruct the display text with '&' included but not counted
                            if (wordCount <= 5) {
                              // 5 words or less: show all on one line (including '&' if present)
                              return allWords.join(' ')
                            } else if (wordCount <= 9) {
                              // 6-9 words: break after 5th word (excluding '&' from count)
                              // Find where the 5th non-& word ends
                              let wordIndex = 0
                              let displayIndex = 0
                              for (let i = 0; i < allWords.length; i++) {
                                if (allWords[i] !== '&') {
                                  wordIndex++
                                  if (wordIndex === 5) {
                                    displayIndex = i + 1
                                    break
                                  }
                                }
                              }
                              const firstLine = allWords.slice(0, displayIndex).join(' ')
                              const secondLine = allWords.slice(displayIndex).join(' ')
                              return `${firstLine}\n${secondLine}`
                            } else {
                              // More than 9 words: show first 9 words (excluding '&') with ...
                              // Find where the 5th non-& word ends for first line
                              let firstLineWordIndex = 0
                              let firstLineEnd = 0
                              for (let i = 0; i < allWords.length; i++) {
                                if (allWords[i] !== '&') {
                                  firstLineWordIndex++
                                  if (firstLineWordIndex === 5) {
                                    firstLineEnd = i + 1
                                    break
                                  }
                                }
                              }
                              // Find where the 9th non-& word ends for second line
                              let secondLineWordIndex = 0
                              let secondLineEnd = 0
                              for (let i = firstLineEnd; i < allWords.length; i++) {
                                if (allWords[i] !== '&') {
                                  secondLineWordIndex++
                                  if (secondLineWordIndex === 4) { // 5th to 9th = 4 more words
                                    secondLineEnd = i + 1
                                    break
                                  }
                                }
                              }
                              const firstLineFinal = allWords.slice(0, firstLineEnd).join(' ')
                              const secondLineFinal = allWords.slice(firstLineEnd, secondLineEnd).join(' ')
                              return `${firstLineFinal}\n${secondLineFinal}...`
                            }
                          })()}
                        </span>
                      </h3>
                    </div>
                    
                    {/* Table Structure */}
                    <table className="w-full border-separate border-spacing-0">
                      <thead>
                        <tr>
                          <th className="text-left text-[11px] font-medium text-gray-500 dark:text-slate-400 pb-1 pr-[2px] align-top">
                          </th>
                          <th className="text-right text-[11px] font-medium text-gray-500 dark:text-slate-400 pb-1 pr-1 align-top">
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {checkinStartDate ? format(checkinStartDate, "MMM''yy") : "Oct'25"}
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-1.5 pl-1 pr-[2px]">
                            <div className="text-xs font-medium text-gray-900 dark:text-slate-100">
                              Avg. Rate Range&nbsp;&nbsp;&nbsp;
                            </div>
                          </td>
                          <td className="py-1.5 text-right pr-1 whitespace-nowrap">
                            <div className="text-xs font-bold text-gray-900 dark:text-slate-100">
                              £{formatCurrency(tooltipData.avgRangeMin)}-£{formatCurrency(tooltipData.avgRangeMax)}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1.5 pl-1 pr-[2px]">
                            <div className="text-xs font-medium text-gray-900 dark:text-slate-100">
                              Min
                            </div>
                          </td>
                          <td className="py-1.5 text-right pr-1 whitespace-nowrap">
                            <div className="text-xs font-bold text-gray-900 dark:text-slate-100">
                              £{formatCurrency(tooltipData.min)}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1.5 pl-1 pr-[2px]">
                            <div className="text-xs font-medium text-gray-900 dark:text-slate-100">
                              Max
                            </div>
                          </td>
                          <td className="py-1.5 text-right pr-1 whitespace-nowrap">
                            <div className="text-xs font-bold text-gray-900 dark:text-slate-100">
                              £{formatCurrency(tooltipData.max)}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2} className="py-0.5 px-0">
                            <div className="border-t border-gray-300 dark:border-gray-600"></div>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 pl-1 pr-[2px]">
                            <div className="text-xs font-medium text-gray-900 dark:text-slate-100">
                              Observations
                            </div>
                          </td>
                          <td className="py-1 text-right pr-1 whitespace-nowrap">
                            <div className="text-xs font-bold text-gray-900 dark:text-slate-100">
                              {tooltipData.observations}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="text-center" style={{ marginTop: '-6px' }}>
                <div className="text-sm text-gray-500 dark:text-gray-400 tracking-wide">
                  Check-in Month - {checkinStartDate ? format(checkinStartDate, "MMM''yy") : "Oct'25"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
    </div>
  )
}




