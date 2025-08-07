"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Filter, Calendar, Users, MapPin, TrendingUp } from "lucide-react"
import { EnhancedDatePicker } from "@/components/enhanced-date-picker"
import { useDateContext } from "@/components/date-context"
import { cn } from "@/lib/utils"

/**
 * Demand-specific filter configuration
 */
const demandFilters = [
  {
    name: "Time Period",
    defaultOption: "Next 30 Days",
    options: ["Next 7 Days", "Next 30 Days", "Next 90 Days", "Custom Range"],
    icon: Calendar,
  },
  {
    name: "Comparison",
    defaultOption: "Vs. Last Week",
    options: ["Vs. Last Week", "Vs. Last Month", "Vs. Last Year", "No Comparison"],
    icon: TrendingUp,
  },
  {
    name: "Location",
    defaultOption: "Dubai Marina",
    options: ["Dubai Marina", "Dubai Downtown", "Dubai Airport", "Dubai Mall Area", "Palm Jumeirah"],
    icon: MapPin,
  },
  {
    name: "Market Segment",
    defaultOption: "All Segments",
    options: ["All Segments", "Leisure", "Business", "Corporate", "Groups"],
    icon: Users,
  },
]

interface DemandFilterBarProps {
  onFiltersChange?: (filters: Record<string, string>) => void
}

/**
 * Demand Filter Bar Component
 * 
 * Specialized filter bar for the demand page with:
 * - Date range selection
 * - Time period filters
 * - Comparison options
 * - Location filters
 * - Market segment filters
 * 
 * @component
 */
export function DemandFilterBar({ onFiltersChange }: DemandFilterBarProps) {
  const { startDate, endDate, setDateRange } = useDateContext()
  const [selectedFilters, setSelectedFilters] = React.useState(() =>
    demandFilters.reduce(
      (acc, filter) => {
        acc[filter.name] = filter.defaultOption
        return acc
      },
      {} as Record<string, string>,
    ),
  )

  /**
   * Handle filter selection changes
   */
  const handleFilterChange = React.useCallback((filterName: string, option: string) => {
    const newFilters = { ...selectedFilters, [filterName]: option }
    setSelectedFilters(newFilters)
    onFiltersChange?.(newFilters)
    console.log(`🔄 Demand filter changed: ${filterName} = ${option}`)
  }, [selectedFilters, onFiltersChange])

  /**
   * Handle date range updates
   */
  const handleDateRangeChange = React.useCallback((start: Date | null, end: Date | null) => {
    setDateRange(start, end)
    console.log('📅 Date range changed:', { start, end })
  }, [setDateRange])

  /**
   * Get active (non-default) filters count
   */
  const getActiveFiltersCount = React.useMemo(() => {
    return demandFilters.filter(filter => selectedFilters[filter.name] !== filter.defaultOption).length
  }, [selectedFilters])

  return (
    <div 
      className="bg-background border-b border-border shadow-sm"
      data-component-name="DemandFilterBar"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-7xl xl:max-w-none mx-auto">
          <div className="flex items-center justify-between py-4 gap-4">
            
            {/* Left Section - Primary Filters */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              
              {/* Date Range Picker */}
              <div className="shrink-0">
                <EnhancedDatePicker
                  startDate={startDate || undefined}
                  endDate={endDate || undefined}
                  onChange={handleDateRangeChange}
                />
              </div>

              {/* Demand-specific Filters */}
              <div className="flex items-center gap-3 flex-wrap min-w-0">
                {demandFilters.map((filter) => {
                  const IconComponent = filter.icon
                  const isActive = selectedFilters[filter.name] !== filter.defaultOption

                  return (
                    <DropdownMenu key={filter.name}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-9 px-3 py-2 border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors gap-2 shrink-0 font-medium",
                            isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                          )}
                        >
                          <IconComponent className="w-4 h-4" />
                          <span className="text-sm">
                            {selectedFilters[filter.name]}
                          </span>
                          <ChevronDown className="w-3 h-3 opacity-70" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        {filter.options.map((option) => (
                          <DropdownMenuItem
                            key={option}
                            onClick={() => handleFilterChange(filter.name, option)}
                            className={cn(
                              "cursor-pointer",
                              selectedFilters[filter.name] === option && "bg-accent"
                            )}
                          >
                            <IconComponent className="w-4 h-4 mr-2" />
                            {option}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                })}
              </div>
            </div>

            {/* Right Section - Filter Status */}
            <div className="flex items-center gap-3 shrink-0">
              {getActiveFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {getActiveFiltersCount} filter{getActiveFiltersCount !== 1 ? 's' : ''} active
                </Badge>
              )}
              
              {/* Clear Filters Button */}
              {getActiveFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const defaultFilters = demandFilters.reduce(
                      (acc, filter) => {
                        acc[filter.name] = filter.defaultOption
                        return acc
                      },
                      {} as Record<string, string>,
                    )
                    setSelectedFilters(defaultFilters)
                    onFiltersChange?.(defaultFilters)
                    console.log('🔄 All demand filters reset')
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}