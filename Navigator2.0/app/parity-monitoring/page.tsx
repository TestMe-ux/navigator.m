"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { cn } from "@/lib/utils"

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
  const [filters, setFilters] = useState({
    rateType: "lowest",
    device: "desktop",
    nights: "1",
    guests: "2",
    room: "any",
    meal: "any",
  })

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
      <div className="flex-1 space-y-6 p-6">
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

            {/* Refresh Button */}
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <RefreshCw className="h-4 w-4" />
              Refresh rates
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border">
          <Select value={filters.rateType} onValueChange={(value) => setFilters({ ...filters, rateType: value })}>
            <SelectTrigger className="w-32 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lowest">Lowest</SelectItem>
              <SelectItem value="highest">Highest</SelectItem>
              <SelectItem value="average">Average</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.device} onValueChange={(value) => setFilters({ ...filters, device: value })}>
            <SelectTrigger className="w-32 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desktop">Desktop</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
              <SelectItem value="tablet">Tablet</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.nights} onValueChange={(value) => setFilters({ ...filters, nights: value })}>
            <SelectTrigger className="w-32 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 night</SelectItem>
              <SelectItem value="2">2 nights</SelectItem>
              <SelectItem value="3">3 nights</SelectItem>
              <SelectItem value="7">1 week</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.guests} onValueChange={(value) => setFilters({ ...filters, guests: value })}>
            <SelectTrigger className="w-32 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 guest</SelectItem>
              <SelectItem value="2">2 guests</SelectItem>
              <SelectItem value="3">3 guests</SelectItem>
              <SelectItem value="4">4 guests</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.room} onValueChange={(value) => setFilters({ ...filters, room: value })}>
            <SelectTrigger className="w-32 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any room</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="deluxe">Deluxe</SelectItem>
              <SelectItem value="suite">Suite</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.meal} onValueChange={(value) => setFilters({ ...filters, meal: value })}>
            <SelectTrigger className="w-32 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any meal</SelectItem>
              <SelectItem value="none">No meal</SelectItem>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="halfboard">Half board</SelectItem>
              <SelectItem value="fullboard">Full board</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto text-sm text-muted-foreground">Updated an hour ago</div>
        </div>

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
  )
}
