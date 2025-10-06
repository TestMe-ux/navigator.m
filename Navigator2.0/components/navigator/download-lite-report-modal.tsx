"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { CustomDatePicker } from "./custom-date-picker"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { format, addYears, isAfter, isBefore, startOfDay } from "date-fns"
import { PPExcelDownload } from "@/lib/rate"
import { useToast } from "@/hooks/use-toast"
import { DateProvider, useDateContext } from "@/components/date-context"

interface DownloadLiteReportModalProps {
  isOpen: boolean
  onClose: () => void
  objForExcel?: any
}

export function DownloadLiteReportModal({ isOpen, onClose, objForExcel = {} }: DownloadLiteReportModalProps) {
  const [minStartDate, setMinStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [maxEndDate, setMaxEndDate] = useState(format(addYears(new Date(), 1), 'yyyy-MM-dd'))
  const [selectedProperty] = useSelectedProperty()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { startDate, endDate } = useDateContext()

  // Get today's date and max date (1 year from today)
  const today = new Date()
  const maxDate = addYears(today, 1)
  const todayString = format(today, 'yyyy-MM-dd')
  const maxDateString = format(maxDate, 'yyyy-MM-dd')

  // Reset dates when modal opens
  useEffect(() => {
    if (isOpen) {
      setMinStartDate(startDate ? format(startDate, 'yyyy-MM-dd') : todayString)
      setMaxEndDate(endDate ? format(endDate, 'yyyy-MM-dd') : maxDateString)
    }
  }, [isOpen, todayString, maxDateString, startDate, endDate])

  const handleSave = async () => {
    try {
      setIsLoading(true)
      debugger;
      if (objForExcel?.LOS == null) {
        toast({
          description: "Please select a single LOS configuration for downloading the ‘Lite Report’.",
          variant: "destructive",
          duration: 3000,
        })
        return false;
      }
      // Validate dates
      const startDateObj = startOfDay(new Date(minStartDate))
      const endDateObj = startOfDay(new Date(maxEndDate))
      const todayStart = startOfDay(new Date())
      if (isBefore(startDateObj, todayStart)) {
        toast({
          description: "Start date cannot be before today's date.",
          variant: "destructive",
          duration: 3000,
        })
        return
      }

      if (isAfter(endDateObj, addYears(todayStart, 1))) {
        toast({
          description: "End date cannot be more than 1 year from today.",
          variant: "destructive",
          duration: 3000,
        })
        return
      }

      if (isAfter(startDateObj, endDateObj)) {
        toast({
          description: "Start date cannot be after end date.",
          variant: "destructive",
          duration: 3000,
        })
        return
      }

      // Prepare filter data for PPExcelDownload
      const filterData = {
        SID: selectedProperty?.sid,
        reqDateTime: format(new Date(), "MM/dd/yyyy"),
        excelType: 'LiteRate'
      }

      // Prepare objForExcel with the selected dates
      const excelData = {
        ...objForExcel,
        checkInStartDate: startDate,
        checkInEndDate: endDate,
        mSIRequired: true
      }

      // Call PPExcelDownload
      const response = await PPExcelDownload(filterData, excelData)

      if (response.status) {
        // Create download link
        const element = document.createElement('a')
        element.setAttribute('href', response.body)
        element.style.display = 'none'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)

        toast({
          description: "Lite Report download started successfully.",
          variant: "default",
          duration: 3000,
        })

        onClose()
      } else {
        toast({
          description: "There is some issue in downloading the report. Please contact help@rategain.com",
          variant: "destructive",
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Error downloading lite report:', error)
      toast({
        description: "An error occurred while downloading the report. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="pb-2">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Download Lite Report
          </DialogTitle>

          {/* Light Blue Banner */}
          <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-lg mt-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Select date range for downloading the Lite Report
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-6">
            {/* Start Date */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <CustomDatePicker
                value={minStartDate}
                onChange={setMinStartDate}
                placeholder="Select start date"
                className="w-full"
                minDate={todayString}
                maxDate={maxDateString}
              />
              {/* <p className="text-xs text-gray-500 dark:text-gray-400">
                Minimum: Today
              </p> */}
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                End Date <span className="text-red-500">*</span>
              </Label>
              <CustomDatePicker
                value={maxEndDate}
                onChange={setMaxEndDate}
                placeholder="Select end date"
                className="w-full"
                minDate={minStartDate}
                maxDate={maxDateString}
              />
              {/* <p className="text-xs text-gray-500 dark:text-gray-400">
                Maximum: 1 year from today
              </p> */}
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-white hover:bg-gray-50 dark:hover:bg-gray-50 border-gray-300 dark:border-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {isLoading ? "Downloading..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
