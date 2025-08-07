import { KpiCard } from "./kpi-card"
import { TrendingUp, ShieldCheck, Users, CalendarDays } from "lucide-react"

const kpiData = [
  {
    title: "Average Rate",
    value: "$195",
    change: "5.2% increase vs last period",
    icon: TrendingUp,
    iconBgClass: "bg-blue-100 dark:bg-blue-800",
    iconTextClass: "text-blue-600 dark:text-blue-400",
    badgeText: "Good",
    badgeType: "good" as const,
  },
  {
    title: "Parity Status",
    value: "92%",
    change: "2.1% decrease vs last period",
    icon: ShieldCheck,
    iconBgClass: "bg-blue-100 dark:bg-blue-800",
    iconTextClass: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Market Position", // Renamed from Market Rank
    value: "#2",
    subValue: "of 15 competitors",
    icon: Users,
    iconBgClass: "bg-blue-100 dark:bg-blue-800",
    iconTextClass: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Event Impact",
    value: "Conference Week",
    subValue: "3 major events nearby",
    icon: CalendarDays,
    iconBgClass: "bg-blue-100 dark:bg-blue-800",
    iconTextClass: "text-blue-600 dark:text-blue-400",
    badgeText: "High",
    badgeType: "high" as const,
  },
]

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((kpi) => (
        <KpiCard
          key={kpi.title}
          title={kpi.title}
          value={kpi.value}
          change={kpi.change}
          icon={kpi.icon}
          badgeText={kpi.badgeText}
          badgeType={kpi.badgeType}
          subValue={kpi.subValue}
          iconBgClass={kpi.iconBgClass}
          iconTextClass={kpi.iconTextClass}
        />
      ))}
    </div>
  )
}
