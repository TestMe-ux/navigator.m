"use client"
import React, { useMemo, useState } from "react"
import { BarChart3, Calendar, Star, Wifi, Coffee, Utensils, Car, Dumbbell, ChevronLeft, ChevronRight, Zap } from "lucide-react"
import { useDateContext } from "@/components/date-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { EnhancedTableTooltip } from "./enhanced-table-tooltip"
import { RateDetailModal } from "./rate-detail-modal"
import { useComparison } from "../comparison-context"
import { isSameDay, parseISO, subDays } from "date-fns"
import { useSelectedProperty } from "@/hooks/use-local-storage"

interface CalendarDay {
  date: number
  month: number
  year: number
  currentPrice: string
  comparison: string
  isFuture?: boolean
  dayOfWeek?: string
  subscriberRate: string
  hotelLowestRate: number
  rateDifference: string
  roomType: string
  hasInclusion: boolean
  inclusionIcon: string
  hasEvent: boolean
  eventIcon: string
  eventCount: number
  isHighest: boolean
  isLowest: boolean
  isMyRateLowest: boolean
  isMyRateHighest: boolean
  showRateDot: boolean
  hasFlag?: boolean
  flagCountry?: string
  hasIndicator?: boolean
  indicatorColor?: string
  indicatorType?: 'circle' | 'square'
  hasLightningRefresh?: boolean
}

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// Generate enhanced calendar data with future dates and recommendations
const generateCalendarData = (startDateRange: Date, endDateRange: Date): CalendarDay[][] => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const weeks: CalendarDay[][] = []

  const totalDays = Math.ceil((endDateRange.getTime() - startDateRange.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const totalWeeks = Math.ceil(totalDays / 7)

  const calendarStartDate = new Date(startDateRange)
  calendarStartDate.setHours(0, 0, 0, 0)

  const maxWeeks = Math.max(totalWeeks, 6)

  for (let weekIndex = 0; weekIndex < maxWeeks; weekIndex++) {
    const week: CalendarDay[] = []

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const currentDate = new Date(calendarStartDate)
      currentDate.setDate(calendarStartDate.getDate() + (weekIndex * 7) + dayIndex)

      const date = currentDate.getDate()
      const month = currentDate.getMonth()
      const year = currentDate.getFullYear()

      const dayWithoutTime = new Date(year, month, date)
      const isFuture = dayWithoutTime > today

      const basePrices = ['$680', '$750', '$810', '$920', '$1100', '$1350', '$1500']
      const priceIndex = (date + month + year) % basePrices.length
      const currentPrice = basePrices[priceIndex]

      let dayData: CalendarDay = {
        date,
        month,
        year,
        currentPrice,
        comparison: `${Math.random() > 0.5 ? '-' : '+'}${Math.floor(Math.random() * 30 + 40)}% vs. Comp`,
        isFuture,
        dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][currentDate.getDay()],
        subscriberRate: `$${Math.floor(Math.random() * 900 + 100)}`,
        hotelLowestRate: Math.floor(Math.random() * 400 + 150),
        rateDifference: `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 90 + 10)}`,
        roomType: "STD",
        hasInclusion: true,
        inclusionIcon: "wifi",
        hasEvent: Math.random() > 0.6,
        eventIcon: "⭐",
        eventCount: Math.random() > 0.5 ? Math.floor(Math.random() * 3 + 1) : 1,
        isHighest: Math.random() > 0.7,
        isLowest: Math.random() > 0.8,
        isMyRateLowest: false,
        isMyRateHighest: false,
        showRateDot: false,
        hasFlag: Math.random() > 0.8,
        flagCountry: Math.random() > 0.8 ? '🇺🇸' : undefined,
        hasIndicator: Math.random() > 0.7,
        indicatorColor: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'bg-red-500' : 'bg-green-500') : undefined,
        indicatorType: Math.random() > 0.8 ? 'square' : 'circle',
        hasLightningRefresh: Math.random() > 0.75 // Show lightning refresh icon on ~25% of dates
      }

      if (month === 5 && date >= 18 && date <= 25) {
        dayData.hasIndicator = true
        dayData.indicatorType = "circle"
        dayData.indicatorColor = "bg-purple-500"
      }

      if (currentDate.getDay() === 5 || currentDate.getDay() === 6) {
        dayData.hasIndicator = true
        dayData.indicatorType = "square"
        dayData.indicatorColor = "bg-red-400"
      }

      if (month === 5 && date === 5) dayData.hasFlag = true, dayData.flagCountry = "🇨🇦"
      if (month === 6 && date === 4) dayData.hasFlag = true, dayData.flagCountry = "🇺🇸"

      week.push(dayData)
    }

    weeks.push(week)
  }

  return weeks
}

interface RateTrendsTableProps {
  className?: string
  competitorStartIndex?: number
  competitorsPerPage?: number
  rateData?: any
  rateCompData?: any
}

// Interface for live rate data structure
interface LiveRateData {
  los: number | null
  channelName: string | null
  pricePositioningEntites: Array<{
    propertName: string
    propertyID: number
    subscriberPropertyRate: Array<{
      msi: number
      compMSI: number
      propertyID: number
      priceThresholdBreach: number
      priceThresholdPercent: number
      rateBackGround: number
      benchmarkRate: number
      lowestRate: number
      lowestRatePropName: string
      rate: string
      highestRate: number
      highestRatePropName: string
      rateDifference: number
      rateSupply: number
      avgOTARank: number
      compsetAverage: number
      event: {
        eventDate: string
        eventDetails: Array<{
          eventName: string
          eventId: number
          color: string
          eventImpact: number
          eventLocation: string
          displayDate: string
        }>
        displayDate: string | null
      }
      rateDescription: string
      shortRateDescription: string
      isClusterExcel: boolean
      rateDifferenceText: string
      currency: string
      productName: string
      abbreviation: string
      los: number
      guest: number
      checkInDateTime: string
      isCompClosed: boolean
      compRank: number
      shopDateTime: string
      channelName: string
      channelID: number
      fullRateDescription: string | null
      minRateCount: number
      hoverChannelName: string
      hoverPropertyName: string
      channelIconURL: string | null
      isDottedLine: boolean
      status: string
      statusHover: string | null
      showRate: string | null
      segmentID: number
      ilosData: any
      rateCategory: string
      inclusion: string
      promotion: boolean
      restriction: boolean
      isFilteredNA: boolean
      compsetAvgDifferencePercentage: number | null
      lastRate: number
      lastThirdRate: number
      lastSeventhRate: number
      lastFourteenRate: number
      lastReportRate: number
    }>
    propertyType: number // 0 = My Property, 1 = Competitor, 2 = Avg Compset
  }>
}

// Transform live data to table format
const transformLiveDataToTableFormat = (rateData: LiveRateData | undefined) => {
  if (!rateData || !rateData.pricePositioningEntites) {
    return {
      myProperty: null,
      avgCompset: null,
      competitors: []
    }
  }

  const myProperty = rateData.pricePositioningEntites.find(entity => entity.propertyType === 0)
  const avgCompset = rateData.pricePositioningEntites.find(entity => entity.propertyType === 2)
  const competitors = rateData.pricePositioningEntites.filter(entity => entity.propertyType === 1)

  return {
    myProperty,
    avgCompset,
    competitors
  }
}

export function RateTrendsTable({
  className,
  competitorStartIndex = 0,
  competitorsPerPage = 5, // Default to show 5 competitors initially
  rateData,
  rateCompData
}: RateTrendsTableProps) {
  const { startDate, endDate, isLoading } = useDateContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const { selectedComparison } = useComparison()
  const [selectedProperty] = useSelectedProperty()
  // Transform live data
  const transformedData = useMemo(() => {
    return transformLiveDataToTableFormat(rateData)
  }, [rateData])

  // Calculate dynamic column width based on rate values (further reduced for 4-competitor view)
  const calculateRateColumnWidth = (rate: number) => {
    const rateString = rate.toString()
    if (rateString.length >= 4) return '62px' // For rates like 1000+ (further reduced)
    if (rateString.length === 3) return '56px' // For rates like 100-999 (further reduced)
    return '52px' // For rates like 10-99 (further reduced)
  }

  // Generate calendar data based on selected date range
  const calendarData = useMemo(() => {
    if (startDate && endDate) {
      return generateCalendarData(startDate, endDate)
    } else {
      const defaultStart = new Date()
      const defaultEnd = new Date()
      defaultEnd.setDate(defaultStart.getDate() + 7)
      return generateCalendarData(defaultStart, defaultEnd)
    }
  }, [startDate, endDate])

  // Generate table data from live data
  const tableData = useMemo(() => {
    if (!transformedData.myProperty || !transformedData.myProperty.subscriberPropertyRate) {
      return []
    }
    const compEntities: any = rateCompData?.body?.pricePositioningEntites || rateCompData?.pricePositioningEntites
    return transformedData.myProperty.subscriberPropertyRate.map((rateEntry, index) => {
      const checkInDate = new Date(rateEntry.checkInDateTime)
      const dayName = weekDays[checkInDate.getDay()]
      debugger;
      // Get rate value, handling different statuses
      const rateValue = rateEntry.status === 'O' ? parseFloat(rateEntry.rate) : 0
      const isFuture = checkInDate > new Date()
      const compData = compEntities
        ?.filter((ce: any) => ce.propertyID === rateEntry.propertyID)[0]
        ?.subscriberPropertyRate
        .find((re: any) =>
          isSameDay(
            parseISO(re.checkInDateTime),
            subDays(parseISO(rateEntry.checkInDateTime), selectedComparison)
          )
        );
      const compareRate = compData?.rate ? parseFloat(compData.rate) : 0;
      return {
        id: index,
        date: checkInDate,
        dayName,
        dayOfWeek: checkInDate.getDay(),
        currentPrice: rateEntry.status === 'O' ? rateEntry.rate : 'Closed',
        priceChange: rateEntry.compsetAvgDifferencePercentage || 0,
        comparison: (() => {
          const percentage = rateEntry.compsetAvgDifferencePercentage || 0;
          return `${percentage > 0 ? '+' : ''}${percentage}% vs. Comp`;
        })(),
        isFuture,
        hasFlag: rateEntry.event?.eventDetails?.length > 0,
        flagCountry: rateEntry.event?.eventDetails?.length > 0 ? '⭐' : undefined,
        isWeekend: checkInDate.getDay() === 5 || checkInDate.getDay() === 6,
        eventInfluence: rateEntry.event?.eventDetails?.length > 0 ? rateEntry.event.eventDetails : undefined,
        confidence: undefined,
        hasLightningRefresh: false,
        rateEntry,
        compareRate // Store the full rate entry for detailed access
      }
    })
  }, [transformedData])

  const handleExportCSV = () => {
    const csvHeaders = ['Date', 'Day', 'Current Rate', 'Change %', 'Market Trends', 'Events']
    const csvData = tableData.map(row => [
      row.date.toLocaleDateString(),
      row.dayName,
      row.currentPrice,
      row.priceChange !== 0 ? `${row.priceChange.toFixed(1)}%` : '-',
      row.comparison,
      row.hasFlag ? row.flagCountry : '-'
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rate-trends-table-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const handleGraphClick = (date: Date) => {
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedDate(null)
  }

  const handlePrevDay = () => {
    if (selectedDate) {
      const prevDay = new Date(selectedDate)
      prevDay.setDate(prevDay.getDate() - 1)
      setSelectedDate(prevDay)
    }
  }

  const handleNextDay = () => {
    if (selectedDate) {
      const nextDay = new Date(selectedDate)
      nextDay.setDate(nextDay.getDate() + 1)
      setSelectedDate(nextDay)
    }
  }

  // Show loading state when date range is changing
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-card to-card/50 shadow-xl border border-border/50 rounded-lg p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading table data...</p>
        </div>
      </div>
    )
  }

  // Show no data state when no live data is available
  if (!rateData || !transformedData.myProperty || tableData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-card to-card/50 shadow-xl border border-border/50 rounded-lg p-8">
        <div className="text-center space-y-4">
          <div className="text-slate-500 dark:text-slate-400 text-lg">No rate data available</div>
          <p className="text-slate-600 dark:text-slate-400">Please check your data source and try again</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full shadow-xl border border-border/50 bg-white dark:bg-slate-900 ${className || ''}`}>

      <div className="rounded-lg overflow-hidden">
        <table className="w-full relative table-fixed">
          {/* Two-Level Sticky Header */}
          <thead className="bg-gray-50">
            {/* First Header Row - Main Column Groups */}
            <tr className="border-b border-gray-200">
              {/* Date Column */}
              <th rowSpan={2} className="bg-gray-50 text-left py-1.5 pl-3 pr-1 font-semibold text-xs text-muted-foreground border-r border-gray-200" style={{ width: '85px' }}>
                Date
              </th>

              {/* Demand Column (merged) */}
              <th rowSpan={2} colSpan={2} className="bg-gray-50 text-center py-1.5 font-semibold text-xs text-muted-foreground border-r border-gray-200" style={{ width: '60px', paddingLeft: '1px', paddingRight: '1px' }}>
                Demand
              </th>

              {/* Avg. Compset Column Group */}
              <th rowSpan={2} className="bg-gray-50 text-left py-1.5 pl-2 pr-2 font-semibold text-xs text-muted-foreground border-r border-gray-200" style={{ width: '60px' }}>
                <div className="flex flex-col">
                  <span>Avg.</span>
                  <span>Compset</span>
                </div>
              </th>

              {/* Subscriber Column Group - updated to 3 columns */}
              <th colSpan={3} className="bg-blue-50 text-center py-1.5 px-1 font-semibold text-xs text-muted-foreground border-r border-gray-200" style={{ width: '80px' }}>
                Subscriber
              </th>

              {/* Dynamic Competitor Hotels */}
              {(() => {
                const competitorNames = transformedData.competitors.map(comp => comp.propertName);
                const visibleCompetitors = competitorNames.slice(competitorStartIndex, competitorStartIndex + 5);

                // Always show exactly 5 columns, fill with placeholders if needed
                const columnsToShow = [];
                for (let i = 0; i < 5; i++) {
                  if (i < visibleCompetitors.length) {
                    columnsToShow.push(visibleCompetitors[i]);
                  } else {
                    columnsToShow.push(null); // Placeholder
                  }
                }

                return columnsToShow.map((name, index) => (
                  <th key={index} colSpan={3} className="text-center py-1.5 px-1 font-semibold text-xs text-muted-foreground border-r border-gray-200" style={{ width: '80px' }}>
                    {name ? (name.length > 15 ? `${name.substring(0, 12)}...` : name) : ''}
                  </th>
                ));
              })()}
            </tr>

            {/* Second Header Row - Sub Columns */}
            <tr className="border-b border-gray-200">
              {/* Demand columns are merged with rowSpan, no sub-columns needed */}

              {/* Avg. Compset is merged with rowSpan, no sub-columns needed */}

              {/* Subscriber Sub-columns */}
              <th className="bg-blue-50 text-left py-1.5 pl-2 font-semibold text-xs text-muted-foreground">
                Rate
              </th>
              <th className="bg-blue-50 text-left py-1.5 pl-3 font-semibold text-xs text-muted-foreground border-r border-gray-200" style={{ width: '50px' }}>

              </th>
              <th className="bg-blue-50 text-center py-1.5 px-0.5 font-semibold text-xs text-muted-foreground border-r border-gray-200" style={{ width: '30px' }}>
                Rank
              </th>

              {/* Dynamic Competitor Sub-columns */}
              {(() => {
                const competitorNames = transformedData.competitors.map(comp => comp.propertName);
                const visibleCompetitors = competitorNames.slice(competitorStartIndex, competitorStartIndex + 5);

                // Always show exactly 5 columns, fill with placeholders if needed
                const columnsToShow = [];
                for (let i = 0; i < 5; i++) {
                  if (i < visibleCompetitors.length) {
                    columnsToShow.push(visibleCompetitors[i]);
                  } else {
                    columnsToShow.push(null); // Placeholder
                  }
                }

                return columnsToShow.map((name, compIndex) => (
                  <React.Fragment key={compIndex}>
                    <th className="text-left py-1.5 pl-2 font-semibold text-xs text-muted-foreground">
                      {name ? 'Rate' : ''}
                    </th>
                    <th className={`text-left py-1.5 pl-3 font-semibold text-xs text-muted-foreground ${name ? 'border-r border-gray-200' : ''}`} style={{ width: '50px' }}>

                    </th>
                    <th className={`text-center py-1.5 px-0.5 font-semibold text-xs text-muted-foreground ${name ? 'border-r border-gray-200' : ''}`} style={{ width: '30px' }}>
                      {name ? 'Rank' : ''}
                    </th>
                  </React.Fragment>
                ));
              })()}
            </tr>
          </thead>

          <tbody>
            {tableData.map((row, index) => {
              debugger;
              // Get live data for this row
              const rateEntry = row.rateEntry;
              const compareRateEntry = row.compareRate;
              const avgCompsetEntry = transformedData.avgCompset?.subscriberPropertyRate?.[index];
              const avgCompsetRate = avgCompsetEntry ? parseFloat(avgCompsetEntry.rate) : 0;
              const avgCompsetVariance = avgCompsetEntry?.compsetAvgDifferencePercentage || 0;

              const hotelLowestRate = rateEntry.status === 'O' ? parseFloat(rateEntry.rate) : 0;

              const hotelVariance = hotelLowestRate - row.compareRate || 0;


              // Get competitor data for this row
              const competitors = transformedData.competitors.map(comp => {
                const compRateEntry: any = comp.subscriberPropertyRate?.[index];
                return {
                  ...compRateEntry,
                  rate: compRateEntry?.status === 'O' ? parseFloat(compRateEntry.rate) : 0
                };
              });
              const allRates = [hotelLowestRate, ...competitors.map(c => c.rate || 0)].filter(rate => rate > 0);

              // Sort allRates in ascending order (lowest rate = highest rank)
              const sortedRates = [...new Set(allRates)].sort((a, b) => a - b); // use Set to remove duplicates

              const subscriberRank = sortedRates.indexOf(hotelLowestRate) + 1
              // Calculate dynamic width for subscriber rate
              const subscriberRateWidth = calculateRateColumnWidth(hotelLowestRate);

              const isLastRow = index === 13; // Last row (0-based index, so 13 is the 14th row)

              return (
                <tr
                  key={row.id}
                  className={`${isLastRow ? 'rounded-b-lg' : 'border-b border-gray-200'} group hover:bg-gray-50`}
                >
                  {/* Date Column */}
                  <td className="bg-white group-hover:bg-gray-50 py-2 pl-3 pr-1 font-medium text-foreground text-sm border-r border-gray-200 align-top" style={{ width: '85px' }}>
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <BarChart3
                                  className="w-3 h-3 text-blue-500 cursor-pointer hover:text-blue-600"
                                  style={{ strokeWidth: 2 }}
                                  onClick={() => handleGraphClick(row.date)}
                                />
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="bg-black text-white text-xs px-3 py-2">
                                Rate Evolution
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <span className="text-foreground" style={{ marginLeft: '10px' }}>
                            {row.date.getDate()} {row.date.toLocaleDateString('en', { month: 'short' })},
                          </span>
                          <span className="text-gray-500 text-xs font-normal">{row.dayName}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Demand Value Column */}
                  <td className="bg-white group-hover:bg-gray-50 py-2 text-center text-sm border-r border-gray-200 align-top" style={{ width: '40px', paddingLeft: '1px', paddingRight: '1px' }}>
                    {(() => {
                      // Use MSI (Market Share Index) as demand indicator
                      const demandValue = rateEntry.msi || 0;
                      const getDemandColor = (value: number) => {
                        if (value <= 50) return 'text-blue-300';
                        if (value <= 65) return 'text-blue-600';
                        if (value <= 80) return 'text-red-400';
                        return 'text-red-600';
                      };
                      return <span className={`font-semibold ${getDemandColor(demandValue)}`}>{demandValue}</span>;
                    })()}
                  </td>

                  {/* Demand Event Icon Column */}
                  <td className="bg-white group-hover:bg-gray-50 py-2 text-center text-sm border-r border-gray-200 align-top" style={{ width: '20px', paddingLeft: '1px', paddingRight: '1px' }}>
                    <div className="flex items-center justify-center">
                      {rateEntry.event?.eventDetails?.length > 0 && (
                        <TooltipProvider delayDuration={0}>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400 cursor-default hover:text-amber-500 hover:fill-amber-500 transition-colors duration-200" style={{ marginTop: '4px' }} />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-black text-white text-xs px-2 py-1 max-w-xs">
                              {(() => {
                                const eventNames = rateEntry.event.eventDetails.map(event => event.eventName);
                                const eventText = eventNames.join(', ');

                                if (eventText.length <= 60) {
                                  return <span>{eventText}</span>;
                                }

                                // Find break point around 60 characters
                                const firstLineBreak = eventText.lastIndexOf(', ', 60);
                                const breakPoint = firstLineBreak > 0 ? firstLineBreak + 2 : 60;

                                const firstLine = eventText.substring(0, breakPoint);
                                const remainingText = eventText.substring(breakPoint);

                                if (remainingText.length <= 60) {
                                  return (
                                    <div>
                                      <div>{firstLine}</div>
                                      <div>{remainingText}</div>
                                    </div>
                                  );
                                } else {
                                  const secondLine = remainingText.substring(0, 57) + '...';
                                  return (
                                    <div>
                                      <div>{firstLine}</div>
                                      <div>{secondLine}</div>
                                    </div>
                                  );
                                }
                              })()}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </td>

                  {/* Avg. Compset - Merged */}
                  <td className="bg-white group-hover:bg-gray-50 py-2 pl-2 pr-2 text-left text-sm border-r border-gray-200" style={{ width: '60px' }}>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">
                        {`$${avgCompsetRate.toLocaleString()}`}
                      </span>
                      <span className={`text-xs font-medium ${avgCompsetVariance > 0 ? 'text-red-600' : avgCompsetVariance < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                        {avgCompsetVariance > 0 ? '+' : ''}{avgCompsetVariance !== 0 ? avgCompsetVariance : '--'}
                      </span>
                    </div>
                  </td>

                  {/* Subscriber - Rate */}
                  <td className="bg-blue-50 group-hover:bg-blue-100 py-2 pl-2 text-left text-sm">
                    <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                      <Tooltip delayDuration={0} disableHoverableContent>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col items-start justify-center">
                            <div className="text-left">
                              <span className="font-semibold cursor-pointer">
                                {rateEntry.status === 'O' ? `\u200E ${selectedProperty?.currencySymbol ?? '$'}\u200E ${parseFloat(rateEntry.rate).toLocaleString()}` : 'Closed'}
                              </span>
                            </div>
                            <div className="text-left">
                              <span className={`text-xs font-medium ${hotelVariance > 0 ? 'text-red-600' : hotelVariance < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                {hotelVariance > 0 ? '+' : ''}{hotelVariance !== 0 ? hotelVariance : 'NA'}
                              </span>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <EnhancedTableTooltip
                          date={row.date}
                          dayName={row.dayName}
                          rate={hotelLowestRate}
                          variance={hotelVariance}
                          hotelName={rateEntry.hoverPropertyName}
                          hasEvent={rateEntry.event?.eventDetails?.length > 0}
                          eventNames={rateEntry.event?.eventDetails?.map(event => event.eventName) || []}
                          isLowestRate={(() => {
                            debugger;
                            return rateEntry.lowestRatePropName?.toLowerCase() === rateEntry.hoverPropertyName?.toLowerCase() ? true : false
                          })()}
                          isHighestRate={(() => {
                            return rateEntry.highestRatePropName?.toLowerCase() === rateEntry.hoverPropertyName?.toLowerCase() ? true : false
                          })()}
                          rowIndex={index}
                          rateEntry={rateEntry}
                        />
                      </Tooltip>
                    </TooltipProvider>
                  </td>

                  {/* Subscriber - Inc */}
                  <td className="bg-blue-50 group-hover:bg-blue-100 py-2 pl-3 text-left text-sm border-r border-gray-200" style={{ width: '50px' }}>
                    <div className="flex flex-col items-start justify-center">
                      <div className="flex items-center justify-start" style={{ minHeight: '20px' }}>
                        {(() => {
                          // Get visible competitors for comparison
                          // const visibleCompetitors = competitors.slice(competitorStartIndex, competitorStartIndex + competitorsPerPage);


                          if (allRates.length > 1 && hotelLowestRate > 0) {
                            const minRate = Math.min(...allRates);
                            const maxRate = Math.max(...allRates);

                            if (hotelLowestRate === minRate && hotelLowestRate !== maxRate) {
                              return (
                                <div className="flex items-center" style={{ gap: '8px' }}>
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" style={{ marginLeft: '2px' }}></div>
                                  {row.hasLightningRefresh && (
                                    <Zap className="w-3 h-3 text-blue-500 fill-current" />
                                  )}
                                </div>
                              );
                            } else if (hotelLowestRate === maxRate && hotelLowestRate !== minRate) {
                              return (
                                <div className="flex items-center" style={{ gap: '8px' }}>
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" style={{ marginLeft: '2px' }}></div>
                                  {row.hasLightningRefresh && (
                                    <Zap className="w-3 h-3 text-blue-500 fill-current" />
                                  )}
                                </div>
                              );
                            }
                          }
                          return row.hasLightningRefresh ? (
                            <Zap className="w-3 h-3 text-blue-500 fill-current" />
                          ) : null;
                        })()}
                      </div>
                      <div className="flex items-center justify-start" style={{ minHeight: '20px' }}>
                        {(() => {
                          // Use live inclusion data
                          const inclusion = rateEntry.inclusion?.toLowerCase() || '';
                          if (inclusion.includes('wifi') || inclusion.includes('internet')) return <Wifi className="w-3 h-3 text-gray-600" />;
                          if (inclusion.includes('breakfast') || inclusion.includes('meal')) return <Utensils className="w-3 h-3 text-gray-600" />;
                          if (inclusion.includes('parking') || inclusion.includes('car')) return <Car className="w-3 h-3 text-gray-600" />;
                          if (inclusion.includes('gym') || inclusion.includes('fitness')) return <Dumbbell className="w-3 h-3 text-gray-600" />;
                          return null;
                        })()}
                      </div>
                    </div>
                  </td>


                  {/* Subscriber - Rank */}
                  <td className="bg-blue-50 group-hover:bg-blue-100 py-2 px-0.5 text-center text-sm border-r border-b border-gray-200 align-top" style={{ width: '30px' }}>
                    {subscriberRank}
                  </td>

                  {/* Dynamic Competitor Hotels Data */}
                  {(() => {
                    const visibleCompetitors = competitors.slice(competitorStartIndex, competitorStartIndex + 5);

                    // Always show exactly 5 columns, fill with placeholders if needed
                    const columnsToShow = [];
                    for (let i = 0; i < 5; i++) {
                      if (i < visibleCompetitors.length) {
                        columnsToShow.push(visibleCompetitors[i]);
                      } else {
                        columnsToShow.push(null); // Placeholder
                      }
                    }

                    return columnsToShow.map((competitor, compIndex) => (
                      <React.Fragment key={compIndex}>
                        {/* Rate */}
                        <td className="py-2 pl-2 text-left text-sm group-hover:bg-gray-50">
                          {competitor ? (
                            <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                              <Tooltip delayDuration={0} disableHoverableContent>
                                <TooltipTrigger asChild>
                                  <div className="flex flex-col items-start justify-center">
                                    <div className="text-left">
                                      <span className="font-semibold cursor-pointer">
                                        {competitor?.status === 'O' ? `\u200E ${selectedProperty?.currencySymbol ?? '$'}\u200E ${competitor.rate.toLocaleString()}` : 'Closed'}
                                      </span>
                                    </div>
                                    <div className="text-left">
                                      <span className={`text-xs font-medium ${competitor.variance > 0 ? 'text-red-600' : competitor.variance < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                        {competitor.variance > 0 ? '+' : ''}{competitor.variance !== 0 ? competitor.variance : 'NA'}
                                      </span>
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                {competitor?.status === "O" &&
                                  <EnhancedTableTooltip
                                    date={row.date}
                                    dayName={row.dayName}
                                    rate={competitor.rate}
                                    variance={competitor.variance}
                                    hasEvent={rateEntry.event?.eventDetails?.length > 0}
                                    eventNames={rateEntry.event?.eventDetails?.map(event => event.eventName) || []}
                                    hotelName={competitor.hoverPropertyName}
                                    isLowestRate={(() => {
                                      return competitor.lowestRatePropName?.toLowerCase() === competitor.hoverPropertyName?.toLowerCase() ? true : false
                                    })()}
                                    isHighestRate={(() => {
                                      return competitor.highestRatePropName?.toLowerCase() === competitor.hoverPropertyName?.toLowerCase() ? true : false
                                    })()}
                                    rowIndex={index}
                                    rateEntry={competitor}
                                  />}
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <div className="flex flex-col items-start justify-center">
                              <div className="text-left">
                                <span className="font-semibold text-gray-300"></span>
                              </div>
                              <div className="text-left">
                                <span className="text-xs font-medium text-gray-300"></span>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Inc */}
                        <td className={`py-2 pl-3 text-left text-sm group-hover:bg-gray-50 ${competitor ? 'border-r border-gray-200' : ''}`} style={{ width: '50px' }}>
                          {competitor ? (
                            <div className="flex flex-col items-start justify-center">
                              <div className="flex items-center justify-start" style={{ minHeight: '20px' }}>
                                {(() => {
                                  // Get visible competitors for comparison
                                  // const visibleCompetitors = competitors.slice(competitorStartIndex, competitorStartIndex + 5);

                                  if (allRates.length > 1 && competitor.rate > 0) {
                                    const minRate = Math.min(...allRates);
                                    const maxRate = Math.max(...allRates);

                                    if (competitor.rate === minRate && competitor.rate !== maxRate) {
                                      return (
                                        <div className="flex items-center" style={{ gap: '8px' }}>
                                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" style={{ marginLeft: '2px' }}></div>
                                          {row.hasLightningRefresh && (
                                            <Zap className="w-3 h-3 text-blue-500 fill-current" />
                                          )}
                                        </div>
                                      );
                                    } else if (competitor.rate === maxRate && competitor.rate !== minRate) {
                                      return (
                                        <div className="flex items-center" style={{ gap: '8px' }}>
                                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full" style={{ marginLeft: '2px' }}></div>
                                          {row.hasLightningRefresh && (
                                            <Zap className="w-3 h-3 text-blue-500 fill-current" />
                                          )}
                                        </div>
                                      );
                                    }
                                  }
                                  return row.hasLightningRefresh ? (
                                    <Zap className="w-3 h-3 text-blue-500 fill-current" />
                                  ) : null;
                                })()}
                              </div>
                              <div className="flex items-center justify-start" style={{ minHeight: '20px' }}>
                                {(() => {
                                  // Get competitor inclusion data
                                  const compEntity = transformedData.competitors[competitorStartIndex + compIndex];
                                  const compRateEntry = compEntity?.subscriberPropertyRate?.[index];
                                  const inclusion = compRateEntry?.inclusion?.toLowerCase() || '';
                                  if (inclusion.includes('wifi') || inclusion.includes('internet')) return <Wifi className="w-3 h-3 text-gray-600" />;
                                  if (inclusion.includes('breakfast') || inclusion.includes('meal')) return <Utensils className="w-3 h-3 text-gray-600" />;
                                  if (inclusion.includes('parking') || inclusion.includes('car')) return <Car className="w-3 h-3 text-gray-600" />;
                                  if (inclusion.includes('gym') || inclusion.includes('fitness')) return <Dumbbell className="w-3 h-3 text-gray-600" />;
                                  return null;
                                })()}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-start justify-center">
                              <div className="flex items-center justify-start" style={{ minHeight: '20px' }}>
                                {/* Empty placeholder */}
                              </div>
                              <div className="flex items-center justify-start" style={{ minHeight: '20px' }}>
                                {/* Empty placeholder */}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Rank */}
                        <td className={`py-2 px-0.5 text-center text-sm group-hover:bg-gray-50 align-top ${competitor ? 'border-r border-gray-200' : ''}`} style={{ width: '40px' }}>
                          {!!competitor ? competitor?.rate > 0 ? sortedRates.indexOf(competitor.rate) + 1 : '--' : ''}
                        </td>
                      </React.Fragment>
                    ));
                  })()}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Rate Evolution Modal */}
      <RateDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedDate={selectedDate}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
      />
    </div>
  )
}
