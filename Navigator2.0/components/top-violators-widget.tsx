"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChevronDown, HelpCircle, Search, ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Data for OTA Violators tab
const otaViolatorsData = [
  { name: "Booking.com", rate: 130, availability: 80 },
  { name: "Expedia", rate: 125, availability: 60 },
  { name: "Agoda", rate: 10, availability: 25 },
  { name: "Makemytrip", rate: 15, availability: 10 },
]

// Data for Channel Performance tab
const channelPerformanceData = [
  { date: "22 May 25", tripadvisor: 36.5, googleHotelFinder: 25.1, booking: 17.2, expedia: 17.5, agoda: 2.1 },
  { date: "23 May 25", tripadvisor: 35.8, googleHotelFinder: 23.2, booking: 18.9, expedia: 18.8, agoda: 2.2 },
  { date: "24 May 25", tripadvisor: 36.2, googleHotelFinder: 24.1, booking: 18.2, expedia: 17.5, agoda: 2.0 },
  { date: "25 May 25", tripadvisor: 37.0, googleHotelFinder: 25.0, booking: 17.0, expedia: 17.8, agoda: 1.9 },
  { date: "26 May 25", tripadvisor: 37.1, googleHotelFinder: 24.8, booking: 16.8, expedia: 17.9, agoda: 1.9 },
  { date: "27 May 25", tripadvisor: 37.2, googleHotelFinder: 24.7, booking: 16.5, expedia: 18.0, agoda: 1.9 },
  { date: "28 May 25", tripadvisor: 37.2, googleHotelFinder: 24.6, booking: 16.2, expedia: 18.1, agoda: 1.9 },
]

// Data for Meta Violators tab
const metaViolatorsData = {
  tripadvisor: [
    { name: "Booking.com", rate: 234, availability: 80 },
    { name: "eDreams", rate: 195, availability: 53 },
    { name: "Trip.com", rate: 160, availability: 82 },
    { name: "StayForLong", rate: 149, availability: 59 },
    { name: "Priceline", rate: 95, availability: 84 },
  ],
  googleHotelFinder: [
    { name: "Booking.com", rate: 210, availability: 75 },
    { name: "eDreams", rate: 180, availability: 48 },
    { name: "Trip.com", rate: 145, availability: 70 },
    { name: "StayForLong", rate: 135, availability: 52 },
    { name: "Priceline", rate: 85, availability: 78 },
  ],
}

// Channel performance summary data
const channelSummaryData = [
  {
    name: "Tripadvisor",
    lossPercent: 76,
    meetPercent: 24,
    winPercent: 1,
    lossCount: 403,
    meetCount: 125,
    winCount: 3,
    parityScore: 24,
  },
  {
    name: "GoogleHotelFinder",
    lossPercent: 89,
    meetPercent: 11,
    winPercent: 0,
    lossCount: 266,
    meetCount: 34,
    winCount: 0,
    parityScore: 11,
  },
  {
    name: "Booking.com",
    lossPercent: 81,
    meetPercent: 19,
    winPercent: 0,
    lossCount: 243,
    meetCount: 57,
    winCount: 0,
    parityScore: 19,
  },
  {
    name: "Expedia",
    lossPercent: 84,
    meetPercent: 16,
    winPercent: 0,
    lossCount: 168,
    meetCount: 32,
    winCount: 0,
    parityScore: 16,
  },
  {
    name: "Agoda",
    lossPercent: 98,
    meetPercent: 2,
    winPercent: 0,
    lossCount: 98,
    meetCount: 2,
    winCount: 0,
    parityScore: 2,
  },
]

// Extended channel data with 10+ channels
const allChannelData = [
  {
    name: "Tripadvisor",
    lossPercent: 76,
    meetPercent: 24,
    winPercent: 1,
    lossCount: 403,
    meetCount: 125,
    winCount: 3,
    parityScore: 24,
    trend: "up",
  },
  {
    name: "GoogleHotelFinder",
    lossPercent: 89,
    meetPercent: 11,
    winPercent: 0,
    lossCount: 266,
    meetCount: 34,
    winCount: 0,
    parityScore: 11,
    trend: "down",
  },
  {
    name: "Booking.com",
    lossPercent: 81,
    meetPercent: 19,
    winPercent: 0,
    lossCount: 243,
    meetCount: 57,
    winCount: 0,
    parityScore: 19,
    trend: "stable",
  },
  {
    name: "Expedia",
    lossPercent: 84,
    meetPercent: 16,
    winPercent: 0,
    lossCount: 168,
    meetCount: 32,
    winCount: 0,
    parityScore: 16,
    trend: "down",
  },
  {
    name: "Agoda",
    lossPercent: 98,
    meetPercent: 2,
    winPercent: 0,
    lossCount: 98,
    meetCount: 2,
    winCount: 0,
    parityScore: 2,
    trend: "down",
  },
  {
    name: "Hotels.com",
    lossPercent: 72,
    meetPercent: 26,
    winPercent: 2,
    lossCount: 144,
    meetCount: 52,
    winCount: 4,
    parityScore: 28,
    trend: "up",
  },
  {
    name: "Kayak",
    lossPercent: 65,
    meetPercent: 32,
    winPercent: 3,
    lossCount: 130,
    meetCount: 64,
    winCount: 6,
    parityScore: 35,
    trend: "up",
  },
  {
    name: "Priceline",
    lossPercent: 88,
    meetPercent: 12,
    winPercent: 0,
    lossCount: 176,
    meetCount: 24,
    winCount: 0,
    parityScore: 12,
    trend: "stable",
  },
  {
    name: "Orbitz",
    lossPercent: 79,
    meetPercent: 20,
    winPercent: 1,
    lossCount: 158,
    meetCount: 40,
    winCount: 2,
    parityScore: 21,
    trend: "down",
  },
  {
    name: "Travelocity",
    lossPercent: 85,
    meetPercent: 14,
    winPercent: 1,
    lossCount: 170,
    meetCount: 28,
    winCount: 2,
    parityScore: 15,
    trend: "stable",
  },
  {
    name: "Momondo",
    lossPercent: 70,
    meetPercent: 28,
    winPercent: 2,
    lossCount: 140,
    meetCount: 56,
    winCount: 4,
    parityScore: 30,
    trend: "up",
  },
  {
    name: "Skyscanner",
    lossPercent: 92,
    meetPercent: 8,
    winPercent: 0,
    lossCount: 184,
    meetCount: 16,
    winCount: 0,
    parityScore: 8,
    trend: "down",
  },
]

export function TopViolatorsWidget() {
  const [viewMode, setViewMode] = React.useState<"violation" | "lossWinMeet">("violation")
  const [selectedMetaChannel, setSelectedMetaChannel] = React.useState("tripadvisor")
  const [isMetaDropdownOpen, setIsMetaDropdownOpen] = React.useState(false)
  const [channelSearch, setChannelSearch] = React.useState("")
  const [sortBy, setSortBy] = React.useState("parity")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc")

  // Filtering and sorting logic
  const filteredChannels = React.useMemo(() => {
    const filtered = allChannelData.filter((channel) =>
      channel.name.toLowerCase().includes(channelSearch.toLowerCase()),
    )

    filtered.sort((a, b) => {
      let aValue, bValue
      switch (sortBy) {
        case "parity":
          aValue = a.parityScore
          bValue = b.parityScore
          break
        case "loss":
          aValue = a.lossPercent
          bValue = b.lossPercent
          break
        case "meet":
          aValue = a.meetPercent
          bValue = b.meetPercent
          break
        case "win":
          aValue = a.winPercent
          bValue = b.winPercent
          break
        case "name":
          aValue = a.name
          bValue = b.name
          break
        default:
          aValue = a.parityScore
          bValue = b.parityScore
      }

      if (typeof aValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue as string) : (bValue as string).localeCompare(aValue)
      }
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })

    return filtered
  }, [channelSearch, sortBy, sortOrder])

  // Calculate averages
  const averageParity =
    filteredChannels.reduce((sum, channel) => sum + channel.parityScore, 0) / filteredChannels.length
  const averageLoss = filteredChannels.reduce((sum, channel) => sum + channel.lossPercent, 0) / filteredChannels.length
  const averageMeet = filteredChannels.reduce((sum, channel) => sum + channel.meetPercent, 0) / filteredChannels.length
  const averageWin = filteredChannels.reduce((sum, channel) => sum + channel.winPercent, 0) / filteredChannels.length

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          {/* Date Heading */}
          <div className="mb-3">
            <h3 className="text-gray-900">
              <span className="text-base font-bold">{new Date(label).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span className="text-sm font-normal">, {new Date(label).toLocaleDateString('en-GB', { weekday: 'short' })}</span>
            </h3>
          </div>
          
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="font-medium text-gray-700">{entry.name}:</span>
              <span className="text-gray-900">{entry.value}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
      <Tabs defaultValue="ota">
        <div className="px-4 pt-3 pb-0">
          <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 h-auto rounded-none border-b border-gray-200">
            <TabsTrigger
              value="ota"
              className="relative text-sm font-medium py-3 px-3 bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 rounded-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-1 data-[state=active]:after:bg-gradient-to-r data-[state=active]:after:from-blue-500 data-[state=active]:after:to-purple-500"
            >
              Top OTA Violators
            </TabsTrigger>
            <TabsTrigger
              value="meta"
              className="relative text-sm font-medium py-3 px-3 bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 rounded-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-1 data-[state=active]:after:bg-gradient-to-r data-[state=active]:after:from-blue-500 data-[state=active]:after:to-purple-500"
            >
              Top Meta Violators
              <HelpCircle className="inline-block ml-1 h-4 w-4 text-gray-400" />
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="relative text-sm font-medium py-3 px-3 bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 rounded-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-1 data-[state=active]:after:bg-gradient-to-r data-[state=active]:after:from-blue-500 data-[state=active]:after:to-purple-500"
            >
              Channel Performance
              <HelpCircle className="inline-block ml-1 h-4 w-4 text-gray-400" />
            </TabsTrigger>
          </TabsList>
        </div>

        {/* OTA Violators Tab */}
        <TabsContent value="ota" className="px-4 pb-3 mt-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">View by:</span>
              <RadioGroup
                value={viewMode}
                onValueChange={(value: "violation" | "lossWinMeet") => setViewMode(value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="violation" id="violation" className="border-gray-300 text-blue-600" />
                  <Label htmlFor="violation" className="text-sm text-gray-700">
                    Violation
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lossWinMeet" id="lossWinMeet" className="border-gray-300 text-blue-600" />
                  <Label htmlFor="lossWinMeet" className="text-sm text-gray-700">
                    Loss/Meet/Win
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {viewMode === "violation" ? (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={otaViolatorsData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  barGap={0}
                  barCategoryGap={20}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    label={{
                      value: "No. of Violations",
                      angle: -90,
                      position: "insideLeft",
                      style: { textAnchor: "middle", fontSize: 12, fill: "#888" },
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />
                  <Bar dataKey="rate" name="Rate" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="availability" name="Availability" stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {channelSummaryData.slice(0, 3).map((channel) => (
                <div key={channel.name} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">{channel.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Channel Parity</span>
                      <span className="text-lg font-bold">{channel.parityScore}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="flex flex-col items-center">
                      <div className="relative w-20 h-20">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="#e9ecef" strokeWidth="2"></circle>
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            stroke="#dc2626"
                            strokeWidth="2"
                            strokeDasharray={`${channel.lossPercent} 100`}
                            strokeDashoffset="25"
                            transform="rotate(-90 18 18)"
                          ></circle>
                          <text x="18" y="18" textAnchor="middle" dy=".3em" fontSize="10" fill="#111">
                            {channel.lossPercent}%
                          </text>
                        </svg>
                      </div>
                      <div className="text-2xl font-bold mt-2">{channel.lossCount}</div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="relative w-20 h-20">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="#e9ecef" strokeWidth="2"></circle>
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            stroke="#65a30d"
                            strokeWidth="2"
                            strokeDasharray={`${channel.meetPercent} 100`}
                            strokeDashoffset="25"
                            transform="rotate(-90 18 18)"
                          ></circle>
                          <text x="18" y="18" textAnchor="middle" dy=".3em" fontSize="10" fill="#111">
                            {channel.meetPercent}%
                          </text>
                        </svg>
                      </div>
                      <div className="text-2xl font-bold mt-2">{channel.meetCount}</div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="relative w-20 h-20">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="#e9ecef" strokeWidth="2"></circle>
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            stroke="#eab308"
                            strokeWidth="2"
                            strokeDasharray={`${channel.winPercent} 100`}
                            strokeDashoffset="25"
                            transform="rotate(-90 18 18)"
                          ></circle>
                          <text x="18" y="18" textAnchor="middle" dy=".3em" fontSize="10" fill="#111">
                            {channel.winPercent}%
                          </text>
                        </svg>
                      </div>
                      <div className="text-2xl font-bold mt-2">{channel.winCount}</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Progress
                      value={channel.parityScore}
                      className="h-2 bg-gray-100"
                      indicatorClassName="bg-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Meta Violators Tab */}
        <TabsContent value="meta" className="px-4 pb-3 mt-0">
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <Popover open={isMetaDropdownOpen} onOpenChange={setIsMetaDropdownOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 text-sm font-medium">
                    {selectedMetaChannel === "tripadvisor" ? "Tripadvisor" : "GoogleHotelFinder"}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-0">
                  <div className="py-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm"
                      onClick={() => {
                        setSelectedMetaChannel("tripadvisor")
                        setIsMetaDropdownOpen(false)
                      }}
                    >
                      Tripadvisor
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm"
                      onClick={() => {
                        setSelectedMetaChannel("googleHotelFinder")
                        setIsMetaDropdownOpen(false)
                      }}
                    >
                      GoogleHotelFinder
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metaViolatorsData[selectedMetaChannel as keyof typeof metaViolatorsData]}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                barGap={10}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "No. of Violations",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle", fontSize: 12, fill: "#888" },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="rate" name="Rate" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="availability" name="Availability" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* Channel Performance Tab */}
        <TabsContent value="performance" className="px-4 pb-3 mt-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">View by:</span>
              <RadioGroup
                value={viewMode}
                onValueChange={(value: "violation" | "lossWinMeet") => setViewMode(value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="violation" id="violation-perf" className="border-gray-300 text-blue-600" />
                  <Label htmlFor="violation-perf" className="text-sm text-gray-700">
                    Violation
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lossWinMeet" id="lossWinMeet-perf" className="border-gray-300 text-blue-600" />
                  <Label htmlFor="lossWinMeet-perf" className="text-sm text-gray-700">
                    Loss/Meet/Win
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {viewMode === "violation" ? (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={channelPerformanceData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    label={{
                      value: "Channel Parity Score",
                      angle: -90,
                      position: "insideLeft",
                      style: { textAnchor: "middle", fontSize: 12, fill: "#888" },
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="tripadvisor"
                    name="Tripadvisor"
                    stroke="#e91e63"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="googleHotelFinder"
                    name="GoogleHotelFinder"
                    stroke="#4caf50"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="booking"
                    name="Booking.com"
                    stroke="#2196f3"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expedia"
                    name="Expedia"
                    stroke="#ff9800"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line type="monotone" dataKey="agoda" name="Agoda" stroke="#f44336" strokeWidth={2} dot={{ r: 3 }} />
                  <Legend verticalAlign="bottom" height={36} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search and Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search channels..."
                      value={channelSearch}
                      onChange={(e) => setChannelSearch(e.target.value)}
                      className="pl-8 h-8 w-64 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40 h-8 text-sm border-gray-300">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parity">Parity Score</SelectItem>
                      <SelectItem value="loss">Loss %</SelectItem>
                      <SelectItem value="meet">Meet %</SelectItem>
                      <SelectItem value="win">Win %</SelectItem>
                      <SelectItem value="name">Channel Name</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="h-8 px-3 text-sm border-gray-300"
                  >
                    {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  Showing {filteredChannels.length} of {allChannelData.length} channels
                </div>
              </div>

              {/* Compact Table View */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 w-1/4">Channel</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 w-1/6">Parity</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 w-1/6">Loss</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 w-1/6">Meet</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 w-1/6">Win</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 w-1/6">
                          Distribution
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredChannels.map((channel, index) => (
                        <tr key={channel.name} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900">{channel.name}</div>
                              {channel.trend && (
                                <div className="flex items-center">
                                  {channel.trend === "up" ? (
                                    <TrendingUp className="h-3 w-3 text-green-600" />
                                  ) : channel.trend === "down" ? (
                                    <TrendingDown className="h-3 w-3 text-red-600" />
                                  ) : null}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm font-bold text-blue-600">{channel.parityScore}%</span>
                              <div className="w-12 bg-gray-100 rounded-full h-1">
                                <div
                                  className="bg-blue-600 h-1 rounded-full"
                                  style={{ width: `${channel.parityScore}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm font-medium text-red-600">{channel.lossPercent}%</span>
                              <span className="text-xs text-gray-500">({channel.lossCount})</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm font-medium text-green-600">{channel.meetPercent}%</span>
                              <span className="text-xs text-gray-500">({channel.meetCount})</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm font-medium text-yellow-600">{channel.winPercent}%</span>
                              <span className="text-xs text-gray-500">({channel.winCount})</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center h-4 bg-gray-100 rounded overflow-hidden">
                              <div className="h-full bg-red-500" style={{ width: `${channel.lossPercent}%` }}></div>
                              <div className="h-full bg-green-500" style={{ width: `${channel.meetPercent}%` }}></div>
                              <div className="h-full bg-yellow-500" style={{ width: `${channel.winPercent}%` }}></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{averageParity.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Avg Parity</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{averageLoss.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Avg Loss</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{averageMeet.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Avg Meet</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">{averageWin.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Avg Win</div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-xs font-medium text-gray-700">Loss</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-xs font-medium text-gray-700">Meet</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-xs font-medium text-gray-700">Win</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span className="text-xs font-medium text-gray-700">Parity Score</span>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}
