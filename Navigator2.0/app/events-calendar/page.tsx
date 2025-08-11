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
  Calendar,
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { getAllEvents } from "@/lib/events"
import { useDateContext } from "@/components/date-context"

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



// Custom Event Tooltip Component
const EventTooltip = ({ children, event, isVisible, day, currentDate }: { 
  children: React.ReactNode; 
  event: Event; 
  isVisible: boolean;
  day: number;
  currentDate: Date;
}) => {
  // Calculate adaptive width based on event name length
  const getTooltipWidth = () => {
    const nameLength = event.name.length
    if (nameLength <= 15) return "w-48"      // 192px for short names
    if (nameLength <= 25) return "w-64"      // 256px for medium names  
    if (nameLength <= 35) return "w-80"      // 320px for long names
    return "w-96"                            // 384px for very long names
  }

  // Get calendar date (event start date)
  const getCalendarDate = () => {
    const eventDate = new Date(event.startDate)
    return eventDate.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short' 
    })
  }

  // Format date range for multi-day events only
  const getEventDateRange = () => {
    if (event.startDate === event.endDate) {
      // Single day event - return empty string (no date shown)
      return ""
    } else {
      // Multi-day event - show range
      const startDate = new Date(event.startDate)
      const endDate = new Date(event.endDate)
      
      const startFormatted = startDate.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: 'short' 
      })
      const endFormatted = endDate.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: 'short' 
      })
      return `${startFormatted} - ${endFormatted}`
    }
  }

  // Determine tooltip position based on calendar cell location
  const getTooltipPosition = () => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const dayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday, 6 = Saturday
    const currentDayOfWeek = (dayOfWeek + day - 1) % 7
    const weekNumber = Math.floor((dayOfWeek + day - 1) / 7)
    
    // Determine position
    const isLeftEdge = currentDayOfWeek === 0 || currentDayOfWeek === 1 // Sunday or Monday
    const isRightEdge = currentDayOfWeek === 5 || currentDayOfWeek === 6 // Friday or Saturday  
    const isTopRow = weekNumber === 0 // First week
    
    if (isTopRow) return 'bottom'
    if (isLeftEdge) return 'right'
    if (isRightEdge) return 'left'
    return 'top' // Default position
  }

  const position = getTooltipPosition()

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return "top-full left-1/2 transform -translate-x-1/2 mt-2"
      case 'left':
        return "right-full top-1/2 transform -translate-y-1/2 mr-2"
      case 'right':
        return "left-full top-1/2 transform -translate-y-1/2 ml-2"
      default: // 'top'
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2"
    }
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

  return (
    <div className="relative inline-block w-full">
      {children}
      {isVisible && (
        <div className={cn(
          "absolute z-50 pt-3 pb-3 pl-3 pr-0 bg-slate-900 text-white rounded-lg shadow-xl border border-slate-700 pointer-events-none",
          getTooltipWidth(),
          getPositionClasses()
        )}>
          {/* Arrow */}
          <div className={getArrowClasses()}></div>
          
          {/* Tooltip Content */}
          <div className="space-y-2">
            {/* Calendar Date at Top */}
            <div className="text-sm font-medium text-white mb-1">
              {getCalendarDate()}
            </div>
            
            {/* Event Details */}
            <div className="border-t border-gray-600 pt-2">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-3 w-3 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">{event.name}</span>
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
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 1)) // August 2025 - has events
  const [events, setEvents] = useState<Event[]>(sampleEvents)
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false)

  const [isDayViewOpen, setIsDayViewOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const [bookmarkSearchQuery, setBookmarkSearchQuery] = useState("")
  const [bookmarkCategoryFilter, setBookmarkCategoryFilter] = useState<string[]>(["all", "conference", "tradeshow", "workshop", "social", "holidays"])
  const [bookmarkTypeFilter, setBookmarkTypeFilter] = useState<string[]>(["all", "bookmarked", "holidays", "suggested"])
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

  // Country dropdown state
  const [isCountryOpen, setIsCountryOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("United States")
  
  // City dropdown state
  const [isCityOpen, setIsCityOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState("New York")

  // Category dropdown state
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"])

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
    suggested: boolean;
    holidays: boolean;
    conferences: boolean;
    social: boolean;
  }>({
    bookmarked: true, // This now includes suggested events by default
    suggested: true, // Enabled by default to show suggested events
    holidays: true,
    conferences: true, // For business conferences
    social: true, // For social events
  })

  const toggleEventType = (type: 'bookmarked' | 'suggested' | 'holidays' | 'conferences' | 'social') => {
    setEnabledEventTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  // Handle country selection
  const handleCountrySelect = useCallback((country: string) => {
    setSelectedCountry(country)
    setIsCountryOpen(false)
    
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
    category: "business" as "social" | "business",
    location: "",
    description: "",
  })

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
      
      // Status-based filtering (bookmarked/suggested)
      if (event.status === "bookmarked" && enabledEventTypes.bookmarked) return true
      if (event.status === "suggested" && enabledEventTypes.suggested) return true
      
      // Type-based filtering (holidays)  
      if (event.type === "holiday" && enabledEventTypes.holidays) return true
      
      // For other events, show them by default for now (since we don't have legend buttons for them yet)
      // But we need to make sure they don't conflict with status-based filtering
      if (event.status !== "bookmarked" && event.status !== "suggested" && event.type !== "holiday") {
        return true // Show other events by default
      }
      
      return false
    })

    setFilteredEvents(filtered)
  }, [events, enabledEventTypes])

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

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

  const handleAddEvent = () => {
    const event: Event = {
      id: Date.now().toString(),
      ...newEvent,
      status: "available",
      type: newEvent.category === "business" ? "business" : "social",

      priority: "medium",
    }
    setEvents((prev) => [...prev, event])
    setNewEvent({
      name: "",
      startDate: "",
      endDate: "",
      category: "business",
      location: "",
      description: "",
    })
    setIsAddEventOpen(false)
  }

  const toggleBookmark = (eventId: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId
          ? {
              ...event,
              status: (event.status === "bookmarked" || event.status === "suggested") ? "available" : "bookmarked",
            }
          : event,
      ),
    )
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

  // Get events for calendar display - multi-day events only show on start date
  const getEventsForCalendarDisplay = useCallback((day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return filteredEvents.filter((event) => {
      const eventStart = new Date(event.startDate + "T00:00:00")
      const eventEnd = new Date(event.endDate + "T23:59:59")
      const checkDate = new Date(dateStr + "T12:00:00")
      
      // For multi-day events, only show on start date
      if (isMultiDayEvent(event)) {
        return checkDate.toDateString() === eventStart.toDateString()
      }
      
      // For single-day events, show normally
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
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800 hover:bg-blue-500 hover:text-white hover:border-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:hover:border-blue-500 transition-colors cursor-pointer"
      case "suggested":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 hover:bg-blue-500 hover:text-white hover:border-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:hover:border-blue-500 transition-colors cursor-pointer"
      case "available":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800 hover:bg-blue-500 hover:text-white hover:border-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:hover:border-blue-500 transition-colors cursor-pointer"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800 hover:bg-blue-500 hover:text-white hover:border-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:hover:border-blue-500 transition-colors cursor-pointer"
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
          if (type === "bookmarked" || type === "suggested") {
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
          return ["all", "bookmarked", "holidays", "suggested"] // Select all
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
        if (newSelection.length === 3) {
          newSelection = ["all", ...newSelection]
        }
      }
      
      return newSelection
    })
  }

  // Get display text for bookmark type filter
  const getBookmarkTypeDisplayText = () => {
    if (bookmarkTypeFilter.includes("all") || bookmarkTypeFilter.length === 3) {
      return "All Events"
    }
    if (bookmarkTypeFilter.length === 1) {
      const type = bookmarkTypeFilter[0]
      if (type === "bookmarked") return "Bookmarked"
      if (type === "holidays") return "Holidays"
      if (type === "suggested") return "Suggested"
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
      
      const isToday =
        new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()

      days.push(
        <div
          key={day}
          className={cn(
            "h-[89px] sm:h-[110px] border border-border bg-card p-1 sm:p-1.5 hover:bg-accent/50 transition-all cursor-pointer group relative",
            isToday && "border-2 border-blue-500 bg-blue-50/30 dark:bg-blue-950/30",
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
                "w-6 h-6 flex items-center justify-center rounded-full",
                isToday && "bg-blue-500 text-white font-bold",
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
                      {isMultiDayEvent(event) && (
                        <div className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 ml-1 shrink-0">
                          ({getEventDuration(event)}D)
                    </div>
                      )}
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
    // Group events by date
    const groupedEvents = filteredEvents.reduce(
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
              <div className="col-span-5">Event Name</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-2 text-center">Date Range</div>
              <div className="col-span-2 text-center">Type</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>
          </div>

          {/* Scrollable Table Body */}
          <div className="max-h-[60vh] overflow-y-auto">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-medium text-foreground mb-2">No events found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or search terms</p>
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
                          {new Date(date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
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
                    <div className="col-span-5">
                      <h3 className="text-sm font-medium text-foreground truncate mb-1" title={event.name}>
                        {event.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate" title={event.description}>
                        {event.description}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="col-span-1 flex justify-center">
                      <div className="flex flex-col items-center gap-1">
                        {event.status === "bookmarked" && <Star className="h-4 w-4 fill-current text-green-600" />}
                        {event.status === "suggested" && <Star className="h-4 w-4 fill-current text-blue-600" />}
                        {event.type === "holiday" && <Sparkles className="h-4 w-4 text-purple-600" />}
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs px-1.5 py-0.5", getStatusColor(event.status))}
                        >
                          {event.status === "available" ? "Available" : event.status}
                        </Badge>
                      </div>
                        </div>

                    {/* Date Range */}
                    <div className="col-span-2 text-center">
                      <div className="text-xs text-muted-foreground">
                        {event.startDate === event.endDate ? (
                          <div className="flex flex-col items-center">
                            <span>Single day</span>
                            <span className="text-xs font-medium">
                              {new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                      </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span>Multi-day</span>
                            <span className="text-xs font-medium">
                              {new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(event.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>

                    {/* Type */}
                    <div className="col-span-2 flex justify-center">
                      <Badge 
                        variant="secondary" 
                        className="text-xs px-2 py-1 capitalize"
                      >
                        {event.type}
                    </Badge>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-center gap-1">
                    <Button
                      variant="ghost"
                        size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleBookmark(event.id)
                      }}
                        className="h-8 w-8 p-0"
                        title="Toggle bookmark"
                    >
                      <BookmarkIcon
                        className={cn("h-4 w-4", (event.status === "bookmarked" || event.status === "suggested") ? "fill-current text-green-600" : "")}
                      />
                    </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedEvent(event)
                        }}
                        className="h-8 w-8 p-0"
                        title="View details"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </Button>
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
                  <h1 className="text-lg font-medium text-foreground px-2">
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
                  <Popover open={isCountryOpen} onOpenChange={setIsCountryOpen}>
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
                          <ScrollArea className={cn(
                            "space-y-1",
                            countryOptions.length > 8 ? "h-64" : "h-auto"
                          )}>
                            <div className="space-y-1 pr-3">
                              {countryOptions.map((option) => (
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
                  <Popover open={isCityOpen} onOpenChange={setIsCityOpen}>
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
                          <div className="space-y-1">
                            {cityOptions[selectedCountry as keyof typeof cityOptions]?.map((option) => (
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
                    <BookmarkIcon className="h-4 w-4" />
                    <span>Bookmark Event</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[calc(85vh-50px)] pb-16">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <BookmarkIcon className="h-5 w-5 text-green-600" />
                      Bookmark Events
                    </DialogTitle>
                  </DialogHeader>

                  {/* Bookmark Modal Filters */}
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
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
                          <Button variant="outline" className="w-52 justify-between">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <span>{getBookmarkCategoryDisplayText()}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48 p-4">
                          <div className="space-y-2">
                            <label className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-white">
                              <input
                                type="checkbox"
                                checked={bookmarkCategoryFilter.includes("all")}
                                onChange={() => handleCategorySelection("all")}
                                className="rounded"
                              />
                              <span>All</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-white">
                              <input
                                type="checkbox"
                                checked={bookmarkCategoryFilter.includes("conference")}
                                onChange={() => handleCategorySelection("conference")}
                                className="rounded"
                              />
                              <span>Conference</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-white">
                              <input
                                type="checkbox"
                                checked={bookmarkCategoryFilter.includes("tradeshow")}
                                onChange={() => handleCategorySelection("tradeshow")}
                                className="rounded"
                              />
                              <span>Trade Shows</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-white">
                              <input
                                type="checkbox"
                                checked={bookmarkCategoryFilter.includes("workshop")}
                                onChange={() => handleCategorySelection("workshop")}
                                className="rounded"
                              />
                              <span>Workshop</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-white">
                              <input
                                type="checkbox"
                                checked={bookmarkCategoryFilter.includes("social")}
                                onChange={() => handleCategorySelection("social")}
                                className="rounded"
                              />
                              <span>Social</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-white">
                              <input
                                type="checkbox"
                                checked={bookmarkCategoryFilter.includes("holidays")}
                                onChange={() => handleCategorySelection("holidays")}
                                className="rounded"
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
                          <Button variant="outline" className="w-48 justify-between">
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4" />
                              <span>{getBookmarkTypeDisplayText()}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48 p-4">
                          <div className="space-y-2">
                            <label className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-white">
                              <input
                                type="checkbox"
                                checked={bookmarkTypeFilter.includes("all")}
                                onChange={() => handleTypeSelection("all")}
                                className="rounded"
                              />
                              <span>All</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-white">
                              <input
                                type="checkbox"
                                checked={bookmarkTypeFilter.includes("bookmarked")}
                                onChange={() => handleTypeSelection("bookmarked")}
                                className="rounded"
                              />
                              <span>Bookmarked</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-white">
                              <input
                                type="checkbox"
                                checked={bookmarkTypeFilter.includes("holidays")}
                                onChange={() => handleTypeSelection("holidays")}
                                className="rounded"
                              />
                              <span>Holidays</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-white">
                              <input
                                type="checkbox"
                                checked={bookmarkTypeFilter.includes("suggested")}
                                onChange={() => handleTypeSelection("suggested")}
                                className="rounded"
                              />
                              <span>Suggested</span>
                            </label>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Events List */}
                  <ScrollArea className="max-h-[calc(20rem+30px)]">
                    <div className="space-y-2">
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
                            "flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors",
                            (event.status === "bookmarked" || event.status === "suggested") && "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{event.name}</h3>
                                {event.status === "bookmarked" && (
                                  <Star className="h-4 w-4 fill-current text-green-600" />
                                )}
                                {event.type === "holiday" && <Sparkles className="h-4 w-4 text-purple-600" />}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{event.startDate}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={cn("border", getStatusColor(event.status))}>
                              {event.status === "available" ? "Available" : event.status}
                            </Badge>
                            <Button
                              variant={(event.status === "bookmarked" || event.status === "suggested") ? "default" : "outline"}
                              onClick={() => toggleBookmark(event.id)}
                              className={cn(
                                "px-4 gap-3",
                                (event.status === "bookmarked" || event.status === "suggested")
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-950"
                              )}
                            >
                              <BookmarkIcon
                                className={cn("h-4 w-4", (event.status === "bookmarked" || event.status === "suggested") && "fill-current")}
                              />
                              {(event.status === "bookmarked" || event.status === "suggested") ? "Bookmarked" : "Bookmark"}
                            </Button>
                          </div>
                        </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>

                  <div className="flex items-center justify-between pt-8 border-t">
                    <div className="text-sm text-muted-foreground">
                      {events.filter((e) => e.status === "bookmarked").length} events bookmarked
                    </div>
                    <Button onClick={() => setIsBookmarkModalOpen(false)} className="px-4">Done</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="px-4 gap-3 bg-blue-600 hover:bg-blue-700 hover:text-white border-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:hover:text-white dark:border-blue-600 dark:text-white"
                  >
                    <Plus className="h-4 w-4 text-white" />
                    <span>Add Event</span>
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
                      <div className="col-span-2">
                        <Label htmlFor="name">Event Name *</Label>
                        <Input
                          id="name"
                          value={newEvent.name}
                          onChange={(e) => setNewEvent((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter event name"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newEvent.startDate}
                          onChange={(e) => setNewEvent((prev) => ({ ...prev, startDate: e.target.value }))}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="endDate">End Date *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newEvent.endDate}
                          onChange={(e) => setNewEvent((prev) => ({ ...prev, endDate: e.target.value }))}
                          className="mt-1"
                        />
                      </div>

                      <div className="col-span-2">
                        <Label htmlFor="category">Category *</Label>
                        <div className="mt-1">
                          <select
                          value={newEvent.category}
                            onChange={(e) => setNewEvent((prev) => ({ ...prev, category: e.target.value as "social" | "business" }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="social">🎉 Social</option>
                            <option value="business">💼 Business</option>
                          </select>
                              </div>
                      </div>

                      <div className="col-span-2">
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          value={newEvent.location}
                          onChange={(e) => setNewEvent((prev) => ({ ...prev, location: e.target.value }))}
                          placeholder="Enter event location"
                          className="mt-1"
                        />
                      </div>

                      <div className="col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newEvent.description}
                          onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the event..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button variant="outline" onClick={() => setIsAddEventOpen(false)} className="px-4">
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddEvent}
                        disabled={!newEvent.name || !newEvent.startDate || !newEvent.endDate || !newEvent.location}
                        className="px-4 gap-3 bg-primary hover:bg-primary/90"
                      >
                        <Plus className="h-4 w-4" />
                        Create Event
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
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
            <button
              onClick={() => toggleEventType('suggested')}
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-md transition-all duration-200 hover:text-foreground",
                enabledEventTypes.suggested ? "opacity-100" : "opacity-60"
              )}
            >
              <div className={cn(
                "w-3 h-3 rounded-full transition-all duration-200",
                enabledEventTypes.suggested ? "bg-blue-500" : "bg-gray-400"
              )}></div>
              <span className={cn(
                "text-sm transition-all duration-200",
                enabledEventTypes.suggested ? "text-muted-foreground" : "text-muted-foreground/60"
              )}>Suggested</span>
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
                      <Calendar className="h-4 w-4" />
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
          <Card className="overflow-hidden shadow-lg">
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
          <Card className="overflow-hidden shadow-lg">
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
              {selectedDate?.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
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

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{event.name}</h3>
                        {(event.status === "bookmarked" || event.status === "suggested") && <Star className="h-4 w-4 fill-current text-green-600" />}
                        {event.type === "holiday" && <Sparkles className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">

                        <div className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {event.startDate === event.endDate ? "Single day" : `${event.startDate} - ${event.endDate}`}
                        </div>

                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={cn("border", getStatusColor(event.status))}>
                      {event.status === "available" ? "Available" : event.status}
                    </Badge>
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
              <DialogTitle className="flex items-center gap-3">
                <span className="text-2xl">{selectedEvent.flag}</span>
                <div>
                  <div className="flex items-center gap-2">
                    {selectedEvent.name}
                    {selectedEvent.status === "bookmarked" && <Star className="h-5 w-5 fill-current text-green-600" />}
                    {selectedEvent.type === "holiday" && <Sparkles className="h-5 w-5 text-purple-600" />}
                  </div>
                  <Badge className={cn("mt-1", getStatusColor(selectedEvent.status))}>
                    {selectedEvent.status === "available" ? "Available" : selectedEvent.status}
                  </Badge>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {selectedEvent.startDate} - {selectedEvent.endDate}
                  </span>
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

              <div className="flex items-center justify-end pt-4 border-t">
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
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
