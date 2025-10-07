"use client"

import React, { useState, useEffect, useMemo } from "react"
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
import { getAllReports, getReportData, generateAndMailReportCSV, getChannelList, getCompleteCompSet, checkMappingValidation, generateOndemandReport, getSummaryData } from "@/lib/reports"
import { conevrtDateforApi } from "@/lib/utils"
import { LocalStorageService } from "@/lib/localstorage"
import { useSelectedProperty, useUserDetail } from "@/hooks/use-local-storage"

// Dynamic data arrays - will be populated from API

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
  const [userDetails] = useUserDetail()
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
  const [isGenerating, setIsGenerating] = useState(false)

  // Package and credit limit states
  const [packageDetails, setPackageDetails] = useState<any>(null)
  const [totalShopsConsumedYearly, setTotalShopsConsumedYearly] = useState<number>(0)
  const [totalShopsAlloted, setTotalShopsAlloted] = useState<number>(0)

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

  // Form validation state
  const [formErrors, setFormErrors] = useState({
    channels: '',
    compSet: '',
    guests: '',
    los: '',
    startDate: '',
    endDate: '',
    recipients: '',
    general: ''
  })

  // Snackbar state
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [showSecondSnackbar, setShowSecondSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'warning'>('success')
  const [showMissingNotification, setShowMissingNotification] = useState(false)
  const [missingNotificationData, setMissingNotificationData] = useState<any[]>([])

  // Download report data popup state
  const [showDownloadPopup, setShowDownloadPopup] = useState(false)
  const [downloadingReportId, setDownloadingReportId] = useState<number | null>(null)

  // Channels data state
  const [channelsData, setChannelsData] = useState<string[]>([])
  const [isLoadingChannels, setIsLoadingChannels] = useState(false)
  const [channelList, setChannelList] = useState<any[]>([])
  const [allChannels, setAllChannels] = useState<any[]>([])
  const [isAnyDisabledChannel, setIsAnyDisabledChannel] = useState(false)
  const [disabledChannels, setDisabledChannels] = useState<string[]>([])
  const [searchValue, setSearchValue] = useState('')

  // CompSet data state
  const [primaryHotelsData, setPrimaryHotelsData] = useState<any[]>([])
  const [secondaryHotelsData, setSecondaryHotelsData] = useState<any[]>([])
  const [isLoadingCompSet, setIsLoadingCompSet] = useState(false)
  const [primarySearchValue, setPrimarySearchValue] = useState('')
  const [secondarySearchValue, setSecondarySearchValue] = useState('')

  // State for dropdowns
  const [isChannelsOpen, setIsChannelsOpen] = useState(false)
  const [isPrimaryHotelsOpen, setIsPrimaryHotelsOpen] = useState(false)
  const [isSecondaryHotelsOpen, setIsSecondaryHotelsOpen] = useState(false)
  const [isGuestsOpen, setIsGuestsOpen] = useState(false)
  const [isLosOpen, setIsLosOpen] = useState(false)

  // State for calendar popovers
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)

  // Date validation states
  const [maxEndDate, setMaxEndDate] = useState<Date | undefined>(undefined)
  const [maxDate, setMaxDate] = useState<Date | undefined>(undefined)
  const today = new Date()
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

  // Function to fetch reports data with specific dates
  const fetchReportsDataWithDates = async (startDate: Date, endDate: Date) => {
    let progressInterval: NodeJS.Timeout | undefined = undefined
    try {
      setIsLoading(true)
      setLoadingProgress(0)

      // Progress interval
      progressInterval = setInterval(() => {
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

      // Get SID from localStorage (you may need to adjust this based on your auth implementation)
      const sid = selectedProperty?.sid ?? 0

      // Format dates for API call
      const startDateStr = format(new Date(startDate), "MM/dd/yyyy")
      const endDateStr = format(new Date(endDate), "MM/dd/yyyy")
      debugger;
      // Call the API
      const response = await getAllReports({
        sid: selectedProperty?.sid,
        startdate: startDateStr,
        enddate: endDateStr
      })

      // Handle response - check if response exists and has data
      if (response && (response.status || response.body !== undefined)) {
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

        setReportsData(data)
        setFilteredReportsData(data)

        // Log when no reports are found (this is normal, not an error)
        if (data.length === 0) {
          console.log('No reports found for the selected date range')
        }
      } else {
        // Only log as error if there's an actual API error
        console.error('API error:', response)
        setReportsData([])
        setFilteredReportsData([])
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      setReportsData([])
      setFilteredReportsData([])
    } finally {
      setIsLoading(false)
      setLoadingProgress(100)
      if (progressInterval) {
        clearInterval(progressInterval)
      }
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
      // Get SID from localStorage (you may need to adjust this based on your auth implementation)
      const sid = selectedProperty?.sid ?? 0

      // Format dates for API call - use current date as fallback if dates are not provided
      const effectiveStartDate = startDate || new Date()
      const effectiveEndDate = endDate || new Date()
      const startDateStr = format(new Date(effectiveStartDate), "MM/dd/yyyy")
      const endDateStr = format(new Date(effectiveEndDate), "MM/dd/yyyy")

      // Call the API

      debugger
      const response = await getAllReports({
        sid: selectedProperty?.sid,
        startdate: startDateStr,
        enddate: endDateStr
      })

      // Handle response - check if response exists and has data
      if (response && (response.status || response.body !== undefined)) {
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

        // Log when no reports are found (this is normal, not an error)
        if (data.length === 0) {
          console.log('No reports found for the selected date range')
        }
      } else {
        // Only log as error if there's an actual API error
        console.error('API error:', response)
        setReportsData([])
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

    // Initialize maxDate to 1 year from today
    const nextYear = new Date()
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    setMaxDate(nextYear)
  }, [])

  // Set default user email as recipient when userDetails becomes available
  useEffect(() => {
    if (userDetails?.email && formData.recipients.length === 0) {
      setFormData(prev => ({
        ...prev,
        recipients: [userDetails.email]
      }))
    }
  }, [userDetails?.email])

  // Load package details and credit limits from localStorage
  useEffect(() => {
    if (!selectedProperty?.sid) return;
    const fetchSummaryData = async () => {
      try {
        const response = await getSummaryData(selectedProperty?.sid?.toString() || '')
        if (response.status) {
          setPackageDetails(response.body)
          setTotalShopsConsumedYearly(response.body.consumedShopsBatch + response.body.consumedShopsOnDemand + response.body.consumedShopsRTRR)
          setTotalShopsAlloted(response.body.totalShops)
        }
      } catch (error) {
        console.error('Error fetching summary data:', error)
      }
    }
    Promise.all([fetchChannelsData()
      , fetchCompSetData(), fetchSummaryData()])
  }, [selectedProperty?.sid])

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
        handleChannelsDropdownClose()
      }
      if (primaryHotelsRef.current && !primaryHotelsRef.current.contains(event.target as Node)) {
        setIsPrimaryHotelsOpen(false)
        setPrimarySearchValue('') // Clear search when closing
      }
      if (secondaryHotelsRef.current && !secondaryHotelsRef.current.contains(event.target as Node)) {
        setIsSecondaryHotelsOpen(false)
        setSecondarySearchValue('') // Clear search when closing
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
    // Trigger API call immediately with new dates
    // if (startDate && endDate) {
    //   fetchReportsDataWithDates(startDate, endDate)
    // }
  }

  const handleReportTypeChange = (newReportType: string) => {
    setReportTypeChose(newReportType)
    // Local filtering will be handled by useEffect - no API call needed
  }


  const handleRefresh = () => {
    if (startDate && endDate) {
      fetchReportsDataWithDates(startDate, endDate)
    } else {
      fetchReportsData()
    }
  }

  // Function to fetch channels data
  const fetchChannelsData = async () => {
    try {
      setIsLoadingChannels(true)

      const response = await getChannelList({
        SID: selectedProperty?.sid,
        isMetaSite: true
      })

      if (response.status && response.body) {
        // Filter active channels
        const activeChannels = response.body.filter((x: any) => x.isActive)
        const allChannelsData = response.body

        // Set channel data
        setChannelList(activeChannels)
        setAllChannels(allChannelsData)

        // Extract channel names for the dropdown
        const channelNames = activeChannels.map((channel: any) => channel.name)
        setChannelsData(channelNames)

        // Select all channels by default
        setFormData(prev => ({
          ...prev,
          selectedChannels: channelNames
        }))

        // Check for disabled channels
        const disabledChannelsList = response.body.filter((x: any) => !x.isActive)
        setIsAnyDisabledChannel(disabledChannelsList.length > 0)
        setDisabledChannels(disabledChannelsList.map((channel: any) => channel.name))
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
      // Set default channels if API fails
      setChannelsData([])
    } finally {
      setIsLoadingChannels(false)
    }
  }

  // Function to fetch compset data
  const fetchCompSetData = async () => {
    try {
      setIsLoadingCompSet(true)

      const response = await getCompleteCompSet({
        SID: selectedProperty?.sid,
        includesubscriber: false
      })

      if (response.status && response.body) {
        // Filter primary and secondary compsets based on isSecondary property
        const primaryCompSets = response.body.filter((x: any) => !x.isSecondary)
        const secondaryCompSets = response.body.filter((x: any) => x.isSecondary)

        setPrimaryHotelsData(primaryCompSets)
        setSecondaryHotelsData(secondaryCompSets)

        // Select all primary options by default
        const primaryNames = primaryCompSets.map((compSet: any) => compSet.name)
        setFormData(prev => ({
          ...prev,
          selectedPrimaryHotels: primaryNames,
          selectedSecondaryHotels: []
        }))
      }
    } catch (error) {
      console.error('Error fetching compset data:', error)
      // Set default data if API fails
      setPrimaryHotelsData([])
      setSecondaryHotelsData([])
    } finally {
      setIsLoadingCompSet(false)
    }
  }

  const handleCreateOnDemand = () => {
    setIsModalOpen(true)
    // Fetch channels and compset data when modal opens
  }


  // Form handling functions
  const handleFormChange = (field: string, value: string) => {
    if (field === 'compSet' && value === 'secondary') {
      // When switching to secondary, select all secondary hotels by default
      const secondaryNames = secondaryHotelsData.map((compSet: any) => compSet.name)
      setFormData(prev => ({
        ...prev,
        [field]: value,
        selectedSecondaryHotels: secondaryNames,
        selectedPrimaryHotels: []
      }))

      // Clear compSet error when compSet is selected
      if (formErrors.compSet) {
        setFormErrors(prev => ({ ...prev, compSet: '' }))
      }
    } else if (field === 'compSet' && value === 'primary') {
      // When switching to primary, select all primary hotels by default
      const primaryNames = primaryHotelsData.map((compSet: any) => compSet.name)
      setFormData(prev => ({
        ...prev,
        [field]: value,
        selectedPrimaryHotels: primaryNames,
        selectedSecondaryHotels: []
      }))

      // Clear compSet error when compSet is selected
      if (formErrors.compSet) {
        setFormErrors(prev => ({ ...prev, compSet: '' }))
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleAddRecipient = () => {
    if (formData.newRecipient && !formData.recipients.includes(formData.newRecipient)) {
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, prev.newRecipient],
        newRecipient: ''
      }))

      // Clear recipients error when a recipient is added
      if (formErrors.recipients) {
        setFormErrors(prev => ({ ...prev, recipients: '' }))
      }
    }
  }

  const handleRemoveRecipient = (email: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(recipient => recipient !== email)
    }))

    // Clear recipients error when a recipient is removed (if there are still recipients)
    if (formErrors.recipients && formData.recipients.length > 1) {
      setFormErrors(prev => ({ ...prev, recipients: '' }))
    }
  }

  // Form validation function
  const validateForm = () => {
    const errors = {
      channels: '',
      compSet: '',
      guests: '',
      los: '',
      startDate: '',
      endDate: '',
      recipients: '',
      general: ''
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

    // Validate primary hotels selection
    if (formData.compSet === 'primary' && (!formData.selectedPrimaryHotels || formData.selectedPrimaryHotels.length === 0)) {
      errors.compSet = 'Please select at least one primary hotel'
    }

    // Validate secondary hotels selection
    if (formData.compSet === 'secondary' && (!formData.selectedSecondaryHotels || formData.selectedSecondaryHotels.length === 0)) {
      errors.compSet = 'Please select at least one secondary hotel'
    }

    setFormErrors(errors)

    // Return true if no errors
    return Object.values(errors).every(error => error === '')
  }

  // Check shops limit function
  const checkShopsLimit = (): boolean => {
    if (!packageDetails) {
      console.warn('Package details not available')
      return true // Allow generation if package details are not available
    }

    // Calculate date difference
    if (!formData.startDate || !formData.endDate) {
      return true // Allow if dates are not set (should be caught by validation)
    }

    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    const timeDiff = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24))

    // Get properties count
    let properties: number[] = []
    if (formData.compSet === 'primary') {
      const primaryPropertyIds = primaryHotelsData
        .filter(hotel => formData.selectedPrimaryHotels.includes(hotel.name))
        .map(hotel => hotel.propertyID)
      properties.push(...primaryPropertyIds)
    } else {
      const secondaryPropertyIds = secondaryHotelsData
        .filter(hotel => formData.selectedSecondaryHotels.includes(hotel.name))
        .map(hotel => hotel.propertyID)
      properties.push(...secondaryPropertyIds)
    }

    // Add selected property
    if (selectedProperty?.hmid) {
      properties.push(selectedProperty.hmid)
    }

    // Get channels
    const channels = [...formData.selectedChannels]

    // Check if user has monthly package or is existing user
    if (packageDetails.displayName === 'Monthly' || packageDetails.isExistingUser) {
      return true
    }

    // Calculate RRDs that will be used
    const rrdsUsed = (properties.length + 1) * channels.length * (diffDays + 1)

    // Check if request exceeds credit limit
    if ((rrdsUsed + totalShopsConsumedYearly) > totalShopsAlloted) {
      return false
    }

    return true
  }

  const handleGenerate = async () => {
    // Validate form before proceeding
    if (!validateForm()) {
      return // Don't proceed if validation fails
    }

    // Email validation
    if (formData.recipients.length === 0) {
      setFormErrors(prev => ({ ...prev, recipients: 'Please add at least one recipient email' }))
      return
    }

    // Calculate date difference
    if (!formData.startDate || !formData.endDate) {
      return
    }

    // Start loading
    setIsGenerating(true)

    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    const timeDiff = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24))

    // Prepare property validation object
    const propertyValidation = {
      Properties: [] as number[],
      Channel: [] as string[],
      SID: selectedProperty?.sid,
      SelectedHMID: selectedProperty?.hmid,
      SelectedName: selectedProperty?.name
    }

    // Add selected properties based on compSet
    if (formData.compSet === 'primary') {
      const primaryPropertyIds = primaryHotelsData
        .filter(hotel => formData.selectedPrimaryHotels.includes(hotel.name))
        .map(hotel => hotel.propertyID)
      propertyValidation.Properties.push(...primaryPropertyIds)
    } else {
      const secondaryPropertyIds = secondaryHotelsData
        .filter(hotel => formData.selectedSecondaryHotels.includes(hotel.name))
        .map(hotel => hotel.propertyID)
      propertyValidation.Properties.push(...secondaryPropertyIds)
    }

    // Add selected property
    if (selectedProperty?.hmid) {
      propertyValidation.Properties.push(selectedProperty.hmid)
    }

    // Add selected channels
    propertyValidation.Channel = [...formData.selectedChannels]

    // Validate that at least one compset is selected
    if (propertyValidation.Properties.length === 0) {
      setFormErrors(prev => ({ ...prev, compSet: 'Select at least one compset!' }))
      setIsGenerating(false)
      return
    }

    try {
      // Check shops limit before calling checkMappingValidation
      const isConsumedHigher = checkShopsLimit()
      debugger;
      if (isConsumedHigher) {
        // Call CheckMappingValidation API
        const mappingResponse = await checkMappingValidation(propertyValidation)

        // Stop loading after API response
        setIsGenerating(false)

        if (mappingResponse.status) {
          // Show missing notification if mapping validation fails
          setMissingNotificationData(mappingResponse.body || [])
          setShowMissingNotification(true)
          // Close the modal so user can see the missing notification
          setIsModalOpen(false)
          return
        }

        // If mapping validation passes, proceed with report generation
        await generateOnDemandReport(diffDays)
        // Close the modal after successful report generation
        setIsModalOpen(false)
      } else {
        // Credit limit exceeded - show snackbar and stop loading
        setIsGenerating(false)
        setSnackbarMessage("Your request exceeds the current credit limit. Please purchase more credits or modify the report generation criteria to proceed.")
        setSnackbarType('error')
        setShowSnackbar(true)
      }

    } catch (error) {
      console.error('Error during report generation:', error)
      setFormErrors(prev => ({ ...prev, general: 'Something went wrong, please try again!' }))
      setIsGenerating(false)
    }
  }

  const generateOnDemandReport = async (diffDays: number) => {
    if (!formData.startDate || !formData.endDate || !userDetails) {
      return
    }

    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)

    // Format start date with timezone
    const currentDate = new Date(startDate)
    const formattedDateToday = currentDate.toISOString().split('T')[0] + 'T00:00:00'
    const newDate = new Date(formattedDateToday)

    // Get timezone offset
    const timezoneOffset = -newDate.getTimezoneOffset()
    const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60)
    const offsetMinutes = Math.abs(timezoneOffset) % 60
    const offsetSign = timezoneOffset > 0 ? '-' : '+'
    const formattedOffset = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`

    const formattedDate = newDate.toISOString().split('.')[0]
    const dateStringWithTimezone = `${formattedDate}${formattedOffset}`
    const dateFirst = new Date(dateStringWithTimezone)

    // Prepare request model
    const requestModel = {
      SID: selectedProperty?.sid,
      ContactId: userDetails.userId,
      ContactName: userDetails.firstName + ' ' + userDetails.lastName,
      Name: userDetails.firstName + ' ' + userDetails.lastName,
      FirstCheckInDate: dateFirst,
      LOS: parseInt(formData.los),
      Occupancy: parseInt(formData.guests),
      EmailIds: formData.recipients,
      Properties: [] as number[],
      Sources: [] as string[],
      ReportSource: 'DownloadReport',
      IsILOSApplicable: false, // Set based on your business logic
      DaysOfData: diffDays + 1
    }

    // Add selected properties
    if (formData.compSet === 'primary') {
      const primaryPropertyIds = primaryHotelsData
        .filter(hotel => formData.selectedPrimaryHotels.includes(hotel.name))
        .map(hotel => hotel.propertyID)
      requestModel.Properties.push(...primaryPropertyIds)
    } else {
      const secondaryPropertyIds = secondaryHotelsData
        .filter(hotel => formData.selectedSecondaryHotels.includes(hotel.name))
        .map(hotel => hotel.propertyID)
      requestModel.Properties.push(...secondaryPropertyIds)
    }

    // Add selected property
    if (selectedProperty?.hmid) {
      requestModel.Properties.push(selectedProperty.hmid)
    }

    // Add selected channels
    requestModel.Sources = [...formData.selectedChannels]

    try {
      const response = await generateOndemandReport(requestModel)

      if (response.status) {
        if (response.body != null && response.body === 0) {
          console.log("Data is not returned from BrokerAPI")
        }

        // Close modal and show success
        setIsModalOpen(false)
        setShowSnackbar(true)

        // Reset form
        resetForm()

        // Refresh reports data to show the new report
        if (startDate && endDate) {
          fetchReportsDataWithDates(startDate, endDate)
        } else {
          fetchReportsData()
        }

      } else {
        setFormErrors(prev => ({ ...prev, general: 'Something went wrong, please try again!' }))
      }
    } catch (error) {
      console.error('Error generating report:', error)
      setFormErrors(prev => ({ ...prev, general: 'Something went wrong, please try again!' }))
    }
  }

  const resetForm = () => {
    setFormData({
      selectedChannels: [] as string[],
      compSet: 'primary',
      selectedPrimaryHotels: [] as string[],
      selectedSecondaryHotels: [] as string[],
      guests: '1',
      los: '1',
      startDate: undefined,
      endDate: undefined,
      recipients: userDetails?.email ? [userDetails.email] : [] as string[],
      newRecipient: ''
    })
    setIsChannelsOpen(false)
    setIsPrimaryHotelsOpen(false)
    setIsSecondaryHotelsOpen(false)
    setIsGuestsOpen(false)
    setIsLosOpen(false)
    setIsStartDateOpen(false)
    setIsEndDateOpen(false)
    setFormErrors({
      channels: '',
      compSet: '',
      guests: '',
      los: '',
      startDate: '',
      endDate: '',
      recipients: '',
      general: ''
    })
  }

  // Handle missing notification back button
  const handleMissingNotificationBack = () => {
    setShowMissingNotification(false)
    setMissingNotificationData([])
    // Reopen the modal with previous values
    setIsModalOpen(true)
  }

  // Handle missing notification submit button
  const handleMissingNotificationSubmit = async () => {
    if (!formData.startDate || !formData.endDate) {
      return
    }

    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    const timeDiff = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24))

    try {
      await generateOnDemandReport(diffDays)
      setShowMissingNotification(false)
      setMissingNotificationData([])
    } catch (error) {
      console.error('Error generating report:', error)
      setFormErrors(prev => ({ ...prev, general: 'Something went wrong, please try again!' }))
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    // Clear all search values
    setSearchValue('')
    setPrimarySearchValue('')
    setSecondarySearchValue('')
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
      recipients: userDetails?.email ? [userDetails.email] : [] as string[],
      newRecipient: ''
    })
    setIsChannelsOpen(false)
    setIsPrimaryHotelsOpen(false)
    setIsSecondaryHotelsOpen(false)
    setIsGuestsOpen(false)
    setIsLosOpen(false)
    setIsStartDateOpen(false)
    setIsEndDateOpen(false)
    setFormErrors({
      channels: '',
      compSet: '',
      guests: '',
      los: '',
      startDate: '',
      endDate: '',
      recipients: '',
      general: ''
    })
  }

  // Handle channel selection
  const handleChannelToggle = (channel: string) => {
    setFormData(prev => {
      let newChannels = [...prev.selectedChannels]

      if (channel === 'Select All') {
        // Get currently filtered channels
        const currentFilteredChannels = channelsData.filter(c =>
          c.toLowerCase().includes(searchValue.toLowerCase())
        )

        // Check if all filtered channels are selected
        const allFilteredSelected = currentFilteredChannels.every(c => newChannels.includes(c))

        if (allFilteredSelected) {
          // If all filtered channels are selected, deselect them
          newChannels = newChannels.filter(c => !currentFilteredChannels.includes(c))
        } else {
          // Select all filtered channels
          const channelsToAdd = currentFilteredChannels.filter(c => !newChannels.includes(c))
          newChannels = [...newChannels, ...channelsToAdd]
        }
      } else {
        // Handle individual channel selection
        if (newChannels.includes(channel)) {
          // Remove channel if already selected
          newChannels = newChannels.filter(c => c !== channel)
        } else {
          // Add channel if not selected
          newChannels.push(channel)
        }
      }

      return { ...prev, selectedChannels: newChannels }
    })

    // Clear channels error when a channel is selected
    if (formErrors.channels) {
      setFormErrors(prev => ({ ...prev, channels: '' }))
    }
  }

  // Check if a channel should be checked
  const isChannelSelected = (channel: string) => {
    return formData.selectedChannels.includes(channel)
  }

  // Handle primary hotel selection
  const handlePrimaryHotelToggle = (hotel: string) => {
    setFormData(prev => {
      let newHotels = [...prev.selectedPrimaryHotels]

      if (hotel === 'Select All') {
        // Get currently filtered hotels
        const currentFilteredHotels = filteredPrimaryHotels.map(h => h.name)

        // Check if all filtered hotels are already selected
        const allFilteredSelected = currentFilteredHotels.every(hotelName =>
          newHotels.includes(hotelName)
        )

        if (allFilteredSelected) {
          // Deselect all filtered hotels
          newHotels = newHotels.filter(h => !currentFilteredHotels.includes(h))
        } else {
          // Select all filtered hotels
          currentFilteredHotels.forEach(hotelName => {
            if (!newHotels.includes(hotelName)) {
              newHotels.push(hotelName)
            }
          })
        }
      } else {
        // Handle individual hotel selection
        if (newHotels.includes(hotel)) {
          // Remove hotel if already selected
          newHotels = newHotels.filter(h => h !== hotel)
        } else {
          // Add hotel if not selected
          newHotels.push(hotel)
        }
      }

      return { ...prev, selectedPrimaryHotels: newHotels }
    })

    // Clear compSet error when primary hotels are selected
    if (formErrors.compSet) {
      setFormErrors(prev => ({ ...prev, compSet: '' }))
    }
  }

  // Handle secondary hotel selection
  const handleSecondaryHotelToggle = (hotel: string) => {
    setFormData(prev => {
      let newHotels = [...prev.selectedSecondaryHotels]

      if (hotel === 'Select All') {
        // Get currently filtered hotels
        const currentFilteredHotels = filteredSecondaryHotels.map(h => h.name)

        // Check if all filtered hotels are already selected
        const allFilteredSelected = currentFilteredHotels.every(hotelName =>
          newHotels.includes(hotelName)
        )

        if (allFilteredSelected) {
          // Deselect all filtered hotels
          newHotels = newHotels.filter(h => !currentFilteredHotels.includes(h))
        } else {
          // Select all filtered hotels
          currentFilteredHotels.forEach(hotelName => {
            if (!newHotels.includes(hotelName)) {
              newHotels.push(hotelName)
            }
          })
        }
      } else {
        // Handle individual hotel selection
        if (newHotels.includes(hotel)) {
          // Remove hotel if already selected
          newHotels = newHotels.filter(h => h !== hotel)
        } else {
          // Add hotel if not selected
          newHotels.push(hotel)
        }
      }

      return { ...prev, selectedSecondaryHotels: newHotels }
    })

    // Clear compSet error when secondary hotels are selected
    if (formErrors.compSet) {
      setFormErrors(prev => ({ ...prev, compSet: '' }))
    }
  }

  // Check if a primary hotel should be checked
  const isPrimaryHotelSelected = (hotel: string) => {
    return formData.selectedPrimaryHotels.includes(hotel)
  }

  // Check if a secondary hotel should be checked
  const isSecondaryHotelSelected = (hotel: string) => {
    return formData.selectedSecondaryHotels.includes(hotel)
  }

  // Snackbar functions
  const handleSnackbarOk = () => {
    setShowSnackbar(false)
    // Show second snackbar after 4 seconds
    // setTimeout(() => {
    //   setShowSecondSnackbar(true)
    // }, 4000)
  }

  const handleSecondSnackbarClose = () => {
    setShowSecondSnackbar(false)
  }

  // Date validation functions
  const handleStartDateSelect = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, startDate: date }))

    // Close the calendar popover
    setIsStartDateOpen(false)

    // Clear errors when start date is selected
    if (formErrors.startDate) {
      setFormErrors(prev => ({ ...prev, startDate: '' }))
    }

    // Implement Angular logic for maxEndDate calculation
    if (date) {
      const date365 = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
      const calculatedMaxEndDate = new Date(date)
      calculatedMaxEndDate.setDate(calculatedMaxEndDate.getDate() + 90)

      if (calculatedMaxEndDate > date365) {
        setMaxEndDate(date365)
      } else {
        setMaxEndDate(calculatedMaxEndDate)
      }
    } else {
      const nextYear = new Date(today)
      nextYear.setFullYear(nextYear.getFullYear() + 1)
      setMaxEndDate(nextYear)
    }

    // Set maxDate to 1 year from today for start date selection
    const nextYear = new Date(today)
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    setMaxDate(nextYear)

    // If end date exists and is before the new start date, clear end date
    if (date && formData.endDate && formData.endDate < date) {
      setFormData(prev => ({ ...prev, endDate: undefined }))
    }
  }

  const handleEndDateSelect = (date: Date | undefined) => {
    // Validate that end date is not before start date
    if (date && formData.startDate && date < formData.startDate) {
      return
    }

    setFormData(prev => ({ ...prev, endDate: date }))

    // Clear form error when end date is selected
    if (formErrors.endDate) {
      setFormErrors(prev => ({ ...prev, endDate: '' }))
    }

    // Set maxDate to 1 year from today for start date selection
    const nextYear = new Date(today)
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    setMaxDate(nextYear)

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

  // Handle download report data
  const handleDownloadReportData = async (reportId: number) => {
    try {
      setDownloadingReportId(reportId)
      setShowDownloadPopup(true)
      // Get user data from hooks
      const detailData = {
        reportId: reportId,
        recipientEmail: userDetails?.email || '',
        propertyName: selectedProperty?.name || '',
        userName: userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : ''
      }

      // Call the API
      const response = await generateAndMailReportCSV(detailData)

      if (response.status) {

      }
    } catch (error) {
      console.error('Error generating report CSV:', error)
    } finally {
      setDownloadingReportId(null)
    }
  }

  // Handle download popup close
  const handleDownloadPopupClose = () => {
    setShowDownloadPopup(false)
  }

  // Handle channel search
  const handleChannelSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value)
  }

  // Clear search when dropdown closes
  const handleChannelsDropdownClose = () => {
    setIsChannelsOpen(false)
    setSearchValue('')
  }

  // Filter channels based on search
  const filteredChannels = channelsData.filter(channel =>
    channel.toLowerCase().includes(searchValue.toLowerCase())
  )

  // Handle primary compset search
  const handlePrimarySearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrimarySearchValue(event.target.value)
  }

  // Handle secondary compset search
  const handleSecondarySearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSecondarySearchValue(event.target.value)
  }

  // Handle primary hotels dropdown toggle
  const handlePrimaryHotelsToggle = () => {
    if (isPrimaryHotelsOpen) {
      // Closing - clear search
      setIsPrimaryHotelsOpen(false)
      setPrimarySearchValue('')
    } else {
      // Opening - clear search and open
      setPrimarySearchValue('')
      setIsPrimaryHotelsOpen(true)
    }
  }

  // Handle secondary hotels dropdown toggle
  const handleSecondaryHotelsToggle = () => {
    if (isSecondaryHotelsOpen) {
      // Closing - clear search
      setIsSecondaryHotelsOpen(false)
      setSecondarySearchValue('')
    } else {
      // Opening - clear search and open
      setSecondarySearchValue('')
      setIsSecondaryHotelsOpen(true)
    }
  }

  // Filter primary compsets based on search
  const filteredPrimaryHotels = primaryHotelsData.filter(hotel =>
    hotel.name.toLowerCase().includes(primarySearchValue.toLowerCase())
  )

  // Filter secondary compsets based on search
  const filteredSecondaryHotels = secondaryHotelsData.filter(hotel =>
    hotel.name.toLowerCase().includes(secondarySearchValue.toLowerCase())
  )


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
                          const reportStatus = determineReportStatus(report)

                          return (
                            <React.Fragment key={report.reportID}>
                              <div
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
                                        className={`flex items-center gap-2 ${report.reportID === 999999999 ? 'cursor-default' : 'cursor-pointer group'}`}
                                        onClick={report.reportID === 999999999 ? undefined : () => onReportData(report.reportID, index)}
                                      >
                                        <span className={`${report.reportID === 999999999 ? 'text-gray-500' : 'text-blue-600 group-hover:text-blue-800'} font-medium inline-block min-w-[60px]`}>
                                          {report.reportID === 999999999 ? "##" : report.reportID}
                                        </span>
                                        {report.reportID !== 999999999 && (
                                          <div className="w-4 h-4 border border-blue-600 dark:border-blue-600 rounded-full flex items-center justify-center group-hover:border-blue-700 transition-colors flex-shrink-0">
                                            {isExpanded ? (
                                              <ChevronUp className="w-2.5 h-2.5 text-blue-600 group-hover:text-blue-700" strokeWidth="2.5" />
                                            ) : (
                                              <ChevronDown className="w-2.5 h-2.5 text-blue-600 group-hover:text-blue-700" strokeWidth="2.5" />
                                            )}
                                          </div>
                                        )}
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
                                  <span className={`text-sm font-medium ${reportStatus === "Generated"
                                    ? "text-green-600"
                                    : reportStatus === "Error"
                                      ? "text-red-600"
                                      : "text-orange-500"
                                    }`}>
                                    {reportStatus}
                                  </span>
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
                                    {report.isDetailDataEnable && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-8 w-8 ${reportStatus !== "Generated" ? "opacity-50 cursor-not-allowed" : ""}`}
                                            disabled={reportStatus !== "Generated" || downloadingReportId === report.reportID}
                                            onClick={() => handleDownloadReportData(report.reportID)}
                                          >
                                            {downloadingReportId === report.reportID ? (
                                              <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                              <FileSpreadsheet className="w-4 h-4" />
                                            )}
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-black text-white border-black text-xs px-2 py-1">
                                          <p>Download Raw Data</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
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
                                      {/* Report ID / Schedule Name */}
                                      <div className="col-span-3" style={{ marginLeft: '60px' }}>
                                        {report.generatedBy !== 'Batch' ? (
                                          <>
                                            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Report Id</h4>
                                            <p className="text-black dark:text-black font-semibold">{report.reportID}</p>
                                          </>
                                        ) : (
                                          <>
                                            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Schedule name</h4>
                                            <p className="text-black dark:text-black font-semibold">{report.scheduleName}</p>
                                          </>
                                        )}
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
                            </React.Fragment>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto z-[999]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-black">Generate On Demand Report</DialogTitle>
          </DialogHeader>

          {/* General Error Display */}
          {formErrors.general && (
            <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {formErrors.general}
            </div>
          )}

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
                    onClick={() => isChannelsOpen ? handleChannelsDropdownClose() : setIsChannelsOpen(true)}
                    disabled={isLoadingChannels}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none ${isLoadingChannels
                      ? 'bg-gray-100 cursor-not-allowed opacity-60'
                      : 'bg-white hover:bg-gray-50'
                      }`}
                  >
                    <span className="truncate">
                      {isLoadingChannels ? (
                        <span className="flex items-center">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading channels...
                        </span>
                      ) : formData.selectedChannels.length === 0
                        ? "0 channels selected"
                        : formData.selectedChannels.length === channelsData.length
                          ? "All Channels"
                          : formData.selectedChannels.length === 1
                            ? formData.selectedChannels[0]
                            : `${formData.selectedChannels[0]} + ${formData.selectedChannels.length - 1}`
                      }
                    </span>
                    {!isLoadingChannels && (
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isChannelsOpen ? 'rotate-180' : ''}`} />
                    )}
                  </button>

                  {isChannelsOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {isLoadingChannels ? (
                        <div className="flex items-center justify-center px-3 py-4">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          <span className="text-sm text-gray-500">Loading channels...</span>
                        </div>
                      ) : (
                        <>
                          {/* Search Input - Hidden for now */}
                          <div className="p-3 border-b border-gray-200 hidden">
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search Channel"
                                value={searchValue}
                                onChange={handleChannelSearch}
                                className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                              />
                              <div className="absolute right-2 top-2.5">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Warning for disabled channels */}
                          {isAnyDisabledChannel && (
                            <div className="p-3 bg-yellow-50 border-b border-yellow-200">
                              <div className="flex items-center">
                                <div className="w-4 h-4 mr-2">
                                  <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="text-sm text-yellow-800">
                                  Few channels are not available due to maintenance activity
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Channel Options */}
                          <div className="max-h-40 overflow-y-auto">
                            {/* Select All Option */}
                            <div className="border-b border-gray-200">
                              <label className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={filteredChannels.length > 0 && filteredChannels.every(channel => formData.selectedChannels.includes(channel))}
                                  onChange={() => handleChannelToggle('Select All')}
                                  className="w-4 h-4 mr-3 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                                />
                                <span className="text-sm text-gray-900 font-medium">All Channels</span>
                              </label>
                            </div>
                            {filteredChannels.map((channel) => {
                              const isDisabled = disabledChannels.includes(channel)
                              return (
                                <label
                                  key={channel}
                                  className={`flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChannelSelected(channel)}
                                    onChange={() => !isDisabled && handleChannelToggle(channel)}
                                    disabled={isDisabled}
                                    className="w-4 h-4 mr-3 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                                  />
                                  <span className="text-sm text-gray-900 font-medium truncate" title={channel}>
                                    {channel.length > 32 ? `${channel.substring(0, 32)}...` : channel}
                                  </span>
                                  {isDisabled && (
                                    <div className="w-4 h-4 ml-2">
                                      <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                </label>
                              )
                            })}
                          </div>
                        </>
                      )}
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
                      className={`flex items-center space-x-2 text-sm text-gray-700 ${isLoadingCompSet ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                        }`}
                      onClick={isLoadingCompSet ? undefined : handlePrimaryHotelsToggle}
                    >
                      <span className="flex items-center">
                        {isLoadingCompSet ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading properties...
                          </>
                        ) : (
                          `Primary (${formData.selectedPrimaryHotels.length})`
                        )}
                      </span>
                      {!isLoadingCompSet && (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </Label>

                    {/* Primary Hotels Dropdown */}
                    {isPrimaryHotelsOpen && (
                      <div className="absolute z-50 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto min-w-80">
                        {isLoadingCompSet ? (
                          <div className="flex items-center justify-center px-3 py-4">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            <span className="text-sm text-gray-500">Loading compsets...</span>
                          </div>
                        ) : (
                          <>
                            {/* Search Input */}
                            <div className="p-3 border-b border-gray-200 hidden">
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Search"
                                  value={primarySearchValue}
                                  onChange={handlePrimarySearch}
                                  className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => e.stopPropagation()}
                                />
                                <div className="absolute right-2 top-2.5">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                  </svg>
                                </div>
                              </div>
                            </div>

                            {/* Hotel Options */}
                            <div className="max-h-40 overflow-y-auto">
                              {/* Select All Option */}
                              <div className="border-b border-gray-200">
                                <label className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={formData.selectedPrimaryHotels.length === filteredPrimaryHotels.length && filteredPrimaryHotels.length > 0}
                                    onChange={() => handlePrimaryHotelToggle('Select All')}
                                    className="w-4 h-4 mr-3 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                                  />
                                  <span className="text-sm text-gray-900 font-medium">All Primary Hotels</span>
                                </label>
                              </div>
                              {filteredPrimaryHotels.map((hotel, index) => (
                                <label
                                  key={`primary-${hotel.propertyID}-${hotel.name}-${index}`}
                                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isPrimaryHotelSelected(hotel.name)}
                                    onChange={() => handlePrimaryHotelToggle(hotel.name)}
                                    className="w-4 h-4 mr-3 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                                  />
                                  <span className="text-sm text-gray-900 font-medium truncate" title={hotel.name}>
                                    {hotel.name.length > 32 ? `${hotel.name.substring(0, 32)}...` : hotel.name}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 relative" ref={secondaryHotelsRef}>
                    <RadioGroupItem value="secondary" id="secondary" />
                    <Label
                      htmlFor="secondary"
                      className={`flex items-center space-x-2 text-sm text-gray-700 ${isLoadingCompSet ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                        }`}
                      onClick={isLoadingCompSet ? undefined : handleSecondaryHotelsToggle}
                    >
                      <span className="flex items-center">
                        {isLoadingCompSet ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading properties...
                          </>
                        ) : (
                          `Secondary (${formData.selectedSecondaryHotels.length})`
                        )}
                      </span>
                      {!isLoadingCompSet && (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </Label>

                    {/* Secondary Hotels Dropdown */}
                    {isSecondaryHotelsOpen && (
                      <div className="absolute z-50 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto min-w-80">
                        {isLoadingCompSet ? (
                          <div className="flex items-center justify-center px-3 py-4">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            <span className="text-sm text-gray-500">Loading compsets...</span>
                          </div>
                        ) : (
                          <>
                            {/* Search Input */}
                            <div className="p-3 border-b border-gray-200 hidden">
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Search"
                                  value={secondarySearchValue}
                                  onChange={handleSecondarySearch}
                                  className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => e.stopPropagation()}
                                />
                                <div className="absolute right-2 top-2.5">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                  </svg>
                                </div>
                              </div>
                            </div>

                            {/* Hotel Options */}
                            <div className="max-h-40 overflow-y-auto">
                              {/* Select All Option */}
                              <div className="border-b border-gray-200">
                                <label className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={formData.selectedSecondaryHotels.length === filteredSecondaryHotels.length && filteredSecondaryHotels.length > 0}
                                    onChange={() => handleSecondaryHotelToggle('Select All')}
                                    className="w-4 h-4 mr-3 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                                  />
                                  <span className="text-sm text-gray-900 font-medium">All Secondary Hotels</span>
                                </label>
                              </div>
                              {filteredSecondaryHotels.map((hotel, index) => (
                                <label
                                  key={`secondary-${hotel.propertyID}-${hotel.name}-${index}`}
                                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSecondaryHotelSelected(hotel.name)}
                                    onChange={() => handleSecondaryHotelToggle(hotel.name)}
                                    className="w-4 h-4 mr-3 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                                  />
                                  <span className="text-sm text-gray-900 font-medium truncate" title={hotel.name}>
                                    {hotel.name.length > 32 ? `${hotel.name.substring(0, 32)}...` : hotel.name}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </RadioGroup>
                {formErrors.compSet && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.compSet}</p>
                )}
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
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((number) => (
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
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((number) => (
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
                    Start Date<span className="text-red-500 ml-1">*</span>
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
                    <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={handleStartDateSelect}
                        numberOfMonths={1}
                        initialFocus
                        disabled={(date) => {
                          const todayStart = new Date()
                          todayStart.setHours(0, 0, 0, 0)
                          const dateToCheck = new Date(date)
                          dateToCheck.setHours(0, 0, 0, 0)
                          return dateToCheck < todayStart
                        }}
                        fromDate={(() => {
                          const todayStart = new Date()
                          todayStart.setHours(0, 0, 0, 0)
                          return todayStart
                        })()}
                        toDate={maxDate}
                      />
                    </PopoverContent>
                  </Popover>
                  {formErrors.startDate && (
                    <p className="text-red-500 text-xs mt-1 ml-4">&nbsp;Start date required</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 mb-1">
                    End Date<span className="text-red-500 ml-1">*</span>
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
                    <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={handleEndDateSelect}
                        numberOfMonths={1}
                        initialFocus
                        disabled={(date) => {
                          const todayStart = new Date()
                          todayStart.setHours(0, 0, 0, 0)
                          const dateToCheck = new Date(date)
                          dateToCheck.setHours(0, 0, 0, 0)
                          const isBeforeToday = dateToCheck < todayStart
                          const isBeforeStartDate = formData.startDate && dateToCheck < formData.startDate
                          return Boolean(isBeforeToday || isBeforeStartDate)
                        }}
                        fromDate={formData.startDate || (() => {
                          const todayStart = new Date()
                          todayStart.setHours(0, 0, 0, 0)
                          return todayStart
                        })()}
                        toDate={maxEndDate}
                      />
                    </PopoverContent>
                  </Popover>
                  {formErrors.endDate && (
                    <p className="text-red-500 text-xs mt-1 ml-4">&nbsp;End date required</p>
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
                      <span className="text-sm text-gray-900 font-medium truncate">{email}</span>
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
                  {formErrors.recipients && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.recipients}</p>
                  )}
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
              disabled={isGenerating}
              className="h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <span className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </span>
              ) : (
                'Generate'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* First Snackbar */}
      {showSnackbar && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[999]">
          <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 min-w-96 ${snackbarType === 'error'
            ? 'bg-red-600 text-white'
            : snackbarType === 'warning'
              ? 'bg-yellow-600 text-white'
              : 'bg-blue-600 text-white'
            }`}>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                {snackbarType === 'error' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : snackbarType === 'warning' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium">
                {snackbarMessage || 'Preparing your report... please wait. Processing large data may take some time.'}
              </span>
            </div>
            <Button
              onClick={handleSnackbarOk}
              variant="outline"
              size="sm"
              className={`px-4 py-1 h-8 text-sm font-medium ${snackbarType === 'error'
                ? 'bg-white text-red-600 border-white hover:bg-gray-100'
                : snackbarType === 'warning'
                  ? 'bg-white text-yellow-600 border-white hover:bg-gray-100'
                  : 'bg-white text-blue-600 border-white hover:bg-gray-100'
                }`}
            >
              OK
            </Button>
          </div>
        </div>
      )}

      {/* Second Snackbar */}
      {showSecondSnackbar && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[999]">
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

      {/* Download Report Data Popup */}
      {showDownloadPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="row">
                <div className="col heading text-lg font-semibold text-gray-900 mb-4">Report Preparation Underway</div>
              </div>
              <div className="message text-gray-700 mb-6">
                <br />
                <br />
                Your custom report is currently being prepared. Expect an email with the download
                link within the next 15 minutes. Thank you for your patience!
                <br />
                <br />
              </div>
              <div className="popup_footer flex justify-center">
                <button
                  type="button"
                  className="btn btn-primary bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  onClick={handleDownloadPopupClose}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Missing Configuration Notification Popup */}
      {showMissingNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4" style={{ width: '875px' }}>
            <div className="p-6">
              <div className="row mb-4">
                <div className="col heading text-lg font-semibold text-gray-900">Missing Configuration Notification</div>
                <div className="salogan text-sm text-gray-700 mt-2">
                  Please note that the rates for the below property-channel combination(s) will not be
                  available due to missing configurations. Click on the 'Submit' button to generate an on-demand. For more
                  details, please contact <a href="mailto:help@rategain.com" className="text-blue-600 hover:underline">help@rategain.com</a>
                </div>
              </div>

              <div className="history_table overflow-y-auto" style={{ maxHeight: '270px' }}>
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Channel</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Property</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missingNotificationData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                          {item.brandName || item.channelName || 'N/A'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                          {item.name || item.propertyName || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="popup_footer flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleMissingNotificationBack}
                  className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleMissingNotificationSubmit}
                  className="h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </TooltipProvider>
  )
}
