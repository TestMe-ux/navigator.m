"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CalendarIcon, Download, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FilterValue } from "@/components/filter-sidebar"
import { EnhancedDatePicker } from "@/components/enhanced-date-picker"
import { EnhancedHotelSelector } from "@/components/enhanced-hotel-selector"

interface SimplifiedFilterBarProps {
  onFilterClick: () => void
  onRemoveFilter: (category: keyof FilterValue, value: string) => void
  onClearAllFilters: () => void
  activeFilters: FilterValue
  viewMode?: "compact" | "detailed"
  onViewModeChange?: (mode: "compact" | "detailed") => void
}

export function SimplifiedFilterBar({
  onFilterClick,
  onRemoveFilter,
  onClearAllFilters,
  activeFilters,
  viewMode = "detailed",
  onViewModeChange,
}: SimplifiedFilterBarProps) {
  const [shopDate, setShopDate] = React.useState<Date>(new Date())
  const [reportId, setReportId] = React.useState("154568")
  const [checkInDate, setCheckInDate] = React.useState<Date | undefined>(undefined)
  const [selectedHotels, setSelectedHotels] = React.useState<string[]>([])

  const reports = [
    { value: "154568", label: "154568" },
    { value: "154567", label: "154567" },
    { value: "154566", label: "154566" },
    { value: "154565", label: "154565" },
  ]

  // Helper function to get active filters count with proper null checks
  const getActiveFiltersCount = () => {
    if (!activeFilters) return 0

    let count = 0

    // Check array properties with null safety
    if (activeFilters.severity && Array.isArray(activeFilters.severity) && activeFilters.severity.length > 0) count++
    if (activeFilters.channels && Array.isArray(activeFilters.channels) && activeFilters.channels.length > 0) count++
    if (
      activeFilters.violationTypes &&
      Array.isArray(activeFilters.violationTypes) &&
      activeFilters.violationTypes.length > 0
    )
      count++
    if (activeFilters.regions && Array.isArray(activeFilters.regions) && activeFilters.regions.length > 0) count++
    if (activeFilters.rateTypes && Array.isArray(activeFilters.rateTypes) && activeFilters.rateTypes.length > 0) count++
    if (activeFilters.roomTypes && Array.isArray(activeFilters.roomTypes) && activeFilters.roomTypes.length > 0) count++

    // Check loss range with null safety
    if (activeFilters.lossRange && Array.isArray(activeFilters.lossRange)) {
      if (activeFilters.lossRange[0] > 0 || activeFilters.lossRange[1] < 100) count++
    }

    // Check string properties with null safety
    if (activeFilters.savedFilter && activeFilters.savedFilter !== "" && activeFilters.savedFilter !== "none") count++
    if (activeFilters.viewBy && activeFilters.viewBy !== "cheapest") count++

    return count
  }

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="px-6 py-4">
        {/* Main filters row with View toggle and action buttons on the right */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Left side - Main filters */}
          <div className="flex flex-wrap items-end gap-4">
            {/* Shop Date */}
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-600">Shop Date</span>
              <EnhancedDatePicker value={shopDate} onChange={setShopDate} />
            </div>

            {/* Report ID */}
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-600">Report ID</span>
              <Select value={reportId} onValueChange={setReportId}>
                <SelectTrigger className="h-8 w-[100px] bg-white border-gray-300">
                  <SelectValue placeholder="Select report" />
                </SelectTrigger>
                <SelectContent>
                  {reports.map((report) => (
                    <SelectItem key={report.value} value={report.value}>
                      {report.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Check-In Date */}
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-600">Check-In Date</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 font-normal min-w-[80px] bg-white border-gray-300"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {checkInDate ? format(checkInDate, "dd MMM ''yy") : "All"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-2">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setCheckInDate(undefined)}>
                      All Dates
                    </Button>
                  </div>
                  <Calendar
                    mode="single"
                    selected={checkInDate}
                    onSelect={(date) => setCheckInDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Select Hotel */}
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-600">Select Hotel</span>
              <EnhancedHotelSelector value={selectedHotels} onChange={setSelectedHotels} />
            </div>
          </div>

          {/* Right side - View toggle and action buttons */}
          <div className="flex flex-col gap-3">
            {/* View toggle */}
            <div className="flex flex-col gap-1 items-center">
              <span className="text-sm font-medium text-gray-600">View</span>
              <div className="inline-flex border border-gray-300 rounded-md overflow-hidden bg-gradient-to-r from-blue-500 to-teal-500">
                <Button
                  variant={viewMode === "compact" ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "rounded-none px-3 py-1.5 text-sm border-0 font-medium",
                    viewMode === "compact" ? "bg-white text-blue-600 shadow-sm" : "text-white hover:bg-white/20",
                  )}
                  onClick={() => onViewModeChange?.("compact")}
                >
                  Compact
                </Button>
                <Button
                  variant={viewMode === "detailed" ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "rounded-none px-3 py-1.5 text-sm border-0 font-medium",
                    viewMode === "detailed" ? "bg-white text-blue-600 shadow-sm" : "text-white hover:bg-white/20",
                  )}
                  onClick={() => onViewModeChange?.("detailed")}
                >
                  Detailed
                </Button>
              </div>
            </div>

            {/* Action buttons below View toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 relative bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                onClick={onFilterClick}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-gradient-to-r from-pink-500 to-red-500 text-white border-0">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white border-0"
              >
                <Download className="h-4 w-4 mr-1" />
                Download Summary
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
