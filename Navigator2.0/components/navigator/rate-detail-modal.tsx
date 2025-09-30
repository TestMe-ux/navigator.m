"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronLeft, ChevronRight, X, Download } from "lucide-react"
import { ModalRankingChart } from "./modal-ranking-chart"

interface RateDetailModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date | null
  onPrevDay: () => void
  onNextDay: () => void
  // TODO: Add props for chart data and filter context
}



export function RateDetailModal({ isOpen, onClose, selectedDate, onPrevDay, onNextDay }: RateDetailModalProps) {
  const [tooltipsEnabled, setTooltipsEnabled] = useState(false)

  // Enable tooltips after modal animation is complete
  useEffect(() => {
    if (isOpen) {
      setTooltipsEnabled(false)
      const timer = setTimeout(() => {
        setTooltipsEnabled(true)
      }, 1000) // Wait 1 second after modal opens
      
      return () => clearTimeout(timer)
    } else {
      setTooltipsEnabled(false)
    }
  }, [isOpen])

  if (!isOpen || !selectedDate) {
    return null
  }

  const formattedDate = `${selectedDate.getDate()} ${selectedDate.toLocaleDateString("en-US", {
    month: "short"
  })} ${selectedDate.getFullYear()}`
  
  const dayName = selectedDate.toLocaleDateString("en-US", {
    weekday: "short",
  })

  return (
    <TooltipProvider delayDuration={500} skipDelayDuration={100}>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className="!w-[950px] !max-w-[950px] flex flex-col p-0 overflow-hidden"
          style={{ height: '550px', maxHeight: '550px', minHeight: '550px' }}
        >
        <DialogHeader className="p-6 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-lg font-semibold">
                Rate Evolution
              </DialogTitle>
              <div className="flex items-center gap-0.5 ml-4">
                {tooltipsEnabled ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={onPrevDay}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-black text-white text-xs px-3 py-2" sideOffset={5}>
                      Previous Check-in Date
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button variant="ghost" size="icon" onClick={onPrevDay}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                <span className="text-base font-semibold text-black dark:text-white px-0.5">
                  {formattedDate}, {dayName}
                </span>
                {tooltipsEnabled ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={onNextDay}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-black text-white text-xs px-3 py-2" sideOffset={5}>
                      Next Check-in Date
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button variant="ghost" size="icon" onClick={onNextDay}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download CSV
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-5 w-5" />
                </Button>
              </DialogClose>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            View rate trends across different lead times for selected <span className="font-semibold">Check-in Date</span>
          </div>
        </DialogHeader>

        <ModalRankingChart selectedDate={selectedDate} numberOfDays={15} />
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
