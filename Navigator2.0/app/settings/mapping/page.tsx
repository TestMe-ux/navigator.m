"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { History, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"

// Mock data
const mockHotels = [
  "Central Hotel",
  "Holiday Home Sahur...",
  "Taj Mahal",
  "Alhambra Hotel",
  "Ocean Breeze",
  "Macdonald Windsor",
]

const mockRoomCategories = [
  { id: "exe", name: "Executive Room", code: "Exe" },
  { id: "bgl", name: "BUNGALOW", code: "BGL" },
  { id: "vla", name: "VILLA", code: "VLA" },
  { id: "apt", name: "APARTMENT", code: "APT" },
  { id: "std", name: "STUDIO", code: "STD" },
  { id: "ste", name: "SUITE", code: "STE" },
  { id: "sup", name: "SUPERIOR ROOM", code: "S..." },
]

const mockRoomTypes = [
  "Double Room with E...",
  "Standard Suite With...",
  "Standard Double Ro...",
  "Single Room",
  "Twin Room",
  "Family Room",
  "Deluxe Room",
  "Premium Suite",
]

export default function MappingSettingsPage() {
  const [mappingTab, setMappingTab] = useState("room")
  const [mappingMode, setMappingMode] = useState("basic")
  const [selectedChannel, setSelectedChannel] = useState("Agoda")
  const [isLoading, setIsLoading] = useState(true)
  
  // Simulate loading effect on component mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000) // Show loading for 3 seconds

    return () => clearTimeout(timer)
  }, [])
  
  const [hotelScrollIndex, setHotelScrollIndex] = useState(0)
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [showAddRate, setShowAddRate] = useState(false)
  const [showChangeHistory, setShowChangeHistory] = useState(false)
  const [newRoom, setNewRoom] = useState({
    roomName: "",
    abbreviation: "",
  })
  const [newRate, setNewRate] = useState({
    rateName: "",
    abbreviation: "",
  })

  const getVisibleHotels = () => {
    return mockHotels.slice(hotelScrollIndex, hotelScrollIndex + 4)
  }

  const canScrollLeft = hotelScrollIndex > 0
  const canScrollRight = hotelScrollIndex + 4 < mockHotels.length

  const scrollHotelsLeft = () => {
    if (canScrollLeft) {
      setHotelScrollIndex((prev) => prev - 1)
    }
  }

  const scrollHotelsRight = () => {
    if (canScrollRight) {
      setHotelScrollIndex((prev) => prev + 1)
    }
  }

  const handleAddRoom = () => {
    if (newRoom.roomName && newRoom.abbreviation) {
      console.log("Adding room:", newRoom)
      setNewRoom({ roomName: "", abbreviation: "" })
      setShowAddRoom(false)
    }
  }

  const handleCancelAddRoom = () => {
    setNewRoom({ roomName: "", abbreviation: "" })
    setShowAddRoom(false)
  }

  const handleAddRate = () => {
    if (newRate.rateName && newRate.abbreviation) {
      console.log("Adding rate:", newRate)
      setNewRate({ rateName: "", abbreviation: "" })
      setShowAddRate(false)
    }
  }

  const handleCancelAddRate = () => {
    setNewRate({ rateName: "", abbreviation: "" })
    setShowAddRate(false)
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
                  <div className="h-9 w-32 bg-gray-300 animate-pulse rounded"></div>
                </div>
              </div>

              {/* Mapping Tabs Skeleton */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 z-10">
                  <div className="h-[3px] w-full bg-gray-200/50 dark:bg-gray-800/50 overflow-hidden rounded-sm">
                    <div className="h-full bg-blue-500/90 shadow-sm shadow-blue-500/20 transition-all duration-150 ease-out w-3/4"></div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex space-x-4 mb-6">
                    <div className="h-10 w-24 bg-gray-300 animate-pulse rounded"></div>
                    <div className="h-10 w-24 bg-gray-300 animate-pulse rounded"></div>
                  </div>
                  
                  {/* Mapping Content Skeleton */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Hotels */}
                    <div className="space-y-4">
                      <div className="h-5 w-32 bg-gray-300 animate-pulse rounded"></div>
                      <div className="space-y-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="h-10 w-full bg-gray-300 animate-pulse rounded"></div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Right Column - Room Categories */}
                    <div className="space-y-4">
                      <div className="h-5 w-40 bg-gray-300 animate-pulse rounded"></div>
                      <div className="space-y-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="h-10 w-full bg-gray-300 animate-pulse rounded"></div>
                        ))}
                      </div>
                    </div>
                  </div>
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
            <span className="text-xl font-semibold text-foreground">Mapping</span>
            <p className="text-sm text-muted-foreground">
              Map room categories, rate types, and inclusions across different channels and properties
            </p>
            <div className="flex items-center gap-6 ml-4">
              <button
                className={`pb-1 border-b-2 font-medium ${
                  mappingTab === "room"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setMappingTab("room")}
              >
                Room
              </button>
              <button
                className={`pb-1 border-b-2 font-medium ${
                  mappingTab === "rate"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setMappingTab("rate")}
              >
                Rate
              </button>
              <button
                className={`pb-1 border-b-2 font-medium ${
                  mappingTab === "inclusions"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setMappingTab("inclusions")}
              >
                Inclusions
              </button>
            </div>
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
            onClick={() => (mappingTab === "rate" ? setShowAddRate(true) : setShowAddRoom(true))}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {mappingTab === "rate" ? "Add Rate" : "Add Room"}
          </Button>
        </div>
      </div>

      {/* Content based on selected tab */}
      {mappingTab === "room" && (
        <Card className="bg-gradient-to-br from-card to-card/50 border-gray-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-lg font-medium text-foreground">Map Rooms</span>
                <div className="flex items-center bg-muted rounded-lg p-1">
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      mappingMode === "basic"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setMappingMode("basic")}
                  >
                    Basic
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      mappingMode === "advanced"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setMappingMode("advanced")}
                  >
                    Advanced
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium">Channel:</Label>
                <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Agoda" className="pl-3 [&>span:first-child]:hidden">Agoda</SelectItem>
                    <SelectItem value="Booking.com" className="pl-3 [&>span:first-child]:hidden">Booking.com</SelectItem>
                    <SelectItem value="Expedia" className="pl-3 [&>span:first-child]:hidden">Expedia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Room Categories</h3>
                  <div className="space-y-2">
                    {mockRoomCategories.map((room) => (
                      <div key={room.id} className="p-3 border border-border/50 rounded-lg">
                        <div className="font-medium">{room.name}</div>
                        <div className="text-sm text-muted-foreground">{room.code}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Hotels</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={scrollHotelsLeft}
                      disabled={!canScrollLeft}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={scrollHotelsRight}
                      disabled={!canScrollRight}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {getVisibleHotels().map((hotel, index) => (
                      <div key={index} className="p-3 border border-border/50 rounded-lg">
                        <div className="font-medium">{hotel}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {mappingTab === "rate" && (
        <Card className="bg-gradient-to-br from-card to-card/50 border-gray-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium">Channel:</Label>
                <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Agoda" className="pl-3 [&>span:first-child]:hidden">Agoda</SelectItem>
                    <SelectItem value="Booking.com" className="pl-3 [&>span:first-child]:hidden">Booking.com</SelectItem>
                    <SelectItem value="Expedia" className="pl-3 [&>span:first-child]:hidden">Expedia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Rate Types</h3>
                <div className="space-y-2">
                  {mockRoomTypes.map((rate, index) => (
                    <div key={index} className="p-3 border border-border/50 rounded-lg">
                      <div className="font-medium">{rate}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {mappingTab === "inclusions" && (
        <Card className="bg-gradient-to-br from-card to-card/50 border-gray-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Inclusions Mapping</h3>
              <p className="text-muted-foreground">
                Inclusions mapping functionality would be implemented here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Room Modal */}
      <Dialog open={showAddRoom} onOpenChange={setShowAddRoom}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add Room</DialogTitle>
            <DialogDescription>
              Add a new room category to your mapping configuration.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="room-name" className="text-sm font-medium">
                Room Name*
              </Label>
              <Input
                id="room-name"
                value={newRoom.roomName}
                onChange={(e) => setNewRoom((prev) => ({ ...prev, roomName: e.target.value }))}
                placeholder="Enter room name"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="abbreviation" className="text-sm font-medium">
                Abbreviation*
              </Label>
              <Input
                id="abbreviation"
                value={newRoom.abbreviation}
                onChange={(e) => setNewRoom((prev) => ({ ...prev, abbreviation: e.target.value }))}
                placeholder="Enter abbreviation"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6">
            <Button
              variant="outline"
              onClick={handleCancelAddRoom}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddRoom}
              disabled={!newRoom.roomName || !newRoom.abbreviation}
              className="px-6"
            >
              Add Room
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Rate Modal */}
      <Dialog open={showAddRate} onOpenChange={setShowAddRate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add Rate</DialogTitle>
            <DialogDescription>
              Add a new rate type to your mapping configuration.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="rate-name" className="text-sm font-medium">
                Rate Name*
              </Label>
              <Input
                id="rate-name"
                value={newRate.rateName}
                onChange={(e) => setNewRate((prev) => ({ ...prev, rateName: e.target.value }))}
                placeholder="Enter rate name"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="abbreviation" className="text-sm font-medium">
                Abbreviation*
              </Label>
              <Input
                id="abbreviation"
                value={newRate.abbreviation}
                onChange={(e) => setNewRate((prev) => ({ ...prev, abbreviation: e.target.value }))}
                placeholder="Enter abbreviation"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6">
            <Button
              variant="outline"
              onClick={handleCancelAddRate}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddRate}
              disabled={!newRate.rateName || !newRate.abbreviation}
              className="px-6"
            >
              Add Rate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change History Modal */}
      <Dialog open={showChangeHistory} onOpenChange={setShowChangeHistory}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Mapping Change History</DialogTitle>
            <DialogDescription>
              View all changes made to mapping settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Mapping change history functionality would be implemented here with actual data from the backend.
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
