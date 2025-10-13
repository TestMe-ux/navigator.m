"use client"

import { useState, useEffect } from "react"
import { Target, BarChart3, TrendingUp, Calendar, Globe, ChevronDown } from "lucide-react"
import { BusinessInsightsTabs } from "@/components/business-insights/business-insights-tabs"
import { BusinessInsightsTable } from "@/components/business-insights/business-insights-table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EnhancedDatePicker } from "@/components/enhanced-date-picker"
import { cn } from "@/lib/utils"
import { getChannels } from "@/lib/channels"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GetDemandAIData } from "@/lib/demand"
import { GetOTARankTrendsOnSelectedOTA } from "@/lib/otarank"
import { conevrtDateforApi } from "@/lib/utils"
import { getAllHoliday, getAllSubscribeEventsforMarketEdge } from "@/lib/events"
import { GetParityData } from "@/lib/parity"
import { getRateTrends } from "@/lib/rate"
import { addDays } from "date-fns"

// Business Insights Tab Configuration
const businessInsightsTabs = [
  { id: "market-insights", label: "Market Insights", icon: Target },
  { id: "rate-leaderboard", label: "Rate Leaderboard", icon: BarChart3 },
  { id: "rate-volatility", label: "Rate Volatility", icon: TrendingUp }
]

export default function BusinessInsightsPage() {
  const [activeTab, setActiveTab] = useState("market-insights")
  const [selectedProperty] = useSelectedProperty()

  // Filter states
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 6)) // 14 days from now
  const [selectedChannels, setSelectedChannels] = useState<number[]>([]) // Default to "All Channels"
  const [channelFilter, setChannelFilter] = useState<string[]>([]) // Default to "All Channels"

  // Channel data states
  const [availableChannels, setAvailableChannels] = useState<any[]>([])
  const [isLoadingChannels, setIsLoadingChannels] = useState(false)
  const [channelsError, setChannelsError] = useState<string | null>(null)

  // API data states
  const [demandData, setDemandData] = useState<any>(null)
  const [otaRankData, setOtaRankData] = useState<any>(null)
  const [eventData, setEventData] = useState<any>(null)
  const [holidayData, setHolidayData] = useState<any>(null)
  const [parityData, setParityData] = useState<any>(null)
  const [rateData, setRateData] = useState<any>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  // const [dataError, setDataError] = useState<string | null>(null)

  // Fetch channels from API
  useEffect(() => {
    const fetchChannels = async () => {
      if (!selectedProperty?.sid) {
        // Use fallback channels if no property selected
        // setAvailableChannels(fallbackChannels)
        return
      }

      setIsLoadingChannels(true)
      setChannelsError(null)

      try {
        const response = await getChannels({ SID: selectedProperty.sid })

        if (response.status && response.body && response.body.length > 0) {
          // Convert API response to consistent format and add "All Channels" option
          const apiChannels = response.body.map((channel: any) => ({
            ...channel,
            channelId: channel.channelId || channel.cid,
            channelName: channel.channelName || channel.name
          }))

          // Add "All Channels" option at the beginning
          const channelsWithAll = [
            { cid: -1, name: "All Channels", channelId: -1, channelName: "All Channels", isActive: true },
            ...apiChannels
          ]

          setAvailableChannels(channelsWithAll)
          setSelectedChannels([-1, ...apiChannels.map((x: any) => x.cid)])
          console.log(`📋 Loaded ${channelsWithAll.length} channels for Business Insights`)
        } else {

          console.log('📋 Using fallback channels - API returned empty response')
        }
      } catch (error) {
        console.error('Failed to fetch channels:', error)
        setChannelsError('Failed to load channels')
        // Use fallback channels if API fails
        console.log('📋 Using fallback channels due to API error')
      } finally {
        setIsLoadingChannels(false)
      }
    }

    fetchChannels()
  }, [selectedProperty?.sid])

  // Fetch demand and OTA rank data in parallel
  useEffect(() => {
    const fetchBusinessInsightsData = async () => {
      if (!selectedProperty?.sid || !startDate || !endDate || selectedChannels.length === 0) {
        return
      }

      setIsLoadingData(true)
      // setDataError(null)

      try {
        // Prepare payload for both APIs
        const convertedStartDate = conevrtDateforApi(startDate.toString());
        const convertedEndDate = conevrtDateforApi(endDate.toString())
        let filtersEvents = {
          EventType: '',
          Country: [selectedProperty?.country],
          City: [],
          SID: selectedProperty.sid,
          Distance: 100,
          PageNumber: 1,
          PageCount: 500,
          StartDate: convertedStartDate,
          EndDate: convertedEndDate,
        };
        let filtersHoliday = {
          SID: selectedProperty?.sid,
          Country: [selectedProperty?.country],
          Type: [],
          Impact: [],
          FromDate: convertedStartDate,
          ToDate: convertedEndDate,
          SearchType: '',
        };
        let filterParity = {
          sid: selectedProperty?.sid,
          checkInStartDate: convertedStartDate,
          checkInEndDate: convertedEndDate,
          los: null,
          channelName: selectedChannels,
          guest: null,
          promotion: '',
          qualification: '',
          restriction: '',
          taxPrefrence: ''
        }
        // Make parallel API calls
        const [demandResponse, otaRankResponse, eventResponse, holidayResponse, parityResponse] = await Promise.all([
          GetDemandAIData({
            SID: selectedProperty.sid,
            startDate: convertedStartDate,
            endDate: convertedEndDate
          }),
          GetOTARankTrendsOnSelectedOTA({
            SID: selectedProperty.sid,
            CheckInDateStart: convertedStartDate,
            CheckInEndDate: convertedEndDate
          }),
          getAllSubscribeEventsforMarketEdge(filtersEvents),
          getAllHoliday(filtersHoliday),
          GetParityData(filterParity)
        ])

        // Process demand data
        if (demandResponse.status && demandResponse.body) {
          setDemandData(demandResponse.body?.optimaDemand)
          console.log('📊 Demand data loaded for Business Insights:', demandResponse.body)
        } else {
          console.warn('⚠️ Demand API returned no data')
        }

        // Process OTA rank data
        if (otaRankResponse.status && otaRankResponse.body) {
          setOtaRankData(otaRankResponse.body.flatMap((x: any) => x.trendDataPerCheckin))
          console.log('📈 OTA Rank data loaded for Business Insights:', otaRankResponse.body)
        } else {
          console.warn('⚠️ OTA Rank API returned no data')
        }
        if (eventResponse.status && eventResponse.body) {
          setEventData(eventResponse.body.eventDetails.filter((x: any) => x.isSubscribed));
        }
        if (holidayResponse.status && holidayResponse.body) {
          setHolidayData(holidayResponse.body[0].holidayDetail.filter((x: any) => x.isSubscribe));
        }
        if (parityResponse.status && parityResponse.body) {
          setParityData(parityResponse.body?.otaViolationChannelRate);
        }
      } catch (error) {
        console.error('Failed to fetch business insights data:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchBusinessInsightsData()
  }, [selectedProperty?.sid, startDate, endDate, selectedChannels])
  useEffect(() => {
    if (!selectedProperty?.sid || !startDate || !endDate) return
    const getRateDate = () => {
      const filtersValue = {
        "SID": selectedProperty?.sid,
        "channels": selectedChannels,
        "channelsText": channelFilter,
        "checkInStartDate": conevrtDateforApi(startDate?.toString()),
        "checkInEndDate": conevrtDateforApi(endDate?.toString()),
        "LOS": null,
        "guest": null,
        "productTypeID": null,
        "productTypeIDText": "All",
        "inclusionID": [],
        "inclusionIDText": ["All"],
        "properties": [],
        "restriction": null,
        "qualification": null,
        "promotion": null,
        "restrictionText": "All",
        "promotionText": "All",
        "qualificationText": "All",
        "subscriberPropertyID": selectedProperty?.hmid,
        "subscriberName": selectedProperty?.name,
        "mSIRequired": false,
        "benchmarkRequired": true,
        "compsetRatesRequired": true,
        "propertiesText": [],
        "isSecondary": false,
      }
      getRateTrends(filtersValue)
        .then((res) => {
          if (res.status) {
            setRateData(res.body);
          }
        })
        .catch((err) => console.error(err));
    }
    getRateDate();
  }, [selectedProperty?.sid, startDate, endDate, channelFilter])
  // Date range handler
  const handleDateRangeChange = (newStartDate?: Date, newEndDate?: Date) => {
    if (newStartDate && newEndDate) {
      setStartDate(newStartDate)
      setEndDate(newEndDate)
      console.log(`📅 Business Insights date range changed: ${newStartDate.toLocaleDateString()} - ${newEndDate.toLocaleDateString()}`)
    }
  }

  // Channel selection handler with improved logic
  const handleChannelSelect = (channelId: number) => {
    setSelectedChannels(prev => {
      const isSelected = prev.includes(channelId)
      let newSelection: number[]

      if (channelId === -1) {
        // If selecting "All Channels", select all channels except the "All Channels" item itself
        if (isSelected) {
          // If "All Channels" is selected, clear all selections
          newSelection = []
        } else {
          // Select all channels except "All Channels" item
          const allChannelIds = availableChannels
            .filter(ch => ch.cid !== -1)
            .map(ch => ch.cid)
          newSelection = allChannelIds
        }
      } else {
        // If selecting a specific channel
        if (isSelected) {
          // Remove the channel
          newSelection = prev.filter(c => c !== channelId && c !== -1)
        } else {
          // Add the channel and remove "All Channels" if present
          const filteredSelection = prev.filter(c => c !== -1)
          newSelection = [...filteredSelection, channelId]
        }
      }

      // If all channels are selected, show as "All Channels"
      if (newSelection.length === availableChannels.length - 1) {
        newSelection = availableChannels.map(x => x.cid);
      }

      console.log(`📋 Channel selection changed: ${newSelection.join(", ")}`)
      return newSelection
    })
  }

  // Get display text for channel button
  const getChannelDisplayText = () => {
    if (selectedChannels.length === 0 || selectedChannels.includes(-1)) {
      return "All Channels"
    } else if (selectedChannels.length === 1) {
      const channel = availableChannels.find(c => c.cid === selectedChannels[0])
      return channel ? channel.name : "Select Channels"
    } else {
      return `${selectedChannels.length} Channels`
    }
  }
  const onOpenChangeSelect = (open: any) => {
    if (!open) {
      const channelNames = availableChannels
        .filter(x => selectedChannels.includes(x.cid))
        .map(x => x.name);
      // Reset channel filter when dropdown closes
      // setChannelFilter(channelNames)
      setChannelFilter(prev => {
        const isSame =
          prev.length === channelNames.length &&
          prev.every(name => channelNames.includes(name));

        return isSame ? prev : channelNames;
      });

    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* Business Insights Tabs Section - Below Navigation */}
      {/* <div className="relative z-10">
        <BusinessInsightsTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          businessInsightsTabs={businessInsightsTabs}
        />
      </div> */}

      {/* Filter Bar - Below Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="max-w-7xl xl:max-w-none mx-auto">
            <div className="flex items-center gap-4 py-4">
              {/* Check-in Date Range Picker */}
              <div className="shrink-0">
                <EnhancedDatePicker
                  startDate={startDate}
                  endDate={endDate}
                  onChange={handleDateRangeChange}
                />
              </div>

              {/* Channels Filter */}
              <div className="shrink-0">
                <DropdownMenu onOpenChange={(event) => onOpenChangeSelect(event)}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                    >
                      <Globe className="w-4 h-4 shrink-0" />
                      <span className="font-semibold">
                        {getChannelDisplayText()}
                      </span>
                      <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-auto p-0 shadow-xl border-slate-200 dark:border-slate-700 z-[60]" >
                    <div className="flex">
                      <div className="w-56 p-4">
                        <h4 className="font-semibold text-sm text-gray-700 mb-3">Channels</h4>
                        {isLoadingChannels ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="text-sm text-gray-500">Loading channels...</div>
                          </div>
                        ) : channelsError ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="text-sm text-red-500">{channelsError}</div>
                          </div>
                        ) : (
                          <ScrollArea className={cn(
                            "max-h-68 overflow-hidden",
                            availableChannels.length > 8 ? "h-64" : "h-auto"
                          )}>
                            <div className="space-y-1 pr-4">
                              {availableChannels.map((option) => (
                                <label
                                  key={option.cid}
                                  className="py-2 px-3 transition-colors rounded-sm flex items-center hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-0 focus:outline-none mr-3 cursor-pointer"
                                    checked={selectedChannels.includes(option.cid)}
                                    onChange={() => handleChannelSelect(option.cid)}
                                  />
                                  <span className="font-medium text-sm flex-1">
                                    {option.name || option.channelName}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10">
        <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-2 md:py-4 lg:py-6 max-w-7xl xl:max-w-none mx-auto">
          {/* Business Insights Table */}
          <BusinessInsightsTable
            startDate={startDate}
            endDate={endDate}
            selectedChannels={selectedChannels}
            channelFilter={channelFilter}
            demandData={demandData}
            otaRankData={otaRankData}
            eventData={eventData}
            holidayData={holidayData}
            parityData={parityData}
            rateData={rateData}
            isLoadingData={isLoadingData}
          />
        </div>
      </main>

    </div>
  )
}

