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
  Calendar
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
  events?: any
}

export function MyEventsHolidaysTable({ events }: MyEventsHolidaysTableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

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
  const data = events?.eventDetails?.slice(0, 3) || [] // Show top 3 events by impact





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
              // Get colored icon for category
              const getCategoryIcon = (category: string) => {
                switch (category) {
                  case 'business':
                    return <Building2 className="w-5 h-5 text-emerald-600" />
                  case 'cultural':
                    return <Sparkles className="w-5 h-5 text-purple-600" />
                  case 'sports':
                    return <Trophy className="w-5 h-5 text-orange-600" />
                  case 'holiday':
                    return <Gift className="w-5 h-5 text-yellow-600" />
                  case 'religious':
                    return <Star className="w-5 h-5 text-indigo-600" />
                  case 'retail':
                    return <ShoppingCart className="w-5 h-5 text-rose-600" />
                  case 'social':
                    return <Heart className="w-5 h-5 text-blue-600" />
                  default:
                    return <Calendar className="w-5 h-5 text-slate-600" />
                }
              }

              // Enhanced color scheme based on category
              const getCategoryColors = (category: string) => {
                switch (category) {
                  case 'business':
                    return {
                      bg: 'bg-emerald-50/20 dark:bg-emerald-950/15',
                      border: 'border-emerald-200/60 dark:border-emerald-700/50',
                      icon: 'bg-white dark:bg-slate-800',
                      hover: 'hover:bg-emerald-50/30 dark:hover:bg-emerald-950/25'
                    }
                  case 'cultural':
                    return {
                      bg: 'bg-purple-50/20 dark:bg-purple-950/15',
                      border: 'border-purple-200/60 dark:border-purple-700/50',
                      icon: 'bg-white dark:bg-slate-800',
                      hover: 'hover:bg-purple-50/30 dark:hover:bg-purple-950/25'
                    }
                  case 'sports':
                    return {
                      bg: 'bg-orange-50/20 dark:bg-orange-950/15',
                      border: 'border-orange-200/60 dark:border-orange-700/50',
                      icon: 'bg-white dark:bg-slate-800',
                      hover: 'hover:bg-orange-50/30 dark:hover:bg-orange-950/25'
                    }
                  case 'holiday':
                    return {
                      bg: 'bg-yellow-50/20 dark:bg-yellow-950/15',
                      border: 'border-yellow-200/60 dark:border-yellow-700/50',
                      icon: 'bg-white dark:bg-slate-800',
                      hover: 'hover:bg-yellow-50/30 dark:hover:bg-yellow-950/25'
                    }
                  case 'retail':
                    return {
                      bg: 'bg-rose-50/20 dark:bg-rose-950/15',
                      border: 'border-rose-200/60 dark:border-rose-700/50',
                      icon: 'bg-white dark:bg-slate-800',
                      hover: 'hover:bg-rose-50/30 dark:hover:bg-rose-950/25'
                    }
                  case 'religious':
                    return {
                      bg: 'bg-indigo-50/20 dark:bg-indigo-950/15',
                      border: 'border-indigo-200/60 dark:border-indigo-700/50',
                      icon: 'bg-white dark:bg-slate-800',
                      hover: 'hover:bg-indigo-50/30 dark:hover:bg-indigo-950/25'
                    }
                  case 'social':
                    return {
                      bg: 'bg-blue-50/20 dark:bg-blue-950/15',
                      border: 'border-blue-200/60 dark:border-blue-700/50',
                      icon: 'bg-white dark:bg-slate-800',
                      hover: 'hover:bg-blue-50/30 dark:hover:bg-blue-950/25'
                    }
                  default:
                    return {
                      bg: 'bg-gray-50/20 dark:bg-slate-800/15',
                      border: 'border-gray-200/60 dark:border-slate-600/50',
                      icon: 'bg-white dark:bg-slate-800',
                      hover: 'hover:bg-gray-50/30 dark:hover:bg-slate-800/25'
                    }
                }
              }

              const colors = getCategoryColors(row.eventType)

              return (
                <div
                  key={index}
                  className={`${colors.bg} ${colors.border} ${colors.hover} transition-all duration-300 cursor-pointer p-3 rounded-lg border shadow-sm hover:shadow-md transform hover:-translate-y-0.5 relative`}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* Impact Badge in Top Right */}
                  <div className="absolute top-2 right-2">
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge className={`text-xs px-2 py-0.5 font-medium transition-colors ${row.eventColor.toLowerCase() === 'high' ? 'bg-red-500 text-white border-red-600 hover:bg-red-600' :
                          row.eventColor.toLowerCase() === 'medium' ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600' :
                            'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600'
                          }`}>
                          {row.eventColor.charAt(0).toUpperCase() + row.eventColor.slice(1)}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        {/* <p className="text-sm">{row.impact.calculation}</p> */}
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Event Icon and Name */}
                  <div className="flex items-center gap-3 pr-16">
                    <div className={`${colors.icon} p-2 rounded-lg shadow-sm`}>
                      {getCategoryIcon(row.eventType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                        {row?.eventName ?? ''}
                      </div>
                      <div className="text-xs font-normal text-slate-600 dark:text-slate-300 mt-0.5">
                        {row?.displayDate ?? ''}
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


