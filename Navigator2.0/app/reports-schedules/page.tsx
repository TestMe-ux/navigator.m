"use client"

import { useState, useEffect } from "react"
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
import { Download, RefreshCw, ChevronDown, ChevronUp, ArrowUpDown, FileSpreadsheet, ArrowUp, ArrowDown, CheckCircle, Loader2, CalendarIcon, X, Settings, Edit, Trash2 } from "lucide-react"
import { ReportsFilterBar } from "@/components/reports-filter-bar"
import { ScheduledReportsHeader } from "@/components/navigator/scheduled-reports-header"
import { format } from "date-fns"
import { useRef } from "react"
import { getScheduleReportData, getSummaryData } from "@/lib/reports"
import { getChannelList, getCompleteCompSet, getCurrencyList, getTimeZoneList, checkMapping, getScheduleReportDataBySid, saveReportData, getEditScheduleData, deleteScheduleReport } from "@/lib/reports"
import { useSelectedProperty } from "@/hooks/use-local-storage"
import { LocalStorageService } from "@/lib/localstorage"

// TypeScript interfaces for data structures
interface clsCompset {
  Name: string
  Address: string
  Country: string
  City: string
  property_id: number
  LLimit: string
  ULimit: string
  status: number
  rank: number
  brand: string
  NewPropertyID: string
}

interface UnMappedData {
  PropertyName: string
  channelName: string
  propertyId: number
  channelId: number
}

interface RepParameter {
  UAdvanceShop: string
  UNoofcheckindates: string
  ULOS: string
  UOccupancy: string
  UCurrency: string
  UFrequency: string
  UDays: string
  UWeeks: string
  UTimezone: string
  UDeliveryTime: string
  ExpiryDate: string
  URecipientlist: string
  UChannelName: string
  UPropertyname: string
}

interface PropertyData {
  propertyID: string
  propertyName: string
  address: string
  country: string
  city: string
  higH_VAR: number
  loW_VAR: number
  sortOrder: number
  status: string
}

interface EditScheduleModel {
  occupancy: number
  channels: string
  startDate: Date
  endDate: Date
  advanceshop: number
  hotel_name: string
  noofcheckindates: number
  los: string
  currency: string
  frequency: number
  daysOfDelivery: string
  weeksOfDelivery: string
  deliveryTimeZone: string
  deliveryTime: string
  emailRecipient: string
  status: number
  benchMarkChannel: number
  channelName: string
  pricewatchispercent: boolean
  displayName: string
  banchMarkOndemand: number
  odChannels: string
  odChannelNames: string
  isilos: boolean
  propertyDataList: PropertyData[]
  universalId: number
}



// Function to format time with leading zero
const formatTime = (value: number): string => {
  return value.toString().padStart(2, '0')
}

// Function to generate delivery time options (without AM/PM)
const generateTimeOptions = (): string[] => {
  const timeOptions: string[] = []

  // Generate times from 12:00 to 11:45 (12-hour format without AM/PM)
  // Start with 12:00, then 1:00-11:45
  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

  for (const hour of hours) {
    for (let min = 0; min < 60; min += 15) {
      const timeValue = formatTime(hour) + ':' + formatTime(min)
      timeOptions.push(timeValue)
    }
  }

  return timeOptions
}

// Generate delivery times dynamically
const deliveryTimesData = generateTimeOptions()

// Mock data for time zones
const timeZonesData = [
  'UTC+05:30', 'UTC+00:00', 'UTC+01:00', 'UTC+02:00', 'UTC+03:00', 'UTC+04:00',
  'UTC+05:00', 'UTC+06:00', 'UTC+07:00', 'UTC+08:00', 'UTC+09:00', 'UTC+10:00',
  'UTC-05:00', 'UTC-04:00', 'UTC-03:00', 'UTC-02:00', 'UTC-01:00', 'UTC-06:00',
  'UTC-07:00', 'UTC-08:00', 'UTC-09:00', 'UTC-10:00', 'UTC-11:00', 'UTC-12:00'
]

// Days of the week data
const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// Interface for schedule report data
interface ScheduleReportData {
  optimaScheduleId: number | null;
  pghReportScheduleId: number;
  scheduleName: string;
  daysOfDelivery: string;
  rrdPerReport: number;
  totalRRDs: number;
  status: string;
  deleted: boolean;
  deliveryFrequency: number;
  weeksOfDelivery: number | null;
  shortDaysName: string;
  weekOfDay: string;
  dayofDel1: string;
  endDate: string;
  universalID: number;
  daysOfData: number;
  startDate: string;
}

// Mock data for scheduled reports (using the new API data structure)
const scheduledReportsData: ScheduleReportData[] = [
  {
    optimaScheduleId: null,
    pghReportScheduleId: 233802,
    scheduleName: "Mobile Subscription",
    daysOfDelivery: "NotSet",
    rrdPerReport: 2100,
    totalRRDs: 0,
    status: "Active",
    deleted: false,
    deliveryFrequency: 5,
    weeksOfDelivery: null,
    shortDaysName: "",
    weekOfDay: "",
    dayofDel1: "NotSet",
    endDate: "2025-10-15T00:00:00",
    universalID: 2812085,
    daysOfData: 30,
    startDate: "2025-08-12T00:00:00"
  },
  {
    optimaScheduleId: null,
    pghReportScheduleId: 231482,
    scheduleName: "Mobile Subscription",
    daysOfDelivery: "NotSet",
    rrdPerReport: 30,
    totalRRDs: 0,
    status: "Active",
    deleted: false,
    deliveryFrequency: 5,
    weeksOfDelivery: null,
    shortDaysName: "",
    weekOfDay: "",
    dayofDel1: "NotSet",
    endDate: "2025-10-15T00:00:00",
    universalID: 2812085,
    daysOfData: 5,
    startDate: "2025-06-24T00:00:00"
  }
]

export default function ScheduledReportsPage() {
  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingCycle, setLoadingCycle] = useState(1)
  const [selectedProperty] = useSelectedProperty()
  // API data states
  const [scheduleData, setScheduleData] = useState<ScheduleReportData[]>([])
  const [countOfData, setCountOfData] = useState(0)
  const [apiError, setApiError] = useState<string | null>(null)

  // Currency data state
  const [currencyData, setCurrencyData] = useState<string[]>([])
  const [channelsData, setChannelsData] = useState<any[]>([])
  const [primaryHotelsData, setPrimaryHotelsData] = useState<any[]>([])
  const [secondaryHotelsData, setSecondaryHotelsData] = useState<any[]>([])

  // Timezone data state
  const [timezonesData, setTimezonesData] = useState<Array<{ id: string, displayName: string }>>([])
  const [isLoadingTimezone, setIsLoadingTimezone] = useState(false)
  const [timezoneSearchValue, setTimezoneSearchValue] = useState('')
  const [timezoneTooltip, setTimezoneTooltip] = useState('')

  // Edit schedule data state
  const [reportId, setReportId] = useState<string>('')
  const [editScheduleData, setEditScheduleData] = useState<EditScheduleModel | null>(null)
  const [isLoadingEditData, setIsLoadingEditData] = useState(false)
  const [pendingEditData, setPendingEditData] = useState<EditScheduleModel | null>(null)

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteUniversalId, setDeleteUniversalId] = useState<number>(0)
  const [deleteReportId, setDeleteReportId] = useState<number>(0)

  // Loading states for create modal
  const [isLoadingChannels, setIsLoadingChannels] = useState(false)
  const [isLoadingCompSet, setIsLoadingCompSet] = useState(false)
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(false)

  // Cache states to avoid re-fetching data

  // Existing states
  const [reportType, setReportType] = useState("All")
  const [dateRange, setDateRange] = useState<{ start: Date | undefined; end: Date | undefined }>({ start: undefined, end: undefined })

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null })



  // Modal state for edit schedule
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<any>(null)

  // Modal state for create schedule
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Modal state for mapping conflicts popup
  const [isMappingConflictsOpen, setIsMappingConflictsOpen] = useState(false)
  const [mappingConflictsData, setMappingConflictsData] = useState<any[]>([])

  // Store form data for mapping conflicts flow
  const [pendingFormData, setPendingFormData] = useState<any>(null)

  // Form data state for schedule settings
  const [scheduleFormData, setScheduleFormData] = useState({
    selectedChannels: ['All Channels'],
    compSet: 'primary',
    selectedPrimaryHotels: ['All Primary Hotels'],
    selectedSecondaryHotels: ['All Secondary Hotels'],
    guests: '1',
    los: ['1'] as string[], // Changed to array for multi-select
    startDate: new Date(),
    endDate: undefined as Date | undefined,
    recipients: ['rahul.kumar@rategain.com'],
    newRecipient: '',
    scheduleName: '',
    frequency: '1',
    time: '06:00',
    weekSelection: ''
  })

  // Form data state for edit schedule
  const [editFormData, setEditFormData] = useState({
    selectedChannels: ['All Channels'],
    compSet: 'primary',
    selectedPrimaryHotels: [] as string[], // Will store hmid (hotel IDs)
    selectedSecondaryHotels: [] as string[], // Will store hmid (hotel IDs)
    guests: '1',
    los: ['1'] as string[], // Changed to array for multi-select
    advanceShopDays: '0',
    checkInDates: '60',
    currency: 'THB',
    startDate: new Date(),
    endDate: undefined as Date | undefined,
    recipients: ['rahul.kumar@rategain.com'],
    newRecipient: '',
    scheduleName: '',
    frequency: '1',
    time: '06:00',
    selectedDaysOfWeek: [] as string[],
    deliveryTime: '12:00',
    amPm: '1',
    timeZone: '',
    weekSelection: ''
  })

  // Form data state for create schedule
  const [createFormData, setCreateFormData] = useState<{
    selectedChannels: string[]
    compSet: string
    selectedPrimaryHotels: string[]
    selectedSecondaryHotels: string[]
    guests: string
    los: string[]
    advanceShopDays: string
    checkInDates: string
    currency: string
    startDate: Date
    endDate: Date | undefined
    recipients: string[]
    newRecipient: string
    scheduleName: string
    frequency: string
    time: string
    selectedDaysOfWeek: string[]
    deliveryTime: string
    amPm: string
    timeZone: string
    weekSelection: string
  }>({
    selectedChannels: [] as string[],
    compSet: 'primary',
    selectedPrimaryHotels: [] as string[], // Will store hmid (hotel IDs)
    selectedSecondaryHotels: [] as string[], // Will store hmid (hotel IDs)
    guests: '1',
    los: ['1'] as string[], // Changed to array for multi-select
    advanceShopDays: '0',
    checkInDates: '1',
    currency: 'USD',
    startDate: new Date(),
    endDate: undefined as Date | undefined,
    recipients: [] as string[],
    newRecipient: '',
    scheduleName: '',
    frequency: '1',
    time: '06:00',
    selectedDaysOfWeek: [] as string[],
    deliveryTime: '12:00',
    amPm: '1',
    timeZone: '',
    weekSelection: ''
  })

  // Date validation state
  const [dateError, setDateError] = useState('')

  // Form validation state
  const [formErrors, setFormErrors] = useState({
    channels: '',
    guests: '',
    los: '',
    startDate: '',
    endDate: '',
    scheduleName: ''
  })

  // Form validation state for edit
  const [editFormErrors, setEditFormErrors] = useState({
    channels: '',
    guests: '',
    los: '',
    startDate: '',
    endDate: '',
    scheduleName: '',
    advanceShopDays: '',
    checkInDates: '',
    currency: '',
    deliveryTime: '',
    timeZone: '',
    frequency: '',
    daysOfWeek: '',
    weekSelection: '',
    recipients: ''
  })

  // Form validation state for create
  const [createFormErrors, setCreateFormErrors] = useState({
    channels: '',
    compSet: '',
    guests: '',
    los: '',
    startDate: '',
    endDate: '',
    scheduleName: '',
    advanceShopDays: '',
    checkInDates: '',
    currency: '',
    deliveryTime: '',
    timeZone: '',
    frequency: '',
    daysOfWeek: '',
    weekSelection: '',
    recipients: ''
  })

  // Search states for create modal
  const [createSearchValue, setCreateSearchValue] = useState('')
  const [createPrimarySearchValue, setCreatePrimarySearchValue] = useState('')
  const [createSecondarySearchValue, setCreateSecondarySearchValue] = useState('')

  // Date validation state for edit
  const [editDateError, setEditDateError] = useState('')

  // Snackbar state
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [showEditSuccessSnackbar, setShowEditSuccessSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'warning'>('success')

  // State for dropdowns
  const [isChannelsOpen, setIsChannelsOpen] = useState(false)
  const [isPrimaryHotelsOpen, setIsPrimaryHotelsOpen] = useState(false)
  const [isSecondaryHotelsOpen, setIsSecondaryHotelsOpen] = useState(false)
  const [isGuestsOpen, setIsGuestsOpen] = useState(false)
  const [isLosOpen, setIsLosOpen] = useState(false)
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false)
  const [isFrequencyOpen, setIsFrequencyOpen] = useState(false)
  const [isWeekSelectionOpen, setIsWeekSelectionOpen] = useState(false)
  const [isDeliveryTimeOpen, setIsDeliveryTimeOpen] = useState(false)
  const [isTimeZoneOpen, setIsTimeZoneOpen] = useState(false)

  // State for calendar popovers
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)

  // State for edit modal dropdowns
  const [isEditChannelsOpen, setIsEditChannelsOpen] = useState(false)
  const [isEditPrimaryHotelsOpen, setIsEditPrimaryHotelsOpen] = useState(false)
  const [isEditSecondaryHotelsOpen, setIsEditSecondaryHotelsOpen] = useState(false)
  const [isEditGuestsOpen, setIsEditGuestsOpen] = useState(false)
  const [isEditLosOpen, setIsEditLosOpen] = useState(false)
  const [isEditFrequencyOpen, setIsEditFrequencyOpen] = useState(false)
  const [isEditWeekSelectionOpen, setIsEditWeekSelectionOpen] = useState(false)
  const [isEditAdvanceShopDaysOpen, setIsEditAdvanceShopDaysOpen] = useState(false)
  const [isEditCheckInDatesOpen, setIsEditCheckInDatesOpen] = useState(false)
  const [isEditCurrencyOpen, setIsEditCurrencyOpen] = useState(false)
  const [isEditDeliveryTimeOpen, setIsEditDeliveryTimeOpen] = useState(false)
  const [isEditTimeZoneOpen, setIsEditTimeZoneOpen] = useState(false)

  // State for edit modal calendar popovers
  const [isEditStartDateOpen, setIsEditStartDateOpen] = useState(false)
  const [isEditEndDateOpen, setIsEditEndDateOpen] = useState(false)
  const channelsRef = useRef<HTMLDivElement>(null)
  const primaryHotelsRef = useRef<HTMLDivElement>(null)
  const secondaryHotelsRef = useRef<HTMLDivElement>(null)
  const guestsRef = useRef<HTMLDivElement>(null)
  const losRef = useRef<HTMLDivElement>(null)
  const currencyRef = useRef<HTMLDivElement>(null)
  const frequencyRef = useRef<HTMLDivElement>(null)
  const weekSelectionRef = useRef<HTMLDivElement>(null)
  const deliveryTimeRef = useRef<HTMLDivElement>(null)
  const timeZoneRef = useRef<HTMLDivElement>(null)

  // Refs for edit modal dropdowns
  const editChannelsRef = useRef<HTMLDivElement>(null)
  const editPrimaryHotelsRef = useRef<HTMLDivElement>(null)
  const editSecondaryHotelsRef = useRef<HTMLDivElement>(null)
  const editGuestsRef = useRef<HTMLDivElement>(null)
  const editLosRef = useRef<HTMLDivElement>(null)
  const editFrequencyRef = useRef<HTMLDivElement>(null)
  const editWeekSelectionRef = useRef<HTMLDivElement>(null)
  const editAdvanceShopDaysRef = useRef<HTMLDivElement>(null)
  const editCheckInDatesRef = useRef<HTMLDivElement>(null)
  const editCurrencyRef = useRef<HTMLDivElement>(null)
  const editDeliveryTimeRef = useRef<HTMLDivElement>(null)
  const editTimeZoneRef = useRef<HTMLDivElement>(null)

  // Currency search state
  const [currencySearchTerm, setCurrencySearchTerm] = useState('')

  // Time Zone search state
  const [timeZoneSearchTerm, setTimeZoneSearchTerm] = useState('')

  // Generate delivery times dynamically (12-hour format)
  const deliveryTimesData = generateTimeOptions()

  // Mock data for time zones
  const timeZonesData = [
    'UTC+05:30 (IST)', 'UTC+07:00 (ICT)', 'UTC+08:00 (CST)', 'UTC+09:00 (JST)',
    'UTC+00:00 (GMT)', 'UTC-05:00 (EST)', 'UTC-08:00 (PST)', 'UTC-09:00 (AKST)'
  ]

  // Days of the week
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Day values mapping (matching Angular implementation)
  const dayValuesMap: { [key: string]: string } = {
    'Sun': '1',
    'Mon': '2',
    'Tue': '3',
    'Wed': '4',
    'Thu': '5',
    'Fri': '6',
    'Sat': '7'
  }

  // Channels search state
  const [createChannelsSearchValue, setCreateChannelsSearchValue] = useState('')

  // Date validation state
  const [createDateError, setCreateDateError] = useState('')
  const [maxCreateDate, setMaxCreateDate] = useState<Date | undefined>(undefined)
  const [maxCreateEndDate, setMaxCreateEndDate] = useState<Date | undefined>(undefined)

  // Summary data state variables
  const [summaryData, setSummaryData] = useState<any>(null)
  const [packageType, setPackageType] = useState<string>('')
  const [consumedShops, setConsumedShops] = useState<number>(0)
  const [isExisting, setIsExisting] = useState<boolean>(false)
  const [compsetCount, setCompsetCount] = useState<number>(0)
  const [channelCount, setChannelCount] = useState<number>(0)
  const [totalShopsConsumedMonthly, setTotalShopsConsumedMonthly] = useState<number>(0)
  const [totalShopsConsumedYearly, setTotalShopsConsumedYearly] = useState<number>(0)
  const [totalShopsAlloted, setTotalShopsAlloted] = useState<number>(0)
  const [consumedShopsBatch, setConsumedShopsBatch] = useState<number>(0)
  const [consumedShopsOnDemand, setConsumedShopsOnDemand] = useState<number>(0)
  const [consumedShopsRTRR, setConsumedShopsRTRR] = useState<number>(0)
  const [CPEndDate, setCPEndDate] = useState<Date | null>(null)
  const [CPStartDate, setCPStartDate] = useState<Date | null>(null)

  // Initialize maxDate for date pickers
  useEffect(() => {
    const nextYear = new Date()
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    setMaxCreateDate(nextYear)
    setMaxCreateEndDate(nextYear)
  }, [])

  // Loading effect similar to My Account page
  useEffect(() => {
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

    // Simulate data loading (similar to My Account page)
    const loadingTimeout = setTimeout(() => {
      clearInterval(progressInterval)
      setLoadingProgress(100) // finish instantly
      setTimeout(() => {
        setIsLoading(false)
        setLoadingProgress(0) // reset for next load
      }, 300) // brief delay so user sees 100%
    }, 2000) // 2 seconds loading time

    return () => {
      clearInterval(progressInterval)
      clearTimeout(loadingTimeout)
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (channelsRef.current && !channelsRef.current.contains(event.target as Node)) {
        handleCreateChannelsDropdownClose()
      }
      if (primaryHotelsRef.current && !primaryHotelsRef.current.contains(event.target as Node)) {
        setIsPrimaryHotelsOpen(false)
        setCreatePrimarySearchValue('')
      }
      if (secondaryHotelsRef.current && !secondaryHotelsRef.current.contains(event.target as Node)) {
        setIsSecondaryHotelsOpen(false)
        setCreateSecondarySearchValue('')
      }
      if (guestsRef.current && !guestsRef.current.contains(event.target as Node)) {
        setIsGuestsOpen(false)
      }
      if (losRef.current && !losRef.current.contains(event.target as Node)) {
        setIsLosOpen(false)
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setIsCurrencyOpen(false)
        setCurrencySearchTerm('')
      }
      if (frequencyRef.current && !frequencyRef.current.contains(event.target as Node)) {
        setIsFrequencyOpen(false)
      }
      if (weekSelectionRef.current && !weekSelectionRef.current.contains(event.target as Node)) {
        setIsWeekSelectionOpen(false)
      }
      if (timeZoneRef.current && !timeZoneRef.current.contains(event.target as Node)) {
        setIsTimeZoneOpen(false)
        setTimeZoneSearchTerm('')
      }
      if (deliveryTimeRef.current && !deliveryTimeRef.current.contains(event.target as Node)) {
        setIsDeliveryTimeOpen(false)
      }

      // Edit modal dropdowns
      if (editChannelsRef.current && !editChannelsRef.current.contains(event.target as Node)) {
        setIsEditChannelsOpen(false)
      }
      if (editPrimaryHotelsRef.current && !editPrimaryHotelsRef.current.contains(event.target as Node)) {
        setIsEditPrimaryHotelsOpen(false)
      }
      if (editSecondaryHotelsRef.current && !editSecondaryHotelsRef.current.contains(event.target as Node)) {
        setIsEditSecondaryHotelsOpen(false)
      }
      if (editGuestsRef.current && !editGuestsRef.current.contains(event.target as Node)) {
        setIsEditGuestsOpen(false)
      }
      if (editLosRef.current && !editLosRef.current.contains(event.target as Node)) {
        setIsEditLosOpen(false)
      }
      if (editFrequencyRef.current && !editFrequencyRef.current.contains(event.target as Node)) {
        setIsEditFrequencyOpen(false)
      }
      if (editWeekSelectionRef.current && !editWeekSelectionRef.current.contains(event.target as Node)) {
        setIsEditWeekSelectionOpen(false)
      }
      if (editAdvanceShopDaysRef.current && !editAdvanceShopDaysRef.current.contains(event.target as Node)) {
        setIsEditAdvanceShopDaysOpen(false)
      }
      if (editCheckInDatesRef.current && !editCheckInDatesRef.current.contains(event.target as Node)) {
        setIsEditCheckInDatesOpen(false)
      }
      if (editCurrencyRef.current && !editCurrencyRef.current.contains(event.target as Node)) {
        setIsEditCurrencyOpen(false)
        setCurrencySearchTerm('')
      }
      if (editDeliveryTimeRef.current && !editDeliveryTimeRef.current.contains(event.target as Node)) {
        setIsEditDeliveryTimeOpen(false)
      }
      if (editTimeZoneRef.current && !editTimeZoneRef.current.contains(event.target as Node)) {
        setIsEditTimeZoneOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Fetch schedule report data from API
  const fetchScheduleData = async () => {
    try {

      setApiError(null)
      const response = await getScheduleReportData({ SID: selectedProperty?.sid || '' })

      if (response.status) {
        setCountOfData(response.body.length)
        setScheduleData(response.body)
      } else {
        setApiError('Failed to fetch schedule data')
      }
    } catch (error) {
      console.error('Error fetching schedule data:', error)
      setApiError('Error fetching schedule data')
    }
  }

  // Function to fetch summary data
  const fetchSummaryData = async () => {
    try {
      const response = await getSummaryData(selectedProperty?.sid?.toString() || '')
      if (response.status) {
        setSummaryData(response.body)
        const today = new Date()
        setCPEndDate(new Date(response.body.endDate))
        setCPStartDate(new Date(response.body.startDate))

        setPackageType(response.body.packageType)
        setConsumedShops(response.body.consumedShopsBatch + response.body.consumedShopsOnDemand + response.body.consumedShopsRTRR)
        setIsExisting(response.body.isExistingUser)
        setCompsetCount(response.body.compsetCount)
        setChannelCount(response.body.channelCount)

        setTotalShopsConsumedMonthly(response.body.consumedShopsBatch + response.body.consumedShopsOnDemand)
        setTotalShopsConsumedYearly(response.body.consumedShopsBatch + response.body.consumedShopsOnDemand + response.body.consumedShopsRTRR)
        setTotalShopsAlloted(response.body.totalShops)

        setConsumedShopsBatch(response.body.consumedShopsBatch)
        setConsumedShopsOnDemand(response.body.consumedShopsOnDemand)
        setConsumedShopsRTRR(response.body.consumedShopsRTRR)
      }
    } catch (error) {
      console.error('Error fetching summary data:', error)
    }
  }

  useEffect(() => {
    if (!selectedProperty?.sid) return
    fetchScheduleData()
    fetchSummaryData()
  }, [selectedProperty?.sid])


  // Handle filter changes
  const handleDateRangeChange = (startDate: Date | undefined, endDate: Date | undefined) => {
    setDateRange({ start: startDate, end: endDate })
    console.log('Date range changed:', { startDate, endDate })
  }

  const handleReportTypeChange = (newReportType: string) => {
    setReportType(newReportType)
    console.log('Report type changed:', newReportType)
  }

  // Function to fetch currency data
  const fetchCurrencyData = async () => {
    try {
      setIsLoadingCurrency(true)
      const response = await getCurrencyList()
      if (response && response.body) {
        setCurrencyData(response.body)
      }
    } catch (error) {
      console.error('Error fetching currency data:', error)
    } finally {
      setIsLoadingCurrency(false)
    }
  }

  // Function to fetch timezone data
  const fetchTimezoneData = async () => {
    try {
      setIsLoadingTimezone(true)
      const response = await getTimeZoneList()
      if (response && response.body) {
        // Ensure all timezone IDs are strings
        const timezonesWithStringIds = response.body.map((tz: any) => ({
          id: String(tz.id),
          displayName: tz.displayName
        }))
        setTimezonesData(timezonesWithStringIds)
      }
    } catch (error) {
      console.error('Error fetching timezone data:', error)
    } finally {
      setIsLoadingTimezone(false)
    }
  }

  // Function to fetch edit schedule data
  const fetchEditScheduleData = async (reportId: string): Promise<any> => {
    try {
      setIsLoadingEditData(true)
      const response = await getEditScheduleData(reportId)
      if (response && response.status && response.body) {
        const editModel: EditScheduleModel = response.body as EditScheduleModel
        setEditScheduleData(editModel)
        return editModel
      }
    } catch (error) {
      console.error('Error fetching edit schedule data:', error)
    } finally {
      setIsLoadingEditData(false)
    }
  }

  // Function to fetch channels data
  const fetchChannelsData = async () => {
    try {
      setIsLoadingChannels(true)

      const response = await getChannelList({
        SID: selectedProperty?.sid
      })

      if (response.status && response.body) {
        // Don't filter channels for edit modal - we need all channels to match with edit data
        setChannelsData(response.body)
      }
    } catch (error) {
      console.error('Error fetching channels data:', error)
      // Set default data if API fails
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

        // Select all primary options by default (store hmid instead of names)
        const primaryIds = primaryCompSets.map((compSet: any) => compSet.hmid)
        setCreateFormData(prev => ({
          ...prev,
          selectedPrimaryHotels: primaryIds,
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

  const handleCreateSchedule = () => {
    setIsCreateModalOpen(true)
    // Clear search values
    setCreateSearchValue('')
    setCreatePrimarySearchValue('')
    setCreateSecondarySearchValue('')
    // Reset form data to initial state (no default dates)
    setCreateFormData(prev => ({
      ...prev,
      startDate: new Date(),
      endDate: undefined
    }))
    // Load data every time modal opens
    fetchCurrencyData()
    fetchChannelsData()
    fetchCompSetData()
    fetchTimezoneData()
  }

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false)
    // Clear search values when modal closes
    setCreateSearchValue('')
    setCreatePrimarySearchValue('')
    setCreateSecondarySearchValue('')
    setCreateChannelsSearchValue('')
    setTimeZoneSearchTerm('')
    // Close all dropdowns
    setIsChannelsOpen(false)
    setIsPrimaryHotelsOpen(false)
    setIsSecondaryHotelsOpen(false)
    setIsGuestsOpen(false)
    setIsLosOpen(false)
    setIsCurrencyOpen(false)
    setIsFrequencyOpen(false)
    setIsWeekSelectionOpen(false)
    setIsDeliveryTimeOpen(false)
    setIsTimeZoneOpen(false)
    setIsStartDateOpen(false)
    setIsEndDateOpen(false)
    // Reset form data to initial state
    setCreateFormData({
      selectedChannels: [],
      compSet: 'primary',
      selectedPrimaryHotels: [],
      selectedSecondaryHotels: [],
      guests: '1',
      los: ['1'] as string[],
      advanceShopDays: '0',
      checkInDates: '1',
      currency: 'USD',
      startDate: new Date(),
      endDate: undefined,
      recipients: [],
      newRecipient: '',
      scheduleName: '',
      frequency: '1',
      time: '06:00',
      selectedDaysOfWeek: [],
      deliveryTime: '12:00',
      amPm: '1',
      timeZone: '',
      weekSelection: ''
    })
    // Clear form errors
    setCreateFormErrors({
      channels: '',
      compSet: '',
      guests: '',
      los: '',
      startDate: '',
      endDate: '',
      scheduleName: '',
      advanceShopDays: '',
      checkInDates: '',
      currency: '',
      deliveryTime: '',
      timeZone: '',
      frequency: '',
      daysOfWeek: '',
      weekSelection: '',
      recipients: ''
    })
  }

  // Helper functions for day names
  const getFullDayName = (dayName: string) => {
    const fullDayNames: { [key: string]: string } = {
      'Sun': 'Sunday',
      'Mon': 'Monday',
      'Tue': 'Tuesday',
      'Wed': 'Wednesday',
      'Thu': 'Thursday',
      'Fri': 'Friday',
      'Sat': 'Saturday',
    }
    return fullDayNames[dayName] || 'Invalid day value'
  }
  const getFullDayNamesForSelectedDays = (selectedDays: string[]) => {
    debugger;
    const fullDayNamesArray = selectedDays.map((selectedDay) => {
      // Map numeric values back to day abbreviations
      const reverseDayValuesMap: { [key: string]: string } = {
        '1': 'Sun',
        '2': 'Mon',
        '3': 'Tue',
        '4': 'Wed',
        '5': 'Thu',
        '6': 'Fri',
        '7': 'Sat'
      }

      const dayAbbreviation = reverseDayValuesMap[selectedDay]
      if (dayAbbreviation) {
        return getFullDayName(dayAbbreviation)
      }
      return 'Invalid day value'
    })
    return fullDayNamesArray
  }

  // Helper function to get day name from number (for Edit modal)
  const getDayName = (dayNumber: number): string => {
    const dayMap: { [key: number]: string } = {
      1: 'Sun',
      2: 'Mon',
      3: 'Tue',
      4: 'Wed',
      5: 'Thu',
      6: 'Fri',
      7: 'Sat'
    }
    return dayMap[dayNumber] || ''
  }

  // useEffect to handle channels and hotels data timing issue
  useEffect(() => {
    if (pendingEditData && channelsData.length > 0 && primaryHotelsData.length > 0 && isEditModalOpen) {
      console.log('Processing pending edit data with channels:', channelsData.length, 'and hotels:', primaryHotelsData.length)

      // Process channels like Angular implementation
      const selectedChannelNames: string[] = []
      if (pendingEditData.channels) {
        pendingEditData.channels.split(',').forEach((channelId: string) => {
          const trimmedId = channelId.trim()
          const filteredChannel = channelsData.find(x =>
            x.cid == trimmedId ||
            x.cid === parseInt(trimmedId) ||
            x.cid.toString() === trimmedId
          )
          if (filteredChannel) {
            selectedChannelNames.push(filteredChannel.name)
          }
        })
      }

      // Process hotel data
      let isSecondary = false
      const selectedPropertyIds: string[] = []
      const selectedPropertyNames: string[] = []

      if (pendingEditData.propertyDataList) {
        console.log('Processing pending property data list:', pendingEditData.propertyDataList)
        console.log('Available primary hotels:', primaryHotelsData.slice(0, 3))
        console.log('Available secondary hotels:', secondaryHotelsData.slice(0, 3))

        pendingEditData.propertyDataList.forEach((item: PropertyData) => {
          console.log('Processing pending property item:', item)
          // Find the property in our data to check if it's secondary
          const filteredItem = [...primaryHotelsData, ...secondaryHotelsData].find(x =>
            x.propertyID === parseInt(item.propertyID) ||
            x.hmid === parseInt(item.propertyID) ||
            x.propertyID?.toString() === item.propertyID ||
            x.hmid?.toString() === item.propertyID
          )
          console.log('Found matching item:', filteredItem)
          if (filteredItem) {
            isSecondary = filteredItem.isSecondary || false
            selectedPropertyIds.push(filteredItem.hmid)
            selectedPropertyNames.push(filteredItem.name)
            console.log('Added property:', { hmid: filteredItem.hmid, name: filteredItem.name, isSecondary })
          } else {
            console.log('No match found for propertyID:', item.propertyID)
            console.log('Available hotel IDs:', [...primaryHotelsData, ...secondaryHotelsData].map(h => ({ hmid: h.hmid, propertyID: h.propertyID })))
          }
        })
      }

      const compSet = isSecondary ? 'secondary' : 'primary'

      // Process days of delivery for retry
      const retrySelectedDaysOfWeek: string[] = []
      if (pendingEditData.daysOfDelivery) {
        console.log('Retry - Days of delivery from API:', pendingEditData.daysOfDelivery)
        pendingEditData.daysOfDelivery.split(',').forEach((dayNumber: string) => {
          console.log('Retry - Processing day number:', dayNumber)
          // Store the numeric value directly instead of converting to day name
          if (dayNumber.trim()) {
            retrySelectedDaysOfWeek.push(dayNumber.trim())
          }
        })
      }
      console.log('Retry - Selected days of week:', retrySelectedDaysOfWeek)

      console.log('Retry - Selected channel names:', selectedChannelNames)
      console.log('Retry - Selected property IDs:', selectedPropertyIds)
      console.log('Retry - CompSet:', compSet)
      console.log('Retry - Advance shop days from API:', pendingEditData.advanceshop)
      console.log('Retry - Days of delivery from API:', pendingEditData.daysOfDelivery)
      console.log('Retry - Selected days of week:', retrySelectedDaysOfWeek)

      // Update only the specific fields that need fixing
      setEditFormData(prev => ({
        ...prev,
        selectedChannels: selectedChannelNames,
        compSet: compSet,
        selectedPrimaryHotels: isSecondary ? [] : selectedPropertyIds,
        selectedSecondaryHotels: isSecondary ? selectedPropertyIds : [],
        selectedDaysOfWeek: retrySelectedDaysOfWeek,
        advanceShopDays: pendingEditData.advanceshop !== undefined && pendingEditData.advanceshop !== null ? pendingEditData.advanceshop.toString() : '7'
      }))

      // Clear pending data
      setPendingEditData(null)
    }
  }, [channelsData, primaryHotelsData, secondaryHotelsData, pendingEditData, isEditModalOpen])

  // Keep pendingFormData in sync with createFormData when mapping conflicts popup is open
  useEffect(() => {
    if (isMappingConflictsOpen && pendingFormData) {
      setPendingFormData(createFormData)
    }
  }, [createFormData, isMappingConflictsOpen])

  // Time conversion function for DeliveryTime
  const timeConvert = (time: string, modifier: string) => {
    let timeOfDelivery = time.split(':')[0]
    let minutes = time.split(':')[1]

    if (timeOfDelivery === '12') {
      timeOfDelivery = '00'
    }

    if (modifier === '2') { // PM
      timeOfDelivery = (parseInt(timeOfDelivery, 10) + 12).toString()
    }

    return timeOfDelivery + ':' + minutes
  }

  // Convert 24-hour format to 12-hour format without AM/PM (like Angular logic)
  const convertTo12HourFormatWithoutAmPm = (time: string): string => {
    const [hourStr, minuteStr] = time.split(':')
    let hour = parseInt(hourStr, 10)

    if (hour === 0) {
      hour = 12 // Convert 00 to 12
    }

    const hourFormatted = hour < 10 ? '0' + hour : hour
    return `${hourFormatted}:${minuteStr}`
  }

  // Convert 24-hour format to 12-hour format (like Angular logic)
  const convertTo12HourFormat = (time24: string): string => {
    let time = Number(time24.split(':')[0])
    let minutes = time24.split(':')[1]

    if (time > 12) {
      let t1 = time - 12
      let deliveryTime
      if (t1 > 9) {
        deliveryTime = (time - 12) + ":" + minutes
      } else {
        deliveryTime = "0" + (time - 12) + ":" + minutes
      }
      return deliveryTime
    } else {
      return convertTo12HourFormatWithoutAmPm(time24)
    }
  }

  // Get AM/PM from 24-hour time
  const getAmPmFromTime = (time24: string): string => {
    let time = Number(time24.split(':')[0])
    return time >= 12 ? '2' : '1' // '2' for PM, '1' for AM
  }

  // Date formatting function matching Angular GetdateFormat
  const getDateFormat = (date: any, format: string): string => {
    console.log('getDateFormat called with:', { date, format })
    const month = [
      ' ', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    let fromdate = new Date(date);
    console.log('Parsed date:', fromdate)

    const curr_daynumber = fromdate.getDay();
    const curr_day = fromdate.getDate();
    const curr_month = fromdate.getMonth() + 1;
    const curr_year = fromdate.getFullYear();

    let formatedDate: string;
    switch (format) {
      case 'MM/dd/yyyy':
        formatedDate = ((curr_month < 10) ? ('0' + curr_month) : curr_month) + '/' +
          ((curr_day < 10) ? ('0' + curr_day) : curr_day) + '/' + curr_year;
        break;
      case 'MMM/dd/yyyy':
        formatedDate = (month[curr_month] + '/' + curr_day + '/' + curr_year);
        break;
      case 'dd/MM/yyyy':
        formatedDate = ((curr_day < 10) ? ('0' + curr_day) : curr_day) + '/' +
          ((curr_month < 10) ? ('0' + curr_month) : curr_month) + '/' + curr_year;
        break;
      case 'dd-MM-yyyy':
        formatedDate = ((curr_day < 10) ? ('0' + curr_day) : curr_day) + '-' +
          ((curr_month < 10) ? ('0' + curr_month) : curr_month) + '-' + curr_year;
        break;
      case 'yyyy/MM/dd':
        formatedDate = curr_year + '/' +
          ((curr_month < 10) ? ('0' + curr_month) : curr_month) + '/' +
          ((curr_day < 10) ? ('0' + curr_day) : curr_day);
        break;
      case 'yyyy-MM-dd':
        formatedDate = curr_year + '-' +
          ((curr_month < 10) ? ('0' + curr_month) : curr_month) + '-' +
          ((curr_day < 10) ? ('0' + curr_day) : curr_day);
        break;
      case 'dd MMM\'yy':
        formatedDate = (curr_day + ' ' + month[curr_month] + '\'' + curr_year.toString().substring(2));
        if (weekday[curr_daynumber] === 'Sun' || weekday[curr_daynumber] === 'Sat') {
          formatedDate = '<b>' + formatedDate + '</b>';
        }
        break;
      case 'dd-MMM-yyyy':
        formatedDate = (curr_day + '-' + month[curr_month] + '-' + curr_year.toString());
        break;
      case 'yy-MM-dd':
        formatedDate = (curr_year.toString().substring(2) + '-' + curr_month + '-' + curr_day);
        break;
      default:
        formatedDate = (curr_day + ' ' + month[curr_month] + ' ' + curr_year);
        break;
    }

    console.log('Formatted date result:', formatedDate)
    return formatedDate;
  }

  // Timezone search handler
  const handleTimezoneSearch = (value: string) => {
    setTimezoneSearchValue(value)
  }

  // Timezone change handler
  const handleTimezoneChange = (timezoneId: string) => {
    const selectedTimezone = timezonesData.find(tz => tz.id === timezoneId)
    if (selectedTimezone) {
      setTimezoneTooltip(selectedTimezone.displayName)
    }
  }

  // Filtered timezones based on search
  const filteredTimezones = timezonesData.filter(timezone =>
    timezone.displayName.toLowerCase().includes(timezoneSearchValue.toLowerCase())
  )

  // Get schedule report data
  const refreshScheduleData = async () => {
    try {
      const sid = LocalStorageService.getSID()
      console.log('Refreshing schedule data with SID:', sid)
      const response = await getScheduleReportDataBySid(sid.toString())
      console.log('Refresh API response:', response)

      if (response.status) {
        console.log('Setting schedule data:', response.body)
        setScheduleData(response.body || [])
      } else {
        console.error('Failed to refresh schedule data:', response.message)
      }
    } catch (error) {
      console.error('Error fetching schedule report data:', error)
    }
  }

  // Delete confirmation handler
  const handleDeleteConfirmation = (universalId: number, reportId: number) => {
    console.log('Setting delete values - UniversalId:', universalId, 'ReportId:', reportId)
    setDeleteUniversalId(universalId)
    setDeleteReportId(reportId)
    setIsDeleteModalOpen(true)
  }

  // Delete schedule report
  const handleDeleteScheduleReport = async () => {
    try {
      console.log('Delete function called - Current state values:')
      console.log('deleteUniversalId:', deleteUniversalId)
      console.log('deleteReportId:', deleteReportId)
      console.log('Deleting report with UniversalId:', deleteUniversalId, 'ReportId:', deleteReportId)
      const response = await deleteScheduleReport(deleteUniversalId, deleteReportId)
      console.log('Delete API response:', response)

      if (response && response.status && response.body === "Success") {
        console.log('Delete successful, refreshing data...')
        // Close modal first
        setIsDeleteModalOpen(false)
        // Reset delete state
        setDeleteUniversalId(0)
        setDeleteReportId(0)
        // Refresh the data to remove the deleted row
        await refreshScheduleData()
        console.log('Data refresh completed')
      } else {
        console.error('Delete failed:', response)
        // Only show error message if deletion failed
        setSnackbarMessage("Something went wrong please try again!")
        setSnackbarType('error')
        setShowSnackbar(true)
      }
    } catch (error) {
      console.error("Error deleting schedule report:", error)
      setSnackbarMessage("Something went wrong please try again!")
      setSnackbarType('error')
      setShowSnackbar(true)
    }
  }

  // Create modal handlers
  const handleCreateChannelToggle = (channel: string) => {
    setCreateFormData(prev => {
      let newChannels = [...prev.selectedChannels]

      if (channel === 'Select All') {
        // Get currently filtered channels
        const currentFilteredChannels = channelsData.filter(c =>
          c.name.toLowerCase().includes(createChannelsSearchValue.toLowerCase())
        ).map(c => c.name)

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
        if (newChannels.includes(channel)) {
          newChannels = newChannels.filter(c => c !== channel)
        } else {
          newChannels.push(channel)
        }
      }

      return { ...prev, selectedChannels: newChannels }
    })

    // Clear channels error when a channel is selected
    if (createFormErrors.channels) {
      setCreateFormErrors(prev => ({ ...prev, channels: '' }))
    }
  }

  const handleCreatePrimaryHotelToggle = (hotel: string) => {
    setCreateFormData(prev => {
      let newHotels = [...prev.selectedPrimaryHotels]

      if (hotel === 'Select All') {
        // Get currently filtered hotels (use hmid)
        const currentFilteredHotels = filteredCreatePrimaryHotels.map(h => h.hmid)

        // Check if all filtered hotels are already selected
        const allFilteredSelected = currentFilteredHotels.every(hotelId =>
          newHotels.includes(hotelId)
        )

        if (allFilteredSelected) {
          // Deselect all filtered hotels
          newHotels = newHotels.filter(h => !currentFilteredHotels.includes(h))
        } else {
          // Select all filtered hotels
          currentFilteredHotels.forEach(hotelId => {
            if (!newHotels.includes(hotelId)) {
              newHotels.push(hotelId)
            }
          })
        }
      } else {
        // Handle individual hotel selection
        if (newHotels.includes(hotel)) {
          newHotels = newHotels.filter(h => h !== hotel)
        } else {
          newHotels.push(hotel)
        }
      }

      return { ...prev, selectedPrimaryHotels: newHotels }
    })

    // Clear compSet error when primary hotels are selected
    if (createFormErrors.compSet) {
      setCreateFormErrors(prev => ({ ...prev, compSet: '' }))
    }
  }

  const handleCreateSecondaryHotelToggle = (hotel: string) => {
    setCreateFormData(prev => {
      let newHotels = [...prev.selectedSecondaryHotels]

      if (hotel === 'Select All') {
        // Get currently filtered hotels (use hmid)
        const currentFilteredHotels = filteredCreateSecondaryHotels.map(h => h.hmid)

        // Check if all filtered hotels are already selected
        const allFilteredSelected = currentFilteredHotels.every(hotelId =>
          newHotels.includes(hotelId)
        )

        if (allFilteredSelected) {
          // Deselect all filtered hotels
          newHotels = newHotels.filter(h => !currentFilteredHotels.includes(h))
        } else {
          // Select all filtered hotels
          currentFilteredHotels.forEach(hotelId => {
            if (!newHotels.includes(hotelId)) {
              newHotels.push(hotelId)
            }
          })
        }
      } else {
        // Handle individual hotel selection
        if (newHotels.includes(hotel)) {
          newHotels = newHotels.filter(h => h !== hotel)
        } else {
          newHotels.push(hotel)
        }
      }

      return { ...prev, selectedSecondaryHotels: newHotels }
    })

    // Clear compSet error when secondary hotels are selected
    if (createFormErrors.compSet) {
      setCreateFormErrors(prev => ({ ...prev, compSet: '' }))
    }
  }

  // Handle primary hotels dropdown toggle
  const handleCreatePrimaryHotelsToggle = () => {
    if (isPrimaryHotelsOpen) {
      // Closing - clear search
      setIsPrimaryHotelsOpen(false)
      setCreatePrimarySearchValue('')
    } else {
      // Opening - clear search and open
      setCreatePrimarySearchValue('')
      setIsPrimaryHotelsOpen(true)
    }
  }

  // Handle secondary hotels dropdown toggle
  const handleCreateSecondaryHotelsToggle = () => {
    if (isSecondaryHotelsOpen) {
      // Closing - clear search
      setIsSecondaryHotelsOpen(false)
      setCreateSecondarySearchValue('')
    } else {
      // Opening - clear search and open
      setCreateSecondarySearchValue('')
      setIsSecondaryHotelsOpen(true)
    }
  }

  // Form handling function (copied from reports page)
  const handleFormChange = (field: string, value: string) => {
    if (field === 'compSet' && value === 'secondary') {
      // When switching to secondary, select all secondary hotels by default (store hmid)
      const secondaryIds = secondaryHotelsData.map((compSet: any) => compSet.hmid)
      setCreateFormData(prev => ({
        ...prev,
        [field]: value,
        selectedSecondaryHotels: secondaryIds,
        selectedPrimaryHotels: []
      }))

      // Clear compSet error when compSet is selected
      if (createFormErrors.compSet) {
        setCreateFormErrors(prev => ({ ...prev, compSet: '' }))
      }
    } else if (field === 'compSet' && value === 'primary') {
      // When switching to primary, select all primary hotels by default (store hmid)
      const primaryIds = primaryHotelsData.map((compSet: any) => compSet.hmid)
      setCreateFormData(prev => ({
        ...prev,
        [field]: value,
        selectedPrimaryHotels: primaryIds,
        selectedSecondaryHotels: []
      }))

      // Clear compSet error when compSet is selected
      if (createFormErrors.compSet) {
        setCreateFormErrors(prev => ({ ...prev, compSet: '' }))
      }
    } else {
      setCreateFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  // Handle primary search (copied from reports page)
  const handleCreatePrimarySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreatePrimarySearchValue(e.target.value)
  }

  // Handle secondary search (copied from reports page)
  const handleCreateSecondarySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateSecondarySearchValue(e.target.value)
  }

  // Handle channels search (copied from reports page)
  const handleCreateChannelsSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateChannelsSearchValue(e.target.value)
  }

  // Handle LOS multi-select (matching Angular onSelectionChange)
  const handleCreateLosSelection = (losValue: string) => {
    setCreateFormData(prev => {
      const currentLos = prev.los
      if (currentLos.includes(losValue)) {
        // Remove the value if it exists
        return { ...prev, los: currentLos.filter(los => los !== losValue) }
      } else {
        // Add the value if it doesn't exist
        return { ...prev, los: [...currentLos, losValue] }
      }
    })
  }

  // Handle LOS multi-select for Edit Schedule modal
  const handleEditLosSelection = (losValue: string) => {
    setEditFormData(prev => {
      const currentLos = prev.los
      if (currentLos.includes(losValue)) {
        // Remove the value if it exists
        return { ...prev, los: currentLos.filter(los => los !== losValue) }
      } else {
        // Add the value if it doesn't exist
        return { ...prev, los: [...currentLos, losValue] }
      }
    })
  }

  // Clear search when dropdown closes (copied from reports page)
  const handleCreateChannelsDropdownClose = () => {
    setIsChannelsOpen(false)
    setCreateChannelsSearchValue('')
  }

  // Check if a channel should be checked (copied from reports page)
  const isCreateChannelSelected = (channel: string) => {
    return createFormData.selectedChannels.includes(channel)
  }

  // Date selection handlers (copied from reports page)
  const handleCreateStartDateSelect = (date: Date | undefined) => {
    console.log('Start date selected:', date)
    setCreateFormData(prev => {
      const newData = { ...prev, startDate: date || new Date() }
      console.log('Updated form data:', newData)
      return newData
    })

    // Clear errors when start date is selected
    if (createFormErrors.startDate) {
      setCreateFormErrors(prev => ({ ...prev, startDate: '' }))
    }

    // Implement maxEndDate calculation logic
    if (date) {
      const maxEndDate = new Date(date)
      maxEndDate.setFullYear(maxEndDate.getFullYear() + 1)
      setMaxCreateEndDate(maxEndDate)
    }

    // Close the calendar popover
    setIsStartDateOpen(false)
  }

  const handleCreateEndDateSelect = (date: Date | undefined) => {
    console.log('End date selected:', date)
    setCreateFormData(prev => {
      const newData = { ...prev, endDate: date }
      console.log('Updated form data:', newData)
      return newData
    })
    setCreateDateError('')

    // Clear form error when end date is selected
    if (createFormErrors.endDate) {
      setCreateFormErrors(prev => ({ ...prev, endDate: '' }))
    }

    // Close the calendar popover
    setIsEndDateOpen(false)
  }

  // Handle frequency change (matching Angular logic)
  const handleCreateFrequencyChange = (frequency: string) => {
    setCreateFormData(prev => {
      const newData = { ...prev, frequency }

      // Reset week selection when frequency changes
      if (frequency === '3') {
        // Fortnightly - set default to first option
        newData.weekSelection = '1'
      } else if (frequency === '4') {
        // Monthly - set default to first option
        newData.weekSelection = '1'
      } else {
        // Daily or Weekly - clear week selection
        newData.weekSelection = ''
      }

      // Reset selectedDaysOfWeek when frequency changes to weekly or monthly
      if (frequency === '2' || frequency === '4') {
        newData.selectedDaysOfWeek = []
      }

      return newData
    })
  }

  // Handle frequency change for edit modal (matching Angular logic)
  const handleEditFrequencyChange = (frequency: string) => {
    setEditFormData(prev => {
      const newData = { ...prev, frequency }

      // Reset week selection when frequency changes
      if (frequency === '3') {
        // Fortnightly - set default to first option
        newData.weekSelection = '1'
      } else if (frequency === '4') {
        // Monthly - set default to first option
        newData.weekSelection = '1'
      } else {
        // Daily or Weekly - clear week selection
        newData.weekSelection = ''
      }

      // Reset selectedDaysOfWeek when frequency changes to weekly or monthly
      if (frequency === '2' || frequency === '4') {
        newData.selectedDaysOfWeek = []
      }

      return newData
    })
  }

  // Handle day toggle for days of the week (Create modal) - matching Angular logic
  const handleCreateDayToggle = (day: string) => {
    const dayValue = dayValuesMap[day]
    setCreateFormData(prev => {
      const currentDays = [...prev.selectedDaysOfWeek]
      const dayIndex = currentDays.indexOf(dayValue)

      if (prev.frequency === '2' || prev.frequency === '4') {
        // For weekly and monthly, single-select behavior
        if (dayIndex > -1) {
          currentDays.splice(dayIndex, 1)
        } else {
          // Clear the previous selection and select the current day
          return {
            ...prev,
            selectedDaysOfWeek: [dayValue]
          }
        }
      } else {
        // For other frequencies (daily, fortnightly), multi-select behavior
        if (dayIndex > -1) {
          currentDays.splice(dayIndex, 1)
        } else {
          currentDays.push(dayValue)
        }
      }

      // Sort the days numerically
      const sortedDays = currentDays.sort((a, b) => {
        const numA = parseInt(a, 10)
        const numB = parseInt(b, 10)
        return numA - numB
      })

      return {
        ...prev,
        selectedDaysOfWeek: sortedDays
      }
    })
    
    // Clear days of week error when a day is selected
    if (createFormErrors.daysOfWeek) {
      setCreateFormErrors(prev => ({ ...prev, daysOfWeek: '' }))
    }
  }

  // Create form validation function
  const validateCreateForm = () => {
    const errors = {
      channels: '',
      compSet: '',
      guests: '',
      los: '',
      startDate: '',
      endDate: '',
      scheduleName: '',
      advanceShopDays: '',
      checkInDates: '',
      currency: '',
      deliveryTime: '',
      timeZone: '',
      frequency: '',
      daysOfWeek: '',
      weekSelection: '',
      recipients: ''
    }

    // Validate schedule name
    if (!createFormData.scheduleName.trim()) {
      errors.scheduleName = 'Please enter a schedule name'
    }

    // Validate channels
    if (!createFormData.selectedChannels || createFormData.selectedChannels.length === 0) {
      errors.channels = 'Please select at least one channel'
    }

    // Validate guests
    if (!createFormData.guests) {
      errors.guests = 'Please select number of guests'
    }

    // Validate LOS
    if (!createFormData.los || createFormData.los.length === 0) {
      errors.los = 'Please select at least one length of stay'
    }

    // Validate currency
    if (!createFormData.currency) {
      errors.currency = 'Please select a currency'
    }

    // Validate advance shop days
    if (!createFormData.advanceShopDays.trim()) {
      errors.advanceShopDays = 'Please enter advance shop days'
    } else if (parseInt(createFormData.advanceShopDays) < 0 || parseInt(createFormData.advanceShopDays) > 30) {
      errors.advanceShopDays = 'Advance shop days must be between 0 and 30'
    }

    // Validate check-in dates
    if (!createFormData.checkInDates.trim()) {
      errors.checkInDates = 'Please enter number of check-in dates'
    } else if (parseInt(createFormData.checkInDates) <= 0 || parseInt(createFormData.checkInDates) > 365) {
      errors.checkInDates = 'No. of Check-in dates must be greater than 0'
    }

    // Validate start date
    if (!createFormData.startDate) {
      errors.startDate = 'Please select start date'
    }

    // Validate end date
    if (!createFormData.endDate) {
      errors.endDate = 'Please select end date'
    }

    // Validate frequency
    if (!createFormData.frequency) {
      errors.frequency = 'Please select frequency'
    }

    // Validate delivery time
    if (!createFormData.deliveryTime) {
      errors.deliveryTime = 'Please select delivery time'
    }

    // Validate time zone
    if (!createFormData.timeZone) {
      errors.timeZone = 'Please select time zone'
    }

    // Validate recipients
    if (!createFormData.recipients || createFormData.recipients.length === 0) {
      errors.recipients = 'Please add at least one recipient'
    }

    setCreateFormErrors(errors)

    // Return true if no errors
    return Object.values(errors).every(error => error === '')
  }

  // Check if a primary hotel should be checked (using hmid)
  const isCreatePrimaryHotelSelected = (hotel: any) => {
    // Check if all primary hotels are selected (when all hmid are selected)
    const allPrimaryIds = primaryHotelsData.map(h => h.hmid)
    const allSelected = allPrimaryIds.every(id => createFormData.selectedPrimaryHotels.includes(id))
    if (allSelected) {
      return true
    }
    return createFormData.selectedPrimaryHotels.includes(hotel.hmid)
  }

  // Check if a secondary hotel should be checked (using hmid)
  const isCreateSecondaryHotelSelected = (hotel: any) => {
    // Check if all secondary hotels are selected (when all hmid are selected)
    const allSecondaryIds = secondaryHotelsData.map(h => h.hmid)
    const allSelected = allSecondaryIds.every(id => createFormData.selectedSecondaryHotels.includes(id))
    if (allSelected) {
      return true
    }
    return createFormData.selectedSecondaryHotels.includes(hotel.hmid)
  }

  // Filter primary compsets based on search
  const filteredCreatePrimaryHotels = primaryHotelsData.filter(hotel =>
    hotel.name.toLowerCase().includes(createPrimarySearchValue.toLowerCase())
  )

  // Filter secondary compsets based on search
  const filteredCreateSecondaryHotels = secondaryHotelsData.filter(hotel =>
    hotel.name.toLowerCase().includes(createSecondarySearchValue.toLowerCase())
  )

  // Filter channels based on search
  const filteredCreateChannels = channelsData.filter(channel =>
    channel.name.toLowerCase().includes(createChannelsSearchValue.toLowerCase())
  )

  const handleRefresh = () => {
    console.log('Refreshing scheduled reports...')
    fetchScheduleData()
  }


  const handleEditSchedule = async (schedule: ScheduleReportData) => {
    setEditingSchedule(schedule)
    setReportId(schedule.pghReportScheduleId.toString()) // Use pghReportScheduleId as reportId

    // Load required data first and wait for completion
    await Promise.all([
      fetchChannelsData(),
      fetchCompSetData(),
      fetchTimezoneData(),
      fetchCurrencyData()
    ])

    console.log('All data loaded, proceeding with edit data...')

    // Load edit schedule data from API
    const editData = await fetchEditScheduleData(schedule.pghReportScheduleId.toString())

    console.log('Edit data from API:', editData)
    console.log('Edit data advanceshop:', editData?.advanceshop)
    console.log('Edit data daysOfDelivery:', editData?.daysOfDelivery)

    if (editData) {
      // Process channels like Angular implementation
      const selectedChannelNames: string[] = []
      console.log('Edit data channels:', editData.channels)
      console.log('Available channels data:', channelsData)
      console.log('First few channels:', channelsData.slice(0, 3))

      if (editData.channels && channelsData.length > 0) {
        editData.channels.split(',').forEach((channelId: string) => {
          const trimmedId = channelId.trim()
          console.log('Looking for channel ID:', trimmedId)
          // Try to match with cid (number or string)
          const filteredChannel = channelsData.find(x =>
            x.cid == trimmedId ||
            x.cid === parseInt(trimmedId) ||
            x.cid.toString() === trimmedId
          )
          console.log('Found channel:', filteredChannel)
          if (filteredChannel) {
            selectedChannelNames.push(filteredChannel.name)
          }
        })
      } else if (editData.channels && channelsData.length === 0) {
        console.log('Channels data not ready, storing for retry...')
        setPendingEditData(editData)
      }

      // Check if hotel data is ready
      if (editData.propertyDataList && primaryHotelsData.length === 0) {
        console.log('Hotel data not ready, storing for retry...')
        setPendingEditData(editData)
        // Continue with initial form data, retry will fix it
      }

      console.log('Selected channel names:', selectedChannelNames)

      // Process property data to determine if it's primary or secondary
      let isSecondary = false
      const selectedPropertyIds: string[] = []
      const selectedPropertyNames: string[] = []

      if (editData.propertyDataList) {
        console.log('Processing property data list:', editData.propertyDataList)
        console.log('Available primary hotels:', primaryHotelsData.slice(0, 3))
        console.log('Available secondary hotels:', secondaryHotelsData.slice(0, 3))

        editData.propertyDataList.forEach((item: PropertyData) => {
          console.log('Processing property item:', item)
          // Find the property in our data to check if it's secondary
          // Match using propertyID (string to number conversion)
          const filteredItem = [...primaryHotelsData, ...secondaryHotelsData].find(x =>
            x.propertyID === parseInt(item.propertyID) ||
            x.hmid === parseInt(item.propertyID) ||
            x.propertyID?.toString() === item.propertyID ||
            x.hmid?.toString() === item.propertyID
          )
          console.log('Found matching item:', filteredItem)
          if (filteredItem) {
            isSecondary = filteredItem.isSecondary || false
            selectedPropertyIds.push(filteredItem.hmid)
            selectedPropertyNames.push(filteredItem.name)
            console.log('Added property:', { hmid: filteredItem.hmid, name: filteredItem.name, isSecondary })
          } else {
            console.log('No match found for propertyID:', item.propertyID)
            console.log('Available hotel IDs:', [...primaryHotelsData, ...secondaryHotelsData].map(h => ({ hmid: h.hmid, propertyID: h.propertyID })))
          }
        })
      }

      // Determine compSet based on property data
      const compSet = isSecondary ? 'secondary' : 'primary'

      console.log('Property data processing:', {
        editDataPropertyList: editData.propertyDataList,
        isSecondary,
        selectedPropertyIds,
        selectedPropertyNames,
        compSet
      })

      // Process days of delivery
      const selectedDaysOfWeek: string[] = []
      console.log('Days of delivery from API:', editData.daysOfDelivery)
      if (editData.daysOfDelivery) {
        editData.daysOfDelivery.split(',').forEach((dayNumber: string) => {
          console.log('Processing day number:', dayNumber)
          // Store the numeric value directly instead of converting to day name
          if (dayNumber.trim()) {
            selectedDaysOfWeek.push(dayNumber.trim())
          }
        })
      }
      console.log('Selected days of week:', selectedDaysOfWeek)

      // Map the EditScheduleModel to editFormData
      const formData = {
        selectedChannels: selectedChannelNames,
        compSet: compSet,
        selectedPrimaryHotels: isSecondary ? [] : selectedPropertyIds,
        selectedSecondaryHotels: isSecondary ? selectedPropertyIds : [],
        guests: editData.occupancy ? editData.occupancy.toString() : '1',
        los: editData.los ? editData.los.split(',').map((l: string) => l.trim()) : ['1'],
        advanceShopDays: editData.advanceshop !== undefined && editData.advanceshop !== null ? editData.advanceshop.toString() : '7',
        checkInDates: editData.noofcheckindates ? editData.noofcheckindates.toString() : '30',
        currency: editData.currency || 'USD',
        startDate: editData.startDate ? new Date(editData.startDate) : new Date(),
        endDate: editData.endDate ? new Date(editData.endDate) : new Date(),
        recipients: editData.emailRecipient ? editData.emailRecipient.split(',').map((r: string) => r.trim()) : [],
        newRecipient: '',
        scheduleName: editData.hotel_name || schedule.scheduleName,
        frequency: editData.frequency ? editData.frequency.toString() : '1',
        time: '06:00',
        selectedDaysOfWeek: selectedDaysOfWeek,
        deliveryTime: editData.deliveryTime ? convertTo12HourFormat(editData.deliveryTime) : '12:00',
        amPm: editData.deliveryTime ? getAmPmFromTime(editData.deliveryTime) : '1',
        timeZone: editData.deliveryTimeZone || '',
        weekSelection: editData.weeksOfDelivery || ''
      }

      console.log('Setting edit form data:', formData)
      console.log('Selected primary hotels:', formData.selectedPrimaryHotels)
      console.log('Selected secondary hotels:', formData.selectedSecondaryHotels)
      console.log('Advance shop days from API:', editData.advanceshop)
      console.log('Advance shop days in form:', formData.advanceShopDays)

      setEditFormData(formData)
    } else {
      // Fallback to default values if API fails
      console.log('API failed or no edit data, using fallback values')
      setEditFormData({
        selectedChannels: ['Agoda', 'Booking.com', 'Expedia'],
        compSet: 'primary',
        selectedPrimaryHotels: [],
        selectedSecondaryHotels: [],
        guests: '1',
        los: ['1'] as string[],
        advanceShopDays: '7',
        checkInDates: '30',
        currency: 'USD',
        startDate: new Date(schedule.startDate),
        endDate: new Date(schedule.endDate),
        recipients: ['rahul.kumar@rategain.com', 'manager@hotel.com'],
        newRecipient: '',
        scheduleName: schedule.scheduleName,
        frequency: '1',
        time: '06:00',
        selectedDaysOfWeek: [],
        deliveryTime: '12:00',
        amPm: '1',
        timeZone: '',
        weekSelection: ''
      })
    }

    // Clear any existing errors
    setEditFormErrors({
      channels: '',
      guests: '',
      los: '',
      startDate: '',
      endDate: '',
      scheduleName: '',
      advanceShopDays: '',
      checkInDates: '',
      currency: '',
      deliveryTime: '',
      timeZone: '',
      frequency: '',
      daysOfWeek: '',
      weekSelection: '',
      recipients: ''
    })

    setIsEditModalOpen(true)
  }

  // Handle day selection (Edit modal)
  const handleEditDayToggle = (day: string) => {
    const dayValue = dayValuesMap[day]
    setEditFormData(prev => {
      const currentDays = [...prev.selectedDaysOfWeek]
      const dayIndex = currentDays.indexOf(dayValue)

      if (prev.frequency === '2' || prev.frequency === '4') {
        // For weekly and monthly, single-select behavior
        if (dayIndex > -1) {
          currentDays.splice(dayIndex, 1)
        } else {
          // Clear the previous selection and select the current day
          return {
            ...prev,
            selectedDaysOfWeek: [dayValue]
          }
        }
      } else {
        // For other frequencies (daily, fortnightly), multi-select behavior
        if (dayIndex > -1) {
          currentDays.splice(dayIndex, 1)
        } else {
          currentDays.push(dayValue)
        }
      }

      // Sort the days numerically
      const sortedDays = currentDays.sort((a, b) => {
        const numA = parseInt(a, 10)
        const numB = parseInt(b, 10)
        return numA - numB
      })

      return {
        ...prev,
        selectedDaysOfWeek: sortedDays
      }
    })
    
    // Clear days of week error when a day is selected
    if (editFormErrors.daysOfWeek) {
      setEditFormErrors(prev => ({ ...prev, daysOfWeek: '' }))
    }
  }

  // Form handling functions

  const handleAddRecipient = () => {
    if (scheduleFormData.newRecipient && !scheduleFormData.recipients.includes(scheduleFormData.newRecipient)) {
      setScheduleFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, prev.newRecipient],
        newRecipient: ''
      }))
    }
  }

  const handleRemoveRecipient = (email: string) => {
    setScheduleFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(recipient => recipient !== email)
    }))
  }

  // Form validation function
  const validateScheduleForm = () => {
    const errors = {
      channels: '',
      guests: '',
      los: '',
      startDate: '',
      endDate: '',
      scheduleName: ''
    }

    // Validate schedule name
    if (!scheduleFormData.scheduleName.trim()) {
      errors.scheduleName = 'Please enter a schedule name'
    }

    // Validate channels
    if (!scheduleFormData.selectedChannels || scheduleFormData.selectedChannels.length === 0) {
      errors.channels = 'Please select at least one channel'
    }

    // Validate guests
    if (!scheduleFormData.guests) {
      errors.guests = 'Please select number of guests'
    }

    // Validate LOS
    if (!scheduleFormData.los) {
      errors.los = 'Please select length of stay'
    }

    // Validate start date
    if (!scheduleFormData.startDate) {
      errors.startDate = 'Please select check-in start date'
    }

    // Validate end date
    if (!scheduleFormData.endDate) {
      errors.endDate = 'Please select check-in end date'
    }

    setFormErrors(errors)

    // Return true if no errors
    return Object.values(errors).every(error => error === '')
  }

  // Save new schedule report
  const saveNewScheduleReport = async (forceComplete: boolean) => {
    try {
      const userDetails = LocalStorageService.getUserDetails()

      // Use stored form data if available, otherwise use current form data
      const formDataToUse = pendingFormData || createFormData

      // Prepare schedule report data
      // Debug date values
      console.log('Date values:', { startDate: formDataToUse.startDate, endDate: formDataToUse.endDate })

      const scheduleReportData = {
        isAllDataMapped: false,
        ForceComplete: forceComplete,
        PropertyName: formDataToUse.scheduleName,
        Occupancy: parseInt(formDataToUse.guests),
        LOS: formDataToUse.los.join(','),
        AdvanceShop: parseInt(formDataToUse.advanceShopDays),
        Noofcheckindates: parseInt(formDataToUse.checkInDates),
        Currency: formDataToUse.currency,
        ILOS: false, // Default value
        Reportexpirydate: formDataToUse.endDate ? getDateFormat(formDataToUse.endDate, 'MM/dd/yyyy') : '',
        StartDate: formDataToUse.startDate ? getDateFormat(formDataToUse.startDate, 'MM/dd/yyyy') : '',
        Frequency: parseInt(formDataToUse.frequency),
        Days: formDataToUse.selectedDaysOfWeek.join(','),
        Weeks: formDataToUse.weekSelection && formDataToUse.weekSelection.trim() !== '' ? parseInt(formDataToUse.weekSelection) : null,
        DeliveryTime: timeConvert(formDataToUse.deliveryTime, formDataToUse.amPm),
        Timezone: String(formDataToUse.timeZone || ''),
        TimeZoneText: timezonesData.find(tz => tz.id === formDataToUse.timeZone)?.displayName || '',
        Channelsname: formDataToUse.selectedChannels.join(','),
        Channels: formDataToUse.selectedChannels.map((channel: string) => {
          const channelData = channelsData.find(c => c.name === channel)
          return channelData?.cid || ''
        }).join(','),
        Recipientlist: formDataToUse.recipients.join(','),
        UniversalId: 0,
        subscriberid: LocalStorageService.getSID(),
        SubId: LocalStorageService.getSID(),
        SchedulebanchmarkChannel: (() => {
          // Get channel IDs for selected channels
          console.log('Selected channels:', formDataToUse.selectedChannels)
          console.log('Available channels data:', channelsData.slice(0, 3))

          const channelIds = formDataToUse.selectedChannels.map((channel: string) => {
            const channelData = channelsData.find(c => c.name === channel)
            console.log('Channel:', channel, 'Found data:', channelData, 'CID:', channelData?.cid, 'CID type:', typeof channelData?.cid)
            return channelData?.cid ? String(channelData.cid) : ''
          }).filter((id: string) => id !== '')

          console.log('Channel IDs after mapping:', channelIds)

          // Sort channel IDs alphabetically and take the first one
          const sortedChannelIds = channelIds.sort((a: string, b: string) => a.localeCompare(b))
          const result = sortedChannelIds.length > 0 ? sortedChannelIds[0] : ''
          return result
        })(),
        Credit: '100000',
        isLimitOver: false,
        CrawlBeforeTime: 480,
        ScheduleType: 0,
        UnMappedData: (() => {
          // Convert mapping conflicts data to JSON string or empty string
          if (mappingConflictsData && mappingConflictsData.length > 0) {
            const jsonDataa = mappingConflictsData.map((conflict: any) => ({
              PropertyName: conflict.PropertyName || conflict.Property || '',
              channelName: conflict.channelName || conflict.Channel || '',
              propertyId: conflict.propertyId || 0,
              channelId: conflict.channelId || 0
            }))
            return JSON.stringify(jsonDataa)
          }
          return ''
        })(),
        UserName: LocalStorageService.getUserDisplayName(),
        LoginName: LocalStorageService.getUserName(),
        compattable: (() => {
          // Build compattable array from selected compset data
          const compattableArray: clsCompset[] = []

          // Process selected primary hotels (using hmid)
          formDataToUse.selectedPrimaryHotels.forEach((hotelId: number) => {
            const hotelData = primaryHotelsData.find(hotel => hotel.hmid === hotelId)
            if (hotelData) {
              compattableArray.push({
                Name: hotelData.name,
                Address: '',
                Country: '',
                City: '',
                property_id: hotelData.propertyID || 0,
                LLimit: hotelData.lowerThreshold || '0',
                ULimit: hotelData.higherThreshold || '0',
                status: 0,
                rank: 0,
                brand: '',
                NewPropertyID: hotelData.propertyID?.toString() || '0'
              })
            }
          }
          )

          // Process selected secondary hotels (using hmid)
          formDataToUse.selectedSecondaryHotels.forEach((hotelId: number) => {
            const hotelData = secondaryHotelsData.find(hotel => hotel.hmid === hotelId)
            if (hotelData) {
              compattableArray.push({
                Name: hotelData.name,
                Address: '',
                Country: '',
                City: '',
                property_id: hotelData.propertyID || 0,
                LLimit: hotelData.lowerThreshold || '0',
                ULimit: hotelData.higherThreshold || '0',
                status: 0,
                rank: 0,
                brand: '',
                NewPropertyID: hotelData.propertyID?.toString() || '0'
              })
            }
          }
          )

          return compattableArray
        })(),
        oldCompesetIds: '',
        oldCHIds: '',
        ReportStatus: 1,
        Limittype: 0,
        SubscriptionName: formDataToUse.scheduleName,
        OldParameter: (() => {
          const repParameter: RepParameter = {
            UAdvanceShop: "",
            UNoofcheckindates: "",
            ULOS: "",
            UOccupancy: "",
            UCurrency: "",
            UFrequency: "",
            UDays: "",
            UWeeks: "",
            UTimezone: "",
            UDeliveryTime: "",
            ExpiryDate: "",
            URecipientlist: "",
            UChannelName: "",
            UPropertyname: ""
          }
          return repParameter
        })(),
        checkIsSecondary: false,
        DaysdataText: (() => {
          const result = getFullDayNamesForSelectedDays(formDataToUse.selectedDaysOfWeek).join(',')
          console.log('Create Schedule - DaysdataText:', result, 'selectedDaysOfWeek:', formDataToUse.selectedDaysOfWeek)
          return result
        })(),
        FrequencyText: formDataToUse.frequency === '1' ? 'Daily' :
          formDataToUse.frequency === '2' ? 'Weekly' :
            formDataToUse.frequency === '3' ? 'Fortnightly' :
              formDataToUse.frequency === '4' ? 'Monthly' : ''
      }

      const response = await saveReportData(scheduleReportData)

      if (response.status) {
        setSnackbarMessage('Report Schedule Request has been taken successfully. We will send a confirmation email, once the report is ready to download from reports page.')
        setSnackbarType('success')
        setShowSnackbar(true)
        handleCreateModalClose()
        await refreshScheduleData()

        // Clear pending form data after successful save
        setPendingFormData(null)
      } else if (response.status === false && response.message === "A report with same competitor set, channels & parameter is already scheduled. Please check!!") {
        setSnackbarMessage('A report with same competitor set, channels & parameter is already scheduled. Please check!!')
        setSnackbarType('warning')
        setShowSnackbar(true)
        await refreshScheduleData()
        // Clear pending form data after error
        setPendingFormData(null)
      } else {
        setSnackbarMessage('Unable to take Report Scheduling Request.')
        setSnackbarType('error')
        setShowSnackbar(true)
        await refreshScheduleData()
        // Clear pending form data after error
        setPendingFormData(null)
      }
    } catch (error) {
      console.error('Error saving schedule report:', error)
      setSnackbarMessage('Unable to take Report Scheduling Request.')
      setSnackbarType('error')
      // Clear pending form data after error
      setPendingFormData(null)
    }
  }

  const checkShopsLimit = (formData: any) => {
    try {
      let packageDetailsString = LocalStorageService.getItem('packageDetails')?.toString() || ''
      if (!packageDetailsString) {
        console.log('No package details found in localStorage')
        return true // Allow if no package details
      }

      let packageDetails = JSON.parse(packageDetailsString)
      let channels: string[] = []

      // Get selected hotels based on compSet
      let selectedHotels: string[] = []
      if (formData.compSet === 'primary') {
        selectedHotels = formData.selectedPrimaryHotels
      } else {
        selectedHotels = formData.selectedSecondaryHotels
      }

      // Get hotel data for selected hotels
      let dataArray: any[] = []
      selectedHotels.forEach((hotelId: string) => {
        let listToFilter = formData.compSet === 'secondary' ? secondaryHotelsData : primaryHotelsData
        const result = listToFilter.find((competitor: any) => competitor.hmid === hotelId)

        if (result) {
          const dataObj = {
            property_id: result.propertyID || result.hmid,
            NewPropertyID: (result.propertyID || result.hmid).toString(),
            Country: '',
            City: '',
            Name: result.name,
            Address: '',
            ULimit: result.higherThreshold || '0',
            LLimit: result.lowerThreshold || '0',
            status: 0,
            brand: '',
            IsSecondary: formData.compSet === 'secondary'
          }
          dataArray.push(dataObj)
        }
      })

      const compatdata = JSON.stringify(dataArray)
      const parsedData: clsCompset[] = JSON.parse(compatdata)

      // Get selected channels
      formData.selectedChannels.forEach((item: string) => {
        channels.push(item)
      })

      // Calculate LOS
      let str = formData.los.toString()
      let numbersArray = str.split(',')
      let los = numbersArray.length

      // Check if user is on monthly plan or existing user
      if (packageDetails.displayName === 'Monthly' || packageDetails.isExistingUser) {
        return true
      } else {
        // Calculate RRDs used
        let rrdsUsed = (parsedData.length) * channels.length * parseInt(formData.checkInDates) * los

        // Get total shops consumed and allotted from package details
        // let totalShopsConsumedYearly = packageDetails.totalShopsConsumedYearly || 0
        // let totalShopsAlloted = packageDetails.totalShopsAlloted || 0

        if ((rrdsUsed + totalShopsConsumedYearly) > totalShopsAlloted) {
          // Show error message via snackbar
          setSnackbarMessage("Your request exceeds the current credit limit. Please purchase more credits or modify the report generation criteria to proceed.")
          setSnackbarType('error')
          setShowSnackbar(true)
          return false
        } else {
          return true
        }
      }
    } catch (error) {
      console.error('Error checking shops limit:', error)
      return true // Allow if error occurs
    }
  }

  const handleEditScheduleSubmit = async (forceCompleted: boolean = true) => {
    // Check shops limit first
    const isConsumedHigher = checkShopsLimit(editFormData)
    if (!isConsumedHigher) {
      // Error message is already shown via snackbar in checkShopsLimit function
      return
    }

    // Validate form before proceeding
    if (!validateEditForm()) {
      return // Don't proceed if validation fails
    }

    // Check if days of week are selected
    if (editFormData.selectedDaysOfWeek.length === 0) {
      setEditFormErrors(prev => ({ ...prev, daysOfWeek: 'Please select at least one day' }))
      return
    }

    // Check if week selection is required for fortnightly (3) or monthly (4)
    if ((editFormData.weekSelection === '' || editFormData.weekSelection === undefined) &&
      (editFormData.frequency === '3' || editFormData.frequency === '4')) {
      setEditFormErrors(prev => ({ ...prev, weekSelection: 'Please select a week' }))
      return
    }

    try {
      // Prepare the schedule report data for edit
      const scheduleReportData = {
        isAllDataMapped: false,
        ForceComplete: forceCompleted,
        PropertyName: editFormData.scheduleName,
        SubscriptionName: editFormData.scheduleName,
        Occupancy: parseInt(editFormData.guests, 10),
        LOS: editFormData.los.join(','),
        AdvanceShop: parseInt(editFormData.advanceShopDays, 10),
        Noofcheckindates: parseInt(editFormData.checkInDates, 10),
        Currency: editFormData.currency,
        ILOS: false,
        StartDate: getDateFormat(editFormData.startDate, 'MM/dd/yyyy'),
        Reportexpirydate: getDateFormat(editFormData.endDate, 'MM/dd/yyyy'),
        Frequency: parseInt(editFormData.frequency),
        FrequencyText: editFormData.frequency === '1' ? 'Daily' :
          editFormData.frequency === '2' ? 'Weekly' :
            editFormData.frequency === '3' ? 'Fortnightly' :
              editFormData.frequency === '4' ? 'Monthly' : '',
        Days: editFormData.selectedDaysOfWeek.join(','),
        DaysdataText: (() => {
          const result = getFullDayNamesForSelectedDays(editFormData.selectedDaysOfWeek).join(',')
          console.log('Edit Schedule - DaysdataText:', result, 'selectedDaysOfWeek:', editFormData.selectedDaysOfWeek)
          return result
        })(),
        DeliveryTime: timeConvert(editFormData.deliveryTime, editFormData.amPm),
        Timezone: String(editFormData.timeZone || ''),
        TimeZoneText: timezonesData.find(tz => tz.id === editFormData.timeZone)?.displayName || '',
        Weeks: editFormData.weekSelection && editFormData.weekSelection.trim() !== '' ? parseInt(editFormData.weekSelection) : null,
        Channels: (() => {
          const channelIds = editFormData.selectedChannels.map((channel: string) => {
            const channelData = channelsData.find(c => c.name === channel)
            return channelData?.cid ? String(channelData.cid) : ''
          }).filter((id: string) => id !== '')
          return channelIds.join(',')
        })(),
        Channelsname: editFormData.selectedChannels.join(','),
        SchedulebanchmarkChannel: "-1" ,
        Recipientlist: editFormData.recipients.join(','),
        UniversalId: editingSchedule?.universalID || 0,
        subscriberid: LocalStorageService.getSID(),
        SubId: LocalStorageService.getSID(),
        UserName: LocalStorageService.getUserDisplayName(),
        LoginName: LocalStorageService.getUserName(),
        oldCompesetIds: editFormData.selectedPrimaryHotels.join(','),
        oldCHIds: (() => {
          const channelIds = editFormData.selectedChannels.map((channel: string) => {
            const channelData = channelsData.find(c => c.name === channel)
            return channelData?.cid ? String(channelData.cid) : ''
          }).filter((id: string) => id !== '')
          console.log('Edit Schedule - oldCHIds conversion:', {
            selectedChannels: editFormData.selectedChannels,
            channelIds: channelIds,
            result: channelIds.join(',')
          })
          return channelIds.join(',')
        })(),
        ReportStatus: 1,
        Limittype: 0,
        Credit: '100000',
        isLimitOver: false,
        CrawlBeforeTime: 480,
        ScheduleType: 0,
        checkIsSecondary: editFormData.compSet === 'secondary',
        compattable: (() => {
          const selectedHotels = editFormData.compSet === 'primary' ? editFormData.selectedPrimaryHotels : editFormData.selectedSecondaryHotels
          const hotelList = editFormData.compSet === 'primary' ? primaryHotelsData : secondaryHotelsData
          const dataArray: any[] = []

          selectedHotels.forEach((hotel: string) => {
            const hotelData = hotelList.find((h: any) => h.hmid === hotel)
            if (hotelData) {
              const dataObj = {
                property_id: hotelData.propertyID || hotelData.hmid,
                NewPropertyID: (hotelData.propertyID || hotelData.hmid).toString(),
                Country: '',
                City: '',
                Name: hotelData.name,
                Address: '',
                ULimit: hotelData.higherThreshold || '0',
                LLimit: hotelData.lowerThreshold || '0',
                status: 0,
                brand: '',
                IsSecondary: editFormData.compSet === 'secondary',
              }
              dataArray.push(dataObj)
            }
          })
          return dataArray
        })(),
        OldParameter: {
          ExpiryDate: getDateFormat(editFormData.endDate, 'MM/dd/yyyy'),
          UAdvanceShop: editFormData.advanceShopDays,
          UCurrency: editFormData.currency,
          UDays: getFullDayNamesForSelectedDays(editFormData.selectedDaysOfWeek).join(','),
          UDeliveryTime: timeConvert(editFormData.deliveryTime, editFormData.amPm),
          UFrequency: editFormData.frequency === '1' ? 'Daily' :
            editFormData.frequency === '2' ? 'Weekly' :
              editFormData.frequency === '3' ? 'Fortnightly' :
                editFormData.frequency === '4' ? 'Monthly' : '',
          ULOS: editFormData.los.join(','),
          UOccupancy: editFormData.guests,
          UPropertyname: editFormData.scheduleName,
          UNoofcheckindates: editFormData.checkInDates,
          URecipientlist: editFormData.recipients.join(','),
          UTimezone: timezonesData.find(tz => tz.id === editFormData.timeZone)?.displayName || '',
          UWeeks: editFormData.weekSelection && editFormData.weekSelection.trim() !== '' ? editFormData.weekSelection : '',
          UChannelName: editFormData.selectedChannels.join(',')
        }
      }

      console.log('Edit schedule report data:', scheduleReportData)
      // const mappingFilteValue = { ...scheduleReportData, oldCompesetIds: "", "oldCHIds": "", "ReportStatus": 0, }


      // Call the checkMapping API
      const response = await checkMapping(scheduleReportData)

      if (response.status) {
        let result: any
        try {
          result = JSON.parse(response.body)
        } catch (e) {
          result = null
        }

        if (result == null) {
          // No conflicts, save directly
          await saveEditScheduleReport(scheduleReportData)
        } else {
          if (result.length > 0) {
            // Show mapping conflicts popup
            setMappingConflictsData(result)
            setIsMappingConflictsOpen(true)
          } else {
            // No conflicts, save directly
            await saveEditScheduleReport(scheduleReportData)
          }
        }
      } else {
        setSnackbarMessage('Unable to update Report Schedule Request.')
        setSnackbarType('error')
        setShowSnackbar(true)
      }
    } catch (error) {
      console.error('Error updating schedule:', error)
      setSnackbarMessage('Unable to update Report Schedule Request.')
      setSnackbarType('error')
      setShowSnackbar(true)
    }
  }

  const saveEditScheduleReport = async (scheduleReportData: any, forceComplete: boolean = true) => {
    try {
      const response = await saveReportData(scheduleReportData)
      if (response.status) {
        setSnackbarMessage('Report Schedule Request has been updated successfully. We will send a confirmation email, once the report is ready to download from reports page.')
        setSnackbarType('success')
        setShowSnackbar(true)
        setIsEditModalOpen(false)
        refreshScheduleData()
      } else {
        setSnackbarMessage('Unable to update Report Schedule Request.')
        setSnackbarType('error')
        setShowSnackbar(true)
      }
    } catch (error) {
      console.error('Error saving edit schedule:', error)
      setSnackbarMessage('Unable to update Report Schedule Request.')
      setSnackbarType('error')
      setShowSnackbar(true)
    }
  }

  const handleCreateScheduleSubmit = async () => {
    // Check shops limit first
    const isConsumedHigher = checkShopsLimit(createFormData)
    if (!isConsumedHigher) {
      // Error message is already shown via snackbar in checkShopsLimit function
      return
    }

    // Validate form before proceeding
    if (!validateCreateForm()) {
      return // Don't proceed if validation fails
    }

    // Check if days of week are selected
    if (createFormData.selectedDaysOfWeek.length === 0) {
      setCreateFormErrors(prev => ({ ...prev, daysOfWeek: 'Please select at least one day' }))
      return
    }

    // Check if week selection is required for fortnightly (3) or monthly (4)
    if ((createFormData.weekSelection === '' || createFormData.weekSelection === undefined) &&
      (createFormData.frequency === '3' || createFormData.frequency === '4')) {
      setCreateFormErrors(prev => ({ ...prev, weekSelection: 'Please select a week' }))
      return
    }

    // Close popup and show success message immediately
    setIsCreateModalOpen(false)
    setShowSnackbar(true)

    // Auto-hide success snackbar after 4 seconds
    setTimeout(() => {
      setShowSnackbar(false)
    }, 4000)

    // Reset form
    setCreateFormData({
      selectedChannels: [],
      compSet: 'primary',
      selectedPrimaryHotels: [],
      selectedSecondaryHotels: [],
      guests: '1',
      los: ['1'] as string[],
      advanceShopDays: '0',
      checkInDates: '1',
      currency: 'USD',
      startDate: new Date(),
      endDate: undefined,
      recipients: [],
      newRecipient: '',
      scheduleName: '',
      frequency: '1',
      time: '06:00',
      selectedDaysOfWeek: [],
      deliveryTime: '12:00',
      amPm: '1',
      timeZone: '',
      weekSelection: ''
    })

    // Make API call in background (optional - for logging/analytics)
    try {
      // Prepare channel IDs
      const channelIDs: string[] = []
      createFormData.selectedChannels.forEach((channel) => {
        const channelData = channelsData.find(x => x.name === channel)
        if (channelData) {
          channelIDs.push(channelData.cid)
        }
      })

      // Prepare compset data
      const dataArray: any[] = []
      const selectedHotels = createFormData.compSet === 'primary'
        ? createFormData.selectedPrimaryHotels
        : createFormData.selectedSecondaryHotels
      const isSecondary = createFormData.compSet === 'secondary'
      const hotelList = isSecondary ? secondaryHotelsData : primaryHotelsData

      selectedHotels.forEach((hotel) => {
        const hotelData = hotelList.find((h: any) => h.hmid === hotel)
        if (hotelData) {
          const dataObj = {
            property_id: hotelData.propertyID,
            NewPropertyID: hotelData.propertyID.toString(),
            Country: '',
            City: '',
            Name: hotelData.name,
            Address: '',
            ULimit: hotelData.higherThreshold,
            LLimit: hotelData.lowerThreshold,
            status: 0,
            brand: '',
            IsSecondary: isSecondary
          }
          dataArray.push(dataObj)
        }
      })

      // Prepare schedule report data
      const userDetails = LocalStorageService.getUserDetails()
      const scheduleReportData = {
        Channels: channelIDs.join(','),
        CrawlBeforeTime: 480,
        ReportStatus: 0,
        ScheduleType: 0,
        SubId: 0,
        UserName: userDetails?.email || 'unknown@example.com',
        compattable: dataArray,
        isAllDataMapped: false,
        isLimitOver: false,
        oldCHIds: '',
        oldCompesetIds: '',
        subscriberid: selectedProperty?.sid || '0',
        ForceComplete: false
      }

      // Call checkMapping API in background
      const response = await checkMapping(scheduleReportData)

      if (response.status) {
        let result: any
        try {
          result = JSON.parse(response.body)
        } catch (e) {
          result = null
        }

        if (result === null) {
          // Success case - show success message and refresh data
          console.log('Schedule created successfully')
          setSnackbarMessage('Report Schedule Request has been taken successfully. We will send a confirmation email, once the report is ready to download from reports page.')
          setSnackbarType('success')
          handleCreateModalClose()
          await refreshScheduleData()
        } else {
          if (result.length > 0) {
            // Show mapping conflicts popup
            console.log('Mapping conflicts found:', result)
            setMappingConflictsData(result)
            // Store current form data for later use
            setPendingFormData(createFormData)
            setIsMappingConflictsOpen(true)
          } else {
            // No conflicts, proceed with save
            console.log('No mapping conflicts, proceeding with save')
            await saveNewScheduleReport(true)
          }
        }
      }
    } catch (error) {
      console.error('Error checking mapping:', error)
      // Handle error silently or show error message
    }
  }

  const handleCancel = () => {
    // Reset form
    setScheduleFormData({
      selectedChannels: ['All Channels'],
      compSet: 'primary',
      selectedPrimaryHotels: ['All Primary Hotels'],
      selectedSecondaryHotels: ['All Secondary Hotels'],
      guests: '1',
      los: ['1'] as string[],
      startDate: new Date(),
      endDate: undefined,
      recipients: ['rahul.kumar@rategain.com'],
      newRecipient: '',
      scheduleName: '',
      frequency: '1',
      time: '06:00',
      weekSelection: ''
    })
    setIsChannelsOpen(false)
    setIsPrimaryHotelsOpen(false)
    setCreatePrimarySearchValue('')
    setIsSecondaryHotelsOpen(false)
    setCreateSecondarySearchValue('')
    setIsGuestsOpen(false)
    setIsLosOpen(false)
    setIsFrequencyOpen(false)
    setIsWeekSelectionOpen(false)
    setIsStartDateOpen(false)
    setIsEndDateOpen(false)
    setDateError('')
    setFormErrors({
      channels: '',
      guests: '',
      los: '',
      startDate: '',
      endDate: '',
      scheduleName: ''
    })
  }
  
  // Check if a channel should be checked
  const isChannelSelected = (channel: string) => {
    if (scheduleFormData.selectedChannels.includes('All Channels')) {
      return true
    }
    return scheduleFormData.selectedChannels.includes(channel)
  }  

  // Check if a primary hotel should be checked
  const isPrimaryHotelSelected = (hotel: string) => {
    if (scheduleFormData.selectedPrimaryHotels.includes('All Primary Hotels')) {
      return true
    }
    return scheduleFormData.selectedPrimaryHotels.includes(hotel)
  }

  // Check if a secondary hotel should be checked
  const isSecondaryHotelSelected = (hotel: string) => {
    if (scheduleFormData.selectedSecondaryHotels.includes('All Secondary Hotels')) {
      return true
    }
    return scheduleFormData.selectedSecondaryHotels.includes(hotel)
  }

  // Snackbar functions
  const handleSnackbarOk = () => {
    setShowSnackbar(false)
  }


  // Edit form validation function
  const validateEditForm = () => {
    const errors = {
      channels: '',
      guests: '',
      los: '',
      startDate: '',
      endDate: '',
      scheduleName: '',
      advanceShopDays: '',
      checkInDates: '',
      currency: '',
      deliveryTime: '',
      timeZone: '',
      frequency: '',
      daysOfWeek: '',
      weekSelection: '',
      recipients: ''
    }

    // Validate schedule name
    if (!editFormData.scheduleName.trim()) {
      errors.scheduleName = 'Please enter a schedule name'
    }

    // Validate channels
    if (!editFormData.selectedChannels || editFormData.selectedChannels.length === 0) {
      errors.channels = 'Please select at least one channel'
    }

    // Validate guests
    if (!editFormData.guests) {
      errors.guests = 'Please select number of guests'
    }

    // Validate LOS
    if (!editFormData.los) {
      errors.los = 'Please select length of stay'
    }

    // Validate advance shop days
    if (!editFormData.advanceShopDays.trim()) {
      errors.advanceShopDays = 'Please enter advance shop days'
    } else if (parseInt(editFormData.advanceShopDays) < 0 || parseInt(editFormData.advanceShopDays) > 30) {
      errors.advanceShopDays = 'Advance shop days must be between 0 and 30'
    }

    // Validate check-in dates
    if (!editFormData.checkInDates.trim()) {
      errors.checkInDates = 'Please enter number of check-in dates'
    } else if (parseInt(editFormData.checkInDates) <= 0 || parseInt(editFormData.checkInDates) > 365) {
      errors.checkInDates = 'No. of Check-in dates must be greater than 0'
    }

    // Validate currency
    if (!editFormData.currency) {
      errors.currency = 'Please select a currency'
    }

    // Validate start date
    if (!editFormData.startDate) {
      errors.startDate = 'Please select start date'
    }

    // Validate end date
    if (!editFormData.endDate) {
      errors.endDate = 'Please select end date'
    }

    // Validate frequency
    if (!editFormData.frequency) {
      errors.frequency = 'Please select frequency'
    }

    // Validate delivery time
    if (!editFormData.deliveryTime) {
      errors.deliveryTime = 'Please select delivery time'
    }

    // Validate time zone
    if (!editFormData.timeZone) {
      errors.timeZone = 'Please select time zone'
    }

    // Validate recipients
    if (!editFormData.recipients || editFormData.recipients.length === 0) {
      errors.recipients = 'Please add at least one recipient'
    }

    setEditFormErrors(errors)

    // Return true if no errors
    return Object.values(errors).every(error => error === '')
  }

  // Handle edit form submission
  const handleUpdateSchedule = () => {
    // Validate form before proceeding
    if (!validateEditForm()) {
      return // Don't proceed if validation fails
    }

    console.log('Updating schedule with data:', editFormData)
    setIsEditModalOpen(false)
    setShowEditSuccessSnackbar(true)

    // Auto-hide success snackbar after 4 seconds
    setTimeout(() => {
      setShowEditSuccessSnackbar(false)
    }, 4000)
  }

  // Date validation functions
  const handleStartDateSelect = (date: Date | undefined) => {
    setScheduleFormData(prev => ({ ...prev, startDate: date || new Date() }))

    // Close the calendar popover
    setIsStartDateOpen(false)

    // Clear error when start date is selected
    if (dateError) {
      setDateError('')
    }

    // If end date exists and is before the new start date, clear end date
    if (date && scheduleFormData.endDate && scheduleFormData.endDate < date) {
      setScheduleFormData(prev => ({ ...prev, endDate: undefined }))
      setDateError('End date cannot be before start date. Please select a new end date.')
    }
  }

  const handleEndDateSelect = (date: Date | undefined) => {
    // Validate that end date is not before start date
    if (date && scheduleFormData.startDate && date < scheduleFormData.startDate) {
      setDateError('End date cannot be before start date')
      return
    }

    setScheduleFormData(prev => ({ ...prev, endDate: date }))
    setDateError('')

    // Close the calendar popover
    setIsEndDateOpen(false)
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

  // Sort the data based on current sort configuration
  const sortedScheduledReportsData = [...scheduleData].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0

    let aValue: any = a[sortConfig.key as keyof ScheduleReportData]
    let bValue: any = b[sortConfig.key as keyof ScheduleReportData]

    // Handle date sorting
    if (sortConfig.key === 'startDate' || sortConfig.key === 'endDate') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }

    // Handle string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  // Scheduled Reports Loading Skeleton
  const ScheduledReportsLoadingSkeleton = () => (
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
                    <div className="h-10 px-4 border-l border-slate-200 dark:border-slate-700 rounded-l-md flex items-center">
                      <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                    <div className="h-10 px-4 bg-blue-600 text-white rounded-r-md flex items-center">
                      <div className="h-4 w-24 bg-white/20 animate-pulse rounded"></div>
                    </div>
                  </div>
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
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 pb-4 md:pb-6 lg:pb-8 xl:pb-10" style={{ marginTop: '10px' }}>
        <div className="max-w-none mx-auto">
          {/* Scheduled Reports Table Skeleton */}
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
                      <div className="col-span-3 h-4 bg-gray-300 animate-pulse rounded"></div>
                      <div className="col-span-3 h-4 bg-gray-300 animate-pulse rounded"></div>
                      <div className="col-span-2 h-4 bg-gray-300 animate-pulse rounded"></div>
                      <div className="col-span-2 h-4 bg-gray-300 animate-pulse rounded"></div>
                      <div className="col-span-1 h-4 bg-gray-300 animate-pulse rounded"></div>
                      <div className="col-span-1 h-4 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                  </div>

                  {/* Table Body Skeleton */}
                  <div className="bg-white dark:bg-gray-900 rounded-b-lg">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                        <div className="col-span-3 h-4 bg-gray-300 animate-pulse rounded"></div>
                        <div className="col-span-3 h-4 bg-gray-300 animate-pulse rounded"></div>
                        <div className="col-span-2 h-4 bg-gray-300 animate-pulse rounded"></div>
                        <div className="col-span-2 h-4 bg-gray-300 animate-pulse rounded"></div>
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
    return <ScheduledReportsLoadingSkeleton />
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Enhanced Filter Bar with Sticky Positioning */}
        <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-border/50 shadow-sm transition-shadow duration-200 relative overflow-hidden">
          <ReportsFilterBar
            onDateRangeChange={handleDateRangeChange}
            onReportTypeChange={handleReportTypeChange}
            showDateAndTypeFilters={false}
          />
        </div>

        {/* Professional Header Section */}
        <section className="w-full mt-4">
          <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="max-w-none mx-auto">
              <ScheduledReportsHeader onCreateSchedule={handleCreateSchedule} packageType={packageType} />
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 flex-1 flex" style={{ marginTop: '10px' }}>
          <div className="max-w-none mx-auto flex-1 flex flex-col">

            {/* Scheduled Reports Table */}
            <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden flex-1 flex flex-col">
              <div className="p-0 flex-1 flex flex-col">
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    {/* Table Header */}
                    <div className="rounded-t-lg" style={{ backgroundColor: 'rgb(243 244 246/var(--tw-bg-opacity,1))' }}>
                      <div className="flex items-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        <div
                          className="w-64 flex items-center gap-1 capitalize cursor-pointer group"
                          onClick={() => handleSort('scheduleName')}
                        >
                          Scheduled Reports
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {getHoverIcon('scheduleName')}
                          </span>
                          <span className="opacity-100">
                            {getSortIcon('scheduleName')}
                          </span>
                        </div>
                        <div
                          className="w-64 flex items-center gap-1 capitalize cursor-pointer group"
                          onClick={() => handleSort('daysOfDelivery')}
                        >
                          Delivery Detail
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {getHoverIcon('daysOfDelivery')}
                          </span>
                          <span className="opacity-100">
                            {getSortIcon('daysOfDelivery')}
                          </span>
                        </div>
                        <div
                          className="w-40 flex items-center gap-1 capitalize cursor-pointer group"
                          onClick={() => handleSort('rrdPerReport')}
                        >
                          RRD Per Report
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {getHoverIcon('rrdPerReport')}
                          </span>
                          <span className="opacity-100">
                            {getSortIcon('rrdPerReport')}
                          </span>
                        </div>
                        <div
                          className="w-40 flex items-center gap-1 capitalize cursor-pointer group"
                          onClick={() => handleSort('totalRRDs')}
                        >
                          Total RRDs
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {getHoverIcon('totalRRDs')}
                          </span>
                          <span className="opacity-100">
                            {getSortIcon('totalRRDs')}
                          </span>
                        </div>
                        <div
                          className="w-24 flex items-center gap-1 capitalize cursor-pointer group"
                          onClick={() => handleSort('status')}
                        >
                          Status
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {getHoverIcon('status')}
                          </span>
                          <span className="opacity-100">
                            {getSortIcon('status')}
                          </span>
                        </div>
                        <div className="w-20 capitalize flex items-center">Action</div>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div className="bg-white dark:bg-gray-900 rounded-b-lg">
                      {apiError ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <p className="text-red-600 dark:text-red-400 mb-2">Error loading schedule data</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{apiError}</p>
                          </div>
                        </div>
                      ) : sortedScheduledReportsData.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400">No schedule data available</p>
                          </div>
                        </div>
                      ) : (
                        sortedScheduledReportsData.map((report, index) => {

                          return (
                            <div
                              key={report.pghReportScheduleId}
                              className={`flex items-center px-4 py-2 text-sm ${index === scheduleData.length - 1 ? '' : 'border-b border-gray-100 dark:border-gray-800'
                                } ${index % 2 === 0
                                  ? 'bg-white dark:bg-gray-900'
                                  : 'bg-gray-50 dark:bg-gray-800/50'
                                } ${index === scheduleData.length - 1 ? 'rounded-b-lg' : ''
                                }`}
                            >
                              <div className="w-64 flex items-center">
                                <span className="text-gray-900 dark:text-gray-100 font-medium truncate" title={report.scheduleName}>
                                  {report.scheduleName}
                                </span>
                              </div>
                              <div className="w-64 flex items-center text-gray-700 dark:text-gray-300">
                                <span className="truncate" title={report.daysOfDelivery || 'N/A'}>
                                  {report.daysOfDelivery || 'N/A'}
                                </span>
                              </div>
                              <div className="w-40 flex items-center font-medium">
                                {report.rrdPerReport.toLocaleString()}
                              </div>
                              <div className="w-40 flex items-center font-medium">
                                {report.totalRRDs !== null && report.totalRRDs !== undefined ? report.totalRRDs.toLocaleString() : 'N/A'}
                              </div>
                              <div className="w-24 flex items-center">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${report.status === "Active"
                                    ? "text-green-600 border-green-600 bg-green-50 dark:bg-green-900/20"
                                    : "text-red-600 border-red-600 bg-red-50 dark:bg-red-900/20"
                                    }`}
                                >
                                  {report.status}
                                </Badge>
                              </div>
                              <div className="w-20 flex items-center">
                                <div className="flex items-center gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                                        onClick={() => handleEditSchedule(report)}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-black text-white border-black text-xs px-2 py-1">
                                      <p>Edit Schedule</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  {packageType === 'Pay-As-You-Go' && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                          onClick={() => {
                                            console.log('Delete button clicked - report.universalID:', report.universalID, 'report.pghReportScheduleId:', report.pghReportScheduleId)
                                            handleDeleteConfirmation(report.universalID, report.pghReportScheduleId)
                                          }}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-black text-white border-black text-xs px-2 py-1">
                                        <p>Delete Schedule</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </div>
                            </div>
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


      {/* Edit Scheduled Report Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-5xl h-[80vh] flex flex-col overflow-hidden z-[999]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader className="flex-shrink-0 pb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-semibold text-black">Edit Scheduled Report</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 pr-1.5 min-w-0">

            {/* Schedule Name - Top Level */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Schedule Name<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  placeholder="Enter schedule name"
                  value={editFormData.scheduleName}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, scheduleName: e.target.value }))}
                  className="w-full border border-gray-300 focus:!outline-none focus:!ring-0 focus:!border-gray-300 focus:!shadow-none"
                />
                {editFormErrors.scheduleName && (
                  <p className="text-red-500 text-xs mt-1">{editFormErrors.scheduleName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Configure Section */}
              <div className="space-y-8">
                {/* Channels */}
                <div className="mt-4">
                  {/* Configure Heading */}
                  <h3 className="text-sm font-semibold text-gray-800 mb-1 mb-4">Configure</h3>
                  <Label className="block text-xs font-medium text-gray-700 mb-1">
                    Channels<span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="relative" ref={editChannelsRef}>
                    <button
                      type="button"
                      onClick={() => setIsEditChannelsOpen(!isEditChannelsOpen)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      <span className="truncate">
                        {editFormData.selectedChannels.length === 0
                          ? "0 channels selected"
                          : editFormData.selectedChannels.length === channelsData.length
                            ? "All Channels"
                            : editFormData.selectedChannels.length === 1
                              ? editFormData.selectedChannels[0]
                              : `${editFormData.selectedChannels[0]} + ${editFormData.selectedChannels.length - 1}`
                        }
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isEditChannelsOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isEditChannelsOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {/* All Channels Option */}
                        <div className="px-3 py-2 border-b border-gray-200">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editFormData.selectedChannels.length === channelsData.length}
                              onChange={() => {
                                if (editFormData.selectedChannels.length === channelsData.length) {
                                  setEditFormData(prev => ({ ...prev, selectedChannels: [] }))
                                } else {
                                  setEditFormData(prev => ({ ...prev, selectedChannels: channelsData.map(c => c.name) }))
                                }
                                setIsEditChannelsOpen(false)
                              }}
                              className="w-4 h-4 mr-3 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                            />
                            <span className="text-sm text-gray-900 font-medium">All Channels</span>
                          </label>
                        </div>

                        {channelsData.map((channel) => (
                          <label
                            key={channel.cid}
                            className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={editFormData.selectedChannels.includes(channel.name)}
                              onChange={() => {
                                console.log('Toggle channel:', channel.name)
                                setEditFormData(prev => {
                                  const newChannels = [...prev.selectedChannels]
                                  if (newChannels.includes(channel.name)) {
                                    // Remove channel
                                    const filteredChannels = newChannels.filter(c => c !== channel.name)
                                    return { ...prev, selectedChannels: filteredChannels }
                                  } else {
                                    // Add channel
                                    const updatedChannels = [...newChannels, channel.name]

                                    // Check if all channels are now selected
                                    if (updatedChannels.length === channelsData.length) {
                                      // All channels selected - could add "All Channels" logic here if needed
                                    }

                                    return { ...prev, selectedChannels: updatedChannels }
                                  }
                                })
                              }}
                              className="w-4 h-4 mr-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-900 truncate" title={channel.name}>
                              {channel.name.length > 32 ? `${channel.name.substring(0, 32)}...` : channel.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {editFormErrors.channels && (
                    <p className="text-red-500 text-xs mt-1">{editFormErrors.channels}</p>
                  )}
                </div>

                {/* CompSet */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 mb-2">CompSet</Label>
                  <RadioGroup
                    value={editFormData.compSet}
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, compSet: value }))}
                    className="flex space-x-6"
                  >
                    <div className="flex items-center space-x-2 relative" ref={editPrimaryHotelsRef}>
                      <RadioGroupItem value="primary" id="edit-primary" />
                      <Label
                        htmlFor="edit-primary"
                        className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer"
                        onClick={() => setIsEditPrimaryHotelsOpen(!isEditPrimaryHotelsOpen)}
                      >
                        <span>Primary ({editFormData.selectedPrimaryHotels.length})</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </Label>

                      {/* Primary Hotels Dropdown */}
                      {isEditPrimaryHotelsOpen && (
                        <div className="absolute z-50 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto min-w-80">
                          {/* All Primary Hotels Option */}
                          <div className="px-3 py-2 border-b border-gray-200">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editFormData.selectedPrimaryHotels.length === primaryHotelsData.length}
                                onChange={() => {
                                  if (editFormData.selectedPrimaryHotels.length === primaryHotelsData.length) {
                                    setEditFormData(prev => ({ ...prev, selectedPrimaryHotels: [] }))
                                  } else {
                                    setEditFormData(prev => ({ ...prev, selectedPrimaryHotels: primaryHotelsData.map(h => h.hmid) }))
                                  }
                                  setIsEditPrimaryHotelsOpen(false)
                                }}
                                className="w-4 h-4 mr-3 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                              />
                              <span className="text-sm text-gray-900 font-medium">All Primary Hotels</span>
                            </label>
                          </div>

                          {primaryHotelsData.map((hotel, index) => (
                            <label
                              key={`edit-primary-${hotel.propertyID}-${hotel.name}-${index}`}
                              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={editFormData.selectedPrimaryHotels.includes(hotel.hmid)}
                                data-hotel-hmid={hotel.hmid}
                                data-selected-hotels={JSON.stringify(editFormData.selectedPrimaryHotels)}
                                onChange={() => {
                                  console.log('Toggle primary hotel:', hotel.hmid)
                                  setEditFormData(prev => {
                                    const newHotels = [...prev.selectedPrimaryHotels]
                                    if (newHotels.includes(hotel.hmid)) {
                                      // Remove hotel
                                      return { ...prev, selectedPrimaryHotels: newHotels.filter(h => h !== hotel.hmid) }
                                    } else {
                                      // Add hotel
                                      return { ...prev, selectedPrimaryHotels: [...newHotels, hotel.hmid] }
                                    }
                                  })
                                }}
                                className="w-4 h-4 mr-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                              <span className="text-sm text-gray-900 truncate" title={hotel.name}>
                                {hotel.name.length > 32 ? `${hotel.name.substring(0, 32)}...` : hotel.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 relative" ref={editSecondaryHotelsRef}>
                      <RadioGroupItem value="secondary" id="edit-secondary" />
                      <Label
                        htmlFor="edit-secondary"
                        className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer"
                        onClick={() => setIsEditSecondaryHotelsOpen(!isEditSecondaryHotelsOpen)}
                      >
                        <span>Secondary ({editFormData.selectedSecondaryHotels.length})</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </Label>

                      {/* Secondary Hotels Dropdown */}
                      {isEditSecondaryHotelsOpen && (
                        <div className="absolute z-50 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto min-w-80">
                          {/* All Secondary Hotels Option */}
                          <div className="px-3 py-2 border-b border-gray-200">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editFormData.selectedSecondaryHotels.length === secondaryHotelsData.length}
                                onChange={() => {
                                  if (editFormData.selectedSecondaryHotels.length === secondaryHotelsData.length) {
                                    setEditFormData(prev => ({ ...prev, selectedSecondaryHotels: [] }))
                                  } else {
                                    setEditFormData(prev => ({ ...prev, selectedSecondaryHotels: secondaryHotelsData.map(h => h.hmid) }))
                                  }
                                  setIsEditSecondaryHotelsOpen(false)
                                }}
                                className="w-4 h-4 mr-3 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                              />
                              <span className="text-sm text-gray-900 font-medium">All Secondary Hotels</span>
                            </label>
                          </div>

                          {secondaryHotelsData.map((hotel, index) => (
                            <label
                              key={`edit-secondary-${hotel.propertyID}-${hotel.name}-${index}`}
                              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={editFormData.selectedSecondaryHotels.includes(hotel.hmid)}
                                data-hotel-hmid={hotel.hmid}
                                data-selected-hotels={JSON.stringify(editFormData.selectedSecondaryHotels)}
                                onChange={() => {
                                  console.log('Toggle secondary hotel:', hotel.hmid)
                                  setEditFormData(prev => {
                                    const newHotels = [...prev.selectedSecondaryHotels]
                                    if (newHotels.includes(hotel.hmid)) {
                                      // Remove hotel
                                      return { ...prev, selectedSecondaryHotels: newHotels.filter(h => h !== hotel.hmid) }
                                    } else {
                                      // Add hotel
                                      return { ...prev, selectedSecondaryHotels: [...newHotels, hotel.hmid] }
                                    }
                                  })
                                }}
                                className="w-4 h-4 mr-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                              <span className="text-sm text-gray-900 truncate" title={hotel.name}>
                                {hotel.name.length > 32 ? `${hotel.name.substring(0, 32)}...` : hotel.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </RadioGroup>
                </div>

                {/* Guests and LOS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ paddingTop: '13px' }}>
                  {/* Guests */}
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 mb-1">
                      Guests<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative" ref={editGuestsRef}>
                      <button
                        type="button"
                        onClick={() => setIsEditGuestsOpen(!isEditGuestsOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <span>{editFormData.guests}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isEditGuestsOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isEditGuestsOpen && (
                        <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((number) => (
                            <button
                              key={number}
                              type="button"
                              onClick={() => {
                                setEditFormData(prev => ({ ...prev, guests: number.toString() }))
                                setIsEditGuestsOpen(false)
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                            >
                              {number}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {editFormErrors.guests && (
                      <p className="text-red-500 text-xs mt-1">{editFormErrors.guests}</p>
                    )}
                  </div>

                  {/* LOS */}
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 mb-1">
                      LOS<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative" ref={editLosRef}>
                      <button
                        type="button"
                        onClick={() => setIsEditLosOpen(!isEditLosOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <span>{editFormData.los.length > 0 ? editFormData.los.join(', ') : 'Select LOS'}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isEditLosOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isEditLosOpen && (
                        <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((number) => (
                            <label
                              key={number}
                              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={editFormData.los.includes(number.toString())}
                                onChange={() => handleEditLosSelection(number.toString())}
                                className="w-4 h-4 mr-3 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                              />
                              <span className="text-sm text-gray-900">{number}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    {editFormErrors.los && (
                      <p className="text-red-500 text-xs mt-1">{editFormErrors.los}</p>
                    )}
                  </div>
                </div>

                {/* Advance Shop Days and No. of Check-in Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Advance Shop Days */}
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 mb-1">
                      Advance Shop Days<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      type="number"
                      placeholder="Enter advance shop days"
                      value={editFormData.advanceShopDays}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, advanceShopDays: e.target.value }))}
                      className="w-full border border-gray-300 focus:!outline-none focus:!ring-0 focus:!border-gray-300 focus:!shadow-none"
                      min="0"
                      max="30"
                    />
                    {editFormErrors.advanceShopDays && (
                      <p className="text-red-500 text-xs mt-1">{editFormErrors.advanceShopDays}</p>
                    )}
                  </div>

                  {/* No. of Check-in Dates */}
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 mb-1">
                      No. of Check-in Dates<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      type="number"
                      placeholder="Enter No. of check-in dates"
                      value={editFormData.checkInDates}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, checkInDates: e.target.value }))}
                      className="w-full border border-gray-300 focus:!outline-none focus:!ring-0 focus:!border-gray-300 focus:!shadow-none"
                      min="1"
                      max="365"
                      pattern="[0-9]*"
                    />
                    {editFormErrors.checkInDates && (
                      <p className="text-red-500 text-xs mt-1">{editFormErrors.checkInDates}</p>
                    )}
                  </div>
                </div>

                {/* Currency */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 mb-1">
                    Currency<span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="relative" ref={editCurrencyRef}>
                    <button
                      type="button"
                      onClick={() => setIsEditCurrencyOpen(!isEditCurrencyOpen)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      <span>{editFormData.currency}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isEditCurrencyOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isEditCurrencyOpen && (
                      <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-md shadow-lg">
                        {/* Search Input */}
                        <div className="p-2 border-b border-gray-200">
                          <Input
                            placeholder="Search currencies..."
                            value={currencySearchTerm}
                            onChange={(e) => setCurrencySearchTerm(e.target.value)}
                            className="w-full text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        {/* Currency List */}
                        <div className="max-h-[160px] overflow-y-auto" style={{ maxHeight: '160px' }}>
                          {currencyData
                            .filter(currency =>
                              currency.toLowerCase().includes(currencySearchTerm.toLowerCase())
                            )
                            .map((currency) => (
                              <button
                                key={currency}
                                type="button"
                                onClick={() => {
                                  setEditFormData(prev => ({ ...prev, currency }))
                                  setIsEditCurrencyOpen(false)
                                  setCurrencySearchTerm('')
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 min-h-[32px] flex items-center"
                              >
                                {currency}
                              </button>
                            ))}
                          {currencyData.filter(currency =>
                            currency.toLowerCase().includes(currencySearchTerm.toLowerCase())
                          ).length === 0 && (
                              <div className="px-3 py-2 text-sm text-gray-500">
                                No currencies found
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                  {editFormErrors.currency && (
                    <p className="text-red-500 text-xs mt-1">{editFormErrors.currency}</p>
                  )}
                </div>
              </div>

              {/* Delivery of Report Section */}
              <div className="space-y-8">
                {/* Start Date and End Date in same row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-4">
                  {/* Start Date */}
                  <div>
                    {/* Delivery of Report Heading */}
                    <h3 className="text-sm font-semibold text-gray-800 mb-1 mb-4">Delivery of Report</h3>
                    <Label className="block text-xs font-medium text-gray-700 mb-1">
                      Start Date<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Popover open={isEditStartDateOpen} onOpenChange={setIsEditStartDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editFormData.startDate ? format(editFormData.startDate, "dd MMM ''yy") : "Select start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                        <Calendar
                          mode="single"
                          selected={editFormData.startDate}
                          onSelect={(date) => {
                            setEditFormData(prev => ({ ...prev, startDate: date || new Date() }))
                            setIsEditStartDateOpen(false)
                          }}
                          numberOfMonths={1}
                          initialFocus
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          fromDate={new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    {editFormErrors.startDate && (
                      <p className="text-red-500 text-xs mt-1">{editFormErrors.startDate}</p>
                    )}
                  </div>

                  {/* End Date */}
                  <div className="flex flex-col justify-end h-full">
                    <div>
                      <Label className="block text-xs font-medium text-gray-700 mb-1">
                        End Date<span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Popover open={isEditEndDateOpen} onOpenChange={setIsEditEndDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {editFormData.endDate ? format(editFormData.endDate, "dd MMM ''yy") : "Select end date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                          <Calendar
                            mode="single"
                            selected={editFormData.endDate}
                            onSelect={(date) => {
                              if (date && editFormData.startDate && date < editFormData.startDate) {
                                setEditDateError('End date cannot be before start date')
                                return
                              }
                              setEditFormData(prev => ({ ...prev, endDate: date }))
                              setEditDateError('')
                              setIsEditEndDateOpen(false)
                            }}
                            numberOfMonths={1}
                            initialFocus
                            disabled={(date) => {
                              const today = new Date(new Date().setHours(0, 0, 0, 0))
                              const isBeforeToday = date < today
                              const isBeforeStartDate = editFormData.startDate && date < editFormData.startDate
                              return Boolean(isBeforeToday || isBeforeStartDate)
                            }}
                            fromDate={editFormData.startDate || new Date()}
                          />
                          {editDateError && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border-t border-red-200">
                              {editDateError}
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                      {editFormErrors.endDate && (
                        <p className="text-red-500 text-xs mt-1">{editFormErrors.endDate}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Frequency and Week Selection */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Frequency */}
                  <div className={editFormData.frequency === '3' || editFormData.frequency === '4' ? 'col-span-1' : 'col-span-2'}>
                    <Label className="block text-xs font-medium text-gray-700 mb-1">
                      Frequency<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative" ref={editFrequencyRef}>
                      <button
                        type="button"
                        onClick={() => setIsEditFrequencyOpen(!isEditFrequencyOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <span className="capitalize">
                          {editFormData.frequency === '1' ? 'Daily' :
                            editFormData.frequency === '2' ? 'Weekly' :
                              editFormData.frequency === '3' ? 'Fortnightly' :
                                editFormData.frequency === '4' ? 'Monthly' : editFormData.frequency}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isEditFrequencyOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isEditFrequencyOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                          {[
                            { value: '1', label: 'Daily' },
                            { value: '2', label: 'Weekly' },
                            { value: '3', label: 'Fortnightly' },
                            { value: '4', label: 'Monthly' }
                          ].map((freq, index, array) => (
                            <button
                              key={freq.value}
                              type="button"
                              onClick={() => {
                                handleEditFrequencyChange(freq.value)
                                setIsEditFrequencyOpen(false)
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${index === 0 ? 'rounded-tl-md rounded-tr-md' : index === array.length - 1 ? 'rounded-bl-md rounded-br-md' : ''
                                }`}
                            >
                              {freq.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {editFormErrors.frequency && (
                      <p className="text-red-500 text-xs mt-1">{editFormErrors.frequency}</p>
                    )}
                  </div>

                  {/* Week Selection - Conditional */}
                  {(editFormData.frequency === '3' || editFormData.frequency === '4') && (
                    <div>
                      <Label className="block text-xs font-medium text-gray-700 mb-1">
                        {editFormData.frequency === '3' ? 'Weeks' : 'Week'}<span className="text-red-500 ml-1">*</span>
                      </Label>
                      <div className="relative" ref={editWeekSelectionRef}>
                        <button
                          type="button"
                          onClick={() => setIsEditWeekSelectionOpen(!isEditWeekSelectionOpen)}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          <span className="text-sm">
                            {editFormData.frequency === '3'
                              ? (editFormData.weekSelection === '1' ? '1st & 3rd Week' : '2nd & 4th Week')
                              : (editFormData.weekSelection === '1' ? 'First' :
                                editFormData.weekSelection === '2' ? 'Second' :
                                  editFormData.weekSelection === '3' ? 'Third' :
                                    editFormData.weekSelection === '5' ? 'Fourth' : editFormData.weekSelection)
                            }
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isEditWeekSelectionOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isEditWeekSelectionOpen && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                            {editFormData.frequency === '3'
                              ? [
                                { value: '1', label: '1st & 3rd Week' },
                                { value: '2', label: '2nd & 4th Week' }
                              ].map((week, index, array) => (
                                <button
                                  key={week.value}
                                  type="button"
                                  onClick={() => {
                                    setEditFormData(prev => ({ ...prev, weekSelection: week.value }))
                                    setIsEditWeekSelectionOpen(false)
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${index === 0 ? 'rounded-tl-md rounded-tr-md' : index === array.length - 1 ? 'rounded-bl-md rounded-br-md' : ''
                                    }`}
                                >
                                  {week.label}
                                </button>
                              ))
                              : [
                                { value: '1', label: 'First' },
                                { value: '2', label: 'Second' },
                                { value: '3', label: 'Third' },
                                { value: '5', label: 'Fourth' }
                              ].map((week, index, array) => (
                                <button
                                  key={week.value}
                                  type="button"
                                  onClick={() => {
                                    setEditFormData(prev => ({ ...prev, weekSelection: week.value }))
                                    setIsEditWeekSelectionOpen(false)
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${index === 0 ? 'rounded-tl-md rounded-tr-md' : index === array.length - 1 ? 'rounded-bl-md rounded-br-md' : ''
                                    }`}
                                >
                                  {week.label}
                                </button>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Days of the Week */}
                {editFormData.frequency !== '2' && editFormData.frequency !== '4' && (
                  <div className="w-full">
                    <Label className="block text-xs font-medium text-gray-700 mb-2">
                      Days of the Week
                    </Label>
                    <div className="flex gap-2">
                      {daysOfWeek.map((day) => {
                        const dayValue = dayValuesMap[day]
                        const isSelected = editFormData.selectedDaysOfWeek.includes(dayValue)
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleEditDayToggle(day)}
                            className={`px-2 py-1 text-sm rounded-md border transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {day}
                          </button>
                        )
                      })}
                    </div>
                    {editFormErrors.daysOfWeek && (
                      <p className="text-red-500 text-xs mt-1">{editFormErrors.daysOfWeek}</p>
                    )}
                  </div>
                )}

                {/* Day of the Week (Single Select) */}
                {(editFormData.frequency === '2' || editFormData.frequency === '4') && (
                  <div className="w-full">
                    <Label className="block text-xs font-medium text-gray-700 mb-2">
                      Day of the Week
                    </Label>
                    <div className="flex gap-2">
                      {daysOfWeek.map((day) => {
                        const dayValue = dayValuesMap[day]
                        const isSelected = editFormData.selectedDaysOfWeek.includes(dayValue)
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleEditDayToggle(day)}
                            className={`px-2 py-1 text-sm rounded-md border transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {day}
                          </button>
                        )
                      })}
                    </div>
                    {editFormErrors.daysOfWeek && (
                      <p className="text-red-500 text-xs mt-1">{editFormErrors.daysOfWeek}</p>
                    )}
                  </div>
                )}

                {/* Delivery Time, AM/PM, Time Zone */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Delivery Time */}
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 mb-1">
                      Delivery Time<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative" ref={editDeliveryTimeRef}>
                      <button
                        type="button"
                        onClick={() => setIsEditDeliveryTimeOpen(!isEditDeliveryTimeOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <span>{editFormData.deliveryTime}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isEditDeliveryTimeOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isEditDeliveryTimeOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-[160px] overflow-y-auto">
                          {deliveryTimesData.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => {
                                setEditFormData(prev => ({ ...prev, deliveryTime: time }))
                                setIsEditDeliveryTimeOpen(false)
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {editFormErrors.deliveryTime && (
                      <p className="text-red-500 text-xs mt-1">{editFormErrors.deliveryTime}</p>
                    )}
                  </div>

                  {/* AM/PM Toggle */}
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 mb-1">
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="flex">
                      <button
                        type="button"
                        onClick={() => setEditFormData(prev => ({ ...prev, amPm: '1' }))}
                        className={`flex-1 px-3 py-2 text-sm border-l border-t border-b rounded-l-md transition-colors ${editFormData.amPm === '1'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditFormData(prev => ({ ...prev, amPm: '2' }))}
                        className={`flex-1 px-3 py-2 text-sm border-r border-t border-b rounded-r-md transition-colors ${editFormData.amPm === '2'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        PM
                      </button>
                    </div>
                  </div>

                  {/* Time Zone */}
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 mb-1">
                      Time Zone<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative" ref={editTimeZoneRef}>
                      <button
                        type="button"
                        onClick={() => setIsEditTimeZoneOpen(!isEditTimeZoneOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <span className="truncate" title={timezoneTooltip}>
                          {timezonesData.find(tz => tz.id === editFormData.timeZone)?.displayName || editFormData.timeZone}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isEditTimeZoneOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isEditTimeZoneOpen && (
                        <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-md shadow-lg">
                          {/* Search Input */}
                          <div className="p-2 border-b border-gray-200">
                            <Input
                              placeholder="Search time zones..."
                              value={timeZoneSearchTerm}
                              onChange={(e) => setTimeZoneSearchTerm(e.target.value)}
                              className="w-full text-sm border border-gray-300 focus:!outline-none focus:!ring-0 focus:!border-gray-300 focus:!shadow-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          {/* Time Zone List */}
                          <div className="max-h-[160px] overflow-y-auto" style={{ maxHeight: '160px' }}>
                            {isLoadingTimezone ? (
                              <div className="px-3 py-2 text-sm text-gray-500 flex items-center">
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Loading timezones...
                              </div>
                            ) : (
                              <>
                                {timezonesData
                                  .filter(timezone =>
                                    timezone.displayName.toLowerCase().includes(timeZoneSearchTerm.toLowerCase())
                                  )
                                  .map((timezone) => (
                                    <button
                                      key={timezone.id}
                                      type="button"
                                      onClick={() => {
                                        setEditFormData(prev => ({ ...prev, timeZone: String(timezone.id) }))
                                        setTimezoneTooltip(timezone.displayName)
                                        setIsEditTimeZoneOpen(false)
                                        setTimeZoneSearchTerm('')
                                      }}
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                                    >
                                      {timezone.displayName}
                                    </button>
                                  ))}
                                {timezonesData.filter(timezone =>
                                  timezone.displayName.toLowerCase().includes(timeZoneSearchTerm.toLowerCase())
                                ).length === 0 && (
                                    <div className="px-3 py-2 text-sm text-gray-500">
                                      No time zones found
                                    </div>
                                  )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {editFormErrors.timeZone && (
                      <p className="text-red-500 text-xs mt-1">{editFormErrors.timeZone}</p>
                    )}
                  </div>
                </div>

                {/* Recipients */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 mb-2">Recipients</Label>
                  <div className="space-y-2">
                    {/* Existing Recipients */}
                    {editFormData.recipients.map((email, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2 border border-gray-200">
                        <span className="text-sm text-gray-900 truncate">{email}</span>
                        <button
                          onClick={() => {
                            setEditFormData(prev => ({
                              ...prev,
                              recipients: prev.recipients.filter(recipient => recipient !== email)
                            }))
                          }}
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
                        value={editFormData.newRecipient}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, newRecipient: e.target.value }))}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && editFormData.newRecipient && !editFormData.recipients.includes(editFormData.newRecipient)) {
                            setEditFormData(prev => ({
                              ...prev,
                              recipients: [...prev.recipients, prev.newRecipient],
                              newRecipient: ''
                            }))
                          }
                        }}
                        className="w-full border border-gray-300 focus:!outline-none focus:!ring-0 focus:!border-gray-300 focus:!shadow-none"
                      />
                    </div>
                    {editFormErrors.recipients && (
                      <p className="text-red-500 text-xs mt-1">{editFormErrors.recipients}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Cancel
            </Button>
            {packageType === 'Pay-As-You-Go' && (
              <Button
                onClick={() => handleEditScheduleSubmit(false)}
                className="h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Schedule
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Scheduled Report Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-5xl h-[80vh] flex flex-col overflow-hidden" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader className="flex-shrink-0 pb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-semibold text-black">Create Scheduled Report</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 pr-1.5 min-w-0">

            {/* Schedule Name - Top Level */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Schedule Name<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  placeholder="Enter schedule name"
                  value={createFormData.scheduleName}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, scheduleName: e.target.value }))}
                  className="w-full border border-gray-300 focus:!outline-none focus:!ring-0 focus:!border-gray-300 focus:!shadow-none"
                />
                {createFormErrors.scheduleName && (
                  <p className="text-red-500 text-xs mt-1">{createFormErrors.scheduleName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Configure Section */}
              <div className="space-y-8">
                {/* Channels */}
                <div className="mt-4">
                  {/* Configure Heading */}
                  <h3 className="text-sm font-semibold text-gray-800 mb-1 mb-4">Configure</h3>
                  <Label className="block text-xs font-medium text-gray-700 mb-1">
                    Channels<span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="relative" ref={channelsRef}>
                    <button
                      type="button"
                      onClick={() => isChannelsOpen ? handleCreateChannelsDropdownClose() : setIsChannelsOpen(true)}
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
                        ) : createFormData.selectedChannels.length === 0
                          ? "0 channels selected"
                          : createFormData.selectedChannels.length === channelsData.length
                            ? "All Channels"
                            : createFormData.selectedChannels.length === 1
                              ? createFormData.selectedChannels[0]
                              : `${createFormData.selectedChannels[0]} + ${createFormData.selectedChannels.length - 1}`
                        }
                      </span>
                      {!isLoadingChannels && (
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isChannelsOpen ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                    {isChannelsOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {/* Search Input */}
                        <div className="p-3 border-b border-gray-200">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search Channel"
                              value={createChannelsSearchValue}
                              onChange={handleCreateChannelsSearch}
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

                        {/* Select All Option */}
                        <div className="border-b border-gray-200">
                          <label className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filteredCreateChannels.length > 0 && filteredCreateChannels.every(channel => createFormData.selectedChannels.includes(channel.name))}
                              onChange={() => handleCreateChannelToggle('Select All')}
                              className="w-4 h-4 mr-3 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                            />
                            <span className="text-sm text-gray-900 font-medium">All Channels</span>
                          </label>
                        </div>

                        {/* Channel Options */}
                        <div className="max-h-40 overflow-y-auto">
                          {filteredCreateChannels.map((channel) => {
                            const channelName = channel.name
                            const channelKey = channel.cid || channel.channelMasterId || channel.name
                            return (
                              <label
                                key={channelKey}
                                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={isCreateChannelSelected(channelName)}
                                  onChange={() => handleCreateChannelToggle(channelName)}
                                  className="w-4 h-4 mr-3 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                                />
                                <span className="text-sm text-gray-900 font-medium truncate" title={channelName}>
                                  {channelName && channelName.length > 32 ? `${channelName.substring(0, 32)}...` : channelName}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  {createFormErrors.channels && (
                    <p className="text-red-500 text-xs mt-1">{createFormErrors.channels}</p>
                  )}
                </div>

                {/* CompSet */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 mb-2">CompSet</Label>
                  <RadioGroup
                    value={createFormData.compSet}
                    onValueChange={(value) => handleFormChange('compSet', value)}
                    className="flex space-x-6"
                  >
                    <div className="flex items-center space-x-2 relative" ref={primaryHotelsRef}>
                      <RadioGroupItem value="primary" id="primary" />
                      <Label
                        htmlFor="primary"
                        className={`flex items-center space-x-2 text-sm text-gray-700 ${isLoadingCompSet ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                          }`}
                        onClick={isLoadingCompSet ? undefined : handleCreatePrimaryHotelsToggle}
                      >
                        <span className="flex items-center">
                          {isLoadingCompSet ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Loading properties...
                            </>
                          ) : (
                            `Primary (${createFormData.selectedPrimaryHotels.length})`
                          )}
                        </span>
                        {!isLoadingCompSet && (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </Label>

                      {/* Primary Hotels Dropdown */}
                      {isPrimaryHotelsOpen && (
                        <div className="absolute z-50 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto min-w-80">
                          {isLoadingCompSet ? (
                            <div className="flex items-center justify-center px-3 py-4">
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              <span className="text-sm text-gray-500">Loading compsets...</span>
                            </div>
                          ) : (
                            <>
                              {/* Search Input */}
                              <div className="p-3 border-b border-gray-200">
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Search"
                                    value={createPrimarySearchValue}
                                    onChange={handleCreatePrimarySearch}
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

                              {/* Select All Option */}
                              <div className="border-b border-gray-200">
                                <label className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={createFormData.selectedPrimaryHotels.length === filteredCreatePrimaryHotels.length && filteredCreatePrimaryHotels.length > 0}
                                    onChange={() => handleCreatePrimaryHotelToggle('Select All')}
                                    className="w-4 h-4 mr-3 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                                  />
                                  <span className="text-sm text-gray-900 font-medium">All Primary Hotels</span>
                                </label>
                              </div>

                              {/* Hotel Options */}
                              <div className="max-h-40 overflow-y-auto">
                                {filteredCreatePrimaryHotels.map((hotel, index) => (
                                  <label
                                    key={`primary-${hotel.propertyID}-${hotel.name}-${index}`}
                                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isCreatePrimaryHotelSelected(hotel)}
                                      onChange={() => handleCreatePrimaryHotelToggle(hotel.hmid)}
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
                        onClick={isLoadingCompSet ? undefined : handleCreateSecondaryHotelsToggle}
                      >
                        <span className="flex items-center">
                          {isLoadingCompSet ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Loading properties...
                            </>
                          ) : (
                            `Secondary (${createFormData.selectedSecondaryHotels.length})`
                          )}
                        </span>
                        {!isLoadingCompSet && (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </Label>

                      {/* Secondary Hotels Dropdown */}
                      {isSecondaryHotelsOpen && (
                        <div className="absolute z-50 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto min-w-80">
                          {isLoadingCompSet ? (
                            <div className="flex items-center justify-center px-3 py-4">
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              <span className="text-sm text-gray-500">Loading compsets...</span>
                            </div>
                          ) : (
                            <>
                              {/* Search Input */}
                              <div className="p-3 border-b border-gray-200">
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Search"
                                    value={createSecondarySearchValue}
                                    onChange={handleCreateSecondarySearch}
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

                              {/* Select All Option */}
                              <div className="border-b border-gray-200">
                                <label className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={createFormData.selectedSecondaryHotels.length === filteredCreateSecondaryHotels.length && filteredCreateSecondaryHotels.length > 0}
                                    onChange={() => handleCreateSecondaryHotelToggle('Select All')}
                                    className="w-4 h-4 mr-3 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                                  />
                                  <span className="text-sm text-gray-900 font-medium">All Secondary Hotels</span>
                                </label>
                              </div>

                              {/* Hotel Options */}
                              <div className="max-h-40 overflow-y-auto">
                                {filteredCreateSecondaryHotels.map((hotel, index) => (
                                  <label
                                    key={`secondary-${hotel.propertyID}-${hotel.name}-${index}`}
                                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isCreateSecondaryHotelSelected(hotel)}
                                      onChange={() => handleCreateSecondaryHotelToggle(hotel.hmid)}
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
                  {createFormErrors.compSet && (
                    <p className="text-red-500 text-xs mt-1">{createFormErrors.compSet}</p>
                  )}
                </div>

                {/* Guests and LOS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ paddingTop: '13px' }}>
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
                        <span>{createFormData.guests}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isGuestsOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isGuestsOpen && (
                        <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((number) => (
                            <button
                              key={number}
                              type="button"
                              onClick={() => {
                                setCreateFormData(prev => ({ ...prev, guests: number.toString() }))
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
                    {createFormErrors.guests && (
                      <p className="text-red-500 text-xs mt-1">{createFormErrors.guests}</p>
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
                        <span>{createFormData.los.length > 0 ? createFormData.los.join(', ') : 'Select LOS'}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isLosOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isLosOpen && (
                        <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((number) => (
                            <label
                              key={number}
                              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={createFormData.los.includes(number.toString())}
                                onChange={() => handleCreateLosSelection(number.toString())}
                                className="w-4 h-4 mr-3 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                              />
                              <span className="text-sm text-gray-900">{number}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    {createFormErrors.los && (
                      <p className="text-red-500 text-xs mt-1">{createFormErrors.los}</p>
                    )}
                  </div>
                </div>

                {/* Advance Shop Days and Check-in Dates */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Advance Shop Days */}
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 mb-1">
                      Advance Shop Days<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="30"
                      value={createFormData.advanceShopDays}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, advanceShopDays: e.target.value }))}
                      className="w-full border border-gray-300 focus:!outline-none focus:!ring-0 focus:!border-gray-300 focus:!shadow-none"
                      placeholder="Enter Advance shop days"
                    />
                    {createFormErrors.advanceShopDays && (
                      <p className="text-red-500 text-xs mt-1">{createFormErrors.advanceShopDays}</p>
                    )}
                  </div>

                  {/* No. of Check-in Dates */}
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 mb-1">
                      No. of Check-in Dates<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      pattern="[0-9]*"
                      value={createFormData.checkInDates}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, checkInDates: e.target.value }))}
                      className="w-full border border-gray-300 focus:!outline-none focus:!ring-0 focus:!border-gray-300 focus:!shadow-none"
                      placeholder="Enter No. of check-in dates"
                    />
                    {createFormErrors.checkInDates && (
                      <p className="text-red-500 text-xs mt-1">{createFormErrors.checkInDates}</p>
                    )}
                  </div>
                </div>

                {/* Currency */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 mb-1">
                    Currency<span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="relative" ref={currencyRef}>
                    <button
                      type="button"
                      onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                      disabled={isLoadingCurrency}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none ${isLoadingCurrency
                        ? 'bg-gray-100 cursor-not-allowed opacity-60'
                        : 'bg-white hover:bg-gray-50'
                        }`}
                    >
                      <span className="truncate">
                        {isLoadingCurrency ? (
                          <span className="flex items-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading currencies...
                          </span>
                        ) : createFormData.currency
                        }
                      </span>
                      {!isLoadingCurrency && (
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`} />
                      )}
                    </button>

                    {isCurrencyOpen && (
                      <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-md shadow-lg">
                        {/* Search Input */}
                        <div className="p-2 border-b border-gray-200">
                          <Input
                            placeholder="Search currencies..."
                            value={currencySearchTerm}
                            onChange={(e) => setCurrencySearchTerm(e.target.value)}
                            className="w-full text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        {/* Currency List */}
                        <div className="max-h-[160px] overflow-y-auto" style={{ maxHeight: '160px' }}>
                          {currencyData
                            .filter(currency =>
                              currency.toLowerCase().includes(currencySearchTerm.toLowerCase())
                            )
                            .map((currency) => (
                              <button
                                key={currency}
                                type="button"
                                onClick={() => {
                                  setCreateFormData(prev => ({ ...prev, currency }))
                                  setIsCurrencyOpen(false)
                                  setCurrencySearchTerm('')
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 min-h-[32px] flex items-center"
                              >
                                {currency}
                              </button>
                            ))}
                          {currencyData.filter(currency =>
                            currency.toLowerCase().includes(currencySearchTerm.toLowerCase())
                          ).length === 0 && (
                              <div className="px-3 py-2 text-sm text-gray-500">
                                No currencies found
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                  {createFormErrors.currency && (
                    <p className="text-red-500 text-xs mt-1">{createFormErrors.currency}</p>
                  )}
                </div>
              </div>

              {/* Delivery of Report Section */}
              <div className="space-y-8">
                {/* Start Date and End Date in same row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-4">
                  {/* Start Date */}
                  <div>
                    {/* Delivery of Report Heading */}
                    <h3 className="text-sm font-semibold text-gray-800 mb-1 mb-4">Delivery of Report</h3>
                    <Label className="block text-xs font-medium text-gray-700 mb-1">
                      Start Date<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={createFormData.startDate ? format(createFormData.startDate, "dd MMM ''yy") : ""}
                        disabled
                        className="w-full border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
                      />
                      <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {createFormErrors.startDate && (
                      <p className="text-red-500 text-xs mt-1 ml-4">&nbsp;Start date required</p>
                    )}
                  </div>

                  {/* End Date */}
                  <div className="flex flex-col justify-end h-full">
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
                            {createFormData.endDate ? format(createFormData.endDate, "dd MMM ''yy") : "Select end date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={createFormData.endDate}
                            onSelect={handleCreateEndDateSelect}
                            numberOfMonths={1}
                            initialFocus
                            defaultMonth={createFormData.startDate || new Date()}
                            disabled={(date) => {
                              // Angular equivalent: [min]="startDate" - disable dates before start date
                              if (createFormData.startDate) {
                                const startDate = new Date(createFormData.startDate)
                                startDate.setHours(0, 0, 0, 0)
                                const dateToCheck = new Date(date)
                                dateToCheck.setHours(0, 0, 0, 0)
                                return dateToCheck < startDate
                              }

                              // If no start date selected, disable dates before today
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)
                              const dateToCheck = new Date(date)
                              dateToCheck.setHours(0, 0, 0, 0)
                              return dateToCheck < today
                            }}
                            fromDate={createFormData.startDate || new Date()}
                            toDate={(() => {
                              const pghEndDate = LocalStorageService.getpghEndDate();
                              if (pghEndDate && pghEndDate !== '0') {
                                return new Date(pghEndDate);
                              }
                              return undefined;
                            })()}
                          />
                          {createDateError && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border-t border-red-200">
                              {createDateError}
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                      {createFormErrors.endDate && (
                        <p className="text-red-500 text-xs mt-1 ml-4">&nbsp;End date required</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Frequency and Week Selection */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Frequency */}
                  <div className={createFormData.frequency === 'fortnightly' || createFormData.frequency === 'monthly' ? 'col-span-1' : 'col-span-2'}>
                    <Label className="block text-xs font-medium text-gray-700 mb-1">
                      Frequency<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative" ref={frequencyRef}>
                      <button
                        type="button"
                        onClick={() => setIsFrequencyOpen(!isFrequencyOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <span className="capitalize">
                          {createFormData.frequency === '1' ? 'Daily' :
                            createFormData.frequency === '2' ? 'Weekly' :
                              createFormData.frequency === '3' ? 'Fortnightly' :
                                createFormData.frequency === '4' ? 'Monthly' : createFormData.frequency}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isFrequencyOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isFrequencyOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                          {[
                            { value: '1', label: 'Daily' },
                            { value: '2', label: 'Weekly' },
                            { value: '3', label: 'Fortnightly' },
                            { value: '4', label: 'Monthly' }
                          ].map((freq, index, array) => (
                            <button
                              key={freq.value}
                              type="button"
                              onClick={() => {
                                handleCreateFrequencyChange(freq.value)
                                setIsFrequencyOpen(false)
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${index === 0 ? 'rounded-tl-md rounded-tr-md' : index === array.length - 1 ? 'rounded-bl-md rounded-br-md' : ''
                                }`}
                            >
                              {freq.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {createFormErrors.frequency && (
                      <p className="text-red-500 text-xs mt-1">{createFormErrors.frequency}</p>
                    )}
                  </div>

                  {/* Week Selection - Conditional */}
                  {(createFormData.frequency === '3' || createFormData.frequency === '4') && (
                    <div>
                      <Label className="block text-xs font-medium text-gray-700 mb-1">
                        {createFormData.frequency === '3' ? 'Weeks' : 'Week'}<span className="text-red-500 ml-1">*</span>
                      </Label>
                      <div className="relative" ref={weekSelectionRef}>
                        <button
                          type="button"
                          onClick={() => setIsWeekSelectionOpen(!isWeekSelectionOpen)}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          <span className="text-sm">
                            {createFormData.frequency === '3'
                              ? (createFormData.weekSelection === '1' ? '1st & 3rd Week' : '2nd & 4th Week')
                              : (createFormData.weekSelection === '1' ? 'First' :
                                createFormData.weekSelection === '2' ? 'Second' :
                                  createFormData.weekSelection === '3' ? 'Third' :
                                    createFormData.weekSelection === '5' ? 'Fourth' : createFormData.weekSelection)
                            }
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isWeekSelectionOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isWeekSelectionOpen && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                            {createFormData.frequency === '3'
                              ? [
                                { value: '1', label: '1st & 3rd Week' },
                                { value: '2', label: '2nd & 4th Week' }
                              ].map((week, index, array) => (
                                <button
                                  key={week.value}
                                  type="button"
                                  onClick={() => {
                                    setCreateFormData(prev => ({ ...prev, weekSelection: week.value }))
                                    setIsWeekSelectionOpen(false)
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${index === 0 ? 'rounded-tl-md rounded-tr-md' : index === array.length - 1 ? 'rounded-bl-md rounded-br-md' : ''
                                    }`}
                                >
                                  {week.label}
                                </button>
                              ))
                              : [
                                { value: '1', label: 'First' },
                                { value: '2', label: 'Second' },
                                { value: '3', label: 'Third' },
                                { value: '5', label: 'Fourth' }
                              ].map((week, index, array) => (
                                <button
                                  key={week.value}
                                  type="button"
                                  onClick={() => {
                                    setCreateFormData(prev => ({ ...prev, weekSelection: week.value }))
                                    setIsWeekSelectionOpen(false)
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${index === 0 ? 'rounded-tl-md rounded-tr-md' : index === array.length - 1 ? 'rounded-bl-md rounded-br-md' : ''
                                    }`}
                                >
                                  {week.label}
                                </button>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Days of the Week */}
                {createFormData.frequency !== '2' && createFormData.frequency !== '4' && (
                  <div className="w-full">
                    <Label className="block text-xs font-medium text-gray-700 mb-2">
                      Days of the Week
                    </Label>
                    <div className="flex gap-2">
                      {daysOfWeek.map((day) => {
                        const dayValue = dayValuesMap[day]
                        const isSelected = createFormData.selectedDaysOfWeek.includes(dayValue)
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleCreateDayToggle(day)}
                            className={`px-2 py-1 text-sm rounded-md border transition-colors ${isSelected
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            {day}
                          </button>
                        )
                      })}
                    </div>
                    {createFormErrors.daysOfWeek && (
                      <p className="text-red-500 text-xs mt-1">{createFormErrors.daysOfWeek}</p>
                    )}
                  </div>
                )}

                {/* Day of the Week (Single Select) */}
                {(createFormData.frequency === '2' || createFormData.frequency === '4') && (
                  <div className="w-full">
                    <Label className="block text-xs font-medium text-gray-700 mb-2">
                      Day of the Week
                    </Label>
                    <div className="flex gap-2">
                      {daysOfWeek.map((day) => {
                        const dayValue = dayValuesMap[day]
                        const isSelected = createFormData.selectedDaysOfWeek.includes(dayValue)
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleCreateDayToggle(day)}
                            className={`px-2 py-1 text-sm rounded-md border transition-colors ${isSelected
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            {day}
                          </button>
                        )
                      })}
                    </div>
                    {createFormErrors.daysOfWeek && (
                      <p className="text-red-500 text-xs mt-1">{createFormErrors.daysOfWeek}</p>
                    )}
                  </div>
                )}

                {/* Delivery Time, AM/PM, Time Zone */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Delivery Time */}
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 mb-1">
                      Delivery Time<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative" ref={deliveryTimeRef}>
                      <button
                        type="button"
                        onClick={() => setIsDeliveryTimeOpen(!isDeliveryTimeOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <span>{createFormData.deliveryTime}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDeliveryTimeOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isDeliveryTimeOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-[160px] overflow-y-auto">
                          {deliveryTimesData.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => {
                                setCreateFormData(prev => ({ ...prev, deliveryTime: time }))
                                setIsDeliveryTimeOpen(false)
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {createFormErrors.deliveryTime && (
                      <p className="text-red-500 text-xs mt-1">{createFormErrors.deliveryTime}</p>
                    )}
                  </div>

                  {/* AM/PM Toggle */}
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 mb-1">
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="flex">
                      <button
                        type="button"
                        onClick={() => setCreateFormData(prev => ({ ...prev, amPm: '1' }))}
                        className={`flex-1 px-3 py-2 text-sm border-l border-t border-b rounded-l-md transition-colors ${createFormData.amPm === '1'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreateFormData(prev => ({ ...prev, amPm: '2' }))}
                        className={`flex-1 px-3 py-2 text-sm border-r border-t border-b rounded-r-md transition-colors ${createFormData.amPm === '2'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        PM
                      </button>
                    </div>
                  </div>

                  {/* Time Zone */}
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 mb-1">
                      Time Zone<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative" ref={timeZoneRef}>
                      <button
                        type="button"
                        onClick={() => setIsTimeZoneOpen(!isTimeZoneOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <span className="truncate" title={timezoneTooltip}>
                          {timezonesData.find(tz => tz.id === createFormData.timeZone)?.displayName || createFormData.timeZone}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isTimeZoneOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isTimeZoneOpen && (
                        <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-md shadow-lg">
                          {/* Search Input */}
                          <div className="p-2 border-b border-gray-200">
                            <Input
                              placeholder="Search time zones..."
                              value={timeZoneSearchTerm}
                              onChange={(e) => setTimeZoneSearchTerm(e.target.value)}
                              className="w-full text-sm border border-gray-300 focus:!outline-none focus:!ring-0 focus:!border-gray-300 focus:!shadow-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          {/* Time Zone List */}
                          <div className="max-h-[160px] overflow-y-auto" style={{ maxHeight: '160px' }}>
                            {isLoadingTimezone ? (
                              <div className="px-3 py-2 text-sm text-gray-500 flex items-center">
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Loading timezones...
                              </div>
                            ) : (
                              <>
                                {timezonesData
                                  .filter(timezone =>
                                    timezone.displayName.toLowerCase().includes(timeZoneSearchTerm.toLowerCase())
                                  )
                                  .map((timezone) => (
                                    <button
                                      key={timezone.id}
                                      type="button"
                                      onClick={() => {
                                        setCreateFormData(prev => ({ ...prev, timeZone: String(timezone.id) }))
                                        setTimezoneTooltip(timezone.displayName)
                                        setIsTimeZoneOpen(false)
                                        setTimeZoneSearchTerm('')
                                      }}
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                                    >
                                      {timezone.displayName}
                                    </button>
                                  ))}
                                {timezonesData.filter(timezone =>
                                  timezone.displayName.toLowerCase().includes(timeZoneSearchTerm.toLowerCase())
                                ).length === 0 && (
                                    <div className="px-3 py-2 text-sm text-gray-500">
                                      No time zones found
                                    </div>
                                  )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {createFormErrors.timeZone && (
                      <p className="text-red-500 text-xs mt-1">{createFormErrors.timeZone}</p>
                    )}
                  </div>
                </div>

                {/* Recipients */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 mb-2">Recipients</Label>
                  <div className="space-y-2">
                    {/* Existing Recipients */}
                    {createFormData.recipients.map((email, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2 border border-gray-200">
                        <span className="text-sm text-gray-900 truncate">{email}</span>
                        <button
                          onClick={() => {
                            setCreateFormData(prev => ({
                              ...prev,
                              recipients: prev.recipients.filter((_, i) => i !== index)
                            }))
                          }}
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
                        value={createFormData.newRecipient}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, newRecipient: e.target.value }))}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && createFormData.newRecipient && !createFormData.recipients.includes(createFormData.newRecipient)) {
                            setCreateFormData(prev => ({
                              ...prev,
                              recipients: [...prev.recipients, prev.newRecipient],
                              newRecipient: ''
                            }))
                          }
                        }}
                        className="w-full border border-gray-300 focus:!outline-none focus:!ring-0 focus:!border-gray-300 focus:!shadow-none"
                      />
                    </div>
                    {createFormErrors.recipients && (
                      <p className="text-red-500 text-xs mt-1">{createFormErrors.recipients}</p>
                    )}
                  </div>
                </div>




                {/* Time Zone */}

              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleCreateModalClose}
              className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateScheduleSubmit}
              className="h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* First Snackbar */}
      {showSnackbar && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
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
                {snackbarMessage || 'Creating your schedule... please wait.'}
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


      {/* Edit Success Snackbar */}
      {showEditSuccessSnackbar && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 min-w-[600px]">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium whitespace-nowrap">
                Your schedule has been updated successfully!
              </span>
            </div>
            <Button
              onClick={() => setShowEditSuccessSnackbar(false)}
              variant="outline"
              size="sm"
              className="bg-white text-green-600 border-white hover:bg-gray-100 px-4 py-1 h-8 text-sm font-medium ml-auto"
            >
              DONE
            </Button>
          </div>
        </div>
      )}

      {/* Mapping Conflicts Popup */}
      <Dialog open={isMappingConflictsOpen} onOpenChange={setIsMappingConflictsOpen}>
        <DialogContent className="max-w-4xl h-[70vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0 pb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-semibold text-black">Schedule Report</DialogTitle>
            <p className="text-sm text-gray-600 mt-1">Below is the list of unmapped properties.</p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Channel
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Property
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mappingConflictsData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.channelName || item.Channel || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.PropertyName || item.Property || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setIsMappingConflictsOpen(false)}
              className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                console.log('Saving with mapping conflicts...')
                setIsMappingConflictsOpen(false)
                await saveNewScheduleReport(false)
              }}
              className="h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-black">Delete Confirmation</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">Do you really want to delete this record?</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              No
            </Button>
            <Button
              onClick={handleDeleteScheduleReport}
              className="h-9 px-4 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              Yes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </TooltipProvider>
  )
}
