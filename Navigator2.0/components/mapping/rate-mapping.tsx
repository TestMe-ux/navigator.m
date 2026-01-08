"use client"

import React, { useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data
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

export default function RateMappingComponent() {
  const [selectedChannel, setSelectedChannel] = useState("Agoda")

  return (
    <div className="bg-gradient-to-br from-card to-card/50 border-gray-200 dark:border-slate-700 rounded-lg border">
      <div className="p-6">
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
      </div>
    </div>
  )
}
