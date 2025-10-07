"use client"

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts"
import { format, addDays, parseISO, differenceInDays } from "date-fns"
import { useSelectedProperty } from "@/hooks/use-local-storage"

interface ModalRankingChartProps {
  selectedDate: Date
  numberOfDays?: number
  paceData?: any[]
  isLoading?: boolean
  onSelectedPropertiesChange?: (properties: string[]) => void
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

export function ModalRankingChart({ selectedDate, numberOfDays = 15, paceData = [], isLoading = false, onSelectedPropertiesChange }: ModalRankingChartProps) {
  // Transform paceData to chart-compatible format
  const [selectedProperty] = useSelectedProperty();
  const transformedData = useMemo(() => {
    if (!paceData || paceData.length === 0) {
      console.log("No paceData available")
      return []
    }

    console.log("Processing paceData:", paceData)
    const ShopData: any[] = []

    paceData.forEach((pc: any) => {
      let jsObj: any = {}
      const shopDate = pc.shopDateTime
      const avgComRate = pc.avgComRate

      if (pc.competitivenessEntity == null) {
        jsObj["shopDate"] = format(parseISO(shopDate), "yyyy-MM-dd")
        ShopData.push(jsObj)
      } else {
        pc.competitivenessEntity.priceCompetitivenessRates.forEach((pcr: any) => {
          if (pcr.isSubscriber) {
            jsObj[pcr.propertName] = { "rate": pcr.rate, "status": pcr.status }
            console.log("Added subscriber:", pcr.propertName, "rate:", pcr.rate)
          }

          if (pcr.propertyID != -1 && pcr.isSubscriber == false) {
            jsObj[pcr.propertName] = { "rate": pcr.rate, "status": pcr.status }
            console.log("Added competitor:", pcr.propertName, "rate:", pcr.rate)
          }
        })

        // Add avg compset if we have competitor data
        if (Object.keys(jsObj).length > 1) {
          jsObj["Avg. Compset"] = { "rate": avgComRate, "status": "NA" }
          console.log("Added avg compset rate:", avgComRate)
        }

        jsObj["shopDate"] = format(parseISO(shopDate), "yyyy-MM-dd")
        ShopData.push(jsObj)
      }
    })

    console.log("Transformed data:", ShopData)
    return ShopData
  }, [paceData])

  // Generate dynamic hotel lines from transformed data
  const dynamicHotelLines = useMemo(() => {
    if (transformedData.length === 0) return modalHotelLines

    const hotelLines: any[] = []
    const colors = [
      '#3b82f6', '#0891b2', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1', '#14b8a6'
    ]

    // Get all unique property names from the data
    const propertyNames = new Set<string>()
    transformedData.forEach((dataPoint: any) => {
      Object.keys(dataPoint).forEach(key => {
        if (key !== 'shopDate' && typeof dataPoint[key] === 'object') {
          propertyNames.add(key)
        }
      })
    })

    // Separate properties into categories for proper ordering
    const subscriberProperties: string[] = []
    const avgCompsetProperties: string[] = []
    const competitorProperties: string[] = []

    propertyNames.forEach(propertyName => {
      const isSubscriber = propertyName.toLowerCase() === selectedProperty?.name?.toLowerCase()
      const isAvgCompset = propertyName === 'Avg. Compset'

      if (isSubscriber) {
        subscriberProperties.push(propertyName)
      } else if (isAvgCompset) {
        avgCompsetProperties.push(propertyName)
      } else {
        competitorProperties.push(propertyName)
      }
    })

    // Order: My Hotel first, then Avg. Compset, then competitors
    const orderedProperties = [...subscriberProperties, ...avgCompsetProperties, ...competitorProperties]

    let colorIndex = 0
    orderedProperties.forEach((propertyName, index) => {
      const isSubscriber = propertyName.toLowerCase() === selectedProperty?.name?.toLowerCase()
      const isAvgCompset = propertyName === 'Avg. Compset'

      hotelLines.push({
        dataKey: propertyName,
        name: propertyName.length > 24 ? `${propertyName.substring(0, 24)}...` : propertyName,
        color: colors[colorIndex % colors.length],
        isSubscriber,
        isAvgCompset
      })
      colorIndex++
    })

    console.log("Generated dynamic hotel lines:", hotelLines)
    return hotelLines
  }, [transformedData, selectedProperty])

  // Independent legend visibility state for modal
  const [modalLegendVisibility, setModalLegendVisibility] = useState<{ [key: string]: boolean }>(() => {
    const initial: { [key: string]: boolean } = {}
    // Initialize with static hotel lines if no dynamic data yet
    const linesToUse = dynamicHotelLines.length > 0 ? dynamicHotelLines : modalHotelLines
    linesToUse.forEach((hotel, index) => {
      // Show: subscriber/myHotel, avgCompset, and first 4 competitors (6 lines total)
      initial[hotel.dataKey] = index <= 5 // Shows indices 0-5 (6 hotels)
    })
    return initial
  })

  // Update legend visibility when dynamicHotelLines changes
  useEffect(() => {
    if (dynamicHotelLines.length > 0) {
      setModalLegendVisibility(prev => {
        const newVisibility: { [key: string]: boolean } = {}
        dynamicHotelLines.forEach((hotel, index) => {
          // If this hotel was already in the previous state, keep its visibility
          if (prev[hotel.dataKey] !== undefined) {
            newVisibility[hotel.dataKey] = prev[hotel.dataKey]
          } else {
            // Show My Hotel and Avg. Compset first, then first 4 competitors
            if (hotel.isSubscriber || hotel.isAvgCompset) {
              newVisibility[hotel.dataKey] = true
            } else {
              // For competitors, show first 4 after My Hotel and Avg. Compset
              const competitorIndex = index - (dynamicHotelLines.filter(h => h.isSubscriber || h.isAvgCompset).length)
              newVisibility[hotel.dataKey] = competitorIndex < 4
            }
          }
        })
        return newVisibility
      })
    }
  }, [dynamicHotelLines])

  // Track previous selection to prevent infinite loops
  const previousSelectionRef = useRef<string>("")

  // Notify parent component about selected properties
  useEffect(() => {
    if (onSelectedPropertiesChange && dynamicHotelLines.length > 0) {
      const selectedProperties = dynamicHotelLines
        .filter(hotel => modalLegendVisibility[hotel.dataKey])
        .map(hotel => hotel.dataKey)

      // Only call if the selection actually changed
      const currentSelection = JSON.stringify(selectedProperties.sort())

      if (currentSelection !== previousSelectionRef.current) {
        previousSelectionRef.current = currentSelection
        onSelectedPropertiesChange(selectedProperties)
      }
    }
  }, [modalLegendVisibility, dynamicHotelLines, onSelectedPropertiesChange])

  // Error message state for hotel selection limit
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Generate ranking data for the modal chart
  const modalRankingData = useMemo(() => {
    if (transformedData.length === 0) {
      debugger;
      // Fallback to static data if no paceData available
      const baseDate = selectedDate
      const baseData = Array.from({ length: numberOfDays }, (_, index) => {
        const currentDate = addDays(baseDate, -(numberOfDays - 1 - index))
        const daysBeforeCheckIn = numberOfDays - 1 - index
        debugger;
        const dataPoint: any = {
          date: format(currentDate, 'dd MMM'),
          fullDate: format(currentDate, 'yyyy-MM-dd'),
          daysLabel: `${daysBeforeCheckIn} days`,
          daysBefore: daysBeforeCheckIn
        }

        // Generate static rates for fallback
        modalHotelLines.forEach((hotel, hotelIndex) => {
          const rateRanges = [
            [650, 750], [600, 700], [400, 500], [750, 850], [500, 600],
            [800, 900], [600, 700], [450, 550], [550, 650], [800, 900],
            [850, 900], [700, 800]
          ]

          const [minRate, maxRate] = rateRanges[hotelIndex] || [700, 800]
          const baseRate = minRate + Math.floor(Math.random() * (maxRate - minRate + 1))
          const dailyVariation = Math.floor(Math.random() * 40) - 20
          const rate = Math.max(400, Math.min(900, baseRate + dailyVariation))

          dataPoint[hotel.dataKey] = rate
        })

        return dataPoint
      })
      return baseData
    }

    // Use transformed data from paceData
    const baseData = transformedData.map((dataPoint, index) => {
      const currentDate = new Date(dataPoint.shopDate)
      const daysBeforeCheckIn = differenceInDays(selectedDate, currentDate);// numberOfDays - 1 - index
      debugger;
      const chartDataPoint: any = {
        date: format(currentDate, 'dd MMM'),
        fullDate: format(currentDate, 'yyyy-MM-dd'),
        daysLabel: `${daysBeforeCheckIn} days`,
        daysBefore: daysBeforeCheckIn
      }

      // Map the rates from transformed data
      dynamicHotelLines.forEach((hotel) => {
        const rateData = dataPoint[hotel.dataKey]
        if (rateData && typeof rateData === 'object' && rateData.rate !== undefined) {
          // Show actual rate if available, otherwise show 0
          chartDataPoint[hotel.dataKey] = rateData.rate > 0 ? rateData.rate : 0
          // Store status for tooltip display
          chartDataPoint[`${hotel.dataKey}_status`] = rateData.status
          console.log(`Mapped ${hotel.dataKey}: rate=${rateData.rate}, status=${rateData.status}`)
        } else {
          // If no rate data, show 0
          chartDataPoint[hotel.dataKey] = 0
          chartDataPoint[`${hotel.dataKey}_status`] = 'N/A'
          console.log(`No rate data for ${hotel.dataKey}`)
        }
      })

      return chartDataPoint
    })

    console.log("Final chart data:", baseData)
    return baseData
  }, [selectedDate, numberOfDays, transformedData, dynamicHotelLines])

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
              const hotelInfo = dynamicHotelLines.find(hotel => hotel.dataKey === entry.dataKey)
              const hotelName = hotelInfo?.name || entry.name || 'Unknown Hotel'

              const truncatedName = hotelName.length > 28 ? `${hotelName.substring(0, 25)}...` : hotelName

              const rate = entry.value
              const isSubscriber = entry.isSubscriber
              const isAvgCompset = entry.dataKey === 'Avg. Compset'

              // Get status from the data
              const status = data[`${entry.dataKey}_status`]
              const displayStatus = status === 'Closed' ? 'Sold Out' : status
              const showStatus = status && status !== 'O' && status !== 'N/A'

              return (
                <div key={index} className={`flex justify-between items-center py-1.5 pl-2 pr-4 rounded-md ${isSubscriber ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700' : ''
                  }`}>
                  {/* Property Column */}
                  <div className="flex items-center gap-2 flex-1 min-w-0 mr-4">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <div className={`text-xs font-medium whitespace-nowrap ${isSubscriber ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-slate-100'
                      }`}>
                      {truncatedName}
                    </div>
                  </div>

                  {/* Rates Column - Right aligned */}
                  <div className="flex items-center">
                    <div className={`text-xs font-bold text-right ${isSubscriber ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-slate-100'
                      }`}>
                      {rate > 0 ? `\u200E ${selectedProperty?.currencySymbol ?? '$'}\u200E ${formatYAxis(rate)}` : displayStatus}
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
  const formatYAxis = (value: string | number): string => {
    const num = Number(value)
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`
    return String(num)
  }
  // Loading component
  const LoadingChart = () => (
    <div style={{ height: '420px', minHeight: '420px', maxHeight: '420px' }} className="flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="text-sm text-muted-foreground">Preparing your Data Analysis...</div>
        <div className="text-sm text-muted-foreground">Hang tight — your data will appear shortly.</div>
      </div>
    </div>
  )

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

      {isLoading ? (
        <LoadingChart />
      ) : (
        <div style={{ height: '420px', minHeight: '420px', maxHeight: '420px', overflowY: 'auto', overflowX: 'hidden' }} className="[&_.recharts-wrapper]:mt-3 [&_.recharts-legend-wrapper]:!bottom-[48px]">
          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={modalRankingData} margin={{ top: 20, right: 40, left: 30, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-15 dark:opacity-10" stroke="#e5e7eb" />
              <XAxis
                dataKey="daysBefore"
                className="text-xs"
                interval="preserveStartEnd"
                height={85}
                tick={({ x, y, payload }: any) => {
                  if (!payload || x === undefined || y === undefined) return <></>

                  // Find the data point for this tick
                  const dataPoint = modalRankingData.find(d => d.daysBefore === payload.value)
                  if (!dataPoint) return <></>

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
                  value: `Rates (\u200E ${selectedProperty?.currencySymbol ?? '$'} \u200E)`,
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
                tickFormatter={formatYAxis}
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
              {dynamicHotelLines.map((hotel) => {
                const isVisible = modalLegendVisibility[hotel.dataKey]

                return (
                  <Line
                    key={hotel.dataKey}
                    type="monotone"
                    dataKey={hotel.dataKey}
                    stroke={isVisible ? hotel.color : 'transparent'}
                    strokeWidth={isVisible ? (hotel?.isSubscriber ? 3 : 2) : 0}
                    strokeDasharray={hotel?.isAvgCompset ? "5 5" : undefined}
                    name={hotel.name}
                    dot={isVisible ? {
                      fill: "white",
                      stroke: hotel.color,
                      strokeWidth: 2,
                      r: hotel?.isSubscriber ? 4 : 3
                    } : false}
                    activeDot={isVisible ? {
                      r: hotel?.isSubscriber ? 6 : 5,
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
                iconType="line"
                wrapperStyle={{
                  ...(dynamicHotelLines.length > 15
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
                    // Find the hotel info to check if it's My Hotel or Avg. Compset
                    const hotelInfo = dynamicHotelLines.find(hotel => hotel.dataKey === event.dataKey)

                    // Don't allow hiding My Hotel or Avg. Compset
                    if (hotelInfo?.isSubscriber || hotelInfo?.isAvgCompset) {
                      return // Do nothing for these lines
                    }

                    toggleModalLegendVisibility(event.dataKey)
                  }
                }}
                formatter={(value, entry: any) => {
                  const dataKey = entry.dataKey as string
                  const isVisible = modalLegendVisibility[dataKey]

                  // Find the hotel info to check if it's My Hotel or Avg. Compset
                  const hotelInfo = dynamicHotelLines.find(hotel => hotel.dataKey === dataKey)
                  const isNonClickable = hotelInfo?.isSubscriber || hotelInfo?.isAvgCompset

                  return (
                    <span style={{
                      color: isVisible ? entry.color : '#9ca3af',
                      fontWeight: isVisible ? 500 : 400,
                      textDecoration: isVisible ? 'none' : 'line-through',
                      cursor: isNonClickable ? 'default' : 'pointer',
                      opacity: isNonClickable ? 1 : undefined
                    }}>
                      {value}
                    </span>
                  )
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
