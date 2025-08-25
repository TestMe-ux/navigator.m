"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Table,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Clock,
  Play,
  Pause,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { cn } from "@/lib/utils"
import { ParityFilterBar, ParityDateProvider, ParityChannelProvider } from "@/components/parity-filter-bar"
import { ParityCalendarView } from "@/components/parity-calendar-view"
import { ParityOverviewFilterBar } from "@/components/parity-overview-filter-bar"


// Sample data for the parity table
const parityData = [
  {
    date: "Fri 01/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1124, trend: "up", parity: false },
    agoda: { rate: 727, trend: "up", parity: true },
    makeMyTrip: { rate: 580, trend: "up", parity: false },
    lossChannels: ["Vio.com"],
    lowestRate: 727,
  },
  {
    date: "Sat 02/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1124, trend: "up", parity: false },
    agoda: { rate: 583, trend: "up", parity: true },
    makeMyTrip: { rate: 580, trend: "up", parity: false },
    lossChannels: ["Vio.com", "Trip.com"],
    lowestRate: 767,
  },
  {
    date: "Sun 03/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1126, trend: "up", parity: false },
    agoda: { rate: 583, trend: "up", parity: true },
    makeMyTrip: { rate: 580, trend: "up", parity: false },
    lossChannels: ["Roomsxxl", "Vio.com", "Trip.com"],
    lowestRate: 585,
  },
  {
    date: "Mon 04/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1124, trend: "up", parity: false },
    agoda: { rate: 583, trend: "up", parity: true },
    makeMyTrip: { rate: 523, trend: "up", parity: false },
    lossChannels: ["Trip.com", "Vio.com"],
    lowestRate: 721,
  },
  {
    date: "Tue 05/08",
    brandCom: { rate: 688, trend: "down", parity: true },
    bookingCom: { rate: 688, trend: "up", parity: true },
    expedia: { rate: 945, trend: "up", parity: false },
    agoda: { rate: 688, trend: "up", parity: true },
    makeMyTrip: { rate: 385, trend: "up", parity: false },
    lossChannels: ["Roomsxxl", "GoSeek", "Vio.com", "Trip.com"],
    lowestRate: 585,
  },
  {
    date: "Wed 06/08",
    brandCom: { rate: 688, trend: "down", parity: true },
    bookingCom: { rate: 688, trend: "up", parity: true },
    expedia: { rate: 926, trend: "up", parity: false },
    agoda: { rate: 688, trend: "up", parity: true },
    makeMyTrip: { rate: 385, trend: "up", parity: false },
    lossChannels: ["Roomsxxl", "Vio.com", "Trip.com"],
    lowestRate: 585,
  },
  {
    date: "Thu 07/08",
    brandCom: { rate: 688, trend: "down", parity: true },
    bookingCom: { rate: 688, trend: "up", parity: true },
    expedia: { rate: 955, trend: "up", parity: false },
    agoda: { rate: 688, trend: "up", parity: true },
    makeMyTrip: { rate: 385, trend: "up", parity: false },
    lossChannels: ["Roomsxxl", "Vio.com", "Trip.com"],
    lowestRate: 585,
  },
  {
    date: "Fri 08/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1112, trend: "up", parity: false },
    agoda: { rate: 817, trend: "down", parity: true },
    makeMyTrip: { rate: 523, trend: "stable", parity: false },
    lossChannels: ["Roomsxxl", "GoSeek", "Vio.com", "Trip.com"],
    lowestRate: 585,
  },
  {
    date: "Sat 09/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1118, trend: "up", parity: false },
    agoda: { rate: 817, trend: "up", parity: true },
    makeMyTrip: { rate: null, trend: "stable", parity: false },
    lossChannels: ["Vio.com"],
    lowestRate: 767,
  },
  {
    date: "Sun 10/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1112, trend: "up", parity: false },
    agoda: { rate: 817, trend: "up", parity: true },
    makeMyTrip: { rate: 555, trend: "up", parity: false },
    lossChannels: ["Roomsxxl", "Trip.com", "Vio.com"],
    lowestRate: 585,
  },
  {
    date: "Mon 11/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1112, trend: "up", parity: false },
    agoda: { rate: 817, trend: "down", parity: true },
    makeMyTrip: { rate: 555, trend: "up", parity: false },
    lossChannels: ["Vio.com"],
    lowestRate: 767,
  },
  {
    date: "Tue 12/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1109, trend: "up", parity: false },
    agoda: { rate: 817, trend: "up", parity: true },
    makeMyTrip: { rate: 555, trend: "up", parity: false },
    lossChannels: ["Vio.com"],
    lowestRate: 767,
  },
  {
    date: "Wed 13/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1112, trend: "up", parity: false },
    agoda: { rate: 817, trend: "down", parity: true },
    makeMyTrip: { rate: 555, trend: "up", parity: false },
    lossChannels: ["Roomsxxl", "Trip.com", "Vio.com"],
    lowestRate: 585,
  },
  {
    date: "Thu 14/08",
    brandCom: { rate: 688, trend: "up", parity: true },
    bookingCom: { rate: 688, trend: "up", parity: true },
    expedia: { rate: 926, trend: "up", parity: false },
    agoda: { rate: 688, trend: "up", parity: true },
    makeMyTrip: { rate: 463, trend: "up", parity: false },
    lossChannels: ["Roomsxxl", "Vio.com", "Trip.com"],
    lowestRate: 585,
  },
  {
    date: "Fri 15/08",
    brandCom: { rate: 817, trend: "up", parity: true },
    bookingCom: { rate: 817, trend: "up", parity: true },
    expedia: { rate: 1118, trend: "up", parity: false },
    agoda: { rate: 817, trend: "up", parity: true },
    makeMyTrip: { rate: 555, trend: "down", parity: false },
    lossChannels: ["Bluepillow.it", "Trip.com"],
    lowestRate: 688,
  },
]

export default function ParityMonitoringPage() {
  const [currentMonth, setCurrentMonth] = useState("August 2025")
  const [viewMode, setViewMode] = useState<"table" | "chart">("table")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [showAlerts, setShowAlerts] = useState(true)
  const [filters, setFilters] = useState({
    rateType: "lowest",
    device: "desktop",
    nights: "1",
    guests: "2",
    room: "any",
    meal: "any",
  })

  // Calculate critical parity violations
  const criticalViolations = parityData.filter(row => {
    const hasHighLoss = row.lossChannels.length >= 3
    const hasLowRates = row.makeMyTrip.rate && row.makeMyTrip.rate < row.lowestRate * 0.8
    return hasHighLoss || hasLowRates
  })

  const totalViolations = parityData.reduce((sum, row) => sum + row.lossChannels.length, 0)

  const getRateColor = (channel: string, rate: number | null) => {
    if (rate === null) return "text-muted-foreground"

    switch (channel) {
      case "brandCom":
      case "bookingCom":
      case "agoda":
        return "text-primary"
      case "expedia":
        return "text-orange-500 dark:text-orange-400"
      case "makeMyTrip":
        return "text-red-500 dark:text-red-400"
      default:
        return "text-foreground"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-500" />
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-500" />
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />
    }
  }

  const formatRate = (rate: number | null) => {
    if (rate === null) return "--"
    return `$ ${rate.toLocaleString()}`
  }

  // Generate chart data from parity data
  const getChartData = () => {
    return parityData.map((row) => ({
      date: row.date,
      brandCom: row.brandCom.rate,
      bookingCom: row.bookingCom.rate,
      expedia: row.expedia.rate,
      agoda: row.agoda.rate,
      makeMyTrip: row.makeMyTrip.rate,
      lowestRate: row.lowestRate,
    }))
  }

  const chartData = getChartData()

  // Real-time refresh functionality
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to refresh parity data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      handleRefresh()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, handleRefresh])

  // Format last updated time
  const formatLastUpdated = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins === 1) return '1 minute ago'
    if (diffMins < 60) return `${diffMins} minutes ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return '1 hour ago'
    return `${diffHours} hours ago`
  }



  return (
    <ParityDateProvider>
      <ParityChannelProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          {/* Enhanced Filter Bar with Sticky Positioning - Copied from Overview */}
          <div className="sticky top-0 z-40 filter-bar-minimal bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-border/50 shadow-sm transition-shadow duration-200">
            <ParityOverviewFilterBar />
          </div>

          <div className="flex-1 space-y-6 px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold text-foreground">{currentMonth}</h1>
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center border border-border rounded-lg p-1">
              <Button
                variant={viewMode === "chart" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("chart")}
                className="h-8 px-3"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8 px-3"
              >
                <Table className="h-4 w-4" />
              </Button>
            </div>

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auto-refresh Toggle */}
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="gap-2"
            >
              {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              Auto-refresh
            </Button>

            {/* Refresh Button */}
            <Button 
              className="gap-2 bg-primary hover:bg-primary/90"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh rates'}
            </Button>
          </div>
        </div>

        {/* Parity Calendar View */}
        <ParityCalendarView />

        {/* Critical Alerts Panel */}
        {showAlerts && criticalViolations.length > 0 && (
          <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-100">
                      Critical Parity Violations Detected
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {criticalViolations.length} dates with severe parity issues requiring immediate attention
                    </p>
                    <div className="mt-2 space-y-1">
                      {criticalViolations.slice(0, 3).map((violation, index) => (
                        <div key={index} className="text-xs text-red-600 dark:text-red-400">
                          • {violation.date}: {violation.lossChannels.join(", ")} - Loss channels active
                        </div>
                      ))}
                      {criticalViolations.length > 3 && (
                        <div className="text-xs text-red-600 dark:text-red-400">
                          • And {criticalViolations.length - 3} more violations...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAlerts(false)}
                  className="text-red-500 hover:text-red-700"
                >
                  Dismiss
                </Button>
              </div>
              <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-700 dark:text-red-300">
                    Total violations across all dates: {totalViolations}
                  </span>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                    View All Issues
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {viewMode === "table" ? (
          /* Parity Table */
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 font-medium text-foreground min-w-[100px]">Date</th>
                    <th className="text-left p-4 font-medium text-foreground min-w-[120px]">Brand.com</th>
                    <th className="text-left p-4 font-medium text-foreground min-w-[120px]">Booking.com</th>
                    <th className="text-left p-4 font-medium text-foreground min-w-[120px]">Expedia</th>
                    <th className="text-left p-4 font-medium text-foreground min-w-[120px]">Agoda</th>
                    <th className="text-left p-4 font-medium text-foreground min-w-[120px]">MakeMyTrip</th>
                    <th className="text-left p-4 font-medium text-foreground min-w-[200px]">Loss channels on metasearch</th>
                    <th className="text-left p-4 font-medium text-foreground min-w-[120px]">Lowest rate</th>
                  </tr>
                </thead>
                <tbody>
                  {parityData.map((row, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-accent/50">
                      <td className="p-4">
                        <Badge
                          variant={row.date.startsWith("Fri") ? "default" : "secondary"}
                          className={cn(
                            "text-xs",
                            row.date.startsWith("Fri") ? "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300" : "bg-muted text-muted-foreground",
                          )}
                        >
                          {row.date}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={getRateColor("brandCom", row.brandCom.rate)}>
                            {formatRate(row.brandCom.rate)}
                          </span>
                          {row.brandCom.parity && <span className="text-primary">%</span>}
                          {getTrendIcon(row.brandCom.trend)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={getRateColor("bookingCom", row.bookingCom.rate)}>
                            {formatRate(row.bookingCom.rate)}
                          </span>
                          {row.bookingCom.parity && <span className="text-primary">%</span>}
                          {getTrendIcon(row.bookingCom.trend)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={getRateColor("expedia", row.expedia.rate)}>
                            {formatRate(row.expedia.rate)}
                          </span>
                          {row.expedia.parity && <span className="text-orange-500">%</span>}
                          {getTrendIcon(row.expedia.trend)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={getRateColor("agoda", row.agoda.rate)}>{formatRate(row.agoda.rate)}</span>
                          {row.agoda.parity && <span className="text-primary">%</span>}
                          {getTrendIcon(row.agoda.trend)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={getRateColor("makeMyTrip", row.makeMyTrip.rate)}>
                            {formatRate(row.makeMyTrip.rate)}
                          </span>
                          {row.makeMyTrip.parity && <span className="text-red-500">%</span>}
                          {getTrendIcon(row.makeMyTrip.trend)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-muted-foreground">{row.lossChannels.join(", ")}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-red-500 dark:text-red-400 font-medium">{formatRate(row.lowestRate)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        ) : (
          /* Parity Chart */
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">Rate Parity Trends</h3>
                <p className="text-sm text-muted-foreground">Compare rates across all channels over time</p>
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                      }}
                      formatter={(value, name) => [`$${value}`, name]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="brandCom"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      name="Brand.com"
                    />
                    <Line
                      type="monotone"
                      dataKey="bookingCom"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
                      name="Booking.com"
                    />
                    <Line
                      type="monotone"
                      dataKey="expedia"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                      name="Expedia"
                    />
                    <Line
                      type="monotone"
                      dataKey="agoda"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                      name="Agoda"
                    />
                    <Line
                      type="monotone"
                      dataKey="makeMyTrip"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                      name="MakeMyTrip"
                    />
                    <Line
                      type="monotone"
                      dataKey="lowestRate"
                      stroke="#dc2626"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ fill: "#dc2626", strokeWidth: 2, r: 6 }}
                      name="Lowest Rate"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
          </div>
        </div>
      </ParityChannelProvider>
    </ParityDateProvider>
  )
}
