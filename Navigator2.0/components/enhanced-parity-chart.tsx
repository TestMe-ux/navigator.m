"use client"

import * as React from "react"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown, Info, TrendingUp, Target, Award } from "lucide-react"
import { cn } from "@/lib/utils"

const chartData = [
  {
    date: "14 May",
    shortDate: "14",
    parityScore: 12,
    meet: 12,
    win: 0,
    loss: 88,
    brand: 19.06,
    industryScore: 56.99,
    target: 25,
    dailyChecks: 150,
    violations: 132,
  },
  {
    date: "15 May",
    shortDate: "15",
    parityScore: 14,
    meet: 14,
    win: 0,
    loss: 86,
    brand: 19.06,
    industryScore: 56.99,
    target: 25,
    dailyChecks: 155,
    violations: 133,
  },
  {
    date: "16 May",
    shortDate: "16",
    parityScore: 16,
    meet: 16,
    win: 0,
    loss: 84,
    brand: 19.06,
    industryScore: 56.99,
    target: 25,
    dailyChecks: 148,
    violations: 124,
  },
  {
    date: "17 May",
    shortDate: "17",
    parityScore: 18,
    meet: 18,
    win: 0,
    loss: 82,
    brand: 19.06,
    industryScore: 56.99,
    target: 25,
    dailyChecks: 152,
    violations: 125,
  },
  {
    date: "18 May",
    shortDate: "18",
    parityScore: 19,
    meet: 19,
    win: 0,
    loss: 81,
    brand: 19.06,
    industryScore: 56.99,
    target: 25,
    dailyChecks: 147,
    violations: 119,
  },
  {
    date: "19 May",
    shortDate: "19",
    parityScore: 20,
    meet: 20,
    win: 0,
    loss: 80,
    brand: 19.06,
    industryScore: 56.99,
    target: 25,
    dailyChecks: 149,
    violations: 119,
  },
  {
    date: "20 May",
    shortDate: "20",
    parityScore: 20.2,
    meet: 20.2,
    win: 0,
    loss: 79.8,
    brand: 19.06,
    industryScore: 56.99,
    target: 25,
    dailyChecks: 151,
    violations: 120,
  },
]

type ViewMode = "days" | "week" | "month"
type CategoryOption = {
  id: string
  label: string
  color: string
  dataKey: string
  icon?: React.ReactNode
}

const categoryOptions: CategoryOption[] = [
  {
    id: "brand",
    label: "Brand Average",
    color: "#8b5cf6",
    dataKey: "brand",
    icon: <Award className="h-3 w-3" />,
  },
  {
    id: "industryScore",
    label: "Industry Benchmark",
    color: "#06b6d4",
    dataKey: "industryScore",
    icon: <Target className="h-3 w-3" />,
  },
  {
    id: "target",
    label: "Target Goal",
    color: "#10b981",
    dataKey: "target",
    icon: <TrendingUp className="h-3 w-3" />,
  },
]

export function EnhancedParityChart() {
  const [viewMode, setViewMode] = React.useState<ViewMode>("days")
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(["brand", "target"])
  const [isOpen, setIsOpen] = React.useState(false)
  const [showBreakdown, setShowBreakdown] = React.useState(true)

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const selectedCategoryOptions = categoryOptions.filter((cat) => selectedCategories.includes(cat.id))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload

      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[280px]">
          {/* Date Heading */}
          <div className="mb-3">
            <h3 className="text-gray-900">
              <span className="text-base font-bold">{new Date(label).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span className="text-sm font-normal">, {new Date(label).toLocaleDateString('en-GB', { weekday: 'short' })}</span>
            </h3>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-500">Shop Date</div>
          </div>

          {/* Main Parity Score */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Parity Score</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {data?.parityScore}%
              </span>
            </div>
          </div>

          {/* Performance Breakdown */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-green-50 rounded-lg p-2 border border-green-200">
              <div className="text-xs text-green-700 font-medium">Win</div>
              <div className="text-sm font-bold text-green-800">{data?.win}%</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
              <div className="text-xs text-orange-700 font-medium">Meet</div>
              <div className="text-sm font-bold text-orange-800">{data?.meet}%</div>
            </div>
            <div className="bg-red-50 rounded-lg p-2 border border-red-200">
              <div className="text-xs text-red-700 font-medium">Loss</div>
              <div className="text-sm font-bold text-red-800">{data?.loss}%</div>
            </div>
          </div>

          {/* Benchmarks */}
          {selectedCategoryOptions.length > 0 && (
            <div className="space-y-2 mb-3">
              <div className="text-xs font-medium text-gray-600 border-b border-gray-200 pb-1">Benchmarks</div>
              {selectedCategoryOptions.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs text-gray-700">{cat.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{data?.[cat.dataKey]}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
            <div className="text-center">
              <div className="text-xs text-gray-500">Daily Checks</div>
              <div className="text-sm font-semibold text-gray-900">{data?.dailyChecks}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Violations</div>
              <div className="text-sm font-semibold text-red-600">{data?.violations}</div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
        {/* Performance Breakdown */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-xs font-medium text-gray-700">Win</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-xs font-medium text-gray-700">Meet</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-xs font-medium text-gray-700">Loss</span>
          </div>
        </div>

        {/* Separator */}
        <div className="w-px h-4 bg-gray-300"></div>

        {/* Main Score Line */}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
          <span className="text-xs font-medium text-gray-700">Parity Score</span>
        </div>

        {/* Benchmarks */}
        {selectedCategoryOptions.map((cat) => (
          <div key={cat.id} className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: cat.color }}></div>
            <span className="text-xs font-medium text-gray-700">{cat.label}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className="bg-white border rounded-md shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-semibold text-gray-800">Parity Performance Trends</CardTitle>
          <Info className="h-4 w-4 text-gray-500" />
        </div>
        <div className="flex items-center gap-3">
          {/* Show Breakdown Toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-breakdown"
              checked={showBreakdown}
              onCheckedChange={setShowBreakdown}
              className="border-gray-300 text-blue-600 focus:ring-blue-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <label htmlFor="show-breakdown" className="text-sm text-gray-600 cursor-pointer">
              Show Breakdown
            </label>
          </div>

          {/* Benchmark Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Benchmarks</span>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-gray-600 hover:bg-gray-100">
                  {selectedCategories.length} selected
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="end">
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-900 mb-2">Select Benchmarks</div>
                  {categoryOptions.map((category) => (
                    <div key={category.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                        className="border-gray-300 text-blue-600 focus:ring-blue-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <label
                        htmlFor={category.id}
                        className="text-sm cursor-pointer text-gray-700 flex items-center gap-2"
                      >
                        {category.icon}
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Period:</span>
            <div className="flex border rounded-md overflow-hidden bg-gradient-to-r from-blue-500 to-teal-500">
              <Button
                variant={viewMode === "days" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-none px-3 h-7 text-xs border-0",
                  viewMode === "days" ? "bg-white text-blue-600 shadow-sm" : "text-white hover:bg-white/20",
                )}
                onClick={() => setViewMode("days")}
              >
                Daily
              </Button>
              <Button
                variant={viewMode === "week" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-none px-3 h-7 text-xs border-0",
                  viewMode === "week" ? "bg-white text-blue-600 shadow-sm" : "text-white hover:bg-white/20",
                )}
                onClick={() => setViewMode("week")}
              >
                Weekly
              </Button>
              <Button
                variant={viewMode === "month" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-none px-3 h-7 text-xs border-0",
                  viewMode === "month" ? "bg-white text-blue-600 shadow-sm" : "text-white hover:bg-white/20",
                )}
                onClick={() => setViewMode("month")}
              >
                Monthly
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="parityGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} stroke="#e5e7eb" />

              <XAxis
                dataKey="shortDate"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickMargin={10}
              />

              <YAxis
                yAxisId="percentage"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Performance Breakdown Bars */}
              {showBreakdown && (
                <>
                  <Bar
                    yAxisId="percentage"
                    dataKey="win"
                    stackId="performance"
                    fill="#10b981"
                    radius={[0, 0, 0, 0]}
                    opacity={0.8}
                  />
                  <Bar
                    yAxisId="percentage"
                    dataKey="meet"
                    stackId="performance"
                    fill="#f59e0b"
                    radius={[0, 0, 0, 0]}
                    opacity={0.8}
                  />
                  <Bar
                    yAxisId="percentage"
                    dataKey="loss"
                    stackId="performance"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  />
                </>
              )}

              {/* Main Parity Score Line */}
              <Line
                yAxisId="percentage"
                type="monotone"
                dataKey="parityScore"
                stroke="url(#parityGradient)"
                strokeWidth={4}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: "#3b82f6", strokeWidth: 2, fill: "#ffffff" }}
              />

              {/* Benchmark Lines */}
              {selectedCategoryOptions.map((cat) => (
                <Line
                  key={cat.id}
                  yAxisId="percentage"
                  type="monotone"
                  dataKey={cat.dataKey}
                  stroke={cat.color}
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  dot={false}
                  activeDot={{ r: 4, stroke: cat.color, strokeWidth: 2, fill: "#ffffff" }}
                />
              ))}

              <Legend content={<CustomLegend />} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Enhanced Key Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              20.2%
            </div>
            <div className="text-xs text-gray-600">Current Score</div>
            <div className="text-xs text-green-600 font-medium mt-1">+8.2% vs start</div>
          </div>
          <div className="text-center bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-3 border border-green-200">
            <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
              +0.7%
            </div>
            <div className="text-xs text-gray-600">7-day Change</div>
            <div className="text-xs text-green-600 font-medium mt-1">Improving</div>
          </div>
          <div className="text-center bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-3 border border-orange-200">
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              25%
            </div>
            <div className="text-xs text-gray-600">Target Goal</div>
            <div className="text-xs text-orange-600 font-medium mt-1">4.8% to go</div>
          </div>
          <div className="text-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              19.1%
            </div>
            <div className="text-xs text-gray-600">Brand Average</div>
            <div className="text-xs text-green-600 font-medium mt-1">+1.1% vs brand</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
