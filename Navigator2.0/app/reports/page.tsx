"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Download, RefreshCw, ChevronDown, ChevronUp, ArrowUpDown, FileSpreadsheet, ArrowUp, ArrowDown, CheckCircle, Loader2, CalendarIcon, X } from "lucide-react"
import { ReportsFilterBar } from "@/components/reports-filter-bar"
import { ReportsHeader } from "@/components/navigator/reports-header"
import { addDays, format, subDays } from "date-fns"
import { useRef } from "react"
import { getAllReports, getReportData } from "@/lib/reports"
import { conevrtDateforApi } from "@/lib/utils"
import { LocalStorageService } from "@/lib/localstorage"
import { useSelectedProperty } from "@/hooks/use-local-storage"

// Dynamic data arrays - will be populated from API
const channelsData: string[] = []
const primaryHotelsData: string[] = []
const secondaryHotelsData: string[] = []

// Define types for the report data
interface ReportData {
  channels: string | null
  excelLiteFilePath: string
  checkInDate: string
  consumedShop: number
  compsetAvg: number | null
  currency: string | null
  dataSufficiency: number | null
  dataSufficiencyMessage: string | null
  daysOfData: number
  disabledChannels: string | null
  occupancy: string
  modifiedDate: string
  monthwiseFileStatus: any
  notificationStatus: any
  paceViewFileStatus: any
  priceThreshold: any
  properties: string | null
  reportFilePath: string
  reportID: number
  requestType: string
  sid: number
  shoppedDateTime: string
  fullCheckinDate: string
  siteTypeName: string | null
  los: string
  nextReportDate: string | null
  supply: any
  generatedBy: string
  createdDate: string
  rrDs: number
  scheduleName: string
  pghReportScheduleID: number
  universalID: number
  isDetailDataEnable: boolean
  retryTime: number
  recipientEmail: string
  reportStatus: string
  reportData?: any // For expanded row data
}

export default function ReportsPage() {
  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingCycle, setLoadingCycle] = useState(1)
  const [selectedProperty] = useSelectedProperty()
  // Reports data states
  const [reportsData, setReportsData] = useState<ReportData[]>([])
  const [filteredReportsData, setFilteredReportsData] = useState<ReportData[]>([])
  const [statusOfReport, setStatusOfReport] = useState<{ [key: number]: string }>({})

  // Filter states
  const [filter, setFilter] = useState<string>("all") // "all", "ondemand", "batch"
  const [reportTypeChose, setReportTypeChose] = useState<string>("All")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null })

  // Expanded row state (only one row can be expanded at a time)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form data state
  const [formData, setFormData] = useState({
    selectedChannels: [] as string[],
    compSet: 'primary',
    selectedPrimaryHotels: [] as string[],
    selectedSecondaryHotels: [] as string[],
    guests: '1',
    los: '1',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    recipients: [] as string[],
    newRecipient: ''
  })

  // Date validation state
  const [dateError, setDateError] = useState('')

  // Form validation state
  const [formErrors, setFormErrors] = useState({
    channels: '',
    guests: '',
    los: '',
    startDate: '',
    endDate: ''
  })

  // Snackbar state
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [showSecondSnackbar, setShowSecondSnackbar] = useState(false)

  // State for dropdowns
  const [isChannelsOpen, setIsChannelsOpen] = useState(false)
  const [isPrimaryHotelsOpen, setIsPrimaryHotelsOpen] = useState(false)
  const [isSecondaryHotelsOpen, setIsSecondaryHotelsOpen] = useState(false)
  const [isGuestsOpen, setIsGuestsOpen] = useState(false)
  const [isLosOpen, setIsLosOpen] = useState(false)

  // State for calendar popovers
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)
  const channelsRef = useRef<HTMLDivElement>(null)
  const primaryHotelsRef = useRef<HTMLDivElement>(null)
  const secondaryHotelsRef = useRef<HTMLDivElement>(null)
  const guestsRef = useRef<HTMLDivElement>(null)
  const losRef = useRef<HTMLDivElement>(null)

  // Function to determine report status based on your logic
  const determineReportStatus = (report: ReportData): string => {
    const isFilePathEmpty = !report.reportFilePath ||
      report.reportFilePath === 'NONE' ||
      report.reportFilePath === 'PENDING' ||
      report.reportFilePath === ""

    const isError = report.reportStatus.toLowerCase() === 'error'

    if (isFilePathEmpty && !isError) {
      return 'In Progress'
    } else if (isError) {
      return 'Error'
    } else {
      return 'Generated'
    }
  }

  // Function to fetch reports data
  const fetchReportsData = async () => {
    try {
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
      debugger
      // Get SID from localStorage (you may need to adjust this based on your auth implementation)
      const sid = selectedProperty?.sid ?? 0

      // Format dates for API call - use current date as fallback if dates are not provided
      const effectiveStartDate = startDate || new Date()
      const effectiveEndDate = endDate || new Date()
      const startDateStr = format(new Date(effectiveStartDate), "MM/dd/yyyy")
      const endDateStr = format(new Date(effectiveEndDate), "MM/dd/yyyy")

      // Call the API


      const response = await getAllReports({
        sid: selectedProperty?.sid,
        startdate: startDateStr,
        enddate: endDateStr
      })

      if (response.status) {
        let data = response.body || []

        // Apply filtering logic based on your previous implementation
        data = data.filter((item: ReportData) => {
          if (filter === 'ondemand' && item.requestType !== 'Batch') {
            return item
          } else if (filter !== 'ondemand') {
            return item
          }
          return false
        })

        // Store the raw data - filtering will be handled by useEffect
        setReportsData(data)
      }

      // Clear progress and finish loading
      clearInterval(progressInterval)
      setLoadingProgress(100)
      setTimeout(() => {
        setIsLoading(false)
        setLoadingProgress(0)
      }, 300)

    } catch (error) {
      console.error('Error fetching reports:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      setIsLoading(false)
      setLoadingProgress(0)
    }
  }

  // Function to fetch detailed report data for expanded row
  const fetchReportData = async (reportId: number, index: number) => {
    try {
      // Check if data already exists
      if (reportsData[index]?.reportData) {
        return
      }

      // Get SID from localStorage
      const sid = localStorage.getItem('sid') || '0'

      // Call API to get detailed report data
      const response = await getReportData({ reportId: reportId, sid: selectedProperty?.sid })

      if (response.status) {
        const updatedReportsData = [...reportsData]
        updatedReportsData[index].reportData = response.body
        updatedReportsData[index].reportData.dataSufficiency =
          updatedReportsData[index].reportData.dataSufficiency == null ? 0 : updatedReportsData[index].reportData.dataSufficiency

        setReportsData(updatedReportsData)
        setFilteredReportsData(updatedReportsData)
      }
    } catch (error) {
      console.error('Error fetching report details:', error)
    }
  }


  // Set default dates on component mount if not already set
  useEffect(() => {
    if (!startDate || !endDate) {
      const today = new Date()
      const defaultStartDate = startDate || subDays(today, 6)
      const defaultEndDate = endDate || today

      setStartDate(defaultStartDate)
      setEndDate(defaultEndDate)
    }
  }, [])

  // Loading effect and initial data fetch - only when dates or filter change
  useEffect(() => {
    if (startDate && endDate) {
      fetchReportsData()
    }
  }, [startDate, endDate, filter])

  // Local filtering for report type - no API call needed
  useEffect(() => {
    if (reportsData.length > 0) {
      let filteredData = [...reportsData]

      // Apply report type filter locally
      if (reportTypeChose !== 'All') {
        const reportType = reportTypeChose === "Scheduled" ? "Batch" : reportTypeChose;
        filteredData = filteredData.filter((item: ReportData) => item.requestType.toLowerCase() === reportType.toLowerCase())
      }

      setFilteredReportsData(filteredData)

      // Update status map for filtered data
      const statusMap: { [key: number]: string } = {}
      filteredData.forEach((item: ReportData, index: number) => {
        statusMap[index] = determineReportStatus(item)
      })
      setStatusOfReport(statusMap)
    } else { // Handle case where reportsData is empty
      setFilteredReportsData([])
      setStatusOfReport({})
    }
  }, [reportsData, reportTypeChose])

  // Check if there are any reports in progress
  const hasInProgressReports = useMemo(() => {
    return Object.values(statusOfReport).some(status => status === 'In Progress')
  }, [statusOfReport])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (channelsRef.current && !channelsRef.current.contains(event.target as Node)) {
        setIsChannelsOpen(false)
      }
      if (primaryHotelsRef.current && !primaryHotelsRef.current.contains(event.target as Node)) {
        setIsPrimaryHotelsOpen(false)
      }
      if (secondaryHotelsRef.current && !secondaryHotelsRef.current.contains(event.target as Node)) {
        setIsSecondaryHotelsOpen(false)
      }
      if (guestsRef.current && !guestsRef.current.contains(event.target as Node)) {
        setIsGuestsOpen(false)
      }
      if (losRef.current && !losRef.current.contains(event.target as Node)) {
        setIsLosOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])


  // Handle filter changes
  const handleDateRangeChange = (startDate: Date | undefined, endDate: Date | undefined) => {
    setStartDate(startDate)
    setEndDate(endDate)
    // The useEffect will handle the API call
  }

  const handleReportTypeChange = (newReportType: string) => {
    setReportTypeChose(newReportType)
    // Local filtering will be handled by useEffect - no API call needed
  }


  const handleRefresh = () => {
    fetchReportsData()
  }

  const handleCreateOnDemand = () => {
    setIsModalOpen(true)
  }


  // Form handling functions
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddRecipient = () => {
    if (formData.newRecipient && !formData.recipients.includes(formData.newRecipient)) {
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, prev.newRecipient],
        newRecipient: ''
      }))
    }
  }

  const handleRemoveRecipient = (email: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(recipient => recipient !== email)
    }))
  }

  // Form validation function
  const validateForm = () => {
    const errors = {
      channels: '',
      guests: '',
      los: '',
      startDate: '',
      endDate: ''
    }

    // Validate channels
    if (!formData.selectedChannels || formData.selectedChannels.length === 0) {
      errors.channels = 'Please select at least one channel'
    }

    // Validate guests
    if (!formData.guests) {
      errors.guests = 'Please select number of guests'
    }

    // Validate LOS
    if (!formData.los) {
      errors.los = 'Please select length of stay'
    }

    // Validate start date
    if (!formData.startDate) {
      errors.startDate = 'Please select check-in start date'
    }

    // Validate end date
    if (!formData.endDate) {
      errors.endDate = 'Please select check-in end date'
    }

    setFormErrors(errors)

    // Return true if no errors
    return Object.values(errors).every(error => error === '')
  }

  const handleGenerate = () => {
    // Validate form before proceeding
    if (!validateForm()) {
      return // Don't proceed if validation fails
    }

    setIsModalOpen(false)
    setShowSnackbar(true)
    // Reset form
    setFormData({
      selectedChannels: [] as string[],
      compSet: 'primary',
      selectedPrimaryHotels: [] as string[],
      selectedSecondaryHotels: [] as string[],
      guests: '1',
      los: '1',
      startDate: undefined,
      endDate: undefined,
      recipients: [] as string[],
      newRecipient: ''
    })
    setIsChannelsOpen(false)
    setIsPrimaryHotelsOpen(false)
    setIsSecondaryHotelsOpen(false)
    setIsGuestsOpen(false)
    setIsLosOpen(false)
    setIsStartDateOpen(false)
    setIsEndDateOpen(false)
    setDateError('')
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    // Reset form
    setFormData({
      selectedChannels: [] as string[],
      compSet: 'primary',
      selectedPrimaryHotels: [] as string[],
      selectedSecondaryHotels: [] as string[],
      guests: '1',
      los: '1',
      startDate: undefined,
      endDate: undefined,
      recipients: [] as string[],
      newRecipient: ''
    })
    setIsChannelsOpen(false)
    setIsPrimaryHotelsOpen(false)
    setIsSecondaryHotelsOpen(false)
    setIsGuestsOpen(false)
    setIsLosOpen(false)
    setIsStartDateOpen(false)
    setIsEndDateOpen(false)
    setDateError('')
    setFormErrors({
      channels: '',
      guests: '',
      los: '',
      startDate: '',
      endDate: ''
    })
  }

  // Handle channel selection
  const handleChannelToggle = (channel: string) => {
    setFormData(prev => {
      let newChannels = [...prev.selectedChannels]

      if (channel === 'All Channels') {
        // If "All Channels" is selected, select all channels
        if (newChannels.includes('All Channels')) {
          // If already selected, deselect all
          newChannels = []
        } else {
          // Select all channels including "All Channels"
          newChannels = [...channelsData]
        }
      } else {
        // Handle individual channel selection
        if (newChannels.includes(channel)) {
          // Remove channel if already selected
          newChannels = newChannels.filter(c => c !== channel)
          // Also remove "All Channels" since not all are selected now
          newChannels = newChannels.filter(c => c !== 'All Channels')
        } else {
          // Add channel if not selected
          newChannels.push(channel)

          // Check if all individual channels are now selected
          const individualChannels = channelsData.filter(c => c !== 'All Channels')
          const selectedIndividualChannels = newChannels.filter(c => c !== 'All Channels')

          if (selectedIndividualChannels.length === individualChannels.length) {
            // If all individual channels are selected, also select "All Channels"
            if (!newChannels.includes('All Channels')) {
              newChannels.push('All Channels')
            }
          }
        }

        // If no channels selected, default to "All Channels"
        if (newChannels.length === 0) {
          newChannels = ['All Channels']
        }
      }

      return { ...prev, selectedChannels: newChannels }
    })
  }

  // Check if a channel should be checked
  const isChannelSelected = (channel: string) => {
    if (formData.selectedChannels.includes('All Channels')) {
      // If "All Channels" is selected, show all channels as selected
      return true
    }
    return formData.selectedChannels.includes(channel)
  }

  // Handle primary hotel selection
  const handlePrimaryHotelToggle = (hotel: string) => {
    setFormData(prev => {
      let newHotels = [...prev.selectedPrimaryHotels]

      if (hotel === 'All Primary Hotels') {
        // If "All Primary Hotels" is selected, select all hotels
        if (newHotels.includes('All Primary Hotels')) {
          // If already selected, deselect all
          newHotels = []
        } else {
          // Select all hotels including "All Primary Hotels"
          newHotels = [...primaryHotelsData]
        }
      } else {
        // Handle individual hotel selection
        if (newHotels.includes(hotel)) {
          // Remove hotel if already selected
          newHotels = newHotels.filter(h => h !== hotel)
          // Also remove "All Primary Hotels" since not all are selected now
          newHotels = newHotels.filter(h => h !== 'All Primary Hotels')
        } else {
          // Add hotel if not selected
          newHotels.push(hotel)

          // Check if all individual hotels are now selected
          const individualHotels = primaryHotelsData.filter(h => h !== 'All Primary Hotels')
          const selectedIndividualHotels = newHotels.filter(h => h !== 'All Primary Hotels')

          if (selectedIndividualHotels.length === individualHotels.length) {
            // If all individual hotels are selected, also select "All Primary Hotels"
            if (!newHotels.includes('All Primary Hotels')) {
              newHotels.push('All Primary Hotels')
            }
          }
        }

        // If no hotels selected, default to "All Primary Hotels"
        if (newHotels.length === 0) {
          newHotels = ['All Primary Hotels']
        }
      }

      return { ...prev, selectedPrimaryHotels: newHotels }
    })
  }

  // Handle secondary hotel selection
  const handleSecondaryHotelToggle = (hotel: string) => {
    setFormData(prev => {
      let newHotels = [...prev.selectedSecondaryHotels]

      if (hotel === 'All Secondary Hotels') {
        // If "All Secondary Hotels" is selected, select all hotels
        if (newHotels.includes('All Secondary Hotels')) {
          // If already selected, deselect all
          newHotels = []
        } else {
          // Select all hotels including "All Secondary Hotels"
          newHotels = [...secondaryHotelsData]
        }
      } else {
        // Handle individual hotel selection
        if (newHotels.includes(hotel)) {
          // Remove hotel if already selected
          newHotels = newHotels.filter(h => h !== hotel)
          // Also remove "All Secondary Hotels" since not all are selected now
          newHotels = newHotels.filter(h => h !== 'All Secondary Hotels')
        } else {
          // Add hotel if not selected
          newHotels.push(hotel)

          // Check if all individual hotels are now selected
          const individualHotels = secondaryHotelsData.filter(h => h !== 'All Secondary Hotels')
          const selectedIndividualHotels = newHotels.filter(h => h !== 'All Secondary Hotels')

          if (selectedIndividualHotels.length === individualHotels.length) {
            // If all individual hotels are selected, also select "All Secondary Hotels"
            if (!newHotels.includes('All Secondary Hotels')) {
              newHotels.push('All Secondary Hotels')
            }
          }
        }

        // If no hotels selected, default to "All Secondary Hotels"
        if (newHotels.length === 0) {
          newHotels = ['All Secondary Hotels']
        }
      }

      return { ...prev, selectedSecondaryHotels: newHotels }
    })
  }

  // Check if a primary hotel should be checked
  const isPrimaryHotelSelected = (hotel: string) => {
    if (formData.selectedPrimaryHotels.includes('All Primary Hotels')) {
      // If "All Primary Hotels" is selected, show all hotels as selected
      return true
    }
    return formData.selectedPrimaryHotels.includes(hotel)
  }

  // Check if a secondary hotel should be checked
  const isSecondaryHotelSelected = (hotel: string) => {
    if (formData.selectedSecondaryHotels.includes('All Secondary Hotels')) {
      // If "All Secondary Hotels" is selected, show all hotels as selected
      return true
    }
    return formData.selectedSecondaryHotels.includes(hotel)
  }

  // Snackbar functions
  const handleSnackbarOk = () => {
    setShowSnackbar(false)
    // Show second snackbar after 4 seconds
    setTimeout(() => {
      setShowSecondSnackbar(true)
    }, 4000)
  }

  const handleSecondSnackbarClose = () => {
    setShowSecondSnackbar(false)
  }

  // Date validation functions
  const handleStartDateSelect = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, startDate: date }))

    // Close the calendar popover
    setIsStartDateOpen(false)

    // Clear error when start date is selected
    if (dateError) {
      setDateError('')
    }

    // If end date exists and is before the new start date, clear end date
    if (date && formData.endDate && formData.endDate < date) {
      setFormData(prev => ({ ...prev, endDate: undefined }))
      setDateError('End date cannot be before start date. Please select a new end date.')
    }
  }

  const handleEndDateSelect = (date: Date | undefined) => {
    // Validate that end date is not before start date
    if (date && formData.startDate && date < formData.startDate) {
      setDateError('End date cannot be before start date')
      return
    }

    setFormData(prev => ({ ...prev, endDate: date }))
    setDateError('')

    // Close the calendar popover
    setIsEndDateOpen(false)
  }

  // Toggle row expansion (only one row can be expanded at a time)
  const toggleRowExpansion = (reportId: string) => {
    setExpandedRow(prev => {
      // If clicking the same row, collapse it
      if (prev === reportId) {
        return null
      }
      // Otherwise, expand the new row (this automatically collapses the previous one)
      return reportId
    })
  }

  // Handle report data expansion (equivalent to your onReportData function)
  const onReportData = (reportId: number, index: number) => {
    toggleRowExpansion(reportId.toString())
    fetchReportData(reportId, index)
  }


  // Sorting logic
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

  // Sort the data based on current sort configuration
  const sortedReportsData = [...filteredReportsData].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0

    let aValue: any
    let bValue: any

    // Map the sort keys to the actual data properties
    switch (sortConfig.key) {
      case 'rrds':
        aValue = a.rrDs
        bValue = b.rrDs
        break
      case 'shopDate':
        aValue = new Date(a.shoppedDateTime)
        bValue = new Date(b.shoppedDateTime)
        break
      case 'checkInDates':
        aValue = new Date(a.checkInDate)
        bValue = new Date(b.checkInDate)
        break
      case 'reportType':
        aValue = a.requestType
        bValue = b.requestType
        break
      case 'reportDays':
        aValue = a.daysOfData
        bValue = b.daysOfData
        break
      default:
        aValue = a[sortConfig.key as keyof typeof a]
        bValue = b[sortConfig.key as keyof typeof b]
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  // Reports Loading Skeleton
  const ReportsLoadingSkeleton = () => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Filter Bar Skeleton */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="max-w-7xl xl:max-w-none mx-auto">
            <div className="flex items-center justify-between py-4 gap-4">
              <div className="flex items-center gap-4 flex-1">
                {/* Toggle Buttons Skeleton */}
                <div className="shrink-0">
                  <div className="border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 shadow-sm h-10 flex">
                    <div className="h-10 px-4 bg-blue-600 text-white rounded-l-md flex items-center">
                      <div className="h-4 w-16 bg-white/20 animate-pulse rounded"></div>
                    </div>
                    <div className="h-10 px-4 border-l border-slate-200 dark:border-slate-700 rounded-r-md flex items-center">
                      <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                  </div>
                </div>
                {/* Date Picker Skeleton */}
                <div className="shrink-0">
                  <div className="h-10 w-48 bg-gray-300 animate-pulse rounded-md"></div>
                </div>
                {/* Report Type Skeleton */}
                <div className="shrink-0">
                  <div className="h-10 w-36 bg-gray-300 animate-pulse rounded-md"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header Section Skeleton */}
      <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8">
        <div className="mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-8 w-48 bg-gray-300 animate-pulse rounded"></div>
              </div>
              <div className="h-4 w-96 bg-gray-300 animate-pulse rounded"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-40 bg-gray-300 animate-pulse rounded"></div>
              <div className="h-10 w-10 bg-gray-300 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 pb-4 md:pb-6 lg:pb-8 xl:pb-10" style={{ marginTop: '10px' }}>
        <div className="max-w-none mx-auto">
          {/* Reports Table Skeleton */}
          <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden">
            {/* Progress Bar */}
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

            <div className="p-0">
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {/* Table Header Skeleton */}
                  <div className="rounded-t-lg" style={{ backgroundColor: 'rgb(243 244 246/var(--tw-bg-opacity,1))' }}>
                    <div className="grid grid-cols-12 gap-3 px-4 py-3 text-sm font-medium">
                      <div className="col-span-2 h-4 bg-gray-300 animate-pulse rounded"></div>
                      <div className="col-span-1 h-4 bg-gray-300 animate-pulse rounded"></div>
                      <div className="col-span-2 h-4 bg-gray-300 animate-pulse rounded"></div>
                      <div className="col-span-2 h-4 bg-gray-300 animate-pulse rounded"></div>
                      <div className="col-span-1 h-4 bg-gray-300 animate-pulse rounded"></div>
                      <div className="col-span-1 h-4 bg-gray-300 animate-pulse rounded"></div>
                      <div className="col-span-1 h-4 bg-gray-300 animate-pulse rounded"></div>
                      <div className="col-span-1 h-4 bg-gray-300 animate-pulse rounded"></div>
                      <div className="col-span-1 h-4 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                  </div>

                  {/* Table Body Skeleton */}
                  <div className="bg-white dark:bg-gray-900 rounded-b-lg">
                    {[1, 2, 3, 4].map((index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                        <div className="col-span-2 h-4 bg-gray-300 animate-pulse rounded"></div>
                        <div className="col-span-1 h-4 bg-gray-300 animate-pulse rounded"></div>
                        <div className="col-span-2 h-4 bg-gray-300 animate-pulse rounded"></div>
                        <div className="col-span-2 h-4 bg-gray-300 animate-pulse rounded"></div>
                        <div className="col-span-1 h-4 bg-gray-300 animate-pulse rounded"></div>
                        <div className="col-span-1 h-4 bg-gray-300 animate-pulse rounded"></div>
                        <div className="col-span-1 h-4 bg-gray-300 animate-pulse rounded"></div>
                        <div className="col-span-1 h-4 bg-gray-300 animate-pulse rounded"></div>
                        <div className="col-span-1 h-4 bg-gray-300 animate-pulse rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return <ReportsLoadingSkeleton />
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Enhanced Filter Bar with Sticky Positioning */}
        <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-border/50 shadow-sm transition-shadow duration-200 relative overflow-hidden">
          <ReportsFilterBar
            onDateRangeChange={handleDateRangeChange}
            onReportTypeChange={handleReportTypeChange}
            currentDateRange={{ start: startDate, end: endDate }}
            currentReportType={reportTypeChose}
            currentFilter={filter}
          />
        </div>

        {/* Professional Header Section */}
        <section className="w-full mt-4">
          <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="max-w-none mx-auto">
              <ReportsHeader
                handleRefresh={handleRefresh}
                handleCreateOnDemand={handleCreateOnDemand}
                reportsCount={filteredReportsData.length}
                hasInProgressReports={hasInProgressReports}
              />
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 pb-4 md:pb-6 lg:pb-8 xl:pb-10" style={{ marginTop: '10px' }}>
          <div className="max-w-none mx-auto">

            {/* Reports Table - Compact Design */}
            <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden">
              <div className="p-0">
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    {/* Table Header */}
                    <div className="rounded-t-lg" style={{ backgroundColor: 'rgb(243 244 246/var(--tw-bg-opacity,1))' }}>
                      <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        <div className="col-span-2 capitalize flex items-start">Report Id</div>
                        <div
                          className="col-span-1 flex items-start gap-1 capitalize cursor-pointer group -ml-2"
                          onClick={() => handleSort('rrds')}
                        >
                          RRDs
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                            {getHoverIcon('rrds')}
                          </span>
                          <span className="opacity-100 mt-0.5">
                            {getSortIcon('rrds')}
                          </span>
                        </div>
                        <div
                          className="col-span-1 flex items-start gap-1 capitalize cursor-pointer group"
                          onClick={() => handleSort('shopDate')}
                        >
                          Shop Date
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                            {getHoverIcon('shopDate')}
                          </span>
                          <span className="opacity-100 mt-0.5">
                            {getSortIcon('shopDate')}
                          </span>
                        </div>
                        <div
                          className="col-span-2 flex items-start gap-1 capitalize cursor-pointer group ml-4"
                          onClick={() => handleSort('checkInDates')}
                        >
                          Check-In<br />Dates
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                            {getHoverIcon('checkInDates')}
                          </span>
                          <span className="opacity-100 mt-0.5">
                            {getSortIcon('checkInDates')}
                          </span>
                        </div>
                        <div
                          className="col-span-1 flex items-start gap-1 capitalize cursor-pointer group"
                          onClick={() => handleSort('reportType')}
                        >
                          Report<br />Type
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                            {getHoverIcon('reportType')}
                          </span>
                          <span className="opacity-100 mt-0.5">
                            {getSortIcon('reportType')}
                          </span>
                        </div>
                        <div
                          className="col-span-1 flex items-start gap-1 capitalize cursor-pointer group -ml-2"
                          onClick={() => handleSort('reportDays')}
                        >
                          Report<br />Days
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                            {getHoverIcon('reportDays')}
                          </span>
                          <span className="opacity-100 mt-0.5">
                            {getSortIcon('reportDays')}
                          </span>
                        </div>
                        <div className="col-span-1 capitalize flex items-start -ml-2 mr-4">LOS</div>
                        <div className="col-span-1 capitalize flex items-start -ml-4">Guests</div>
                        <div className="col-span-1 capitalize flex items-start -ml-4">Status</div>
                        <div className="col-span-1 capitalize flex items-start -ml-4">Action</div>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div className="bg-white dark:bg-gray-900 rounded-b-lg">
                      {sortedReportsData.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center">
                            <div className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
                              No reports found
                            </div>
                            <div className="text-gray-400 dark:text-gray-500 text-sm">
                              Try adjusting your filters or date range
                            </div>
                          </div>
                        </div>
                      ) : (
                        sortedReportsData.map((report, index) => {
                          const isExpanded = expandedRow === report.reportID.toString()
                          const isNextRowExpanded = index < sortedReportsData.length - 1 && expandedRow === sortedReportsData[index + 1].reportID.toString()
                          const reportStatus = statusOfReport[index] || determineReportStatus(report)

                          return (
                            <>
                              <div
                                key={report.reportID}
                                className={`grid grid-cols-12 gap-3 px-4 py-2 text-sm ${isNextRowExpanded
                                  ? 'border-b border-blue-200 dark:border-blue-500'
                                  : isExpanded && index === sortedReportsData.length - 1
                                    ? 'border-b-0'
                                    : 'border-b border-gray-100 dark:border-gray-800'
                                  } ${isExpanded
                                    ? 'bg-blue-100 dark:bg-blue-800/30'
                                    : index % 2 === 0
                                      ? 'bg-white dark:bg-gray-900'
                                      : 'bg-gray-50 dark:bg-gray-800/50'
                                  } ${isExpanded && index === sortedReportsData.length - 1
                                    ? ''
                                    : index === sortedReportsData.length - 1 ? '' : ''
                                  }`}
                              >
                                <div className="col-span-2 flex items-center gap-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div
                                        className="flex items-center gap-2 cursor-pointer group"
                                        onClick={() => onReportData(report.reportID, index)}
                                      >
                                        <span className="text-blue-600 group-hover:text-blue-800 font-medium">
                                          {report.reportID}
                                        </span>
                                        <div className="w-4 h-4 border border-blue-600 dark:border-blue-600 rounded-full flex items-center justify-center group-hover:border-blue-700 transition-colors">
                                          {isExpanded ? (
                                            <ChevronUp className="w-2.5 h-2.5 text-blue-600 group-hover:text-blue-700" strokeWidth="2.5" />
                                          ) : (
                                            <ChevronDown className="w-2.5 h-2.5 text-blue-600 group-hover:text-blue-700" strokeWidth="2.5" />
                                          )}
                                        </div>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-black text-white border-black text-xs px-2 py-1">
                                      <p>{isExpanded ? "Hide Report Details" : "Show Report Details"}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <div className="col-span-1 font-medium flex items-center -ml-2">{report.rrDs}</div>
                                <div className="col-span-1 flex items-center">{report.shoppedDateTime}</div>
                                <div className="col-span-2 flex items-center ml-4">{report.fullCheckinDate || `${format(new Date(report.checkInDate), "dd MMM ''yy")} - ${format(new Date(report.checkInDate), "dd MMM ''yy")}`}</div>
                                <div className="col-span-1 flex items-center">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge
                                        variant={report.requestType === "Batch" ? "secondary" : "outline"}
                                        className={report.requestType !== "Batch" ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 hover:bg-orange-100 hover:text-orange-800 dark:hover:bg-orange-900/20 dark:hover:text-orange-400" : ""}
                                      >
                                        {report.requestType === "Batch" ? "Sch." : "OD"}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-black text-white border-black text-xs px-2 py-1">
                                      <p>{report.requestType === "Batch" ? "Scheduled Report" : "On Demand Report"}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <div className="col-span-1 flex items-center -ml-2">{report.daysOfData}</div>
                                <div className="col-span-1 flex items-center -ml-2 mr-4">{report.los}</div>
                                <div className="col-span-1 flex items-center -ml-4">{report.occupancy}</div>
                                <div className="col-span-1 flex items-center -ml-4">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center justify-center">
                                        {reportStatus === "Generated" ? (
                                          <div className="relative">
                                            <div className="w-4 h-4 border border-green-600 rounded-full"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                              <div className="w-3 h-3 text-green-600">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                                  <path d="M20 6L9 17l-5-5" />
                                                </svg>
                                              </div>
                                            </div>
                                          </div>
                                        ) : reportStatus === "Error" ? (
                                          <div className="relative">
                                            <div className="w-4 h-4 border border-red-600 rounded-full"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                              <div className="w-3 h-3 text-red-600">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                                  <path d="M18 6L6 18M6 6l12 12" />
                                                </svg>
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                                        )}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className={`text-white text-xs px-2 py-1 ${reportStatus === "Generated"
                                      ? "bg-green-600 border-green-600"
                                      : reportStatus === "Error"
                                        ? "bg-red-600 border-red-600"
                                        : "bg-orange-500 border-orange-500"
                                      }`}>
                                      <p>{reportStatus === "Generated" ? "Report Generated" : reportStatus === "Error" ? "Report Error" : "Report In Progress"}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <div className="col-span-1 flex items-center -ml-4">
                                  <div className="flex items-center gap-2">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className={`h-8 w-8 ${reportStatus !== "Generated" ? "opacity-50 cursor-not-allowed" : ""}`}
                                          disabled={reportStatus !== "Generated"}
                                          onClick={() => window.open(report.reportFilePath, '_blank')}
                                        >
                                          <Download className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-black text-white border-black text-xs px-2 py-1">
                                        <p>Download Detailed View (Macros)</p>
                                      </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className={`h-8 w-8 ${reportStatus !== "Generated" ? "opacity-50 cursor-not-allowed" : ""}`}
                                          disabled={reportStatus !== "Generated"}
                                          onClick={() => window.open(report.excelLiteFilePath || report.reportFilePath, '_blank')}
                                        >
                                          <FileSpreadsheet className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-black text-white border-black text-xs px-2 py-1">
                                        <p>Download Raw Data</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                              </div>

                              {/* Expanded Content Row */}
                              {isExpanded && (
                                <div className={`grid grid-cols-12 gap-3 px-4 py-4 text-sm border-t border-blue-200 dark:border-blue-500 ${index === sortedReportsData.length - 1
                                  ? 'rounded-b-lg'
                                  : 'border-b border-blue-200 dark:border-blue-500'
                                  } ${index % 2 === 0
                                    ? 'bg-blue-50 dark:bg-blue-900/20'
                                    : 'bg-blue-50 dark:bg-blue-900/20'
                                  }`}>
                                  <div className="col-span-12">
                                    <div className="grid grid-cols-12 gap-8">
                                      {/* Schedule Name */}
                                      <div className="col-span-3" style={{ marginLeft: '60px' }}>
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Schedule name</h4>
                                        <p className="text-black dark:text-black font-semibold">{report.scheduleName || report.reportID}</p>
                                      </div>

                                      {/* Channels */}
                                      <div className="col-span-2">
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                          Channels ({report.reportData?.channels ? 
                                            report.reportData.channels.split(',').filter((channel: string) => channel.trim() !== '').length : 0})
                                        </h4>
                                        <div className="text-black dark:text-black">
                                          <div className="max-h-40 overflow-y-auto space-y-1">
                                            <ul className="space-y-1">
                                              {report.reportData?.channels ?
                                                report.reportData.channels.split(',')
                                                  .filter((channel: string) => channel.trim() !== '') // Filter out empty/blank values
                                                  .map((channel: string, idx: number) => (
                                                    <li key={idx} className="flex items-start">
                                                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                                                      <span className="text-sm leading-tight">{channel.trim()}</span>
                                                    </li>
                                                  )) :
                                                <li className="flex items-start">
                                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                                                  <span className="text-sm leading-tight">No channels data</span>
                                                </li>
                                              }
                                            </ul>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Properties */}
                                      <div className="col-span-3">
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                          Property ({report.reportData?.properties ? 
                                            report.reportData.properties.split('$#$').filter((prop: string) => prop.trim() !== '').length : 0})
                                        </h4>
                                        <div className="text-black dark:text-black">
                                          <div className="max-h-40 overflow-y-auto space-y-1">
                                            <ul className="space-y-1">
                                              {report.reportData?.properties ?
                                                report.reportData.properties.split('$#$')
                                                  .filter((property: string) => property.trim() !== '') // Filter out empty/blank values
                                                  .map((property: string, idx: number) => (
                                                    <li key={idx} className="flex items-start">
                                                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                                                      <span className="text-sm leading-tight">{property.trim()}</span>
                                                    </li>
                                                  )) :
                                                <li className="flex items-start">
                                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                                                  <span className="text-sm leading-tight">No properties data</span>
                                                </li>
                                              }
                                            </ul>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Currency */}
                                      <div className="col-span-1">
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Currency</h4>
                                        <p className="text-black dark:text-black">{report.reportData?.currency || report.currency || 'N/A'}</p>
                                      </div>

                                      {/* Data Sufficiency */}
                                      <div className="col-span-1">
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Data Sufficiency</h4>
                                        <p className="text-black dark:text-black">
                                          {report.reportData?.dataSufficiency ? `${report.reportData.dataSufficiency}%` : 'N/A'}
                                        </p>
                                      </div>

                                      {/* Generated By */}
                                      <div className="col-span-1">
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Generated by</h4>
                                        <p className="text-black dark:text-black">{report.generatedBy || 'N/A'}</p>
                                      </div>

                                      {/* Additional Space */}
                                      <div className="col-span-1"></div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* On-Demand Report Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-black">Generate On Demand Report</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* Configure Section */}
            <div className="space-y-8">
              {/* Channels */}
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Channels<span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative" ref={channelsRef}>
                  <button
                    type="button"
                    onClick={() => setIsChannelsOpen(!isChannelsOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    <span className="truncate">
                      {formData.selectedChannels.includes('All Channels')
                        ? "All Channels"
                        : formData.selectedChannels.length === 1
                          ? formData.selectedChannels[0]
                          : `${formData.selectedChannels.length} channels selected`
                      }
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isChannelsOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isChannelsOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {channelsData.map((channel) => (
                        <label
                          key={channel}
                          className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChannelSelected(channel)}
                            onChange={() => handleChannelToggle(channel)}
                            className="w-4 h-4 mr-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-900 truncate" title={channel}>
                            {channel.length > 32 ? `${channel.substring(0, 32)}...` : channel}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {formErrors.channels && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.channels}</p>
                )}
              </div>

              {/* CompSet */}
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-2">CompSet</Label>
                <RadioGroup
                  value={formData.compSet}
                  onValueChange={(value) => handleFormChange('compSet', value)}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2 relative" ref={primaryHotelsRef}>
                    <RadioGroupItem value="primary" id="primary" />
                    <Label
                      htmlFor="primary"
                      className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer"
                      onClick={() => setIsPrimaryHotelsOpen(!isPrimaryHotelsOpen)}
                    >
                      <span>Primary (10)</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </Label>

                    {/* Primary Hotels Dropdown */}
                    {isPrimaryHotelsOpen && (
                      <div className="absolute z-50 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto min-w-80">
                        {primaryHotelsData.map((hotel) => (
                          <label
                            key={hotel}
                            className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isPrimaryHotelSelected(hotel)}
                              onChange={() => handlePrimaryHotelToggle(hotel)}
                              className="w-4 h-4 mr-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-900 truncate" title={hotel}>
                              {hotel.length > 32 ? `${hotel.substring(0, 32)}...` : hotel}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 relative" ref={secondaryHotelsRef}>
                    <RadioGroupItem value="secondary" id="secondary" />
                    <Label
                      htmlFor="secondary"
                      className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer"
                      onClick={() => setIsSecondaryHotelsOpen(!isSecondaryHotelsOpen)}
                    >
                      <span>Secondary</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </Label>

                    {/* Secondary Hotels Dropdown */}
                    {isSecondaryHotelsOpen && (
                      <div className="absolute z-50 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto min-w-80">
                        {secondaryHotelsData.map((hotel) => (
                          <label
                            key={hotel}
                            className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isSecondaryHotelSelected(hotel)}
                              onChange={() => handleSecondaryHotelToggle(hotel)}
                              className="w-4 h-4 mr-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-900 truncate" title={hotel}>
                              {hotel.length > 32 ? `${hotel.substring(0, 32)}...` : hotel}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </RadioGroup>
              </div>

              {/* Guests and LOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Guests */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 mb-1">
                    Guests<span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="relative" ref={guestsRef}>
                    <button
                      type="button"
                      onClick={() => setIsGuestsOpen(!isGuestsOpen)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      <span>{formData.guests}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isGuestsOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isGuestsOpen && (
                      <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((number) => (
                          <button
                            key={number}
                            type="button"
                            onClick={() => {
                              handleFormChange('guests', number.toString())
                              setIsGuestsOpen(false)
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                          >
                            {number}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {formErrors.guests && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.guests}</p>
                  )}
                </div>

                {/* LOS */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 mb-1">
                    LOS<span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="relative" ref={losRef}>
                    <button
                      type="button"
                      onClick={() => setIsLosOpen(!isLosOpen)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      <span>{formData.los}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isLosOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isLosOpen && (
                      <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((number) => (
                          <button
                            key={number}
                            type="button"
                            onClick={() => {
                              handleFormChange('los', number.toString())
                              setIsLosOpen(false)
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                          >
                            {number}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {formErrors.los && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.los}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Check-In Dates Section */}
            <div className="space-y-8">
              {/* Start Date and End Date in same row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 mb-1">
                    Check-in Start Date<span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? format(formData.startDate, "dd MMM ''yy") : "Select start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={handleStartDateSelect}
                        numberOfMonths={1}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        fromDate={new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  {formErrors.startDate && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.startDate}</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 mb-1">
                    Check-in End Date<span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? format(formData.endDate, "dd MMM ''yy") : "Select end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={handleEndDateSelect}
                        numberOfMonths={1}
                        initialFocus
                        disabled={(date) => {
                          const today = new Date(new Date().setHours(0, 0, 0, 0))
                          const isBeforeToday = date < today
                          const isBeforeStartDate = formData.startDate && date < formData.startDate
                          return Boolean(isBeforeToday || isBeforeStartDate)
                        }}
                        fromDate={formData.startDate || new Date()}
                      />
                      {dateError && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border-t border-red-200">
                          {dateError}
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  {formErrors.endDate && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Recipients */}
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-2">Recipients</Label>
                <div className="space-y-2">
                  {/* Existing Recipients */}
                  {formData.recipients.map((email, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2 border border-gray-200">
                      <span className="text-sm text-gray-900 truncate">{email}</span>
                      <button
                        onClick={() => handleRemoveRecipient(email)}
                        className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                    </div>
                  ))}

                  {/* Add New Recipient */}
                  <div>
                    <Input
                      placeholder="Enter email address"
                      value={formData.newRecipient}
                      onChange={(e) => handleFormChange('newRecipient', e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              className="h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Generate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* First Snackbar */}
      {showSnackbar && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 min-w-96">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium">
                Preparing your report... please wait. Processing large data may take some time.
              </span>
            </div>
            <Button
              onClick={handleSnackbarOk}
              variant="outline"
              size="sm"
              className="bg-white text-blue-600 border-white hover:bg-gray-100 px-4 py-1 h-8 text-sm font-medium"
            >
              OK
            </Button>
          </div>
        </div>
      )}

      {/* Second Snackbar */}
      {showSecondSnackbar && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 min-w-[800px]">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium whitespace-nowrap">
                Your 'On-Demand' report is available now, click here to '<span className="underline decoration-white cursor-pointer hover:no-underline">Download</span>' or check from '<span className="underline cursor-pointer">Reports</span>' page.
              </span>
            </div>
            <Button
              onClick={handleSecondSnackbarClose}
              variant="outline"
              size="sm"
              className="bg-white text-green-600 border-white hover:bg-gray-100 px-4 py-1 h-8 text-sm font-medium ml-auto"
            >
              DONE
            </Button>
          </div>
        </div>
      )}

    </TooltipProvider>
  )
}
