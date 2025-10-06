"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, Building2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * All Properties KPI Cards Component
 * 
 * Displays key performance indicators for all properties with:
 * - Professional card design with consistent spacing
 * - Trend indicators with color-coded arrows
 * - Tooltip support for additional information
 * - Responsive layout that adapts to different screen sizes
 * - Dark mode support
 * 
 * @component
 * @version 1.0.0
 */
export function AllPropertiesKpiCards() {
  const kpiData = [
    {
      id: "total-revenue",
      title: "Total Revenue",
      value: "$2.4M",
      change: "+12.5%",
      trend: "up",
      icon: TrendingUp,
      description: "Total revenue across all properties"
    },
    {
      id: "occupancy-rate",
      title: "Occupancy Rate",
      value: "78%",
      change: "+5.2%",
      trend: "up",
      icon: Users,
      description: "Average occupancy rate across all properties"
    },
    {
      id: "avg-daily-rate",
      title: "Average Daily Rate",
      value: "$285",
      change: "-2.1%",
      trend: "down",
      icon: Building2,
      description: "Average daily rate across all properties"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpiData.map((kpi) => {
        const Icon = kpi.icon
        const isPositiveTrend = kpi.trend === "up"
        
        return (
          <TooltipProvider key={kpi.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="card-elevated animate-fade-in hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {kpi.title}
                      </CardTitle>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {kpi.value}
                      </div>
                      <div className="flex items-center gap-1">
                        {isPositiveTrend ? (
                          <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                        )}
                        <span className={`text-xs font-medium ${
                          isPositiveTrend 
                            ? "text-emerald-600 dark:text-emerald-400" 
                            : "text-red-600 dark:text-red-400"
                        }`}>
                          {kpi.change}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                <p className="text-xs">{kpi.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </div>
  )
}
