"use client"

import { memo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { BarChart3, Table, Download, Info } from "lucide-react"
import { toPng } from "html-to-image"
import { cn } from "@/lib/utils"

interface OTAReviewsViewProps {
  cardRef: React.RefObject<HTMLDivElement>
  selectedChannelData: any
  selectedChannel: string
  selectedProperty: any
  reviewsViewMode: "graph" | "table"
  setReviewsViewMode: (mode: "graph" | "table") => void
  reviewsData: any[]
}

function OTAReviewsView({
  cardRef,
  selectedChannelData,
  selectedChannel,
  selectedProperty,
  reviewsViewMode,
  setReviewsViewMode,
  reviewsData
}: OTAReviewsViewProps) {
  return (
    <Card className="bg-gradient-to-br from-card to-card/50 shadow-xl border border-border/50 mb-6">
      <CardHeader className="p-6 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`w-6 h-6 rounded ${selectedChannelData?.iconBg || 'bg-primary'} flex items-center justify-center mt-0.5`}>
              <span className="text-white text-xs font-bold">
                {selectedChannelData?.icon || selectedChannel.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-bold">
                Reviews Trends
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track review scores and volume trends across your selected channels over time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <TooltipProvider>
              <div className="flex items-center border border-border rounded-lg overflow-hidden h-9 w-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={reviewsViewMode === "graph" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setReviewsViewMode("graph")}
                      className={cn(
                        "h-[42px] w-[42px] p-0 rounded-none border-0",
                        reviewsViewMode === "graph" ? "bg-primary text-primary-foreground" : ""
                      )}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                    <p className="text-xs font-normal">Graph View</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={reviewsViewMode === "table" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setReviewsViewMode("table")}
                      className={cn(
                        "h-[42px] w-[42px] p-0 rounded-none border-0",
                        reviewsViewMode === "table" ? "bg-primary text-primary-foreground" : ""
                      )}
                    >
                      <Table className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                    <p className="text-xs font-normal">Table View</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            {/* Download Button */}
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="btn-minimal">
                        <Download className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                    <p className="text-xs font-normal">Download</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  const element = reviewsViewMode === "graph" ? document.getElementById('reviews-chart') : cardRef.current
                  if (element) {
                    toPng(element)
                      .then((dataUrl) => {
                        const link = document.createElement('a')
                        link.download = `reviews-${reviewsViewMode}.png`
                        link.href = dataUrl
                        link.click()
                      })
                      .catch((err) => {
                        console.error('Export failed:', err)
                      })
                  }
                }}>Export as Image</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  if (reviewsViewMode === "graph") {
                    const csvData = reviewsData.map(item => ({
                      Week: item.week,
                      'Review Score': item.reviewScore,
                      'Number of Reviews': item.numberOfReviews
                    }))
                    
                    const headers = Object.keys(csvData[0])
                    const csvContent = [
                      headers.join(','),
                      ...csvData.map(row => headers.map(header => row[header as keyof typeof row]).join(','))
                    ].join('\n')
                    
                    const blob = new Blob([csvContent], { type: 'text/csv' })
                    const url = window.URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = 'reviews-trends.csv'
                    link.click()
                    window.URL.revokeObjectURL(url)
                  } else {
                    // Handle table CSV export here if needed
                    console.log('Table CSV export')
                  }
                }}>Export as CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pt-1 pb-0">
        {reviewsViewMode === "table" ? (
          <div style={{ height: '400px' }} className="mt-3 mb-6">
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-1.5 px-2 font-semibold text-xs text-muted-foreground border-r border-gray-200">Hotel</th>
                        <th className="text-right py-1.5 px-2 pr-16 font-semibold text-xs text-muted-foreground">
                          Review Score
                          <div className="text-xs text-muted-foreground font-normal mt-0.5">Out of 10</div>
                        </th>
                        <th className="text-right py-1.5 px-2 pr-8 font-semibold text-xs text-muted-foreground">
                          Number of<br/>Reviews
                        </th>
                        <th className="text-right py-1.5 px-2 pr-28 font-semibold text-xs text-muted-foreground">
                          Rank
                          <div className="text-xs text-muted-foreground font-normal mt-0.5">As on today</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* My Hotel - First Row */}
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-2 font-medium text-foreground text-sm border-r border-gray-200">{selectedProperty?.name || 'Alhambra Hotel'}</td>
                        <td className="py-2 px-2 pr-16 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <span className="bg-red-100 text-red-800 px-1 py-0.5 rounded text-xs font-medium" style={{fontSize: '10px'}}>WORST</span>
                            <span className="font-semibold text-sm">6.2</span>
                          </div>
                        </td>
                        <td className="py-2 px-2 pr-8 text-right font-semibold text-sm">626</td>
                        <td className="py-2 px-2 pr-28 text-right font-semibold text-sm">#7</td>
                      </tr>
                      {/* Competitor Hotels */}
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-2 text-sm border-r border-gray-200">Hotel Alexander Plaza</td>
                        <td className="py-2 px-2 pr-16 text-right font-semibold text-sm">8.7</td>
                        <td className="py-2 px-2 pr-8 text-right font-semibold text-sm">3855</td>
                        <td className="py-2 px-2 pr-28 text-right font-semibold text-sm">#1</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-2 text-sm border-r border-gray-200">Comfort Hotel Auberge</td>
                        <td className="py-2 px-2 pr-16 text-right font-semibold text-sm">7.5</td>
                        <td className="py-2 px-2 pr-8 text-right font-semibold text-sm">2515</td>
                        <td className="py-2 px-2 pr-28 text-right font-semibold text-sm">
                          <div className="flex items-center justify-end space-x-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-red-600 dark:text-red-400 font-normal cursor-help">#500+</span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="p-3 bg-slate-900 text-white border border-slate-700 rounded-lg shadow-xl max-w-xs">
                                  <p className="text-sm font-normal">Property not available in top 500 ranking.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-3 h-3 text-red-600 dark:text-red-400 cursor-help transition-colors" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="p-3 bg-slate-900 text-white border border-slate-700 rounded-lg shadow-xl max-w-xs">
                                  <p className="text-sm font-normal">Property not available in top 500 ranking.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-2 text-sm border-r border-gray-200">acom Hotel Berlin City Süd</td>
                        <td className="py-2 px-2 pr-16 text-right font-semibold text-sm">8.1</td>
                        <td className="py-2 px-2 pr-8 text-right font-semibold text-sm">810</td>
                        <td className="py-2 px-2 pr-28 text-right font-semibold text-sm">#2</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-2 text-sm border-r border-gray-200">InterCityHotel Berlin Ostbahnhof</td>
                        <td className="py-2 px-2 pr-16 text-right font-semibold text-sm">7.9</td>
                        <td className="py-2 px-2 pr-8 text-right font-semibold text-sm">3670</td>
                        <td className="py-2 px-2 pr-28 text-right font-semibold text-sm">#3</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-2 text-sm border-r border-gray-200">Mercure Hotel Berlin City West</td>
                        <td className="py-2 px-2 pr-16 text-right font-semibold text-sm">7.0</td>
                        <td className="py-2 px-2 pr-8 text-right font-semibold text-sm">2096</td>
                        <td className="py-2 px-2 pr-28 text-right font-semibold text-sm">#6</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-2 px-2 text-sm border-r border-gray-200">Hotel Brandies an der Messe</td>
                        <td className="py-2 px-2 pr-16 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-xs font-medium" style={{fontSize: '10px'}}>BEST</span>
                            <span className="font-semibold text-sm">8.8</span>
                          </div>
                        </td>
                        <td className="py-2 px-2 pr-8 text-right font-semibold text-sm">1485</td>
                        <td className="py-2 px-2 pr-28 text-right font-semibold text-sm">#5</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div id="reviews-chart" className="mt-1" style={{ height: '440px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reviewsData} margin={{ top: 15, right: 40, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-15 dark:opacity-10" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="week"
                  className="text-xs"
                  interval="preserveStartEnd"
                  height={85}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", dy: 10 }}
                  axisLine={true}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  className="text-xs"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 10]}
                  label={{
                    value: 'Review Score',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                  width={50}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  className="text-xs"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 'dataMax']}
                  label={{
                    value: 'Number of Reviews',
                    angle: 90,
                    position: 'insideRight',
                    style: { textAnchor: 'middle' }
                  }}
                  width={50}
                />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white text-gray-900 p-3 border border-gray-200 rounded-lg shadow-xl">
                          <div className="text-gray-900 font-bold text-sm border-b border-gray-300 pb-2 mb-2">
                            {label}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                              <span className="text-sm text-gray-900">Review Score: <span className="font-bold">{data.reviewScore}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              <span className="text-sm text-gray-900">No. of Reviews: <span className="font-bold">{data.numberOfReviews}</span></span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="reviewScore"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ fill: "white", stroke: "#2563eb", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#2563eb", stroke: "#2563eb", strokeWidth: 2 }}
                  name="Review Score"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="numberOfReviews"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ fill: "white", stroke: "#f97316", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#f97316", stroke: "#f97316", strokeWidth: 2 }}
                  name="Number of Reviews"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default memo(OTAReviewsView)
