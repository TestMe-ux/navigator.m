"use client"

import React, { useState, useEffect } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, BarChart3, DollarSign, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import localStorageService from "@/lib/localstorage"
import { useSelectedProperty } from "@/hooks/use-local-storage"


interface SummaryCardProps {
  title: string
  value: string
  description?: string
  trend?: string
  trendDirection?: "up" | "down"
  icon: React.ElementType
  iconColorClass: string
  bgColorClass: string
  tooltipId: string
  comparetext: string,
  isVisible?: boolean
}

/**
 * Get tooltip content for demand summary widgets
 */
function getDemandTooltipContent(tooltipId: string): string {
  const tooltips = {
    'avg-market-adr': 'Average Daily Rate represents the average rate charged per occupied room in the market. Calculated by dividing total room revenue by number of rooms sold.',
    'avg-market-revpar': 'Revenue Per Available Room measures hotel performance by dividing total room revenue by total available rooms. Combines occupancy rate and average daily rate.',
    'top-source-market': 'Primary geographic market generating the highest demand volume. Shows percentage share of total bookings and demand from this source market.'
  }
  return tooltips[tooltipId as keyof typeof tooltips] || 'Additional information not available.'
}

function SummaryCard({
  title,
  value,
  description,
  trend,
  trendDirection,
  icon: Icon,
  iconColorClass,
  bgColorClass,
  tooltipId,
  comparetext
}: SummaryCardProps) {
  return (
    <Card className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200 group animate-fade-in">
      <CardContent className="px-4 md:px-6 pt-4 md:pt-6 pb-4 md:pb-6">
        {/* Header Section - With icon next to title */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${iconColorClass}`} />
              <h3 className="text-sm md:text-minimal-subtitle font-bold text-slate-900 dark:text-slate-100">
                {title}
              </h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-help transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs bg-slate-800 text-white border-slate-700">
                  <p className="text-sm">{getDemandTooltipContent(tooltipId)}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Value Section */}
        <div>
          <div className="flex items-baseline gap-3 mb-2">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {value}
              </p>
            </div>
          </div>

          {/* Change Indicator */}
          {trend && (
            <div className={`flex items-center gap-2 ${trendDirection === "up"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
              }`}>
              {trendDirection === "up" ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-bold">
                {!!trend ? trend : ''}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                vs {!!comparetext ? comparetext : 'WoW'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function DemandSummaryCards({ filter, avgDemand, demandAIPerCountryAverageData }: any) {
  const [selectedProperty] = useSelectedProperty()
  const [trendValue, setTrendValue] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  console.log("Filter sumarry card", filter)
  useEffect(() => {
    if (!avgDemand) return;
    let newTrend;
    newTrend = filter === "wow"
      ? avgDemand?.AvrageHotelADRWow
      : filter === "mom"
        ? avgDemand?.AvrageHotelADRMom
        : filter === "yoy"
          ? avgDemand?.AvrageHotelADRYoy
          : avgDemand?.AvrageHotelADRWow;
    console.log("newTrend", newTrend)
    setTrendValue(newTrend);
  }, [filter, avgDemand]);


  // Safe currency symbol that prevents hydration mismatch
  const currencySymbol = mounted ? (selectedProperty?.currencySymbol ?? '$') : '$';
  
  const summaryData: SummaryCardProps[] = [
    {
      title: "Avg. Market ADR",
      value: `\u200E ${currencySymbol}\u200E  ${avgDemand?.AvrageHotelADR?.toFixed(0) || '0'}`,
      trend: `${trendValue}%`,
      trendDirection: `${trendValue > 0 ? "up" : "down"}`,
      icon: DollarSign,
      iconColorClass: "text-emerald-600 dark:text-emerald-400",
      bgColorClass: "bg-emerald-50 dark:bg-emerald-950",
      tooltipId: "avg-market-adr",
      comparetext: filter,
      isVisible: true
    },
    {
      title: "Avg. Market RevPAR",
      value: `\u200E ${currencySymbol}\u200E  ${avgDemand?.AvrageRevPAR?.toFixed(0) || '0'}`,
      trend: "2.1%",
      trendDirection: "up",
      icon: BarChart3,
      iconColorClass: "text-blue-600 dark:text-blue-400",
      bgColorClass: "bg-blue-50 dark:bg-blue-950",
      tooltipId: "avg-market-revpar",
      comparetext: filter,
      isVisible: avgDemand?.AvrageRevPAR > 0 ? true : false
    },
    {
      title: "Top Source Market",
      value: `${demandAIPerCountryAverageData[0]?.srcCountryName}`,
      trend: "",
      trendDirection: "up",
      icon: Users,
      iconColorClass: "text-amber-600 dark:text-amber-400",
      bgColorClass: "bg-amber-50 dark:bg-amber-950",
      tooltipId: "top-source-market",
      comparetext: filter,
      isVisible: !!demandAIPerCountryAverageData[0]?.srcCountryName ? true : false
    },
  ]

  return (
    <TooltipProvider>
      <section className="w-full">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Market Summary</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Key performance indicators and market positioning</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
          {summaryData.filter((data) => data.isVisible).map((data) => (
            <SummaryCard key={data.title} {...data} />
          ))}
        </div>
      </section>
    </TooltipProvider>
  )
}
