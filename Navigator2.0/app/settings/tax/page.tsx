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
import {
  getTaxPreference,
  setTaxPreference as setTaxPreferenceAPI,
  getTaxData,
  getHotelsData,
  getChannelsData,
  getTaxSettingHistory,
  getCompleteCompSet,
  getTaxSetting,
  getCurrencyCode,
  saveTaxSettings,
  deleteTaxSetting,
  PreferenceValue,
  type TaxData,
  type HotelData,
  type ChannelData,
  type PropertyData,
  type TaxSetting
} from "@/lib/tax"
import { LocalStorageService } from "@/lib/localstorage"
import { useSelectedProperty } from "@/hooks/use-local-storage"

export default function TaxSettingsPage() {
  console.log('🏗️ TaxSettingsPage component rendering')
  const [taxes, setTaxes] = useState<TaxData[]>([])
  const [hotels, setHotels] = useState<HotelData[]>([])
  const [channels, setChannels] = useState<ChannelData[]>([])
  const [properties, setProperties] = useState<PropertyData[]>([])
  const [taxSettings, setTaxSettings] = useState<TaxSetting[]>([])
  const [taxSettingHistory, setTaxSettingHistory] = useState<any[]>([])
  const [currencyCode, setCurrencyCode] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddTax, setShowAddTax] = useState(false)
  const [showChangeHistory, setShowChangeHistory] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [showDeleteSnackbar, setShowDeleteSnackbar] = useState(false)
  const [showAddTaxSnackbar, setShowAddTaxSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarType, setSnackbarType] = useState<"success" | "error" | "info">("success")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [taxToDelete, setTaxToDelete] = useState<number | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingTaxId, setEditingTaxId] = useState<number | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [isSearch, setIsSearch] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null })
  const [isLoading, setIsLoading] = useState(true)
  const hasLoadedTaxPreferenceRef = useRef(false)
  const [showGlobalTaxModal, setShowGlobalTaxModal] = useState(false)

  // Tax preference states matching Angular implementation
  const [taxPreference, setTaxPreference] = useState<string>("NotSet")
  const [previousTaxPreference, setPreviousTaxPreference] = useState<string>("NotSet")
  const [isTaxInclusive, setIsTaxInclusive] = useState(false)
  const [isTaxExclusive, setIsTaxExclusive] = useState(false)
  const [isTaxNotSet, setIsTaxNotSet] = useState(true)
  const [selectedProperty] = useSelectedProperty()

  // State for modal preference selection (not saved yet)
  const [modalTaxPreference, setModalTaxPreference] = useState<string>("NotSet")
  const [showTaxPreferenceSnackbar, setShowTaxPreferenceSnackbar] = useState(false)
  const [taxPreferenceSnackbarMessage, setTaxPreferenceSnackbarMessage] = useState("")
  const [taxPreferenceSnackbarType, setTaxPreferenceSnackbarType] = useState<"success" | "error">("success")
  const isDataLoadedRef = useRef(false)
  const isLoadingRef = useRef(false)
  const [newTax, setNewTax] = useState({
    subscriberCompetitor: "Central Hotel",
    channels: "Booking.com",
    tax: "",
  })

  // Multiple taxes state
  const [taxInputs, setTaxInputs] = useState([
    { id: 1, name: "", percentage: "", checked: false }
  ])

  // Tax properties state for the dynamic tax fields
  const [taxProperties, setTaxProperties] = useState([
    { id: 1, TaxName: "", Tax: "", isPercentage: false }
  ])

  // Additional state for tax settings
  const [isAllFieldFilled, setIsAllFieldFilled] = useState(false)
  const [taxSettingId, setTaxSettingId] = useState<number>(0)
  const [activity, setActivity] = useState<string>("Create")

  // Original values for edit mode comparison
  const [originalSelectedSubscribers, setOriginalSelectedSubscribers] = useState<string[]>([])
  const [originalSelectedChannels, setOriginalSelectedChannels] = useState<string[]>([])
  const [originalTaxInputs, setOriginalTaxInputs] = useState<Array<{ id: number, name: string, percentage: string, checked: boolean }>>([])

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

  // Auto-hide tax preference snackbar after 5 seconds
  useEffect(() => {
    if (showTaxPreferenceSnackbar) {
      const timer = setTimeout(() => {
        setShowTaxPreferenceSnackbar(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showTaxPreferenceSnackbar])

  // Initialize modal state when opening
  useEffect(() => {
    if (showGlobalTaxModal) {
      setModalTaxPreference(taxPreference)
    }
  }, [showGlobalTaxModal])

  // Simulate loading effect on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000) // Show loading for 3 seconds

    return () => clearTimeout(timer)
  }, [])

  // Load all data on component mount - using ref to prevent multiple calls
  useEffect(() => {

    if (!selectedProperty?.sid) return;
    if (hasLoadedTaxPreferenceRef.current) {
      console.log('⏭️ Skipping tax preference load - already loaded')
      return
    }

    console.log('🚀 Loading tax preference for the first time')
    hasLoadedTaxPreferenceRef.current = true

    const loadData = async () => {
      try {
        const sid = selectedProperty?.sid
        const [taxPreferenceRes, propertiesRes, channelsRes, taxSettingsRes, taxHistoryRes, currencyCodeRes] = await Promise.all([
          getTaxPreference({ SID: sid, bCacheRefresh: false }),
          getCompleteCompSet({ SID: sid, includesubscriber: true }),
          getChannelsData({ SID: sid, isMetaSite: true }),
          getTaxSetting({ sid: sid }),
          getTaxSettingHistory({ SID: sid }),
          getCurrencyCode({ SID: sid })
        ])

        if (taxPreferenceRes.status) {
          const preference = taxPreferenceRes.body.preference
          switch (preference) {
            case PreferenceValue.Inclusive:
              setIsTaxNotSet(false)
              setIsTaxExclusive(false)
              setIsTaxInclusive(true)
              setTaxPreference("Inclusive")
              break
            case PreferenceValue.Exclusive:
              setIsTaxInclusive(false)
              setIsTaxNotSet(false)
              setIsTaxExclusive(true)
              setTaxPreference("Exclusive")
              break
            default:
              setIsTaxInclusive(false)
              setIsTaxExclusive(false)
              setIsTaxNotSet(true)
              setTaxPreference("NotSet")
              break
          }
        }

        // Set properties data
        if (propertiesRes.status) {
          setProperties(propertiesRes.body || [])
        }

        // Set channels data
        if (channelsRes.status) {
          setChannels(channelsRes.body || [])
        }

        // Set tax settings data
        if (taxSettingsRes.status) {
          setTaxSettings(taxSettingsRes.body || [])
        }

        // Set tax setting history data
        if (taxHistoryRes.status) {
          // Process the data like in Angular - remove trailing commas and spaces
          const processedHistory = (taxHistoryRes.body || []).map((value: any) => ({
            ...value,
            taxValue: value.taxValue.replace(/(\s*,?\s*)*$/, "")
          }))
          setTaxSettingHistory(processedHistory)
        }

        // Set currency code data
        if (currencyCodeRes.status) {
          setCurrencyCode(currencyCodeRes.body || "")
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [selectedProperty?.sid]) // Empty dependency array - only run once on mount

  // Reset ref when component unmounts
  useEffect(() => {
    return () => {
      hasLoadedTaxPreferenceRef.current = false
    }
  }, [])

  // onChangeTaxPreference function for modal (not saved yet)
  const onChangeTaxPreference = (value: number) => {
    switch (value) {
      case PreferenceValue.Inclusive:
        setModalTaxPreference("Inclusive")
        break
      case PreferenceValue.Exclusive:
        setModalTaxPreference("Exclusive")
        break
      default:
        setModalTaxPreference("NotSet")
        break
    }
  }


  // Save tax preference function matching Angular implementation
  const onclickSaveTaxPreference = async () => {
    try {
      const preferenceValue = modalTaxPreference === "Inclusive" ? PreferenceValue.Inclusive :
        modalTaxPreference === "Exclusive" ? PreferenceValue.Exclusive :
          PreferenceValue.NotSet

      const response = await setTaxPreferenceAPI({
        SID: selectedProperty?.sid,
        Preference: preferenceValue,
        UpdatedBy: LocalStorageService.getUserDetails()?.userId || ""
      })

      if (response.status && response.body) {
        // Refresh tax preference
        console.log('🔄 onclickSaveTaxPreference - calling getTaxPreference to refresh')
        const taxPreferenceRes = await getTaxPreference({ SID: selectedProperty?.sid, bCacheRefresh: false })
        if (taxPreferenceRes.status) {
          const preference = taxPreferenceRes.body.preference
          switch (preference) {
            case PreferenceValue.Inclusive:
              setIsTaxNotSet(false)
              setIsTaxExclusive(false)
              setIsTaxInclusive(true)
              setTaxPreference("Inclusive")
              break
            case PreferenceValue.Exclusive:
              setIsTaxInclusive(false)
              setIsTaxNotSet(false)
              setIsTaxExclusive(true)
              setTaxPreference("Exclusive")
              break
            default:
              setIsTaxInclusive(false)
              setIsTaxExclusive(false)
              setIsTaxNotSet(true)
              setTaxPreference("NotSet")
              break
          }
        }

        // Get tax setting history
        await getTaxSettingHistory({ SID: selectedProperty?.sid })

        // Show success snackbar
        setTaxPreferenceSnackbarMessage("TaxPreference Updated successfully!!")
        setTaxPreferenceSnackbarType("success")
        setShowTaxPreferenceSnackbar(true)
        setShowGlobalTaxModal(false)
      } else {
        // Show error snackbar
        setTaxPreferenceSnackbarMessage("Something went wrong please try again!")
        setTaxPreferenceSnackbarType("error")
        setShowTaxPreferenceSnackbar(true)
      }
    } catch (error) {
      console.error('Error saving tax preference:', error)
      setTaxPreferenceSnackbarMessage("Something went wrong please try again!")
      setTaxPreferenceSnackbarType("error")
      setShowTaxPreferenceSnackbar(true)
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (subscriberDropdownRef.current && !subscriberDropdownRef.current.contains(event.target as Node)) {
        setIsSubscriberDropdownOpen(false)
        setSubscriberSearchTerm('') // Clear search when clicking outside
      }
      if (channelsDropdownRef.current && !channelsDropdownRef.current.contains(event.target as Node)) {
        setIsChannelsDropdownOpen(false)
        setChannelsSearchTerm('') // Clear search when clicking outside
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Filter tax settings based on search term
  const filteredTaxSettings = taxSettings.filter(tax => {
    if (!searchTerm) return true
    debugger
    const searchLower = searchTerm.toLowerCase()
    return (
      tax.taxValue?.toLowerCase().includes(searchLower) ||
        tax.taxName?.toLowerCase().includes(searchLower) ||
        tax.propertiesText?.toLowerCase().includes(searchLower) ||
        tax.channelsText?.toLowerCase().includes(searchLower) ||
        // tax.activity?.toLowerCase() === "create" ? "added".includes(searchLower) : tax.activity?.toLowerCase().includes(searchLower) ||
      tax.updatedByName?.toLowerCase().includes(searchLower)
    )
  })

  const filteredTaxes = filteredTaxSettings.sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0

    let aValue: any
    let bValue: any

    // Handle different field types for proper sorting
    switch (sortConfig.key) {
      case 'tax':
        // Sort by tax value only
        aValue = (a.taxValue || '').toLowerCase()
        bValue = (b.taxValue || '').toLowerCase()
        break
      case 'subscriberCompetitor':
        // Sort by properties text
        aValue = (a.propertiesText || '').toLowerCase()
        bValue = (b.propertiesText || '').toLowerCase()
        break
      case 'channels':
        // Sort by channels text
        aValue = (a.channelsText || '').toLowerCase()
        bValue = (b.channelsText || '').toLowerCase()
        break
      case 'lastActivity':
        // Sort by activity
        aValue = (a.activity || '').toLowerCase()
        bValue = (b.activity || '').toLowerCase()
        break
      case 'lastModifiedBy':
        // Sort by updated by name
        aValue = (a.updatedByName || '').toLowerCase()
        bValue = (b.updatedByName || '').toLowerCase()
        break
      case 'action':
        // Sort by action field
        aValue = (a.action || '').toLowerCase()
        bValue = (b.action || '').toLowerCase()
        break
      case 'createdOn':
        // Sort by action (assuming this contains date info)
        aValue = (a.action || '').toLowerCase()
        bValue = (b.action || '').toLowerCase()
        break
      default:
        // Fallback to direct field access
        aValue = a[sortConfig.key as keyof typeof a] || ''
        bValue = b[sortConfig.key as keyof typeof b] || ''
    }

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) aValue = ''
    if (bValue === null || bValue === undefined) bValue = ''

    // Convert to strings for comparison
    const aStr = String(aValue).toLowerCase()
    const bStr = String(bValue).toLowerCase()

    if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1
    if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const toggleTaxStatus = (taxId: number) => {
    setTaxes((prev) => prev.map((tax) => (tax.id === taxId ? { ...tax, status: !tax.status } : tax)))
  }

  const handleAddTax = () => {
    // Call the new save tax settings function
    saveTaxSettingsFunction()
  }

  const openAddTaxModal = () => {
    // Reset form for create mode
    setTaxSettingId(0)
    setActivity("Create")
    setSelectedSubscribers([])
    setSelectedChannels([])
    setTaxInputs([
      { id: 1, name: "", percentage: "", checked: false }
    ])
    // Clear original values for create mode
    setOriginalSelectedSubscribers([])
    setOriginalSelectedChannels([])
    setOriginalTaxInputs([])
    setShowAddTax(true)
  }

  // Check if there are any changes from original values
  const hasChanges = () => {
    if (activity === "Create") return true // Always enabled for create mode

    // Compare selected subscribers
    const subscribersChanged = JSON.stringify(selectedSubscribers.sort()) !== JSON.stringify(originalSelectedSubscribers.sort())

    // Compare selected channels
    const channelsChanged = JSON.stringify(selectedChannels.sort()) !== JSON.stringify(originalSelectedChannels.sort())

    // Compare tax inputs
    const taxInputsChanged = JSON.stringify(taxInputs) !== JSON.stringify(originalTaxInputs)

    return subscribersChanged || channelsChanged || taxInputsChanged
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

  const handleEditTax = (taxSettingId: number) => {
    const taxToEdit = taxSettings.find(tax => tax.taxSettingId === taxSettingId)
    if (taxToEdit) {
      // Set the tax setting ID and activity
      setTaxSettingId(taxSettingId)
      setActivity("Update")

      // Find matching properties and channels from available lists (matching Angular logic)
      // Use word boundary matching to avoid partial matches like "Agoda" matching "AgodaUS"
      const editedProperties = properties.filter(prop => {
        const propertiesText = taxToEdit.propertiesText?.toLowerCase() || ""
        const propName = prop.name.toLowerCase()
        // Use regex to match complete words only
        const regex = new RegExp(`\\b${propName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)
        return regex.test(propertiesText)
      })

      const editedChannels = channels.filter(channel => {
        const channelsText = taxToEdit.channelsText?.toLowerCase() || ""
        const channelName = channel.name.toLowerCase()
        // Use regex to match complete words only
        const regex = new RegExp(`\\b${channelName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)
        return regex.test(channelsText)
      })

      // Set selected properties and channels using the found matches
      setSelectedSubscribers(editedProperties.map(prop => prop.name))
      setSelectedChannels(editedChannels.map(channel => channel.name))

      // Parse tax values and names
      const taxValues = taxToEdit.taxValue?.split(",").map(v => v.trim()).filter(Boolean) || []
      const taxNames = taxToEdit.taxName?.split(",").map(n => n.trim()).filter(Boolean) || []

      // Create tax inputs from the parsed data
      const newTaxInputs = []
      for (let i = 0; i < Math.max(taxValues.length, taxNames.length); i++) {
        const taxValue = taxValues[i] || ""
        const taxName = taxNames[i] || `Tax${i + 1}`
        const isPercentage = taxValue.includes('%')
        const percentage = isPercentage ? taxValue.replace('%', '') : taxValue

        newTaxInputs.push({
          id: i + 1,
          name: taxName,
          percentage: percentage,
          checked: isPercentage
        })
      }

      // If no tax inputs, add one empty one
      if (newTaxInputs.length === 0) {
        newTaxInputs.push({
          id: 1,
          name: "",
          percentage: "",
          checked: false
        })
      }

      setTaxInputs(newTaxInputs)

      // Store original values for comparison
      setOriginalSelectedSubscribers(editedProperties.map(prop => prop.name))
      setOriginalSelectedChannels(editedChannels.map(channel => channel.name))
      setOriginalTaxInputs([...newTaxInputs])

      // Open the Add Tax modal
      setShowAddTax(true)
    }
  }

  const handleDeleteTax = (taxId: number) => {
    setTaxToDelete(taxId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteTax = async () => {
    if (!taxToDelete) return

    try {
      const sid = selectedProperty?.sid
      const deleteParams = {
        taxSettingId: taxToDelete,
        SID: sid
      }

      console.log('🗑️ Delete Tax Request:', deleteParams)
      const response = await deleteTaxSetting(deleteParams)
      console.log('🗑️ Delete Tax Response:', response)

      if (response.status && response.body) {
        // Refresh data
        await loadTaxSettingsData()

        // Show success message
        setSnackbarMessage("Tax Settings Deleted Successfully!!")
        setSnackbarType("success")
        setShowSnackbar(true)
      } else {
        // Show error message
        setSnackbarMessage("Something went wrong please try again!")
        setSnackbarType("error")
        setShowSnackbar(true)
      }
    } catch (error) {
      console.error('Error deleting tax setting:', error)
      setSnackbarMessage("Something went wrong please try again!")
      setSnackbarType("error")
      setShowSnackbar(true)
    } finally {
      setShowDeleteConfirm(false)
      setTaxToDelete(null)
    }
  }

  const cancelDeleteTax = () => {
    setShowDeleteConfirm(false)
    setTaxToDelete(null)
  }

  // Save tax settings function matching Angular implementation
  const saveTaxSettingsFunction = async () => {
    setIsAllFieldFilled(false)

    // Validate tax inputs - check if any field is partially filled
    for (const item of taxInputs) {
      if ((item.name !== '' && item.percentage === '') || (item.percentage !== '' && item.name === '')) {
        setSnackbarMessage("Please fill all the tax fields")
        setSnackbarType("error")
        setShowSnackbar(true)
        setIsAllFieldFilled(true)
        return
      }
    }

    if (isAllFieldFilled) return

    // Map selected names to proper objects with IDs (matching Angular implementation)
    const selectedPropertyObjects = selectedSubscribers.map(selectedName => {
      const property = properties.find(p => p.name === selectedName)
      return property ? {
        PropertyId: property.propertyID,
        PropertyName: property.name
      } : null
    }).filter(Boolean)

    const selectedChannelObjects = selectedChannels.map(selectedName => {
      const channel = channels.find(c => c.name === selectedName)
      return channel ? {
        ChannelId: channel.cid,
        ChannelName: channel.name
      } : null
    }).filter(Boolean)

    // Prepare tax model
    const taxModel = {
      SID: selectedProperty?.sid,
      TaxSettingId: taxSettingId,
      Channels: selectedChannelObjects,
      Properties: selectedPropertyObjects,
      Currency: currencyCode,
      CreatedById: LocalStorageService.getUserDetails()?.userId || "",
      CreatedByName: LocalStorageService.getUserDisplayName(),
      CreatedOn: new Date(),
      Activity: activity,
      UpdatedById: LocalStorageService.getUserDetails()?.userId || "",
      TaxValue: taxInputs
        .map(item => {
          return item.checked && item.percentage ? item.percentage + "%" : item.percentage
        })
        .filter(value => value !== '')
        .join(","),
      TaxName: taxInputs
        .map(item => item.name)
        .filter(value => value !== '')
        .join(",")
    }

    try {
      const response = await saveTaxSettings(taxModel)

      if (!response.status && response.message === 'Few Combinations are Existing') {
        setSnackbarMessage("The Tax settings has not been added. Maybe this combination already exists")
        setSnackbarType("error")
        setShowSnackbar(true)
      } else {
        setSnackbarMessage(`The Tax settings has been ${activity.toLowerCase() === "update" ? "updated" : "saved"}!!`)
        setSnackbarType("success")
        setShowSnackbar(true)

        // Refresh data
        await loadTaxSettingsData()

        // Reset form
        setSelectedChannels([])
        setSelectedSubscribers([])
        setTaxInputs([{ id: 1, name: "", percentage: "", checked: false }])
        setShowAddTax(false)
      }
    } catch (error) {
      console.error('Error saving tax settings:', error)
      setSnackbarMessage("Error saving tax settings")
      setSnackbarType("error")
      setShowSnackbar(true)
    }
  }

  // Load tax settings data
  const loadTaxSettingsData = async () => {
    try {
      const sid = selectedProperty?.sid
      const [taxSettingsRes, taxHistoryRes] = await Promise.all([
        getTaxSetting({ sid: sid }),
        getTaxSettingHistory({ SID: sid })
      ])

      if (taxSettingsRes.status) {
        setTaxSettings(taxSettingsRes.body || [])
      }

      if (taxHistoryRes.status) {
        const processedHistory = (taxHistoryRes.body || []).map((value: any) => ({
          ...value,
          taxValue: value.taxValue.replace(/(\s*,?\s*)*$/, "")
        }))
        setTaxSettingHistory(processedHistory)
      }
    } catch (error) {
      console.error('Error loading tax settings data:', error)
    }
  }


  // Tax properties management functions
  const addTaxRow = (index: number) => {
    if (taxProperties.length < 5) {
      const newId = Math.max(...taxProperties.map(tp => tp.id)) + 1
      const newTaxProperty = { id: newId, TaxName: "", Tax: "", isPercentage: false }
      setTaxProperties(prev => [...prev, newTaxProperty])
    }
  }

  const deleteTaxRow = (index: number) => {
    if (taxProperties.length > 1) {
      setTaxProperties(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateTaxProperty = (index: number, field: string, value: any) => {
    setTaxProperties(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const callSample = (taxProps: any[], index: number) => {
    // This function would handle the sample preview calculation
    // For now, we'll just log the current tax properties
    console.log('Sample calculation for tax properties:', taxProps)
  }

  const onEdited = (index: number) => {
    // This function would handle the edited state
    // For now, we'll just log the edit
    console.log('Tax property edited at index:', index)
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

  // Search functionality matching Angular implementation
  const applyFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filterValue = event.target.value
    setSearchTerm(filterValue)
  }

  const closeSearch = () => {
    setIsSearch(false)
    setSearchTerm("")
  }

  const openSearch = () => {
    setIsSearch(true)
  }

  // Multiselect dropdown handlers
  const handleSubscriberToggle = (subscriber: string) => {
    if (subscriber === 'All Hotels') {
      // Get filtered properties based on search term
      const filteredProperties = properties.filter(property =>
        property.name.toLowerCase().includes(subscriberSearchTerm.toLowerCase())
      )

      // Check if all filtered properties are selected
      const allFilteredSelected = filteredProperties.every(property =>
        selectedSubscribers.includes(property.name)
      )

      if (allFilteredSelected) {
        // All filtered are selected, so deselect all filtered
        setSelectedSubscribers(prev =>
          prev.filter(selected =>
            !filteredProperties.some(filtered => filtered.name === selected)
          )
        )
      } else {
        // Not all filtered are selected, so select all filtered
        const filteredNames = filteredProperties.map(property => property.name)
        setSelectedSubscribers(prev => {
          const newSelection = [...prev]
          filteredNames.forEach(name => {
            if (!newSelection.includes(name)) {
              newSelection.push(name)
            }
          })
          return newSelection
        })
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
      // Get filtered channels based on search term
      const filteredChannels = channels.filter(channel =>
        channel.name.toLowerCase().includes(channelsSearchTerm.toLowerCase())
      )

      // Check if all filtered channels are selected
      const allFilteredSelected = filteredChannels.every(channel =>
        selectedChannels.includes(channel.name)
      )

      if (allFilteredSelected) {
        // All filtered are selected, so deselect all filtered
        setSelectedChannels(prev =>
          prev.filter(selected =>
            !filteredChannels.some(filtered => filtered.name === selected)
          )
        )
      } else {
        // Not all filtered are selected, so select all filtered
        const filteredNames = filteredChannels.map(channel => channel.name)
        setSelectedChannels(prev => {
          const newSelection = [...prev]
          filteredNames.forEach(name => {
            if (!newSelection.includes(name)) {
              newSelection.push(name)
            }
          })
          return newSelection
        })
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
  const filteredSubscribers = properties.filter(property =>
    property.name.toLowerCase().includes(subscriberSearchTerm.toLowerCase())
  )

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(channelsSearchTerm.toLowerCase())
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
    // Add validation for percentage field to prevent negative values and 0
    if (field === 'percentage' && typeof value === 'string') {
      const numericValue = parseFloat(value)
      // If the value is negative or 0, don't update it
      if (numericValue <= 0) {
        return
      }
    }

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
              {content}
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
                <span className="text-xl font-semibold text-foreground">Global Tax Preference:</span>
                <button
                  onClick={() => setShowGlobalTaxModal(true)}
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                >
                  {taxPreference}
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Configure tax settings, manage tax rates, and set up tax calculations for different properties
              </p>
            </div>
          </div>

          {/* Search and Actions Bar - Moved back to header right side */}
          <div className="flex items-center gap-3">
            {/* Search Icon/Field */}
            <div className="flex items-center gap-2">
              {!isSearch ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={openSearch}
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
                    value={searchTerm}
                    onChange={applyFilter}
                    placeholder="Type here"
                    className="w-[120px] h-9 px-3 pr-8 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    onClick={closeSearch}
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
              onClick={openAddTaxModal}
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
                      <div
                        className="flex items-center gap-1 cursor-pointer group"
                        onClick={() => handleSort('action')}
                      >
                        &nbsp;&nbsp;&nbsp;Action
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                          {getHoverIcon('action')}
                        </span>
                        <span className="opacity-100 mt-0.5">
                          {getSortIcon('action')}
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTaxes.map((tax, index) => {
                    const isLastRow = index === filteredTaxes.length - 1;
                    return (
                      <tr key={tax.taxSettingId} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}`}>
                        <td className={`px-4 py-2 whitespace-nowrap ${isLastRow ? 'rounded-bl-lg' : ''}`}>
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              <TruncatedTooltip
                                content={tax.taxValue.trim().split(',').length > 1 && tax.taxValue.trim().split(',')[1] != '' ? tax.taxValue : tax.taxValue.trim().split(',')[0]}
                                className="truncate max-w-xs"
                              >
                                {tax.taxValue.trim().split(',').length > 1 && tax.taxValue.trim().split(',')[1] != '' ? tax.taxValue : tax.taxValue.trim().split(',')[0]}
                              </TruncatedTooltip>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <TruncatedTooltip
                            content={(() => {
                              const properties = tax.propertiesText.split(',').map(prop => prop.trim())
                              if (properties.length > 1) {
                                // Show the visible text + count of remaining hidden items
                                // Assuming 2-3 items are visible in the truncated text
                                const visibleCount = Math.min(2, properties.length)
                                const visibleProperties = properties.slice(0, visibleCount)
                                const remainingCount = properties.length - visibleCount
                                if (remainingCount > 0) {
                                  return `${visibleProperties.join(', ')} (+${remainingCount})`
                                }
                                return visibleProperties.join(', ')
                              }
                              return tax.propertiesText
                            })()}
                            className="truncate max-w-32"
                          >
                            {tax.propertiesText}
                          </TruncatedTooltip>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <TruncatedTooltip
                            content={(() => {
                              const channels = tax.channelsText.split(',').map(ch => ch.trim())
                              if (channels.length > 1) {
                                // Show the visible text + count of remaining hidden items
                                // Assuming 2-3 items are visible in the truncated text
                                const visibleCount = Math.min(2, channels.length)
                                const visibleChannels = channels.slice(0, visibleCount)
                                const remainingCount = channels.length - visibleCount
                                if (remainingCount > 0) {
                                  return `${visibleChannels.join(', ')} (+${remainingCount})`
                                }
                                return visibleChannels.join(', ')
                              }
                              return tax.channelsText
                            })()}
                            className="truncate max-w-32"
                          >
                            {tax.channelsText}
                          </TruncatedTooltip>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tax.activity === 'Create' || tax.activity === 'Added'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            }`}>
                            {tax.activity === 'Create' ? 'Added' : tax.activity === 'Update' ? 'Updated' : tax.activity}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <TruncatedTooltip
                            content={tax.updatedByName}
                            className="truncate max-w-32"
                          >
                            {tax.updatedByName}
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
                                    {tax.action ?? "Show Current ADR"}
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
                                    onClick={() => handleEditTax(tax.taxSettingId)}
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
                                    onClick={() => handleDeleteTax(tax.taxSettingId)}
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
                          : (() => {
                            const filteredProperties = properties.filter(property =>
                              property.name.toLowerCase().includes(subscriberSearchTerm.toLowerCase())
                            )
                            const allFilteredSelected = filteredProperties.length > 0 && filteredProperties.every(property =>
                              selectedSubscribers.includes(property.name)
                            )
                            return allFilteredSelected ? "All" :
                              selectedSubscribers.length === 1
                                ? selectedSubscribers[0]
                                : selectedSubscribers.length > 1
                                  ? `${selectedSubscribers[0]} + ${selectedSubscribers.length - 1}`
                                  : "Select hotels..."
                          })()
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
                              checked={(() => {
                                const filteredProperties = properties.filter(property =>
                                  property.name.toLowerCase().includes(subscriberSearchTerm.toLowerCase())
                                )
                                return filteredProperties.length > 0 && filteredProperties.every(property =>
                                  selectedSubscribers.includes(property.name)
                                )
                              })()}
                              onChange={() => handleSubscriberToggle('All Hotels')}
                              className="w-4 h-4 mr-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm font-medium text-gray-900">All Hotels</span>
                          </label>
                          {filteredSubscribers.map((property, index) => (
                            <label
                              key={property.propertyID || `property-${index}`}
                              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedSubscribers.includes(property.name)}
                                onChange={() => handleSubscriberToggle(property.name)}
                                className="w-4 h-4 mr-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                              <span className="text-sm text-gray-900" title={property.name}>
                                {property.name}
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
                              min="0.1"
                              step="0.1"
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
                          : (() => {
                            const filteredChannels = channels.filter(channel =>
                              channel.name.toLowerCase().includes(channelsSearchTerm.toLowerCase())
                            )
                            const allFilteredSelected = filteredChannels.length > 0 && filteredChannels.every(channel =>
                              selectedChannels.includes(channel.name)
                            )
                            return allFilteredSelected ? "All" :
                              selectedChannels.length === 1
                                ? selectedChannels[0]
                                : selectedChannels.length > 1
                                  ? `${selectedChannels[0]} + ${selectedChannels.length - 1}`
                                  : "Select channels..."
                          })()
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
                              checked={(() => {
                                const filteredChannels = channels.filter(channel =>
                                  channel.name.toLowerCase().includes(channelsSearchTerm.toLowerCase())
                                )
                                return filteredChannels.length > 0 && filteredChannels.every(channel =>
                                  selectedChannels.includes(channel.name)
                                )
                              })()}
                              onChange={() => handleChannelToggle('All Channels')}
                              className="w-4 h-4 mr-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm font-medium text-gray-900">All Channels</span>
                          </label>
                          {filteredChannels.map((channel, index) => (
                            <label
                              key={channel.cid || `channel-${index}`}
                              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedChannels.includes(channel.name)}
                                onChange={() => handleChannelToggle(channel.name)}
                                className="w-4 h-4 mr-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                              <span className="text-sm text-gray-900" title={channel.name}>
                                {channel.name}
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
                    !hasChanges() ||
                    selectedSubscribers.length === 0 ||
                    selectedChannels.length === 0 ||
                    taxInputs.some(tax => !tax.name || !tax.percentage) ||
                    taxInputs.some(tax => parseFloat(tax.percentage) <= 0)
                  }
                  className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {activity === 'Update' ? 'Update Tax' : 'Add Tax'}
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
                      {taxSettingHistory.map((historyItem, index) => {
                        const isLastRow = index === taxSettingHistory.length - 1;
                        return (
                          <tr key={index} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}`}>
                            <td className={`px-4 py-2 whitespace-nowrap border-b border-gray-200 dark:border-gray-700 ${isLastRow ? 'rounded-bl-lg' : ''} w-32`}>
                              <TruncatedTooltip
                                content={(() => {
                                  const channels = historyItem.channels.split(',').map((ch: string) => ch.trim())
                                  if (channels.length > 2) {
                                    const visibleChannels = channels.slice(0, 2)
                                    const remainingCount = channels.length - 2
                                    return `${visibleChannels.join(', ')} (+${remainingCount})`
                                  }
                                  return historyItem.channels
                                })()}
                                className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                              >
                                {historyItem.channels}
                              </TruncatedTooltip>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-32">
                              <TruncatedTooltip
                                content={(() => {
                                  const properties = historyItem.properties.split(',').map((prop: string) => prop.trim())
                                  if (properties.length > 2) {
                                    const visibleProperties = properties.slice(0, 1)
                                    const remainingCount = properties.length - 1
                                    return `${visibleProperties.join(', ')} (+${remainingCount})`
                                  }
                                  return historyItem.properties
                                })()}
                                className="truncate"
                              >
                                {historyItem.properties}
                              </TruncatedTooltip>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                              <TruncatedTooltip
                                content={historyItem.taxValue}
                                className="truncate"
                              >
                                {historyItem.taxValue.length > 8 ? `${historyItem.taxValue.slice(0, 8)}...` : historyItem.taxValue}
                              </TruncatedTooltip>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                              <TruncatedTooltip
                                content={historyItem.createdOn}
                                className="truncate"
                              >
                                {historyItem.createdOn}
                              </TruncatedTooltip>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-32">
                              <TruncatedTooltip
                                content={historyItem.createdByName}
                                className="truncate"
                              >
                                {historyItem.createdByName}
                              </TruncatedTooltip>
                            </td>
                            <td className={`px-4 py-2 text-center text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 ${isLastRow ? 'rounded-br-lg' : ''} w-20`}>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${historyItem.action === 'Create'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : historyItem.action === 'Update'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                {historyItem.action}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {/* Add padding to ensure last row is visible */}
                      <tr>
                        <td colSpan={6} className="h-4"></td>
                      </tr>
                    </tbody>
                  </table>
                  {/* Add blank space after table */}
                  <div className="h-2.5"></div>
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

        {/* Dynamic Snackbar */}
        {showSnackbar && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className={`${snackbarType === 'success' ? 'bg-green-600' : snackbarType === 'error' ? 'bg-red-600' : 'bg-blue-600'} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4`}>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">
                  {snackbarMessage}
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

        {/* Tax Preference Snackbar */}
        {showTaxPreferenceSnackbar && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className={`${taxPreferenceSnackbarType === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4`}>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">
                  {taxPreferenceSnackbarMessage}
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
                  value={modalTaxPreference === "Inclusive" ? "1" : modalTaxPreference === "Exclusive" ? "2" : "0"}
                  onValueChange={(value) => onChangeTaxPreference(parseInt(value))}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="1" id="inclusive" className="mt-1.5" />
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
                      <RadioGroupItem value="2" id="exclusive" className="mt-1.5" />
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
                      <RadioGroupItem value="0" id="not-configured" className="mt-1.5" />
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
                  openAddTaxModal()
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
                onClick={onclickSaveTaxPreference}
                disabled={modalTaxPreference === taxPreference}
                className="h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
