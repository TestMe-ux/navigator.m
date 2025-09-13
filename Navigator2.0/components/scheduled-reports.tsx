"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

// Mock data for scheduled reports based on the image
const scheduledReportsData = [
  {
    id: "1",
    name: "Chaidee Mansion occ 2",
    deliveryDetail: "Few Days in a week(Mo,Tu,We,Th,Fr)",
    rrdPerReport: "3600",
    totalRrds: "2754000",
    status: "Active"
  },
  {
    id: "2", 
    name: "Chaidee Mansion",
    deliveryDetail: "Few Days in a week(We)",
    rrdPerReport: "176",
    totalRrds: "19888",
    status: "Active"
  },
  {
    id: "3",
    name: "Chaidee Mansion",
    deliveryDetail: "Few Days in a week(We)",
    rrdPerReport: "176", 
    totalRrds: "15664",
    status: "Active"
  },
  {
    id: "4",
    name: "Chaidee Mansion",
    deliveryDetail: "Few Days in a week(Mo,Tu,We,Th,Fr)",
    rrdPerReport: "1100",
    totalRrds: "332200",
    status: "Active"
  },
  {
    id: "5",
    name: "001",
    deliveryDetail: "Few Days in a week(Mo,Tu,We,Th,Fr,Sa)",
    rrdPerReport: "1440",
    totalRrds: "498240", 
    status: "Active"
  }
]

interface ScheduledReportsProps {
  onBackToAllReports: () => void
}

export function ScheduledReports({ onBackToAllReports }: ScheduledReportsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            onClick={onBackToAllReports}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            All Reports
          </Button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Schedules: 5 Listed
          </h1>
        </div>
      </div>

      {/* Scheduled Reports Table */}
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Table Header */}
              <div className="grid grid-cols-12 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-300 items-start">
                <div className="col-span-2">Names</div>
                <div className="col-span-3">Delivery Detail</div>
                <div className="col-span-2">RRD Per Report</div>
                <div className="col-span-2">Total RRDs</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Action</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {scheduledReportsData.map((report) => (
                  <div 
                    key={report.id}
                    className="grid grid-cols-12 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 items-center"
                  >
                    {/* Names */}
                    <div className="col-span-2">
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline">
                        {report.name}
                      </span>
                    </div>

                    {/* Delivery Detail */}
                    <div className="col-span-3">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {report.deliveryDetail}
                      </span>
                    </div>

                    {/* RRD Per Report */}
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {report.rrdPerReport}
                      </span>
                    </div>

                    {/* Total RRDs */}
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {report.totalRrds}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {report.status}
                      </span>
                    </div>

                    {/* Action */}
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        •••
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
