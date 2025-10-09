"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Target,
  Activity,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  RefreshCw,
  MoreHorizontal
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface ChartData {
  id: string
  title: string
  type: "line" | "bar" | "pie" | "area"
  data: any[]
  description: string
  value: string
  change: number
  changeType: "positive" | "negative" | "neutral"
  isLoading?: boolean
}

interface BusinessInsightsChartProps {
  chartData: ChartData
  className?: string
  onExport?: (chartId: string) => void
  onViewDetails?: (chartId: string) => void
}

export function BusinessInsightsChart({ 
  chartData, 
  className,
  onExport,
  onViewDetails 
}: BusinessInsightsChartProps) {
  const [isLoading, setIsLoading] = useState(chartData.isLoading || false)

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case "positive":
        return <ArrowUpRight className="w-4 h-4 text-emerald-600" />
      case "negative":
        return <ArrowDownRight className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case "positive":
        return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400"
      case "negative":
        return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  const getChartIcon = (type: string) => {
    switch (type) {
      case "line":
        return <LineChart className="w-8 h-8" />
      case "bar":
        return <BarChart3 className="w-8 h-8" />
      case "pie":
        return <PieChart className="w-8 h-8" />
      case "area":
        return <TrendingUp className="w-8 h-8" />
      default:
        return <BarChart3 className="w-8 h-8" />
    }
  }

  const handleExport = () => {
    onExport?.(chartData.id)
  }

  const handleViewDetails = () => {
    onViewDetails?.(chartData.id)
  }

  return (
    <Card className={cn("card-elevated", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950 dark:to-purple-950">
              {getChartIcon(chartData.type)}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{chartData.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{chartData.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getChangeColor(chartData.changeType)}>
              <div className="flex items-center gap-1">
                {getChangeIcon(chartData.changeType)}
                <span className="text-xs font-medium">
                  {chartData.changeType === "positive" ? "+" : ""}{chartData.change}%
                </span>
              </div>
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleViewDetails}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-2">
              <RefreshCw className="w-8 h-8 text-muted-foreground animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chart Value Display */}
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-foreground mb-2">
                {chartData.value}
              </div>
              <div className="text-sm text-muted-foreground">
                Current Period Performance
              </div>
            </div>
            
            {/* Placeholder Chart Area */}
            <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="p-6 rounded-full bg-white/80 dark:bg-slate-900/80">
                  {getChartIcon(chartData.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{chartData.title}</h3>
                  <p className="text-sm text-muted-foreground">{chartData.description}</p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={handleViewDetails} className="gap-2">
                    <Eye className="w-4 h-4" />
                    View Details
                  </Button>
                  <Button size="sm" onClick={handleExport} className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface BusinessInsightsChartsGridProps {
  charts: ChartData[]
  className?: string
  onExport?: (chartId: string) => void
  onViewDetails?: (chartId: string) => void
}

export function BusinessInsightsChartsGrid({ 
  charts, 
  className,
  onExport,
  onViewDetails 
}: BusinessInsightsChartsGridProps) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}>
      {charts.map((chart) => (
        <BusinessInsightsChart
          key={chart.id}
          chartData={chart}
          onExport={onExport}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  )
}


