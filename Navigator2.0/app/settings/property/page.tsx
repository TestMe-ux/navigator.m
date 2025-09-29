"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { History, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"
import { GetGeneralsettings, GetGeneralsettingsHistory, UpdateProperty, uploadImageData } from "@/lib/login"
import { useSelectedProperty, useUserDetail } from "@/hooks/use-local-storage"
import { format, parseISO } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export default function PropertySettingsPage() {
  const [showChangeHistory, setShowChangeHistory] = useState(false)
  const [isRefresh, setIsRefresh] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProperty] = useSelectedProperty();
  const [userDetails] = useUserDetail();
  const { toast } = useToast()
  // Simulate loading effect on component mount
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setIsLoading(false)
  //   }, 3000) // Show loading for 3 seconds

  //   return () => clearTimeout(timer)
  // }, [])

  const [propertyData, setPropertyData] = useState<any>({})

  const [originalData, setOriginalData] = useState<any>({})
  const [propertyHistory, setPropertyHistory] = useState<any[]>([])

  // Check if form has been modified
  const hasChanges = JSON.stringify(propertyData) !== JSON.stringify(originalData)

  const starCategories = [
    { key: 1, value: "1 Star" },
    { key: 2, value: "2 Star" },
    { key: 3, value: "3 Star" },
    { key: 4, value: "4 Star" },
    { key: 5, value: "5 Star" },
  ];
  useEffect(() => {
    if (!selectedProperty?.sid) return;

    const fetchGeneralsettings = async () => {
      try {
        const response: any = await GetGeneralsettings({
          SID: selectedProperty.sid,
          userid: userDetails?.userId
        });

        if (response?.status) {
          setPropertyData({ ...response.body });
          setOriginalData({ ...response.body });
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    };


    setIsLoading(true); // Start loading before fetch
    Promise.all([fetchGeneralsettings()]).finally(
      () => setIsLoading(false)
    ); // Ensure both fetches are awaited 
  }, [selectedProperty?.sid]);
  useEffect(() => {
    if (!selectedProperty?.sid || !showChangeHistory) return;

    const fetchPropertyHistory = async () => {
      try {
        const response: any = await GetGeneralsettingsHistory({
          SID: selectedProperty.sid,
          userid: userDetails?.userId
        });

        if (response?.status) {
          setPropertyHistory(response.body || []);
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        // setIsLoading(false);
      }
    };

    fetchPropertyHistory();
  }, [showChangeHistory]);
  const handleSave = async () => {
    const dataToSave = { ...propertyData, sid: selectedProperty?.sid, createdBy: userDetails?.userId.toString() };
    console.log("Property saved:", dataToSave)
    // setOriginalData(propertyData)
    // setShowSnackbar(true)
    const resUpdate = await UpdateProperty(dataToSave);
    if (resUpdate?.status) {
      setOriginalData(propertyData)
      toast({
        description: "Property update successfully!!",
        variant: "success",
        duration: 3000,
      })
    }
  }

  const handleReset = () => {
    setPropertyData(originalData)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    debugger
    const file = event.target.files?.[0]
    if (file) {
      // const reader = new FileReader()
      var form_data = new FormData();
      form_data.append('flag', "2");
      form_data.append('profileimage', file);
      const resImage = await uploadImageData(form_data)
      if (resImage?.status) {
        setPropertyData((prev: any) => ({ ...prev, imagePath: resImage.body[0] }));
      }
      else {
        toast({
          description: "Image upload failed!!",
          variant: "error",
          duration: 3000,
        });
      }
    }
  }

  const triggerFileInput = () => {
    const fileInput = document.getElementById('property-image-upload') as HTMLInputElement
    fileInput?.click()
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

              {/* Property Details Card Skeleton */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 z-10">
                  <div className="h-[3px] w-full bg-gray-200/50 dark:bg-gray-800/50 overflow-hidden rounded-sm">
                    <div className="h-full bg-blue-500/90 shadow-sm shadow-blue-500/20 transition-all duration-150 ease-out w-3/4"></div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-6 lg:space-y-0">
                    {/* Property Image */}
                    <div className="flex-shrink-0 flex items-end">
                      <div className="w-16 h-16 bg-gray-300 animate-pulse rounded"></div>
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

              {/* Property Settings Form Skeleton */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 z-10">
                  <div className="h-[3px] w-full bg-gray-200/50 dark:bg-gray-800/50 overflow-hidden rounded-sm">
                    <div className="h-full bg-blue-500/90 shadow-sm shadow-blue-500/20 transition-all duration-150 ease-out w-1/2"></div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-10 w-full bg-gray-300 animate-pulse rounded"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-10 w-full bg-gray-300 animate-pulse rounded"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
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
                        <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-10 w-full bg-gray-300 animate-pulse rounded"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
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
              <span className="text-xl font-semibold text-foreground">Property Settings</span>
              <p className="text-sm text-muted-foreground">
                Configure property information, location details, and operational parameters
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

        {/* Property Details */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-gray-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* First Row: Property Name and Property Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 mb-1">
                      Property Name<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="hotelName"
                      value={propertyData?.hotelName}
                      disabled={true}
                      onChange={(e) => setPropertyData((prev: any) => ({ ...prev, hotelName: e.target.value }))}
                      placeholder="Enter property name"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                    />
                  </div>

                  {/* Location and Currency below Property Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="block text-xs font-medium text-gray-700 mb-1">
                        Location<span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="location"
                        value={propertyData.location}
                        onChange={(e) => setPropertyData((prev: any) => ({ ...prev, location: e.target.value }))}
                        placeholder="Enter location"
                        disabled={true}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                      />
                    </div>

                    <div>
                      <Label className="block text-xs font-medium text-gray-700 mb-1">
                        Currency<span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="currency"
                        value={propertyData.currency}
                        onChange={(e) => setPropertyData((prev: any) => ({ ...prev, currency: e.target.value }))}
                        placeholder="Enter Currency"
                        disabled={true}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                      />
                      {/* <Select
                        value={propertyData.currency}
                        onValueChange={(value) => setPropertyData((prev:any) => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency} value={currency} className="pl-3 [&>span:first-child]:hidden">
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select> */}
                    </div>
                  </div>

                  {/* Star Category and Total Rooms below Location and Currency */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="block text-xs font-medium text-gray-700 mb-1">
                        Star Category<span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Select
                        value={propertyData.starRating.toString()}
                        onValueChange={(value) => setPropertyData((prev: any) => ({ ...prev, starRating: value }))}
                      >
                        <SelectTrigger className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0">
                          <SelectValue placeholder="Select star category" />
                        </SelectTrigger>
                        <SelectContent>
                          {starCategories.map((category) => (
                            <SelectItem key={category.value} value={category.key.toString()} className="pl-3 [&>span:first-child]:hidden">
                              {category.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="block text-xs font-medium text-gray-700 mb-1">
                        Total Rooms<span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="numberOfRoom"
                        type="number"
                        min={0}
                        value={propertyData.numberOfRoom}
                        onChange={(e) => setPropertyData((prev: any) => ({ ...prev, numberOfRoom: e.target.value }))}
                        placeholder="Enter total rooms"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label className="text-xs font-medium text-gray-700">
                        Property Image
                      </Label>
                      {propertyData.imagePath && (
                        <button
                          type="button"
                          onClick={() => setPropertyData((prev: any) => ({ ...prev, imagePath: "" }))}
                          className="text-xs text-red-600 hover:underline mt-1"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="property-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        onClick={triggerFileInput}
                        className="w-full h-32 border-2 border-dashed border-gray-300 rounded-md bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors flex flex-col items-center justify-center group"
                      >
                        {propertyData.imagePath ? (
                          <img
                            src={propertyData.imagePath}
                            alt="Property"
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm">Click to upload image</span>
                          </div>
                        )}
                      </button>
                    </div>

                  </div>

                  {/* Created By below Property Image */}
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 mb-1">
                      Created By
                    </Label>
                    <Input
                      id="createdBy"
                      value={propertyData.createdBy}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change History Modal */}
        <Dialog open={showChangeHistory} onOpenChange={setShowChangeHistory}>
          <DialogContent className="max-w-6xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Property Change History</DialogTitle>
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
                            className="flex items-center gap-1 cursor-pointer group -ml-2"
                            onClick={() => handleSort('hotelName')}
                          >
                            Property Name
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                              {getHoverIcon('hotelName')}
                            </span>
                            <span className="opacity-100 mt-0.5">
                              {getSortIcon('hotelName')}
                            </span>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-24">
                          Location
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                          Currency
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                          <div
                            className="flex items-center justify-center gap-1 cursor-pointer group"
                            onClick={() => handleSort('starRating')}
                          >
                            Category
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                              {getHoverIcon('starRating')}
                            </span>
                            <span className="opacity-100 mt-0.5">
                              {getSortIcon('starRating')}
                            </span>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">

                          <div
                            className="flex items-center gap-1 cursor-pointer group"
                            onClick={() => handleSort('numberOfRoom')}
                          >
                            Rooms
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                              {getHoverIcon('numberOfRoom')}
                            </span>
                            <span className="opacity-100 mt-0.5">
                              {getSortIcon('numberOfRoom')}
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
                        {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tr-lg border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-32">
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
                        </th> */}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900">
                      {(() => {


                        // Generate all data first
                        let allData = [...propertyHistory];

                        // Apply sorting if sortConfig is set
                        if (sortConfig.key && sortConfig.direction) {
                          allData.sort((a, b) => {
                            debugger;
                            let aValue = a[sortConfig.key as keyof typeof a];
                            let bValue = b[sortConfig.key as keyof typeof b];

                            // Handle different data types
                            if (sortConfig.key === 'createdOn') {
                              // Convert dates to comparable format (assuming format like "16 Sep'25")
                              aValue = !!aValue ? parseISO(aValue as string) : "";
                              bValue = !!aValue ? parseISO(bValue as string) : "";
                            } else if (sortConfig.key === 'numberOfRoom' || sortConfig.key === 'starRating') {
                              // Convert to numbers for proper sorting
                              aValue = parseInt(aValue as string);
                              bValue = parseInt(bValue as string);
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
                          const isLastRow = allData.length === index - 1;
                          return (
                            <tr key={changeWithId.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}`}>
                              <td className={`px-4 py-2 whitespace-nowrap border-b border-gray-200 dark:border-gray-700 ${isLastRow ? 'rounded-bl-lg' : ''} w-32`}>
                                <TruncatedTooltip
                                  content={changeWithId.hotelName}
                                  className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                                >
                                  {changeWithId.hotelName}
                                </TruncatedTooltip>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-24">
                                <TruncatedTooltip
                                  content={changeWithId.location}
                                  className="truncate"
                                >
                                  {changeWithId.location}
                                </TruncatedTooltip>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                                <TruncatedTooltip
                                  content={changeWithId.currency}
                                  className="truncate"
                                >
                                  {changeWithId.currency}
                                </TruncatedTooltip>
                              </td>
                              <td className="px-4 py-2 text-center text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                                <TruncatedTooltip
                                  content={changeWithId.starRating}
                                  className="truncate"
                                >
                                  {changeWithId.starRating}
                                </TruncatedTooltip>
                              </td>
                              <td className="px-4 py-2 text-center text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                                <TruncatedTooltip
                                  content={changeWithId.numberOfRoom}
                                  className="truncate"
                                >
                                  {changeWithId.numberOfRoom}
                                </TruncatedTooltip>
                              </td>
                              <td className="px-4 py-2 text-center text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                                <TruncatedTooltip
                                  content={changeWithId.action}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${changeWithId.activity === 'Added'
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
                              {/* <td className={`px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 ${isLastRow ? 'rounded-br-lg' : ''} w-32`}>
                                <TruncatedTooltip
                                  content={changeWithId.createdBy}
                                  className="truncate"
                                >
                                  {changeWithId.createdBy}
                                </TruncatedTooltip>
                              </td> */}
                            </tr>
                          );
                        });
                      })()}
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
        {/* {showSnackbar && (
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
        )} */}
      </div>
    </TooltipProvider>
  )
}
