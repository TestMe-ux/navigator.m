"use client"

import React, { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronLeft, ChevronRight, Info } from "lucide-react"

interface Channel {
  id: string
  name: string
  icon: string
  iconBg: string
  avgRank: number
  totalRankings: number
  rankingChange: number
  compareText: string
  reviewScore: number
  reviewText: string
  url?: string
  isActive?: boolean
}

interface OTAChannelCardsProps {
  viewMode: string
  selectedChannel: string
  setSelectedChannel: (channel: string) => void
  currentChannels: Channel[]
  currentChannelPage: number
  totalChannelPages: number
  handlePrevChannels: () => void
  handleNextChannels: () => void
  isLoading?: boolean
  masterActiveReviews: []
}

function OTAChannelCards({
  viewMode,
  selectedChannel,
  setSelectedChannel,
  currentChannels,
  currentChannelPage,
  totalChannelPages,
  handlePrevChannels,
  handleNextChannels,
  isLoading = false,
  masterActiveReviews

}: OTAChannelCardsProps) {
  if (isLoading) {
    return (
      <div className="w-full animate-slide-up">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-gradient-to-br from-card to-card/50 shadow-xl border border-border/50">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }
  const outOfScore = (channelname: any) => {
    debugger
    if (masterActiveReviews.length > 0) {
      const match: any = masterActiveReviews.find((item: any) => item.channelName.toLowerCase() === channelname.toLowerCase());
      return match ? match?.outOfScore : 10;
    }
    return 10;
  };
  return (
    <div className="w-full animate-slide-up">
      {/* Channel Cards with Pagination */}
      <div className="relative mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {currentChannels.map((channel, index) => (
            <div key={channel.id} className="relative">
              <Card
                className={`group relative overflow-hidden bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-2 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:-translate-y-1 ${selectedChannel.toLowerCase() === channel.name.toLowerCase()
                  ? "ring-2 ring-primary/70 shadow-xl border-primary/60 scale-105"
                  : "border-border/50 hover:border-primary/20"
                  }`}
                onClick={() => setSelectedChannel(channel.name)}
              >
                <CardContent className="p-4">
                  {/* Channel Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {channel.url ? (
                        <div className="w-7 h-7 rounded-md overflow-hidden shadow-sm">
                          <img
                            src={channel.url}
                            alt={channel.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to text icon if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<div class="w-full h-full ${channel.iconBg} flex items-center justify-center"><span class="text-white text-xs font-bold">${channel.icon}</span></div>`;
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className={`w-7 h-7 rounded-md ${channel.iconBg} flex items-center justify-center shadow-sm`}>
                          <span className="text-white text-xs font-bold">{channel.icon}</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-foreground text-sm leading-tight">{channel.name}</h3>
                        {/* {channel.isActive === false && (
                          <span className="text-xs text-muted-foreground">Inactive</span>
                        )} */}
                      </div>
                    </div>
                    {selectedChannel.toLowerCase() === channel.name.toLowerCase() && (
                      <Badge className="bg-primary/15 text-primary text-xs border-primary/30 animate-pulse h-5">
                        Active
                      </Badge>
                    )}
                  </div>

                  {/* Metrics Grid - Side by Side - Conditional order for Reviews mode */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* First Metric - Review Score for Reviews mode, Rank for Rank mode */}
                    <div className="py-2 px-2 h-full flex flex-col">
                      <div className="mb-3">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {viewMode === "Reviews" ? "Review Score" : (viewMode === "Rank" ? "Rank" : "Avg Rank")}
                        </span>
                      </div>
                      <div className="flex flex-col h-full">
                        <div className="flex items-baseline space-x-1">
                          <span className="text-lg font-bold text-foreground leading-none">
                            {viewMode === "Reviews" ? channel.reviewScore > 0 ? channel.reviewScore : '--' : channel.avgRank > 0 ? channel.avgRank : (
                              <div className="flex items-center justify-end space-x-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-red-600 dark:text-red-400 font-semibold text-lg cursor-help">#500+</span>
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
                              </div>)}
                          </span>
                          {viewMode === "Reviews" ? (
                            channel.reviewScore > 0 &&
                            <span className="text-xs text-muted-foreground">/ {outOfScore(channel.name)}</span>
                          ) : (
                            channel.avgRank > 0 &&
                            <span className="text-xs text-muted-foreground">/ {channel.totalRankings}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 mt-auto pt-1">
                          {viewMode === "Reviews" ? (
                            channel.reviewScore > 0 &&
                            <span className="text-xs text-muted-foreground leading-none">As on today</span>
                          ) : (
                            <>
                              {channel.rankingChange !== 0 && (
                                <>
                                  <span className={`text-xs font-bold ${channel.rankingChange < 0
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                    }`}>
                                    {channel.rankingChange > 0 ? `+${channel.rankingChange}` : channel.rankingChange}
                                  </span>
                                  <span className="text-xs text-muted-foreground leading-none">{channel.compareText}</span>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Second Metric - Rank for Reviews mode, Review Score for Rank mode */}
                    <div className="py-2 px-2 h-full flex flex-col">
                      <div className="mb-3">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {viewMode === "Reviews" ? "Rank" : "Review Score"}
                        </span>
                      </div>
                      <div className="flex flex-col h-full">
                        <div className="flex items-baseline space-x-1">
                          <span className="text-lg font-bold text-foreground leading-none">
                            {viewMode === "Reviews" ? channel.avgRank > 0 ? channel.avgRank : (
                              <div className="flex items-center justify-end space-x-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-red-600 dark:text-red-400 font-semibold text-lg cursor-help">#500+</span>
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
                              </div>) : channel.reviewScore > 0 ? channel.reviewScore : '--'}
                          </span>
                          {viewMode === "Reviews" ? (
                            channel.avgRank > 0 &&
                            <span className="text-xs text-muted-foreground">/ {channel.totalRankings}</span>
                          ) : (
                            channel.reviewScore > 0 &&
                            <span className="text-xs text-muted-foreground">/ {outOfScore(channel.name)}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 mt-auto pt-1">
                          {viewMode === "Reviews" ? (
                            channel.reviewScore > 0 &&
                            (
                              <>
                                {channel.rankingChange !== 0 && (
                                  <>
                                    <span className={`text-xs font-bold ${channel.rankingChange < 0
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400"
                                      }`}>
                                      {channel.rankingChange > 0 ? `+${channel.rankingChange}` : channel.rankingChange}
                                    </span>
                                    <span className="text-xs text-muted-foreground leading-none">{channel.compareText}</span>
                                  </>
                                )}
                              </>
                            )
                          ) : (
                            channel.reviewScore > 0 &&
                            <span className="text-xs text-muted-foreground leading-none">{channel.reviewText}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedChannel.toLowerCase() === channel.name.toLowerCase() && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                  )}
                </CardContent>
              </Card>

              {/* Navigation Arrows - Show on top-right of last channel widget */}
              {index === currentChannels.length - 1 && totalChannelPages > 1 && (
                <div className="absolute -top-4 -right-2 flex gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrevChannels}
                          disabled={currentChannelPage === 0}
                          className="w-8 h-8 p-0 rounded-full shadow-lg bg-background hover:bg-muted border-2"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-black text-white border-black">
                        <p>Previous channels</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextChannels}
                          disabled={currentChannelPage >= totalChannelPages - 1}
                          className="w-8 h-8 p-0 rounded-full shadow-lg bg-background hover:bg-muted border-2"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-black text-white border-black">
                        <p>Next channels</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default memo(OTAChannelCards)
