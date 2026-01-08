"use client"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const data = [
  { name: "Booking.com", rate: 130, availability: 80 },
  { name: "Expedia", rate: 125, availability: 60 },
  { name: "Agoda", rate: 10, availability: 25 },
  { name: "Makemytrip", rate: 15, availability: 10 },
]

export function TopViolatorsChart() {
  return (
    <Tabs defaultValue="geo">
      <div className="flex items-center justify-between">
        <TabsList className="h-8">
          <TabsTrigger value="geo" className="text-xs">
            Geo Violation
          </TabsTrigger>
          <TabsTrigger value="rate" className="text-xs">
            Rate Range
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="geo" className="mt-2">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }} barGap={0} barCategoryGap={20}>
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
              <Tooltip content={<ChartTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />
              <Bar dataKey="rate" name="Rate" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="availability" name="Availability" stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>

      <TabsContent value="rate">
        <div className="flex h-[250px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Rate range data not available</p>
        </div>
      </TabsContent>
    </Tabs>
  )
}
