"use client"

import { ArrowRight, TrendingUp, DollarSign, BarChart3, MapPin, Users, Percent } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MyEventsHolidaysTable } from "./my-events-holidays-table"
import { WorldMapVisualization, sourceMarkets } from "./world-map-visualization"
import { useEffect, useState } from "react"
import { useDateContext } from "../date-context"
import { GetDemandAIData, GetDemandAIPerCountryAverageData } from "@/lib/demand"
import { getAllEvents, getAllHoliday } from "@/lib/events"
import localStorageService from "@/lib/localstorage"
import { ComparisonOption, useComparison } from "../comparison-context"
import { format } from "date-fns"
const sourceMarketColors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"]
// Local Dubai events - Extended list
// const localEvents = [
//   {
//     name: "Dubai Shopping Festival",
//     dates: "15 Jul - 30 Aug",
//     category: "retail",
//     impact: {
//       percentage: "+35%",
//       level: "high",
//       calculation: "Based on historical data: 120,000 visitors × 2.1% hotel booking rate × average stay 3.2 nights = +35% occupancy increase"
//     }
//   },
//   {
//     name: "Dubai Jazz Festival",
//     dates: "Fri 18 Jul - Sun 20 Jul",
//     category: "cultural",
//     impact: {
//       percentage: "+18%",
//       level: "high",
//       calculation: "Based on historical data: 25,000 visitors × 1.2% hotel booking rate × average stay 2.5 nights = +18% occupancy increase"
//     }
//   },
//   {
//     name: "Dubai World Cup",
//     dates: "Sat 30 Mar",
//     category: "sports",
//     impact: {
//       percentage: "+30%",
//       level: "high",
//       calculation: "World's richest horse race attracting high-end tourism and VIP guests"
//     }
//   }
// ]

export function MarketDemandWidget() {
  const fmtDate = (d: string) => format(new Date(d), "EEE, dd MMM - yyyy");
  const { selectedComparison } = useComparison()
  const { startDate, endDate, setDateRange } = useDateContext();
  const [demandData, setDemandData] = useState<any>([])
  const [eventData, setEventData] = useState<any>({});
  const [holidaysData, setHolidays] = useState<any>({});
  const [demandAIPerCountryAverageData, setDemandAIPerCountryAverageData] = useState<any>([])
  const [selectedProperty, setSelectedProperty] = useState<any>(localStorageService.get('SelectedProperty'))
  const [avgDemand, setAvgDemand] = useState({ AverageDI: 0, AverageWow: 0, AverageMom: 0, AvrageHotelADR: 0, AvrageHotelADRWow: 0, AvrageHotelADRMom: 0 })
  type AvgDemandType = typeof avgDemand;
  const compMap: Record<ComparisonOption, { avgDICompare: keyof AvgDemandType; avgADRCompare: keyof AvgDemandType, compareText: string }> = {
    1: { avgDICompare: "AverageWow", avgADRCompare: "AvrageHotelADRWow", compareText: 'Yesterday' },
    7: { avgDICompare: "AverageWow", avgADRCompare: "AvrageHotelADRWow", compareText: 'Last 7 Days' },
    28: { avgDICompare: "AverageMom", avgADRCompare: "AvrageHotelADRMom", compareText: 'Last 28 Days' },
    91: { avgDICompare: "AverageMom", avgADRCompare: "AvrageHotelADRMom", compareText: 'Last Quarter' },
  };
  const { avgDICompare, avgADRCompare, compareText } = compMap[selectedComparison as ComparisonOption] || { avgDICompare: "AverageWow", avgADRCompare: "AvrageHotelADRWow", compareText: 'Yesterday' };
  useEffect(() => {
    if (!startDate || !endDate) return;
    Promise.all([
      getDemandAIPerCountryAverageData(),
      getDemandAIData(),
      getAllEventData(),
      getAllHolidayData(),
    ]);

  }, [startDate, endDate, selectedProperty?.sid]);
  useEffect(() => {
    console.log("selectedComparison", selectedComparison);

  }, [selectedComparison]);
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
      "PageCount": 500,
      "StartDate": startDate?.toISOString().split('T')[0],
      "EndDate": endDate?.toISOString().split('T')[0]
    }
    getAllEvents(payload)
      .then((res) => {
        if (res.status) {
          res.body.eventDetails.sort((a: any, b: any) => a.rowNum - b.rowNum)
          setEventData(res.body);
          console.log("Events", res.body);
          // setinclusionValues(res.body.map((inclusion: any) => ({ id: inclusion, label: inclusion })));
        }
      })
      .catch((err) => console.error(err));
  }
  const getAllHolidayData = () => {
    // var filters = { "Type": [], "Impact": [], "SearchType": "" };
    var payload = {
      "Country": [selectedProperty?.country ?? ''],
      "City": [selectedProperty?.city ?? ''],
      "SID": selectedProperty?.sid,
      "FromDate": startDate?.toISOString().split('T')[0],
      "ToDate": endDate?.toISOString().split('T')[0],
      "Type": [],
      "Impact": [],
      "SearchType": ""
    }
    getAllHoliday(payload)
      .then((res) => {
        if (res.status) {
          // console.log("Events", eventData);
          var holidays = [...res.body[0].holidayDetail]
          const holiday = holidays.map(x =>
          ({
            "eventName": x.holidayName,
            "displayDate": fmtDate(x.holidayDispalyDate),
            "eventType": 'holiday',
            "eventColor": 'Holiday',
            "eventTo": x.holidayDispalyDate
          })
          )
          // console.log("Holidyas", holiday);
          setHolidays(holiday)
          // res.body.eventDetails.sort((a: any, b: any) => a.rowNum - b.rowNum)
          // setEventData(res.body);
          // setinclusionValues(res.body.map((inclusion: any) => ({ id: inclusion, label: inclusion })));
        }
      })
      .catch((err) => console.error(err));
  }

  return (
    <Card className="card-elevated animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="space-y-2">
              <CardTitle className="text-minimal-title text-foreground">Market Demand</CardTitle>
              <p className="text-minimal-body text-muted-foreground">Current market performance indicators</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">

        {/* Key Metrics Row - Secondary metrics with moderate emphasis */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Demand Index */}
          <div className="p-6 space-y-3 bg-muted/40 rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-foreground/80">Demand Index</span>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold text-foreground">{avgDemand?.AverageDI}</div>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-medium px-1.5 py-0.5 rounded
                  ${avgDemand?.[avgDICompare] > 0 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' :
                    'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 '}`}>
                  {avgDemand?.[avgDICompare]}%
                </span>
                <span className="text-sm text-muted-foreground">vs. {compareText}</span>
              </div>
            </div>
          </div>

          {/* Market ADR */}
          <div className="p-6 space-y-3 bg-muted/40 rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-foreground/80">Market ADR</span>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold text-foreground">{`\u200E${selectedProperty?.currencySymbol ?? '$'}\u200E ${avgDemand?.AvrageHotelADR}`}</div>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-medium px-1.5 py-0.5 rounded
                  ${avgDemand?.[avgADRCompare] > 0 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' :
                    'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 '}`}>
                  {avgDemand?.[avgADRCompare]}%
                </span>
                <span className="text-sm text-muted-foreground">vs. {compareText}</span>
              </div>
            </div>
          </div>

          {/* Market RevPAR */}
          <div className="p-6 space-y-3 bg-muted/40 rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-foreground/80">Market RevPAR</span>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold text-foreground">$180</div>
              <div className="flex items-center gap-1">
                <span className="text-red-600 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
                  -2.3%
                </span>
                <span className="text-sm text-muted-foreground">vs. {compareText}</span>
              </div>
            </div>
          </div>

          {/* Market Occupancy */}
          <div className="p-6 space-y-3 bg-muted/40 rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-foreground/80">Market Occupancy</span>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold text-foreground">72%</div>
              <div className="flex items-center gap-1">
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">
                  +4.2%
                </span>
                <span className="text-sm text-muted-foreground">vs. {compareText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Source Markets Section with Events Subsection */}
        <div className="card-minimal overflow-hidden">
          {/* Header with Hotel Location and View Toggle */}
          <div className="px-4 py-3 bg-muted/20 border-b border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h4 className="text-minimal-subtitle font-semibold text-foreground">Top Source Markets</h4>
              </div>
            </div>
          </div>

          {/* Legends Section - Under Heading */}
          <div className="px-4 py-3 bg-muted/10 border-b border-border/20">
            <div className="flex flex-wrap gap-4 justify-start">
              {demandAIPerCountryAverageData.map((market: any, index: number) => (
                <div key={market.srcCountryName} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sourceMarketColors[index] }}
                  />
                  <span className="text-xs font-medium text-foreground">
                    {market.srcCountryName} ({market.averageTotalFlights}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="py-4 px-1">
            <div className="flex flex-col gap-6">
              {/* Map Section - Full Width */}
              <div className="w-full h-[400px]">
                <WorldMapVisualization demandAiAvg={demandAIPerCountryAverageData} />
              </div>

              {/* Events Section - Full Width Below Map */}
              <div className="w-full pb-6">
                <MyEventsHolidaysTable events={eventData} holidaysData={holidaysData} />
              </div>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  )
}
