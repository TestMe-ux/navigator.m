"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, BarChart3, DollarSign } from "lucide-react"

interface SummaryCardProps {
  title: string
  value: string
  description?: string
  trend?: string
  trendDirection?: "up" | "down"
  icon: React.ElementType
  iconColorClass: string
  bgColorClass: string
}

function SummaryCard({
  title,
  value,
  description,
  trend,
  trendDirection,
  icon: Icon,
  iconColorClass,
  bgColorClass,
}: SummaryCardProps) {
  return (
    <Card className="card-enhanced hover:shadow-lg transition-all duration-300 h-32 flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${bgColorClass} border ${iconColorClass.replace('text-', 'border-').replace('-500', '-200')} dark:${iconColorClass.replace('text-', 'border-').replace('-500', '-800')}`}>
            <Icon className={`h-4 w-4 ${iconColorClass}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col justify-center">
        <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{value}</div>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
        {trend && (
          <div className={`text-xs flex items-center gap-1 mt-2 ${
            trendDirection === "up" 
              ? "text-emerald-600 dark:text-emerald-400" 
              : "text-red-600 dark:text-red-400"
          }`}>
            {trendDirection === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span className="font-medium">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function DemandSummaryCards() {
  const summaryData: SummaryCardProps[] = [
    {
      title: "Avg. Market ADR",
      value: "$250",
      description: "Average Daily Rate in market",
      icon: DollarSign,
      iconColorClass: "text-emerald-600 dark:text-emerald-400",
      bgColorClass: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      title: "Avg. Market RevPAR",
      value: "$180",
      description: "Revenue Per Available Room",
      icon: BarChart3,
      iconColorClass: "text-brand-600 dark:text-brand-400",
      bgColorClass: "bg-brand-50 dark:bg-brand-950",
    },
    {
      title: "Top Source Market",
      value: "USA",
      description: "30% of total demand",
      icon: Users,
      iconColorClass: "text-amber-600 dark:text-amber-400",
      bgColorClass: "bg-amber-50 dark:bg-amber-950",
    },
  ]

  return (
    <section className="w-full">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-foreground mb-1">Market Summary</h2>
        <p className="text-sm text-muted-foreground">Key performance indicators and market positioning</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {summaryData.map((data) => (
          <SummaryCard key={data.title} {...data} />
        ))}
      </div>
    </section>
  )
}
