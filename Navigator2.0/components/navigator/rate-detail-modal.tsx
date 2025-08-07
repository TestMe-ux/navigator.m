"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, X, FileSpreadsheet } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface RateDetailModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date | null
  onPrevDay: () => void
  onNextDay: () => void
  // TODO: Add props for chart data and filter context
}

// Sample data for the chart - replace with actual data
const sampleChartData = [
  {
    leadtime: 34,
    OTB: 676,
    Vakkaru: 1078,
    Soneva: 1279,
    Anantara: 1681,
    FourSeasons: 1882,
    OneOnly: 2083,
    SixSenses: 2284,
    CompetitorX: 2485,
  },
  {
    leadtime: 32,
    OTB: 676,
    Vakkaru: 1078,
    Soneva: 1279,
    Anantara: 1681,
    FourSeasons: 1882,
    OneOnly: 2083,
    SixSenses: 2284,
    CompetitorX: 2485,
  },
  {
    leadtime: 30,
    OTB: 676,
    Vakkaru: 1078,
    Soneva: 1279,
    Anantara: 1681,
    FourSeasons: 1882,
    OneOnly: 2083,
    SixSenses: 2284,
    CompetitorX: 2485,
  },
  {
    leadtime: 28,
    OTB: 676,
    Vakkaru: 1078,
    Soneva: 1279,
    Anantara: 1681,
    FourSeasons: 1882,
    OneOnly: 2083,
    SixSenses: 2284,
    CompetitorX: 2485,
  },
  {
    leadtime: 26,
    OTB: 676,
    Vakkaru: 1078,
    Soneva: 1279,
    Anantara: 1681,
    FourSeasons: 1882,
    OneOnly: 2083,
    SixSenses: 2284,
    CompetitorX: 2485,
  },
  {
    leadtime: 24,
    OTB: 676,
    Vakkaru: 1078,
    Soneva: 1279,
    Anantara: 1681,
    FourSeasons: 1882,
    OneOnly: 2083,
    SixSenses: 2284,
    CompetitorX: 2485,
  },
  {
    leadtime: 22,
    OTB: 676,
    Vakkaru: 1078,
    Soneva: 1279,
    Anantara: 1681,
    FourSeasons: 1882,
    OneOnly: 2083,
    SixSenses: 2284,
    CompetitorX: 2485,
  },
  {
    leadtime: 20,
    OTB: 676,
    Vakkaru: 1078,
    Soneva: 1279,
    Anantara: 1681,
    FourSeasons: 1882,
    OneOnly: 2083,
    SixSenses: 2284,
    CompetitorX: 2485,
  },
  {
    leadtime: 18,
    OTB: 676,
    Vakkaru: 1078,
    Soneva: 1279,
    Anantara: 1681,
    FourSeasons: 1882,
    OneOnly: 2083,
    SixSenses: 2284,
    CompetitorX: 2485,
  },
  {
    leadtime: 16,
    OTB: 690,
    Vakkaru: null,
    Soneva: 1279,
    Anantara: 1681,
    FourSeasons: 1882,
    OneOnly: 2083,
    SixSenses: 2284,
    CompetitorX: 2485,
  },
  {
    leadtime: 14,
    OTB: 720,
    Vakkaru: null,
    Soneva: 1279,
    Anantara: 1681,
    FourSeasons: 1882,
    OneOnly: 2083,
    SixSenses: 2200,
    CompetitorX: 2400,
  },
  {
    leadtime: 12,
    OTB: 750,
    Vakkaru: null,
    Soneva: 1279,
    Anantara: 1681,
    FourSeasons: 1882,
    OneOnly: 2000,
    SixSenses: 2200,
    CompetitorX: 2400,
  },
  {
    leadtime: 10,
    OTB: 780,
    Vakkaru: null,
    Soneva: 1279,
    Anantara: 1681,
    FourSeasons: 1800,
    OneOnly: 2000,
    SixSenses: 2200,
    CompetitorX: 2400,
  },
  {
    leadtime: 8,
    OTB: 800,
    Vakkaru: null,
    Soneva: 1279,
    Anantara: 1600,
    FourSeasons: 1800,
    OneOnly: 2000,
    SixSenses: 2200,
    CompetitorX: 2400,
  },
  {
    leadtime: 6,
    OTB: 750,
    Vakkaru: null,
    Soneva: 1279,
    Anantara: 1600,
    FourSeasons: 1800,
    OneOnly: 2000,
    SixSenses: 2200,
    CompetitorX: 2400,
  },
  {
    leadtime: 4,
    OTB: 700,
    Vakkaru: null,
    Soneva: 1279,
    Anantara: 1600,
    FourSeasons: 1800,
    OneOnly: 2000,
    SixSenses: 2200,
    CompetitorX: 2400,
  },
]

const legendPayload = [
  { value: "OTB", type: "line", id: "OTB", color: "#3b82f6" },
  {
    value: "Vakkaru Maldives - 30 percent off on seaplane transfers for stays until 19 Dec 2025",
    type: "line",
    id: "Vakkaru",
    color: "#ec4899",
  },
  { value: "Soneva Fushi", type: "line", id: "Soneva", color: "#f59e0b" },
  { value: "Anantara Kihavah Maldives Villas", type: "line", id: "Anantara", color: "#ef4444" },
  { value: "Four Seasons Re...", type: "line", id: "FourSeasons", color: "#a855f7" }, // Truncated for display
  { value: "One&Only Reethi Rah", type: "line", id: "OneOnly", color: "#8b5cf6" },
  { value: "Six Senses Laamu", type: "line", id: "SixSenses", color: "#10b981" },
]

export function RateDetailModal({ isOpen, onClose, selectedDate, onPrevDay, onNextDay }: RateDetailModalProps) {
  if (!isOpen || !selectedDate) {
    return null
  }

  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onPrevDay}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onNextDay}>
                <ChevronRight className="h-5 w-5" />
              </Button>
              <DialogTitle className="text-lg font-semibold">{formattedDate}</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-5 w-5" />
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 border-b">
          <Tabs defaultValue="rates-evolution" className="w-full">
            <TabsList className="grid w-full grid-cols-1 max-w-xs">
              {" "}
              {/* Changed grid-cols-2 to grid-cols-1 */}
              <TabsTrigger value="rates-evolution">Rates evolution</TabsTrigger>
              {/* Removed TabsTrigger for Pace */}
            </TabsList>
            <div className="text-xs text-muted-foreground mt-2">
              Lowest - Booking.com - 1 night - 2 guests - Primary compset
            </div>
            <TabsContent value="rates-evolution" className="mt-4 flex-grow overflow-y-auto">
              <div className="h-[calc(100vh_-_300px)]">
                {" "}
                {/* Adjust height as needed */}
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sampleChartData} margin={{ top: 5, right: 20, left: -20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="leadtime"
                      angle={0}
                      tick={{ fontSize: 10 }}
                      label={{ value: "Leadtime", position: "insideBottom", dy: 15, fontSize: 12 }}
                    />
                    <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                      labelFormatter={(label) => `Leadtime: ${label}`}
                    />
                    <Legend
                      payload={legendPayload}
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ paddingTop: 20, paddingBottom: 0 }}
                      iconSize={10}
                    />
                    <Line type="monotone" dataKey="OTB" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                    <Line
                      type="monotone"
                      dataKey="Vakkaru"
                      stroke="#ec4899"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                      strokeDasharray="5 5"
                    />
                    <Line
                      type="monotone"
                      dataKey="Soneva"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="Anantara"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="FourSeasons"
                      stroke="#a855f7"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="OneOnly"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="SixSenses"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="CompetitorX"
                      stroke="#64748b"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                      strokeDasharray="2 2"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            {/* Removed TabsContent for Pace */}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
