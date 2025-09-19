"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Search, Plus, History, MoreVertical, Edit, Trash2, X, CheckCircle, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"
import { Switch } from "@/components/ui/switch"

// Mock competitor data
const mockCompetitors = [
  {
    id: 1,
    name: "Andaz Liverpool Street",
    compSet: "Primary",
    status: "Active",
    date: "14 Feb'25",
    createdModifiedBy: "Nitendra Kumar",
    activity: "Updated",
    canDelete: true,
  },
  {
    id: 2,
    name: "Holiday Inn London - Camden Lock",
    compSet: "Primary",
    status: "Active",
    date: "14 Feb'25",
    createdModifiedBy: "Nitendra Kumar",
    activity: "Created",
    canDelete: true,
  },
  {
    id: 3,
    name: "The Langham London",
    compSet: "Secondary",
    status: "Inactive",
    date: "14 Feb'25",
    createdModifiedBy: "Nitendra Kumar",
    activity: "Updated",
    canDelete: true,
  },
  {
    id: 4,
    name: "The Savoy London",
    compSet: "Primary",
    status: "Active",
    date: "14 Feb'25",
    createdModifiedBy: "Nitendra Kumar",
    activity: "Created",
    canDelete: true,
  },
  {
    id: 5,
    name: "Marriott Executive Suites",
    compSet: "Primary",
    status: "Inactive",
    date: "14 Feb'25",
    createdModifiedBy: "Nitendra Kumar",
    activity: "Updated",
    canDelete: true,
  },
  {
    id: 6,
    name: "Hilton London Paddington",
    compSet: "Primary",
    status: "Active",
    date: "14 Feb'25",
    createdModifiedBy: "Nitendra Kumar",
    activity: "Created",
    canDelete: true,
  },
  {
    id: 7,
    name: "InterContinental London",
    compSet: "Secondary",
    status: "Active",
    date: "14 Feb'25",
    createdModifiedBy: "Nitendra Kumar",
    activity: "Created",
    canDelete: true,
  },
  {
    id: 8,
    name: "The Ritz London",
    compSet: "Primary",
    status: "Active",
    date: "14 Feb'25",
    createdModifiedBy: "Nitendra Kumar",
    activity: "Updated",
    canDelete: true,
  },
]

// Sample hotel suggestions for searchable dropdown
const hotelSuggestions = [
  "Andaz Liverpool Street",
  "Holiday Inn London - Camden Lock",
  "The Langham London",
  "The Savoy London",
  "Marriott Executive Suites",
  "Hilton London Paddington",
  "InterContinental London",
  "The Ritz London",
  "Claridge's London",
  "The Connaught",
  "The Berkeley",
  "The Lanesborough",
  "Mandarin Oriental Hyde Park",
  "The Dorchester",
  "Brown's Hotel",
  "The Goring",
  "The Milestone Hotel",
  "The Montcalm London",
  "The Ned",
  "The Shard",
  "Tower Bridge Hotel",
  "The Tower Hotel",
  "The Tower Suites",
  "The Tower Bridge Suites",
  "The Tower Bridge Hotel & Suites"
]

export default function CompsetSettingsPage() {
  const [competitors, setCompetitors] = useState(mockCompetitors)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddCompetitor, setShowAddCompetitor] = useState(false)
  const [showChangeHistory, setShowChangeHistory] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [showDeleteSnackbar, setShowDeleteSnackbar] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [competitorToDelete, setCompetitorToDelete] = useState<number | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null })
  const [isLoading, setIsLoading] = useState(true)
  const [newCompetitor, setNewCompetitor] = useState({
    hotelName: "",
    competitorType: "Primary",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [isInputFocused, setIsInputFocused] = useState(false)

  // Auto-hide snackbar after 5 seconds
  useEffect(() => {
    if (showSnackbar) {
      const timer = setTimeout(() => {
        setShowSnackbar(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showSnackbar])

  // Auto-hide delete snackbar after 5 seconds
  useEffect(() => {
    if (showDeleteSnackbar) {
      const timer = setTimeout(() => {
        setShowDeleteSnackbar(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showDeleteSnackbar])

  // Simulate loading effect on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000) // Show loading for 3 seconds

    return () => clearTimeout(timer)
  }, [])

  // Filter suggestions based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSuggestions([])
      setShowSuggestions(false)
    } else {
      const filtered = hotelSuggestions.filter(hotel =>
        hotel.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    }
  }, [searchQuery])

  const filteredCompetitors = competitors.filter((competitor) =>
    competitor.name.toLowerCase().includes((searchValue || searchTerm).toLowerCase()) ||
    competitor.createdModifiedBy.toLowerCase().includes((searchValue || searchTerm).toLowerCase()),
  )

  const handleAddCompetitor = () => {
    if (newCompetitor.hotelName && newCompetitor.competitorType) {
      const competitor = {
        id: competitors.length + 1,
        name: newCompetitor.hotelName,
        compSet: newCompetitor.competitorType,
        status: "Active",
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }),
        createdModifiedBy: "Current User",
        activity: "Created",
        canDelete: true,
      }
      setCompetitors((prev) => [...prev, competitor])
      setNewCompetitor({ hotelName: "", competitorType: "Primary" })
      setShowAddCompetitor(false)
      setShowSnackbar(true)
    }
  }

  const handleCancelAddCompetitor = () => {
    setNewCompetitor({ hotelName: "", competitorType: "Primary" })
    setSearchQuery("")
    setShowSuggestions(false)
    setShowAddCompetitor(false)
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setNewCompetitor((prev) => ({ ...prev, hotelName: value }))
  }

  const handleSuggestionSelect = (suggestion: string) => {
    setSearchQuery(suggestion)
    setNewCompetitor((prev) => ({ ...prev, hotelName: suggestion }))
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

  const handleDeleteCompetitor = (competitorId: number) => {
    setCompetitorToDelete(competitorId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteCompetitor = () => {
    if (competitorToDelete) {
      setCompetitors((prev) => prev.filter((competitor) => competitor.id !== competitorToDelete))
      setShowDeleteConfirm(false)
      setCompetitorToDelete(null)
      setShowDeleteSnackbar(true)
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

  const handleToggleStatus = (competitorId: number) => {
    setCompetitors((prev) =>
      prev.map((competitor) =>
        competitor.id === competitorId
          ? {
              ...competitor,
              status: competitor.status === "Active" ? "Inactive" : "Active",
            }
          : competitor
      )
    )
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
            onClick={() => setShowAddCompetitor(true)}
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
                      onClick={() => handleSort('date')}
                    >
                      Created On
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                        {getHoverIcon('date')}
                      </span>
                      <span className="opacity-100 mt-0.5">
                        {getSortIcon('date')}
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
                    <tr key={competitor.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}`}>
                      <td className={`px-3 py-2 whitespace-nowrap ${isLastRow ? 'rounded-bl-lg' : ''} w-56`}>
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-black dark:text-white truncate">
                            {competitor.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center">
                      <Badge 
                        variant={competitor.compSet === "Primary" ? "default" : "secondary"}
                            className={`text-xs ${
                              competitor.compSet === "Primary" 
                                ? "bg-blue-500 text-white hover:bg-blue-600" 
                                : ""
                            }`}
                      >
                        {competitor.compSet}
                      </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {competitor.date}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <TruncatedTooltip 
                          content={competitor.createdModifiedBy}
                          className="truncate"
                        >
                          {competitor.createdModifiedBy}
                        </TruncatedTooltip>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">
                        <Switch
                          checked={competitor.status === "Active"}
                          onCheckedChange={() => handleToggleStatus(competitor.id)}
                          className="scale-75"
                        />
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap text-center ${isLastRow ? 'rounded-br-lg' : ''}`}>
                        <div className="flex items-center justify-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => competitor.canDelete && handleDeleteCompetitor(competitor.id)}
                                  disabled={!competitor.canDelete}
                                  className={`h-6 w-6 p-0 ${
                                    competitor.canDelete 
                                      ? "text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" 
                                      : "text-gray-500 cursor-not-allowed"
                                  }`}
                                >
                                  <Trash2 className="w-3 h-3" />
                  </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-black text-white">
                                <p>{competitor.canDelete ? "Delete Competitor" : "Disabled"}</p>
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
                  placeholder="Search and select hotel name"
                  className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                />
                {isInputFocused && searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        {suggestion}
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
              disabled={!searchQuery || !newCompetitor.competitorType}
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
              <div className="h-[400px] overflow-y-auto border-b border-gray-200 dark:border-gray-700 mb-2.5">
                <table className="w-full table-fixed">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-800 align-top">
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tl-lg border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-56">
                      <div 
                        className="flex items-center gap-1 cursor-pointer group"
                        onClick={() => handleSort('competitorName')}
                      >
                        Competitor Name
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                          {getHoverIcon('competitorName')}
                        </span>
                        <span className="opacity-100 mt-0.5">
                          {getSortIcon('competitorName')}
                        </span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                      <div 
                        className="flex items-center gap-1 cursor-pointer group"
                        onClick={() => handleSort('date')}
                      >
                        Modified On
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                          {getHoverIcon('date')}
                        </span>
                        <span className="opacity-100 mt-0.5">
                          {getSortIcon('date')}
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
                    const baseData = [
                      {
                        competitorName: "Andaz Liverpool Street",
                        compSet: "Primary",
                        status: "Active",
                        activity: "Added",
                        date: "14 Feb'25",
                        createdBy: "Nitendra Kumar"
                      },
                      {
                        competitorName: "Holiday Inn London - Camden Lock",
                        compSet: "Primary",
                        status: "Active",
                        activity: "Created",
                        date: "14 Feb'25",
                        createdBy: "Nitendra Kumar"
                      },
                      {
                        competitorName: "The Langham London",
                        compSet: "Secondary",
                        status: "Inactive",
                        activity: "Updated",
                        date: "14 Feb'25",
                        createdBy: "Nitendra Kumar"
                      },
                      {
                        competitorName: "The Savoy London",
                        compSet: "Primary",
                        status: "Active",
                        activity: "Created",
                        date: "14 Feb'25",
                        createdBy: "Nitendra Kumar"
                      },
                      {
                        competitorName: "Marriott Executive Suites",
                        compSet: "Primary",
                        status: "Inactive",
                        activity: "Updated",
                        date: "14 Feb'25",
                        createdBy: "Nitendra Kumar"
                      }
                    ];

                    // Generate all data first
                    let allData = Array.from({ length: 50 }, (_, index) => {
                      const change = baseData[index % baseData.length];
                      return {
                        ...change,
                        id: index + 1,
                        competitorName: `${change.competitorName} ${index + 1}`,
                        date: change.date,
                        createdBy: `${change.createdBy} ${index + 1}`
                      };
                    });

                    return allData.map((changeWithId, index) => {
                      const isLastRow = index === 49; // 50 items total, so last index is 49
                      return (
                      <tr key={changeWithId.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}`}>
                        <td className={`px-3 py-2 whitespace-nowrap border-b border-gray-200 dark:border-gray-700 ${isLastRow ? 'rounded-bl-lg' : ''} w-56`}>
                          <TruncatedTooltip 
                            content={changeWithId.competitorName}
                            className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                          >
                            {changeWithId.competitorName}
                          </TruncatedTooltip>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                          <div className="flex items-center">
                            <Badge 
                              variant={changeWithId.compSet === "Primary" ? "default" : "secondary"}
                              className={`text-xs ${
                                changeWithId.compSet === "Primary" 
                                  ? "bg-blue-500 text-white hover:bg-blue-600" 
                                  : ""
                              }`}
                            >
                              {changeWithId.compSet}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                          <TruncatedTooltip 
                            content={changeWithId.date}
                            className="truncate"
                          >
                            {changeWithId.date}
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
                            checked={changeWithId.status === "Active"}
                            onCheckedChange={() => {}}
                            className="scale-75"
                            disabled
                          />
                        </td>
                        <td className={`px-4 py-2 text-center text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 ${isLastRow ? 'rounded-br-lg' : ''} w-20`}>
                          <TruncatedTooltip 
                            content={changeWithId.activity}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              changeWithId.activity === 'Added' || changeWithId.activity === 'Created'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            }`}
                          >
                            {changeWithId.activity}
                          </TruncatedTooltip>
                        </td>
                      </tr>
                      );
                    });
                  })()}
                  {/* Add padding to ensure last row is visible */}
                  <tr>
                    <td colSpan={6} className="h-4"></td>
                  </tr>
                </tbody>
                {/* Add blank space after table */}
                <div className="h-2.5"></div>
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
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteCompetitor}
              className="px-6 bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Snackbar */}
      {showSnackbar && (
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
      )}

      {/* Delete Success Snackbar */}
      {showDeleteSnackbar && (
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
      )}
    </div>
    </TooltipProvider>
  )
}
