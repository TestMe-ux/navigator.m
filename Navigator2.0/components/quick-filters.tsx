"use client"

import { Button } from "@/components/ui/button"
import type { FilterValue } from "@/components/filter-sidebar"

interface QuickFiltersProps {
  onApply: (filters: Partial<FilterValue>) => void
}

export function QuickFilters({ onApply }: QuickFiltersProps) {
  const quickFilters = [
    {
      id: "critical",
      label: "Critical Violations",
      filters: { severity: ["critical"] },
    },
    {
      id: "rate",
      label: "Rate Violations",
      filters: { violationTypes: ["rate"] },
    },
    {
      id: "availability",
      label: "Availability Issues",
      filters: { violationTypes: ["availability"] },
    },
    {
      id: "high-loss",
      label: "High Loss (>80%)",
      filters: { lossRange: [80, 100] as [number, number] },
    },
    {
      id: "booking",
      label: "Booking.com",
      filters: { channels: ["booking"] },
    },
  ]

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <span className="flex items-center text-sm font-medium text-gray-700">Quick filters:</span>
      {quickFilters.map((filter) => (
        <Button
          key={filter.id}
          variant="outline"
          size="sm"
          className="h-7 rounded-full bg-gray-50 px-3 text-xs hover:bg-gray-100"
          onClick={() => onApply(filter.filters)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  )
}
