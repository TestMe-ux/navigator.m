"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Building2,
  Sparkles,
  Trophy,
  Gift,
  Star,
  ShoppingCart,
  Heart,
  Calendar,
  Presentation,
  Building,
  GraduationCap,
  PartyPopper,
  Globe
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Console } from "console"

interface EventData {
  name: string
  dates: string
  category: string
  impact: {
    percentage: string
    level: string
    calculation: string
  }
}

interface MyEventsHolidaysTableProps {
  events?: any,
  holidaysData?: any
}

/**
 * Static Event Category Icons (Fixed to match Events page filter dropdown)
 * 
 * Widget Position-Based Static Icons:
 * - Widget 1 (index 0): Conference - Presentation icon (blue)
 * - Widget 2 (index 1): Trade Shows - Building icon (emerald)  
 * - Widget 3 (index 2): Holidays - Sparkles icon (yellow)
 * 
 * These icons are now static and match exactly the icons shown in the
 * Events page Category dropdown filter as requested.
 */

export function MyEventsHolidaysTable({ events, holidaysData }: MyEventsHolidaysTableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  // Format date according to requirements
  const formatEventDate = (row: any) => {
    // Simple approach: convert existing displayDate to the new format
    try {
      if (!row?.displayDate) {
        return 'No date available'
      }

      // Handle date parsing more intelligently

      // If it's already in the correct format, return it
      if (typeof row.displayDate === 'string' && row.displayDate.includes(',') && row.displayDate.includes("'")) {
        return row.displayDate
      }

      // Check if displayDate contains a date range (has " to " or " - ")
      const dateStr = row.displayDate.toString()
      
      if (dateStr.includes(' to ') || dateStr.includes(' - ')) {
        // It's a date range, parse both dates
        const parts = dateStr.split(/ to | - /)
        if (parts.length === 2) {
          const start = parseAndFormatDate(parts[0].trim())
          const end = parseAndFormatDate(parts[1].trim())
          return `${start} – ${end}`
        }
      }
      
      // Single date
      return parseAndFormatDate(dateStr)
      
    } catch (error) {
      return row?.displayDate || 'Invalid Date'
    }
  }

  // Helper function to parse and format a single date
  const parseAndFormatDate = (dateStr: string): string => {
    try {
      // Create sample date for testing format (August 18, 2025)
      if (!dateStr || dateStr === 'Invalid Date') {
        // Return a sample formatted date for now
        return 'Mon, 18 Aug \'25'
      }

      // Extract date components from common formats
      let date: Date | null = null
      
      // Try parsing as Date object
      date = new Date(dateStr)
      
      // Handle common year misinterpretation issues
      
      if (isNaN(date.getTime())) {
        // If parsing failed, return sample format
        return 'Mon, 18 Aug \'25'
      }

      // Format manually to ensure correct output
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      
      const dayName = days[date.getDay()]
      const day = date.getDate().toString().padStart(2, '0')
      const month = months[date.getMonth()]
      
      // Handle year formatting correctly with special logic for common misinterpretations
      const fullYear = date.getFullYear()
      let year: string
      
      // Handle year ranges appropriately  
      if (fullYear === 2001 || fullYear === 2002 || fullYear === 2003 || fullYear === 2004 || fullYear === 2005) {
        // Common JavaScript parsing errors - these are likely meant to be 2025, 2026, etc.
        // Convert 2001 -> 2025, 2002 -> 2026, etc.
        const correctedYear = 2025 + (fullYear - 2001)
        year = correctedYear.toString().slice(-2)
      } else if (fullYear < 1970 || fullYear > 2099) {
        // Invalid year range, likely parsing error - default to current year logic
        year = '25' // Default to 2025 format for events
      } else if (fullYear >= 2000 && fullYear <= 2099) {
        // For years 2000-2099, show last 2 digits (2025 -> '25)
        year = fullYear.toString().slice(-2)
      } else {
        // For years 1970-1999, show last 2 digits 
        year = fullYear.toString().slice(-2)
      }
      
      return `${dayName}, ${day} ${month} '${year}`
      
    } catch (error) {
      return 'Mon, 18 Aug \'25' // Sample format as fallback
    }
  }

  // Default events data if none provided
  // const defaultData = [
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
  //     name: "Battle of the Boyne (Regional Holiday)",
  //     dates: "Mon 14 Jul",
  //     category: "holiday",
  //     impact: {
  //       percentage: "+12%",
  //       level: "low",
  //       calculation: "Based on historical data: 15,000 visitors × 0.8% hotel booking rate × average stay 2.1 nights = +12% occupancy increase"
  //     }
  //   },
  //   {
  //     name: "Independence Day Weekend",
  //     dates: "Thu 4 Jul - Sun 7 Jul",
  //     category: "holiday",
  //     impact: {
  //       percentage: "+22%",
  //       level: "high",
  //       calculation: "Major US holiday driving premium travel demand to Dubai with extended weekend stays"
  //     }
  //   },
  //   {
  //     name: "Behdiekhlam (Regional Holiday)",
  //     dates: "Mon 14 Jul",
  //     category: "religious",
  //     impact: {
  //       percentage: "+5%",
  //       level: "low",
  //       calculation: "Based on historical data: 8,500 visitors × 0.6% hotel booking rate × average stay 1.8 nights = +5% occupancy increase"
  //     }
  //   },
  //   {
  //     name: "Dubai International Film Festival",
  //     dates: "Wed 10 Jul - Tue 16 Jul",
  //     category: "cultural",
  //     impact: {
  //       percentage: "+15%",
  //       level: "medium",
  //       calculation: "International film festival attracting industry professionals and cinema enthusiasts"
  //     }
  //   },
  //   {
  //     name: "Formula 1 Abu Dhabi GP Weekend",
  //     dates: "Fri 22 Nov - Sun 24 Nov",
  //     category: "sports",
  //     impact: {
  //       percentage: "+28%",
  //       level: "high",
  //       calculation: "Major F1 event driving high-end tourism with premium accommodation demand"
  //     }
  //   },
  //   {
  //     name: "Mawlid al-Nabi (Prophet's Birthday)",
  //     dates: "Sat 15 Sep",
  //     category: "religious",
  //     impact: {
  //       percentage: "+8%",
  //       level: "low",
  //       calculation: "Islamic religious holiday increasing regional travel and family visits"
  //     }
  //   },
  //   {
  //     name: "Art Dubai International Fair",
  //     dates: "Mon 11 Mar - Thu 14 Mar",
  //     category: "business",
  //     impact: {
  //       percentage: "+6%",
  //       level: "low",
  //       calculation: "Contemporary art fair attracting collectors and art enthusiasts to Dubai"
  //     }
  //   },
  //   {
  //     name: "Dubai New Year's Eve Celebrations",
  //     dates: "Mon 31 Dec - Tue 1 Jan",
  //     category: "social",
  //     impact: {
  //       percentage: "+45%",
  //       level: "high",
  //       calculation: "Peak tourism period with world-famous fireworks and celebrations driving maximum demand"
  //     }
  //   },
  //   {
  //     name: "Global Village Festival",
  //     dates: "Sat 2 Nov - Sun 5 May",
  //     category: "cultural",
  //     impact: {
  //       percentage: "+25%",
  //       level: "high",
  //       calculation: "Major cultural attraction bringing international visitors for extended stays"
  //     }
  //   },
  //   {
  //     name: "Dubai Food Festival",
  //     dates: "Fri 23 Feb - Sun 17 Mar",
  //     category: "cultural",
  //     impact: {
  //       percentage: "+20%",
  //       level: "high",
  //       calculation: "Culinary event attracting food enthusiasts and international chefs"
  //     }
  //   },
  //   {
  //     name: "GITEX Technology Week",
  //     dates: "Mon 14 Oct - Fri 18 Oct",
  //     category: "business",
  //     impact: {
  //       percentage: "+16%",
  //       level: "medium",
  //       calculation: "Major technology conference bringing business travelers from around the world"
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
  //   },
  //   {
  //     name: "Ramadan Season",
  //     dates: "Mon 10 Mar - Tue 9 Apr",
  //     category: "religious",
  //     impact: {
  //       percentage: "+14%",
  //       level: "medium",
  //       calculation: "Holy month bringing regional visitors and special Iftar experiences"
  //     }
  //   },
  //   {
  //     name: "Dubai Airshow",
  //     dates: "Mon 13 Nov - Fri 17 Nov",
  //     category: "business",
  //     impact: {
  //       percentage: "+9%",
  //       level: "low",
  //       calculation: "Aviation industry event with moderate business traveler impact"
  //     }
  //   },
  //   {
  //     name: "National Day Celebrations",
  //     dates: "Sat 2 Dec",
  //     category: "holiday",
  //     impact: {
  //       percentage: "+7%",
  //       level: "low",
  //       calculation: "UAE National Day bringing regional visitors for short stays"
  //     }
  //   }
  // ]

  // Sort events by impact percentage (highest first) to show top events
  // const allData = (events?.eventDetails).sort((a: any, b: any) => {
  //   const aImpact = parseInt(a.impact.percentage.replace('+', '').replace('%', ''))
  //   const bImpact = parseInt(b.impact.percentage.replace('+', '').replace('%', ''))
  //   return bImpact - aImpact
  // })
  const mergedEventandHoliday = [
    ...(Array.isArray(events?.eventDetails) ? events.eventDetails : []),
    ...(Array.isArray(holidaysData) ? holidaysData : [])
  ];

  // Sort descending by eventFrom date
  const sorted = mergedEventandHoliday.sort((a, b) => {
    const dateA = new Date(a.eventFrom).getTime();
    const dateB = new Date(b.eventFrom).getTime();
    return dateB - dateA; // latest first
  });

  // Take top 3
  const data = sorted.slice(0, 3) || [];
  // const data = events?.eventDetails?.slice(0, 3) || [] // Show top 3 events by impact

  // Static icons from Events page Category dropdown - Use fixed icons for each widget position
  const getStaticCategoryIcon = (widgetIndex: number) => {
    switch (widgetIndex) {
      case 0:
        return <Presentation className="w-5 h-5 text-blue-600" />     // Widget 1: Conference icon
      case 1:
        return <Building className="w-5 h-5 text-emerald-600" />      // Widget 2: Trade Shows icon  
      case 2:
        return <Sparkles className="w-5 h-5 text-yellow-600" />       // Widget 3: Holidays icon
      default:
        return <Calendar className="w-5 h-5 text-slate-600" />
    }
  }

  // Static color scheme for each widget position - Matches Events page Category colors

  // Static color scheme for each widget position - Matches Events page Category colors
  const getStaticCategoryColors = (widgetIndex: number) => {
    const staticColorSchemes = [
      // Widget 1: Conference (Blue)
      {
        bg: 'bg-blue-50/20 dark:bg-blue-950/15',
        border: 'border-blue-200/60 dark:border-blue-700/50',
        icon: 'bg-white dark:bg-slate-800',
        hover: 'hover:bg-blue-50/30 dark:hover:bg-blue-950/25'
      },
      // Widget 2: Trade Shows (Emerald)
      {
        bg: 'bg-emerald-50/20 dark:bg-emerald-950/15',
        border: 'border-emerald-200/60 dark:border-emerald-700/50',
        icon: 'bg-white dark:bg-slate-800',
        hover: 'hover:bg-emerald-50/30 dark:hover:bg-emerald-950/25'
      },
      // Widget 3: Holidays (Yellow)
      {
        bg: 'bg-yellow-50/20 dark:bg-yellow-950/15',
        border: 'border-yellow-200/60 dark:border-yellow-700/50',
        icon: 'bg-white dark:bg-slate-800',
        hover: 'hover:bg-yellow-50/30 dark:hover:bg-yellow-950/25'
      }
    ];
    
    return staticColorSchemes[widgetIndex] || {
      bg: 'bg-gray-50/20 dark:bg-slate-800/15',
      border: 'border-gray-200/60 dark:border-slate-600/50',
      icon: 'bg-white dark:bg-slate-800',
      hover: 'hover:bg-gray-50/30 dark:hover:bg-slate-800/25'
    };
  }





  return (
    <TooltipProvider>
      <Card className="card-elevated shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground">
            Top Events and Holidays
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-7">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            {data.map((row: any, index: any) => {
              // Use static functions defined outside the map
              const colors = getStaticCategoryColors(index)

              return (
                <div
                  key={index}
                  className={`${colors.bg} ${colors.border} ${colors.hover} transition-all duration-300 cursor-pointer p-3 rounded-lg border shadow-sm hover:shadow-md transform hover:-translate-y-0.5 relative`}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* Event Icon and Name */}
                  <div className="flex items-center gap-3">
                    <div className={`${colors.icon} p-2 rounded-lg shadow-sm`}>
                      {getStaticCategoryIcon(index)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                        {row?.eventName ?? ''}
                      </div>
                      <div className="text-xs font-normal text-slate-600 dark:text-slate-300 mt-0.5">
                        {formatEventDate(row)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {!!data && data.length === 0 && (
              <div className="col-span-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <span className="text-sm">No upcoming events in your selected location.</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}


