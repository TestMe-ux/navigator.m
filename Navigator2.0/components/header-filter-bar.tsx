"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { CalendarIcon, Download, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface HeaderFilterBarProps {
  onFilterClick: () => void
}

export function HeaderFilterBar({ onFilterClick }: HeaderFilterBarProps) {
  const [shopDate, setShopDate] = React.useState<Date>(new Date())
  const [reportId, setReportId] = React.useState("154568")
  const [checkInDate, setCheckInDate] = React.useState<Date | undefined>(undefined)
  const [hotel, setHotel] = React.useState("all")
  const [viewBy, setViewBy] = React.useState("cheapest")

  const hotels = [
    { value: "all", label: "All Hotels" },
    { value: "copthorne", label: "Copthorne Hotel Newcastle" },
    { value: "aston", label: "Aston Imperium Purwokerto" },
    { value: "grand", label: "Grand Mercure Jakarta" },
    { value: "hilton", label: "Hilton London" },
  ]

  const reports = [
    { value: "154568", label: "154568" },
    { value: "154567", label: "154567" },
    { value: "154566", label: "154566" },
    { value: "154565", label: "154565" },
  ]

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto py-3 px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Main filters */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {/* Shop Date */}
            <div className="flex flex-col gap-1">
              <label htmlFor="shop-date" className="text-xs font-medium text-gray-500">
                Shop Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="shop-date"
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !shopDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {shopDate ? format(shopDate, "dd MMM ''yy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={shopDate}
                    onSelect={(date) => date && setShopDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Report ID */}
            <div className="flex flex-col gap-1">
              <label htmlFor="report-id" className="text-xs font-medium text-gray-500">
                Report ID
              </label>
              <Select value={reportId} onValueChange={setReportId}>
                <SelectTrigger id="report-id" className="w-full">
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
              <label htmlFor="check-in-date" className="text-xs font-medium text-gray-500">
                Check-In Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="check-in-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkInDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkInDate ? format(checkInDate, "dd MMM ''yy") : <span>All</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-2">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setCheckInDate(undefined)}>
                      All Dates
                    </Button>
                  </div>
                  <Separator />
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
              <label htmlFor="select-hotel" className="text-xs font-medium text-gray-500">
                Select Hotel
              </label>
              <Select value={hotel} onValueChange={setHotel}>
                <SelectTrigger id="select-hotel" className="w-full">
                  <SelectValue placeholder="Select hotel" />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((hotel) => (
                    <SelectItem key={hotel.value} value={hotel.value}>
                      {hotel.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* View options and actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <Tabs value={viewBy} onValueChange={setViewBy} className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="cheapest" className="flex-1">
                    By Cheapest
                  </TabsTrigger>
                  <TabsTrigger value="split" className="flex-1">
                    By Split
                  </TabsTrigger>
                  <TabsTrigger value="product" className="flex-1">
                    By Product
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={onFilterClick} className="relative">
                      <Filter className="h-4 w-4" />
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                        3
                      </Badge>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Advanced Filters</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Download Summary</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download Summary Report</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Active filters summary */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Active filters:</span>
          <Badge variant="outline" className="bg-blue-50 text-xs">
            Critical Violations
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-xs">
            Booking.com
          </Badge>
          <Badge variant="outline" className="bg-amber-50 text-xs">
            Loss Rate: 80-100%
          </Badge>
        </div>
      </div>
    </div>
  )
}
