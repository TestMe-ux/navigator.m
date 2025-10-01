"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Users, Target, AlertTriangle, Eye, Minus, Shield, Calendar, Zap, Star, Info, Network, Building2 } from "lucide-react"
import { useDateContext } from "@/components/date-context"
import { useComparison, ComparisonOption } from "@/components/comparison-context"
import { format, differenceInDays } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LocalStorageService } from "@/lib/localstorage"
import { useSelectedProperty } from "@/hooks/use-local-storage"

/**
 * Enhanced Cluster KPI Data Configuration
 * Optimized for cluster management with better visual hierarchy
 */
interface ClusterKPIMetric {
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
 * Generate Cluster KPI data with cluster-specific metrics
 * Enhanced for cluster managers with focus on cluster performance insights
 */
function generateClusterKPIData(startDate: Date | null, endDate: Date | null, selectedProperty: any, selectedComparison: ComparisonOption): ClusterKPIMetric[] {
  // Return empty array if dates are null
  if (!startDate || !endDate) return []

  const days = differenceInDays(endDate, startDate) + 1
  const today = new Date()

  // Normalize dates to start of day for accurate comparison
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startDateStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  const endDateStart = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

  // Enhanced date range detection logic
  const isFutureRange = startDateStart > todayStart
  const isPastRange = endDateStart < todayStart
  const isCurrentRange = startDateStart <= todayStart && endDateStart >= todayStart

  console.group('📅 Cluster KPI Analysis')
  console.log(`Days: ${days}, Future: ${isFutureRange}, Past: ${isPastRange}, Current: ${isCurrentRange}`)
  console.groupEnd()

  // Enhanced base values with cluster-specific data (deterministic for SSR)
  const dateHash = startDateStart.getTime() % 1000 // Use date for deterministic "randomness" 
  
  // Cluster-specific metrics
  const totalClusters = 12
  const totalProperties = 156
  const avgPerformance = 8.2
  const optimizationRate = 94

  // Previous period values (simulated)
  const prevTotalClusters = 11
  const prevTotalProperties = 148
  const prevAvgPerformance = 7.8
  const prevOptimizationRate = 91

  // Core cluster metrics - Updated to match image requirements
  const baseKPIs: ClusterKPIMetric[] = [
    {
      id: 'cluster-competitive-performance',
      title: 'Competitive Performance',
      value: 82,
      previousValue: 0,
      change: 0,
      changeType: 'neutral',
      changeVisible: false, // Hide difference/variance
      icon: Target,
      description: `Cluster competitive performance metrics`,
      format: 'percentage',
      color: 'primary',
      isImportant: true,
      gradient: 'from-blue-500 to-blue-600',
      urgency: 'medium',
      comparisonText: 'Average',
    },
    {
      id: 'cluster-availability',
      title: 'Availability Performance',
      value: 100,
      previousValue: 0,
      change: 0,
      changeType: 'neutral',
      changeVisible: false, // Hide difference/variance
      icon: Eye,
      description: `Cluster availability metrics`,
      format: 'percentage',
      color: 'success',
      isImportant: true,
      gradient: 'from-emerald-500 to-emerald-600',
      urgency: 'low',
      comparisonText: 'Average',
    },
    {
      id: 'cluster-parity-performance',
      title: 'Parity Performance',
      value: 59,
      previousValue: 0,
      change: 0,
      changeType: 'neutral',
      changeVisible: false, // Hide difference/variance
      icon: Shield,
      description: `Cluster parity performance metrics`,
      format: 'percentage',
      color: 'warning',
      isImportant: true,
      gradient: 'from-amber-500 to-amber-600',
      urgency: 'medium',
      comparisonText: 'Average',
    },
  ]

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
function formatValue(value: number, format: ClusterKPIMetric['format'], selectedProperty?: any): string {
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
function getColorClasses(color: ClusterKPIMetric['color'], urgency: ClusterKPIMetric['urgency'] = 'medium') {
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
 * Get tooltip content for Cluster KPI metrics explaining calculation logic
 */
function getClusterKPITooltipContent(metricId: string): string {
  const tooltips = {
    'total-clusters': 'Total number of active property clusters managed by the system. Clusters group properties based on location, market segment, or performance characteristics.',
    'total-properties': 'Total number of properties currently included in cluster management. This includes all properties across all active clusters.',
    'avg-performance': 'Average revenue improvement across all clusters compared to previous period. Calculated using cluster-specific performance metrics and optimization algorithms.',
    'optimization-rate': 'Overall cluster efficiency score based on automated optimization algorithms, performance metrics, and revenue impact analysis. >95% is excellent, 85-95% needs attention, <85% is critical.'
  }
  return tooltips[metricId as keyof typeof tooltips] || 'Cluster KPI calculation details unavailable.'
}

/**
 * Enhanced Cluster KPI Card Component
 * Modern design with improved accessibility and better visual hierarchy
 */
function ClusterKPICard({ metric }: { metric: ClusterKPIMetric }) {

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
      return formatValue(animatedValue, metric.format, { currencySymbol: metric.currencyCode })
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
      case 'total-clusters':
        return 'text-blue-600 dark:text-blue-400'
      case 'total-properties':
        return 'text-emerald-600 dark:text-emerald-400'
      case 'avg-performance':
        return 'text-amber-600 dark:text-amber-400'
      case 'optimization-rate':
        return 'text-purple-600 dark:text-purple-400'
      default:
        return 'text-slate-600 dark:text-slate-400'
    }
  }

  return (
    <Card className="kpi-card-minimal group animate-fade-in">
      <CardContent className="px-6 pt-6 pb-2">
        {/* Header Section - With icon next to title */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-minimal-subtitle font-bold text-slate-900 dark:text-slate-100">
                {metric.title}
              </h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-help transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs bg-slate-800 text-white border-slate-700">
                  <p className="text-sm">{getClusterKPITooltipContent(metric.id)}</p>
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
                  {String(getDisplayValue())}
                </p>
              )}
            </div>
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
 * Enhanced Cluster KPI Cards Component
 * Modern, responsive design optimized for cluster management
 */
export function ClusterKpiCards(props: any) {
  const { startDate, endDate, isLoading: contextIsLoading } = useDateContext()

  const [selectedProperty] = useSelectedProperty()
  // Safely get selectedProperty on client side only
  const { selectedComparison } = useComparison()
  const metrics = useMemo(() => {
    // Use default dates if context dates aren't available
    const fallbackStartDate = startDate || new Date()
    const fallbackEndDate = endDate || new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
    if (!startDate || !endDate) return []

    return generateClusterKPIData(fallbackStartDate, fallbackEndDate, selectedProperty, selectedComparison)
  }, [startDate, endDate, selectedProperty?.sid])

  // Render loading state or actual content based on data availability
  const isLoading = contextIsLoading || !startDate || !endDate

  return (
    <TooltipProvider>
      <div className="w-full space-y-4">
        {/* KPI Grid - Show loading or actual content */}
        {isLoading ? (
          <div className="grid gap-4 xl:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="kpi-card-minimal animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 xl:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {metrics.map((metric) => (
              <ClusterKPICard key={metric.id} metric={metric} />
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
