"use client"
import React, { useMemo, useState } from "react"
import { BarChart3, Calendar, Star, Wifi, Coffee, Utensils, Car, Dumbbell, ChevronLeft, ChevronRight } from "lucide-react"
import { useDateContext } from "@/components/date-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { EnhancedTableTooltip } from "./enhanced-table-tooltip"
import { RateDetailModal } from "./rate-detail-modal"

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
  competitorsPerPage = 4
}: RateTrendsTableProps) {
  const { startDate, endDate } = useDateContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
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

  return (
    <div className={`w-full shadow-xl border border-border/50 bg-white dark:bg-slate-900 ${className || ''}`}>
      
      <div className="rounded-lg overflow-hidden">
        <table className="w-full relative table-fixed">
          {/* Two-Level Sticky Header */}
          <thead className="bg-gray-50">
            {/* First Header Row - Main Column Groups */}
            <tr className="border-b border-gray-200">
              {/* Date Column - Further reduced for space efficiency */}
              <th rowSpan={2} className="bg-gray-50 text-left py-1.5 pl-3 pr-1 font-semibold text-xs text-muted-foreground border-r border-gray-200" style={{width: '50px'}}>
                Date
              </th>
              
              {/* Demand Column (merged) - reduced width */}
              <th rowSpan={2} colSpan={2} className="bg-gray-50 text-center py-1.5 font-semibold text-xs text-muted-foreground border-r border-gray-200" style={{width: '30px', paddingLeft: '1px', paddingRight: '1px'}}>
                Demand
              </th>
              
              {/* Avg. Compset Column Group - further reduced */}
              <th rowSpan={2} className="bg-gray-50 text-left py-1.5 pl-2 pr-2 font-semibold text-xs text-muted-foreground border-r border-gray-200" style={{width: '33px'}}>
                <div className="flex flex-col">
                  <span>Avg.</span>
                  <span>Compset</span>
                </div>
              </th>
              
              {/* Subscriber Column Group - reduced colspan width */}
              <th colSpan={2} className="bg-blue-50 text-center py-1.5 px-1 font-semibold text-xs text-muted-foreground border-r border-gray-200" style={{width: '64px'}}>
                Subscriber
              </th>
              
              {/* Dynamic Competitor Hotels */}
              {(() => {
                const competitorNames = ['Holiday Inn Express & Suites Downtown Business Center', 'acom Hotel', 'InterCity Hotel', 'Hilton Garden', 'Marriott Suites', 'Sheraton Plaza', 'Holiday Inn', 'Crowne Plaza', 'Four Seasons'];
                const visibleCompetitors = competitorNames.slice(competitorStartIndex, competitorStartIndex + competitorsPerPage);
                
                return visibleCompetitors.map((name, index) => (
                  <th key={index} colSpan={2} className="text-center py-1.5 px-1 font-semibold text-xs text-muted-foreground border-r border-gray-200" style={{width: '64px'}}>
                    {name.length > 15 ? `${name.substring(0, 12)}...` : name}
                  </th>
                ));
              })()}
            </tr>
            
            {/* Second Header Row - Sub Columns */}
            <tr className="border-b border-gray-200">
              {/* Demand columns are merged with rowSpan, no sub-columns needed */}
              
              {/* Avg. Compset is merged with rowSpan, no sub-columns needed */}
              
              {/* Subscriber Sub-columns */}
              <th className="bg-blue-50 text-left py-1.5 pl-2 font-semibold text-xs text-muted-foreground border-r border-gray-200">
                Rate
              </th>
              <th className="bg-blue-50 text-center py-1.5 px-0.5 font-semibold text-xs text-muted-foreground border-r border-gray-200" style={{width: '24px'}}>
                Rank
              </th>
              
              {/* Dynamic Competitor Sub-columns */}
              {Array.from({ length: competitorsPerPage }, (_, compIndex) => (
                <React.Fragment key={compIndex}>
                  <th className="text-left py-1.5 pl-2 font-semibold text-xs text-muted-foreground border-r border-gray-200">
                    Rate
                  </th>
                  <th className="text-center py-1.5 px-0.5 font-semibold text-xs text-muted-foreground border-r border-gray-200" style={{width: '24px'}}>
                    Rank
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
                { name: 'Holiday Inn Express & Suites Downtown Business Center', rate: Math.floor(seededRandom(seedValue, 10) * 900) + 50, variance: Math.floor(seededRandom(seedValue, 11) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 12) * 4) + 1 },
                { name: 'acom Hotel', rate: Math.floor(seededRandom(seedValue, 13) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 14) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 15) * 4) + 1 },
                { name: 'InterCity Hotel', rate: Math.floor(seededRandom(seedValue, 16) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 17) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 18) * 4) + 1 },
                { name: 'Hilton Garden', rate: Math.floor(seededRandom(seedValue, 19) * 1200) + 50, variance: Math.floor(seededRandom(seedValue, 20) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 21) * 4) + 1 },
                { name: 'Marriott Suites', rate: Math.floor(seededRandom(seedValue, 22) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 23) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 24) * 4) + 1 },
                { name: 'Sheraton Plaza', rate: Math.floor(seededRandom(seedValue, 25) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 26) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 27) * 4) + 1 },
                { name: 'Holiday Inn', rate: Math.floor(seededRandom(seedValue, 28) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 29) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 30) * 4) + 1 },
                { name: 'Crowne Plaza', rate: Math.floor(seededRandom(seedValue, 31) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 32) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 33) * 4) + 1 },
                { name: 'Four Seasons', rate: Math.floor(seededRandom(seedValue, 34) * 150) + 50, variance: Math.floor(seededRandom(seedValue, 35) * 80) - 40, rank: Math.floor(seededRandom(seedValue, 36) * 4) + 1 }
              ];
              
              // Calculate dynamic width for subscriber rate
              const subscriberRateWidth = calculateRateColumnWidth(hotelLowestRate);
              
              const isLastRow = index === 13; // Last row (0-based index, so 13 is the 14th row)
              
              return (
                <tr 
                  key={row.id} 
                  className={`${isLastRow ? 'rounded-b-lg' : 'border-b border-gray-200'} group hover:bg-gray-50`}
                >
                  {/* Date Column - REDUCED WIDTH FROM 121px TO 105px */}
                    <td className="bg-white group-hover:bg-gray-50 py-2 pl-3 pr-1 font-medium text-foreground text-sm border-r border-gray-200 align-top" style={{width: '50px'}}>
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <BarChart3 
                                  className="w-3 h-3 text-blue-500 cursor-pointer hover:text-blue-600" 
                                  style={{strokeWidth: 2}} 
                                  onClick={() => handleGraphClick(row.date)}
                                />
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="bg-black text-white text-xs px-3 py-2">
                                Rate Evolution
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <span className="text-foreground" style={{marginLeft: '10px'}}>
                            {row.date.getDate()} {row.date.toLocaleDateString('en', {month: 'short'})},
                          </span>
                          <span className="text-gray-500">{row.dayName}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Demand Value Column */}
                  <td className="bg-white group-hover:bg-gray-50 py-2 text-center text-sm border-r border-gray-200 align-top" style={{width: '20px', paddingLeft: '1px', paddingRight: '1px'}}>
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

                  {/* Demand Event Icon Column */}
                  <td className="bg-white group-hover:bg-gray-50 py-2 text-center text-sm border-r border-gray-200 align-top" style={{width: '10px', paddingLeft: '1px', paddingRight: '1px'}}>
                    <div className="flex items-center justify-center">
                      {seededRandom(seedValue, 51) > 0.7 && (
                        <TooltipProvider delayDuration={0}>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400 cursor-default hover:text-amber-500 hover:fill-amber-500 transition-colors duration-200" style={{marginTop: '4px'}} />
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
                  </td>

                  {/* Avg. Compset - Merged */}
                  <td className="bg-white group-hover:bg-gray-50 py-2 pl-2 pr-2 text-left text-sm border-r border-gray-200" style={{width: '33px'}}>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">${avgCompsetRate}</span>
                      <span className={`text-xs font-medium ${avgCompsetVariance > 0 ? 'text-red-600' : avgCompsetVariance < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                        {avgCompsetVariance > 0 ? '+' : ''}{avgCompsetVariance !== 0 ? avgCompsetVariance : '--'}
                      </span>
                    </div>
                  </td>

                  {/* Subscriber - Rate */}
                  <td className="bg-blue-50 group-hover:bg-blue-100 py-2 pl-2 pr-2 text-center text-sm border-r border-b border-gray-200" style={{width: subscriberRateWidth, minWidth: '52px'}}>
                    <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                      <Tooltip delayDuration={0} disableHoverableContent>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-start w-full" style={{gap: '10px'}}>
                               {/* Column 1: Rates & Variance */}
                               <div className="flex flex-col items-start justify-center">
                                 <div className="text-left">
                                   <span className="font-semibold cursor-pointer">{hotelLowestRate === 0 ? 'Sold Out' : `$${hotelLowestRate}`}</span>
                                 </div>
                                 <div className="text-left">
                                   <span className={`text-xs font-medium ${hotelVariance > 0 ? 'text-red-600' : hotelVariance < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                     {hotelVariance > 0 ? '+' : ''}{hotelVariance !== 0 ? hotelVariance : 'NA'}
                                   </span>
                                 </div>
                               </div>
                               
                               {/* Column 2: Dots & Inclusion Icons */}
                               <div className="flex flex-col items-center justify-center" style={{minWidth: '20px'}}>
                                 <div className="flex items-center justify-center" style={{minHeight: '20px'}}>
                                   {(() => {
                                     // Get visible competitors for comparison
                                     const visibleCompetitors = competitors.slice(competitorStartIndex, competitorStartIndex + competitorsPerPage);
                                     const allRates = [hotelLowestRate, ...visibleCompetitors.map(c => c.rate)].filter(rate => rate > 0);
                                     
                                     if (allRates.length > 1 && hotelLowestRate > 0) {
                                       const minRate = Math.min(...allRates);
                                       const maxRate = Math.max(...allRates);
                                       
                                       if (hotelLowestRate === minRate && hotelLowestRate !== maxRate) {
                                         return <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>;
                                       } else if (hotelLowestRate === maxRate && hotelLowestRate !== minRate) {
                                         return <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>;
                                       }
                                     }
                                     return null;
                                   })()}
                                 </div>
                                 <div className="flex items-center justify-center" style={{minHeight: '20px'}}>
                                   {(() => {
                                     const inclusionType = Math.floor(seededRandom(seedValue, 41) * 4);
                                     if (inclusionType === 0) return <Wifi className="w-3 h-3 text-gray-600" />;
                                     if (inclusionType === 1) return <Coffee className="w-3 h-3 text-gray-600" />;
                                     if (inclusionType === 2) return <Utensils className="w-3 h-3 text-gray-600" />;
                                     return <Car className="w-3 h-3 text-gray-600" />;
                                   })()}
                                 </div>
                               </div>
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


                  {/* Subscriber - Rank */}
                  <td className="bg-blue-50 group-hover:bg-blue-100 py-2 px-0.5 text-center text-sm border-r border-b border-gray-200 align-top" style={{width: '24px'}}>
                    {subscriberRank}
                  </td>

                  {/* Dynamic Competitor Hotels Data */}
                  {competitors.slice(competitorStartIndex, competitorStartIndex + competitorsPerPage).map((competitor, compIndex) => (
                    <React.Fragment key={compIndex}>
                      {/* Rate */}
                      <td className="py-2 pl-2 pr-2 text-center text-sm border-r border-gray-200 group-hover:bg-gray-50" style={{width: calculateRateColumnWidth(competitor.rate), minWidth: '52px'}}>
                        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                          <Tooltip delayDuration={0} disableHoverableContent>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-start w-full" style={{gap: '10px'}}>
                                   {/* Column 1: Rates & Variance */}
                                   <div className="flex flex-col items-start justify-center">
                                     <div className="text-left">
                                       <span className="font-semibold cursor-pointer">{competitor.rate === 0 ? 'Sold Out' : `$${competitor.rate}`}</span>
                                     </div>
                                     <div className="text-left">
                                       <span className={`text-xs font-medium ${competitor.variance > 0 ? 'text-red-600' : competitor.variance < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                         {competitor.variance > 0 ? '+' : ''}{competitor.variance !== 0 ? competitor.variance : 'NA'}
                                       </span>
                                     </div>
                                   </div>
                                   
                                   {/* Column 2: Dots & Inclusion Icons */}
                                   <div className="flex flex-col items-center justify-center" style={{minWidth: '20px'}}>
                                     <div className="flex items-center justify-center" style={{minHeight: '20px'}}>
                                       {(() => {
                                         // Get visible competitors for comparison
                                         const visibleCompetitors = competitors.slice(competitorStartIndex, competitorStartIndex + competitorsPerPage);
                                         const allRates = [hotelLowestRate, ...visibleCompetitors.map(c => c.rate)].filter(rate => rate > 0);
                                         
                                         if (allRates.length > 1 && competitor.rate > 0) {
                                           const minRate = Math.min(...allRates);
                                           const maxRate = Math.max(...allRates);
                                           
                                           if (competitor.rate === minRate && competitor.rate !== maxRate) {
                                             return <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>;
                                           } else if (competitor.rate === maxRate && competitor.rate !== minRate) {
                                             return <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>;
                                           }
                                         }
                                         return null;
                                       })()}
                                     </div>
                                     <div className="flex items-center justify-center" style={{minHeight: '20px'}}>
                                       {(() => {
                                         const inclusionType = Math.floor(seededRandom(seedValue, 42 + compIndex) * 4);
                                         if (inclusionType === 0) return <Wifi className="w-3 h-3 text-gray-600" />;
                                         if (inclusionType === 1) return <Coffee className="w-3 h-3 text-gray-600" />;
                                         if (inclusionType === 2) return <Utensils className="w-3 h-3 text-gray-600" />;
                                         return <Dumbbell className="w-3 h-3 text-gray-600" />;
                                       })()}
                                     </div>
                                   </div>
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

                      {/* Rank */}
                      <td className="py-2 px-0.5 text-center text-sm border-r border-gray-200 group-hover:bg-gray-50 align-top" style={{width: '24px'}}>
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
