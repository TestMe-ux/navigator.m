"use client"

import React, { useEffect, useState, useCallback, useMemo, use } from "react"
import { addDays, format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"

import { DemandFilterBar } from "@/components/navigator/demand-filter-bar"
import { DemandCalendarOverview } from "@/components/navigator/demand-calendar-overview"
import { EnhancedDemandTrendsChart } from "@/components/navigator/enhanced-demand-trends-chart"
import { DemandHeader } from "@/components/navigator/demand-header"
import { DemandSummaryCards } from "@/components/navigator/demand-summary-cards"
import { MyEventsHolidaysTable } from "@/components/navigator/my-events-holidays-table"
import { useDemandDateContext, DemandDateProvider } from "@/components/demand-date-context"
import { GetDemandAIData, GetDemandAIPerCountryAverageData } from "@/lib/demand"
import { getAllEvents, getAllHoliday } from "@/lib/events"
import localStorageService from "@/lib/localstorage"
import { getRateTrends } from "@/lib/rate"
import { getChannels } from "@/lib/channels"
import { conevrtDateforApi } from "@/lib/utils"
import { useSelectedProperty } from "@/hooks/use-local-storage"

function DemandPageContent() {
  const fmtDate = (d: string) => format(new Date(d), "EEE, dd MMM - yyyy");
  const { startDate, endDate, setDateRange } = useDemandDateContext();
  const [demandAIPerCountryAverageData, setDemandAIPerCountryAverageData] = useState<any>([])
  const [demandData, setDemandData] = useState<any>([])
  const [eventData, setEventData] = useState<any>({});
  const [holidaysData, setHolidays] = useState<any>({});
  const [allEventData, setAllEventData] = useState<any>({});
  const [allHolidaysData, setAllHolidays] = useState<any>({});
  const [selectedProperty] = useSelectedProperty()
  const [avgDemand, setAvgDemand] = useState({ AverageDI: 0, AverageWow: 0, AverageMom: 0, AverageYoy: 0, AvrageHotelADR: 0, AvrageHotelADRWow: 0, AvrageHotelADRMom: 0, AvrageHotelADRYoy: 0, AvrageRevPAR: 0 })
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingCycle, setLoadingCycle] = useState(1)
  const [rateData, setRateData] = useState(Object);
  const [rateCompData, setRateCompData] = useState(Object);
  const [filter, setFilter] = useState<any>("wow");
  const [channelFilter, setChannelFilter] = useState<any>({ channelId: [], channelName: [] });
  // Initialize demand page with Next 15 Days default
  useEffect(() => {
    if (!isInitialized) {
      const today = new Date()
      const fifteenDaysFromNow = addDays(today, 14)
      setDateRange(today, fifteenDaysFromNow)
      setIsInitialized(true)
    }
  }, [setDateRange, isInitialized])

  useEffect(() => {
    if (!startDate || !endDate || !selectedProperty?.sid) return;

    setIsLoading(true);
    setLoadingProgress(0);

    // Progress interval
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        const increment = Math.floor(Math.random() * 9) + 3; // 3-11% increment
        const newProgress = prev + increment;

        if (newProgress >= 100) {
          setLoadingCycle(prevCycle => prevCycle + 1);
          return 0;
        }

        return newProgress;
      });
    }, 80);

    Promise.all([
      getChannelData(),
      getDemandAIPerCountryAverageData(),
      getDemandAIData(),
    ]).finally(() => {
      clearInterval(progressInterval);
      setLoadingProgress(100); // finish instantly
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0); // reset for next load
      }, 300); // brief delay so user sees 100%
    });


  }, [startDate, endDate, selectedProperty?.sid]);
  useEffect(() => {
    if (!startDate ||
      !endDate ||
      !channelFilter?.channelId || channelFilter?.channelId.length === 0) return;
    
    const fetchRateData = async () => {
      setIsLoading(true);
      setLoadingProgress(0);
      
      try {
        await Promise.all([
          getRateDate(),
      getCompRateData()
        ]);
      } finally {
        // Show completion for 300ms before hiding
        setTimeout(() => {
          setIsLoading(false);
          setLoadingProgress(0);
        }, 300);
      }
    };
    
    fetchRateData();
  }, [startDate, endDate, channelFilter]);
  useEffect(() => {
    if (!startDate ||
      !endDate ||
      !channelFilter?.channelId || channelFilter?.channelId.length === 0) return;
    Promise.all([
      getCompRateData()
    ]);
  }, [filter]);
  useEffect(() => {
    if (!selectedProperty?.sid) return;
    Promise.all([
      getAllEventData(),
      getAllHolidayData()
    ]);
  }, [selectedProperty?.sid]);

  const getChannelData = () => {
    return getChannels({ SID: selectedProperty?.sid })
      .then((res) => {
        console.log("Channels", res.body);
        res.body.sort((a: any, b: any) => a.name.localeCompare(b.name))
        const channelList = [...res.body];
        setChannelFilter({ channelId: channelList.map(c => c.cid), channelName: channelList.map(c => c.name) })
      }
      )
  }
  const getDemandAIData = () => {
    return GetDemandAIData({ SID: selectedProperty?.sid, startDate: conevrtDateforApi(startDate?.toString()), endDate: conevrtDateforApi(endDate?.toString()) })
      .then((res) => {
        if (res.status) {
          setDemandData(res.body);
          var demandDatas = res.body.optimaDemand
          let sumDI = 0;
          let sumWow = 0;
          let sumMom = 0;
          let sumYoy = 0;
          let sumHotelADR = 0
          let sumHotelADRWow = 0
          let sumHotelADRMom = 0
          let sumHotelADRYoy = 0
          let RevPAR = 0
          demandDatas.forEach((element: any) => {
            sumDI += Number(element.demandIndex)
            sumWow += Number(element.woW_Overall_Demand_Index)
            sumMom += Number(element.moM_Overall_Demand_Index)
            sumYoy += Number(element.yoY_Overall_Demand_Index)
            sumHotelADR += Number(element.hotelADR)
            sumHotelADRWow += Number(element.woW_Overall_HotelADR)
            sumHotelADRMom += Number(element.moM_Overall_HotelADR)
            sumHotelADRMom += Number(element.moM_Overall_HotelADR)
            sumHotelADRYoy += Number(element.yoY_Overall_HotelADR)
            RevPAR += Number(element.revpar)
          });
          setAvgDemand({
            AverageDI: Math.round(Number((sumDI / demandDatas.length))),
            AverageWow: Math.round(Number((sumWow / demandDatas.length))),
            AverageMom: Math.round(Number((sumMom / demandDatas.length))),
            AverageYoy: Math.round(Number((sumYoy / demandDatas.length))),
            AvrageHotelADR: Math.round(Number((sumHotelADR / demandDatas.length))),
            AvrageHotelADRWow: Math.round(Number((sumHotelADRWow / demandDatas.length))),
            AvrageHotelADRMom: Math.round(Number((sumHotelADRMom / demandDatas.length))),
            AvrageHotelADRYoy: Math.round(Number((sumHotelADRYoy / demandDatas.length))),
            AvrageRevPAR: Math.round(Number((RevPAR / demandDatas.length)))
          });
        }
      })
      .catch((err) => console.error(err));
  }
  const getDemandAIPerCountryAverageData = () => {
    return GetDemandAIPerCountryAverageData({ SID: selectedProperty?.sid, startDate: conevrtDateforApi(startDate?.toString()), endDate: conevrtDateforApi(endDate?.toString()) })
      .then((res) => {
        if (res.status) { 
          setDemandAIPerCountryAverageData(res?.body[0]);
          console.log("GetDemandAIPerCountryAverageData", res?.body[0]);
          // setinclusionValues(res.body.map((inclusion: any) => ({ id: inclusion, label: inclusion })));
        }
      })
      .catch((err) => console.error(err));
  }
  const getAllEventData = () => {
    const today = new Date()
    const endDates = new Date(today)
    endDates.setDate(today.getDate() + 75)
    var payload = {
      "Country": [selectedProperty?.country ?? ''],
      "City": [selectedProperty?.city ?? ''],
      "SID": selectedProperty?.sid,
      "PageNumber": 1,
      "PageCount": 500,
      "StartDate": conevrtDateforApi(today?.toString()),
      "EndDate": conevrtDateforApi(endDates?.toString())
    }
    return getAllEvents(payload)
      .then((res) => {
        if (res.status) {
          res.body.eventDetails.sort((a: any, b: any) => a.rowNum - b.rowNum)
          setAllEventData(res.body);
          const start = startDate ? new Date(startDate) : new Date();
          const end = endDate ? new Date(endDate) : new Date();
          start.setHours(0, 0, 0, 0);
          end.setHours(0, 0, 0, 0);
          const matchingEvents = res.body.eventDetails.filter((event: any) => {
            const from = new Date(event.eventFrom);
            const to = new Date(event.eventTo);

            from.setHours(0, 0, 0, 0);
            to.setHours(0, 0, 0, 0);

            return from <= end && to >= start;
          });
          setEventData(matchingEvents);
          // setinclusionValues(res.body.map((inclusion: any) => ({ id: inclusion, label: inclusion })));
        }
      })
      .catch((err) => console.error(err));
  }
  const getAllHolidayData = () => {
    // var filters = { "Type": [], "Impact": [], "SearchType": "" };
    const today = new Date()
    const endDates = new Date(today)
    endDates.setDate(today.getDate() + 75)
    var payload = {
      "Country": [selectedProperty?.country ?? ''],
      "City": [selectedProperty?.city ?? ''],
      "SID": selectedProperty?.sid,
      "FromDate": conevrtDateforApi(today?.toString()),
      "ToDate": conevrtDateforApi(endDates?.toString()),
      "Type": [],
      "Impact": [],
      "SearchType": ""
    }
    getAllHoliday(payload)
      .then((res) => {
        if (res.status) {
          var holidays = [...res.body[0].holidayDetail]
          const holiday = holidays.map(x =>
          ({
            "eventName": x.holidayName,
            "displayDate": fmtDate(x.holidayDispalyDate),
            "eventType": 'holiday',
            "eventColor": 'Holiday',
            "eventTo": x.holidayDispalyDate,
            "eventFrom": x.holidayDispalyDate,
          })
          )
          const start = startDate ? new Date(startDate) : new Date();
          const end = endDate ? new Date(endDate) : new Date();
          start.setHours(0, 0, 0, 0);
          end.setHours(0, 0, 0, 0);
          const matchingHoliday = holiday.filter((hoy: any) => {
            const from = new Date(hoy.eventFrom);

            from.setHours(0, 0, 0, 0);

            return from <= end && from >= start;
          });
          setAllHolidays(holiday);
          setHolidays(matchingHoliday)
        }
      })
      .catch((err) => console.error(err));
  }

  const getRateDate = () => {
    setRateData(Object);
    var filtersValue = {
      "SID": selectedProperty?.sid,
      "channels": channelFilter.channelId,
      "channelsText": channelFilter.channelName,
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
          var CalulatedData = res.body?.pricePositioningEntites.map((x: any) => {
            const allSubscriberRate = x.subscriberPropertyRate?.map((r: any) => parseInt(r.rate) > 0 ? parseInt(r.rate) : 0) || [];
            const ty = allSubscriberRate.length
              ? allSubscriberRate.reduce((sum: any, rate: any) => sum + rate, 0) / allSubscriberRate.length
              : 0;

            return { ...x, AvgData: ty };
          });
          res.body.pricePositioningEntites = CalulatedData;
           console.log('Rate trends data:', res.body);
          setRateData(res.body);
          // setinclusionValues(res.body.map((inclusion: any) => ({ id: inclusion, label: inclusion })));
        }
      })
      .catch((err) => console.error(err));
  }
  const getCompRateData = () => {
    setRateCompData(Object);
    const selectedComparison = filter === "wow" ? 7 : filter === "mom" ? 30 : filter === "yoy" ? 365 : 7;
    var startDateComp = startDate
      ? new Date(startDate.getTime() + (-selectedComparison * 24 * 60 * 60 * 1000))
      : new Date();
    var endDateComp = endDate
      ? new Date(endDate.getTime() + (-selectedComparison * 24 * 60 * 60 * 1000))
      : new Date();
    var filtersValue = {
      "SID": selectedProperty?.sid,
      "channels": channelFilter.channelId,
      "channelsText": channelFilter.channelName,
      "checkInStartDate": conevrtDateforApi(startDateComp?.toString()),
      "checkInEndDate": conevrtDateforApi(endDateComp?.toString()),
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
          var CalulatedData = res.body?.pricePositioningEntites.map((x: any) => {
            const allSubscriberRate = x.subscriberPropertyRate?.map((r: any) => parseInt(r.rate) > 0 ? parseInt(r.rate) : 0) || [];
            const ty = allSubscriberRate.length
              ? allSubscriberRate.reduce((sum: any, rate: any) => sum + rate, 0) / allSubscriberRate.length
              : 0;

            return { ...x, AvgData: ty };
          });
          res.body.pricePositioningEntites = CalulatedData;
          console.log('Rate trends data Comp:', res.body);
          setRateCompData(res.body);
          // setLosGuest({ "Los": res.body?.losList, "Guest": res.body?.guestList });
          // setinclusionValues(res.body.map((inclusion: any) => ({ id: inclusion, label: inclusion })));
        }
      })
      .catch((err) => console.error(err));
  }
  const handleDemandFiltersChange = (filters: any) => {
    console.log("🔍 Demand filters changed:", filters)
    setFilter(filters);
    // Handle demand filter changes here
  }


  // Show loading state when data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
        <GlobalProgressBar />
        <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8 xl:py-10">
          <div className="max-w-7xl xl:max-w-none mx-auto">
            <LoadingSkeleton type="demand" showCycleCounter={true} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
      {/* Enhanced Demand Filter Bar with Sticky Positioning */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-border/50 shadow-sm transition-shadow duration-200">
        <DemandFilterBar onFiltersChange={handleDemandFiltersChange} />
      </div>

      {/* Professional Header Section */}
      <section className="w-full">
        <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="max-w-7xl xl:max-w-none mx-auto">
            <DemandHeader />
          </div>
        </div>
      </section>

      {/* Demand Calendar Overview - Replaces KPIs */}
      <DemandCalendarOverview eventData={allEventData} holidayData={allHolidaysData} />

      {/* Main Content Area */}
      <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8 xl:py-10">
        <div className="max-w-7xl xl:max-w-none mx-auto space-y-4 md:space-y-6 lg:space-y-8">

          {/* Summary Cards Section */}
          <section className="w-full">
            <DemandSummaryCards filter={filter} avgDemand={avgDemand} demandAIPerCountryAverageData={demandAIPerCountryAverageData} />
          </section>


          {/* Demand Forecast Chart - No Header */}
          <section className="w-full">
            <Card className="card-elevated animate-fade-in">
              <CardContent className="p-3 md:p-4 lg:p-6 xl:p-8">
                <EnhancedDemandTrendsChart filter={filter} events={eventData} demandData={demandData} rateData={rateData} rateCompData={rateCompData} />
              </CardContent>
            </Card>
          </section>

          {/* Events & Holidays Section */}
          <section className="w-full">
            <MyEventsHolidaysTable events={eventData} holidaysData={holidaysData} />
          </section>

        </div>
      </div>


    </div>
  )
}

export default function DemandPage() {
  return (
    <DemandDateProvider>
      <DemandPageContent />
    </DemandDateProvider>
  )
}
