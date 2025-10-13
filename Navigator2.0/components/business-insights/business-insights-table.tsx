"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronDown, ChevronUp, Download, FileText, CheckCircle, Star, ArrowDown, ArrowUp, Info, ArrowUpDown } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts"
import { format, addDays, subDays } from "date-fns"
import { useSelectedProperty } from "@/hooks/use-local-storage"

const getDemandColor = (value: number) => {
  if (value < 25) return 'text-blue-300';
  if (value <= 50) return 'text-blue-600';
  if (value <= 75) return 'text-red-400';
  return 'text-red-600';
};
// Data processing function based on Angular logic
const processTableData = (
  demandData: any,
  otaRankData: any,
  eventData: any,
  holidayData: any,
  parityData: any,
  rateData: any,
  channelFilter: string[],
  selectedProperty: any
) => {
  if (!rateData || !rateData.eventEntity || !rateData.pricePositioningEntites) {
    return []
  }
  const tableData: any[] = []
  const otaBenchmarkChannelName = "OTA Benchmark" // This should come from your constants
  const isOTARankActive = true // This should come from your settings
  const isDemandActive = true // This should come from your settings
  const currencySymbol = selectedProperty?.currencySymbol // This should come from your settings

  // Filter subscribed events and holidays
  const eventSubscribedList = eventData || []
  const holidaySubscribedList = holidayData || []

  // Format dates for events and holidays
  eventSubscribedList.forEach((element: any) => {
    element.formattedeventFrom = format(new Date(element.eventFrom), 'dd-MM-yyyy')
    element.formattedeventTo = format(new Date(element.eventTo), 'dd-MM-yyyy')
  })

  holidaySubscribedList.forEach((element: any) => {
    element.formattedCheckInDate = format(new Date(element.holidayDate), 'dd-MM-yyyy')
  })

  // Process OTA rank trend data
  const otaRankTrendData: any[] = otaRankData || [];
  // Check if one channel is selected
  const OneChannelSelected = channelFilter.length === 2 && channelFilter.includes(otaBenchmarkChannelName)

  // Process parity data for win/loss/meet flags
  let isWin = false, isLoss = false, isMeet = false, isBlank = false
  if (OneChannelSelected && parityData) {
    const channelselected = channelFilter.filter((x: string) => x !== otaBenchmarkChannelName)
    if (channelselected.length === 1) {
      const check = parityData.violationChannelRatesCollection?.find(
        (x: any) => x.channelName.toLowerCase() === channelselected[0].toLowerCase()
      )?.checkInDateWiseRates

      if (check) {
        check.forEach((element: any) => {
          if (element.parityVsBaseLine?.toLowerCase() === 'w') isWin = true
          if (element.parityVsBaseLine?.toLowerCase() === 'l') isLoss = true
          if (element.parityVsBaseLine?.toLowerCase() === 'm') isMeet = true
        })
        if (!isWin && !isLoss && !isMeet) isBlank = true
      }
    }
  }

  // Get competitor arrays
  const allCompetitorArrayincludingSubscriber = rateData.pricePositioningEntites.filter(
    (x: any) => x.propertyType === 0 || x.propertyType === 1
  )
  const subscriber = rateData.pricePositioningEntites.filter((x: any) => x.propertyType === 0)
  const averagecompset = rateData.pricePositioningEntites.filter((x: any) => x.propertyType === 2)

  // Process each event entity (date)
  rateData.eventEntity.forEach((demandelement: any, demandindex: number) => {
    const obj: any = {
      statements: [],
      checkinDate: demandelement.eventDate,
      formattedCheckInDate: format(new Date(demandelement.eventDate), 'dd-MM-yyyy'),
      formatDate: format(new Date(demandelement.eventDate), 'dd MMM'),
      checkInDateTimeStamp: new Date(demandelement.eventDate).getTime()
    }

    // Process events for this date
    obj.event = eventSubscribedList.filter((eventelement: any) => {
      const eventFrom = new Date(eventelement.formattedeventFrom.split('-').reverse().join('-'))
      const eventTo = new Date(eventelement.formattedeventTo.split('-').reverse().join('-'))
      const checkInDate = new Date(obj.formattedCheckInDate.split('-').reverse().join('-'))
      return eventFrom <= checkInDate && eventTo >= checkInDate
    })
    obj.isEventThere = obj.event.length > 0

    // Process OTA rank
    let changeRank = 0
    let myOtaRank = '--'
    let rankChannel = ''

    otaRankTrendData
      .filter((x: any) => {
        // Filter by property name and channel if one channel selected
        return (OneChannelSelected ?
          x.channel.toLowerCase() === channelFilter[0].toLowerCase() : true) && x.propertyId === selectedProperty?.hmid
      })
      .forEach((ota: any) => {
        const currOta = ota.otaRankEntityCollection
        if (currOta) {
          const currotaforthisdate = currOta.filter(
            (x: any) => x.checkInDate === demandelement.eventDate
          )
          if (currotaforthisdate && currotaforthisdate.length > 0) {
            const intValue = parseInt(currotaforthisdate[0].changeInRank, 10)
            if (!isNaN(intValue) && intValue < changeRank) {
              changeRank = intValue
              myOtaRank = currotaforthisdate[0].otaRank
              rankChannel = ota.channel
            }
          }
        }
      })

    obj.otaRank = myOtaRank
    obj.changeInOtaRank = changeRank
    obj.isChangeOtaRank = changeRank > 0
    obj.isZeroChangeotaRank = changeRank === 0

    if (changeRank < 0 && isOTARankActive) {
      obj.statements.push({
        statement: `Your <strong> Rank  </strong> has dropped on ${rankChannel} by <strong>${Math.abs(changeRank)}</strong>.`,
        priority: 3,
      })
    }

    // obj.changeInOtaRank = Math.abs(changeRank).toString()

    // Process rate comparison
    if (subscriber.length > 0 && averagecompset.length > 0) {
      const subsrate = parseInt(subscriber[0].subscriberPropertyRate[demandindex]?.rate) || -1
      const averageRate = parseInt(averagecompset[0].subscriberPropertyRate[demandindex]?.rate) || -1

      if (subsrate !== -1 && averageRate !== -1) {
        obj.percentageChangeInSubscriberAndAverageRate = parseFloat(
          (((subsrate - averageRate) * 100) / averageRate).toFixed()
        )

        obj.isPercentageChangeInSubscriberAndAverageRateGreaterthan2 =
          Math.abs(obj.percentageChangeInSubscriberAndAverageRate) > 2

        obj.isSubscriberGreaterthanAvg = obj.percentageChangeInSubscriberAndAverageRate > 0

        if (obj.isPercentageChangeInSubscriberAndAverageRateGreaterthan2) {
          if (obj.isSubscriberGreaterthanAvg) {
            obj.statements.push({
              statement: ` Your rate is  <strong>${Math.floor(Math.abs(obj.percentageChangeInSubscriberAndAverageRate))}% higher </strong>than average compset. `,
              priority: 0,
            })
          } else {
            obj.statements.push({
              statement: `  Your rate is  <strong>${Math.floor(Math.abs(obj.percentageChangeInSubscriberAndAverageRate))}%  lower </strong> than average compset.  `,
              priority: 0,
            })
          }
        }
      }
    }

    // Process average compset
    if (averagecompset && averagecompset.length > 0) {
      const rate = averagecompset[0].subscriberPropertyRate[demandindex]?.rate
      obj.avgCompset = rate
      const compnewrate = parseInt(rate) > 0 ? parseInt(rate) : -1
      obj.isAvgCompsetThere = compnewrate !== -1
    }

    // Process subscriber data
    if (subscriber && subscriber.length > 0) {
      obj.subscriber = subscriber[0].subscriberPropertyRate[demandindex]?.rate
      obj.isSubscriberClosed = obj.subscriber === 'Closed'

      const subscriberrate = parseInt(obj.subscriber) > 0 ? parseInt(obj.subscriber) : -1
      if (subscriberrate !== -1) {
        let rank = 0
        let totalcompetitor = 0
        let totalcompetitorwithclosedandrate = 0
        let totalClosedComp = 0

        allCompetitorArrayincludingSubscriber.forEach((compelement: any) => {
          if (compelement.propertyType !== 0) {
            if (compelement.rate === 'Closed') {
              totalcompetitorwithclosedandrate++
              totalClosedComp++
            } else {
              const compnewrate = parseInt(compelement.rate) > 0 ? parseInt(compelement.rate) : -1
              if (compnewrate !== -1) {
                totalcompetitorwithclosedandrate++
              }
            }
          }

          if (totalcompetitor < 10) {
            const comprate = compelement.subscriberPropertyRate[demandindex]?.rate
            const compnewrate = parseInt(comprate) > 0 ? parseInt(comprate) : -1
            if (compnewrate !== -1) {
              if (subscriberrate >= compnewrate) {
                rank++
              }
              totalcompetitor++
            }
          }
        })

        obj.rank = rank
        obj.totalCompWithRate = totalcompetitor
        obj.moreThanFiftyCompClosedPercentage = totalcompetitorwithclosedandrate !== 0 ?
          (totalClosedComp * 100) / totalcompetitorwithclosedandrate : 0
        obj.isBoolMoreThanFiftyCompClosedPercentage = obj.moreThanFiftyCompClosedPercentage > 50

        if (obj.isBoolMoreThanFiftyCompClosedPercentage) {
          if (obj.moreThanFiftyCompClosedPercentage === 100) {
            obj.statements.push({
              statement: ` All of the compsets are closed while your rate is \u200E ${currencySymbol} \u200E ${obj.avgCompset}. `,
              priority: -1,
            })
          } else {
            obj.statements.push({
              statement: ` ${totalClosedComp} out of ${totalcompetitorwithclosedandrate} compsets are closed  while your rate is \u200E ${currencySymbol} \u200E ${obj.avgCompset}. `,
              priority: -1,
            })
          }
        }
      }
    }

    // Process demand data
    if (demandData && demandData.length > demandindex) {
      obj.checkinDate = demandData[demandindex].checkinDate
      obj.demandIndex = demandData[demandindex].demandIndex
      obj.airline = demandData[demandindex].oagCapacity
      obj.isdemandIndexthere = true
      obj.isAirlineThere = true

      if (obj.isdemandIndexthere && isDemandActive) {
        if (obj.demandIndex > 65) {
          obj.statements.push({
            statement: ` Your city <strong>demand  is high </strong> <span class="${getDemandColor(obj.demandIndex)}">(${obj.demandIndex})</span>. `,
            priority: 2,
          })
        } else if (obj.demandIndex < 40) {
          obj.statements.push({
            statement: ` Your city  <strong>demand is low </strong> <span class="${getDemandColor(obj.demandIndex)}">(${obj.demandIndex})</span>. `,
            priority: 2,
          })
        } else {
          obj.statements.push({
            statement: ` Your city <strong> demand is medium </strong> <span class="${getDemandColor(obj.demandIndex)}">(${obj.demandIndex})</span>.`,
            priority: 2,
          })
        }
      }
    } else {
      obj.demandIndex = ''
      obj.airline = ''
      obj.isdemandIndexthere = false
      obj.isAirlineThere = false
    }

    // Process holidays
    const holiday = holidaySubscribedList.filter(
      (holidayelement: any) => holidayelement.formattedCheckInDate === obj.formattedCheckInDate
    )
    obj.isHolidayThere = holiday.length > 0
    if (obj.isHolidayThere) {
      obj.holiday = holiday[0]
    }

    // Process parity data
    if (!OneChannelSelected) {
      if (parityData && parityData?.dateWiseWinMeetLoss[demandindex]) {
        obj.parityScore = parityData?.dateWiseWinMeetLoss[demandindex].parityScore + '%'
        obj.parityScoreAbsolute = parityData?.dateWiseWinMeetLoss[demandindex].parityScore
        obj.isParityScoreThere = true
        if (obj.parityScoreAbsolute < 60) {
          obj.statements.push({
            statement: ` You are  <strong>losing</strong> on parity  with current score as ${obj.parityScore}. `,
            priority: 1,
          })
        }
      }
    } else {
      obj.isParityScoreThere = false
      // Handle single channel parity logic here if needed
    }

    // Add closed subscriber statement
    if (obj.isSubscriberClosed && obj.isAvgCompsetThere) {
      obj.statements.push({
        statement: ` You are <strong>closed</strong> while <strong>average compset are \u200E ${currencySymbol} \u200E ${obj.avgCompset}</strong>. `,
        priority: -2,
      })
    }

    // Sort statements by priority
    obj.statements.sort((a: any, b: any) => a.priority - b.priority)

    tableData.push(obj)
  })
  debugger;
  // Apply sorting logic from Angular
  let sortedData = [...tableData]

  // Sort by OTA rank change
  sortedData.sort((a, b) => parseInt(a.changeInOtaRank) - parseInt(b.changeInOtaRank))

  // Sort by parity score
  sortedData.sort((a, b) => {
    const isAStringId = typeof a.parityScore === 'string'
    const isBStringId = typeof b.parityScore === 'string'

    if (isAStringId && isBStringId) {
      const order: any = { L: 1, W: 2, M: 3 }
      return order[a.parityScore] - order[b.parityScore]
    } else if (isAStringId) {
      return -1
    } else if (isBStringId) {
      return 1
    } else {
      return (b.parityScoreAbsolute || 0) - (a.parityScoreAbsolute || 0)
    }
  })

  // Sort by demand index presence
  sortedData.sort((a, b) => {
    if (a.isdemandIndexthere && !b.isdemandIndexthere) return -1
    else if (!a.isdemandIndexthere && b.isdemandIndexthere) return 1
    else return 0
  })

  // Sort by holiday presence
  sortedData.sort((a, b) => {
    if (a.isHolidayThere && !b.isHolidayThere) return -1
    else if (!a.isHolidayThere && b.isHolidayThere) return 1
    else return 0
  })

  // Sort by event presence
  sortedData.sort((a, b) => {
    if (a.isEventThere && !b.isEventThere) return -1
    else if (!a.isEventThere && b.isEventThere) return 1
    else return 0
  })

  // Sort by percentage change
  sortedData.sort((a, b) => {
    const ap = a.percentageChangeInSubscriberAndAverageRate
    const bp = b.percentageChangeInSubscriberAndAverageRate
    const isANull = ap === null || ap === undefined
    const isBNull = bp === null || bp === undefined

    if (isANull && isBNull) return 0
    else if (isANull) return 1
    else if (isBNull) return -1

    const diff = Math.abs(ap - bp)
    if (diff < 10) return 0
    return bp - ap
  })

  // Sort by closed competitors percentage
  sortedData.sort((a, b) => {
    if (a.isBoolMoreThanFiftyCompClosedPercentage && !b.isBoolMoreThanFiftyCompClosedPercentage) return -1
    else if (!a.isBoolMoreThanFiftyCompClosedPercentage && b.isBoolMoreThanFiftyCompClosedPercentage) return 1
    else return 0
  })

  // Sort by closed subscriber
  sortedData.sort((a, b) => {
    const boolA = a.isSubscriberClosed && a.isAvgCompsetThere
    const boolB = b.isSubscriberClosed && b.isAvgCompsetThere
    if (boolA && !boolB) return -1
    else if (!boolA && boolB) return 1
    else return 0
  })

  return sortedData
}

interface BusinessInsightsTableProps {
  className?: string
  startDate?: Date
  endDate?: Date
  selectedChannels?: number[]
  channelFilter?: string[]
  demandData?: any
  otaRankData?: any
  eventData?: any
  holidayData?: any
  parityData?: any
  rateData?: any
  isLoadingData?: boolean
}

export function BusinessInsightsTable({
  className,
  startDate,
  endDate,
  selectedChannels,
  channelFilter,
  demandData,
  otaRankData,
  eventData,
  holidayData,
  parityData,
  rateData,
  isLoadingData
}: BusinessInsightsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set())
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null })
  const [displayedDatesCount, setDisplayedDatesCount] = useState(10)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [selectedProperty] = useSelectedProperty();
  // Process the data using the Angular logic
  const processedTableData = processTableData(
    demandData,
    otaRankData,
    eventData,
    holidayData,
    parityData,
    rateData,
    channelFilter || [],
    selectedProperty
  )

  // Log the received data for debugging
  useEffect(() => {
    if (demandData) {
      console.log('📊 Business Insights Table - Demand Data:', demandData)
    }
    if (otaRankData) {
      console.log('📈 Business Insights Table - OTA Rank Data:', otaRankData)
    }
    if (selectedChannels) {
      console.log('📋 Business Insights Table - Selected Channels:', selectedChannels)
    }
    if (processedTableData.length > 0) {
      console.log('🔄 Business Insights Table - Processed Data:', processedTableData)
    }
  }, [demandData, otaRankData, selectedChannels, processedTableData])

  // Transform processed data to match the expected format
  const transformedTableData = processedTableData.map((item, index) => ({
    id: `BI-${String(index + 1).padStart(3, '0')}`,
    date: item.formatDate || format(new Date(item.checkinDate), 'dd MMM'),
    messages: item.statements?.map((statement: any) => (
      <span dangerouslySetInnerHTML={{ __html: statement.statement }} />
    )) || [],
    subscriberAdr: item.percentageChangeInSubscriberAndAverageRate ?
      `${Math.abs(item.percentageChangeInSubscriberAndAverageRate)}%` : item.isSubscriberClosed ? 'Sold Out' : '--',
    subscriberAdrVariance: item.isSubscriberClosed ? '' : item.isSubscriberGreaterthanAvg ? 'up' : 'down',
    compRank: item.rank && item.totalCompWithRate ?
      `${item.rank}/${item.totalCompWithRate}` : '--',
    compRankColor: item.isSubscriberClosed ? '' : item.rank === 1 ? "1" : item.rank === item.totalCompWithRate ? "2" : '',
    holidays: item.isHolidayThere ? item.holiday?.holidayName || 'Holiday' : '--',
    events: item.event?.map((e: any) => e.eventName) || [],
    airline: item.airline || '--',
    demand: item.demandIndex || '--',
    otaRank: item.otaRank || '--',
    otaRankVariance: parseInt(item.otaRank) > 0 ?
      (item.isZeroChangeotaRank ? '0' : item.changeInOtaRank.toString()) : '--',
    parity: item.parityScore || '--',
    generatedBy: "System",
    createdDate: format(new Date(item.checkinDate), 'yyyy-MM-dd'),
    // Additional processed data
    ...item
  }))

  const handleInsightExpand = (insightDate: string) => {
    setExpandedRow(expandedRow === insightDate ? null : insightDate)
  }

  const handleInsightsToggle = (insightDate: string) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev)
      if (newSet.has(insightDate)) {
        newSet.delete(insightDate)
      } else {
        newSet.add(insightDate)
      }
      return newSet
    })
  }

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = null
    let sortKey: string | null = key

    if (sortConfig.key === key) {
      // Currently sorting this column - cycle through states
      if (sortConfig.direction === 'asc') {
        direction = 'desc'
      } else if (sortConfig.direction === 'desc') {
        // After descending, go back to default (no sorting)
        direction = null
        sortKey = null
      }
    } else {
      // Different column or no sorting - start with ascending
      direction = 'asc'
    }

    setSortConfig({ key: sortKey, direction })
  }

  const getSortIcon = (key: string) => {
    // Default state (grey) - when no sorting is applied to this column
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-3 h-3 font-bold text-gray-500 dark:text-gray-400" strokeWidth={2.5} />
    }

    // Ascending state (blue up arrow)
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="w-3 h-3 font-bold text-blue-600" strokeWidth={2.5} />
    }

    // Descending state (blue down arrow)
    if (sortConfig.direction === 'desc') {
      return <ArrowDown className="w-3 h-3 font-bold text-blue-600" strokeWidth={2.5} />
    }

    // Fallback to default state
    return <ArrowUpDown className="w-3 h-3 font-bold text-gray-500 dark:text-gray-400" strokeWidth={2.5} />
  }

  const getHoverIcon = (key: string) => {
    if (sortConfig.key === key) {
      return null
    }
    return <ArrowUpDown className="w-3 h-3 font-bold text-gray-500 dark:text-gray-400" strokeWidth={2.5} />
  }

  // Load more dates handler
  const handleLoadMoreDates = async () => {
    setIsLoadingMore(true)

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    setDisplayedDatesCount(prev => Math.min(prev + 10, transformedTableData.length))
    setIsLoadingMore(false)
  }

  const getSortedData = () => {
    if (!sortConfig.key || !sortConfig.direction) {
      return transformedTableData.slice(0, displayedDatesCount)
    }

    return [...transformedTableData].sort((a, b) => {
      let aValue: number
      let bValue: number

      if (sortConfig.key === 'subscriberAdr') {
        // Extract percentage value from strings like "48%", "47%", etc.
        aValue = parseFloat(a.subscriberAdr.replace('%', ''))
        bValue = parseFloat(b.subscriberAdr.replace('%', ''))
      } else {
        return 0
      }

      if (sortConfig.direction === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    }).slice(0, displayedDatesCount)
  }

  // Generate trend data based on selected date range from date picker
  const generateTrendData = (expandedDate: string) => {
    debugger;
    if (!startDate || !endDate) {
      debugger;
      // Fallback to first 90 dates if no date range is selected
      const allDates = transformedTableData.map(item => item.date)
      const maxDates = Math.min(90, allDates.length)
      const selectedDates = allDates.slice(0, maxDates)

      return selectedDates.map((date, i) => {
        const isExpandedDate = date === expandedDate
        const compAvgRate = Math.round(180 + Math.sin(i * 0.5) * 30 + (Math.random() - 0.5) * 20)
        const subscriberLowestRate = Math.round(160 + Math.sin(i * 0.3) * 25 + (Math.random() - 0.5) * 15)

        return {
          date: date,
          "Comp Avg Rate": compAvgRate,
          "Subscriber Lowest Rate": subscriberLowestRate,
          isExpandedDate: isExpandedDate
        }
      })
    }

    // Generate dates based on selected date range
    const dates = []
    const currentDate = new Date(startDate)
    const endDateObj = new Date(endDate)

    // Generate all dates in the selected range
    while (currentDate <= endDateObj) {
      dates.push(format(currentDate, "dd MMM"))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Limit to maximum 90 dates to prevent overcrowding
    const maxDates = Math.min(90, dates.length)
    const selectedDates = dates.slice(0, maxDates)

    const trendData = []

    // Generate data for selected dates
    for (let i = 0; i < selectedDates.length; i++) {
      const date = selectedDates[i]
      const isExpandedDate = date === expandedDate
      const allDatas = transformedTableData.find(item => item.date)
      // Generate realistic rate data with some variation
      const compAvgRate = allDatas?.avgCompset || 0
      const subscriberLowestRate = Number.isInteger(allDatas?.subscriberAdr)
        ? allDatas.subscriberAdr
        : 0;

      trendData.push({
        date: date,
        "Comp Avg Rate": compAvgRate,
        "Subscriber Lowest Rate": subscriberLowestRate,
        subscriberAdr:allDatas?.subscriberAdr,
        isExpandedDate: isExpandedDate
      })
    }

    return trendData
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "processing":
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      case "failed":
        return <div className="w-4 h-4 bg-red-600 rounded-full" />
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />
    }
  }

  const getReportTypeBadge = (type: string) => {
    const badgeStyles = {
      "Market Analysis": "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      "Rate Analysis": "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      "Competitive Analysis": "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
    }

    return (
      <Badge
        variant="secondary"
        className={badgeStyles[type as keyof typeof badgeStyles] || "bg-gray-100 text-gray-800"}
      >
        {type.split(' ')[0]}
      </Badge>
    )
  }

  return (
    <TooltipProvider>
      <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        {/* Table Heading */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Market Edge
            </h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-sm bg-slate-800 text-white border-slate-700">
                <p className="text-sm">
                  Comprehensive market analysis providing actionable insights on rate performance, competitive positioning, demand patterns, and revenue optimization opportunities for strategic decision-making.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Market trends, rate performance, and competitive insights for data-driven decisions
          </p>
        </div>

        {/* Table Header */}
        <div className="bg-gray-100 dark:bg-gray-800">
          <div className="flex px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide">
            <div className="flex items-start w-[9.5%] mr-3 pl-2">Date</div>
            <div className="flex items-start w-[39%] mr-3">Insights</div>
            <div className="flex flex-col items-start w-[11%] mr-3">
              <div
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => handleSort('subscriberAdr')}
              >
                <span>Subscriber ADR</span>
                <span className="ml-1 mt-0.5">
                  {getSortIcon('subscriberAdr')}
                </span>
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-xs font-normal">(vs Avg Comp)</div>
            </div>
            <div className="flex flex-col items-start w-[6.5%] mr-3">
              <div>Comp</div>
              <div>Rank</div>
            </div>
            <div className="flex items-start w-[6.5%] mr-3">Airline</div>
            <div className="flex flex-col items-start w-[6.5%] mr-3">
              <div>Demand /</div>
              <div>Events</div>
            </div>
            <div className="flex flex-col items-start w-[6.5%] mr-3">
              <div>OTA</div>
              <div>Rank</div>
            </div>
            <div className="flex items-start w-[6.5%]">Parity</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="bg-white dark:bg-gray-900 rounded-b-lg">
          {isLoadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <div className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
                  Loading business insights...
                </div>
                <div className="text-gray-400 dark:text-gray-500 text-sm">
                  Fetching demand and OTA rank data
                </div>
              </div>
            </div>
          ) : transformedTableData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
                  No reports found
                </div>
                <div className="text-gray-400 dark:text-gray-500 text-sm">
                  Try adjusting your filters or date range
                </div>
              </div>
            </div>
          ) : (
            getSortedData().map((report, index) => {
              const isExpanded = expandedRow === report.date
              const sortedData = getSortedData()
              const isNextRowExpanded = index < sortedData.length - 1 && expandedRow === sortedData[index + 1].date

              return (
                <div key={report.id}>
                  {/* Main Row */}
                  <div
                    className={`flex px-4 py-2 text-sm ${isNextRowExpanded
                      ? 'border-b border-blue-200 dark:border-blue-500'
                      : isExpanded && index === transformedTableData.length - 1
                        ? 'border-b-0'
                        : index === transformedTableData.length - 1
                          ? 'border-b border-gray-100 dark:border-gray-800 rounded-bl-lg'
                          : 'border-b border-gray-100 dark:border-gray-800'
                      } ${isExpanded
                        ? 'bg-blue-100 dark:bg-blue-800/30'
                        : index % 2 === 0
                          ? 'bg-white dark:bg-gray-900'
                          : 'bg-gray-50 dark:bg-gray-800/50'
                      }`}
                  >
                    {/* Date */}
                    <div className="flex items-center w-[9.5%] mr-3">
                      <button
                        onClick={() => handleInsightExpand(report.date)}
                        className="flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-md transition-colors p-2"
                      >
                        <span className="text-blue-600 font-medium text-sm">
                          {report.date}
                        </span>
                        <div className="w-4 h-4 border border-blue-600 dark:border-blue-600 rounded-full flex items-center justify-center">
                          {isExpanded ? (
                            <ChevronUp className="w-2.5 h-2.5 text-blue-600" strokeWidth="2.5" />
                          ) : (
                            <ChevronDown className="w-2.5 h-2.5 text-blue-600" strokeWidth="2.5" />
                          )}
                        </div>
                      </button>
                    </div>

                    {/* Insights */}
                    <div className="flex items-start w-[39%] mr-3">
                      {/* Messages Column */}
                      <div className="flex-1">
                        <div className="space-y-1">
                          {(() => {
                            const isExpanded = expandedInsights.has(report.date)
                            const shouldShowMore = report.messages.length > 3
                            const messagesToShow = shouldShowMore && !isExpanded ? report.messages.slice(0, 3) : report.messages

                            return (
                              <>
                                {messagesToShow.map((message: any, msgIndex: number) => (
                                  <div key={msgIndex} className="text-sm text-gray-700 dark:text-gray-300 break-words overflow-wrap-anywhere">
                                    • {message}
                                  </div>
                                ))}
                                {shouldShowMore && (
                                  <button
                                    onClick={() => handleInsightsToggle(report.date)}
                                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors ml-[14px] pt-1"
                                  >
                                    {isExpanded ? 'Show less' : 'Show more'}
                                  </button>
                                )}
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Subscriber ADR */}
                    <div className="flex items-center gap-2 w-[11%] mr-3">
                      <span className={`font-medium ${report.subscriberAdrVariance === "" ? '' : report.subscriberAdrVariance === "down" ? "text-green-600" : "text-red-600"}`}>{report.subscriberAdr}</span>
                      {report.subscriberAdrVariance === "" ? "" : report.subscriberAdrVariance === "down" ? (
                        <ArrowDown className="w-3 h-3 text-green-600" strokeWidth="2" />
                      ) : (
                        <ArrowUp className="w-3 h-3 text-red-600" strokeWidth="2" />
                      )}
                    </div>

                    {/* Comp Rank */}
                    <div className="flex items-center w-[6.5%] mr-3">
                      <span className={`font-medium text-gray-900 dark:text-gray-100 ${report.compRankColor === "1" ? "text-green-600" : report.compRankColor === "2" ? "text-red-600" : ""}`}>
                        {report.compRank}
                      </span>
                    </div>

                    {/* Airline */}
                    <div className="flex items-center w-[6.5%] mr-3">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{report.airline}</span>
                    </div>

                    {/* Demand */}
                    <div className="flex items-center w-[6.5%] mr-3">
                      <span className={`font-medium ${getDemandColor(report.demand)}`}>{report.demand}</span>
                      {Array.isArray(report.events) && report.events.length > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500 ml-[18px]" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-black text-white border-black text-xs px-2 py-1">
                              <div className="text-center">
                                {report.events.length <= 3 ? (
                                  <div>
                                    {report.events.slice(0, 2).join(", ") + (report.events.length === 3 ? "," : "")}
                                    {report.events.length === 3 && <br />}
                                    {report.events.length === 3 && report.events[2]}
                                  </div>
                                ) : (
                                  <div>
                                    {report.events.slice(0, 2).join(", ")}
                                    <br />
                                    {report.events[2]}, (+{report.events.length - 3} more)
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>

                    {/* OTA Rank */}
                    <div className="flex items-center w-[6.5%] mr-3">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{report.otaRank}</span>
                      <span className={`ml-2 text-xs ${report.otaRankVariance.startsWith('+') ? 'text-red-600' : report.otaRankVariance === '--' ? '' : 'text-green-600'}`}>
                        ({report.otaRankVariance})
                      </span>
                    </div>

                    {/* Parity */}
                    <div className="flex items-center w-[6.5%]">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{report.parity}</span>
                    </div>
                  </div>

                  {/* Expanded Row Content */}
                  {isExpanded && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-500">
                      <div className="space-y-4">
                        {/* 7-Day Trend Chart */}
                        <div className="bg-white dark:bg-slate-900 p-4">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 ml-2">
                            Rate Trend Analysis
                          </h4>

                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={generateTrendData(report.date)}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                              >
                                <XAxis
                                  dataKey="date"
                                  axisLine={{ stroke: "#e5e7eb" }}
                                  tickLine={{ stroke: "#e5e7eb" }}
                                  tick={(props) => {
                                    const { x, y, payload } = props
                                    const isExpandedDate = payload.value === report.date
                                    return (
                                      <g transform={`translate(${x},${y})`}>
                                        <text
                                          x={0}
                                          y={0}
                                          dy={16}
                                          textAnchor="middle"
                                          fill={isExpandedDate ? "#000000" : "#666"}
                                          fontSize={11}
                                          fontWeight={isExpandedDate ? "bold" : "normal"}
                                        >
                                          {payload.value}
                                        </text>
                                      </g>
                                    )
                                  }}
                                />
                                <YAxis
                                  tick={{ fontSize: 11, fill: "#666" }}
                                  axisLine={{ stroke: "#e5e7eb" }}
                                  tickLine={{ stroke: "#e5e7eb" }}
                                  tickFormatter={(value) => `$${value}`}
                                />
                                <RechartsTooltip
                                  contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                  }}
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      // Calculate dynamic width based on content
                                      const maxValueLength = Math.max(...payload.map((entry: any) => `$${entry.value}`.length))
                                      const baseWidth = 253
                                      const dynamicWidth = Math.max(baseWidth, baseWidth + (maxValueLength - 4) * 8) // Adjust for longer values

                                      return (
                                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3" style={{ minWidth: `${dynamicWidth}px` }}>
                                          <div className="mb-2">
                                            <div className="font-semibold text-gray-900 text-sm">
                                              {(() => {
                                                // Parse the label to get the date and add day of week
                                                const dateStr = label
                                                const date = new Date(dateStr)
                                                const dayOfWeek = format(date, 'EEE') // Mon, Tue, Wed, etc.
                                                return `${dateStr}, ${dayOfWeek}`
                                              })()}
                                            </div>
                                          </div>
                                          <div className="space-y-1">
                                            {payload.map((entry: any, index: number) => (
                                              <div key={index} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                  <div
                                                    className="w-2 h-2 rounded-sm"
                                                    style={{ backgroundColor: entry.color }}
                                                  />
                                                  <span className="text-sm text-gray-700">{entry.name}</span>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">
                                                  ${entry.value}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )
                                    }
                                    return null
                                  }}
                                />
                                {/* Vertical line to highlight expanded date */}
                                <ReferenceLine
                                  x={report.date}
                                  stroke="#3b82f6"
                                  strokeDasharray="2 2"
                                  strokeWidth={1}
                                  opacity={0.6}
                                />
                                <Line
                                  dataKey="Comp Avg Rate"
                                  stroke="#ef4444"
                                  strokeWidth={2}
                                  strokeDasharray="3 3"
                                  dot={(props) => {
                                    const { cx, cy, payload } = props
                                    const isExpandedDate = payload?.isExpandedDate
                                    return (
                                      <circle
                                        cx={cx}
                                        cy={cy}
                                        r={3}
                                        fill={isExpandedDate ? "#dc2626" : "#ef4444"}
                                        stroke={isExpandedDate ? "#dc2626" : "#ef4444"}
                                        strokeWidth={isExpandedDate ? 3 : 2}
                                      />
                                    )
                                  }}
                                  activeDot={{ r: 5, stroke: "#ef4444", strokeWidth: 2 }}
                                  name="Compset Avg. Rate"
                                />
                                <Line
                                  dataKey="Subscriber Lowest Rate"
                                  stroke="#3b82f6"
                                  strokeWidth={2}
                                  dot={(props) => {
                                    const { cx, cy, payload } = props
                                    const isExpandedDate = payload?.isExpandedDate
                                    return (
                                      <circle
                                        cx={cx}
                                        cy={cy}
                                        r={3}
                                        fill={isExpandedDate ? "#2563eb" : "#3b82f6"}
                                        stroke={isExpandedDate ? "#2563eb" : "#3b82f6"}
                                        strokeWidth={isExpandedDate ? 3 : 2}
                                      />
                                    )
                                  }}
                                  activeDot={{ r: 5, stroke: "#3b82f6", strokeWidth: 2 }}
                                  name="Subscriber Lowest Rate"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Legend */}
                          <div className="flex justify-center items-center gap-8 mt-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <div className="w-1 h-0.5 bg-red-500"></div>
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                <div className="w-1 h-0.5 bg-red-500"></div>
                              </div>
                              <span className="text-sm text-red-500">Compset Avg. Rate</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <div className="w-1 h-0.5 bg-blue-500"></div>
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                <div className="w-1 h-0.5 bg-blue-500"></div>
                              </div>
                              <span className="text-sm text-blue-500">Subscriber Lowest Rate</span>
                            </div>
                          </div>
                        </div>

                        {/* Additional Details */}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Load More Dates Button */}
        {transformedTableData.length > displayedDatesCount && (
          <div className="px-4 py-4">
            <div className="flex items-center justify-center">
              {isLoadingMore ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Loading dates...</span>
                </div>
              ) : (
                <button
                  onClick={handleLoadMoreDates}
                  className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200 text-sm bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md w-full"
                >
                  <span>Show {Math.min(10, transformedTableData.length - displayedDatesCount)} more dates</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

