"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Network, Building2, Users, TrendingUp, ChevronDown, MapPin, Eye, MoreHorizontal, ExternalLink, Check, AlertTriangle } from "lucide-react"
import { ClusterFilterBar } from "@/components/navigator/cluster-filter-bar"
import { ClusterKpiCards } from "@/components/navigator/cluster-kpi-cards"
import { DemandAnalysisWidget } from "@/components/navigator/demand-analysis-widget"
import { ComparisonProvider, useComparison } from "@/components/comparison-context"
import { FilterSidebar } from "@/components/filter-sidebar"
import { useDateContext } from "@/components/date-context"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"

function ClusterPageContent() {
  const router = useRouter()
  const { selectedComparison, channelFilter, compsetFilter, setSideFilter, sideFilter } = useComparison()
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const { startDate, endDate, setDateRange } = useDateContext()
  const [selectedProperty] = useSelectedProperty()
  const [selectedChannel, setSelectedChannel] = useState([])
  const [viewBy, setViewBy] = useState("Daily")
  const [viewMode, setViewMode] = useState("Cluster")
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // Property selector state
  const [selectedProperties, setSelectedProperties] = useState<string[]>([
    "Seaside Resort & Spa",
    "City Hotel Gotland", 
    "Grand Palace Hotel",
    "Mountain View Lodge",
    "Urban Business Center",
    "Riverside Inn",
    "Downtown Plaza",
    "Garden Hotel",
    "Business Tower",
    "Luxury Suites"
  ])
  const [isPropertySelectorOpen, setIsPropertySelectorOpen] = useState(false)
  const [displayedPropertiesCount, setDisplayedPropertiesCount] = useState(5)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Search functionality state
  const [searchQuery, setSearchQuery] = useState("")
  const [screenWidth, setScreenWidth] = useState(0)
  
  // Available properties for selector
  const availableProperties = [
    "Seaside Resort & Spa",
    "City Hotel Gotland", 
    "Grand Palace Hotel",
    "Mountain View Lodge",
    "Urban Business Center",
    "Riverside Inn",
    "Downtown Plaza",
    "Garden Hotel",
    "Business Tower",
    "Luxury Suites"
  ]
  
  // Property selector handlers
  const handlePropertyToggle = (property: string) => {
    setSelectedProperties(prev => 
      prev.includes(property) 
        ? prev.filter(p => p !== property)
        : [...prev, property]
    )
  }

  // Handle "All Properties" selection - copied from parity-monitoring page
  const handleSelectAllProperties = () => {
    // If all properties are selected, deselect all
    if (selectedProperties.length === availableProperties.length) {
      setSelectedProperties([])
    } else {
      // Otherwise, select all properties
      setSelectedProperties(availableProperties)
    }
  }

  // Get display text for property dropdown - copied from parity-monitoring page
  const getPropertyDisplayText = () => {
    if (selectedProperties.length === 0) {
      return "All Properties"
    } else if (selectedProperties.length === availableProperties.length) {
      return "10 Properties"
    } else if (selectedProperties.length === 1) {
      return selectedProperties[0]
    } else {
      return `${selectedProperties.length} Properties`
    }
  }

  // Load more properties handler
  const handleLoadMoreProperties = async () => {
    setIsLoadingMore(true)
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setDisplayedPropertiesCount(prev => Math.min(prev + 5, filteredProperties.length))
    setIsLoadingMore(false)
  }

  // Reset displayed count when selected properties change
  useEffect(() => {
    // Always show 5 properties by default, regardless of selection
    if (selectedProperties.length <= 5) {
      setDisplayedPropertiesCount(5)
    } else if (displayedPropertiesCount > selectedProperties.length) {
      setDisplayedPropertiesCount(5)
    }
  }, [selectedProperties.length, displayedPropertiesCount])

  // Reset displayed count when search query changes
  useEffect(() => {
    setDisplayedPropertiesCount(5)
  }, [searchQuery])
  
  // Track screen width for responsive truncation
  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth)
    }
    
    updateScreenWidth()
    window.addEventListener('resize', updateScreenWidth)
    return () => window.removeEventListener('resize', updateScreenWidth)
  }, [])

  // Simulate loading for skeleton effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000) // 2 second loading simulation

    return () => clearTimeout(timer)
  }, [])


  // Function to render different WLM visualization styles
  const renderWLMStyle = (property: any) => {
    const { wlm, wlmStyle } = property
    
    switch (wlmStyle) {
      case "horizontal":
        return (
          <div className="space-y-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Win</span>
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{wlm.win}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{width: `${wlm.win}%`}}></div>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Meet</span>
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{wlm.meet}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-300" style={{width: `${wlm.meet}%`}}></div>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Loss</span>
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{wlm.loss}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full transition-all duration-300" style={{width: `${wlm.loss}%`}}></div>
              </div>
            </div>
          </div>
        )

      case "circular":
        return (
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200 dark:text-gray-700"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${wlm.win}, 100`}
                  strokeDashoffset="0"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-500"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${wlm.meet}, 100`}
                  strokeDashoffset={`-${wlm.win}`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-red-500"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${wlm.loss}, 100`}
                  strokeDashoffset={`-${wlm.win + wlm.meet}`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">WLM</span>
              </div>
            </div>
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-slate-700 dark:text-slate-300">Win: {wlm.win}%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-slate-700 dark:text-slate-300">Meet: {wlm.meet}%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-slate-700 dark:text-slate-300">Loss: {wlm.loss}%</span>
              </div>
            </div>
          </div>
        )

      case "donut":
        return (
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 32 32">
                <circle
                  className="text-emerald-500"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${wlm.win}, 100`}
                  strokeDashoffset="0"
                  cx="16" cy="16" r="12"
                />
                <circle
                  className="text-amber-500"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${wlm.meet}, 100`}
                  strokeDashoffset={`-${wlm.win}`}
                  cx="16" cy="16" r="12"
                />
                <circle
                  className="text-red-500"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${wlm.loss}, 100`}
                  strokeDashoffset={`-${wlm.win + wlm.meet}`}
                  cx="16" cy="16" r="12"
                />
              </svg>
            </div>
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-slate-700 dark:text-slate-300">{wlm.win}%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-slate-700 dark:text-slate-300">{wlm.meet}%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-slate-700 dark:text-slate-300">{wlm.loss}%</span>
              </div>
            </div>
          </div>
        )

      case "stacked":
        return (
          <div className="space-y-1 mt-1">
            {/* Values displayed above the bar */}
            <div className="flex justify-between text-[10px] font-medium text-slate-700 dark:text-slate-300 gap-[10px]">
              <span className="text-emerald-600 dark:text-emerald-400">W {wlm.win}%</span>
              <span className="text-amber-600 dark:text-amber-400">M {wlm.meet}%</span>
              <span className="text-red-600 dark:text-red-400">L {wlm.loss}%</span>
            </div>
            {/* Reduced height bar (6px) */}
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-sm overflow-hidden flex">
              <div 
                className="bg-emerald-500 transition-all duration-300" 
                style={{width: `${wlm.win}%`}}
                title={`Win: ${wlm.win}%`}
              ></div>
              <div 
                className="bg-amber-500 transition-all duration-300" 
                style={{width: `${wlm.meet}%`}}
                title={`Meet: ${wlm.meet}%`}
              ></div>
              <div 
                className="bg-red-500 transition-all duration-300" 
                style={{width: `${wlm.loss}%`}}
                title={`Loss: ${wlm.loss}%`}
              ></div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Property data for Property Overview
  const propertyData = [
    {
      id: 1,
      initial: "M",
      name: "Mountain View Lodge",
      location: "Aspen, Colorado",
      active: true,
      adr: 450,
      avgCompset: 450,
      parityScore: 82,
      availability: 78,
      competitiveness: 85,
      wlm: { win: 15, meet: 20, loss: 65 },
      wlmStyle: "stacked", // Style: Stacked bars
      hasData: true
    },
    {
      id: 2,
      initial: "G", 
      name: "Grand Plaza Hotel",
      location: "Downtown, New York",
      active: true,
      adr: 5750000,
      avgCompset: 5750000,
      parityScore: 78,
      availability: 85,
      competitiveness: 72,
      wlm: { win: 25, meet: 35, loss: 40 },
      wlmStyle: "stacked", // Style: Stacked bars
      hasData: true
    },
    {
      id: 3,
      initial: "S",
      name: "Sample Hotel Name",
      location: "Test City, Test State",
      active: true,
      adr: null,
      avgCompset: null,
      parityScore: null,
      availability: null,
      competitiveness: null,
      wlm: { win: 0, meet: 0, loss: 0 },
      wlmStyle: "stacked",
      hasData: false // No data available for any KPI
    },
    {
      id: 4,
      initial: "H",
      name: "Historic Boutique Inn", 
      location: "Charleston, South Carolina",
      active: true,
      adr: null, // NA value
      avgCompset: 225,
      parityScore: 75,
      availability: 82,
      competitiveness: 78,
      wlm: { win: 40, meet: 30, loss: 30 },
      wlmStyle: "stacked", // Style: Stacked bars
      hasData: true
    },
    {
      id: 5,
      initial: "S",
      name: "Seaside Resort & Spa",
      location: "Miami Beach, Florida", 
      active: true,
      adr: 195,
      avgCompset: 195,
      parityScore: 65,
      availability: 92,
      competitiveness: 68,
      wlm: { win: 50, meet: 25, loss: 25 },
      wlmStyle: "stacked", // Style: Stacked bars
      hasData: true
    },
    {
      id: 6,
      initial: "A",
      name: "Airport Express Hotel",
      location: "Los Angeles, California",
      active: true,
      adr: 135,
      avgCompset: null, // NA value
      parityScore: 62,
      availability: 95,
      competitiveness: 58,
      wlm: { win: 60, meet: 20, loss: 20 },
      wlmStyle: "stacked", // Style: Stacked bars
      hasData: true
    },
    {
      id: 7,
      initial: "R",
      name: "Riverside Inn",
      location: "Portland, Oregon",
      active: true,
      adr: 180,
      avgCompset: 180,
      parityScore: 70,
      availability: 88,
      competitiveness: 75,
      wlm: { win: 35, meet: 40, loss: 25 },
      wlmStyle: "stacked",
      hasData: true
    },
    {
      id: 8,
      initial: "D",
      name: "Downtown Plaza",
      location: "Chicago, Illinois",
      active: true,
      adr: 320,
      avgCompset: 320,
      parityScore: 80,
      availability: 75,
      competitiveness: 82,
      wlm: { win: 20, meet: 30, loss: 50 },
      wlmStyle: "stacked",
      hasData: true
    },
    {
      id: 9,
      initial: "G",
      name: "Garden Hotel",
      location: "Seattle, Washington",
      active: true,
      adr: 220,
      avgCompset: 220,
      parityScore: 68,
      availability: 90,
      competitiveness: 70,
      wlm: { win: 45, meet: 35, loss: 20 },
      wlmStyle: "stacked",
      hasData: true
    },
    {
      id: 10,
      initial: "B",
      name: "Business Tower",
      location: "Boston, Massachusetts",
      active: true,
      adr: 380,
      avgCompset: 380,
      parityScore: 85,
      availability: 70,
      competitiveness: 88,
      wlm: { win: 15, meet: 25, loss: 60 },
      wlmStyle: "stacked",
      hasData: true
    },
    {
      id: 11,
      initial: "L",
      name: "Luxury Suites",
      location: "Las Vegas, Nevada",
      active: true,
      adr: 550,
      avgCompset: 550,
      parityScore: 90,
      availability: 65,
      competitiveness: 92,
      wlm: { win: 10, meet: 20, loss: 70 },
      wlmStyle: "stacked",
      hasData: true
    },
    {
      id: 12,
      initial: "E",
      name: "Empty Data Hotel",
      location: "Sample Location, Demo State",
      active: true,
      adr: null,
      avgCompset: null,
      parityScore: null,
      availability: null,
      competitiveness: null,
      wlm: { win: 0, meet: 0, loss: 0 },
      wlmStyle: "stacked",
      hasData: false // No data available for any KPI
    }
  ]

  // Filter properties based on search query
  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) {
      return propertyData
    }
    
    return propertyData.filter(property => 
      property.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    )
  }, [searchQuery])

  // Function to truncate property names based on screen resolution
  const truncatePropertyName = (name: string) => {
    if (screenWidth >= 1600) {
      return name.length > 28 ? name.substring(0, 28) + '...' : name
    }
    return name.length > 18 ? name.substring(0, 18) + '...' : name
  }

  // Static chart data for Performance Trends - updated with percentage values and new names
  const generatePerformanceData = (viewBy: string) => {
    switch (viewBy) {
      case "Daily":
        // Generate 30 days of data
        const dailyData = []
        const baseDate = new Date()
        baseDate.setDate(baseDate.getDate() - 29) // Start 29 days ago to get 30 days total
        
        for (let i = 0; i < 30; i++) {
          const currentDate = new Date(baseDate)
          currentDate.setDate(baseDate.getDate() + i)
          
          // Generate realistic percentage values with some variation
          const competitiveness = Math.round(60 + Math.sin(i * 0.2) * 20 + Math.sin(i * 0.1) * 10 + (Math.random() - 0.5) * 10)
          const availability = Math.round(70 + Math.sin(i * 0.15) * 15 + Math.sin(i * 0.08) * 8 + (Math.random() - 0.5) * 8)
          const parity = Math.round(50 + Math.sin(i * 0.25) * 25 + Math.sin(i * 0.12) * 12 + (Math.random() - 0.5) * 12)
          
          dailyData.push({
            date: format(currentDate, "dd MMM"),
            Competitiveness: Math.max(0, Math.min(100, competitiveness)),
            Availability: Math.max(0, Math.min(100, availability)),
            Parity: Math.max(0, Math.min(100, parity))
          })
        }
        return dailyData
      case "Weekly":
        return [
          { date: "Week 1", Competitiveness: 85, Availability: 65, Parity: 95 },
          { date: "Week 2", Competitiveness: 90, Availability: 42, Parity: 88 },
          { date: "Week 3", Competitiveness: 78, Availability: 88, Parity: 76 },
          { date: "Week 4", Competitiveness: 95, Availability: 75, Parity: 85 },
        ]
      case "Monthly":
        return [
          { date: "Jan", Competitiveness: 85, Availability: 68, Parity: 42 },
          { date: "Feb", Competitiveness: 78, Availability: 72, Parity: 38 },
          { date: "Mar", Competitiveness: 92, Availability: 65, Parity: 46 },
          { date: "Apr", Competitiveness: 88, Availability: 69, Parity: 44 },
          { date: "May", Competitiveness: 95, Availability: 78, Parity: 52 },
          { date: "Jun", Competitiveness: 91, Availability: 74, Parity: 48 },
        ]
      case "Yearly":
        return [
          { date: "2022", Competitiveness: 85, Availability: 82, Parity: 51 },
          { date: "2023", Competitiveness: 92, Availability: 91, Parity: 58 },
          { date: "2024", Competitiveness: 88, Availability: 87, Parity: 54 },
        ]
      default:
        return []
    }
  }

  const chartData = useMemo(() => generatePerformanceData(viewBy), [viewBy])
  const maxValue = useMemo(() => Math.max(...chartData.flatMap(d => [d.Competitiveness, d.Availability, d.Parity])), [chartData])
  const useKFormat = useMemo(() => maxValue >= 1000, [maxValue])

  // Auto-scroll to end of chart
  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current!.scrollLeft = scrollContainerRef.current!.scrollWidth;
      }, 100);
    }
  }, [chartData]);


  const handleMoreFiltersClick = () => {
    setIsFilterSidebarOpen(true)
    console.log("🔍 Opening cluster filter sidebar")
  }

  const handleViewModeChange = (mode: string) => {
    if (mode === "All Properties") {
      router.push("/all-properties")
    } else {
      setViewMode(mode)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950" data-coach-mark="cluster-overview">
      {isLoading && (
        <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
          <GlobalProgressBar />
          <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8 xl:py-10">
            <div className="max-w-7xl xl:max-w-none mx-auto">
              <LoadingSkeleton type="cluster" showCycleCounter={true} />
            </div>
          </div>
        </div>
      )}
      {!isLoading && (
        <>
          {/* Enhanced Filter Bar with Sticky Positioning */}
          <div className="sticky top-0 z-40 filter-bar-minimal bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-border/50 shadow-sm transition-shadow duration-200">
            <ClusterFilterBar 
              onMoreFiltersClick={handleMoreFiltersClick} 
              setSelectedChannel={setSelectedChannel}
              viewMode={viewMode}
              setViewMode={handleViewModeChange}
              setPropertySelectorOpen={setIsPropertySelectorOpen}
            />
          </div>
      
      <FilterSidebar
        losGuest={{ "Los": [], "Guest": [] }}
        isOpen={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
        onApply={(filters) => {
          // Handle filter apply logic here
          setSideFilter(filters);
          console.log('Applied cluster filters:', filters)
          setIsFilterSidebarOpen(false)
        }}
      />

      <main className="relative">
        <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8 space-y-4">
          <div className="max-w-none mx-auto space-y-4">

            {/* Dashboard Header with Enhanced Typography */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-minimal-md mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-foreground">
                    Cluster Management
                  </h1>
                  
                  {/* Property Selector Dropdown */}
                  <DropdownMenu open={isPropertySelectorOpen} onOpenChange={setIsPropertySelectorOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md min-w-0 max-w-[192px] hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                      >
                  <span className="truncate max-w-[120px] font-semibold">
                    {getPropertyDisplayText()}
                  </span>
                        <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-auto p-0 shadow-xl border-slate-200 dark:border-slate-700 z-[60]">
                      <div className="flex">
                        <div className="w-64 p-4">
                          <h4 className="font-semibold text-sm text-gray-700 mb-3">Properties</h4>
                          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                            <div className="space-y-1 pr-4">
                              {/* All Properties Option */}
                              <label
                                className="py-2 px-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm flex items-center cursor-pointer"
                                onClick={() => handleSelectAllProperties()}
                              >
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-0 focus:outline-none mr-3 cursor-pointer"
                                  checked={selectedProperties.length === availableProperties.length}
                                  onChange={() => {}} // Prevent default behavior
                                  readOnly
                                />
                                <span 
                                  className="font-medium text-sm flex-1 cursor-pointer"
                                >
                                  All Properties
                                </span>
                              </label>
                              
                              {/* Individual Properties */}
                              {availableProperties.map((property) => (
                                <label
                                  key={property}
                                  className="py-2 px-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm flex items-center cursor-pointer"
                                  onClick={() => handlePropertyToggle(property)}
                                >
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-0 focus:outline-none mr-3 cursor-pointer"
                                    checked={selectedProperties.includes(property)}
                                    onChange={() => {}} // Prevent default behavior
                                    readOnly
                                  />
                                  <span 
                                    className="font-medium text-sm flex-1 cursor-pointer"
                                  >
                                    {property}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-muted-foreground">
                  Manage and analyze property clusters for optimized revenue management
                </p>
              </div>
            </div>

            {/* KPI Cards - Enhanced with proper spacing */}
            <div className="w-full animate-slide-up" data-coach-mark="cluster-kpi-cards">
              <ClusterKpiCards />
            </div>

            {/* Main Content Grid - Enhanced with consistent spacing */}
            <div className="space-minimal-xl mt-16">

              {/* Main Content Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                    {/* Performance Trends - Wider card (spans 8 columns) */}
                    <div className="lg:col-span-8">
                      <Card className="card-elevated animate-fade-in h-[450px]">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">
                        Performance Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Performance Trends Chart */}
                        
                        <div className="w-full bg-white dark:bg-slate-900 rounded overflow-hidden">
                          {/* Chart Container with Fixed Y-Axis */}
                          <div className="h-80 w-full flex">
                            {/* Fixed Y-Axis */}
                            <div className="flex-shrink-0 w-12 h-full bg-white dark:bg-slate-900 relative">
                              {/* Y-axis bar line */}
                              <div className="absolute top-5 bottom-8 left-[calc(100%-1px)] w-px bg-gray-200 dark:bg-slate-700" />
                              
                              {/* Y-axis labels */}
                              <div className="absolute top-5 bottom-8 left-0 right-0 flex flex-col justify-between text-xs text-gray-600 dark:text-gray-400">
                                <span className="text-right pr-1">100%</span>
                                <span className="text-right pr-1">75%</span>
                                <span className="text-right pr-1">50%</span>
                                <span className="text-right pr-1">25%</span>
                                <span className="text-right pr-1">0%</span>
                              </div>
                            </div>

                            {/* Scrollable Chart Area */}
                            <div ref={scrollContainerRef} className="flex-1 h-full overflow-x-auto scrollbar-hide" style={{
                              scrollbarWidth: 'none',
                              msOverflowStyle: 'none',
                              WebkitScrollbar: { display: 'none' },
                              scrollBehavior: 'smooth'
                            }}>
                              <div
                                className="h-full"
                                style={{
                                  width: chartData.length > 20 ? `${Math.max(150, (chartData.length / 20) * 100)}%` : '100%',
                                  minWidth: '150%'
                                }}
                              >
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart
                                    data={chartData}
                                    margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
                                  >
                                    <XAxis
                                      dataKey="date"
                                      fontSize={11}
                                      tick={{ fontSize: 11, fill: "#666" }}
                                      axisLine={{ stroke: "#e5e7eb" }}
                                      tickLine={{ stroke: "#e5e7eb" }}
                                      interval={2}
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
                                          // Parse the label to get the date and add day of week
                                          const dateStr = label
                                          const date = new Date(dateStr)
                                          const dayOfWeek = format(date, 'EEE') // Mon, Tue, Wed, etc.
                                          const formattedDate = `${dateStr}, ${dayOfWeek}`
                                          
                                          return (
                                            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]">
                                              <div className="mb-2">
                                                <div className="font-semibold text-gray-900 text-sm">
                                                  {formattedDate}
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
                                                      <span className="text-sm text-gray-700">{entry.name}</span>
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-900">
                                                      {entry.value}%
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
                                    <Line dataKey="Competitiveness" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5, stroke: "#3b82f6", strokeWidth: 2 }} name="Competitiveness" />
                                    <Line dataKey="Availability" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5, stroke: "#10b981", strokeWidth: 2 }} name="Availability" />
                                    <Line dataKey="Parity" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5, stroke: "#8b5cf6", strokeWidth: 2 }} name="Parity" />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                          
                          {/* Legend */}
                          <div className="w-full px-5 pb-3 -mt-2.5 mt-2">
                            <div className="flex justify-center items-center gap-8">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                                <span className="text-sm text-blue-500">Competitiveness</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
                                <span className="text-sm text-emerald-500">Availability</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-purple-500"></div>
                                <span className="text-sm text-purple-500">Parity</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* New Demand Analysis Widget */}
                <div className="lg:col-span-4">
                  <DemandAnalysisWidget />
                </div>
              </div>

              {/* Property Overview Section */}
              <Card className="card-elevated animate-fade-in mt-6">
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Property Overview</CardTitle>
              </div>
                    <div className="flex items-center gap-3">
                      <div className="relative mr-4">
                        <input
                          type="text"
                          placeholder="Search properties..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Sort by</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Parity Score
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Parity Score</DropdownMenuItem>
                            <DropdownMenuItem>ADR</DropdownMenuItem>
                            <DropdownMenuItem>Availability</DropdownMenuItem>
                            <DropdownMenuItem>Occupancy</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    {filteredProperties.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-500 dark:text-gray-400 mb-2">
                          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No properties found matching "{searchQuery}"
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Try adjusting your search terms
                        </p>
                      </div>
                    ) : (
                      filteredProperties.slice(0, displayedPropertiesCount).map((property) => (
                      <div key={property.id}>
                        <Card className={`py-4 pl-2 pr-4 hover:shadow-lg transition-shadow duration-200 border border-border/50 hover:border-border shadow-sm ${property.id === 3 && !property.hasData ? 'bg-orange-25 dark:bg-orange-900/10' : ''}`}>
                          <div className="flex items-center justify-between">
                          {/* Left Side - Property Info */}
                          <div className="flex items-center gap-2">
                            {/* Property Image */}
                            <div className="flex-shrink-0 pl-1">
                              <a href="#" className="hover:opacity-80 transition-opacity duration-200 focus:outline-none">
                                <img 
                                  src={`https://picsum.photos/48/48?random=${property.id}`} 
                                  alt={property.name}
                                  className="h-12 w-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                                />
                              </a>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <a 
                                  href="#" 
                                  className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 flex items-center gap-1 focus:outline-none"
                                >
                                  {truncatePropertyName(property.name)}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 focus:outline-none">
                                  {property.location}
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Right Side - Metrics or No Data Card */}
                          {property.id === 3 && !property.hasData ? (
                            /* Error Message with Icon - No container for 3rd property */
                            <div className="w-[599px]">
                              <div className="text-center">
                                <div className="flex items-center gap-2 justify-center mb-0.5">
                                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                  <p className="text-xs font-medium text-amber-800 dark:text-amber-200 leading-5">
                                    No data available for selected date range.
                                  </p>
                                </div>
                                <p className="text-xs text-amber-700 dark:text-amber-300 leading-5">
                                  You could either run an <span className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer focus:outline-none">'On Demand Report'</span> or change date range from top section.
                                </p>
                              </div>
                            </div>
                          ) : (
                            /* Regular KPI Metrics for other properties */
                            <div className="flex items-center gap-5">
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground mb-1">ADR</p>
                                <p className={`${property.adr === null ? 'text-gray-400 font-normal' : 'font-semibold text-foreground'}`}>
                                  {property.adr === null ? '--' : property.id === 2 ? `IDR ${property.adr.toLocaleString()}` : `$ ${property.adr}`}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground mb-1">Avg. Compset</p>
                                <p className={`${property.avgCompset === null ? 'text-gray-400 font-normal' : 'font-semibold text-foreground'}`}>
                                  {property.avgCompset === null ? '--' : property.id === 2 ? `IDR ${property.avgCompset.toLocaleString()}` : `$ ${property.avgCompset}`}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground mb-1">Availability</p>
                                <p className={`${property.availability === null ? 'text-gray-400 font-normal' : 'font-semibold text-foreground'}`}>
                                  {property.availability === null ? '--' : `${property.availability}%`}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground mb-1">Competitiveness</p>
                                <p className={`${property.competitiveness === null ? 'text-gray-400 font-normal' : 'font-semibold text-foreground'}`}>
                                  {property.competitiveness === null ? '--' : `${property.competitiveness}%`}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground mb-1">Parity Score</p>
                                <p className={`${property.parityScore === null ? 'text-gray-400 font-normal' : 'font-semibold text-emerald-600 dark:text-emerald-400'}`}>
                                  {property.parityScore === null ? '--' : `${property.parityScore}%`}
                                </p>
                              </div>
                              <div className="text-center">
                                {/* Dynamic WLM Visualization based on property style */}
                                {property.hasData ? renderWLMStyle(property) : (
                                  <div className="text-gray-400 text-xs">--</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                      </div>
                      ))
                    )}
                    
                    {/* Load More Properties Button */}
                    {filteredProperties.length > displayedPropertiesCount && (
                      <Card 
                        className="p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-border/50 hover:border-border shadow-sm bg-gray-50 dark:bg-gray-800/50"
                        onClick={handleLoadMoreProperties}
                      >
                        <div className="flex items-center justify-center">
                          {isLoadingMore ? (
                            <div className="flex items-center gap-3">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                              <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">Loading properties...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200 text-sm">
                              <span>Load {Math.min(5, filteredProperties.length - displayedPropertiesCount)} more properties</span>
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>


            </div>

            {/* Footer spacing */}
            <div className="h-8"></div>
          </div>
        </div>
      </main>
        </>
      )}
    </div>
  )
}

export default function ClusterPage() {
  return (
    <ComparisonProvider>
      <ClusterPageContent />
    </ComparisonProvider>
  )
}
