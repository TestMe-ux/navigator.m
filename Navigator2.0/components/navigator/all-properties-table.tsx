"use client"
import React, { useState, useEffect, useMemo } from "react"
import { ChevronLeft, Plus, Minus, Star, ChevronDown, ChevronUp, ChevronRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useScreenSize } from "@/hooks/use-screen-size"
import { useDateContext } from "@/components/date-context"
import { AllPropertiesTooltip } from "./all-properties-tooltip"
import { format } from "date-fns"

interface AllPropertiesTableProps {
  className?: string
  competitorStartIndex?: number
  digitCount?: number
  selectedProperties?: string[]
  clusterData?: any
}

export function AllPropertiesTable({
  className,
  competitorStartIndex = 0,
  digitCount = 4,
  selectedProperties = [],
  clusterData = []
}: AllPropertiesTableProps) {
  const [expandedHotels, setExpandedHotels] = useState<Set<string>>(new Set([]))
  const [currentDateIndex, setCurrentDateIndex] = useState(0)
  const [screenWidth, setScreenWidth] = useState(1920)

  // Screen size detection for responsive date columns
  const screenSize = useScreenSize()

  // Get actual dates from date context
  const { startDate, endDate } = useDateContext()

  // Generate dates based on actual start and end dates from context
  const generateDatesFromContext = () => {
    if (!startDate || !endDate) {
      // Fallback to default dates if context dates are not available
      const today = new Date()
      const defaultEndDate = new Date(today)
      defaultEndDate.setDate(today.getDate() + 30)
      return generateDateRange(today, defaultEndDate)
    }

    return generateDateRange(startDate, endDate)
  }

  // Generate date range between start and end dates
  const generateDateRange = (start: Date, end: Date) => {
    const dates: string[] = []
    const dayNames: string[] = []
    const dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const currentDate = new Date(start)
    const endDate = new Date(end)

    while (currentDate <= endDate) {
      const dayName = dayNamesShort[currentDate.getDay()]
      const dateStr = `${currentDate.getDate()} ${currentDate.toLocaleDateString('en', { month: 'short' })}`

      dates.push(dateStr)
      dayNames.push(dayName)

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return { dates, dayNames }
  }

  const { dates, dayNames } = useMemo(() => {
    return generateDatesFromContext()
  }, [startDate, endDate])

  // Calculate dates per page based on screen resolution
  const getDatesPerPage = () => {
    const { isSmall, isMedium, isLarge } = screenSize

    if (screenSize.width < 1352) {
      // Lower than 1352px - show 6 dates
      return 6
    } else if (isSmall) {
      // Between 1352px - 1500px - show 7 dates
      return 7
    } else if (isMedium) {
      // Between 1501px - 1800px - show 9 dates
      return 9
    } else if (isLarge) {
      // Above 1800px - show 12 dates
      return 12
    } else {
      // Default fallback
      return 6
    }
  }

  const datesPerPage = getDatesPerPage()

  // Track screen width for character limits
  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth)
    }
    updateScreenWidth()
    window.addEventListener('resize', updateScreenWidth)
    return () => window.removeEventListener('resize', updateScreenWidth)
  }, [])

  // Reset currentDateIndex when dates change
  useEffect(() => {
    setCurrentDateIndex(0)
  }, [dates])

  // Fixed hotel data for 60 days - consistent across refreshes
  const generateHotelRates = (hotelId: string, baseRate: number, currency: string, dates: string[]) => {
    const rates: Record<string, {
      status: string;
      rate: number;
      minRate?: number;
      maxRate?: number;
      isHighlighted?: boolean;
      rateType?: 'highest' | 'cheapest' | 'normal'
    }> = {}

    // Fixed patterns for consistent data
    const patterns = {
      "1": { // Chaidee Mansi (THB)
        baseRate: 1500,
        variations: [0.85, 1.15, 0.9, 1.1, 0.95, 1.05, 0.88, 1.12, 0.92, 1.08],
        tnaDays: [5, 12, 19, 26, 33, 40, 47, 54],
        npDays: [8, 15, 22, 29, 36, 43, 50, 57],
        closedDays: [3, 10, 17, 24, 31, 38, 45, 52, 59]
      },
      "2": { // City Hotel Gotl (EUR)
        baseRate: 120,
        variations: [0.8, 1.2, 0.85, 1.15, 0.9, 1.1, 0.88, 1.12, 0.92, 1.08],
        tnaDays: [2, 9, 16, 23, 30, 37, 44, 51, 58],
        npDays: [6, 13, 20, 27, 34, 41, 48, 55],
        closedDays: [4, 11, 18, 25, 32, 39, 46, 53]
      },
      "3": { // Swiss-Belinn Si (IDR)
        baseRate: 5000000,
        variations: [0.9, 1.1, 0.85, 1.15, 0.88, 1.12, 0.92, 1.08, 0.95, 1.05],
        tnaDays: [1, 7, 14, 21, 28, 35, 42, 49, 56],
        npDays: [3, 10, 17, 24, 31, 38, 45, 52, 59],
        closedDays: [6, 13, 20, 27, 34, 41, 48, 55]
      }
    }

    const pattern = patterns[hotelId as keyof typeof patterns] || patterns["1"]

    dates.forEach((date, index) => {
      const dayIndex = index + 1
      let status: string
      let rate: number
      let minRate: number
      let maxRate: number

      if (pattern.tnaDays.includes(dayIndex)) {
        status = "--"
        rate = 0
        minRate = 0
        maxRate = 0
        rates[date] = {
          status,
          rate,
          minRate,
          maxRate,
          isHighlighted: dayIndex % 7 === 0,
          rateType: 'normal'
        }
      } else if (pattern.npDays.includes(dayIndex)) {
        status = "--"
        rate = 0
        minRate = 0
        maxRate = 0
        rates[date] = {
          status,
          rate,
          minRate,
          maxRate,
          isHighlighted: dayIndex % 7 === 0,
          rateType: 'normal'
        }
      } else if (pattern.closedDays.includes(dayIndex)) {
        status = "Closed"
        rate = Math.floor(baseRate * pattern.variations[index % pattern.variations.length])
        const variation = rate * 0.15
        minRate = Math.floor(rate - variation)
        maxRate = Math.floor(rate + variation)
        rates[date] = {
          status,
          rate,
          minRate,
          maxRate,
          isHighlighted: dayIndex % 7 === 0,
          rateType: 'normal'
        }
      } else {
        rate = Math.floor(baseRate * pattern.variations[index % pattern.variations.length])
        status = rate.toLocaleString('en-US')

        // Determine rate type based on day index for variety
        let rateType: 'highest' | 'cheapest' | 'normal' = 'normal'
        const dayMod = dayIndex % 7

        if (dayMod === 1) {
          rateType = 'highest' // Red - highest rate
          minRate = Math.floor(rate * 0.85)
          maxRate = Math.floor(rate * 1.15)
        } else if (dayMod === 3) {
          rateType = 'cheapest' // Green - cheapest rate
          minRate = Math.floor(rate * 0.85)
          maxRate = Math.floor(rate * 1.15)
        } else {
          rateType = 'normal' // Black - normal rate
          minRate = Math.floor(rate * 0.85)
          maxRate = Math.floor(rate * 1.15)
        }

        rates[date] = {
          status,
          rate,
          minRate,
          maxRate,
          isHighlighted: dayIndex % 7 === 0, // Highlight every 7th day
          rateType: rateType
        }
      }
    })

    return rates
  }

  // Property data mapping for the first 3 columns (Competitiveness, Availability, Parity Score)
  const propertyMetricsData: Record<string, { competitiveness: number | null, availability: number | null, parityScore: number | null }> = {
    "Chaidee Mansi Bangkok Riverside Luxury Resort & Spa": { competitiveness: 85, availability: 78, parityScore: 82 },
    "City Hotel Gottingen Downtown Business Center": { competitiveness: 92, availability: 65, parityScore: 88 },
    "Swiss-Belinn Singapore Marina Bay Financial District": { competitiveness: 78, availability: 88, parityScore: 76 },
    "Grand Palace Hotel Tokyo Shibuya Premium Suites & Conference Center": { competitiveness: 95, availability: 75, parityScore: 85 },
    "Royal Heritage Resort Mumbai Bandra Kurla Complex Business District": { competitiveness: 88, availability: 69, parityScore: 44 },
    "Oceanfront Paradise Resort & Spa": { competitiveness: 91, availability: 74, parityScore: 48 },
    "Metropolitan Plaza Business Hotel": { competitiveness: 87, availability: 82, parityScore: 51 },
    "Historic Grand Hotel Downtown": { competitiveness: 89, availability: 71, parityScore: 58 },
    "Business Center Inn & Suites": { competitiveness: 83, availability: 86, parityScore: 54 },
    "Riverside Retreat Luxury Resort": { competitiveness: 90, availability: 77, parityScore: 67 },
    "Downtown Business Hotel Plaza": { competitiveness: 86, availability: 73, parityScore: 62 },
    "Garden View Resort & Conference Center": { competitiveness: 84, availability: 80, parityScore: 59 },
    "Executive Suites Downtown": { competitiveness: 93, availability: 68, parityScore: 71 },
    "City Center Hotel & Spa": { competitiveness: 81, availability: 85, parityScore: 46 },
    "Luxury Business Inn & Suites": { competitiveness: 88, availability: 72, parityScore: 63 },
    "Coastal Resort & Spa Paradise": { competitiveness: 94, availability: 66, parityScore: 69 },
    "Urban Business Plaza Hotel": { competitiveness: 87, availability: 79, parityScore: 55 },
    "Historic Downtown Inn & Suites": { competitiveness: 85, availability: 81, parityScore: 57 },
    "Executive Business Center Hotel": { competitiveness: 91, availability: 70, parityScore: 65 },
    "Premium City Hotel & Conference Center": { competitiveness: 89, availability: 76, parityScore: 61 },
    "Seaside Resort & Spa Luxury": { competitiveness: 92, availability: 74, parityScore: 68 },
    "City Hotel Gotland Business Center": { competitiveness: 86, availability: 78, parityScore: 52 },
    "Grand Palace Hotel Premium Suites": { competitiveness: 90, availability: 75, parityScore: 64 },
    "Mountain View Lodge & Resort": { competitiveness: 88, availability: 82, parityScore: 58 },
    "Urban Business Center Plaza": { competitiveness: 84, availability: 77, parityScore: 56 }
  }

  // Generate hotel data dynamically - expanded to 25 hotels
  // const allHotels = [
  //   {
  //     id: "1",
  //     name: "Chaidee Mansi Bangkok Riverside Luxury Resort & Spa",
  //     currency: "THB",
  //     symbol: "฿",
  //     rates: generateHotelRates("1", 2000, "THB", dates)
  //   },
  //   {
  //     id: "2",
  //     name: "City Hotel Gottingen Downtown Business Center",
  //     currency: "EUR",
  //     symbol: "€",
  //     rates: generateHotelRates("2", 100, "EUR", dates)
  //   },
  //   {
  //     id: "3",
  //     name: "Swiss-Belinn Singapore Marina Bay Financial District",
  //     currency: "IDR",
  //     symbol: "Rp",
  //     rates: generateHotelRates("3", 5000000, "IDR", dates)
  //   },
  //   {
  //     id: "4",
  //     name: "Grand Palace Hotel Tokyo Shibuya Premium Suites & Conference Center",
  //     currency: "JPY",
  //     symbol: "¥",
  //     rates: generateHotelRates("4", 15000, "JPY", dates)
  //   },
  //   {
  //     id: "5",
  //     name: "Royal Heritage Resort Mumbai Bandra Kurla Complex Business District",
  //     currency: "INR",
  //     symbol: "₹",
  //     rates: generateHotelRates("5", 8000, "INR", dates)
  //   },
  //   {
  //     id: "6",
  //     name: "Oceanfront Paradise Resort & Spa",
  //     currency: "USD",
  //     symbol: "$",
  //     rates: generateHotelRates("6", 250, "USD", dates)
  //   },
  //   {
  //     id: "7",
  //     name: "Metropolitan Plaza Business Hotel",
  //     currency: "EUR",
  //     symbol: "€",
  //     rates: generateHotelRates("7", 120, "EUR", dates)
  //   },
  //   {
  //     id: "8",
  //     name: "Historic Grand Hotel Downtown",
  //     currency: "GBP",
  //     symbol: "£",
  //     rates: generateHotelRates("8", 180, "GBP", dates)
  //   },
  //   {
  //     id: "9",
  //     name: "Business Center Inn & Suites",
  //     currency: "CAD",
  //     symbol: "C$",
  //     rates: generateHotelRates("9", 150, "CAD", dates)
  //   },
  //   {
  //     id: "10",
  //     name: "Riverside Retreat Luxury Resort",
  //     currency: "AUD",
  //     symbol: "A$",
  //     rates: generateHotelRates("10", 200, "AUD", dates)
  //   },
  //   {
  //     id: "11",
  //     name: "Downtown Business Hotel Plaza",
  //     currency: "USD",
  //     symbol: "$",
  //     rates: generateHotelRates("11", 180, "USD", dates)
  //   },
  //   {
  //     id: "12",
  //     name: "Garden View Resort & Conference Center",
  //     currency: "EUR",
  //     symbol: "€",
  //     rates: generateHotelRates("12", 140, "EUR", dates)
  //   },
  //   {
  //     id: "13",
  //     name: "Executive Suites Downtown",
  //     currency: "USD",
  //     symbol: "$",
  //     rates: generateHotelRates("13", 220, "USD", dates)
  //   },
  //   {
  //     id: "14",
  //     name: "City Center Hotel & Spa",
  //     currency: "JPY",
  //     symbol: "¥",
  //     rates: generateHotelRates("14", 18000, "JPY", dates)
  //   },
  //   {
  //     id: "15",
  //     name: "Luxury Business Inn & Suites",
  //     currency: "USD",
  //     symbol: "$",
  //     rates: generateHotelRates("15", 190, "USD", dates)
  //   },
  //   {
  //     id: "16",
  //     name: "Coastal Resort & Spa Paradise",
  //     currency: "USD",
  //     symbol: "$",
  //     rates: generateHotelRates("16", 280, "USD", dates)
  //   },
  //   {
  //     id: "17",
  //     name: "Urban Business Plaza Hotel",
  //     currency: "EUR",
  //     symbol: "€",
  //     rates: generateHotelRates("17", 160, "EUR", dates)
  //   },
  //   {
  //     id: "18",
  //     name: "Historic Downtown Inn & Suites",
  //     currency: "USD",
  //     symbol: "$",
  //     rates: generateHotelRates("18", 170, "USD", dates)
  //   },
  //   {
  //     id: "19",
  //     name: "Executive Business Center Hotel",
  //     currency: "USD",
  //     symbol: "$",
  //     rates: generateHotelRates("19", 210, "USD", dates)
  //   },
  //   {
  //     id: "20",
  //     name: "Premium City Hotel & Conference Center",
  //     currency: "USD",
  //     symbol: "$",
  //     rates: generateHotelRates("20", 240, "USD", dates)
  //   },
  //   {
  //     id: "21",
  //     name: "Seaside Resort & Spa Luxury",
  //     currency: "USD",
  //     symbol: "$",
  //     rates: generateHotelRates("21", 300, "USD", dates)
  //   },
  //   {
  //     id: "22",
  //     name: "City Hotel Gotland Business Center",
  //     currency: "EUR",
  //     symbol: "€",
  //     rates: generateHotelRates("22", 130, "EUR", dates)
  //   },
  //   {
  //     id: "23",
  //     name: "Grand Palace Hotel Premium Suites",
  //     currency: "JPY",
  //     symbol: "¥",
  //     rates: generateHotelRates("23", 20000, "JPY", dates)
  //   },
  //   {
  //     id: "24",
  //     name: "Mountain View Lodge & Resort",
  //     currency: "USD",
  //     symbol: "$",
  //     rates: generateHotelRates("24", 160, "USD", dates)
  //   },
  //   {
  //     id: "25",
  //     name: "Urban Business Center Plaza",
  //     currency: "USD",
  //     symbol: "$",
  //     rates: generateHotelRates("25", 175, "USD", dates)
  //   }
  // ]

  // Property name mapping from dropdown to table - expanded for all 25 hotels
  // const propertyNameMapping: Record<string, string[]> = {
  //   "Seaside Resort & Spa": ["Chaidee Mansi Bangkok Riverside Luxury Resort & Spa", "Seaside Resort & Spa Luxury"],
  //   "City Hotel Gotland": ["City Hotel Gottingen Downtown Business Center", "City Hotel Gotland Business Center"],
  //   "Grand Palace Hotel": ["Grand Palace Hotel Tokyo Shibuya Premium Suites & Conference Center", "Grand Palace Hotel Premium Suites"],
  //   "Mountain View Lodge": ["Royal Heritage Resort Mumbai Bandra Kurla Complex Business District", "Mountain View Lodge & Resort"],
  //   "Urban Business Center": ["City Hotel Gottingen Downtown Business Center", "Urban Business Center Plaza"],
  //   "Riverside Inn": ["Chaidee Mansi Bangkok Riverside Luxury Resort & Spa", "Riverside Retreat Luxury Resort"],
  //   "Downtown Plaza": ["Grand Palace Hotel Tokyo Shibuya Premium Suites & Conference Center", "Downtown Business Hotel Plaza"],
  //   "Garden Hotel": ["Royal Heritage Resort Mumbai Bandra Kurla Complex Business District", "Garden View Resort & Conference Center"],
  //   "Business Tower": ["City Hotel Gottingen Downtown Business Center", "Business Center Inn & Suites"],
  //   "Luxury Suites": ["Swiss-Belinn Singapore Marina Bay Financial District", "Executive Suites Downtown"],
  //   "Oceanfront Paradise": ["Oceanfront Paradise Resort & Spa"],
  //   "Metropolitan Plaza": ["Metropolitan Plaza Business Hotel"],
  //   "Historic Grand Hotel": ["Historic Grand Hotel Downtown"],
  //   "Business Center Inn": ["Business Center Inn & Suites"],
  //   "Riverside Retreat": ["Riverside Retreat Luxury Resort"],
  //   "Downtown Business Hotel": ["Downtown Business Hotel Plaza"],
  //   "Garden View Resort": ["Garden View Resort & Conference Center"],
  //   "Executive Suites": ["Executive Suites Downtown"],
  //   "City Center Hotel": ["City Center Hotel & Spa"],
  //   "Luxury Business Inn": ["Luxury Business Inn & Suites"],
  //   "Coastal Resort & Spa": ["Coastal Resort & Spa Paradise"],
  //   "Urban Business Plaza": ["Urban Business Plaza Hotel"],
  //   "Historic Downtown Inn": ["Historic Downtown Inn & Suites"],
  //   "Executive Business Center": ["Executive Business Center Hotel"],
  //   "Premium City Hotel": ["Premium City Hotel & Conference Center"]
  // }

  // Filter hotels based on selected properties
  const hotels = React.useMemo(() => {
    debugger;
    if (!clusterData) return
    if (selectedProperties.length === 0) {
      return clusterData // Show all hotels if no properties selected
    }

    // Get all hotel names that match selected properties
    const selectedHotelNames = selectedProperties.flatMap(property =>
      property || []
    )

    // Filter hotels based on selected names
    return clusterData.filter((hotel: any) =>
      selectedHotelNames.includes(hotel?.hotels?.name)
    )
  }, [selectedProperties])


  // Show dates based on screen resolution with consistent column count
  // First 3 columns are blank, start showing dates from 4th column
  const actualDates = dates.slice(currentDateIndex, currentDateIndex + datesPerPage - 3)
  const actualDayNames = dayNames.slice(currentDateIndex, currentDateIndex + datesPerPage - 3)

  // Create fixed array with datesPerPage columns, first 3 are blank, rest show actual dates
  const visibleDates = Array.from({ length: datesPerPage }, (_, index) => {
    if (index < 3) {
      return '' // First 3 columns are blank
    } else {
      const dateIndex = index - 3
      return dateIndex < actualDates.length ? actualDates[dateIndex] : ''
    }
  })
  const visibleDayNames = Array.from({ length: datesPerPage }, (_, index) => {
    if (index < 3) {
      return '' // First 3 columns are blank
    } else {
      const dayIndex = index - 3
      return dayIndex < actualDayNames.length ? actualDayNames[dayIndex] : ''
    }
  })


  // Navigation functions
  const nextDates = () => {
    setCurrentDateIndex(prev => prev + (datesPerPage - 3))
  }

  const prevDates = () => {
    setCurrentDateIndex(prev => Math.max(0, prev - (datesPerPage - 3)))
  }

  const canGoNext = () => {
    return currentDateIndex + (datesPerPage - 3) < dates.length
  }

  const canGoPrev = () => {
    return currentDateIndex > 0
  }

  const toggleHotelExpansion = (hotelName: string) => {
    debugger;
    setExpandedHotels(prev => {
      const newSet = new Set(prev)
      if (newSet.has(hotelName)) {
        newSet.delete(hotelName)
      } else {
        newSet.add(hotelName)
      }
      return newSet
    })
  }

  const getStatusColor = (status: string) => {
    if (status === "--") return "text-gray-500 dark:text-gray-400"
    if (status === "C") return "text-red-500 dark:text-red-400"
    return "text-green-600 dark:text-green-400"
  }

  const getRateColor = (rateData: any) => {
    if (rateData?.status === "--" || rateData?.status === "C") {
      return getStatusColor(rateData?.status)
    }

    // For numeric rates, use rateType
    if (rateData?.highestRatePropName === rateData?.hoverPropertyName && rateData?.rate > 0) {
      return "text-red-500 dark:text-red-400"
    } else if (rateData?.lowestRatePropName === rateData?.hoverPropertyName && rateData?.rate > 0) {
      return "text-green-600 dark:text-green-400"
    } else {
      return "text-gray-900 dark:text-gray-100"
    }
  }

  return (
    <div className={`w-full bg-white dark:bg-slate-900 mt-4 mb-5 border-b border-gray-200 dark:border-gray-700 ${className || ''}`}>
      <div className="relative">
        {/* Previous Arrow */}
        <div className="absolute top-5 z-10" style={{
          left: screenWidth < 1352 ? '65.5%' :
            screenWidth >= 1352 && screenWidth <= 1500 ? '58.5%' :
              screenWidth >= 1501 && screenWidth <= 1800 ? '48.5%' : '38.5%'
        }}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={prevDates}
                  disabled={!canGoPrev()}
                  className={`p-1 rounded-md border ${canGoPrev()
                    ? 'border-gray-300 hover:bg-gray-50 text-gray-700 bg-white dark:bg-slate-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300'
                    : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                    }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                <p className="text-xs">Previous dates</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Next Arrow */}
        <div className="absolute right-[10px] top-5 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={nextDates}
                  disabled={!canGoNext()}
                  className={`p-1 rounded-md border ${canGoNext()
                    ? 'border-gray-300 hover:bg-gray-50 text-gray-700 bg-white dark:bg-slate-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300'
                    : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                    }`}
                >
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                <p className="text-xs">Next dates</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>


        <table className="w-full relative table-auto border-collapse overflow-hidden">
          {/* Header */}
          <thead className="bg-gray-50 dark:bg-gray-800 rounded-t-lg">
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="pl-4 pr-2 py-3 text-left text-sm font-normal text-muted-foreground border-r border-gray-200 dark:border-gray-700 border-t border-gray-200 dark:border-gray-700" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                <span>Properties</span>
              </th>
              {visibleDates.map((date, index) => (
                <th key={date || `blank-${index}`} className={`px-2 py-3 text-center ${index < 3 ? 'text-xs' : 'text-[10px]'} text-muted-foreground ${index === 2 ? 'border-r border-gray-300 dark:border-gray-600 border-t border-gray-200 dark:border-gray-700' : 'border-r border-gray-200 dark:border-gray-700 border-t border-gray-200 dark:border-gray-700'} ${visibleDayNames[index] === 'Sat' || visibleDayNames[index] === 'Sun' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`} style={{ width: '80px', minWidth: '50px', maxWidth: '80px' }}>
                  <div className="flex flex-col">
                    {index < 3 ? (
                      // First 3 columns show metrics headers
                      index === 0 ? (
                        <>
                          <span className="leading-tight">Competi-</span>
                          <span className="leading-tight">tiveness</span>
                        </>
                      ) : index === 1 ? (
                        <span>Availability</span>
                      ) : (
                        <>
                          <span className="leading-tight">Parity</span>
                          <span className="leading-tight">Score</span>
                        </>
                      )
                    ) : (
                      // Date columns show actual dates
                      <>
                        <span>{date || ''}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{visibleDayNames[index] || ''}</span>
                      </>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {hotels.map((hotel: any) => (
              <React.Fragment key={hotel.hotels?.hmid}>
                <tr className={`hover:bg-blue-50 dark:hover:bg-blue-900/20 ${expandedHotels.has(hotel.hotels.name) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                  <td className="pl-4 pr-2 py-3 border-r border-gray-200 dark:border-gray-700" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                    <div className="flex items-start gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="w-4 h-4 border border-blue-600 dark:border-blue-600 rounded-full flex items-center justify-center hover:border-blue-700 transition-colors cursor-pointer mt-1"
                              onClick={() => toggleHotelExpansion(hotel.hotels.name)}
                            >
                              {expandedHotels.has(hotel.hotels.name) ? (
                                <ChevronUp className="w-2.5 h-2.5 text-blue-600 hover:text-blue-700" strokeWidth="2.5" />
                              ) : (
                                <ChevronDown className="w-2.5 h-2.5 text-blue-600 hover:text-blue-700" strokeWidth="2.5" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-black text-white border-black text-xs px-2 py-1">
                            <p>{expandedHotels.has(hotel.hotels.name) ? "Collapse" : "Expand"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <div className="flex flex-col gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-blue-600 hover:text-blue-800 font-medium text-sm cursor-pointer">
                                {(() => {
                                  let maxLength = 22

                                  if (screenWidth < 1352) {
                                    maxLength = 22
                                  } else if (screenWidth >= 1352 && screenWidth <= 1500) {
                                    maxLength = 18
                                  } else if (screenWidth >= 1501 && screenWidth <= 1800) {
                                    maxLength = 20
                                  } else {
                                    maxLength = 24
                                  }

                                  return hotel.hotels.name.length > maxLength
                                    ? hotel.hotels.name.substring(0, maxLength) + '...'
                                    : hotel.hotels.name
                                })()}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="bg-black text-white border-black text-xs px-2 py-1">
                              <p>Click to detailed analysis</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Currency: {hotel.hotels.currencySymbol}
                        </span>
                      </div>
                    </div>
                  </td>
                  {visibleDates.map((date, index) => {
                    // Handle first 3 columns (metrics data)
                    if (index < 3) {
                      const metricsData = hotel
                      return (
                        <td key={`metrics-${index}`} className={`px-2 py-3 text-center border-r ${index === 2 ? 'border-gray-400 dark:border-gray-500' : 'border-gray-200 dark:border-gray-700'} ${visibleDayNames[index] === 'Sat' || visibleDayNames[index] === 'Sun' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`} style={{ width: '80px', minWidth: '50px', maxWidth: '80px' }}>
                          <div className="flex flex-col gap-0.5">
                            {index === 0 ? (
                              <span className={`text-sm font-medium ${metricsData?.competitiveness > 70 ? 'text-emerald-400' : metricsData?.competitiveness <= 40 ? 'text-red-600' : metricsData?.competitiveness > 40 ? 'text-orange-400 dark:text-gray-100' : 'text-gray-400'}`}>
                                {metricsData?.competitiveness === null ? '--' : `${metricsData?.competitiveness}%`}
                              </span>
                            ) : index === 1 ? (
                              <span className={`text-sm font-medium ${metricsData?.availability > 70 ? 'text-emerald-400' : metricsData?.availability <= 40 ? 'text-red-600' : metricsData?.availability > 40 ? 'text-orange-400 dark:text-gray-100' : 'text-gray-400'}`}>
                                {metricsData?.availability === null ? '--' : `${metricsData?.availability}%`}
                              </span>
                            ) : (
                              <span className={`text-sm font-medium ${metricsData?.parityScore > 70 ? 'text-emerald-400' : metricsData?.parityScore <= 40 ? 'text-red-600' : metricsData?.parityScore > 40 ? 'text-orange-400 dark:text-gray-100' : 'text-gray-400'}`}>
                                {metricsData?.parityScore === null ? '--' : `${metricsData?.parityScore}%`}
                              </span>
                            )}
                          </div>
                        </td>
                      )
                    }

                    // Handle blank columns (empty dates)
                    if (!date) {
                      return (
                        <td key={`blank-${index}`} className={`px-2 py-3 text-center border-r border-gray-200 dark:border-gray-700 ${index === hotels.length - 1 && index === visibleDates.length - 1 ? 'rounded-br-lg' : ''}`} style={{ width: '80px', minWidth: '50px', maxWidth: '80px' }}>
                          <div className="flex flex-col">
                          </div>
                        </td>
                      )
                    }

                    const rateData = hotel.pricePositioningEntites.find((x: any) => x.propertyType === 0)?.subscriberPropertyRate.find((x: any) => format(x.checkInDateTime, 'd MMM') === date)
                    const lowestRateData = hotel.pricePositioningEntites.find((x: any) => x.propertName === rateData?.lowestRatePropName)?.subscriberPropertyRate.find((x: any) => format(x.checkInDateTime, 'd MMM') === date)
                    const highestRateData = hotel.pricePositioningEntites.find((x: any) => x.propertName === rateData?.highestRatePropName)?.subscriberPropertyRate.find((x: any) => format(x.checkInDateTime, 'd MMM') === date)
                    // const avgCompsetRateData = hotel.pricePositioningEntites.find((x: any) => x.propertyType === 2)?.subscriberPropertyRate[index]
                    // console.log(rateData, date)
                    return (
                      <td key={date} className={`px-2 py-3 text-center border-r border-gray-200 dark:border-gray-700 ${visibleDayNames[index] === 'Sat' || visibleDayNames[index] === 'Sun' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`} style={{ width: '80px', minWidth: '50px', maxWidth: '80px' }}>
                        {rateData?.status !== 'O' && rateData?.status !== 'C' ? (
                          <div className="flex flex-col gap-0.5">
                            <span className={`text-sm font-medium ${getRateColor(rateData)}`}>
                              --
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {rateData?.compsetAverage > 0 ? rateData?.compsetAverage.toLocaleString('en-US') : ''}
                            </span>
                          </div>
                        ) : (
                          <TooltipProvider delayDuration={0}>
                            <Tooltip delayDuration={0} disableHoverableContent>
                              <TooltipTrigger asChild>
                                <div className="flex flex-col gap-0.5 cursor-pointer">
                                  <span className={`text-sm font-medium ${getRateColor(rateData)}`}>
                                    {rateData?.status === 'O' ? parseInt(rateData?.rate).toLocaleString('en-US') : rateData?.status === 'C' ? 'Sold Out' : ''}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {rateData?.compsetAverage > 0 ? rateData?.compsetAverage.toLocaleString('en-US') : ''}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <AllPropertiesTooltip
                                date={rateData?.checkInDateTime}
                                dayName={visibleDayNames[index] || ''}
                                rate={rateData?.rate}
                                variance={rateData?.rate > 0 ? Math.floor(rateData?.rate * 0.1) : 0}
                                hasEvent={rateData?.event?.eventDetails.length > 0}
                                eventNames={rateData?.event?.eventDetails.length > 0 ? rateData?.event?.eventDetails : []}
                                hotelName={hotel.hotels?.name}
                                lowestRate={lowestRateData}
                                highestRate={highestRateData}
                                rowIndex={hotels.indexOf(hotel.hotels)}
                                rateEntry={rateData}
                                currency={hotel.hotels?.currencySymbol}
                                symbol={hotel.hotels?.currencySymbol}
                              />
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </td>
                    )
                  })}
                </tr>
                {expandedHotels.has(hotel.hotels.name) && (
                  <tr>
                    {/* Property column with legends */}
                    <td className="pl-4 pr-2 py-3 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                      <div className="space-y-4">
                        <div className="flex items-start gap-2">
                          <div className="flex items-center justify-center" style={{ width: '20px', minWidth: '20px' }}>
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 text-left">Current Rate</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="flex items-center justify-center" style={{ width: '20px', minWidth: '20px' }}>
                            <div className="relative w-0.5 h-4 bg-blue-300 dark:bg-blue-400">
                              <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-red-500"></div>
                              <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-green-500"></div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 text-left">Rate Range</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center" style={{ width: '20px', minWidth: '20px' }}>
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 text-left">Events/Holidays</span>
                        </div>
                      </div>
                    </td>

                    {/* Date columns with graph */}
                    {visibleDates.map((date, index) => {
                      // Handle first 3 columns in expanded state (show --)
                      if (index < 3) {
                        return (
                          <td key={`expanded-metrics-${index}`} className={`px-2 py-3 text-center border-r ${index === 2 ? 'border-gray-400 dark:border-gray-500' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800 ${visibleDayNames[index] === 'Sat' || visibleDayNames[index] === 'Sun' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`} style={{ width: '80px', minWidth: '50px', maxWidth: '80px' }}>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium text-gray-400"></span>
                            </div>
                          </td>
                        )
                      }
                      // Handle blank columns (empty dates)
                      if (!date) {
                        return (
                          <td key={`blank-${index}`} className={`px-2 py-3 text-center border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 ${visibleDayNames[index] === 'Sat' || visibleDayNames[index] === 'Sun' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`} style={{ width: '80px', minWidth: '50px', maxWidth: '80px' }}>
                            <div className="relative" style={{ height: '200px' }}>
                              <div className="absolute top-5 w-full" style={{ height: '160px' }}>
                                {/* Empty chart area for blank column */}
                                <div className="relative h-full flex items-center justify-center">
                                </div>
                              </div>
                            </div>
                          </td>
                        )
                      }

                      return (
                        <td key={date} className={`px-2 py-3 text-center border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 ${visibleDayNames[index] === 'Sat' || visibleDayNames[index] === 'Sun' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`} style={{ width: '80px', minWidth: '50px', maxWidth: '80px' }}>
                          <div className="relative" style={{ height: '180px' }}>
                            <div className="absolute top-5 w-full" style={{ height: '140px' }}>
                              {/* Y-axis labels */}
                              {index === 3 && (() => {
                                debugger;
                                console.log("hotel", hotel)
                                const allSubRate = hotel?.pricePositioningEntites.find((x: any) => x.propertyType === 0)?.subscriberPropertyRate
                                const allRatesHighest = allSubRate?.map((r: any) => r.highestRate).filter((r: any) => r > 0)
                                const allRatesLowest = allSubRate?.map((r: any) => r.lowestRate).filter((r: any) => r > 0)
                                const globalMinRate = allRatesLowest?.length > 0 ? Math.min(...allRatesLowest) : 0 || 0
                                const globalMaxRate = allRatesHighest?.length > 0 ? Math.max(...allRatesHighest) : 0 || 0
                                const yAxisRange = globalMaxRate - globalMinRate
                                let divisor = 1;
                                let suffix = '';
                                // Determine if we should use K or M based on the range
                                if (globalMaxRate >= 1000000) {
                                  divisor = 1000000;
                                  suffix = 'M';
                                } else if (globalMaxRate >= 1000) {
                                  divisor = 1_000;
                                  suffix = 'K';
                                }

                                // Calculate proper Y-axis values with correct ordering (bottom to top)
                                const bottomValue = globalMinRate
                                const lowerMidValue = globalMinRate + (yAxisRange * 0.33)
                                const upperMidValue = globalMaxRate - (yAxisRange * 0.33)
                                const topValue = globalMaxRate

                                // Calculate values and ensure they're in ascending order
                                const rawValues = [
                                  Math.floor(bottomValue / divisor),
                                  Math.floor(lowerMidValue / divisor),
                                  Math.floor(upperMidValue / divisor),
                                  Math.floor(topValue / divisor)
                                ]

                                // Sort values in ascending order (bottom to top)
                                const sortedValues = [...rawValues].sort((a, b) => a - b)

                                // Ensure unique values by adding small increments if needed
                                const uniqueValues: number[] = []
                                sortedValues.forEach((val, idx) => {
                                  let uniqueVal = val
                                  while (uniqueValues.includes(uniqueVal)) {
                                    uniqueVal += 1
                                  }
                                  uniqueValues.push(uniqueVal)
                                })

                                return (
                                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>{uniqueValues[3]}{suffix}</span>
                                    <span>{uniqueValues[2]}{suffix}</span>
                                    <span>{uniqueValues[1]}{suffix}</span>
                                    <span>{uniqueValues[0]}{suffix}</span>
                                  </div>
                                )
                              })()}

                              {/* Graph area */}
                              <div className={`relative h-full ${index === 3 ? 'ml-3' : ''}`}>
                                {/* Range bar for this date */}
                                {(() => {
                                  debugger;
                                  const rateData = hotel?.pricePositioningEntites.find((x: any) => x.propertyType === 0)?.subscriberPropertyRate.find((x: any) => format(x.checkInDateTime, 'd MMM') === date)
                                  const lowestRateData = hotel?.pricePositioningEntites.find((x: any) => x.propertName === rateData?.lowestRatePropName)?.subscriberPropertyRate.find((x: any) => format(x.checkInDateTime, 'd MMM') === date)
                                  const highestRateData = hotel?.pricePositioningEntites.find((x: any) => x.propertName === rateData?.highestRatePropName)?.subscriberPropertyRate.find((x: any) => format(x.checkInDateTime, 'd MMM') === date)
                                  // Simple data structure - can be easily extended
                                  const rangeData = {
                                    currentRate: rateData?.status === "O" ? Math.round(rateData.rate) : 0,
                                    minRate: Math.round(rateData?.lowestRate || 0),
                                    maxRate: Math.round(rateData?.highestRate || 0),
                                    rateType: rateData?.rateType || 'normal'
                                  }

                                  // Calculate Y-axis range (price range, not starting from 0)
                                  const allSubRate = hotel?.pricePositioningEntites.find((x: any) => x.propertyType === 0)?.subscriberPropertyRate
                                  const allRates = allSubRate?.map((r: any) => r.rate).filter((r: any) => r > 0)
                                  const globalMinRate = allRates?.length > 0 ? Math.min(...allRates) : 0 || 0
                                  const globalMaxRate = allRates?.length > 0 ? Math.max(...allRates) : 0 || 0
                                  const yAxisRange = globalMaxRate - globalMinRate

                                  // Calculate range bar height and position (constrained within Y-axis)
                                  const maxBarHeight = 100 // Maximum height to prevent overflow
                                  const rangeHeight = yAxisRange > 0 ? Math.min(((rangeData.maxRate - rangeData.minRate) / yAxisRange) * 120, maxBarHeight) : 0

                                  // Position blue dot based on rate type
                                  let currentPosition = 0;

                                  if (rangeData.maxRate !== rangeData.minRate) {
                                    const relativeWithinRange = (rangeData.currentRate - rangeData.minRate) / (rangeData.maxRate - rangeData.minRate);

                                    // DO NOT FLIP — because the bar grows from bottom to top
                                    currentPosition = relativeWithinRange * rangeHeight;

                                    // Clamp
                                    currentPosition = Math.max(0, Math.min(currentPosition, rangeHeight));
                                  } else {
                                    currentPosition = rangeHeight / 2;
                                  }


                                  // Center the range bar in the Y-axis (with constraints)
                                  const availableHeight = 120
                                  const barBottomOffset = yAxisRange > 0 ? Math.max(10, Math.min(110 - rangeHeight, ((rangeData.minRate - globalMinRate) / yAxisRange) * availableHeight)) : 0

                                  return rateData && rateData?.status === '--' ? (
                                    <TooltipProvider delayDuration={0}>
                                      <Tooltip delayDuration={0} disableHoverableContent>
                                        <TooltipTrigger asChild>
                                          <div className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer px-1.5" style={{ bottom: `${barBottomOffset}px` }}>
                                            {/* Thin range bar */}
                                            <div
                                              className="w-0.5 bg-blue-300 dark:bg-blue-400"
                                              style={{ height: `${rangeHeight}px` }}
                                            >
                                              {/* Red cap at top (max rate) - constrained within bounds */}
                                              <div
                                                className="absolute left-1/2 transform -translate-x-1/2 h-0.5 bg-red-500"
                                                style={{
                                                  width: '16px',
                                                  top: '0px'
                                                }}
                                              ></div>
                                              {/* Green cap at bottom (min rate) - constrained within bounds */}
                                              <div
                                                className="absolute left-1/2 transform -translate-x-1/2 h-0.5 bg-green-500"
                                                style={{
                                                  width: '16px',
                                                  bottom: '0px'
                                                }}
                                              ></div>
                                              {/* Current price marker (filled blue circle) */}
                                              <div
                                                className="absolute left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"
                                                style={{ bottom: `${currentPosition}px` }}
                                              ></div>
                                            </div>
                                          </div>
                                        </TooltipTrigger>
                                        <AllPropertiesTooltip
                                          date={rateData?.checkInDateTime}
                                          dayName={visibleDayNames[index] || ''}
                                          rate={rateData?.rate}
                                          variance={rateData?.rate > 0 ? Math.floor(rateData?.rate * 0.1) : 0}
                                          hasEvent={rateData?.event?.eventDetails.length > 0}
                                          eventNames={rateData?.event?.eventDetails.length > 0 ? rateData?.event?.eventDetails : []}
                                          hotelName={hotel.hotels?.name}
                                          lowestRate={lowestRateData}
                                          highestRate={highestRateData}
                                          rowIndex={hotels.indexOf(hotel.hotels)}
                                          rateEntry={rateData}
                                          currency={hotel.hotels?.currencySymbol}
                                          symbol={hotel.hotels?.currencySymbol}
                                        />
                                      </Tooltip>
                                    </TooltipProvider>
                                  ) : (
                                    <>
                                      <TooltipProvider delayDuration={0}>
                                        <Tooltip delayDuration={0} disableHoverableContent>
                                          <TooltipTrigger asChild>
                                            <div className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer px-1.5" style={{ bottom: `${barBottomOffset}px` }}>
                                              {/* Thin range bar */}
                                              <div
                                                className="w-0.5 bg-blue-300 dark:bg-blue-400"
                                                style={{ height: `${rangeHeight}px` }}
                                              >
                                                {/* Red cap at top (max rate) - constrained within bounds */}
                                                <div
                                                  className="absolute left-1/2 transform -translate-x-1/2 h-0.5 bg-red-500"
                                                  style={{
                                                    width: '16px',
                                                    top: '0px'
                                                  }}
                                                ></div>
                                                {/* Green cap at bottom (min rate) - constrained within bounds */}
                                                <div
                                                  className="absolute left-1/2 transform -translate-x-1/2 h-0.5 bg-green-500"
                                                  style={{
                                                    width: '16px',
                                                    bottom: '0px'
                                                  }}
                                                ></div>
                                                {/* Current price marker (filled blue circle) */}
                                                {rateData?.rate > 0 && (<div
                                                  className="absolute left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"
                                                  style={{ bottom: `${currentPosition}px` }}
                                                ></div>)}
                                              </div>
                                            </div>
                                          </TooltipTrigger>
                                          {rateData?.rate > 0 || lowestRateData?.rate > 0 || highestRateData?.rate > 0 && (
                                            <AllPropertiesTooltip
                                              date={rateData?.checkInDateTime}
                                              dayName={visibleDayNames[index] || ''}
                                              rate={rateData?.rate}
                                              variance={rateData?.rate > 0 ? Math.floor(rateData?.rate * 0.1) : 0}
                                              hasEvent={rateData?.event?.eventDetails.length > 0}
                                              eventNames={rateData?.event?.eventDetails.length > 0 ? rateData?.event?.eventDetails : []}
                                              hotelName={hotel.hotels?.name}
                                              lowestRate={lowestRateData}
                                              highestRate={highestRateData}
                                              rowIndex={hotels.indexOf(hotel.hotels)}
                                              rateEntry={rateData}
                                              currency={hotel.hotels?.currencySymbol}
                                              symbol={hotel.hotels?.currencySymbol}
                                            />)}
                                        </Tooltip>
                                      </TooltipProvider>
                                      {rateData?.event?.eventDetails.length > 0 &&
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1 px-1 py-0.5 rounded" style={{ bottom: '-26px' }}>
                                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-black text-white border-black text-xs px-3 py-2 max-w-xs">
                                              <div className="space-y-1">
                                                <div> {rateData?.event?.eventDetails[0]?.eventName}</div>
                                                {/* <div>Business Conference</div> */}
                                                <div className="text-gray-300"> {rateData?.event?.eventDetails.length > 1 && ` +${rateData?.event?.eventDetails.length - 1} more`}</div>
                                              </div>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>}
                                    </>
                                  )
                                })()}
                              </div>
                            </div>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
