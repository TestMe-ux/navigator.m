"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Filter,
  CalendarIcon,
  MapPin,
  Clock,
  Users,
  Star,
  AlertCircle,
  Sparkles,
  BookmarkIcon,
  List,
  Calendar as CalendarLucide,
  Briefcase,
  Heart,
  Trophy,
  Music,
  Plane,
  Coffee,
  Globe,
  Presentation,
  Store,
  Building,
  GraduationCap,
  PartyPopper,
  Check,
  Edit,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn, conevrtDateforApi } from "@/lib/utils"
import { getAllEvents, saveEvents, deleteEvents, getEventCitiesCountryList, getAllHoliday, getAllSubscribeEvents, setSubscribeUnsubscribeEvent, setSubsUnSubsHolidayEvent, updateEvents } from "@/lib/events"
import { useDateContext } from "@/components/date-context"
import { addDays, endOfMonth, format, getDaysInMonth, isValid, startOfMonth } from "date-fns"
import { useSelectedProperty } from "@/hooks/use-local-storage"


// Helper functions for consistent date formatting
const formatSingleDate = (dateString: string | Date) => {
  if (!dateString) return "";
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  if (!isValid(date)) {
    return ""; // or "Invalid Date" or fallback text
  }
  return format(date, "dd MMM ''yy")
}

const formatDateRange = (startDate: string | Date, endDate: string | Date) => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  if (!start || isNaN(start.getTime()) || !end || isNaN(end.getTime())) {
    return ""; // or some default value
  }

  if (start.toDateString() === end.toDateString()) {
    return formatSingleDate(start)
  }

  const startFormatted = format(start, "dd MMM")
  const endFormatted = format(end, "dd MMM ''yy")
  return `${startFormatted} – ${endFormatted}`
}

const formatListHeader = (dateString: string) => {
  const date = new Date(dateString)
  return format(date, "EEEE, d MMM yyyy")
}

interface Event {
  id: string
  eventId: string
  name: string
  startDate: string
  endDate: string
  category: "conferences" | "tradeshow" | "workshop" | "social" | "holidays" | "business"
  location: string
  description: string
  status: "bookmarked" | "suggested" | "available" | "holidays"
  country?: string
  flag?: string
  type: "holiday" | "conferences" | "festival" | "sports" | "business" | "social"
  priority: "high" | "medium" | "low"
  attendees?: number
  isCustom?: boolean
  createdAt?: number

  eventCity: string
  charge: string
  masterEventId: any
  EventProfileId: any
  imageUrl: any
  isRepeat: boolean
  repeats: any
  repeatsBy: any
  repeatEvery: any | number | null
}

// Custom events storage key
//const CUSTOM_EVENTS_KEY = 'events-calendar-custom-events'

// Function to save custom events to localStorage
// const saveCustomEventsToStorage = (customEvents: Event[]) => {
//   // Check if we're on the client side
//   if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
//     console.warn('localStorage is not available (SSR environment)')
//     return
//   }

//   try {
//     // Ensure we only save custom events with proper timestamps
//     const eventsWithTimestamp = customEvents.filter(event => event.isCustom).map(event => ({
//       ...event,
//       createdAt: event.createdAt || Date.now()
//     }))

//     const dataToSave = JSON.stringify(eventsWithTimestamp)
//     localStorage.setItem(CUSTOM_EVENTS_KEY, dataToSave)
//     console.log(`💾 Saved ${eventsWithTimestamp.length} custom events to localStorage`)

//     // Verify the save was successful
//     const verification = localStorage.getItem(CUSTOM_EVENTS_KEY)
//     if (!verification) {
//       throw new Error('Failed to verify localStorage save')
//     }
//   } catch (error) {
//     console.error('Failed to save custom events to localStorage:', error)
//     // Try to notify user if localStorage is not available
//     if (error instanceof DOMException && error.code === 22) {
//       console.warn('localStorage quota exceeded or disabled')
//     }
//   }
// }

// Function to load custom events from localStorage
// const loadCustomEventsFromStorage = (): Event[] => {
//   // Check if we're on the client side
//   if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
//     console.warn('localStorage is not available (SSR environment)')
//     return []
//   }

//   try {

//     const stored = localStorage.getItem(CUSTOM_EVENTS_KEY)
//     if (!stored || stored === 'null' || stored === 'undefined') {
//       console.log('📂 No custom events found in localStorage')
//       return []
//     }

//     let events: (Event & { createdAt: number })[]
//     try {
//       events = JSON.parse(stored)
//     } catch (parseError) {
//       console.error('Failed to parse stored events, clearing localStorage:', parseError)
//       localStorage.removeItem(CUSTOM_EVENTS_KEY)
//       return []
//     }

//     // Ensure events is an array
//     if (!Array.isArray(events)) {
//       console.error('Stored events is not an array, clearing localStorage')
//       localStorage.removeItem(CUSTOM_EVENTS_KEY)
//       return []
//     }

//     const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000) // 3 days in milliseconds

//     // Filter out events older than 3 days and ensure they have required properties
//     const validEvents = events.filter(event => {
//       // Check if event has required properties
//       if (!event.id || !event.name || !event.isCustom) {
//         console.warn('Invalid event found, skipping:', event)
//         return false
//       }

//       // Check if event is within 3-day window
//       const createdAt = event.createdAt || 0
//       return createdAt > threeDaysAgo
//     })

//     const expiredCount = events.length - validEvents.length

//     // Save back the filtered events to clean up expired ones
//     if (validEvents.length !== events.length) {
//       try {
//         localStorage.setItem(CUSTOM_EVENTS_KEY, JSON.stringify(validEvents))
//         console.log(`🗑️ Cleaned up ${expiredCount} expired events (older than 3 days)`)
//       } catch (saveError) {
//         console.error('Failed to save cleaned events:', saveError)
//       }
//     }

//     console.log(`📂 Loaded ${validEvents.length} custom events from localStorage`)
//     return validEvents
//   } catch (error) {
//     console.error('Failed to load custom events from localStorage:', error)
//     // Clear corrupted data
//     try {
//       localStorage.removeItem(CUSTOM_EVENTS_KEY)
//     } catch (clearError) {
//       console.error('Failed to clear corrupted localStorage data:', clearError)
//     }
//     return []
//   }
// }

// Custom Event Tooltip Component with Today's New Logic
const EventTooltip = ({ children, event, isVisible, day, currentDate }: {
  children: React.ReactNode;
  event: Event;
  isVisible: boolean;
  day: number;
  currentDate: Date;
}) => {
  // Call Today's New Logic - Enhanced date detection and special handling
  const callTodaysNewLogic = () => {
    const today = new Date()
    const eventDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)

    // Normalize dates for accurate comparison
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const eventDateNormalized = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())

    const isToday = todayNormalized.getTime() === eventDateNormalized.getTime()
    const isPast = eventDateNormalized < todayNormalized
    const isFuture = eventDateNormalized > todayNormalized

    return {
      isToday,
      isPast,
      isFuture,
      daysDifference: Math.ceil((eventDateNormalized.getTime() - todayNormalized.getTime()) / (1000 * 60 * 60 * 24))
    }
  }

  const { isToday, isPast, isFuture, daysDifference } = callTodaysNewLogic()

  // Calculate adaptive width based on event name length and today's logic
  const getTooltipWidth = () => {
    const nameLength = event.name.length
    // Wider tooltips for today's events for better visibility
    if (isToday) {
      if (nameLength <= 15) return "w-56"      // 224px for today's short names
      if (nameLength <= 25) return "w-72"      // 288px for today's medium names  
      if (nameLength <= 35) return "w-80"      // 320px for today's long names
      return "w-96"                            // 384px for today's very long names
    }

    // Standard width for other days
    if (nameLength <= 15) return "w-48"      // 192px for short names
    if (nameLength <= 25) return "w-64"      // 256px for medium names  
    if (nameLength <= 35) return "w-80"      // 320px for long names
    return "w-96"                            // 384px for very long names
  }

  // Get calendar date with today's logic styling
  const getCalendarDate = () => {
    return formatSingleDate(event.startDate)
  }

  // Format date range for multi-day events only
  const getEventDateRange = () => {
    if (event.startDate === event.endDate) {
      // Single day event - return empty string (no date shown)
      return ""
    } else {
      // Multi-day event - show range
      return formatDateRange(event.startDate, event.endDate)
    }
  }

  // Enhanced tooltip position calculation with viewport awareness and overlap prevention
  const getTooltipPosition = () => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const dayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday, 6 = Saturday
    const currentDayOfWeek = (dayOfWeek + day - 1) % 7
    const weekNumber = Math.floor((dayOfWeek + day - 1) / 7)
    const totalWeeks = Math.ceil((getDaysInMonth(currentDate) + firstDayOfMonth.getDay()) / 7)

    // Enhanced edge detection
    const isLeftEdge = currentDayOfWeek === 0 || currentDayOfWeek === 1 // Sunday or Monday
    const isRightEdge = currentDayOfWeek === 5 || currentDayOfWeek === 6 // Friday or Saturday  
    const isTopRow = weekNumber === 0 // First week
    const isBottomRow = weekNumber >= totalWeeks - 1 // Last week
    const isMiddleDay = currentDayOfWeek >= 2 && currentDayOfWeek <= 4 // Tuesday to Thursday

    // Viewport boundary awareness - check available space
    const getViewportAwarePosition = () => {
      // Priority positioning to prevent overlaps
      // Today's events get priority positioning with extra space
      if (isToday) {
        // For today's events, prioritize edge positioning for first/last week
        if (isLeftEdge && !isRightEdge) return 'right' // Right for left edge if not also right edge
        if (isRightEdge && !isLeftEdge) return 'left'  // Left for right edge if not also left edge
        if (isTopRow && !isBottomRow) return 'bottom' // Prefer bottom for today if not in last row
        if (isBottomRow && !isTopRow) return 'top'   // Prefer top for today if not in first row
        if (isMiddleDay) return 'top'                  // Top for middle days to avoid horizontal overlap
        return 'bottom'                                // Default bottom for today
      }

      // Smart positioning for upcoming events (within 7 days)
      if (isFuture && daysDifference <= 7) {
        // Give upcoming events better positioning, prioritize edge positioning
        if (isLeftEdge) return 'right'
        if (isRightEdge) return 'left'
        if (isTopRow) return 'bottom'
        if (isBottomRow) return 'top'
        return 'top' // Prefer top for upcoming events
      }

      // Standard positioning for other days - prioritize edge positioning for consistency
      if (isLeftEdge) return 'right'
      if (isRightEdge) return 'left'
      if (isTopRow) return 'bottom'
      if (isBottomRow) return 'top'
      return 'top' // Default position
    }

    return getViewportAwarePosition()
  }

  const position = getTooltipPosition()

  // Enhanced position classes with better spacing and overlap prevention
  const getPositionClasses = () => {
    const baseSpacing = isToday ? 3 : 2 // More spacing for today's tooltips
    const zIndex = isToday ? 'z-[70]' : 'z-[60]' // Higher z-index for today's tooltips

    switch (position) {
      case 'bottom':
        return `top-full left-1/2 transform -translate-x-1/2 mt-${baseSpacing} ${zIndex}`
      case 'left':
        return `right-full top-1/2 transform -translate-y-1/2 mr-${baseSpacing} ${zIndex}`
      case 'right':
        return `left-full top-1/2 transform -translate-y-1/2 ml-${baseSpacing} ${zIndex}`
      default: // 'top'
        return `bottom-full left-1/2 transform -translate-x-1/2 mb-${baseSpacing} ${zIndex}`
    }
  }

  // Get tooltip container z-index for proper layering
  const getTooltipZIndex = () => {
    // Today's tooltips get highest priority
    if (isToday) return 'z-[80]'
    // Future events within a week get medium priority  
    if (isFuture && daysDifference <= 7) return 'z-[65]'
    // All other tooltips get base priority
    return 'z-[60]'
  }

  const getArrowClasses = () => {
    switch (position) {
      case 'bottom':
        return "absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-slate-900"
      case 'left':
        return "absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-slate-900"
      case 'right':
        return "absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-slate-900"
      default: // 'top'
        return "absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900"
    }
  }

  // Background styling for all events (consistent)
  const getTooltipBgClasses = () => {
    return "bg-slate-900 border border-slate-700"
  }

  return (
    <div className="relative inline-block w-full">
      {children}
      {isVisible && (
        <div className={cn(
          "absolute pt-3 pb-3 pl-3 pr-3 text-white rounded-lg shadow-xl pointer-events-none",
          getTooltipWidth(),
          getPositionClasses(),
          getTooltipBgClasses()
        )}>
          {/* Arrow */}
          <div className={getArrowClasses()}></div>

          {/* Tooltip Content */}
          <div className="space-y-2">
            {/* Calendar Date at Top */}
            <div className="text-sm font-medium mb-1 text-white">
              {getCalendarDate()}
            </div>



            {/* Event Details */}
            <div className="pt-2 border-t border-gray-600">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-3 w-3 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400 truncate" title={event.name}>{event.name}</span>
              </div>

              {/* Date Range (only for multi-day events) */}
              {getEventDateRange() && (
                <div className="text-xs text-gray-300 mb-1">
                  {getEventDateRange()}
                </div>
              )}

              <div className="text-xs text-gray-300">
                {event.category.charAt(0).toUpperCase() + event.category.slice(1)} Event
              </div>




            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function EventsCalendarPage() {
  // const { startDate, endDate } = useDateContext()
  const fmtDate = (d: string) => format(new Date(d), "EEE, dd MMM - yyyy");
  const [selectedProperty] = useSelectedProperty()
  // Initialize calendar to show current month (today's logic)
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date()
    // Check if we should show August 2025 (which has sample events) or current month
    const isCurrentMonthInFuture = today < new Date(2025, 7, 1)
    return isCurrentMonthInFuture ? new Date(2025, 7, 1) : today
  })
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false)
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false)

  const [isDayViewOpen, setIsDayViewOpen] = useState(false)
  const [isSaveEvent, setIsSaveEvent] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const [bookmarkSearchQuery, setBookmarkSearchQuery] = useState("")
  const [bookmarkCategoryFilter, setBookmarkCategoryFilter] = useState<string[]>(["all", "conferences", "tradeshow", "workshop", "social", "holidays"])
  const [bookmarkTypeFilter, setBookmarkTypeFilter] = useState<string[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [dropdownKey, setDropdownKey] = useState(0) // Force re-render of dropdown

  // Helper function to check if a category should be checked (bookmark popup)
  const isCategoryChecked = useCallback((categoryId: string) => {
    // Always return true for individual categories when "all" is present
    const allCategories = ["conferences", "tradeshow", "workshop", "social", "holidays"]

    if (categoryId === "all") {
      return bookmarkCategoryFilter.includes("all")
    }

    // If categoryId is an individual category and "all" is selected, always return true
    if (allCategories.includes(categoryId) && bookmarkCategoryFilter.includes("all")) {
      return true
    }

    // Otherwise, check if the specific category is selected
    return bookmarkCategoryFilter.includes(categoryId)
  }, [bookmarkCategoryFilter])

  // Helper function to check if a type should be checked (bookmark popup Event Type)
  const isTypeChecked = useCallback((typeId: string) => {

    // Always return true for individual types when "all" is present
    const allTypes = ["bookmarked", "holiday", "suggested", "available"]

    if (typeId === "all") {
      return bookmarkTypeFilter.includes("all")
    }

    // If typeId is an individual type and "all" is selected, always return true
    if (allTypes.includes(typeId) && bookmarkTypeFilter.includes("all")) {
      return true
    }

    // Otherwise, check if the specific type is selected
    return bookmarkTypeFilter.includes(typeId)
  }, [bookmarkTypeFilter])

  // Force checkbox synchronization on page load and whenever the filter changes
  useEffect(() => {
    // Double-check that state is consistent for UI rendering
    if (bookmarkCategoryFilter.includes("all")) {
      const allCategories = ["all", "conferences", "tradeshow", "workshop", "social", "holidays"]
      const hasAllCategories = allCategories.every(cat => bookmarkCategoryFilter.includes(cat))

      if (!hasAllCategories) {
        // Force complete state reconstruction to ensure all categories are included
        setBookmarkCategoryFilter(allCategories)
      }
    }
  }, [bookmarkCategoryFilter])



  // Additional force sync on mount with multiple attempts to ensure UI consistency
  useEffect(() => {
    // Focus only on bookmark dropdown for now to avoid reference issues
    // Immediate sync for bookmark dropdown
    setBookmarkCategoryFilter(["all", "conferences", "tradeshow", "workshop", "social", "holidays"])
    setDropdownKey(prev => prev + 1)

    // Multiple delayed syncs to ensure UI renders correctly
    const timer1 = setTimeout(() => {
      setBookmarkCategoryFilter(["all", "conferences", "tradeshow", "workshop", "social", "holidays"])
      setDropdownKey(prev => prev + 1)
    }, 100)

    const timer2 = setTimeout(() => {
      setBookmarkCategoryFilter(["all", "conferences", "tradeshow", "workshop", "social", "holidays"])
      setDropdownKey(prev => prev + 1)
    }, 300)

    const timer3 = setTimeout(() => {
      setBookmarkCategoryFilter(["all", "conferences", "tradeshow", "workshop", "social", "holidays"])
      setDropdownKey(prev => prev + 1)
    }, 500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, []) // Only run once on mount

  // Force checkbox synchronization for Event Type filter
  useEffect(() => {
    // Double-check that state is consistent for UI rendering
    if (bookmarkTypeFilter.includes("all")) {
      const allTypes = ["all", "bookmarked", "holiday", "suggested", "available"]
      const hasAllTypes = allTypes.every(type => bookmarkTypeFilter.includes(type))

      if (!hasAllTypes) {
        // Force complete state reconstruction to ensure all types are included
        setBookmarkTypeFilter(allTypes)
      }
    }

    // Force re-render of dropdown to reflect changes
    setDropdownKey(prev => prev + 1)
  }, [bookmarkTypeFilter])

  // Multi-phase force sync for Event Type filter on mount
  useEffect(() => {
    // Immediate sync for Event Type dropdown
    setBookmarkTypeFilter(["all", "bookmarked", "holiday", "suggested", "available"])
    setDropdownKey(prev => prev + 1)

    // Multiple delayed syncs to ensure UI renders correctly
    const timer1 = setTimeout(() => {
      setBookmarkTypeFilter(["all", "bookmarked", "holiday", "suggested", "available"])
      setDropdownKey(prev => prev + 1)
    }, 100)

    const timer2 = setTimeout(() => {
      setBookmarkTypeFilter(["all", "bookmarked", "holiday", "suggested", "available"])
      setDropdownKey(prev => prev + 1)
    }, 300)

    const timer3 = setTimeout(() => {
      setBookmarkTypeFilter(["all", "bookmarked", "holiday", "suggested", "available"])
      setDropdownKey(prev => prev + 1)
    }, 500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, []) // Only run once on mount

  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 })

  // Handle mouse enter for events with tooltip positioning
  const handleEventMouseEnter = (eventId: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    })
    setHoveredEvent(eventId)
  }
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")
  const [isLoading, setIsLoading] = useState(false)
  const [apiEvents, setApiEvents] = useState<any[]>([])
  const [apiHolidays, setApiHolidays] = useState<any[]>([])
  const [apiSubscribeEvents, setApiSubscribeEvents] = useState<any[]>([])
  const [apiSubscribeEventList, setApiSubscribeEventList] = useState<any[]>([])
  const [countryList, setCountryList] = useState<any[]>([])
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingCycle, setLoadingCycle] = useState(1)

  // Country dropdown state
  const [isCountryOpen, setIsCountryOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("")
  const [countrySearchQuery, setCountrySearchQuery] = useState("")
  const [isCountrySearchFocused, setIsCountrySearchFocused] = useState(false)

  // City dropdown state
  const [isCityOpen, setIsCityOpen] = useState(false)
  const [cityOptions, setCityOptions] = useState<any[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>(["All"])
  const [citySearchQuery, setCitySearchQuery] = useState("")
  const [isCitySearchFocused, setIsCitySearchFocused] = useState(false)

  // Category dropdown state
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"])

  const [selectHotelLatitude, setHotelLatitude] = useState("")
  const [selectHotelLongitude, setHotelLongitude] = useState("")

  // Helper function to check if a main category should be checked (main dropdown)
  const isMainCategoryChecked = useCallback((categoryName: string) => {
    // Define all category names statically
    const allCategoryNames = ["All", "Conferences", "Trade Shows", "Workshop", "Social", "Holidays"]
    const nonAllCategories = ["Conferences", "Trade Shows", "Workshop", "Social", "Holidays"]

    if (categoryName === "All") {
      return selectedCategories.includes("All")
    }

    // If categoryName is an individual category and "All" is selected, always return true
    if (nonAllCategories.includes(categoryName) && selectedCategories.includes("All")) {
      return true
    }

    // Otherwise, check if the specific category is selected
    return selectedCategories.includes(categoryName)
  }, [selectedCategories])

  // Date picker states for add event form
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)

  // Delete confirmation dialog state
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Popover states for country and city dropdowns with search
  const [isCreateCountryOpen, setIsCreateCountryOpen] = useState(false)
  const [isCreateCityOpen, setIsCreateCityOpen] = useState(false)
  const [isEditCountryOpen, setIsEditCountryOpen] = useState(false)
  const [isEditCityOpen, setIsEditCityOpen] = useState(false)



  // Description validation state
  const [descriptionError, setDescriptionError] = useState("")


  // const sampleEvents: any = []
  // // Initialize events with sample events and stored custom events
  // useEffect(() => {
  //   const initializeEvents = () => {
  //     try {
  //       const storedCustomEvents = loadCustomEventsFromStorage()
  //       const combinedEvents = [...sampleEvents, ...storedCustomEvents]
  //       setEvents(combinedEvents)
  //       console.log(`🚀 Initialized with ${sampleEvents.length} sample events and ${storedCustomEvents.length} custom events`)
  //     } catch (error) {
  //       console.error('Failed to initialize events:', error)
  //       // Fallback to just sample events
  //       setEvents(sampleEvents)
  //     }
  //   }

  //   // Initialize immediately
  //   initializeEvents()

  //   // Also try to reload after a short delay in case of timing issues
  //   const timeoutId = setTimeout(() => {
  //     const storedCustomEvents = loadCustomEventsFromStorage()

  //     if (storedCustomEvents.length > 0) {
  //       setEvents(prev => {
  //         const currentCustomCount = prev.filter(e => e.isCustom).length

  //         if (currentCustomCount !== storedCustomEvents.length) {
  //           console.log('🔄 Reloading events due to count mismatch')
  //           return [...sampleEvents, ...storedCustomEvents]
  //         }
  //         return prev
  //       })
  //     }
  //   }, 500)

  //   return () => clearTimeout(timeoutId)
  // }, [])

  // Simulate data loading with progress tracking (only on first load)




  // Category options with distinct colors
  const categoryData = [
    { id: "all", name: "All", icon: Globe, color: "text-slate-600" },
    { id: "conferences", name: "Conferences", icon: Presentation, color: "text-blue-600" },
    { id: "tradeshow", name: "Trade Shows", icon: Building, color: "text-purple-600" },
    { id: "workshop", name: "Workshop", icon: GraduationCap, color: "text-green-600" },
    { id: "social", name: "Social", icon: PartyPopper, color: "text-pink-600" },
    { id: "holidays", name: "Holidays", icon: Sparkles, color: "text-amber-600" }
  ]

  const [enabledEventTypes, setEnabledEventTypes] = useState<{
    bookmarked: boolean;
    holidays: boolean;
    conferences: boolean;
    social: boolean;
  }>({
    bookmarked: true,
    holidays: true,
    conferences: true, // For business conferences
    social: true, // For social events
  })

  const toggleEventType = (type: 'bookmarked' | 'holidays' | 'conferences' | 'social') => {
    setEnabledEventTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  // Filter country options based on search query
  const filteredCountryOptions = countryList.filter(option =>
    option.label.toLowerCase().includes(countrySearchQuery.toLowerCase())
  )

  // Filter city options based on search query
  const filteredCityOptions = cityOptions?.filter(option =>
    option.label.toLowerCase().includes(citySearchQuery.toLowerCase())
  ) || []

  // Handle country selection  
  const handleCountrySelect = useCallback((country: string) => {
    setSelectedCountry(country)
    setIsCountryOpen(false)
    setCountrySearchQuery("") // Clear search when selecting
    setIsCountrySearchFocused(false) // Clear focus state

    // Auto-select first city of the new country
    setSelectedCities(["All"])
    console.log(`🌍 Country changed: ${country}`)
  }, [cityOptions])

  // Handle city selection with multi-select logic
  const handleCitySelect = useCallback((city: string) => {

    setSelectedCities(prev => {
      if (city === "All") {
        // If selecting "All", toggle between all selected and all unselected
        if (prev.includes("All")) {
          return [] // Unselect all
        } else {
          // Get all available cities for the selected country
          const availableCities = cityOptions || []
          return ["All", ...availableCities.map((option: any) => option.label)] // Select all
        }
      }

      const isSelected = prev.includes(city)
      let newSelection: string[]

      if (isSelected) {
        // Remove city and "All" if it was selected
        newSelection = prev.filter(c => c !== city && c !== "All")
      } else {
        // Add city
        const filteredPrev = prev.filter(c => c !== "All")
        newSelection = [...filteredPrev, city]

        // Check if all cities are now selected
        const availableCities = cityOptions || []
        if (newSelection.length === availableCities.length && availableCities.every((option: any) => newSelection.includes(option.label))) {
          newSelection = ["All", ...newSelection]
        }
      }

      console.log(`🏙️ Cities changed:`, newSelection)
      return newSelection
    })
  }, [selectedCountry, cityOptions])

  // Helper function to check if a city should be checked
  const isCityChecked = useCallback((cityName: string) => {
    // Get available cities for the selected country
    const availableCities = cityOptions || []
    const cityNames = availableCities.map((option: any) => option.label)

    if (cityName === "All") {
      return selectedCities.includes("All")
    }

    // If cityName is an individual city and "All" is selected, always return true
    if (cityNames.includes(cityName) && selectedCities.includes("All")) {
      return true
    }

    return selectedCities.includes(cityName)
  }, [selectedCities, selectedCountry, cityOptions])

  useEffect(() => {
    setNewEventCountry(selectedProperty?.country || ""); // Default country
    setNewEventCity(selectedProperty?.city || "");       // Default city
    if (selectedProperty?.city) {
      setSelectedCountry(`${selectedProperty?.country}`);
      setSelectedCities([selectedProperty.city]);
    }
  }, [selectedProperty]);


  // Get display text for city button
  const getCityDisplayText = useCallback(() => {
    if (selectedCities.length === 0) {
      return "All Cities"
    } else if (selectedCities.includes("All")) {
      return "All Cities"
    } else if (selectedCities.length === 1) {
      return selectedCities[0]
    } else {
      return `${selectedCities.length} Cities`
    }
  }, [selectedCities])



  // Get country flag for selected country
  const getCountryFlag = useCallback(() => {
    const country = countryList.find(option => option.label === selectedCountry)
    return country?.flag || "🌍" // Default to world globe emoji if not found
  }, [selectedCountry])

  // Handle category selection with multi-select logic
  const handleCategorySelect = useCallback((categoryName: string) => {

    setSelectedCategories(prev => {
      const isSelected = prev.includes(categoryName)
      let newSelection: string[]

      if (categoryName === "All") {
        // If clicking "All", toggle between all selected and all unselected
        if (isSelected) {
          // If "All" is currently selected, deselect everything
          newSelection = []
        } else {
          // If "All" is not selected, select all categories
          newSelection = categoryData.map(c => c.name)
        }
      } else {
        // If selecting a specific category
        if (isSelected) {
          // Remove the category and "All" if present
          newSelection = prev.filter(c => c !== categoryName && c !== "All")
        } else {
          // Add the category and remove "All" if present
          const filteredSelection = prev.filter(c => c !== "All")
          newSelection = [...filteredSelection, categoryName]

          // If all individual categories are now selected, add "All"
          const nonAllCategories = categoryData.filter(c => c.name !== "All")
          if (newSelection.length === nonAllCategories.length) {
            newSelection = categoryData.map(c => c.name)
          }
        }
      }

      console.log(`📂 Category selection changed: ${newSelection.join(", ")}`)
      return newSelection
    })
  }, [categoryData])

  // Get display text for category button
  const getCategoryDisplayText = useCallback(() => {
    if (selectedCategories.length === 0) {
      return "All Categories"
    } else if (selectedCategories.includes("All")) {
      return "All Categories"
    } else if (selectedCategories.length === 1) {
      return selectedCategories[0]
    } else {
      return `${selectedCategories.length} Categories`
    }
  }, [selectedCategories])

  // Helper function to get category color
  const getCategoryColor = useCallback((categoryValue: string) => {
    const category = categoryData.find(cat => cat.id === categoryValue || cat.name.toLowerCase() === categoryValue.toLowerCase())
    return category?.color || "text-gray-600"
  }, [categoryData])

  // Helper function to get category data for events
  const getCategoryData = useCallback(
    (event: Event) => {

      const normalize = (s?: string) => (s ?? "").toLowerCase().trim();

      let eventCategory = normalize(event.category);
      const eventType = normalize(event.type);
      const eventStatus = normalize(event.status);

      if (eventCategory === "conference") {
        eventCategory = eventCategory + "s"; // -> "conferences"
      }
      //  Match by explicit category first (highest priority)
      if (eventCategory) {
        const byCategory = categoryData.find(cat => {
          const id = normalize(cat.id);
          const name = normalize(cat.name);
          return id === eventCategory || name === eventCategory;
        });
        if (byCategory) return byCategory;
      }

      //  Holiday type
      if (eventType === "holiday") {
        return categoryData.find(cat => cat.id === "holidays");
      }

      //  Suggested status (only if no explicit category)
      if (eventStatus === "suggested") {
        return categoryData.find(cat => cat.id === "social");
      }

      //  Match by type if still not found
      if (eventType) {
        const byType = categoryData.find(cat => normalize(cat.id) === eventType);
        if (byType) return byType;
      }

      //  Default → all
      return categoryData.find(cat => cat.id === "all");
    },
    [categoryData]
  );

  // const getCategoryData = useCallback(
  //   (event: Event) => {
  //     const normalize = (s?: string) => (s ?? "").toLowerCase().trim();
  //     // Suggested events → always Social
  //     if (event.status === "suggested") {
  //       return categoryData.find(cat => cat.id === "social");
  //     }

  //     // Holidays
  //     if (event.type === "holiday") {
  //       return categoryData.find(cat => cat.id === "holidays");
  //     }

  //     const eventCategory = normalize(event.category);
  //     const eventType = normalize(event.type);

  //     // Try match by id or name (case-insensitive)
  //     return categoryData.find(cat => {
  //       const id = normalize(cat.id);
  //       const name = normalize(cat.name);
  //       return id === eventCategory || name === eventCategory || id === eventType || name === eventType;
  //     });


  //   },
  //   [categoryData]
  // );


  // Toggle bookmark status  
  const toggleBookmark = useCallback((eventId: string, SID: string) => {

    setEvents(prevEvents => {
      let updatedEvent: Event | any = null;

      const newEvents = prevEvents.map(ev => {
        if (String(ev.eventId) === String(eventId)) {
          const newStatus: "bookmarked" | "suggested" | "available" =
            ev.status === "bookmarked" || ev.status === "suggested" ? "available" : "bookmarked";

          updatedEvent = { ...ev, status: newStatus };
          return updatedEvent;
        }
        return ev;
      });

      // Update filteredEvents
      if (updatedEvent) {
        setFilteredEvents(prevFiltered =>
          prevFiltered.map(fe => (fe.eventId === eventId ? updatedEvent! : fe))
            .filter(fe => fe.status !== "available")
        );

        // Update selectedEvent if popup is open
        setSelectedEvent(prev => (prev?.eventId === eventId ? updatedEvent! : prev));
        // Call API only once per toggle

        if (Number(SID)) {
          console.log("TOGGLE BOOKMARK DEBUG:", {
            eventId,
            sid: selectedProperty?.sid,
            updatedEvent
          });
          callApiToUpdateEvent(updatedEvent, Number(SID));
        } else {
          console.log("Skipping API call: selectedProperty.sid is undefined");
        }
        if (
          updatedEvent.status === "available" && // it was removed from bookmarks
          eventId === updatedEvent.eventId
        ) {
          setSelectedEvent(null);       // Deselect event
          setIsDayViewOpen(false);      // Close modal
        }
        //setIsSaveEvent(true);
        // setTimeout(() => setLoadingProgress(0), 100);
      }


      return newEvents;
    });
  }, []);

  const callApiToUpdateEvent = async (getevents: Event, sid: number) => {
    try {

      if (!getevents) return;
      //console.log("call Api To UpdateEvent rows:", getevents);

      if (getevents.isCustom) {
        // Decide new status before API call
        const filtersValues = {
          eventId: getevents.eventId,
          action: getevents?.status === "bookmarked" ? 1 : 2,
          isCustom: getevents.isCustom,
        };
        try {
          const response = await setSubscribeUnsubscribeEvent(filtersValues);
          if (response?.status) {
            //console.log("filtersValues SubscribeUnsubscribe", filtersValues)
            setEvents(prev => prev.map(ev => ev.eventId === getevents.eventId ? response.body.eventId : ev));
            setFilteredEvents(prev => prev.map(ev => ev.eventId === getevents.eventId ? response.body.eventId : ev));
            setSelectedEvent(prev => prev?.eventId === getevents.eventId ? response.body.eventId : prev);

          } else {
            console.warn("API failed, UI not updated");
          }
        } catch (err) {
          console.error("API Error:", err);
        }
      } else if (getevents.type === "holiday") {
        if (!sid) {
          console.error("Missing selectedProperty.sid, cannot subscribe holiday event");
          return;
        }
        var filtersValue = {
          "EventHolidayID": getevents.eventId,
          "SID": sid,
          "IsActive": getevents.status == "bookmarked" ? true : false,
          "Imapact": getevents.priority === "high" ? 1 : getevents.priority === "medium" ? 2 : 3,
          "Type": 0
        }
        try {
          //Call backend API
          const resSubsUnsubsHoliday = await setSubsUnSubsHolidayEvent(filtersValue)
          const result = resSubsUnsubsHoliday
          if (result.status) {
            setMessage("Non Custom Event Subscribe Successfully");
          } else {
            setMessage("Non Custom Event Not Subscribe Or Failed :" + (result.message || ""));
          }
        } catch (error) {
          console.error("Error inserting event:", error);
        }
      } else if (getevents.status == 'suggested' || getevents.status == 'available') {
        const addEventObj = {
          EventId: getevents.eventId,
          EventName: getevents.name,
          EventFrom: getevents.startDate,
          EventTo: getevents.endDate,
          Charge: getevents.charge,
          MasterEventId: getevents.masterEventId,
          EventProfile: getevents.EventProfileId,
          EventLocation: getevents.location,
          EventCity: getevents.eventCity,
          EventType: getevents.type,
          IsCustom: 0,
          SID: sid,
          ImageUrl: getevents.imageUrl,
          EventImpact: getevents.priority === "high" ? 1 : getevents.priority === "medium" ? 2 : 3,
          EventDescription: getevents.description,
          isRepeat: getevents.isRepeat,
          Repeats: getevents.isRepeat ? parseInt(getevents.repeats) : null,
          RepeatsBy: getevents.isRepeat ? getevents.repeatsBy : null,
          RepeatEvery: getevents.isRepeat ? parseInt(getevents.repeatEvery) : null,
          Latitude: selectHotelLatitude !== "" ? selectHotelLatitude : 0,
          Longitude: selectHotelLongitude !== "" ? selectHotelLongitude : 0

        }
        try {
          //Call backend API
          const res: any = await saveEvents(addEventObj);
          if (res?.status && res?.body?.eventId) {
            const serverId = String(res.body.eventId);

            // Replace temp ID with server ID
            setEvents(prev =>
              prev.map(ev => (ev.eventId === serverId ? { ...ev, eventId: serverId } : ev))
            );

          } else {
            setMessage("Failed to add event: " + (res?.message || ""));
          }
        } catch (error) {
          console.error("Error inserting event:", error);
        }
      } else {
        const filtersValues = {
          eventId: getevents.eventId,
          action: 0,
          isCustom: getevents.isCustom,
        };
        try {

          const response = await setSubscribeUnsubscribeEvent(filtersValues);
          if (response?.status) {
            //  Update UI only after success
            setMessage("Custom Event Subscribe Unsubscribe Successfully");
          } else {
            console.warn("API failed, UI not updated");
          }
        } catch (err) {
          console.error("API Error:", err);
        }
      }

    } catch (error) {
      console.error("API error:", getevents);
    }
  };

  // const toggleBookmark = useCallback(async (eventId: string) => {

  //   const combinedEvents = [...events];

  //   const getevents = combinedEvents.find(ev => String(ev.eventId) === String(eventId));

  //   console.log(getevents);
  //   if (!getevents) return;
  //   if (getevents.isCustom) {
  //     // Decide new status before API call
  //     const filtersValues = {
  //       eventId: getevents.eventId,
  //       action: getevents?.status === "bookmarked" ? 2 : 1,
  //       isCustom: getevents.isCustom,
  //     };

  //     try {

  //       //const response = await setSubscribeUnsubscribeEvent(filtersValues);
  //       //  if (response?.status) {
  //       //  Update UI only after success    
  //       // setApiSubscribeEventList

  //       setEvents(prevEvents =>
  //         prevEvents.map(ev => {
  //           if (String(ev.eventId) === String(eventId)) {
  //             const newStatus: "bookmarked" | "suggested" | "available" =
  //               ev.status === "bookmarked" || ev.status === "suggested" ? "available" : "bookmarked";

  //             const updatedEvent = { ...ev, status: newStatus };

  //             // Update popup if this event is selected
  //             setSelectedEvent((prev: any) => (prev?.eventId === eventId ? updatedEvent : prev));

  //             // Update filteredEvents so Day View updates
  //             setFilteredEvents(prevFiltered =>
  //               prevFiltered.map(fe => (fe.eventId === eventId ? updatedEvent : fe))
  //             );


  //             console.log("Updated Event:", updatedEvent);

  //             return updatedEvent;
  //           }
  //           return ev;
  //         })
  //       );
  //       //setApiSubscribeEvents
  //       //setEvents
  //       // setApiSubscribeEventList(prevEvents =>
  //       //   prevEvents.map(event => {
  //       //     if (event.eventId === eventId) {
  //       //       let newStatus: "bookmarked" | "suggested" | "available";

  //       //       if (event.status === "bookmarked") {
  //       //         newStatus = "suggested";   // toggle off → back to suggested
  //       //       } else {
  //       //         newStatus = "bookmarked";  // available or suggested → bookmarked
  //       //       }

  //       //       return { ...event, status: newStatus };
  //       //     }
  //       //     return event;
  //       //   })
  //       // );
  //       //  
  //       //setSelectedEvent(null)

  //       // setLoadingProgress(100);
  //       // setIsSaveEvent(true);
  //       // setTimeout(() => setLoadingProgress(0), 100);
  //       // } else {
  //       //   console.warn("API failed, UI not updated");
  //       // }
  //     } catch (err) {
  //       console.error("API Error:", err);
  //     }
  //   } else if (getevents.type === "holiday") {
  //     if (!getevents) return;
  //     var filtersValue = {
  //       "EventHolidayID": getevents.eventId,
  //       "SID": selectedProperty?.sid,
  //       "IsActive": getevents.status == "bookmarked" ? false : true,
  //       "Imapact": getevents.priority === "high" ? 1 : getevents.priority === "medium" ? 2 : 3,
  //       "Type": 0
  //     }
  //     try {
  //       //Call backend API
  //       // setLoadingProgress(100)
  //       const resSubsUnsubsHoliday = await setSubsUnSubsHolidayEvent(filtersValue)
  //       const result = resSubsUnsubsHoliday
  //       if (result.status) {
  //         setEvents(prevEvents =>
  //           prevEvents.map(ev => {
  //             if (ev.eventId === eventId) {
  //               const newStatus: "bookmarked" | "suggested" | "available" | "holidays" =
  //                 (ev.status === "bookmarked" || ev.status === "suggested" || ev.status === "holidays") ? "available" : "bookmarked";

  //               const updatedEvent = { ...ev, status: newStatus };
  //               // Update popup if this event is selected
  //               setSelectedEvent(prev => (prev?.eventId === eventId ? updatedEvent : prev));

  //               return updatedEvent;
  //             }
  //             return ev;
  //           })
  //         );
  //         // setApiSubscribeEventList(prevEvents => {
  //         //   const newEvents = prevEvents.map(event => {
  //         //     if (event.eventId === eventId) {
  //         //       //const newStatus: "bookmarked" | "suggested" | "available" = (event.status === "bookmarked" || event.status === "suggested") ? "available" : "bookmarked"
  //         //       let newStatusHoliday: "bookmarked" | "holidays" | "available";
  //         //       if (event.status === "bookmarked") {
  //         //         newStatusHoliday = "holidays";   // toggle off → back to suggested
  //         //       } else {
  //         //         newStatusHoliday = "bookmarked";  // available or suggested → bookmarked
  //         //       }
  //         //       return { ...event, status: newStatusHoliday }
  //         //     }
  //         //     return event
  //         //   })
  //         //   return newEvents
  //         // })
  //         // setLoadingProgress(100);
  //         // setIsSaveEvent(true);
  //         // setTimeout(() => setLoadingProgress(0), 100);
  //         setMessage("Non Custom Event Subscribe Successfully");
  //       } else {
  //         setMessage("Non Custom Event Not Subscribe Or Failed :" + (result.message || ""));
  //       }
  //     } catch (error) {
  //       console.error("Error inserting event:", error);
  //     }
  //   } else if (getevents.status == 'suggested' || getevents.status == 'available') {
  //     const addEventObj = {
  //       EventId: getevents.eventId,
  //       EventName: getevents.name,
  //       EventFrom: getevents.startDate,
  //       EventTo: getevents.endDate,
  //       Charge: getevents.charge,
  //       MasterEventId: getevents.masterEventId,
  //       EventProfile: getevents.EventProfileId,
  //       EventLocation: getevents.location,
  //       EventCity: getevents.eventCity,
  //       EventType: getevents.type,
  //       IsCustom: 0,
  //       SID: selectedProperty?.sid,
  //       ImageUrl: getevents.imageUrl,
  //       EventImpact: getevents.priority === "high" ? 1 : getevents.priority === "medium" ? 2 : 3,
  //       EventDescription: getevents.description,
  //       isRepeat: getevents.isRepeat,
  //       Repeats: getevents.isRepeat ? parseInt(getevents.repeats) : null,
  //       RepeatsBy: getevents.isRepeat ? getevents.repeatsBy : null,
  //       RepeatEvery: getevents.isRepeat ? parseInt(getevents.repeatEvery) : null,
  //       Latitude: selectHotelLatitude !== "" ? selectHotelLatitude : 0,
  //       Longitude: selectHotelLongitude !== "" ? selectHotelLongitude : 0

  //     }
  //     try {
  //       //Call backend API

  //       const res: any = await saveEvents(addEventObj);
  //       if (res?.status && res?.body?.eventId) {
  //         const serverId = String(res.body.eventId);

  //         // Replace temp ID with server ID
  //         setEvents(prev =>
  //           prev.map(ev => (ev.eventId === serverId ? { ...ev, eventId: serverId } : ev))
  //         );

  //         setIsSaveEvent(true);
  //       } else {
  //         setMessage("Failed to add event: " + (res?.message || ""));
  //       }
  //     } catch (error) {
  //       console.error("Error inserting event:", error);
  //     }
  //   }
  //   else {
  //     const filtersValues = {
  //       eventId: getevents.id,
  //       action: 0,
  //       isCustom: getevents.isCustom,
  //     };
  //     try {

  //       const response = await setSubscribeUnsubscribeEvent(filtersValues);
  //       if (response?.status) {
  //         //  Update UI only after success

  //         //setApiSubscribeEvents
  //         setEvents(prevEvents =>
  //           prevEvents.map(ev => {
  //             if (String(ev.eventId) === String(eventId)) {
  //               const newStatus: "bookmarked" | "suggested" | "available" =
  //                 ev.status === "bookmarked" || ev.status === "suggested" ? "available" : "bookmarked";

  //               const updatedEvent = { ...ev, status: newStatus };

  //               // Update popup if this event is selected
  //               setSelectedEvent(prev => (String(prev?.eventId) === String(eventId) ? updatedEvent : prev));

  //               // Update filteredEvents so Day View updates
  //               setFilteredEvents(prevFiltered =>
  //                 prevFiltered.map(fe => (String(fe.eventId) === String(eventId) ? updatedEvent : fe))
  //               );

  //               return updatedEvent;
  //             }
  //             return ev;
  //           })
  //         );
  //         setLoadingProgress(100);
  //         setIsSaveEvent(true);
  //         setTimeout(() => setLoadingProgress(0), 100);

  //       } else {
  //         console.warn("API failed, UI not updated");
  //       }
  //     } catch (err) {
  //       console.error("API Error:", err);
  //     }
  //   }
  // }, []); //events



  // Add Event modal states
  const [newEventCountry, setNewEventCountry] = useState("")
  const [newEventCity, setNewEventCity] = useState("")

  // Edit Event modal states
  const [isEditEventOpen, setIsEditEventOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  const [newEvent, setNewEvent] = useState({
    name: "",
    startDate: "",
    endDate: "",
    category: "conferences" as "conferences" | "tradeshow" | "workshop" | "social",
    country: selectedProperty?.country,
    city: "",
    description: "",
  })

  // Handle new event country selection
  const handleNewEventCountrySelect = (country: string) => {
    setNewEventCountry(country);
    setNewEvent(prev => ({ ...prev, country }));

    // Auto-select first city for the selected country
    const countryCities: { id: string; label: string }[] =
      cityOptions[country as keyof typeof cityOptions] ||
      (selectedProperty?.city ? [{ id: selectedProperty.city, label: selectedProperty.city }] : []);

    if (countryCities.length > 0) {
      // Pick selectedProperty city if it belongs to this country, else first city
      const matchedCity = countryCities.find((c: any) => c.label === selectedProperty?.city);
      const firstCityLabel = matchedCity ? matchedCity.label : countryCities[0].label;

      setNewEventCity(firstCityLabel);
      setNewEvent(prev => ({ ...prev, city: firstCityLabel }));
    } else {
      setNewEventCity("");
      setNewEvent(prev => ({ ...prev, city: "" }));
    }
  };

  // Handle new event city selection
  const handleNewEventCitySelect = (city: string) => {

    setNewEventCity(city)
    setNewEvent((prev) => ({ ...prev, city }))
  }

  useEffect(() => {
    const defaultCountry = selectedProperty?.country || selectedCountry;

    if (defaultCountry && !newEvent.country) {
      setNewEvent(prev => ({ ...prev, country: defaultCountry }));
    }
    setNewEventCountry(defaultCountry);

    // Auto-select first city of the new country
    const cities = cityOptions
    const countryCities: { id: string; label: string }[] =
      cities[defaultCountry as keyof typeof cityOptions] ||
      (selectedProperty?.city ? [{ id: selectedProperty.city, label: selectedProperty.city }] : []);


    if (countryCities.length > 0) {
      //const matchedCity = countryCities.find((c: any) => c.label === (`${selectedProperty?.city}` ? `${selectedProperty?.city}` : ""));
      const matchedCity = selectedProperty?.city
        ? countryCities.find(c =>
          c.label &&
          selectedProperty.city &&
          c.label.trim().toLowerCase() === selectedProperty.city.trim().toLowerCase()
        )
        : undefined;

      const firstCityLabel = matchedCity ? matchedCity.label : countryCities[0].label;

      setNewEventCity(firstCityLabel);
      setNewEvent(prev => ({ ...prev, city: firstCityLabel }));
    } else {
      setNewEventCity("");
      setNewEvent(prev => ({ ...prev, city: "" }));
    }
  }, [countryList, selectedProperty?.city, selectedCountry]);

  // Handle edit event
  const handleEditEvent = async (event: Event) => {

    setEditingEvent(event)
    setNewEvent({
      name: event.name,
      startDate: event.startDate,
      endDate: event.endDate,
      category: event.type as typeof newEvent.category,
      country: event.country || event.location.split(", ")[1],
      city: event.location.split(", ")[0] || "",
      description: event.description,
    })
    setNewEventCountry(event.country || event.location.split(", ")[1])
    setNewEventCity(event.location.split(", ")[0] || "")
    setIsEditEventOpen(true)
  }

  // Handle description change with validation
  const handleDescriptionChange = (value: string) => {
    if (value.length > 250) {
      setDescriptionError("Description cannot exceed 250 characters")
    } else {
      setDescriptionError("")
    }
    setNewEvent((prev) => ({ ...prev, description: value }))
  }

  // Show delete confirmation dialog
  const showDeleteConfirmation = (eventId: string) => {
    const event = events.find(e => e.eventId === eventId)
    if (event && event.isCustom) {
      setEventToDelete(event)
      setIsDeleteDialogOpen(true)
    }
  }

  // Handle delete event after confirmation
  const handleDeleteEvent = async (eventId: any) => {

    try {
      const response = await deleteEvents(Number(eventId));

      if (response.status) {


        setEvents(prev => prev.filter(event => event.eventId !== eventId));

        setApiEvents(prev => prev.filter(ev => ev.eventId !== eventId));
        setApiHolidays(prev => prev.filter(ev => ev.eventId !== eventId));
        setApiSubscribeEvents(prev => prev.filter(ev => ev.eventId !== eventId));

        setFilteredEvents(prev =>
          prev ? prev.filter(ev => ev.eventId !== eventId) : []
        );

        setSelectedEvent(prev => (prev?.eventId === eventId ? null : prev));

        setMessage("Event deleted successfully!");
        setIsDeleteDialogOpen(false);
        setEventToDelete(null);
        setIsSaveEvent(true);
      } else {
        setMessage("Failed to delete event: " + (response.message || ""));
      }
    } catch (error) {
      console.error("Error delete  event:", error);
      setMessage("Something went wrong while delete  event!");
    }
  }

  // Handle save edited event
  const handleSaveEditedEvent = async () => {

    if (!editingEvent) return
    const updatedEvent: Event = {
      ...editingEvent,
      name: newEvent.name,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
      category: newEvent.category === "social" ? "social" : "business",
      location: `${newEvent.city}, ${newEvent.country}`,
      description: newEvent.description,
      type: newEvent.category as Event["type"],
      country: newEvent.country,
    }
    let updateEventObj = {
      Sid: selectedProperty?.sid,
      EventId: updatedEvent.eventId,
      EventName: updatedEvent.name,
      EventDescription: updatedEvent.description,
      EventLocation: updatedEvent.location,
      EventFrom: updatedEvent.startDate,
      EventTo: updatedEvent.endDate,
      EventType: updatedEvent.type,
      EventImpact: updatedEvent.priority === "high" ? 1 : updatedEvent.priority === "medium" ? 2 : 3,
      Charge: "Free",
      RepeatsBy: "50986",
      IsCustom: true,
      IsRepeat: false,
      Latitude: selectHotelLatitude ? selectHotelLatitude : 0,
      Longitude: selectHotelLongitude ? selectHotelLongitude : 0
    }
    try {

      const resEdit = await updateEvents(updateEventObj);
      if (resEdit?.status) {
        // setEvents(prev => [...prev, tempEvent]);
        const serverId = String(resEdit?.body?.eventId ?? "");
        setIsSaveEvent(true);
      }
      else {
        setMessage("Failed to update event: " + (resEdit.message || ""));
      }
    } catch (error) {
      console.error("Error updating event:", error);
      setMessage("Something went wrong while updating event!");
    }

    setIsEditEventOpen(false)
    setEditingEvent(null)
    setNewEvent((prev) => ({
      name: "",
      startDate: "",
      endDate: "",
      category: "conferences",
      country: prev.country,
      city: prev.city,
      description: "",
    }));
    // setNewEventCountry("")
    // setNewEventCity("")
  }

  useEffect(() => {
    if (isSaveEvent) {
      // load events from API
      fetchAllData();
      //fetchAllSubscribeEvents()

      // reset so it can trigger next time too
      setIsSaveEvent(false);
    }
  }, [isSaveEvent]);

  // useEffect(() => {
  //   setMonthPickerYear(currentDate.getFullYear())

  //   if (!!currentDate && selectedProperty?.sid) {
  //     setIsLoading(true);
  //     setLoadingProgress(0);

  //     let progressInterval: NodeJS.Timeout;

  //     const startProgress = () => {
  //       progressInterval = setInterval(() => {
  //         setLoadingProgress((prev) => {
  //           const increment = Math.floor(Math.random() * 9) + 3; // 3–11%
  //           const next = prev + increment;

  //           // Loop back or cap it just below 100 (e.g., 97%)
  //           return next >= 97 ? 97 : next;
  //         });
  //       }, 80);
  //     };

  //     startProgress();
  //     // Fetch all APIs
  //     Promise.all([
  //       fetchEventsData(),
  //       fetchEventCitiesCountryList(),
  //       fetchHolidayData(),
  //       fetchAllSubscribeEvents()
  //     ]).then(() => {
  //       // APIs done — show 100% progress and hide loader after brief delay
  //       clearInterval(progressInterval);
  //       setLoadingProgress(100);

  //       setTimeout(() => {
  //         setIsLoading(false);
  //         setLoadingProgress(0); // reset for next load cycle
  //       }, 100); // Delay gives smooth transition
  //     });
  //   }
  // }, [currentDate, selectedProperty?.sid, selectedCountry])
  useEffect(() => {
    fetchAllData();
  }, [currentDate, selectedProperty?.sid, selectedCountry]);

  const fetchAllData = useCallback(async () => {
    if (!currentDate || !selectedProperty?.sid) return;

    setIsLoading(true);
    setLoadingProgress(0);

    let progressInterval: NodeJS.Timeout;
    progressInterval = setInterval(() => {
      setLoadingProgress(prev => Math.min(prev + Math.floor(Math.random() * 9 + 3), 97));
    }, 80);

    try {
      await Promise.all([
        fetchEventsData(),
        fetchEventCitiesCountryList(),
        fetchHolidayData(),
        fetchAllSubscribeEvents()
      ]);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 100);
    }
  }, [currentDate, selectedProperty?.sid, selectedCountry]);


  const fetchEventsData = useCallback(async () => {
    const startDate = startOfMonth(currentDate)
    const endDate = endOfMonth(currentDate);

    try {
      setIsLoading(true)
      const filtersValue = {
        "Country": [selectedCountry == "" ? selectedProperty?.country : selectedCountry],
        "City": selectedCities.includes("All") ? [] : selectedCities,
        "SID": selectedProperty?.sid,
        "PageNumber": 1,
        "PageCount": 500,
        "StartDate": startDate,
        "EndDate": endDate
      }

      const response = await getAllEvents(filtersValue)
      if (response?.status && response?.body?.eventDetails) {
        setApiEvents(response.body.eventDetails)
        const countryListResponse = response.body.country || [];
        const countryList = countryListResponse.map((country: any) => ({
          label: country,
          id: country,
          flag: "https://optima.rategain.com/optima/Content/images/flag/" + country + ".jpg"
        }))
        setCountryList(countryList);
        setHotelLatitude(response.body.hotelLatitude)
        setHotelLongitude(response.body.hotelLongitude)
        if (selectedCountry === "" || selectedCountry === undefined) {
          setSelectedCountry(selectedProperty?.country || countryList[0]?.label || "")
        }

      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
      // Fallback to sample data if API fails
      setApiEvents([])
    } finally {
      setIsLoading(false)
    }
  }, [currentDate, selectedProperty?.sid, selectedCountry])
  const fetchEventCitiesCountryList = async () => {
    try {
      let getCountryValue = selectedCountry == "" ? selectedProperty?.country : selectedCountry
      const response = await getEventCitiesCountryList({ CountryName: getCountryValue || "" })
      if (response?.status && response?.body?.cities) {
        const cities = response.body.cities.map((city: any) => ({
          label: city,
          id: city
        }))
        setCityOptions(cities);
        // setSelectedCities([["All"], ...(response.body?.cities ?? [])])
      }
    } catch (error) {
      console.error('Failed to fetch country list:', error)
    }
  }
  const fetchHolidayData = useCallback(async () => {
    const startDate = startOfMonth(currentDate)
    const endDate = endOfMonth(currentDate);
    try {
      setIsLoading(true)
      const filtersValue = {
        "Country": [selectedCountry == "" ? selectedProperty?.country : selectedCountry],
        "City": selectedCities.includes("All") ? [] : selectedCities,
        "SID": selectedProperty?.sid,
        "FromDate": conevrtDateforApi(startDate?.toString()),
        "ToDate": conevrtDateforApi(endDate?.toString()),
        "Type": selectedCategories.includes("All") ? [] : selectedCategories,
        "Impact": [],
        "SearchType": ""
      }
      const response = await getAllHoliday(filtersValue)
      if (response?.status && response?.body) {
        var holidays = [...response.body[0].holidayDetail];
        const combinedEvents = [] as Event[]
        holidays.map((x, index) => {
          const convertedEvent: Event = {
            id: `apiHoliday_${index}`,
            eventId: x.eventHolidayID,
            name: x.holidayName || '',
            startDate: x.holidayDispalyDate || new Date().toISOString().split('T')[0],
            endDate: x.holidayDispalyDate || new Date().toISOString().split('T')[0],
            category: 'holidays',
            location: x.holidayCountry || '',
            description: '',
            status: x.isSubscribe == true ? "bookmarked" : "holidays" as const,
            country: x.holidayCountry || '',
            flag: '🇦🇪',
            type: 'holiday',
            priority: 'high',
            eventCity: "",
            charge: "",
            masterEventId: "",
            EventProfileId: "",
            imageUrl: "",
            isRepeat: false,
            repeats: "",
            repeatsBy: "",
            repeatEvery: null
          }
          combinedEvents.push(convertedEvent)
        }
        )
        setApiHolidays(combinedEvents);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
      // Fallback to sample data if API fails
      setApiHolidays([])
    } finally {
      setIsLoading(false)
    }
  }, [currentDate, selectedProperty?.sid, selectedCountry])


  // useEffect(() => {

  //   let filtered = apiSubscribeEventList.filter(x => x.status === "bookmarked" || x.type === "holiday");

  //   //  // --- Country filtering ---
  //   if (selectedCountry !== selectedProperty?.country && selectedCountry !== "All") {
  //     const normalizedSelected = selectedCountry.trim().toLowerCase();
  //     filtered = filtered.filter(ev => (ev.country ?? "").trim().toLowerCase() === normalizedSelected);
  //   }


  //   // --- City filtering ---
  //   if (selectedCities.length > 0 && !selectedCities.includes("All")) {
  //     filtered = filtered.filter(x =>
  //       selectedCities.some(city => {
  //         const normalizedSelected = city.trim().toLowerCase();
  //         const eventCity = (x.eventCity ?? "").trim().toLowerCase();

  //         return normalizedSelected === eventCity;
  //       })
  //     );
  //   }

  //   if (selectedCategories.length > 0 && !selectedCategories.includes("All")) {
  //     filtered = filtered.filter(x =>
  //       selectedCategories.some(c =>
  //         c.toLowerCase() === String(x.category).toLowerCase() ||
  //         normalizeCategory(c) === normalizeCategory(x.category)
  //       )
  //     );
  //   }

  //   setFilteredEvents(filtered);
  // }, [apiSubscribeEventList, selectedCategories, selectedCities, selectedCountry]);

  // const normalizeCategory = (cat?: string) => {
  //   if (!cat) return "";
  //   const map: Record<string, string> = {
  //     "conference": "conferences",
  //     "conferences": "conferences",
  //     "tradeshow": "tradeshow",
  //     "trade show": "tradeshow",
  //     "trade shows": "tradeshow",
  //     "workshop": "workshop",
  //     "social": "social",
  //     "holiday": "holidays",
  //     "holidays": "holidays",
  //     "business": "business"
  //   };
  //   return map[cat.toLowerCase()] || cat.toLowerCase();
  // };

  // Combine API events with sample events
  useEffect(() => {
    const combinedEvents = [] as Event[]
    // Convert API events to our Event interface format
    apiEvents.forEach((apiEvent, index) => {
      const convertedEvent: Event = {
        id: apiEvent.eventId > 0 ? apiEvent.eventId : `api_${index}`,
        eventId: apiEvent.eventId,
        name: apiEvent.eventName || '',
        startDate: apiEvent.startDate || apiEvent.eventFrom || new Date().toISOString().split('T')[0],
        endDate: apiEvent.endDate || apiEvent.eventTo || new Date().toISOString().split('T')[0],
        category: apiEvent.eventType?.trim(),
        location: apiEvent.eventLocation || '',
        description: apiEvent.eventDescription || '',
        status: apiEvent.isSubscribed === true ? "bookmarked" : "available" as const,
        country: apiEvent.eventCountry || '',
        flag: apiEvent.flag || '🇦🇪',
        isCustom: apiEvent.isCustom || false,
        type: apiEvent.eventType?.trim() || 'business',
        priority: apiEvent.eventColor === 'PositiveHigh' ? 'high' : apiEvent.eventColor === 'medium' ? 'medium' : 'low',
        eventCity: apiEvent.eventCity,
        charge: apiEvent.charge || "",
        masterEventId: apiEvent.masterEventId || "",
        EventProfileId: apiEvent.eventProfileId || "",
        imageUrl: apiEvent.imageUrl || "",
        isRepeat: apiEvent.isRepeat || false,
        repeats: apiEvent.repeats || "",
        repeatsBy: apiEvent.repeatsBy || "",
        repeatEvery: apiEvent.repeatEvery || null,
      }
      combinedEvents.push(convertedEvent)
    })
    setEvents([...combinedEvents, ...apiHolidays])
    setApiSubscribeEventList([...apiHolidays, ...apiSubscribeEvents])
  }, [apiEvents, apiHolidays, apiSubscribeEvents])

  // Filter events based on current view and enabled event types
  // useEffect(() => {

  //   //const filterSubsHoliday = apiSubscribeEventList.filter(x => x.status === "bookmarked");
  //   let filtered = apiSubscribeEventList.filter((event) => {
  //     // Check each event type independently and only show if enabled

  //     // Status-based filtering (bookmarked)
  //     if (event.status === "bookmarked" && enabledEventTypes.bookmarked) return true

  //     // Type-based filtering (holidays)  
  //     if (event.type === "holiday" && enabledEventTypes.holidays) return true

  //     // For other events, show them by default for now (since we don't have legend buttons for them yet)
  //     // But we need to make sure they don't conflict with status-based filtering
  //     if (event.status !== "bookmarked" && event.type !== "holiday") {
  //       return true // Show other events by default
  //     }

  //     return false
  //   })

  //   setFilteredEvents(filtered)
  // }, [apiSubscribeEventList, enabledEventTypes])


  useEffect(() => {
    let filtered = [...apiSubscribeEventList]
    // ;

    // Status/type filter
    filtered = filtered.filter(event => {
      if (event.type !== "holiday" && event.status === "bookmarked" && enabledEventTypes.bookmarked) return true;
      if (event.type === "holiday" && event.status == "bookmarked" && enabledEventTypes.holidays) return true;
      // if (event.type === "conference" && enabledEventTypes.conferences) return true;
      // if (event.type === "social" && enabledEventTypes.social) return true;
      return false;
    });
    // filtered = filtered.filter(event => {
    //   if (event.status === "bookmarked" && enabledEventTypes.bookmarked) return true;
    //   if (event.type === "holiday" && enabledEventTypes.holidays && event.status == "bookmarked") return true;
    //   if (event.status !== "bookmarked" && event.type !== "holiday") return true; // default show others
    //   return false;
    // });

    // Country filter
    if (selectedCountry !== selectedProperty?.country && selectedCountry !== "All") {
      const normalizedSelected = selectedCountry.trim().toLowerCase();
      filtered = filtered.filter(ev => (ev.country ?? "").trim().toLowerCase() === normalizedSelected);
    }

    // City filter
    if (!selectedCities.includes(`${selectedProperty?.city}`) && !selectedCities.includes("All")) {
      filtered = filtered.filter(x =>
        selectedCities.some(city => (x.eventCity ?? "").trim().toLowerCase() === city.trim().toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.includes("All")) {
      // Show all events, do nothing
    } else if (selectedCategories.length > 0) {
      // Show only matching categories
      filtered = filtered.filter(event => {
        const eventCategory = (event.category ?? event.type ?? "").toLowerCase().trim();
        return selectedCategories.some(selected => {
          const selectedCat = selected.toLowerCase().trim();
          const matchedCategory = categoryData.find(
            cat => cat.id.toLowerCase() === selectedCat || cat.name.toLowerCase() === selectedCat
          );
          if (!matchedCategory) return false;
          const catId = matchedCategory.id.toLowerCase().trim();
          const catName = matchedCategory.name.toLowerCase().trim();
          return eventCategory === catId || eventCategory === catName;
        });
      });
    } else {
      // No category selected → show nothing
      filtered = [];
    }

    setFilteredEvents(filtered);
  }, [
    apiSubscribeEventList,
    enabledEventTypes,
    selectedCountry,
    selectedCities,
    selectedCategories
  ]);

  // useEffect(() => {

  //   let filtered = apiSubscribeEventList.filter((event) => {
  //     //  Status/type filter
  //     if (event.status === "bookmarked" && enabledEventTypes.bookmarked) return true;
  //     if (event.type === "holiday" && enabledEventTypes.holidays) return true;
  //     if (event.status !== "bookmarked" && event.type !== "holiday") return true; // default show others
  //     return false;
  //   });

  //   //  Country filter
  //   if (selectedCountry !== selectedProperty?.country && selectedCountry !== "All") {
  //     const normalizedSelected = selectedCountry.trim().toLowerCase();
  //     filtered = filtered.filter(ev => (ev.country ?? "").trim().toLowerCase() === normalizedSelected);
  //   }

  //   //  City filter
  //   if (!selectedCities.includes(`${selectedProperty?.city}`) && !selectedCities.includes("All")) {
  //     filtered = filtered.filter(x =>
  //       selectedCities.some(city => (x.eventCity ?? "").trim().toLowerCase() === city.trim().toLowerCase())
  //     );
  //   }

  //   //  Category filter
  //   // if (selectedCategories.length > 0 && !selectedCategories.includes("All")) {
  //   //   filtered = filtered.filter(x =>
  //   //     selectedCategories.some(c => categoryData(c) === categoryData(x.category))
  //   //   );
  //   // }


  //   if (selectedCategories.length > 0 && !selectedCategories.includes("All")) {
  //     filtered = filtered.filter(x => {
  //       const eventCategory = (x.category ?? x.type ?? "").toLowerCase().trim();

  //       return selectedCategories.some(selected => {
  //         const selectedCat = selected.toLowerCase().trim();

  //         // match with categoryData by id or name
  //         const matchedCategory = categoryData.find(cat =>
  //           cat.id.toLowerCase() === selectedCat || cat.name.toLowerCase() === selectedCat
  //         );

  //         if (!matchedCategory) return false;

  //         // normalize categoryData id and name
  //         const catId = matchedCategory.id.toLowerCase().trim();
  //         const catName = matchedCategory.name.toLowerCase().trim();

  //         return eventCategory === catId || eventCategory === catName;
  //       });
  //     });
  //   }



  //   setFilteredEvents(filtered);
  // }, [
  //   apiSubscribeEventList,
  //   enabledEventTypes,
  //   selectedCountry,
  //   selectedCities,
  //   selectedCategories
  // ]);


  useEffect(() => {
    if (!isBookmarkModalOpen) {
      // Clear the search input when modal closes
      setBookmarkSearchQuery("");
      bookMarkDialogClose();
    }
    // if (isBookmarkModalOpen) {
    //   console.log("POPUP OPEN - selectedProperty:", selectedProperty);
    // }
  }, [isBookmarkModalOpen]);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]



  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay
  }

  // const navigateMonth = (direction: "prev" | "next") => {
  //   setCurrentDate((prev) => {
  //     const newDate = new Date(prev)
  //     if (direction === "prev") {
  //       newDate.setMonth(prev.getMonth() - 1)
  //     } else {
  //       newDate.setMonth(prev.getMonth() + 1)
  //     }
  //     return newDate
  //   })
  // }

  // Previous/Next month navigation  
  const navigateMonth = (direction: "prev" | "next" | "prevYear" | "nextYear") => {
    setCurrentDate(prevDate => {
      const today = new Date()
      const newDate = new Date(prevDate)

      // 🔹 Move by month or year
      switch (direction) {
        case "prev":
          newDate.setMonth(prevDate.getMonth() - 1)
          break
        case "next":
          newDate.setMonth(prevDate.getMonth() + 1)
          break
        case "prevYear":
          newDate.setFullYear(prevDate.getFullYear() - 1)
          break
        case "nextYear":
          newDate.setFullYear(prevDate.getFullYear() + 1)
          break
      }

      const newYear = newDate.getFullYear()
      const newMonth = newDate.getMonth()
      const currentYear = today.getFullYear()
      const currentMonth = today.getMonth()

      // 🔹 Apply rules
      if (newYear === currentYear) {
        return newDate // ✅ all months allowed
      }

      if (newYear === currentYear + 1) {
        // ✅ Next year → only up to current month
        if (newMonth <= currentMonth) return newDate
      }

      if (newYear === currentYear - 1) {
        // ✅ Previous year → only months >= current month
        if (newMonth >= currentMonth) return newDate
      }

      return prevDate // ❌ invalid navigation
    })
  }


  // const navigateMonth = (direction: "prev" | "next") => {
  //   setCurrentDate(prevDate => {
  //     const restrictions = getDateRestrictions()
  //     const newDate = new Date(prevDate)

  //     if (direction === "prev") {
  //       newDate.setMonth(prevDate.getMonth() - 1)
  //     } else {
  //       newDate.setMonth(prevDate.getMonth() + 1)
  //     }

  //     // stop navigation if out of range
  //     const newYear = newDate.getFullYear()
  //     const newMonth = newDate.getMonth()

  //     if (
  //       newYear < restrictions.minYear ||
  //       newYear > restrictions.maxYear ||
  //       (newYear === restrictions.minYear && newMonth < restrictions.minMonth) ||
  //       (newYear === restrictions.maxYear && newMonth > restrictions.maxMonth)
  //     ) {
  //       return prevDate // ❌ don't change
  //     }

  //     return newDate // ✅ valid new date
  //   })
  // }

  const isPrevDisabled = (currentDate: Date) => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()

    if (currentDate.getFullYear() < currentYear - 1) return true
    if (currentDate.getFullYear() === currentYear - 1 && currentDate.getMonth() <= currentMonth) return true
    return false
  }

  const isNextDisabled = (currentDate: Date) => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()

    if (currentDate.getFullYear() > currentYear + 1) return true
    if (currentDate.getFullYear() === currentYear + 1 && currentDate.getMonth() >= currentMonth) return true
    return false
  }



  // Navigate to today's month - call today's new logic
  const navigateToToday = () => {
    const today = new Date()
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))

    // Flash effect to highlight today's action
    const todayElement = document.querySelector(`[data-today="true"]`)
    if (todayElement) {
      todayElement.classList.add('animate-pulse')
      setTimeout(() => {
        todayElement.classList.remove('animate-pulse')
      }, 2000)
    }
  }

  // Check if current view is showing today's month
  const isViewingTodaysMonth = () => {
    const today = new Date()
    return currentDate.getFullYear() === today.getFullYear() &&
      currentDate.getMonth() === today.getMonth()
  }

  // Month picker functionality


  const [monthPickerYear, setMonthPickerYear] = useState(currentDate.getFullYear())

  // Navigate to specific month
  const navigateToMonth = (month: number, year: number) => {
    setCurrentDate(new Date(year, month, 1))
    setMonthPickerYear(year)
    setIsMonthPickerOpen(false)
    setYearJumpDirection(null)
  }

  const fetchAllSubscribeEvents = async () => {

    const startDate = startOfMonth(currentDate)
    const endDate = endOfMonth(currentDate);
    try {
      setIsLoading(true)
      const filtersValue = {
        // "Country": [selectedCountry == "" ? selectedProperty?.country : selectedCountry],
        // "EventType": selectedCategories.includes("All") ? [] : selectedCategories,
        // "City": selectedCities.includes("All") ? [] : selectedCities,
        "SID": selectedProperty?.sid,
        "StartDate": conevrtDateforApi(startDate?.toString()),
        "EndDate": conevrtDateforApi(endDate?.toString()),
        "Distance": 100,
        "pageNumber": 1,
        "pageCount": 500,
        "lattitude": selectHotelLatitude == "" ? 0 : selectHotelLatitude,
        "longitude": selectHotelLongitude == "" ? 0 : selectHotelLongitude
      }
      const response = await getAllSubscribeEvents(filtersValue)
      if (response?.status && response?.body) {
        var Subscribes = [...response.body.eventDetails];
        const combinedSubscribeEvents = [] as Event[]
        Subscribes.filter(x => x.isSubscribed === true
        ).map((apiEvent, index) => {
          const convertedSubscribeEvent: Event = {
            id: `apiSubsCribe_${index}`,
            eventId: apiEvent.eventId,
            name: apiEvent.eventName || '',
            startDate: apiEvent.startDate || apiEvent.eventFrom || new Date().toISOString().split('T')[0],
            endDate: apiEvent.endDate || apiEvent.eventTo || new Date().toISOString().split('T')[0],
            category: apiEvent.eventType?.trim(),
            location: apiEvent.eventLocation || '',
            description: apiEvent.eventDescription || '',
            status: apiEvent.isSubscribed === true ? "bookmarked" : "available" as const,
            country: apiEvent.eventCountry || '',
            flag: apiEvent.flag || '🇦🇪',
            isCustom: apiEvent.isCustom || false,
            type: apiEvent.eventType?.trim() || 'business',
            priority: apiEvent.eventColor === 'PositiveHigh' ? 'high' : apiEvent.eventColor === 'medium' ? 'medium' : 'low',
            eventCity: apiEvent.eventCity,
            charge: apiEvent.charge,
            masterEventId: apiEvent.masterEventId || "",
            EventProfileId: apiEvent.eventProfileId || "",
            imageUrl: apiEvent.imageUrl || "",
            isRepeat: apiEvent.isRepeat || false,
            repeats: apiEvent.repeats || "",
            repeatsBy: apiEvent.repeatsBy || "",
            repeatEvery: apiEvent.repeatEvery || null
          }
          combinedSubscribeEvents.push(convertedSubscribeEvent)
        })
        setApiSubscribeEvents(combinedSubscribeEvents);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
      // Fallback to sample data if API fails
      setApiSubscribeEvents([])
    } finally {
      setIsLoading(false)
    }
  }


  // Update month picker year when currentDate changes
  // useEffect(() => {

  // }, [currentDate])

  // Get date restrictions for month picker
  const getDateRestrictions = () => {
    const currentYear = new Date().getFullYear()
    //    const nextYear = currentYear + 1

    return {
      minYear: currentYear - 1,
      maxYear: currentYear + 1,
      minMonth: 0, // January of current year
      maxMonth: 11 // December of next year
    }
  }



  // Update month picker year when currentDate changes
  // useEffect(() => {
  //   setMonthPickerYear(currentDate.getFullYear())
  // }, [currentDate])


  // Check if a month is selectable
  // Direction can be "prevYear" | "nextYear" or null
  const isMonthSelectable = (
    month: number,
    year: number,
    referenceDate: Date | null
  ) => {
    const today = new Date(); // ✅ define "today" here
    const baseDate = referenceDate ?? today; // fallback if null

    const currentMonth = baseDate.getMonth();
    const currentYear = baseDate.getFullYear();

    // Current year → all months allowed
    if (year === currentYear) return true;

    // Next year → only months up to current month
    if (year === currentYear + 1) return month <= currentMonth;

    // Previous year → only months from current month onward
    if (year === currentYear - 1) return month >= currentMonth;

    // Any other year → disabled
    return false;
  };



  // const isMonthSelectable = (month: number, year: number) => {
  //   const restrictions = getDateRestrictions()
  //   //const currentYear = new Date().getFullYear()

  //   if (year < restrictions.minYear || year > restrictions.maxYear) {
  //     return false
  //   }

  //   return true

  //   // if (year < restrictions.minYear || year > restrictions.maxYear) {
  //   //   return false
  //   // }

  //   // // For current year, can select from January onwards
  //   // if (year === currentYear) {
  //   //   return month >= 0 // January onwards
  //   // }

  //   // // For next year, can select all months
  //   // if (year === currentYear + 1) {
  //   //   return true
  //   // }

  //   // return false
  // }

  const [yearJumpDirection, setYearJumpDirection] = useState<"prevYear" | "nextYear" | null>(null)
  // Month picker year navigation
  const navigateMonthPickerYear = (direction: "prev" | "next") => {
    setYearJumpDirection(direction === "prev" ? "prevYear" : "nextYear")
    const restrictions = getDateRestrictions()
    setMonthPickerYear(prev => {
      if (direction === "prev" && prev > restrictions.minYear) {
        return prev - 1
      }
      if (direction === "next" && prev < restrictions.maxYear) {
        return prev + 1
      }
      return prev
    })
  }

  const [message, setMessage] = useState<string>("");

  const handleAddEvent = async () => {
    // Validate required fields
    if (!newEvent.name || !newEvent.startDate || !newEvent.endDate) {
      setDescriptionError("Please fill all required fields");
      return;
    }

    const tempId = `temp_${Date.now()}`;

    const tempEvent: Event = {
      id: tempId,
      eventId: "", // will be updated with server ID
      name: newEvent.name,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
      category: newEvent.category === "social" ? "social" : "business",
      location: `${newEvent.city}, ${newEvent.country}`,
      description: newEvent.description,
      status: "bookmarked",
      type: newEvent.category as Event["type"],
      priority: "medium",
      country: newEvent.country,
      isCustom: true,
      createdAt: Date.now(),
      eventCity: newEvent.city || "",
      charge: "Free",
      masterEventId: "",
      EventProfileId: "",
      imageUrl: "",
      isRepeat: false,
      repeats: "",
      repeatsBy: "",
      repeatEvery: null,
    };

    // Optimistically add to UI immediately
    // setEvents(prev => [tempEvent, ...prev]);

    const addEventObj = {
      EventType: tempEvent.type,
      EventImpact: tempEvent.priority === "high" ? 1 : tempEvent.priority === "medium" ? 2 : 3,
      EventTo: tempEvent.endDate,
      EventFrom: tempEvent.startDate,
      EventLocation: tempEvent.location,
      EventDescription: tempEvent.description,
      EventName: tempEvent.name,
      Charge: tempEvent.charge,
      SID: selectedProperty?.sid,
      RepeatsBy: tempEvent.repeatsBy,
      IsCustom: true,
      IsRepeat: false,
      Latitude: selectHotelLatitude || 0,
      Longitude: selectHotelLongitude || 0,
    };

    // 3 Call API in background
    try {
      const res: any = await saveEvents(addEventObj);

      if (res?.status && res?.body?.eventId) {
        const serverId = String(res.body.eventId);

        // Replace temp ID with server ID
        // setEvents(prev =>
        //   prev.map(ev => (ev.id === tempId ? { ...ev, id: serverId, eventId: serverId } : ev))
        // );

        setIsSaveEvent(true);
      } else {
        // Remove temp event if API fails
        setEvents(prev => prev.filter(ev => ev.id !== tempId));
        setMessage("Failed to add event: " + (res?.message || ""));
      }
    } catch (error) {
      console.error("Error inserting event:", error);
      setEvents(prev => prev.filter(ev => ev.id !== tempId)); // rollback
      setMessage("Something went wrong!");
    } finally {
      // 4️⃣ Reset form & close modal
      setNewEvent(prev => ({
        name: "",
        startDate: "",
        endDate: "",
        category: "conferences",
        country: prev.country,
        city: prev.city,
        description: "",
      }));
      setIsStartDateOpen(false);
      setIsEndDateOpen(false);
      setDescriptionError("");
      setIsAddEventOpen(false);
    }
  };


  // const handleAddEvent = async () => {
  //   const tempId = `temp_${Date.now()}`;
  //   const tempEvent: Event = {
  //     id: tempId,
  //     eventId: "",
  //     name: newEvent.name,
  //     startDate: newEvent.startDate,
  //     endDate: newEvent.endDate,
  //     category: newEvent.category === "social" ? "social" : "business",
  //     location: `${newEvent.city}, ${newEvent.country}`,
  //     description: newEvent.description,
  //     status: "bookmarked",
  //     type: newEvent.category as Event["type"],
  //     priority: "medium",
  //     country: newEvent.country,
  //     isCustom: true,
  //     createdAt: Date.now(),
  //     eventCity: "",
  //     charge: "Free",
  //     masterEventId: "",
  //     EventProfileId: "",
  //     imageUrl: "",
  //     isRepeat: false,
  //     repeats: "",
  //     repeatsBy: "",
  //     repeatEvery: null
  //   };
  //   let addEventObj = {
  //     EventType: tempEvent.type,
  //     EventImpact: tempEvent.priority === "high" ? 1 : tempEvent.priority === "medium" ? 2 : 3,
  //     EventTo: tempEvent.endDate,
  //     EventFrom: tempEvent.startDate,
  //     EventLocation: tempEvent.location,
  //     EventDescription: tempEvent.description,
  //     EventName: tempEvent.name,
  //     Charge: tempEvent.charge,
  //     SID: selectedProperty?.sid,
  //     RepeatsBy: tempEvent.repeatsBy,
  //     IsCustom: true,
  //     IsRepeat: false,
  //     Latitude: selectHotelLatitude !== "" ? selectHotelLatitude : 0,
  //     Longitude: selectHotelLongitude !== "" ? selectHotelLongitude : 0
  //   }

  //   try {

  //     const res: any = await saveEvents(addEventObj);
  //     if (res?.status) {
  //       const serverId = String(res?.body?.eventId ?? "");
  //       setLoadingProgress(100);
  //       setIsSaveEvent(true);
  //       setTimeout(() => setLoadingProgress(0), 100);

  //     } else {
  //       setMessage("Failed to add event: " + (res.message || ""));
  //     }

  //   } catch (error) {
  //     console.error("Error inserting event:", error);
  //     setMessage("Something went wrong!");
  //   }
  //   setNewEvent((prev) => ({
  //     name: "",
  //     startDate: "",
  //     endDate: "",
  //     category: "conferences",
  //     country: prev.country,
  //     city: prev.city,
  //     description: "",
  //   }));
  //   // setNewEvent({
  //   //   name: "",
  //   //   startDate: "",
  //   //   endDate: "",
  //   //   category: "conferences",
  //   //   country: "",
  //   //   city: "",
  //   //   description: "",
  //   // })
  //   // setNewEventCountry("")
  //   // setNewEventCity("")

  //   setIsStartDateOpen(false)
  //   setIsEndDateOpen(false)
  //   setDescriptionError("")
  //   setIsAddEventOpen(false)
  // }



  const getEventsForDate = useCallback((day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return filteredEvents.filter((event) => {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      const checkDate = new Date(dateStr + "T00:00:00")
      return checkDate >= eventStart && checkDate <= eventEnd
    })
  }, [currentDate, filteredEvents])

  // Get events for calendar display - show events on all days from start to end date
  const getEventsForCalendarDisplay = useCallback((day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return filteredEvents.filter((event) => {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      const checkDate = new Date(dateStr + "T00:00:00")

      // Show events on all days from start to end date (inclusive)
      return checkDate >= eventStart && checkDate <= eventEnd
    })
  }, [currentDate, filteredEvents])

  // const getEventsForSelectedDate = () => {
  //   if (!selectedDate) return []
  //   const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
  //   return filteredEvents.filter((event) => {
  //     const eventStart = new Date(event.startDate)
  //     const eventEnd = new Date(event.endDate)
  //     const checkDate = new Date(dateStr + "T00:00:00")
  //     return checkDate >= eventStart && checkDate <= eventEnd
  //   })
  // }

  const getEventsForSelectedDate = useCallback(() => {
    if (!selectedDate) return []
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    return filteredEvents.filter((event) => {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      const checkDate = new Date(dateStr + "T00:00:00")
      return checkDate >= eventStart && checkDate <= eventEnd
    });
    // if (!selectedDate) return [];

    // const checkDate = new Date(selectedDate);
    // checkDate.setHours(0, 0, 0, 0); // normalize date to ignore time

    // return events.filter(event => {
    //   const start = new Date(event.startDate);
    //   const end = new Date(event.endDate);
    //   start.setHours(0, 0, 0, 0);
    //   end.setHours(0, 0, 0, 0);

    //   return checkDate >= start && checkDate <= end;
    // });
  }, [filteredEvents, selectedDate]);




  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(clickedDate)
    setIsDayViewOpen(true)
  }

  // Get event duration text for multi-day events
  const getEventDurationText = (event: Event) => {
    if (event.startDate === event.endDate) return ""

    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    return ` (${diffDays} days)`
  }

  const getStatusColor = (status: Event["status"]) => {
    switch (status) {
      case "bookmarked":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800 hover:bg-blue-400 hover:text-white hover:border-blue-400 dark:hover:bg-blue-400 dark:hover:text-white dark:hover:border-blue-400 transition-colors cursor-default"
      case "suggested":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 hover:bg-blue-400 hover:text-white hover:border-blue-400 dark:hover:bg-blue-400 dark:hover:text-white dark:hover:border-blue-400 transition-colors cursor-default"
      case "available":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800 hover:bg-blue-400 hover:text-white hover:border-blue-400 dark:hover:bg-blue-400 dark:hover:text-white dark:hover:border-blue-400 transition-colors cursor-default"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800 hover:bg-blue-400 hover:text-white hover:border-blue-400 dark:hover:bg-blue-400 dark:hover:text-white dark:hover:border-blue-400 transition-colors cursor-default"
    }
  }

  const getEventTypeColor = (event: Event) => {
    if (event.status === "bookmarked") return "bg-green-500"
    if (event.type === "holiday") return "bg-purple-500"
    if (event.status === "suggested") return "bg-blue-500"
    return "bg-gray-500"
  }

  // Get category icon for events
  const getCategoryIcon = (event: Event) => {
    switch (event.type) {
      case "holiday":
        return <Sparkles className="h-2 w-2" />
      case "business":
      case "conferences":
        return <Briefcase className="h-2 w-2" />
      case "sports":
        return <Trophy className="h-2 w-2" />
      case "festival":
      case "social":
        return <Music className="h-2 w-2" />
      default:
        if (event.category === "business") return <Briefcase className="h-2 w-2" />
        if (event.category === "social") return <Heart className="h-2 w-2" />
        return <CalendarIcon className="h-2 w-2" />
    }
  }

  // Get event background color and border based on type/status
  const getEventBgColor = (event: Event) => {
  // Priority order: holiday + bookmarked > bookmarked > holiday > suggested > default

  if (event.type === "holiday" && event.status === "bookmarked") {
    return "bg-gradient-to-r from-purple-50 to-purple-25 text-purple-700 border border-purple-200 border-l-4 border-l-purple-500 shadow-sm dark:from-purple-900 dark:to-purple-800 dark:text-purple-300 dark:border-purple-600 dark:border-l-purple-400";
  }

  if (event.status === "bookmarked") {
    return "bg-gradient-to-r from-green-50 to-green-25 text-green-700 border border-green-200 border-l-4 border-l-green-500 shadow-sm dark:from-green-900 dark:to-green-800 dark:text-green-300 dark:border-green-600 dark:border-l-green-400";
  }

  if (event.type === "holiday") {
    return "bg-gradient-to-r from-yellow-50 to-yellow-25 text-yellow-700 border border-yellow-200 border-l-4 border-l-yellow-500 shadow-sm dark:from-yellow-900 dark:to-yellow-800 dark:text-yellow-300 dark:border-yellow-600 dark:border-l-yellow-400";
  }

  if (event.status === "suggested") {
    return "bg-gradient-to-r from-blue-50 to-blue-25 text-blue-700 border border-blue-200 border-l-4 border-l-blue-500 shadow-sm dark:from-blue-900 dark:to-blue-800 dark:text-blue-300 dark:border-blue-600 dark:border-l-blue-400";
  }

  return "bg-gradient-to-r from-gray-50 to-gray-25 text-gray-700 border border-gray-200 border-l-4 border-l-gray-400 shadow-sm dark:from-gray-800 dark:to-gray-700 dark:text-gray-300 dark:border-gray-600 dark:border-l-gray-500";
};

  // const getEventBgColor = (event: Event) => {
  //   // Priority order: bookmarked > holiday > suggested > default
  //   if (event.status === "bookmarked") return "bg-gradient-to-r from-green-50 to-green-25 text-green-700 border border-green-200 border-l-4 border-l-green-500 shadow-sm dark:from-green-900 dark:to-green-800 dark:text-green-300 dark:border-green-600 dark:border-l-green-400"
  //   if (event.type === "holiday") return "bg-gradient-to-r from-purple-50 to-purple-25 text-purple-700 border border-purple-200 border-l-4 border-l-purple-500 shadow-sm dark:from-purple-900 dark:to-purple-800 dark:text-purple-300 dark:border-purple-600 dark:border-l-purple-400"
  //   if (event.status === "suggested") return "bg-gradient-to-r from-blue-50 to-blue-25 text-blue-700 border border-blue-200 border-l-4 border-l-blue-500 shadow-sm dark:from-blue-900 dark:to-blue-800 dark:text-blue-300 dark:border-blue-600 dark:border-l-blue-400"
  //   return "bg-gradient-to-r from-gray-50 to-gray-25 text-gray-700 border border-gray-200 border-l-4 border-l-gray-400 shadow-sm dark:from-gray-800 dark:to-gray-700 dark:text-gray-300 dark:border-gray-600 dark:border-l-gray-500"
  // }

  // Check if event spans multiple days
  const isMultiDayEvent = (event: Event) => {
    return event.startDate !== event.endDate
  }

  // Calculate event duration in days (total number of event days)
  const getEventDuration = (event: Event) => {
    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)
    const diffTime = endDate.getTime() - startDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 to include both start and end dates
    return diffDays
  }



  // Get all multi-day events that should be displayed for the current day
  const getMultiDayEventsForDay = (day: number) => {
    const dayEvents = getEventsForCalendarDisplay(day)
    return dayEvents.filter(event => isMultiDayEvent(event))
  }

  // Filter events for bookmark modal
  const ALL_TYPES = ["bookmarked", "available"];

  const getFilteredBookmarkEvents = useMemo(() => {
    // Deduplicate events by eventId
    const seen = new Set();
    let filtered = events.filter(event => {
      if (seen.has(event.eventId)) return false;
      seen.add(event.eventId);
      return true;
    });

    // Apply bookmark search filter
    if (bookmarkSearchQuery) {
      const searchLower = bookmarkSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          (event.name?.toLowerCase() || "").includes(searchLower) ||
          (event.description?.toLowerCase() || "").includes(searchLower)
      );
    }


    // Apply category filter
    if (!bookmarkCategoryFilter.includes("all")) {
      filtered = filtered.filter((event) =>
        bookmarkCategoryFilter.some(category => {
          if (category === "social" || category === "business") {
            return event.category === category;
          } else if (category === "holidays") {
            return event.type === "holiday";
          } else {
            return event.type === category;
          }
        })
      );
    }

    // Apply type filter
    const selectedTypes = bookmarkTypeFilter.filter(t => t !== "all");
    if (selectedTypes.length === 0) {
      return [];
    } else {
      filtered = filtered.filter((event) => {
        const conditionMap: Record<string, (event: any) => boolean> = {
          bookmarked: (event) =>
            (event.status === "bookmarked" && event.type === "holiday") || event.status === "bookmarked",

          available: (event) =>
            (event.status === "available" && event.type === "holiday") ||
            (event.status === "holidays" && event.type === "holiday") || event.status === "available",



          suggested: (event) =>
            event.category?.toLowerCase() === "social",
        };

        return selectedTypes.some(type =>
          conditionMap[type] ? conditionMap[type](event) : event.type === type
        );
      });
    }

    // const selectedTypes = bookmarkTypeFilter.filter(t => t !== "all");
    // if (selectedTypes.length === 0) {
    //   return [];
    // } else {
    //   filtered = filtered.filter((event) => {
    //     return selectedTypes.some((type) => {
    //       switch (type) {
    //         case "bookmarked":
    //           return event.status === "bookmarked"; // actual bookmarks
    //         case "holidays":
    //           return event.type === "holiday"; // holidays
    //         case "suggested":
    //           return event.category === "social"; // social events count as suggested
    //         case "available":
    //           return event.status === "available";
    //         default:
    //           return event.type === type; // fallback for other types
    //       }
    //     });
    //   });
    // }

    // ✅ sort the filtered array, not the Set
    return filtered.sort((a, b) => {
      const aIsBookmarked = a.status === "bookmarked" ? 1 : 0;
      const bIsBookmarked = b.status === "bookmarked" ? 1 : 0;

      if (bIsBookmarked - aIsBookmarked !== 0) {
        return bIsBookmarked - aIsBookmarked; // Bookmarked first
      }

      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime(); // Then by date
    });

  }, [events, bookmarkSearchQuery, bookmarkCategoryFilter, bookmarkTypeFilter]);


  const groupedBookmarkEvents = useMemo(() => {
    return getFilteredBookmarkEvents.reduce((acc, event) => {
      const date = new Date(event.startDate).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(event);
      return acc;
    }, {} as Record<string, Event[]>);
  }, [getFilteredBookmarkEvents]);

  // Handle category selection with multi-select logic
  const handleCategorySelection = (category: string) => {
    setBookmarkCategoryFilter(prev => {
      if (category === "all") {
        // If selecting "All", toggle between all selected and all unselected
        if (prev.includes("all")) {
          return [] // Unselect all
        } else {
          return ["all", "conferences", "tradeshow", "workshop", "social", "holidays"] // Select all
        }
      }

      const isSelected = prev.includes(category)
      let newSelection: string[]

      if (isSelected) {
        // Remove the category and "all" if present
        newSelection = prev.filter(c => c !== category && c !== "all")
      } else {
        // Add the category, keeping other selected categories
        const filteredPrev = prev.filter(c => c !== "all")
        newSelection = [...filteredPrev, category]

        // If all individual categories are now selected, add "all"
        const allCategories = ["conferences", "tradeshow", "workshop", "social", "holidays"]
        if (newSelection.length === allCategories.length && allCategories.every(cat => newSelection.includes(cat))) {
          newSelection = ["all", ...newSelection]
        }
      }

      return newSelection
    })
  }

  // Get display text for bookmark category filter
  const getBookmarkCategoryDisplayText = () => {
    const nonAllCategories = bookmarkCategoryFilter.filter(c => c !== "all")
    if (bookmarkCategoryFilter.includes("all") || nonAllCategories.length === 5) {
      return "All Categories"
    }
    if (bookmarkCategoryFilter.length === 1) {
      const category = bookmarkCategoryFilter[0]
      if (category === "holidays") return "Holidays"
      if (category === "tradeshow") return "Trade Shows"
      return category.charAt(0).toUpperCase() + category.slice(1)
    }
    return `${nonAllCategories.length} Categories`
  }

  // Handle type selection with multi-select logic

  const handleTypeSelection = (type: string) => {
    setBookmarkTypeFilter(prev => {
      let newSelection = [...prev];

      if (type === "all") {
        // Toggle "all"
        if (prev.includes("all")) return []; // Unselect all
        return ["all", ...ALL_TYPES]; // Select all
      }

      if (prev.includes(type)) {
        // Remove the type
        newSelection = newSelection.filter(t => t !== type);
      } else {
        // Add the type
        newSelection.push(type);
      }

      // Remove "all" if not all individual types are selected
      const individualSelected = newSelection.filter(t => ALL_TYPES.includes(t));
      if (individualSelected.length === ALL_TYPES.length) {
        newSelection = ["all", ...ALL_TYPES]; // Select all if all selected
      } else {
        newSelection = [...individualSelected]; // Only keep actually selected types
      }
      return newSelection;
    });
  };

  //   const handleTypeSelection = (type: string) => {

  //     setBookmarkTypeFilter(prev => {
  //       if (type === "all") {
  //         // If selecting "All", toggle between all selected and all unselected
  //         if (prev.includes("all")) {
  //           return [] // Unselect all
  //         } else {
  //           return ["all", "bookmarked", "holiday", "suggested", "available"] // Select all
  //         }
  //       }

  //       const isSelected = prev.includes(type)
  //       let newSelection: string[]

  //       if (isSelected) {
  //         // Remove the type and "all" if present
  //         newSelection = prev.filter(t => t !== type && t !== "all")
  //       } else {
  //         // Add the type and remove "all" if present
  //         newSelection = prev.filter(t => t !== "all")
  //         newSelection = [...newSelection, type]

  //         // If all individual types are now selected, add "all"
  //         if (newSelection.length === 4) {
  //           newSelection = ["all", ...newSelection]
  //         }
  //       }
  //       console.log("Updated bookmarkTypeFilter:", newSelection);
  //       return newSelection
  //     })
  //   }

  // Get display text for bookmark type filter
  const getBookmarkTypeDisplayText = () => {
    //const allTypes = ["bookmarked", "holiday", "suggested", "available"];

    // If "all" or all individual types are selected → All Events
    if (bookmarkTypeFilter.includes("all") || ALL_TYPES.every(t => bookmarkTypeFilter.includes(t))) {
      return "All Events";
    }

    // Exclude "all"
    const selected = bookmarkTypeFilter.filter(t => t !== "all");

    if (selected.length === 0) return "Select Type";

    if (selected.length === 1) return selected[0].charAt(0).toUpperCase() + selected[0].slice(1);

    if (selected.length === 3) {
      const missing = ALL_TYPES.find(t => !selected.includes(t));
      return missing ? missing.charAt(0).toUpperCase() + missing.slice(1) : "All Events";
    }

    return `${selected.length} Types`;
  };

  //   const getBookmarkTypeDisplayText = () => {

  //   if (bookmarkTypeFilter.includes("all") || bookmarkTypeFilter.length === 4) {
  //     return "All Events"
  //   }
  //   if (bookmarkTypeFilter.length === 1) {
  //     const type = bookmarkTypeFilter[0]
  //     if (type === "bookmarked") return "Bookmarked"
  //     if (type === "holidays") return "Holidays"
  //     if (type === "suggested") return "Suggested"
  //     if (type === "available") return "Available"
  //     const missing = bookmarkTypeFilter.find(t => !type.includes(t));
  //   return missing ? missing.charAt(0).toUpperCase() + missing.slice(1) : "All Events";
  //    // return type.charAt(0).toUpperCase() + type.slice(1)
  //   }
  //   return `${bookmarkTypeFilter.length} Types`
  // }

  const renderCalendarDays = () => {

    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Get all multi-day events for this month
    const multiDayEvents = filteredEvents.filter(event => isMultiDayEvent(event))

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-[89px] sm:h-[110px] border border-border/30 bg-muted/30"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForCalendarDisplay(day)
      const singleDayEvents = dayEvents.filter(event => !isMultiDayEvent(event))
      const multiDayEventsForThisDay = dayEvents.filter(event => isMultiDayEvent(event))

      // Limit to maximum 1 event per cell
      const totalEvents = [...multiDayEventsForThisDay, ...singleDayEvents]
      const limitedEvents = totalEvents.slice(0, 1)
      const limitedMultiDayEvents = limitedEvents.filter(event => isMultiDayEvent(event))
      const limitedSingleDayEvents = limitedEvents.filter(event => !isMultiDayEvent(event))
      const hasMoreEvents = totalEvents.length > 1

      // Enhanced today detection with Call Today's New Logic
      const today = new Date()
      const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const cellDateNormalized = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate())
      const isToday = todayNormalized.getTime() === cellDateNormalized.getTime()

      days.push(
        <div
          key={day}
          data-today={isToday}
          className={cn(
            "h-[89px] sm:h-[110px] border border-border bg-card p-1 sm:p-1.5 hover:bg-accent/50 transition-all cursor-pointer group relative",
            isToday && "border-2 border-blue-500 bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/50 dark:to-blue-900/30 shadow-lg ring-1 ring-blue-200 dark:ring-blue-800",
            dayEvents.length > 0 && "hover:shadow-md",
          )}
          onClick={() => handleDateClick(day)}
        >
          {/* Day number */}
          <div
            className={cn(
              "font-semibold text-sm mb-0 flex items-center justify-between",
              isToday ? "text-blue-700 dark:text-blue-300" : "text-foreground",
            )}
          >
            <span
              className={cn(
                "w-6 h-6 flex items-center justify-center rounded-full transition-all",
                isToday && "bg-blue-500 text-white font-bold animate-pulse shadow-md ring-2 ring-blue-300",
              )}
            >
              {day}
            </span>


          </div>

          {/* Events container - Show only 1 event per cell */}
          <div className="relative mt-1">
            {/* Render only 1 event with consistent absolute positioning */}
            {limitedEvents.map((event, index) => (
              <EventTooltip
                key={`${event.id}-${day}`}
                event={event}
                isVisible={hoveredEvent === `${event.id}-${day}`}
                day={day}
                currentDate={currentDate}
              >
                <div
                  className={cn(
                    "text-[11px] px-1 py-0.5 cursor-pointer hover:shadow-lg transition-all absolute z-20 min-h-[26px] flex flex-col justify-center",
                    getEventBgColor(event)
                  )}
                  style={{
                    top: "-6px",
                    left: "2px",
                    right: "2px",
                    borderRadius: "5px"
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedEvent(event)
                  }}
                  onMouseEnter={() => setHoveredEvent(`${event.id}-${day}`)}
                  onMouseLeave={() => setHoveredEvent(null)}
                >
                  <div className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[11px] truncate">{event.name}</div>
                    </div>

                  </div>
                </div>
              </EventTooltip>
            ))}

            {/* Show +N more indicator in next row if there are more events */}
            {hasMoreEvents && (
              <div
                className="text-[11px] font-semibold px-1 py-0.5 cursor-pointer hover:shadow-sm transition-all flex items-center gap-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 min-h-[26px] justify-center absolute z-20"
                style={{
                  top: "42px",
                  left: "2px",
                  right: "2px",
                  borderRadius: "5px"
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDateClick(day)
                }}
              >
                <Plus className="h-2 w-2" />
                <span>{totalEvents.length - 1} more</span>
              </div>
            )}
          </div>
        </div>,
      )
    }

    return days
  }

  // Filter events for the currently selected month
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // const monthFilteredEvents = filteredEvents.filter(event => {
  //   const eventDate = new Date(event.startDate)
  //   return eventDate.getFullYear() === currentYear && eventDate.getMonth() === currentMonth
  // })

  const monthFilteredEvents = useMemo(() => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getFullYear() === currentYear && eventDate.getMonth() === currentMonth;
    });
  }, [filteredEvents, currentYear, currentMonth]);


  // Group events by date
  // const groupedEvents = monthFilteredEvents.reduce(
  //   (acc, event) => {
  //     const date = new Date(event.startDate).toDateString()
  //     if (!acc[date]) acc[date] = []
  //     acc[date].push(event)
  //     return acc
  //   },
  //   {} as Record<string, Event[]>,
  // )

  const groupedEvents = useMemo(() => {
    return monthFilteredEvents.reduce((acc, event) => {
      const date = new Date(event.startDate).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(event);
      return acc;
    }, {} as Record<string, Event[]>);
  }, [monthFilteredEvents]);

  const renderEventsList = () => {


    return (
      <Card className="overflow-hidden">
        <div className="relative">
          {/* Fixed Table Header */}
          <div className="sticky top-0 z-10 bg-background border-b">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-muted-foreground">
              <div className="col-span-6">Event Name</div>
              <div className="col-span-2 text-left">Date Range</div>
              <div className="col-span-2 text-left">Category</div>
              <div className="col-span-2">Actions</div>
            </div>
          </div>

          {/* Scrollable Table Body */}
          <div className="max-h-[60vh] overflow-y-auto">
            {monthFilteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-medium text-foreground mb-2">No events found</h3>
                <p className="text-sm text-muted-foreground">
                  No events found for {monthNames[currentMonth]} {currentYear}
                </p>
              </div>
            ) : (
              <div>
                {Object.entries(groupedEvents).map(([date, eventsForDate]) => (
                  <div key={date}>
                    {/* Date Row */}
                    <div className="bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800 px-4 py-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          {formatListHeader(date)}
                        </span>
                        <button
                          className="text-xs text-blue-600 dark:text-blue-400 ml-12 hover:text-blue-800 dark:hover:text-blue-200 transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            const clickedDate = new Date(date)
                            setSelectedDate(clickedDate)
                            setIsDayViewOpen(true)
                          }}
                          title="Click to view all events on this date"
                        >
                          {eventsForDate.length} event{eventsForDate.length !== 1 ? 's' : ''}
                        </button>
                      </div>
                    </div>

                    {/* Events for this date */}
                    <div className="divide-y divide-border">
                      {eventsForDate.map((event) => (
                        <div
                          key={event.id}
                          className="grid grid-cols-12 gap-4 px-4 py-3 cursor-pointer items-center"
                          onClick={() => setSelectedEvent(event)}
                        >
                          {/* Event Name */}
                          <div className="col-span-6">
                            <h3 className="text-sm font-medium text-foreground truncate mb-1" title={event.name}>
                              {event.name}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {event.description}
                            </p>
                          </div>

                          {/* Date Range */}
                          <div className="col-span-2 text-left">
                            <div className="text-xs text-muted-foreground">
                              {event.startDate === event.endDate ? (
                                <div className="flex flex-col items-start">
                                  <span>Single day</span>
                                  <span className="text-xs font-medium">
                                    {formatSingleDate(event.startDate)}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-start">
                                  <span>Multi-day</span>
                                  <span className="text-xs font-medium">
                                    {formatDateRange(event.startDate, event.endDate)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Type */}
                          <div className="col-span-2 flex justify-start">
                            <Badge
                              variant="secondary"
                              className="text-xs px-2 py-1 capitalize"
                            >
                              {event.type}
                            </Badge>
                          </div>

                          {/* Actions */}
                          <div className="col-span-2 flex justify-start gap-1">
                            {/* Bookmark button */}
                            <div className="relative group">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleBookmark(event.eventId, `${selectedProperty?.sid}`)
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <BookmarkIcon
                                  className={cn("h-4 w-4", (event.status === "bookmarked" || event.status === "suggested") ? "fill-current text-green-600" : "")}
                                />
                              </Button>
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                {(event.status === "bookmarked" || event.status === "suggested") ? "Remove Bookmark" : "Bookmark Event"}
                              </div>
                            </div>



                            {/* Edit and Delete buttons for custom events */}
                            {event.isCustom && (
                              <>
                                <div className="relative group">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEditEvent(event)
                                    }}
                                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    Edit
                                  </div>
                                </div>

                                <div className="relative group">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      showDeleteConfirmation(event.eventId)
                                    }}
                                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    Delete
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }
  function FlagOrInitial({ option }: any) {
    const [hasError, setHasError] = useState(false);

    const getInitials = (label: string): string => {
      if (!label) return "";

      const words = label.trim().split(" ");
      if (words.length >= 2) {
        return (
          (words[0][0] || "").toUpperCase() +
          (words[1][0] || "").toUpperCase()
        );
      } else {
        return label.slice(0, 2).toUpperCase();
      }
    };

    return !hasError ? (
      <img
        className="text-sm mr-2"
        src={option?.flag}
        alt={option?.label}
        width="20"
        height="20"
        onError={() => setHasError(true)}
      />
    ) : (
      <span className="text-sm mr-2">
        {getInitials(option.label)}
      </span>
    );
  }
  function bookMarkDialogClose(): void {
    setIsBookmarkModalOpen(false);
    setBookmarkSearchQuery("");
    setBookmarkCategoryFilter(["all", "conferences", "tradeshow", "workshop", "social", "holidays"]);
    setBookmarkTypeFilter(["all", "bookmarked", "holiday", "suggested", "available"]);
    fetchAllData();
  }
  // Show loading state when data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
        <GlobalProgressBar />
        <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8 xl:py-10">
          <div className="max-w-7xl xl:max-w-none mx-auto">
            <LoadingSkeleton type="events" showCycleCounter={true} />
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
      {/* Enhanced Header */}
      <div className="bg-background border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 w-full sm:w-auto">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {/* <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")} 
                        className="hover:bg-primary/10"> */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigateMonth("prev")}
                          className="hover:bg-primary/10"
                          disabled={isPrevDisabled(currentDate)}
                        >
                          {/* <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigateMonth("prev")}
                          className="hover:bg-primary/10"
                          disabled={
                            currentDate.getFullYear() === getDateRestrictions().minYear &&
                            currentDate.getMonth() === getDateRestrictions().minMonth
                          }
                        > */}
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-slate-800 text-white border-slate-700">
                        <p className="text-xs">Previous month</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Popover open={isMonthPickerOpen} onOpenChange={setIsMonthPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-base font-medium text-foreground px-2 hover:bg-primary/10 transition-colors"
                      >
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0" align="center">
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                        {/* Month Picker Header */}
                        <div className="flex items-center justify-between px-3 py-2 border-b">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigateMonthPickerYear("prev")}
                            disabled={monthPickerYear <= getDateRestrictions().minYear}
                            className="h-7 w-7 p-0"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </Button>
                          <h3 className="text-base font-semibold">{monthPickerYear}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigateMonthPickerYear("next")}
                            disabled={monthPickerYear >= getDateRestrictions().maxYear}
                            className="h-7 w-7 p-0"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {/* Month Grid */}
                        <div className="grid grid-cols-3 gap-1.5 p-3">
                          {monthNames.map((month, index) => {
                            const isSelectable = isMonthSelectable(index, monthPickerYear, selectedDate);
                            const isCurrentMonth =
                              index === (selectedDate ?? new Date()).getMonth() &&
                              monthPickerYear === (selectedDate ?? new Date()).getFullYear();

                            const isToday =
                              index === new Date().getMonth() &&
                              monthPickerYear === new Date().getFullYear();

                            return (
                              <Button
                                key={month}
                                variant={isCurrentMonth ? "default" : "ghost"}
                                size="sm"
                                onClick={() => isSelectable && navigateToMonth(index, monthPickerYear)}
                                disabled={!isSelectable}
                                className={cn(
                                  "h-9 text-xs font-medium transition-all",
                                  isCurrentMonth && "bg-primary text-primary-foreground",
                                  isToday && !isCurrentMonth && "ring-1 ring-primary ring-opacity-50",
                                  !isSelectable && "opacity-40 cursor-not-allowed",
                                  isSelectable && !isCurrentMonth && "hover:bg-primary/10"
                                )}
                              >
                                {month}
                              </Button>
                            )
                          })}
                          {/* {monthNames.map((month, index) => {
                            const isSelectable = isMonthSelectable(index, monthPickerYear)
                            const isCurrentMonth = index === currentDate.getMonth() && monthPickerYear === currentDate.getFullYear()
                            const isToday = index === new Date().getMonth() && monthPickerYear === new Date().getFullYear()

                            return (
                              <Button
                                key={month}
                                variant={isCurrentMonth ? "default" : "ghost"}
                                size="sm"
                                onClick={() => isSelectable ? navigateToMonth(index, monthPickerYear) : undefined}
                                disabled={!isSelectable}
                                className={cn(
                                  "h-9 text-xs font-medium transition-all",
                                  isCurrentMonth && "bg-primary text-primary-foreground",
                                  isToday && !isCurrentMonth && "ring-1 ring-primary ring-opacity-50",
                                  !isSelectable && "opacity-40 cursor-not-allowed",
                                  isSelectable && !isCurrentMonth && "hover:bg-primary/10"
                                )}
                              >
                                {month}
                              </Button>
                            )
                          })} */}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {/* <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")} className="hover:bg-primary/10"> */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigateMonth("next")}
                          className="hover:bg-primary/10"
                          disabled={isNextDisabled(currentDate)}
                        >
                          {/* <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigateMonth("next")}
                          className="hover:bg-primary/10"
                          disabled={
                            currentDate.getFullYear() === getDateRestrictions().maxYear &&
                            currentDate.getMonth() === getDateRestrictions().maxMonth
                          }
                        > */}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-slate-800 text-white border-slate-700">
                        <p className="text-xs">Next month</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Country Dropdown */}
                <div className="shrink-0">
                  <Popover open={isCountryOpen} onOpenChange={(open) => {
                    setIsCountryOpen(open)
                    if (!open) {
                      setCountrySearchQuery("") // Clear search when closing
                      setIsCountrySearchFocused(false) // Reset focus state
                    }
                  }}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 min-w-0 max-w-[180px]"
                      >
                        <span className="text-lg shrink-0">
                          {/* <img src={getCountryFlag()} className="w-5 h-5 rounded-full" /> */}
                          <FlagOrInitial option={countryList.find(option => option.label === selectedCountry)} />
                        </span>
                        <span className="truncate max-w-[100px] font-semibold">
                          {selectedCountry}
                        </span>
                        <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[60]" align="start">
                      <div className="flex">
                        {/* Country Options Sidebar */}
                        <div className="w-56 p-4">
                          <h4 className="font-semibold text-sm text-gray-700 mb-3">Select Country</h4>
                          <Input
                            placeholder="Search"
                            value={countrySearchQuery}
                            onChange={(e) => setCountrySearchQuery(e.target.value)}
                            className="mb-3 h-8 text-sm border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-gray-300 dark:focus:border-gray-600"
                            autoFocus={false}
                            onClick={(e) => {
                              e.stopPropagation() // Prevent event bubbling to parent popover
                              setIsCountrySearchFocused(true)
                              // if (e.target instanceof HTMLInputElement) {
                              //   e.target.focus()
                              // }
                              e.currentTarget.focus()
                            }}
                            onFocus={() => setIsCountrySearchFocused(true)}
                            onBlur={() => setIsCountrySearchFocused(false)}
                          />
                          <ScrollArea className={cn(
                            "space-y-1",
                            filteredCountryOptions.length > 8 ? "h-64" : "h-auto"
                          )}>
                            <div className="space-y-1 pr-3">
                              {filteredCountryOptions.map((option) => (
                                <Button
                                  key={option.id}
                                  variant={selectedCountry === option.label ? "default" : "ghost"}
                                  size="sm"
                                  className="w-full justify-start text-left h-auto py-2 px-3"
                                  onClick={() => handleCountrySelect(option.label)}
                                >
                                  {/* <img className="text-sm mr-2" src={option.flag} alt={option.label} width="20" height="20" /> */}
                                  <FlagOrInitial option={option} />
                                  <span className={cn(
                                    "text-sm font-medium",
                                    selectedCountry === option.label ? "text-white" : "text-foreground"
                                  )}>
                                    {option.label}
                                  </span>
                                </Button>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* City Dropdown */}
                <div className="shrink-0">
                  <Popover open={isCityOpen} onOpenChange={(open) => {
                    setIsCityOpen(open)
                    if (!open) {
                      setCitySearchQuery("") // Clear search when closing
                      setIsCitySearchFocused(false) // Reset focus state
                    }
                  }}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 min-w-0 max-w-[160px]"
                      >
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate max-w-[80px] font-semibold">
                          {getCityDisplayText()}
                        </span>
                        <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[60]" align="start">
                      <div className="flex">
                        {/* City Options Sidebar */}
                        <div className="w-44 p-4">
                          <h4 className="font-semibold text-sm text-gray-700 mb-3">Select City</h4>
                          <Input
                            placeholder="Search"
                            value={citySearchQuery}
                            onChange={(e) => setCitySearchQuery(e.target.value)}
                            className="mb-3 h-8 text-sm border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-gray-300 dark:focus:border-gray-600"
                            autoFocus={false}
                            onClick={(e) => {
                              e.stopPropagation() // Prevent event bubbling to parent popover
                              setIsCitySearchFocused(true)
                              // if (e.target instanceof HTMLInputElement) {
                              //   e.target.focus()
                              // }
                              e.currentTarget.focus()
                            }}
                            onFocus={() => setIsCitySearchFocused(true)}
                            onBlur={() => setIsCitySearchFocused(false)}
                          />
                          <ScrollArea className={cn(
                            "space-y-1",
                            filteredCityOptions.length > 8 ? "h-64" : "h-auto"
                          )}>
                            <div className="space-y-1">
                              {/* All Cities Option - Only show when not searching */}
                              {!citySearchQuery && (
                                <label className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={isCityChecked("All")}
                                    onChange={() => handleCitySelect("All")}
                                    className="rounded h-3.5 w-3.5"
                                  />
                                  <span className="font-medium">All</span>
                                </label>
                              )}
                              {filteredCityOptions.map((option) => (
                                <label
                                  key={option.id}
                                  className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-sm"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isCityChecked(option.label)}
                                    onChange={() => handleCitySelect(option.label)}
                                    className="rounded h-3.5 w-3.5"
                                  />
                                  <span className="font-medium">
                                    {option.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Category Dropdown */}
                <div className="shrink-0">
                  <DropdownMenu open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 min-w-0 max-w-[180px]"
                      >
                        <Globe className="w-4 h-4 shrink-0" />
                        <span className="truncate max-w-[100px] font-semibold">
                          {getCategoryDisplayText()}
                        </span>
                        <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-auto p-0 shadow-xl border-slate-200 dark:border-slate-700 z-[60]">
                      <div className="flex">
                        <div className="w-56 p-4">
                          <h4 className="font-semibold text-sm text-gray-700 mb-3">Select Category</h4>
                          <div className="space-y-1">
                            {categoryData?.map((option) => (
                              <label
                                key={option.id}
                                className="py-2 px-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm flex items-center cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-0 focus:outline-none mr-3 cursor-pointer"
                                  checked={isMainCategoryChecked(option.name)}
                                  onChange={() => handleCategorySelect(option.name)}
                                />
                                <option.icon className={`w-4 h-4 mr-2 ${option.color}`} />
                                <span className="font-medium text-sm flex-1">
                                  {option.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>


            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">

              {/* Bookmark Event Button */}
              <Dialog open={isBookmarkModalOpen} onOpenChange={setIsBookmarkModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="px-4 gap-3 bg-green-50 hover:bg-green-100 border-green-300 text-green-700 dark:bg-green-950 dark:hover:bg-green-900 dark:border-green-800 dark:text-green-300"
                  >
                    <BookmarkIcon className="h-4 w-4 xl:inline hidden" />
                    <span className="xl:inline hidden">Bookmark Event</span>
                    <span className="xl:hidden inline">Bookmark</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[500px] min-h-[500px] flex flex-col">
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-3 text-lg">
                      <BookmarkIcon className="h-5 w-5 text-green-600" />
                      Bookmark Events
                    </DialogTitle>
                  </DialogHeader>

                  {/* Bookmark Modal Filters */}
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg flex-shrink-0">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search events to bookmark..."
                        value={bookmarkSearchQuery}
                        onChange={(e) => setBookmarkSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Event Category Dropdown */}
                    <div className="relative">
                      <DropdownMenu key={dropdownKey}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-48 h-10 justify-between text-sm hover:bg-white">
                            <div className="flex items-center gap-2">
                              <Globe className="h-3 w-3" />
                              <span>{getBookmarkCategoryDisplayText()}</span>
                            </div>
                            <ChevronDown className="h-3 w-3 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48 p-3">
                          <div className="space-y-1.5">
                            <label className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-white text-sm">
                              <input
                                type="checkbox"
                                checked={isCategoryChecked("all")}
                                onChange={() => handleCategorySelection("all")}
                                className="rounded h-3.5 w-3.5"
                              />
                              <span>All</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-white text-sm">
                              <input
                                type="checkbox"
                                checked={isCategoryChecked("conferences")}
                                onChange={() => handleCategorySelection("conferences")}
                                className="rounded h-3.5 w-3.5"
                              />
                              <Presentation className={`h-3.5 w-3.5 ${getCategoryColor("conferences")}`} />
                              <span>Conferences</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-white text-sm">
                              <input
                                type="checkbox"
                                checked={isCategoryChecked("tradeshow")}
                                onChange={() => handleCategorySelection("tradeshow")}
                                className="rounded h-3.5 w-3.5"
                              />
                              <Building className={`h-3.5 w-3.5 ${getCategoryColor("tradeshow")}`} />
                              <span>Trade Shows</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-white text-sm">
                              <input
                                type="checkbox"
                                checked={isCategoryChecked("workshop")}
                                onChange={() => handleCategorySelection("workshop")}
                                className="rounded h-3.5 w-3.5"
                              />
                              <GraduationCap className={`h-3.5 w-3.5 ${getCategoryColor("workshop")}`} />
                              <span>Workshop</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-white text-sm">
                              <input
                                type="checkbox"
                                checked={isCategoryChecked("social")}
                                onChange={() => handleCategorySelection("social")}
                                className="rounded h-3.5 w-3.5"
                              />
                              <PartyPopper className={`h-3.5 w-3.5 ${getCategoryColor("social")}`} />
                              <span>Social</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-white text-sm">
                              <input
                                type="checkbox"
                                checked={isCategoryChecked("holidays")}
                                onChange={() => handleCategorySelection("holidays")}
                                className="rounded h-3.5 w-3.5"
                              />
                              <Sparkles className={`h-3.5 w-3.5 ${getCategoryColor("holidays")}`} />
                              <span>Holidays</span>
                            </label>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Event Type Dropdown */}
                    <div className="relative">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-44 h-10 justify-between text-sm hover:bg-white">
                            <div className="flex items-center gap-2">
                              <Star className="h-3 w-3" />
                              <span>{getBookmarkTypeDisplayText()}</span>
                            </div>
                            <ChevronDown className="h-3 w-3 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48 p-3">
                          <div className="space-y-1.5">
                            <label className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-white text-sm">
                              <input
                                type="checkbox"
                                checked={isTypeChecked("all")}
                                onChange={() => handleTypeSelection("all")}
                                className="rounded h-3.5 w-3.5"
                              />
                              <span>All</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-white text-sm">
                              <input
                                type="checkbox"
                                checked={isTypeChecked("bookmarked")}
                                onChange={() => handleTypeSelection("bookmarked")}
                                className="rounded h-3.5 w-3.5"
                              />
                              <span>Bookmarked</span>
                            </label>
                            {/* <label className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-white text-sm">
                              <input
                                type="checkbox"
                                checked={isTypeChecked("holiday")}
                                onChange={() => handleTypeSelection("holiday")}
                                className="rounded h-3.5 w-3.5"
                              />
                              <span>Holidays</span>
                            </label> */}
                            {/* <label className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-white text-sm">
                              <input
                                type="checkbox"
                                checked={isTypeChecked("suggested")}
                                onChange={() => handleTypeSelection("suggested")}
                                className="rounded h-3.5 w-3.5"
                              />
                              <span>Suggested</span>
                            </label> */}

                            <label className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-white text-sm">
                              <input
                                type="checkbox"
                                checked={isTypeChecked("available")}
                                onChange={() => handleTypeSelection("available")}
                                className="rounded h-3.5 w-3.5"
                              />
                              <span>Available</span>
                            </label>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Events List */}
                  <ScrollArea className="flex-1 pr-2">
                    <div className="space-y-2 py-2">
                      {getFilteredBookmarkEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[20rem] text-center">
                          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                            <CalendarIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            No Events Selected
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                            Try adjusting your filters or search criteria to find the events you're looking for.
                          </p>
                        </div>
                      ) : (
                        getFilteredBookmarkEvents.map((event, index) => (
                          <div
                            key={`${event.eventId + "_" + index}`}
                            className={cn(
                              "flex items-center justify-between p-3 border rounded-lg",
                              (event.status === "bookmarked" || event.status === "suggested") && "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="flex items-start gap-2">
                                  {(() => {
                                    const eventCategory = getCategoryData(event)
                                    // console.log("Rendering:", {
                                    //   eventCategory: eventCategory?.id,
                                    //   color: eventCategory?.color,
                                    //   eventStatus: event.status,
                                    //   eventType: event.type,
                                    //   eventCategoryRaw: event.category,
                                    //   eventName: event.name,
                                    //   eventId: event.eventId,
                                    //   icon: `${eventCategory?.color}`
                                    // });
                                    if (eventCategory && eventCategory.id !== "all") {
                                      const IconComponent = eventCategory.icon
                                      return <IconComponent className={`h-3 w-3 ${eventCategory.color}`} />
                                    }
                                    return null
                                  })()}
                                  <div className="flex-1">
                                    <h3 className="text-sm font-medium leading-snug">{event.name}</h3>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>
                                    {event.startDate === event.endDate
                                      ? formatSingleDate(event.startDate)
                                      : formatDateRange(event.startDate, event.endDate)
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Removed all badges from bookmark popup */}

                              {/* Edit and Delete buttons for custom events */}
                              {event.isCustom && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      handleEditEvent(event)
                                      setIsBookmarkModalOpen(false)
                                    }}
                                    className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
                                    title="Edit Event"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => showDeleteConfirmation(event.eventId)}
                                    className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                                    title="Delete Event"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}

                              <Button
                                variant={event.status === "bookmarked" || event.status === "suggested" ? "default" : "outline"}
                                size="sm"
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  toggleBookmark(event.eventId, `${selectedProperty?.sid}`)
                                }}
                                className={cn(
                                  "px-3 gap-2 text-xs",
                                  event.status === "bookmarked" || event.status === "suggested"
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-950"
                                )}
                              >
                                <BookmarkIcon
                                  className={cn("h-3 w-3", (event.status === "bookmarked" || event.status === "suggested") && "fill-current")}
                                />
                                {event.status === "bookmarked" || event.status === "suggested" ? "Bookmarked" : "Bookmark"}
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>

                  <div className="flex items-center justify-between pt-3 border-t flex-shrink-0">
                    <div className="text-xs text-muted-foreground">
                      {/* {events.filter((e) => e.status === "bookmarked").length} events bookmarked */}
                      {
                        getFilteredBookmarkEvents.filter(
                          (e) => e.status?.toLowerCase() === "bookmarked"
                        ).length
                      }{" "}
                      events bookmarked
                    </div>
                    <Button onClick={() => bookMarkDialogClose()} className="px-4 py-2 text-sm">Done</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="px-4 gap-3 bg-blue-600 hover:bg-blue-700 hover:text-white border-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:hover:text-white dark:border-blue-600 dark:text-white"
                  >
                    <Plus className="h-4 w-4 text-white xl:inline hidden" />
                    <span className="xl:inline hidden">Add Event</span>
                    <span className="xl:hidden inline">Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Create New Event
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Event Name *</Label>
                        <div className="relative">
                          <Input
                            id="name"
                            value={newEvent.name}
                            onChange={(e) => setNewEvent((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter event name"
                            className="mt-1 pr-12"
                            maxLength={35}
                          />
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                            {newEvent.name.length}/35
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <div className="mt-1">
                          <Select
                            value={newEvent.category}
                            onValueChange={(value) => setNewEvent((prev) => ({ ...prev, category: value as typeof newEvent.category }))}
                          >
                            <SelectTrigger className="w-full [&>svg]:hidden">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60" hideScrollButtons={true}>
                              <SelectItem
                                value="conferences"
                                className={cn(
                                  "flex items-center gap-2 cursor-pointer pl-3 [&>span:first-child]:hidden",
                                  newEvent.category === "conferences" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : ""
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <Presentation className={`h-4 w-4 ${getCategoryColor("conferences")}`} />
                                  <span>Conferences</span>
                                </div>
                              </SelectItem>
                              <SelectItem
                                value="tradeshow"
                                className={cn(
                                  "flex items-center gap-2 cursor-pointer pl-3 [&>span:first-child]:hidden",
                                  newEvent.category === "tradeshow" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : ""
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <Building className={`h-4 w-4 ${getCategoryColor("tradeshow")}`} />
                                  <span>Trade Shows</span>
                                </div>
                              </SelectItem>
                              <SelectItem
                                value="workshop"
                                className={cn(
                                  "flex items-center gap-2 cursor-pointer pl-3 [&>span:first-child]:hidden",
                                  newEvent.category === "workshop" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : ""
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <GraduationCap className={`h-4 w-4 ${getCategoryColor("workshop")}`} />
                                  <span>Workshop</span>
                                </div>
                              </SelectItem>
                              <SelectItem
                                value="social"
                                className={cn(
                                  "flex items-center gap-2 cursor-pointer pl-3 [&>span:first-child]:hidden",
                                  newEvent.category === "social" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : ""
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <PartyPopper className={`h-4 w-4 ${getCategoryColor("social")}`} />
                                  <span>Social</span>
                                </div>
                              </SelectItem>

                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="startDate">Start Date *</Label>
                        <div className="mt-1">
                          <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !newEvent.startDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newEvent.startDate ? (
                                  format(new Date(newEvent.startDate), "dd/MM/yyyy")
                                ) : (
                                  <span>dd/mm/yyyy</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={newEvent.startDate ? new Date(newEvent.startDate) : undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    const formattedDate = format(date, "yyyy-MM-dd")
                                    setNewEvent((prev) => {
                                      const newState = { ...prev, startDate: formattedDate }
                                      // Clear end date only if it's before the new start date (not equal)
                                      if (prev.endDate && new Date(prev.endDate) < date) {
                                        newState.endDate = ""
                                      }
                                      return newState
                                    })
                                    setIsStartDateOpen(false)
                                  }
                                }}
                                disabled={(date) => {
                                  // Disable all dates before today
                                  const today = new Date()
                                  today.setHours(0, 0, 0, 0) // Normalize to start of day
                                  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                                  return compareDate < today
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="endDate">End Date *</Label>
                        <div className="mt-1">
                          <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !newEvent.endDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newEvent.endDate ? (
                                  format(new Date(newEvent.endDate), "dd/MM/yyyy")
                                ) : (
                                  <span>dd/mm/yyyy</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={newEvent.endDate ? new Date(newEvent.endDate) : undefined}
                                defaultMonth={newEvent.startDate ? new Date(newEvent.startDate) : undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    const formattedDate = format(date, "yyyy-MM-dd")
                                    setNewEvent((prev) => ({ ...prev, endDate: formattedDate }))
                                    setIsEndDateOpen(false)
                                  }
                                }}
                                disabled={(date) => {
                                  // Disable all dates before today
                                  const today = new Date()
                                  today.setHours(0, 0, 0, 0) // Normalize to start of day
                                  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

                                  // If date is before today, disable it
                                  if (compareDate < today) return true

                                  // If there's a start date, also disable dates before start date
                                  if (newEvent.startDate) {
                                    const startDate = new Date(newEvent.startDate)
                                    const compareStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
                                    // Allow same date (>=) but disable dates before start date
                                    return compareDate < compareStartDate
                                  }

                                  return false
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>



                      <div>
                        <Label htmlFor="country">Country *</Label>
                        <div className="mt-1">
                          <Popover open={isCreateCountryOpen} onOpenChange={setIsCreateCountryOpen}>
                            <PopoverTrigger asChild>
                              <Button disabled
                                variant="outline"
                                role="combobox"
                                aria-expanded={isCreateCountryOpen}
                                className="w-full justify-between"
                              >

                                {newEventCountry ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">
                                      <FlagOrInitial option={countryList.find(option => option.label === newEventCountry)} />
                                      {/* {countryList.find(option => option.label === newEventCountry)?.flag} */}
                                    </span>
                                    <span>{newEventCountry}</span>
                                  </div>
                                ) : (
                                  "Select a country"
                                )}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" sideOffset={4}>
                              <Command className="max-h-[280px]">
                                <CommandInput placeholder="Search countries..." className="border-0" />
                                <CommandList className="max-h-[200px] overflow-y-scroll">
                                  <CommandEmpty>No country found.</CommandEmpty>
                                  <CommandGroup>
                                    {countryList.map((option) => (
                                      <CommandItem
                                        key={option.id}
                                        value={option.label}
                                        onSelect={(currentValue: string) => {
                                          handleNewEventCountrySelect(currentValue)
                                          setNewEventCountry(currentValue);
                                          setNewEvent((prev) => ({ ...prev, country: currentValue }));
                                          setIsCreateCountryOpen(false)
                                        }}
                                        className="flex items-center gap-2 cursor-pointer"
                                      >
                                        <FlagOrInitial option={option} />
                                        <span>{option.label}</span>
                                        <Check
                                          className={cn(
                                            "ml-auto h-4 w-4",
                                            newEventCountry === option.label ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="city">City *</Label>
                        <div className="mt-1">
                          {/* //disabled={!newEventCountry} */}
                          <Popover open={isCreateCityOpen} onOpenChange={setIsCreateCityOpen}>
                            <PopoverTrigger asChild>
                              <Button disabled
                                variant="outline"
                                role="combobox"
                                aria-expanded={isCreateCityOpen}
                                className="w-full justify-between"

                              >
                                {newEventCity ? newEventCity : (newEventCountry ? "Select a city" : "Select country first")}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" sideOffset={4}>
                              <Command className="max-h-[280px]">
                                <CommandInput placeholder="Search cities..." className="border-0" />
                                <CommandList className="max-h-[200px] overflow-y-scroll">
                                  <CommandEmpty>No city found.</CommandEmpty>

                                  <CommandGroup>
                                    {newEventCountry && cityOptions[newEventCountry as keyof typeof cityOptions]?.map((option: any) => (
                                      <CommandItem
                                        key={option.id}
                                        value={option.label}
                                        onSelect={(currentValue: string) => {
                                          handleNewEventCitySelect(currentValue)
                                          setNewEventCity(currentValue);
                                          setNewEvent((prev) => ({ ...prev, city: currentValue }));
                                          setIsCreateCityOpen(false)
                                        }}
                                        className="cursor-pointer"
                                      >
                                        {option.label}
                                        <Check
                                          className={cn(
                                            "ml-auto h-4 w-4",
                                            newEventCity === option.label ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <div className="mt-1">
                          <Input
                            id="description"
                            value={newEvent.description}
                            onChange={(e) => handleDescriptionChange(e.target.value)}
                            placeholder="Describe the event..."
                            className={cn(
                              descriptionError ? "border-red-500 focus-visible:ring-red-500" : ""
                            )}
                            maxLength={250}
                          />
                          <div className="flex justify-between items-center mt-1">
                            <div className="text-xs text-muted-foreground">
                              {newEvent.description.length}/250 characters
                            </div>
                            {descriptionError && (
                              <div className="text-xs text-red-500">{descriptionError}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button variant="outline" onClick={() => {
                        setIsStartDateOpen(false)
                        setIsEndDateOpen(false)
                        setDescriptionError("")
                        setIsAddEventOpen(false)
                      }} className="px-4">
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddEvent}
                        disabled={!newEvent.name || !newEvent.startDate || !newEvent.endDate || !newEvent.country || !newEvent.city || !!descriptionError}
                        className="px-4 bg-primary hover:bg-primary/90"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Edit Event Modal */}
              <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Edit className="h-5 w-5 text-primary" />
                      Edit Event
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-name">Event Name *</Label>
                        <Input
                          id="edit-name"
                          value={newEvent.name}
                          onChange={(e) => setNewEvent((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter event name"
                          className="mt-1"
                          maxLength={35}
                        />
                      </div>

                      <div>
                        <Label htmlFor="edit-category">Category *</Label>
                        <div className="mt-1">
                          <Select
                            value={newEvent.category}
                            onValueChange={(value) => setNewEvent((prev) => ({ ...prev, category: value as typeof newEvent.category }))}
                          >
                            <SelectTrigger className="w-full [&>svg]:hidden">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60" hideScrollButtons={true}>
                              <SelectItem
                                value="conferences"
                                className={cn(
                                  "flex items-center gap-2 cursor-pointer pl-3 [&>span:first-child]:hidden",
                                  newEvent.category === "conferences" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : ""
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <Presentation className={`h-4 w-4 ${getCategoryColor("conferences")}`} />
                                  <span>Conferences</span>
                                </div>
                              </SelectItem>
                              <SelectItem
                                value="tradeshow"
                                className={cn(
                                  "flex items-center gap-2 cursor-pointer pl-3 [&>span:first-child]:hidden",
                                  newEvent.category === "tradeshow" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : ""
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <Building className={`h-4 w-4 ${getCategoryColor("tradeshow")}`} />
                                  <span>Trade Shows</span>
                                </div>
                              </SelectItem>
                              <SelectItem
                                value="workshop"
                                className={cn(
                                  "flex items-center gap-2 cursor-pointer pl-3 [&>span:first-child]:hidden",
                                  newEvent.category === "workshop" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : ""
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <GraduationCap className={`h-4 w-4 ${getCategoryColor("workshop")}`} />
                                  <span>Workshop</span>
                                </div>
                              </SelectItem>
                              <SelectItem
                                value="social"
                                className={cn(
                                  "flex items-center gap-2 cursor-pointer pl-3 [&>span:first-child]:hidden",
                                  newEvent.category === "social" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : ""
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <PartyPopper className={`h-4 w-4 ${getCategoryColor("social")}`} />
                                  <span>Social</span>
                                </div>
                              </SelectItem>

                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="edit-startDate">Start Date *</Label>
                        <div className="mt-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !newEvent.startDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newEvent.startDate ? (
                                  format(new Date(newEvent.startDate), "dd/MM/yyyy")
                                ) : (
                                  <span>dd/mm/yyyy</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={newEvent.startDate ? new Date(newEvent.startDate) : undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    const formattedDate = format(date, "yyyy-MM-dd")
                                    setNewEvent((prev) => {
                                      const newState = { ...prev, startDate: formattedDate }
                                      // Clear end date only if it's before the new start date (not equal)
                                      if (prev.endDate && new Date(prev.endDate) < date) {
                                        newState.endDate = ""
                                      }
                                      return newState
                                    })
                                  }
                                }}
                                disabled={(date) => {
                                  // Disable all dates before today
                                  const today = new Date()
                                  today.setHours(0, 0, 0, 0) // Normalize to start of day
                                  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                                  return compareDate < today
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="edit-endDate">End Date *</Label>
                        <div className="mt-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !newEvent.endDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newEvent.endDate ? (
                                  format(new Date(newEvent.endDate), "dd/MM/yyyy")
                                ) : (
                                  <span>dd/mm/yyyy</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={newEvent.endDate ? new Date(newEvent.endDate) : undefined}
                                defaultMonth={newEvent.startDate ? new Date(newEvent.startDate) : undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    const formattedDate = format(date, "yyyy-MM-dd")
                                    setNewEvent((prev) => ({ ...prev, endDate: formattedDate }))
                                  }
                                }}
                                disabled={(date) => {
                                  // Disable all dates before today
                                  const today = new Date()
                                  today.setHours(0, 0, 0, 0) // Normalize to start of day
                                  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

                                  // If date is before today, disable it
                                  if (compareDate < today) return true

                                  // If there's a start date, also disable dates before start date
                                  if (newEvent.startDate) {
                                    const startDate = new Date(newEvent.startDate)
                                    const compareStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
                                    // Allow same date (>=) but disable dates before start date
                                    return compareDate < compareStartDate
                                  }

                                  return false
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="edit-country">Country *</Label>
                        <div className="mt-1">
                          <Popover open={isEditCountryOpen} onOpenChange={setIsEditCountryOpen}>
                            <PopoverTrigger asChild>
                              <Button disabled
                                variant="outline"
                                role="combobox"
                                aria-expanded={isEditCountryOpen}
                                className="w-full justify-between"
                              >
                                {newEventCountry ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">
                                      <FlagOrInitial option={countryList.find(option => option.label === newEventCountry)} />
                                      {/* {countryList.find(option => option.label === newEventCountry)?.flag} */}
                                    </span>
                                    <span>{newEventCountry}</span>
                                  </div>
                                ) : (
                                  "Select a country"
                                )}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" sideOffset={4}>
                              <Command className="max-h-[280px]">
                                <CommandInput placeholder="Search countries..." className="border-0" />
                                <CommandList className="max-h-[200px] overflow-y-scroll">
                                  <CommandEmpty>No country found.</CommandEmpty>
                                  <CommandGroup>
                                    {countryList.map((option) => (
                                      <CommandItem
                                        key={option.id}
                                        value={option.label}
                                        onSelect={(currentValue) => {
                                          handleNewEventCountrySelect(currentValue)
                                          setIsEditCountryOpen(false)
                                        }}
                                        className="flex items-center gap-2 cursor-pointer"
                                      >
                                        <FlagOrInitial option={option} />
                                        <span>{option.label}</span>
                                        <Check
                                          className={cn(
                                            "ml-auto h-4 w-4",
                                            newEventCountry === option.label ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="edit-city">City *</Label>
                        <div className="mt-1">
                          {/* disabled={!newEventCountry} */}
                          <Popover open={isEditCityOpen} onOpenChange={setIsEditCityOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={isEditCityOpen}
                                className="w-full justify-between"
                                disabled
                              >
                                {newEventCity ? newEventCity : (newEventCountry ? "Select a city" : "Select country first")}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" sideOffset={4}>
                              <Command className="max-h-[280px]">
                                <CommandInput placeholder="Search cities..." className="border-0" />
                                <CommandList className="max-h-[200px] overflow-y-scroll">
                                  <CommandEmpty>No city found.</CommandEmpty>
                                  <CommandGroup>
                                    {newEventCountry && cityOptions[newEventCountry as keyof typeof cityOptions]?.map((option: any) => (
                                      <CommandItem
                                        key={option.id}
                                        value={option.label}
                                        onSelect={(currentValue) => {
                                          handleNewEventCitySelect(currentValue)
                                          setIsEditCityOpen(false)
                                        }}
                                        className="cursor-pointer"
                                      >
                                        {option.label}
                                        <Check
                                          className={cn(
                                            "ml-auto h-4 w-4",
                                            newEventCity === option.label ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <div className="mt-1">
                          <Input
                            id="edit-description"
                            value={newEvent.description}
                            onChange={(e) => handleDescriptionChange(e.target.value)}
                            placeholder="Describe the event..."
                            className={cn(
                              descriptionError ? "border-red-500 focus-visible:ring-red-500" : ""
                            )}
                            maxLength={250}
                          />
                          <div className="flex justify-between items-center mt-1">
                            <div className="text-xs text-muted-foreground">
                              {newEvent.description.length}/250 characters
                            </div>
                            {descriptionError && (
                              <div className="text-xs text-red-500">{descriptionError}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button variant="outline" onClick={() => {
                        setIsEditEventOpen(false)
                        setDescriptionError("")
                      }} className="px-4">
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveEditedEvent}
                        disabled={!newEvent.name || !newEvent.startDate || !newEvent.endDate || !newEvent.country || !newEvent.city || !!descriptionError}
                        className="px-4 bg-primary hover:bg-primary/90"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>



      {/* Main Content */}
      <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8">
        {/* Legend and View Toggle - No Container */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 xl:px-0 px-[5%]">
          {/* Legend Items - Clickable toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleEventType('bookmarked')}
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-md transition-all duration-200 hover:text-foreground",
                enabledEventTypes.bookmarked ? "opacity-100" : "opacity-40"
              )}
            >
              <div className={cn(
                "w-3 h-3 rounded-full transition-all duration-200",
                enabledEventTypes.bookmarked ? "bg-green-500" : "bg-gray-300"
              )}></div>
              <span className="text-sm text-muted-foreground">Bookmarked</span>
            </button>
            <button
              onClick={() => toggleEventType('holidays')}
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-md transition-all duration-200 hover:text-foreground",
                enabledEventTypes.holidays ? "opacity-100" : "opacity-60"
              )}
            >
              <div className={cn(
                "w-3 h-3 rounded-full transition-all duration-200",
                enabledEventTypes.holidays ? "bg-purple-500" : "bg-gray-400"
              )}></div>
              <span className={cn(
                "text-sm transition-all duration-200",
                enabledEventTypes.holidays ? "text-muted-foreground" : "text-muted-foreground/60"
              )}>Holidays</span>
            </button>

          </div>

          {/* View Toggle - Right Aligned */}
          <TooltipProvider>
            <div className="flex items-center gap-2">


              {/* View Toggle */}
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "calendar" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("calendar")}
                      className={cn(
                        "h-8 px-3 rounded-none border-r-0 border-b-0",
                        viewMode === "calendar" ? "border-r-0 border-b-0" : "border-r-0 border-b-0 hover:border-r-0 hover:border-b-0"
                      )}
                    >
                      <CalendarLucide className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                    <p className="text-xs">Calendar View</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className={cn(
                        "h-8 px-3 rounded-none border-l-0 border-t-0",
                        viewMode === "list" ? "border-l-0 border-t-0" : "border-l-0 border-t-0 hover:border-l-0 hover:border-t-0"
                      )}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                    <p className="text-xs">List View</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </TooltipProvider>
        </div>
        {isLoading ? (
          <Card className="overflow-hidden shadow-lg xl:w-full w-[90%] mx-auto">
            {/* Loading Header */}
            <div className="grid grid-cols-7 border-b border-border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-1.5 sm:p-3 text-center font-medium text-gray-600 dark:text-gray-400 border-r border-border last:border-r-0"
                >
                  <span className="hidden sm:inline text-xs">{day === "Sun" ? "Sunday" : day === "Mon" ? "Monday" : day === "Tue" ? "Tuesday" : day === "Wed" ? "Wednesday" : day === "Thu" ? "Thursday" : day === "Fri" ? "Friday" : "Saturday"}</span>
                  <span className="sm:hidden text-xs">{day}</span>
                </div>
              ))}
            </div>

            {/* Loading Calendar Body */}
            <div className="grid grid-cols-7">
              {Array.from({ length: 35 }, (_, i) => (
                <div key={i} className="h-[89px] sm:h-[110px] border border-border/30 p-4">
                  <Skeleton className="h-4 w-6 mb-2" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          </Card>
        ) : viewMode === "calendar" ? (
          <Card className="overflow-hidden shadow-lg xl:w-full w-[90%] mx-auto">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 border-b border-border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                <div
                  key={day}
                  className="p-1.5 sm:p-3 text-center font-medium text-gray-600 dark:text-gray-400 border-r border-border last:border-r-0"
                >
                  <span className="hidden sm:inline text-xs">{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][index]}</span>
                  <span className="sm:hidden text-xs">{day}</span>
                </div>
              ))}
            </div>

            {/* Calendar Body */}
            <div className="grid grid-cols-7">{renderCalendarDays()}</div>
          </Card>
        ) : (
          renderEventsList()
        )}
      </div>

      {/* Day View Modal */}
      <Dialog open={isDayViewOpen} onOpenChange={setIsDayViewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Events for{" "}
              {selectedDate ? formatListHeader(selectedDate.toISOString()) : ""}
            </DialogTitle>
          </DialogHeader>
          {/* max-h-96 */}
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="space-y-3">
              {getEventsForSelectedDate().map((event) => (
                <div
                  key={event.id || event.eventId}
                  className={cn(
                    "flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer",
                    event.status === "bookmarked" && "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
                    event.type === "holiday" && "bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800",
                  )}
                  onClick={() => {
                    setSelectedEvent(event)
                    setIsDayViewOpen(false)
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-start gap-2">
                        {(() => {
                          const eventCategory = getCategoryData(event)
                          if (eventCategory && eventCategory.id !== "all") {
                            const IconComponent = eventCategory.icon
                            return <IconComponent className={`h-3 w-3 ${eventCategory.color}`} />
                          }
                          return null
                        })()}
                        <div className="flex-1">
                          <h3 className="text-sm font-medium leading-snug">{event.name}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {event.startDate === event.endDate ? formatSingleDate(event.startDate) : formatDateRange(event.startDate, event.endDate)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Removed all badges from date popup */}

                    {/* Edit and Delete buttons for custom events */}
                    {event.isCustom && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditEvent(event)
                            setIsDayViewOpen(false)
                          }}
                          className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
                          title="Edit Event"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            showDeleteConfirmation(event.eventId)
                          }}
                          className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                          title="Delete Event"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    <Button
                      variant={(event.status === "bookmarked" || event.status === "suggested") ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleBookmark(event.eventId, `${selectedProperty?.sid}`)
                      }}
                      className={cn(
                        "px-3 gap-2 text-xs",
                        (event.status === "bookmarked" || event.status === "suggested")
                          ? "bg-green-600 hover:bg-green-700"
                          : "hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-950"
                      )}
                    >
                      <BookmarkIcon
                        className={cn("h-3 w-3", (event.status === "bookmarked" || event.status === "suggested") && "fill-current")}
                      />
                      {(event.status === "bookmarked" || event.status === "suggested") ? "Bookmarked" : "Bookmark"}
                    </Button>
                  </div>
                </div>
              ))}

              {getEventsForSelectedDate().length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No events on this day</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-t border-gray-300 bg-white">
            <div className="text-xs text-muted-foreground">
              {getEventsForSelectedDate().length} event
              {getEventsForSelectedDate().length !== 1 ? "s" : ""} on this day
            </div>
            <Button
              onClick={() => setIsDayViewOpen(false)}
              className="px-3 py-1 text-xs"
            >
              Close
            </Button>
          </div>

          {/* <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {getEventsForSelectedDate().length} event{getEventsForSelectedDate().length !== 1 ? "s" : ""} on this day
            </div>
            <Button onClick={() => setIsDayViewOpen(false)} className="px-4 mt-0.5max-w-4xl max-h-[80vh] relative -translate-y-[8px]">Close</Button>
          </div> */}
        </DialogContent>
      </Dialog>

      {/* Event Detail Modal */}
      {
        selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-left">
                  <div className="mb-3">
                    <div className="leading-relaxed break-words">
                      {selectedEvent.name}
                      {selectedEvent.status === "bookmarked" && <Star className="h-5 w-5 fill-current text-green-600 inline ml-2" />}
                      {selectedEvent.type === "holiday" && <Sparkles className={`h-5 w-5 ${getCategoryColor("holidays")} inline ml-2`} />}
                    </div>
                  </div>
                  <Badge className={cn(getStatusColor(selectedEvent.status))}>
                    {selectedEvent.status === "available" ? "Available" : selectedEvent.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    {formatDateRange(selectedEvent.startDate, selectedEvent.endDate)}
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span className="capitalize">{selectedEvent.category} Event</span>
                  </div>
                </div>

                {selectedEvent.description && (
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-muted-foreground mt-1">{selectedEvent.description}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  {/* Edit and Delete buttons for custom events */}
                  {selectedEvent.isCustom ? (
                    <div className="flex items-center gap-2">
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleEditEvent(selectedEvent)
                            setSelectedEvent(null)
                          }}
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                          Edit Event
                        </div>
                      </div>
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => showDeleteConfirmation(selectedEvent.eventId)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                          Delete Event
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div></div>
                  )}

                  <div className="flex items-center gap-2">
                    {selectedEvent.status !== "available" ? (
                      <Button
                        variant={selectedEvent.status === "bookmarked" || selectedEvent.status === "suggested" ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleBookmark(selectedEvent.eventId, `${selectedProperty?.sid}`)
                        }}
                        className={cn(
                          "px-4 gap-3",
                          selectedEvent.status === "bookmarked" || selectedEvent.status === "suggested"
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-950"
                        )}
                      >
                        <BookmarkIcon
                          className={cn("h-4 w-4", (selectedEvent.status === "bookmarked" || selectedEvent.status === "suggested") && "fill-current")}
                        />
                        {(selectedEvent.status === "bookmarked" || selectedEvent.status === "suggested") ? "Remove Bookmark" : "Bookmark Event"}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleBookmark(selectedEvent.eventId, `${selectedProperty?.sid}`)
                        }}
                        className="px-4 gap-3 hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-950"
                      >
                        <BookmarkIcon className="h-4 w-4" />
                        Bookmark Event
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )
      }

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{eventToDelete?.name}"?
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false)
              setEventToDelete(null)
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => eventToDelete && handleDeleteEvent(eventToDelete.eventId)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  )
}