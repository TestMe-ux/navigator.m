"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { History, Save, X, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"

const baselineSites = ["Booking.com", "BOOKING.COM", "Agoda", "Brand", "Expedia", "Hotels.com"]
const restrictionOptions = ["All", "Refundable", "Non-Refundable", "Flexible"]
const qualificationOptions = ["All", "Member", "Public", "Corporate"]
const promotionOptions = ["All", "Early Bird", "Last Minute", "Package Deal"]

export default function ParitySettingsPage() {
  const [showChangeHistory, setShowChangeHistory] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null })
  const [isLoading, setIsLoading] = useState(true)
  
  // Simulate loading effect on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000) // Show loading for 3 seconds

    return () => clearTimeout(timer)
  }, [])
  
  const [parityData, setParityData] = useState({
    baselineSite: "Booking.com",
    restrictions: "All",
    qualifications: "All",
    promotion: "All",
    tolerancePercent: "5",
    createdBy: "Nitendra kumar",
  })

  const [originalData, setOriginalData] = useState({
      baselineSite: "Booking.com",
      restrictions: "All",
      qualifications: "All",
      promotion: "All",
      tolerancePercent: "5",
      createdBy: "Nitendra kumar",
    })

  // Check if form has been modified
  const hasChanges = JSON.stringify(parityData) !== JSON.stringify(originalData)

  const handleSave = () => {
    console.log("Parity saved:", parityData)
    setOriginalData(parityData)
    setShowSnackbar(true)
    
    // Auto-hide snackbar after 4 seconds
    setTimeout(() => {
      setShowSnackbar(false)
    }, 4000)
  }

  const handleReset = () => {
    setParityData(originalData)
  }

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc'
    }
    
    setSortConfig({ key: direction ? key : null, direction })
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return null // Don't show icon for unsorted columns
    }
    
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="w-3 h-3 font-bold text-blue-600" strokeWidth={2.5} />
    } else if (sortConfig.direction === 'desc') {
      return <ArrowDown className="w-3 h-3 font-bold text-blue-600" strokeWidth={2.5} />
    }
    
    return <ArrowUpDown className="w-3 h-3 font-bold text-blue-600" strokeWidth={2.5} />
  }

  const getHoverIcon = (key: string) => {
    if (sortConfig.key === key) {
      return null // Don't show hover icon for currently sorted column
    }
    return <ArrowUpDown className="w-3 h-3 font-bold text-gray-500 dark:text-gray-400" strokeWidth={2.5} />
  }

  const TruncatedTooltip = ({ children, content, className = "" }: { children: React.ReactNode, content: string, className?: string }) => {
    const [isOverflowing, setIsOverflowing] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (ref.current) {
        const element = ref.current
        setIsOverflowing(element.scrollWidth > element.clientWidth)
      }
    }, [content])

    if (isOverflowing) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div ref={ref} className={`${className} cursor-pointer`}>
              {children}
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-black text-white text-xs">
            <p>{content}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }

  // Show loading state when data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
        <GlobalProgressBar />
        <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8 xl:py-10">
          <div className="max-w-7xl xl:max-w-none mx-auto">
            <div className="space-y-6">
              {/* Header Skeleton */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="space-y-1">
                    <div className="h-6 w-48 bg-gray-300 animate-pulse rounded"></div>
                    <div className="h-4 w-64 bg-gray-300 animate-pulse rounded"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-9 w-32 bg-gray-300 animate-pulse rounded"></div>
                </div>
              </div>

              {/* Parity Settings Form Skeleton */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 z-10">
                  <div className="h-[3px] w-full bg-gray-200/50 dark:bg-gray-800/50 overflow-hidden rounded-sm">
                    <div className="h-full bg-blue-500/90 shadow-sm shadow-blue-500/20 transition-all duration-150 ease-out w-3/4"></div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-10 w-full bg-gray-300 animate-pulse rounded"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-10 w-full bg-gray-300 animate-pulse rounded"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-28 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-10 w-full bg-gray-300 animate-pulse rounded"></div>
                      </div>
                    </div>
                    
                    {/* Right Column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-10 w-full bg-gray-300 animate-pulse rounded"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-10 w-full bg-gray-300 animate-pulse rounded"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-10 w-full bg-gray-300 animate-pulse rounded"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 mt-6">
                    <div className="h-9 w-20 bg-gray-300 animate-pulse rounded"></div>
                    <div className="h-9 w-24 bg-gray-300 animate-pulse rounded"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="space-y-1">
            <span className="text-xl font-semibold text-foreground">Parity Settings</span>
            <p className="text-sm text-muted-foreground">
              Configure rate parity rules, baseline sites, and competitive pricing parameters
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowChangeHistory(true)}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            Change History
          </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
              onClick={handleReset}
              disabled={!hasChanges}
              >
              Reset
              </Button>
              <Button
                onClick={handleSave}
              disabled={!hasChanges}
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Parity Configuration */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-gray-200 dark:border-slate-700">
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* First Row: Baseline Site and Restrictions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Baseline Site<span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={parityData.baselineSite}
                  onValueChange={(value) => setParityData((prev) => ({ ...prev, baselineSite: value }))}
                >
                  <SelectTrigger className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select baseline site" />
                  </SelectTrigger>
                  <SelectContent>
                    {baselineSites.map((site) => (
                      <SelectItem key={site} value={site} className="pl-3 [&>span:first-child]:hidden">
                        {site}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Restrictions<span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={parityData.restrictions}
                  onValueChange={(value) => setParityData((prev) => ({ ...prev, restrictions: value }))}
                >
                  <SelectTrigger className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select restrictions" />
                  </SelectTrigger>
                  <SelectContent>
                    {restrictionOptions.map((option) => (
                      <SelectItem key={option} value={option} className="pl-3 [&>span:first-child]:hidden">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Second Row: Qualifications and Promotion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Qualifications<span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={parityData.qualifications}
                  onValueChange={(value) => setParityData((prev) => ({ ...prev, qualifications: value }))}
                >
                  <SelectTrigger className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select qualifications" />
                  </SelectTrigger>
                  <SelectContent>
                    {qualificationOptions.map((option) => (
                      <SelectItem key={option} value={option} className="pl-3 [&>span:first-child]:hidden">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Promotion<span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={parityData.promotion}
                  onValueChange={(value) => setParityData((prev) => ({ ...prev, promotion: value }))}
                >
                  <SelectTrigger className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select promotion" />
                  </SelectTrigger>
                  <SelectContent>
                    {promotionOptions.map((option) => (
                      <SelectItem key={option} value={option} className="pl-3 [&>span:first-child]:hidden">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Third Row: Tolerance Percent and Created By */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Tolerance Percent<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="tolerancePercent"
                  type="number"
                  value={parityData.tolerancePercent}
                  onChange={(e) => setParityData((prev) => ({ ...prev, tolerancePercent: e.target.value }))}
                  placeholder="Enter tolerance percent"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                />
              </div>

              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Created By
                </Label>
                <Input
                  id="createdBy"
                  value={parityData.createdBy}
                  disabled
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change History Modal */}
      <Dialog open={showChangeHistory} onOpenChange={setShowChangeHistory}>
        <DialogContent className="max-w-6xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Parity Change History</DialogTitle>
            <DialogDescription>
              Shows the history of all the changes
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 flex-1 overflow-hidden">
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg h-full">
              <div className="h-[400px] overflow-y-auto border-b border-gray-200 dark:border-gray-700 mb-2.5">
                <table className="w-full table-fixed">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-800 align-top">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tl-lg border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-32">
                      <div 
                        className="flex items-center gap-1 cursor-pointer group"
                        onClick={() => handleSort('baselineSite')}
                      >
                        Baseline Site
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                          {getHoverIcon('baselineSite')}
                        </span>
                        <span className="opacity-100 mt-0.5">
                          {getSortIcon('baselineSite')}
                        </span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-24">
                      Restrictions
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                      Qualifications
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                      <div 
                        className="flex items-center justify-center gap-1 cursor-pointer group"
                        onClick={() => handleSort('promotion')}
                      >
                        Promotion
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                          {getHoverIcon('promotion')}
                        </span>
                        <span className="opacity-100 mt-0.5">
                          {getSortIcon('promotion')}
                        </span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                      Tolerance
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                      Activity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                      <div 
                        className="flex items-center gap-1 cursor-pointer group"
                        onClick={() => handleSort('date')}
                      >
                        Action Date
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                          {getHoverIcon('date')}
                        </span>
                        <span className="opacity-100 mt-0.5">
                          {getSortIcon('date')}
                        </span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tr-lg border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-32">
                      <div 
                        className="flex items-center gap-1 cursor-pointer group"
                        onClick={() => handleSort('createdBy')}
                      >
                        Created/Modified By
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                          {getHoverIcon('createdBy')}
                        </span>
                        <span className="opacity-100 mt-0.5">
                          {getSortIcon('createdBy')}
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900">
                  {(() => {
                    const baseData = [
                      {
                        baselineSite: "Booking.com",
                        restrictions: "All",
                        qualifications: "All",
                        promotion: "All",
                        tolerance: "5%",
                        activity: "Added",
                        date: "16 Sep'25",
                        createdBy: "Nitendra Kumar"
                      },
                      {
                        baselineSite: "Expedia",
                        restrictions: "Refundable",
                        qualifications: "Member",
                        promotion: "Early Bird",
                        tolerance: "3%",
                        activity: "Updated",
                        date: "09 Jul'25",
                        createdBy: "Hans Reinmann"
                      },
                      {
                        baselineSite: "Agoda",
                        restrictions: "Non-Refundable",
                        qualifications: "Public",
                        promotion: "Last Minute",
                        tolerance: "7%",
                        activity: "Added",
                        date: "14 Feb'25",
                        createdBy: "Lena Ricklefs"
                      },
                      {
                        baselineSite: "Hotels.com",
                        restrictions: "Flexible",
                        qualifications: "Corporate",
                        promotion: "Package Deal",
                        tolerance: "4%",
                        activity: "Updated",
                        date: "10 Oct'24",
                        createdBy: "Renu Gupta"
                      },
                      {
                        baselineSite: "Brand",
                        restrictions: "All",
                        qualifications: "All",
                        promotion: "All",
                        tolerance: "2%",
                        activity: "Added",
                        date: "08 Aug'24",
                        createdBy: "Paradise Intermediat..."
                      }
                    ];

                    // Generate all data first
                    let allData = Array.from({ length: 50 }, (_, index) => {
                      const change = baseData[index % baseData.length];
                      return {
                        ...change,
                        id: index + 1,
                        baselineSite: `${change.baselineSite} ${index + 1}`,
                        date: change.date,
                        createdBy: `${change.createdBy} ${index + 1}`
                      };
                    });

                    // Apply sorting if sortConfig is set
                    if (sortConfig.key && sortConfig.direction) {
                      allData.sort((a, b) => {
                        let aValue = a[sortConfig.key as keyof typeof a];
                        let bValue = b[sortConfig.key as keyof typeof b];

                        // Handle different data types
                        if (sortConfig.key === 'date') {
                          // Convert dates to comparable format (assuming format like "16 Sep'25")
                          const parseDate = (dateStr: string) => {
                            const [day, monthYear] = dateStr.split(' ');
                            const [month, year] = monthYear.split("'");
                            const monthMap: { [key: string]: number } = {
                              'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                              'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                            };
                            return new Date(2000 + parseInt(year), monthMap[month] - 1, parseInt(day));
                          };
                          aValue = parseDate(aValue as string);
                          bValue = parseDate(bValue as string);
                        } else if (sortConfig.key === 'tolerance') {
                          // Convert to numbers for proper sorting
                          aValue = parseInt((aValue as string).replace('%', ''));
                          bValue = parseInt((bValue as string).replace('%', ''));
                        } else {
                          // String comparison
                          aValue = (aValue as string).toLowerCase();
                          bValue = (bValue as string).toLowerCase();
                        }

                        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                        return 0;
                      });
                    }

                    return allData.map((changeWithId, index) => {
                      const isLastRow = index === 49; // 50 items total, so last index is 49
                      return (
                      <tr key={changeWithId.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}`}>
                        <td className={`px-4 py-2 whitespace-nowrap border-b border-gray-200 dark:border-gray-700 ${isLastRow ? 'rounded-bl-lg' : ''} w-32`}>
                          <TruncatedTooltip 
                            content={changeWithId.baselineSite}
                            className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                          >
                            {changeWithId.baselineSite}
                          </TruncatedTooltip>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-24">
                          <TruncatedTooltip 
                            content={changeWithId.restrictions}
                            className="truncate"
                          >
                            {changeWithId.restrictions}
                          </TruncatedTooltip>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                          <TruncatedTooltip 
                            content={changeWithId.qualifications}
                            className="truncate"
                          >
                            {changeWithId.qualifications}
                          </TruncatedTooltip>
                        </td>
                        <td className="px-4 py-2 text-center text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                          <TruncatedTooltip 
                            content={changeWithId.promotion}
                            className="truncate"
                          >
                            {changeWithId.promotion}
                          </TruncatedTooltip>
                        </td>
                        <td className="px-4 py-2 text-center text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                          <TruncatedTooltip 
                            content={changeWithId.tolerance}
                            className="truncate"
                          >
                            {changeWithId.tolerance}
                          </TruncatedTooltip>
                        </td>
                        <td className="px-4 py-2 text-center text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                          <TruncatedTooltip 
                            content={changeWithId.activity}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              changeWithId.activity === 'Added' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            }`}
                          >
                            {changeWithId.activity}
                          </TruncatedTooltip>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                          <TruncatedTooltip 
                            content={changeWithId.date}
                            className="truncate"
                          >
                            {changeWithId.date}
                          </TruncatedTooltip>
                        </td>
                        <td className={`px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 ${isLastRow ? 'rounded-br-lg' : ''} w-32`}>
                          <TruncatedTooltip 
                            content={changeWithId.createdBy}
                            className="truncate"
                          >
                            {changeWithId.createdBy}
                          </TruncatedTooltip>
                        </td>
                      </tr>
                      );
                    });
                  })()}
                  {/* Add padding to ensure last row is visible */}
                  <tr>
                    <td colSpan={8} className="h-4"></td>
                  </tr>
                </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 dark:border-gray-600 mt-6"></div>

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowChangeHistory(false)}
              className="px-6"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Snackbar Notification */}
      {showSnackbar && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium">Changes saved successfully</span>
            </div>
          </div>
        </div>
      )}
    </div>
    </TooltipProvider>
  )
}
