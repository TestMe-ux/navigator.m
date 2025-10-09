"use client"

import { BusinessInsightsKPICards } from "@/components/business-insights/business-insights-kpi-cards"
import { BusinessInsightsChartsGrid } from "@/components/business-insights/business-insights-charts"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { useState } from "react"

// Chart Data Configuration for Rate Volatility
const rateVolatilityChartData = [
  {
    id: "volatility-trend",
    title: "Rate Volatility Trends",
    type: "line" as const,
    data: [],
    description: "Rate fluctuation patterns over time",
    value: "±8.2%",
    change: -15.3,
    changeType: "negative" as const
  },
  {
    id: "price-sensitivity",
    title: "Price Sensitivity Analysis",
    type: "area" as const,
    data: [],
    description: "Customer response to price changes",
    value: "High",
    change: 5.2,
    changeType: "positive" as const
  },
  {
    id: "demand-impact",
    title: "Demand Impact Analysis",
    type: "bar" as const,
    data: [],
    description: "Impact of rate changes on demand",
    value: "-12%",
    change: -12.0,
    changeType: "negative" as const
  },
  {
    id: "volatility-heatmap",
    title: "Volatility Heatmap",
    type: "pie" as const,
    data: [],
    description: "Rate volatility by time periods",
    value: "Peak",
    change: 8.7,
    changeType: "positive" as const
  }
]

export default function RateVolatilityPage() {
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
        charts={rateVolatilityChartData}
        onExport={handleExport}
        onViewDetails={handleViewDetails}
      />
    </div>
  )
}


