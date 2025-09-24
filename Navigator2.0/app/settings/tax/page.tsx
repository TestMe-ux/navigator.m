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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Plus, History, MoreVertical, Trash2, Edit, CheckCircle, X, ArrowUp, ArrowDown, ArrowUpDown, ChevronDown } from "lucide-react"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"

// Mock tax data
const mockTaxes = [
  {
    id: 1,
    tax: "5%",
    subscriberCompetitor: "Chaidee Mansion (+14)",
    channels: "Booking.com, Brand (+7)",
    lastActivity: "Update",
    lastModifiedBy: "Aditi Sharma",
    createdOn: "28 May'24",
    status: true,
  },
  {
    id: 2,
    tax: "2%",
    subscriberCompetitor: "Central Hotel",
    channels: "Booking.com",
    lastActivity: "Create",
    lastModifiedBy: "Current User",
    createdOn: "25 May'24",
    status: true,
  },
  {
    id: 3,
    tax: "1.5%",
    subscriberCompetitor: "Holiday Inn",
    channels: "Agoda",
    lastActivity: "Update",
    lastModifiedBy: "Current User",
    createdOn: "20 May'24",
    status: true,
  },
  {
    id: 4,
    tax: "3%",
    subscriberCompetitor: "Taj Mahal",
    channels: "Expedia",
    lastActivity: "Create",
    lastModifiedBy: "Current User",
    createdOn: "15 May'24",
    status: true,
  },
  {
    id: 5,
    tax: "5%",
    subscriberCompetitor: "Alhambra Hotel",
    channels: "Hotels.com",
    lastActivity: "Update",
    lastModifiedBy: "Current User",
    createdOn: "10 May'24",
    status: true,
  },
]

const mockHotels = [
  "Central Hotel",
  "Holiday Inn",
  "Taj Mahal",
  "Alhambra Hotel",
  "Ocean Breeze",
  "Macdonald Windsor",
]

const mockChannels = [
  "Booking.com",
  "Agoda",
  "Expedia",
  "Hotels.com",
  "Priceline",
  "Travelocity",
]

export default function TaxSettingsPage() {
  const [taxes, setTaxes] = useState(mockTaxes)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddTax, setShowAddTax] = useState(false)
  const [showChangeHistory, setShowChangeHistory] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [showDeleteSnackbar, setShowDeleteSnackbar] = useState(false)
  const [showAddTaxSnackbar, setShowAddTaxSnackbar] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [taxToDelete, setTaxToDelete] = useState<number | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingTaxId, setEditingTaxId] = useState<number | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null })
  const [isLoading, setIsLoading] = useState(true)
  const [showGlobalTaxModal, setShowGlobalTaxModal] = useState(false)
  const [globalTaxPreference, setGlobalTaxPreference] = useState("exclusive")
  const [newTax, setNewTax] = useState({
    subscriberCompetitor: "Central Hotel",
    channels: "Booking.com",
    tax: "",
  })
  
  // Multiple taxes state
  const [taxInputs, setTaxInputs] = useState([
    { id: 1, name: "", percentage: "", checked: false }
  ])
  
  // Multiselect dropdown states
  const [isSubscriberDropdownOpen, setIsSubscriberDropdownOpen] = useState(false)
  const [isChannelsDropdownOpen, setIsChannelsDropdownOpen] = useState(false)
  const [subscriberSearchTerm, setSubscriberSearchTerm] = useState("")
  const [channelsSearchTerm, setChannelsSearchTerm] = useState("")
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([])
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const subscriberDropdownRef = useRef<HTMLDivElement>(null)
  const channelsDropdownRef = useRef<HTMLDivElement>(null)

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

  // Auto-hide add tax snackbar after 5 seconds
  useEffect(() => {
    if (showAddTaxSnackbar) {
      const timer = setTimeout(() => {
        setShowAddTaxSnackbar(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showAddTaxSnackbar])
  
  // Simulate loading effect on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000) // Show loading for 3 seconds

    return () => clearTimeout(timer)
  }, [])
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (subscriberDropdownRef.current && !subscriberDropdownRef.current.contains(event.target as Node)) {
        setIsSubscriberDropdownOpen(false)
      }
      if (channelsDropdownRef.current && !channelsDropdownRef.current.contains(event.target as Node)) {
        setIsChannelsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const filteredTaxes = taxes.filter(
    (tax) => {
      const matchesSearch = tax.tax.toLowerCase().includes((searchValue || searchTerm).toLowerCase()) ||
        tax.subscriberCompetitor.toLowerCase().includes((searchValue || searchTerm).toLowerCase()) ||
        tax.channels.toLowerCase().includes((searchValue || searchTerm).toLowerCase())
      
      return matchesSearch
    }
  ).sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0
    
    const aValue = a[sortConfig.key as keyof typeof a]
    const bValue = b[sortConfig.key as keyof typeof b]
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const toggleTaxStatus = (taxId: number) => {
    setTaxes((prev) => prev.map((tax) => (tax.id === taxId ? { ...tax, status: !tax.status } : tax)))
  }

  const handleAddTax = () => {
    if (newTax.subscriberCompetitor && newTax.channels && newTax.tax) {
      if (isEditMode && editingTaxId) {
        // Update existing tax
        setTaxes((prev) => prev.map(tax => 
          tax.id === editingTaxId 
            ? {
                ...tax,
                tax: newTax.tax,
                subscriberCompetitor: newTax.subscriberCompetitor,
                channels: newTax.channels,
                lastActivity: "Updated",
                lastModifiedBy: "Current User",
                createdOn: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }),
              }
            : tax
        ))
      } else {
        // Add new tax
        const tax = {
          id: taxes.length + 1,
          tax: newTax.tax,
          subscriberCompetitor: newTax.subscriberCompetitor,
          channels: newTax.channels,
          lastActivity: "Create",
          lastModifiedBy: "Current User",
          createdOn: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }),
          status: true,
        }
        setTaxes((prev) => [...prev, tax])
      }
      
      // Reset form
      setNewTax({
        subscriberCompetitor: "Central Hotel",
        channels: "Booking.com",
        tax: "",
      })
      setTaxInputs([{ id: 1, name: "", percentage: "", checked: false }])
      setSelectedSubscribers([])
      setSelectedChannels([])
      setSubscriberSearchTerm("")
      setChannelsSearchTerm("")
      setIsSubscriberDropdownOpen(false)
      setIsChannelsDropdownOpen(false)
      setIsEditMode(false)
      setEditingTaxId(null)
      setShowAddTax(false)
      setShowAddTaxSnackbar(true)
    }
  }

  const handleCancelAddTax = () => {
    setNewTax({
      subscriberCompetitor: "Central Hotel",
      channels: "Booking.com",
      tax: "",
    })
    setTaxInputs([{ id: 1, name: "", percentage: "", checked: false }])
    setSelectedSubscribers([])
    setSelectedChannels([])
    setSubscriberSearchTerm("")
    setChannelsSearchTerm("")
    setIsSubscriberDropdownOpen(false)
    setIsChannelsDropdownOpen(false)
    setIsEditMode(false)
    setEditingTaxId(null)
    setShowAddTax(false)
  }

  const handleEditTax = (taxId: number) => {
    const taxToEdit = taxes.find(tax => tax.id === taxId)
    if (taxToEdit) {
      setIsEditMode(true)
      setEditingTaxId(taxId)
      setNewTax({
        subscriberCompetitor: taxToEdit.subscriberCompetitor,
        channels: taxToEdit.channels,
        tax: taxToEdit.tax,
      })
      // Pre-fill tax inputs with sample data for edit
      setTaxInputs([
        { id: 1, name: "Service Tax", percentage: "5", checked: true },
        { id: 2, name: "City Tax", percentage: "10", checked: false }
      ])
      setSelectedSubscribers([taxToEdit.subscriberCompetitor])
      setSelectedChannels([taxToEdit.channels])
      setShowAddTax(true)
    }
  }

  const handleDeleteTax = (taxId: number) => {
    setTaxToDelete(taxId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteTax = () => {
    if (taxToDelete) {
      setTaxes((prev) => prev.filter((tax) => tax.id !== taxToDelete))
      setShowDeleteConfirm(false)
      setTaxToDelete(null)
      setShowDeleteSnackbar(true)
    }
  }

  const cancelDeleteTax = () => {
    setShowDeleteConfirm(false)
    setTaxToDelete(null)
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

  // Multiselect dropdown handlers
  const handleSubscriberToggle = (subscriber: string) => {
    if (subscriber === 'All Hotels') {
      if (selectedSubscribers.includes('All Hotels')) {
        setSelectedSubscribers([])
      } else {
        setSelectedSubscribers(mockHotels)
      }
    } else {
      setSelectedSubscribers(prev => 
        prev.includes(subscriber) 
          ? prev.filter(s => s !== subscriber)
          : [...prev, subscriber]
      )
    }
  }

  const handleChannelToggle = (channel: string) => {
    if (channel === 'All Channels') {
      if (selectedChannels.includes('All Channels')) {
        setSelectedChannels([])
      } else {
        setSelectedChannels(mockChannels)
      }
    } else {
      setSelectedChannels(prev => 
        prev.includes(channel) 
          ? prev.filter(c => c !== channel)
          : [...prev, channel]
      )
    }
  }

  // Filter functions for search
  const filteredSubscribers = mockHotels.filter(hotel =>
    hotel.toLowerCase().includes(subscriberSearchTerm.toLowerCase())
  )

  const filteredChannels = mockChannels.filter(channel =>
    channel.toLowerCase().includes(channelsSearchTerm.toLowerCase())
  )

  // Tax input handlers
  const addTaxInput = () => {
    if (taxInputs.length < 5) {
      const newId = Math.max(...taxInputs.map(t => t.id)) + 1
      setTaxInputs([...taxInputs, { id: newId, name: "", percentage: "", checked: false }])
    }
  }

  const removeTaxInput = (id: number) => {
    if (taxInputs.length > 1) {
      setTaxInputs(taxInputs.filter(tax => tax.id !== id))
    }
  }

  const updateTaxInput = (id: number, field: 'name' | 'percentage' | 'checked', value: string | boolean) => {
    setTaxInputs(taxInputs.map(tax => 
      tax.id === id ? { ...tax, [field]: value } : tax
    ))
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

              {/* Tax Table Skeleton */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 z-10">
                  <div className="h-[3px] w-full bg-gray-200/50 dark:bg-gray-800/50 overflow-hidden rounded-sm">
                    <div className="h-full bg-blue-500/90 shadow-sm shadow-blue-500/20 transition-all duration-150 ease-out w-1/2"></div>
                  </div>
                </div>
                <CardContent className="p-0">
                  {/* Table Header */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b">
                    <div className="grid grid-cols-7 gap-4">
                      <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-32 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-28 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                  </div>
                  
                  {/* Table Rows */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-4 py-4 border-b last:border-b-0">
                      <div className="grid grid-cols-7 gap-4 items-center">
                        <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-12 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-28 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
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
            <div className="flex items-center gap-3">
              <span className="text-xl font-semibold text-foreground">Global Tax Preference</span>
              <button
                onClick={() => setShowGlobalTaxModal(true)}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
              >
                Exclusive
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure tax settings, manage tax rates, and set up tax calculations for different properties
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
                    <p>Search By Tax</p>
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
            onClick={() => setShowAddTax(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4" />
            Add Tax
          </Button>
        </div>
      </div>

      {/* Taxes Table */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-gray-200 dark:border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tl-lg">
                    <div 
                      className="flex items-center gap-1 cursor-pointer group"
                      onClick={() => handleSort('tax')}
                    >
                      Tax
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                        {getHoverIcon('tax')}
                      </span>
                      <span className="opacity-100 mt-0.5">
                        {getSortIcon('tax')}
                      </span>
            </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                    <div 
                      className="flex items-center gap-1 cursor-pointer group"
                      onClick={() => handleSort('subscriberCompetitor')}
                    >
                      Subscriber/Competitor
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                        {getHoverIcon('subscriberCompetitor')}
                      </span>
                      <span className="opacity-100 mt-0.5">
                        {getSortIcon('subscriberCompetitor')}
                      </span>
          </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                    <div 
                      className="flex items-center gap-1 cursor-pointer group"
                      onClick={() => handleSort('channels')}
                    >
                      Channels
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                        {getHoverIcon('channels')}
                      </span>
                      <span className="opacity-100 mt-0.5">
                        {getSortIcon('channels')}
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                    <div 
                      className="flex items-center gap-1 cursor-pointer group"
                      onClick={() => handleSort('lastActivity')}
                    >
                      Last Activity
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                        {getHoverIcon('lastActivity')}
                      </span>
                      <span className="opacity-100 mt-0.5">
                        {getSortIcon('lastActivity')}
                      </span>
                  </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                    <div 
                      className="flex items-center gap-1 cursor-pointer group"
                      onClick={() => handleSort('lastModifiedBy')}
                    >
                      Last Modified By
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                        {getHoverIcon('lastModifiedBy')}
                      </span>
                      <span className="opacity-100 mt-0.5">
                        {getSortIcon('lastModifiedBy')}
                      </span>
                </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tr-lg">
                    &nbsp;&nbsp;&nbsp;Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTaxes.map((tax, index) => {
                  const isLastRow = index === filteredTaxes.length - 1;
                  return (
                    <tr key={tax.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}`}>
                      <td className={`px-4 py-2 whitespace-nowrap ${isLastRow ? 'rounded-bl-lg' : ''}`}>
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            <TruncatedTooltip 
                              content={tax.tax}
                              className="truncate max-w-xs"
                            >
                              {tax.tax}
                            </TruncatedTooltip>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <TruncatedTooltip 
                          content={tax.subscriberCompetitor}
                          className="truncate max-w-32"
                        >
                          {tax.subscriberCompetitor}
                        </TruncatedTooltip>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <TruncatedTooltip 
                          content={tax.channels}
                          className="truncate max-w-32"
                        >
                          {tax.channels}
                        </TruncatedTooltip>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          tax.lastActivity === 'Create' || tax.lastActivity === 'Added'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {tax.lastActivity === 'Create' ? 'Added' : tax.lastActivity === 'Update' ? 'Updated' : tax.lastActivity}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <TruncatedTooltip 
                          content={tax.lastModifiedBy}
                          className="truncate max-w-32"
                        >
                          {tax.lastModifiedBy}
                        </TruncatedTooltip>
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap text-left ${isLastRow ? 'rounded-br-lg' : ''}`}>
                <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                                >
                                  Show Current ADR
                  </Button>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="top" 
                                className="bg-white dark:bg-white border border-gray-200 dark:border-gray-300 shadow-lg p-0 max-w-none"
                              >
                                <div className="pl-4 pr-4 py-3 space-y-2 min-w-[280px]">
                                  {/* Title */}
                                  <div className="text-sm font-bold text-gray-900 dark:text-gray-900 mb-3">
                                    Current ADR Inclusive of Tax
                </div>
                                  
                                  {/* BAR Rate Section */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="text-xs font-semibold text-gray-900 dark:text-gray-900 mb-1">
                                          BAR Rate on 10 Mar'23
              </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-600 max-w-[140px]">
                                          for Standard Room with 1 LOS<br />
                                          and 2 Guests on Booking.com
                                        </div>
                                      </div>
                                      <span className="text-sm font-bold text-gray-900 dark:text-gray-900 ml-2">
                                        $200
                                      </span>
                  </div>
                </div>
                
                                  {/* Separator */}
                                  <div className="border-t border-gray-200 dark:border-gray-300"></div>
                                  
                                  {/* Tax Section */}
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-900">
                                      Tax 18%
                                    </span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-900">
                                      $36
                                    </span>
                                  </div>
                                  
                                  {/* Separator */}
                                  <div className="border-t border-gray-200 dark:border-gray-300"></div>
                                  
                                  {/* Total Section */}
                                  <div className="flex justify-end">
                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-900">
                                      $236
                                    </span>
                </div>
              </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditTax(tax.id)}
                                  className="text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-6 w-6 p-0"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-black text-white text-xs">
                                <p>Edit Tax</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteTax(tax.id)}
                                  className="text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 h-6 w-6 p-0"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-black text-white text-xs">
                                <p>Delete Tax</p>
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

      {/* Add Tax Modal */}
      <Dialog open={showAddTax} onOpenChange={setShowAddTax}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-black">
              {isEditMode ? 'Edit Tax' : 'Add Tax'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Update the tax configuration for specific properties and channels.'
                : 'Add a new tax configuration for specific properties and channels.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* First Row: Subscriber/Competitor and Channels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subscriber/Competitor Multiselect */}
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Subscriber/Competitor<span className="text-red-500 ml-1">*</span>
              </Label>
                <div className="relative" ref={subscriberDropdownRef}>
                  <button
                    onClick={() => setIsSubscriberDropdownOpen(!isSubscriberDropdownOpen)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200 text-left flex items-center justify-between"
                  >
                    <span className="text-gray-900">
                      {selectedSubscribers.length === 0 
                        ? "Select hotels..." 
                        : selectedSubscribers.length === 1 
                          ? selectedSubscribers[0]
                          : `${selectedSubscribers.length} hotels selected`
                      }
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {isSubscriberDropdownOpen && (
                    <div className="absolute z-50 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden min-w-80 w-full">
                      {/* Search Input */}
                      <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search hotels..."
                            value={subscriberSearchTerm}
                            onChange={(e) => setSubscriberSearchTerm(e.target.value)}
                            className="pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                          />
                        </div>
            </div>

                      {/* Hotels List */}
                      <div className="max-h-40 overflow-y-auto">
                        <label className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedSubscribers.length === mockHotels.length}
                            onChange={() => handleSubscriberToggle('All Hotels')}
                            className="w-4 h-4 mr-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="text-sm font-medium text-gray-900">All Hotels</span>
                        </label>
                        {filteredSubscribers.map((hotel) => (
                          <label
                            key={hotel}
                            className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedSubscribers.includes(hotel)}
                              onChange={() => handleSubscriberToggle(hotel)}
                              className="w-4 h-4 mr-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-900 truncate" title={hotel}>
                              {hotel.length > 32 ? `${hotel.substring(0, 32)}...` : hotel}
                            </span>
                          </label>
                        ))}
                        {filteredSubscribers.length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            No hotels found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
            </div>

                {/* Tax Input Section */}
                <div className="mt-4">
                  <div className="flex items-center gap-3 mb-2 pt-4">
                    <div className="w-48">
                      <Label className="block text-xs font-medium text-gray-700">
                        Tax Name<span className="text-red-500 ml-1">*</span>
              </Label>
                    </div>
                    <div className="w-32">
                      <Label className="block text-xs font-medium text-gray-700">
                        Tax Value<span className="text-red-500 ml-1">*</span>
                      </Label>
                    </div>
                    <div className="w-16">
                      <Label className="block text-xs font-medium text-gray-700">
                        Actions
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {taxInputs.map((tax, index) => (
                      <div key={tax.id} className="flex items-center gap-3">
                        <div className="w-48">
              <Input
                            placeholder="Tax Name"
                            value={tax.name}
                            onChange={(e) => updateTaxInput(tax.id, 'name', e.target.value)}
                            className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                          />
                        </div>
                        <div className="w-32 flex items-center gap-2">
                          <Input
                            type="number"
                            value={tax.percentage}
                            onChange={(e) => updateTaxInput(tax.id, 'percentage', e.target.value)}
                            className="w-16 px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                          />
                          <Checkbox
                            checked={tax.checked}
                            onCheckedChange={(checked) => updateTaxInput(tax.id, 'checked', checked as boolean)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                        <div className="w-16 flex items-center justify-start gap-1">
                          {taxInputs.length < 5 && index === taxInputs.length - 1 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addTaxInput}
                                    className="h-7 w-7 p-0 border-gray-300 hover:bg-gray-50"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black text-white">
                                  <p>Add Next Tax</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {taxInputs.length > 1 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeTaxInput(tax.id)}
                                    className="h-7 w-7 p-0 border-gray-300 hover:bg-gray-50"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black text-white">
                                  <p>Remove Tax</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>

              {/* Channels Multiselect */}
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Channels<span className="text-red-500 ml-1">*</span>
              </Label>
                <div className="relative" ref={channelsDropdownRef}>
                  <button
                    onClick={() => setIsChannelsDropdownOpen(!isChannelsDropdownOpen)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200 text-left flex items-center justify-between"
                  >
                    <span className="text-gray-900">
                      {selectedChannels.length === 0 
                        ? "Select channels..." 
                        : selectedChannels.length === 1 
                          ? selectedChannels[0]
                          : `${selectedChannels.length} channels selected`
                      }
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {isChannelsDropdownOpen && (
                    <div className="absolute z-50 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden min-w-80 w-full">
                      {/* Search Input */}
                      <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                            placeholder="Search channels..."
                            value={channelsSearchTerm}
                            onChange={(e) => setChannelsSearchTerm(e.target.value)}
                            className="pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
              />
            </div>
          </div>

                      {/* Channels List */}
                      <div className="max-h-40 overflow-y-auto">
                        <label className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedChannels.length === mockChannels.length}
                            onChange={() => handleChannelToggle('All Channels')}
                            className="w-4 h-4 mr-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="text-sm font-medium text-gray-900">All Channels</span>
                        </label>
                        {filteredChannels.map((channel) => (
                          <label
                            key={channel}
                            className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedChannels.includes(channel)}
                              onChange={() => handleChannelToggle(channel)}
                              className="w-4 h-4 mr-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-900 truncate" title={channel}>
                              {channel.length > 32 ? `${channel.substring(0, 32)}...` : channel}
                            </span>
                          </label>
                        ))}
                        {filteredChannels.length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            No channels found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sample Rate Calculation */}
                <div className="mt-4">
                  <Label className="block text-xs font-medium text-gray-700 mb-2 pt-4">
                    Sample Preview
                  </Label>
                  <div className="border border-gray-200 rounded-md p-4 bg-white">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Rate</span>
                        <span className="font-medium text-gray-900">$200</span>
                      </div>
                      {taxInputs.length > 0 ? (
                        taxInputs.map((tax, index) => {
                          // Calculate tax amount based on checkbox selection
                          let taxAmount = 0
                          let taxValue = ''
                          
                          if (tax.checked) {
                            if (tax.percentage && tax.percentage.trim() !== '') {
                              // If checkbox is checked, treat as percentage
                              taxAmount = 200 * parseFloat(tax.percentage) / 100
                              taxValue = `${tax.percentage}%`
                            } else {
                              // If checkbox is checked but no value, show 0%
                              taxAmount = 0
                              taxValue = '0%'
                            }
                          } else {
                            if (tax.percentage && tax.percentage.trim() !== '') {
                              // If checkbox is not checked, treat as absolute value
                              taxAmount = parseFloat(tax.percentage)
                              taxValue = `$${tax.percentage}`
                            } else {
                              // If no value, show $0
                              taxAmount = 0
                              taxValue = '$0'
                            }
                          }
                          
                          const taxName = tax.name && tax.name.trim() !== '' ? tax.name : `Tax Name ${index + 1}`
                          
                          return (
                            <div key={tax.id} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">
                                + {taxName} {taxValue}
                              </span>
                              <span className="font-medium text-gray-900">
                                ${taxAmount.toFixed(0)}
                              </span>
                            </div>
                          )
                        })
                      ) : (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            + Tax Name 1 $0
                          </span>
                          <span className="font-medium text-gray-900">
                            $0
                          </span>
                        </div>
                      )}
                      <div className="border-t border-gray-300 pt-2 mt-2">
                        <div className="flex justify-between items-center text-sm font-semibold">
                          <span className="text-gray-900">Total</span>
                          <span className="text-gray-900">
                            ${(200 + taxInputs.reduce((sum, tax) => {
                              if (tax.checked) {
                                // If checkbox is checked, treat as percentage
                                return sum + (tax.percentage ? (200 * parseFloat(tax.percentage) / 100) : 0)
                              } else {
                                // If checkbox is not checked, treat as absolute value
                                return sum + (tax.percentage ? parseFloat(tax.percentage) : 0)
                              }
                            }, 0)).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-4">
            <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancelAddTax}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTax}
              disabled={
                selectedSubscribers.length === 0 ||
                selectedChannels.length === 0 ||
                taxInputs.some(tax => !tax.name || !tax.percentage)
              }
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isEditMode ? 'Update Tax' : 'Add Tax'}
            </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-black">Delete Tax</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tax? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={cancelDeleteTax}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteTax}
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
            <DialogTitle className="text-xl font-bold">Tax Change History</DialogTitle>
            <DialogDescription>
              View all changes made to tax settings.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 flex-1 overflow-hidden">
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg h-full">
              <div className="h-[400px] overflow-y-auto border-b border-gray-200 dark:border-gray-700 mb-2.5">
                <table className="w-full table-fixed">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-800 align-top">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tl-lg border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-32">
                      Channel
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-32">
                      Property
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                      Tax Value
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-32">
                      <div 
                        className="flex items-center gap-1 cursor-pointer group"
                        onClick={() => handleSort('lastModifiedBy')}
                      >
                        Created/Modified By
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                          {getHoverIcon('lastModifiedBy')}
                        </span>
                        <span className="opacity-100 mt-0.5">
                          {getSortIcon('lastModifiedBy')}
                        </span>
          </div>
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
                        channel: "Booking.com, Expedia (+6)",
                        property: "Aranta Suvarnabh... (+14)",
                        taxValue: "5%",
                        activity: "Update",
                        createdOn: "03 Jun'25",
                        lastModifiedBy: "Aditi Sharma"
                      },
                      {
                        channel: "Booking.com, Expedia (+5)",
                        property: "Aranta Suvarnabh... (+15)",
                        taxValue: "5%",
                        activity: "Create",
                        createdOn: "12 Feb'25",
                        lastModifiedBy: "Renu Gupta"
                      },
                      {
                        channel: "Booking.com, Expedia (+4)",
                        property: "Aranta Suvarnabh... (+16)",
                        taxValue: "5%",
                        activity: "Delete",
                        createdOn: "19 Dec'24",
                        lastModifiedBy: "Aditi Sharma"
                      }
                    ];

                    // Generate all data first
                    let allData = Array.from({ length: 50 }, (_, index) => {
                      const change = baseData[index % baseData.length];
                      return {
                        ...change,
                        id: index + 1,
                        channel: `${change.channel} ${index + 1}`,
                        property: `${change.property} ${index + 1}`,
                        createdOn: change.createdOn,
                        lastModifiedBy: `${change.lastModifiedBy} ${index + 1}`
                      };
                    });

                    // Apply sorting to change history data
                    const sortedData = allData.sort((a, b) => {
                      if (!sortConfig.key || !sortConfig.direction) return 0
                      
                      let aValue, bValue;
                      
                      switch (sortConfig.key) {
                        case 'createdOn':
                          aValue = a.createdOn
                          bValue = b.createdOn
                          break
                        case 'lastModifiedBy':
                          aValue = a.lastModifiedBy
                          bValue = b.lastModifiedBy
                          break
                        default:
                          return 0
                      }
                      
                      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
                      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
                      return 0
                    })

                    return sortedData.map((changeWithId, index) => {
                      const isLastRow = index === 49;
                      return (
                      <tr key={changeWithId.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}`}>
                        <td className={`px-4 py-2 whitespace-nowrap border-b border-gray-200 dark:border-gray-700 ${isLastRow ? 'rounded-bl-lg' : ''} w-32`}>
                          <TruncatedTooltip 
                            content={changeWithId.channel}
                            className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                          >
                            {changeWithId.channel}
                          </TruncatedTooltip>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-32">
                          <TruncatedTooltip 
                            content={changeWithId.property}
                            className="truncate"
                          >
                            {changeWithId.property}
                          </TruncatedTooltip>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                          <TruncatedTooltip 
                            content={changeWithId.taxValue}
                            className="truncate"
                          >
                            {changeWithId.taxValue}
                          </TruncatedTooltip>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                          <TruncatedTooltip 
                            content={changeWithId.createdOn}
                            className="truncate"
                          >
                            {changeWithId.createdOn}
                          </TruncatedTooltip>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-32">
                          <TruncatedTooltip 
                            content={changeWithId.lastModifiedBy}
                            className="truncate"
                          >
                            {changeWithId.lastModifiedBy}
                          </TruncatedTooltip>
                        </td>
                        <td className={`px-4 py-2 text-center text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 ${isLastRow ? 'rounded-br-lg' : ''} w-20`}>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            changeWithId.activity === 'Create' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                              : changeWithId.activity === 'Update'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {changeWithId.activity === 'Create' ? 'Added' : changeWithId.activity === 'Update' ? 'Updated' : changeWithId.activity}
                          </span>
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
                Tax added successfully
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
                Tax deleted successfully
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add Tax Success Snackbar */}
      {showAddTaxSnackbar && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">
                Tax values added successfully
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Global Tax Setting Modal */}
      <Dialog open={showGlobalTaxModal} onOpenChange={setShowGlobalTaxModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-black">Global Tax Setting</DialogTitle>
            <DialogDescription>
              Configure global tax preferences for your properties.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-2">
            <div className="space-y-4">
              <RadioGroup
                value={globalTaxPreference}
                onValueChange={setGlobalTaxPreference}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="inclusive" id="inclusive" className="mt-1.5" />
                    <div className="space-y-1">
                      <Label htmlFor="inclusive" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Inclusive of Taxes
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        The Room rate will include taxes
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="exclusive" id="exclusive" className="mt-1.5" />
                    <div className="space-y-1">
                      <Label htmlFor="exclusive" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Exclusive of Taxes
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        The Room rate does not include taxes
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="not-configured" id="not-configured" className="mt-1.5" />
                    <div className="space-y-1">
                      <Label htmlFor="not-configured" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Tax Not Configured
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        The rates fetched from OTA will be displayed, they can be inclusive or exclusive of taxes. No tax setting will be applied by default.
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => {
                setShowGlobalTaxModal(false)
                setShowAddTax(true)
              }}
              className="h-9 px-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Add Tax
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowGlobalTaxModal(false)}
              className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowGlobalTaxModal(false)}
              className="h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  )
}
