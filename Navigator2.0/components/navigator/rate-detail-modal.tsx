"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronLeft, ChevronRight, X, Download } from "lucide-react"
import { ModalRankingChart } from "./modal-ranking-chart"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { getRateEvalutionData } from "@/lib/parity"
import { conevrtDateforApi } from "@/lib/utils"
import { useComparison } from "../comparison-context"
import { format, parseISO } from "date-fns"

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
  const [selectedProperty] = useSelectedProperty();
  const { channelFilter, compsetFilter, sideFilter } = useComparison()
  const [paceData, setPaceData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])

  // CSV Download function
  const handleDownloadCSV = () => {
    if (!paceData || paceData.length === 0) {
      console.log("No data available for download")
      return
    }

    // Transform data for CSV - only include selected properties
    const transformedData: any[] = []
    
    paceData.forEach((pc: any) => {
      const shopDate = pc.shopDateTime
      const avgComRate = pc.avgComRate
      
      if (pc.competitivenessEntity) {
        let csvRow: any = {
          Date: format(parseISO(shopDate), "yyyy-MM-dd")
        }
        
        pc.competitivenessEntity.priceCompetitivenessRates.forEach((pcr: any) => {
          // Only include properties that are selected in the chart
          if (selectedProperties.includes(pcr.propertName)) {
            if (pcr.isSubscriber) {
              csvRow[pcr.propertName] = pcr.rate > 0 ? pcr.rate : pcr.status
            } else if (pcr.propertyID != -1 && pcr.isSubscriber == false) {
              csvRow[pcr.propertName] = pcr.rate > 0 ? pcr.rate : pcr.status
            }
          }
        })

        // Add avg compset if it's selected
        if (selectedProperties.includes("Avg. Compset")) {
          csvRow["Avg. Compset"] = avgComRate > 0 ? avgComRate : "N/A"
        }

        transformedData.push(csvRow)
      }
    })

    // Generate CSV content
    if (transformedData.length === 0) {
      console.log("No transformed data available")
      return
    }

    // Get all unique column names
    const allColumns = new Set<string>()
    transformedData.forEach(row => {
      Object.keys(row).forEach(key => allColumns.add(key))
    })

    const headers = Array.from(allColumns)
    const rows = transformedData.map(row => 
      headers.map(header => {
        const value = row[header] || ""
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value
      })
    )

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `Rate_Evolution_${selectedProperty?.name || 'Data'}_${format(new Date(), 'yyyyMMddHHmmss')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Handle selected properties change from chart
  const handleSelectedPropertiesChange = useCallback((properties: string[]) => {
    setSelectedProperties(properties)
  }, [])
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
  useEffect(() => {
    debugger
    if (!selectedProperty?.sid || !selectedDate) return;
    let filtersValue = {
      "LOS": sideFilter?.lengthOfStay?.toString() || null,
      "guest": sideFilter?.guest?.toString() || null,
      "productTypeID": sideFilter?.roomTypes || null,
      "inclusionID": sideFilter?.inclusions || [],
      "properties": [],
      "channels": (channelFilter?.channelId?.length ?? 0) > 0 ? channelFilter.channelId : [-1],
      "restriction": sideFilter?.rateViewBy?.Restriction,
      "qualification": sideFilter?.rateViewBy?.Qualification,
      "promotion": sideFilter?.rateViewBy?.Promotion,
      "checkInStartDate": conevrtDateforApi(selectedDate?.toString()),
      "checkInEndDate": conevrtDateforApi(selectedDate?.toString()),
      "SID": selectedProperty?.sid,
      "mSIRequired": false,
      "benchmarkRequired": true,
      "compsetRatesRequired": true,
      "subscriberPropertyID": selectedProperty?.hmid,
      "isSecondary": compsetFilter,
      "restrictionText": sideFilter?.rateViewBy?.RestrictionText || "All",
      "promotionText": sideFilter?.rateViewBy?.PromotionText || "All",
      "QualificationText": sideFilter?.rateViewBy?.QualificationText || "All"
    }
    const fetechBRGCalculationSetting = async () => {
      try {
        setIsLoading(true);
        const response: any = await getRateEvalutionData(filtersValue);
        if (response?.status) {
          console.log(response?.body[0].paceViewEntityList);
          setPaceData(response?.body[0].paceViewEntityList || []);
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (isOpen) {

      fetechBRGCalculationSetting();
    }
  }, [selectedDate])

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
          className="!w-[950px] !max-w-[950px] flex flex-col p-0 overflow-hidden z-[999]"
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
                <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
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

          <ModalRankingChart 
            selectedDate={selectedDate} 
            numberOfDays={15} 
            paceData={paceData} 
            isLoading={isLoading}
            onSelectedPropertiesChange={handleSelectedPropertiesChange}
          />
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
