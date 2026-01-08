"use client"

import { memo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { BarChart3, Table, Download, Info, X } from "lucide-react"
import { toPng } from "html-to-image"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface OTAReviewsViewProps {
  cardRef: React.RefObject<HTMLDivElement>
  selectedChannelData: any
  selectedChannel: string
  selectedProperty: any
  reviewsViewMode: "graph" | "table"
  setReviewsViewMode: (mode: "graph" | "table") => void
  reviewsData: any[]
  otaRankingData: any[]
  isLoading?: boolean,
  masterActiveReviews: any[]
}

function OTAReviewsView({
  cardRef,
  selectedChannelData,
  selectedChannel,
  selectedProperty,
  reviewsViewMode,
  setReviewsViewMode,
  reviewsData,
  otaRankingData,
  isLoading = false,
  masterActiveReviews
}: OTAReviewsViewProps) {
  console.log('OTAReviewsView rendered with data:', {
    reviewsDataLength: reviewsData?.length || 0,
    reviewsData: reviewsData,
    otaRankingDataLength: otaRankingData?.length || 0,
    otaRankingData: otaRankingData,
    isLoading,
    selectedChannel
    , selectedChannelData
  })

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-card to-card/50 shadow-xl border border-border/50 mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
            <span className="text-gray-500">Loading review trends...</span>
          </div>
        </CardContent>
      </Card>
    )
  }
  // Use fallback data if no real data is available
  const displayData = otaRankingData && otaRankingData.length > 0 ? otaRankingData.flat().filter(x => x.otaId.toString() === selectedChannelData.id).toSorted((a, b) => {
    if (a.intermediateProperty === "Sub" && b.intermediateProperty !== "Sub") return -1;
    if (a.intermediateProperty !== "Sub" && b.intermediateProperty === "Sub") return 1;
    // fallback sort (you can replace this with another field if needed)
    return b.intermediateProperty - a.intermediateProperty;
  }) : []
  const outOfScore = masterActiveReviews.length > 0 ? (masterActiveReviews.find((item: any) => item.channelName.toLowerCase() === selectedChannel.toLowerCase())?.outOfScore || 10) : 10;
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
                  const element = reviewsViewMode === "graph" ? document.getElementById('reviews-chart') : document.getElementById('reviews-table')
                  if (element) {
                    toPng(element)
                      .then((dataUrl) => {
                        const link = document.createElement('a')
                        link.download = `reviews-trends_${selectedProperty?.name}_${format(new Date(), 'yyyyMMddHHmmss')}.png`
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
                    // Export graph data (reviews trends over time)
                    const csvData = reviewsData.map(item => ({
                      Week: item.week,
                      'Review Score': item.reviewScore,
                      'Number of Reviews': item.numberOfReviews
                    }))

                    const headers = Object.keys(csvData[0])
                    const csvContent = [
                      headers.join(','),
                      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
                    ].join('\n')

                    const blob = new Blob([csvContent], { type: 'text/csv' })
                    const url = window.URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `reviews-trends_${selectedProperty?.name}_${format(new Date(), 'yyyyMMddHHmmss')}.csv`
                    link.click()
                    window.URL.revokeObjectURL(url)
                  } else {
                    // Export table data (hotel rankings)
                    const csvData = displayData.map((hotel, index) => {
                      const isMyHotel = hotel.propertyID === selectedProperty?.hmid
                      const maxScore = Math.max(...displayData.map(h => parseFloat(h.score) || 0))
                      const minScore = Math.min(...displayData.map(h => parseFloat(h.score) || 0))
                      const isBest = parseFloat(hotel.score) === maxScore
                      const isWorst = parseFloat(hotel.score) === minScore

                      return {
                        'Hotel Name': hotel.hotelName,
                        'Review Score': hotel.score,
                        'Number of Reviews': hotel.reviewCount?.toLocaleString() || 'N/A',
                        'Rank': hotel.otaRank > 500 ? '500+' : `${hotel.otaRank}`,
                        // 'Is My Hotel': isMyHotel ? 'Yes' : 'No',
                        'Performance': isBest ? 'Best' : isWorst ? 'Worst' : '',
                        'Channel': selectedChannelData?.name || selectedChannel,
                        // 'Property ID': hotel.propertyID,
                        // 'OTA ID': hotel.otaId
                      }
                    })

                    if (csvData.length > 0) {
                      const headers = Object.keys(csvData[0])
                      const csvContent = [
                        headers.join(','),
                        ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
                      ].join('\n')

                      const blob = new Blob([csvContent], { type: 'text/csv' })
                      const url = window.URL.createObjectURL(blob)
                      const link = document.createElement('a')
                      link.href = url
                      link.download = `hotel-rankings_${selectedChannelData?.name || selectedChannel}_${selectedProperty?.name}_${format(new Date(), 'yyyyMMddHHmmss')}.csv`
                      link.click()
                      window.URL.revokeObjectURL(url)
                    } else {
                      console.log('No data available for CSV export')
                    }
                  }
                }}>Export as CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pt-1 pb-0">
        {reviewsViewMode === "table" ? (
          <div style={{ height: '400px', backgroundColor: "white" }} className="mt-3 mb-6" id="reviews-table" >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading reviews data...</p>
                </div>
              </div>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-1.5 px-2 font-semibold text-xs text-muted-foreground border-r border-gray-200">Hotel</th>
                          <th className="text-right py-1.5 px-2 pr-16 font-semibold text-xs text-muted-foreground">
                            Review Score
                            <div className="text-xs text-muted-foreground font-normal mt-0.5">Out of {outOfScore}</div>
                          </th>
                          <th className="text-right py-1.5 px-2 pr-8 font-semibold text-xs text-muted-foreground">
                            Number of<br />Reviews
                          </th>
                          <th className="text-right py-1.5 px-2 pr-28 font-semibold text-xs text-muted-foreground">
                            Rank
                            <div className="text-xs text-muted-foreground font-normal mt-0.5">As on today</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayData && displayData.length > 0 ? (
                          displayData.map((hotel, index) => {
                            debugger;
                            const isMyHotel = hotel.propertyID === selectedProperty?.hmid

                            // Find max and min scores from all hotels
                            const maxScore = Math.max(...displayData.map(h => parseFloat(h.score) || 0))
                            const minScore = Math.min(...displayData.map(h => parseFloat(h.score) || 0))

                            const isBest = parseFloat(hotel.score) === maxScore
                            const isWorst = parseFloat(hotel.score) === minScore

                            return (
                              <tr key={`${hotel.propertyID}-${hotel.otaId}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className={`py-2 px-2 text-sm border-r border-gray-200 ${isMyHotel ? 'font-medium text-foreground' : ''}`}>
                                  {hotel.hotelName}
                                </td>
                                <td className="py-2 px-2 pr-16 text-right">
                                  <div className="flex items-center justify-end space-x-1">
                                    {isWorst && (
                                      <span className="bg-red-100 text-red-800 px-1 py-0.5 rounded text-xs font-medium" style={{ fontSize: '10px' }}>WORST</span>
                                    )}
                                    {isBest && (
                                      <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-xs font-medium" style={{ fontSize: '10px' }}>BEST</span>
                                    )}
                                    <span className="font-semibold text-sm">{hotel.score}</span>
                                  </div>
                                </td>
                                <td className="py-2 px-2 pr-8 text-right font-semibold text-sm">
                                  {hotel.reviewCount?.toLocaleString() || 'N/A'}
                                </td>
                                <td className="py-2 px-2 pr-28 text-right font-semibold text-sm">
                                  {hotel.otaRank > 500 ? (
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
                                  ) : (
                                    `#${hotel.otaRank}`
                                  )}
                                </td>
                              </tr>
                            )
                          })
                        ) : (
                          <tr className="border-b border-gray-100">
                            <td colSpan={4} className="py-8 px-2 text-center text-muted-foreground">
                              {isLoading ? 'Loading ranking data...' : 'No ranking data available for the selected date range'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div id="reviews-chart" className="mt-1" style={{ height: '440px', backgroundColor: 'white' }}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading reviews data...</p>
                </div>
              </div>
            ) : reviewsData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">No reviews data available for the selected date range.</p>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default memo(OTAReviewsView)
