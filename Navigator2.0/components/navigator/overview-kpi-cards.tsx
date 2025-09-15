"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Users, Target, AlertTriangle, Eye, Minus, Shield, Calendar, Zap, Star, Info } from "lucide-react"
import { useDateContext } from "@/components/date-context"
import { useComparison, ComparisonOption } from "@/components/comparison-context"
import { format, differenceInDays } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import localStorageService from "@/lib/localstorage"

/**
 * Enhanced KPI Data Configuration
 * Optimized for revenue management with better visual hierarchy
 */
interface KPIMetric {
  id: string
  title: string
  value: string | number
  previousValue: string | number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  changeVisible: false | true
  icon: React.ElementType
  description: string
  format: 'currency' | 'percentage' | 'number' | 'decimal' | 'text'
  color: 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'amber'
  isImportant?: boolean
  gradient?: string
  urgency?: 'low' | 'medium' | 'high' | 'critical'
  currencyCode?: string
  outOfIndex?: number
  comparisonText?: string
}

/**
 * Generate KPI data with always-included Events card
 * Enhanced for revenue managers with focus on actionable insights
 */
function generateKPIData(startDate: Date | null, endDate: Date | null, parityData: any, rateData: any, rateCompData: any, parityDataComp: any, selectedProperty: any, selectedComparison: ComparisonOption): KPIMetric[] {
  // Return empty array if dates are null

  if (!startDate || !endDate) return []

  const days = differenceInDays(endDate, startDate) + 1
  const today = new Date()

  //All Subscriber Rate and Market Positioning Data
  const avgAllSubscriberRate = rateData?.pricePositioningEntites?.find((x: any) => x.propertyType === 0)?.AvgData;
  const avgAllSubscriberStatus = rateData?.pricePositioningEntites?.find((x: any) => x.propertyType === 0)?.AvgStatus;
  const allWithAvg = rateData?.pricePositioningEntites
    ?.filter((x: any) => (typeof x.AvgData === "number") && (x.propertyType === 0 || x.propertyType === 1) && (x.AvgStatus === "O" || x.AvgStatus === "C")) || [];
  const sortedByAvg = [...allWithAvg].sort((a, b) => a.AvgData - b.AvgData);
  const indexOfSubscriber = sortedByAvg.findIndex(x => x.propertyType === 0) + 1;
  //All Compset Subscriber Rate and Market Positioning Data
  const avgAllSubscriberRate_Comp = rateCompData?.pricePositioningEntites?.find((x: any) => x.propertyType === 0)?.AvgData;
  const avgAllSubscribertatus_Comp = rateCompData?.pricePositioningEntites?.find((x: any) => x.propertyType === 0)?.AvgStatus;
  const allWithAvg_Comp = rateCompData?.pricePositioningEntites
    ?.filter((x: any) => (typeof x.AvgData === "number") && (x.propertyType === 0 || x.propertyType === 1) && (x.AvgStatus === "O" || x.AvgStatus === "C")) || [];
  const sortedByAvg_Comp = [...allWithAvg_Comp].sort((a, b) => a.AvgData - b.AvgData);
  const indexOfSubscriber_Comp = sortedByAvg_Comp.findIndex(x => x.propertyType === 0) + 1;
  const eventsData = rateData?.pricePositioningEntites
    ?.find((x: any) => x.propertyType === 0)
    ?.subscriberPropertyRate
    ?.flatMap((x: any) => x.event?.eventDetails || [])
    ?.filter((event: any) => event && event.eventName);

  // Sort by eventName
  const sortedEvents = eventsData?.sort((a: any, b: any) =>
    a.eventName.localeCompare(b.eventName)
  );
  const latestEvent = sortedEvents?.[0];

  // Normalize dates to start of day for accurate comparison
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startDateStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  const endDateStart = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

  // Enhanced date range detection logic
  const isFutureRange = startDateStart > todayStart
  const isPastRange = endDateStart < todayStart
  const isCurrentRange = startDateStart <= todayStart && endDateStart >= todayStart

  console.group('📅 Enhanced KPI Analysis')
  console.log(`Today: ${indexOfSubscriber_Comp}`)
  console.log(`Range: ${indexOfSubscriber}`)
  console.log(`Days: ${days}, Future: ${isFutureRange}, Past: ${isPastRange}, Current: ${isCurrentRange}`)
  console.groupEnd()

  // Enhanced base values with market realism (deterministic for SSR)
  const dateHash = startDateStart.getTime() % 1000 // Use date for deterministic "randomness" 
  const parityBase = parityData?.otaViolationChannelRate?.overallWinMeetLoss.parityScore

  const parityBase_Comp = parityDataComp?.otaViolationChannelRate?.overallWinMeetLoss.parityScore
  // Core revenue metrics
  const baseKPIs: KPIMetric[] = [
    {
      id: 'average-rate',
      title: 'Average Daily Rate',
      value: !!avgAllSubscriberRate && avgAllSubscriberStatus == "O" ? avgAllSubscriberRate : avgAllSubscriberStatus === "C" ? "Sold Out" : "--",
      previousValue: avgAllSubscriberRate_Comp,
      change: !!avgAllSubscriberRate_Comp ? ((avgAllSubscriberRate - avgAllSubscriberRate_Comp) / avgAllSubscriberRate_Comp) * 100 : 0,
      changeType: avgAllSubscriberRate >= avgAllSubscriberRate_Comp ? 'increase' : 'decrease',
      changeVisible: avgAllSubscriberStatus === "O" && avgAllSubscribertatus_Comp === "O" ? true : false,
      icon: DollarSign,
      description: `ADR performance`,
      format: 'currency',
      color: 'primary',
      isImportant: true,
      gradient: 'from-blue-500 to-blue-600',
      urgency: Math.abs(((avgAllSubscriberRate - avgAllSubscriberRate_Comp) / avgAllSubscriberRate_Comp) * 100) > 5 ? 'high' : 'medium',
      currencyCode: selectedProperty?.currencySymbol || '$',
      comparisonText: selectedComparison ? selectedComparison === 1 ? 'Yesterday' : selectedComparison === 7 ? 'Last 1 Week' : selectedComparison === 28 ? 'Last 4 Week' : 'Last Quarter' : 'N/A',
    },
    {
      id: 'parity-status',
      title: 'Rate Parity Score',
      value: !!parityBase ? parityBase : 0,
      previousValue: !!parityBase_Comp ? parityBase_Comp : 0,
      change: !!parityBase_Comp ? ((parityBase - parityBase_Comp) / parityBase_Comp) * 100 : 0,
      changeType: parityBase >= parityBase_Comp ? 'increase' : 'decrease',
      changeVisible: true,
      icon: Shield,
      description: `Channel rate consistency`,
      format: 'percentage',
      color: parityBase > 95 ? 'success' : parityBase > 85 ? 'warning' : 'danger',
      isImportant: true,
      gradient: parityBase > 95 ? 'from-emerald-500 to-emerald-600' : parityBase > 85 ? 'from-amber-500 to-amber-600' : 'from-red-500 to-red-600',
      urgency: parityBase < 85 ? 'critical' : parityBase < 95 ? 'high' : 'low',
      comparisonText: selectedComparison ? selectedComparison === 1 ? 'Yesterday' : selectedComparison === 7 ? 'Last 1 Week' : selectedComparison === 28 ? 'Last 4 Week' : 'Last Quarter' : 'N/A',
    },
    {
      id: 'market-position',
      title: 'Price Positioning', // 'Market Ranking',
      value: indexOfSubscriber,
      previousValue: indexOfSubscriber_Comp,
      change: !!indexOfSubscriber_Comp ? ((indexOfSubscriber - indexOfSubscriber_Comp) / indexOfSubscriber_Comp) * 100 : 0, // Inverted for ranking
      changeType: indexOfSubscriber_Comp >= indexOfSubscriber ? 'increase' : 'decrease',
      changeVisible: (avgAllSubscriberStatus === "O" || avgAllSubscriberStatus === "C") && (avgAllSubscribertatus_Comp === "O" || avgAllSubscribertatus_Comp === "C") ? true : false,
      icon: Target,
      description: `Competitive positioning`,
      format: 'number',
      color: 'purple',
      isImportant: true,
      gradient: 'from-purple-500 to-purple-600',
      urgency: indexOfSubscriber > 5 ? 'high' : 'medium',
      outOfIndex: rateData?.pricePositioningEntites?.length - 2 || 0,
      comparisonText: selectedComparison ? selectedComparison === 1 ? 'Yesterday' : selectedComparison === 7 ? 'Last 1 Week' : selectedComparison === 28 ? 'Last 4 Week' : 'Last Quarter' : 'N/A',
    },
  ]
  // Include Events KPI only for current and future dates (revenue managers focus on actionable events)
  const shouldShowEventsKPI = !!latestEvent ? true : false

  if (shouldShowEventsKPI) {
    const dubaiEvents = [
      { name: 'Dubai Shopping Festival', impact: 45, period: 'Jan-Feb', category: 'Shopping' },
      { name: 'Dubai Food Festival', impact: 35, period: 'Feb-Mar', category: 'Culture' },
      { name: 'Art Dubai', impact: 30, period: 'Mar', category: 'Arts' },
      { name: 'Dubai World Cup', impact: 60, period: 'Mar', category: 'Sports' },
      { name: 'GITEX Technology Week', impact: 50, period: 'Oct', category: 'Business' },
      { name: 'Dubai Airshow', impact: 55, period: 'Nov', category: 'Business' },
      { name: 'Dubai Marathon', impact: 25, period: 'Jan', category: 'Sports' },
      { name: 'Global Village Season', impact: 40, period: 'Oct-Apr', category: 'Entertainment' },
      { name: 'Dubai Summer Surprises', impact: 30, period: 'Jun-Aug', category: 'Entertainment' },
      { name: 'Dubai International Film Festival', impact: 35, period: 'Dec', category: 'Culture' },
    ]

    // Select event based on date for consistency
    const eventIndex = Math.floor((startDateStart.getTime() / (1000 * 60 * 60 * 24)) % dubaiEvents.length)
    const selectedEvent = dubaiEvents[eventIndex]

    // Determine event relevance based on date range
    let eventStatus = 'monitoring'
    let eventUrgency: 'low' | 'medium' | 'high' | 'critical' = 'medium'

    if (isFutureRange) {
      eventStatus = 'upcoming'
      eventUrgency = selectedEvent.impact > 50 ? 'high' : 'medium'
    } else if (isCurrentRange) {
      eventStatus = 'active'
      eventUrgency = 'high'
    }

    baseKPIs.push({
      id: 'dubai-events',
      title: `${selectedProperty?.country ?? ''} Events Impact`,
      value: latestEvent?.eventName,
      previousValue: 'No major events',
      change: latestEvent?.eventImpact,
      changeVisible: true,
      changeType: 'increase',
      icon: Calendar,
      description: `${selectedEvent.category} event - ${eventStatus}`,
      format: 'text',
      color: 'amber',
      isImportant: true,
      gradient: 'from-amber-500 to-orange-600',
      urgency: eventUrgency,
    })

    console.log(`🎉 Event KPI: ${selectedEvent.name} (${selectedEvent.impact}% impact, ${eventStatus})`)
  } else {
    console.log(`📅 Events KPI hidden for past dates (revenue manager focus on actionable insights)`)
  }

  return baseKPIs
}

/**
 * Enhanced animated counter with smoother transitions
 */
function useAnimatedCounter(targetValue: number, duration: number = 2000): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrameId: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = 0 + (targetValue - 0) * easeOutQuart // always start from 0

      setCount(currentCount)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        setCount(targetValue)
      }
    }

    // Reset to 0 immediately
    setCount(0)
    animationFrameId = requestAnimationFrame(animate)

    // Cleanup to stop any old animations
    return () => cancelAnimationFrame(animationFrameId)
  }, [targetValue, duration])

  return count
}
/**
 * Enhanced value formatting with better typography
 */
function formatValue(value: number, format: KPIMetric['format'], selectedProperty?: any): string {
  const currencySymbol = selectedProperty?.currencySymbol || '$';
  switch (format) {
    case 'currency':
      const formattedNumber = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        useGrouping: true
      }).format(value)

      return `\u200E${currencySymbol}\u200E ${formattedNumber}`;
    case 'percentage':
      return `${value.toFixed(1)}%`
    case 'decimal':
      return value.toFixed(2)
    case 'number':
      return Math.round(value).toString()
    case 'text':
      return value.toString()
    default:
      return value.toString()
  }
}

/**
 * Enhanced Color System - Neutral/Monochrome approach
 */
function getColorClasses(color: KPIMetric['color'], urgency: KPIMetric['urgency'] = 'medium') {
  const urgencyMultiplier = urgency === 'critical' ? 'shadow-lg' : urgency === 'high' ? 'shadow-md' : 'shadow-sm'

  // Unified neutral color scheme with emphasis on typography and shadows
  const neutralStyle = {
    bg: `bg-white dark:bg-slate-900 ${urgencyMultiplier} border border-slate-200/60 dark:border-slate-700/60`,
    text: 'text-slate-900 dark:text-slate-100',
    icon: 'text-slate-600 dark:text-slate-400',
    accent: 'bg-slate-500',
    border: 'border-slate-200/60 dark:border-slate-700/60',
  }

  return neutralStyle
}

/**
 * Get tooltip content for KPI metrics explaining calculation logic
 */
function getKPITooltipContent(metricId: string): string {
  const tooltips = {
    'average-rate': 'ADR is calculated based on base rate (280) plus date range adjustments and market factors. Compared to previous period to show trend.',
    'parity-status': 'Rate parity measures consistency across distribution channels. Score = base parity (92%) plus date range and market adjustments. >95% is excellent, 85-95% needs attention, <85% is critical.',
    'market-position': 'Competitive ranking among local properties (1-15). Calculated using market position algorithm considering property performance and competitor analysis.',
    'dubai-events': 'Shows major events in Dubai that impact hotel demand and pricing. Includes conferences, exhibitions, holidays and cultural events that drive occupancy.'
  }
  return tooltips[metricId as keyof typeof tooltips] || 'KPI calculation details unavailable.'
}

/**
 * Enhanced KPI Card Component
 * Modern design with improved accessibility and better visual hierarchy
 */
function KPICard({ metric }: { metric: KPIMetric }) {
  const animatedValue = useAnimatedCounter(typeof metric.value === 'number' ? metric.value : 0, 1500)
  const colors = getColorClasses(metric.color, metric.urgency)

  const getTrendIcon = () => {
    if (metric.changeType === 'increase') return <TrendingUp className="w-4 h-4" />
    if (metric.changeType === 'decrease') return <TrendingDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  const getTrendColor = () => {
    if (metric.changeType === 'increase') return 'text-emerald-600 dark:text-emerald-400'
    if (metric.changeType === 'decrease') return 'text-red-600 dark:text-red-400'
    return 'text-slate-600 dark:text-slate-400'
  }

  const getDisplayValue = () => {
    if (metric.format === 'text') return metric.value
    if (typeof metric.value === 'number') {
      return formatValue(animatedValue, metric.format, undefined)
    }
    return metric.value
  }

  const getUrgencyIndicator = () => {
    const urgencyColors = {
      low: 'bg-slate-400',
      medium: 'bg-blue-500',
      high: 'bg-amber-500',
      critical: 'bg-red-500'
    }
    return urgencyColors[metric.urgency || 'medium']
  }

  const getIconColor = () => {
    switch (metric.id) {
      case 'average-rate':
        return 'text-emerald-600 dark:text-emerald-400'
      case 'parity-status':
        return 'text-blue-600 dark:text-blue-400'
      case 'market-position':
        return 'text-purple-600 dark:text-purple-400'
      case 'dubai-events':
        return 'text-amber-600 dark:text-amber-400'
      default:
        return 'text-slate-600 dark:text-slate-400'
    }
  }

  return (
    <Card className="kpi-card-minimal group animate-fade-in">
      <CardContent className="px-6 pt-6 pb-4">
        {/* Header Section - With icon next to title */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {/* <metric.icon className={`w-4 h-4 ${getIconColor()}`} /> */}
              <h3 className="text-minimal-subtitle font-bold text-slate-900 dark:text-slate-100">
                {metric.title}
              </h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-help transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs bg-slate-800 text-white border-slate-700">
                  <p className="text-sm">{getKPITooltipContent(metric.id)}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Value Section - Enhanced prominence */}
        <div>
          <div className="flex items-baseline gap-3 mb-3">
            <div className="flex items-baseline gap-2">
              {metric.format === 'text' ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-9 line-clamp-2 cursor-help">
                      {String(getDisplayValue())}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs bg-slate-800 text-white border-slate-700">
                    <p className="text-sm">{String(getDisplayValue())}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <p className={`text-2xl font-bold tracking-tight ${String(getDisplayValue()).trim().toLowerCase() === 'sold out'
                    ? 'text-emerald-600  dark:text-emerald-100'
                    : 'text-slate-900  dark:text-slate-100'
                  }`}>
                  {metric.id === 'market-position'
                    ? (() => {
                      const v = getDisplayValue();
                      const isZero =
                        v === 0 || v === '0' || Number(v) === 0; // catches "0" and 0
                      return isZero ? '--' : `#${v}`;
                    })()
                    : String(getDisplayValue())
                      .toLowerCase()
                      .replace('international', 'int.')
                      .replace(/\b\w/g, (char) => char.toUpperCase())
                  }
                </p>
              )}
              {metric.id === 'market-position' && metric.outOfIndex !== 0 && metric.changeVisible && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  out of {metric.outOfIndex}
                </span>
              )}
              {/* {metric.id === 'market-position' && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  out of {metric.outOfIndex || 0}
                </span>
              )} */}
            </div>
            {/* {metric.format === 'text' && metric.change > 0 && (
              <Badge className="badge-minimal bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 hover:bg-amber-200 hover:text-amber-900 dark:hover:bg-amber-800 dark:hover:text-amber-100 transition-colors inline-block pr-4 ml-auto font-bold">
                +{metric.change}% impact
              </Badge>
            )} */}
          </div>

          {/* Change Indicator - Enhanced styling */}
          {metric.format !== 'text' && metric.changeVisible && (
            <div className={`flex items-center gap-2 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-bold">
                {Math.abs(metric.change).toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                vs {metric.comparisonText}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Enhanced Overview KPI Cards Component
 * Modern, responsive design optimized for revenue management
 */
export function OverviewKpiCards(props: any) {
  const { startDate, endDate, isLoading: contextIsLoading } = useDateContext()
  const [selectedProperty, setSelectedProperty] = useState<any>(null)

  // Safely get selectedProperty on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const property = localStorageService.get('SelectedProperty')
      setSelectedProperty(property)
    }
  }, [])
  const { selectedComparison } = useComparison()
  const metrics = useMemo(() => {
    // Use default dates if context dates aren't available
    const fallbackStartDate = startDate || new Date()
    const fallbackEndDate = endDate || new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
    if (!startDate || !endDate) return []
    return generateKPIData(fallbackStartDate, fallbackEndDate, props?.parityData, props?.rateData, props?.rateCompData, props?.parityDataComp, selectedProperty, selectedComparison)
  }, [startDate, endDate, props?.parityData, props?.rateData, props?.rateCompData, props?.parityDataComp])





  // Render loading state or actual content based on data availability
  const isLoading = contextIsLoading || !startDate || !endDate

  // console.log('🚨 KPI Loading Status:', {
  //   isLoading,
  //   contextIsLoading,
  //   hasStartDate: !!startDate,
  //   hasEndDate: !!endDate,
  //   metricsLength: metrics.length,
  //   firstMetric: metrics[0]
  // })

  return (
    <TooltipProvider>
      <div className="w-full space-y-4">
        {/* KPI Grid - Show loading or actual content */}
        {isLoading ? (
          <div className="grid gap-4 xl:gap-6 grid-cols-1 md:grid-cols-3 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="kpi-card-minimal animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className={`grid gap-4 xl:gap-6 ${metrics.length === 4
            ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
            : 'grid-cols-1 md:grid-cols-3 xl:grid-cols-3'
            }`}>
            {metrics.map((metric) => (
              <KPICard key={metric.id} metric={metric} />
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
