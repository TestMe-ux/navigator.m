"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { 
  DollarSign, 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Percent, 
  Calendar,
  ArrowRight,
  ExternalLink,
  Target,
  Clock
} from "lucide-react"
import Link from "next/link"

/**
 * Weekly Pricing Data Interface
 * Defines the structure for day-of-week pricing information
 */
interface WeeklyPricingData {
  day: string
  shortDay: string
  date: string
  price: string
  change: string
  changePercent: number
  strategy: string
  reasoning: string
  color: string
  isWeekend: boolean
}

/**
 * Generate Weekly Pricing Data
 * Creates realistic pricing data starting from today with Dubai-specific patterns
 * Shows 7 days forward from current date for future pricing strategy
 * 
 * @returns Array of weekly pricing data starting from today
 */
const generateWeeklyPricingData = (): WeeklyPricingData[] => {
  console.log('💰 Generating weekly pricing data for Dubai market (starting from tomorrow)')
  
  const today = new Date()
  const weeklyData: WeeklyPricingData[] = []
  
  // Day names for reference
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const shortDayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  
  // Generate 7 days starting from tomorrow
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(today)
    currentDate.setDate(today.getDate() + i + 1) // +1 to start from tomorrow
    
    const dayOfWeek = currentDate.getDay() // 0 = Sunday, 6 = Saturday
    const dayName = dayNames[dayOfWeek]
    const shortDayName = shortDayNames[dayOfWeek]
    
    // Dubai weekend pattern: Friday (5) and Saturday (6)
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6
    
    // Generate pricing based on day of week
    let price: string
    let change: string
    let changePercent: number
    let strategy: string
    let reasoning: string
    let color: string
    
    if (dayOfWeek === 0) { // Sunday
      price = '$1,400'
      change = 'Baseline'
      changePercent = 0
      strategy = 'Week Start Optimization'
      reasoning = 'Corporate arrival optimization with promotional rate opportunities for loyalty members'
      color = 'blue'
    } else if (dayOfWeek === 1) { // Monday
      price = '$1,600'
      change = '+14%'
      changePercent = 14
      strategy = 'Business Focus Pricing'
      reasoning = 'Peak corporate demand period with business meeting optimization and premium positioning'
      color = 'emerald'
    } else if (dayOfWeek === 2) { // Tuesday
      price = '$1,650'
      change = '+18%'
      changePercent = 18
      strategy = 'Business Focus Pricing'
      reasoning = 'Highest corporate demand with corporate account targeting and meeting facilities premium'
      color = 'emerald'
    } else if (dayOfWeek === 3) { // Wednesday
      price = '$1,550'
      change = '+11%'
      changePercent = 11
      strategy = 'Mid-Week Balance'
      reasoning = 'Balanced business and leisure mix with extended stay optimization opportunities'
      color = 'purple'
    } else if (dayOfWeek === 4) { // Thursday
      price = '$1,750'
      change = '+25%'
      changePercent = 25
      strategy = 'Weekend Transition Pricing'
      reasoning = 'Bridge between business and leisure demand with early weekend arrival optimization'
      color = 'amber'
    } else if (dayOfWeek === 5) { // Friday
      price = '$2,100'
      change = '+50%'
      changePercent = 50
      strategy = 'Weekend Leisure Premium'
      reasoning = 'Dubai weekend start with leisure traveler focus and minimum stay requirements'
      color = 'red'
    } else { // Saturday
      price = '$2,300'
      change = '+64%'
      changePercent = 64
      strategy = 'Weekend Leisure Premium'
      reasoning = 'Peak weekend demand with premium resort amenities and family package optimization'
      color = 'red'
    }
    
    // Add small random variation for realism (±2-5%)
    const basePrice = parseInt(price.replace('$', '').replace(',', ''))
    const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
    const adjustedPrice = Math.round(basePrice * (1 + variation))
    
    weeklyData.push({
      day: dayName,
      shortDay: shortDayName,
      date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: `$${adjustedPrice.toLocaleString()}`,
      change: i === 0 ? 'Tomorrow' : change, // Mark first day as "Tomorrow"
      changePercent,
      strategy,
      reasoning,
      color: i === 0 ? 'blue' : color, // Highlight today in blue
      isWeekend
    })
  }

  console.log('✅ Weekly pricing data generated:', weeklyData.length, 'days starting from tomorrow')
  console.log('📅 Date range:', weeklyData[0].date, 'to', weeklyData[6].date)
  return weeklyData
}

/**
 * Get Color Classes for Pricing Strategy
 * Returns consistent color styling based on pricing strategy
 * 
 * @param color - Color theme identifier
 * @returns Object containing CSS classes for the color theme
 */
const getColorClasses = (color: string) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-l-blue-500',
      text: 'text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800 transition-colors'
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-l-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-800 transition-colors'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/20',
      border: 'border-l-purple-500',
      text: 'text-purple-600 dark:text-purple-400',
      badge: 'bg-purple-100 text-purple-700 hover:bg-purple-200 hover:text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-800 transition-colors'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-l-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-100 text-amber-700 hover:bg-amber-200 hover:text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800 transition-colors'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-l-red-500',
      text: 'text-red-600 dark:text-red-400',
      badge: 'bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800 transition-colors'
    }
  }
  return colorMap[color as keyof typeof colorMap] || colorMap.blue
}

/**
 * Weekly Pricing Strategy Drawer Props
 */
interface WeeklyPricingDrawerProps {
  /** Trigger element for the drawer */
  children: React.ReactNode
}

/**
 * Weekly Pricing Strategy Drawer Component
 * 
 * Professional drawer component that displays comprehensive weekly pricing strategy
 * with day-of-week analysis, reasoning, and direct navigation to rate trends page.
 * 
 * Features:
 * - Responsive design optimized for 1440px resolution
 * - Professional color coding for different pricing strategies
 * - Comprehensive pricing reasoning and market insights
 * - Direct integration with rate trends page
 * - Debugging and performance monitoring
 * 
 * @param props - Component props
 * @returns React component for weekly pricing drawer
 */
export function WeeklyPricingDrawer({ children }: WeeklyPricingDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const weeklyData = generateWeeklyPricingData()

  /**
   * Handle drawer open with debugging
   */
  const handleOpen = () => {
    console.log('📊 Opening weekly pricing drawer from enhanced "View Weekly Pricing Strategy" button')
    setIsOpen(true)
  }

  /**
   * Handle drawer close with debugging
   */
  const handleClose = () => {
    console.log('❌ Closing weekly pricing drawer')
    setIsOpen(false)
  }

  /**
   * Handle navigation to rate trends page
   */
  const handleNavigateToRateTrends = () => {
    console.log('🔗 Navigating to rate trends page from drawer')
    handleClose()
    // Navigation will be handled by the Link component
  }

  // Calculate weekly summary statistics
  const weekdayAverage = weeklyData
    .filter(day => !day.isWeekend)
    .reduce((sum, day) => sum + parseInt(day.price.replace('$', '').replace(',', '')), 0) / 5
  
  const weekendAverage = weeklyData
    .filter(day => day.isWeekend)
    .reduce((sum, day) => sum + parseInt(day.price.replace('$', '').replace(',', '')), 0) / 2

  const weekendPremium = Math.round(((weekendAverage - weekdayAverage) / weekdayAverage) * 100)

  console.log('📈 Weekly pricing statistics:', {
    weekdayAverage: Math.round(weekdayAverage),
    weekendAverage: Math.round(weekendAverage),
    weekendPremium
  })

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild onClick={handleOpen}>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl lg:max-w-4xl overflow-y-auto z-[9999]">
        <SheetHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
              <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-bold text-foreground">
                Weekly Pricing Strategy
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                7-day forward pricing strategy starting from today ({weeklyData[0]?.date} - {weeklyData[6]?.date})
              </SheetDescription>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">${Math.round(weekdayAverage).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Weekday Avg</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">${Math.round(weekendAverage).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Weekend Avg</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">+{weekendPremium}%</div>
              <div className="text-sm text-muted-foreground">Weekend Premium</div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* 7-Day Pricing Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              7-Day Forward AI Powered recommendations (Starting Tomorrow)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {weeklyData.map((day) => {
                const colors = getColorClasses(day.color)
                
                return (
                  <Card 
                    key={day.day} 
                    className={`card-minimal text-center hover:shadow-md transition-all duration-200 group border-l-4 ${colors.border} ${colors.bg} ${
                      day.change === 'Tomorrow' ? 'ring-2 ring-blue-300 dark:ring-blue-700 bg-blue-50 dark:bg-blue-950/30' : ''
                    }`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="space-y-1">
                        <div className={`text-xs font-semibold ${colors.text} uppercase tracking-wide`}>
                          {day.shortDay}
                        </div>
                        <div className="text-sm font-medium text-muted-foreground">
                          {day.date}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-xl font-bold text-foreground">
                          {day.price}
                        </div>
                        <Badge className={`text-xs ${
                          day.change === 'Tomorrow' 
                            ? 'bg-blue-500 text-white hover:bg-blue-500' 
                            : colors.badge
                        }`}>
                          {day.change}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-foreground">
                          {day.strategy}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {day.reasoning}
                        </div>
                      </div>
                      
                      <div className="flex gap-1 justify-center">
                        {day.isWeekend && (
                          <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800 hover:border-red-300 transition-colors">
                            Weekend
                          </Badge>
                        )}
                        {day.change !== 'Tomorrow' && (
                          <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 hover:border-emerald-300 transition-colors">
                            Future
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Strategy Insights */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5" />
              Pricing Strategy Insights
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Weekday Strategy */}
              <Card className="card-minimal">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    Weekday Focus (Sun-Thu)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Avg ADR</div>
                      <div className="text-lg font-bold text-foreground">${Math.round(weekdayAverage).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Target Mix</div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">70% Corp</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Focus Areas</div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs hover:bg-secondary/90 transition-colors">Corporate Accounts</Badge>
                      <Badge variant="secondary" className="text-xs hover:bg-secondary/90 transition-colors">Meeting Facilities</Badge>
                      <Badge variant="secondary" className="text-xs hover:bg-secondary/90 transition-colors">Business Services</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekend Strategy */}
              <Card className="card-minimal">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
                      <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    Weekend Premium (Fri-Sat)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Avg ADR</div>
                      <div className="text-lg font-bold text-foreground">${Math.round(weekendAverage).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Premium</div>
                      <div className="text-lg font-bold text-red-600 dark:text-red-400">+{weekendPremium}%</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Focus Areas</div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs hover:bg-secondary/90 transition-colors">Resort Amenities</Badge>
                      <Badge variant="secondary" className="text-xs hover:bg-secondary/90 transition-colors">Spa Services</Badge>
                      <Badge variant="secondary" className="text-xs hover:bg-secondary/90 transition-colors">Family Packages</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Navigation to Rate Trends */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950 dark:to-purple-950">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-foreground">
                  Detailed Rate Trends Analysis
                </div>
                <div className="text-sm text-muted-foreground">
                  View comprehensive rate trends, calendar view, and competitive analysis
                </div>
              </div>
              <Link href="/rate-trend" onClick={handleNavigateToRateTrends}>
                <Button className="btn-minimal">
                  View Rate Trends
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Last Updated Info */}
          <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-3 h-3" />
              Last updated: Today, {new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 