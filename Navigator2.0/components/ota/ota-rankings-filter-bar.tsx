"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { OtaRankDatePicker } from "@/components/ota/ota-rank-date-picker"
import { OtaReviewDatePicker } from "@/components/ota/ota-review-date-picker"
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
  isCompareOpen: boolean
  setIsCompareOpen: (open: boolean) => void
  isCompsetOpen: boolean
  setIsCompsetOpen: (open: boolean) => void
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
  isCompareOpen,
  setIsCompareOpen,
  isCompsetOpen,
  setIsCompsetOpen,
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
                    <OtaReviewDatePicker
                      startDate={startDate || undefined}
                      endDate={endDate || undefined}
                      onChange={handleDateRangeChange}
                    />
                  ) : (
                    <OtaRankDatePicker
                      startDate={startDate || undefined}
                      endDate={endDate || undefined}
                      onChange={handleDateRangeChange}
                    />
                  )}
                </div>

                {/* Compare with Dropdown - Only for Rank mode */}
                {viewMode === "Rank" && (
                  <>
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
                  </>
                )}



              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
