"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from "recharts"
import { ChartCardWrapper } from "./chart-card-wrapper"

const data = [
  { name: "Jun 1", CurrentYear: 75, LastYear: 70, Forecast: 80, Target: 100 },
  { name: "Jun 2", CurrentYear: 78, LastYear: 72, Forecast: 82, Target: 100 },
  { name: "Jun 3", CurrentYear: 76, LastYear: 70, Forecast: 80, Target: 100 },
  { name: "Jun 4", CurrentYear: 80, LastYear: 75, Forecast: 85, Target: 100 },
  { name: "Jun 5", CurrentYear: 82, LastYear: 78, Forecast: 88, Target: 100 },
  { name: "Jun 6", CurrentYear: 85, LastYear: 80, Forecast: 90, Target: 100 },
  { name: "Jun 7", CurrentYear: 88, LastYear: 82, Forecast: 92, Target: 100 },
  { name: "Jun 8", CurrentYear: 90, LastYear: 85, Forecast: 95, Target: 100 },
  { name: "Jun 9", CurrentYear: 92, LastYear: 88, Forecast: 98, Target: 100 },
  { name: "Jun 10", CurrentYear: 95, LastYear: 90, Forecast: 100, Target: 100 },
  { name: "Jun 11", CurrentYear: 98, LastYear: 92, Forecast: 102, Target: 100 },
  { name: "Jun 12", CurrentYear: 100, LastYear: 95, Forecast: 105, Target: 100 },
  { name: "Jun 13", CurrentYear: 102, LastYear: 98, Forecast: 108, Target: 100 },
  { name: "Jun 14", CurrentYear: 105, LastYear: 100, Forecast: 110, Target: 100 },
]

export function BookingPaceChart() {
  return (
    <ChartCardWrapper title="Booking Pace Trends" subtitle="Daily booking volume compared to historical data">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.5} />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            domain={[0, "dataMax + 10"]}
          />
          <Tooltip
            formatter={(value: number) => [`${value}%`, undefined]}
            labelStyle={{ fontWeight: "bold", fontSize: 12 }}
            itemStyle={{ fontSize: 10, padding: 0 }}
            contentStyle={{ fontSize: 10, padding: "4px 8px" }}
          />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} iconSize={8} />
          <ReferenceLine y={100} stroke="#a855f7" strokeDasharray="3 3" strokeWidth={1.5}>
            <Legend payload={[{ value: "Target", type: "line", color: "#a855f7" }]} />
          </ReferenceLine>
          <Line
            type="monotone"
            dataKey="CurrentYear"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name="Current Year"
          />
          <Line
            type="monotone"
            dataKey="LastYear"
            stroke="#6b7280"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name="Last Year"
          />
          <Line
            type="monotone"
            dataKey="Forecast"
            stroke="#22c55e"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name="Forecast"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCardWrapper>
  )
}
