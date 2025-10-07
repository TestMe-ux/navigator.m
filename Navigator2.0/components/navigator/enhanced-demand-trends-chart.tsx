"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { isAfter, isBefore, isEqual, subDays } from "date-fns"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { ChevronDown, LineChart, Users, Download, Star, Info } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useDemandDateContext } from "@/components/demand-date-context"
import { format, eachDayOfInterval, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachWeekOfInterval, eachMonthOfInterval, differenceInDays } from "date-fns"
import { toPng } from "html-to-image"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { getDay } from 'date-fns';

type DatasetType = 'pricing' | 'travellers'
type AggregationPeriod = 'day' | 'week' | 'month'
const suffixMap: Record<string, string> = {
  wow: "woW",
  mom: "moM",
  yoy: "yoY",
};

// Helper to safely get value with dynamic key
const getValue = (obj: any, key: string) => obj?.[key] ?? 0;
// Generate trend data based on date range
function generateTrendData(startDate: Date, endDate: Date, demandData: any, rateData: any, filter: any, rateCompData: any, demandCurrencySymbol: any) {
  const days = eachDayOfInterval({ start: startDate, end: endDate })
  const lowestDemandIndex = Math.max(...demandData?.optimaDemand.map((d: any) => d.demandIndex));
  const myRateDatas = rateData?.pricePositioningEntites
    ?.find((x: any) => x.propertyType === 0)
    ?.subscriberPropertyRate || [];
  const myCompRateDatas = rateCompData?.pricePositioningEntites
    ?.find((x: any) => x.propertyType === 0)
    ?.subscriberPropertyRate || [];
  const suffix = suffixMap[filter] || "wow";
  const selectedComparison = filter === "wow" ? 7 : filter === "mom" ? 28 : filter === "yoy" ? 365 : 7;
  return demandData?.optimaDemand.map((demandI: any, index: any) => {
    const myRateData = myRateDatas.find((x: any) => x.checkInDateTime === demandI.checkinDate) || {};
    const comparisonDateStr = format(subDays(demandI.checkinDate, selectedComparison), 'yyyy-MM-dd') + 'T00:00:00';
    const myCompRateData = myCompRateDatas.find((x: any) => x.checkInDateTime === comparisonDateStr) || {};
    // Generate realistic data with some variation
    const checkinDate = parseISO(demandI.checkinDate);
    const baseDemand = Math.floor(1 + Math.sin(index * 0.3) * 1.2 + Math.random() * 1.5)


    const marketADRData = demandI?.hotelADR ? Math.round(Number(demandI.hotelADR)) : 0
    const marketADR = demandCurrencySymbol?.ischatgptData ? (marketADRData * (demandCurrencySymbol?.conversionRate ?? 1)).toFixed(0) : marketADRData
    const hotelADR = Math.round(Math.max(Number(myRateData?.rate) || 0, 0));
    const hotelADRStatus = myRateData?.status;
    const airTravellers = demandI?.oagCapacity ? demandI.oagCapacity : 0
    const compRate = Math.max(Number(myCompRateData?.rate) || 0, 0);
    const compRateStaus = myCompRateData?.status;
    const myPriceVariance =
      !isNaN(compRate) && compRate > 0
        ? Math.round(Number((((hotelADR - compRate) / compRate) * 100)))
        : 0;
    const marketADRVariance = Math.round(Number(getValue(demandI, `${suffix}_Overall_HotelADR`)));
    const airTravellersVariance = Math.round(Number(getValue(demandI, `${suffix}_Overall_OAGCapacity`)));
    const demandVariance = Math.round(Number(getValue(demandI, `${suffix}_Overall_Demand_Index`)));
    // Generate variance percentages (realistic fluctuations)
    // const myPriceVariance = demandI?.woW_Overall_HotelADR ? demandI.woW_Overall_HotelADR : 0
    // const marketADRVariance = demandI?.woW_Overall_HotelADR ? demandI.woW_Overall_HotelADR : 0
    // const airTravellersVariance = demandI?.woW_Overall_OAGCapacity ? demandI.woW_Overall_OAGCapacity : 0
    // const demandVariance = demandI?.woW_Overall_Demand_Index ? demandI.woW_Overall_Demand_Index : 0

    // Generate demand index (0-100 scale) - adjusted for 4 levels
    const demandIndex = demandI?.demandIndex ?? 0 // Convert 1-4 to 0-100 scale
    const demandLevel = getDemandLevelKey(demandIndex);
    // const demandLevel = demandLevelMap[levelKey];
    const dayFormat = format(checkinDate, "d MMM")
    const dateFormatted = format(checkinDate, "MMM d")
    const inboundAirline = demandI?.inboundAirline ? demandI.inboundAirline : [];
    return {
      date: dayFormat,
      dateFormatted: dateFormatted,
      fullDate: checkinDate, // Add full date for event checking
      demandLevel,
      demandIndex,
      hotelADR,
      marketADR,
      airTravellers,
      myPriceVariance,
      marketADRVariance,
      airTravellersVariance,
      demandVariance,
      inboundAirline,
      hotelADRStatus,
      compRateStaus,
      compRate,
      // Keep original keys for backward compatibility
      "Demand level": demandLevel,
      "My ADR": hotelADR,
      "Market ADR": marketADR,
      "Air Travellers": airTravellers,
    }
  })
}

// Generate events for chart dates (similar to calendar logic)
function generateChartEvents(trendData: any[], events: any, holidaysData: any) {
  debugger;
  const eventsData = [
    ...(Array.isArray(events) ? events : []),
    ...(Array.isArray(holidaysData) ? holidaysData : [])
  ];
  // const eventsData = Array.isArray(events) ? events : [];

  return trendData.map((dataPoint) => {

    const dataDate = new Date(dataPoint.fullDate);

    // Find the first matching event where dataDate is between eventFrom and eventTo
    const matchingEvent = eventsData.find((event: any) => {
      const fromDate = new Date(event.eventFrom);
      const toDate = new Date(event.eventTo);

      return dataDate >= fromDate && dataDate <= toDate;
    });
    const matchingEventCount = eventsData.filter((event: any) => {
      const fromDate = new Date(event.eventFrom);
      const toDate = new Date(event.eventTo);

      return dataDate >= fromDate && dataDate <= toDate;
    }).length;

    if (matchingEvent) {
      return {
        ...dataPoint,
        hasEvent: true,
        eventData: {
          title: matchingEvent.eventName,
          category: matchingEvent.formattedEventType || matchingEvent.eventType,
          impact: matchingEvent.eventImpact,
          location: matchingEvent.eventLocation || `${matchingEvent.eventCity}, ${matchingEvent.eventCountry}`,
          date: matchingEvent.displayDate || dataDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          imageUrl: matchingEvent.imageUrl
        },
        eventCount: matchingEventCount
      };
    }

    return {
      ...dataPoint,
      hasEvent: false,
      eventData: null
    };
  });
}

function countryAvgMap(data: any[][]) {
  debugger;
  const totals = new Map<string, { sum: number; count: number }>();

  // Step 1: Aggregate totalflights, excluding "Others"
  data.forEach(day =>
    day.forEach(({ srcCountryName, totalflights }) => {
      if (srcCountryName === "Others") return;

      const curr = totals.get(srcCountryName) || { sum: 0, count: 0 };
      curr.sum += totalflights;
      curr.count += 1;
      totals.set(srcCountryName, curr);
    })
  );

  // Step 2: Calculate averages
  const averages = Array.from(totals.entries()).map(([srcCountryName, { sum, count }]) => ({
    srcCountryName,
    totalflights: +(sum / count).toFixed(0),
  }));

  // Step 3: Sort descending by totalflights
  averages.sort((a, b) => b.totalflights - a.totalflights);

  // Step 4: Top 4 + Others
  const top4 = averages.slice(0, 4);

  const top4Sum = top4.reduce((acc, curr) => acc + curr.totalflights, 0);
  const othersTotal = Math.max(0, 100 - top4Sum); // Cap at 0 to prevent negatives
  if (othersTotal > 0) {

    top4.push({
      srcCountryName: "Others",
      totalflights: othersTotal,
    });
  }

  return top4;
}

// Aggregate daily data into weeks
function aggregateDataByWeek(dailyData: any[], startDate: Date, endDate: Date) {
  const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 }) // Start week on Monday
  return weeks.map((weekStart, weekIndex) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const datatdaily = [...dailyData];
    // Filter dailyData that falls between weekStart and weekEnd (inclusive)
    const weekData = datatdaily.filter((entry) => {
      const entryDate = entry.fullDate; // Ensure it's a Date object
      return (
        (isEqual(entryDate, weekStart) || isAfter(entryDate, weekStart)) &&
        (isEqual(entryDate, weekEnd) || isBefore(entryDate, weekEnd))
      );
    });
    if (weekData.length === 0) return null
    // Calculate averages for the week
    debugger
    const hotelADRStatus = weekData.find(item => item.hotelADRStatus === "O") ? "O" : weekData.find(item => item.hotelADRStatus === "C") ? "C" : "--";
    const compRateStaus = weekData.find(item => item.compRateStaus === "O") ? "O" : weekData.find(item => item.compRateStaus === "C") ? "C" : "--";
    const avgMyPrice = weekData.reduce((sum, item) => sum + item.hotelADR, 0) / weekData.filter(x => x.hotelADR !== 0).length
    const avgMarketADR = Math.round(weekData.reduce((sum, item) => sum + item.marketADR, 0) / weekData.length)
    const avgDemandLevel = Math.round(weekData.reduce((sum, item) => sum + item.demandLevel, 0) / weekData.length)
    const avgAirTravellers = Math.round(weekData.reduce((sum, item) => sum + item.airTravellers, 0) / weekData.length)
    const avgDemandIndex = Math.round(weekData.reduce((sum, item) => sum + item.demandIndex, 0) / weekData.length)

    // Calculate average variances
    const avgMycompRate = weekData.reduce((sum, item) => sum + item.compRate, 0) / weekData.filter(x => x.compRate !== 0).length
    const avgMyPriceVariance = ((avgMyPrice - avgMycompRate) * 100 / avgMycompRate).toFixed(2)
    const avgMarketADRVariance = Math.round(weekData.reduce((sum, item) => sum + item.marketADRVariance, 0) / weekData.length)
    const avgAirTravellersVariance = Math.round(weekData.reduce((sum, item) => sum + item.airTravellersVariance, 0) / weekData.length)
    const avgDemandVariance = Math.round(weekData.reduce((sum, item) => sum + item.demandVariance, 0) / weekData.length)
    const avgInboundAirlineData = countryAvgMap(weekData.map(item => item.inboundAirline || []));
    return {
      date: format(weekStart, "MMM d"),
      dateFormatted: `Week of ${format(weekStart, "MMM d")}`,
      demandLevel: avgDemandLevel,
      demandIndex: avgDemandIndex,
      hotelADR: Math.round(avgMyPrice),
      marketADR: avgMarketADR,
      airTravellers: avgAirTravellers,
      myPriceVariance: avgMyPriceVariance,
      marketADRVariance: avgMarketADRVariance,
      airTravellersVariance: avgAirTravellersVariance,
      demandVariance: avgDemandVariance,
      hotelADRStatus,
      compRateStaus,
      inboundAirline: avgInboundAirlineData,
      "Demand level": avgDemandLevel,
      "My ADR": Math.round(avgMyPrice),
      "Market ADR": avgMarketADR,
      "Air Travellers": avgAirTravellers,
    }
  }).filter(Boolean)
}

// Aggregate daily data into months
function aggregateDataByMonth(dailyData: any[], startDate: Date, endDate: Date) {
  const months = eachMonthOfInterval({ start: startDate, end: endDate })

  return months.map((monthStart, monthIndex) => {
    // Filter dailyData that falls between weekStart and weekEnd (inclusive)
    const monthEnd = endOfMonth(monthStart)
    const datatMonth = [...dailyData];

    const monthData = datatMonth.filter((entry) => {
      const entryDate = entry.fullDate; // Ensure it's a Date object
      return (
        (isEqual(entryDate, monthStart) || isAfter(entryDate, monthStart)) &&
        (isEqual(entryDate, monthEnd) || isBefore(entryDate, monthEnd))
      );
    });
    if (monthData.length === 0) return null

    // Calculate averages for the month
    const hotelADRStatus = monthData.find(item => item.hotelADRStatus === "O") ? "O" : monthData.find(item => item.hotelADRStatus === "C") ? "C" : "--";
    const compRateStaus = monthData.find(item => item.compRateStaus === "O") ? "O" : monthData.find(item => item.compRateStaus === "C") ? "C" : "--";
    const avgMyPrice = monthData.reduce((sum, item) => sum + item.hotelADR, 0) / monthData.filter(x => x.hotelADR !== 0).length
    const avgMarketADR = Math.round(monthData.reduce((sum, item) => sum + item.marketADR, 0) / monthData.length)
    const avgDemandLevel = Math.round(monthData.reduce((sum, item) => sum + item.demandLevel, 0) / monthData.length)
    const avgAirTravellers = Math.round(monthData.reduce((sum, item) => sum + item.airTravellers, 0) / monthData.length)
    const avgDemandIndex = Math.round(monthData.reduce((sum, item) => sum + item.demandIndex, 0) / monthData.length)

    // Calculate average variances
    const avgMycompRate = monthData.reduce((sum, item) => sum + item.compRate, 0) / monthData.filter(x => x.compRate !== 0).length
    const avgMyPriceVariance = ((avgMyPrice - avgMycompRate) * 100 / avgMycompRate).toFixed(2)
    const avgMarketADRVariance = Math.round(monthData.reduce((sum, item) => sum + item.marketADRVariance, 0) / monthData.length)
    const avgAirTravellersVariance = Math.round(monthData.reduce((sum, item) => sum + item.airTravellersVariance, 0) / monthData.length)
    const avgDemandVariance = Math.round(monthData.reduce((sum, item) => sum + item.demandVariance, 0) / monthData.length)
    const avgInboundAirlineData = countryAvgMap(monthData.map(item => item.inboundAirline || []));
    return {
      date: format(monthStart, "MMM yyyy"),
      dateFormatted: format(monthStart, "MMM yyyy"),
      demandLevel: avgDemandLevel,
      demandIndex: avgDemandIndex,
      hotelADR: Math.round(avgMyPrice),
      marketADR: avgMarketADR,
      airTravellers: avgAirTravellers,
      myPriceVariance: avgMyPriceVariance,
      marketADRVariance: avgMarketADRVariance,
      airTravellersVariance: avgAirTravellersVariance,
      demandVariance: avgDemandVariance,
      hotelADRStatus: hotelADRStatus,
      compRateStaus: compRateStaus,
      inboundAirline: avgInboundAirlineData,
      "Demand level": avgDemandLevel,
      "My ADR": Math.round(avgMyPrice),
      "Market ADR": avgMarketADR,
      "Air Travellers": avgAirTravellers,
    }
  }).filter(Boolean)
}

const demandLevelMap: { [key: number]: string } = {
  1: "Low",
  2: "Normal",
  3: "High",
  4: "Very High",
}
function getDemandLevelKey(demandIndex: number): number {
  if (demandIndex < 25) return 1;        // Low
  if (demandIndex < 50) return 2;        // Normal
  if (demandIndex < 75) return 3;        // Elevated
  return 4;                              // High
}
// Custom tooltip component
const CustomTooltip = ({ active, payload, label, datasetType, demandCurrencySymbolState }: any & { datasetType: DatasetType }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    debugger
    const demandColorClass =
      data["Demand level"] === 1 || data["Demand level"] === 2
        ? "text-blue-600 dark:text-blue-400" // Blue for Low and Normal
        : "text-red-600 dark:text-red-400" // Red for Elevated and High

    // Helper function to get variance color (green for negative, red for positive)
    const getVarianceColor = (variance: number) => {
      if (variance < 0) return "text-red-600 dark:text-red-400"
      if (variance > 0) return "text-green-600 dark:text-green-400"
      return "text-gray-600 dark:text-gray-400"
    }

    // Helper function to format variance
    const formatVariance = (variance: number) => {
      const sign = variance > 0 ? "+" : ""
      return `${sign}${variance}%`
    }
    const [selectedProperty] = useSelectedProperty()
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <Card className="p-3 shadow-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm min-w-fit max-w-xs">
        <div className="space-y-2">
          {/* Date Heading */}
          <div className="mb-2">
            <h3 className="text-foreground whitespace-nowrap">
              <span className="text-base font-bold">{data.dateFormatted}</span>
              <span className="text-sm font-normal">, {dayNames[getDay(data.fullDate)]}</span>
            </h3>
          </div>

          {/* Demand Level with Index - Right under date */}
          <div className="mb-1 text-xs flex items-center justify-between gap-6 min-w-fit">
            <div className="whitespace-nowrap">
              <span className="font-semibold text-muted-foreground">Demand:</span>{" "}
              <span className={`font-bold ${demandColorClass}`}>{data.demandIndex} {demandLevelMap[data["Demand level"]]}</span>
            </div>
            <span className={`font-bold ${getVarianceColor(data.demandVariance)} whitespace-nowrap flex-shrink-0`}>
              {formatVariance(data.demandVariance)}
            </span>
          </div>

          {/* Separator Line */}
          <div className="border-b border-slate-200 dark:border-slate-700 pb-1 mb-1"></div>

          {/* Other Data */}
          {datasetType === 'pricing' && (
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between gap-6 min-w-fit">
                <div className="whitespace-nowrap">
                  <span className="font-semibold text-muted-foreground">My ADR:</span>{" "}
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {
                      data.hotelADRStatus === "C" ? "Sold Out" : data.hotelADRStatus === "O" ?
                        `\u200E ${selectedProperty?.currencySymbol ?? '$'}\u200E ${data["My ADR"]}` : "--"
                    }
                  </span>
                </div>
                <span className={`font-bold ${getVarianceColor(data.myPriceVariance)} whitespace-nowrap flex-shrink-0`}>
                  {
                    data.hotelADRStatus === "O" && data.compRateStaus === "O" ? formatVariance(data.myPriceVariance) : (data.compRateStaus !== "O" && data.compRateStaus !== "C") ? "--" : ""
                  }
                </span>
              </div>
              <div className="flex items-center justify-between gap-6 min-w-fit">
                <div className="whitespace-nowrap">
                  <span className="font-semibold text-muted-foreground">Market ADR:</span>{" "}
                  <span className="font-bold text-red-600 dark:text-red-400"> {`\u200E ${demandCurrencySymbolState?.currencySymbol}\u200E`}{data["Market ADR"]}</span>
                </div>
                <span className={`font-bold ${getVarianceColor(data.marketADRVariance)} whitespace-nowrap flex-shrink-0`}>
                  {formatVariance(data.marketADRVariance)}
                </span>
              </div>
            </div>
          )}

          {datasetType === 'travellers' && (
            <>
              <div className="text-xs flex items-center justify-between gap-6 min-w-fit">
                <div className="whitespace-nowrap">
                  <span className="font-semibold text-muted-foreground">Air Travellers:</span>{" "}
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {(data["Air Travellers"] / 1000).toFixed(0)}K
                  </span>
                </div>
                <span className={`font-bold ${getVarianceColor(data.airTravellersVariance)} whitespace-nowrap flex-shrink-0`}>
                  {formatVariance(data.airTravellersVariance)}
                </span>
              </div>

              {/* Separator Line */}
              <div className="border-b border-slate-200 dark:border-slate-600 my-2"></div>

              {/* Inbound Data Section */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-xs">
                  Inbound Data
                </h4>
                <div className="space-y-1 text-xs">
                  {(() => {
                    if (!data.inboundAirline || data.inboundAirline.length === 0) {
                      return <span className="text-muted-foreground">No inbound data available</span>
                    }
                    return data.inboundAirline.map((inboundData: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-muted-foreground font-semibold">{inboundData.srcCountryName}:</span>
                        <span className="font-bold text-foreground">{inboundData.totalflights}%</span>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    )
  }
  return null
}

// Custom legend component with interactive dataset selection and demand filtering
const CustomLegend = ({
  datasetType,
  onDatasetChange,
  enabledDemandLevels,
  onDemandToggle,
  enabledAirtravels
}: {
  datasetType: DatasetType
  onDatasetChange: (value: DatasetType) => void
  enabledDemandLevels: Set<number>
  onDemandToggle: (level: number) => void
  enabledAirtravels: false
}) => {
  const demandColors = [
    { level: "Low", color: "#93c5fd", demandLevel: 1 },         // Blue-300 (light shade of Normal)
    { level: "Normal", color: "#3b82f6", demandLevel: 2 },      // Blue-500 (unchanged)
    { level: "High", color: "#fca5a5", demandLevel: 3 },    // Red-300 (light shade of High)
    { level: "Very High", color: "#dc2626", demandLevel: 4 },        // Red-600 (unchanged)
  ]

  return (
    <div className="flex flex-wrap items-center justify-center pt-4 text-xs" style={{ gap: '60px', marginTop: '5px' }}>
      {/* Interactive Demand Level Legend */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="text-slate-800 dark:text-slate-200 font-medium">Demand (Clickable)</span>
          <UITooltip>
            <TooltipTrigger asChild>
              <Info className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs bg-slate-800 text-white border-slate-700">
              <p className="text-sm">
                Click colored dots to show/hide demand levels on the chart. Demand represents market intensity and booking patterns.
              </p>
            </TooltipContent>
          </UITooltip>
          <span className="text-slate-800 dark:text-slate-200 font-medium">:</span>
        </div>
        <div className="flex items-center gap-2">
          {demandColors.map((item, index) => {
            const isEnabled = enabledDemandLevels.has(item.demandLevel)
            return (
              <UITooltip key={`demand-dot-${item.demandLevel}-${item.level}`} delayDuration={0}>
                <TooltipTrigger asChild>
                  <div
                    className="w-3 h-3 rounded-full cursor-pointer transition-all duration-200 hover:scale-110"
                    style={{
                      backgroundColor: isEnabled ? item.color : '#9ca3af',
                      opacity: isEnabled ? 1 : 0.3,
                      border: isEnabled ? `2px solid ${item.color}` : '2px solid #9ca3af'
                    }}
                    onClick={() => onDemandToggle(item.demandLevel)}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700" key={`tooltip-${item.level}`}>
                  <p className="text-xs">
                    {item.level} - Click to toggle
                  </p>
                </TooltipContent>
              </UITooltip>
            )
          })}
        </div>
      </div>

      {/* Interactive Dataset Selection with Legends */}
      <div className="flex items-center" style={{ gap: '60px' }}>
        {/* Pricing Dataset Option */}
        <div className="flex items-center gap-3">
          <RadioGroup
            value={datasetType}
            onValueChange={(value) => onDatasetChange(value as DatasetType)}
            className="flex"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pricing" id="pricing-legend" className="h-3 w-3" />
              <Label htmlFor="pricing-legend" className="sr-only">Pricing</Label>
            </div>
          </RadioGroup>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5" style={{ backgroundColor: '#0066ff' }} />
              <span className="font-medium text-slate-800 dark:text-slate-200">My ADR</span>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs bg-slate-800 text-white border-slate-700">
                  <p className="text-sm">
                    Your property's Average Daily Rate - the average rate charged per occupied room, calculated by dividing total room revenue by rooms sold.
                  </p>
                </TooltipContent>
              </UITooltip>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: '#ff0000' }} />
              <span className="font-medium text-slate-800 dark:text-slate-200">Market ADR</span>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs bg-slate-800 text-white border-slate-700">
                  <p className="text-sm">
                    Market Average Daily Rate - the average rate charged by competitors in your market segment for comparison and positioning analysis.
                  </p>
                </TooltipContent>
              </UITooltip>
            </div>
          </div>
        </div>

        {/* Air Travellers Dataset Option */}
        {!enabledAirtravels ? (<div className="flex items-center gap-3">
          <RadioGroup
            value={datasetType}
            onValueChange={(value) => onDatasetChange(value as DatasetType)}
            className="flex"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="travellers" id="travellers-legend" className="h-3 w-3" />
              <Label htmlFor="travellers-legend" className="sr-only">Air Travellers</Label>
            </div>
          </RadioGroup>

          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-purple-600" />
            <span className="text-slate-800 dark:text-slate-200 font-medium">Air Travellers {enabledAirtravels}</span>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs bg-slate-800 text-white border-slate-700">
                <p className="text-sm">
                  Number of air passengers arriving at the destination, indicating overall travel demand and market activity levels.
                </p>
              </TooltipContent>
            </UITooltip>
          </div>
        </div>) : ''}

      </div>
    </div>
  )
}

export function EnhancedDemandTrendsChart({ filter, events, holidaysData, demandData, rateData, rateCompData, demandCurrencySymbol }: any) {
  const { theme } = useTheme()
  const [selectedProperty] = useSelectedProperty()
  const { startDate, endDate, isLoading } = useDemandDateContext()
  const [datasetType, setDatasetType] = useState<DatasetType>('pricing')
  const [aggregationPeriod, setAggregationPeriod] = useState<AggregationPeriod>('day')
  const [enabledDemandLevels, setEnabledDemandLevels] = useState<Set<number>>(new Set([1, 2, 3, 4]))
  const enabledAirtravels = demandData?.ischatgptData ?? false;
  demandCurrencySymbol.ischatgptData = enabledAirtravels;

  // Toggle demand level visibility
  const handleDemandToggle = (level: number) => {
    setEnabledDemandLevels(prev => {
      const newSet = new Set(prev)
      if (newSet.has(level)) {
        newSet.delete(level)
      } else {
        newSet.add(level)
      }
      return newSet
    })
  }

  // Download handlers


  const handleDownloadCSV = () => {
    console.log('📊 Downloading data as CSV...', trendData)
    const suffixVs = filter === "wow" ? "WoW" : filter === "mom" ? "MoM" : filter === "yoy" ? "YoY" : "WoW";
    // Create CSV content from trend data
    const headers = datasetType === 'pricing'
      ? ['Date', 'Demand Level', 'Demand Index', 'Demand Variance % (Vs. ' + suffixVs + ')', 'My ADR', 'My ADR Variance % (Vs. ' + suffixVs + ')', 'Market ADR', 'Market ADR Variance % (Vs. ' + suffixVs + ')']
      : ['Date', 'Demand Level', 'Demand Index', 'Demand Variance % (Vs. ' + suffixVs + ')', 'Air Travellers', 'Air Travellers Variance % (Vs. ' + suffixVs + ')', "Source Market (Inbound)"]

    const csvContent = [
      headers.join(','),
      ...trendData.map(row => {
        if (datasetType === 'pricing') {
          debugger;
          return [
            row.dateFormatted,
            demandLevelMap[row.demandLevel],
            row.demandIndex,
            row.demandVariance,
            row.hotelADRStatus === "O" ? row.hotelADR : row.hotelADRStatus === "C" ? "Sold Out" : "--",
            row.compRateStaus === "O" && row.hotelADRStatus === "O" ? row.myPriceVariance : (row.compRateStaus === "C" || row.hotelADRStatus === "C") ? "" : "--",
            row.marketADR,
            row.marketADRVariance
          ].join(',')
        } else {
          const resultInbound = row.inboundAirline.map((item: any) => {
            return `${item.srcCountryName} (${item.totalflights}%)`;
          }).join(" | ");
          return [
            row.dateFormatted,
            demandLevelMap[row.demandLevel],
            row.demandIndex,
            row.demandVariance,
            row.airTravellers,
            row.airTravellersVariance,
            resultInbound
          ].join(',')
        }
      })
    ].join('\n')

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `demand-trends-${datasetType}-${aggregationPeriod}-${format(new Date(), 'yyyyMMddHHmmss')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Calculate date range details for conditional aggregation options and bar sizing
  const dateRangeDetails = useMemo(() => {
    if (!startDate || !endDate) {
      return { daysDifference: 30, canShowWeek: true, canShowMonth: true }
    }
    const daysDifference = differenceInDays(endDate, startDate) + 1
    return {
      daysDifference,
      canShowWeek: daysDifference > 7,
      canShowMonth: daysDifference > 30
    }
  }, [startDate, endDate])

  // Dynamic bar size based on date range
  const barSize = useMemo(() => {
    return dateRangeDetails.daysDifference > 30 ? 9 : 19 // Increased by 5px: 9px for >30 days, 19px for ≤30 days
  }, [dateRangeDetails.daysDifference])

  // Generate and aggregate trend data based on selected date range and aggregation period
  const trendData = useMemo(() => {
    let actualStartDate = startDate
    let actualEndDate = endDate

    if (!startDate || !endDate) {
      // Fallback to default 30-day date range if context not available
      actualStartDate = new Date()
      actualEndDate = new Date(Date.now() + 29 * 24 * 60 * 60 * 1000)
    }
    if (!demandData || demandData.length === 0 || !rateData || Object.keys(rateData).length === 0 || !rateCompData || Object.keys(rateCompData).length === 0) return [];
    // Generate daily data first
    const dailyData = generateTrendData(actualStartDate!, actualEndDate!, demandData, rateData, filter, rateCompData, demandCurrencySymbol)

    // Add event data to daily data
    const dailyDataWithEvents = generateChartEvents(dailyData, events, holidaysData)

    // Apply aggregation based on selected period
    switch (aggregationPeriod) {
      case 'week':
        return aggregateDataByWeek(dailyDataWithEvents, actualStartDate!, actualEndDate!)
      case 'month':
        return aggregateDataByMonth(dailyDataWithEvents, actualStartDate!, actualEndDate!)
      default:
        return dailyDataWithEvents
    }
  }, [startDate, endDate, aggregationPeriod, demandData, rateData, filter, rateCompData, events, holidaysData])

  // Calculate Y-axis domains dynamically
  const demandDomain = [0, 4]
  debugger;
  // Calculate actual price domain from data with robust error handling
  const priceValues = trendData.flatMap(d => [d.hotelADR, d.marketADR]).filter(val => val != null && !isNaN(val))
  const minPrice = priceValues.length > 0 ? Math.min(...priceValues) : 70
  const maxPrice = priceValues.length > 0 ? Math.max(...priceValues) : 150
  const padding = Math.round((maxPrice - minPrice) * 0.05);
  const priceDomain = [Math.max(0, minPrice - padding), maxPrice + padding];
  // const priceDomain = [Math.max(0, minPrice - 10), maxPrice + 10]


  // Calculate travellers domain with actual numeric values
  const travellersValues = trendData.map(d => d.airTravellers).filter(v => v != null && v > 0)
  const minTravellers = travellersValues.length > 0 ? Math.min(...travellersValues) : 35000
  const maxTravellers = travellersValues.length > 0 ? Math.max(...travellersValues) : 45000
  const travellersDomain = [minTravellers - 2000, maxTravellers + 2000]

  // Professional color scheme - stronger, more visible colors
  const myPriceColor = "#0066ff" // bright blue
  const marketAdrColor = "#ff0000" // bright red  
  const travellersColor = "#7c3aed" // purple-600

  // Reset aggregation to 'day' if current selection is not available for the date range
  if (aggregationPeriod === 'week' && !dateRangeDetails.canShowWeek) {
    setAggregationPeriod('day')
  }
  if (aggregationPeriod === 'month' && !dateRangeDetails.canShowMonth) {
    setAggregationPeriod('day')
  }
  const cardRef = useRef<HTMLDivElement>(null);
  const handleDownloadImageRate = () => {
    // console.log("upgrading the a Sum Insured", data);
    if (cardRef.current) {
      toPng(cardRef.current, { cacheBust: true })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = 'Demand_Chart_' + selectedProperty?.sid + '_' + new Date().getTime() + ".png"; // File name
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error("Error generating image:", err);
        });
    }
  };
  return (
    <TooltipProvider>
      <div className="space-y-4 bg-white" ref={cardRef}>
        {/* Header Section with Controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Trends</h3>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-sm bg-slate-800 text-white border-slate-700">
                  <p className="text-sm">
                    Interactive charts showing demand patterns, pricing trends, and travel data over time. Toggle between datasets and filter demand levels using the legend controls.
                  </p>
                </TooltipContent>
              </UITooltip>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Demand forecast and {datasetType === 'pricing' ? 'pricing analysis' : 'air travel data analysis'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Time Period Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs h-8 whitespace-nowrap">
                  View by: {aggregationPeriod.charAt(0).toUpperCase() + aggregationPeriod.slice(1)} <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setAggregationPeriod('day')}
                  className={aggregationPeriod === 'day' ? 'bg-accent' : ''}
                >
                  Day
                </DropdownMenuItem>
                {dateRangeDetails.canShowWeek && (
                  <DropdownMenuItem
                    onClick={() => setAggregationPeriod('week')}
                    className={aggregationPeriod === 'week' ? 'bg-accent' : ''}
                  >
                    Week
                  </DropdownMenuItem>
                )}
                {dateRangeDetails.canShowMonth && (
                  <DropdownMenuItem
                    onClick={() => setAggregationPeriod('month')}
                    className={aggregationPeriod === 'month' ? 'bg-accent' : ''}
                  >
                    Month
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Download Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs h-8">
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownloadImageRate()}>
                  Export as Image
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadCSV()}>
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Chart Section */}
        <div className="pl-1 sm:pl-2 pr-1 sm:pr-2">


          <ResponsiveContainer width="100%" height={400} minHeight={350}>
            <ComposedChart
              key={`chart-${datasetType}-${aggregationPeriod}-${trendData.length}-${Date.now()}`}
              data={trendData}
              margin={{
                top: 20,
                right: 30,
                left: 30,
                bottom: 20
              }}
            >
              {/* Grid */}
              <CartesianGrid
                strokeDasharray="3 3"
                strokeOpacity={theme === "dark" ? 0.2 : 0.4}
                vertical={false}
              />

              {/* X-Axis - Dates */}
              <XAxis
                dataKey="dateFormatted"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: theme === "dark" ? "hsl(var(--muted-foreground))" : "hsl(var(--muted-foreground))",
                }}
                dy={10}
              />

              {/* Primary Y-Axis (Left) - Demand Levels */}
              <YAxis
                yAxisId="demand"
                type="number"
                domain={demandDomain}
                ticks={[1, 2, 3, 4]}
                tickFormatter={(value) => ["Low", "Normal", "High", "Very High"][value - 1]}
                axisLine={false}
                tickLine={false}
                width={90}
                tick={{
                  fontSize: 11,
                  fill: theme === "dark" ? "hsl(var(--muted-foreground))" : "hsl(var(--muted-foreground))",
                }}
              />

              {/* Secondary Y-Axis (Right) - Pricing or Travellers */}
              <YAxis
                yAxisId="secondary"
                orientation="right"
                type="number"
                domain={datasetType === 'pricing' ? priceDomain : travellersDomain}
                axisLine={false}
                tickLine={false}
                width={70}
                tick={{
                  fontSize: 12,
                  fill: theme === "dark" ? "hsl(var(--muted-foreground))" : "hsl(var(--muted-foreground))",
                }}
                ticks={(() => {
                  // Generate custom ticks excluding the lowest value
                  const domain = datasetType === 'pricing' ? priceDomain : travellersDomain
                  const [min, max] = domain
                  const range = max - min
                  const tickCount = 5
                  const step = range / (tickCount - 1)
                  const ticks = []

                  // Skip the first tick (lowest value) and generate the rest
                  for (let i = 1; i < tickCount; i++) {
                    ticks.push(Math.round(min + step * i))
                  }

                  // Debug logging
                  console.log(`🎯 Y-Axis Ticks Debug - Dataset: ${datasetType}`, {
                    domain,
                    min,
                    max,
                    range,
                    step,
                    generatedTicks: ticks
                  })

                  return ticks
                })()}
                tickFormatter={(value) =>
                  datasetType === 'pricing'
                    ? `\u200E ${selectedProperty?.currencySymbol ?? '$'}\u200E ${Math.round(value)}`
                    : `${(value / 1000).toFixed(0)}K`
                }
              />

              {/* Tooltip */}
              <Tooltip
                content={<CustomTooltip datasetType={datasetType} demandCurrencySymbolState={demandCurrencySymbol} />}
                cursor={{ fill: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
              />

              {/* CRITICAL: Bars MUST come first, then Lines for proper rendering */}
              <Bar
                yAxisId="demand"
                dataKey="demandLevel"
                name="Demand Level"
                barSize={barSize}
                radius={[3, 3, 0, 0]}
              >
                {trendData.map((entry, index) => {
                  const demandLevel = entry.demandLevel
                  const isEnabled = enabledDemandLevels.has(demandLevel)

                  // Use consistent demand-based colors (2-color shading system)
                  const demandColors: { [key: number]: string } = {
                    1: '#93c5fd',  // Blue-300 (Low) - light shade of Normal blue
                    2: '#3b82f6',  // Blue-500 (Normal) - unchanged
                    3: '#fca5a5',  // Red-300 (Elevated) - light shade of High red
                    4: '#dc2626'   // Red-600 (High) - unchanged
                  }

                  const demandLevelNames: { [key: number]: string } = {
                    1: "Low Demand",
                    2: "Normal Demand",
                    3: "High Demand",
                    4: "Very High Demand"
                  }

                  const fillColor = isEnabled
                    ? demandColors[demandLevel] || '#3b82f6'
                    : '#9ca3af' // Grey color for disabled bars

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={fillColor}
                      style={{
                        transition: 'fill 0.3s ease-in-out',
                        opacity: isEnabled ? 1 : 0.3
                      }}
                    >
                      <title>
                        {demandLevelNames[demandLevel] || "Unknown Demand"}
                      </title>
                    </Cell>
                  )
                })}
              </Bar>

              {/* Pricing Lines - Enhanced Conditional Rendering with Full Debug */}

              <Line
                hide={datasetType !== 'pricing'}
                yAxisId="secondary"
                type="monotone"
                dataKey="hotelADR"
                name="My ADR"
                stroke={myPriceColor}
                strokeWidth={4}
                connectNulls={false}
                isAnimationActive={false}
                dot={{
                  r: 5,
                  fill: myPriceColor,
                  strokeWidth: 2,
                  stroke: "#ffffff",
                }}
                activeDot={{
                  r: 7,
                  strokeWidth: 2,
                  stroke: "#ffffff",
                  fill: myPriceColor
                }}
              />
              <Line
                hide={datasetType !== 'pricing'}
                yAxisId="secondary"
                type="monotone"
                dataKey="marketADR"
                name="Market ADR"
                stroke={marketAdrColor}
                strokeWidth={4}
                strokeDasharray="12 6"
                connectNulls={false}
                isAnimationActive={false}
                dot={{
                  r: 5,
                  fill: marketAdrColor,
                  strokeWidth: 2,
                  stroke: "#ffffff",
                }}
                activeDot={{
                  r: 7,
                  strokeWidth: 2,
                  stroke: "#ffffff",
                  fill: marketAdrColor
                }}
              />


              {/* Travellers Line */}
              {datasetType === 'travellers' && (
                <Line
                  yAxisId="secondary"
                  type="monotone"
                  dataKey="airTravellers"
                  name="Air Travellers"
                  stroke={travellersColor}
                  strokeWidth={4}
                  connectNulls={false}
                  dot={{
                    r: 5,
                    fill: travellersColor,
                    strokeWidth: 2,
                    stroke: "#ffffff",
                  }}
                  activeDot={{
                    r: 7,
                    strokeWidth: 2,
                    stroke: "#ffffff",
                    fill: travellersColor
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>

          {/* Event Star Icons Above X-Axis Dates */}
          <div className="relative -mt-12 mb-4">
            {/* Precise alignment container that matches Recharts coordinate system */}
            <div
              className="relative"
              style={{
                // Match the exact chart positioning
                marginLeft: '120px', // Y-axis width (90px) + chart left margin (30px)
                marginRight: '30px', // Chart right margin
                width: 'calc(100% - 150px)', // Total available plot area width
                height: '20px'
              }}
            >
              {trendData.map((dataPoint, index) => {
                // ADVANCED POSITIONING ALGORITHM FOR PERFECT ALIGNMENT
                const totalDataPoints = trendData.length;

                // Recharts uses different spacing strategies based on data count
                // This algorithm accounts for internal padding and spacing variations

                let finalPosition;

                if (totalDataPoints === 1) {
                  // Single data point - center of plot area
                  finalPosition = 50;
                } else {
                  // Multiple data points - use precise categorical positioning

                  // Base calculation: equal distribution with center positioning
                  const baseWidth = 100 / totalDataPoints;
                  const basePosition = (index + 0.5) * baseWidth;

                  // Apply correction factors based on empirical analysis
                  if (totalDataPoints <= 7) {
                    // Very short periods (≤7 days) - minimal spacing adjustments
                    finalPosition = basePosition;
                  } else if (totalDataPoints <= 15) {
                    // Short periods (8-15 days) - slight padding adjustment
                    const paddingFactor = 0.98; // 2% padding correction
                    const adjustedWidth = 100 * paddingFactor;
                    const startOffset = (100 - adjustedWidth) / 2;
                    finalPosition = startOffset + (index + 0.5) * (adjustedWidth / totalDataPoints);
                  } else if (totalDataPoints <= 30) {
                    // Medium periods (16-30 days) - standard categorical spacing
                    const paddingFactor = 0.96; // 4% padding correction
                    const adjustedWidth = 100 * paddingFactor;
                    const startOffset = (100 - adjustedWidth) / 2;
                    finalPosition = startOffset + (index + 0.5) * (adjustedWidth / totalDataPoints);
                  } else if (totalDataPoints <= 60) {
                    // Long periods (31-60 days) - tighter spacing with edge protection
                    const paddingFactor = 0.94; // 6% padding correction
                    const adjustedWidth = 100 * paddingFactor;
                    const startOffset = (100 - adjustedWidth) / 2;
                    finalPosition = startOffset + (index + 0.5) * (adjustedWidth / totalDataPoints);
                  } else {
                    // Very long periods (60+ days) - maximum padding for overflow prevention
                    const paddingFactor = 0.92; // 8% padding correction
                    const adjustedWidth = 100 * paddingFactor;
                    const startOffset = (100 - adjustedWidth) / 2;
                    finalPosition = startOffset + (index + 0.5) * (adjustedWidth / totalDataPoints);
                  }
                }

                // Final boundary protection
                finalPosition = Math.max(0.8, Math.min(99.2, finalPosition));

                return (
                  <div
                    key={`event-star-${index}`}
                    className="absolute -translate-x-1/2"
                    style={{
                      left: `${finalPosition}%`,
                      top: '0px',
                      zIndex: 10
                    }}
                  >
                    {dataPoint.hasEvent && dataPoint.eventData && (
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-pointer flex items-center justify-center">
                              <Star
                                className="w-3 h-3 text-amber-500 fill-amber-500 hover:scale-110 transition-transform duration-200 drop-shadow-sm"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="p-3 bg-slate-900 text-white border border-slate-700 rounded-lg shadow-xl max-w-xs">
                            <div className="space-y-2">
                              {/* Date Header */}
                              <div className="text-white font-medium text-sm border-b border-slate-700 pb-2">
                                {dataPoint.eventData.date}
                              </div>

                              {/* Event Details */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                  <span className="font-semibold text-sm text-white">{dataPoint.eventData.title} {dataPoint.eventCount > 1 ? "+" + (dataPoint.eventCount - 1) + " more" : ""}</span>
                                  {dataPoint.eventData.flag && (
                                    <span className="text-sm">{dataPoint.eventData.flag}</span>
                                  )}
                                </div>

                                <div className="text-xs text-gray-300">
                                  {dataPoint.eventData.category} | <span className={`font-medium ${dataPoint.eventData.impact === 'High' ? 'text-red-400' :
                                    dataPoint.eventData.impact === 'High' ? 'text-orange-400' :
                                      dataPoint.eventData.impact === 'Medium' ? 'text-yellow-400' :
                                        'text-green-400'
                                    }`}>
                                    {dataPoint.eventData.impact} Impact
                                  </span>
                                </div>

                                {/* Show additional details for sample event */}
                                {dataPoint.eventData.description && (
                                  <div className="text-xs text-gray-300 mt-1 border-t border-gray-600 pt-1">
                                    <div className="font-medium text-gray-200">Description:</div>
                                    <div>{dataPoint.eventData.description}</div>
                                  </div>
                                )}

                                {dataPoint.eventData.attendees && (
                                  <div className="text-xs text-gray-300">
                                    <span className="font-medium text-gray-200">Expected Attendees:</span> {dataPoint.eventData.attendees.toLocaleString()}
                                  </div>
                                )}

                                {dataPoint.eventData.country && dataPoint.eventData.country !== 'Global' && (
                                  <div className="text-xs text-gray-300">
                                    <span className="font-medium text-gray-200">Country:</span> {dataPoint.eventData.country}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Legend with Interactive Dataset Selection and Demand Filtering */}
          <CustomLegend
            datasetType={datasetType}
            onDatasetChange={setDatasetType}
            enabledDemandLevels={enabledDemandLevels}
            onDemandToggle={handleDemandToggle}
            enabledAirtravels={enabledAirtravels}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}