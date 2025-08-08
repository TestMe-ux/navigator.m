"use client"

import React, { useEffect, useState } from "react"
import { CardDescription } from "@/components/ui/card"

import { DemandFilterBar } from "@/components/navigator/demand-filter-bar"
import { DemandCalendarOverview } from "@/components/navigator/demand-calendar-overview"
import { EnhancedDemandTrendsChart } from "@/components/navigator/enhanced-demand-trends-chart"
import { DemandHeader } from "@/components/navigator/demand-header"
import { DemandSummaryCards } from "@/components/navigator/demand-summary-cards"
import { MyEventsHolidaysTable } from "@/components/navigator/my-events-holidays-table"


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Calendar, BarChart3, Activity, Users, Target, Globe, Zap } from "lucide-react"
import { useDateContext } from "@/components/date-context"
import { GetDemandAIData, GetDemandAIPerCountryAverageData } from "@/lib/demand"
import { getAllEvents } from "@/lib/events"
import localStorageService from "@/lib/localstorage"

export default function DemandPage() {
  const { startDate, endDate } = useDateContext();
  const [demandAIPerCountryAverageData, setDemandAIPerCountryAverageData] = useState<any>([])
  const [demandData, setDemandData] = useState<any>([])
  const [eventData, setEventData] = useState<any>({});
  const selectedProperty:any = localStorageService.get('SelectedProperty')
  const [avgDemand, setAvgDemand] = useState({ AverageDI: 0, AverageWow: 0, AverageMom: 0, AvrageHotelADR: 0, AvrageHotelADRWow: 0, AvrageHotelADRMom: 0 })
  useEffect(() => {
    if (!startDate || !endDate) return;
    Promise.all([
      getDemandAIPerCountryAverageData(),
      getDemandAIData(),
      getAllEventData(),
    ]);

  }, [startDate, endDate, selectedProperty?.sid]);
  const getDemandAIData = () => {
    GetDemandAIData({ SID: selectedProperty?.sid, startDate: startDate?.toISOString().split('T')[0], endDate: endDate?.toISOString().split('T')[0] })
      .then((res) => {
        if (res.status) {
          debugger;
          setDemandData(res.body);
          var demandDatas = res.body.optimaDemand
          let sumDI = 0;
          let sumWow = 0;
          let sumMom = 0;
          let sumHotelADR = 0
          let sumHotelADRWow = 0
          let sumHotelADRMom = 0
          demandDatas.forEach((element: any) => {
            sumDI += Number(element.demandIndex)
            sumWow += Number(element.woW_Overall_Demand_Index)
            sumMom += Number(element.moM_Overall_Demand_Index)
            sumHotelADR += Number(element.hotelADR)
            sumHotelADRWow += Number(element.woW_Overall_HotelADR)
            sumHotelADRMom += Number(element.moM_Overall_HotelADR)
          });
          setAvgDemand({
            AverageDI: Math.round(Number((sumDI / demandDatas.length))),
            AverageWow: Math.round(Number((sumWow / demandDatas.length))),
            AverageMom: Math.round(Number((sumMom / demandDatas.length))),
            AvrageHotelADR: Math.round(Number((sumHotelADR / demandDatas.length))),
            AvrageHotelADRWow: Math.round(Number((sumHotelADRWow / demandDatas.length))),
            AvrageHotelADRMom: Math.round(Number((sumHotelADRMom / demandDatas.length)))
          });
        }
      })
      .catch((err) => console.error(err));
  }
  const getDemandAIPerCountryAverageData = () => {
    GetDemandAIPerCountryAverageData({ SID: selectedProperty?.sid, startDate: startDate?.toISOString().split('T')[0], endDate: endDate?.toISOString().split('T')[0] })
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
    var payload = {
      "Country": [selectedProperty?.country ?? ''],
      "City": [selectedProperty?.city ?? ''],
      "SID": selectedProperty?.sid,
      "PageNumber": 1,
      "PageCount": 10,
      "StartDate": startDate?.toISOString().split('T')[0],
      "EndDate": endDate?.toISOString().split('T')[0]
    }
    getAllEvents(payload)
      .then((res) => {
        if (res.status) {
          res.body.eventDetails.sort((a: any, b: any) => a.rowNum - b.rowNum)
          setEventData(res.body);
          // setinclusionValues(res.body.map((inclusion: any) => ({ id: inclusion, label: inclusion })));
        }
      })
      .catch((err) => console.error(err));
  }

  const handleDemandFiltersChange = (filters: any) => {
    console.log("🔍 Demand filters changed:", filters)
    // Handle demand filter changes here
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
      {/* Enhanced Demand Filter Bar with Sticky Positioning */}
      <div className="sticky top-0 z-50 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-border/50 shadow-sm transition-all duration-200 min-h-[80px]">
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
      <DemandCalendarOverview />

      {/* Main Content Area */}
      <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8 xl:py-10">
        <div className="max-w-7xl xl:max-w-none mx-auto space-y-4 md:space-y-6 lg:space-y-8">

          {/* Summary Cards Section */}
          <section className="w-full">
            <DemandSummaryCards  avgDemand={avgDemand} demandAIPerCountryAverageData={demandAIPerCountryAverageData}/>
          </section>


          {/* Demand Forecast Chart - No Header */}
          <section className="w-full">
            <Card className="card-elevated animate-fade-in">
              <CardContent className="p-3 md:p-4 lg:p-6 xl:p-8">
                <EnhancedDemandTrendsChart events={eventData} demandData={demandData}/>
              </CardContent>
            </Card>
          </section>

          {/* Events & Holidays Section */}
          <section className="w-full">
            <MyEventsHolidaysTable events={eventData} />
          </section>

        </div>
      </div>


    </div>
  )
}
