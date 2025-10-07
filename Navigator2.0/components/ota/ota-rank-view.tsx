"use client"

import { memo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts"
import { BarChart3, Table, Download, ChevronLeft, ChevronRight, Info, Triangle } from "lucide-react"
import { toPng } from "html-to-image"
import { cn } from "@/lib/utils"
import { OTARankingTooltip } from "./ota-ranking-tooltip"

interface HotelInfo {
  dataKey: string
  name: string
  color: string
}

interface OTARankViewProps {
  cardRef: React.RefObject<HTMLDivElement>
  selectedChannelData: any
  selectedProperty: any
  rankViewMode: "graph" | "table"
  setRankViewMode: (mode: "graph" | "table") => void
  errorMessage: string | null
  rankingTrendsData: any[]
  availableHotelLines: HotelInfo[]
  legendVisibility: Record<string, boolean>
  toggleLegendVisibility: (dataKey: string) => void
  competitorPage: number
  handlePrevCompetitors: () => void
  handleNextCompetitors: () => void
  handleDownloadImage: () => void
  handleDownloadCSV: () => void
  formatTableDate: (date: string | Date) => { formatted: string; dayName: string }
  isLoading?: boolean
}

function OTARankView({
  cardRef,
  selectedChannelData,
  selectedProperty,
  rankViewMode,
  setRankViewMode,
  errorMessage,
  rankingTrendsData,
  availableHotelLines,
  legendVisibility,
  toggleLegendVisibility,
  competitorPage,
  handlePrevCompetitors,
  handleNextCompetitors,
  handleDownloadImage,
  handleDownloadCSV,
  formatTableDate,
  isLoading = false
}: OTARankViewProps) {
  console.log('OTARankView rendered with data:', {
    rankingTrendsDataLength: rankingTrendsData?.length || 0,
    rankingTrendsData: rankingTrendsData,
    isLoading
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
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <div className="text-sm text-muted-foreground">Preparing your Ota Data Analysis...</div>
                <div className="text-sm text-muted-foreground">Hang tight — your data will appear shortly.</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card ref={cardRef} className="bg-gradient-to-br from-card to-card/50 shadow-xl border border-border/50 mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`w-6 h-6 rounded ${selectedChannelData?.iconBg || 'bg-primary'} flex items-center justify-center mt-0.5`}>
              <span className="text-white text-xs font-bold">{selectedChannelData?.icon}</span>
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-bold">Ranking Trends Analysis</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Comprehensive ranking comparison across all channels with market insights</p>
            </div>
          </div>

          {/* View Toggle and Download Button Container */}
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <TooltipProvider>
              <div className="flex items-center border border-border rounded-lg overflow-hidden h-9 w-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={rankViewMode === "graph" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setRankViewMode("graph")}
                      className={cn(
                        "h-9 w-9 rounded-none border-r-0 border-b-0",
                        rankViewMode === "graph" ? "border-r-0 border-b-0" : "border-r-0 border-b-0 hover:border-r-0 hover:border-b-0"
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
                      variant={rankViewMode === "table" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setRankViewMode("table")}
                      className={cn(
                        "h-9 w-9 rounded-none border-l-0 border-t-0",
                        rankViewMode === "table" ? "border-l-0 border-t-0" : "border-l-0 border-t-0 hover:border-l-0 hover:border-t-0"
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
                <DropdownMenuItem onClick={handleDownloadImage}>Export as Image</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadCSV}>Export as CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pt-1 pb-2">
        {/* Error Message */}
        {errorMessage && (
          <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertDescription className="text-red-800 dark:text-red-200">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Ranking Content - Graph or Table */}
        {rankViewMode === "graph" ? (
          <div style={{ height: '470px' }} className="[&_.recharts-wrapper]:mt-3 [&_.recharts-legend-wrapper]:!bottom-[54px]">
            {rankingTrendsData && rankingTrendsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rankingTrendsData} margin={{ top: 20, right: 40, left: 30, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-15 dark:opacity-10" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    interval="preserveStartEnd"
                    height={85}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", dy: 10 }}
                    axisLine={true}
                    tickLine={false}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    domain={[1, 'dataMax']}
                    reversed={true}
                    label={{
                      value: 'Ranking Position',
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }}
                    tickFormatter={(value: number) => {
                      // Calculate the maximum rank from the current data
                      if (rankingTrendsData.length === 0) return value.toString()

                      // Get all rank values from visible hotel lines
                      const visibleHotels = availableHotelLines.filter(hotel => legendVisibility[hotel.dataKey])
                      const allRankValues = rankingTrendsData.flatMap(d =>
                        visibleHotels
                          .map(hotel => d[hotel.dataKey])
                          .filter(rank => rank != null && typeof rank === 'number' && rank > 0)
                      )

                      if (allRankValues.length === 0) return value.toString()

                      const maxRank = Math.max(...allRankValues)

                      // Hide the highest rank value (worst ranking) from Y-axis
                      // Show rank 1 (best) and intermediate values, but hide the worst rank
                      if (value >= maxRank && value > 1) {
                        return ''
                      }

                      return value.toString()
                    }}
                    width={50}
                  />
                  <RechartsTooltip
                    content={(props) => (
                      <OTARankingTooltip
                        active={props.active || false}
                        payload={props.payload || []}
                        label={props.label || ''}
                        coordinate={props.coordinate || { x: 0, y: 0 }}
                        availableHotelLines={availableHotelLines}
                      />
                    )}
                    allowEscapeViewBox={{ x: true, y: true }}
                    offset={0}
                    isAnimationActive={false}
                    position={{ x: undefined, y: undefined }}
                    wrapperStyle={{
                      zIndex: 10000,
                      pointerEvents: 'none'
                    }}
                  />
                  {/* Hotel Lines - Dynamic rendering using Overview page pattern */}
                  {availableHotelLines.map((hotel) => {
                    const isVisible = legendVisibility[hotel.dataKey]

                    return (
                      <Line
                        key={hotel.dataKey}
                        type="monotone"
                        dataKey={hotel.dataKey}
                        stroke={isVisible ? hotel.color : 'transparent'}
                        strokeWidth={isVisible ? (hotel.dataKey === 'myHotel' ? 3 : 2) : 0}
                        name={hotel.name}
                        dot={isVisible ? {
                          fill: "white",
                          stroke: hotel.color,
                          strokeWidth: 2,
                          r: hotel.dataKey === 'myHotel' ? 4 : 3
                        } : false}
                        activeDot={isVisible ? {
                          r: hotel.dataKey === 'myHotel' ? 6 : 5,
                          fill: hotel.color,
                          stroke: hotel.color,
                          strokeWidth: 2
                        } : false}
                        hide={!isVisible}
                        isAnimationActive={false}
                        animationDuration={0}
                      />
                    )
                  })}

                  {/* Recharts Legend with Overview page pattern */}
                  <Legend
                    verticalAlign="bottom"
                    height={30}
                    iconType="line"
                    wrapperStyle={{
                      paddingTop: "5px",
                      fontSize: "12px",
                      cursor: "pointer",
                      lineHeight: "1.6",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "18px",
                      justifyContent: "center"
                    }}
                    onClick={(event: any) => {
                      if (event.dataKey && typeof event.dataKey === 'string') {
                        // Toggle legend visibility using Overview page pattern
                        toggleLegendVisibility(event.dataKey)
                      }
                    }}
                    formatter={(value, entry: any) => {
                      const dataKey = entry.dataKey as string
                      const isVisible = legendVisibility[dataKey]

                      return (
                        <span style={{
                          color: isVisible ? entry.color : '#9ca3af',
                          fontWeight: isVisible ? 500 : 400,
                          textDecoration: isVisible ? 'none' : 'line-through',
                          cursor: 'pointer'
                        }}>
                          {value}
                        </span>
                      )
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <div className="text-sm text-muted-foreground">Preparing your Ota Data Analysis...</div>
                  <div className="text-sm text-muted-foreground">Hang tight — your data will appear shortly.</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Table View with Reviews styling and sticky columns
          <div style={{ height: '470px' }} className="mt-4 mb-5">
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <div className="max-h-[462px] overflow-y-auto">
                  <table className="w-full relative">
                    {/* Sticky Header */}
                    <thead className="bg-gray-50 sticky top-0 z-20">
                      <tr className="border-b border-gray-200">
                        {/* Sticky Check-in Date Column */}
                        <th className="sticky left-0 z-30 bg-gray-50 text-left py-1.5 pl-2 pr-4 font-semibold text-xs text-muted-foreground border-r border-gray-200">
                          Check-in Date
                        </th>
                        {/* Sticky My Hotel Column */}
                        <th className="sticky left-24 z-30 bg-blue-50 text-center py-1.5 pl-2 pr-4 font-semibold text-xs text-muted-foreground border-r border-gray-200">
                          {selectedProperty?.name}
                          <div className="flex items-center justify-center space-x-6">
                            <div className="text-xs text-muted-foreground font-normal mt-0.5">Rank</div>
                            <span className="text-gray-500 text-xs px-1 py-0.5 rounded text-center" style={{ width: '30px', display: 'inline-block' }}><Triangle className="h-3 w-3" /></span>
                          </div>
                        </th>
                        {/* Competitor Columns */}
                        {(() => {
                          const allCompetitors = availableHotelLines.filter(hotel => hotel.dataKey !== 'myHotel');
                          const competitorSlice = allCompetitors.slice(competitorPage * 4, (competitorPage + 1) * 4);

                          return Array.from({ length: 4 }, (_, index) => {
                            const hotel = competitorSlice[index];

                            if (hotel) {
                              return (
                                <th key={hotel.dataKey} className={`text-center py-1.5 px-0 font-semibold text-xs text-muted-foreground min-w-32 ${index !== 3 ? 'border-r' : ''}`} style={{ marginLeft: '-20px' }}>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="truncate cursor-pointer">{hotel.name.length > 20 ? `${hotel.name.substring(0, 20)}...` : hotel.name}</div>
                                      </TooltipTrigger>
                                      {hotel.name.length > 20 && (
                                        <TooltipContent className="bg-black text-white border-black font-normal">
                                          <p>{hotel.name}</p>
                                        </TooltipContent>
                                      )}
                                    </Tooltip>
                                  </TooltipProvider>
                                  <div className="flex items-center justify-center space-x-6">
                                    <div className="text-xs text-muted-foreground font-normal mt-0.5">Rank</div>
                                    <span className="text-gray-500 text-xs px-1 py-0.5 rounded text-center" style={{ width: '30px', display: 'inline-block' }}><Triangle className="h-3 w-3" /></span>
                                  </div>
                                </th>
                              );
                            } else {
                              return (
                                <th key={`empty-${index}`} className="text-right py-1.5 px-0 font-semibold text-xs text-muted-foreground min-w-32" style={{ marginLeft: '-20px' }}>
                                  <div className="text-xs text-muted-foreground font-normal mt-0.5 opacity-0">-</div>
                                </th>
                              );
                            }
                          });
                        })()}
                        {/* Navigation Column */}
                        {availableHotelLines.filter(hotel => hotel.dataKey !== 'myHotel').length > 0 && (
                          <th className="text-center py-1.5 px-2 font-semibold text-xs text-muted-foreground w-20">
                            <TooltipProvider>
                              <div className="flex items-center justify-center">
                                <div className="flex border border-input rounded-md">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 rounded-none border-0"
                                        onClick={handlePrevCompetitors}
                                        disabled={competitorPage === 0}
                                      >
                                        <ChevronLeft className="h-3 w-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                                      <p className="text-xs font-normal">Previous</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <div className="w-px bg-border"></div>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 rounded-none border-0"
                                        onClick={handleNextCompetitors}
                                        disabled={competitorPage >= Math.ceil(availableHotelLines.filter(hotel => hotel.dataKey !== 'myHotel').length / 4) - 1}
                                      >
                                        <ChevronRight className="h-3 w-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                                      <p className="text-xs font-normal">Next</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>
                            </TooltipProvider>
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {rankingTrendsData.map((dataPoint, index) => {
                        // Find the selected property (myHotel) or use the first available property
                        const myHotelData = availableHotelLines.find(hotel => hotel.dataKey === 'myHotel');
                        const allCompetitors = availableHotelLines.filter(hotel => hotel.dataKey !== 'myHotel');
                        const competitors = allCompetitors.slice(competitorPage * 4, (competitorPage + 1) * 4);

                        return (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 group">
                            {/* Sticky Check-in Date */}
                            <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 py-2 pl-2 pr-4 font-medium text-foreground text-sm border-r border-gray-200">
                              {(() => {
                                const dateInfo = formatTableDate(dataPoint.fullDate || dataPoint.date)
                                return (
                                  <div className="flex items-center">
                                    <span>{dateInfo.formatted}, </span>
                                    <span className="font-normal text-gray-600 ml-1" style={{ fontSize: '12px' }}>{dateInfo.dayName}</span>
                                  </div>
                                )
                              })()}
                            </td>
                            {/* Sticky My Hotel Rank */}
                            <td className="sticky left-24 z-10 bg-blue-50 group-hover:bg-blue-100 py-2 pl-2 pr-4 text-right border-r border-gray-200 border-b border-gray-200">
                              <div className="flex items-center justify-center space-x-6">
                                {/* <span className="font-semibold text-sm">{dataPoint[myHotelData?.dataKey || 'myHotel'] ?? '500+'}</span> */}
                                {
                                  dataPoint[myHotelData?.dataKey || 'myHotel'] === null || dataPoint[myHotelData?.dataKey || 'myHotel'] === undefined || dataPoint[myHotelData?.dataKey || 'myHotel'] > 500 ?
                                    (<div className="flex items-center justify-center space-x-1">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span className="text-red-600 dark:text-red-400 font-semibold text-sm cursor-help">#500+</span>
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
                                    </div>) :
                                    (<span className="font-semibold text-sm">{dataPoint[myHotelData?.dataKey || 'myHotel']}</span>)
                                }

                                {(() => {
                                  const variance = dataPoint[`${myHotelData?.dataKey || 'myHotel'}ChangeInRank`];
                                  if ((variance === 0 || variance === null || variance === undefined)) {
                                    return <span className="text-gray-500 text-xs px-1 py-0.5 rounded text-center" style={{ width: '30px', display: 'inline-block' }}></span>;
                                  }
                                  const isPositive = variance > 0;
                                  return (
                                    <span className={`text-xs font-medium px-1 py-0.5 rounded text-center ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                      }`} style={{ width: '30px', display: 'inline-block' }}>
                                      {isPositive ? '+' : ''}{variance}
                                    </span>
                                  );
                                })()}
                              </div>
                            </td>
                            {/* Competitor Ranks */}
                            {Array.from({ length: 4 }, (_, index) => {
                              const hotel = competitors[index];

                              if (hotel) {
                                return (
                                  <td key={hotel.dataKey} className={`py-2 px-0 text-right group-hover:bg-gray-50 ${index !== 3 ? 'border-r' : ''}`} style={{ marginLeft: '-20px' }}>
                                    <div className="flex items-center justify-center space-x-6">

                                      {
                                        dataPoint[hotel.dataKey] === null || dataPoint[hotel.dataKey] === undefined || dataPoint[hotel.dataKey] > 500 ?
                                          (<div className="flex items-center justify-center space-x-1">
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <span className="text-red-600 dark:text-red-400 font-semibold text-sm cursor-help" >#500+</span>
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
                                          </div>) :
                                          (<span className="font-semibold text-sm">{dataPoint[hotel.dataKey]}</span>)
                                      }

                                      {(() => {
                                        const variance = dataPoint[`${hotel.dataKey}ChangeInRank`];
                                        if (variance === 0 || variance === null || variance === undefined) {
                                          return <span className="text-gray-500 text-xs px-1 py-0.5 rounded text-center" style={{ width: '30px', display: 'inline-block' }}></span>;
                                        }
                                        const isPositive = variance > 0;
                                        return (
                                          <span className={`text-xs font-medium px-1 py-0.5 rounded text-center ${isPositive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                                            }`} style={{ width: '30px', display: 'inline-block' }}>
                                            {isPositive ? '+' : ''}{variance}
                                          </span>
                                        );
                                      })()}
                                    </div>
                                  </td>
                                );
                              } else {
                                return (
                                  <td key={`empty-${index}`} className="py-2 px-0 text-right group-hover:bg-gray-50" style={{ marginLeft: '-20px' }}>
                                    <div className="flex items-center justify-end space-x-6">
                                      <span className="font-semibold text-sm text-gray-300 opacity-0">-</span>
                                      <span className="text-gray-300 text-xs px-1 py-0.5 rounded text-center opacity-0" style={{ width: '30px', display: 'inline-block' }}>-</span>
                                    </div>
                                  </td>
                                );
                              }
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default memo(OTARankView)
