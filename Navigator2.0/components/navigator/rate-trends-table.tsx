"use client"
import React, { useMemo, useState } from "react"
import { BarChart3, Calendar, Star, Wifi, Coffee, Utensils, Car, Dumbbell, ChevronLeft, ChevronRight } from "lucide-react"
import { useDateContext } from "@/components/date-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { EnhancedTableTooltip } from "./enhanced-table-tooltip"

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
        indicatorType: Math.random() > 0.8 ? 'square' : 'circle'
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
}

export function RateTrendsTable({ 
  className, 
  competitorStartIndex = 0, 
  competitorsPerPage = 2 
}: RateTrendsTableProps) {
  const { startDate, endDate } = useDateContext()
  
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

  // Generate table data from calendar data
  const tableData = useMemo(() => {
    return calendarData.flat().map((day, index) => {
      const date = new Date(day.year, day.month, day.date)
      const dayName = weekDays[date.getDay()]
      
      const currentPrice = parseInt(day.currentPrice.replace('$', '').replace(',', ''))
      const priceChange = 0
      
      return {
        id: index,
        date: date,
        dayName,
        dayOfWeek: date.getDay(),
        currentPrice: day.currentPrice,
        priceChange: priceChange,
        comparison: day.comparison,
        isFuture: day.isFuture,
        hasFlag: day.hasFlag,
        flagCountry: day.flagCountry,
        isWeekend: date.getDay() === 5 || date.getDay() === 6,
        eventInfluence: undefined,
        confidence: undefined
      }
    })
  }, [calendarData])

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

  return (
    <div className={`w-full shadow-xl border border-border/50 bg-white dark:bg-slate-900 ${className || ''}`}>
      
      <div className="rounded-lg overflow-hidden">
        <table className="w-full relative table-fixed">
          {/* Two-Level Sticky Header */}
          <thead className="bg-gray-50">
            {/* First Header Row - Main Column Groups */}
            <tr className="border-b border-gray-200">
              {/* Date Column - REDUCED WIDTH FROM 121px TO 105px */}
              <th rowSpan={2} className="bg-gray-50 text-left py-1.5 pl-4 pr-2 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-36" style={{width: '105px'}}>
                Date
              </th>
              
              {/* Demand Column */}
              <th rowSpan={2} className="bg-gray-50 text-center py-1.5 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-15" style={{width: '60px', paddingLeft: '2px', paddingRight: '2px'}}>
                Demand
              </th>
              
              {/* Avg. Compset Column Group */}
              <th colSpan={2} className="bg-gray-50 text-center py-1.5 px-2 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-24">
                Avg. Compset
              </th>
              
              {/* Subscriber Column Group */}
              <th colSpan={4} className="bg-blue-50 text-center py-1.5 px-2 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-40">
                Subscriber
              </th>
              
              {/* Dynamic Competitor Hotels */}
              {(() => {
                const competitorNames = ['Holiday Inn Express & Suites Downtown Business Center', 'acom Hotel', 'InterCity Hotel', 'Hilton Garden', 'Marriott Suites', 'Sheraton Plaza', 'Holiday Inn', 'Crowne Plaza', 'Four Seasons'];
                const visibleCompetitors = competitorNames.slice(competitorStartIndex, competitorStartIndex + competitorsPerPage);
                
                return visibleCompetitors.map((name, index) => (
                  <th key={index} colSpan={4} className="text-center py-1.5 px-2 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-40">
                    {name.length > 30 ? `${name.substring(0, 30)}..` : name}
                  </th>
                ));
              })()}
            </tr>
            
            {/* Second Header Row - Sub Columns */}
            <tr className="border-b border-gray-200">
              {/* Avg. Compset Sub-columns */}
              <th className="bg-gray-50 text-center py-1.5 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-12">
                €
              </th>
              <th className="bg-gray-50 text-center py-1.5 px-1 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-12">
                ⟂⇂
              </th>
              
              {/* Subscriber Sub-columns */}
              <th className="bg-blue-50 text-center py-1.5 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-16" style={{width: '64px'}}>
                Rate
              </th>
              <th className="bg-blue-50 text-center py-1.5 px-1 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-12">
                <TooltipProvider delayDuration={0}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <span className="cursor-default">Vari.</span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-black text-white text-xs px-2 py-1">
                      Variance
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </th>
              <th className="bg-blue-50 text-center py-1.5 px-1 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-8">
                <TooltipProvider delayDuration={0}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <span className="cursor-default">Incl.</span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-black text-white text-xs px-2 py-1">
                      Inclusions
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </th>
              <th className="bg-blue-50 text-center py-1.5 px-1 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-8">
                Rank
              </th>
              
              {/* Dynamic Competitor Sub-columns */}
              {Array.from({ length: competitorsPerPage }, (_, compIndex) => (
                <React.Fragment key={compIndex}>
                  <th className="text-center py-1.5 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-16" style={{width: '64px'}}>
                    €
                  </th>
                  <th className="text-center py-1.5 px-1 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-12">
                    ⟂⇂
                  </th>
                  <th className="text-center py-1.5 px-1 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-8">
                    <Utensils className="w-3 h-3 mx-auto" />
                  </th>
                  <th className="text-center py-1.5 px-1 font-semibold text-xs text-muted-foreground border-r border-gray-200 w-8">
                    #
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
                
          <tbody>
            {tableData.slice(0, 14).map((row, index) => {
              // Generate stable data based on row index to prevent refreshing
              const seedValue = index + 1000;
              const seededRandom = (seed: number, offset: number = 0) => {
                const x = Math.sin(seed + offset) * 10000;
                return x - Math.floor(x);
              };
              
              // Sample data for demonstration - now stable
              const avgCompsetRate = Math.floor(seededRandom(seedValue, 1) * 100) + 50;
              const avgCompsetVariance = Math.floor(seededRandom(seedValue, 2) * 50) - 25;
              const hotelLowestRate = Math.floor(seededRandom(seedValue, 3) * 400) + 150;
              const hotelVariance = Math.floor(seededRandom(seedValue, 4) * 80) - 40;
              const subscriberRank = Math.floor(seededRandom(seedValue, 5) * 4) + 1;
              
              // Competitor data - now stable
              const competitors = [
                { name: 'Holiday Inn Express & Suites Downtown Business Center', rate: Math.floor(seededRandom(seedValue, 10) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 11) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 12) * 4) + 1 },
                { name: 'acom Hotel', rate: Math.floor(seededRandom(seedValue, 13) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 14) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 15) * 4) + 1 },
                { name: 'InterCity Hotel', rate: Math.floor(seededRandom(seedValue, 16) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 17) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 18) * 4) + 1 },
                { name: 'Hilton Garden', rate: Math.floor(seededRandom(seedValue, 19) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 20) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 21) * 4) + 1 },
                { name: 'Marriott Suites', rate: Math.floor(seededRandom(seedValue, 22) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 23) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 24) * 4) + 1 },
                { name: 'Sheraton Plaza', rate: Math.floor(seededRandom(seedValue, 25) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 26) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 27) * 4) + 1 },
                { name: 'Holiday Inn', rate: Math.floor(seededRandom(seedValue, 28) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 29) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 30) * 4) + 1 },
                { name: 'Crowne Plaza', rate: Math.floor(seededRandom(seedValue, 31) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 32) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 33) * 4) + 1 },
                { name: 'Four Seasons', rate: Math.floor(seededRandom(seedValue, 34) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 35) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 36) * 4) + 1 }
              ];
              
              const isLastRow = index === 13; // Last row (0-based index, so 13 is the 14th row)
              
              return (
                <tr 
                  key={row.id} 
                  className={`${isLastRow ? 'rounded-b-lg' : 'border-b border-gray-200'} group hover:bg-gray-50`}
                >
                  {/* Date Column - REDUCED WIDTH FROM 121px TO 105px */}
                  <td className="bg-white group-hover:bg-gray-50 py-2 pl-4 pr-2 font-medium text-foreground text-sm border-r border-gray-200" style={{width: '105px'}}>
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3 text-blue-500" style={{strokeWidth: 2}} />
                          <span className="text-foreground" style={{marginLeft: '10px'}}>
                            {row.date.getDate()} {row.date.toLocaleDateString('en', {month: 'short'})}
                          </span>
                          <span className="text-gray-500">{row.dayName}</span>
                        </div>
                        {seededRandom(seedValue, 51) > 0.7 && (
                          <TooltipProvider delayDuration={0}>
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400 cursor-default hover:text-amber-500 hover:fill-amber-500 transition-colors duration-200" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="bg-black text-white text-xs px-2 py-1 max-w-xs">
                                {(() => {
                                  const eventNames = ['Music Festival', 'Food & Wine Expo', 'Tech Conference', 'Art Exhibition'];
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
                    </div>
                  </td>

                  {/* Demand Column */}
                  <td className="bg-white group-hover:bg-gray-50 py-2 text-center text-sm border-r border-gray-200" style={{width: '60px', paddingLeft: '2px', paddingRight: '2px'}}>
                    {(() => {
                      const demandValue = Math.floor(seededRandom(seedValue, 40) * 60) + 40;
                      const getDemandColor = (value: number) => {
                        if (value <= 50) return 'text-blue-300';
                        if (value <= 65) return 'text-blue-600';
                        if (value <= 80) return 'text-red-400';
                        return 'text-red-600';
                      };
                      return <span className={`font-semibold ${getDemandColor(demandValue)}`}>{demandValue}</span>;
                    })()}
                  </td>

                  {/* Avg. Compset - Rate */}
                  <td className="bg-white group-hover:bg-gray-50 py-2 text-center text-sm border-r border-gray-200">
                    <span className="font-semibold">${avgCompsetRate}</span>
                  </td>

                  {/* Avg. Compset - Variance */}
                  <td className="bg-white group-hover:bg-gray-50 py-2 px-1 text-center text-sm border-r border-gray-200">
                    <span className={`text-xs font-medium ${avgCompsetVariance > 0 ? 'text-red-600' : avgCompsetVariance < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {avgCompsetVariance > 0 ? '+' : ''}{avgCompsetVariance !== 0 ? avgCompsetVariance : '--'}
                    </span>
                  </td>

                  {/* Subscriber - Rate */}
                  <td className="bg-blue-50 group-hover:bg-blue-100 py-2 text-center text-sm border-r border-b border-gray-200" style={{width: '64px'}}>
                    <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                      <Tooltip delayDuration={0} disableHoverableContent>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-center">
                            <span className="font-semibold cursor-pointer text-left">{hotelLowestRate === 0 ? 'Sold Out' : `$${hotelLowestRate}`}</span>
                            {(() => {
                              // Get visible competitors for comparison
                              const visibleCompetitors = competitors.slice(competitorStartIndex, competitorStartIndex + competitorsPerPage);
                              const allRates = [hotelLowestRate, ...visibleCompetitors.map(c => c.rate)].filter(rate => rate > 0);
                              
                              if (allRates.length > 1 && hotelLowestRate > 0) {
                                const minRate = Math.min(...allRates);
                                const maxRate = Math.max(...allRates);
                                
                                if (hotelLowestRate === minRate && hotelLowestRate !== maxRate) {
                                  return <div className="w-1.5 h-1.5 bg-green-500 rounded-full" style={{marginLeft: '6px'}}></div>;
                                } else if (hotelLowestRate === maxRate && hotelLowestRate !== minRate) {
                                  return <div className="w-1.5 h-1.5 bg-red-500 rounded-full" style={{marginLeft: '6px'}}></div>;
                                }
                              }
                              return null;
                            })()}
                          </div>
                        </TooltipTrigger>
                        <EnhancedTableTooltip
                          date={row.date}
                          dayName={row.dayName}
                          rate={hotelLowestRate}
                          variance={hotelVariance}
                          hasEvent={seededRandom(seedValue, 51) > 0.7}
                          eventNames={seededRandom(seedValue, 51) > 0.7 ? ['Music Festival', 'Food & Wine Expo'] : []}
                          isLowestRate={(() => {
                            const visibleCompetitors = competitors.slice(competitorStartIndex, competitorStartIndex + competitorsPerPage);
                            const allRates = [hotelLowestRate, ...visibleCompetitors.map(c => c.rate)].filter(rate => rate > 0);
                            if (allRates.length > 1 && hotelLowestRate > 0) {
                              const minRate = Math.min(...allRates);
                              const maxRate = Math.max(...allRates);
                              return hotelLowestRate === minRate && hotelLowestRate !== maxRate;
                            }
                            return false;
                          })()}
                          isHighestRate={(() => {
                            const visibleCompetitors = competitors.slice(competitorStartIndex, competitorStartIndex + competitorsPerPage);
                            const allRates = [hotelLowestRate, ...visibleCompetitors.map(c => c.rate)].filter(rate => rate > 0);
                            if (allRates.length > 1 && hotelLowestRate > 0) {
                              const minRate = Math.min(...allRates);
                              const maxRate = Math.max(...allRates);
                              return hotelLowestRate === maxRate && hotelLowestRate !== minRate;
                            }
                            return false;
                          })()}
                          rowIndex={index}
                        />
                      </Tooltip>
                    </TooltipProvider>
                  </td>

                  {/* Subscriber - Variance */}
                  <td className="bg-blue-50 group-hover:bg-blue-100 py-2 px-1 text-center text-sm border-r border-b border-gray-200">
                    <span className={`text-xs font-medium ${hotelVariance > 0 ? 'text-red-600' : hotelVariance < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {hotelVariance > 0 ? '+' : ''}{hotelVariance !== 0 ? hotelVariance : 'NA'}
                    </span>
                  </td>

                  {/* Subscriber - Inclusions */}
                  <td className="bg-blue-50 group-hover:bg-blue-100 py-2 px-1 text-center text-xs border-r border-b border-gray-200">
                    {(() => {
                      const inclusionType = Math.floor(seededRandom(seedValue, 41) * 4);
                      if (inclusionType === 0) return <Wifi className="w-3 h-3 text-gray-600 mx-auto" />;
                      if (inclusionType === 1) return <Coffee className="w-3 h-3 text-gray-600 mx-auto" />;
                      if (inclusionType === 2) return <Utensils className="w-3 h-3 text-gray-600 mx-auto" />;
                      return <Car className="w-3 h-3 text-gray-600 mx-auto" />;
                    })()}
                  </td>

                  {/* Subscriber - Rank */}
                  <td className="bg-blue-50 group-hover:bg-blue-100 py-2 px-1 text-center text-sm border-r border-b border-gray-200">
                    {subscriberRank}
                  </td>

                  {/* Dynamic Competitor Hotels Data */}
                  {competitors.slice(competitorStartIndex, competitorStartIndex + competitorsPerPage).map((competitor, compIndex) => (
                    <React.Fragment key={compIndex}>
                      {/* Rate */}
                      <td className="py-2 text-center text-sm border-r border-gray-200 group-hover:bg-gray-50">
                        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                          <Tooltip delayDuration={0} disableHoverableContent>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-center">
                                <span className="font-semibold cursor-pointer text-left">{competitor.rate === 0 ? 'Sold Out' : `$${competitor.rate}`}</span>
                                {(() => {
                                  // Get visible competitors for comparison
                                  const visibleCompetitors = competitors.slice(competitorStartIndex, competitorStartIndex + competitorsPerPage);
                                  const allRates = [hotelLowestRate, ...visibleCompetitors.map(c => c.rate)].filter(rate => rate > 0);
                                  
                                  if (allRates.length > 1 && competitor.rate > 0) {
                                    const minRate = Math.min(...allRates);
                                    const maxRate = Math.max(...allRates);
                                    
                                    if (competitor.rate === minRate && competitor.rate !== maxRate) {
                                      return <div className="w-1.5 h-1.5 bg-green-500 rounded-full" style={{marginLeft: '6px'}}></div>;
                                    } else if (competitor.rate === maxRate && competitor.rate !== minRate) {
                                      return <div className="w-1.5 h-1.5 bg-red-500 rounded-full" style={{marginLeft: '6px'}}></div>;
                                    }
                                  }
                                  return null;
                                })()}
                              </div>
                            </TooltipTrigger>
                            <EnhancedTableTooltip
                               date={row.date}
                               dayName={row.dayName}
                               rate={competitor.rate}
                               variance={competitor.variance}
                               hasEvent={seededRandom(seedValue, 51) > 0.7}
                               eventNames={seededRandom(seedValue, 51) > 0.7 ? ['Music Festival', 'Food & Wine Expo'] : []}
                               hotelName={competitor.name}
                               isLowestRate={(() => {
                                 const visibleCompetitors = competitors.slice(competitorStartIndex, competitorStartIndex + competitorsPerPage);
                                 const allRates = [hotelLowestRate, ...visibleCompetitors.map(c => c.rate)].filter(rate => rate > 0);
                                 if (allRates.length > 1 && competitor.rate > 0) {
                                   const minRate = Math.min(...allRates);
                                   const maxRate = Math.max(...allRates);
                                   return competitor.rate === minRate && competitor.rate !== maxRate;
                                 }
                                 return false;
                               })()}
                               isHighestRate={(() => {
                                 const visibleCompetitors = competitors.slice(competitorStartIndex, competitorStartIndex + competitorsPerPage);
                                 const allRates = [hotelLowestRate, ...visibleCompetitors.map(c => c.rate)].filter(rate => rate > 0);
                                 if (allRates.length > 1 && competitor.rate > 0) {
                                   const minRate = Math.min(...allRates);
                                   const maxRate = Math.max(...allRates);
                                   return competitor.rate === maxRate && competitor.rate !== minRate;
                                 }
                                 return false;
                               })()}
                               rowIndex={index}
                             />
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                      
                      {/* Variance */}
                      <td className="py-2 px-1 text-center text-sm border-r border-gray-200 group-hover:bg-gray-50">
                        <span className={`text-xs font-medium ${competitor.variance > 0 ? 'text-red-600' : competitor.variance < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                          {competitor.variance > 0 ? '+' : ''}{competitor.variance !== 0 ? competitor.variance : 'NA'}
                        </span>
                      </td>

                      {/* Inclusions */}
                      <td className="py-2 px-1 text-center text-xs border-r border-gray-200 group-hover:bg-gray-50">
                        {(() => {
                          const inclusionType = Math.floor(seededRandom(seedValue, 42 + compIndex) * 4);
                          if (inclusionType === 0) return <Wifi className="w-3 h-3 text-gray-600 mx-auto" />;
                          if (inclusionType === 1) return <Coffee className="w-3 h-3 text-gray-600 mx-auto" />;
                          if (inclusionType === 2) return <Utensils className="w-3 h-3 text-gray-600 mx-auto" />;
                          return <Dumbbell className="w-3 h-3 text-gray-600 mx-auto" />;
                        })()}
                      </td>

                      {/* Rank */}
                      <td className="py-2 px-1 text-center text-sm border-r border-gray-200 group-hover:bg-gray-50">
                        {competitor.rank}
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
