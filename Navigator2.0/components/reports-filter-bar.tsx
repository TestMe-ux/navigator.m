"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Calendar, FileText } from "lucide-react"
import { ReportsDatePicker } from "@/components/reports-date-picker"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { useState, useCallback } from "react"
import { addDays } from "date-fns"
import { useRouter, usePathname } from "next/navigation"

interface ReportsFilterBarProps {
  className?: string
  onDateRangeChange?: (startDate: Date | undefined, endDate: Date | undefined) => void
  onReportTypeChange?: (reportType: string) => void
  showDateAndTypeFilters?: boolean
}

/**
 * Reports Filter Bar Component
 * 
 * Professional filter bar for reports page with:
 * - Shop Date Range picker
 * - Report Type dropdown
 * - Same styling and functionality as Parity page
 * 
 * @component
 * @version 1.0.0
 */
export function ReportsFilterBar({ 
  className, 
  onDateRangeChange, 
  onReportTypeChange,
  showDateAndTypeFilters = true
}: ReportsFilterBarProps) {
  // Navigation hooks
  const router = useRouter()
  const pathname = usePathname()
  
  // Default to last 7 days (7 days ago to today)
  const today = new Date()
  const [startDate, setStartDate] = useState<Date | undefined>(addDays(today, -6))
  const [endDate, setEndDate] = useState<Date | undefined>(today)
  const [selectedReportType, setSelectedReportType] = useState<string>("All")
  const [isReportTypeDropdownOpen, setIsReportTypeDropdownOpen] = useState(false)
  
  // Determine active tab based on current path
  const activeTab = pathname === '/reports-schedules' ? 'schedules' : 'reports'

  // Report type options
  const reportTypes = [
    { value: "All", label: "All Reports      " },
    { value: "Scheduled", label: "Scheduled" },
    { value: "OnDemand", label: "On Demand" }
  ]

  /**
   * Handle date range updates
   */
  const handleDateRangeChange = useCallback((newStartDate: Date | undefined, newEndDate: Date | undefined) => {
    if (newStartDate && newEndDate) {
      setStartDate(newStartDate)
      setEndDate(newEndDate)
      onDateRangeChange?.(newStartDate, newEndDate)
      console.log(`📅 Reports date range changed: ${newStartDate.toLocaleDateString()} - ${newEndDate.toLocaleDateString()}`)
    }
  }, [onDateRangeChange])

  /**
   * Handle report type selection
   */
  const handleReportTypeSelect = useCallback((reportType: string) => {
    setSelectedReportType(reportType)
    setIsReportTypeDropdownOpen(false) // Close dropdown after selection
    onReportTypeChange?.(reportType)
    console.log(`📊 Report type changed: ${reportType}`)
  }, [onReportTypeChange])

  /**
   * Get display text for report type button
   */
  const getReportTypeDisplayText = useCallback(() => {
    const selected = reportTypes.find(type => type.value === selectedReportType)
    return selected ? selected.label : "All Reports      "
  }, [selectedReportType])

  /**
   * Handle navigation to Reports page
   */
  const handleNavigateToReports = useCallback(() => {
    console.log('🔄 Navigating to Reports page')
    router.push('/reports')
  }, [router])

  /**
   * Handle navigation to Scheduled Reports page
   */
  const handleNavigateToScheduledReports = useCallback(() => {
    console.log('🔄 Navigating to Scheduled Reports page')
    router.push('/reports-schedules')
  }, [router])

  return (
    <div className={cn("bg-background border-b border-border shadow-sm", className)}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-7xl xl:max-w-none mx-auto">
          <div className="flex items-center justify-between py-4 gap-4">
            
            {/* Left Side - Toggle, Shop Date Range and Report Type */}
            <div className="flex items-center gap-4 flex-1">
              
              {/* Toggle Buttons */}
              <div className="shrink-0">
                <ToggleGroup
                  type="single"
                  value={activeTab}
                  onValueChange={(value) => {
                    console.log('🎯 Toggle value changed:', { value, activeTab })
                    
                    // Handle navigation based on the selected value
                    if (value === 'reports') {
                      handleNavigateToReports()
                    } else if (value === 'schedules') {
                      handleNavigateToScheduledReports()
                    }
                    // If value is undefined (same button clicked), still navigate to ensure consistency
                    else if (!value) {
                      console.log('🔄 Same tab clicked, ensuring navigation consistency')
                      if (activeTab === 'reports') {
                        handleNavigateToReports()
                      } else {
                        handleNavigateToScheduledReports()
                      }
                    }
                  }}
                  className="border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 shadow-sm h-10 gap-0"
                >
                  <ToggleGroupItem
                    value="reports"
                    className="h-10 px-4 text-sm font-medium data-[state=on]:bg-blue-600 data-[state=on]:text-white dark:data-[state=on]:bg-blue-600 dark:data-[state=on]:text-white hover:text-black data-[state=on]:hover:text-white border-0 rounded-l-md rounded-r-none"
                  >
                    Reports
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="schedules"
                    className="h-10 px-4 text-sm font-medium data-[state=on]:bg-blue-600 data-[state=on]:text-white dark:data-[state=on]:bg-blue-600 dark:data-[state=on]:text-white hover:text-black data-[state=on]:hover:text-white border-0 rounded-r-md rounded-l-none border-l border-slate-200 dark:border-slate-700"
                  >
                    Scheduled Reports
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Shop Date Range Picker */}
              {showDateAndTypeFilters && (
                <div className="shrink-0">
                  <ReportsDatePicker
                    startDate={startDate}
                    endDate={endDate}
                    onChange={handleDateRangeChange}
                  />
                </div>
              )}

              {/* Report Type Filter */}
              {showDateAndTypeFilters && (
                <div className="shrink-0">
                <DropdownMenu open={isReportTypeDropdownOpen} onOpenChange={setIsReportTypeDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md min-w-0 max-w-[180px] hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      <span className="truncate max-w-[100px] font-semibold">
                        {getReportTypeDisplayText()}
                      </span>
                      <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-auto p-0 shadow-xl border-slate-200 dark:border-slate-700 z-[60]">
                    <div className="flex">
                      <div className="w-[168px] p-4">
                        <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">Report Type</h4>
                        <div className="space-y-1">
                          {reportTypes.map((type) => (
                            <div
                              key={type.value}
                              className={cn(
                                "py-2 px-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm flex items-center cursor-pointer",
                                selectedReportType === type.value && "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                              )}
                              onClick={() => handleReportTypeSelect(type.value)}
                            >
                              <span className="font-medium text-sm flex-1">
                                {type.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
              )}

            </div>

            {/* Right Side - Empty for now */}
            <div className="flex items-center gap-3">
              {/* Reserved for future controls like refresh button, etc. */}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
