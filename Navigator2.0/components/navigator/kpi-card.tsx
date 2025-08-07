"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string
  change?: string
  icon: LucideIcon
  iconBgClass?: string
  iconTextClass?: string
  badgeText?: string
  badgeType?: "good" | "high" | "default"
  subValue?: string
}

export function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  iconBgClass = "bg-blue-100 dark:bg-blue-900",
  iconTextClass = "text-blue-600 dark:text-blue-400",
  badgeText,
  badgeType = "default",
  subValue,
}: KpiCardProps) {
  const badgeClasses = {
    good: "bg-green-500 text-white",
    high: "bg-red-500 text-white",
    default: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600",
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardContent className="p-4 flex items-start space-x-4">
        <div className={cn("p-3 rounded-lg", iconBgClass)}>
          <Icon className={cn("h-6 w-6", iconTextClass)} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {badgeText && (
              <Badge className={cn("text-xs font-semibold px-2 py-0.5", badgeClasses[badgeType])}>{badgeText}</Badge>
            )}
          </div>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {subValue && <p className="text-sm text-muted-foreground mt-0.5">{subValue}</p>}
          {change && <p className="text-xs text-muted-foreground mt-1">{change}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
