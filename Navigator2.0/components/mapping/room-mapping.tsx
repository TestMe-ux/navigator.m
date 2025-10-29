"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

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

export default function RoomMappingComponent() {
  const [mappingMode, setMappingMode] = useState("basic")
  const [selectedChannel, setSelectedChannel] = useState("Agoda")
  const [hotelScrollIndex, setHotelScrollIndex] = useState(0)

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

  return (
    <div className="bg-gradient-to-br from-card to-card/50 border-gray-200 dark:border-slate-700 rounded-lg border">
      <div className="p-6">
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
      </div>
    </div>
  )
}
