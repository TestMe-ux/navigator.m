"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const chartData = [
  { date: "14 May 25", parityScore: 12, meet: 12, win: 0, loss: 88 },
  { date: "15 May 25", parityScore: 14, meet: 14, win: 0, loss: 86 },
  { date: "16 May 25", parityScore: 16, meet: 16, win: 0, loss: 84 },
  { date: "17 May 25", parityScore: 18, meet: 18, win: 0, loss: 82 },
  { date: "18 May 25", parityScore: 19, meet: 19, win: 0, loss: 81 },
  { date: "19 May 25", parityScore: 20, meet: 20, win: 0, loss: 80 },
  { date: "20 May 25", parityScore: 16.9, meet: 16.9, win: 0, loss: 83.1 },
]

export function CorporateParityChart() {
  const [viewMode, setViewMode] = React.useState("days")
  const [category, setCategory] = React.useState("brand")

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          {/* Date Heading */}
          <div className="mb-3">
            <h3 className="text-gray-900">
              <span className="text-base font-bold">{new Date(label).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span className="text-sm font-normal">, {new Date(label).toLocaleDateString('en-GB', { weekday: 'short' })}</span>
            </h3>
          </div>
          
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="font-medium text-gray-700">{entry.name}:</span>
              <span className="text-gray-900">{entry.value}%</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Parity Score Chart */}
      <Card className="lg:col-span-2 bg-white border border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-medium text-gray-900">Parity Score Across Multiple Shop-Dates</CardTitle>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Category</span>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-32 bg-white border-gray-300">
                  <SelectValue />
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brand">Brand</SelectItem>
                  <SelectItem value="industry">Industry</SelectItem>
                  <SelectItem value="region">Region</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">View By:</span>
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "days" ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "rounded-none px-3 h-8 text-sm border-0",
                    viewMode === "days"
                      ? "bg-corporate-blue hover:bg-corporate-blue-hover text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50",
                  )}
                  onClick={() => setViewMode("days")}
                >
                  Days
                </Button>
                <Button
                  variant={viewMode === "week" ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "rounded-none px-3 h-8 text-sm border-0 border-l border-gray-300",
                    viewMode === "week"
                      ? "bg-corporate-blue hover:bg-corporate-blue-hover text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50",
                  )}
                  onClick={() => setViewMode("week")}
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === "month" ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "rounded-none px-3 h-8 text-sm border-0 border-l border-gray-300",
                    viewMode === "month"
                      ? "bg-corporate-blue hover:bg-corporate-blue-hover text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50",
                  )}
                  onClick={() => setViewMode("month")}
                >
                  Month
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMeet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38a169" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38a169" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e53e3e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#e53e3e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickMargin={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="loss"
                  name="Loss"
                  stroke="#e53e3e"
                  strokeWidth={2}
                  fill="url(#colorLoss)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="meet"
                  name="Meet"
                  stroke="#38a169"
                  strokeWidth={3}
                  fill="url(#colorMeet)"
                  fillOpacity={0.8}
                />

                <Legend verticalAlign="bottom" height={36} iconType="line" wrapperStyle={{ paddingTop: "20px" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Criticality Distribution */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-medium text-gray-900">Criticality Distribution</CardTitle>
          <Info className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center">
            <div className="w-32 h-32 rounded-full border-8 border-gray-200 relative flex items-center justify-center mb-6">
              <div
                className="absolute inset-0 border-t-8 border-r-8 border-corporate-red rounded-full"
                style={{ clipPath: "polygon(50% 0, 100% 0, 100% 50%, 50% 50%)" }}
              ></div>
              <div
                className="absolute inset-0 border-r-8 border-b-8 border-yellow-500 rounded-full"
                style={{ clipPath: "polygon(100% 50%, 100% 100%, 50% 100%, 50% 50%)" }}
              ></div>
              <div
                className="absolute inset-0 border-b-8 border-l-8 border-corporate-green rounded-full"
                style={{ clipPath: "polygon(0 100%, 50% 100%, 50% 50%, 0 50%)" }}
              ></div>
              <div
                className="absolute inset-0 border-l-8 border-t-8 border-corporate-green rounded-full"
                style={{ clipPath: "polygon(0 0, 50% 0, 50% 50%, 0 50%)" }}
              ></div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">29.6%</div>
                <div className="text-xs text-gray-500">Critical</div>
              </div>
            </div>

            <div className="space-y-2 text-center text-sm">
              <div className="flex items-center justify-between w-full">
                <span className="font-medium text-gray-700">Critical</span>
                <span className="text-corporate-red font-medium">29.6%</span>
              </div>
              <div className="flex items-center justify-between w-full">
                <span className="font-medium text-gray-700">Major</span>
                <span className="text-yellow-600 font-medium">21.1%</span>
              </div>
              <div className="flex items-center justify-between w-full">
                <span className="font-medium text-gray-700">Trivial</span>
                <span className="text-corporate-green font-medium">49.3%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
