"use client"

import { useState } from "react"
import { Target, BarChart3, TrendingUp, Calendar, Globe, ChevronDown } from "lucide-react"
import { BusinessInsightsTabs } from "@/components/business-insights/business-insights-tabs"
import { BusinessInsightsTable } from "@/components/business-insights/business-insights-table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EnhancedDatePicker } from "@/components/enhanced-date-picker"
import { cn } from "@/lib/utils"

// Business Insights Tab Configuration
const businessInsightsTabs = [
  { id: "market-insights", label: "Market Insights", icon: Target },
  { id: "rate-leaderboard", label: "Rate Leaderboard", icon: BarChart3 },
  { id: "rate-volatility", label: "Rate Volatility", icon: TrendingUp }
]

export default function BusinessInsightsPage() {
  const [activeTab, setActiveTab] = useState("market-insights")
  
  // Filter states
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)) // 14 days from now
  const [selectedChannels, setSelectedChannels] = useState<number[]>([-1]) // Default to "All Channels"
  
  // Sample channels data
  const availableChannels = [
    { cid: -1, name: "All Channels" },
    { cid: 1, name: "Booking.com" },
    { cid: 2, name: "Expedia" },
    { cid: 3, name: "Agoda" },
    { cid: 4, name: "MakeMyTrip" },
    { cid: 5, name: "Hotels.com" },
    { cid: 6, name: "TripAdvisor" },
    { cid: 7, name: "Kayak" }
  ]

  // Date range handler
  const handleDateRangeChange = (newStartDate?: Date, newEndDate?: Date) => {
    if (newStartDate && newEndDate) {
      setStartDate(newStartDate)
      setEndDate(newEndDate)
      console.log(`📅 Business Insights date range changed: ${newStartDate.toLocaleDateString()} - ${newEndDate.toLocaleDateString()}`)
    }
  }

  // Channel selection handler
  const handleChannelSelect = (channelId: number) => {
    setSelectedChannels(prev => {
      if (channelId === -1) {
        // If selecting "All Channels", clear all others
        return [-1]
      } else {
        // If selecting a specific channel
        if (prev.includes(channelId)) {
          // Remove the channel
          const newSelection = prev.filter(c => c !== channelId && c !== -1)
          return newSelection.length === 0 ? [-1] : newSelection
        } else {
          // Add the channel and remove "All Channels" if present
          const filteredSelection = prev.filter(c => c !== -1)
          return [...filteredSelection, channelId]
        }
      }
    })
  }

  // Get display text for channel button
  const getChannelDisplayText = () => {
    if (selectedChannels.length === 0 || selectedChannels.includes(-1)) {
      return "All Channels"
    } else if (selectedChannels.length === 1) {
      const channel = availableChannels.find(c => c.cid === selectedChannels[0])
      return channel ? channel.name : "Select Channels"
    } else {
      return `${selectedChannels.length} Channels`
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* Business Insights Tabs Section - Below Navigation */}
      {/* <div className="relative z-10">
        <BusinessInsightsTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          businessInsightsTabs={businessInsightsTabs}
        />
      </div> */}
      
      {/* Filter Bar - Below Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="max-w-7xl xl:max-w-none mx-auto">
            <div className="flex items-center gap-4 py-4">
              {/* Check-in Date Range Picker */}
              <div className="shrink-0">
                <EnhancedDatePicker
                  startDate={startDate}
                  endDate={endDate}
                  onChange={handleDateRangeChange}
                />
              </div>

              {/* Channels Filter */}
              <div className="shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                    >
                      <Globe className="w-4 h-4 shrink-0" />
                      <span className="font-semibold">
                        {getChannelDisplayText()}
                      </span>
                      <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-auto p-0 shadow-xl border-slate-200 dark:border-slate-700 z-[60]">
                    <div className="flex">
                      <div className="w-56 p-4">
                        <h4 className="font-semibold text-sm text-gray-700 mb-3">Channels</h4>
                        <div className="space-y-1 max-h-80 overflow-y-auto">
                          {availableChannels.map((option) => (
                            <label
                              key={option.cid}
                              className="py-2 px-3 transition-colors rounded-sm flex items-center hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-0 focus:outline-none mr-3 cursor-pointer"
                                checked={selectedChannels.includes(option.cid)}
                                onChange={() => handleChannelSelect(option.cid)}
                              />
                              <span className="font-medium text-sm flex-1">
                                {option.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <main className="relative z-10">
        <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-2 md:py-4 lg:py-6 max-w-7xl xl:max-w-none mx-auto">
          {/* Business Insights Table */}
          <BusinessInsightsTable />
        </div>
      </main>
      
    </div>
  )
}
