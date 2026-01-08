"use client"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip } from "@/components/ui/chart"

const data = [
  {
    name: "Tripadvisor",
    rate: 77,
    availability: 202.3,
    total: 279.3,
    formattedTotal: "$279.3K",
  },
  {
    name: "GoogleHotelFinder",
    rate: 63.9,
    availability: 199.4,
    total: 263.3,
    formattedTotal: "$263.3K",
  },
  {
    name: "Booking.com",
    rate: 36.2,
    availability: 216.8,
    total: 253,
    formattedTotal: "$253K",
  },
  {
    name: "Agoda",
    rate: 0.8,
    availability: 195,
    total: 195.8,
    formattedTotal: "$195.8K",
  },
]

// Sort data by total in descending order
const sortedData = [...data].sort((a, b) => b.total - a.total)

export function RevenueChannelChart() {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 10, right: 10, left: 80, bottom: 0 }}
          barGap={0}
          barCategoryGap={10}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={80} />
          <Tooltip
            content={<ChartTooltip />}
            formatter={(value: any) => [`$${value}K`, ""]}
            labelFormatter={(label) => `${label}`}
          />
          <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />
          <Bar dataKey="rate" name="Rate" stackId="a" fill="#a855f7" radius={[0, 4, 4, 0]} />
          <Bar dataKey="availability" name="Availability" stackId="a" fill="#ec4899" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
