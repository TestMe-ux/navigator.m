"use client"

import React, { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { CustomDatePicker } from "./custom-date-picker"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { getRTRRChannel } from "@/lib/reports"
import { format } from "date-fns"

interface LightningRefreshModalProps {
  isOpen: boolean
  onClose: () => void
  onRefresh?: (data: { selectedChannel: string; channels: string; checkInStartDate: string; compSet: string; guests: string; los: string }) => void
}

export function LightningRefreshModal({ isOpen, onClose, onRefresh }: LightningRefreshModalProps) {
  const [channels, setChannels] = useState<any[]>([])
  const [checkInStartDate, setCheckInStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [compSet, setCompSet] = useState("primary")
  const [channel, setChannel] = useState("");
  const [guests, setGuests] = useState("2")
  const [los, setLos] = useState("1")
  const [selectedProperty] = useSelectedProperty();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedProperty?.sid) return;

    const fetchChannels = async () => {
      try {
        const response: any = await getRTRRChannel({
          SID: selectedProperty.sid,
          isMetaSite: true,
          bForceFresh: false,
        });

        if (response?.status) {
          setChannels(response.body || []);
          setChannel(response.body[0].cname)
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true); // Start loading before fetch
    fetchChannels();

  }, [selectedProperty?.sid]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900">
        <style jsx>{`
          .select-item-no-tick [data-state="checked"] [data-radix-select-item-indicator] {
            display: none !important;
          }
        `}</style>
        <DialogHeader className="pb-2">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Lightning Refresh
          </DialogTitle>

          {/* Light Blue Banner - Reduced height */}
          <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-lg mt-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Refresh rates for 30 days from selected Check-In Start Date
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Channels */}
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Channels <span className="text-red-500">*</span>
                </Label>
                <Select value={channels?.length > 0 && channels[0].cname.toLowerCase()} onValueChange={setChannel} >
                  <SelectTrigger className="w-full h-10 bg-white dark:bg-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto select-item-no-tick">

                    {channels?.length > 0 && channels.map((site: any) => (
                      <SelectItem key={site.cid} value={site.cname.toLowerCase()} className="data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-900 data-[state=checked]:font-medium">
                        {site.cname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* CompSet */}
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2.5">
                  CompSet
                </Label>
                <RadioGroup value={compSet} onValueChange={setCompSet} className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="primary" id="primary" />
                    <Label htmlFor="primary" className="text-xs text-gray-700 dark:text-gray-300">
                      Primary (3)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="secondary" id="secondary" />
                    <Label htmlFor="secondary" className="text-xs text-gray-700 dark:text-gray-300">
                      Secondary
                    </Label>
                  </div>
                </RadioGroup>
              </div>

            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Check-in Start Date */}
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Check-in Start Date <span className="text-red-500">*</span>
                </Label>
                <CustomDatePicker
                  value={checkInStartDate}
                  onChange={setCheckInStartDate}
                  placeholder="Select start date"
                  className="w-full"
                />
              </div>

              {/* Guests and LOS - Parallel Layout */}
              <div className="grid grid-cols-2 gap-4">
                {/* Guests */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Guests <span className="text-red-500">*</span>
                  </Label>
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger className="w-full h-10 bg-white dark:bg-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* LOS */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    LOS <span className="text-red-500">*</span>
                  </Label>
                  <Select value={los} onValueChange={setLos}>
                    <SelectTrigger className="w-full h-10 bg-white dark:bg-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
            className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-white hover:bg-gray-50 dark:hover:bg-gray-50 border-gray-300 dark:border-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              const refreshData = {
                selectedChannel:channel,
                checkInStartDate,
                compSet,
                guests,
                los,
                channels
              }
              console.log('Lightning Refresh clicked', refreshData)

              // Call the onRefresh callback if provided
              if (onRefresh) {
                onRefresh(refreshData)
              }

              onClose()
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Refresh
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
