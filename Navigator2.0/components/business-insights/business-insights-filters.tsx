"use client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronDown, Calendar, Globe, Users, Filter, Settings } from "lucide-react"
import { useState } from "react"

interface BusinessInsightsFiltersProps {
  className?: string
  onFiltersChange?: (filters: any) => void
}

export function BusinessInsightsFilters({ 
  className, 
  onFiltersChange 
}: BusinessInsightsFiltersProps) {
  const [filters, setFilters] = useState({
    dateRange: "Next 7 Days • 30 Sep '25 - 06 Oct '25",
    comparison: "Vs. Yesterday",
    channel: "All Channels",
    primary: "Primary",
    moreFilters: false
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  return (
    <div className={`py-4 ${className}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-7xl xl:max-w-none mx-auto">
          <div className="flex items-center justify-between">
            
            {/* Primary Filters - 5 Button Layout */}
            <div className="flex items-center gap-3">
              
              {/* Date Range Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    {filters.dateRange}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleFilterChange("dateRange", "Next 7 Days • 30 Sep '25 - 06 Oct '25")}>
                    Next 7 Days • 30 Sep '25 - 06 Oct '25
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("dateRange", "Next 30 Days • 30 Sep '25 - 29 Oct '25")}>
                    Next 30 Days • 30 Sep '25 - 29 Oct '25
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("dateRange", "Last 7 Days • 23 Sep '25 - 29 Sep '25")}>
                    Last 7 Days • 23 Sep '25 - 29 Sep '25
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("dateRange", "Last 30 Days • 30 Aug '25 - 29 Sep '25")}>
                    Last 30 Days • 30 Aug '25 - 29 Sep '25
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Comparison Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    {filters.comparison}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleFilterChange("comparison", "Vs. Yesterday")}>
                    Vs. Yesterday
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("comparison", "Vs. Last Week")}>
                    Vs. Last Week
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("comparison", "Vs. Last Month")}>
                    Vs. Last Month
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("comparison", "Vs. Last Year")}>
                    Vs. Last Year
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Channel Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Globe className="h-4 w-4" />
                    {filters.channel}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleFilterChange("channel", "All Channels")}>
                    All Channels
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("channel", "Booking.com")}>
                    Booking.com
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("channel", "Expedia")}>
                    Expedia
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("channel", "Hotels.com")}>
                    Hotels.com
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("channel", "Agoda")}>
                    Agoda
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Primary Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Users className="h-4 w-4" />
                    {filters.primary}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleFilterChange("primary", "Primary")}>
                    Primary
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("primary", "Secondary")}>
                    Secondary
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("primary", "Custom")}>
                    Custom
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* More Filters Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      onClick={() => handleFilterChange("moreFilters", !filters.moreFilters ? "true" : "false")}
                      className="gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      More Filters
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-slate-800 text-white border-slate-700">
                    <p className="text-xs">Open advanced filter options</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Secondary Actions */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <span className="text-xs text-muted-foreground">Updated 8 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}