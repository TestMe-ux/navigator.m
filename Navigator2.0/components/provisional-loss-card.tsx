"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function ProvisionalLossCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Provisional Loss</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="text-3xl font-bold text-red-600">$1,062.2K</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span>Rate Violations</span>
              <span className="font-medium">$196.6K</span>
            </div>
            <Progress value={18.5} className="h-2.5 bg-gray-100" indicatorClassName="bg-purple-500" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span>Availability Violations</span>
              <span className="font-medium">$865.6K</span>
            </div>
            <Progress value={81.5} className="h-2.5 bg-gray-100" indicatorClassName="bg-pink-500" />
          </div>

          <div className="mt-2 rounded-md bg-amber-50 p-2">
            <div className="text-xs text-amber-700">
              <span className="font-medium">Insight:</span> 81.5% of revenue loss is from availability issues
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
