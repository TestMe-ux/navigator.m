"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { ChevronDown, LineChart, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

// Enhanced data structure with dual Y-axis datasets
const trendData = [
  {
    date: "8 Jun",
    dateFormatted: "Jun 8",
    "Demand level": 1,
    "My ADR": 85,
    "Market ADR": 82,
    "Air Travellers": 42000,
  },
  {
    date: "11 Jun", 
    dateFormatted: "Jun 11",
    "Demand level": 1,
    "My ADR": 88,
    "Market ADR": 85,
    "Air Travellers": 38000,
  },
  {
    date: "14 Jun",
    dateFormatted: "Jun 14", 
    "Demand level": 2,
    "My ADR": 92,
    "Market ADR": 89,
    "Air Travellers": 45000,
  },
  {
    date: "17 Jun",
    dateFormatted: "Jun 17",
    "Demand level": 2,
    "My ADR": 95,
    "Market ADR": 91,
    "Air Travellers": 48000,
  },
  {
    date: "20 Jun",
    dateFormatted: "Jun 20",
    "Demand level": 3,
    "My ADR": 105,
    "Market ADR": 98,
    "Air Travellers": 55000,
  },
  {
    date: "23 Jun",
    dateFormatted: "Jun 23",
    "Demand level": 2,
    "My ADR": 98,
    "Market ADR": 94,
    "Air Travellers": 52000,
  },
  {
    date: "26 Jun",
    dateFormatted: "Jun 26",
    "Demand level": 2,
    "My ADR": 90,
    "Market ADR": 87,
    "Air Travellers": 47000,
  },
  {
    date: "29 Jun",
    dateFormatted: "Jun 29",
    "Demand level": 1,
    "My ADR": 82,
    "Market ADR": 79,
    "Air Travellers": 40000,
  },
]

const demandLevelMap: { [key: number]: string } = {
  0: "Very low",
  1: "Low", 
  2: "Normal",
  3: "Elevated",
  4: "High",
  5: "Very high",
}

// Dataset options for radio toggle
type DatasetType = 'pricing' | 'travellers'

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, datasetType }: any & { datasetType: DatasetType }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const demandColorClass =
      data["Demand level"] === 0
        ? "text-blue-300"
        : data["Demand level"] === 1
          ? "text-blue-500"
          : data["Demand level"] === 2
            ? "text-green-500"
            : data["Demand level"] === 3
              ? "text-yellow-500"
              : data["Demand level"] === 4
                ? "text-orange-500"
                : "text-red-500"

    return (
      <Card className="p-3 shadow-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm w-64">
        <div className="space-y-2">
          {/* Date Heading */}
          <div className="mb-2">
            <h3 className="text-foreground">
              <span className="text-base font-bold">{data.dateFormatted}</span>
              <span className="text-sm font-normal">, {new Date(label).toLocaleDateString('en-GB', { weekday: 'short' })}</span>
            </h3>
          </div>
          
          <div className="border-b border-slate-200 dark:border-slate-700 pb-2 mb-2"></div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div>
              <span className="font-semibold text-muted-foreground">Demand:</span>{" "}
              <span className={`font-bold ${demandColorClass}`}>{demandLevelMap[data["Demand level"]]}</span>
            </div>
            
            {datasetType === 'pricing' && (
              <>
                <div>
                  <span className="font-semibold text-muted-foreground">My ADR:</span>{" "}
                  <span className="font-bold text-blue-600 dark:text-blue-400">${data["My ADR"]}</span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Mkt ADR:</span>{" "}
                  <span className="font-bold text-muted-foreground">${data["Market ADR"]}</span>
                </div>
              </>
            )}
            
            {datasetType === 'travellers' && (
              <div>
                <span className="font-semibold text-muted-foreground">Air Travellers:</span>{" "}
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {(data["Air Travellers"] / 1000).toFixed(0)}K
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }
  return null
}

// Custom legend component
const CustomLegend = ({ datasetType }: { datasetType: DatasetType }) => {
  const demandColors = [
    { level: "Very low", color: "#bfdbfe" },
    { level: "Low", color: "#3b82f6" },
    { level: "Normal", color: "#10b981" },
    { level: "Elevated", color: "#f59e0b" },
    { level: "High", color: "#f97316" },
    { level: "Very high", color: "#ef4444" },
  ]

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-4 text-xs">
      {/* Demand Level Legend */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground font-medium">Demand:</span>
        <div className="flex items-center gap-1">
          {demandColors.map((item, index) => (
            <div
              key={index}
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
              title={item.level}
            />
          ))}
        </div>
      </div>

      {/* Dataset-specific legends */}
      {datasetType === 'pricing' && (
        <>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ backgroundColor: '#1d4ed8' }} />
            <span className="font-medium" style={{ color: '#1d4ed8' }}>My ADR</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: '#dc2626' }} />
            <span className="font-medium" style={{ color: '#dc2626' }}>Market ADR</span>
          </div>
        </>
      )}

      {datasetType === 'travellers' && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-purple-600" />
          <span className="text-purple-600 font-medium">Air Travellers</span>
        </div>
      )}
    </div>
  )
}

export function EnhancedDemandTrendsChart() {
  const { theme } = useTheme()
  const [datasetType, setDatasetType] = useState<DatasetType>('pricing')

  // Calculate Y-axis domains dynamically
  const demandDomain = [0, 5]
  const priceDomain = [70, 115]
  const travellersDomain = [35000, 60000]

  // Professional color scheme
  const myPriceColor = "#1d4ed8" // blue-700
  const marketAdrColor = "#dc2626" // red-600
  const travellersColor = "#7c3aed" // purple-600

  console.log('🔍 Rendering chart with dataset:', datasetType)
  console.log('📊 Price domain:', priceDomain)
  console.log('📈 Sample data point:', trendData[0])

  return (
    <div className="space-y-4">
      {/* Header Section with Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Trends</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Demand forecast and {datasetType === 'pricing' ? 'pricing analysis' : 'air travel patterns'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          {/* Dataset Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">View:</span>
            <RadioGroup
              value={datasetType}
              onValueChange={(value) => setDatasetType(value as DatasetType)}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pricing" id="pricing" />
                <Label htmlFor="pricing" className="text-sm cursor-pointer flex items-center gap-1 whitespace-nowrap">
                  <LineChart className="h-3.5 w-3.5" />
                  Pricing
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="travellers" id="travellers" />
                <Label htmlFor="travellers" className="text-sm cursor-pointer flex items-center gap-1 whitespace-nowrap">
                  <Users className="h-3.5 w-3.5" />
                  Air Travellers
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Time Period Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs h-8 whitespace-nowrap">
                View by: Day <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-80" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Day</DropdownMenuItem>
              <DropdownMenuItem>Week</DropdownMenuItem>
              <DropdownMenuItem>Month</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Chart Section */}
      <div className="pl-2 sm:pl-6 pr-2 sm:pr-4">
        <ResponsiveContainer width="100%" height={400} minHeight={350}>
          <ComposedChart 
            data={trendData} 
            margin={{ 
              top: 20, 
              right: 50, 
              left: 40, 
              bottom: 20 
            }}
          >
            {/* Grid */}
            <CartesianGrid 
              strokeDasharray="3 3" 
              strokeOpacity={theme === "dark" ? 0.2 : 0.4} 
              vertical={false} 
            />
            
            {/* X-Axis - Dates */}
            <XAxis
              dataKey="dateFormatted"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
                fill: theme === "dark" ? "hsl(var(--muted-foreground))" : "hsl(var(--muted-foreground))",
              }}
              dy={10}
            />
            
            {/* Primary Y-Axis (Left) - Demand Levels */}
            <YAxis
              yAxisId="demand"
              type="number"
              domain={demandDomain}
              ticks={[0, 1, 2, 3, 4, 5]}
              tickFormatter={(value) => ["Very low", "Low", "Normal", "Elevated", "High", "Very high"][value]}
              axisLine={false}
              tickLine={false}
              width={90}
              tick={{
                fontSize: 11,
                fill: theme === "dark" ? "hsl(var(--muted-foreground))" : "hsl(var(--muted-foreground))",
              }}
            />
            
            {/* Secondary Y-Axis (Right) - Pricing or Travellers */}
            <YAxis
              yAxisId="secondary"
              orientation="right"
              type="number"
              domain={datasetType === 'pricing' ? priceDomain : travellersDomain}
              ticks={datasetType === 'pricing' ? [75, 85, 95, 105, 115] : undefined}
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
                fill: theme === "dark" ? "hsl(var(--muted-foreground))" : "hsl(var(--muted-foreground))",
              }}
              tickFormatter={(value) => 
                datasetType === 'pricing' 
                  ? `$${value}` 
                  : `${(value / 1000).toFixed(0)}K`
              }
            />
            
            {/* Tooltip */}
            <Tooltip
              content={<CustomTooltip datasetType={datasetType} />}
              cursor={{ fill: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
            />
            
            {/* CRITICAL: Bars MUST come first, then Lines for proper rendering */}
            <Bar
              yAxisId="demand"
              dataKey="Demand level"
              fill="hsl(var(--chart-1))"
              barSize={20}
              radius={[3, 3, 0, 0]}
            />
            
            {/* Pricing Lines - Conditional Rendering */}
            {datasetType === 'pricing' && (
              <>
                <Line
                  yAxisId="secondary"
                  type="monotone"
                  dataKey="My ADR"
                  stroke={myPriceColor}
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: myPriceColor,
                    strokeWidth: 2,
                    stroke: "#ffffff",
                  }}
                  activeDot={{ 
                    r: 6, 
                    strokeWidth: 2, 
                    stroke: "#ffffff",
                    fill: myPriceColor 
                  }}
                />
                <Line
                  yAxisId="secondary"
                  type="monotone"
                  dataKey="Market ADR"
                  stroke={marketAdrColor}
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{
                    r: 4,
                    fill: marketAdrColor,
                    strokeWidth: 2,
                    stroke: "#ffffff",
                  }}
                  activeDot={{ 
                    r: 6, 
                    strokeWidth: 2, 
                    stroke: "#ffffff",
                    fill: marketAdrColor 
                  }}
                />
              </>
            )}
            
            {/* Travellers Line */}
            {datasetType === 'travellers' && (
              <Line
                yAxisId="secondary"
                type="monotone"
                dataKey="Air Travellers"
                stroke={travellersColor}
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: travellersColor,
                  strokeWidth: 2,
                  stroke: "#ffffff",
                }}
                activeDot={{ 
                  r: 6, 
                  strokeWidth: 2, 
                  stroke: "#ffffff",
                  fill: travellersColor 
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
        
        {/* Custom Legend */}
        <CustomLegend datasetType={datasetType} />
      </div>
    </div>
  )
}