"use client"

import { BusinessInsightsKPICards } from "@/components/business-insights/business-insights-kpi-cards"
import { BusinessInsightsChartsGrid } from "@/components/business-insights/business-insights-charts"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { useState } from "react"

// Chart Data Configuration for Market Insights
const marketInsightsChartData = [
  {
    id: "market-share",
    title: "Market Share Distribution",
    type: "pie" as const,
    data: [],
    description: "Your property's market position vs competitors",
    value: "23.7%",
    change: 8.2,
    changeType: "positive" as const
  },
  {
    id: "customer-satisfaction",
    title: "Customer Satisfaction Trends",
    type: "area" as const,
    data: [],
    description: "Customer rating trends and feedback analysis",
    value: "4.6/5",
    change: 4.5,
    changeType: "positive" as const
  },
  {
    id: "competitive-position",
    title: "Competitive Position Analysis",
    type: "bar" as const,
    data: [],
    description: "Ranking analysis against key competitors",
    value: "3rd",
    change: 25.0,
    changeType: "positive" as const
  },
  {
    id: "market-trends",
    title: "Market Trends Overview",
    type: "line" as const,
    data: [],
    description: "Overall market performance and trends",
    value: "↑12%",
    change: 12.0,
    changeType: "positive" as const
  }
]

export default function MarketInsightsPage() {
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
        charts={marketInsightsChartData}
        onExport={handleExport}
        onViewDetails={handleViewDetails}
      />
    </div>
  )
}


