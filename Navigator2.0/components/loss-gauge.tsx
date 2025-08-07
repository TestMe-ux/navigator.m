"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function LossGauge() {
  const lossPercentage = 79.8
  const previousLoss = 78.5
  const change = lossPercentage - previousLoss
  const isNegative = change < 0 // For loss, negative change is good

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Loss (Violations)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-red-600">{lossPercentage}%</span>
            <span className={cn("ml-2 flex items-center text-sm", isNegative ? "text-green-600" : "text-red-600")}>
              <ArrowUpRight className="h-4 w-4" />
              {change.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span>Rate Violations</span>
              <span className="font-medium">64.4%</span>
            </div>
            <Progress value={64.4} className="h-2.5 bg-gray-100" indicatorClassName="bg-purple-500" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span>Availability Violations</span>
              <span className="font-medium">15.4%</span>
            </div>
            <Progress value={15.4} className="h-2.5 bg-gray-100" indicatorClassName="bg-pink-500" />
          </div>

          <div className="mt-2 rounded-md bg-red-50 p-2">
            <div className="text-xs text-red-700">
              <span className="font-medium">Critical Alert:</span> Loss rate exceeds target threshold (30%)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
