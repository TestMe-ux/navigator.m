"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function ParityScoreGauge() {
  const score = 20.2
  const previousScore = 19.5
  const change = score - previousScore
  const isPositive = change > 0

  // Calculate color based on score
  const getColor = (value: number) => {
    if (value < 40) return "bg-red-500"
    if (value < 80) return "bg-amber-500"
    return "bg-green-500"
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Parity Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{score}%</span>
            <span className={cn("ml-2 flex items-center text-sm", isPositive ? "text-green-600" : "text-red-600")}>
              <ArrowUpRight className="h-4 w-4" />
              {change.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Meet</span>
            <span className="text-sm font-medium text-gray-500">20.2%</span>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span>Meet</span>
              <span className="font-medium">20.2%</span>
            </div>
            <Progress value={20.2} className="h-2 bg-gray-100" indicatorClassName="bg-green-500" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span>Win</span>
              <span className="font-medium">0%</span>
            </div>
            <Progress value={0} className="h-2 bg-gray-100" indicatorClassName="bg-blue-500" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span>Loss</span>
              <span className="font-medium">79.8%</span>
            </div>
            <Progress value={79.8} className="h-2 bg-gray-100" indicatorClassName="bg-red-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
