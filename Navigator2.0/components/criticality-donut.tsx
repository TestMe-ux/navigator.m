"use client"

import * as React from "react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { ChartTooltip } from "@/components/ui/chart"

const data = [
  { name: "Critical (>15%)", value: 29.6, color: "#ef4444" },
  { name: "Major (6-15%)", value: 21.1, color: "#f97316" },
  { name: "Trivial (0-5%)", value: 49.3, color: "#22c55e" },
]

export function CriticalityDonut() {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>()

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(undefined)
  }

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            activeIndex={activeIndex}
            activeShape={(props) => {
              const RADIAN = Math.PI / 180
              const {
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                startAngle,
                endAngle,
                fill,
                payload,
                percent,
                value,
              } = props
              const sin = Math.sin(-RADIAN * midAngle)
              const cos = Math.cos(-RADIAN * midAngle)
              const sx = cx + (outerRadius + 10) * cos
              const sy = cy + (outerRadius + 10) * sin
              const mx = cx + (outerRadius + 30) * cos
              const my = cy + (outerRadius + 30) * sin
              const ex = mx + (cos >= 0 ? 1 : -1) * 22
              const ey = my
              const textAnchor = cos >= 0 ? "start" : "end"

              return (
                <g>
                  <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-xl font-bold">
                    {`${value.toFixed(1)}%`}
                  </text>
                  <text x={cx} y={cy + 25} textAnchor="middle" fill="#888" className="text-xs">
                    {payload.name}
                  </text>
                  <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
                  <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                  <text
                    x={ex + (cos >= 0 ? 1 : -1) * 12}
                    y={ey}
                    textAnchor={textAnchor}
                    fill="#333"
                    className="text-xs"
                  >{`${value.toFixed(1)}%`}</text>
                </g>
              )
            }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
