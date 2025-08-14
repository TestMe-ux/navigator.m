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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { getAllEvents } from "@/lib/events"
import { useDateContext } from "@/components/date-context"
import { format, getDaysInMonth } from "date-fns"

// Helper functions for consistent date formatting
const formatSingleDate = (dateString: string | Date) => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return format(date, "dd MMM ''yy")
}

const formatDateRange = (startDate: string | Date, endDate: string | Date) => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  
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
  name: string
  startDate: string
  endDate: string
  category: "social" | "business"
  location: string
  description: string
  status: "bookmarked" | "suggested" | "available"
  country?: string
  flag?: string
  type: "holiday" | "conference" | "festival" | "sports" | "business" | "social"
  priority: "high" | "medium" | "low"
  attendees?: number
  isCustom?: boolean
  createdAt?: number
}

// Custom events storage key
const CUSTOM_EVENTS_KEY = 'events-calendar-custom-events'

// Function to save custom events to localStorage
const saveCustomEventsToStorage = (customEvents: Event[]) => {
  try {
    // Ensure we only save custom events with proper timestamps
    const eventsWithTimestamp = customEvents.filter(event => event.isCustom).map(event => ({
      ...event,
      createdAt: event.createdAt || Date.now()
    }))
    
    const dataToSave = JSON.stringify(eventsWithTimestamp)
    localStorage.setItem(CUSTOM_EVENTS_KEY, dataToSave)
    console.log(`💾 Saved ${eventsWithTimestamp.length} custom events to localStorage`)
    
    // Verify the save was successful
    const verification = localStorage.getItem(CUSTOM_EVENTS_KEY)
    if (!verification) {
      throw new Error('Failed to verify localStorage save')
    }
  } catch (error) {
    console.error('Failed to save custom events to localStorage:', error)
    // Try to notify user if localStorage is not available
    if (error instanceof DOMException && error.code === 22) {
      console.warn('localStorage quota exceeded or disabled')
    }
  }
}

// Function to load custom events from localStorage
const loadCustomEventsFromStorage = (): Event[] => {
  try {
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage is not available')
      return []
    }
    
    const stored = localStorage.getItem(CUSTOM_EVENTS_KEY)
    if (!stored || stored === 'null' || stored === 'undefined') {
      console.log('📂 No custom events found in localStorage')
      return []
    }
    
    let events: (Event & { createdAt: number })[]
    try {
      events = JSON.parse(stored)
    } catch (parseError) {
      console.error('Failed to parse stored events, clearing localStorage:', parseError)
      localStorage.removeItem(CUSTOM_EVENTS_KEY)
      return []
    }
    
    // Ensure events is an array
    if (!Array.isArray(events)) {
      console.error('Stored events is not an array, clearing localStorage')
      localStorage.removeItem(CUSTOM_EVENTS_KEY)
      return []
    }
    
    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000) // 3 days in milliseconds
    
    // Filter out events older than 3 days and ensure they have required properties
    const validEvents = events.filter(event => {
      // Check if event has required properties
      if (!event.id || !event.name || !event.isCustom) {
        console.warn('Invalid event found, skipping:', event)
        return false
      }
      
      // Check if event is within 3-day window
      const createdAt = event.createdAt || 0
      return createdAt > threeDaysAgo
    })
    
    const expiredCount = events.length - validEvents.length
    
    // Save back the filtered events to clean up expired ones
    if (validEvents.length !== events.length) {
      try {
        localStorage.setItem(CUSTOM_EVENTS_KEY, JSON.stringify(validEvents))
        console.log(`🗑️ Cleaned up ${expiredCount} expired events (older than 3 days)`)
      } catch (saveError) {
        console.error('Failed to save cleaned events:', saveError)
      }
    }
    
    console.log(`📂 Loaded ${validEvents.length} custom events from localStorage`)
    return validEvents
  } catch (error) {
    console.error('Failed to load custom events from localStorage:', error)
    // Clear corrupted data
    try {
      localStorage.removeItem(CUSTOM_EVENTS_KEY)
    } catch (clearError) {
      console.error('Failed to clear corrupted localStorage data:', clearError)
    }
    return []
  }
}

// Curated selection of major global events distributed strategically throughout the year
const sampleEvents: Event[] = [
  // JANUARY - Major holidays and tech events
  {
    id: "h1",
    name: "International Day of Friendship",
    startDate: "2025-08-01",
    endDate: "2025-08-01",
    category: "social",
    location: "Global",
    description: "UN day promoting friendship between peoples and cultures",
    status: "suggested",
    country: "Global",
    flag: "🤝",
    type: "holiday",
    priority: "high",
  },
  {
    id: "b1",
    name: "Tech Summit 2025",
    startDate: "2025-08-03",
    endDate: "2025-08-05",
    category: "business",
    location: "Las Vegas, USA",
    description: "Premier technology conference and innovation showcase",
    status: "bookmarked",
    country: "USA",
    flag: "🇺🇸",

    type: "conference",
    priority: "high",
  },
  {
    id: "h2",
    name: "Martin Luther King Jr. Day",
    startDate: "2025-11-08",
    endDate: "2025-11-08",
    category: "social",
    location: "United States",
    description: "Federal holiday honoring civil rights leader",
    status: "suggested",
    country: "USA",
    flag: "🇺🇸",
    type: "holiday",
    priority: "high",
  },
  {
    id: "s1",
    name: "World Economic Forum",
    startDate: "2025-04-03",
    endDate: "2025-04-06",
    category: "business",
    location: "Davos, Switzerland",
    description: "Annual meeting of global economic leaders",
    status: "suggested",
    country: "Switzerland",
    flag: "🇨🇭",

    type: "conference",
    priority: "high",
  },

  // FEBRUARY - Cultural celebrations and mobile tech
  {
    id: "h3",
    name: "Chinese New Year",
    startDate: "2025-07-22",
    endDate: "2025-07-22",
    category: "social",
    location: "China",
    description: "Traditional lunar new year celebration",
    status: "suggested",
    country: "China",
    flag: "🇨🇳",
    type: "holiday",
    priority: "high",
  },
  {
    id: "h4",
    name: "Valentine's Day",
    startDate: "2025-08-14",
    endDate: "2025-08-14",
    category: "social",
    location: "Global",
    description: "Day of love and romance",
    status: "suggested",
    country: "Global",
    flag: "💝",
    type: "holiday",
    priority: "medium",
  },
  {
    id: "b2",
    name: "Mobile World Congress",
    startDate: "2025-06-12",
    endDate: "2025-06-15",
    category: "business",
    location: "Barcelona, Spain",
    description: "World's largest mobile industry event",
    status: "bookmarked",
    country: "Spain",
    flag: "🇪🇸",

    type: "conference",
    priority: "high",
  },

  // MARCH - Spring festivals and tech
  {
    id: "mar1",
    name: "SXSW",
    startDate: "2025-10-20",
    endDate: "2025-10-29",
    category: "social",
    location: "Austin, USA",
    description: "South by Southwest - Music, interactive, and film festival",
    status: "bookmarked",
    country: "USA",
    flag: "🇺🇸",

    type: "festival",
    priority: "high",
  },
  {
    id: "mar2",
    name: "St. Patrick's Day",
    startDate: "2025-12-05",
    endDate: "2025-12-05",
    category: "social",
    location: "Ireland",
    description: "Irish cultural and religious celebration",
    status: "suggested",
    country: "Ireland",
    flag: "🇮🇪",
    type: "holiday",
    priority: "medium",
  },

  // APRIL - Easter and AI
  {
    id: "apr1",
    name: "Easter Sunday",
    startDate: "2025-04-20",
    endDate: "2025-04-20",
    category: "social",
    location: "Global",
    description: "Christian holiday celebrating resurrection",
    status: "suggested",
    country: "Global",
    flag: "🐰",
    type: "holiday",
    priority: "medium",
  },

  // MAY - Workers' day and major conferences
  {
    id: "may1",
    name: "World Humanitarian Day",
    startDate: "2025-08-19",
    endDate: "2025-08-19",
    category: "social",
    location: "Global",
    description: "UN day honoring humanitarian workers worldwide",
    status: "suggested",
    country: "Global",
    flag: "🤲",
    type: "holiday",
    priority: "medium",
  },
  {
    id: "may2",
    name: "DevCon 2025",
    startDate: "2025-08-14",
    endDate: "2025-08-16",
    category: "business",
    location: "Mountain View, USA",
    description: "Premier developer conference for emerging technologies",
    status: "bookmarked",
    country: "USA",
    flag: "🇺🇸",
    type: "conference",
    priority: "high",
  },
  {
    id: "may3",
    name: "International Cat Day",
    startDate: "2025-08-08",
    endDate: "2025-08-08",
    category: "social",
    location: "Global",
    description: "Day celebrating cats and promoting their welfare",
    status: "suggested",
    country: "Global",
    flag: "🐱",
    type: "holiday",
    priority: "medium",
  },
  {
    id: "may4",
    name: "World Elephant Day",
    startDate: "2025-08-12",
    endDate: "2025-08-12",
    category: "social",
    location: "Global",
    description: "Day dedicated to elephant conservation and protection",
    status: "suggested",
    country: "Global",
    flag: "🐘",
    type: "holiday",
    priority: "medium",
  },
  {
    id: "may5",
    name: "International Left-Handers Day",
    startDate: "2025-08-13",
    endDate: "2025-08-13",
    category: "social",
    location: "Global",
    description: "Day celebrating left-handed people and their unique challenges",
    status: "suggested",
    country: "Global",
    flag: "✋",
    type: "holiday",
    priority: "low",
  },
  {
    id: "may6",
    name: "AI Summit 2025",
    startDate: "2025-08-18",
    endDate: "2025-08-20",
    category: "business",
    location: "Seattle, USA",
    description: "Leading artificial intelligence and machine learning conference",
    status: "suggested",
    country: "USA",
    flag: "🇺🇸",
    attendees: 25000,
    type: "conference",
    priority: "high",
  },

  // JUNE - Summer events and technology conferences
  {
    id: "jun1",
    name: "International Beer Day",
    startDate: "2025-08-01",
    endDate: "2025-08-01",
    category: "social",
    location: "Global",
    description: "International celebration of beer and brewing culture",
    status: "suggested",
    country: "Global",
    flag: "🍺",
    type: "holiday",
    priority: "medium",
  },
  {
    id: "jun2",
    name: "World Ocean Day",
    startDate: "2025-06-08",
    endDate: "2025-06-08",
    category: "social",
    location: "Global",
    description: "UN day celebrating ocean conservation",
    status: "suggested",
    country: "Global",
    flag: "🌊",
    type: "holiday",
    priority: "medium",
  },
  {
    id: "jun3",
    name: "Father's Day",
    startDate: "2025-06-15",
    endDate: "2025-06-15",
    category: "social",
    location: "Global",
    description: "Day honoring fathers and fatherhood",
    status: "suggested",
    country: "Global",
    flag: "👨‍👧‍👦",
    type: "holiday",
    priority: "medium",
  },
  {
    id: "jun4",
    name: "E3 Gaming Expo",
    startDate: "2025-06-10",
    endDate: "2025-06-12",
    category: "business",
    location: "Los Angeles, USA",
    description: "Electronic Entertainment Expo - Gaming industry showcase",
    status: "suggested",
    country: "USA",
    flag: "🇺🇸",
    attendees: 45000,
    type: "conference",
    priority: "high",
  },
  {
    id: "jun5",
    name: "Summer Solstice",
    startDate: "2025-06-21",
    endDate: "2025-06-21",
    category: "social",
    location: "Global",
    description: "Longest day of the year in Northern Hemisphere",
    status: "suggested",
    country: "Global",
    flag: "☀️",
    type: "holiday",
    priority: "low",
  },
  {
    id: "jun6",
    name: "Cannes Lions Festival",
    startDate: "2025-06-16",
    endDate: "2025-06-20",
    category: "business",
    location: "Cannes, France",
    description: "International Festival of Creativity in advertising",
    status: "suggested",
    country: "France",
    flag: "🇫🇷",
    attendees: 15000,
    type: "festival",
    priority: "medium",
  },
  {
    id: "jun7",
    name: "World Music Day",
    startDate: "2025-06-21",
    endDate: "2025-06-21",
    category: "social",
    location: "Global",
    description: "Annual celebration of music and cultural diversity",
    status: "suggested",
    country: "Global",
    flag: "🎵",
    type: "holiday",
    priority: "medium",
  },

  // JULY - Independence and summer events
  {
    id: "jul1",
    name: "Independence Day",
    startDate: "2025-07-04",
    endDate: "2025-07-04",
    category: "social",
    location: "United States",
    description: "American Independence Day celebration",
    status: "suggested",
    country: "USA",
    flag: "🇺🇸",
    type: "holiday",
    priority: "high",
  },

  // AUGUST - International events
  {
    id: "aug1",
    name: "Edinburgh Festival Fringe",
    startDate: "2025-08-08",
    endDate: "2025-08-30",
    category: "social",
    location: "Edinburgh, Scotland",
    description: "World's largest arts festival",
    status: "suggested",
    country: "UK",
    flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    attendees: 500000,
    type: "festival",
    priority: "high",
  },
  {
    id: "aug2",
    name: "Independence Day of India",
    startDate: "2025-08-15",
    endDate: "2025-08-15",
    category: "social",
    location: "India",
    description: "India's Independence Day celebration",
    status: "bookmarked",
    country: "India",
    flag: "🇮🇳",
    type: "holiday",
    priority: "high",
  },
  {
    id: "aug3",
    name: "DEF CON 33",
    startDate: "2025-08-07",
    endDate: "2025-08-10",
    category: "business",
    location: "Las Vegas, USA",
    description: "World's largest hacking conference",
    status: "available",
    country: "USA",
    flag: "🇺🇸",
    attendees: 30000,
    type: "conference",
    priority: "medium",
  },
  {
    id: "aug4",
    name: "Burning Man Festival",
    startDate: "2025-08-25",
    endDate: "2025-09-02",
    category: "social",
    location: "Black Rock Desert, USA",
    description: "Annual arts and music festival in the desert",
    status: "suggested",
    country: "USA",
    flag: "🇺🇸",
    attendees: 80000,
    type: "festival",
    priority: "medium",
  },
  {
    id: "aug5",
    name: "VMworld 2025",
    startDate: "2025-08-26",
    endDate: "2025-08-29",
    category: "business",
    location: "San Francisco, USA",
    description: "VMware's premier technology conference",
    status: "bookmarked",
    country: "USA",
    flag: "🇺🇸",
    attendees: 20000,
    type: "conference",
    priority: "high",
  },
  {
    id: "aug6",
    name: "La Tomatina",
    startDate: "2025-08-27",
    endDate: "2025-08-27",
    category: "social",
    location: "Buñol, Spain",
    description: "Famous tomato-throwing festival",
    status: "available",
    country: "Spain",
    flag: "🇪🇸",
    attendees: 20000,
    type: "festival",
    priority: "low",
  },
  {
    id: "aug7",
    name: "International Youth Day",
    startDate: "2025-08-12",
    endDate: "2025-08-12",
    category: "social",
    location: "Global",
    description: "UN day celebrating youth contributions",
    status: "suggested",
    country: "Global",
    flag: "🌍",
    type: "holiday",
    priority: "medium",
  },
  {
    id: "aug8",
    name: "Gamescom 2025",
    startDate: "2025-08-21",
    endDate: "2025-08-25",
    category: "business",
    location: "Cologne, Germany",
    description: "World's largest gaming trade fair",
    status: "bookmarked",
    country: "Germany",
    flag: "🇩🇪",
    attendees: 370000,
    type: "conference",
    priority: "high",
  },
  {
    id: "aug9",
    name: "World Photography Day",
    startDate: "2025-08-19",
    endDate: "2025-08-19",
    category: "social",
    location: "Global",
    description: "Celebrating the art of photography",
    status: "available",
    country: "Global",
    flag: "📸",
    type: "holiday",
    priority: "low",
  },
  {
    id: "aug10",
    name: "Summer Olympics 2028 Kickoff",
    startDate: "2025-08-31",
    endDate: "2025-08-31",
    category: "social",
    location: "Los Angeles, USA",
    description: "Official countdown event for LA 2028 Olympics",
    status: "suggested",
    country: "USA",
    flag: "🇺🇸",
    attendees: 50000,
    type: "sports",
    priority: "high",
  },
  {
    id: "aug11",
    name: "BlackHat USA 2025",
    startDate: "2025-08-02",
    endDate: "2025-08-07",
    category: "business",
    location: "Las Vegas, USA",
    description: "Premier cybersecurity conference",
    status: "bookmarked",
    country: "USA",
    flag: "🇺🇸",
    attendees: 17000,
    type: "conference",
    priority: "high",
  },

  // SEPTEMBER - Oktoberfest and tech events
  {
    id: "sep1",
    name: "Labor Day Weekend",
    startDate: "2025-09-01",
    endDate: "2025-09-01",
    category: "social",
    location: "United States",
    description: "American Labor Day holiday",
    status: "suggested",
    country: "USA",
    flag: "🇺🇸",
    type: "holiday",
    priority: "medium",
  },
  {
    id: "sep2",
    name: "Oktoberfest",
    startDate: "2025-09-20",
    endDate: "2025-10-05",
    category: "social",
    location: "Munich, Germany",
    description: "World's largest beer festival",
    status: "bookmarked",
    country: "Germany",
    flag: "🇩🇪",
    attendees: 6000000,
    type: "festival",
    priority: "high",
  },
  {
    id: "sep3",
    name: "Apple Event",
    startDate: "2025-09-12",
    endDate: "2025-09-12",
    category: "business",
    location: "Cupertino, USA",
    description: "Apple's annual iPhone launch event",
    status: "bookmarked",
    country: "USA",
    flag: "🇺🇸",
    attendees: 1000,
    type: "conference",
    priority: "high",
  },
  {
    id: "sep4",
    name: "Brazilian Independence Day",
    startDate: "2025-09-07",
    endDate: "2025-09-07",
    category: "social",
    location: "Brazil",
    description: "Brazil's National Independence Day",
    status: "available",
    country: "Brazil",
    flag: "🇧🇷",
    type: "holiday",
    priority: "medium",
  },
  {
    id: "sep5",
    name: "IFA Berlin 2025",
    startDate: "2025-09-05",
    endDate: "2025-09-10",
    category: "business",
    location: "Berlin, Germany",
    description: "Global trade show for consumer electronics",
    status: "suggested",
    country: "Germany",
    flag: "🇩🇪",
    attendees: 245000,
    type: "conference",
    priority: "medium",
  },
  {
    id: "sep6",
    name: "World Tourism Day",
    startDate: "2025-09-27",
    endDate: "2025-09-27",
    category: "social",
    location: "Global",
    description: "UN World Tourism Day celebration",
    status: "available",
    country: "Global",
    flag: "✈️",
    type: "holiday",
    priority: "low",
  },
  {
    id: "sep7",
    name: "Burning Man Decompression",
    startDate: "2025-09-14",
    endDate: "2025-09-14",
    category: "social",
    location: "San Francisco, USA",
    description: "Post-Burning Man community celebration",
    status: "suggested",
    country: "USA",
    flag: "🇺🇸",
    attendees: 15000,
    type: "festival",
    priority: "low",
  },
  {
    id: "sep8",
    name: "React Conf 2025",
    startDate: "2025-09-25",
    endDate: "2025-09-26",
    category: "business",
    location: "Henderson, USA",
    description: "Official React JavaScript library conference",
    status: "bookmarked",
    country: "USA",
    flag: "🇺🇸",

    type: "conference",
    priority: "high",
  },
  {
    id: "sep9",
    name: "International Day of Peace",
    startDate: "2025-09-21",
    endDate: "2025-09-21",
    category: "social",
    location: "Global",
    description: "UN International Day of Peace",
    status: "suggested",
    country: "Global",
    flag: "🕊️",
    type: "holiday",
    priority: "medium",
  },
  {
    id: "sep10",
    name: "Formula 1 Singapore Grand Prix",
    startDate: "2025-09-19",
    endDate: "2025-09-21",
    category: "social",
    location: "Singapore",
    description: "Night race F1 Grand Prix",
    status: "available",
    country: "Singapore",
    flag: "🇸🇬",

    type: "sports",
    priority: "high",
  },
  {
    id: "sep11",
    name: "Autodesk University 2025",
    startDate: "2025-09-17",
    endDate: "2025-09-19",
    category: "business",
    location: "Las Vegas, USA",
    description: "Autodesk's premier learning conference",
    status: "available",
    country: "USA",
    flag: "🇺🇸",

    type: "conference",
    priority: "medium",
  },
  {
    id: "sep12",
    name: "Mid-Autumn Festival",
    startDate: "2025-09-29",
    endDate: "2025-09-29",
    category: "social",
    location: "China",
    description: "Traditional Chinese moon festival",
    status: "bookmarked",
    country: "China",
    flag: "🇨🇳",
    type: "holiday",
    priority: "high",
  },

  // OCTOBER - Halloween and major tech summit
  {
    id: "oct1",
    name: "Web Summit",
    startDate: "2025-10-07",
    endDate: "2025-10-10",
    category: "business",
    location: "Lisbon, Portugal",
    description: "Europe's largest tech conference",
    status: "bookmarked",
    country: "Portugal",
    flag: "🇵🇹",

    type: "conference",
    priority: "high",
  },
  {
    id: "oct2",
    name: "Halloween",
    startDate: "2025-10-31",
    endDate: "2025-10-31",
    category: "social",
    location: "Global",
    description: "Halloween celebration worldwide",
    status: "suggested",
    country: "Global",
    flag: "🎃",
    type: "holiday",
    priority: "medium",
  },

  // NOVEMBER - Major holidays
  {
    id: "nov1",
    name: "Diwali",
    startDate: "2025-11-01",
    endDate: "2025-11-01",
    category: "social",
    location: "India",
    description: "Hindu festival of lights",
    status: "suggested",
    country: "India",
    flag: "🇮🇳",
    type: "holiday",
    priority: "high",
  },
  {
    id: "nov2",
    name: "Thanksgiving",
    startDate: "2025-11-27",
    endDate: "2025-11-27",
    category: "social",
    location: "United States",
    description: "American Thanksgiving holiday",
    status: "suggested",
    country: "USA",
    flag: "🦃",
    type: "holiday",
    priority: "high",
  },

  // NOVEMBER continued - More business and cultural events
  {
    id: "nov3",
    name: "Black Friday",
    startDate: "2025-11-28",
    endDate: "2025-11-28",
    category: "business",
    location: "Global",
    description: "Major shopping event and retail sales day",
    status: "suggested",
    country: "Global",
    flag: "🛍️",
    type: "business",
    priority: "high",
  },
  {
    id: "nov4",
    name: "Cyber Monday",
    startDate: "2025-12-01",
    endDate: "2025-12-01",
    category: "business",
    location: "Global",
    description: "Online shopping event following Black Friday",
    status: "suggested",
    country: "Global",
    flag: "💻",
    type: "business",
    priority: "high",
  },
  {
    id: "nov5",
    name: "World Cities Day",
    startDate: "2025-10-31",
    endDate: "2025-10-31",
    category: "social",
    location: "Global",
    description: "UN day promoting sustainable urban development",
    status: "suggested",
    country: "Global",
    flag: "🏙️",
    type: "holiday",
    priority: "medium",
  },
  {
    id: "nov6",
    name: "International Men's Day",
    startDate: "2025-11-19",
    endDate: "2025-11-19",
    category: "social",
    location: "Global",
    description: "Day celebrating men's contributions to society",
    status: "suggested",
    country: "Global",
    flag: "👨",
    type: "holiday",
    priority: "medium",
  },
  {
    id: "nov7",
    name: "World Television Day",
    startDate: "2025-11-21",
    endDate: "2025-11-21",
    category: "social",
    location: "Global",
    description: "UN day recognizing television's impact on communication",
    status: "suggested",
    country: "Global",
    flag: "📺",
    type: "holiday",
    priority: "low",
  },

  // DECEMBER - Year-end holidays and events
  {
    id: "dec1",
    name: "Christmas Day",
    startDate: "2025-12-25",
    endDate: "2025-12-25",
    category: "social",
    location: "Global",
    description: "Christian holiday celebrating birth of Jesus",
    status: "suggested",
    country: "Global",
    flag: "🎄",
    type: "holiday",
    priority: "high",
  },
  {
    id: "dec2",
    name: "New Year's Eve",
    startDate: "2025-12-31",
    endDate: "2025-12-31",
    category: "social",
    location: "Global",
    description: "Last day of the year celebration",
    status: "suggested",
    country: "Global",
    flag: "🎆",
    type: "holiday",
    priority: "high",
  },
  {
    id: "dec3",
    name: "AWS re:Invent 2025",
    startDate: "2025-12-02",
    endDate: "2025-12-06",
    category: "business",
    location: "Las Vegas, USA",
    description: "Amazon Web Services' premier cloud computing conference",
    status: "suggested",
    country: "USA",
    flag: "🇺🇸",
    attendees: 65000,
    type: "conference",
    priority: "high",
  },
  {
    id: "dec4",
    name: "Human Rights Day",
    startDate: "2025-12-10",
    endDate: "2025-12-10",
    category: "social",
    location: "Global",
    description: "UN day commemorating the Universal Declaration of Human Rights",
    status: "suggested",
    country: "Global",
    flag: "⚖️",
    type: "holiday",
    priority: "medium",
  },
  {
    id: "dec5",
    name: "International Mountain Day",
    startDate: "2025-12-11",
    endDate: "2025-12-11",
    category: "social",
    location: "Global",
    description: "UN day celebrating mountain ecosystems and cultures",
    status: "suggested",
    country: "Global",
    flag: "🏔️",
    type: "holiday",
    priority: "low",
  },
  {
    id: "dec6",
    name: "International Migrants Day",
    startDate: "2025-12-18",
    endDate: "2025-12-18",
    category: "social",
    location: "Global",
    description: "UN day recognizing migrants' contributions and challenges",
    status: "suggested",
    country: "Global",
    flag: "🌍",
    type: "holiday",
    priority: "medium",
  },
  {
    id: "dec7",
    name: "Winter Solstice",
    startDate: "2025-12-21",
    endDate: "2025-12-21",
    category: "social",
    location: "Global",
    description: "Astronomical beginning of winter in Northern Hemisphere",
    status: "suggested",
    country: "Global",
    flag: "❄️",
    type: "holiday",
    priority: "low",
  },
]



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
  const { startDate, endDate } = useDateContext()
  
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

  const [isDayViewOpen, setIsDayViewOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const [bookmarkSearchQuery, setBookmarkSearchQuery] = useState("")
  const [bookmarkCategoryFilter, setBookmarkCategoryFilter] = useState<string[]>(["all", "conference", "tradeshow", "workshop", "social", "holidays"])
  const [bookmarkTypeFilter, setBookmarkTypeFilter] = useState<string[]>(["all", "bookmarked", "holidays", "suggested", "available"])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{x: number, y: number}>({x: 0, y: 0})

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
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingCycle, setLoadingCycle] = useState(1)

  // Country dropdown state
  const [isCountryOpen, setIsCountryOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("United States")
  const [countrySearchQuery, setCountrySearchQuery] = useState("")
  const [isCountrySearchFocused, setIsCountrySearchFocused] = useState(false)
  
  // City dropdown state
  const [isCityOpen, setIsCityOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState("New York")
  const [citySearchQuery, setCitySearchQuery] = useState("")
  const [isCitySearchFocused, setIsCitySearchFocused] = useState(false)

  // Category dropdown state
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"])

  // Date picker states for add event form
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)

  // Delete confirmation dialog state
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Description validation state
  const [descriptionError, setDescriptionError] = useState("")

  // Initialize events with sample events and stored custom events
  useEffect(() => {
    const initializeEvents = () => {
      try {
        const storedCustomEvents = loadCustomEventsFromStorage()
        const combinedEvents = [...sampleEvents, ...storedCustomEvents]
        setEvents(combinedEvents)
        console.log(`🚀 Initialized with ${sampleEvents.length} sample events and ${storedCustomEvents.length} custom events`)
      } catch (error) {
        console.error('Failed to initialize events:', error)
        // Fallback to just sample events
        setEvents(sampleEvents)
      }
    }
    
    // Initialize immediately
    initializeEvents()
    
    // Also try to reload after a short delay in case of timing issues
    const timeoutId = setTimeout(() => {
      const storedCustomEvents = loadCustomEventsFromStorage()
      
      if (storedCustomEvents.length > 0) {
        setEvents(prev => {
          const currentCustomCount = prev.filter(e => e.isCustom).length
          
          if (currentCustomCount !== storedCustomEvents.length) {
            console.log('🔄 Reloading events due to count mismatch')
            return [...sampleEvents, ...storedCustomEvents]
          }
          return prev
        })
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [])

  // Simulate data loading with progress tracking (only on first load)
  useEffect(() => {
    // Only show loading for initial load, not every re-render
    if (events.length > 0) return;
    
    const simulateLoading = () => {
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
      
      // Simulate API call completion after 1-2 seconds (shorter for better UX)
      const loadingTimeout = setTimeout(() => {
        clearInterval(progressInterval)
        setLoadingProgress(100)
        
        // Show completion for 300ms before hiding
        setTimeout(() => {
          setIsLoading(false)
          setLoadingProgress(0)
        }, 300)
      }, 2000) // 2 seconds
      
      return () => {
        clearInterval(progressInterval)
        clearTimeout(loadingTimeout)
      }
    }
    
    // Only trigger loading on component mount when there are no events
    const cleanup = simulateLoading()
    return cleanup
  }, [])



  // Category options
  const categoryData = [
    { id: "all", name: "All", icon: Globe },
    { id: "conference", name: "Conference", icon: Presentation },
    { id: "tradeshow", name: "Trade Shows", icon: Building },
    { id: "workshop", name: "Workshop", icon: GraduationCap },
    { id: "social", name: "Social", icon: PartyPopper },
    { id: "holidays", name: "Holidays", icon: Sparkles }
  ]
  
  // Country options
  const countryOptions = [  
    { id: "usa", label: "United States", flag: "🇺🇸" },
    { id: "uae", label: "United Arab Emirates", flag: "🇦🇪" },
    { id: "uk", label: "United Kingdom", flag: "🇬🇧" },
    { id: "france", label: "France", flag: "🇫🇷" },
    { id: "germany", label: "Germany", flag: "🇩🇪" },
    { id: "japan", label: "Japan", flag: "🇯🇵" },
    { id: "spain", label: "Spain", flag: "🇪🇸" },
    { id: "italy", label: "Italy", flag: "🇮🇹" },
    { id: "australia", label: "Australia", flag: "🇦🇺" },
    { id: "canada", label: "Canada", flag: "🇨🇦" },
    { id: "singapore", label: "Singapore", flag: "🇸🇬" },
    { id: "thailand", label: "Thailand", flag: "🇹🇭" }
  ]

  // City options based on selected country
  const cityOptions = {
    "United States": [
      { id: "nyc", label: "New York" },
      { id: "la", label: "Los Angeles" },
      { id: "chicago", label: "Chicago" },
      { id: "miami", label: "Miami" },
      { id: "vegas", label: "Las Vegas" }
    ],
    "United Arab Emirates": [
      { id: "dubai", label: "Dubai" },
      { id: "abudhabi", label: "Abu Dhabi" },
      { id: "sharjah", label: "Sharjah" },
      { id: "fujairah", label: "Fujairah" }
    ],
    "United Kingdom": [
      { id: "london", label: "London" },
      { id: "manchester", label: "Manchester" },
      { id: "birmingham", label: "Birmingham" },
      { id: "edinburgh", label: "Edinburgh" },
      { id: "liverpool", label: "Liverpool" }
    ],
    "France": [
      { id: "paris", label: "Paris" },
      { id: "marseille", label: "Marseille" },
      { id: "lyon", label: "Lyon" },
      { id: "nice", label: "Nice" },
      { id: "cannes", label: "Cannes" }
    ],
    "Germany": [
      { id: "berlin", label: "Berlin" },
      { id: "munich", label: "Munich" },
      { id: "hamburg", label: "Hamburg" },
      { id: "cologne", label: "Cologne" },
      { id: "frankfurt", label: "Frankfurt" }
    ],
    "Japan": [
      { id: "tokyo", label: "Tokyo" },
      { id: "osaka", label: "Osaka" },
      { id: "kyoto", label: "Kyoto" },
      { id: "yokohama", label: "Yokohama" },
      { id: "kobe", label: "Kobe" }
    ],
    "Spain": [
      { id: "madrid", label: "Madrid" },
      { id: "barcelona", label: "Barcelona" },
      { id: "valencia", label: "Valencia" },
      { id: "seville", label: "Seville" },
      { id: "bilbao", label: "Bilbao" }
    ],
    "Italy": [
      { id: "rome", label: "Rome" },
      { id: "milan", label: "Milan" },
      { id: "venice", label: "Venice" },
      { id: "florence", label: "Florence" },
      { id: "naples", label: "Naples" }
    ],
    "Australia": [
      { id: "sydney", label: "Sydney" },
      { id: "melbourne", label: "Melbourne" },
      { id: "brisbane", label: "Brisbane" },
      { id: "perth", label: "Perth" },
      { id: "adelaide", label: "Adelaide" }
    ],
    "Canada": [
      { id: "toronto", label: "Toronto" },
      { id: "vancouver", label: "Vancouver" },
      { id: "montreal", label: "Montreal" },
      { id: "calgary", label: "Calgary" },
      { id: "ottawa", label: "Ottawa" }
    ],
    "Singapore": [
      { id: "downtown", label: "Downtown Core" },
      { id: "orchard", label: "Orchard" },
      { id: "marina", label: "Marina Bay" },
      { id: "sentosa", label: "Sentosa" }
    ],
    "Thailand": [
      { id: "bangkok", label: "Bangkok" },
      { id: "phuket", label: "Phuket" },
      { id: "chiangmai", label: "Chiang Mai" },
      { id: "pattaya", label: "Pattaya" },
      { id: "krabi", label: "Krabi" }
    ]
  }



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
  const filteredCountryOptions = countryOptions.filter(option =>
    option.label.toLowerCase().includes(countrySearchQuery.toLowerCase())
  )

  // Filter city options based on search query
  const filteredCityOptions = cityOptions[selectedCountry as keyof typeof cityOptions]?.filter(option =>
    option.label.toLowerCase().includes(citySearchQuery.toLowerCase())
  ) || []

  // Handle country selection
  const handleCountrySelect = useCallback((country: string) => {
    setSelectedCountry(country)
    setIsCountryOpen(false)
    setCountrySearchQuery("") // Clear search when selecting
    setIsCountrySearchFocused(false) // Clear focus state
    
    // Auto-select first city of the new country
    const cities = cityOptions[country as keyof typeof cityOptions]
    if (cities && cities.length > 0) {
      setSelectedCity(cities[0].label)
    }
    
    console.log(`🌍 Country changed: ${country}`)
  }, [cityOptions])

  // Handle city selection
  const handleCitySelect = useCallback((city: string) => {
    setSelectedCity(city)
    setIsCityOpen(false)
    setCitySearchQuery("") // Clear search when selecting
    setIsCitySearchFocused(false) // Clear focus state
    console.log(`🏙️ City changed: ${city}`)
  }, [])

  // Handle category selection with multi-select logic
  const handleCategorySelect = useCallback((categoryName: string) => {
    setSelectedCategories(prev => {
      const isSelected = prev.includes(categoryName)
      let newSelection: string[]

      if (categoryName === "All") {
        // If selecting "All", clear all others
        newSelection = isSelected ? [] : categoryData.map(c => c.name)
      } else {
        // If selecting a specific category
        if (isSelected) {
          // Remove the category
          newSelection = prev.filter(c => c !== categoryName)
        } else {
          // Add the category and remove "All" if present
          const filteredSelection = prev.filter(c => c !== "All")
          newSelection = [...filteredSelection, categoryName]
        }
      }
      
      // If all categories are selected or none, reset to "All"
      if (newSelection.length === categoryData.length - 1 || newSelection.length === categoryData.length) {
        newSelection = categoryData.map(c => c.name)
      } else {
        newSelection = newSelection.filter(c => c !== "All")
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



  const [newEvent, setNewEvent] = useState({
    name: "",
    startDate: "",
    endDate: "",
    category: "conference" as "conference" | "tradeshow" | "workshop" | "social",
    country: "",
    city: "",
    description: "",
  })

  // Add Event modal states
  const [newEventCountry, setNewEventCountry] = useState("")
  const [newEventCity, setNewEventCity] = useState("")
  
  // Edit Event modal states
  const [isEditEventOpen, setIsEditEventOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  // Handle new event country selection
  const handleNewEventCountrySelect = (country: string) => {
    setNewEventCountry(country)
    setNewEvent((prev) => ({ ...prev, country }))
    
    // Auto-select first city of the new country
    const cities = cityOptions[country as keyof typeof cityOptions]
    if (cities && cities.length > 0) {
      const firstCity = cities[0].label
      setNewEventCity(firstCity)
      setNewEvent((prev) => ({ ...prev, city: firstCity }))
    } else {
      setNewEventCity("")
      setNewEvent((prev) => ({ ...prev, city: "" }))
    }
  }

  // Handle new event city selection
  const handleNewEventCitySelect = (city: string) => {
    setNewEventCity(city)
    setNewEvent((prev) => ({ ...prev, city }))
  }

  // Handle edit event
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setNewEvent({
      name: event.name,
      startDate: event.startDate,
      endDate: event.endDate,
      category: event.type as typeof newEvent.category,
      country: event.country || "",
      city: event.location.split(", ")[0] || "",
      description: event.description,
    })
    setNewEventCountry(event.country || "")
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
    const event = events.find(e => e.id === eventId)
    if (event && event.isCustom) {
      setEventToDelete(event)
      setIsDeleteDialogOpen(true)
    }
  }

  // Handle delete event after confirmation
  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => {
      const updatedEvents = prev.filter((event) => event.id !== eventId)
      // Save only custom events to localStorage
      const customEvents = updatedEvents.filter(e => e.isCustom)
      saveCustomEventsToStorage(customEvents)
      return updatedEvents
    })
    setIsDeleteDialogOpen(false)
    setEventToDelete(null)
  }

  // Handle save edited event
  const handleSaveEditedEvent = () => {
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
    
    setEvents((prev) => {
      const updatedEvents = prev.map((event) => 
        event.id === editingEvent.id ? updatedEvent : event
      )
      // Save only custom events to localStorage
      const customEvents = updatedEvents.filter(e => e.isCustom)
      saveCustomEventsToStorage(customEvents)
      return updatedEvents
    })
    
    setIsEditEventOpen(false)
    setEditingEvent(null)
    setNewEvent({
      name: "",
      startDate: "",
      endDate: "",
      category: "conference",
      country: "",
      city: "",
      description: "",
    })
    setNewEventCountry("")
    setNewEventCity("")
  }

  // Fetch events from API
  useEffect(() => {
    const fetchEventsData = async () => {
      try {
        setIsLoading(true)
        const filtersValue = {
          startDate: startDate || new Date().toISOString().split('T')[0],
          endDate: endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days ahead
        }
        
        const response = await getAllEvents(filtersValue)
        if (response?.status && response?.body?.eventDetails) {
          setApiEvents(response.body.eventDetails)
        }
      } catch (error) {
        console.error('Failed to fetch events:', error)
        // Fallback to sample data if API fails
        setApiEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchEventsData()
  }, [startDate, endDate])

  // Combine API events with sample events
  useEffect(() => {
    const combinedEvents = [...sampleEvents]
    
    // Convert API events to our Event interface format
    apiEvents.forEach((apiEvent, index) => {
      const convertedEvent: Event = {
        id: `api-${index}`,
        name: apiEvent.eventName || 'Unnamed Event',
        startDate: apiEvent.startDate || apiEvent.displayDate || new Date().toISOString().split('T')[0],
        endDate: apiEvent.endDate || apiEvent.displayDate || new Date().toISOString().split('T')[0],
        category: apiEvent.eventType === 'business' ? 'business' : 'social',
        location: apiEvent.location || 'Dubai, UAE',
        description: apiEvent.description || 'Event details not available',
        status: "suggested" as const,
        country: apiEvent.country || 'UAE',
        flag: apiEvent.flag || '🇦🇪',

        type: apiEvent.eventType || 'business',
        priority: apiEvent.eventColor === 'high' ? 'high' : apiEvent.eventColor === 'medium' ? 'medium' : 'low'
      }
      combinedEvents.push(convertedEvent)
    })

    setEvents(combinedEvents)
  }, [apiEvents])

  // Filter events based on current view and enabled event types
  useEffect(() => {
    let filtered = events.filter((event) => {
      // Check each event type independently and only show if enabled
      
      // Status-based filtering (bookmarked)
      if (event.status === "bookmarked" && enabledEventTypes.bookmarked) return true
      
      // Type-based filtering (holidays)  
      if (event.type === "holiday" && enabledEventTypes.holidays) return true
      
      // For other events, show them by default for now (since we don't have legend buttons for them yet)
      // But we need to make sure they don't conflict with status-based filtering
      if (event.status !== "bookmarked" && event.type !== "holiday") {
        return true // Show other events by default
      }
      
      return false
    })

    setFilteredEvents(filtered)
  }, [events, enabledEventTypes])

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

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
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

  const handleAddEvent = () => {
    const event: Event = {
      id: Date.now().toString(),
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
    }
    
    setEvents((prev) => {
      const updatedEvents = [...prev, event]
      // Save only custom events to localStorage
      const customEvents = updatedEvents.filter(e => e.isCustom)
      saveCustomEventsToStorage(customEvents)
      return updatedEvents
    })
    
    setNewEvent({
      name: "",
      startDate: "",
      endDate: "",
      category: "conference",
      country: "",
      city: "",
      description: "",
    })
    setNewEventCountry("")
    setNewEventCity("")
    setIsStartDateOpen(false)
    setIsEndDateOpen(false)
    setDescriptionError("")
    setIsAddEventOpen(false)
  }

  const toggleBookmark = (eventId: string) => {
    setEvents((prev) => {
      const updatedEvents = prev.map((event) =>
        event.id === eventId
          ? {
              ...event,
              status: (event.status === "bookmarked" || event.status === "suggested") ? "available" : "bookmarked",
            }
          : event,
      )
      
      // Save only custom events to localStorage
      const customEvents = updatedEvents.filter(e => e.isCustom)
      saveCustomEventsToStorage(customEvents)
      
      return updatedEvents
    })
  }

  const getEventsForDate = useCallback((day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return filteredEvents.filter((event) => {
      const eventStart = new Date(event.startDate + "T00:00:00")
      const eventEnd = new Date(event.endDate + "T23:59:59")
      const checkDate = new Date(dateStr + "T12:00:00")
      return checkDate >= eventStart && checkDate <= eventEnd
    })
  }, [currentDate, filteredEvents])

  // Get events for calendar display - show events on all days from start to end date
  const getEventsForCalendarDisplay = useCallback((day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return filteredEvents.filter((event) => {
      const eventStart = new Date(event.startDate + "T00:00:00")
      const eventEnd = new Date(event.endDate + "T23:59:59")
      const checkDate = new Date(dateStr + "T12:00:00")
      
      // Show events on all days from start to end date (inclusive)
      return checkDate >= eventStart && checkDate <= eventEnd
    })
  }, [currentDate, filteredEvents])

  const getEventsForSelectedDate = () => {
    if (!selectedDate) return []
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    return filteredEvents.filter((event) => {
      const eventStart = new Date(event.startDate + "T00:00:00")
      const eventEnd = new Date(event.endDate + "T23:59:59")
      const checkDate = new Date(dateStr + "T12:00:00")
      return checkDate >= eventStart && checkDate <= eventEnd
    })
  }

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
      case "conference":
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
    // Priority order: bookmarked > holiday > suggested > default
    if (event.status === "bookmarked") return "bg-gradient-to-r from-green-50 to-green-25 text-green-700 border border-green-200 border-l-4 border-l-green-500 shadow-sm dark:from-green-900 dark:to-green-800 dark:text-green-300 dark:border-green-600 dark:border-l-green-400"
    if (event.type === "holiday") return "bg-gradient-to-r from-purple-50 to-purple-25 text-purple-700 border border-purple-200 border-l-4 border-l-purple-500 shadow-sm dark:from-purple-900 dark:to-purple-800 dark:text-purple-300 dark:border-purple-600 dark:border-l-purple-400"
    if (event.status === "suggested") return "bg-gradient-to-r from-blue-50 to-blue-25 text-blue-700 border border-blue-200 border-l-4 border-l-blue-500 shadow-sm dark:from-blue-900 dark:to-blue-800 dark:text-blue-300 dark:border-blue-600 dark:border-l-blue-400"
    return "bg-gradient-to-r from-gray-50 to-gray-25 text-gray-700 border border-gray-200 border-l-4 border-l-gray-400 shadow-sm dark:from-gray-800 dark:to-gray-700 dark:text-gray-300 dark:border-gray-600 dark:border-l-gray-500"
  }

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
  const getFilteredBookmarkEvents = useMemo(() => {
    let filtered = events

    // Apply bookmark search filter
    if (bookmarkSearchQuery) {
      const searchLower = bookmarkSearchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower),
      )
    }

    // Apply category filter
    if (!bookmarkCategoryFilter.includes("all")) {
      filtered = filtered.filter((event) => {
        return bookmarkCategoryFilter.some(category => {
          if (category === "social" || category === "business") {
            return event.category === category
          } else if (category === "holidays") {
            return event.type === "holiday"
          } else {
            return event.type === category
          }
        })
      })
    }

    // Apply type filter
    if (!bookmarkTypeFilter.includes("all")) {
      filtered = filtered.filter((event) => {
        return bookmarkTypeFilter.some(type => {
          if (type === "bookmarked" || type === "suggested" || type === "available") {
            return event.status === type
          } else {
            return event.type === type
          }
        })
      })
    }

    return filtered.sort((a, b) => {
      // Sort bookmarked events first, then by date
      if (a.status === "bookmarked" && b.status !== "bookmarked") return -1
      if (b.status === "bookmarked" && a.status !== "bookmarked") return 1
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    })
  }, [events, bookmarkSearchQuery, bookmarkCategoryFilter, bookmarkTypeFilter])

  // Handle category selection with multi-select logic
  const handleCategorySelection = (category: string) => {
    setBookmarkCategoryFilter(prev => {
      if (category === "all") {
        // If selecting "All", toggle between all selected and all unselected
        if (prev.includes("all")) {
          return [] // Unselect all
        } else {
          return ["all", "conference", "tradeshow", "workshop", "social", "holidays"] // Select all
        }
      }
      
      const isSelected = prev.includes(category)
      let newSelection: string[]
      
      if (isSelected) {
        // Remove the category and "all" if present
        newSelection = prev.filter(c => c !== category && c !== "all")
      } else {
        // Add the category and remove "all" if present
        newSelection = prev.filter(c => c !== "all")
        newSelection = [...newSelection, category]
        
        // If all individual categories are now selected, add "all"
        if (newSelection.length === 5) {
          newSelection = ["all", ...newSelection]
        }
      }
      
      return newSelection
    })
  }

  // Get display text for bookmark category filter
  const getBookmarkCategoryDisplayText = () => {
    if (bookmarkCategoryFilter.includes("all") || bookmarkCategoryFilter.length === 5) {
      return "All Categories"
    }
    if (bookmarkCategoryFilter.length === 1) {
      const category = bookmarkCategoryFilter[0]
      if (category === "holidays") return "Holidays"
      if (category === "tradeshow") return "Trade Shows"
      return category.charAt(0).toUpperCase() + category.slice(1)
    }
    return `${bookmarkCategoryFilter.length} Categories`
  }

  // Handle type selection with multi-select logic
  const handleTypeSelection = (type: string) => {
    setBookmarkTypeFilter(prev => {
      if (type === "all") {
        // If selecting "All", toggle between all selected and all unselected
        if (prev.includes("all")) {
          return [] // Unselect all
        } else {
          return ["all", "bookmarked", "holidays", "suggested", "available"] // Select all
        }
      }
      
      const isSelected = prev.includes(type)
      let newSelection: string[]
      
      if (isSelected) {
        // Remove the type and "all" if present
        newSelection = prev.filter(t => t !== type && t !== "all")
      } else {
        // Add the type and remove "all" if present
        newSelection = prev.filter(t => t !== "all")
        newSelection = [...newSelection, type]
        
        // If all individual types are now selected, add "all"
        if (newSelection.length === 4) {
          newSelection = ["all", ...newSelection]
        }
      }
      
      return newSelection
    })
  }

  // Get display text for bookmark type filter
  const getBookmarkTypeDisplayText = () => {
    if (bookmarkTypeFilter.includes("all") || bookmarkTypeFilter.length === 4) {
      return "All Events"
    }
    if (bookmarkTypeFilter.length === 1) {
      const type = bookmarkTypeFilter[0]
      if (type === "bookmarked") return "Bookmarked"
      if (type === "holidays") return "Holidays"
      if (type === "suggested") return "Suggested"
      if (type === "available") return "Available"
      return type.charAt(0).toUpperCase() + type.slice(1)
    }
    return `${bookmarkTypeFilter.length} Types`
  }

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

  const renderEventsList = () => {
    // Filter events for the currently selected month
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()
    
    const monthFilteredEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate.getFullYear() === currentYear && eventDate.getMonth() === currentMonth
    })

    // Group events by date
    const groupedEvents = monthFilteredEvents.reduce(
      (acc, event) => {
        const date = new Date(event.startDate).toDateString()
        if (!acc[date]) acc[date] = []
        acc[date].push(event)
        return acc
      },
      {} as Record<string, Event[]>,
    )

    return (
      <Card className="overflow-hidden">
        <div className="relative">
          {/* Fixed Table Header */}
          <div className="sticky top-0 z-10 bg-background border-b">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-muted-foreground">
              <div className="col-span-6">Event Name</div>
              <div className="col-span-2 text-left">Date Range</div>
              <div className="col-span-2 text-left">Type</div>
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
        {Object.entries(groupedEvents).map(([date, events]) => (
                  <div key={date}>
                                        {/* Date Row */}
                    <div className="bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800 px-4 py-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          {formatListHeader(date)}
                        </span>
                        <span className="text-xs text-blue-600 dark:text-blue-400 ml-12">
                          {events.length} event{events.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    
                    {/* Events for this date */}
                    <div className="divide-y divide-border">
              {events.map((event) => (
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
                            toggleBookmark(event.id)
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
                                showDeleteConfirmation(event.id)
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
                      <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")} className="hover:bg-primary/10">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-slate-800 text-white border-slate-700">
                      <p className="text-xs">Previous month</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <h1 className="text-base font-medium text-foreground px-2">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h1>
                

                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")} className="hover:bg-primary/10">
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
                        <Globe className="w-4 h-4 shrink-0" />
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
                              e.target.focus()
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
                                  <span className="text-sm mr-2">{option.flag}</span>
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
                          {selectedCity}
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
                              e.target.focus()
                            }}
                            onFocus={() => setIsCitySearchFocused(true)}
                            onBlur={() => setIsCitySearchFocused(false)}
                          />
                          <div className="space-y-1">
                            {filteredCityOptions.map((option) => (
                              <Button
                                key={option.id}
                                variant={selectedCity === option.label ? "default" : "ghost"}
                                size="sm"
                                className="w-full justify-start text-left h-auto py-2 px-3"
                                onClick={() => handleCitySelect(option.label)}
                              >
                                <span className={cn(
                                  "text-sm font-medium",
                                  selectedCity === option.label ? "text-white" : "text-foreground"
                                )}>
                                  {option.label}
                                </span>
                              </Button>
                            ))}
                          </div>
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
                                  checked={selectedCategories.includes(option.name)}
                                  onChange={() => handleCategorySelect(option.name)}
                                />
                                <option.icon className="w-4 h-4 mr-2 opacity-70" />
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
                <DialogContent className="max-w-4xl h-[600px] min-h-[500px] flex flex-col">
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
                      <DropdownMenu>
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
                                checked={bookmarkCategoryFilter.includes("all")}
                                onChange={() => handleCategorySelection("all")}
                                className="rounded h-3.5 w-3.5"
                              />
                              <span>All</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-white text-sm">
                              <input
                                type="checkbox"
                                checked={bookmarkCategoryFilter.includes("conference")}
                                onChange={() => handleCategorySelection("conference")}
                                className="rounded h-3.5 w-3.5"
                              />
                              <span>Conference</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-white text-sm">
                              <input
                                type="checkbox"
                                checked={bookmarkCategoryFilter.includes("tradeshow")}
                                onChange={() => handleCategorySelection("tradeshow")}
                                className="rounded h-3.5 w-3.5"
                              />
                              <span>Trade Shows</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-white text-sm">
                              <input
                                type="checkbox"
                                checked={bookmarkCategoryFilter.includes("workshop")}
                                onChange={() => handleCategorySelection("workshop")}
                                className="rounded h-3.5 w-3.5"
                              />
                              <span>Workshop</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-white text-sm">
                              <input
                                type="checkbox"
                                checked={bookmarkCategoryFilter.includes("social")}
                                onChange={() => handleCategorySelection("social")}
                                className="rounded h-3.5 w-3.5"
                              />
                              <span>Social</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-white text-sm">
                              <input
                                type="checkbox"
                                checked={bookmarkCategoryFilter.includes("holidays")}
                                onChange={() => handleCategorySelection("holidays")}
                                className="rounded h-3.5 w-3.5"
                              />
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
                              <Check className="h-3 w-3" />
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
                                checked={bookmarkTypeFilter.includes("all")}
                                onChange={() => handleTypeSelection("all")}
                                className="rounded h-3.5 w-3.5"
                              />
                              <span>All</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-white text-sm">
                              <input
                                type="checkbox"
                                checked={bookmarkTypeFilter.includes("bookmarked")}
                                onChange={() => handleTypeSelection("bookmarked")}
                                className="rounded h-3.5 w-3.5"
                              />
                              <span>Bookmarked</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-white text-sm">
                              <input
                                type="checkbox"
                                checked={bookmarkTypeFilter.includes("holidays")}
                                onChange={() => handleTypeSelection("holidays")}
                                className="rounded h-3.5 w-3.5"
                              />
                              <span>Holidays</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-white text-sm">
                              <input
                                type="checkbox"
                                checked={bookmarkTypeFilter.includes("suggested")}
                                onChange={() => handleTypeSelection("suggested")}
                                className="rounded h-3.5 w-3.5"
                              />
                              <span>Suggested</span>
                            </label>

                            <label className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded hover:bg-white text-sm">
                              <input
                                type="checkbox"
                                checked={bookmarkTypeFilter.includes("available")}
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
                        getFilteredBookmarkEvents.map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors",
                            (event.status === "bookmarked" || event.status === "suggested") && "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="flex items-start gap-2">
                                <h3 className="text-sm font-medium leading-snug flex-1">{event.name}</h3>
                                <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                                  {event.status === "bookmarked" && (
                                    <Star className="h-3 w-3 fill-current text-green-600" />
                                  )}
                                  {event.type === "holiday" && <Sparkles className="h-3 w-3 text-purple-600" />}
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
                            <Badge className={cn("border text-xs", getStatusColor(event.status))}>
                              {event.status === "available" ? "Available" : event.status}
                            </Badge>
                            
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
                                  onClick={() => showDeleteConfirmation(event.id)}
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
                              onClick={() => toggleBookmark(event.id)}
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
                        ))
                      )}
                    </div>
                  </ScrollArea>

                  <div className="flex items-center justify-between pt-3 border-t flex-shrink-0">
                    <div className="text-xs text-muted-foreground">
                      {events.filter((e) => e.status === "bookmarked").length} events bookmarked
                    </div>
                    <Button onClick={() => setIsBookmarkModalOpen(false)} className="px-4 py-2 text-sm">Done</Button>
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
                                value="conference"
                                className={cn(
                                  "flex items-center gap-2 cursor-pointer pl-3 [&>span:first-child]:hidden",
                                  newEvent.category === "conference" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : ""
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <Presentation className="h-4 w-4" />
                                  <span>Conference</span>
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
                                  <Building className="h-4 w-4" />
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
                                  <GraduationCap className="h-4 w-4" />
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
                                  <PartyPopper className="h-4 w-4" />
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
                                  if (!newEvent.startDate) return false
                                  const startDate = new Date(newEvent.startDate)
                                  // Normalize dates to compare only date part (not time)
                                  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                                  const compareStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
                                  // Allow same date (>=) but disable dates before start date
                                  return compareDate < compareStartDate
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
                          <Select
                            value={newEventCountry}
                            onValueChange={handleNewEventCountrySelect}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              <ScrollArea className="h-60">
                                {countryOptions.map((option) => (
                                  <SelectItem 
                                    key={option.id} 
                                    value={option.label}
                                    className={cn(
                                      "flex items-center gap-2 cursor-pointer pl-3 [&>span:first-child]:hidden",
                                      newEventCountry === option.label ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : ""
                                    )}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">{option.flag}</span>
                                      <span>{option.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="city">City *</Label>
                        <div className="mt-1">
                          <Select
                            value={newEventCity}
                            onValueChange={handleNewEventCitySelect}
                            disabled={!newEventCountry}
                          >
                            <SelectTrigger className="w-full [&>svg]:hidden">
                              <SelectValue placeholder={newEventCountry ? "Select a city" : "Select country first"} />
                            </SelectTrigger>
                            <SelectContent className="max-h-60" hideScrollButtons={true}>
                              <ScrollArea className="h-60">
                                {newEventCountry && cityOptions[newEventCountry as keyof typeof cityOptions]?.map((option) => (
                                  <SelectItem 
                                    key={option.id} 
                                    value={option.label}
                                    className={cn(
                                      "cursor-pointer pl-3 [&>span:first-child]:hidden",
                                      newEventCity === option.label ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : ""
                                    )}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
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
                                value="conference"
                                className={cn(
                                  "flex items-center gap-2 cursor-pointer pl-3 [&>span:first-child]:hidden",
                                  newEvent.category === "conference" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : ""
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <Presentation className="h-4 w-4" />
                                  <span>Conference</span>
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
                                  <Building className="h-4 w-4" />
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
                                  <GraduationCap className="h-4 w-4" />
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
                                  <PartyPopper className="h-4 w-4" />
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
                                  if (!newEvent.startDate) return false
                                  const startDate = new Date(newEvent.startDate)
                                  // Normalize dates to compare only date part (not time)
                                  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                                  const compareStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
                                  // Allow same date (>=) but disable dates before start date
                                  return compareDate < compareStartDate
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
                          <Select
                            value={newEventCountry}
                            onValueChange={handleNewEventCountrySelect}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              <ScrollArea className="h-60">
                                {countryOptions.map((option) => (
                                  <SelectItem 
                                    key={option.id} 
                                    value={option.label}
                                    className={cn(
                                      "flex items-center gap-2 cursor-pointer pl-3 [&>span:first-child]:hidden",
                                      newEventCountry === option.label ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : ""
                                    )}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">{option.flag}</span>
                                      <span>{option.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="edit-city">City *</Label>
                        <div className="mt-1">
                          <Select
                            value={newEventCity}
                            onValueChange={handleNewEventCitySelect}
                            disabled={!newEventCountry}
                          >
                            <SelectTrigger className="w-full [&>svg]:hidden">
                              <SelectValue placeholder={newEventCountry ? "Select a city" : "Select country first"} />
                            </SelectTrigger>
                            <SelectContent className="max-h-60" hideScrollButtons={true}>
                              <ScrollArea className="h-60">
                                {newEventCountry && cityOptions[newEventCountry as keyof typeof cityOptions]?.map((option) => (
                                  <SelectItem 
                                    key={option.id} 
                                    value={option.label}
                                    className={cn(
                                      "cursor-pointer pl-3 [&>span:first-child]:hidden",
                                      newEventCity === option.label ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : ""
                                    )}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
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
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Events for{" "}
              {selectedDate ? formatListHeader(selectedDate.toISOString()) : ""}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-96">
            <div className="space-y-3">
              {getEventsForSelectedDate().map((event) => (
                <div
                  key={event.id}
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
                  <div className="flex items-center gap-4">

                    <div className="text-left">
                      <div>
                        <h3 className="font-semibold text-foreground leading-snug text-left">
                          {event.name}
                          {(event.status === "bookmarked" || event.status === "suggested") && <Star className="h-4 w-4 fill-current text-green-600 inline ml-1" />}
                          {event.type === "holiday" && <Sparkles className="h-4 w-4 text-purple-600 inline ml-1" />}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 text-left">
                        <div className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {event.startDate === event.endDate ? formatSingleDate(event.startDate) : formatDateRange(event.startDate, event.endDate)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 text-left">{event.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={cn("border", getStatusColor(event.status))}>
                      {event.status === "available" ? "Available" : event.status}
                    </Badge>
                    <div className="relative group">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleBookmark(event.id)
                        }}
                      >
                        <BookmarkIcon
                          className={cn("h-4 w-4", (event.status === "bookmarked" || event.status === "suggested") ? "fill-current text-green-600" : "")}
                        />
                      </Button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {(event.status === "bookmarked" || event.status === "suggested") ? "Remove Bookmark" : "Bookmark Event"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {getEventsForSelectedDate().length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No events on this day</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {getEventsForSelectedDate().length} event{getEventsForSelectedDate().length !== 1 ? "s" : ""} on this day
            </div>
            <Button onClick={() => setIsDayViewOpen(false)} className="px-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-left">
                <div className="mb-3">
                  <div className="leading-relaxed break-words">
                    {selectedEvent.name}
                    {selectedEvent.status === "bookmarked" && <Star className="h-5 w-5 fill-current text-green-600 inline ml-2" />}
                    {selectedEvent.type === "holiday" && <Sparkles className="h-5 w-5 text-purple-600 inline ml-2" />}
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
                        onClick={() => showDeleteConfirmation(selectedEvent.id)}
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
                      variant={(selectedEvent.status === "bookmarked" || selectedEvent.status === "suggested") ? "default" : "outline"}
                      onClick={() => toggleBookmark(selectedEvent.id)}
                      className={cn(
                        "px-4 gap-3",
                        (selectedEvent.status === "bookmarked" || selectedEvent.status === "suggested")
                          ? "bg-green-600 hover:bg-green-700"
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
                      onClick={() => toggleBookmark(selectedEvent.id)}
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
      )}

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
              onClick={() => eventToDelete && handleDeleteEvent(eventToDelete.id)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
