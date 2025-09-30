"use client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronDown, Settings, Filter, Users, Bed, Utensils, Building2, Monitor, Clock } from "lucide-react"
import { useState } from "react"

export function RateTrendFilters() {
  const [showAllFilters, setShowAllFilters] = useState(false)

  return (
    <div className="py-4">
      
      {/* Mobile: Compact filter layout */}
      <div className="block lg:hidden">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          
          {/* Primary Filters */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Lowest
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Lowest</DropdownMenuItem>
              <DropdownMenuItem>Highest</DropdownMenuItem>
              <DropdownMenuItem>Average</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <div className="w-3 h-3 bg-blue-600 text-white text-xs rounded flex items-center justify-center font-bold">
                  B
                </div>
                Booking.com
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Booking.com</DropdownMenuItem>
              <DropdownMenuItem>Expedia</DropdownMenuItem>
              <DropdownMenuItem>Hotels.com</DropdownMenuItem>
              <DropdownMenuItem>Agoda</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={showAllFilters ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setShowAllFilters(!showAllFilters)}
                  className="gap-2 xl-1366:px-3 px-2"
                >
                  <Filter className="h-3 w-3" />
                  <span className="hidden xl-1366:inline">More Filters</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-slate-800 text-white border-slate-700 xl-1366:hidden">
                <p className="text-xs">More Filters</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Expanded filters */}
        {showAllFilters && (
          <div className="grid grid-cols-2 gap-2 mb-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Monitor className="h-3 w-3" />
                  Desktop
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Desktop</DropdownMenuItem>
                <DropdownMenuItem>Mobile</DropdownMenuItem>
                <DropdownMenuItem>Tablet</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Clock className="h-3 w-3" />
                  1 night
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>1 night</DropdownMenuItem>
                <DropdownMenuItem>2 nights</DropdownMenuItem>
                <DropdownMenuItem>3 nights</DropdownMenuItem>
                <DropdownMenuItem>7 nights</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Users className="h-3 w-3" />
                  2 guests
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>1 guest</DropdownMenuItem>
                <DropdownMenuItem>2 guests</DropdownMenuItem>
                <DropdownMenuItem>3 guests</DropdownMenuItem>
                <DropdownMenuItem>4+ guests</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Bed className="h-3 w-3" />
                  Any room
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Any room</DropdownMenuItem>
                <DropdownMenuItem>Standard room</DropdownMenuItem>
                <DropdownMenuItem>Deluxe room</DropdownMenuItem>
                <DropdownMenuItem>Suite</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Utensils className="h-3 w-3" />
                  Any meal
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Any meal</DropdownMenuItem>
                <DropdownMenuItem>Room only</DropdownMenuItem>
                <DropdownMenuItem>Breakfast included</DropdownMenuItem>
                <DropdownMenuItem>Half board</DropdownMenuItem>
                <DropdownMenuItem>Full board</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Building2 className="h-3 w-3" />
                  Primary compset
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Primary compset</DropdownMenuItem>
                <DropdownMenuItem>Secondary compset</DropdownMenuItem>
                <DropdownMenuItem>Custom compset</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-slate-200 dark:border-slate-700">
          <Button variant="ghost" size="sm" className="gap-2">
            <Settings className="h-3 w-3" />
            Settings
          </Button>
          <span>Updated 8 hours ago</span>
        </div>
      </div>

      {/* Desktop: Full filter layout */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between">
          
          {/* Primary Filters */}
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Lowest
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Lowest</DropdownMenuItem>
                <DropdownMenuItem>Highest</DropdownMenuItem>
                <DropdownMenuItem>Average</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <div className="w-4 h-4 bg-blue-600 text-white text-xs rounded flex items-center justify-center font-bold">
                    B
                  </div>
                  Booking.com
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Booking.com</DropdownMenuItem>
                <DropdownMenuItem>Expedia</DropdownMenuItem>
                <DropdownMenuItem>Hotels.com</DropdownMenuItem>
                <DropdownMenuItem>Agoda</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Monitor className="h-4 w-4" />
                  Desktop
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Desktop</DropdownMenuItem>
                <DropdownMenuItem>Mobile</DropdownMenuItem>
                <DropdownMenuItem>Tablet</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Clock className="h-4 w-4" />
                  1 night
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>1 night</DropdownMenuItem>
                <DropdownMenuItem>2 nights</DropdownMenuItem>
                <DropdownMenuItem>3 nights</DropdownMenuItem>
                <DropdownMenuItem>7 nights</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Users className="h-4 w-4" />
                  2 guests
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>1 guest</DropdownMenuItem>
                <DropdownMenuItem>2 guests</DropdownMenuItem>
                <DropdownMenuItem>3 guests</DropdownMenuItem>
                <DropdownMenuItem>4+ guests</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Bed className="h-4 w-4" />
                  Any room
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Any room</DropdownMenuItem>
                <DropdownMenuItem>Standard room</DropdownMenuItem>
                <DropdownMenuItem>Deluxe room</DropdownMenuItem>
                <DropdownMenuItem>Suite</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Utensils className="h-4 w-4" />
                  Any meal
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Any meal</DropdownMenuItem>
                <DropdownMenuItem>Room only</DropdownMenuItem>
                <DropdownMenuItem>Breakfast included</DropdownMenuItem>
                <DropdownMenuItem>Half board</DropdownMenuItem>
                <DropdownMenuItem>Full board</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  Primary compset
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Primary compset</DropdownMenuItem>
                <DropdownMenuItem>Secondary compset</DropdownMenuItem>
                <DropdownMenuItem>Custom compset</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
  )
}
