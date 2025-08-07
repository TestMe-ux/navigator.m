"use client"

import { ResponsiveContainer, AreaChart, Area, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { ChartCardWrapper } from "./chart-card-wrapper"

const data = [
  { name: "Jun 1", ActualOccupancy: 80, Forecast: 82, ConfidenceRange: [78, 82] },
  { name: "Jun 2", ActualOccupancy: 81, Forecast: 83, ConfidenceRange: [79, 83] },
  { name: "Jun 3", ActualOccupancy: 82, Forecast: 84, ConfidenceRange: [80, 84] },
  { name: "Jun 4", ActualOccupancy: 83, Forecast: 85, ConfidenceRange: [81, 85] },
  { name: "Jun 5", ActualOccupancy: 84, Forecast: 86, ConfidenceRange: [82, 86] },
  { name: "Jun 6", ActualOccupancy: 85, Forecast: 87, ConfidenceRange: [83, 87] },
  { name: "Jun 7", ActualOccupancy: 86, Forecast: 88, ConfidenceRange: [84, 88] },
  { name: "Jun 8", ActualOccupancy: 85, Forecast: 87, ConfidenceRange: [83, 87] },
  { name: "Jun 9", ActualOccupancy: 84, Forecast: 86, ConfidenceRange: [82, 86] },
  { name: "Jun 10", ActualOccupancy: 83, Forecast: 85, ConfidenceRange: [81, 85] },
  { name: "Jun 11", ActualOccupancy: 82, Forecast: 84, ConfidenceRange: [80, 84] },
  { name: "Jun 12", ActualOccupancy: 81, Forecast: 83, ConfidenceRange: [79, 83] },
  { name: "Jun 13", ActualOccupancy: 80, Forecast: 82, ConfidenceRange: [78, 82] },
  { name: "Jun 14", ActualOccupancy: 79, Forecast: 81, ConfidenceRange: [77, 81] },
]

export function OccupancyForecastChart() {
  return (
    <ChartCardWrapper
      title="Occupancy Forecast"
      subtitle="Projected occupancy for the next 30 days"
      chartHeightClass="h-[350px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
          <defs>
            <linearGradient id="confidenceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e0f2fe" stopOpacity={0.6} /> {/* light sky blue */}
              <stop offset="95%" stopColor="#e0f2fe" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.5} />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 120]}
            ticks={[0, 30, 60, 90, 120]}
          />
          <Tooltip
            formatter={(value: any, name: string) => {
              if (name === "Confidence Range" && Array.isArray(value)) {
                return [`${value[0]}% - ${value[1]}%`, name]
              }
              return [`${value}%`, name]
            }}
            labelStyle={{ fontWeight: "bold", fontSize: 12 }}
            itemStyle={{ fontSize: 10, padding: 0 }}
            contentStyle={{ fontSize: 10, padding: "4px 8px" }}
          />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} iconSize={8} />
          <Area
            type="monotone"
            dataKey="ConfidenceRange"
            stroke="#bae6fd" // sky-200
            fill="url(#confidenceFill)"
            name="Confidence Range"
            activeDot={false}
          />
          <Line
            type="monotone"
            dataKey="ActualOccupancy"
            stroke="#3b82f6" // blue-500
            strokeWidth={2}
            dot={{ r: 3, fill: "#3b82f6" }}
            activeDot={{ r: 5 }}
            name="Actual Occupancy"
          />
          <Line
            type="monotone"
            dataKey="Forecast"
            stroke="#22c55e" // green-500
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 3, fill: "#22c55e" }}
            activeDot={{ r: 5 }}
            name="Forecast"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCardWrapper>
  )
}
