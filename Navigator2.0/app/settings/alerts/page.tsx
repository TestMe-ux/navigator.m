"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Search, Plus, History, MoreVertical, Trash2, Edit, CheckCircle, X, ArrowUp, ArrowDown, ArrowUpDown, ChevronDown } from "lucide-react"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"

// Mock alerts data
const mockAlerts = [
  {
    id: 1,
    alertType: "ADR",
    rule: "Subscriber > 2",
    createdOn: "28 May'24",
    createdBy: "Nitendra kumar",
    status: true,
  },
  {
    id: 2,
    alertType: "ADR",
    rule: "Subscriber > 1",
    createdOn: "28 May'24",
    createdBy: "Nitendra kumar",
    status: true,
  },
  {
    id: 3,
    alertType: "Parity",
    rule: "Parity Score < 80%",
    createdOn: "28 May'24",
    createdBy: "Nitendra kumar",
    status: true,
  },
  {
    id: 4,
    alertType: "ADR",
    rule: "Competitor Central Hotel ADR > 1",
    createdOn: "28 May'24",
    createdBy: "Nitendra kumar",
    status: true,
  },
  {
    id: 5,
    alertType: "OTA Ranking",
    rule: "OTA Ranking drops below 3",
    createdOn: "28 May'24",
    createdBy: "Nitendra kumar",
    status: true,
  },
  {
    id: 6,
    alertType: "ADR",
    rule: "Subscriber > 5",
    createdOn: "14 May'24",
    createdBy: "Sahil Saluja",
    status: true,
  },
  {
    id: 7,
    alertType: "Parity",
    rule: "Parity Score > 95%",
    createdOn: "20 Apr'24",
    createdBy: "Nitendra kumar",
    status: true,
  },
  {
    id: 8,
    alertType: "OTA Ranking",
    rule: "OTA Ranking drops below 2",
    createdOn: "20 Apr'24",
    createdBy: "Nitendra kumar",
    status: true,
  },
  {
    id: 9,
    alertType: "ADR",
    rule: "Subscriber > 1",
    createdOn: "20 Apr'24",
    createdBy: "Nitendra kumar",
    status: true,
  },
]

export default function AlertsSettingsPage() {
  const [alerts, setAlerts] = useState(mockAlerts)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddAlert, setShowAddAlert] = useState(false)
  const [showChangeHistory, setShowChangeHistory] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [showDeleteSnackbar, setShowDeleteSnackbar] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [alertToDelete, setAlertToDelete] = useState<number | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null })
  const [alertTypeFilter, setAlertTypeFilter] = useState("All")
  const [isLoading, setIsLoading] = useState(true)
  const [newAlert, setNewAlert] = useState({
    alertTab: "ADR",
    alertMeWhen: "Subscriber ADR",
    competitorADR: "",
    has: "Increased",
    by: "Absolute",
    value: "1",
    currency: "£",
    withRespectTo: "Subscriber ADR",
    selectCompetition: "",
    sendForEventsHolidays: false,
  })

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

  const filteredAlerts = alerts.filter(
    (alert) => {
      const matchesSearch = alert.rule.toLowerCase().includes((searchValue || searchTerm).toLowerCase()) ||
        alert.alertType.toLowerCase().includes((searchValue || searchTerm).toLowerCase())
      
      const matchesType = alertTypeFilter === "All" || alert.alertType === alertTypeFilter
      
      return matchesSearch && matchesType
    }
  )

  const toggleAlertStatus = (alertId: number) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, status: !alert.status } : alert)))
  }

  const handleAddAlert = () => {
    if (newAlert.alertMeWhen && newAlert.has && newAlert.by && newAlert.value) {
      const alert = {
        id: alerts.length + 1,
        alertType: newAlert.alertTab,
        rule: `${newAlert.alertMeWhen} ${newAlert.has} ${newAlert.by} ${newAlert.value}`,
        createdOn: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }),
        createdBy: "Current User",
        status: true,
      }
      setAlerts((prev) => [...prev, alert])
      setNewAlert({
        alertTab: "ADR",
        alertMeWhen: "Subscriber ADR",
        competitorADR: "",
        has: "Increased",
        by: "Absolute",
        value: "1",
        currency: "£",
        withRespectTo: "Subscriber ADR",
        selectCompetition: "",
        sendForEventsHolidays: false,
      })
      setShowAddAlert(false)
      setShowSnackbar(true)
    }
  }

  const handleCancelAddAlert = () => {
    setNewAlert({
      alertTab: "ADR",
      alertMeWhen: "Subscriber ADR",
      competitorADR: "",
      has: "Increased",
      by: "Absolute",
      value: "1",
      currency: "£",
      withRespectTo: "Subscriber ADR",
      selectCompetition: "",
      sendForEventsHolidays: false,
    })
    setShowAddAlert(false)
  }

  const handleDeleteAlert = (alertId: number) => {
    setAlertToDelete(alertId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteAlert = () => {
    if (alertToDelete) {
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertToDelete))
      setShowDeleteConfirm(false)
      setAlertToDelete(null)
      setShowDeleteSnackbar(true)
    }
  }

  const cancelDeleteAlert = () => {
    setShowDeleteConfirm(false)
    setAlertToDelete(null)
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

              {/* Alerts Table Skeleton */}
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
                      <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-28 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-32 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                  </div>
                  
                  {/* Table Rows */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-4 py-4 border-b last:border-b-0">
                      <div className="grid grid-cols-6 gap-4 items-center">
                        <div className="h-4 w-32 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-28 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-6 w-12 bg-gray-300 animate-pulse rounded"></div>
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
            <span className="text-xl font-semibold text-foreground">Alert Management</span>
            <p className="text-sm text-muted-foreground">
              Configure rate alerts, competitive monitoring, and automated notifications
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
                    <p>Search By Alert Rule</p>
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
              onClick={() => setShowAddAlert(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4" />
              Add Alert
            </Button>
        </div>
      </div>

      {/* Alerts Table */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-gray-200 dark:border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tl-lg">
                    <div 
                      className="flex items-center gap-1 cursor-pointer group"
                      onClick={() => handleSort('rule')}
                    >
                      Alert Rule
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                        {getHoverIcon('rule')}
                      </span>
                      <span className="opacity-100 mt-0.5">
                        {getSortIcon('rule')}
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                    <div className="relative w-40 h-8 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus-within:outline-none focus-within:ring-1 focus-within:ring-blue-500">
                      <Select value={alertTypeFilter} onValueChange={setAlertTypeFilter}>
                        <SelectTrigger className="w-full h-full px-2 py-1 text-xs border-0 bg-transparent hover:bg-transparent focus:outline-none focus:ring-0 focus:ring-offset-0 [&>span:first-child]:hidden text-left">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="text-left">
                          <SelectItem value="All" className="[&>span:first-child]:hidden text-left">All</SelectItem>
                          <SelectItem value="ADR" className="[&>span:first-child]:hidden text-left">ADR</SelectItem>
                          <SelectItem value="Parity" className="[&>span:first-child]:hidden text-left">Parity</SelectItem>
                          <SelectItem value="OTA Ranking" className="[&>span:first-child]:hidden text-left">OTA Ranking</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">Type:</span>
                          <span className="text-xs text-gray-700">{alertTypeFilter}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                    <div 
                      className="flex items-center gap-1 cursor-pointer group"
                      onClick={() => handleSort('createdOn')}
                    >
                      Created Date
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                        {getHoverIcon('createdOn')}
                      </span>
                      <span className="opacity-100 mt-0.5">
                        {getSortIcon('createdOn')}
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
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
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tr-lg">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAlerts.map((alert, index) => {
                  const isLastRow = index === filteredAlerts.length - 1;
                  return (
                    <tr key={alert.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}`}>
                      <td className={`px-4 py-2 whitespace-nowrap ${isLastRow ? 'rounded-bl-lg' : ''}`}>
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            <TruncatedTooltip 
                              content={alert.rule}
                              className="truncate max-w-xs"
                            >
                              {alert.rule}
                            </TruncatedTooltip>
                  </div>
                </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <Badge variant="secondary" className="text-xs">
                          {alert.alertType}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {alert.createdOn}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <TruncatedTooltip 
                          content={alert.createdBy}
                          className="truncate max-w-32"
                        >
                          {alert.createdBy}
                        </TruncatedTooltip>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                     <Switch
                       checked={alert.status}
                       onCheckedChange={() => toggleAlertStatus(alert.id)}
                     className="scale-75"
                     />
                   </div>
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap text-center ${isLastRow ? 'rounded-br-lg' : ''}`}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAlert(alert.id)}
                                className="text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 h-6 w-6 p-0"
                              >
                                <Trash2 className="w-3 h-3" />
                  </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-black text-white text-xs">
                              <p>Delete Alert</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Alert Modal */}
      <Dialog open={showAddAlert} onOpenChange={setShowAddAlert}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-black">Add Alert</DialogTitle>
            <DialogDescription>
              Create a new alert rule to monitor rate changes and competitive activity.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Alert Me When<span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={newAlert.alertMeWhen}
                  onValueChange={(value) => setNewAlert((prev) => ({ ...prev, alertMeWhen: value }))}
                >
                  <SelectTrigger className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select alert type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Subscriber ADR" className="pl-3 [&>span:first-child]:hidden">Subscriber ADR</SelectItem>
                    <SelectItem value="Competitor ADR" className="pl-3 [&>span:first-child]:hidden">Competitor ADR</SelectItem>
                    <SelectItem value="Avg. Compset ADR" className="pl-3 [&>span:first-child]:hidden">Avg. Compset ADR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Has<span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={newAlert.has}
                  onValueChange={(value) => setNewAlert((prev) => ({ ...prev, has: value }))}
                >
                  <SelectTrigger className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Increased" className="pl-3 [&>span:first-child]:hidden">Increased</SelectItem>
                    <SelectItem value="Decreased" className="pl-3 [&>span:first-child]:hidden">Decreased</SelectItem>
                    <SelectItem value="Changed" className="pl-3 [&>span:first-child]:hidden">Changed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  By<span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={newAlert.by}
                  onValueChange={(value) => setNewAlert((prev) => ({ ...prev, by: value }))}
                >
                  <SelectTrigger className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select measurement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Absolute" className="pl-3 [&>span:first-child]:hidden">Absolute</SelectItem>
                    <SelectItem value="Percentage" className="pl-3 [&>span:first-child]:hidden">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Value<span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="value"
                    type="number"
                    value={newAlert.value}
                    onChange={(e) => setNewAlert((prev) => ({ ...prev, value: e.target.value }))}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                    placeholder="Enter value"
                  />
                  <Select
                    value={newAlert.currency}
                    onValueChange={(value) => setNewAlert((prev) => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="£" className="pl-3 [&>span:first-child]:hidden">£</SelectItem>
                      <SelectItem value="$" className="pl-3 [&>span:first-child]:hidden">$</SelectItem>
                      <SelectItem value="€" className="pl-3 [&>span:first-child]:hidden">€</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleCancelAddAlert}
              className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAlert}
              disabled={
                !newAlert.alertMeWhen ||
                !newAlert.has ||
                !newAlert.by ||
                !newAlert.value
              }
              className="h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Add Alert
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-black">Delete Alert</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this alert? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={cancelDeleteAlert}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteAlert}
              className="px-6 bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change History Modal */}
      <Dialog open={showChangeHistory} onOpenChange={setShowChangeHistory}>
        <DialogContent className="max-w-6xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Alert Change History</DialogTitle>
            <DialogDescription>
              View all changes made to alert settings.
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
                        onClick={() => handleSort('rule')}
                      >
                        Alert Rule
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                          {getHoverIcon('rule')}
                        </span>
                        <span className="opacity-100 mt-0.5">
                          {getSortIcon('rule')}
                        </span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-24">
                      Type
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-32">
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
                        rule: "Subscriber > 2",
                        alertType: "ADR",
                        status: true,
                        activity: "Added",
                        date: "28 May'24",
                        createdBy: "Nitendra Kumar"
                      },
                      {
                        rule: "Subscriber > 1",
                        alertType: "ADR",
                        status: true,
                        activity: "Updated",
                        date: "28 May'24",
                        createdBy: "Nitendra Kumar"
                      },
                      {
                        rule: "Competitor Central Hotel ADR > 1",
                        alertType: "ADR",
                        status: false,
                        activity: "Added",
                        date: "28 May'24",
                        createdBy: "Nitendra Kumar"
                      },
                      {
                        rule: "Subscriber > 5",
                        alertType: "ADR",
                        status: true,
                        activity: "Added",
                        date: "14 May'24",
                        createdBy: "Sahil Saluja"
                      },
                      {
                        rule: "Subscriber > 1",
                        alertType: "ADR",
                        status: true,
                        activity: "Updated",
                        date: "20 Apr'24",
                        createdBy: "Nitendra Kumar"
                      }
                    ];

                    // Generate all data first
                    let allData = Array.from({ length: 50 }, (_, index) => {
                      const change = baseData[index % baseData.length];
                      return {
                        ...change,
                        id: index + 1,
                        rule: `${change.rule} ${index + 1}`,
                        date: change.date,
                        createdBy: `${change.createdBy} ${index + 1}`
                      };
                    });

                    return allData.map((changeWithId, index) => {
                      const isLastRow = index === 49;
                      return (
                      <tr key={changeWithId.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}`}>
                        <td className={`px-4 py-2 whitespace-nowrap border-b border-gray-200 dark:border-gray-700 ${isLastRow ? 'rounded-bl-lg' : ''} w-32`}>
                          <TruncatedTooltip 
                            content={changeWithId.rule}
                            className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                          >
                            {changeWithId.rule}
                          </TruncatedTooltip>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-24">
                          <Badge variant="secondary" className="text-xs">
                            {changeWithId.alertType}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                          <TruncatedTooltip 
                            content={changeWithId.date}
                            className="truncate"
                          >
                            {changeWithId.date}
                          </TruncatedTooltip>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-32">
                          <TruncatedTooltip 
                            content={changeWithId.createdBy}
                            className="truncate"
                          >
                            {changeWithId.createdBy}
                          </TruncatedTooltip>
                        </td>
                        <td className="px-4 py-2 text-center text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            changeWithId.status 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {changeWithId.status ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className={`px-4 py-2 text-center text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 ${isLastRow ? 'rounded-br-lg' : ''} w-20`}>
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

      {/* Success Snackbar */}
      {showSnackbar && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">
                Alert added successfully
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
                Alert deleted successfully
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
    </TooltipProvider>
  )
}
