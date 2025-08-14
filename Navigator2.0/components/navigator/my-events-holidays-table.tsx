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

export function MyEventsHolidaysTable({ events, holidaysData }: MyEventsHolidaysTableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const mergedEventandHoliday = [
    ...(Array.isArray(events?.eventDetails) ? events.eventDetails : []),
    ...(Array.isArray(holidaysData) ? holidaysData : [])
  ];

  // Sort descending by eventFrom date
  const sorted = mergedEventandHoliday.sort((a, b) => {
    const dateA = new Date(a.eventFrom).getTime();
    const dateB = new Date(b.eventFrom).getTime();
    return dateA - dateB; // latest first
  });

  // Take top 3
  const data = sorted.slice(0, 3) || [];
  





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


