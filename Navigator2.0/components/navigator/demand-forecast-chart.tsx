"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  // Cell, // No longer needed for dynamic bar colors
} from "recharts"
import { ChevronDown, Info, TrendingUp, TrendingDown } from "lucide-react" // Added TrendingUp/Down for tooltip
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

// Sample data matching the structure implied by the chart
const demandData = [
  {
    date: "8 Jun",
    "Demand level": 1,
    "My price": 780,
    "Market price": 770,
    OTB: 45,
    "Market OTB": 42,
    Searches: 1250,
    Opportunity: 0,
  },
  {
    date: "11 Jun",
    "Demand level": 1,
    "My price": 790,
    "Market price": 785,
    OTB: 48,
    "Market OTB": 45,
    Searches: 1180,
    Opportunity: 0,
  },
  {
    date: "14 Jun",
    "Demand level": 2,
    "My price": 800,
    "Market price": 795,
    OTB: 52,
    "Market OTB": 50,
    Searches: 1420,
    Opportunity: 1,
  },
  {
    date: "17 Jun",
    "Demand level": 2,
    "My price": 810,
    "Market price": 800,
    OTB: 49,
    "Market OTB": 47,
    Searches: 1380,
    Opportunity: 0,
  },
  {
    date: "20 Jun",
    "Demand level": 3,
    "My price": 830,
    "Market price": 820,
    OTB: 58,
    "Market OTB": 55,
    Searches: 1650,
    Opportunity: 1,
  },
  {
    date: "23 Jun",
    "Demand level": 2,
    "My price": 800,
    "Market price": 790,
    OTB: 54,
    "Market OTB": 52,
    Searches: 1480,
    Opportunity: 0,
  },
  {
    date: "26 Jun",
    "Demand level": 2,
    "My price": 790,
    "Market price": 780,
    OTB: 51,
    "Market OTB": 49,
    Searches: 1320,
    Opportunity: 0,
  },
  {
    date: "29 Jun",
    "Demand level": 1,
    "My price": 770,
    "Market price": 760,
    OTB: 47,
    "Market OTB": 44,
    Searches: 1200,
    Opportunity: 0,
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

// Demand level colors for the legend (as per screenshot's legend)
const legendDemandColors = [
  "hsl(var(--chart-1))", // Light Blue (e.g., Very Low)
  "hsl(var(--chart-2))", // Blue
  "hsl(var(--chart-3))", // Light Purple/Blue
  "hsl(var(--chart-4))", // Pinkish
  "hsl(var(--chart-5))", // Red (e.g., Very High)
]

const CustomTooltip = ({ active, payload, label }: any) => {
  // Using a simplified tooltip based on previous versions, can be expanded
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const demandColorClass =
      data["Demand level"] === 0
        ? "text-demand-very-low"
        : data["Demand level"] === 1
          ? "text-demand-low"
          : data["Demand level"] === 2
            ? "text-demand-normal"
            : data["Demand level"] === 3
              ? "text-demand-elevated"
              : data["Demand level"] === 4
                ? "text-demand-high"
                : "text-demand-very-high"

    return (
      <Card className="p-3 shadow-xl border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm w-64">
        <div className="space-y-2">
          {/* Date Heading */}
          <div className="mb-3">
            <h3 className="text-foreground">
              <span className="text-base font-bold">{new Date(label).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span className="text-sm font-normal">, {new Date(label).toLocaleDateString('en-GB', { weekday: 'short' })}</span>
            </h3>
          </div>
          
          <div className="border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">
            <p className="text-xs text-muted-foreground">Market Analysis</p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div>
              <span className="font-semibold text-muted-foreground">Demand:</span>{" "}
              <span className={`font-bold ${demandColorClass}`}>{demandLevelMap[data["Demand level"]]}</span>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">Searches:</span>{" "}
              <span className="font-bold text-foreground">
                {data["Searches"]?.toLocaleString()}
                {data["Searches"] > 1400 && <TrendingUp className="inline ml-1 h-3 w-3 text-green-500" />}
                {data["Searches"] < 1300 && <TrendingDown className="inline ml-1 h-3 w-3 text-red-500" />}
              </span>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">My Price:</span>{" "}
              <span className="font-bold text-blue-600 dark:text-blue-400">${data["My price"]}</span>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">Mkt Price:</span>{" "}
              <span className="font-bold text-muted-foreground">${data["Market price"]}</span>
            </div>
          </div>
          {data["Opportunity"] > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-2 mt-2">
              <div className="flex items-center gap-1.5">
                <Info className="h-3 w-3 text-amber-600 dark:text-amber-500" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-500">Pricing Opportunity</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    )
  }
  return null
}

export function DemandForecastChart() {
  const { theme } = useTheme()
  const yAxisDemandLabels = ["Very low", "Low", "Normal", "Elevated", "High", "Very high"]

  // Define colors based on theme for lines
  const myPriceColor = theme === "dark" ? "hsl(var(--chart-2))" : "hsl(var(--chart-2))" // Example: blue-500
  const marketPriceColor = theme === "dark" ? "hsl(var(--muted-foreground))" : "hsl(var(--muted-foreground))" // Example: slate-500

  const legendPayload = [
    // Demand level dots (matching screenshot legend)
    ...legendDemandColors.slice(0, 5).map((color, index) => ({
      // Show 5 dots as in screenshot
      value: ` `, // No text, just dots for demand spectrum
      type: "circle" as const,
      id: `demand-level-${index}`,
      color: color,
    })),
    { value: "Demand level", type: "rect" as const, id: "demand-level-text", color: "transparent" }, // Text label for demand
    { value: "My price", type: "line" as const, id: "my-price", color: myPriceColor },
    {
      value: "Market price",
      type: "line" as const,
      id: "market-price",
      color: marketPriceColor,
      payload: { strokeDasharray: "4 4" },
    },
    { value: "Opportunity", type: "circle" as const, id: "opportunity", color: "hsl(var(--chart-3))" }, // Example: orange-500
  ]

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-row items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Trends</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Demand forecast and pricing analysis
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs h-8">
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

      {/* Chart Section */}
      <div className="pl-6 pr-4">
        <ResponsiveContainer width="100%" height={460}>
          <ComposedChart data={demandData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={theme === "dark" ? 0.2 : 0.4} vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
                fill: theme === "dark" ? "hsl(var(--muted-foreground))" : "hsl(var(--muted-foreground))",
              }}
              dy={10}
            />
            <YAxis
              yAxisId="demand"
              type="number"
              domain={[0, 5]} // 6 levels: 0 to 5
              ticks={[0, 1, 2, 3, 4, 5]}
              tickFormatter={(value) => yAxisDemandLabels[value]}
              axisLine={false}
              tickLine={false}
              width={100} // Increased width for longer labels
              tick={{
                fontSize: 12,
                fill: theme === "dark" ? "hsl(var(--muted-foreground))" : "hsl(var(--muted-foreground))",
              }}
            />
            <YAxis
              yAxisId="price"
              orientation="right"
              type="number"
              domain={[0, 1000]} // Matching screenshot's price scale
              ticks={[0, 250, 500, 750, 1000]}
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
                fill: theme === "dark" ? "hsl(var(--muted-foreground))" : "hsl(var(--muted-foreground))",
              }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
            />
            <Bar
              yAxisId="demand"
              dataKey="Demand level"
              fill="hsl(var(--chart-1))" // Consistent light blue for bars as per chart area in screenshot
              barSize={20}
              radius={[3, 3, 0, 0]}
            />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="My price"
              stroke={myPriceColor}
              strokeWidth={2}
              dot={{
                r: 4,
                fill: myPriceColor,
                strokeWidth: 1.5,
                stroke: theme === "dark" ? "hsl(var(--background))" : "hsl(var(--background))",
              }}
              activeDot={{ r: 5, strokeWidth: 1.5 }}
            />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="Market price"
              stroke={marketPriceColor}
              strokeWidth={2}
              strokeDasharray="4 4" // Dashed line for market price
              dot={{
                r: 4,
                fill: marketPriceColor,
                strokeWidth: 1.5,
                stroke: theme === "dark" ? "hsl(var(--background))" : "hsl(var(--background))",
              }}
              activeDot={{ r: 5, strokeWidth: 1.5 }}
            />
            <Legend
              payload={legendPayload}
              iconSize={10}
              wrapperStyle={{ paddingTop: "25px", fontSize: "12px", paddingLeft: "10px" }}
              align="center"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
