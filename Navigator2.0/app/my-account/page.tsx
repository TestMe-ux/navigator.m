"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserCircle, Camera } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Mock data for the usage trend chart - different datasets for each view
const generateUsageData = (viewBy: string) => {
  switch (viewBy) {
    case "Daily":
      // Generate 90 days of data to test scroll functionality
      const dailyData = []
      for (let i = 0; i < 90; i++) {
        const date = new Date()
        date.setDate(date.getDate() - (89 - i))
        const day = date.getDate().toString().padStart(2, '0')
        const month = date.toLocaleDateString('en-US', { month: 'short' })
        
        dailyData.push({
          date: `${day} ${month}`,
          Scheduled: Math.floor(Math.random() * 50) + 20,
          OnDemand: Math.floor(Math.random() * 30) + 10,
          LightningRefresh: Math.floor(Math.random() * 20) + 5
        })
      }
      return dailyData
    case "Weekly":
      // Generate 90 weeks of data to test scroll functionality
      const weeklyData = []
      for (let i = 0; i < 90; i++) {
        weeklyData.push({
          date: `Week ${i + 1}`,
          Scheduled: Math.floor(Math.random() * 200) + 200,
          OnDemand: Math.floor(Math.random() * 150) + 100,
          LightningRefresh: Math.floor(Math.random() * 100) + 50
        })
      }
      return weeklyData
    case "Monthly":
      // Generate 90 months of data to test scroll functionality
      const monthlyData = []
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      for (let i = 0; i < 90; i++) {
        const monthIndex = i % 12
        const year = 2017 + Math.floor(i / 12)
        monthlyData.push({
          date: `${months[monthIndex]} ${year}`,
          Scheduled: Math.floor(Math.random() * 1000) + 1000,
          OnDemand: Math.floor(Math.random() * 500) + 500,
          LightningRefresh: Math.floor(Math.random() * 300) + 200
        })
      }
      return monthlyData
    case "Yearly":
      // Generate 90 years of data to test scroll functionality
      const yearlyData = []
      for (let i = 0; i < 90; i++) {
        yearlyData.push({
          date: `${1935 + i}`,
          Scheduled: Math.floor(Math.random() * 10000) + 10000,
          OnDemand: Math.floor(Math.random() * 5000) + 5000,
          LightningRefresh: Math.floor(Math.random() * 3000) + 2000
        })
      }
      return yearlyData
    default:
      return []
  }
}

export default function MyAccountPage() {
  const [viewBy, setViewBy] = useState("Daily")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingCycle, setLoadingCycle] = useState(1)

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => generateUsageData(viewBy), [viewBy])
  const maxValue = useMemo(() => Math.max(...chartData.flatMap(d => [d.Scheduled, d.OnDemand, d.LightningRefresh])), [chartData])
  const useKFormat = useMemo(() => maxValue >= 1000, [maxValue])

  // Dummy girl image for testing
  const dummyGirlImage = "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // For demo purposes, set the dummy image instantly
      setProfileImage(dummyGirlImage)
      
      // Also process the actual file (commented out for now to use dummy)
      // const reader = new FileReader()
      // reader.onload = (e) => {
      //   setProfileImage(e.target?.result as string)
      // }
      // reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    const fileInput = document.getElementById('profile-image-input') as HTMLInputElement
    fileInput?.click()
  }

  // Loading effect similar to Demand and OTA Ranking pages
  useEffect(() => {
    setIsLoading(true)
    setLoadingProgress(0)

    // Progress interval
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        const increment = Math.floor(Math.random() * 9) + 3 // 3-11% increment
        const newProgress = prev + increment

        if (newProgress >= 100) {
          setLoadingCycle(prevCycle => prevCycle + 1)
          return 0
        }

        return newProgress
      })
    }, 80)

    // Simulate data loading (similar to Demand page)
    const loadingTimeout = setTimeout(() => {
      clearInterval(progressInterval)
      setLoadingProgress(100) // finish instantly
      setTimeout(() => {
        setIsLoading(false)
        setLoadingProgress(0) // reset for next load
      }, 300) // brief delay so user sees 100%
    }, 2000) // 2 seconds loading time

    return () => {
      clearInterval(progressInterval)
      clearTimeout(loadingTimeout)
    }
  }, [])


  // Custom My Account Loading Skeleton
  const MyAccountLoadingSkeleton = () => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="relative">
        <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8 space-y-4">
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Header Section */}
            <div className="space-y-2 mb-6">
              <div className="h-8 w-48 bg-gray-300 animate-pulse rounded"></div>
              <div className="h-4 w-96 bg-gray-300 animate-pulse rounded"></div>
            </div>
            
            {/* Your Contract Card */}
            <Card className="bg-gradient-to-br from-card to-card/50 shadow-xl border border-border/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 z-10">
                <div className="h-[3px] w-full bg-gray-200/50 dark:bg-gray-800/50 overflow-hidden rounded-sm">
                  <div 
                    className="h-full bg-blue-500/90 shadow-sm shadow-blue-500/20 transition-all duration-150 ease-out"
                    style={{ 
                      width: `${loadingProgress}%`,
                      transform: `translateX(0%)` 
                    }}
                  />
                </div>
              </div>
              <CardHeader className="pb-3">
                <div className="h-7 w-40 bg-gray-300 animate-pulse rounded"></div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-6 lg:space-y-0">
                  {/* Profile Image */}
                  <div className="flex-shrink-0 flex items-end">
                    <div className="w-16 h-16 bg-gray-300 animate-pulse rounded-full"></div>
                  </div>
                  {/* Content Grid */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8 lg:mt-0">
                    <div className="space-y-1">
                      <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-32 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-48 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-18 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-4 w-12 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-8 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rate Shops Details Card */}
            <Card className="bg-gradient-to-br from-card to-card/50 shadow-xl border border-border/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 z-10">
                <div className="h-[3px] w-full bg-gray-200/50 dark:bg-gray-800/50 overflow-hidden rounded-sm">
                  <div 
                    className="h-full bg-blue-500/90 shadow-sm shadow-blue-500/20 transition-all duration-150 ease-out"
                    style={{ 
                      width: `${loadingProgress}%`,
                      transform: `translateX(0%)` 
                    }}
                  />
                </div>
              </div>
              <CardHeader>
                <div className="h-7 w-36 bg-gray-300 animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-[28%_1fr] gap-12">
                  {/* Summary */}
                  <div className="space-y-4">
                    <div className="h-6 w-20 bg-gray-300 animate-pulse rounded mb-2"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-3/4 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-1/2 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                  </div>
                  {/* Chart */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-28 bg-gray-300 animate-pulse rounded mb-2"></div>
                      <div className="flex border border-border rounded-md overflow-hidden">
                        <div className="h-8 w-16 bg-gray-300 animate-pulse"></div>
                        <div className="h-8 w-16 bg-gray-300 animate-pulse"></div>
                        <div className="h-8 w-16 bg-gray-300 animate-pulse"></div>
                        <div className="h-8 w-16 bg-gray-300 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-72 w-full bg-gray-300 animate-pulse rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits Card */}
            <Card className="bg-gradient-to-br from-card to-card/50 shadow-xl border border-border/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 z-10">
                <div className="h-[3px] w-full bg-gray-200/50 dark:bg-gray-800/50 overflow-hidden rounded-sm">
                  <div 
                    className="h-full bg-blue-500/90 shadow-sm shadow-blue-500/20 transition-all duration-150 ease-out"
                    style={{ 
                      width: `${loadingProgress}%`,
                      transform: `translateX(0%)` 
                    }}
                  />
                </div>
              </div>
              <CardContent className="pt-6">
                <div className="space-y-1">
                  <div className="h-4 w-full bg-gray-300 animate-pulse rounded"></div>
                  <div className="h-4 w-5/6 bg-gray-300 animate-pulse rounded"></div>
                  <div className="h-4 w-4/5 bg-gray-300 animate-pulse rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )

  if (isLoading) {
    return <MyAccountLoadingSkeleton />
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="relative">
        {/* Profile Image - 40x40px positioned over top header profile button */}
        {profileImage && (
          <div className="fixed top-4 right-4 rounded-full border-2 border-white shadow-lg overflow-hidden z-50 bg-white" style={{ width: '40px', height: '40px' }}>
            <img 
              src={profileImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
              style={{ width: '40px', height: '40px' }}
            />
          </div>
        )}
        
        <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8 space-y-4">
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Dashboard Header with Enhanced Typography - Left aligned with cards */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground">
                  My Account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your account details, contract information, and monitor your usage across all services
                </p>
              </div>
            </div>

        <div>
          {/* Main Content */}
          <div className="space-y-8">
            {/* Your Contract Section */}
            <Card className="bg-gradient-to-br from-card to-card/50 shadow-xl border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold">Your Contract</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-2">
                <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-6 lg:space-y-0">
                  {/* Left Side - Profile Avatar */}
                  <div className="flex-shrink-0 flex items-end">
                    <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center transition-all duration-200 group-hover:bg-muted/80 overflow-hidden shadow-md hover:shadow-lg">
                        {profileImage ? (
                          <img 
                            src={profileImage} 
                            alt="Profile" 
                            className="w-full h-full object-cover rounded-full group-hover:opacity-50 transition-opacity duration-200"
                          />
                        ) : (
                          <UserCircle className="w-10 h-10 text-muted-foreground group-hover:opacity-50 transition-opacity duration-200" />
                        )}
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    {/* Hidden file input */}
                    <input
                      id="profile-image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Right Side - Information Sections */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8 lg:mt-0">
                    {/* Profile Section - No heading */}
                    <div className="space-y-1">
                      <p className="font-semibold text-sm text-foreground">Namrata Jain</p>
                      <p className="text-muted-foreground text-sm">Alhambra Hotel</p>
                      <p className="text-muted-foreground text-sm">Email: namrata.jain@rategain.com</p>
                    </div>

                    {/* Subscription Section */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-foreground capitalize tracking-wide">Subscription:</h3>
                      <p className="text-sm text-foreground">Start: <span className="font-semibold">27 Feb 2017</span></p>
                      <p className="text-sm text-foreground">End: <span className="font-semibold">31 Aug 2025</span></p>
                    </div>

                    {/* Criteria Section */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-foreground capitalize tracking-wide">Criteria:</h3>
                      <p className="text-sm text-foreground">3 Competitors</p>
                      <p className="text-sm text-foreground">7 Channels</p>
                    </div>

                    {/* Custom Section */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-foreground capitalize tracking-wide">Custom:</h3>
                      <p className="text-sm text-foreground">NA</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rate Shops - Details Section */}
            <Card className="bg-gradient-to-br from-card to-card/50 shadow-xl border border-border/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Rate Shops - Details</CardTitle>
              </CardHeader>
              <CardContent>

                {/* Summary and Usage Trend */}
                <div className="grid grid-cols-1 lg:grid-cols-[28%_1fr] gap-12">
                  {/* Summary */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm font-medium">Reports</span>
                        <span className="text-sm font-medium">Consumed</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-dashed border-border">
                        <span className="text-sm text-muted-foreground">Scheduled</span>
                        <span className="text-sm font-semibold">246828</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-dashed border-border">
                        <span className="text-sm text-muted-foreground">On Demand</span>
                        <span className="text-sm font-semibold">57441</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">Lightning Refresh</span>
                        <span className="text-sm font-semibold">11562</span>
                      </div>
                    </div>
                  </div>

                  {/* Usage Trend */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">Usage Trend</h3>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground mr-2">View By:</span>
                        <div className="flex border border-border rounded-md overflow-hidden">
                          {["Daily", "Weekly", "Monthly", "Yearly"].map((period, index) => (
                            <Button
                              key={period}
                              variant={viewBy === period ? "default" : "ghost"}
                              size="sm"
                              onClick={() => setViewBy(period)}
                              className={`text-sm px-3 py-1 rounded-none border-0 ${
                                index !== 0 ? "border-l border-border" : ""
                              } ${viewBy === period ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-muted"}`}
                            >
                              {period}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-white dark:bg-slate-900 rounded overflow-hidden">
                      {/* Chart Container with Fixed Y-Axis */}
                      <div className="h-72 w-full flex">
                        {/* Fixed Y-Axis */}
                        <div className="flex-shrink-0 w-12 h-full bg-white dark:bg-slate-900 relative">
                          <div className="absolute top-5 right-1 w-full">
                            <div className="text-xs text-muted-foreground text-right">
                              {useKFormat ? `${(maxValue / 1000).toFixed(0)}K` : maxValue.toString()}  
                            </div>
                          </div>
                          <div className="absolute bottom-5 right-1 w-full">
                            <div className="text-xs text-muted-foreground text-right">0  </div>
                          </div>
                          {(() => {
                            const steps = 5
                            const stepValue = maxValue / steps
                            const chartHeight = 288 // h-72 = 288px
                            const labelSpacing = (chartHeight - 40) / steps // 40px for top and bottom padding
                            
                            return Array.from({ length: steps - 1 }, (_, i) => {
                              const value = Math.round(stepValue * (steps - i - 1))
                              const topPosition = 20 + (labelSpacing * (i + 1)) // 20px top padding
                              let formattedValue
                              if (useKFormat) {
                                formattedValue = value >= 1000 ? `${(value / 1000).toFixed(0)}K` : `${(value / 1000).toFixed(1)}K`
                              } else {
                                formattedValue = value.toString()
                              }
                              return (
                                <div 
                                  key={i} 
                                  className="absolute text-xs text-muted-foreground text-right right-1 w-full"
                                  style={{ top: `${topPosition}px` }}
                                >
                                  {formattedValue + "  "}
                                </div>
                              )
                            })
                          })()}
                        </div>
                        
                        {/* Scrollable Chart Area */}
                        <div className="flex-1 h-full overflow-x-auto scrollbar-hide" style={{
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none',
                          WebkitScrollbar: { display: 'none' },
                          scrollBehavior: 'smooth'
                        }}>
                          <div 
                            className="h-full"
                            style={{
                              width: chartData.length > 50 ? `${Math.max(100, (chartData.length / 50) * 100)}%` : '100%',
                              minWidth: '100%'
                            }}
                          >
                            <ResponsiveContainer 
                              width="100%" 
                              height="100%"
                            >
                             <BarChart 
                               data={generateUsageData(viewBy)} 
                               margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                               barCategoryGap={generateUsageData(viewBy).length > 50 ? "10%" : generateUsageData(viewBy).length > 30 ? "5%" : "20%"}
                             >
                            <XAxis 
                              dataKey="date" 
                              fontSize={11} 
                              tick={{ fontSize: 11, fill: "#666" }} 
                              axisLine={{ stroke: "#e5e7eb" }}
                              tickLine={{ stroke: "#e5e7eb" }}
                              interval={generateUsageData(viewBy).length > 30 ? 4 : 0}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  // Format date based on view type
                                  const formatDateParts = (dateStr: string, viewType: string) => {
                                    if (viewType === 'Daily') {
                                      // For daily view, convert "06 Aug" to separate date and weekday
                                      const currentYear = new Date().getFullYear()
                                      const date = new Date(`${dateStr} ${currentYear}`)
                                      if (!isNaN(date.getTime())) {
                                        const day = date.getDate().toString().padStart(2, '0')
                                        const month = date.toLocaleDateString('en-US', { month: 'short' })
                                        const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
                                        return {
                                          main: `${day} ${month},`,
                                          weekday: weekday
                                        }
                                      }
                                    } else if (viewType === 'Weekly') {
                                      // For weekly view, show "Week 1 (8 Aug - 14 Aug)"
                                      const weekNumber = dateStr.split(' ')[1] // Extract number from "Week 1"
                                      const currentYear = new Date().getFullYear()
                                      const currentDate = new Date()
                                      
                                      // Calculate week start date (assuming Week 1 starts from current date going back)
                                      const weekIndex = parseInt(weekNumber) - 1
                                      const weekStartDate = new Date(currentDate)
                                      weekStartDate.setDate(currentDate.getDate() - (3 - weekIndex) * 7) // Adjust based on week
                                      
                                      const weekEndDate = new Date(weekStartDate)
                                      weekEndDate.setDate(weekStartDate.getDate() + 6)
                                      
                                      const formatDay = (date: Date) => {
                                        const day = date.getDate()
                                        const month = date.toLocaleDateString('en-US', { month: 'short' })
                                        return `${day} ${month}`
                                      }
                                      
                                      return {
                                        main: `Week ${weekNumber} (${formatDay(weekStartDate)} - ${formatDay(weekEndDate)})`,
                                        weekday: null
                                      }
                                    }
                                    return {
                                      main: dateStr,
                                      weekday: null
                                    }
                                  }

                                  const dateParts = formatDateParts(label, viewBy)

                                  return (
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]">
                                      <div className="mb-2">
                                        <div className="font-semibold text-gray-900 text-sm">
                                          {dateParts.main}
                                          {dateParts.weekday && (
                                            <span className="text-xs text-gray-500 ml-1">
                                              {dateParts.weekday}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        {payload.map((entry: any, index: number) => (
                                          <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <div 
                                                className="w-3 h-3 rounded-sm"
                                                style={{ backgroundColor: entry.color }}
                                              />
                                              <span className="text-sm text-gray-700">{entry.name}:</span>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900">
                                              {entry.value.toLocaleString()}
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
                            <Bar dataKey="Scheduled" stackId="usage" fill="#3b82f6" name="Scheduled" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="OnDemand" stackId="usage" fill="#10b981" name="On Demand" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="LightningRefresh" stackId="usage" fill="#8b5cf6" name="Lightning Refresh" radius={[2, 2, 0, 0]} />
                          </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                      
                      {/* Fixed Legend Container */}
                      <div className="w-full px-5 pb-3 -mt-2.5 mt-2">
                        <div className="flex justify-center items-center gap-8">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                            <span className="text-sm text-blue-500">Scheduled</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
                            <span className="text-sm text-emerald-500">On Demand</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-purple-500"></div>
                            <span className="text-sm text-purple-500">Lightning Refresh</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits Section */}
            <Card className="bg-gradient-to-br from-card to-card/50 shadow-xl border border-border/50">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Benefits</h3>
                <ul className="space-y-1 text-foreground">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm">Customized annual subscription based on the need.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm">
                      Access to fresh and accurate competitive Rate Intelligence for seamless decision-making.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm">Ideal for consistent and long-term competitive Rate Intelligence requirements.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
            
            {/* Footer spacing */}
            <div className="h-8"></div>
          </div>
        </div>
      </main>
    </div>
  )
}
