"use client"

import { useState, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

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
  attendees?: number
  type: "holiday" | "conference" | "festival" | "sports" | "business" | "social"
  priority: "high" | "medium" | "low"
}

// Sample events with exactly 4 bookmarked, 5 suggested, and 5 holidays
const sampleEvents: Event[] = [
  // 5 Holidays
  {
    id: "h1",
    name: "New Year's Day",
    startDate: "2025-01-01",
    endDate: "2025-01-01",
    category: "social",
    location: "Global",
    description: "New Year celebration worldwide",
    status: "suggested",
    country: "Global",
    flag: "🌍",
    type: "holiday",
    priority: "high",
  },
  {
    id: "h2",
    name: "Martin Luther King Jr. Day",
    startDate: "2025-01-20",
    endDate: "2025-01-20",
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
    id: "h3",
    name: "Chinese New Year",
    startDate: "2025-01-29",
    endDate: "2025-01-29",
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
    startDate: "2025-02-14",
    endDate: "2025-02-14",
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
    id: "h5",
    name: "Presidents Day",
    startDate: "2025-02-17",
    endDate: "2025-02-17",
    category: "social",
    location: "United States",
    description: "Federal holiday honoring US presidents",
    status: "suggested",
    country: "USA",
    flag: "🇺🇸",
    type: "holiday",
    priority: "medium",
  },

  // 4 Bookmarked events
  {
    id: "b1",
    name: "CES 2025",
    startDate: "2025-01-07",
    endDate: "2025-01-10",
    category: "business",
    location: "Las Vegas, USA",
    description: "Consumer Electronics Show - 4 day tech conference",
    status: "bookmarked",
    country: "USA",
    flag: "🇺🇸",
    attendees: 180000,
    type: "conference",
    priority: "high",
  },
  {
    id: "b2",
    name: "Mobile World Congress",
    startDate: "2025-02-24",
    endDate: "2025-02-27",
    category: "business",
    location: "Barcelona, Spain",
    description: "World's largest mobile industry event",
    status: "bookmarked",
    country: "Spain",
    flag: "🇪🇸",
    attendees: 100000,
    type: "conference",
    priority: "high",
  },
  {
    id: "b3",
    name: "Tech Innovation Summit",
    startDate: "2025-01-15",
    endDate: "2025-01-16",
    category: "business",
    location: "San Francisco, USA",
    description: "Leading technology innovation conference",
    status: "bookmarked",
    country: "USA",
    flag: "🇺🇸",
    attendees: 5000,
    type: "conference",
    priority: "high",
  },
  {
    id: "b4",
    name: "Digital Marketing Expo",
    startDate: "2025-02-05",
    endDate: "2025-02-06",
    category: "business",
    location: "New York, USA",
    description: "Premier digital marketing and advertising event",
    status: "bookmarked",
    country: "USA",
    flag: "🇺🇸",
    attendees: 8000,
    type: "conference",
    priority: "medium",
  },

  // 5 Suggested events
  {
    id: "s1",
    name: "World Economic Forum",
    startDate: "2025-01-21",
    endDate: "2025-01-24",
    category: "business",
    location: "Davos, Switzerland",
    description: "Annual meeting of global leaders",
    status: "suggested",
    country: "Switzerland",
    flag: "🇨🇭",
    attendees: 3000,
    type: "conference",
    priority: "high",
  },
  {
    id: "s2",
    name: "AI & Machine Learning Conference",
    startDate: "2025-01-29",
    endDate: "2025-01-30",
    category: "business",
    location: "London, UK",
    description: "Latest developments in AI and ML",
    status: "suggested",
    country: "UK",
    flag: "🇬🇧",
    attendees: 4500,
    type: "conference",
    priority: "high",
  },
  {
    id: "s3",
    name: "Startup Pitch Competition",
    startDate: "2025-02-03",
    endDate: "2025-02-03",
    category: "business",
    location: "Austin, USA",
    description: "Annual startup pitch and networking event",
    status: "suggested",
    country: "USA",
    flag: "🇺🇸",
    attendees: 1200,
    type: "business",
    priority: "medium",
  },
  {
    id: "s4",
    name: "Blockchain Summit",
    startDate: "2025-02-10",
    endDate: "2025-02-11",
    category: "business",
    location: "Miami, USA",
    description: "Cryptocurrency and blockchain technology summit",
    status: "suggested",
    country: "USA",
    flag: "🇺🇸",
    attendees: 6000,
    type: "conference",
    priority: "medium",
  },
  {
    id: "s5",
    name: "Green Energy Forum",
    startDate: "2025-02-20",
    endDate: "2025-02-21",
    category: "business",
    location: "Copenhagen, Denmark",
    description: "Sustainable energy and climate solutions",
    status: "suggested",
    country: "Denmark",
    flag: "🇩🇰",
    attendees: 2800,
    type: "conference",
    priority: "high",
  },

  // Additional events to create more crowded days
  {
    id: "extra1",
    name: "Tech Meetup SF",
    startDate: "2025-01-29",
    endDate: "2025-01-29",
    category: "business",
    location: "San Francisco, USA",
    description: "Monthly tech meetup",
    status: "suggested",
    country: "USA",
    flag: "🇺🇸",
    attendees: 200,
    type: "business",
    priority: "low",
  },
  {
    id: "extra2",
    name: "Photography Workshop",
    startDate: "2025-01-29",
    endDate: "2025-01-29",
    category: "social",
    location: "New York, USA",
    description: "Professional photography workshop",
    status: "available",
    country: "USA",
    flag: "🇺🇸",
    attendees: 50,
    type: "social",
    priority: "low",
  },
  {
    id: "extra3",
    name: "Wine Tasting",
    startDate: "2025-01-29",
    endDate: "2025-01-29",
    category: "social",
    location: "Napa Valley, USA",
    description: "Premium wine tasting event",
    status: "bookmarked",
    country: "USA",
    flag: "🇺🇸",
    attendees: 100,
    type: "social",
    priority: "medium",
  },

  // Additional available events for bookmarking
  {
    id: "a1",
    name: "Tech Startup Meetup",
    startDate: "2025-01-05",
    endDate: "2025-01-05",
    category: "business",
    location: "San Francisco, USA",
    description: "Monthly startup networking event",
    status: "available",
    country: "USA",
    flag: "🇺🇸",
    attendees: 150,
    type: "business",
    priority: "low",
  },
  {
    id: "a2",
    name: "Local Food Festival",
    startDate: "2025-01-12",
    endDate: "2025-01-12",
    category: "social",
    location: "Austin, USA",
    description: "Local food and music festival",
    status: "available",
    country: "USA",
    flag: "🇺🇸",
    attendees: 5000,
    type: "festival",
    priority: "low",
  },
  {
    id: "a3",
    name: "Business Networking Lunch",
    startDate: "2025-01-25",
    endDate: "2025-01-25",
    category: "business",
    location: "London, UK",
    description: "Monthly business networking event",
    status: "available",
    country: "UK",
    flag: "🇬🇧",
    attendees: 200,
    type: "business",
    priority: "medium",
  },
  {
    id: "a4",
    name: "Art Gallery Opening",
    startDate: "2025-02-01",
    endDate: "2025-02-01",
    category: "social",
    location: "Paris, France",
    description: "Contemporary art gallery opening",
    status: "available",
    country: "France",
    flag: "🇫🇷",
    attendees: 300,
    type: "social",
    priority: "low",
  },
  {
    id: "a5",
    name: "Music Festival",
    startDate: "2025-03-01",
    endDate: "2025-03-03",
    category: "social",
    location: "Austin, USA",
    description: "Annual music and arts festival",
    status: "available",
    country: "USA",
    flag: "🇺🇸",
    attendees: 75000,
    type: "festival",
    priority: "medium",
  },
]

const categories = [
  { value: "all", label: "All Categories", icon: "🌐" },
  { value: "social", label: "Social", icon: "🎉" },
  { value: "business", label: "Business", icon: "💼" },
]

export default function EventsCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1)) // January 2025
  const [events, setEvents] = useState<Event[]>(sampleEvents)
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isDayViewOpen, setIsDayViewOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [bookmarkSearchQuery, setBookmarkSearchQuery] = useState("")
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")

  const [filters, setFilters] = useState({
    category: "all",
    priority: "all",
  })

  const [bookmarkFilters, setBookmarkFilters] = useState({
    category: "all",
    priority: "all",
    status: "all",
  })

  const [newEvent, setNewEvent] = useState({
    name: "",
    startDate: "",
    endDate: "",
    category: "business" as "social" | "business",
    location: "",
    description: "",
  })

  // Filter events based on current view and filters
  useEffect(() => {
    let filtered = events.filter(
      (event) => event.type === "holiday" || event.status === "suggested" || event.status === "bookmarked",
    )

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower),
      )
    }

    // Apply category filter
    if (filters.category !== "all") {
      filtered = filtered.filter((event) => event.category === filters.category)
    }

    // Apply priority filter
    if (filters.priority !== "all") {
      filtered = filtered.filter((event) => event.priority === filters.priority)
    }

    setFilteredEvents(filtered)
  }, [events, filters, searchQuery])

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
      attendees: 0,
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
              status: event.status === "bookmarked" ? "available" : "bookmarked",
            }
          : event,
      ),
    )
  }

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return filteredEvents.filter((event) => {
      const eventStart = new Date(event.startDate + "T00:00:00")
      const eventEnd = new Date(event.endDate + "T23:59:59")
      const checkDate = new Date(dateStr + "T12:00:00")
      return checkDate >= eventStart && checkDate <= eventEnd
    })
  }

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

  const getStatusColor = (status: Event["status"]) => {
    switch (status) {
      case "bookmarked":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
      case "suggested":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
      case "available":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800"
    }
  }

  const getEventTypeColor = (event: Event) => {
    if (event.type === "holiday") return "bg-purple-500"
    if (event.status === "bookmarked") return "bg-green-500"
    if (event.status === "suggested") return "bg-blue-500"
    return "bg-gray-500"
  }

  // Filter events for bookmark modal
  const getFilteredBookmarkEvents = () => {
    let filtered = events

    // Apply bookmark search filter
    if (bookmarkSearchQuery) {
      const searchLower = bookmarkSearchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower),
      )
    }

    // Apply bookmark category filter
    if (bookmarkFilters.category !== "all") {
      filtered = filtered.filter((event) => event.category === bookmarkFilters.category)
    }

    // Apply bookmark priority filter
    if (bookmarkFilters.priority !== "all") {
      filtered = filtered.filter((event) => event.priority === bookmarkFilters.priority)
    }

    // Apply bookmark status filter
    if (bookmarkFilters.status !== "all") {
      filtered = filtered.filter((event) => event.status === bookmarkFilters.status)
    }

    return filtered.sort((a, b) => {
      // Sort bookmarked events first, then by date
      if (a.status === "bookmarked" && b.status !== "bookmarked") return -1
      if (b.status === "bookmarked" && a.status !== "bookmarked") return 1
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    })
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border border-border/30 bg-muted/30"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day)
      const isToday =
        new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()

      // Group events by type for colored lines
      const eventGroups = {
        bookmarked: dayEvents.filter((e) => e.status === "bookmarked"),
        suggested: dayEvents.filter((e) => e.status === "suggested"),
        holiday: dayEvents.filter((e) => e.type === "holiday"),
      }

      const hasMultipleEvents = dayEvents.length > 1

      days.push(
        <div
          key={day}
          className={cn(
            "h-32 border border-border bg-card p-2 hover:bg-accent/50 transition-all cursor-pointer group relative",
            isToday && "bg-primary/10 border-primary/30 shadow-sm",
            dayEvents.length > 0 && "hover:shadow-md",
          )}
          onClick={() => handleDateClick(day)}
        >
          <div
            className={cn(
              "font-semibold text-sm mb-2 flex items-center justify-between",
              isToday ? "text-primary" : "text-foreground",
            )}
          >
            <span
              className={cn(
                "w-6 h-6 flex items-center justify-center rounded-full",
                isToday && "bg-primary text-primary-foreground",
              )}
            >
              {day}
            </span>
            {dayEvents.length > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs px-1.5 py-0.5 h-5",
                  dayEvents.some((e) => e.status === "bookmarked") && "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
                  dayEvents.some((e) => e.type === "holiday") && "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
                )}
              >
                {dayEvents.length}
              </Badge>
            )}
          </div>

          <div className="space-y-1 overflow-hidden">
            {/* Single event - show full card */}
            {!hasMultipleEvents && dayEvents.length === 1 && (
              <div
                className={cn(
                  "text-xs p-1.5 rounded-md border cursor-pointer hover:shadow-sm transition-all relative",
                  getStatusColor(dayEvents[0].status),
                  dayEvents[0].status === "bookmarked" && "ring-1 ring-green-300 dark:ring-green-800",
                  dayEvents[0].type === "holiday" && "ring-1 ring-purple-300 dark:ring-purple-800",
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedEvent(dayEvents[0])
                }}
              >
                {/* Event type indicator */}
                <div
                  className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-md", getEventTypeColor(dayEvents[0]))}
                />

                <div className="flex items-center gap-1 truncate pl-1">
                  <span className="text-xs">{dayEvents[0].flag}</span>
                  <span className="font-medium truncate flex-1">{dayEvents[0].name}</span>
                  {dayEvents[0].status === "bookmarked" && <Star className="h-3 w-3 fill-current text-green-600" />}
                  {dayEvents[0].type === "holiday" && <Sparkles className="h-3 w-3 text-purple-600" />}
                </div>
                {dayEvents[0].location && (
                  <div className="text-xs text-muted-foreground truncate mt-0.5 pl-1">{dayEvents[0].location}</div>
                )}
              </div>
            )}

            {/* Multiple events - show colored lines */}
            {hasMultipleEvents && (
              <div className="space-y-2 pt-2">
                {/* Bookmarked events line */}
                {eventGroups.bookmarked.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-700 dark:text-green-300 font-medium min-w-[20px]">
                      {eventGroups.bookmarked.length}
                    </span>
                  </div>
                )}

                {/* Suggested events line */}
                {eventGroups.suggested.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-blue-700 dark:text-blue-300 font-medium min-w-[20px]">
                      {eventGroups.suggested.length}
                    </span>
                  </div>
                )}

                {/* Holiday events line */}
                {eventGroups.holiday.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs text-purple-700 dark:text-purple-300 font-medium min-w-[20px]">
                      {eventGroups.holiday.length}
                    </span>
                  </div>
                )}

                {/* Click to view all indicator */}
                <div className="text-xs text-muted-foreground font-medium text-center pt-1 hover:text-primary transition-colors">
                  Click to view all
                </div>
              </div>
            )}
          </div>

          {/* Multi-day event indicator */}
          {dayEvents.some((event) => event.startDate !== event.endDate) && (
            <div className="absolute top-1 right-8 w-2 h-2 bg-orange-400 rounded-full"></div>
          )}
        </div>,
      )
    }

    return days
  }

  const renderEventsList = () => {
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
      <div className="space-y-6">
        {Object.entries(groupedEvents).map(([date, events]) => (
          <Card key={date} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{event.flag}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{event.name}</h3>
                        {event.status === "bookmarked" && <Star className="h-4 w-4 fill-current text-green-600" />}
                        {event.type === "holiday" && <Sparkles className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.startDate === event.endDate ? "Single day" : `${event.startDate} - ${event.endDate}`}
                        </div>
                        {event.attendees && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.attendees.toLocaleString()}
                          </div>
                        )}
                      </div>
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
                        className={cn("h-4 w-4", event.status === "bookmarked" ? "fill-current text-green-600" : "")}
                      />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {filteredEvents.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
      {/* Enhanced Header */}
      <div className="bg-background border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")} className="hover:bg-primary/10">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold text-foreground">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h1>
                <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")} className="hover:bg-primary/10">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "calendar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 focus:ring-2 focus:ring-primary"
                />
              </div>

              <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {(filters.category !== "all" || filters.priority !== "all") && (
                      <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                        Active
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-4" align="end">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Categories</Label>
                      <Select
                        value={filters.category}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              <div className="flex items-center gap-2">
                                <span>{cat.icon}</span>
                                {cat.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-sm font-medium">Priority</Label>
                      <Select
                        value={filters.priority}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="low">Low Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setFilters({
                            category: "all",
                            priority: "all",
                          })
                        }
                        className="flex-1"
                      >
                        Reset
                      </Button>
                      <Button size="sm" onClick={() => setIsFilterOpen(false)} className="flex-1">
                        Apply
                      </Button>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Bookmark Event Button */}
              <Dialog open={isBookmarkModalOpen} onOpenChange={setIsBookmarkModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-green-50 hover:bg-green-100 border-green-300 text-green-700 dark:bg-green-950 dark:hover:bg-green-900 dark:border-green-800 dark:text-green-300"
                  >
                    <BookmarkIcon className="h-4 w-4 mr-2" />
                    Bookmark Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <BookmarkIcon className="h-5 w-5 text-green-600" />
                      Bookmark Events
                    </DialogTitle>
                  </DialogHeader>

                  {/* Bookmark Modal Filters */}
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search events to bookmark..."
                        value={bookmarkSearchQuery}
                        onChange={(e) => setBookmarkSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select
                      value={bookmarkFilters.category}
                      onValueChange={(value) => setBookmarkFilters((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <span>{cat.icon}</span>
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={bookmarkFilters.status}
                      onValueChange={(value) => setBookmarkFilters((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="bookmarked">Bookmarked</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="suggested">Suggested</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Events List */}
                  <ScrollArea className="max-h-96">
                    <div className="space-y-2">
                      {getFilteredBookmarkEvents().map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors",
                            event.status === "bookmarked" && "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{event.flag}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{event.name}</h3>
                                {event.status === "bookmarked" && (
                                  <Star className="h-4 w-4 fill-current text-green-600" />
                                )}
                                {event.type === "holiday" && <Sparkles className="h-4 w-4 text-purple-600" />}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{event.location}</span>
                                <span>{event.startDate}</span>
                                {event.attendees && <span>{event.attendees.toLocaleString()} attendees</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={cn("border", getStatusColor(event.status))}>
                              {event.status === "available" ? "Available" : event.status}
                            </Badge>
                            <Button
                              variant={event.status === "bookmarked" ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleBookmark(event.id)}
                              className={
                                event.status === "bookmarked"
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-950"
                              }
                            >
                              <BookmarkIcon
                                className={cn("h-4 w-4 mr-2", event.status === "bookmarked" && "fill-current")}
                              />
                              {event.status === "bookmarked" ? "Bookmarked" : "Bookmark"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      {events.filter((e) => e.status === "bookmarked").length} events bookmarked
                    </div>
                    <Button onClick={() => setIsBookmarkModalOpen(false)}>Done</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
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
                        <Select
                          value={newEvent.category}
                          onValueChange={(value: "social" | "business") =>
                            setNewEvent((prev) => ({ ...prev, category: value }))
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="social">
                              <div className="flex items-center gap-2">
                                <span>🎉</span>
                                Social
                              </div>
                            </SelectItem>
                            <SelectItem value="business">
                              <div className="flex items-center gap-2">
                                <span>💼</span>
                                Business
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
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
                      <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddEvent}
                        disabled={!newEvent.name || !newEvent.startDate || !newEvent.endDate || !newEvent.location}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Plus className="h-4 w-4 mr-2" />
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

      {/* Event Type Legend */}
      <div className="px-6 py-3 bg-background border-b border-border">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">Bookmarked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">Suggested</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">Holidays</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {viewMode === "calendar" ? (
          <Card className="overflow-hidden shadow-lg">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 border-b border-border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                <div
                  key={day}
                  className="p-4 text-center font-semibold text-foreground border-r border-border last:border-r-0"
                >
                  {day}
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
                    <div className="text-2xl">{event.flag}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{event.name}</h3>
                        {event.status === "bookmarked" && <Star className="h-4 w-4 fill-current text-green-600" />}
                        {event.type === "holiday" && <Sparkles className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.startDate === event.endDate ? "Single day" : `${event.startDate} - ${event.endDate}`}
                        </div>
                        {event.attendees && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.attendees.toLocaleString()}
                          </div>
                        )}
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
                        className={cn("h-4 w-4", event.status === "bookmarked" ? "fill-current text-green-600" : "")}
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
            <Button onClick={() => setIsDayViewOpen(false)}>Close</Button>
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
                  <MapPin className="h-4 w-4" />
                  <span>{selectedEvent.location}</span>
                </div>
                {selectedEvent.attendees && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{selectedEvent.attendees.toLocaleString()} attendees</span>
                  </div>
                )}
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
                    variant={selectedEvent.status === "bookmarked" ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleBookmark(selectedEvent.id)}
                    className={
                      selectedEvent.status === "bookmarked"
                        ? "bg-green-600 hover:bg-green-700"
                        : "hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-950"
                    }
                  >
                    <BookmarkIcon
                      className={cn("h-4 w-4 mr-2", selectedEvent.status === "bookmarked" && "fill-current")}
                    />
                    {selectedEvent.status === "bookmarked" ? "Remove Bookmark" : "Bookmark Event"}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleBookmark(selectedEvent.id)}
                    className="hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-950"
                  >
                    <BookmarkIcon className="h-4 w-4 mr-2" />
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
