"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FilterBar } from "@/components/navigator/filter-bar"
import { OverviewKpiCards } from "@/components/navigator/overview-kpi-cards"
import { ComparisonProvider, useComparison } from "@/components/comparison-context"
import { RateTrendsChart } from "@/components/navigator/rate-trends-chart"
import { MarketDemandWidget } from "@/components/navigator/market-demand-widget"
import { PropertyHealthScoreWidget } from "@/components/navigator/property-health-score-widget"
import { FilterSidebar } from "@/components/filter-sidebar"
import { CoachMarkTrigger } from "@/components/navigator/coach-mark-system"
import { WeeklyPricingDrawer } from "@/components/weekly-pricing-drawer"
import { CSATRatingCard } from "@/components/csat-rating-card"
import { useScrollDetection } from "@/hooks/use-scroll-detection"
import {
  Activity,
  TrendingUp,
  MapPin,
  Clock,
  BarChart3,
  ArrowRight,
  Zap,
  Target,
  Bell,
  ChevronRight,
  DollarSign
} from "lucide-react"
import { Suspense } from 'react'
import { GetParityData } from "@/lib/parity"
import { getRateTrends } from "@/lib/rate"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { useDateContext } from "@/components/date-context"
import { conevrtDateforApi } from "@/lib/utils"
import { GlobalProgressBar, LoadingSkeleton } from "@/components/loading-skeleton"

/**
 * Modern Quick Actions Configuration
 * Streamlined with better visual hierarchy and reduced clutter
 */
const quickActions = [
  {
    id: 'rate-optimization',
    title: 'Rate Optimization',
    subtitle: 'AI-powered pricing strategy',
    icon: TrendingUp,
    color: 'primary',
    href: '/rate-optimization',
    badge: 'Hot',
    urgent: true,
    action: () => {
      console.log('🎯 Navigating to Rate Optimization')
      if (typeof window !== 'undefined') {
        window.location.href = '/rate-optimization'
      }
    }
  },
  {
    id: 'competitor-analysis',
    title: 'Market Intelligence',
    subtitle: 'Real-time competitor insights',
    icon: BarChart3,
    color: 'secondary',
    href: '/competitive-analysis',
    badge: null,
    urgent: false,
    action: () => {
      console.log('📊 Navigating to Competitor Analysis')
      if (typeof window !== 'undefined') {
        window.location.href = '/competitive-analysis'
      }
    }
  },
  {
    id: 'location-insights',
    title: 'Location Performance',
    subtitle: 'Geographic revenue analysis',
    icon: MapPin,
    color: 'accent',
    href: '/location-insights',
    badge: 'New',
    urgent: false,
    action: () => {
      console.log('📍 Navigating to Location Insights')
      if (typeof window !== 'undefined') {
        window.location.href = '/location-insights'
      }
    }
  },
  {
    id: 'real-time-alerts',
    title: 'Smart Alerts',
    subtitle: 'Critical change monitoring',
    icon: Bell,
    color: 'warning',
    href: '/alerts',
    badge: '3',
    urgent: true,
    action: () => {
      console.log('🔔 Navigating to Real-time Alerts')
      if (typeof window !== 'undefined') {
        window.location.href = '/alerts'
      }
    }
  },
]

/**
 * Streamlined Insights Configuration
 * Focused on revenue-critical insights with better categorization
 */
const insights = [
  {
    id: 'rate-parity-alert',
    type: 'critical',
    title: 'Rate Parity Violation',
    description: 'Booking.com rates 8% below direct - immediate action required',
    action: 'Fix Now',
    impact: 'High Revenue Impact',
    value: '-$2,400/day',
    urgency: 'immediate',
  },
  {
    id: 'demand-surge',
    type: 'opportunity',
    title: 'Demand Surge Detected',
    description: 'Dubai Shopping Festival driving 35% demand increase next week',
    action: 'Optimize Pricing',
    impact: 'Revenue Opportunity',
    value: '+$8,500/week',
    urgency: 'high',
  },
  {
    id: 'competitor-movement',
    type: 'market',
    title: 'Market Shift Alert',
    description: '3 key competitors reduced rates by 12% - market repositioning needed',
    action: 'Analyze Strategy',
    impact: 'Competitive Position',
    value: 'Market Share Risk',
    urgency: 'medium',
  },
]

/**
 * Enhanced Color System for Modern Design
 */
function getActionColorClasses(color: string, urgent: boolean = false) {
  const baseClasses = "group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"

  const colorMap = {
    primary: {
      bg: urgent ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
      text: urgent ? 'text-white' : 'text-blue-700 dark:text-blue-300',
      icon: urgent ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      hover: 'hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900 dark:hover:to-blue-800',
    },
    secondary: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900',
      text: 'text-purple-700 dark:text-purple-300',
      icon: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
      hover: 'hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900 dark:hover:to-purple-800',
    },
    accent: {
      bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      hover: 'hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-emerald-900 dark:hover:to-emerald-800',
    },
    warning: {
      bg: urgent ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900',
      text: urgent ? 'text-white' : 'text-amber-700 dark:text-amber-300',
      icon: urgent ? 'text-amber-100' : 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      hover: 'hover:from-amber-100 hover:to-amber-200 dark:hover:from-amber-900 dark:hover:to-amber-800',
    },
  }

  return colorMap[color as keyof typeof colorMap] || colorMap.primary
}

/**
 * Modern Insight Styling
 */
function getInsightStyling(type: string) {
  const styleMap = {
    critical: {
      bg: 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900',
      accent: 'bg-red-500',
      text: 'text-red-700 dark:text-red-300',
      icon: 'text-red-600 dark:text-red-400',
      badge: 'bg-red-500 text-white',
    },
    opportunity: {
      bg: 'bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900',
      accent: 'bg-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: 'text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-500 text-white',
    },
    market: {
      bg: 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
      accent: 'bg-blue-500',
      text: 'text-blue-700 dark:text-blue-300',
      icon: 'text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-500 text-white',
    },
  }
  return styleMap[type as keyof typeof styleMap] || styleMap.market
}

/**
 * Modern Dashboard Home Page
 * Optimized for revenue managers with clean, professional design
 */
export default function Home() {
  const { selectedComparison, channelFilter, compsetFilter, setSideFilter, sideFilter } = useComparison()
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const [showCSATCard, setShowCSATCard] = useState(false)
  const [csatClosed, setCSATClosed] = useState(false)
  const { startDate, endDate, setDateRange } = useDateContext()
  const [selectedProperty] = useSelectedProperty()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingCycle, setLoadingCycle] = useState(1)
  // Scroll detection for CSAT card
  const [parityData, setparityData] = useState(Object);
  const [parityDataComp, setParityDataComp] = useState(Object);
  const [rateData, setRateData] = useState(Object);
  const [rateCompData, setRateCompData] = useState(Object);
  const [losGuest, setLosGuest] = useState({ "Los": [], "Guest": [] });
  const [selectedChannel, setSelectedChannel] = useState([])
  const { hasTriggered, resetTrigger } = useScrollDetection({
    threshold: 0.9, // Show when 90% scrolled (very close to bottom)
    minScrollDistance: 1200, // After scrolling at least 1200px
    oncePerSession: true // Only show once per session
  })



  // Show CSAT card when triggered
  useEffect(() => {
    if (hasTriggered && !showCSATCard && !csatClosed) {
      console.log('🎯 Showing CSAT card after scroll trigger')
      // Add a small delay for better UX
      const timer = setTimeout(() => {
        setShowCSATCard(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [hasTriggered, showCSATCard, csatClosed])
  useEffect(() => {

    debugger
    const channelIds = channelFilter?.channelId ?? [];
    if (
      !startDate ||
      !endDate ||
      !selectedProperty?.sid ||
      !(channelIds.length > 0)
    ) return;

    setIsLoading(true);
    setLoadingProgress(0);

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        const increment = Math.floor(Math.random() * 9) + 3;
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          setLoadingCycle(prevCycle => prevCycle + 1);
          return 0;
        }
        return newProgress;
      });
    }, 80);

    Promise.all([
      getRateDate(),
      getCompRateData()
    ]).finally(() => {
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 300);
    });

  }, [
    startDate,
    endDate,
    selectedProperty?.sid,
    channelFilter?.channelId?.join(','),
    sideFilter,
    compsetFilter
  ]);

  useEffect(() => {
    if (!startDate ||
      !endDate ||
      !selectedProperty?.sid ||
      selectedChannel.length === 0) return;

    Promise.all([
      GetParityDatas(),
      GetParityDatas_Comp()
    ]);
  }, [
    startDate,
    endDate,
    selectedProperty?.sid,
    sideFilter,
    selectedChannel.join(',') // ✅ fixes re-render from array identity change
  ]);

  useEffect(() => {
    if (!startDate ||
      !endDate ||
      !selectedProperty?.sid) return;
    Promise.all([
      getCompRateData(),
      GetParityDatas_Comp()
    ]);
  }, [selectedComparison])

  const getRateDate = () => {
    setRateData({});
    const filtersValue = {
      "SID": selectedProperty?.sid,
      "channels": (channelFilter?.channelId?.length ?? 0) > 0 ? channelFilter.channelId : [-1],
      "channelsText": (channelFilter?.channelName?.length ?? 0) > 0 ? channelFilter.channelName : ["All Channel"],
      "checkInStartDate": conevrtDateforApi(startDate?.toString()),
      "checkInEndDate": conevrtDateforApi(endDate?.toString()),
      "LOS": sideFilter?.lengthOfStay?.toString() || null,
      "guest": sideFilter?.guest?.toString() || null,
      "productTypeID": sideFilter?.roomTypes || null,
      "productTypeIDText": sideFilter?.roomTypes || "All",
      "inclusionID": sideFilter?.inclusions || [],
      "inclusionIDText": sideFilter?.inclusions?.length ? sideFilter.inclusions : ["All"],
      "properties": [],
      "restriction": sideFilter?.rateViewBy?.Restriction,
      "qualification": sideFilter?.rateViewBy?.Qualification,
      "promotion": sideFilter?.rateViewBy?.Promotion,
      "restrictionText": sideFilter?.rateViewBy?.RestrictionText || "All",
      "promotionText": sideFilter?.rateViewBy?.PromotionText || "All",
      "qualificationText": sideFilter?.rateViewBy?.QualificationText || "All",
      "subscriberPropertyID": selectedProperty?.hmid,
      "subscriberName": selectedProperty?.name,
      "mSIRequired": false,
      "benchmarkRequired": true,
      "compsetRatesRequired": true,
      "propertiesText": [],
      "isSecondary": compsetFilter,
    }
    getRateTrends(filtersValue)
      .then((res) => {
        if (res.status) {
          const CalulatedData = res.body?.pricePositioningEntites.map((x: any) => {
            const rates = x.subscriberPropertyRate || [];

            const [avgRate, avgStatus] = (() => {
              const valid = rates.filter((r: any) => parseInt(r.rate) > 0 && r.status === "O").map((r: any) => parseInt(r.rate));
              if (valid.length) return [valid.reduce((a: any, b: any) => a + b, 0) / valid.length, "O"];

              const statuses = new Set(rates.map((r: any) => r.status));
              if (statuses.has("C")) return [0, "C"];
              if (statuses.has("ND")) return [0, "ND"];
              return [0, "ND"];
            })();

            return {
              ...x,
              AvgData: avgRate,
              AvgStatus: avgStatus
            };
          });
          res.body.pricePositioningEntites = CalulatedData;
          console.log('Rate trends data:', res.body);
          setRateData(res.body);
          setLosGuest({ "Los": res.body?.losList, "Guest": res.body?.guestList });
          // setinclusionValues(res.body.map((inclusion: any) => ({ id: inclusion, label: inclusion })));
        }
      })
      .catch((err) => console.error(err));
  }
  const getCompRateData = () => {
    setRateCompData({});
    const startDateComp = startDate
      ? new Date(startDate.getTime() + (-selectedComparison * 24 * 60 * 60 * 1000))
      : new Date();
    const endDateComp = endDate
      ? new Date(endDate.getTime() + (-selectedComparison * 24 * 60 * 60 * 1000))
      : new Date();
    const filtersValue = {
      "SID": selectedProperty?.sid,
      "channels": channelFilter.channelId,
      "channelsText": channelFilter.channelName,
      "checkInStartDate": conevrtDateforApi(startDateComp.toString()),
      "checkInEndDate": conevrtDateforApi(endDateComp.toString()),
      "LOS": sideFilter?.lengthOfStay?.toString() || null,
      "guest": sideFilter?.guest?.toString() || null,
      "productTypeID": sideFilter?.roomTypes || null,
      "productTypeIDText": sideFilter?.roomTypes || "All",
      "inclusionID": sideFilter?.inclusions || [],
      "inclusionIDText": sideFilter?.inclusions?.length ? sideFilter.inclusions : ["All"],
      "properties": [],
      "restriction": sideFilter?.rateViewBy?.Restriction,
      "qualification": sideFilter?.rateViewBy?.Qualification,
      "promotion": sideFilter?.rateViewBy?.Promotion,
      "restrictionText": sideFilter?.rateViewBy?.RestrictionText || "All",
      "promotionText": sideFilter?.rateViewBy?.PromotionText || "All",
      "qualificationText": sideFilter?.rateViewBy?.QualificationText || "All",
      "subscriberPropertyID": selectedProperty?.hmid,
      "subscriberName": selectedProperty?.name,
      "mSIRequired": false,
      "benchmarkRequired": true,
      "compsetRatesRequired": true,
      "propertiesText": [],
      "isSecondary": compsetFilter,
    }
    getRateTrends(filtersValue)
      .then((res) => {
        if (res.status) {
          const CalulatedData = res.body?.pricePositioningEntites.map((x: any) => {
            const rates = x.subscriberPropertyRate || [];

            const [avgRate, avgStatus] = (() => {
              const valid = rates.filter((r: any) => parseInt(r.rate) > 0 && r.status === "O").map((r: any) => parseInt(r.rate));
              if (valid.length) return [valid.reduce((a: any, b: any) => a + b, 0) / valid.length, "O"];

              const statuses = new Set(rates.map((r: any) => r.status));
              if (statuses.has("C")) return [0, "C"];
              if (statuses.has("ND")) return [0, "ND"];
              return [0, "ND"];
            })();

            return {
              ...x,
              AvgData: avgRate,
              AvgStatus: avgStatus
            };
          });
          res.body.pricePositioningEntites = CalulatedData;
          console.log('Rate trends data:', res.body);
          setRateCompData(res.body);
          // setLosGuest({ "Los": res.body?.losList, "Guest": res.body?.guestList });
          // setinclusionValues(res.body.map((inclusion: any) => ({ id: inclusion, label: inclusion })));
        }
      })
      .catch((err) => console.error(err));
  }
  const GetParityDatas = () => {
    const channelIds = channelFilter?.channelId ?? [];
    if (!selectedProperty?.sid || !startDate || !endDate || channelIds.length === 0) {
      console.warn('Missing required parameters for parity data fetch');
      return;
    }

    setparityData({});
    const filtersValue = {
      "sid": selectedProperty?.sid,
      "checkInStartDate": conevrtDateforApi(startDate?.toString()),
      "checkInEndDate": conevrtDateforApi(endDate?.toString()),
      "channelName": selectedChannel.map((x: any) => x.cid),
      "guest": sideFilter?.guest || null,
      "los": sideFilter?.lengthOfStay || null,
      "promotion": sideFilter?.rateViewBy?.PromotionText === "All" ? null : sideFilter?.rateViewBy?.PromotionText,
      "qualification": sideFilter?.rateViewBy?.QualificationText === "All" ? null : sideFilter?.rateViewBy?.QualificationText,
      "restriction": sideFilter?.rateViewBy?.RestrictionText === "All" ? null : sideFilter?.rateViewBy?.RestrictionText,
    }

    return GetParityData(filtersValue)
      .then((res) => {
        if (res.status) {
          let parityDatasMain = res.body;
          let totalviolationCount = 0;
          let parityDatas = res.body.otaViolationChannelRate.overallWinMeetLoss;
          if (parityDatas != null && (parityDatas.winCount + parityDatas.meetCount + parityDatas.lossCount) != 0) {
            let win = parityDatas.winCount
            let meet = parityDatas.meetCount
            let loss = parityDatas.lossCount
            parityDatas.parityScore = Math.round(((win + meet) / (win + meet + loss)) * 100)
          }
          else {
            res.body.otaViolationChannelRate.overallWinMeetLoss = {};
            res.body.otaViolationChannelRate.overallWinMeetLoss["parityScore"] = 0;
          }
          if (parityDatasMain && parityDatasMain.otaViolationChannelRate && parityDatasMain.otaViolationChannelRate.violationChannelRatesCollection) {
            parityDatasMain.otaViolationChannelRate.violationChannelRatesCollection.forEach((element: any) => {
              if (!element.isBrand) {
                let totalWinMeetLossCount = element.channelWisewinMeetLoss.lossCount + element.channelWisewinMeetLoss.meetCount + element.channelWisewinMeetLoss.winCount;

                if (totalWinMeetLossCount > 0) {
                  element.channelWisewinMeetLoss.parityScore = Math.round(((element.channelWisewinMeetLoss.winCount + element.channelWisewinMeetLoss.meetCount) * 100) / totalWinMeetLossCount);
                }
              }
              else {
                element.channelWisewinMeetLoss = parityDatas;
              }
              const violationCount = element?.checkInDateWiseRates.filter((x: any) => (x.rateViolation || x.availViolation)).length;
              if (element.channelWisewinMeetLoss) {
                element.channelWisewinMeetLoss.violationCount = violationCount;
                totalviolationCount += violationCount
              }
            });

          }
          parityDatasMain.totalviolationCount = totalviolationCount;
          setparityData(parityDatasMain);
          // setinclusionValues(res.body.map((inclusion: any) => ({ id: inclusion, label: inclusion })));
        }
      })
      .catch((err) => {
        console.error('Parity data fetch failed:', err);
        setparityData({});
      });
  }
  const GetParityDatas_Comp = () => {
    setParityDataComp({});
    const startDateComp = startDate
      ? new Date(startDate.getTime() + (-selectedComparison * 24 * 60 * 60 * 1000))
      : new Date();
    const endDateComp = endDate
      ? new Date(endDate.getTime() + (-selectedComparison * 24 * 60 * 60 * 1000))
      : new Date();
    const filtersValue = {
      "sid": selectedProperty?.sid,
      "checkInStartDate": conevrtDateforApi(startDateComp.toString()),
      "checkInEndDate": conevrtDateforApi(endDateComp.toString()),
      "channelName": selectedChannel.map((x: any) => x.cid),
      "guest": sideFilter?.guest || null,
      "los": sideFilter?.lengthOfStay || null,
      "promotion": sideFilter?.rateViewBy?.Promotion || null,
      "qualification": sideFilter?.rateViewBy?.Qualification || null,
      "restriction": sideFilter?.rateViewBy?.Restriction || null,
    }
    GetParityData(filtersValue)
      .then((res) => {
        if (res.status) {
          let parityDatasMain = res.body;
          let totalviolationCount = 0;
          let parityDatas = res.body.otaViolationChannelRate.overallWinMeetLoss;
          if (parityDatas != null && (parityDatas.winCount + parityDatas.meetCount + parityDatas.lossCount) != 0) {
            let win = parityDatas.winCount
            let meet = parityDatas.meetCount
            let loss = parityDatas.lossCount
            parityDatas.parityScore = Math.round(((win + meet) / (win + meet + loss)) * 100)
          }
          else {
            res.body.otaViolationChannelRate.overallWinMeetLoss = {};
            res.body.otaViolationChannelRate.overallWinMeetLoss["parityScore"] = 0;
          }
          if (parityDatasMain && parityDatasMain.otaViolationChannelRate && parityDatasMain.otaViolationChannelRate.violationChannelRatesCollection) {
            parityDatasMain.otaViolationChannelRate.violationChannelRatesCollection.forEach((element: any) => {
              if (!element.isBrand) {
                let totalWinMeetLossCount = element.channelWisewinMeetLoss.lossCount + element.channelWisewinMeetLoss.meetCount + element.channelWisewinMeetLoss.winCount;

                if (totalWinMeetLossCount > 0) {
                  element.channelWisewinMeetLoss.parityScore = Math.round(((element.channelWisewinMeetLoss.winCount + element.channelWisewinMeetLoss.meetCount) * 100) / totalWinMeetLossCount);
                }
              }
              const violationCount = element?.checkInDateWiseRates.filter((x: any) => (x.rateViolation || x.availViolation)).length;
              if (element.channelWisewinMeetLoss) {
                element.channelWisewinMeetLoss.violationCount = violationCount;
                totalviolationCount += violationCount
              }
            });

          }
          parityDatasMain.totalviolationCount = totalviolationCount;
          setParityDataComp(parityDatasMain);
          // setinclusionValues(res.body.map((inclusion: any) => ({ id: inclusion, label: inclusion })));
        }
      })
      .catch((err) => console.error(err));
  }


  const handleMoreFiltersClick = () => {
    setIsFilterSidebarOpen(true)
    console.log("🔍 Opening filter sidebar")
  }

  const handleCSATClose = () => {
    setShowCSATCard(false)
    setCSATClosed(true)
    console.log('🎯 CSAT card closed by user')
  }
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
  //       <GlobalProgressBar />
  //       <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8 xl:py-10">
  //         <div className="max-w-7xl xl:max-w-none mx-auto">
  //           <LoadingSkeleton type="demand" showCycleCounter={true} />
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950" data-coach-mark="dashboard-overview">
      {/* Enhanced Filter Bar with Sticky Positioning */}
      <div className="sticky top-0 z-40 filter-bar-minimal bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-border/50 shadow-sm transition-shadow duration-200">
        <FilterBar onMoreFiltersClick={handleMoreFiltersClick} setSelectedChannel={setSelectedChannel} />
      </div>
      <FilterSidebar
        losGuest={losGuest}
        isOpen={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
        onApply={(filters) => {
          // Handle filter apply logic here
          setSideFilter(filters);
          console.log('Applied filters:', filters)
          setIsFilterSidebarOpen(false)
        }}
      />
      {isLoading &&
        (
          <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
            <GlobalProgressBar />
            <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8 xl:py-10">
              <div className="max-w-7xl xl:max-w-none mx-auto">
                <LoadingSkeleton type="demand" showCycleCounter={true} />
              </div>
            </div>
          </div>
        )
      }
      {!isLoading &&
        (
          <main className="relative">
            <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8 space-y-4">
              <div className="max-w-none mx-auto space-y-4">

                {/* Dashboard Header with Enhanced Typography */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-minimal-md mb-8">
                  <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-foreground">
                      Overview
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Real-time insights for optimal pricing and revenue performance
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <CoachMarkTrigger />
                  </div>
                </div>

                {/* KPI Cards - Enhanced with proper spacing */}
                <div className="w-full animate-slide-up" data-coach-mark="kpi-cards">
                  <OverviewKpiCards parityData={parityData} rateData={rateData} rateCompData={rateCompData} parityDataComp={parityDataComp} />
                </div>

                {/* Main Content Grid - Enhanced with consistent spacing */}
                <div className="space-minimal-xl mt-8">

                  {/* Rate Trends Chart - Full width with enhanced styling */}
                  <div className="animate-fade-in mb-12" data-coach-mark="rate-trends">
                    <RateTrendsChart rateData={rateData} rateCompData={rateCompData} />
                  </div>

                  {/* Property Health Score and Market Demand Cards - Grouped with consistent spacing */}
                  <div className="space-minimal-xl">
                    {/* Property Health Score - Enhanced card */}
                    <div className="animate-slide-up" data-coach-mark="property-health" style={{ animationDelay: '0.1s' }}>
                      <PropertyHealthScoreWidget parityData={parityData} />
                    </div>

                    {/* Market Demand Widget - Enhanced card */}
                    <div className="animate-slide-up mt-8" data-coach-mark="market-demand" style={{ animationDelay: '0.2s' }}>
                      <MarketDemandWidget />
                    </div>
                  </div>
                </div>

                {/* Footer spacing */}
                <div className="h-8"></div>
              </div>
            </div>

            {/* Enhanced Filter Sidebar */}


            {/* CSAT Rating Card - appears when user scrolls near bottom */}
            {showCSATCard && (
              <CSATRatingCard onClose={handleCSATClose} />
            )}
          </main>
        )}
      {/* Coach Mark Trigger - Help Icon */}
      <Suspense fallback={null}>
        <CoachMarkTrigger />
      </Suspense>
    </div>
  )
}
