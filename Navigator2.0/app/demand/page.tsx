"use client"

import React from "react"
import { CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DemandFilterBar } from "@/components/navigator/demand-filter-bar"
import { DemandCalendarOverview } from "@/components/navigator/demand-calendar-overview"
import { DemandForecastChart } from "@/components/navigator/demand-forecast-chart"
import { DemandHeader } from "@/components/navigator/demand-header"
import { DemandSummaryCards } from "@/components/navigator/demand-summary-cards"
import { MyEventsHolidaysTable } from "@/components/navigator/my-events-holidays-table"
import { DemandCalendarMonthView } from "@/components/navigator/demand-calendar-month-view"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Calendar, BarChart3, Activity, Users, Target, Globe, Zap } from "lucide-react"

export default function DemandPage() {
  const handleDemandFiltersChange = (filters: any) => {
    console.log("🔍 Demand filters changed:", filters)
    // Handle demand filter changes here
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
      {/* Enhanced Demand Filter Bar with Sticky Positioning */}
      <div className="sticky top-0 z-40 filter-bar-minimal bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-border/50 shadow-sm transition-shadow duration-200">
        <DemandFilterBar onFiltersChange={handleDemandFiltersChange} />
      </div>

      {/* Professional Header Section */}
      <section className="w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="max-w-7xl xl:max-w-none mx-auto">
            <DemandHeader />
          </div>
        </div>
      </section>

      {/* Demand Calendar Overview - Replaces KPIs */}
      <DemandCalendarOverview />

      {/* Main Content Area */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 lg:py-8 xl:py-10">
        <div className="max-w-7xl xl:max-w-none mx-auto space-y-6 lg:space-y-8">
          
          {/* Summary Cards Section */}
          <section className="w-full">
            <DemandSummaryCards />
          </section>

          {/* Demand Calendar Section */}
          <section className="w-full">
            <Card className="card-elevated animate-fade-in">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                    <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg lg:text-xl xl:text-2xl font-bold text-foreground">Demand Calendar</CardTitle>
                    <CardDescription className="text-sm lg:text-base text-muted-foreground">
                      Monthly view with demand patterns and opportunities
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 xl:p-8">
                <DemandCalendarMonthView />
              </CardContent>
            </Card>
          </section>

          {/* Demand Forecast Chart - No Header */}
          <section className="w-full">
            <Card className="card-elevated animate-fade-in">
              <CardContent className="p-4 lg:p-6 xl:p-8">
                <DemandForecastChart />
              </CardContent>
            </Card>
          </section>

          {/* Events & Holidays Section */}
          <section className="w-full">
            <Card className="card-elevated">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
                      <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg lg:text-xl xl:text-2xl font-bold text-foreground">Events & Holidays</CardTitle>
                      <CardDescription className="text-sm lg:text-base text-muted-foreground">
                        Upcoming events affecting demand patterns
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    4 Active Events
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 xl:p-8">
                <MyEventsHolidaysTable />
              </CardContent>
            </Card>
          </section>

        </div>
      </div>


    </div>
  )
}
