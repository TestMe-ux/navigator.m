"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SettingsTab } from "@/components/settings-tab"
import * as Icons from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"

// Reusable component for room type dropdown cell
const RoomTypeCell = ({ 
  displayText, 
  fullDescription, 
  roomCategoryId, 
  hotelId, 
  cellKey,
  openHotelCellDropdown, 
  handleHotelCellDropdownToggle,
  handleHotelCellDropdownAction,
  getAllRoomCategories,
  isMapped = false,
  isRemoving = false,
  isNewlyMapped = false,
  removingRoomsSet,
  bulkMappingMode = false,
  selectedRoomsForBulk,
  onCheckboxChange,
  selectedKeywords
}: {
  displayText: string
  fullDescription: string
  roomCategoryId: string
  hotelId: string
  cellKey: string
  openHotelCellDropdown: string | null
  handleHotelCellDropdownToggle: (key: string) => void
  handleHotelCellDropdownAction: (action: string, roomCategoryId: string, hotelId: string, targetCategoryId?: string, displayText?: string, fullDescription?: string, cellKey?: string) => void
  getAllRoomCategories: () => Array<{id: string, name: string, code: string}>
  isMapped?: boolean
  isRemoving?: boolean
  isNewlyMapped?: boolean
  removingRoomsSet?: Set<string>
  bulkMappingMode?: boolean
  selectedRoomsForBulk?: Set<string>
  onCheckboxChange?: (key: string, checked: boolean) => void
  selectedKeywords?: string[]
}) => {
  const dropdownKey = `${roomCategoryId}-${hotelId}-${cellKey}`
  
  // Determine if this cell should show red background (isRemoving)
  const shouldShowRed = isRemoving || (removingRoomsSet && removingRoomsSet.has(`${roomCategoryId}-${hotelId}-${cellKey}`))
  
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
  
  // Render checkbox in bulk mapping mode for unmapped rooms
  if (bulkMappingMode && roomCategoryId === "unmapped") {
    const checkboxKey = `${roomCategoryId}-${hotelId}-${cellKey}`
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
          {selectedKeywords && selectedKeywords.length > 0 ? (
            <div>
              {(() => {
                const parts: Array<{text: string, isKeyword: boolean}> = []
                let remainingText = fullDescription
                const sortedKeywords = [...selectedKeywords].sort((a, b) => b.length - a.length)
                
                // Find all keyword positions
                const keywordPositions: Array<{start: number, end: number}> = []
                sortedKeywords.forEach(keyword => {
                  let searchIndex = 0
                  while (true) {
                    const index = remainingText.indexOf(keyword, searchIndex)
                    if (index === -1) break
                    keywordPositions.push({ start: index, end: index + keyword.length })
                    searchIndex = index + 1
                  }
                })
                
                // Sort positions
                keywordPositions.sort((a, b) => a.start - b.start)
                
                // Remove overlapping positions
                const nonOverlapping: Array<{start: number, end: number}> = []
                keywordPositions.forEach(pos => {
                  const overlaps = nonOverlapping.some(existing => 
                    (pos.start >= existing.start && pos.start < existing.end) ||
                    (pos.end > existing.start && pos.end <= existing.end) ||
                    (pos.start <= existing.start && pos.end >= existing.end)
                  )
                  if (!overlaps) {
                    nonOverlapping.push(pos)
                  }
                })
                
                // Build parts array
                let lastIndex = 0
                nonOverlapping.forEach(pos => {
                  if (pos.start > lastIndex) {
                    parts.push({text: fullDescription.substring(lastIndex, pos.start), isKeyword: false})
                  }
                  parts.push({text: fullDescription.substring(pos.start, pos.end), isKeyword: true})
                  lastIndex = pos.end
                })
                if (lastIndex < fullDescription.length) {
                  parts.push({text: fullDescription.substring(lastIndex), isKeyword: false})
                }
                
                return (
                  <div>
                    {parts.map((part, index) => 
                      part.isKeyword ? (
                        <span key={index} className="bg-teal-200 px-1 text-black">{part.text}</span>
                      ) : (
                        <span key={index}>{part.text}</span>
                      )
                    )}
                  </div>
                )
              })()}
            </div>
          ) : (
            <div className="line-clamp-5">{fullDescription}</div>
          )}
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
        <div className={`hotel-cell-dropdown-menu absolute right-0 ${roomCategoryId === "unmapped" ? 'bottom-full mb-0' : 'top-full mt-0'} bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[160px]`}>
          <div className="py-1 max-h-[228px] overflow-y-auto">
            {roomCategoryId !== "unmapped" && (
              <>
                <button
                  onClick={() => handleHotelCellDropdownAction('Unmap', roomCategoryId, hotelId, undefined, displayText, fullDescription, cellKey)}
                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 border-b border-dashed border-gray-300"
                >
                  Unmap
                </button>
                <div className="px-4 py-1 mt-1.5 text-xs text-gray-500 font-semibold cursor-default">Map to</div>
              </>
            )}
            {roomCategoryId === "unmapped" && (
              <div className="px-4 py-1 text-xs text-gray-500 font-semibold cursor-default">Map to</div>
            )}
            {getAllRoomCategories()
              .filter((cat) => cat.id !== roomCategoryId)
              .map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleHotelCellDropdownAction('Map to', roomCategoryId, hotelId, cat.id, displayText, fullDescription, cellKey)}
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
  const [activeSettingsTab, setActiveSettingsTab] = useState("mapping")
  const [mappingMode, setMappingMode] = useState("basic")
  
  // Determine active mapping tab based on pathname
  const getActiveMappingTab = () => {
    if (pathname?.includes("/rate")) return "rate"
    if (pathname?.includes("/inclusions")) return "inclusions"
    return "room"
  }
  
  const activeMappingTab = getActiveMappingTab()
  
  // Handle Settings tab navigation - navigate to /settings for other tabs
  const handleSettingsTabChange = (value: string) => {
    if (value === "mapping") {
      // Stay on mapping page
      setActiveSettingsTab(value)
    } else {
      // Navigate to /settings with tab parameter
      router.push(`/settings?tab=${value}`)
    }
  }
  const [selectedRoomCategory, setSelectedRoomCategory] = useState("")
  const [selectedHotel, setSelectedHotel] = useState("")
  const [roomMappings, setRoomMappings] = useState([])
  const [currentTablePage, setCurrentTablePage] = useState(1)
  const [totalTablePages, setTotalTablePages] = useState(4) // Will be calculated dynamically
  const [columnStartIndex, setColumnStartIndex] = useState(0)
  const [windowWidth, setWindowWidth] = useState(0)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null) // Track which 3-dots dropdown is open
  const [openHotelCellDropdown, setOpenHotelCellDropdown] = useState<string | null>(null) // Track which hotel cell dropdown is open
  const [roomMappingsMap, setRoomMappingsMap] = useState<Map<string, {displayText: string, fullDescription: string, sourceCategoryId: string, sourceHotelId: string, sourceCellKey: string, selectedKeywords?: string[]}>>(new Map())
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
  const [showKeywordModal, setShowKeywordModal] = useState(false) // Track keyword selection modal visibility
  const [keywordModalData, setKeywordModalData] = useState<{
    roomCategoryName: string
    roomCategoryCode: string
    roomCategoryId: string
    roomDescription: string
    displayText: string
    hotelId: string
    cellKey: string
  } | null>(null) // Track data for keyword modal
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]) // Track selected keywords
  const [isSelecting, setIsSelecting] = useState(false) // Track if user is currently selecting text
  const [roomCreationMode, setRoomCreationMode] = useState("new") // Track room creation mode: "new" or "recommended"
  const [showManageRoomModal, setShowManageRoomModal] = useState(false) // Track Manage Room modal visibility
  const [movedRoomId, setMovedRoomId] = useState<string | null>(null) // Track which room was moved
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null) // Track which room is being edited inline
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null) // Track which room is being deleted inline
  const [inlineRoomName, setInlineRoomName] = useState("") // Track inline room name
  const [inlineAbbreviation, setInlineAbbreviation] = useState("") // Track inline abbreviation
  const [originalRoomCategories, setOriginalRoomCategories] = useState<Array<{id: string, name: string, code: string}>>([]) // Track original room order
  const [hasPriorityChanged, setHasPriorityChanged] = useState(false) // Track if priority order has changed
  
  // Function to handle inline edit start
  const handleStartEdit = (room: {id: string, name: string, code: string}) => {
    setEditingRoomId(room.id)
    setInlineRoomName(room.name)
    setInlineAbbreviation(room.code)
  }
  
  // Function to handle inline edit save
  const handleSaveEdit = () => {
    if (editingRoomId && inlineRoomName && inlineAbbreviation) {
      setRoomCategories(prev => prev.map(room => 
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
    setInlineAbbreviation("")
  }
  
  // Function to handle inline delete
  const handleInlineDelete = (room: {id: string, name: string, code: string}) => {
    setDeletingRoomId(room.id)
    setRoomToDelete(room)
  }
  
  // Function to confirm inline delete
  const handleConfirmDelete = () => {
    if (roomToDelete) {
      setRoomCategories(prev => prev.filter(room => room.id !== roomToDelete.id))
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
  const [roomCategories, setRoomCategories] = useState([
    { id: "executive", name: "Executive Room", code: "Exe" },
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
      setOriginalRoomCategories([...roomCategories])
      setHasPriorityChanged(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showManageRoomModal])
  
  // Effect to detect priority changes
  useEffect(() => {
    if (showManageRoomModal && originalRoomCategories.length > 0) {
      const hasChanged = JSON.stringify(originalRoomCategories.map(r => r.id)) !== 
                        JSON.stringify(roomCategories.map(r => r.id))
      setHasPriorityChanged(hasChanged)
    }
  }, [roomCategories, originalRoomCategories, showManageRoomModal])
  
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
  const handleRoomCategorySelect = (categoryId) => {
    setSelectedRoomCategory(categoryId)
  }

  const handleHotelSelect = (hotelId) => {
    setSelectedHotel(hotelId)
  }

  const handleCreateMapping = () => {
    if (selectedRoomCategory && selectedHotel) {
      const roomCategory = roomCategories.find(cat => cat.id === selectedRoomCategory)
      const hotel = hotels.find(h => h.id === selectedHotel)
      
      const newMapping = {
        id: Date.now(),
        roomCategory: roomCategory.name,
        roomCode: roomCategory.code,
        hotel: hotel.name,
        status: "Active"
      }
      
      setRoomMappings(prev => [...prev, newMapping])
      setSelectedRoomCategory("")
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
  const handleDropdownToggle = (roomCategoryId) => {
    setOpenDropdown(openDropdown === roomCategoryId ? null : roomCategoryId)
  }

  const handleDropdownAction = (action, roomCategoryId) => {
    console.log(`${action} clicked for room category: ${roomCategoryId}`)
    setOpenDropdown(null) // Close dropdown after action
    
    if (action === 'Delete') {
      // Find the room to delete
      const roomToDelete = roomCategories.find(room => room.id === roomCategoryId)
      if (roomToDelete) {
        setRoomToDelete(roomToDelete)
        setShowDeleteRoomConfirm(true)
      }
    } else if (action === 'Rename') {
      // Find the room to rename
      const roomToRename = roomCategories.find(room => room.id === roomCategoryId)
      if (roomToRename) {
        setRoomToRename(roomToRename)
        setRenameRoomName(roomToRename.name)
        setRenameAbbreviation(roomToRename.code)
        setShowRenameRoomModal(true)
      }
    } else if (action === 'Map to Room type') {
      // Set target category and enable bulk mapping mode
      setBulkMappingTargetCategory(roomCategoryId)
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
        
        setRoomMappingsMap(prev => {
          const newMap = new Map(prev)
          newMap.set(targetKey, {
            displayText,
            fullDescription,
            sourceCategoryId: 'unmapped',
            sourceHotelId: hotelId,
            sourceCellKey: cellKey
          })
          console.log(`Bulk mapping: Adding room "${displayText}" to ${bulkMappingTargetCategory} with key: ${targetKey}`)
          console.log(`Current roomMappingsMap keys:`, Array.from(newMap.keys()))
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
      setRoomCategories(prev => prev.filter(room => room.id !== roomToDelete.id))
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
      setRoomCategories(prev => prev.map(room => 
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
    roomCategoryId: string, 
    hotelId: string, 
    targetCategoryId?: string, 
    displayText?: string, 
    fullDescription?: string, 
    cellKey?: string
  ) => {
    console.log(`${action} clicked for ${roomCategoryId} at ${hotelId}`, {targetCategoryId, displayText, fullDescription, cellKey})
    
    if (action === 'Map to' && targetCategoryId && displayText && fullDescription && cellKey) {
      // Check if we're in Basic mode with Brand channel and mapping from unmapped
      if (mappingMode === "basic" && basicChannel === "brand" && roomCategoryId === "unmapped") {
        // Find the target room category
        const targetCategory = getAllRoomCategories().find(cat => cat.id === targetCategoryId)
        if (targetCategory) {
          // Show keyword modal instead of directly mapping
          setKeywordModalData({
            roomCategoryName: targetCategory.name,
            roomCategoryCode: targetCategory.code,
            roomCategoryId: targetCategoryId,
            roomDescription: fullDescription,
            displayText: displayText,
            hotelId: hotelId,
            cellKey: cellKey
          })
          setShowKeywordModal(true)
          setOpenHotelCellDropdown(null)
          return
        }
      }
      
      // Map room to target category - generate unique key with timestamp
      const timestamp = Date.now()
      const roomKey = `${targetCategoryId}-${hotelId}-${timestamp}`
      
      setRoomMappingsMap(prev => {
        const newMap = new Map(prev)
        
        // Find and remove all existing instances of this room
        // The room might be in the map from a previous move operation
        // We need to find it by matching the current location (roomCategoryId-hotelId-cellKey)
        // OR by matching the source information stored in the room data
        const keysToRemove: string[] = []
        
        newMap.forEach((room, key) => {
          // Check if this is the room we're moving by:
          // 1. Checking if the key matches the current location pattern (for first move)
          // 2. Checking if the source info matches (for subsequent moves)
          const keyPrefix = `${roomCategoryId}-${hotelId}-`
          
          if (key.startsWith(keyPrefix)) {
            // This key is in the current location, check if it matches our room
            // For Central Hotel, we'll match by the source info since keys have timestamps
            if (room.displayText === displayText || 
                (room.sourceCategoryId === roomCategoryId && 
                 room.sourceHotelId === hotelId && 
                 room.sourceCellKey === cellKey)) {
              keysToRemove.push(key)
            }
          }
        })
        
        // Remove the room from all previous locations
        keysToRemove.forEach(key => newMap.delete(key))
        
        // Add to target location
        newMap.set(roomKey, {
          displayText,
          fullDescription,
          sourceCategoryId: roomCategoryId,
          sourceHotelId: hotelId,
          sourceCellKey: cellKey
        })
        return newMap
      })
      
      // Mark the source cell as mapped (so it hides)
      const sourceCellKey = `${roomCategoryId}-${hotelId}-${cellKey}`
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
      
      console.log(`Mapping room "${displayText}" from ${roomCategoryId} to ${targetCategoryId}`)
    } else if (action === 'Unmap' && displayText && fullDescription && cellKey) {
      // Unmap logic - move from current category to unmapped section
      const sourceCellKey = `${roomCategoryId}-${hotelId}-${cellKey}`
      
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
      
      setRoomMappingsMap(prev => {
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
      
      console.log(`Unmapping room "${displayText}" from ${roomCategoryId}`)
    }
    
    setOpenHotelCellDropdown(null)
  }

  // Helper to get mapped rooms for a specific category and hotel
  const getMappedRooms = (roomCategoryId: string, hotelId: string) => {
    const mappedRooms: Array<{displayText: string, fullDescription: string, cellKey: string, selectedKeywords?: string[]}> = []
    const searchKey = `${roomCategoryId}-${hotelId}-`
    roomMappingsMap.forEach((room, key) => {
      if (key.startsWith(searchKey)) {
        const keyParts = key.split('-')
        const uniqueId = keyParts.slice(2).join('-') // Get everything after first two parts
        mappedRooms.push({
          displayText: room.displayText,
          fullDescription: room.fullDescription,
          cellKey: uniqueId,
          selectedKeywords: room.selectedKeywords
        })
      }
    })
    console.log(`getMappedRooms for ${roomCategoryId}-${hotelId}: Found ${mappedRooms.length} rooms`, Array.from(roomMappingsMap.keys()).filter(k => k.startsWith(searchKey)))
    return mappedRooms
  }

  // Helper to check if a cell is mapped (should be hidden)
  const isCellMapped = (roomCategoryId: string, hotelId: string, cellKey: string) => {
    const cellKeyString = `${roomCategoryId}-${hotelId}-${cellKey}`
    const isMapped = mappedCellKeys.has(cellKeyString)
    console.log(`Checking if cell is mapped: ${cellKeyString} = ${isMapped}`, Array.from(mappedCellKeys))
    return isMapped
  }

  // Full room descriptions data
  const getFullRoomDescription = (roomCategoryId, hotelId, displayText) => {
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
    
    return descriptions[`${roomCategoryId}-${hotelId}`]?.[displayText] || displayText
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
  const getAllRoomCategories = () => {
    return roomCategories
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
                activeMappingTab === "room"
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground font-normal"
              }`}
              >
                Room
            </Link>
            <Link
              href="/settings/mapping/rate"
              className={`pb-1 border-b-2 text-sm ${
                activeMappingTab === "rate"
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground font-normal"
              }`}
              >
                Rate
            </Link>
            <Link
              href="/settings/mapping/inclusions"
              className={`pb-1 border-b-2 text-sm ${
                activeMappingTab === "inclusions"
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
            Add Room
          </button>
          {mappingMode === "advanced" && (
            <button 
              onClick={() => setShowManageRoomModal(true)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Manage Room
            </button>
          )}
        </div>
      </div>

      {/* Room Mapping Content */}
        <div className="bg-gradient-to-br from-card to-card/50 border-gray-200 dark:border-slate-700 rounded-lg border">
          <div>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <span className="text-base font-medium text-foreground">Map Rooms</span>
                <div className="flex items-center bg-muted rounded-lg p-1">
                  <button
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      mappingMode === "basic"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setMappingMode("basic")}
                  >
                    Basic
                  </button>
                  <button
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      mappingMode === "advanced"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setMappingMode("advanced")}
                  >
                    Advanced
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {mappingMode === "basic" && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-700">Channel:</span>
                    <Select value={basicChannel} onValueChange={setBasicChannel}>
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                      <SelectContent className="max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <SelectItem value="agoda" className="pl-3 [&>span:first-child]:hidden">Agoda</SelectItem>
                        <SelectItem value="brand" className="pl-3 [&>span:first-child]:hidden">Brand</SelectItem>
                        <SelectItem value="expedia" className="pl-3 [&>span:first-child]:hidden">Expedia</SelectItem>
                        <SelectItem value="makemytrip" className="pl-3 [&>span:first-child]:hidden">Makemytrip.com</SelectItem>
                        <SelectItem value="hotels" className="pl-3 [&>span:first-child]:hidden">Hotels.com</SelectItem>
                        <SelectItem value="trivago" className="pl-3 [&>span:first-child]:hidden">Trivago.com</SelectItem>
                        <SelectItem value="kayak" className="pl-3 [&>span:first-child]:hidden">Kayak.com</SelectItem>
                        <SelectItem value="priceline" className="pl-3 [&>span:first-child]:hidden">Priceline.com</SelectItem>
                        <SelectItem value="orbitz" className="pl-3 [&>span:first-child]:hidden">Orbitz.com</SelectItem>
                        <SelectItem value="hotwire" className="pl-3 [&>span:first-child]:hidden">Hotwire.com</SelectItem>
                        <SelectItem value="travelocity" className="pl-3 [&>span:first-child]:hidden">Travelocity.com</SelectItem>
                        <SelectItem value="goibibo" className="pl-3 [&>span:first-child]:hidden">Goibibo.com</SelectItem>
                        <SelectItem value="yatra" className="pl-3 [&>span:first-child]:hidden">Yatra.com</SelectItem>
                        <SelectItem value="cleartrip" className="pl-3 [&>span:first-child]:hidden">Cleartrip.com</SelectItem>
                  </SelectContent>
                </Select>
            </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700">Currently Active:</span>
                  <Select 
                    value={currentlyActive} 
                    onValueChange={(value) => {
                      if (value !== currentlyActive) {
                        setPendingActiveValue(value)
                        setShowActiveModal(true)
                      }
                    }}
                  >
                    <SelectTrigger className="w-[98px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                    <SelectContent className="w-[88px]">
                      <SelectItem value="basic" className="pl-3 [&>span:first-child]:hidden">Basic</SelectItem>
                      <SelectItem value="advanced" className="pl-3 [&>span:first-child]:hidden">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                      </div>
                  </div>
              </div>

            {/* Filter Section - Only for Advanced Mode */}
            {mappingMode === "advanced" && (
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
            )}

            {/* Two Section Layout - Only for Advanced Mode */}
            {mappingMode === "advanced" && (
            <div className="flex gap-6 mt-4 mx-6 mb-6">
              {/* Left Section - 30% */}
              <div className="w-[30%] space-y-4">
                {/* Room Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 mt-2">Room</label>
                  <Select defaultValue="c9">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[150px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                      <SelectItem value="c9" className="pl-3 [&>span:first-child]:hidden">C9</SelectItem>
                      <SelectItem value="suite" className="pl-3 [&>span:first-child]:hidden">Suite</SelectItem>
                      <SelectItem value="deluxe" className="pl-3 [&>span:first-child]:hidden">Deluxe</SelectItem>
                      <SelectItem value="executive" className="pl-3 [&>span:first-child]:hidden">Executive</SelectItem>
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
            )}

            {/* Bottom Action Buttons - Only for Advanced Mode */}
            {mappingMode === "advanced" && (
            <div className="flex justify-end gap-3 pt-4 mb-6 mr-6">
              <button className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                Save
              </button>
            </div>
            )}

              {/* Basic Mode Content */}
              {mappingMode === "basic" && (
            <div className="space-y-6">
                  {/* Room Mapping Table */}
                  <div className="w-full border-b border-gray-200 overflow-hidden">
                                {/* Pagination Controls */}
                                <div className="flex justify-end items-center p-2 border-b border-gray-200 gap-4">
                                  <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    Resolution: {windowWidth}px | Columns: {columnsPerPage}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600">Page {currentTablePage} of {totalTablePages}</span>
                                    <button
                                      onClick={prevTablePage}
                                      disabled={!canGoPrev()}
                                      className={`p-1 rounded-md border ${
                                        canGoPrev() 
                                          ? 'border-gray-300 hover:bg-gray-50 text-gray-700' 
                                          : 'border-gray-200 text-gray-400 cursor-not-allowed'
                                      }`}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={nextTablePage}
                                      disabled={!canGoNext()}
                                      className={`p-1 rounded-md border ${
                                        canGoNext() 
                                          ? 'border-gray-300 hover:bg-gray-50 text-gray-700' 
                                          : 'border-gray-200 text-gray-400 cursor-not-allowed'
                                      }`}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </button>
                                  </div>
              </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100 border-b border-gray-200">
                          <tr>
                            <th className="sticky left-0 bg-gray-100 z-10 px-4 py-3 border-r border-gray-200 text-left text-xs font-semibold text-gray-700">Room Categories</th>
                            {getPaginatedHotelColumns().map((hotel, index) => (
                              <th key={hotel.id} className={`px-4 py-3 border-r border-gray-200 text-left text-xs font-semibold text-gray-700 ${index === getPaginatedHotelColumns().length - 1 ? 'border-r-0' : ''}`}>
                                {hotel.shortName}
                              </th>
                            ))}
                          </tr>
                        </thead>
                      <tbody className="divide-y divide-gray-200">
                        {getAllRoomCategories().map((roomCategory, rowIndex) => (
                          bulkMappingMode ? null : (
                          <tr key={roomCategory.id} className="hover:bg-gray-50">
                            <td className="sticky left-0 bg-white z-10 px-4 py-3 border-r border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold">{roomCategory.name} ({roomCategory.code})</span>
                                <div className="relative dropdown-container">
                                  <button 
                                    onClick={() => handleDropdownToggle(roomCategory.id)}
                                    className="dropdown-toggle text-gray-600 hover:text-gray-800 font-bold"
                                  >
                                    ⋮
                                  </button>
                                  
                                  {/* Dropdown Menu */}
                                  {openDropdown === roomCategory.id && (
                                    <div className={`dropdown-menu absolute right-0 ${rowIndex === 0 ? '-top-[60px]' : 'bottom-6'} bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[164px]`}>
                                      <div className={rowIndex === 0 ? "py-0.5" : "py-1"}>
                                        <button
                                          onClick={() => handleDropdownAction('Map to Room type', roomCategory.id)}
                                          className={`w-full text-left ${rowIndex === 0 ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'} text-gray-700 hover:bg-gray-100`}
                                        >
                                          Map to Room type
                                        </button>
                                        <button
                                          onClick={() => handleDropdownAction('Rename', roomCategory.id)}
                                          className={`w-full text-left ${rowIndex === 0 ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'} text-gray-700 hover:bg-gray-100`}
                                        >
                                          Rename
                                        </button>
                                        <button
                                          onClick={() => handleDropdownAction('Delete', roomCategory.id)}
                                          className={`w-full text-left ${rowIndex === 0 ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'} text-gray-700 hover:bg-gray-100`}
                                        >
                                          Delete
                                        </button>
                    </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            {getPaginatedHotelColumns().map((hotel, colIndex) => (
                              <td key={`${roomCategory.id}-${hotel.id}`} className={`px-4 py-3 border-r border-gray-200 ${colIndex === getPaginatedHotelColumns().length - 1 ? 'border-r-0' : ''}`}>
                                <div className="text-xs text-gray-500 mb-1">Avg Rate £ 0</div>
                                {/* Different content based on room category and hotel combination */}
                                {roomCategory.id === "executive" && hotel.id === "central-hotel" && (
                                  <div className="hotel-cell-dropdown-container space-y-1">
                                    {/* Short description example */}
                                    {!isCellMapped(roomCategory.id, hotel.id, "0") && (
                                      <RoomTypeCell
                                        displayText="Double Room"
                                        fullDescription="Double Room with Premium View"
                                        roomCategoryId={roomCategory.id}
                                        hotelId={hotel.id}
                                        cellKey="0"
                                        openHotelCellDropdown={openHotelCellDropdown}
                                        handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                        handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                        getAllRoomCategories={getAllRoomCategories}
                                        removingRoomsSet={removingRooms}
                                      />
                                    )}
                                    {/* Medium description example */}
                                    {!isCellMapped(roomCategory.id, hotel.id, "1") && (
                                      <RoomTypeCell
                                        displayText="Premium Suite"
                                        fullDescription="Premium Suite with Ocean View Balcony and Private Jacuzzi overlooking the Mediterranean Sea and city skyline with modern amenities"
                                        roomCategoryId={roomCategory.id}
                                        hotelId={hotel.id}
                                        cellKey="1"
                                        openHotelCellDropdown={openHotelCellDropdown}
                                        handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                        handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                        getAllRoomCategories={getAllRoomCategories}
                                        removingRoomsSet={removingRooms}
                                      />
                                    )}
                                    {/* Long description example - will show 5 lines max */}
                                    {!isCellMapped(roomCategory.id, hotel.id, "2") && (
                                      <RoomTypeCell
                                        displayText="Ultra Deluxe Villa"
                                        fullDescription="Ultra Deluxe Villa with Private Infinity Pool Private Garden Oceanfront Terrace with Stunning Sunset Views Premium Kitchenette Living Area with Modern Furniture Smart TV Sound System Complimentary Minibar Nespresso Machine Luxurious Bathroom with Rain Shower Separate Bathtub Premium Toiletries Free WiFi High Speed Internet Access Premium Bedding Egyptian Cotton Sheets Air Conditioning Climate Control Room Service Available 24 Hours Daily Housekeeping Turndown Service Concierge Service Available"
                                        roomCategoryId={roomCategory.id}
                                        hotelId={hotel.id}
                                        cellKey="2"
                                        openHotelCellDropdown={openHotelCellDropdown}
                                        handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                        handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                        getAllRoomCategories={getAllRoomCategories}
                                        removingRoomsSet={removingRooms}
                                      />
                                    )}
            </div>
                                )}
                                {roomCategory.id === "suite" && hotel.id === "central-hotel" && !isCellMapped(roomCategory.id, hotel.id, "0") && (
                                  <RoomTypeCell
                                    displayText="Standard Suite With..."
                                    fullDescription="Standard Suite With King Bed and Jacuzzi Bathroom overlooking the garden"
                                    roomCategoryId={roomCategory.id}
                                    hotelId={hotel.id}
                                    cellKey="0"
                                    openHotelCellDropdown={openHotelCellDropdown}
                                    handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                    handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                    getAllRoomCategories={getAllRoomCategories}
                                    isRemoving={removingRooms.has(`${roomCategory.id}-${hotel.id}-0`)}
                                  />
                                )}
                                {roomCategory.id === "superior" && hotel.id === "central-hotel" && !isCellMapped(roomCategory.id, hotel.id, "0") && (
                                  <RoomTypeCell
                                    displayText="Standard Double Ro..."
                                    fullDescription="Standard Double Room with City View and Modern Amenities"
                                    roomCategoryId={roomCategory.id}
                                    hotelId={hotel.id}
                                    cellKey="0"
                                    openHotelCellDropdown={openHotelCellDropdown}
                                    handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                    handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                    getAllRoomCategories={getAllRoomCategories}
                                    isRemoving={removingRooms.has(`${roomCategory.id}-${hotel.id}-0`)}
                                  />
                                )}
                                {roomCategory.id === "executive" && hotel.id === "alhambra-hotel" && !isCellMapped(roomCategory.id, hotel.id, "0") && (
                                  <RoomTypeCell
                                    displayText="Double Room with E..."
                                    fullDescription="Double Room with Executive Lounge Access and Premium View"
                                    roomCategoryId={roomCategory.id}
                                    hotelId={hotel.id}
                                    cellKey="0"
                                    openHotelCellDropdown={openHotelCellDropdown}
                                    handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                    handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                    getAllRoomCategories={getAllRoomCategories}
                                    isRemoving={removingRooms.has(`${roomCategory.id}-${hotel.id}-0`)}
                                  />
                                )}
                                {roomCategory.id === "suite" && hotel.id === "hotel-palermitano" && !isCellMapped(roomCategory.id, hotel.id, "0") && (
                                  <RoomTypeCell
                                    displayText="Suite"
                                    fullDescription="Luxury Suite with Private Balcony and Premium Amenities"
                                    roomCategoryId={roomCategory.id}
                                    hotelId={hotel.id}
                                    cellKey="0"
                                    openHotelCellDropdown={openHotelCellDropdown}
                                    handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                    handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                    getAllRoomCategories={getAllRoomCategories}
                                    isRemoving={removingRooms.has(`${roomCategory.id}-${hotel.id}-0`)}
                                  />
                                )}
                                {roomCategory.id === "superior" && hotel.id === "hotel-palermitano" && (
                                  <div className="space-y-1">
                                    <RoomTypeCell
                                      displayText="Superior Double Roo..."
                                      fullDescription="Superior Double Room with Modern Amenities and City Views"
                                      roomCategoryId={roomCategory.id}
                                      hotelId={hotel.id}
                                      cellKey="0"
                                      openHotelCellDropdown={openHotelCellDropdown}
                                      handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                      handleHotelCellDropdownAction={handleHotelCellDropdownAction}
getAllRoomCategories={getAllRoomCategories}
                                  removingRoomsSet={removingRooms}
                                  />
                                    <RoomTypeCell
                                      displayText="DOUBLE DOUBLE SU..."
                                      fullDescription="Double Double Superior Room with Twin Beds and Extra Space"
                                      roomCategoryId={roomCategory.id}
                                      hotelId={hotel.id}
                                      cellKey="1"
                                      openHotelCellDropdown={openHotelCellDropdown}
                                      handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                      handleHotelCellDropdownAction={handleHotelCellDropdownAction}
getAllRoomCategories={getAllRoomCategories}
                                  removingRoomsSet={removingRooms}
                                  />
                                    <RoomTypeCell
                                      displayText="Superior Room"
                                      fullDescription="Superior Room with Premium Amenities and Comfortable Space"
                                      roomCategoryId={roomCategory.id}
                                      hotelId={hotel.id}
                                      cellKey="2"
                                      openHotelCellDropdown={openHotelCellDropdown}
                                      handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                      handleHotelCellDropdownAction={handleHotelCellDropdownAction}
getAllRoomCategories={getAllRoomCategories}
                                  removingRoomsSet={removingRooms}
                                  />
                                  </div>
                                )}
                                {/* Additional hotel content */}
                                {roomCategory.id === "executive" && hotel.id === "grand-palace" && (
                                  <RoomTypeCell
                                    displayText="Executive Suite"
                                    fullDescription="Executive Suite with Grand View and Premium Executive Amenities"
                                    roomCategoryId={roomCategory.id}
                                    hotelId={hotel.id}
                                    cellKey="0"
                                    openHotelCellDropdown={openHotelCellDropdown}
                                    handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                    handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                    getAllRoomCategories={getAllRoomCategories}
                                    removingRoomsSet={removingRooms}
                                  />
                                )}
                                {roomCategory.id === "villa" && hotel.id === "luxury-beachfront" && (
                                  <div className="space-y-1">
                                    <RoomTypeCell
                                      displayText="Beachfront Villa"
                                      fullDescription="Beachfront Villa with Direct Ocean Access and Private Pool"
                                      roomCategoryId={roomCategory.id}
                                      hotelId={hotel.id}
                                      cellKey="0"
                                      openHotelCellDropdown={openHotelCellDropdown}
                                      handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                      handleHotelCellDropdownAction={handleHotelCellDropdownAction}
getAllRoomCategories={getAllRoomCategories}
                                  removingRoomsSet={removingRooms}
                                  />
                                    <RoomTypeCell
                                      displayText="Ocean View Villa"
                                      fullDescription="Ocean View Villa with Panoramic Sea Views and Luxury Amenities"
                                      roomCategoryId={roomCategory.id}
                                      hotelId={hotel.id}
                                      cellKey="1"
                                      openHotelCellDropdown={openHotelCellDropdown}
                                      handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                      handleHotelCellDropdownAction={handleHotelCellDropdownAction}
getAllRoomCategories={getAllRoomCategories}
                                  removingRoomsSet={removingRooms}
                                  />
                                  </div>
                                )}
                                {roomCategory.id === "bungalow" && hotel.id === "mountain-lodge" && (
                                  <RoomTypeCell
                                    displayText="Mountain Bungalow"
                                    fullDescription="Mountain Bungalow with Natural Surroundings and Rustic Charm"
                                    roomCategoryId={roomCategory.id}
                                    hotelId={hotel.id}
                                    cellKey="0"
                                    openHotelCellDropdown={openHotelCellDropdown}
                                    handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                    handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                    getAllRoomCategories={getAllRoomCategories}
                                    removingRoomsSet={removingRooms}
                                  />
                                )}
                                {roomCategory.id === "apartment" && hotel.id === "downtown-business" && (
                                  <RoomTypeCell
                                    displayText="Business Apartment"
                                    fullDescription="Business Apartment with Modern Workspace and City Views"
                                    roomCategoryId={roomCategory.id}
                                    hotelId={hotel.id}
                                    cellKey="0"
                                    openHotelCellDropdown={openHotelCellDropdown}
                                    handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                    handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                    getAllRoomCategories={getAllRoomCategories}
                                    removingRoomsSet={removingRooms}
                                  />
                                )}
                                {roomCategory.id === "studio" && hotel.id === "historic-boutique" && (
                                  <RoomTypeCell
                                    displayText="Historic Studio"
                                    fullDescription="Historic Studio with Period Architecture and Modern Comforts"
                                    roomCategoryId={roomCategory.id}
                                    hotelId={hotel.id}
                                    cellKey="0"
                                    openHotelCellDropdown={openHotelCellDropdown}
                                    handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                    handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                    getAllRoomCategories={getAllRoomCategories}
                                    removingRoomsSet={removingRooms}
                                  />
                                )}
                                {roomCategory.id === "suite" && hotel.id === "oceanfront-resort" && (
                                  <div className="space-y-1">
                                    <RoomTypeCell
                                      displayText="Oceanfront Suite"
                                      fullDescription="Oceanfront Suite with Direct Beach Access and Panoramic Ocean Views"
                                      roomCategoryId={roomCategory.id}
                                      hotelId={hotel.id}
                                      cellKey="0"
                                      openHotelCellDropdown={openHotelCellDropdown}
                                      handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                      handleHotelCellDropdownAction={handleHotelCellDropdownAction}
getAllRoomCategories={getAllRoomCategories}
                                  removingRoomsSet={removingRooms}
                                  />
                                    <RoomTypeCell
                                      displayText="Penthouse Suite"
                                      fullDescription="Penthouse Suite with Exclusive Access and Top Floor Panoramic Views"
                                      roomCategoryId={roomCategory.id}
                                      hotelId={hotel.id}
                                      cellKey="1"
                                      openHotelCellDropdown={openHotelCellDropdown}
                                      handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                      handleHotelCellDropdownAction={handleHotelCellDropdownAction}
getAllRoomCategories={getAllRoomCategories}
                                  removingRoomsSet={removingRooms}
                                  />
                                  </div>
                                )}
                                {roomCategory.id === "superior" && hotel.id === "family-friendly" && (
                                  <RoomTypeCell
                                    displayText="Family Superior Room"
                                    fullDescription="Family Superior Room with Extra Beds and Family-Friendly Amenities"
                                    roomCategoryId={roomCategory.id}
                                    hotelId={hotel.id}
                                    cellKey="0"
                                    openHotelCellDropdown={openHotelCellDropdown}
                                    handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                    handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                    getAllRoomCategories={getAllRoomCategories}
                                    removingRoomsSet={removingRooms}
                                  />
                                )}
                                {roomCategory.id === "executive" && hotel.id === "executive-corporate" && (
                                  <div className="space-y-1">
                                    <RoomTypeCell
                                      displayText="Corporate Executive"
                                      fullDescription="Corporate Executive Room with Executive Lounge Access and Premium Business Amenities"
                                      roomCategoryId={roomCategory.id}
                                      hotelId={hotel.id}
                                      cellKey="0"
                                      openHotelCellDropdown={openHotelCellDropdown}
                                      handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                      handleHotelCellDropdownAction={handleHotelCellDropdownAction}
getAllRoomCategories={getAllRoomCategories}
                                  removingRoomsSet={removingRooms}
                                  />
                                    <RoomTypeCell
                                      displayText="Boardroom Suite"
                                      fullDescription="Boardroom Suite with Conference Facilities and Premium Business Services"
                                      roomCategoryId={roomCategory.id}
                                      hotelId={hotel.id}
                                      cellKey="1"
                                      openHotelCellDropdown={openHotelCellDropdown}
                                      handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                      handleHotelCellDropdownAction={handleHotelCellDropdownAction}
getAllRoomCategories={getAllRoomCategories}
                                  removingRoomsSet={removingRooms}
                                  />
                                  </div>
                                )}
                                {roomCategory.id === "suite" && hotel.id === "ultra-luxury" && (
                                  <RoomTypeCell
                                    displayText="Ultra Luxury Suite"
                                    fullDescription="Ultra Luxury Suite with Panoramic Views and Exquisite Designer Interiors"
                                    roomCategoryId={roomCategory.id}
                                    hotelId={hotel.id}
                                    cellKey="0"
                                    openHotelCellDropdown={openHotelCellDropdown}
                                    handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                    handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                    getAllRoomCategories={getAllRoomCategories}
                                    removingRoomsSet={removingRooms}
                                  />
                                )}
                                {roomCategory.id === "superior" && hotel.id === "international-business" && (
                                  <RoomTypeCell
                                    displayText="International Superior"
                                    fullDescription="International Superior Room with Global Business Standards and Modern Amenities"
                                    roomCategoryId={roomCategory.id}
                                    hotelId={hotel.id}
                                    cellKey="0"
                                    openHotelCellDropdown={openHotelCellDropdown}
                                    handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                    handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                    getAllRoomCategories={getAllRoomCategories}
                                    removingRoomsSet={removingRooms}
                                  />
                                )}
                                {/* Dynamically render mapped rooms */}
                                {getMappedRooms(roomCategory.id, hotel.id).length > 0 && (
                                  <div className="space-y-1">
                                    {getMappedRooms(roomCategory.id, hotel.id).map((mappedRoom, index) => {
                                      const roomKey = `${roomCategory.id}-${hotel.id}-mapped-${mappedRoom.cellKey}`
                                      const mappedRoomFullKey = `${roomCategory.id}-${hotel.id}-${mappedRoom.cellKey}`
                                      const isRemovingRoom = removingRooms.has(mappedRoomFullKey)
                                      // Check for newly mapped using the correct key format (with timestamp)
                                      const isNewlyMappedRoom = Array.from(newlyMappedRooms).some(key => 
                                        key.startsWith(`${roomCategory.id}-${hotel.id}-`) && key.includes(mappedRoom.cellKey)
                                      )
                                      
                                      return (
                                        <RoomTypeCell
                                          key={roomKey}
                                          displayText={mappedRoom.displayText}
                                          fullDescription={mappedRoom.fullDescription}
                                          roomCategoryId={roomCategory.id}
                                          hotelId={hotel.id}
                                          cellKey={`mapped-${mappedRoom.cellKey}`}
                                          openHotelCellDropdown={openHotelCellDropdown}
                                          handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                          handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                        getAllRoomCategories={getAllRoomCategories}
                                        isRemoving={isRemovingRoom}
                                        isNewlyMapped={isNewlyMappedRoom}
                                        removingRoomsSet={removingRooms}
                                        selectedKeywords={mappedRoom.selectedKeywords}
                                      />
                                      )
                                    })}
            </div>
                                )}
                              </td>
                            ))}
                          </tr>
                        )
                        ))}
                        
                        {/* Unmapped Room Section - Merged Row */}
                        <tr className={`${bulkMappingMode ? 'bg-blue-600' : 'bg-gray-400'}`}>
                          <td colSpan={getPaginatedHotelColumns().length + 1} className="px-4 py-3 text-center">
                              <h3 className="text-base font-semibold text-white">
                                Unmapped Room
                                {bulkMappingMode && bulkMappingTargetCategory && (
                                  <span className="ml-2 text-sm">- Select rooms to map to: {roomCategories.find(c => c.id === bulkMappingTargetCategory)?.name || bulkMappingTargetCategory} ({roomCategories.find(c => c.id === bulkMappingTargetCategory)?.code || ''})</span>
                                )}
                              </h3>
                          </td>
                        </tr>
                        
                        {/* Unmapped Room Data Row */}
                        <tr className="hover:bg-gray-50">
                          <td className="sticky left-0 bg-white z-10 px-4 py-3 border-r border-gray-200">
                            {/* Empty first column for Unmapped Room section */}
                          </td>
                          {getPaginatedHotelColumns().map((hotel, colIndex) => (
                            <td key={`unmapped-${hotel.id}`} className={`px-4 py-3 border-r border-gray-200 ${colIndex === getPaginatedHotelColumns().length - 1 ? 'border-r-0' : ''}`}>
                              {hotel.id === "central-hotel" && (
                                <div className="space-y-1">
                                  {!isCellMapped("unmapped", hotel.id, "0") && (
                                    <RoomTypeCell
                                      displayText="2 Beds"
                                      fullDescription="Room with 2 Beds and Modern Amenities"
                                      roomCategoryId="unmapped"
                                      hotelId={hotel.id}
                                      cellKey="0"
                                      openHotelCellDropdown={openHotelCellDropdown}
                                      handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                      handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                      getAllRoomCategories={getAllRoomCategories}
                                      removingRoomsSet={removingRooms}
                                      bulkMappingMode={bulkMappingMode}
                                      selectedRoomsForBulk={selectedRoomsForBulk}
                                      onCheckboxChange={handleCheckboxChange}
                                    />
                                  )}
                                  {!isCellMapped("unmapped", hotel.id, "1") && (
                                    <RoomTypeCell
                                      displayText="Deluxe Double Room..."
                                      fullDescription="Deluxe Double Room with Premium Amenities and City Views"
                                      roomCategoryId="unmapped"
                                      hotelId={hotel.id}
                                      cellKey="1"
                                      openHotelCellDropdown={openHotelCellDropdown}
                                      handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                      handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                      getAllRoomCategories={getAllRoomCategories}
                                      removingRoomsSet={removingRooms}
                                      bulkMappingMode={bulkMappingMode}
                                      selectedRoomsForBulk={selectedRoomsForBulk}
                                      onCheckboxChange={handleCheckboxChange}
                                    />
                                  )}
                                  {!isCellMapped("unmapped", hotel.id, "2") && (
                                    <RoomTypeCell
                                      displayText="Economy Single Roo..."
                                      fullDescription="Economy Single Room with Essential Amenities"
                                      roomCategoryId="unmapped"
                                      hotelId={hotel.id}
                                      cellKey="2"
                                    openHotelCellDropdown={openHotelCellDropdown}
                                    handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                    handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                    getAllRoomCategories={getAllRoomCategories}
                                    removingRoomsSet={removingRooms}
                                    bulkMappingMode={bulkMappingMode}
                                    selectedRoomsForBulk={selectedRoomsForBulk}
                                    onCheckboxChange={handleCheckboxChange}
                                  />
                                )}
                                  {!isCellMapped("unmapped", hotel.id, "3") && (
                                    <RoomTypeCell
                                      displayText="Room Assigned on A..."
                                      fullDescription="Room Assigned on Arrival with Flexible Check-in"
                                      roomCategoryId="unmapped"
                                      hotelId={hotel.id}
                                      cellKey="3"
                                    openHotelCellDropdown={openHotelCellDropdown}
                                    handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                    handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                    getAllRoomCategories={getAllRoomCategories}
                                    removingRoomsSet={removingRooms}
                                    bulkMappingMode={bulkMappingMode}
                                    selectedRoomsForBulk={selectedRoomsForBulk}
                                    onCheckboxChange={handleCheckboxChange}
                                  />
                                )}
                                  {!isCellMapped("unmapped", hotel.id, "4") && (
                                    <RoomTypeCell
                                      displayText="Single Room shared..."
                                      fullDescription="Single Room with Shared Facilities and Budget-Friendly Option"
                                      roomCategoryId="unmapped"
                                      hotelId={hotel.id}
                                      cellKey="4"
                                    openHotelCellDropdown={openHotelCellDropdown}
                                    handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                    handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                    getAllRoomCategories={getAllRoomCategories}
                                    removingRoomsSet={removingRooms}
                                    bulkMappingMode={bulkMappingMode}
                                    selectedRoomsForBulk={selectedRoomsForBulk}
                                    onCheckboxChange={handleCheckboxChange}
                                  />
                                )}
                                  {!isCellMapped("unmapped", hotel.id, "5") && (
                                    <RoomTypeCell
                                      displayText="Single Room with Sh..."
                                      fullDescription="Single Room with Shared Bathroom and Essential Amenities"
                                      roomCategoryId="unmapped"
                                      hotelId={hotel.id}
                                      cellKey="5"
                                    openHotelCellDropdown={openHotelCellDropdown}
                                    handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                    handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                    getAllRoomCategories={getAllRoomCategories}
                                    removingRoomsSet={removingRooms}
                                    bulkMappingMode={bulkMappingMode}
                                    selectedRoomsForBulk={selectedRoomsForBulk}
                                    onCheckboxChange={handleCheckboxChange}
                                  />
                                )}
                                  {!isCellMapped("unmapped", hotel.id, "6") && (
                                    <RoomTypeCell
                                      displayText="Standard Double Ro..."
                                    fullDescription="Standard Double Room with Basic Amenities and Comfortable Space"
                                    roomCategoryId="unmapped"
                                    hotelId={hotel.id}
                                    cellKey="6"
                                    openHotelCellDropdown={openHotelCellDropdown}
                                    handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                    handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                    getAllRoomCategories={getAllRoomCategories}
                                    removingRoomsSet={removingRooms}
                                    bulkMappingMode={bulkMappingMode}
                                    selectedRoomsForBulk={selectedRoomsForBulk}
                                    onCheckboxChange={handleCheckboxChange}
                                    />
                                  )}
                                  {!isCellMapped("unmapped", hotel.id, "7") && (
                                    <RoomTypeCell
                                      displayText="Standard Single Roo..."
                                      fullDescription="Standard Single Room with Essential Amenities"
                                      roomCategoryId="unmapped"
                                      hotelId={hotel.id}
                                      cellKey="7"
                                    openHotelCellDropdown={openHotelCellDropdown}
                                    handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                    handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                    getAllRoomCategories={getAllRoomCategories}
                                    removingRoomsSet={removingRooms}
                                    bulkMappingMode={bulkMappingMode}
                                    selectedRoomsForBulk={selectedRoomsForBulk}
                                    onCheckboxChange={handleCheckboxChange}
                                    />
                                  )}
                                  {!isCellMapped("unmapped", hotel.id, "8") && (
                                    <RoomTypeCell
                                      displayText="Standard Suite, Ensu..."
                                      fullDescription="Standard Suite with Ensuite Bathroom and Spacious Accommodation"
                                      roomCategoryId="unmapped"
                                      hotelId={hotel.id}
                                      cellKey="8"
                                    openHotelCellDropdown={openHotelCellDropdown}
                                    handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                    handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                    getAllRoomCategories={getAllRoomCategories}
                                    removingRoomsSet={removingRooms}
                                    bulkMappingMode={bulkMappingMode}
                                    selectedRoomsForBulk={selectedRoomsForBulk}
                                    onCheckboxChange={handleCheckboxChange}
                                    />
                                  )}
                                  {!isCellMapped("unmapped", hotel.id, "9") && (
                                    <RoomTypeCell
                                      displayText="Standard Triple Roo..."
                                      fullDescription="Standard Triple Room with Three Beds and Extra Space"
                                      roomCategoryId="unmapped"
                                      hotelId={hotel.id}
                                      cellKey="9"
                                    openHotelCellDropdown={openHotelCellDropdown}
                                    handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                    handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                    getAllRoomCategories={getAllRoomCategories}
                                    removingRoomsSet={removingRooms}
                                    bulkMappingMode={bulkMappingMode}
                                    selectedRoomsForBulk={selectedRoomsForBulk}
                                    onCheckboxChange={handleCheckboxChange}
                                    />
                                  )}
                                  {!isCellMapped("unmapped", hotel.id, "10") && (
                                    <RoomTypeCell
                                      displayText="Standard Twin Room..."
                                      fullDescription="Standard Twin Room with Two Beds and Comfortable Accommodation"
                                      roomCategoryId="unmapped"
                                      hotelId={hotel.id}
                                      cellKey="10"
                                    openHotelCellDropdown={openHotelCellDropdown}
                                    handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                    handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                    getAllRoomCategories={getAllRoomCategories}
                                    removingRoomsSet={removingRooms}
                                    bulkMappingMode={bulkMappingMode}
                                    selectedRoomsForBulk={selectedRoomsForBulk}
                                    onCheckboxChange={handleCheckboxChange}
                                    />
                                  )}
                                  {!isCellMapped("unmapped", hotel.id, "11") && (
                                    <RoomTypeCell
                                      displayText="Triple Ensuite"
                                      fullDescription="Triple Room with Ensuite Bathroom and Three Beds"
                                      roomCategoryId="unmapped"
                                      hotelId={hotel.id}
                                      cellKey="11"
                                      openHotelCellDropdown={openHotelCellDropdown}
                                      handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                      handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                      getAllRoomCategories={getAllRoomCategories}
                                      removingRoomsSet={removingRooms}
                                      bulkMappingMode={bulkMappingMode}
                                      selectedRoomsForBulk={selectedRoomsForBulk}
                                      onCheckboxChange={handleCheckboxChange}
                                    />
                                  )}
                </div>
                              )}
                              {hotel.id === "hotel-palermitano" && (
                                <div className="space-y-1">
                                  {!isCellMapped("unmapped", hotel.id, "0") && (
                                    <RoomTypeCell
                                      displayText="Basic Double Room..."
                                      fullDescription="Basic Double Room with Essential Amenities and Simple Accommodation"
                                      roomCategoryId="unmapped"
                                      hotelId={hotel.id}
                                      cellKey="0"
                                      openHotelCellDropdown={openHotelCellDropdown}
                                      handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                      handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                      getAllRoomCategories={getAllRoomCategories}
                                      removingRoomsSet={removingRooms}
                                      bulkMappingMode={bulkMappingMode}
                                      selectedRoomsForBulk={selectedRoomsForBulk}
                                      onCheckboxChange={handleCheckboxChange}
                                    />
                                  )}
                                  {!isCellMapped("unmapped", hotel.id, "1") && (
                                    <RoomTypeCell
                                      displayText="Room Assigned on A..."
                                      fullDescription="Room Assigned on Arrival with Flexible Check-in Options"
                                      roomCategoryId="unmapped"
                                      hotelId={hotel.id}
                                      cellKey="1"
                                      openHotelCellDropdown={openHotelCellDropdown}
                                      handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                      handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                      getAllRoomCategories={getAllRoomCategories}
                                      removingRoomsSet={removingRooms}
                                      bulkMappingMode={bulkMappingMode}
                                      selectedRoomsForBulk={selectedRoomsForBulk}
                                      onCheckboxChange={handleCheckboxChange}
                                    />
                                  )}
              </div>
                              )}
                              {/* Additional hotel unmapped content */}
                              {hotel.id === "grand-palace" && (
                                <div className="space-y-1">
                                  {!isCellMapped("unmapped", hotel.id, "0") && (
                                    <RoomTypeCell
                                      displayText="Palace Suite"
                                      fullDescription="Palace Suite with Grand Views and Luxury Amenities"
                                      roomCategoryId="unmapped"
                                      hotelId={hotel.id}
                                      cellKey="0"
                                      openHotelCellDropdown={openHotelCellDropdown}
                                      handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                      handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                      getAllRoomCategories={getAllRoomCategories}
                                      removingRoomsSet={removingRooms}
                                      bulkMappingMode={bulkMappingMode}
                                      selectedRoomsForBulk={selectedRoomsForBulk}
                                      onCheckboxChange={handleCheckboxChange}
                                    />
                                  )}
                                  {!isCellMapped("unmapped", hotel.id, "1") && (
                                    <RoomTypeCell
                                      displayText="Royal Villa"
                                      fullDescription="Royal Villa with Exclusive Access and Premium Features"
                                      roomCategoryId="unmapped"
                                      hotelId={hotel.id}
                                      cellKey="1"
                                      openHotelCellDropdown={openHotelCellDropdown}
                                      handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                      handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                      getAllRoomCategories={getAllRoomCategories}
                                      removingRoomsSet={removingRooms}
                                      bulkMappingMode={bulkMappingMode}
                                      selectedRoomsForBulk={selectedRoomsForBulk}
                                      onCheckboxChange={handleCheckboxChange}
                                    />
                                  )}
            </div>
                              )}
                              {hotel.id === "luxury-beachfront" && (
                                <div className="space-y-1">
                                  {!isCellMapped("unmapped", hotel.id, "0") && (
                                    <RoomTypeCell
                                      displayText="Beachfront Penthouse"
                                      fullDescription="Beachfront Penthouse with Panoramic Ocean Views"
                                      roomCategoryId="unmapped"
                                      hotelId={hotel.id}
                                      cellKey="0"
                                      openHotelCellDropdown={openHotelCellDropdown}
                                      handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                      handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                      getAllRoomCategories={getAllRoomCategories}
                                      removingRoomsSet={removingRooms}
                                      bulkMappingMode={bulkMappingMode}
                                      selectedRoomsForBulk={selectedRoomsForBulk}
                                      onCheckboxChange={handleCheckboxChange}
                                    />
                                  )}
                                  {!isCellMapped("unmapped", hotel.id, "1") && (
                                    <RoomTypeCell
                                      displayText="Ocean Villa"
                                      fullDescription="Ocean Villa with Direct Beach Access"
                                      roomCategoryId="unmapped"
                                      hotelId={hotel.id}
                                      cellKey="1"
                                      openHotelCellDropdown={openHotelCellDropdown}
                                      handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                      handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                      getAllRoomCategories={getAllRoomCategories}
                                      removingRoomsSet={removingRooms}
                                      bulkMappingMode={bulkMappingMode}
                                      selectedRoomsForBulk={selectedRoomsForBulk}
                                      onCheckboxChange={handleCheckboxChange}
                                    />
                                  )}
                                </div>
                              )}
                              {hotel.id === "mountain-lodge" && !isCellMapped("unmapped", hotel.id, "0") && (
                                <RoomTypeCell
                                  displayText="Mountain Cabin"
                                  fullDescription="Mountain Cabin with Natural Surroundings"
                                  roomCategoryId="unmapped"
                                  hotelId={hotel.id}
                                  cellKey="0"
                                  openHotelCellDropdown={openHotelCellDropdown}
                                  handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                  handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                  getAllRoomCategories={getAllRoomCategories}
                                  removingRoomsSet={removingRooms}
                                  bulkMappingMode={bulkMappingMode}
                                  selectedRoomsForBulk={selectedRoomsForBulk}
                                  onCheckboxChange={handleCheckboxChange}
                                />
                              )}
                              {hotel.id === "downtown-business" && !isCellMapped("unmapped", hotel.id, "0") && (
                                <RoomTypeCell
                                  displayText="Corporate Suite"
                                  fullDescription="Corporate Suite with Business Amenities"
                                  roomCategoryId="unmapped"
                                  hotelId={hotel.id}
                                  cellKey="0"
                                  openHotelCellDropdown={openHotelCellDropdown}
                                  handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                  handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                  getAllRoomCategories={getAllRoomCategories}
                                  removingRoomsSet={removingRooms}
                                  bulkMappingMode={bulkMappingMode}
                                  selectedRoomsForBulk={selectedRoomsForBulk}
                                  onCheckboxChange={handleCheckboxChange}
                                />
                              )}
                              {hotel.id === "historic-boutique" && !isCellMapped("unmapped", hotel.id, "0") && (
                                <RoomTypeCell
                                  displayText="Heritage Room"
                                  fullDescription="Heritage Room with Historic Charm"
                                  roomCategoryId="unmapped"
                                  hotelId={hotel.id}
                                  cellKey="0"
                                  openHotelCellDropdown={openHotelCellDropdown}
                                  handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                  handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                  getAllRoomCategories={getAllRoomCategories}
                                  removingRoomsSet={removingRooms}
                                  bulkMappingMode={bulkMappingMode}
                                  selectedRoomsForBulk={selectedRoomsForBulk}
                                  onCheckboxChange={handleCheckboxChange}
                                />
                              )}
                              {hotel.id === "oceanfront-resort" && (
                                <div className="space-y-1">
                                  {!isCellMapped("unmapped", hotel.id, "0") && (
                                    <RoomTypeCell
                                      displayText="Resort Villa"
                                      fullDescription="Resort Villa with Premium Amenities"
                                      roomCategoryId="unmapped"
                                      hotelId={hotel.id}
                                      cellKey="0"
                                      openHotelCellDropdown={openHotelCellDropdown}
                                      handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                      handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                      getAllRoomCategories={getAllRoomCategories}
                                      removingRoomsSet={removingRooms}
                                      bulkMappingMode={bulkMappingMode}
                                      selectedRoomsForBulk={selectedRoomsForBulk}
                                      onCheckboxChange={handleCheckboxChange}
                                    />
                                  )}
                                  {!isCellMapped("unmapped", hotel.id, "1") && (
                                    <RoomTypeCell
                                      displayText="Beach House"
                                      fullDescription="Beach House with Ocean Views"
                                      roomCategoryId="unmapped"
                                      hotelId={hotel.id}
                                      cellKey="1"
                                      openHotelCellDropdown={openHotelCellDropdown}
                                      handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                      handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                      getAllRoomCategories={getAllRoomCategories}
                                      removingRoomsSet={removingRooms}
                                      bulkMappingMode={bulkMappingMode}
                                      selectedRoomsForBulk={selectedRoomsForBulk}
                                      onCheckboxChange={handleCheckboxChange}
                                    />
                                  )}
                                </div>
                              )}
                              {hotel.id === "family-friendly" && !isCellMapped("unmapped", hotel.id, "0") && (
                                <RoomTypeCell
                                  displayText="Family Suite"
                                  fullDescription="Family Suite with Extra Space and Amenities"
                                  roomCategoryId="unmapped"
                                  hotelId={hotel.id}
                                  cellKey="0"
                                  openHotelCellDropdown={openHotelCellDropdown}
                                  handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                  handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                  getAllRoomCategories={getAllRoomCategories}
                                  removingRoomsSet={removingRooms}
                                  bulkMappingMode={bulkMappingMode}
                                  selectedRoomsForBulk={selectedRoomsForBulk}
                                  onCheckboxChange={handleCheckboxChange}
                                />
                              )}
                              {hotel.id === "executive-corporate" && !isCellMapped("unmapped", hotel.id, "0") && (
                                <RoomTypeCell
                                  displayText="Executive Boardroom"
                                  fullDescription="Executive Boardroom with Conference Facilities"
                                  roomCategoryId="unmapped"
                                  hotelId={hotel.id}
                                  cellKey="0"
                                  openHotelCellDropdown={openHotelCellDropdown}
                                  handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                  handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                  getAllRoomCategories={getAllRoomCategories}
                                  removingRoomsSet={removingRooms}
                                  bulkMappingMode={bulkMappingMode}
                                  selectedRoomsForBulk={selectedRoomsForBulk}
                                  onCheckboxChange={handleCheckboxChange}
                                />
                              )}
                              {hotel.id === "ultra-luxury" && !isCellMapped("unmapped", hotel.id, "0") && (
                                <RoomTypeCell
                                  displayText="Presidential Suite"
                                  fullDescription="Presidential Suite with Luxury Amenities"
                                  roomCategoryId="unmapped"
                                  hotelId={hotel.id}
                                  cellKey="0"
                                  openHotelCellDropdown={openHotelCellDropdown}
                                  handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                  handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                  getAllRoomCategories={getAllRoomCategories}
                                  removingRoomsSet={removingRooms}
                                  bulkMappingMode={bulkMappingMode}
                                  selectedRoomsForBulk={selectedRoomsForBulk}
                                  onCheckboxChange={handleCheckboxChange}
                                />
                              )}
                              {hotel.id === "international-business" && !isCellMapped("unmapped", hotel.id, "0") && (
                                <RoomTypeCell
                                  displayText="International Suite"
                                  fullDescription="International Suite with Global Standards"
                                  roomCategoryId="unmapped"
                                  hotelId={hotel.id}
                                  cellKey="0"
                                  openHotelCellDropdown={openHotelCellDropdown}
                                  handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                  handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                  getAllRoomCategories={getAllRoomCategories}
                                  removingRoomsSet={removingRooms}
                                  bulkMappingMode={bulkMappingMode}
                                  selectedRoomsForBulk={selectedRoomsForBulk}
                                  onCheckboxChange={handleCheckboxChange}
                                />
                              )}
                              {/* Dynamically render unmapped rooms */}
                              {getMappedRooms("unmapped", hotel.id).length > 0 && (
                                <div className="space-y-1">
                                  {getMappedRooms("unmapped", hotel.id).map((unmappedRoom, index) => {
                                    const unmappedRoomKey = `unmapped-${hotel.id}-${unmappedRoom.cellKey}`
                                    // Calculate whether this room should show red or green background
                                    // The cellKey for unmapped rooms is the timestamp
                                    const shouldShowRed = removingRooms.has(unmappedRoomKey)
                                    const shouldShowGreen = newlyMappedRooms.has(unmappedRoomKey)
                                    
                                    return (
                                      <RoomTypeCell
                                        key={unmappedRoomKey}
                                        displayText={unmappedRoom.displayText}
                                        fullDescription={unmappedRoom.fullDescription}
                                        roomCategoryId="unmapped"
                                        hotelId={hotel.id}
                                        cellKey={unmappedRoom.cellKey}
                                        openHotelCellDropdown={openHotelCellDropdown}
                                        handleHotelCellDropdownToggle={handleHotelCellDropdownToggle}
                                        handleHotelCellDropdownAction={handleHotelCellDropdownAction}
                                        getAllRoomCategories={getAllRoomCategories}
                                        isMapped={false}
                                        isRemoving={shouldShowRed}
                                        isNewlyMapped={shouldShowGreen}
                                        removingRoomsSet={removingRooms}
                                        bulkMappingMode={bulkMappingMode}
                                        selectedRoomsForBulk={selectedRoomsForBulk}
                                        onCheckboxChange={handleCheckboxChange}
                                      />
                                    )
                                  })}
            </div>
                              )}
                            </td>
                          ))}
                        </tr>
                        
                        {/* Bulk Mapping Action Buttons */}
                        {bulkMappingMode && (
                          <tr>
                            <td colSpan={getPaginatedHotelColumns().length + 1} className="px-4 py-4">
                              <div className="flex justify-end gap-3">
                                <button
                                  onClick={handleBulkMappingCancel}
                                  className="px-6 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleBulkMappingSave}
                                  className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                                >
                                  Save
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Mode Content */}
              {mappingMode === "advanced" && (
                <div className="space-y-6">
                  {/* Advanced content is displayed above when mode is "advanced" */}
                </div>
              )}
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

      {/* Add Room Modal */}
      <Dialog open={showAddRoomModal} onOpenChange={setShowAddRoomModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Room</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Room Name */}
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-1">
                Room Name<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                value={roomName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomName(e.target.value)}
                onBlur={() => setTouchedRoomName(true)}
                placeholder="Enter room name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
              />
              {touchedRoomName && roomName.length === 0 && (
                <p className="text-red-500 text-xs mt-1">Room Name is required.</p>
              )}
            </div>

            {/* Abbreviation */}
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-1">
                Abbreviation<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                value={abbreviation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value.toUpperCase()
                  if (value.length <= 3) {
                    setAbbreviation(value)
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
              onClick={() => {
                setShowAddRoomModal(false)
                setRoomName("")
                setAbbreviation("")
                setTouchedRoomName(false)
              }}
              className="h-9 px-4 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (roomName && abbreviation) {
                  // Generate unique ID for new room
                  const newRoomId = roomName.toLowerCase().replace(/\s+/g, '-')
                  
                  // Add new room to the top of the categories list
                  setRoomCategories(prev => [
                    { id: newRoomId, name: roomName, code: abbreviation },
                    ...prev
                  ])
                  
                  setShowAddRoomModal(false)
                  setRoomName("")
                  setAbbreviation("")
                  setTouchedRoomName(false)
                }
              }}
              disabled={!roomName || !abbreviation}
              className="h-9 px-4 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Room Modal for Advanced Tab */}
      <Dialog open={showAddRoomModalAdvanced} onOpenChange={setShowAddRoomModalAdvanced}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Room</DialogTitle>
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

            {/* Room Name */}
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-1">
                Room Name<span className="text-red-500 ml-1">*</span>
              </Label>
              {roomCreationMode === "recommended" ? (
                <Select value={roomName} onValueChange={(value) => {
                  setRoomName(value)
                  // Auto-fill abbreviation based on room name
                  const roomAbbreviations: Record<string, string> = {
                    "Apartment": "APT",
                    "Bungalow": "BUN",
                    "Deluxe Room": "DLX",
                    "Standard Room": "STD",
                    "Studio": "STU",
                    "Suite": "SUI",
                    "Superior Room": "SUP",
                    "Villa": "VIL"
                  }
                  setAbbreviation(roomAbbreviations[value] || "")
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Room Name*" />
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
                  placeholder="Enter room name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                />
              )}
              {touchedRoomName && roomName.length === 0 && roomCreationMode === "new" && (
                <p className="text-red-500 text-xs mt-1">Room Name is required.</p>
              )}
            </div>

            {/* Abbreviation */}
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-1">
                Abbreviation<span className="text-red-500 ml-1">*</span>
              </Label>
              {roomCreationMode === "recommended" ? (
                <Input
                  value={abbreviation}
                  readOnly
                  placeholder="Auto-selected"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed uppercase"
                />
              ) : (
                <Input
                  value={abbreviation}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value.toUpperCase()
                    if (value.length <= 3) {
                      setAbbreviation(value)
                    }
                  }}
                  placeholder="Enter abbreviation"
                  maxLength={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200 uppercase"
                />
              )}
            </div>

            {/* Priority Order Information Box */}
            <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 mb-1">Priority Order</p>
                <p className="text-sm text-gray-700">
                  For this Room the priority order will be {roomCategories.length + 1}. If you want to change the priority order then please visit the <span className="font-semibold">Manage Room</span> section.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setShowAddRoomModalAdvanced(false)
                setRoomName("")
                setAbbreviation("")
                setTouchedRoomName(false)
                setRoomCreationMode("new")
              }}
              className="h-9 px-4 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (roomName && abbreviation) {
                  // Generate unique ID for new room
                  const newRoomId = roomName.toLowerCase().replace(/\s+/g, '-')
                  
                  // Add new room to the top of the categories list
                  setRoomCategories(prev => [
                    { id: newRoomId, name: roomName, code: abbreviation },
                    ...prev
                  ])
                  
                  setShowAddRoomModalAdvanced(false)
                  setRoomName("")
                  setAbbreviation("")
                  setTouchedRoomName(false)
                  setRoomCreationMode("new")
                }
              }}
              disabled={!roomName || !abbreviation}
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
            <DialogTitle className="text-xl font-semibold text-black">Delete Room</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this room? This action cannot be undone.
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
            <DialogTitle className="text-lg font-bold">Rename Room</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Room Name */}
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-1">
                Room Name<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                value={renameRoomName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRenameRoomName(e.target.value)}
                placeholder="Enter room name"
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

      {/* Currently Active Change Confirmation Modal */}
      <Dialog open={showActiveModal} onOpenChange={setShowActiveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Please Confirm</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-sm text-gray-700 pt-3">
            Only one of the settings (Basic or Advanced) can be activated. You are switching to {pendingActiveValue === "basic" ? "Basic" : "Advanced"} Settings, do you want to proceed? 
            <br /><br />
            Note: You can always switch back to {pendingActiveValue === "basic" ? "Advanced" : "Basic"} Settings, your mappings will not be lost.
            </DialogDescription>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setShowActiveModal(false)
                setPendingActiveValue(null)
              }}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 bg-gray-100"
            >
              No
            </button>
            <button
              onClick={() => {
                if (pendingActiveValue) {
                  setCurrentlyActive(pendingActiveValue)
                  setShowActiveModal(false)
                  setPendingActiveValue(null)
                }
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Yes
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Room Modal */}
      <Dialog open={showManageRoomModal} onOpenChange={setShowManageRoomModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Manage Room</DialogTitle>
            <p className="text-sm text-gray-600 mt-1">Edit, Delete and change Priority order</p>
          </DialogHeader>

          <div className="mt-2 flex-1 overflow-hidden">
            <div className="border border-gray-200 rounded-lg h-full">
              <div className="h-[400px] overflow-y-auto border-b border-gray-200">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50 sticky top-0 z-10 bg-gray-50 align-top border-b border-gray-200">
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 rounded-tl-lg bg-gray-50 align-top">Room Name</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50 align-top">Abbreviation</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50 align-top">Priority Order</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50 align-top">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                  {roomCategories.map((room, index) => {
                    const isEditing = editingRoomId === room.id
                    const isDeleting = deletingRoomId === room.id
                    
                    // If deleting, show confirmation message spanning all columns
                    if (isDeleting) {
                      return (
                        <tr key={room.id} className="bg-red-50">
                          <td colSpan={4} className="px-4 py-4">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-700">
                                Are you sure you want to delete <span className="font-semibold">{room.name}</span>? This action cannot be undone.
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
                        <tr key={room.id} className={`hover:bg-gray-50 ${movedRoomId === room.id ? 'bg-green-300 transition-colors duration-300' : ''}`}>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={inlineRoomName}
                              onChange={(e) => setInlineRoomName(e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={inlineAbbreviation}
                              onChange={(e) => setInlineAbbreviation(e.target.value.toUpperCase().slice(0, 3))}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded uppercase"
                              maxLength={3}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <span className="text-sm text-gray-900">{index + 1}</span>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleCancelEdit}
                                className="text-sm text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveEdit}
                                disabled={!inlineRoomName || !inlineAbbreviation}
                                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                              >
                                Save
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    }
                    
                    // Normal display
                    return (
                      <tr key={room.id} className={`hover:bg-gray-50 ${movedRoomId === room.id ? 'bg-green-300 transition-colors duration-300' : ''}`}>
                        <td className="px-4 py-2 text-sm text-gray-900">{room.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{room.code}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          {index < roomCategories.length - 1 ? (
                            <div className="relative group">
                              <button 
                                onClick={() => handleMoveRoom(room.id, 'down')}
                                className="text-gray-600 hover:text-gray-900 p-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                Move downward
                              </div>
                            </div>
                          ) : (
                            <button disabled className="text-gray-300 p-1 cursor-not-allowed">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          )}
                          {index > 0 ? (
                            <div className="relative group">
                              <button 
                                onClick={() => handleMoveRoom(room.id, 'up')}
                                className="text-gray-600 hover:text-gray-900 p-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                Move upward
                              </div>
                            </div>
                          ) : (
                            <button disabled className="text-gray-300 p-1 cursor-not-allowed">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                          )}
                          <span className="text-sm text-gray-900">{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <div className="relative group">
                            <button 
                              onClick={() => handleStartEdit(room)}
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
                              onClick={() => handleInlineDelete(room)}
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
                      <td colSpan={4} className="h-20 border-b border-gray-200"></td>
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
            <button
              onClick={() => {
                // Save the new priority order
                setShowManageRoomModal(false)
                setHasPriorityChanged(false)
              }}
              disabled={!hasPriorityChanged}
              className="h-9 px-4 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Keyword Selection Modal for Brand Channel */}
      <Dialog open={showKeywordModal} onOpenChange={setShowKeywordModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Select keyword(s) describing '{keywordModalData?.roomCategoryName || ''}'
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-700">
              Any room descriptions matching these keywords shall be automatically mapped to '<span className="font-bold">{keywordModalData?.roomCategoryName || ''}</span> (<span className="font-bold">{keywordModalData?.roomCategoryCode || ''}</span>)'
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Room Description Display with Keyword Selection */}
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <div
                className="text-sm text-gray-900 select-text cursor-text relative"
                style={{ lineHeight: 'calc(1.25rem + 4px)' }}
                onMouseDown={(e) => {
                  setIsSelecting(true)
                }}
                onMouseUp={(e) => {
                  const selection = window.getSelection()
                  if (selection && selection.toString().trim()) {
                    const selectedText = selection.toString().trim()
                    if (selectedText && !selectedKeywords.includes(selectedText)) {
                      setSelectedKeywords(prev => [...prev, selectedText])
                    }
                    selection.removeAllRanges()
                  }
                  setIsSelecting(false)
                }}
                onMouseLeave={() => {
                  setIsSelecting(false)
                }}
              >
                {(() => {
                  const fullText = keywordModalData?.roomDescription || keywordModalData?.displayText || ''
                  if (selectedKeywords.length === 0) {
                    return <span>{fullText}</span>
                  }
                  
                  // Split text by selected keywords and render with tags
                  const parts: Array<{text: string, isKeyword: boolean, keyword: string}> = []
                  
                  // Sort keywords by length (longest first) to handle overlapping/contained selections
                  const sortedKeywords = [...selectedKeywords].sort((a, b) => b.length - a.length)
                  
                  // Find all keyword positions in the original text (case-sensitive match)
                  const keywordPositions: Array<{start: number, end: number, keyword: string}> = []
                  sortedKeywords.forEach(keyword => {
                    let searchIndex = 0
                    while (true) {
                      const index = fullText.indexOf(keyword, searchIndex)
                      if (index === -1) break
                      keywordPositions.push({
                        start: index,
                        end: index + keyword.length,
                        keyword: keyword
                      })
                      searchIndex = index + 1
                    }
                  })
                  
                  // Sort positions by start index
                  keywordPositions.sort((a, b) => a.start - b.start)
                  
                  // Remove overlapping positions (keep longer ones when they overlap)
                  const nonOverlapping: Array<{start: number, end: number, keyword: string}> = []
                  keywordPositions.forEach(pos => {
                    const overlaps = nonOverlapping.some(existing => 
                      (pos.start >= existing.start && pos.start < existing.end) ||
                      (pos.end > existing.start && pos.end <= existing.end) ||
                      (pos.start <= existing.start && pos.end >= existing.end)
                    )
                    if (!overlaps) {
                      nonOverlapping.push(pos)
                    }
                  })
                  
                  // Build parts array
                  let lastIndex = 0
                  nonOverlapping.forEach(pos => {
                    if (pos.start > lastIndex) {
                      parts.push({text: fullText.substring(lastIndex, pos.start), isKeyword: false, keyword: ''})
                    }
                    parts.push({text: fullText.substring(pos.start, pos.end), isKeyword: true, keyword: pos.keyword})
                    lastIndex = pos.end
                  })
                  if (lastIndex < fullText.length) {
                    parts.push({text: fullText.substring(lastIndex), isKeyword: false, keyword: ''})
                  }
                  
                  return (
                    <>
                      {parts.map((part, index) => {
                        if (part.isKeyword) {
                          return (
                            <span key={index} className="inline-flex items-center gap-0 relative">
                              <span className="bg-teal-200 px-2 py-0.5 rounded text-sm text-gray-900 relative">
                                {part.text}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setSelectedKeywords(prev => prev.filter(k => k !== part.keyword))
                                }}
                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors flex-shrink-0 z-10 shadow-sm group"
                              >
                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                {/* Tooltip */}
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-black rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-20">
                                  Remove selection
                                </span>
                              </button>
                            </span>
                          )
                        }
                        return <span key={index}>{part.text}</span>
                      })}
                    </>
                  )
                })()}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setShowKeywordModal(false)
                setKeywordModalData(null)
                setSelectedKeywords([])
                setIsSelecting(false)
              }}
              className="h-9 px-4 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (keywordModalData) {
                  // Close modal first
                  setShowKeywordModal(false)
                  
                  // Proceed with the mapping using the stored data
                  const timestamp = Date.now()
                  const roomKey = `${keywordModalData.roomCategoryId}-${keywordModalData.hotelId}-${timestamp}`
                  
                  setRoomMappingsMap(prev => {
                    const newMap = new Map(prev)
                    
                    // Find and remove all existing instances of this room
                    const keysToRemove: string[] = []
                    newMap.forEach((room, key) => {
                      const keyPrefix = `unmapped-${keywordModalData.hotelId}-`
                      if (key.startsWith(keyPrefix)) {
                        if (room.displayText === keywordModalData.displayText || 
                            (room.sourceCategoryId === "unmapped" && 
                             room.sourceHotelId === keywordModalData.hotelId && 
                             room.sourceCellKey === keywordModalData.cellKey)) {
                          keysToRemove.push(key)
                        }
                      }
                    })
                    
                    keysToRemove.forEach(key => newMap.delete(key))
                    
                    // Add to target location with selected keywords
                    newMap.set(roomKey, {
                      displayText: keywordModalData.displayText,
                      fullDescription: keywordModalData.roomDescription,
                      sourceCategoryId: "unmapped",
                      sourceHotelId: keywordModalData.hotelId,
                      sourceCellKey: keywordModalData.cellKey,
                      selectedKeywords: [...selectedKeywords]
                    })
                    return newMap
                  })
                  
                  // Mark the source cell as mapped
                  const sourceCellKey = `unmapped-${keywordModalData.hotelId}-${keywordModalData.cellKey}`
                  
                  // Show light red background on source before hiding
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
                      Array.from(newSet).forEach(key => {
                        if (key.includes(keywordModalData.hotelId) && key.includes(keywordModalData.displayText)) {
                          newSet.delete(key)
                        }
                      })
                      newSet.add(sourceCellKey)
                      return newSet
                    })
                  }, 1000)
                  
                  // Set animation state
                  setAnimatingRoom(roomKey)
                  
                  // Add to newly mapped rooms with green background for 10 seconds
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
                  
                  // Clear modal data
                  setKeywordModalData(null)
                  setSelectedKeywords([])
                  setIsSelecting(false)
                }
              }}
              className="h-9 px-4 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save
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












