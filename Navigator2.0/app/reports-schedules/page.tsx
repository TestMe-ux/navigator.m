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

// Mock data for channels (independent copy)
const scheduledChannelsData = [
  "All Channels",
  "Agoda", 
  "AgodaID",
  "AgodaIN", 
  "AgodaUS",
  "Booking_Member",
  "Booking.com",
  "BookingAE",
  "Expedia",
  "Hotels.com",
  "Priceline",
  "Travelocity"
]

// Mock data for hotels (independent copy)
const scheduledPrimaryHotelsData = [
  'All Primary Hotels', 'Marriott Executive Apartments Mayfair', 'Chaidee Mansion', 
  'Sukhumvit 12 Bangkok Hotel', 'Holiday Inn Bangkok Silom', 'Marriott Executive Apartments Sukhumvit Park',
  'Grand Palace Hotel', 'Bangkok Marriott Hotel Sukhumvit', 'The Peninsula Bangkok', 
  'Mandarin Oriental Bangkok', 'Shangri-La Hotel Bangkok'
]

const scheduledSecondaryHotelsData = [
  'All Secondary Hotels', 'Anantara Siam Bangkok Hotel', 'The St. Regis Bangkok',
  'Four Seasons Hotel Bangkok', 'InterContinental Bangkok', 'Hilton Bangkok',
  'Hyatt Regency Bangkok', 'Novotel Bangkok Sukhumvit', 'Pullman Bangkok King Power',
  'Centara Grand at CentralWorld', 'Amari Watergate Bangkok'
]

// Mock data for currencies
const currenciesData = [
  'THB', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD',
  'SGD', 'KRW', 'INR', 'MYR', 'PHP', 'VND', 'IDR', 'TWD', 'NZD', 'SEK',
  'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RUB', 'ZAR', 'BRL', 'MXN', 'AED'
]

// Mock data for delivery times
const deliveryTimesData = [
  '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00',
  '09:00', '10:00', '11:00', '12:00'
]

// Mock data for time zones
const timeZonesData = [
  'UTC+05:30', 'UTC+00:00', 'UTC+01:00', 'UTC+02:00', 'UTC+03:00', 'UTC+04:00',
  'UTC+05:00', 'UTC+06:00', 'UTC+07:00', 'UTC+08:00', 'UTC+09:00', 'UTC+10:00',
  'UTC-05:00', 'UTC-04:00', 'UTC-03:00', 'UTC-02:00', 'UTC-01:00', 'UTC-06:00',
  'UTC-07:00', 'UTC-08:00', 'UTC-09:00', 'UTC-10:00', 'UTC-11:00', 'UTC-12:00'
]

// Days of the week data
const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// Mock data for scheduled reports (filtered for scheduled reports only)
const scheduledReportsData = [
  {
    id: "1",
    name: "Chaidee Mansion occ 2",
    deliveryDetail: "Weekly (Mo,Tu,We,Th,Fr)",
    rrdPerReport: 3600,
    totalRrds: 2754000,
    status: "Active"
  },
  {
    id: "2",
    name: "Chaidee Mansion",
    deliveryDetail: "Weekly (We)",
    rrdPerReport: 176,
    totalRrds: 19888,
    status: "Inactive"
  },
  {
    id: "3",
    name: "Chaidee Mansion",
    deliveryDetail: "Weekly (We)",
    rrdPerReport: 176,
    totalRrds: 15664,
    status: "Active"
  },
  {
    id: "4",
    name: "Chaidee Mansion",
    deliveryDetail: "Weekly (Mo,Tu,We,Th,Fr)",
    rrdPerReport: 1100,
    totalRrds: 332200,
    status: "Inactive"
  },
  {
    id: "5",
    name: "001",
    deliveryDetail: "Weekly (Mo,Tu,We,Th,Fr,Sa)",
    rrdPerReport: 1440,
    totalRrds: 498240,
    status: "Active"
  }
]

export default function ScheduledReportsPage() {
  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingCycle, setLoadingCycle] = useState(1)

  // Existing states
  const [reportType, setReportType] = useState("All")
  const [dateRange, setDateRange] = useState<{ start: Date | undefined; end: Date | undefined }>({ start: undefined, end: undefined })
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null })
  
  
  // Modal state for schedule settings
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  
  // Modal state for edit schedule
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<any>(null)
  
  // Form data state for schedule settings
  const [scheduleFormData, setScheduleFormData] = useState({
    selectedChannels: ['All Channels'],
    compSet: 'primary',
    selectedPrimaryHotels: ['All Primary Hotels'],
    selectedSecondaryHotels: ['All Secondary Hotels'],
    guests: '1',
    los: '1',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    recipients: ['rahul.kumar@rategain.com'],
    newRecipient: '',
    scheduleName: '',
    frequency: 'daily',
    time: '06:00',
    weekSelection: '1st & 3rd Week' // For fortnightly
  })

  // Form data state for edit schedule
  const [editFormData, setEditFormData] = useState({
    selectedChannels: ['All Channels'],
    compSet: 'primary',
    selectedPrimaryHotels: ['All Primary Hotels'],
    selectedSecondaryHotels: ['All Secondary Hotels'],
    guests: '1',
    los: '1',
    advanceShopDays: '0',
    checkInDates: '60',
    currency: 'THB',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    recipients: ['rahul.kumar@rategain.com'],
    newRecipient: '',
    scheduleName: '',
    frequency: 'daily',
    time: '06:00',
    selectedDays: ['Mo', 'Tu', 'We', 'Th', 'Fr'] as string[],
    deliveryTime: '08:00',
    amPm: 'AM',
    timeZone: 'UTC+05:30',
    weekSelection: '1st & 3rd Week' // For fortnightly/monthly
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
    recipients: ''
  })

  // Date validation state for edit
  const [editDateError, setEditDateError] = useState('')

  // Snackbar state
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [showSecondSnackbar, setShowSecondSnackbar] = useState(false)
  const [showEditSuccessSnackbar, setShowEditSuccessSnackbar] = useState(false)

  // State for dropdowns
  const [isChannelsOpen, setIsChannelsOpen] = useState(false)
  const [isPrimaryHotelsOpen, setIsPrimaryHotelsOpen] = useState(false)
  const [isSecondaryHotelsOpen, setIsSecondaryHotelsOpen] = useState(false)
  const [isGuestsOpen, setIsGuestsOpen] = useState(false)
  const [isLosOpen, setIsLosOpen] = useState(false)
  const [isFrequencyOpen, setIsFrequencyOpen] = useState(false)
  const [isWeekSelectionOpen, setIsWeekSelectionOpen] = useState(false)
  
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
  const frequencyRef = useRef<HTMLDivElement>(null)
  const weekSelectionRef = useRef<HTMLDivElement>(null)

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
      if (frequencyRef.current && !frequencyRef.current.contains(event.target as Node)) {
        setIsFrequencyOpen(false)
      }
      if (weekSelectionRef.current && !weekSelectionRef.current.contains(event.target as Node)) {
        setIsWeekSelectionOpen(false)
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

  // Handle filter changes
  const handleDateRangeChange = (startDate: Date | undefined, endDate: Date | undefined) => {
    setDateRange({ start: startDate, end: endDate })
    console.log('Date range changed:', { startDate, endDate })
  }

  const handleReportTypeChange = (newReportType: string) => {
    setReportType(newReportType)
    console.log('Report type changed:', newReportType)
  }

  const handleRefresh = () => {
    console.log('Refreshing scheduled reports...')
  }

  const handleCreateSchedule = () => {
    setIsScheduleModalOpen(true)
  }

  const handleEditSchedule = (schedule: any) => {
    setEditingSchedule(schedule)
    
    // Pre-populate the form with realistic default values (as if editing existing data)
    const currentDate = new Date()
    const nextWeek = new Date(currentDate)
    nextWeek.setDate(currentDate.getDate() + 7)
    const nextMonth = new Date(currentDate)
    nextMonth.setMonth(currentDate.getMonth() + 1)
    
    setEditFormData({
      selectedChannels: ['Agoda', 'Booking.com', 'Expedia'],
      compSet: 'primary',
      selectedPrimaryHotels: ['Marriott Executive Apartments Mayfair', 'Sukhumvit 12 Bangkok Hotel'],
      selectedSecondaryHotels: ['Anantara Siam Bangkok Hotel', 'The St. Regis Bangkok'],
      guests: '2',
      los: '3',
      advanceShopDays: '7',
      checkInDates: '30',
      currency: 'USD',
      startDate: nextWeek,
      endDate: nextMonth,
      recipients: ['rahul.kumar@rategain.com', 'manager@hotel.com'],
      newRecipient: '',
      scheduleName: schedule.name,
      frequency: 'weekly',
      time: '06:00',
      selectedDays: ['Mo', 'Tu', 'We', 'Th', 'Fr'],
      deliveryTime: '09:00',
      amPm: 'AM',
      timeZone: 'UTC+07:00',
      weekSelection: '1st & 3rd Week'
    })
    
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
      recipients: ''
    })
    
    setIsEditModalOpen(true)
  }

  // Handle day selection
  const handleDayToggle = (day: string) => {
    setEditFormData(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day]
    }))
  }

  // Form handling functions
  const handleFormChange = (field: string, value: string) => {
    setScheduleFormData(prev => ({ ...prev, [field]: value }))
  }

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

  const handleCreateScheduleSubmit = () => {
    // Validate form before proceeding
    if (!validateScheduleForm()) {
      return // Don't proceed if validation fails
    }

    console.log('Creating schedule with data:', scheduleFormData)
    setIsScheduleModalOpen(false)
    setShowSnackbar(true)
    // Reset form
    setScheduleFormData({
      selectedChannels: ['All Channels'],
      compSet: 'primary',
      selectedPrimaryHotels: ['All Primary Hotels'],
      selectedSecondaryHotels: ['All Secondary Hotels'],
      guests: '1',
      los: '1',
      startDate: undefined,
      endDate: undefined,
      recipients: ['rahul.kumar@rategain.com'],
      newRecipient: '',
      scheduleName: '',
      frequency: 'daily',
      time: '06:00',
      weekSelection: '1st & 3rd Week'
    })
    setIsChannelsOpen(false)
    setIsPrimaryHotelsOpen(false)
    setIsSecondaryHotelsOpen(false)
    setIsGuestsOpen(false)
    setIsLosOpen(false)
    setIsFrequencyOpen(false)
    setIsWeekSelectionOpen(false)
    setIsStartDateOpen(false)
    setIsEndDateOpen(false)
    setDateError('')
  }

  const handleCancel = () => {
    setIsScheduleModalOpen(false)
    // Reset form
    setScheduleFormData({
      selectedChannels: ['All Channels'],
      compSet: 'primary',
      selectedPrimaryHotels: ['All Primary Hotels'],
      selectedSecondaryHotels: ['All Secondary Hotels'],
      guests: '1',
      los: '1',
      startDate: undefined,
      endDate: undefined,
      recipients: ['rahul.kumar@rategain.com'],
      newRecipient: '',
      scheduleName: '',
      frequency: 'daily',
      time: '06:00',
      weekSelection: '1st & 3rd Week'
    })
    setIsChannelsOpen(false)
    setIsPrimaryHotelsOpen(false)
    setIsSecondaryHotelsOpen(false)
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

  // Handle channel selection
  const handleChannelToggle = (channel: string) => {
    setScheduleFormData(prev => {
      let newChannels = [...prev.selectedChannels]
      
      if (channel === 'All Channels') {
        if (newChannels.includes('All Channels')) {
          newChannels = []
        } else {
          newChannels = [...scheduledChannelsData]
        }
      } else {
        if (newChannels.includes(channel)) {
          newChannels = newChannels.filter(c => c !== channel)
          newChannels = newChannels.filter(c => c !== 'All Channels')
        } else {
          newChannels.push(channel)
          
          const individualChannels = scheduledChannelsData.filter(c => c !== 'All Channels')
          const selectedIndividualChannels = newChannels.filter(c => c !== 'All Channels')
          
          if (selectedIndividualChannels.length === individualChannels.length) {
            if (!newChannels.includes('All Channels')) {
              newChannels.push('All Channels')
            }
          }
        }
        
        if (newChannels.length === 0) {
          newChannels = ['All Channels']
        }
      }
      
      return { ...prev, selectedChannels: newChannels }
    })
  }

  // Check if a channel should be checked
  const isChannelSelected = (channel: string) => {
    if (scheduleFormData.selectedChannels.includes('All Channels')) {
      return true
    }
    return scheduleFormData.selectedChannels.includes(channel)
  }

  // Handle primary hotel selection
  const handlePrimaryHotelToggle = (hotel: string) => {
    setScheduleFormData(prev => {
      let newHotels = [...prev.selectedPrimaryHotels]
      
      if (hotel === 'All Primary Hotels') {
        if (newHotels.includes('All Primary Hotels')) {
          newHotels = []
        } else {
          newHotels = [...scheduledPrimaryHotelsData]
        }
      } else {
        if (newHotels.includes(hotel)) {
          newHotels = newHotels.filter(h => h !== hotel)
          newHotels = newHotels.filter(h => h !== 'All Primary Hotels')
        } else {
          newHotels.push(hotel)
          
          const individualHotels = scheduledPrimaryHotelsData.filter(h => h !== 'All Primary Hotels')
          const selectedIndividualHotels = newHotels.filter(h => h !== 'All Primary Hotels')
          
          if (selectedIndividualHotels.length === individualHotels.length) {
            if (!newHotels.includes('All Primary Hotels')) {
              newHotels.push('All Primary Hotels')
            }
          }
        }
        
        if (newHotels.length === 0) {
          newHotels = ['All Primary Hotels']
        }
      }
      
      return { ...prev, selectedPrimaryHotels: newHotels }
    })
  }

  // Handle secondary hotel selection
  const handleSecondaryHotelToggle = (hotel: string) => {
    setScheduleFormData(prev => {
      let newHotels = [...prev.selectedSecondaryHotels]
      
      if (hotel === 'All Secondary Hotels') {
        if (newHotels.includes('All Secondary Hotels')) {
          newHotels = []
        } else {
          newHotels = [...scheduledSecondaryHotelsData]
        }
      } else {
        if (newHotels.includes(hotel)) {
          newHotels = newHotels.filter(h => h !== hotel)
          newHotels = newHotels.filter(h => h !== 'All Secondary Hotels')
        } else {
          newHotels.push(hotel)
          
          const individualHotels = scheduledSecondaryHotelsData.filter(h => h !== 'All Secondary Hotels')
          const selectedIndividualHotels = newHotels.filter(h => h !== 'All Secondary Hotels')
          
          if (selectedIndividualHotels.length === individualHotels.length) {
            if (!newHotels.includes('All Secondary Hotels')) {
              newHotels.push('All Secondary Hotels')
            }
          }
        }
        
        if (newHotels.length === 0) {
          newHotels = ['All Secondary Hotels']
        }
      }
      
      return { ...prev, selectedSecondaryHotels: newHotels }
    })
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
    // Show second snackbar after 4 seconds
    setTimeout(() => {
      setShowSecondSnackbar(true)
    }, 4000)
  }

  const handleSecondSnackbarClose = () => {
    setShowSecondSnackbar(false)
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
    } else if (parseInt(editFormData.checkInDates) < 1 || parseInt(editFormData.checkInDates) > 365) {
      errors.checkInDates = 'Check-in dates must be between 1 and 365'
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
    setScheduleFormData(prev => ({ ...prev, startDate: date }))
    
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
  const sortedScheduledReportsData = [...scheduledReportsData].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0

    const aValue = a[sortConfig.key as keyof typeof a]
    const bValue = b[sortConfig.key as keyof typeof b]

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
              <ScheduledReportsHeader />
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
                    <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      <div className="col-span-2 capitalize flex items-center">Scheduled Reports</div>
                      <div className="col-span-3 capitalize flex items-center">Delivery Detail</div>
                      <div 
                        className="col-span-2 flex items-center gap-1 capitalize cursor-pointer group"
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
                        className="col-span-2 flex items-center gap-1 capitalize cursor-pointer group"
                        onClick={() => handleSort('totalRrds')}
                      >
                        Total RRDs
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                          {getHoverIcon('totalRrds')}
                        </span>
                        <span className="opacity-100">
                          {getSortIcon('totalRrds')}
                        </span>
                      </div>
                      <div 
                        className="col-span-2 flex items-center gap-1 capitalize cursor-pointer group"
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
                      <div className="col-span-1 capitalize flex items-center">Action</div>
                    </div>
                  </div>
                  
                  {/* Table Body */}
                  <div className="bg-white dark:bg-gray-900 rounded-b-lg">
                    {sortedScheduledReportsData.map((report, index) => {
                      
                      return (
                      <div 
                        key={report.id} 
                        className={`grid grid-cols-12 gap-3 px-4 py-2 text-sm ${
                          index === scheduledReportsData.length - 1 ? '' : 'border-b border-gray-100 dark:border-gray-800'
                        } ${
                          index % 2 === 0 
                            ? 'bg-white dark:bg-gray-900' 
                            : 'bg-gray-50 dark:bg-gray-800/50'
                        } ${
                          index === scheduledReportsData.length - 1 ? 'rounded-b-lg' : ''
                        }`}
                      >
                        <div className="col-span-2 flex items-center">
                          <span className="text-gray-900 dark:text-gray-100 font-medium">
                            {report.name}
                          </span>
                        </div>
                        <div className="col-span-3 flex items-center text-gray-700 dark:text-gray-300">
                          {report.deliveryDetail}
                        </div>
                        <div className="col-span-2 flex items-center font-medium">
                          {report.rrdPerReport.toLocaleString()}
                        </div>
                        <div className="col-span-2 flex items-center font-medium">
                          {report.totalRrds.toLocaleString()}
                        </div>
                        <div className="col-span-2 flex items-center">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              report.status === "Active" 
                                ? "text-green-600 border-green-600 bg-green-50 dark:bg-green-900/20"
                                : "text-red-600 border-red-600 bg-red-50 dark:bg-red-900/20"
                            }`}
                          >
                            {report.status}
                          </Badge>
                        </div>
                        <div className="col-span-1 flex items-center">
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
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-black text-white border-black text-xs px-2 py-1">
                                <p>Delete Schedule</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    {/* Create Schedule Modal */}
    <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0 pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold text-black">Create New Schedule</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 pr-1.5 min-w-0">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Configure Section */}
          <div className="space-y-8">
            {/* Schedule Name */}
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-1">
                Schedule Name<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                placeholder="Enter schedule name"
                value={scheduleFormData.scheduleName}
                onChange={(e) => handleFormChange('scheduleName', e.target.value)}
                className="w-full border border-gray-300 focus:!outline-none focus:!ring-0 focus:!border-gray-300 focus:!shadow-none"
              />
              {formErrors.scheduleName && (
                <p className="text-red-500 text-xs mt-1">{formErrors.scheduleName}</p>
              )}
            </div>

            {/* Frequency and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Frequency and Week Selection */}
              <div className="grid grid-cols-2 gap-2">
                {/* Frequency */}
                <div className={scheduleFormData.frequency === 'fortnightly' || scheduleFormData.frequency === 'monthly' ? 'col-span-1' : 'col-span-2'}>
                  <Label className="block text-xs font-medium text-gray-700 mb-1">
                    Frequency<span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="relative" ref={frequencyRef}>
                    <button
                      type="button"
                      onClick={() => setIsFrequencyOpen(!isFrequencyOpen)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      <span className="capitalize">{scheduleFormData.frequency}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isFrequencyOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isFrequencyOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                        {['daily', 'weekly', 'fortnightly', 'monthly'].map((freq, index, array) => (
                          <button
                            key={freq}
                            type="button"
                            onClick={() => {
                              handleFormChange('frequency', freq)
                              setIsFrequencyOpen(false)
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 capitalize ${
                              index === 0 ? 'rounded-tl-md rounded-tr-md' : index === array.length - 1 ? 'rounded-bl-md rounded-br-md' : ''
                            }`}
                          >
                            {freq}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Week Selection - Conditional */}
                {(scheduleFormData.frequency === 'fortnightly' || scheduleFormData.frequency === 'monthly') && (
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 mb-1">
                      {scheduleFormData.frequency === 'fortnightly' ? 'Weeks' : 'Week'}<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative" ref={weekSelectionRef}>
                      <button
                        type="button"
                        onClick={() => setIsWeekSelectionOpen(!isWeekSelectionOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <span className="text-sm">{scheduleFormData.weekSelection}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isWeekSelectionOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isWeekSelectionOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                          {scheduleFormData.frequency === 'fortnightly' 
                            ? ['1st & 3rd Week', '2nd & 4th Week'].map((week, index, array) => (
                              <button
                                key={week}
                                type="button"
                                onClick={() => {
                                  handleFormChange('weekSelection', week)
                                  setIsWeekSelectionOpen(false)
                                }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                                  index === 0 ? 'rounded-tl-md rounded-tr-md' : index === array.length - 1 ? 'rounded-bl-md rounded-br-md' : ''
                                }`}
                              >
                                {week}
                              </button>
                            ))
                            : ['1st Week', '2nd Week', '3rd Week', '4th Week'].map((week, index, array) => (
                              <button
                                key={week}
                                type="button"
                                onClick={() => {
                                  handleFormChange('weekSelection', week)
                                  setIsWeekSelectionOpen(false)
                                }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                                  index === 0 ? 'rounded-tl-md rounded-tr-md' : index === array.length - 1 ? 'rounded-bl-md rounded-br-md' : ''
                                }`}
                              >
                                {week}
                              </button>
                            ))
                          }
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Time */}
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Time<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  type="time"
                  value={scheduleFormData.time}
                  onChange={(e) => handleFormChange('time', e.target.value)}
                  className="w-full border border-gray-300 focus:!outline-none focus:!ring-0 focus:!border-gray-300 focus:!shadow-none"
                />
              </div>
            </div>

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
                    {scheduleFormData.selectedChannels.includes('All Channels')
                      ? "All Channels"
                      : scheduleFormData.selectedChannels.length === 1 
                        ? scheduleFormData.selectedChannels[0]
                        : `${scheduleFormData.selectedChannels.length} channels selected`
                    }
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isChannelsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isChannelsOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {scheduledChannelsData.map((channel) => (
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
                value={scheduleFormData.compSet}
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
                      {scheduledPrimaryHotelsData.map((hotel) => (
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
                      {scheduledSecondaryHotelsData.map((hotel) => (
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
                    <span>{scheduleFormData.guests}</span>
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
                    <span>{scheduleFormData.los}</span>
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
                      {scheduleFormData.startDate ? format(scheduleFormData.startDate, "dd MMM ''yy") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduleFormData.startDate}
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
                      {scheduleFormData.endDate ? format(scheduleFormData.endDate, "dd MMM ''yy") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduleFormData.endDate}
                      onSelect={handleEndDateSelect}
                      numberOfMonths={1}
                      initialFocus
                       disabled={(date) => {
                         const today = new Date(new Date().setHours(0, 0, 0, 0))
                         const isBeforeToday = date < today
                         const isBeforeStartDate = scheduleFormData.startDate && date < scheduleFormData.startDate
                         return Boolean(isBeforeToday || isBeforeStartDate)
                       }}
                      fromDate={scheduleFormData.startDate || new Date()}
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
                {scheduleFormData.recipients.map((email, index) => (
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
                    value={scheduleFormData.newRecipient}
                    onChange={(e) => handleFormChange('newRecipient', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                    className="w-full border border-gray-300 focus:!outline-none focus:!ring-0 focus:!border-gray-300 focus:!shadow-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        </div>
        
        {/* Action Buttons */}
        <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateScheduleSubmit}
            className="h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Create Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Edit Scheduled Report Modal */}
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col overflow-hidden">
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
                    {editFormData.selectedChannels.includes('All Channels')
                      ? "All Channels"
                      : editFormData.selectedChannels.length === 1 
                        ? editFormData.selectedChannels[0]
                        : `${editFormData.selectedChannels.length} channels selected`
                    }
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isEditChannelsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isEditChannelsOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {scheduledChannelsData.map((channel) => (
                      <label
                        key={channel}
                        className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={editFormData.selectedChannels.includes('All Channels') || editFormData.selectedChannels.includes(channel)}
                          onChange={() => {
                            // Handle channel toggle logic here
                            console.log('Toggle channel:', channel)
                          }}
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
                    <span>Primary (10)</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </Label>
                  
                  {/* Primary Hotels Dropdown */}
                  {isEditPrimaryHotelsOpen && (
                    <div className="absolute z-50 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto min-w-80">
                      {scheduledPrimaryHotelsData.map((hotel) => (
                        <label
                          key={hotel}
                          className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={editFormData.selectedPrimaryHotels.includes('All Primary Hotels') || editFormData.selectedPrimaryHotels.includes(hotel)}
                            onChange={() => {
                              console.log('Toggle primary hotel:', hotel)
                            }}
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
                <div className="flex items-center space-x-2 relative" ref={editSecondaryHotelsRef}>
                  <RadioGroupItem value="secondary" id="edit-secondary" />
                  <Label 
                    htmlFor="edit-secondary" 
                    className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer"
                    onClick={() => setIsEditSecondaryHotelsOpen(!isEditSecondaryHotelsOpen)}
                  >
                    <span>Secondary</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </Label>
                  
                  {/* Secondary Hotels Dropdown */}
                  {isEditSecondaryHotelsOpen && (
                    <div className="absolute z-50 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto min-w-80">
                      {scheduledSecondaryHotelsData.map((hotel) => (
                        <label
                          key={hotel}
                          className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={editFormData.selectedSecondaryHotels.includes('All Secondary Hotels') || editFormData.selectedSecondaryHotels.includes(hotel)}
                            onChange={() => {
                              console.log('Toggle secondary hotel:', hotel)
                            }}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{paddingTop: '13px'}}>
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
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((number) => (
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
                    <span>{editFormData.los}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isEditLosOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isEditLosOpen && (
                    <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((number) => (
                        <button
                          key={number}
                          type="button"
                          onClick={() => {
                            setEditFormData(prev => ({ ...prev, los: number.toString() }))
                            setIsEditLosOpen(false)
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                        >
                          {number}
                        </button>
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
                placeholder="Enter number of check-in dates"
                value={editFormData.checkInDates}
                onChange={(e) => setEditFormData(prev => ({ ...prev, checkInDates: e.target.value }))}
                className="w-full border border-gray-300 focus:!outline-none focus:!ring-0 focus:!border-gray-300 focus:!shadow-none"
                min="1"
                max="365"
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
                      {currenciesData
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
                      {currenciesData.filter(currency => 
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
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editFormData.startDate}
                      onSelect={(date) => {
                        setEditFormData(prev => ({ ...prev, startDate: date }))
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
                  <PopoverContent className="w-auto p-0" align="start">
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
              <div className={editFormData.frequency === 'fortnightly' || editFormData.frequency === 'monthly' ? 'col-span-1' : 'col-span-2'}>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Frequency<span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative" ref={editFrequencyRef}>
                  <button
                    type="button"
                    onClick={() => setIsEditFrequencyOpen(!isEditFrequencyOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    <span className="capitalize">{editFormData.frequency}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isEditFrequencyOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isEditFrequencyOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      {['daily', 'weekly', 'fortnightly', 'monthly'].map((freq, index, array) => (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => {
                            setEditFormData(prev => ({ ...prev, frequency: freq }))
                            setIsEditFrequencyOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 capitalize ${
                            index === 0 ? 'rounded-tl-md rounded-tr-md' : index === array.length - 1 ? 'rounded-bl-md rounded-br-md' : ''
                          }`}
                        >
                          {freq}
                        </button>
                      )                    )}
                  </div>
                )}
                </div>
                {editFormErrors.frequency && (
                  <p className="text-red-500 text-xs mt-1">{editFormErrors.frequency}</p>
                )}
              </div>

              {/* Week Selection - Conditional */}
              {(editFormData.frequency === 'fortnightly' || editFormData.frequency === 'monthly') && (
                <div>
                  <Label className="block text-xs font-medium text-gray-700 mb-1">
                    {editFormData.frequency === 'fortnightly' ? 'Weeks' : 'Week'}<span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="relative" ref={editWeekSelectionRef}>
                    <button
                      type="button"
                      onClick={() => setIsEditWeekSelectionOpen(!isEditWeekSelectionOpen)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      <span className="text-sm">{editFormData.weekSelection}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isEditWeekSelectionOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isEditWeekSelectionOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                        {editFormData.frequency === 'fortnightly' 
                          ? ['1st & 3rd Week', '2nd & 4th Week'].map((week, index, array) => (
                            <button
                              key={week}
                              type="button"
                              onClick={() => {
                                setEditFormData(prev => ({ ...prev, weekSelection: week }))
                                setIsEditWeekSelectionOpen(false)
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                                index === 0 ? 'rounded-tl-md rounded-tr-md' : index === array.length - 1 ? 'rounded-bl-md rounded-br-md' : ''
                              }`}
                            >
                              {week}
                            </button>
                          ))
                          : ['1st Week', '2nd Week', '3rd Week', '4th Week'].map((week, index, array) => (
                            <button
                              key={week}
                              type="button"
                              onClick={() => {
                                setEditFormData(prev => ({ ...prev, weekSelection: week }))
                                setIsEditWeekSelectionOpen(false)
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                                index === 0 ? 'rounded-tl-md rounded-tr-md' : index === array.length - 1 ? 'rounded-bl-md rounded-br-md' : ''
                              }`}
                            >
                              {week}
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
            <div className="max-w-xs">
              <Label className="block text-xs font-medium text-gray-700 mb-2">Days of the Week</Label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-2 py-1 text-sm rounded-md border transition-colors ${
                      editFormData.selectedDays.includes(day)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

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
                    onClick={() => setEditFormData(prev => ({ ...prev, amPm: 'AM' }))}
                    className={`flex-1 px-3 py-2 text-sm border-l border-t border-b rounded-l-md transition-colors ${
                      editFormData.amPm === 'AM'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditFormData(prev => ({ ...prev, amPm: 'PM' }))}
                    className={`flex-1 px-3 py-2 text-sm border-r border-t border-b rounded-r-md transition-colors ${
                      editFormData.amPm === 'PM'
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
                    <span className="truncate">{editFormData.timeZone}</span>
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
                        {timeZonesData
                          .filter(timezone => 
                            timezone.toLowerCase().includes(timeZoneSearchTerm.toLowerCase())
                          )
                          .map((timezone) => (
                          <button
                            key={timezone}
                            type="button"
                            onClick={() => {
                              setEditFormData(prev => ({ ...prev, timeZone: timezone }))
                              setIsEditTimeZoneOpen(false)
                              setTimeZoneSearchTerm('')
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                          >
                            {timezone}
                          </button>
                        ))}
                        {timeZonesData.filter(timezone => 
                          timezone.toLowerCase().includes(timeZoneSearchTerm.toLowerCase())
                        ).length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            No time zones found
                          </div>
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
          <Button
            onClick={handleUpdateSchedule}
            className="h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Update Schedule
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
              Creating your schedule... please wait.
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
        <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 min-w-[600px]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium whitespace-nowrap">
              Your schedule has been created successfully and is now active!
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

    </TooltipProvider>
  )
}
