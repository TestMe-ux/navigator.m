"use client"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip } from "@/components/ui/chart"

const data = [
  { date: "14 May 25", parityScore: 10, win: 0, meet: 10, loss: 80, brand: 85 },
  { date: "15 May 25", parityScore: 12, win: 0, meet: 12, loss: 82, brand: 85 },
  { date: "16 May 25", parityScore: 15, win: 0, meet: 15, loss: 83, brand: 85 },
  { date: "17 May 25", parityScore: 18, win: 0, meet: 18, loss: 80, brand: 80 },
  { date: "18 May 25", parityScore: 19, win: 0, meet: 19, loss: 79, brand: 80 },
  { date: "19 May 25", parityScore: 20, win: 0, meet: 20, loss: 80, brand: 80 },
  { date: "20 May 25", parityScore: 20.2, win: 0, meet: 20.2, loss: 79.8, brand: 80 },
]

export function ParityScoreChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorMeet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorWin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorBrand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 100]} />
          <Tooltip content={<ChartTooltip />} />
          <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />
          <Area
            type="monotone"
            dataKey="loss"
            name="Loss"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#colorLoss)"
            activeDot={{ r: 6 }}
          />
          <Area
            type="monotone"
            dataKey="meet"
            name="Meet"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#colorMeet)"
            activeDot={{ r: 6 }}
          />
          <Area
            type="monotone"
            dataKey="win"
            name="Win"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorWin)"
            activeDot={{ r: 6 }}
          />
          <Area
            type="monotone"
            dataKey="brand"
            name="Brand"
            stroke="#6366f1"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="url(#colorBrand)"
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
