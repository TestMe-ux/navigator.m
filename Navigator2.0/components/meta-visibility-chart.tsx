"use client"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const tripadvisorData = [
  { rank: "#1", count: 42 },
  { rank: "#2", count: 75 },
  { rank: "#3", count: 83 },
  { rank: "#4", count: 175 },
  { rank: "#5", count: 154 },
  { rank: "#6", count: 32 },
  { rank: "#7", count: 14 },
  { rank: "#8", count: 8 },
  { rank: "#9", count: 5 },
]

const googleData = [
  { rank: "#1", count: 35 },
  { rank: "#2", count: 62 },
  { rank: "#3", count: 78 },
  { rank: "#4", count: 145 },
  { rank: "#5", count: 120 },
  { rank: "#6", count: 28 },
  { rank: "#7", count: 12 },
  { rank: "#8", count: 6 },
  { rank: "#9", count: 4 },
]

export function MetaVisibilityChart() {
  return (
    <Tabs defaultValue="tripadvisor">
      <div className="flex items-center justify-between">
        <TabsList className="h-8">
          <TabsTrigger value="tripadvisor" className="text-xs">
            Tripadvisor - 91.1%
          </TabsTrigger>
          <TabsTrigger value="google" className="text-xs">
            GoogleHotelFinder - 9%
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="tripadvisor" className="mt-2">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={tripadvisorData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              barGap={0}
              barCategoryGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="rank" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                label={{
                  value: "No. of Properties",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle", fontSize: 12, fill: "#888" },
                }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="count"
                name="Properties"
                fill="#06b6d4"
                radius={[4, 4, 0, 0]}
                background={{ fill: "#f1f5f9" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>

      <TabsContent value="google" className="mt-2">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={googleData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              barGap={0}
              barCategoryGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="rank" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                label={{
                  value: "No. of Properties",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle", fontSize: 12, fill: "#888" },
                }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="count"
                name="Properties"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
                background={{ fill: "#f1f5f9" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>
    </Tabs>
  )
}
