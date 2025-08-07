"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Settings } from "lucide-react"

interface ChannelData {
  name: string
  total: number
  rate: number
  availability: number
  rateFormatted: string
  availabilityFormatted: string
  totalFormatted: string
}

interface PropertySettings {
  name: string
  rooms: number
  transientBusiness: number
}

const channelData: ChannelData[] = [
  {
    name: "Tripadvisor",
    total: 279.3,
    rate: 77,
    availability: 202.3,
    rateFormatted: "$77k",
    availabilityFormatted: "$202.3k",
    totalFormatted: "$279.3k",
  },
  {
    name: "GoogleHotelFinder",
    total: 263.3,
    rate: 63.9,
    availability: 199.4,
    rateFormatted: "$63.9k",
    availabilityFormatted: "$199.4k",
    totalFormatted: "$263.3k",
  },
  {
    name: "Booking.com",
    total: 253,
    rate: 36.2,
    availability: 216.8,
    rateFormatted: "$36.2k",
    availabilityFormatted: "$216.8k",
    totalFormatted: "$253k",
  },
  {
    name: "Agoda",
    total: 195.8,
    rate: 0.8,
    availability: 195,
    rateFormatted: "$0.8k",
    availabilityFormatted: "$195k",
    totalFormatted: "$195.8k",
  },
]

export function ProvisionalRevenueLossWidget() {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<"all" | "individual">("all")
  const [globalRooms, setGlobalRooms] = React.useState(100)
  const [globalTransient, setGlobalTransient] = React.useState(30)
  const [hotelSearch, setHotelSearch] = React.useState("")
  const [properties, setProperties] = React.useState<PropertySettings[]>([
    { name: "Aston Imperium Purwokerto", rooms: 100, transientBusiness: 29 },
    { name: "Avani Windhoek Hotel & Casino", rooms: 100, transientBusiness: 30 },
    { name: "Best Western Premier La Grande Hotel", rooms: 100, transientBusiness: 30 },
    { name: "Copthorne Hotel Newcastle", rooms: 100, transientBusiness: 30 },
    { name: "Grand Mercure Jakarta", rooms: 100, transientBusiness: 30 },
  ])

  const totalRevenueLoss = channelData.reduce((sum, channel) => sum + channel.total, 0)

  const updatePropertyRooms = (index: number, rooms: number) => {
    setProperties((prev) => prev.map((prop, i) => (i === index ? { ...prop, rooms: Math.max(0, rooms) } : prop)))
  }

  const updatePropertyTransient = (index: number, transient: number) => {
    setProperties((prev) =>
      prev.map((prop, i) =>
        i === index ? { ...prop, transientBusiness: Math.max(0, Math.min(100, transient)) } : prop,
      ),
    )
  }

  const filteredProperties = properties.filter((property) =>
    property.name.toLowerCase().includes(hotelSearch.toLowerCase()),
  )

  const handleSaveSettings = () => {
    // Here you would typically save the settings to your backend
    setIsSettingsOpen(false)
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-medium text-gray-900">Provisional Revenue Loss</CardTitle>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">USD</div>
            <div className="text-2xl font-bold text-red-600">${totalRevenueLoss.toFixed(1)}k</div>
          </div>
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-900">Settings</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Property Selection */}
                <div className="space-y-4">
                  <RadioGroup value={viewMode} onValueChange={(value: "all" | "individual") => setViewMode(value)}>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all-properties" className="border-gray-300 text-blue-600" />
                        <Label htmlFor="all-properties" className="text-sm font-medium text-gray-700">
                          All Properties
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="individual"
                          id="individual-properties"
                          className="border-gray-300 text-blue-600"
                        />
                        <Label htmlFor="individual-properties" className="text-sm font-medium text-gray-700">
                          Individual Properties
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* All Properties Settings */}
                {viewMode === "all" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="rooms" className="text-sm font-medium text-gray-600">
                        Number of Rooms
                      </Label>
                      <Input
                        id="rooms"
                        type="number"
                        value={globalRooms}
                        onChange={(e) => setGlobalRooms(Number.parseInt(e.target.value) || 0)}
                        className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transient" className="text-sm font-medium text-gray-600">
                        Percent Transient Business
                      </Label>
                      <Input
                        id="transient"
                        type="number"
                        value={globalTransient}
                        onChange={(e) => setGlobalTransient(Number.parseInt(e.target.value) || 0)}
                        className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                )}

                {/* Individual Properties Settings */}
                {viewMode === "individual" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="hotel-search" className="text-sm font-medium text-gray-600">
                        Hotel Name
                      </Label>
                      <Input
                        id="hotel-search"
                        placeholder="Search hotel name"
                        value={hotelSearch}
                        onChange={(e) => setHotelSearch(e.target.value)}
                        className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600 border-b pb-2">
                        <div className="col-span-6">Property</div>
                        <div className="col-span-3 text-center">No. of Rooms</div>
                        <div className="col-span-3 text-center">% Transient Business</div>
                      </div>

                      <div className="max-h-64 overflow-y-auto space-y-3">
                        {filteredProperties.map((property, index) => (
                          <div key={property.name} className="grid grid-cols-12 gap-4 items-center py-2">
                            <div className="col-span-6 text-sm font-medium text-gray-800">{property.name}</div>
                            <div className="col-span-3">
                              <Input
                                type="number"
                                value={property.rooms}
                                onChange={(e) => updatePropertyRooms(index, Number.parseInt(e.target.value) || 0)}
                                className="w-full text-center border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                min="0"
                              />
                            </div>
                            <div className="col-span-3 flex items-center gap-1">
                              <Input
                                type="number"
                                value={property.transientBusiness}
                                onChange={(e) => updatePropertyTransient(index, Number.parseInt(e.target.value) || 0)}
                                className="w-full text-center border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                min="0"
                                max="100"
                              />
                              <span className="text-sm text-gray-500">%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={() => setIsSettingsOpen(false)} className="px-6">
                  Cancel
                </Button>
                <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                  Done
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {channelData.map((channel, index) => {
          const ratePercentage = (channel.rate / channel.total) * 100
          const availabilityPercentage = (channel.availability / channel.total) * 100

          return (
            <div key={channel.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-800">{channel.name}</div>
                <div className="text-lg font-bold text-red-600">{channel.totalFormatted}</div>
              </div>

              <div className="relative">
                <div className="flex h-6 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="bg-purple-500 flex items-center justify-center"
                    style={{ width: `${ratePercentage}%` }}
                  >
                    {ratePercentage > 15 && (
                      <span className="text-xs font-medium text-white">{channel.rateFormatted}</span>
                    )}
                  </div>
                  <div
                    className="bg-pink-500 flex items-center justify-center"
                    style={{ width: `${availabilityPercentage}%` }}
                  >
                    {availabilityPercentage > 15 && (
                      <span className="text-xs font-medium text-white">{channel.availabilityFormatted}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-xs text-gray-600">
                <span>{channel.rateFormatted}</span>
                <span>{channel.availabilityFormatted}</span>
              </div>
            </div>
          )
        })}

        <div className="flex items-center justify-center gap-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-purple-500 rounded"></div>
            <span className="text-xs text-gray-600">Rate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-pink-500 rounded"></div>
            <span className="text-xs text-gray-600">Availability</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
