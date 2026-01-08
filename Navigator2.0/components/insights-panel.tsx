"use client"

import type * as React from "react"
import { AlertTriangle, ArrowRight, DollarSign, TrendingDown } from "lucide-react"

type Insight = {
  id: number
  icon: React.ReactNode
  title: string
  description: string
  actionText: string
  severity: "critical" | "warning" | "info"
}

const insights: Insight[] = [
  {
    id: 1,
    icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
    title: "Critical Rate Violations on Booking.com",
    description: "130 rate violations detected, causing estimated $253K in revenue loss.",
    actionText: "View violations",
    severity: "critical",
  },
  {
    id: 2,
    icon: <DollarSign className="h-5 w-5 text-amber-500" />,
    title: "Copthorne Hotel Newcastle at 100% Loss",
    description: "All 30 rate checks resulted in violations, highest among all properties.",
    actionText: "View property details",
    severity: "warning",
  },
  {
    id: 3,
    icon: <TrendingDown className="h-5 w-5 text-blue-500" />,
    title: "Availability Issues Dominate Revenue Loss",
    description: "81.5% ($865.6K) of total revenue loss is from availability violations.",
    actionText: "View breakdown",
    severity: "info",
  },
]

export function InsightsPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {insights.map((insight) => (
        <div
          key={insight.id}
          className={`rounded-lg border p-4 ${
            insight.severity === "critical"
              ? "border-red-200 bg-red-50"
              : insight.severity === "warning"
                ? "border-amber-200 bg-amber-50"
                : "border-blue-200 bg-blue-50"
          }`}
        >
          <div className="mb-2 flex items-center gap-2">
            {insight.icon}
            <h3 className="font-medium">{insight.title}</h3>
          </div>
          <p className="mb-3 text-sm text-gray-700">{insight.description}</p>
          <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900">
            {insight.actionText}
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  )
}
