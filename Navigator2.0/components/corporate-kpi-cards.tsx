"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, MoreHorizontal } from "lucide-react"

export function CorporateKPICards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Parity Score */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Parity Score</h3>
            <Button variant="ghost" size="sm" className="text-corporate-blue hover:text-corporate-blue-hover">
              More
              <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-gray-900">16.9%</span>
            <div className="flex items-center text-sm text-corporate-red">
              <span className="font-medium">16.9%</span>
              <TrendingUp className="ml-1 h-3 w-3" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Meet</div>
              <div className="text-xl font-bold text-gray-900">16.9%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Win</div>
              <div className="text-xl font-bold text-gray-900">0%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loss (Violations) */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Loss (Violations)</h3>
            <Button variant="ghost" size="sm" className="text-corporate-blue hover:text-corporate-blue-hover">
              More
              <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-gray-900">83.1%</span>
            <div className="flex items-center text-sm text-corporate-red">
              <span className="font-medium">83.1%</span>
              <TrendingUp className="ml-1 h-3 w-3" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Rate Violations</div>
              <div className="text-xl font-bold text-gray-900">66.4%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Availability Violations</div>
              <div className="text-xl font-bold text-gray-900">16.7%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provisional Loss */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Provisional Loss</h3>
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </div>

          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1">USD</div>
            <span className="text-3xl font-bold text-corporate-red">1186.6K</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Rate Violations</div>
              <div className="text-sm text-gray-500">USD</div>
              <div className="text-lg font-bold text-gray-900">204.1K</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Availability Violations</div>
              <div className="text-sm text-gray-500">USD</div>
              <div className="text-lg font-bold text-gray-900">982.4K</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
