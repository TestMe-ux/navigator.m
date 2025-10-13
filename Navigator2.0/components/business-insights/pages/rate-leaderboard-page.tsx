"use client"

import { BusinessInsightsKPICards } from "@/components/business-insights/business-insights-kpi-cards"
import { BusinessInsightsChartsGrid } from "@/components/business-insights/business-insights-charts"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { useState } from "react"

// Chart Data Configuration for Rate Leaderboard
const rateLeaderboardChartData = [
  {
    id: "revenue-trend",
    title: "Revenue Trend Analysis",
    type: "line" as const,
    data: [],
    description: "Monthly revenue performance over the last 12 months",
    value: "$2.4M",
    change: 12.5,
    changeType: "positive" as const
  },
  {
    id: "booking-channels",
    title: "Booking Channel Performance",
    type: "bar" as const,
    data: [],
    description: "Revenue breakdown by distribution channel",
    value: "$1.8M",
    change: -2.1,
    changeType: "negative" as const
  },
  {
    id: "rate-comparison",
    title: "Rate Comparison Leaderboard",
    type: "bar" as const,
    data: [],
    description: "Rate positioning vs competitors",
    value: "$245",
    change: -2.8,
    changeType: "negative" as const
  },
  {
    id: "occupancy-leaderboard",
    title: "Occupancy Rate Leaderboard",
    type: "line" as const,
    data: [],
    description: "Occupancy performance ranking",
    value: "78.2%",
    change: 4.1,
    changeType: "positive" as const
  }
]

export default function RateLeaderboardPage() {
  const [selectedProperty] = useSelectedProperty()
  const [isLoading, setIsLoading] = useState(false)

  const handleExport = (chartId: string) => {
    console.log("Exporting chart:", chartId)
    // Implement export functionality
  }

  const handleViewDetails = (chartId: string) => {
    console.log("Viewing details for chart:", chartId)
    // Implement view details functionality
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* KPI Cards */}
      <BusinessInsightsKPICards 
        selectedProperty={selectedProperty}
        isLoading={isLoading}
      />
      
      {/* Charts Grid */}
      <BusinessInsightsChartsGrid 
        charts={rateLeaderboardChartData}
        onExport={handleExport}
        onViewDetails={handleViewDetails}
      />
    </div>
  )
}


