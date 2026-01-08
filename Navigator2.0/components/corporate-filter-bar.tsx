"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { CalendarIcon, Download, ChevronDown } from "lucide-react"

export function CorporateFilterBar() {
  const [shopDate, setShopDate] = React.useState<Date>(new Date(2025, 4, 26)) // May 26, 2025
  const [reportId, setReportId] = React.useState("154908")
  const [checkInDate, setCheckInDate] = React.useState<string>("all")
  const [selectedHotel, setSelectedHotel] = React.useState("all")
  const [viewBy, setViewBy] = React.useState("cheapest")

  const reports = [
    { value: "154908", label: "154908" },
    { value: "154907", label: "154907" },
    { value: "154906", label: "154906" },
    { value: "154905", label: "154905" },
  ]

  return (
    <div className="bg-corporate-filter-bg border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          {/* Shop Date */}
          <div>
            <label className="block text-sm text-gray-500 mb-2">Shop Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white border-gray-300 hover:border-gray-400"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                  {format(shopDate, "dd MMM ''yy")}
                  <ChevronDown className="ml-auto h-4 w-4 text-gray-500" />
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
          <div>
            <label className="block text-sm text-gray-500 mb-2">Report ID</label>
            <Select value={reportId} onValueChange={setReportId}>
              <SelectTrigger className="bg-white border-gray-300 hover:border-gray-400">
                <SelectValue />
                <ChevronDown className="h-4 w-4 text-gray-500" />
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
          <div>
            <label className="block text-sm text-gray-500 mb-2">Check-In Date</label>
            <Select value={checkInDate} onValueChange={setCheckInDate}>
              <SelectTrigger className="bg-white border-gray-300 hover:border-gray-400">
                <SelectValue placeholder="All" />
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Select Hotel */}
          <div>
            <label className="block text-sm text-gray-500 mb-2">Select Hotel</label>
            <Select value={selectedHotel} onValueChange={setSelectedHotel}>
              <SelectTrigger className="bg-white border-gray-300 hover:border-gray-400">
                <SelectValue placeholder="All Hotels" />
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hotels</SelectItem>
                <SelectItem value="copthorne">Copthorne Hotel Newcastle</SelectItem>
                <SelectItem value="aston">Aston Imperium Purwokerto</SelectItem>
                <SelectItem value="grand">Grand Mercure Jakarta</SelectItem>
                <SelectItem value="hilton">Hilton London</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View By and Download */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="viewBy"
                  value="cheapest"
                  checked={viewBy === "cheapest"}
                  onChange={(e) => setViewBy(e.target.value)}
                  className="w-4 h-4 text-corporate-blue border-gray-300 focus:ring-corporate-blue"
                />
                <span className="text-sm font-medium text-gray-700">By Cheapest</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="viewBy"
                  value="split"
                  checked={viewBy === "split"}
                  onChange={(e) => setViewBy(e.target.value)}
                  className="w-4 h-4 text-corporate-blue border-gray-300 focus:ring-corporate-blue"
                />
                <span className="text-sm font-medium text-gray-400">By Split</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="viewBy"
                  value="product"
                  checked={viewBy === "product"}
                  onChange={(e) => setViewBy(e.target.value)}
                  className="w-4 h-4 text-corporate-blue border-gray-300 focus:ring-corporate-blue"
                />
                <span className="text-sm font-medium text-gray-400">By Product</span>
              </label>
            </div>
          </div>

          <Button variant="outline" className="bg-white border-gray-300 hover:border-gray-400 text-corporate-blue">
            <Download className="mr-2 h-4 w-4" />
            Download Summary
          </Button>
        </div>
      </div>
    </div>
  )
}
