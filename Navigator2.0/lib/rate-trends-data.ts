/**
 * Comprehensive Rate Trends Database Schema and Sample Data
 * This file contains all data structures and sample data for the Rate Trends page
 * to eliminate external dependencies during development
 */

export interface RateData {
  id: string
  date: string
  dayOfWeek: string
  currentPrice: number
  recommendedPrice?: number
  marketAverage: number
  competitorPrices: {
    [key: string]: number
  }
  occupancyRate: number
  demand: 'low' | 'medium' | 'high' | 'very-high'
  isFuture: boolean
  isToday: boolean
  events?: string[]
  seasonality: 'low' | 'shoulder' | 'peak'
  roomsAvailable: number
  totalRooms: number
  averageDailyRate: number
  revPAR: number
  ratePosition: number
  parityScore: number
  lossAmount: number
  reasoningText?: string
}

export interface CalendarViewData {
  monthYear: string
  weeks: RateData[][]
  summary: {
    totalRevenue: number
    averageRate: number
    occupancyRate: number
    competitorComparison: {
      ahead: number
      behind: number
      equal: number
    }
  }
}

export interface KPIData {
  periodInfo: {
    label: string
    formattedStartDate: string
    formattedEndDate: string
    daysDifference: number
  }
  ratePosition: {
    current: number
    change: number
  }
  rateSpread: {
    current: number
    change: number
  }
  parityScore: {
    current: number
    change: number
  }
  trendAccuracy: {
    current: number
    change: number
  }
}

export interface ChartData {
  date: string
  myPrice: number
  marketADR: number
  occupancy: number
  demand: number
  competitor1: number
  competitor2: number
  competitor3: number
  revenue: number
  bookings: number
}

export interface FilterOptions {
  comparisonPeriods: Array<{
    id: number
    label: string
    description: string
  }>
  roomTypes: string[]
  channels: string[]
  properties: string[]
}

// Sample Data Generation
const generateRateData = (startDate: Date, days: number): RateData[] => {
  const data: RateData[] = []
  const today = new Date()
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  const basePrice = 120
  const competitors = ['Booking.com', 'Expedia', 'Agoda', 'Hotels.com', 'Direct']
  
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)
    
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6
    const isToday = currentDate.toDateString() === today.toDateString()
    const isFuture = currentDate > today
    
    // Price variation based on day of week and seasonality
    let priceMultiplier = 1
    if (isWeekend) priceMultiplier += 0.2
    if (currentDate.getMonth() >= 5 && currentDate.getMonth() <= 8) priceMultiplier += 0.15 // Summer
    
    const currentPrice = Math.round(basePrice * priceMultiplier * (0.9 + Math.random() * 0.2))
    const marketAverage = Math.round(currentPrice * (0.95 + Math.random() * 0.1))
    
    // Generate competitor prices
    const competitorPrices: { [key: string]: number } = {}
    competitors.forEach(comp => {
      competitorPrices[comp] = Math.round(currentPrice * (0.85 + Math.random() * 0.3))
    })
    
    const occupancyRate = Math.round(60 + Math.random() * 35) // 60-95%
    const totalRooms = 150
    const roomsAvailable = Math.round(totalRooms * (1 - occupancyRate / 100))
    
    const ratePosition = Math.floor(Math.random() * 5) + 1 // 1-5
    const parityScore = Math.round(85 + Math.random() * 15) // 85-100%
    
    data.push({
      id: `rate-${i}`,
      date: currentDate.toISOString().split('T')[0],
      dayOfWeek: dayNames[currentDate.getDay()],
      currentPrice,
      recommendedPrice: isFuture ? Math.round(currentPrice * (0.95 + Math.random() * 0.1)) : undefined,
      marketAverage,
      competitorPrices,
      occupancyRate,
      demand: occupancyRate > 80 ? 'very-high' : occupancyRate > 65 ? 'high' : occupancyRate > 45 ? 'medium' : 'low',
      isFuture,
      isToday,
      events: Math.random() > 0.7 ? ['Conference', 'Holiday'] : undefined,
      seasonality: currentDate.getMonth() >= 5 && currentDate.getMonth() <= 8 ? 'peak' : 
                   currentDate.getMonth() >= 3 && currentDate.getMonth() <= 5 ? 'shoulder' : 'low',
      roomsAvailable,
      totalRooms,
      averageDailyRate: currentPrice,
      revPAR: Math.round(currentPrice * occupancyRate / 100),
      ratePosition,
      parityScore,
      lossAmount: ratePosition > 2 ? Math.round((marketAverage - currentPrice) * occupancyRate / 100) : 0,
      reasoningText: isFuture ? `AI recommends ${ratePosition > 2 ? 'increasing' : 'maintaining'} rates based on demand patterns` : undefined
    })
  }
  
  return data
}

// Generate chart data for the last 30 days
const generateChartData = (): ChartData[] => {
  const data: ChartData[] = []
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const basePrice = 120
    const variation = 0.9 + Math.random() * 0.2
    const myPrice = Math.round(basePrice * variation)
    
    data.push({
      date: date.toISOString().split('T')[0],
      myPrice,
      marketADR: Math.round(myPrice * (0.95 + Math.random() * 0.1)),
      occupancy: Math.round(60 + Math.random() * 35),
      demand: Math.round(50 + Math.random() * 50),
      competitor1: Math.round(myPrice * (0.9 + Math.random() * 0.2)),
      competitor2: Math.round(myPrice * (0.85 + Math.random() * 0.3)),
      competitor3: Math.round(myPrice * (0.95 + Math.random() * 0.1)),
      revenue: Math.round(myPrice * (60 + Math.random() * 35) / 100 * 150), // rooms * occupancy * rate
      bookings: Math.round(20 + Math.random() * 30)
    })
  }
  
  return data
}

// Sample data exports
export const SAMPLE_RATE_DATA = generateRateData(new Date(), 90) // 90 days of data

export const SAMPLE_KPI_DATA: KPIData = {
  periodInfo: {
    label: "Last Week",
    formattedStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
    formattedEndDate: new Date().toLocaleDateString('en-GB'),
    daysDifference: 7
  },
  ratePosition: {
    current: 3,
    change: +1
  },
  rateSpread: {
    current: 15,
    change: -3
  },
  parityScore: {
    current: 92,
    change: +2
  },
  trendAccuracy: {
    current: 87,
    change: +5
  }
}

export const SAMPLE_CHART_DATA = generateChartData()

export const SAMPLE_FILTER_OPTIONS: FilterOptions = {
  comparisonPeriods: [
    { id: 7, label: "Last Week", description: "Compare with previous 7 days" },
    { id: 30, label: "Last Month", description: "Compare with previous 30 days" },
    { id: 91, label: "Last Quarter", description: "Compare with previous 90 days" }
  ],
  roomTypes: [
    "Standard Room",
    "Deluxe Room", 
    "Executive Suite",
    "Presidential Suite",
    "Junior Suite"
  ],
  channels: [
    "Direct Bookings",
    "Booking.com",
    "Expedia",
    "Agoda", 
    "Hotels.com",
    "Trivago",
    "Priceline"
  ],
  properties: [
    "Main Hotel",
    "Business Center",
    "Resort Wing",
    "Conference Center"
  ]
}

// Utility functions
export const getCalendarData = (startDate: Date, endDate: Date): CalendarViewData => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const data = SAMPLE_RATE_DATA.filter(item => {
    const itemDate = new Date(item.date)
    return itemDate >= start && itemDate <= end
  })
  
  // Group data by weeks
  const weeks: RateData[][] = []
  let currentWeek: RateData[] = []
  
  data.forEach((item, index) => {
    currentWeek.push(item)
    if (currentWeek.length === 7 || index === data.length - 1) {
      weeks.push([...currentWeek])
      currentWeek = []
    }
  })
  
  const totalRevenue = data.reduce((sum, item) => sum + item.revPAR, 0)
  const averageRate = data.reduce((sum, item) => sum + item.currentPrice, 0) / data.length
  const averageOccupancy = data.reduce((sum, item) => sum + item.occupancyRate, 0) / data.length
  
  return {
    monthYear: start.toLocaleString('default', { month: 'long', year: 'numeric' }),
    weeks,
    summary: {
      totalRevenue: Math.round(totalRevenue),
      averageRate: Math.round(averageRate),
      occupancyRate: Math.round(averageOccupancy),
      competitorComparison: {
        ahead: data.filter(item => item.ratePosition <= 2).length,
        behind: data.filter(item => item.ratePosition >= 4).length,
        equal: data.filter(item => item.ratePosition === 3).length
      }
    }
  }
}

export const getKPIData = (comparisonPeriod: number): KPIData => {
  const labels = {
    7: "Last Week",
    30: "Last Month", 
    91: "Last Quarter"
  }
  
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - comparisonPeriod)
  
  return {
    ...SAMPLE_KPI_DATA,
    periodInfo: {
      ...SAMPLE_KPI_DATA.periodInfo,
      label: labels[comparisonPeriod as keyof typeof labels] || "Custom Period",
      formattedStartDate: startDate.toLocaleDateString('en-GB'),
      formattedEndDate: endDate.toLocaleDateString('en-GB'),
      daysDifference: comparisonPeriod
    }
  }
}

export const getChartData = (startDate: Date, endDate: Date): ChartData[] => {
  return SAMPLE_CHART_DATA.filter(item => {
    const itemDate = new Date(item.date)
    return itemDate >= startDate && itemDate <= endDate
  })
}

// Mock API functions for consistent interface
export const rateTrendsAPI = {
  getRateData: async (startDate: Date, endDate: Date) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    return getCalendarData(startDate, endDate)
  },
  
  getKPIData: async (comparisonPeriod: number) => {
    await new Promise(resolve => setTimeout(resolve, 100))
    return getKPIData(comparisonPeriod)
  },
  
  getChartData: async (startDate: Date, endDate: Date) => {
    await new Promise(resolve => setTimeout(resolve, 100))
    return getChartData(startDate, endDate)
  },
  
  getFilterOptions: async () => {
    await new Promise(resolve => setTimeout(resolve, 50))
    return SAMPLE_FILTER_OPTIONS
  }
}
