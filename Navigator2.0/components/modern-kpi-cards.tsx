"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, AlertTriangle, DollarSign, BarChart2 } from "lucide-react"

export function ModernKPICards() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Parity Score Card */}
      <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-teal-500"></div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Parity Score</h3>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
                  20.2%
                </span>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span className="font-medium">+0.7%</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">vs last period</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center">
              <BarChart2 className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* Separator bar */}
          <div className="w-full h-px bg-gradient-to-r from-blue-500 to-teal-500 mb-4 opacity-20"></div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Meet</span>
              <span className="text-sm font-semibold text-gray-900">20.2%</span>
            </div>
            <Progress
              value={20.2}
              className="h-2 bg-gray-100"
              indicatorClassName="bg-gradient-to-r from-blue-400 to-teal-400"
            />

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Win</span>
              <span className="text-sm font-semibold text-gray-900">0%</span>
            </div>
            <Progress
              value={0}
              className="h-2 bg-gray-100"
              indicatorClassName="bg-gradient-to-r from-green-400 to-green-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Loss Rate Card */}
      <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Loss Rate</h3>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                  79.8%
                </span>
                <div className="flex items-center text-sm text-red-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span className="font-medium">+1.3%</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">vs last period</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <div className="text-xs text-gray-500 mb-1">Rate Violations</div>
              <div className="text-lg font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                64.4%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Availability Violations</div>
              <div className="text-lg font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
                15.4%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Loss Card */}
      <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Revenue Loss</h3>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  $1.06M
                </span>
                <div className="flex items-center text-sm text-red-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span className="font-medium">+$127K</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">vs last period</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Availability Issues</span>
              <span className="text-sm font-semibold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
                81.5% ($865K)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Rate Violations</span>
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                18.5% ($197K)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
