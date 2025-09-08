"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { EnhancedDatePicker } from "@/components/enhanced-date-picker"
import { Calendar, ChevronDown, Users } from "lucide-react"

interface OTARankingsFilterBarProps {
  viewMode: string
  setViewMode: (mode: string) => void
  startDate: Date | null
  endDate: Date | null
  handleDateRangeChange: (start: Date | null, end: Date | null) => void
  compareWith: string
  setCompareWith: (compare: string) => void
  compSet: string
  setCompSet: (comp: string) => void
  checkInRange: string
  setCheckInRange: (range: string) => void
  previousCheckInRange: string
  setPreviousCheckInRange: (range: string) => void
  customStartDate: Date | undefined
  setCustomStartDate: (date: Date | undefined) => void
  customEndDate: Date | undefined
  setCustomEndDate: (date: Date | undefined) => void
  currentCalendarMonth: Date
  setCurrentCalendarMonth: (date: Date) => void
  isDateRangeOpen: boolean
  setIsDateRangeOpen: (open: boolean) => void
  isCompareOpen: boolean
  setIsCompareOpen: (open: boolean) => void
  isCompsetOpen: boolean
  setIsCompsetOpen: (open: boolean) => void
  getCheckInDisplayText: () => string
  renderCustomCalendar: () => JSX.Element
  checkInRangeOptions: Array<{
    id: string
    label: string
    dateRange?: string
  }>
  compareOptions: Array<{
    id: string
    label: string
  }>
  compsetOptions: Array<{
    id: string
    label: string
  }>
}

export function OTARankingsFilterBar({
  viewMode,
  setViewMode,
  startDate,
  endDate,
  handleDateRangeChange,
  compareWith,
  setCompareWith,
  compSet,
  setCompSet,
  checkInRange,
  setCheckInRange,
  previousCheckInRange,
  setPreviousCheckInRange,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  currentCalendarMonth,
  setCurrentCalendarMonth,
  isDateRangeOpen,
  setIsDateRangeOpen,
  isCompareOpen,
  setIsCompareOpen,
  isCompsetOpen,
  setIsCompsetOpen,
  getCheckInDisplayText,
  renderCustomCalendar,
  checkInRangeOptions,
  compareOptions,
  compsetOptions
}: OTARankingsFilterBarProps) {
  return (
    <div className="sticky top-0 z-40 filter-bar-minimal bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-border/50 shadow-sm transition-shadow duration-200">
      <div className="bg-background border-b border-border shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="max-w-7xl xl:max-w-none mx-auto">
            <div className="flex items-center justify-between py-4 gap-4">
              
              {/* Left Section - Primary Filters */}
              <div className="flex items-center gap-4 flex-1 min-w-0">

                {/* View Toggle */}
                <div className="shrink-0">
                  <ToggleGroup
                    type="single"
                    value={viewMode}
                    onValueChange={(value) => value && setViewMode(value)}
                    className="border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 shadow-sm h-10 gap-0"
                  >
                    <ToggleGroupItem
                      value="Rank"
                      className="h-10 px-4 text-sm font-medium data-[state=on]:bg-blue-600 data-[state=on]:text-white dark:data-[state=on]:bg-blue-600 dark:data-[state=on]:text-white hover:text-black data-[state=on]:hover:text-white border-0 rounded-l-md rounded-r-none"
                    >
                      Rank
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="Reviews"
                      className="h-10 px-4 text-sm font-medium data-[state=on]:bg-blue-600 data-[state=on]:text-white dark:data-[state=on]:bg-blue-600 dark:data-[state=on]:text-white hover:text-black data-[state=on]:hover:text-white border-0 rounded-r-md rounded-l-none border-l border-slate-200 dark:border-slate-700"
                    >
                      Reviews
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
        
                {/* Date/Check-in Range Picker */}
                <div className="shrink-0">
                  {viewMode === "Reviews" ? (
                    <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="justify-start text-left font-semibold h-10 min-w-[280px] px-4 gap-2 shadow-sm hover:shadow-md transition-all duration-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800"
                        >
                          <Calendar className="h-4 w-4" />
                          <span className="truncate">{getCheckInDisplayText()}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="flex">
                          {/* Quick Date Options Sidebar */}
                          <div className="w-56 border-r border-gray-200 p-4">
                            <h4 className="font-semibold text-sm text-gray-700 mb-3">Check-in Date</h4>
                            <div className="space-y-1">
                              {checkInRangeOptions.map((option) => (
                                <Button
                                  key={option.id}
                                  variant={checkInRange === option.label ? "default" : "ghost"}
                                  size="sm"
                                  className="w-full justify-start text-left h-auto py-2 px-3"
                                  onClick={() => {
                                    // Store previous selection before changing to Custom Date Range
                                    if (option.label === "Custom Date Range" && checkInRange !== "Custom Date Range") {
                                      setPreviousCheckInRange(checkInRange)
                                    }
                                    setCheckInRange(option.label)
                                    // Close dropdown for predefined ranges (not Custom Date Range)
                                    if (option.label !== "Custom Date Range") {
                                      setIsDateRangeOpen(false)
                                      // Clear custom dates when selecting predefined range
                                      setCustomStartDate(undefined)
                                      setCustomEndDate(undefined)
                                    }
                                  }}
                                >
                                  <div className="flex flex-col items-start">
                                    <span className="text-sm font-medium">{option.label}</span>
                                    {option.dateRange && (
                                      <span className={`text-xs mt-0.5 ${
                                        checkInRange === option.label ? "text-white" : "text-muted-foreground"
                                      }`}>
                                        {option.dateRange}
                                      </span>
                                    )}
                                  </div>
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          {/* Calendar for Custom Range Only */}
                          {checkInRange === "Custom Date Range" && (
                            <div className="w-80 p-4">
                              {renderCustomCalendar()}
                              
                              {/* Apply/Cancel buttons */}
                              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // Cancel: Reset to previous selection and close dropdown
                                    setCheckInRange(previousCheckInRange)
                                    setCustomStartDate(undefined)
                                    setCustomEndDate(undefined)
                                    setIsDateRangeOpen(false)
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  disabled={!customStartDate || !customEndDate}
                                  onClick={() => {
                                    // Apply the selected dates and close dropdown
                                    setIsDateRangeOpen(false)
                                  }}
                                >
                                  Apply
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <EnhancedDatePicker
                      startDate={startDate || undefined}
                      endDate={endDate || undefined}
                      onChange={handleDateRangeChange}
                    />
                  )}
                </div>

                {/* Compare with Dropdown - Only for Rank mode */}
                {viewMode === "Rank" && (
                <div className="shrink-0">
                  <Popover open={isCompareOpen} onOpenChange={setIsCompareOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 min-w-0 max-w-[160px]"
                      >
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span className="truncate max-w-[80px] font-semibold">
                          Vs. {compareOptions.find(opt => opt.label === compareWith)?.label.replace('Last ', '') || "1 week"}
                        </span>
                        <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[60]" align="start">
                      <div className="flex">
                        <div className="w-44 p-4">
                          <h4 className="font-semibold text-sm text-gray-700 mb-3">Compare with</h4>
                          <div className="space-y-1">
                            {compareOptions.map((option) => (
                              <Button
                                key={option.id}
                                variant={compareWith === option.label ? "default" : "ghost"}
                                size="sm"
                                className="w-full justify-start text-left h-auto py-2 px-3"
                                onClick={() => {
                                  setCompareWith(option.label)
                                  setIsCompareOpen(false)
                                }}
                              >
                                <span className="text-sm font-medium">
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
                )}

                {/* Compset Dropdown */}
                <div className="shrink-0">
                  <Popover open={isCompsetOpen} onOpenChange={setIsCompsetOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 min-w-0 max-w-[160px]"
                      >
                        <Users className="w-4 h-4 shrink-0" />
                        <span className="truncate max-w-[80px] font-semibold">
                          {compsetOptions.find(opt => opt.label === compSet)?.label.replace('Primary ', '') || "Primary"}
                        </span>
                        <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[60]" align="start">
                      <div className="flex">
                        <div className="w-44 p-4">
                          <h4 className="font-semibold text-sm text-gray-700 mb-3">Compset</h4>
                          <div className="space-y-1">
                            {compsetOptions.map((option) => (
                              <Button
                                key={option.id}
                                variant={compSet === option.label ? "default" : "ghost"}
                                size="sm"
                                className="w-full justify-start text-left h-auto py-2 px-3"
                                onClick={() => {
                                  setCompSet(option.label)
                                  setIsCompsetOpen(false)
                                }}
                              >
                                <span className="text-sm font-medium">
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

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
