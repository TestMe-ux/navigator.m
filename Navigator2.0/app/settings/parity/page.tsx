"use client"

import { useState, useRef, useEffect, use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { History, Save, X, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"
import { useSelectedProperty, useUserDetail } from "@/hooks/use-local-storage"
import { getChannels } from "@/lib/channels"
import { AddBRGSettings, getBRGCalculationSetting, getBRGHistory } from "@/lib/parity"
import { format, parseISO } from "date-fns"
import { useToast } from "@/hooks/use-toast"

const baselineSites = ["Booking.com", "BOOKING.COM", "Agoda", "Brand", "Expedia", "Hotels.com"]
const restrictionOptions = [
  { label: "All", value: "-1" },
  { label: "Yes", value: "1" },
  { label: "No", value: "0" },
];
const qualificationOptions = ["All", "Unqualified", "Qualified"]
const promotionOptions = [
  { label: "All", value: "-1" },
  { label: "Yes", value: "1" },
  { label: "No", value: "0" },
];

export default function ParitySettingsPage() {
  const [showChangeHistory, setShowChangeHistory] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null })
  const [isLoading, setIsLoading] = useState(true)
  const [isSave, setIsSave] = useState(false)
  const [selectedProperty] = useSelectedProperty();
  const [userDetails] = useUserDetail();
  const [channels, setChannels] = useState<any[]>([])
  const [parityData, setParityData] = useState<any>({})
  const [parityHistory, setParityHistory] = useState<any[]>([])
  const { toast } = useToast()
  // Simulate loading effect on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000) // Show loading for 3 seconds

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!selectedProperty?.sid) return;

    const fetchChannels = async () => {
      try {
        const response: any = await getChannels({
          SID: selectedProperty.sid
        });

        if (response?.status) {
          setChannels(response.body);
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    };
    const fetechBRGCalculationSetting = async () => {
      try {
        const response: any = await getBRGCalculationSetting({
          SID: selectedProperty.sid
        });

        if (response?.status) {
          setParityData({ ...response.body, SID: selectedProperty.sid, userid: userDetails?.userId });
          setOriginalData({ ...response.body, SID: selectedProperty.sid, userid: userDetails?.userId });
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    };

    setIsLoading(true); // Start loading before fetch
    Promise.all([fetchChannels(), fetechBRGCalculationSetting()]).finally(
      () => setIsLoading(false)
    ); // Ensure both fetches are awaited 
  }, [selectedProperty?.sid]);
  useEffect(() => {
    if (!selectedProperty?.sid || !showChangeHistory) return;

    const fetchParityHistory = async () => {
      try {
        const response: any = await getBRGHistory({
          SID: selectedProperty.sid,
          bCacheRefresh: false
        });

        if (response?.status) {
          setParityHistory(response.body || []);
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        // setIsLoading(false);
      }
    };

    fetchParityHistory();
  }, [showChangeHistory]);
  const [originalData, setOriginalData] = useState();

  // Check if form has been modified
  const hasChanges = JSON.stringify(parityData) !== JSON.stringify(originalData)

  const handleSave = () => {
    // console.log("Parity saved:", parityData)
    // setOriginalData(parityData)
    // setShowSnackbar(true)
    setIsSave(true);
    AddBRGSettings(parityData).then((res: any) => {
      if (res.status && res.body) {
        setOriginalData({ ...parityData, createdBy: userDetails?.firstName + " " + userDetails?.lastName });
        setParityData({ ...parityData, createdBy: userDetails?.firstName + " " + userDetails?.lastName });
        toast({
          description: "Parity settings have been successfully updated.",
          variant: "success",
          duration: 3000,
        })
      }
      else {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again!",
          variant: "error",
          duration: 5000,
        });
      }
    }).catch((err: any) => {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again!",
        variant: "error",
        duration: 5000,
      });
    }).finally(() => {
      setIsSave(false);
    })
    // Auto-hide snackbar after 4 seconds
    // setTimeout(() => {
    //   // setShowSnackbar(false)
    // }, 4000)
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
                disabled={!hasChanges || isSave}
              >
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSave}
              >
                {isSave ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Save in...</span>
                  </div>
                ) : (
                  "Save"
                )}
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
                    value={parityData.otaBenchName.toLowerCase()}
                    onValueChange={(value) => setParityData((prev: any) => ({ ...prev, otaBenchName: value }))}
                  >
                    <SelectTrigger className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Select baseline site" />
                    </SelectTrigger>
                    <SelectContent>
                      {channels?.length > 0 && channels.map((site: any) => (
                        <SelectItem key={site.cid} value={site.name.toLowerCase()} className="pl-3 [&>span:first-child]:hidden">
                          {site.name}
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
                    value={parityData.restriction.toString()}
                    onValueChange={(value) => setParityData((prev: any) => ({ ...prev, restrictions: value }))}
                  >
                    <SelectTrigger className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Select restrictions" />
                    </SelectTrigger>
                    <SelectContent>
                      {restrictionOptions.map((option) => (
                        <SelectItem key={option.label} value={option.value} className="pl-3 [&>span:first-child]:hidden">
                          {option.label}
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
                    value={parityData.qualification}
                    onValueChange={(value) => setParityData((prev: any) => ({ ...prev, qualifications: value }))}
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
                    value={parityData.promotion.toString()}
                    onValueChange={(value) => setParityData((prev: any) => ({ ...prev, promotion: value }))}
                  >
                    <SelectTrigger className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Select promotion" />
                    </SelectTrigger>
                    <SelectContent>
                      {promotionOptions.map((option) => (
                        <SelectItem key={option.label} value={option.value} className="pl-3 [&>span:first-child]:hidden">
                          {option.label}
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
                    min={0}
                    value={parityData.tolerance}
                    onChange={(e) => setParityData((prev: any) => ({ ...prev, tolerance: e.target.value }))}
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
                <div className="h-[300px] overflow-y-auto border-b border-gray-200 dark:border-gray-700 mb-2.5">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50 dark:bg-slate-800">
                      <tr className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-800 align-top">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tl-lg border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-32">
                          <div
                            className="flex items-center gap-1 cursor-pointer group"
                            onClick={() => handleSort('otaBenchName')}
                          >
                            Baseline Site
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                              {getHoverIcon('otaBenchName')}
                            </span>
                            <span className="opacity-100 mt-0.5">
                              {getSortIcon('otaBenchName')}
                            </span>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-24">
                          <div
                            className="flex items-center justify-center gap-1 cursor-pointer group"
                            onClick={() => handleSort('restriction')}
                          >
                            Restrictions
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                              {getHoverIcon('restriction')}
                            </span>
                            <span className="opacity-100 mt-0.5">
                              {getSortIcon('restriction')}
                            </span>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">

                          <div
                            className="flex items-center justify-center gap-1 cursor-pointer group"
                            onClick={() => handleSort('qualification')}
                          >
                            Qualifications
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                              {getHoverIcon('qualification')}
                            </span>
                            <span className="opacity-100 mt-0.5">
                              {getSortIcon('qualification')}
                            </span>
                          </div>
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

                          <div
                            className="flex items-center justify-center gap-1 cursor-pointer group"
                            onClick={() => handleSort('tolerance')}
                          >
                            Tolerance
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                              {getHoverIcon('tolerance')}
                            </span>
                            <span className="opacity-100 mt-0.5">
                              {getSortIcon('tolerance')}
                            </span>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                          Activity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                          <div
                            className="flex items-center gap-1 cursor-pointer group"
                            onClick={() => handleSort('createdOn')}
                          >
                            Action Date
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                              {getHoverIcon('createdOn')}
                            </span>
                            <span className="opacity-100 mt-0.5">
                              {getSortIcon('createdOn')}
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

                        // Generate all data first
                        let allData = parityHistory

                        // Apply sorting if sortConfig is set
                        if (sortConfig.key && sortConfig.direction) {
                          allData.sort((a, b) => {
                            let aValue = a[sortConfig.key as keyof typeof a];
                            let bValue = b[sortConfig.key as keyof typeof b];

                            // Handle different data types
                            if (sortConfig.key === 'createdOn') {
                              // Convert dates to comparable format (assuming format like "16 Sep'25")
                              aValue = !!aValue ? parseISO(aValue as string) : "";
                              bValue = !!aValue ? parseISO(bValue as string) : "";

                              // const result = compareAsc(aDate, bDate);
                            } else if (sortConfig.key === 'tolerance') {
                              // Convert to numbers for proper sorting
                              aValue = parseInt((aValue as string));
                              bValue = parseInt((bValue as string));
                            } else if (sortConfig.key === 'restriction' || sortConfig.key === 'promotion') {
                              // Convert to numbers for proper sorting
                              aValue = parseInt((aValue as string));
                              bValue = parseInt((bValue as string));
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
                          const isLastRow = allData.length === index - 1;// 50 items total, so last index is 49
                          return (
                            <tr key={changeWithId.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}`}>
                              <td className={`px-4 py-2 whitespace-nowrap border-b border-gray-200 dark:border-gray-700 ${isLastRow ? 'rounded-bl-lg' : ''} w-32`}>
                                <TruncatedTooltip
                                  content={changeWithId.otaBenchName}
                                  className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                                >
                                  {changeWithId.otaBenchName}
                                </TruncatedTooltip>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-24">
                                <TruncatedTooltip
                                  content={changeWithId.restriction == -1 ? 'All' : changeWithId.restriction == 0 ? 'No' : 'Yes'}
                                  className="truncate"
                                >
                                  {changeWithId.restriction == -1 ? 'All' : changeWithId.restriction == 0 ? 'No' : 'Yes'}
                                </TruncatedTooltip>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                                <TruncatedTooltip
                                  content={changeWithId.qualification}
                                  className="truncate"
                                >
                                  {changeWithId.qualification}
                                </TruncatedTooltip>
                              </td>
                              <td className="px-4 py-2 text-center text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                                <TruncatedTooltip
                                  content={changeWithId.promotion == -1 ? 'All' : changeWithId.promotion == 0 ? 'No' : 'Yes'}
                                  className="truncate"
                                >
                                  {changeWithId.promotion == -1 ? 'All' : changeWithId.promotion == 0 ? 'No' : 'Yes'}
                                </TruncatedTooltip>
                              </td>
                              <td className="px-4 py-2 text-center text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                                <TruncatedTooltip
                                  content={changeWithId.tolerance}
                                  className="truncate"
                                >
                                  {changeWithId.tolerance} %
                                </TruncatedTooltip>
                              </td>
                              <td className="px-4 py-2 text-center text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                                <TruncatedTooltip
                                  content={changeWithId.action}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${changeWithId.action === 'Added'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                    }`}
                                >
                                  {changeWithId.action}
                                </TruncatedTooltip>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                                <TruncatedTooltip
                                  content={!!changeWithId.createdOn ? format(changeWithId.createdOn, "dd MMM''yy") : ""}
                                  className="truncate"
                                >
                                  {!!changeWithId.createdOn ? format(changeWithId.createdOn, "dd MMM''yy") : ""}
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
                      {/* <tr>
                        <td colSpan={8} className="h-12"></td>
                      </tr> */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* <div className="border-t border-gray-300 dark:border-gray-600 mt-6"></div> */}

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
