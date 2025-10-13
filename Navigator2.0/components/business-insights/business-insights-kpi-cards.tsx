"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Users, Target, AlertTriangle, Eye, Minus, Shield, Calendar, Zap, Star, Info, BarChart3, PieChart, Activity } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { cn } from "@/lib/utils"

/**
 * Business Insights KPI Data Configuration
 * Optimized for business analytics with focus on actionable insights
 */
interface BusinessInsightsKPIMetric {
  id: string
  title: string
  value: string | number
  previousValue: string | number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  changeVisible: boolean
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
 * Generate Business Insights KPI data
 * Enhanced for business analytics with focus on revenue and market insights
 */
function generateBusinessInsightsKPIData(selectedProperty: any): BusinessInsightsKPIMetric[] {
  const today = new Date()
  
  return [
    {
      id: "revenue-growth",
      title: "Revenue Growth",
      value: "$2.4M",
      previousValue: "$2.1M",
      change: 14.3,
      changeType: 'increase',
      changeVisible: true,
      icon: TrendingUp,
      description: "Month-over-month revenue increase",
      format: 'currency',
      color: 'success',
      isImportant: true,
      gradient: "from-emerald-500 to-teal-500",
      urgency: 'medium',
      currencyCode: 'USD'
    },
    {
      id: "market-share",
      title: "Market Share",
      value: "23.7%",
      previousValue: "21.2%",
      change: 11.8,
      changeType: 'increase',
      changeVisible: true,
      icon: Target,
      description: "Market position vs competitors",
      format: 'percentage',
      color: 'primary',
      isImportant: true,
      gradient: "from-blue-500 to-cyan-500",
      urgency: 'medium'
    },
    {
      id: "occupancy-rate",
      title: "Occupancy Rate",
      value: "78.2%",
      previousValue: "75.1%",
      change: 4.1,
      changeType: 'increase',
      changeVisible: true,
      icon: Users,
      description: "Current occupancy performance",
      format: 'percentage',
      color: 'success',
      isImportant: false,
      gradient: "from-green-500 to-emerald-500",
      urgency: 'low'
    },
    {
      id: "adr-performance",
      title: "ADR Performance",
      value: "$245",
      previousValue: "$252",
      change: -2.8,
      changeType: 'decrease',
      changeVisible: true,
      icon: DollarSign,
      description: "Average Daily Rate trend",
      format: 'currency',
      color: 'warning',
      isImportant: true,
      gradient: "from-amber-500 to-orange-500",
      urgency: 'high',
      currencyCode: 'USD'
    },
    {
      id: "revpar-score",
      title: "RevPAR Score",
      value: "$191",
      previousValue: "$189",
      change: 1.1,
      changeType: 'increase',
      changeVisible: true,
      icon: BarChart3,
      description: "Revenue per Available Room",
      format: 'currency',
      color: 'success',
      isImportant: true,
      gradient: "from-purple-500 to-pink-500",
      urgency: 'low',
      currencyCode: 'USD'
    },
    {
      id: "customer-satisfaction",
      title: "Customer Satisfaction",
      value: "4.6",
      previousValue: "4.4",
      change: 4.5,
      changeType: 'increase',
      changeVisible: true,
      icon: Star,
      description: "Average customer rating",
      format: 'decimal',
      color: 'success',
      isImportant: false,
      gradient: "from-yellow-500 to-amber-500",
      urgency: 'low',
      outOfIndex: 5
    },
    {
      id: "booking-efficiency",
      title: "Booking Efficiency",
      value: "87.3%",
      previousValue: "84.7%",
      change: 3.1,
      changeType: 'increase',
      changeVisible: true,
      icon: Activity,
      description: "Conversion rate optimization",
      format: 'percentage',
      color: 'success',
      isImportant: false,
      gradient: "from-teal-500 to-cyan-500",
      urgency: 'low'
    },
    {
      id: "competitive-position",
      title: "Competitive Position",
      value: "3rd",
      previousValue: "4th",
      change: 25.0,
      changeType: 'increase',
      changeVisible: true,
      icon: Target,
      description: "Rank among competitors",
      format: 'text',
      color: 'primary',
      isImportant: true,
      gradient: "from-indigo-500 to-purple-500",
      urgency: 'medium'
    }
  ]
}

interface BusinessInsightsKPICardsProps {
  className?: string
  selectedProperty?: any
  isLoading?: boolean
}

export function BusinessInsightsKPICards({ 
  className, 
  selectedProperty,
  isLoading = false 
}: BusinessInsightsKPICardsProps) {
  const [kpiData, setKpiData] = useState<BusinessInsightsKPIMetric[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Generate KPI data
  useEffect(() => {
    setIsLoadingData(true)
    // Simulate API call
    setTimeout(() => {
      const data = generateBusinessInsightsKPIData(selectedProperty)
      setKpiData(data)
      setIsLoadingData(false)
    }, 1000)
  }, [selectedProperty])

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-3 h-3" />
      case 'decrease':
        return <TrendingDown className="w-3 h-3" />
      default:
        return <Minus className="w-3 h-3" />
    }
  }

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400"
      case 'decrease':
        return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "text-slate-600 bg-slate-50 dark:bg-slate-900/20 dark:text-slate-400"
    }
  }

  const getCardGradient = (gradient: string) => {
    return `bg-gradient-to-br ${gradient}`
  }

  if (isLoadingData || isLoading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6", className)}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="card-minimal animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-4 bg-slate-200 rounded"></div>
                  <div className="h-6 w-16 bg-slate-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 w-20 bg-slate-200 rounded"></div>
                  <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  <div className="h-3 w-32 bg-slate-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6", className)}>
        {kpiData.map((metric) => {
          const Icon = metric.icon
          return (
            <Tooltip key={metric.id}>
              <TooltipTrigger asChild>
                <Card className="card-minimal hover:shadow-lg transition-all duration-200 group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className={cn(
                          "p-2.5 rounded-xl transition-colors",
                          getCardGradient(metric.gradient || "from-slate-500 to-slate-600"),
                          "group-hover:scale-105"
                        )}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        {metric.changeVisible && (
                          <Badge className={getChangeColor(metric.changeType)}>
                            <div className="flex items-center gap-1">
                              {getChangeIcon(metric.changeType)}
                              <span className="text-xs font-medium">
                                {metric.changeType === 'increase' ? '+' : ''}{metric.change.toFixed(1)}%
                              </span>
                            </div>
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        <div className="text-2xl xl:text-3xl font-black text-foreground tracking-tight">
                          {metric.value}
                          {metric.outOfIndex && (
                            <span className="text-sm font-normal text-muted-foreground ml-1">
                              /{metric.outOfIndex}
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-medium text-muted-foreground">
                          {metric.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {metric.description}
                        </div>
                      </div>

                      {/* Urgency Indicator */}
                      {metric.urgency === 'high' && (
                        <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Requires Attention</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-medium">{metric.title}</p>
                  <p className="text-sm">{metric.description}</p>
                  {metric.comparisonText && (
                    <p className="text-xs text-muted-foreground">{metric.comparisonText}</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
