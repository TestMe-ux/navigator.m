"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  ChevronDown,
  Loader2,
  CalendarIcon,
  X
} from "lucide-react"
import { format, addDays } from "date-fns"
import {
  getChannelList,
  checkMappingValidation,
  generateOndemandReport,
  getSummaryData
} from "@/lib/reports"

// Types and interfaces
interface OnDemandFormData {
  selectedChannels: string[]
  compSet: 'primary' | 'secondary'
  selectedPrimaryHotels: string[]
  selectedSecondaryHotels: string[]
  guests: string
  los: string
  startDate: Date | undefined
  endDate: Date | undefined
  recipients: string[]
  newRecipient: string
  compsetData: any
}

interface OnDemandFormErrors {
  channels: string
  compSet: string
  guests: string
  los: string
  startDate: string
  endDate: string
  recipients: string
  general: string
}


// interface PropertyDetails {
//   sid: string
//   name: string
// }

interface PackageDetails {
  totalShopsAlloted: number
  totalShopsConsumedYearly: number
}


interface OnDemandReportModalProps {
  isOpen: boolean
  onClose: () => void
  userDetails: any
  selectedProperty: any
  packageDetails: any
  compsetData: any
  onReportGenerated?: (reportId: number) => void
  onError?: (error: string) => void
}

// Form validation functions
const validateForm = (formData: OnDemandFormData): OnDemandFormErrors => {
  const errors: OnDemandFormErrors = {
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

  // Validate compSet
  if (formData.compSet === 'primary' && formData.selectedPrimaryHotels.length === 0) {
    errors.compSet = 'Please select at least one primary hotel'
  } else if (formData.compSet === 'secondary' && formData.selectedSecondaryHotels.length === 0) {
    errors.compSet = 'Please select at least one secondary hotel'
  }

  // Validate guests
  if (!formData.guests || formData.guests === '') {
    errors.guests = 'Please select number of guests'
  } else {
    const guestsNum = parseInt(formData.guests)
    if (isNaN(guestsNum) || guestsNum < 1 || guestsNum > 12) {
      errors.guests = 'Please select a valid number of guests (1-12)'
    }
  }

  // Validate LOS
  if (!formData.los || formData.los === '') {
    errors.los = 'Please select length of stay'
  } else {
    const losNum = parseInt(formData.los)
    if (isNaN(losNum) || losNum < 1 || losNum > 31) {
      errors.los = 'Please select a valid length of stay (1-31)'
    }
  }

  // Validate start date
  if (!formData.startDate) {
    errors.startDate = 'Please select a start date'
  } else {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDate = new Date(formData.startDate)
    startDate.setHours(0, 0, 0, 0)

    if (startDate < today) {
      errors.startDate = 'Start date cannot be in the past'
    }
  }

  // Validate end date
  if (!formData.endDate) {
    errors.endDate = 'Please select an end date'
  } else {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = new Date(formData.endDate)
    endDate.setHours(0, 0, 0, 0)

    if (endDate < today) {
      errors.endDate = 'End date cannot be in the past'
    } else if (formData.startDate) {
      const startDate = new Date(formData.startDate)
      startDate.setHours(0, 0, 0, 0)

      if (endDate < startDate) {
        errors.endDate = 'End date cannot be before start date'
      }
    }
  }

  // Validate recipients (optional but if provided, should be valid emails)
  if (formData.recipients.length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = formData.recipients.filter(email => !emailRegex.test(email))

    if (invalidEmails.length > 0) {
      errors.recipients = 'Please provide valid email addresses'
    }
  }

  return errors
}

const clearFieldError = (errors: OnDemandFormErrors, field: keyof OnDemandFormErrors): OnDemandFormErrors => {
  return {
    ...errors,
    [field]: ''
  }
}

// API integration functions
const fetchChannelsData = async (sid: string): Promise<{
  channels: string[]
  disabledChannels: string[]
  isAnyDisabledChannel: boolean
}> => {
  try {
    const response = await getChannelList({ "SID": sid })

    if (response.status && response.body) {
      const channels = response.body.map((channel: any) => channel.name || channel)
      const disabledChannels = response.body
        .filter((channel: any) => channel.isDisabled)
        .map((channel: any) => channel.name || channel)

      return {
        channels,
        disabledChannels,
        isAnyDisabledChannel: disabledChannels.length > 0
      }
    }

    return {
      channels: [],
      disabledChannels: [],
      isAnyDisabledChannel: false
    }
  } catch (error) {
    console.error('Error fetching channels data:', error)
    return {
      channels: [],
      disabledChannels: [],
      isAnyDisabledChannel: false
    }
  }
}

const validateMapping = async (
  formData: OnDemandFormData,
  selectedProperty: any
): Promise<{
  isValid: boolean
  missingConfigurations: any[]
}> => {
  try {
    const propertyValidation = {
      Properties: [] as string[],
      Channel: [] as string[],
      SID: selectedProperty?.sid,
      SelectedHMID: selectedProperty?.hmid,
      SelectedName: selectedProperty?.name
    }

    // if (formData.compSet === 'primary') {
    //   propertyValidation.Properties = [...formData.selectedPrimaryHotels]
    // } else {
    //   propertyValidation.Properties = [...formData.selectedSecondaryHotels]
    // }
    if (formData.compSet === 'primary') {
      const primaryPropertyIds = formData.compsetData
        .filter((hotel: any) => formData.selectedPrimaryHotels.includes(hotel.name))
        .map((hotel: any) => hotel.propertyID)
      propertyValidation.Properties.push(...primaryPropertyIds)
    } else {
      const secondaryPropertyIds = formData.compsetData
        .filter((hotel: any) => formData.selectedSecondaryHotels.includes(hotel.name))
        .map((hotel: any) => hotel.propertyID)
      propertyValidation.Properties.push(...secondaryPropertyIds)
    }

    propertyValidation.Channel = [...formData.selectedChannels]

    const response = await checkMappingValidation(propertyValidation)

    if (response.status) {
      return {
        isValid: false,
        missingConfigurations: response.body || []
      }
    } else {
      return {
        isValid: true,
        missingConfigurations: []
      }
    }
  } catch (error) {
    console.error('Error validating mapping:', error)
    return {
      isValid: false,
      missingConfigurations: []
    }
  }
}

const generateOnDemandReport = async (
  formData: OnDemandFormData,
  userDetails: any,
  selectedProperty: any
): Promise<{
  success: boolean
  reportId?: number
  message?: string
}> => {
  try {
    if (!formData.startDate || !formData.endDate) {
      return {
        success: false,
        message: 'Start date and end date are required'
      }
    }

    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)

    // Format start date with timezone - replicate Angular logic exactly
    const currentDate = new Date(startDate)
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const day = String(currentDate.getDate()).padStart(2, '0')
    const formattedDateToday = `${year}-${month}-${day}T00:00:00`
    const newDate = new Date(formattedDateToday)
    const startDateObj = new Date(newDate)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    const timezoneOffset = -startDateObj.getTimezoneOffset()
    const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60)
    const offsetMinutes = Math.abs(timezoneOffset) % 60
    const offsetSign = timezoneOffset > 0 ? '-' : '+'
    const formattedOffset = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`
    const formattedDate = startDateObj.toISOString().split('.')[0]
    const dateStringWithDynamicReversedTimezone = `${formattedDate}${formattedOffset}`
    const dateFirst = new Date(dateStringWithDynamicReversedTimezone)
    let primaryPropertyIds: any = [];
    if (formData.compSet === 'primary') {
      primaryPropertyIds = formData.compsetData
        .filter((hotel: any) => formData.selectedPrimaryHotels.includes(hotel.name))
        .map((hotel: any) => hotel.propertyID)
    } else {
      primaryPropertyIds = formData.compsetData
        .filter((hotel: any) => formData.selectedSecondaryHotels.includes(hotel.name))
        .map((hotel: any) => hotel.propertyID)
      // propertyValidation.Properties.push(...secondaryPropertyIds)
    }

    const requestModel = {
      SID: selectedProperty.sid,
      ContactId: userDetails.userId,
      ContactName: userDetails.firstName + ' ' + userDetails.lastName,
      Name: userDetails.firstName + ' ' + userDetails.lastName,
      FirstCheckInDate: dateFirst,
      LOS: parseInt(formData.los),
      Occupancy: parseInt(formData.guests),
      Sources: formData.selectedChannels,
      Properties: primaryPropertyIds,
      EmailIds: formData.recipients,
      EndDate: endDate,
      ReportSource: 'DownloadReport',
      IsILOSApplicable: false,
      DaysOfData: diffDays + 1
    }

    const response = await generateOndemandReport(requestModel)

    if (response.status) {
      return {
        success: true,
        reportId: response.body?.reportId,
        message: 'Preparing your report... please wait. Processing large data may take some time.'
      }
    } else {
      return {
        success: false,
        message: response.body?.message || 'Failed to generate report'
      }
    }
  } catch (error) {
    console.error('Error generating on-demand report:', error)
    return {
      success: false,
      message: 'Something went wrong, please try again!'
    }
  }
}

const checkShopsLimit = (
  packageDetails: any,
  formData: OnDemandFormData
): boolean => {
  if (!packageDetails || !formData.startDate || !formData.endDate) {
    return false
  }

  const startDate = new Date(formData.startDate)
  const endDate = new Date(formData.endDate)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

  const totalShopsConsumedYearly = packageDetails.totalShopsConsumedYearly || 0
  const totalShopsAlloted = packageDetails.totalShopsAlloted || 0
  if (packageDetails.displayName === 'Monthly' || packageDetails.isExistingUser) {
    return true
  }
  const estimatedShops = diffDays * formData.selectedChannels.length *
    (formData.compSet === 'primary' ? formData.selectedPrimaryHotels.length : formData.selectedSecondaryHotels.length)

  return (totalShopsConsumedYearly + estimatedShops) <= totalShopsAlloted
}


// Notification Components
interface SnackbarProps {
  show: boolean
  message: string
  type: 'success' | 'error' | 'warning'
  onClose: () => void
}

function Snackbar({ show, message, type, onClose }: SnackbarProps) {
  if (!show) return null

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[999]">
      <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 min-w-96 ${type === 'error'
        ? 'bg-red-600 text-white'
        : type === 'warning'
          ? 'bg-yellow-600 text-white'
          : 'bg-blue-600 text-white'
        }`}>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            {type === 'error' ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : type === 'warning' ? (
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
            {message || 'Preparing your report... please wait. Processing large data may take some time.'}
          </span>
        </div>
        <Button
          onClick={onClose}
          variant="outline"
          size="sm"
          className={`px-4 py-1 h-8 text-sm font-medium ${type === 'error'
            ? 'bg-white text-red-600 border-white hover:bg-gray-100'
            : type === 'warning'
              ? 'bg-white text-yellow-600 border-white hover:bg-gray-100'
              : 'bg-white text-blue-600 border-white hover:bg-gray-100'
            }`}
        >
          OK
        </Button>
      </div>
    </div>
  )
}
interface MissingConfigurationNotificationProps {
  show: boolean
  data: any[]
  onClose: () => void
  onReopenModal: () => void
  isGenerating: boolean
}

function MissingConfigurationNotification({
  show,
  data,
  onClose,
  onReopenModal,
  isGenerating
}: MissingConfigurationNotificationProps) {
  if (!show) return null

  return (
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
                {data.map((item, index) => (
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

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={onReopenModal}
              disabled={isGenerating}
              className="h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <span className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </span>
              ) : (
                'Submit'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function OnDemandReportModalConsolidated({
  isOpen,
  onClose,
  userDetails,
  selectedProperty,
  packageDetails,
  compsetData,
  onReportGenerated,
  onError
}: OnDemandReportModalProps) {
  // Form data state
  const [formData, setFormData] = useState<OnDemandFormData>({
    selectedChannels: [],
    compSet: 'primary',
    selectedPrimaryHotels: [],
    selectedSecondaryHotels: [],
    guests: '1',
    los: '1',
    startDate: undefined,
    endDate: undefined,
    recipients: [userDetails?.email],
    newRecipient: '',
    compsetData: []
  })

  // Form validation state
  const [formErrors, setFormErrors] = useState<OnDemandFormErrors>({
    channels: '',
    compSet: '',
    guests: '',
    los: '',
    startDate: '',
    endDate: '',
    recipients: '',
    general: ''
  })

  // Loading states
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingChannels, setIsLoadingChannels] = useState(false)
  const [isLoadingCompSet, setIsLoadingCompSet] = useState(false)

  // Dropdown states
  const [isChannelsOpen, setIsChannelsOpen] = useState(false)
  const [isPrimaryHotelsOpen, setIsPrimaryHotelsOpen] = useState(false)
  const [isSecondaryHotelsOpen, setIsSecondaryHotelsOpen] = useState(false)
  const [isGuestsOpen, setIsGuestsOpen] = useState(false)
  const [isLosOpen, setIsLosOpen] = useState(false)
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)

  // Data states
  const [channelsData, setChannelsData] = useState<string[]>([])
  const [primaryHotelsData, setPrimaryHotelsData] = useState<any[]>([])
  const [secondaryHotelsData, setSecondaryHotelsData] = useState<any[]>([])
  const [disabledChannels, setDisabledChannels] = useState<string[]>([])
  const [isAnyDisabledChannel, setIsAnyDisabledChannel] = useState(false)

  // Search states
  const [searchValue, setSearchValue] = useState('')
  const [primarySearchValue, setPrimarySearchValue] = useState('')
  const [secondarySearchValue, setSecondarySearchValue] = useState('')
  const [totalShopsConsumedYearly, setTotalShopsConsumedYearly] = useState<number>(0)
  const [totalShopsAlloted, setTotalShopsAlloted] = useState<number>(0)
  // Notification states
  const [snackbar, setSnackbar] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'warning'
  })
  const [missingNotification, setMissingNotification] = useState({
    show: false,
    data: [] as any[]
  })
  const [downloadPopup, setDownloadPopup] = useState({
    show: false,
    reportId: null as number | null
  })

  // Refs for dropdown management
  const channelsRef = useRef<HTMLDivElement>(null)
  const primaryHotelsRef = useRef<HTMLDivElement>(null)
  const secondaryHotelsRef = useRef<HTMLDivElement>(null)
  const guestsRef = useRef<HTMLDivElement>(null)
  const losRef = useRef<HTMLDivElement>(null)

  // Date constraints
  const maxDate = addDays(new Date(), 365)
  const maxEndDate = addDays(new Date(), 365)

  // Filtered data based on search
  const filteredChannels = channelsData.filter(channel =>
    channel.toLowerCase().includes(searchValue.toLowerCase())
  )

  const filteredPrimaryHotels = primaryHotelsData.filter(hotel =>
    hotel.name.toLowerCase().includes(primarySearchValue.toLowerCase())
  )

  const filteredSecondaryHotels = secondaryHotelsData.filter(hotel =>
    hotel.name.toLowerCase().includes(secondarySearchValue.toLowerCase())
  )

  // Helper functions
  const isChannelSelected = (channel: string) => {
    return formData.selectedChannels.includes(channel)
  }

  const isPrimaryHotelSelected = (hotelName: string) => {
    return formData.selectedPrimaryHotels.includes(hotelName)
  }

  const isSecondaryHotelSelected = (hotelName: string) => {
    return formData.selectedSecondaryHotels.includes(hotelName)
  }

  // Form handling functions
  const handleFormChange = (field: string, value: string) => {
    if (field === 'compSet' && value === 'secondary') {
      const secondaryNames = secondaryHotelsData.map((compSet: any) => compSet.name)
      setFormData(prev => ({
        ...prev,
        [field]: value,
        selectedSecondaryHotels: secondaryNames,
        selectedPrimaryHotels: []
      }))

      if (formErrors.compSet) {
        setFormErrors(prev => clearFieldError(prev, 'compSet'))
      }
    } else if (field === 'compSet' && value === 'primary') {
      const primaryNames = primaryHotelsData.map((compSet: any) => compSet.name)
      setFormData(prev => ({
        ...prev,
        [field]: value,
        selectedPrimaryHotels: primaryNames,
        selectedSecondaryHotels: []
      }))

      if (formErrors.compSet) {
        setFormErrors(prev => clearFieldError(prev, 'compSet'))
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

      if (formErrors.recipients) {
        setFormErrors(prev => clearFieldError(prev, 'recipients'))
      }
    }
  }

  const handleRemoveRecipient = (email: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(recipient => recipient !== email)
    }))

    if (formErrors.recipients && formData.recipients.length > 1) {
      setFormErrors(prev => clearFieldError(prev, 'recipients'))
    }
  }

  const handleCancel = () => {
    onClose()
    setSearchValue('')
    setPrimarySearchValue('')
    setSecondarySearchValue('')
  }

  // Channel handling functions
  const handleChannelToggle = (channel: string) => {
    setFormData(prev => {
      if (channel === 'Select All') {
        const allChannels = filteredChannels.filter(c => !disabledChannels.includes(c))
        const allSelected = allChannels.every(c => prev.selectedChannels.includes(c))

        if (allSelected) {
          return {
            ...prev,
            selectedChannels: prev.selectedChannels.filter(c => !allChannels.includes(c))
          }
        } else {
          const newSelected = [...new Set([...prev.selectedChannels, ...allChannels])]
          return {
            ...prev,
            selectedChannels: newSelected
          }
        }
      } else {
        const isSelected = prev.selectedChannels.includes(channel)
        if (isSelected) {
          return {
            ...prev,
            selectedChannels: prev.selectedChannels.filter(c => c !== channel)
          }
        } else {
          return {
            ...prev,
            selectedChannels: [...prev.selectedChannels, channel]
          }
        }
      }
    })

    if (formErrors.channels) {
      setFormErrors(prev => clearFieldError(prev, 'channels'))
    }
  }

  // Primary hotel handling functions
  const handlePrimaryHotelToggle = (hotel: string) => {
    setFormData(prev => {
      if (hotel === 'Select All') {
        const allSelected = filteredPrimaryHotels.every(h => prev.selectedPrimaryHotels.includes(h.name))

        if (allSelected) {
          return {
            ...prev,
            selectedPrimaryHotels: []
          }
        } else {
          return {
            ...prev,
            selectedPrimaryHotels: filteredPrimaryHotels.map(h => h.name)
          }
        }
      } else {
        const isSelected = prev.selectedPrimaryHotels.includes(hotel)
        if (isSelected) {
          return {
            ...prev,
            selectedPrimaryHotels: prev.selectedPrimaryHotels.filter(h => h !== hotel)
          }
        } else {
          return {
            ...prev,
            selectedPrimaryHotels: [...prev.selectedPrimaryHotels, hotel]
          }
        }
      }
    })

    if (formErrors.compSet) {
      setFormErrors(prev => clearFieldError(prev, 'compSet'))
    }
  }

  // Secondary hotel handling functions
  const handleSecondaryHotelToggle = (hotel: string) => {
    setFormData(prev => {
      if (hotel === 'Select All') {
        const allSelected = filteredSecondaryHotels.every(h => prev.selectedSecondaryHotels.includes(h.name))

        if (allSelected) {
          return {
            ...prev,
            selectedSecondaryHotels: []
          }
        } else {
          return {
            ...prev,
            selectedSecondaryHotels: filteredSecondaryHotels.map(h => h.name)
          }
        }
      } else {
        const isSelected = prev.selectedSecondaryHotels.includes(hotel)
        if (isSelected) {
          return {
            ...prev,
            selectedSecondaryHotels: prev.selectedSecondaryHotels.filter(h => h !== hotel)
          }
        } else {
          return {
            ...prev,
            selectedSecondaryHotels: [...prev.selectedSecondaryHotels, hotel]
          }
        }
      }
    })

    if (formErrors.compSet) {
      setFormErrors(prev => clearFieldError(prev, 'compSet'))
    }
  }

  // Date handling functions
  const handleStartDateSelect = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, startDate: date }))
    setIsStartDateOpen(false)

    if (formErrors.startDate) {
      setFormErrors(prev => clearFieldError(prev, 'startDate'))
    }
  }

  const handleEndDateSelect = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, endDate: date }))
    setIsEndDateOpen(false)

    if (formErrors.endDate) {
      setFormErrors(prev => clearFieldError(prev, 'endDate'))
    }
  }

  // Data fetching functions
  const fetchChannelsDataAsync = async () => {
    setIsLoadingChannels(true)
    try {
      const data = await fetchChannelsData(selectedProperty.sid)
      setChannelsData(data.channels)
      setDisabledChannels(data.disabledChannels)
      setIsAnyDisabledChannel(data.isAnyDisabledChannel)
      setFormData(prev => {
        return {
          ...prev,
          selectedChannels: data.channels
        }
      })

    } catch (error) {
      console.error('Error fetching channels:', error)
    } finally {
      setIsLoadingChannels(false)
    }
  }

  const fetchCompSetDataAsync = async () => {
    setIsLoadingCompSet(true)
    try {
      const primaryCompSets = compsetData.filter((x: any) => !x.isSecondary)
      const secondaryCompSets = compsetData.filter((x: any) => x.isSecondary)

      // const data = await fetchCompSetData(selectedProperty.sid)
      setPrimaryHotelsData(primaryCompSets)
      setSecondaryHotelsData(secondaryCompSets)

      if (primaryCompSets.length > 0) {
        const primaryNames = primaryCompSets.map((compSet: any) => compSet.name)
        setFormData(prev => ({
          ...prev,
          selectedPrimaryHotels: primaryNames,
          selectedSecondaryHotels: [],
          compsetData: compsetData,
          recipients: [userDetails?.email]
        }))
      }
    } catch (error) {
      console.error('Error fetching compset data:', error)
    } finally {
      setIsLoadingCompSet(false)
    }
  }

  // Report generation function
  const handleGenerate = async () => {
    if (isGenerating) return

    const errors = validateForm(formData)
    setFormErrors(errors)

    if (Object.values(errors).some(error => error !== '')) {
      return
    }

    setIsGenerating(true)

    try {
      debugger;
      const isWithinLimit = checkShopsLimit(packageDetails, formData)

      if (!isWithinLimit) {
        setSnackbar({
          show: true,
          message: "Your request exceeds the current credit limit. Please purchase more credits or modify the report generation criteria to proceed.",
          type: 'error'
        })
        setIsGenerating(false)
        return
      }

      const mappingResult = await validateMapping(formData, selectedProperty)
      debugger;
      if (!mappingResult.isValid) {
        onClose();
        setMissingNotification({
          show: true,
          data: mappingResult.missingConfigurations
        })
        setIsGenerating(false)
        return
      }

      const result = await generateOnDemandReport(formData, userDetails, selectedProperty)

      if (result.success) {
        setSnackbar({
          show: true,
          message: result.message || 'Report generated successfully',
          type: 'success'
        })

        setDownloadPopup({
          show: true,
          reportId: result.reportId || null
        })

        if (onReportGenerated && result.reportId) {
          onReportGenerated(result.reportId)
        }

        onClose()
      } else {
        setSnackbar({
          show: true,
          message: result.message || 'Failed to generate report',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Error during report generation:', error)
      setSnackbar({
        show: true,
        message: 'Something went wrong, please try again!',
        type: 'error'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Notification handlers
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, show: false }))
  }

  const handleDownloadPopupClose = () => {
    setDownloadPopup(prev => ({ ...prev, show: false }))
  }

  const handleMissingNotificationClose = () => {
    setMissingNotification(prev => ({ ...prev, show: false }))
  }

  const handleReopenModal = async () => {
    setIsGenerating(true)
    const result = await generateOnDemandReport(formData, userDetails, selectedProperty)

    if (result.success) {
      setSnackbar({
        show: true,
        message: result.message || 'Report generated successfully',
        type: 'success'
      })

      setDownloadPopup({
        show: true,
        reportId: result.reportId || null
      })

      if (onReportGenerated && result.reportId) {
        onReportGenerated(result.reportId)
      }

      onClose()
    } else {
      setSnackbar({
        show: true,
        message: result.message || 'Failed to generate report',
        type: 'error'
      })
    }
    setIsGenerating(false)
    setMissingNotification(prev => ({ ...prev, show: false }))
  }
  const fetchShopConsumptionData = async () => {
    try {
      const response = await getSummaryData(selectedProperty?.sid?.toString() || '')
      if (response.status) {
        setTotalShopsConsumedYearly(response.body.consumedShopsBatch + response.body.consumedShopsOnDemand + response.body.consumedShopsRTRR)
        setTotalShopsAlloted(response.body.totalShops)
        packageDetails.totalShopsConsumedYearly = response.body.consumedShopsBatch + response.body.consumedShopsOnDemand + response.body.consumedShopsRTRR;
        packageDetails.totalShopsAlloted = response.body.totalShops
      }
    } catch (error) {
      console.error('Error fetching shop consumption data:', error)
    }
  }
  // Effects
  useEffect(() => {
    if (isOpen) {
      Promise.all([
        fetchChannelsDataAsync(),
        fetchCompSetDataAsync(),
        fetchShopConsumptionData()])
    }
  }, [isOpen])

  // Click outside handlers
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
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
              {/* Channels Section */}
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Channels<span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative" ref={channelsRef}>
                  <button
                    type="button"
                    onClick={() => isChannelsOpen ? setIsChannelsOpen(false) : setIsChannelsOpen(true)}
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

              {/* CompSet Section */}
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
                      onClick={isLoadingCompSet ? undefined : () => setIsPrimaryHotelsOpen(!isPrimaryHotelsOpen)}
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
                      onClick={isLoadingCompSet ? undefined : () => setIsSecondaryHotelsOpen(!isSecondaryHotelsOpen)}
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

              {/* Guests and LOS Section */}
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
              {/* Start Date and End Date */}
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

              {/* Recipients Section */}
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

      {/* Notification Components */}
      <Snackbar
        show={snackbar.show}
        message={snackbar.message}
        type={snackbar.type}
        onClose={handleSnackbarClose}
      />
      <MissingConfigurationNotification
        show={missingNotification.show}
        data={missingNotification.data}
        onClose={handleMissingNotificationClose}
        onReopenModal={handleReopenModal}
        isGenerating={isGenerating}
      />
    </>
  )
}
