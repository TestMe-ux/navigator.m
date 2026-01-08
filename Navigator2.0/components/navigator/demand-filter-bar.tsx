"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Filter, MapPin, TrendingUp, CalendarIcon, Calendar } from "lucide-react"
import { DemandDatePicker } from "@/components/demand-date-picker"
import { useDemandDateContext } from "@/components/demand-date-context"
import { useComparison, ComparisonOption } from "@/components/comparison-context"
import { cn } from "@/lib/utils"

/**
 * Filter configuration interface
 */
interface FilterConfig {
  name: string
  defaultOption: string
  options: string[]
  icon: React.ElementType
  displayPrefix?: string
  dropdownLabel?: string
}

/**
 * Demand-specific filter configuration (Compare With removed as it's now handled by context)
 */
const demandFilters: FilterConfig[] = []

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
  const { startDate, endDate, setDateRange } = useDemandDateContext()
  const [selectedComparison, setSelectedComparison] = React.useState("wow")
  const [isCompareOpen, setIsCompareOpen] = React.useState(false)

  // Set default comparison to WoW for demand page
  React.useEffect(() => {
    if (!selectedComparison || !compareOptions.find(opt => opt.id === selectedComparison)) {
      setSelectedComparison("wow")
    }
  }, [selectedComparison, setSelectedComparison])
  const [selectedFilters, setSelectedFilters] = React.useState(() =>
    demandFilters.reduce(
      (acc, filter) => {
        acc[filter.name] = filter.defaultOption
        return acc
      },
      {} as Record<string, string>,
    ),
  )

  // Compare options for Demand page
  const compareOptions = [
    { id: "wow", label: "Week on Week (WoW)", shortLabel: "WoW" },
    { id: "mom", label: "Month on Month (MoM)", shortLabel: "MoM" },
    { id: "yoy", label: "Year on Year (YoY)", shortLabel: "YoY" }
  ]

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
   * Handle compare option selection
   */
  const handleCompareOptionSelect = React.useCallback((option: any) => {
    setSelectedComparison(option)
    setIsCompareOpen(false)
    onFiltersChange?.(option)
    console.log(`📊 Compare option changed: ${option}`)
  }, [setSelectedComparison,onFiltersChange])

  /**
   * Get active (non-default) filters count
   */
  const getActiveFiltersCount = React.useMemo(() => {
    return demandFilters.filter(filter => selectedFilters[filter.name] !== filter.defaultOption).length
  }, [selectedFilters])

  return (
    <div
      className="bg-transparent"
      data-component-name="DemandFilterBar"
    >
      <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-7xl xl:max-w-none mx-auto">
          <div className="flex items-center justify-between py-4 gap-4">

            {/* Left Section - Primary Filters */}
            <div className="flex items-center gap-4 flex-1 min-w-0">

              {/* Date Range Picker */}
              <div className="shrink-0">
                <DemandDatePicker
                  startDate={startDate || undefined}
                  endDate={endDate || undefined}
                  onChange={handleDateRangeChange}
                />
              </div>

              {/* Compare With Dropdown - Replicated from Overview */}
              <div className="shrink-0">
                <Popover open={isCompareOpen} onOpenChange={setIsCompareOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 min-w-0 max-w-[160px]"
                    >
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span className="truncate max-w-[80px] font-semibold">
                        Vs. {compareOptions.find(opt => opt.id === selectedComparison)?.shortLabel || "WoW"}
                      </span>
                      <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[60]" align="start">
                    <div className="flex">
                      {/* Compare Options Sidebar */}
                      <div className="w-60 p-4">
                        <h4 className="font-semibold text-sm text-gray-700 mb-3">Compare with</h4>
                        <div className="space-y-1">
                          {compareOptions.map((option) => (
                            <Button
                              key={option.id}
                              variant={selectedComparison === option.id ? "default" : "ghost"}
                              size="sm"
                              className="w-full justify-start text-left h-auto py-2 px-3"
                              onClick={() => handleCompareOptionSelect(option.id)}
                            >
                              <span className={cn(
                                "text-sm font-medium",
                                selectedComparison === option.id ? "text-white" : "text-foreground"
                              )}>
                                {option.label}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
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
                          className={cn(
                            "h-10 px-4 py-2 gap-2 shrink-0 font-medium shadow-sm hover:shadow-md transition-all duration-200 border-slate-200 dark:border-slate-700 bg-background hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800",
                            isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                          )}
                        >
                          <IconComponent className="w-4 h-4" />
                          <span className="text-sm font-semibold">
                            {filter.displayPrefix ? `${filter.displayPrefix} ${selectedFilters[filter.name]}` : selectedFilters[filter.name]}
                          </span>
                          <ChevronDown className="w-3 h-3 opacity-70" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-auto p-0">
                        <div className="w-64 p-4">
                          {filter.dropdownLabel && (
                            <h4 className="font-semibold text-sm text-gray-700 mb-3">
                              {filter.dropdownLabel}
                            </h4>
                          )}
                          <div className="space-y-1">
                            {filter.options.map((option) => (
                              <Button
                                key={option}
                                variant={selectedFilters[filter.name] === option ? "default" : "ghost"}
                                size="sm"
                                className="w-full justify-start text-left h-auto py-2 px-3"
                                onClick={() => handleFilterChange(filter.name, option)}
                              >
                                <span className={cn(
                                  "text-sm font-medium",
                                  selectedFilters[filter.name] === option ? "text-white" : "text-foreground"
                                )}>
                                  {option}
                                </span>
                              </Button>
                            ))}
                          </div>
                        </div>
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