"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, History, MoreVertical } from "lucide-react"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"

// Mock tax data
const mockTaxes = [
  {
    id: 1,
    taxName: "City Tax",
    taxPercentage: "2%",
    subscriberCompetitor: "Central Hotel",
    channels: "Booking.com",
    lastActivity: "Create",
    lastModifiedBy: "Current User",
    createdOn: "28 May'24",
  },
  {
    id: 2,
    taxName: "Tourism Tax",
    taxPercentage: "1.5%",
    subscriberCompetitor: "Holiday Inn",
    channels: "Agoda",
    lastActivity: "Update",
    lastModifiedBy: "Current User",
    createdOn: "25 May'24",
  },
  {
    id: 3,
    taxName: "Service Tax",
    taxPercentage: "3%",
    subscriberCompetitor: "Taj Mahal",
    channels: "Expedia",
    lastActivity: "Create",
    lastModifiedBy: "Current User",
    createdOn: "20 May'24",
  },
  {
    id: 4,
    taxName: "VAT",
    taxPercentage: "5%",
    subscriberCompetitor: "Alhambra Hotel",
    channels: "Hotels.com",
    lastActivity: "Update",
    lastModifiedBy: "Current User",
    createdOn: "15 May'24",
  },
  {
    id: 5,
    taxName: "Resort Fee",
    taxPercentage: "2%",
    subscriberCompetitor: "Ocean Breeze",
    channels: "Booking.com",
    lastActivity: "Create",
    lastModifiedBy: "Current User",
    createdOn: "10 May'24",
  },
]

const mockHotels = [
  "Central Hotel",
  "Holiday Inn",
  "Taj Mahal",
  "Alhambra Hotel",
  "Ocean Breeze",
  "Macdonald Windsor",
]

const mockChannels = [
  "Booking.com",
  "Agoda",
  "Expedia",
  "Hotels.com",
  "Priceline",
  "Travelocity",
]

export default function TaxSettingsPage() {
  const [taxes, setTaxes] = useState(mockTaxes)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddTax, setShowAddTax] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Simulate loading effect on component mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000) // Show loading for 3 seconds

    return () => clearTimeout(timer)
  }, [])
  
  const [showChangeHistory, setShowChangeHistory] = useState(false)
  const [newTax, setNewTax] = useState({
    subscriberCompetitor: "Central Hotel",
    channels: "Booking.com",
    taxName: "",
    taxPercentage: "",
    isPercentage: true,
  })

  const filteredTaxes = taxes.filter(
    (tax) =>
      tax.taxName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tax.subscriberCompetitor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tax.channels.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddTax = () => {
    if (newTax.subscriberCompetitor && newTax.channels && newTax.taxName && newTax.taxPercentage) {
      const tax = {
        id: taxes.length + 1,
        taxName: newTax.taxName,
        taxPercentage: newTax.taxPercentage,
        subscriberCompetitor: newTax.subscriberCompetitor,
        channels: newTax.channels,
        lastActivity: "Create",
        lastModifiedBy: "Current User",
        createdOn: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }),
      }
      setTaxes((prev) => [...prev, tax])
      setNewTax({
        subscriberCompetitor: "Central Hotel",
        channels: "Booking.com",
        taxName: "",
        taxPercentage: "",
        isPercentage: true,
      })
      setShowAddTax(false)
    }
  }

  const handleCancelAddTax = () => {
    setNewTax({
      subscriberCompetitor: "Central Hotel",
      channels: "Booking.com",
      taxName: "",
      taxPercentage: "",
      isPercentage: true,
    })
    setShowAddTax(false)
  }

  // Show loading state when data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
        <GlobalProgressBar />
        <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8 xl:py-10">
          <div className="max-w-7xl xl:max-w-none mx-auto">
            <div className="space-y-6">
              {/* Header Skeleton */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="space-y-1">
                    <div className="h-6 w-48 bg-gray-300 animate-pulse rounded"></div>
                    <div className="h-4 w-64 bg-gray-300 animate-pulse rounded"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 bg-gray-300 animate-pulse rounded"></div>
                  <div className="h-9 w-32 bg-gray-300 animate-pulse rounded"></div>
                </div>
              </div>

              {/* Search Bar Skeleton */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 z-10">
                  <div className="h-[3px] w-full bg-gray-200/50 dark:bg-gray-800/50 overflow-hidden rounded-sm">
                    <div className="h-full bg-blue-500/90 shadow-sm shadow-blue-500/20 transition-all duration-150 ease-out w-3/4"></div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-80 bg-gray-300 animate-pulse rounded"></div>
                    <div className="h-10 w-24 bg-gray-300 animate-pulse rounded"></div>
                  </div>
                </CardContent>
              </Card>

              {/* Tax Table Skeleton */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 z-10">
                  <div className="h-[3px] w-full bg-gray-200/50 dark:bg-gray-800/50 overflow-hidden rounded-sm">
                    <div className="h-full bg-blue-500/90 shadow-sm shadow-blue-500/20 transition-all duration-150 ease-out w-1/2"></div>
                  </div>
                </div>
                <CardContent className="p-0">
                  {/* Table Header */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b">
                    <div className="grid grid-cols-7 gap-4">
                      <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-32 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-28 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                  </div>
                  
                  {/* Table Rows */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-4 py-4 border-b last:border-b-0">
                      <div className="grid grid-cols-7 gap-4 items-center">
                        <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-12 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-28 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-8 w-8 bg-gray-300 animate-pulse rounded"></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="space-y-1">
            <span className="text-xl font-semibold text-foreground">Tax Management</span>
            <p className="text-sm text-muted-foreground">
              Configure tax settings, manage tax rates, and set up tax calculations for different properties
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowChangeHistory(true)}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            Change History
          </Button>
          <Button
            onClick={() => setShowAddTax(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Tax
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-gray-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search taxes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Taxes Table */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Taxes ({filteredTaxes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTaxes.map((tax) => (
              <div
                key={tax.id}
                className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{tax.taxName}</span>
                      <Badge variant="secondary" className="text-xs">
                        {tax.taxPercentage}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tax.subscriberCompetitor} • {tax.channels}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tax.lastActivity} on {tax.createdOn} by {tax.lastModifiedBy}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Tax Modal */}
      <Dialog open={showAddTax} onOpenChange={setShowAddTax}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add Tax</DialogTitle>
            <DialogDescription>
              Add a new tax configuration for specific properties and channels.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="subscriber-competitor" className="text-sm font-medium">
                Subscriber/Competitor*
              </Label>
              <Select
                value={newTax.subscriberCompetitor}
                onValueChange={(value) => setNewTax((prev) => ({ ...prev, subscriberCompetitor: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockHotels.map((hotel) => (
                    <SelectItem key={hotel} value={hotel} className="pl-3 [&>span:first-child]:hidden">
                      {hotel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channels" className="text-sm font-medium">
                Channels*
              </Label>
              <Select
                value={newTax.channels}
                onValueChange={(value) => setNewTax((prev) => ({ ...prev, channels: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockChannels.map((channel) => (
                    <SelectItem key={channel} value={channel} className="pl-3 [&>span:first-child]:hidden">
                      {channel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-name" className="text-sm font-medium">
                Tax Name*
              </Label>
              <Input
                id="tax-name"
                value={newTax.taxName}
                onChange={(e) => setNewTax((prev) => ({ ...prev, taxName: e.target.value }))}
                placeholder="Enter tax name"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-percentage" className="text-sm font-medium">
                Tax Percentage*
              </Label>
              <Input
                id="tax-percentage"
                value={newTax.taxPercentage}
                onChange={(e) => setNewTax((prev) => ({ ...prev, taxPercentage: e.target.value }))}
                placeholder="Enter tax percentage"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6">
            <Button
              variant="outline"
              onClick={handleCancelAddTax}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTax}
              disabled={
                !newTax.subscriberCompetitor ||
                !newTax.channels ||
                !newTax.taxName ||
                !newTax.taxPercentage
              }
              className="px-6"
            >
              Add Tax
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change History Modal */}
      <Dialog open={showChangeHistory} onOpenChange={setShowChangeHistory}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Tax Change History</DialogTitle>
            <DialogDescription>
              View all changes made to tax settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Tax change history functionality would be implemented here with actual data from the backend.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6">
            <Button
              variant="outline"
              onClick={() => setShowChangeHistory(false)}
              className="px-6"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
