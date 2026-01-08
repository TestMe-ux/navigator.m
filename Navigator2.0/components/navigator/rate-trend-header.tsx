"use client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronDown,
  Calendar,
  TrendingUp,
  Grid3X3,
  Download,
  CalendarIcon,
  Filter,
} from "lucide-react"
import { useState } from "react"

interface RateTrendHeaderProps {
  currentView: "calendar" | "chart" | "table"
  onViewChange: (view: "calendar" | "chart" | "table") => void
}

export function RateTrendHeader({ currentView, onViewChange }: RateTrendHeaderProps) {
  const [dateRange, setDateRange] = useState<'7d' | '14d' | '30d' | '90d'>('7d') // Default to 7 days

  // Calculate date ranges with past and future values
  const getDateRangeLabel = (range: string) => {
    const today = new Date()
    const days = range === '7d' ? 7 : range === '14d' ? 14 : range === '30d' ? 30 : 90
    const pastDays = Math.floor(days / 2)
    const futureDays = days - pastDays
    
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - pastDays)
    
    const endDate = new Date(today)
    endDate.setDate(today.getDate() + futureDays)
    
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }



  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 py-4 mb-6">
      
      {/* Left Section - Title & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Rate Trends</h1>
          <p className="text-sm text-muted-foreground">
            Monitor competitive rates and market positioning
          </p>
        </div>


      </div>

      {/* Right Section - Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        
        {/* Date Range Selector - Only show in chart/table view */}
        {currentView !== "calendar" && (
          <>
            <Tabs value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <TabsList className="grid grid-cols-4 w-64">
                <TabsTrigger value="7d" className="text-xs">7 Days</TabsTrigger>
                <TabsTrigger value="14d" className="text-xs">14 Days</TabsTrigger>
                <TabsTrigger value="30d" className="text-xs">30 Days</TabsTrigger>
                <TabsTrigger value="90d" className="text-xs">90 Days</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Date Range Display */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {getDateRangeLabel(dateRange)}
              </span>
            </div>
          </>
        )}

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-3 ${currentView === "calendar" ? "bg-white dark:bg-slate-700 shadow-sm" : ""}`}
            onClick={() => onViewChange("calendar")}
          >
            <Calendar className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Calendar</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-3 ${currentView === "chart" ? "bg-white dark:bg-slate-700 shadow-sm" : ""}`}
            onClick={() => onViewChange("chart")}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Chart</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-3 ${currentView === "table" ? "bg-white dark:bg-slate-700 shadow-sm" : ""}`}
            onClick={() => onViewChange("table")}
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Table</span>
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          
          {/* Export Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export Chart as PNG</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
