"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Search, Plus, History, MoreVertical, Edit, Trash2, X, CheckCircle, ArrowUp, ArrowDown, ArrowUpDown, Loader2 } from "lucide-react"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"
import { Switch } from "@/components/ui/switch"
import { useSelectedProperty, useUserDetail } from "@/hooks/use-local-storage"
import { AddCompSet, getAllCompSet, getAllHistoryCompSet, getSearchHotelList, updateCompSet } from "@/lib/compset"
import { format, parseISO, set } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { get } from "http"
export default function CompsetSettingsPage() {
  const [competitors, setCompetitors] = useState<any[]>([])
  const [maxCompetitors, setMaxCompetitors] = useState<number>(0)
  const [compsetHistory, setCompsetHistory] = useState<any[]>([])
  const [updateCompetitor, setUpdateCompetitor] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddCompetitor, setShowAddCompetitor] = useState(false)
  const [showChangeHistory, setShowChangeHistory] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)
  // const [showDeleteSnackbar, setShowDeleteSnackbar] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [competitorToDelete, setCompetitorToDelete] = useState<any>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProperty] = useSelectedProperty();
  const [userDetails] = useUserDetail();
  const [newCompetitor, setNewCompetitor] = useState({
    hotelName: "",
    competitorType: "Primary",
    hotelMasterId: 0
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchApi, setIsSearchApi] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [isInputFocused, setIsInputFocused] = useState(false)
  const { toast } = useToast()
  // Auto-hide snackbar after 5 seconds


  // Simulate loading effect on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000) // Show loading for 3 seconds

    return () => clearTimeout(timer)
  }, [])

  // Filter suggestions based on search query
  useEffect(() => {
    debugger

    setShowSuggestions(false)
    if (searchQuery.trim() === "" || searchQuery.length < 3) {
      setFilteredSuggestions([])
    } else {
      if (newCompetitor.hotelMasterId > 0) return;
      setIsInputFocused(false);
      setIsSearchApi(true);
      getSearchHotelList(searchQuery.toLowerCase(), selectedProperty?.sid || 0, selectedProperty?.hmid || 0).then((response: any) => {
        if (response?.Status && response?.Body?.length > 0) {
          setFilteredSuggestions(response?.Body)
          setShowSuggestions(response?.Body?.length > 0)
        }
      }).finally(() => {
        setIsInputFocused(true);
        setIsSearchApi(false);
      });

    }
  }, [searchQuery])
  useEffect(() => {
    if (!selectedProperty?.sid) return;

    const fetchCompset = async () => {
      try {
        const response: any = await getAllCompSet({
          SID: selectedProperty.sid,
          isTempraroy: true
        });

        if (response?.status) {
          setCompetitors(response.body || []);
          const maxComp = response.body?.[0].maxNumberOfCompetitors
          if (maxComp) {
            setMaxCompetitors(maxComp);
          }
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true); // Start loading before fetch
    fetchCompset();
  }, [selectedProperty?.sid, showSnackbar]);
  useEffect(() => {
    if (!selectedProperty?.sid || !showChangeHistory) return;

    const fetchChannelHistory = async () => {
      try {
        const response: any = await getAllHistoryCompSet({
          SID: selectedProperty.sid
        });

        if (response?.status) {
          setCompsetHistory(response.body || []);
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        // setIsLoading(false);
      }
    };

    fetchChannelHistory();
  }, [showChangeHistory]);
  const filteredCompetitors = useMemo(() => {
    if (competitors.length === 0) return [];
    const search = (searchValue || searchTerm || '').toLowerCase();

    return competitors.filter((competitor) =>
      competitor.name.toLowerCase().includes((search).toLowerCase()) ||
      competitor.createdBy.toLowerCase().includes((search).toLowerCase()),
    )
  }, [competitors, searchValue, searchTerm]);

  const handleAddCompetitor = async () => {
    debugger;
    if (newCompetitor.hotelName && newCompetitor.competitorType) {
      const competitor = {
        "IsSecondary": newCompetitor.competitorType === "Primary" ? false : true,
        "userId": userDetails?.userId,
        "SID": selectedProperty?.sid,
        "propertyID": newCompetitor.hotelMasterId,
        "name": newCompetitor.hotelName,
      }
      const compLength = competitors.length
      if (compLength < maxCompetitors) {
        setIsSearchApi(true);
        const response = await AddCompSet(competitor);
        if (response.status) {
          handleCancelAddCompetitor();
          toast({
            description: response.message || "Competitor has been added successfully",
            variant: "success",
            duration: 3000,
          })
          setShowSnackbar(true)
        }
        else {
          toast({
            title: "Error",
            description: response.message || "Something went wrong. Please try again!",
            variant: "error",
            duration: 5000,
          })
        }
      }
      else {
        toast({
          title: "Error",
          description: "You have exceed max no of competitor and max number: " + maxCompetitors,
          variant: "error",
          duration: 5000,
        })
      }
      setIsSearchApi(false)
      // setCompetitors((prev) => [...prev, competitor])
      // setNewCompetitor({ hotelName: "", competitorType: "Primary", hotelMasterId: 0 })

    }
  }
  const handleAddPopCompetitor = () => {
    const compLength = competitors.length
    if (compLength < maxCompetitors) {
      setShowAddCompetitor(true);
    }
    else {
      toast({
        title: "Error",
        description: "You have exceed max no of competitor and max number: " + maxCompetitors,
        variant: "error",
        duration: 5000,
      })
    }
  }


  const handleCancelAddCompetitor = () => {
    setNewCompetitor({ hotelName: "", competitorType: "Primary", hotelMasterId: 0 })
    setSearchQuery("")
    setShowSuggestions(false)
    setShowAddCompetitor(false)
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debugger
    const value = e.target.value
    setSearchQuery(value)
    setNewCompetitor((prev) => ({ ...prev, hotelName: value, hotelMasterId: 0 }))
  }

  const handleSuggestionSelect = (suggestion: any) => {
    debugger;
    setSearchQuery(suggestion.Name)
    setNewCompetitor((prev) => ({ ...prev, hotelName: suggestion.Name, hotelMasterId: suggestion.HotelMasterId }))
    setShowSuggestions(false)
  }

  const handleSearchInputFocus = () => {
    setIsInputFocused(true)
    if (searchQuery.trim() !== "") {
      setShowSuggestions(true)
    }
  }

  const handleSearchInputBlur = () => {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => {
      setIsInputFocused(false)
      setShowSuggestions(false)
    }, 200)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setNewCompetitor((prev) => ({ ...prev, hotelName: "" }))
    setShowSuggestions(false)
  }

  const handleDeleteCompetitor = (competitor: number) => {
    setCompetitorToDelete(competitor)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteCompetitor = () => {
    if (competitorToDelete) {
      updateStatus(competitorToDelete.compsetID, true, competitorToDelete.propertyID, false);
    }
  }

  const cancelDeleteCompetitor = () => {
    setShowDeleteConfirm(false)
    setCompetitorToDelete(null)
  }

  const toggleSearch = () => {
    setShowSearch(!showSearch)
    if (showSearch) {
      setSearchValue("")
    }
  }

  const clearSearch = () => {
    setSearchValue("")
    setSearchTerm("")
    setShowSearch(false)
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
      return null
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
      return null
    }
    return <ArrowUpDown className="w-3 h-3 font-bold text-gray-500 dark:text-gray-400" strokeWidth={2.5} />
  }

  const getStatusBadge = (status: string) => {
    if (status === "Active") {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 text-xs">
          {status}
        </Badge>
      )
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100 text-xs">
        {status}
      </Badge>
    )
  }

  const handleToggleStatus = (competitorObj: any, checked: any) => {
    setUpdateCompetitor(competitorObj.compsetID);
    updateStatus(competitorObj.compsetID, false, competitorObj.propertyID, checked);
  }
  const updateStatus = async (
    compsetID: any,
    isDelete: any,
    propertyID: any,
    event: any
  ) => {
    debugger;
    const isActive = event === true;
    setIsSearchApi(true);
    try {
      const response: any = await updateCompSet({
        compsetid: compsetID,
        SID: selectedProperty?.sid,
        propertyId: propertyID,
        isdelete: isDelete,
        isActive,
      });

      if (response.status && response.body) {
        // Re-fetch data
        // await getAllCompSet();
        // await getAllHistoryCompSet();

        if (isDelete) {
          setCompetitors((prev) => prev.filter((competitor) => competitor.compsetID !== competitorToDelete.compsetID))
          setShowDeleteConfirm(false)
          setCompetitorToDelete(null)
          // setShowDeleteSnackbar(true)
          toast({
            title: "Deleted",
            description: `Competitor has been deleted successfully`,
            variant: "destructive",
            duration: 3000,
          })
          // enqueueSnackbar("c", { variant: "success" });

        } else {
          toast({
            title: "Status Updated",
            description: `Competitor has been ${isActive ? 'activated' : 'deactivated'} successfully`,
            variant: "success",
            duration: 3000,
          })
          setCompetitors((prev) =>
            prev.map((competitor) =>
              competitor.compsetID === compsetID
                ? {
                  ...competitor,
                  status: event,
                }
                : competitor
            )
          )
          // enqueueSnackbar("Compset Status Updated successfully!!", { variant: "success" });

        }
      } else if (!response.status && !response.body) {
        toast({
          title: "Update Failed",
          description: response.message || "Failed to update competitor status",
          variant: "error",
          duration: 5000,
        });
      } else {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again!",
          variant: "error",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error updating compset status:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again!",
        variant: "error",
        duration: 5000,
      });
    } finally {
      setUpdateCompetitor(null);
      setIsSearchApi(false);
    }
  };


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
                  <div className="h-9 w-9 bg-gray-300 animate-pulse rounded"></div>
                  <div className="h-9 w-32 bg-gray-300 animate-pulse rounded"></div>
                </div>
              </div>

              {/* Search Bar Skeleton */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 z-10">
                  <div className="h-[3px] w-full bg-gray-200/50 dark:bg-gray-800/50 overflow-hidden rounded-sm">
                    <div className="h-full bg-blue-500/90 shadow-sm shadow-blue-500/20 transition-all duration-150 ease-out w-3/4"></div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-80 bg-gray-300 animate-pulse rounded"></div>
                    <div className="h-10 w-24 bg-gray-300 animate-pulse rounded"></div>
                  </div>
                </CardContent>
              </Card>

              {/* Competitors Table Skeleton */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 z-10">
                  <div className="h-[3px] w-full bg-gray-200/50 dark:bg-gray-800/50 overflow-hidden rounded-sm">
                    <div className="h-full bg-blue-500/90 shadow-sm shadow-blue-500/20 transition-all duration-150 ease-out w-1/2"></div>
                  </div>
                </div>
                <CardContent className="p-0">
                  {/* Table Header */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b">
                    <div className="grid grid-cols-6 gap-4">
                      <div className="h-4 w-32 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-28 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                  </div>

                  {/* Table Rows */}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="px-4 py-4 border-b last:border-b-0">
                      <div className="grid grid-cols-6 gap-4 items-center">
                        <div className="h-4 w-40 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-6 w-16 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-6 w-12 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-8 w-8 bg-gray-300 animate-pulse rounded"></div>
                      </div>
                    </div>
                  ))}
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
              <span className="text-xl font-semibold text-foreground">Competitor Management</span>
              <p className="text-sm text-muted-foreground">
                Define and manage your competitive set, track competitor performance and pricing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Search Icon/Field */}
            <div className="flex items-center gap-2">
              {!showSearch ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={toggleSearch}
                        className="flex items-center gap-2"
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Search By Competitor Name</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <div className="relative">
                  <Input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search..."
                    className="w-[120px] h-9 px-3 pr-8 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6 hover:bg-gray-100"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => setShowChangeHistory(true)}
              className="flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              Change History
            </Button>
            <Button
              onClick={() => handleAddPopCompetitor()}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Competitor
            </Button>
          </div>
        </div>

        {/* Competitors Table */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-gray-200 dark:border-slate-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tl-lg w-56">
                      <div
                        className="flex items-center gap-1 cursor-pointer group"
                        onClick={() => handleSort('name')}
                      >
                        Competitor Name
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                          {getHoverIcon('name')}
                        </span>
                        <span className="opacity-100 mt-0.5">
                          {getSortIcon('name')}
                        </span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                      <div
                        className="flex items-center gap-1 cursor-pointer group"
                        onClick={() => handleSort('createdDate')}
                      >
                        Created On
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                          {getHoverIcon('createdDate')}
                        </span>
                        <span className="opacity-100 mt-0.5">
                          {getSortIcon('createdDate')}
                        </span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                      <div
                        className="flex items-center gap-1 cursor-pointer group"
                        onClick={() => handleSort('createdModifiedBy')}
                      >
                        Created By
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                          {getHoverIcon('createdModifiedBy')}
                        </span>
                        <span className="opacity-100 mt-0.5">
                          {getSortIcon('createdModifiedBy')}
                        </span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tr-lg">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCompetitors.map((competitor, index) => {
                    const isLastRow = index === filteredCompetitors.length - 1;
                    return (
                      <tr key={competitor.compsetID} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}`}>
                        <td className={`px-3 py-2 whitespace-nowrap ${isLastRow ? 'rounded-bl-lg' : ''} w-56`}>
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-black dark:text-white truncate">
                              {competitor.name}
                            </div>
                            {competitor.isTemporary && (
                              <div className="ml-2">
                                <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 text-xs">
                                  Requested
                                </Badge>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <div className="flex items-center">
                            <Badge
                              variant={!competitor.isSecondary ? "default" : "secondary"}
                              className={`text-xs ${!competitor.isSecondary
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : ""
                                }`}
                            >
                              {competitor.isSecondary ? "Secondary" : "Primary"}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {format(competitor.createdDate, "dd MMM''yy")}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <TruncatedTooltip
                            content={competitor.createdBy}
                            className="truncate"
                          >
                            {competitor.createdBy}
                          </TruncatedTooltip>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center">

                          {updateCompetitor === competitor.compsetID ? (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-blue-600 rounded-full animate-spin" />
                          ) : (<Switch
                            checked={competitor.status}
                            onCheckedChange={(checked) => handleToggleStatus(competitor, checked)}
                            disabled={competitor.isTemporary || updateCompetitor !== null}
                            className="scale-75"
                          />)}
                        </td>
                        <td className={`px-4 py-2 whitespace-nowrap text-center ${isLastRow ? 'rounded-br-lg' : ''}`}>
                          <div className="flex items-center justify-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => !competitor.isTemporary && handleDeleteCompetitor(competitor)}
                                    disabled={competitor.isTemporary || updateCompetitor !== null}
                                    className={`h-6 w-6 p-0 ${!competitor.isTemporary
                                      ? "text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                      : "text-gray-500 cursor-not-allowed"
                                      }`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black text-white">
                                  <p>{!competitor.isTemporary ? "Delete Competitor" : "Disabled"}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add Competitor Modal */}
        <Dialog open={showAddCompetitor} onOpenChange={setShowAddCompetitor}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-black">Add Competitor</DialogTitle>
              <DialogDescription>
                Add a new competitor to your competitive set.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="hotel-name" className="block text-xs font-medium text-gray-700 mb-1">
                  Hotel Name<span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="hotel-name"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={handleSearchInputFocus}
                    onBlur={handleSearchInputBlur}
                    // disabled={isSearchApi}
                    placeholder="Search and select hotel name"
                    className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                  />
                  {isInputFocused && searchQuery && !isSearchApi && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {isSearchApi && searchQuery && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  )}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredSuggestions.map((suggestion: any, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onMouseDown={() => handleSuggestionSelect(suggestion)}
                        >
                          {suggestion.Name}
                          <div className="text-blue-800"> {suggestion.Address1}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="block text-xs font-medium text-gray-700 mb-1" style={{ marginBottom: '10px' }}>
                  Competitor Type<span className="text-red-500 ml-1">*</span>
                </Label>
                <RadioGroup
                  value={newCompetitor.competitorType}
                  onValueChange={(value) => setNewCompetitor((prev) => ({ ...prev, competitorType: value }))}
                  className="flex flex-row"
                  style={{ gap: '48px' }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Primary" id="primary" />
                    <Label htmlFor="primary" className="text-sm text-gray-700 cursor-pointer">
                      Primary
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Secondary" id="secondary" />
                    <Label htmlFor="secondary" className="text-sm text-gray-700 cursor-pointer">
                      Secondary
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleCancelAddCompetitor}
                className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCompetitor}
                disabled={!searchQuery || !newCompetitor.competitorType || isSearchApi}
                className="h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Add Competitor
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Change History Modal */}
        <Dialog open={showChangeHistory} onOpenChange={setShowChangeHistory}>
          <DialogContent className="max-w-6xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Competitor Change History</DialogTitle>
              <DialogDescription>
                View all changes made to competitor set settings
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 flex-1 overflow-hidden">
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg h-full">
                <div className="h-[300px] overflow-y-auto border-b border-gray-200 dark:border-gray-700 mb-2.5">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50 dark:bg-slate-800">
                      <tr className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-800 align-top">
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tl-lg border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-56">
                          <div
                            className="flex items-center gap-1 cursor-pointer group"
                            onClick={() => handleSort('name')}
                          >
                            Competitor Name
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                              {getHoverIcon('name')}
                            </span>
                            <span className="opacity-100 mt-0.5">
                              {getSortIcon('name')}
                            </span>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                          <div
                            className="flex items-center gap-1 cursor-pointer group"
                            onClick={() => handleSort('createdDate')}
                          >
                            Modified On
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                              {getHoverIcon('createdDate')}
                            </span>
                            <span className="opacity-100 mt-0.5">
                              {getSortIcon('createdDate')}
                            </span>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-32">
                          <div
                            className="flex items-center gap-1 cursor-pointer group"
                            onClick={() => handleSort('createdBy')}
                          >
                            Created By
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                              {getHoverIcon('createdBy')}
                            </span>
                            <span className="opacity-100 mt-0.5">
                              {getSortIcon('createdBy')}
                            </span>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                          Status
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tr-lg border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                          Activity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900">
                      {(() => {
                        let allData = compsetHistory

                        // Apply sorting if sortConfig is set
                        if (sortConfig.key && sortConfig.direction) {
                          allData.sort((a, b) => {
                            debugger;
                            let aValue = a[sortConfig.key as keyof typeof a];
                            let bValue = b[sortConfig.key as keyof typeof b];

                            // Handle different data types
                            if (sortConfig.key === 'createdDate') {
                              // Convert dates to comparable format (assuming format like "16 Sep'25")
                              aValue = !!aValue ? parseISO(aValue as string) : "";
                              bValue = !!aValue ? parseISO(bValue as string) : "";

                              // const result = compareAsc(aDate, bDate);
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
                          const isLastRow = index === compsetHistory.length - 1;
                          return (
                            <tr key={index} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}`}>
                              <td className={`px-3 py-2 whitespace-nowrap border-b border-gray-200 dark:border-gray-700 ${isLastRow ? 'rounded-bl-lg' : ''} w-56`}>
                                <TruncatedTooltip
                                  content={changeWithId.name}
                                  className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                                >
                                  {changeWithId.name}
                                </TruncatedTooltip>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                                <div className="flex items-center">
                                  <Badge
                                    variant={!changeWithId.isSecondary ? "default" : "secondary"}
                                    className={`text-xs ${!changeWithId.isSecondary
                                      ? "bg-blue-500 text-white hover:bg-blue-600"
                                      : ""
                                      }`}
                                  >
                                    {changeWithId.isSecondary ? "Secondary" : "Primary"}
                                  </Badge>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                                <TruncatedTooltip
                                  content={!!changeWithId.createdDate ? format(changeWithId.createdDate, "dd MMM''yy") : ""}
                                  className="truncate"
                                >
                                  {!!changeWithId.createdDate ? format(changeWithId.createdDate, "dd MMM''yy") : ""}
                                </TruncatedTooltip>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-32">
                                <TruncatedTooltip
                                  content={changeWithId.createdBy}
                                  className="truncate"
                                >
                                  {changeWithId.createdBy}
                                </TruncatedTooltip>
                              </td>
                              <td className="px-4 py-2 text-center text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                                <Switch
                                  checked={changeWithId.status}
                                  onCheckedChange={() => { }}
                                  className="scale-75"
                                  disabled
                                />
                              </td>
                              <td className={`px-4 py-2 text-center text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 ${isLastRow ? 'rounded-br-lg' : ''} w-20`}>
                                <TruncatedTooltip
                                  content={changeWithId.compSetType == "U" ? "Updated" : changeWithId.compSetType == "N" ? "Created" : "Deleted"}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                    ${changeWithId.compSetType == "N"
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                      : changeWithId.compSetType == "U" ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                    }`}
                                >
                                  {changeWithId.compSetType == "U" ? "Updated" : changeWithId.compSetType == "N" ? "Created" : "Deleted"}
                                </TruncatedTooltip>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                      {/* Add padding to ensure last row is visible */}
                      {/* <tr>
                        <td colSpan={6} className="h-4"></td>
                      </tr> */}
                    </tbody>
                    {/* Add blank space after table */}
                    {/* <div className="h-2.5"></div> */}
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-black">Delete Competitor</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this competitor? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={cancelDeleteCompetitor}
                className="px-6"
                disabled={isSearchApi}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteCompetitor}
                className="px-6 bg-red-600 hover:bg-red-700 text-white"
                disabled={isSearchApi}
              >
                {isSearchApi ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting ...</span>
                  </div>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Success Snackbar */}
        {/* {showSnackbar && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">
                  Competitor added successfully
                </span>
              </div>
            </div>
          </div>
        )} */}

        {/* Delete Success Snackbar */}
        {/* {showDeleteSnackbar && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">
                  Competitor deleted successfully
                </span>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </TooltipProvider>
  )
}
