"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Target, BarChart3, TrendingUp, Calendar } from "lucide-react"
import { BusinessInsightsTabs } from "@/components/business-insights/business-insights-tabs"
import { CheckinMonthsDatePicker } from "@/components/business-insights/checkin-months-date-picker"
import { CompetitorsDropdown } from "@/components/business-insights/competitors-dropdown"
import { RateChangesTable } from "@/components/business-insights/rate-changes-table"

// Business Insights Tab Configuration
const businessInsightsTabs = [
  { id: "market-insights", label: "Market Insights", icon: Target },
  { id: "rate-leaderboard", label: "Rate Leaderboard", icon: BarChart3 },
  { id: "rate-volatility", label: "Rate Volatility", icon: TrendingUp }
]

export default function RateLeaderboardBusinessInsightsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("rate-leaderboard")
  
  // Filter states
  // Check-in Months - default to last 12 months
  const getDefaultCheckinDates = () => {
    const today = new Date()
    const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1)
    return { 
      start: twelveMonthsAgo,
      end: today
    }
  }
  
  const defaultCheckinDates = getDefaultCheckinDates()
  const [checkinStartDate, setCheckinStartDate] = useState<Date | undefined>(defaultCheckinDates.start)
  const [checkinEndDate, setCheckinEndDate] = useState<Date | undefined>(defaultCheckinDates.end)
  
  // Shop Date Range - read-only, default to Dec'23 - Sep'25
  const shopStartDate = new Date(2023, 11, 1) // December 2023
  const shopEndDate = new Date(2025, 8, 30) // September 2025
  
  // Competitors selection state - default to all Primary hotels selected
  const getDefaultCompetitors = () => {
    // Default Primary hotels (IDs 1-5 based on sample data)
    // This will be handled by the component itself, but we initialize empty
    return []
  }
  const [selectedCompetitors, setSelectedCompetitors] = useState<number[]>(getDefaultCompetitors())

  // Handle tab navigation
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "market-insights") {
      router.push("/business-insights")
    } else if (value === "rate-leaderboard") {
      router.push("/business-insights/rate-leaderboard")
    } else if (value === "rate-volatility") {
      router.push("/business-insights/rate-volatility")
    }
  }

  // Check-in Months date range handler
  const handleCheckinDateRangeChange = (newStartDate?: Date, newEndDate?: Date) => {
    if (newStartDate && newEndDate) {
      setCheckinStartDate(newStartDate)
      setCheckinEndDate(newEndDate)
      console.log(`📅 Check-in Months changed: ${format(newStartDate, "MMM''yy")} - ${format(newEndDate, "MMM''yy")}`)
    }
  }

  // Format shop date range for display
  const formatShopDateRange = () => {
    const formatMonth = (date: Date) => format(date, "MMM''yy")
    return `${formatMonth(shopStartDate)} - ${formatMonth(shopEndDate)}`
  }

  // Handle competitors selection
  const handleCompetitorsChange = (selectedHotels: number[]) => {
    setSelectedCompetitors(selectedHotels)
    console.log(`🏨 Selected competitors:`, selectedHotels)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* Business Insights Tabs Section - Below Navigation */}
      <div className="relative z-10">
        <BusinessInsightsTabs 
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          businessInsightsTabs={businessInsightsTabs}
        />
      </div>
      
      {/* Filter Bar - Below Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="max-w-7xl xl:max-w-none mx-auto">
            <div className="flex items-center gap-4 py-4">
              {/* Check-in Months Date Picker */}
              <div className="shrink-0">
                <CheckinMonthsDatePicker
                  startDate={checkinStartDate}
                  endDate={checkinEndDate}
                  onChange={handleCheckinDateRangeChange}
                />
              </div>

              {/* Shop Date Range - Read Only */}
              <div className="shrink-0">
                <div className="h-10 px-4 font-medium bg-gray-50 dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-md flex items-center gap-2 shadow-sm text-sm cursor-default">
                  <Calendar className="w-4 h-4 shrink-0 text-gray-500 dark:text-gray-400" />
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Shop:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatShopDateRange()}
                  </span>
                </div>
              </div>

              {/* Competitors Dropdown */}
              <div className="shrink-0">
                <CompetitorsDropdown
                  selectedHotels={selectedCompetitors}
                  onChange={handleCompetitorsChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <main className="relative z-10">
        <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-2 md:py-4 lg:py-6 max-w-7xl xl:max-w-none mx-auto">
          <RateChangesTable selectedCompetitors={selectedCompetitors} />
        </div>
      </main>
      
    </div>
  )
}
