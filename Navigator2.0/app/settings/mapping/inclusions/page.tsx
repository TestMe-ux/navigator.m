"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { SettingsTab } from "@/components/settings-tab"
import * as Icons from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"

// Reusable component for inclusion type dropdown cell
const InclusionTypeCell = ({ 
  displayText, 
  fullDescription, 
  inclusionCategoryId, 
  hotelId, 
  cellKey,
  openHotelCellDropdown, 
  handleHotelCellDropdownToggle,
  handleHotelCellDropdownAction,
  getAllInclusionCategories,
  isMapped = false,
  isRemoving = false,
  isNewlyMapped = false,
  removingRoomsSet,
  bulkMappingMode = false,
  selectedRoomsForBulk,
  onCheckboxChange
}: {
  displayText: string
  fullDescription: string
  inclusionCategoryId: string
  hotelId: string
  cellKey: string
  openHotelCellDropdown: string | null
  handleHotelCellDropdownToggle: (key: string) => void
  handleHotelCellDropdownAction: (action: string, inclusionCategoryId: string, hotelId: string, targetCategoryId?: string, displayText?: string, fullDescription?: string, cellKey?: string) => void
  getAllInclusionCategories: () => Array<{id: string, name: string, code: string}>
  isMapped?: boolean
  isRemoving?: boolean
  isNewlyMapped?: boolean
  removingRoomsSet?: Set<string>
  bulkMappingMode?: boolean
  selectedRoomsForBulk?: Set<string>
  onCheckboxChange?: (key: string, checked: boolean) => void
}) => {
  const dropdownKey = `${inclusionCategoryId}-${hotelId}-${cellKey}`
  
  // Determine if this cell should show red background (isRemoving)
  const shouldShowRed = isRemoving || (removingRoomsSet && removingRoomsSet.has(`${inclusionCategoryId}-${hotelId}-${cellKey}`))
  
  // Don't render if this cell is mapped
  if (isMapped) {
    return null
  }
  
  // Determine background color based on state
  let bgColor = "bg-gray-200"
  if (shouldShowRed) {
    bgColor = "bg-red-300" // Light red when being removed/moved
  } else if (isNewlyMapped) {
    bgColor = "bg-green-300" // Light green for newly mapped
  }
  
  // Render checkbox in bulk mapping mode for unmapped inclusions
  if (bulkMappingMode && inclusionCategoryId === "unmapped") {
    const checkboxKey = `${inclusionCategoryId}-${hotelId}-${cellKey}`
    const isChecked = selectedRoomsForBulk?.has(checkboxKey) || false
    
    return (
      <div 
        className={`hotel-cell-container relative text-xs ${bgColor} px-2 py-1 rounded flex items-center justify-between hover:bg-gray-300 transition-colors duration-300`}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="truncate flex-1">{displayText}</span>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-black text-white p-2 max-w-[468px]">
            <div className="line-clamp-5">{fullDescription}</div>
          </TooltipContent>
        </Tooltip>
        <Checkbox
          checked={isChecked}
          onCheckedChange={(checked) => onCheckboxChange?.(checkboxKey, !!checked)}
          className="ml-2"
        />
      </div>
    )
  }
  
  // Normal dropdown mode
  return (
    <div 
      className={`hotel-cell-container relative text-xs ${bgColor} px-2 py-1 rounded flex items-center justify-between hover:bg-gray-300 cursor-pointer transition-colors duration-300`}
      onClick={() => handleHotelCellDropdownToggle(dropdownKey)}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="truncate flex-1">{displayText}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-black text-white p-2 max-w-[468px]">
          <div className="line-clamp-5">{fullDescription}</div>
        </TooltipContent>
      </Tooltip>
      <svg 
        className="w-4 h-4 text-gray-500 flex-shrink-0" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
      
      {/* Individual Dropdown for this cell */}
      {openHotelCellDropdown === dropdownKey && (
        <div className={`hotel-cell-dropdown-menu absolute right-0 ${inclusionCategoryId === "unmapped" ? 'bottom-full mb-0' : 'top-full mt-0'} bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[160px]`}>
          <div className="py-1 max-h-[228px] overflow-y-auto">
            {inclusionCategoryId !== "unmapped" && (
              <>
                <button
                  onClick={() => handleHotelCellDropdownAction('Unmap', inclusionCategoryId, hotelId, undefined, displayText, fullDescription, cellKey)}
                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 border-b border-dashed border-gray-300"
                >
                  Unmap
                </button>
                <div className="px-4 py-1 mt-1.5 text-xs text-gray-500 font-semibold cursor-default">Map to</div>
              </>
            )}
            {inclusionCategoryId === "unmapped" && (
              <div className="px-4 py-1 text-xs text-gray-500 font-semibold cursor-default">Map to</div>
            )}
            {getAllInclusionCategories()
              .filter((cat) => cat.id !== inclusionCategoryId)
              .map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleHotelCellDropdownAction('Map to', inclusionCategoryId, hotelId, cat.id, displayText, fullDescription, cellKey)}
                className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
              >
                {cat.name} ({cat.code})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const settingsTabs = [
  { id: "user-management", label: "User Management", icon: Icons.User },
  { id: "property", label: "Property", icon: Icons.Building },
  { id: "channel", label: "Channel", icon: Icons.Radio },
  { id: "compset", label: "Compset", icon: Icons.Target },
  { id: "alerts", label: "Alerts", icon: Icons.Bell },
  { id: "parity", label: "Parity", icon: Icons.BarChart3 },
  { id: "mapping", label: "Mapping", icon: Icons.Map },
  { id: "tax", label: "Tax", icon: Icons.Calculator },
]

export default function MappingSettingsPage() {
  const pathname = usePathname()
  const router = useRouter()
  
  // Determine active tab based on pathname
  const getActiveTab = () => {
    if (pathname?.includes("/rate")) return "rate"
    if (pathname?.includes("/inclusions")) return "inclusions"
    return "room"
  }
  
  const activeTab = getActiveTab()
  const [activeSettingsTab, setActiveSettingsTab] = useState("mapping")
  
  // Handle Settings tab navigation - navigate to /settings for other tabs
  const handleSettingsTabChange = (value: string) => {
    if (value === "mapping") {
      // Navigate to mapping page
      router.push("/settings/mapping")
    } else {
      // Navigate to /settings with tab parameter
      router.push(`/settings?tab=${value}`)
    }
  }
  const [mappingMode, setMappingMode] = useState("advanced")
  const [selectedInclusionCategory, setSelectedInclusionCategory] = useState("")
  const [selectedHotel, setSelectedHotel] = useState("")
  const [inclusionMappings, setInclusionMappings] = useState([])
  const [currentTablePage, setCurrentTablePage] = useState(1)
  const [totalTablePages, setTotalTablePages] = useState(4) // Will be calculated dynamically
  const [columnStartIndex, setColumnStartIndex] = useState(0)
  const [windowWidth, setWindowWidth] = useState(0)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null) // Track which 3-dots dropdown is open
  const [openHotelCellDropdown, setOpenHotelCellDropdown] = useState<string | null>(null) // Track which hotel cell dropdown is open
  const [inclusionMappingsMap, setInclusionMappingsMap] = useState<Map<string, {displayText: string, fullDescription: string, sourceCategoryId: string, sourceHotelId: string, sourceCellKey: string}>>(new Map())
  const [animatingRoom, setAnimatingRoom] = useState<string | null>(null)
  const [mappedCellKeys, setMappedCellKeys] = useState<Set<string>>(new Set())
  const [removingRooms, setRemovingRooms] = useState<Set<string>>(new Set()) // Track rooms being removed
  const [newlyMappedRooms, setNewlyMappedRooms] = useState<Set<string>>(new Set()) // Track newly mapped rooms for green bg
  const [basicChannel, setBasicChannel] = useState("agoda") // Track channel selection for Basic mode
  const [advancedChannel, setAdvancedChannel] = useState("all") // Track channel selection for Advanced mode
  const [currentlyActive, setCurrentlyActive] = useState("basic") // Track Currently Active selection (shared for both modes)
  const [showActiveModal, setShowActiveModal] = useState(false) // Track modal visibility
  const [pendingActiveValue, setPendingActiveValue] = useState<string | null>(null) // Track pending value
  const [showAddRoomModal, setShowAddRoomModal] = useState(false) // Track Add Room modal visibility
  const [roomName, setRoomName] = useState("") // Track room name input
  const [abbreviation, setAbbreviation] = useState("") // Track abbreviation input
  const [touchedRoomName, setTouchedRoomName] = useState(false) // Track if room name field was touched
  const [showDeleteRoomConfirm, setShowDeleteRoomConfirm] = useState(false) // Track delete confirmation modal
  const [roomToDelete, setRoomToDelete] = useState<{id: string, name: string, code: string} | null>(null) // Track room to delete
  const [showRenameRoomModal, setShowRenameRoomModal] = useState(false) // Track rename modal visibility
  const [renameRoomName, setRenameRoomName] = useState("") // Track rename room name input
  const [renameAbbreviation, setRenameAbbreviation] = useState("") // Track rename abbreviation input
  const [roomToRename, setRoomToRename] = useState<{id: string, name: string, code: string} | null>(null) // Track room to rename
  const [bulkMappingMode, setBulkMappingMode] = useState(false) // Track bulk mapping mode
  const [selectedRoomsForBulk, setSelectedRoomsForBulk] = useState<Set<string>>(new Set()) // Track selected rooms for bulk mapping
  const [bulkMappingTargetCategory, setBulkMappingTargetCategory] = useState<string | null>(null) // Track target category for bulk mapping
  const [showAddRoomModalAdvanced, setShowAddRoomModalAdvanced] = useState(false) // Track Add Room modal visibility for Advanced tab
  const [roomCreationMode, setRoomCreationMode] = useState("new") // Track room creation mode: "new" or "recommended"
  const [showManageRoomModal, setShowManageRoomModal] = useState(false) // Track Manage Room modal visibility
  const [movedRoomId, setMovedRoomId] = useState<string | null>(null) // Track which room was moved
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null) // Track which room is being edited inline
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null) // Track which room is being deleted inline
  const [inlineRoomName, setInlineRoomName] = useState("") // Track inline room name
  const [inlineAbbreviation, setInlineAbbreviation] = useState("") // Track inline abbreviation
  const [originalInclusionCategories, setOriginalInclusionCategories] = useState<Array<{id: string, name: string, code: string}>>([]) // Track original inclusion order
  const [hasPriorityChanged, setHasPriorityChanged] = useState(false) // Track if priority order has changed
  
  // Function to handle inline edit start
  const handleStartEdit = (room: {id: string, name: string, code: string}) => {
    setEditingRoomId(room.id)
    setInlineRoomName(room.name)
  }
  
  // Function to handle inline edit save
  const handleSaveEdit = () => {
    if (editingRoomId && inlineRoomName && inlineAbbreviation) {
      setInclusionCategories(prev => prev.map(inclusion => 
        room.id === editingRoomId 
          ? { ...room, name: inlineRoomName, code: inlineAbbreviation }
          : room
      ))
      setEditingRoomId(null)
      setInlineRoomName("")
      setInlineAbbreviation("")
    }
  }
  
  // Function to handle inline edit cancel
  const handleCancelEdit = () => {
    setEditingRoomId(null)
    setInlineRoomName("")
  }
  
  // Function to handle inline delete
  const handleInlineDelete = (room: {id: string, name: string, code: string}) => {
    setDeletingRoomId(room.id)
    setRoomToDelete(room)
  }
  
  // Function to confirm inline delete
  const handleConfirmDelete = () => {
    if (roomToDelete) {
      setInclusionCategories(prev => prev.filter(inclusion => inclusion.id !== roomToDelete.id))
      setDeletingRoomId(null)
      setRoomToDelete(null)
    }
  }
  
  // Function to cancel inline delete
  const handleCancelDelete = () => {
    setDeletingRoomId(null)
    setRoomToDelete(null)
  }
  
  // Function to handle moving a room up or down in priority
  const handleMoveRoom = (roomId: string, direction: 'up' | 'down') => {
    setRoomCategories(prev => {
      const newCategories = [...prev]
      const currentIndex = newCategories.findIndex(room => room.id === roomId)
      
      if (currentIndex === -1) return prev
      
      if (direction === 'up' && currentIndex > 0) {
        // Move up: swap with previous room
        [newCategories[currentIndex], newCategories[currentIndex - 1]] = [newCategories[currentIndex - 1], newCategories[currentIndex]]
      } else if (direction === 'down' && currentIndex < newCategories.length - 1) {
        // Move down: swap with next room
        [newCategories[currentIndex], newCategories[currentIndex + 1]] = [newCategories[currentIndex + 1], newCategories[currentIndex]]
      }
      
      return newCategories
    })
    
    // Show green background animation for 3 seconds
    setMovedRoomId(roomId)
    setTimeout(() => {
      setMovedRoomId(null)
    }, 3000)
  }
  
  // Responsive columns per page based on screen resolution
  const getColumnsPerPage = () => {
    // Use window.innerWidth directly if windowWidth is 0 (initial state)
    const currentWidth = windowWidth || (typeof window !== 'undefined' ? window.innerWidth : 1352)
    
    if (currentWidth < 1352) return 3
    if (currentWidth >= 1352 && currentWidth <= 1500) return 4
    if (currentWidth >= 1501 && currentWidth <= 1800) return 5
    if (currentWidth > 1800) return 6
    return 4 // default fallback
  }
  
  const columnsPerPage = getColumnsPerPage()
  
  // Calculate total pages based on columns per page
  const totalHotels = 14
  const calculatedTotalPages = Math.ceil(totalHotels / columnsPerPage)
  
  // Update total pages when columns per page changes
  useEffect(() => {
    setTotalTablePages(calculatedTotalPages)
    // Reset to first page if current page exceeds new total
    if (currentTablePage > calculatedTotalPages) {
      setCurrentTablePage(1)
      setColumnStartIndex(0)
    }
  }, [columnsPerPage, calculatedTotalPages, currentTablePage])
  
  // Track window width changes
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth
      setWindowWidth(newWidth)
      console.log('Window width changed to:', newWidth, 'Columns per page:', getColumnsPerPage())
    }
    
    // Set initial width immediately
    if (typeof window !== 'undefined') {
      handleResize()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Close dropdown when clicking outside (for 3-dots dropdown)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside the dropdown container
      const isClickInsideDropdownContainer = (event.target as Element)?.closest('.dropdown-container')
      if (openDropdown && !isClickInsideDropdownContainer) {
        setOpenDropdown(null)
      }
    }

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdown])

  // Close hotel cell dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside the dropdown
      const target = event.target as Element
      const isClickInsideDropdown = target?.closest('.hotel-cell-dropdown-menu') // Check if clicking inside the dropdown menu
      const isClickOnCell = target?.closest('.hotel-cell-container') // Check if clicking on the cell itself
      
      if (openHotelCellDropdown && !isClickInsideDropdown && !isClickOnCell) {
        setOpenHotelCellDropdown(null)
      }
    }

    if (openHotelCellDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openHotelCellDropdown])
  
  // Basic tab data
  const [inclusionCategories, setInclusionCategories] = useState([
    { id: "executive", name: "Executive Room Executive Room Executive Room Executive Room Executive Room Executive Room Executive Room ", code: "Exe" },
    { id: "bungalow", name: "BUNGALOW", code: "BGL" },
    { id: "villa", name: "VILLA", code: "VLA" },
    { id: "suite", name: "Suite", code: "SUI" },
    { id: "deluxe", name: "Deluxe Room", code: "DLX" },
    { id: "standard", name: "Standard Room", code: "STD" },
    { id: "presidential", name: "Presidential Suite", code: "PSU" },
    { id: "penthouse", name: "Penthouse", code: "PTH" },
    { id: "apartment", name: "Apartment", code: "APT" },
    { id: "studio", name: "Studio", code: "STU" },
    { id: "family", name: "Family Room", code: "FAM" },
    { id: "superior", name: "Superior Room", code: "SUP" },
    { id: "economy", name: "Economy Room", code: "ECO" },
    { id: "luxury", name: "Luxury Suite", code: "LUX" },
    { id: "penthouse-deluxe", name: "Penthouse Deluxe", code: "PED" },
    { id: "oceanview", name: "Ocean View Room", code: "OCE" },
    { id: "gardenview", name: "Garden View Room", code: "GAR" },
    { id: "cityview", name: "City View Room", code: "CIT" },
    { id: "panoramic", name: "Panoramic Suite", code: "PAN" },
    { id: "premium", name: "Premium Room", code: "PRE" },
    { id: "royal", name: "Royal Suite", code: "ROY" },
    { id: "executive-suite", name: "Last row", code: "EXS" }
  ])
  
  // Effect to track original order when modal opens
  useEffect(() => {
    if (showManageRoomModal) {
      setOriginalInclusionCategories([...inclusionCategories])
      setHasPriorityChanged(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showManageRoomModal])
  
  // Effect to detect priority changes
  useEffect(() => {
    if (showManageRoomModal && originalInclusionCategories.length > 0) {
      const hasChanged = JSON.stringify(originalInclusionCategories.map(r => r.id)) !== 
                        JSON.stringify(inclusionCategories.map(r => r.id))
      setHasPriorityChanged(hasChanged)
    }
  }, [inclusionCategories, originalInclusionCategories, showManageRoomModal])
  
  const hotels = [
    { id: "central-hotel", name: "Central Hotel" },
    { id: "taj-mahal", name: "Taj Mahal" },
    { id: "alhambra-hotel", name: "Alhambra Hotel" },
    { id: "grand-palace", name: "Grand Palace Resort" },
    { id: "luxury-beachfront", name: "Luxury Beachfront Villa" },
    { id: "mountain-lodge", name: "Mountain View Lodge" }
  ]
  
  const [isLoading, setIsLoading] = useState(true)
  const [showChangeHistory, setShowChangeHistory] = useState(false)
  const [currentPage, setCurrentPage] = useState(1) // Added for pagination
  const [descriptionSets, setDescriptionSets] = useState([{ id: 1, includeText: "Cloud 9 Suite, Studio Suite, 1 Bedroom Suite, 1 King, Mountain view, Suite, Suite Prestige with Spa", excludeText: "" }]) // Added for description sets
  const [selectedRule, setSelectedRule] = useState(1) // Added for selected rule
  const [rules, setRules] = useState([{ id: 1, name: "Rule 1" }]) // Added for rules - start with only Rule 1
  const [ruleDescriptions, setRuleDescriptions] = useState({
    1: [{ id: 1, includeText: "Cloud 9 Suite, Studio Suite, 1 Bedroom Suite, 1 King, Mountain view, Suite, Suite Prestige with Spa", excludeText: "" }]
  }) // Added for rule-specific descriptions
  const [tableData, setTableData] = useState([
    {
      id: 1,
      property: "Grand Luxe Hotel - Small Luxury Hotel of the World",
      channel: "Makemytrip.com",
      description: "costs € 30 per person per night. Breakfast rated 6 Non-refundable Note that if canceled, modified, or in case of no-show, the total price of the reservation will be charged. Daily spa access per adult"
    },
    {
      id: 2,
      property: "Aguas de Ibiza Grand Luxe Hotel - Small Luxury Hotel of the World",
      channel: "Bookmyhotel.com",
      description: "Corner Suite with Large Terrace amp; SPA access | Continental breakfast included Breakfast rated 6 Non-refundable Note that if canceled, modified, or in case of no-show, the total price of the reservation will be charged. Daily spa access per adult"
    },
    {
      id: 3,
      property: "Aguas de Ibiza Grand Luxe Hotel - Small Luxury Hotel of the World",
      channel: "Goibibo.com",
      description: "Grand Suite with Sea View amp; SPA access- Cloud 9 | Continental breakfast included Breakfast rated 6 Non-refundable Note that if canceled, modified, or in case of no-show, the total price of the reservation will be charged. Daily spa access per adult"
    },
    {
      id: 4,
      property: "Aguas de Ibiza Grand Luxe Hotel - Small Luxury Hotel of the World",
      channel: "Yatra.com",
      description: "Cloud 9 Suite Continental breakfast included Breakfast rated 6 Non-refundable Note that if canceled, modified, or in case of no-show, the total price of the reservation will be charged. Daily spa access per adult"
    },
    {
      id: 5,
      property: "Aguas de Ibiza Grand Luxe Hotel - Small Luxury Hotel of the World",
      channel: "Cleartrip.com",
      description: "Executive Suite with Balcony | Continental breakfast included Breakfast rated 6 Non-refundable Note that if canceled, modified, or in case of no-show, the total price of the reservation will be charged. Daily spa access per adult"
    },
    {
      id: 6,
      property: "Grand Palace Resort & Spa Complex",
      channel: "Hotels.com",
      description: "Deluxe Room with Ocean View | Continental breakfast included Breakfast rated 6 Non-refundable Note that if canceled, modified, or in case of no-show, the total price of the reservation will be charged. Daily spa access per adult"
    },
    {
      id: 7,
      property: "Mountain View Lodge & Wellness Center",
      channel: "Trivago.com",
      description: "Premium King Room with Mountain View | Continental breakfast included Breakfast rated 6 Non-refundable Note that if canceled, modified, or in case of no-show, the total price of the reservation will be charged. Daily spa access per adult"
    },
    {
      id: 8,
      property: "Downtown Business Hotel & Conference Center",
      channel: "Kayak.com",
      description: "Business Class Room with City View | Continental breakfast included Breakfast rated 6 Non-refundable Note that if canceled, modified, or in case of no-show, the total price of the reservation will be charged. Daily spa access per adult"
    },
    {
      id: 9,
      property: "Historic Boutique Inn & Heritage Museum",
      channel: "Agoda.com",
      description: "Heritage Suite with Garden View | Continental breakfast included Breakfast rated 6 Non-refundable Note that if canceled, modified, or in case of no-show, the total price of the reservation will be charged. Daily spa access per adult"
    },
    {
      id: 10,
      property: "Oceanfront Resort Complex with Multiple Restaurants",
      channel: "Booking.com",
      description: "Oceanfront Villa with Private Beach | Continental breakfast included Breakfast rated 6 Non-refundable Note that if canceled, modified, or in case of no-show, the total price of the reservation will be charged. Daily spa access per adult"
    }
  ])

  // Generate random data for pagination
  const generateRandomData = () => {
    const properties = [
      "Luxury Beachfront Villa Resort",
      "Executive Corporate Center & Business Hub",
      "Ultra Luxury Mega Resort & Spa Complex",
      "Family Friendly Suite Hotel with Kids Club",
      "International Business Hotel & Convention Center",
      "Historic Boutique Inn & Heritage Museum",
      "Oceanfront Resort Complex with Multiple Restaurants",
      "Mountain View Lodge & Wellness Center",
      "Downtown Business Hotel & Conference Center",
      "Grand Palace Resort & Spa Complex"
    ]
    
    const channels = ["Makemytrip.com", "Bookmyhotel.com", "Goibibo.com", "Yatra.com", "Cleartrip.com", "Hotels.com", "Trivago.com", "Kayak.com", "Agoda.com", "Booking.com"]
    
    const descriptions = [
      "Standard Room with City View | Continental breakfast included",
      "Deluxe Room with Ocean View | Continental breakfast included", 
      "Premium King Room with Mountain View | Continental breakfast included",
      "Business Class Room with City View | Continental breakfast included",
      "Heritage Suite with Garden View | Continental breakfast included",
      "Oceanfront Villa with Private Beach | Continental breakfast included",
      "Executive Suite with Balcony | Continental breakfast included",
      "Family Suite with Kids Area | Continental breakfast included",
      "Presidential Suite with Panoramic View | Continental breakfast included",
      "Penthouse Suite with Private Terrace | Continental breakfast included"
    ]

    return Array.from({ length: 10 }, (_, index) => ({
      id: (currentPage - 1) * 10 + index + 1,
      property: properties[Math.floor(Math.random() * properties.length)],
      channel: channels[Math.floor(Math.random() * channels.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)]
    }))
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      setTableData(generateRandomData())
    }
  }

  const handleNextPage = () => {
    if (currentPage < 3) { // Assuming 3 pages total (26 items / 10 per page)
      setCurrentPage(currentPage + 1)
      setTableData(generateRandomData())
    }
  }

  const handleAddDescriptionSet = () => {
    const currentDescriptions = ruleDescriptions[selectedRule] || []
    const newId = Math.max(...currentDescriptions.map(set => set.id), 0) + 1
    const newSet = { id: newId, includeText: "", excludeText: "" }
    
    setRuleDescriptions(prev => ({
      ...prev,
      [selectedRule]: [...currentDescriptions, newSet]
    }))
  }

  const handleRemoveDescriptionSet = (idToRemove) => {
    const currentDescriptions = ruleDescriptions[selectedRule] || []
    if (currentDescriptions.length > 1) {
      const updatedDescriptions = currentDescriptions.filter(set => set.id !== idToRemove)
      
      setRuleDescriptions(prev => ({
        ...prev,
        [selectedRule]: updatedDescriptions
      }))
    }
  }

  const handleUpdateDescriptionSet = (id, field, value) => {
    const currentDescriptions = ruleDescriptions[selectedRule] || []
    const updatedDescriptions = currentDescriptions.map(set => 
      set.id === id ? { ...set, [field]: value } : set
    )
    
    setRuleDescriptions(prev => ({
      ...prev,
      [selectedRule]: updatedDescriptions
    }))
  }

  const handleRuleSelection = (ruleId) => {
    setSelectedRule(ruleId)
  }

  const handleAddRule = () => {
    if (rules.length < 3) {
      const newId = rules.length + 1
      const newRule = { id: newId, name: `Rule ${newId}` }
      setRules([...rules, newRule])
      
      // Add blank descriptions for the new rule
      setRuleDescriptions(prev => ({
        ...prev,
        [newId]: [{ id: 1, includeText: "", excludeText: "" }]
      }))
      
      // Select the newly added rule
      setSelectedRule(newId)
    }
  }

  const handleDeleteRule = (ruleId) => {
    if (rules.length > 1 && ruleId !== 1) { // Prevent deleting Rule 1
      const newRules = rules.filter(rule => rule.id !== ruleId)
      
      // Rename remaining rules to maintain sequential order (1, 2, 3)
      const renamedRules = newRules.map((rule, index) => ({
        id: index + 1,
        name: `Rule ${index + 1}`
      }))
      
      setRules(renamedRules)
      setSelectedRule(1) // Always select Rule 1 after deletion
      
      // Update rule descriptions to match new rule IDs
      const newRuleDescriptions = {}
      renamedRules.forEach((rule, index) => {
        const oldRuleId = rules.find(r => r.name === rule.name)?.id
        if (oldRuleId && ruleDescriptions[oldRuleId]) {
          newRuleDescriptions[rule.id] = ruleDescriptions[oldRuleId]
        }
      })
      setRuleDescriptions(newRuleDescriptions)
    }
  }

  // Basic tab handlers
  const handleInclusionCategorySelect = (categoryId) => {
    setSelectedInclusionCategory(categoryId)
  }

  const handleHotelSelect = (hotelId) => {
    setSelectedHotel(hotelId)
  }

  const handleCreateMapping = () => {
    if (selectedInclusionCategory && selectedHotel) {
      const inclusionCategory = inclusionCategories.find(cat => cat.id === selectedInclusionCategory)
      const hotel = hotels.find(h => h.id === selectedHotel)
      
      const newMapping = {
        id: Date.now(),
        inclusionCategory: inclusionCategory.name,
        inclusionCode: inclusionCategory.code,
        hotel: hotel.name,
        status: "Active"
      }
      
      setInclusionMappings(prev => [...prev, newMapping])
      setSelectedInclusionCategory("")
      setSelectedHotel("")
    }
  }

  const handleRemoveMapping = (mappingId) => {
    setRoomMappings(prev => prev.filter(mapping => mapping.id !== mappingId))
  }

  // Table pagination handlers - for columns (hotels)
  const nextTablePage = () => {
    setColumnStartIndex(prev => {
      return Math.min(prev + columnsPerPage, totalHotels - columnsPerPage)
    })
    setCurrentTablePage(prev => Math.min(prev + 1, totalTablePages))
  }
  
  const prevTablePage = () => {
    setColumnStartIndex(prev => Math.max(0, prev - columnsPerPage))
    setCurrentTablePage(prev => Math.max(prev - 1, 1))
  }
  
  const canGoNext = () => {
    return columnStartIndex + columnsPerPage < totalHotels
  }
  
  const canGoPrev = () => {
    return columnStartIndex > 0
  }

  // Dropdown handlers
  const handleDropdownToggle = (inclusionCategoryId) => {
    setOpenDropdown(openDropdown === inclusionCategoryId ? null : inclusionCategoryId)
  }

  const handleDropdownAction = (action, inclusionCategoryId) => {
    console.log(`${action} clicked for inclusion category: ${inclusionCategoryId}`)
    setOpenDropdown(null) // Close dropdown after action
    
    if (action === 'Delete') {
      // Find the inclusion to delete
      const inclusionToDelete = inclusionCategories.find(inclusion => inclusion.id === inclusionCategoryId)
      if (inclusionToDelete) {
        setRoomToDelete(inclusionToDelete)
        setShowDeleteRoomConfirm(true)
      }
    } else if (action === 'Rename') {
      // Find the inclusion to rename
      const inclusionToRename = inclusionCategories.find(inclusion => inclusion.id === inclusionCategoryId)
      if (inclusionToRename) {
        setRoomToRename(inclusionToRename)
        setRenameRoomName(inclusionToRename.name)
        setRenameAbbreviation(inclusionToRename.code)
        setShowRenameRoomModal(true)
      }
    } else if (action === 'Map to Room type') {
      // Set target category and enable bulk mapping mode
      setBulkMappingTargetCategory(inclusionCategoryId)
      setBulkMappingMode(true)
      setSelectedRoomsForBulk(new Set())
    }
  }
  
  // Helper function to get room data by key
  const getRoomDataByKey = (roomKey: string) => {
    const parts = roomKey.split('-')
    if (parts.length >= 3 && parts[0] === "unmapped") {
      const hotelId = parts[1]
      const cellKey = parts.slice(2).join('-')
      
      // Hardcoded room data mapping
      const roomData: Record<string, Record<string, { displayText: string, fullDescription: string }>> = {
        "central-hotel": {
          "0": { displayText: "2 Beds", fullDescription: "Room with 2 Beds and Modern Amenities" },
          "1": { displayText: "Deluxe Double Room...", fullDescription: "Deluxe Double Room with Premium Amenities and City Views" },
          "2": { displayText: "Economy Single Roo...", fullDescription: "Economy Single Room with Essential Amenities" },
          "3": { displayText: "Room Assigned on A...", fullDescription: "Room Assigned on Arrival with Flexible Check-in" },
          "4": { displayText: "Single Room shared...", fullDescription: "Single Room with Shared Facilities and Budget-Friendly Option" },
          "5": { displayText: "Single Room with Sh...", fullDescription: "Single Room with Shared Bathroom and Essential Amenities" },
          "6": { displayText: "Standard Double Ro...", fullDescription: "Standard Double Room with Basic Amenities and Comfortable Space" },
          "7": { displayText: "Standard Single Roo...", fullDescription: "Standard Single Room with Essential Amenities" },
          "8": { displayText: "Standard Suite, Ensu...", fullDescription: "Standard Suite with Ensuite Bathroom and Spacious Accommodation" },
          "9": { displayText: "Standard Triple Roo...", fullDescription: "Standard Triple Room with Three Beds and Extra Space" },
          "10": { displayText: "Standard Twin Room...", fullDescription: "Standard Twin Room with Two Beds and Comfortable Accommodation" },
          "11": { displayText: "Triple Ensuite", fullDescription: "Triple Room with Ensuite Bathroom and Three Beds" },
        },
        "hotel-palermitano": {
          "0": { displayText: "Basic Double Room...", fullDescription: "Basic Double Room with Essential Amenities and Simple Accommodation" },
          "1": { displayText: "Room Assigned on A...", fullDescription: "Room Assigned on Arrival with Flexible Check-in Options" },
        },
        "grand-palace": {
          "0": { displayText: "Palace Suite", fullDescription: "Palace Suite with Grand Views and Luxury Amenities" },
          "1": { displayText: "Royal Villa", fullDescription: "Royal Villa with Private Garden and Premium Services" },
        },
        "luxury-beachfront": {
          "0": { displayText: "Beach Villa", fullDescription: "Beach Villa with Ocean Views and Private Beach Access" },
          "1": { displayText: "Beach House", fullDescription: "Beach House with Ocean Views" },
        },
        "mountain-lodge": {
          "0": { displayText: "Mountain Cabin", fullDescription: "Mountain Cabin with Natural Surroundings" },
        },
        "downtown-business": {
          "0": { displayText: "Corporate Suite", fullDescription: "Corporate Suite with Business Amenities" },
        },
        "historic-boutique": {
          "0": { displayText: "Heritage Room", fullDescription: "Heritage Room with Historic Charm" },
        },
        "oceanfront-resort": {
          "0": { displayText: "Resort Villa", fullDescription: "Resort Villa with Premium Amenities" },
          "1": { displayText: "Beach House", fullDescription: "Beach House with Ocean Views" },
        },
        "family-friendly": {
          "0": { displayText: "Family Suite", fullDescription: "Family Suite with Extra Space and Amenities" },
        },
        "executive-corporate": {
          "0": { displayText: "Executive Boardroom", fullDescription: "Executive Boardroom with Conference Facilities" },
        },
        "ultra-luxury": {
          "0": { displayText: "Presidential Suite", fullDescription: "Presidential Suite with Luxury Amenities" },
        },
        "international-business": {
          "0": { displayText: "International Suite", fullDescription: "International Suite with Global Standards" },
        },
      }
      
      return roomData[hotelId]?.[cellKey] || { displayText: "Room", fullDescription: "Room description" }
    }
    return { displayText: "Room", fullDescription: "Room description" }
  }

  const handleBulkMappingSave = () => {
    if (!bulkMappingTargetCategory || selectedRoomsForBulk.size === 0) {
      // No selection, just close
      setBulkMappingMode(false)
      setSelectedRoomsForBulk(new Set())
      setBulkMappingTargetCategory(null)
      return
    }
    
    console.log('Bulk mapping save clicked')
    console.log('Selected rooms:', Array.from(selectedRoomsForBulk))
    console.log('Target category:', bulkMappingTargetCategory)
    
    // For each selected room, move it to the target category
    selectedRoomsForBulk.forEach((roomKey) => {
      // Parse the key format: "unmapped-hotelId-cellKey"
      const parts = roomKey.split('-')
      if (parts.length >= 3 && parts[0] === "unmapped") {
        const hotelId = parts[1]
        const cellKey = parts.slice(2).join('-')
        
        // Get the actual room data
        const roomData = getRoomDataByKey(roomKey)
        const displayText = roomData.displayText
        const fullDescription = roomData.fullDescription
        
        // Add to mapped rooms with green background animation
        const timestamp = Date.now()
        const targetKey = `${bulkMappingTargetCategory}-${hotelId}-${timestamp}`
        
        setInclusionMappingsMap(prev => {
          const newMap = new Map(prev)
          newMap.set(targetKey, {
            displayText,
            fullDescription,
            sourceCategoryId: 'unmapped',
            sourceHotelId: hotelId,
            sourceCellKey: cellKey
          })
          console.log(`Bulk mapping: Adding room "${displayText}" to ${bulkMappingTargetCategory} with key: ${targetKey}`)
          console.log(`Current inclusionMappingsMap keys:`, Array.from(newMap.keys()))
          return newMap
        })
        
        // Show green background on destination for 10 seconds
        setNewlyMappedRooms(prev => new Set(prev).add(targetKey))
        setTimeout(() => {
          setNewlyMappedRooms(prev => {
            const newSet = new Set(prev)
            newSet.delete(targetKey)
            return newSet
          })
        }, 10000)
        
        // Show red background on source (unmapped section) for 1 second
        setRemovingRooms(prev => new Set(prev).add(roomKey))
        setTimeout(() => {
          setRemovingRooms(prev => {
            const newSet = new Set(prev)
            newSet.delete(roomKey)
            return newSet
          })
        }, 1000)
        
        // Hide the source room after red animation
        setTimeout(() => {
          setMappedCellKeys(prev => new Set(prev).add(roomKey))
        }, 1000)
      }
    })
    
    // Clear bulk mapping mode and selections after all operations complete
    setTimeout(() => {
      setBulkMappingMode(false)
      setSelectedRoomsForBulk(new Set())
      setBulkMappingTargetCategory(null)
    }, 100)
  }
  
  const handleBulkMappingCancel = () => {
    setBulkMappingMode(false)
    setSelectedRoomsForBulk(new Set())
    setBulkMappingTargetCategory(null)
  }
  
  const handleCheckboxChange = (key: string, checked: boolean) => {
    if (checked) {
      setSelectedRoomsForBulk(prev => new Set(prev).add(key))
    } else {
      setSelectedRoomsForBulk(prev => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })
    }
  }
  
  const handleDeleteRoom = () => {
    if (roomToDelete) {
      // Remove the room from the categories list
      setInclusionCategories(prev => prev.filter(inclusion => inclusion.id !== roomToDelete.id))
      setShowDeleteRoomConfirm(false)
      setRoomToDelete(null)
      setShowManageRoomModal(true) // Reopen Manage Room modal
    }
  }
  
  const cancelDeleteRoom = () => {
    setShowDeleteRoomConfirm(false)
    setRoomToDelete(null)
    setShowManageRoomModal(true) // Reopen Manage Room modal
  }
  
  const handleRenameRoom = () => {
    if (roomToRename && renameRoomName && renameAbbreviation) {
      // Update the room in the categories list
      setInclusionCategories(prev => prev.map(inclusion => 
        room.id === roomToRename.id 
          ? { ...room, name: renameRoomName, code: renameAbbreviation }
          : room
      ))
      setShowRenameRoomModal(false)
      setRenameRoomName("")
      setRenameAbbreviation("")
      setRoomToRename(null)
      setShowManageRoomModal(true) // Reopen Manage Room modal
    }
  }
  
  const cancelRenameRoom = () => {
    setShowRenameRoomModal(false)
    setRenameRoomName("")
    setRenameAbbreviation("")
    setRoomToRename(null)
    setShowManageRoomModal(true) // Reopen Manage Room modal
  }

  // Hotel cell dropdown handler
  const handleHotelCellDropdownToggle = (key: string) => {
    setOpenHotelCellDropdown(openHotelCellDropdown === key ? null : key)
  }

  const handleHotelCellDropdownAction = (
    action: string, 
    inclusionCategoryId: string, 
    hotelId: string, 
    targetCategoryId?: string, 
    displayText?: string, 
    fullDescription?: string, 
    cellKey?: string
  ) => {
    console.log(`${action} clicked for ${inclusionCategoryId} at ${hotelId}`, {targetCategoryId, displayText, fullDescription, cellKey})
    
    if (action === 'Map to' && targetCategoryId && displayText && fullDescription && cellKey) {
      // Map room to target category - generate unique key with timestamp
      const timestamp = Date.now()
      const inclusionKey = `${targetCategoryId}-${hotelId}-${timestamp}`
      
      setInclusionMappingsMap(prev => {
        const newMap = new Map(prev)
        
        // Find and remove all existing instances of this room
        // The room might be in the map from a previous move operation
        // We need to find it by matching the current location (inclusionCategoryId-hotelId-cellKey)
        // OR by matching the source information stored in the room data
        const keysToRemove: string[] = []
        
        newMap.forEach((room, key) => {
          // Check if this is the room we're moving by:
          // 1. Checking if the key matches the current location pattern (for first move)
          // 2. Checking if the source info matches (for subsequent moves)
          const keyPrefix = `${inclusionCategoryId}-${hotelId}-`
          
          if (key.startsWith(keyPrefix)) {
            // This key is in the current location, check if it matches our inclusion
            // For Central Hotel, we'll match by the source info since keys have timestamps
            if (room.displayText === displayText || 
                (room.sourceCategoryId === inclusionCategoryId && 
                 room.sourceHotelId === hotelId && 
                 room.sourceCellKey === cellKey)) {
              keysToRemove.push(key)
            }
          }
        })
        
        // Remove the room from all previous locations
        keysToRemove.forEach(key => newMap.delete(key))
        
        // Add to target location
        newMap.set(inclusionKey, {
          displayText,
          fullDescription,
          sourceCategoryId: inclusionCategoryId,
          sourceHotelId: hotelId,
          sourceCellKey: cellKey
        })
        return newMap
      })
      
      // Mark the source cell as mapped (so it hides)
      const sourceCellKey = `${inclusionCategoryId}-${hotelId}-${cellKey}`
      console.log(`Adding to mappedCellKeys: ${sourceCellKey}`)
      
      // Show light red background on source before hiding (1000ms)
      setRemovingRooms(prev => new Set(prev).add(sourceCellKey))
      setTimeout(() => {
        setRemovingRooms(prev => {
          const newSet = new Set(prev)
          newSet.delete(sourceCellKey)
          return newSet
        })
      }, 1000)
      
      // Hide the source room after showing red background
      setTimeout(() => {
        setMappedCellKeys(prev => {
          const newSet = new Set(prev)
          // Remove any existing source keys for this room before adding the new one
          Array.from(newSet).forEach(key => {
            if (key.includes(hotelId) && key.includes(displayText)) {
              newSet.delete(key)
            }
          })
          newSet.add(sourceCellKey)
          console.log(`Updated mappedCellKeys:`, Array.from(newSet))
          return newSet
        })
      }, 1000)
      
      // Set animation state for smooth transition
      setAnimatingRoom(roomKey)
      
      // Add to newly mapped rooms with green background for 10000ms (10 seconds)
      setNewlyMappedRooms(prev => new Set(prev).add(roomKey))
      setTimeout(() => {
        setNewlyMappedRooms(prev => {
          const newSet = new Set(prev)
          newSet.delete(roomKey)
          return newSet
        })
      }, 10000)
      
      // Clear animating state
      setTimeout(() => setAnimatingRoom(null), 500)
      
      console.log(`Mapping inclusion "${displayText}" from ${inclusionCategoryId} to ${targetCategoryId}`)
    } else if (action === 'Unmap' && displayText && fullDescription && cellKey) {
      // Unmap logic - move from current category to unmapped section
      const sourceCellKey = `${inclusionCategoryId}-${hotelId}-${cellKey}`
      
      // Show red background on source for 1 second
      console.log(`Unmap: Adding to removingRooms: ${sourceCellKey}`)
      setRemovingRooms(prev => new Set(prev).add(sourceCellKey))
      setTimeout(() => {
        setRemovingRooms(prev => {
          const newSet = new Set(prev)
          newSet.delete(sourceCellKey)
          return newSet
        })
      }, 1000)
      
      // Hide the source room after red animation
      setTimeout(() => {
        setMappedCellKeys(prev => {
          const newSet = new Set(prev)
          newSet.add(sourceCellKey)
          return newSet
        })
      }, 1000)
      
      // Move to unmapped section
      const timestamp = Date.now()
      const unmappedKey = `unmapped-${hotelId}-${timestamp}`
      
      setInclusionMappingsMap(prev => {
        const newMap = new Map(prev)
        newMap.set(unmappedKey, {
          displayText,
          fullDescription,
          sourceCategoryId: 'unmapped',
          sourceHotelId: hotelId,
          sourceCellKey: cellKey
        })
        return newMap
      })
      
      // Show green background on destination (unmapped section) for 10 seconds
      console.log(`Unmap: Adding to newlyMappedRooms: ${unmappedKey}`)
      setNewlyMappedRooms(prev => new Set(prev).add(unmappedKey))
      setTimeout(() => {
        setNewlyMappedRooms(prev => {
          const newSet = new Set(prev)
          newSet.delete(unmappedKey)
          return newSet
        })
      }, 10000)
      
      console.log(`Unmapping inclusion "${displayText}" from ${inclusionCategoryId}`)
    }
    
    setOpenHotelCellDropdown(null)
  }

  // Helper to get mapped rooms for a specific category and hotel
  const getMappedInclusions = (inclusionCategoryId: string, hotelId: string) => {
    const mappedInclusions: Array<{displayText: string, fullDescription: string, cellKey: string}> = []
    const searchKey = `${inclusionCategoryId}-${hotelId}-`
    inclusionMappingsMap.forEach((inclusion, key) => {
      if (key.startsWith(searchKey)) {
        const keyParts = key.split('-')
        const uniqueId = keyParts.slice(2).join('-') // Get everything after first two parts
        mappedInclusions.push({
          displayText: inclusion.displayText,
          fullDescription: inclusion.fullDescription,
          cellKey: uniqueId
        })
      }
    })
    console.log(`getMappedInclusions for ${inclusionCategoryId}-${hotelId}: Found ${mappedInclusions.length} inclusions`, Array.from(inclusionMappingsMap.keys()).filter(k => k.startsWith(searchKey)))
    return mappedInclusions
  }

  // Helper to check if a cell is mapped (should be hidden)
  const isCellMapped = (inclusionCategoryId: string, hotelId: string, cellKey: string) => {
    const cellKeyString = `${inclusionCategoryId}-${hotelId}-${cellKey}`
    const isMapped = mappedCellKeys.has(cellKeyString)
    console.log(`Checking if cell is mapped: ${cellKeyString} = ${isMapped}`, Array.from(mappedCellKeys))
    return isMapped
  }

  // Full room descriptions data
  const getFullInclusionDescription = (inclusionCategoryId, hotelId, displayText) => {
    const descriptions = {
      "executive-central-hotel": {
        "Double Room": "Double Room with Premium View and Private Balcony",
        "Double Room with Pr...": "Double Room with Premium View and Private Balcony overlooking the city"
      },
      "suite-central-hotel": {
        "Standard Suite With...": "Standard Suite With King Bed and Jacuzzi Bathroom"
      },
      // Add more mappings as needed
    }
    
    return descriptions[`${inclusionCategoryId}-${hotelId}`]?.[displayText] || displayText
  }

  // Generate paginated hotel columns data
  const getPaginatedHotelColumns = () => {
    const allHotels = [
      { id: "central-hotel", name: "Central Hotel", shortName: "Central Hotel" },
      { id: "holiday-home", name: "Holiday Home Sahur...", shortName: "Holiday Home Sahur..." },
      { id: "alhambra-hotel", name: "Alhambra Hotel", shortName: "Alhambra Hotel" },
      { id: "hotel-palermitano", name: "Hotel Palermitano by...", shortName: "Hotel Palermitano by..." },
      { id: "grand-palace", name: "Grand Palace Resort & Spa", shortName: "Grand Palace Resort..." },
      { id: "luxury-beachfront", name: "Luxury Beachfront Villa", shortName: "Luxury Beachfront..." },
      { id: "mountain-lodge", name: "Mountain View Lodge", shortName: "Mountain View Lodge" },
      { id: "downtown-business", name: "Downtown Business Hotel", shortName: "Downtown Business..." },
      { id: "historic-boutique", name: "Historic Boutique Inn", shortName: "Historic Boutique..." },
      { id: "oceanfront-resort", name: "Oceanfront Resort Complex", shortName: "Oceanfront Resort..." },
      { id: "family-friendly", name: "Family Friendly Suite Hotel", shortName: "Family Friendly..." },
      { id: "executive-corporate", name: "Executive Corporate Center", shortName: "Executive Corporate..." },
      { id: "ultra-luxury", name: "Ultra Luxury Mega Resort", shortName: "Ultra Luxury..." },
      { id: "international-business", name: "International Business Hotel", shortName: "International Business..." }
    ]
    
    return allHotels.slice(columnStartIndex, columnStartIndex + columnsPerPage)
  }

  // All room categories (no pagination on rows)
  const getAllInclusionCategories = () => {
    return inclusionCategories
  }
  
  // Simulate loading effect on component mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000) // Show loading for 3 seconds

    return () => clearTimeout(timer)
  }, [])

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
                  <div className="h-9 w-32 bg-gray-300 animate-pulse rounded"></div>
                </div>
              </div>

              {/* Mapping Tabs Skeleton */}
              <div className="relative overflow-hidden rounded-lg border">
                <div className="absolute top-0 left-0 right-0 z-10">
                  <div className="h-[3px] w-full bg-gray-200/50 dark:bg-gray-800/50 overflow-hidden rounded-sm">
                    <div className="h-full bg-blue-500/90 shadow-sm shadow-blue-500/20 transition-all duration-150 ease-out w-3/4"></div>
                  </div>
                </div>
                <div>
                  <div className="flex space-x-4 mb-6">
                    <div className="h-10 w-24 bg-gray-300 animate-pulse rounded"></div>
                    <div className="h-10 w-24 bg-gray-300 animate-pulse rounded"></div>
                  </div>
                  
                  {/* Mapping Content Skeleton */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Hotels */}
                    <div className="space-y-4">
                      <div className="h-5 w-32 bg-gray-300 animate-pulse rounded"></div>
                      <div className="space-y-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="h-10 w-full bg-gray-300 animate-pulse rounded"></div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Right Column - Room Categories */}
                    <div className="space-y-4">
                      <div className="h-5 w-40 bg-gray-300 animate-pulse rounded"></div>
                      <div className="space-y-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="h-10 w-full bg-gray-300 animate-pulse rounded"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Settings Tabs Section */}
      <SettingsTab 
        activeTab={activeSettingsTab}
        setActiveTab={handleSettingsTabChange}
        settingsTabs={settingsTabs}
      />
      
      {/* Tab Contents */}
      <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-4 py-4 md:py-6 lg:py-8">
        <div className="max-w-6xl mx-auto">
          <TooltipProvider>
            <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-base font-semibold text-foreground pb-[10px]">Mapping:</span>
            <div className="flex items-center gap-6">
              <Link
                href="/settings/mapping"
                className={`pb-1 border-b-2 text-sm ${
                  activeTab === "room"
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground font-normal"
                }`}
              >
                Room
              </Link>
              <Link
                href="/settings/mapping/rate"
                className={`pb-1 border-b-2 text-sm ${
                  activeTab === "rate"
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground font-normal"
                }`}
              >
                Rate
              </Link>
              <Link
                href="/settings/mapping/inclusions"
                className={`pb-1 border-b-2 text-sm ${
                  activeTab === "inclusions"
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground font-normal"
                }`}
              >
                Inclusions
              </Link>
            </div>
          </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (mappingMode === "advanced") {
                setShowAddRoomModalAdvanced(true)
              } else {
                setShowAddRoomModal(true)
              }
            }}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Add Inclusion
          </button>
          {mappingMode === "advanced" && (
            <button 
              onClick={() => setShowManageRoomModal(true)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Manage Inclusion
            </button>
          )}
        </div>
      </div>

      {/* Room Mapping Content */}
        <div className="bg-gradient-to-br from-card to-card/50 border-gray-200 dark:border-slate-700 rounded-lg border">
          <div>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <span className="text-base font-medium text-foreground">Map Inclusions</span>
              </div>
            </div>

            {/* Filter Section */}
            <div className="bg-gray-100 p-4 rounded-lg mx-6">
              <div className="flex items-end gap-6">
                {/* Property Dropdown */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Property</label>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[130px] h-8 text-xs [&>span]:max-w-[12ch] [&>span]:truncate">
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                      <SelectItem value="all" className="pl-3 [&>span:first-child]:hidden">All</SelectItem>
                      <SelectItem value="central-hotel" className="pl-3 [&>span:first-child]:hidden">Central Hotel</SelectItem>
                      <SelectItem value="taj-mahal" className="pl-3 [&>span:first-child]:hidden">Taj Mahal</SelectItem>
                        <SelectItem value="grand-palace-resort" className="pl-3 [&>span:first-child]:hidden">
                          <div className="max-w-[32ch] break-words leading-tight">
                            Grand Palace Resort & Spa Complex with Premium Amenities and Luxury Services
                  </div>
                        </SelectItem>
                      <SelectItem value="luxury-beachfront-villa" className="pl-3 [&>span:first-child]:hidden">
                          <div className="max-w-[32ch] break-words leading-tight">
                          Luxury Beachfront Villa Resort with Ocean Views and Private Beach Access
                      </div>
                      </SelectItem>
                      <SelectItem value="mountain-view-lodge" className="pl-3 [&>span:first-child]:hidden">
                          <div className="max-w-[32ch] break-words leading-tight">
                          Mountain View Lodge & Wellness Center with Spa Services and Hiking Trails
                  </div>
                      </SelectItem>
                      <SelectItem value="downtown-business-hotel" className="pl-3 [&>span:first-child]:hidden">
                          <div className="max-w-[32ch] break-words leading-tight">
                          Downtown Business Hotel & Conference Center with Meeting Rooms and Business Services
                </div>
                      </SelectItem>
                      <SelectItem value="historic-boutique-inn" className="pl-3 [&>span:first-child]:hidden">
                          <div className="max-w-[32ch] break-words leading-tight">
                          Historic Boutique Inn & Heritage Museum with Guided Tours and Cultural Experiences
              </div>
                      </SelectItem>
                      <SelectItem value="oceanfront-resort-complex" className="pl-3 [&>span:first-child]:hidden">
                          <div className="max-w-[32ch] break-words leading-tight">
                          Oceanfront Resort Complex with Multiple Restaurants, Pools, and Entertainment Facilities
            </div>
                      </SelectItem>
                      <SelectItem value="family-friendly-suite-hotel" className="pl-3 [&>span:first-child]:hidden">
                          <div className="max-w-[32ch] break-words leading-tight">
                          Family Friendly Suite Hotel with Kids Club, Playground, and Family Activities
                        </div>
                      </SelectItem>
                      <SelectItem value="executive-corporate-center" className="pl-3 [&>span:first-child]:hidden">
                          <div className="max-w-[32ch] break-words leading-tight">
                          Executive Corporate Center & Business Hub with Co-working Spaces and Networking Events
                        </div>
                      </SelectItem>
                      <SelectItem value="ultra-luxury-mega-resort" className="pl-3 [&>span:first-child]:hidden">
                          <div className="max-w-[32ch] break-words leading-tight">
                          Ultra Luxury Mega Resort & Spa Complex with Premium Ameni...
                        </div>
                      </SelectItem>
                      <SelectItem value="international-business-hotel" className="pl-3 [&>span:first-child]:hidden">
                          <div className="max-w-[32ch] break-words leading-tight">
                          International Business Hotel & Convention Center with St...
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                        {/* Channel Dropdown */}
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-gray-600">Channel</label>
                          <Select value={advancedChannel} onValueChange={setAdvancedChannel}>
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                            <SelectContent className="max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                              <SelectItem value="all" className="pl-3 [&>span:first-child]:hidden">All</SelectItem>
                              <SelectItem value="agoda" className="pl-3 [&>span:first-child]:hidden">Agoda</SelectItem>
                              <SelectItem value="booking" className="pl-3 [&>span:first-child]:hidden">Booking.com</SelectItem>
                              <SelectItem value="expedia" className="pl-3 [&>span:first-child]:hidden">Expedia</SelectItem>
                              <SelectItem value="makemytrip" className="pl-3 [&>span:first-child]:hidden">makemytrip.com</SelectItem>
                              <SelectItem value="bookmyhotel" className="pl-3 [&>span:first-child]:hidden">bookmyhotel.com</SelectItem>
                              <SelectItem value="goibibo" className="pl-3 [&>span:first-child]:hidden">goibibo.com</SelectItem>
                              <SelectItem value="yatra" className="pl-3 [&>span:first-child]:hidden">yatra.com</SelectItem>
                              <SelectItem value="cleartrip" className="pl-3 [&>span:first-child]:hidden">cleartrip.com</SelectItem>
                              <SelectItem value="hotels" className="pl-3 [&>span:first-child]:hidden">hotels.com</SelectItem>
                              <SelectItem value="trivago" className="pl-3 [&>span:first-child]:hidden">trivago.com</SelectItem>
                              <SelectItem value="kayak" className="pl-3 [&>span:first-child]:hidden">kayak.com</SelectItem>
                  </SelectContent>
                </Select>
              </div>

                {/* Room Description */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Room Description</label>
                  <div className="flex items-center gap-2 h-8">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-xs text-gray-700">Show only matching entries</span>
                    </div>
                </div>

                  {/* Match Labels */}
                  <div className="flex items-center gap-2 ml-auto">
                    <div className="px-3 py-1 bg-teal-200 text-black text-xs font-medium rounded">
                      Exact Match
              </div>
                    <div className="px-3 py-1 bg-orange-200 text-black text-xs font-medium rounded">
                      Partial Match
            </div>
                  </div>
              </div>
            </div>

            {/* Two Section Layout */}
            <div className="flex gap-6 mt-4 mx-6 mb-6">
              {/* Left Section - 30% */}
              <div className="w-[30%] space-y-4">
                {/* Room Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 mt-2">Inclusion</label>
                  <Select defaultValue="executive">
                    <SelectTrigger className="w-full max-w-[280px] [&>span]:truncate">
                      <SelectValue>
                        {(() => {
                          const selectedInclusion = inclusionCategories.find(cat => cat.id === "executive")
                          if (!selectedInclusion) return ""
                          const displayName = selectedInclusion.name.length > 28 ? `${selectedInclusion.name.substring(0, 28)}...` : selectedInclusion.name
                          return displayName
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="w-[280px] max-h-[150px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                      {inclusionCategories.map((category) => {
                        const displayName = category.name.length > 56 ? `${category.name.substring(0, 56)}...` : category.name
                        return (
                          <SelectItem key={category.id} value={category.id} className="pl-3 [&>span:first-child]:hidden whitespace-normal break-words py-2 min-h-[44px]">
                            <span className="block leading-tight">{displayName}</span>
                          </SelectItem>
                        )
                      })}
                      <SelectItem value="c9" className="pl-3 [&>span:first-child]:hidden">C9</SelectItem>
                      <SelectItem value="suite" className="pl-3 [&>span:first-child]:hidden">Suite</SelectItem>
                      <SelectItem value="deluxe" className="pl-3 [&>span:first-child]:hidden">Deluxe</SelectItem>
                      <SelectItem value="presidential" className="pl-3 [&>span:first-child]:hidden">Presidential</SelectItem>
                      <SelectItem value="penthouse" className="pl-3 [&>span:first-child]:hidden">Penthouse</SelectItem>
                      <SelectItem value="standard" className="pl-3 [&>span:first-child]:hidden">Standard</SelectItem>
                      <SelectItem value="family" className="pl-3 [&>span:first-child]:hidden">Family</SelectItem>
                      <SelectItem value="business" className="pl-3 [&>span:first-child]:hidden">Business</SelectItem>
                      <SelectItem value="heritage" className="pl-3 [&>span:first-child]:hidden">Heritage</SelectItem>
                      <SelectItem value="oceanfront" className="pl-3 [&>span:first-child]:hidden">Oceanfront</SelectItem>
                      <SelectItem value="mountain" className="pl-3 [&>span:first-child]:hidden">Mountain View</SelectItem>
                    </SelectContent>
                  </Select>
            </div>

                {/* Keywords Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700 mt-2">Keywords</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {rules.map((rule) => (
                      <div key={rule.id} className="relative">
                        <button
                          onClick={() => handleRuleSelection(rule.id)}
                          className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                            selectedRule === rule.id
                              ? "bg-blue-600 border-blue-600 font-semibold text-white"
                              : "bg-white border-gray-200 text-black hover:bg-gray-50"
                          }`}
                        >
                          {rule.name}
                        </button>
                        {rules.length > 1 && rule.id !== 1 && (
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    {rules.length < 3 && (
                      <button 
                        onClick={handleAddRule}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        +Add
                      </button>
                    )}
                  </div>
                </div>

                {/* Rate Description Section */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700 mt-2">Rate Description</h3>

                          {ruleDescriptions[selectedRule]?.map((set, index) => (
                            <div key={set.id} className="space-y-4">
                              {/* Include Section */}
            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="w-[90%] text-xs text-black font-semibold">
                                    Rate Description <span className="text-green-600">Includes</span> atleast one Custom keyword from the box
                                  </p>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button 
                                          className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm hover:bg-blue-700 transition-colors"
                                          onClick={ruleDescriptions[selectedRule]?.length > 1 ? () => handleRemoveDescriptionSet(set.id) : handleAddDescriptionSet}
                                        >
                                          {ruleDescriptions[selectedRule]?.length > 1 ? "-" : "+"}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-black text-white text-xs">
                                      <p>{ruleDescriptions[selectedRule]?.length > 1 ? "Remove Description" : "Add Another Description"}</p>
                                    </TooltipContent>
                                  </Tooltip>
                  </div>
                              </div>

                  <div className="space-y-2">
                                <textarea
                                  className="w-full h-24 p-3 border border-gray-300 rounded-md text-sm resize-none"
                                  value={set.includeText}
                                  onChange={(e) => handleUpdateDescriptionSet(set.id, 'includeText', e.target.value)}
              />
            </div>

                              {/* Exclude Section */}
            <div className="space-y-2">
                                <p className="text-xs text-black font-semibold">
                                  and <span className="text-red-600">Excludes</span> atleast one Custom keyword from the box
                                </p>
                                <textarea
                                  className="w-full h-24 p-3 border border-gray-300 rounded-md text-sm resize-none"
                                  placeholder="Enter keywords to exclude..."
                                  value={set.excludeText}
                                  onChange={(e) => handleUpdateDescriptionSet(set.id, 'excludeText', e.target.value)}
              />
            </div>

                              {/* Separator line between sets (except for last one) */}
                              {index < (ruleDescriptions[selectedRule]?.length || 0) - 1 && (
                                <div className="border-t border-gray-200"></div>
                              )}
                      </div>
                    ))}
                  </div>

                {/* Refresh Button */}
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700">
                  Refresh List &gt;
                </button>
                </div>

              {/* Right Section - 70% */}
              <div className="w-[70%]">
                {/* Pagination - Aligned with Room label */}
                <div className="flex justify-end items-center h-6 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">1 - 10 of 26</span>
                    <button 
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className={`p-1 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button 
                      onClick={handleNextPage}
                      disabled={currentPage === 3}
                      className={`p-1 rounded ${currentPage === 3 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
              </div>
            </div>

                {/* Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr className="border-b border-gray-200">
                        <th className="w-[140px] px-4 py-3 border-r border-gray-200 text-left text-xs font-semibold text-gray-700 bg-gray-100">Property</th>
                        <th className="w-[120px] px-4 py-3 border-r border-gray-200 text-left text-xs font-semibold text-gray-700 bg-gray-100">Channel</th>
                        <th className="px-4 py-3 border-r border-gray-200 text-left text-xs font-semibold text-gray-700 bg-gray-100">Room Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tableData.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          <td className="w-[140px] px-4 py-3 border-r border-gray-200 text-xs text-gray-900 break-words leading-tight">{row.property}</td>
                          <td className="w-[120px] px-4 py-3 border-r border-gray-200 text-xs text-black break-words leading-tight">{row.channel}</td>
                          <td className="px-4 py-3 border-r border-gray-200 text-xs text-gray-900">
                            {row.description.includes('Suite') && (
                              <>
                                {row.description.split('Suite').map((part, index) => (
                                  <React.Fragment key={index}>
                                    {part}
                                    {index < row.description.split('Suite').length - 1 && (
                                      <span className="bg-teal-200 px-1 rounded">Suite</span>
                                    )}
                                  </React.Fragment>
                                ))}
                              </>
                            )}
                            {row.description.includes('Deluxe') && (
                              <>
                                {row.description.split('Deluxe').map((part, index) => (
                                  <React.Fragment key={index}>
                                    {part}
                                    {index < row.description.split('Deluxe').length - 1 && (
                                      <span className="bg-orange-200 px-1 rounded">Deluxe</span>
                                    )}
                                  </React.Fragment>
                                ))}
                              </>
                            )}
                            {row.description.includes('Premium') && (
                              <>
                                {row.description.split('Premium').map((part, index) => (
                                  <React.Fragment key={index}>
                                    {part}
                                    {index < row.description.split('Premium').length - 1 && (
                                      <span className="bg-orange-200 px-1 rounded">Premium</span>
                                    )}
                                  </React.Fragment>
                                ))}
                              </>
                            )}
                            {row.description.includes('Business') && (
                              <>
                                {row.description.split('Business').map((part, index) => (
                                  <React.Fragment key={index}>
                                    {part}
                                    {index < row.description.split('Business').length - 1 && (
                                      <span className="bg-orange-200 px-1 rounded">Business</span>
                                    )}
                                  </React.Fragment>
                                ))}
                              </>
                            )}
                            {!row.description.includes('Suite') && !row.description.includes('Deluxe') && !row.description.includes('Premium') && !row.description.includes('Business') && row.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                      </table>
                    </div>
                  </div>
                </div>

            {/* Bottom Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 mb-6 mr-6">
              <button className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                Save
              </button>
            </div>
            </div>
          </div>

      {/* Change History Modal */}
      <Dialog open={showChangeHistory} onOpenChange={setShowChangeHistory}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Mapping Change History</DialogTitle>
            <DialogDescription>
              View all changes made to mapping settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Mapping change history functionality would be implemented here with actual data from the backend.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6">
            <button
              onClick={() => setShowChangeHistory(false)}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Inclusion Modal */}
      <Dialog open={showAddRoomModal} onOpenChange={setShowAddRoomModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Inclusion</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Inclusion Name */}
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-1">
                Inclusion Name<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                value={roomName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomName(e.target.value)}
                onBlur={() => setTouchedRoomName(true)}
                placeholder="Enter inclusion name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
              />
              {touchedRoomName && roomName.length === 0 && (
                <p className="text-red-500 text-xs mt-1">Inclusion Name is required.</p>
              )}
            </div>

          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setShowAddRoomModal(false)
                setRoomName("")
                setTouchedRoomName(false)
              }}
              className="h-9 px-4 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (roomName) {
                  // Generate unique ID for new inclusion
                  const newRoomId = roomName.toLowerCase().replace(/\s+/g, '-')
                  
                  // Add new inclusion to the top of the categories list
                  setRoomCategories(prev => [
                    { id: newRoomId, name: roomName, code: "" },
                    ...prev
                  ])
                  
                  setShowAddRoomModal(false)
                  setRoomName("")
                  setTouchedRoomName(false)
                }
              }}
              disabled={!roomName}
              className="h-9 px-4 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Inclusion Modal for Advanced Tab */}
      <Dialog open={showAddRoomModalAdvanced} onOpenChange={setShowAddRoomModalAdvanced}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Inclusion</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Room Creation Mode Radio Buttons */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="new-room"
                  name="roomCreationMode"
                  value="new"
                  checked={roomCreationMode === "new"}
                  onChange={(e) => setRoomCreationMode(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="new-room" className="text-sm font-medium text-gray-700 cursor-pointer">
                  New
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="recommended-list"
                  name="roomCreationMode"
                  value="recommended"
                  checked={roomCreationMode === "recommended"}
                  onChange={(e) => setRoomCreationMode(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="recommended-list" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Recommended List
                </Label>
              </div>
            </div>

            {/* Inclusion Name */}
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-1">
                Inclusion Name<span className="text-red-500 ml-1">*</span>
              </Label>
              {roomCreationMode === "recommended" ? (
                <Select value={roomName} onValueChange={(value) => {
                  setRoomName(value)
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Inclusion Name*" />
                  </SelectTrigger>
                  <SelectContent className="text-left">
                    <SelectItem value="Apartment" className="pl-3">Apartment</SelectItem>
                    <SelectItem value="Bungalow" className="pl-3">Bungalow</SelectItem>
                    <SelectItem value="Deluxe Room" className="pl-3">Deluxe Room</SelectItem>
                    <SelectItem value="Standard Room" className="pl-3">Standard Room</SelectItem>
                    <SelectItem value="Studio" className="pl-3">Studio</SelectItem>
                    <SelectItem value="Suite" className="pl-3">Suite</SelectItem>
                    <SelectItem value="Superior Room" className="pl-3">Superior Room</SelectItem>
                    <SelectItem value="Villa" className="pl-3">Villa</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={roomName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomName(e.target.value)}
                  onBlur={() => setTouchedRoomName(true)}
                  placeholder="Enter inclusion name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                />
              )}
              {touchedRoomName && roomName.length === 0 && roomCreationMode === "new" && (
                <p className="text-red-500 text-xs mt-1">Inclusion Name is required.</p>
              )}
            </div>

          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setShowAddRoomModalAdvanced(false)
                setRoomName("")
                setTouchedRoomName(false)
                setRoomCreationMode("new")
              }}
              className="h-9 px-4 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (roomName) {
                  // Generate unique ID for new inclusion
                  const newRoomId = roomName.toLowerCase().replace(/\s+/g, '-')
                  
                  // Add new inclusion to the top of the categories list
                  setRoomCategories(prev => [
                    { id: newRoomId, name: roomName, code: "" },
                    ...prev
                  ])
                  
                  setShowAddRoomModalAdvanced(false)
                  setRoomName("")
                  setTouchedRoomName(false)
                  setRoomCreationMode("new")
                }
              }}
              disabled={!roomName}
              className="h-9 px-4 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Room Confirmation Modal */}
      <Dialog open={showDeleteRoomConfirm} onOpenChange={setShowDeleteRoomConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-black">Delete Inclusion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this inclusion? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={cancelDeleteRoom}
              className="px-6 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteRoom}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Room Modal */}
      <Dialog open={showRenameRoomModal} onOpenChange={setShowRenameRoomModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Rename Inclusion</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Inclusion Name */}
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-1">
                Inclusion Name<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                value={renameRoomName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRenameRoomName(e.target.value)}
                placeholder="Enter inclusion name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
              />
            </div>

            {/* Abbreviation */}
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-1">
                Abbreviation<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                value={renameAbbreviation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value.toUpperCase()
                  if (value.length <= 3) {
                    setRenameAbbreviation(value)
                  }
                }}
                placeholder="Enter abbreviation"
                maxLength={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200 uppercase"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={cancelRenameRoom}
              className="h-9 px-4 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRenameRoom}
              disabled={!renameRoomName || !renameAbbreviation}
              className="h-9 px-4 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </DialogContent>
      </Dialog>


      {/* Manage Inclusion Modal */}
      <Dialog open={showManageRoomModal} onOpenChange={setShowManageRoomModal}>
        <DialogContent className="max-w-[403px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Manage Inclusion</DialogTitle>
            <p className="text-sm text-gray-600 mt-1">Edit and Delete inclusions</p>
          </DialogHeader>

          <div className="mt-2 flex-1 overflow-hidden">
            <div className="border border-gray-200 rounded-lg h-full">
              <div className="h-[400px] overflow-y-auto border-b border-gray-200">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50 sticky top-0 z-10 bg-gray-50 align-top border-b border-gray-200">
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 rounded-tl-lg bg-gray-50 align-top w-[75%]">Inclusion Name</th>
                      <th className="px-4 py-2 pr-6 text-right text-xs font-semibold text-gray-700 bg-gray-50 align-top w-[25%]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                  {inclusionCategories.map((inclusion, index) => {
                    const isEditing = editingRoomId === inclusion.id
                    const isDeleting = deletingRoomId === inclusion.id
                    
                    // If deleting, show confirmation message spanning all columns
                    if (isDeleting) {
                      return (
                        <tr key={inclusion.id} className="bg-red-50">
                          <td colSpan={2} className="px-4 py-4">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-700">
                                Are you sure you want to delete <span className="font-semibold">{inclusion.name}</span>? This action cannot be undone.
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={handleCancelDelete}
                                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleConfirmDelete}
                                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  Delete
                                </button>
            </div>
          </div>
                          </td>
                        </tr>
                      )
                    }
                    
                    // If editing, show input fields
                    if (isEditing) {
                      return (
                        <tr key={inclusion.id} className={`hover:bg-gray-50 ${movedRoomId === inclusion.id ? 'bg-green-300 transition-colors duration-300' : ''}`}>
                          <td className="px-4 py-2 w-[75%]">
                            <input
                              type="text"
                              value={inlineRoomName}
                              onChange={(e) => setInlineRoomName(e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-4 py-2 pr-6 text-right w-[25%]">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={handleCancelEdit}
                                className="text-sm text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    }
                    
                    // Normal display
                    const displayName = inclusion.name.length > 56 ? `${inclusion.name.substring(0, 56)}...` : inclusion.name
                    return (
                      <tr key={inclusion.id} className={`hover:bg-gray-50 ${movedRoomId === inclusion.id ? 'bg-green-300 transition-colors duration-300' : ''}`}>
                        <td className="px-4 py-2 text-sm text-gray-900 w-[75%]">{displayName}</td>
                      <td className="px-4 py-2 pr-6 text-right w-[25%]">
                        <div className="flex items-center justify-end gap-3">
                          <div className="relative group">
                            <button 
                              onClick={() => handleStartEdit(inclusion)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                              Edit
                            </div>
                          </div>
                          <div className="relative group">
                            <button 
                              onClick={() => handleInlineDelete(inclusion)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                              Delete
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                    )
                  })}
                    {/* Add empty row to ensure last row is visible */}
                    <tr>
                      <td colSpan={2} className="h-20 border-b border-gray-200"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-6"></div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowManageRoomModal(false)}
              className="h-9 px-4 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
            </div>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}












