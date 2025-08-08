"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Download, Info } from "lucide-react"

export function DemandHeader() {
  return (
    <TooltipProvider>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
        
        {/* Left Section - Title & Description */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Demand Analysis</h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-sm bg-slate-800 text-white border-slate-700">
                <p className="text-sm">
                  Comprehensive analysis of market demand patterns, competitor pricing strategies, and forecasting models to optimize revenue management and pricing decisions.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground">
            Market demand insights with competitive intelligence and forecasting
          </p>
        </div>

        {/* Right Section - Export Only */}
        <div className="flex items-center gap-2">
          {/* Export Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-black">
                  <p>Download</p>
                </TooltipContent>
              </Tooltip>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export Chart as PNG</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  )
}
