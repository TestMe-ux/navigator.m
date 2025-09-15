"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

export function ScheduledReportsHeader() {
  
  return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">

        {/* Left Section - Title & Description */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">
              Scheduled Reports
            </h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-sm bg-slate-800 text-white border-slate-700">
                <p className="text-sm">
                  Comprehensive reports dashboard for viewing, managing, and downloading generated reports including scheduled, on-demand, and historical report data.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground">
            View and manage all generated reports with download capabilities
          </p>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* No actions currently */}
        </div>
      </div>
  )
}
