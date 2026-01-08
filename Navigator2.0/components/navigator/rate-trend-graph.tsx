"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Area, ReferenceLine } from "recharts"
import { TrendingUp, Calendar, BarChart3, Activity, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"

const chartData = [
  {
    date: "1 Jun 2025",
    medianCompRate: 2200,
    upperBound: 2400,
    lowerBound: 1600,
    marketDemand: 60,
    myHotelRate: 680,
  },
  {
    date: "3 Jun 2025",
    medianCompRate: 2180,
    upperBound: 2350,
    lowerBound: 1580,
    marketDemand: 58,
    myHotelRate: 680,
  },
  {
    date: "5 Jun 2025",
    medianCompRate: 2160,
    upperBound: 2320,
    lowerBound: 1560,
    marketDemand: 56,
    myHotelRate: 680,
  },
  {
    date: "7 Jun 2025",
    medianCompRate: 2240,
    upperBound: 2420,
    lowerBound: 1640,
    marketDemand: 62,
    myHotelRate: 680,
  },
  {
    date: "9 Jun 2025",
    medianCompRate: 2300,
    upperBound: 2500,
    lowerBound: 1720,
    marketDemand: 30,
    myHotelRate: 810,
  },
  {
    date: "11 Jun 2025",
    medianCompRate: 2280,
    upperBound: 2480,
    lowerBound: 1700,
    marketDemand: 32,
    myHotelRate: 810,
  },
  {
    date: "13 Jun 2025",
    medianCompRate: 2260,
    upperBound: 2460,
    lowerBound: 1680,
    marketDemand: 34,
    myHotelRate: 810,
  },
  {
    date: "15 Jun 2025",
    medianCompRate: 2200,
    upperBound: 2400,
    lowerBound: 1620,
    marketDemand: 25,
    myHotelRate: 680,
  },
  {
    date: "17 Jun 2025",
    medianCompRate: 2180,
    upperBound: 2380,
    lowerBound: 1600,
    marketDemand: 26,
    myHotelRate: 680,
  },
  {
    date: "19 Jun 2025",
    medianCompRate: 2160,
    upperBound: 2360,
    lowerBound: 1580,
    marketDemand: 25,
    myHotelRate: 680,
  },
  {
    date: "21 Jun 2025",
    medianCompRate: 2200,
    upperBound: 2400,
    lowerBound: 1620,
    marketDemand: 45,
    myHotelRate: 680,
  },
  {
    date: "23 Jun 2025",
    medianCompRate: 2220,
    upperBound: 2420,
    lowerBound: 1640,
    marketDemand: 47,
    myHotelRate: 680,
  },
  {
    date: "25 Jun 2025",
    medianCompRate: 2180,
    upperBound: 2380,
    lowerBound: 1600,
    marketDemand: 35,
    myHotelRate: 680,
  },
  {
    date: "27 Jun 2025",
    medianCompRate: 2160,
    upperBound: 2360,
    lowerBound: 1580,
    marketDemand: 30,
    myHotelRate: 680,
  },
  {
    date: "29 Jun 2025",
    medianCompRate: 2140,
    upperBound: 2340,
    lowerBound: 1560,
    marketDemand: 28,
    myHotelRate: 680,
  },
]

export function RateTrendGraph() {
  const [chartType, setChartType] = useState<'spread' | 'lines'>('spread')
  const [showDemand, setShowDemand] = useState(true)

  return (
    <Card className="card-enhanced">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950 dark:to-purple-950">
                <BarChart3 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              Rate Spread Analysis
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Monitor competitive rate positioning and market demand patterns
            </p>
          </div>
          
          {/* Chart Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Activity className="w-4 h-4" />
                  {chartType === 'spread' ? 'Rate Spread' : 'Line View'}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setChartType('spread')}>
                  Rate Spread View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('lines')}>
                  Line Chart View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant={showDemand ? "default" : "outline"} 
              size="sm" 
              onClick={() => setShowDemand(!showDemand)}
              className="gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Demand
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <ChartContainer
          config={{
            medianCompRate: {
              label: "Median Competitor Rate",
              color: "#10B981", // Emerald-500
            },
            marketDemand: {
              label: "Market Demand",
              color: "#6B7280", // Gray-500
            },
            myHotelRate: {
              label: "Vakkaru Maldives",
              color: "#3B82F6", // Blue-500 (brand color)
            },
            upperBound: {
              label: "Upper Rate Bound",
              color: "#F59E0B", // Amber-500
            },
            lowerBound: {
              label: "Lower Rate Bound",
              color: "#F59E0B", // Amber-500
            },
          }}
          className="h-[500px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart 
              data={chartData} 
              margin={{ top: 20, right: 30, bottom: 60, left: 40 }}
            >
              <defs>
                {/* Enhanced gradient for rate spread */}
                <linearGradient id="rateSpreadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(59, 130, 246, 0.15)" />
                  <stop offset="50%" stopColor="rgba(147, 51, 234, 0.1)" />
                  <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
                </linearGradient>
                
                {/* Gradient for demand bars */}
                <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(107, 114, 128, 0.8)" />
                  <stop offset="100%" stopColor="rgba(107, 114, 128, 0.4)" />
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="currentColor" 
                className="opacity-20" 
                horizontal={true}
                vertical={false}
              />
              
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'currentColor' }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })
                }}
                angle={-45}
                textAnchor="end"
                height={80}
                className="text-muted-foreground"
              />
              
              <YAxis
                yAxisId="price"
                orientation="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'currentColor' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                domain={[500, 2600]}
                className="text-muted-foreground"
              />
              
              {showDemand && (
                <YAxis
                  yAxisId="demand"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  tickFormatter={(value) => `${value}%`}
                  domain={[20, 70]}
                  className="text-muted-foreground"
                />
              )}

              {/* Rate spread area - only show in spread view */}
              {chartType === 'spread' && (
                <>
                  <Area
                    yAxisId="price"
                    dataKey="upperBound"
                    fill="url(#rateSpreadGradient)"
                    stroke="none"
                    stackId="spread"
                  />
                  <Area 
                    yAxisId="price" 
                    dataKey="lowerBound" 
                    fill="rgba(255, 255, 255, 0.9)" 
                    stroke="none" 
                    stackId="spread" 
                  />
                </>
              )}

              {/* Market demand bars */}
              {showDemand && (
                <Bar
                  yAxisId="demand"
                  dataKey="marketDemand"
                  fill="url(#demandGradient)"
                  radius={[3, 3, 0, 0]}
                  opacity={0.7}
                />
              )}

              {/* Median competitor rate line */}
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="medianCompRate"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                activeDot={{ 
                  r: 6, 
                  stroke: "#10B981", 
                  strokeWidth: 2,
                  fill: "#ffffff",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                }}
              />

              {/* My hotel rate line */}
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="myHotelRate"
                stroke="#3B82F6"
                strokeWidth={4}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 5 }}
                activeDot={{ 
                  r: 7, 
                  stroke: "#3B82F6", 
                  strokeWidth: 3,
                  fill: "#ffffff",
                  filter: "drop-shadow(0 2px 6px rgba(59, 130, 246, 0.3))"
                }}
              />

              {/* Reference lines for rate bounds in line view */}
              {chartType === 'lines' && (
                <>
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="upperBound"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    opacity={0.7}
                  />
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="lowerBound"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    opacity={0.7}
                  />
                </>
              )}

              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  
                  return (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-4 min-w-[200px]">
                      <p className="font-semibold text-foreground mb-2">
                        {new Date(label).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <div className="space-y-1">
                        {payload.map((entry, index) => {
                          if (entry.dataKey === 'upperBound' || entry.dataKey === 'lowerBound') return null
                          
                          let label = entry.name
                          let value = entry.value
                          let color = entry.color
                          
                          if (entry.dataKey === 'marketDemand') {
                            value = `${value}%`
                          } else {
                            value = `$${value}`
                          }
                          
                          return (
                            <div key={index} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: color }}
                                />
                                <span className="text-sm text-muted-foreground">{label}</span>
                              </div>
                              <span className="text-sm font-semibold text-foreground">{value}</span>
                            </div>
                          )
                        })}
                        
                        {/* Show rate spread info */}
                        {chartType === 'spread' && payload.find(p => p.dataKey === 'upperBound') && (
                          <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs text-muted-foreground">Rate Spread</span>
                              <span className="text-xs font-medium text-foreground">
                                ${payload.find(p => p.dataKey === 'lowerBound')?.value} - ${payload.find(p => p.dataKey === 'upperBound')?.value}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }}
              />
              
              <Legend
                verticalAlign="bottom"
                height={50}
                iconType="line"
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "12px",
                }}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color, fontWeight: 500 }}>
                    {value}
                  </span>
                )}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Chart Summary Stats */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Your Rate</div>
              <div className="text-lg font-bold text-brand-600 dark:text-brand-400">$680</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Avg Competitor</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">$2,200</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Rate Difference</div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">-69%</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Avg Demand</div>
              <div className="text-lg font-bold text-slate-600 dark:text-slate-400">42%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
