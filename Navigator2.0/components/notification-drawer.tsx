"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Bell, ChevronDown, X, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

// Sample notification data
const notificationData = [
  {
    id: "notif-001",
    date: "05 Oct",
    alerts: [
      { message: <>Competitor Central Hotel rate has <strong>increased by £1</strong></>, type: "ADR" },
      { message: <>My Subscriber Hotel's rate has <strong>increased by £1</strong></>, type: "Parity" },
      { message: <>My Subscriber Hotel's rate has <strong>increased by £2</strong></>, type: "Rank" },
      { message: <>My Subscriber Hotel's rate has <strong>increased by £5</strong></>, type: "ADR" },
      { message: <>My subscriber rate has <strong>crossed £1</strong></>, type: "Parity" }
    ],
    isRead: false
  },
  {
    id: "notif-002", 
    date: "04 Oct",
    alerts: [
      { message: <>Competitor Central Hotel rate has <strong>increased by £1</strong></>, type: "ADR" },
      { message: <>My Subscriber Hotel's rate has <strong>increased by £1</strong></>, type: "Parity" },
      { message: <>My Subscriber Hotel's rate has <strong>increased by £2</strong></>, type: "Rank" },
      { message: <>My Subscriber Hotel's rate has <strong>increased by £5</strong></>, type: "ADR" },
      { message: <>My subscriber rate has <strong>crossed £1</strong></>, type: "Parity" }
    ],
    isRead: false
  },
  {
    id: "notif-003",
    date: "03 Oct", 
    alerts: [
      { message: <>Competitor Central Hotel rate has <strong>increased by £1</strong></>, type: "ADR" },
      { message: <>My Subscriber Hotel's rate has <strong>increased by £1</strong></>, type: "Parity" },
      { message: <>My Subscriber Hotel's rate has <strong>increased by £2</strong></>, type: "Rank" },
      { message: <>My Subscriber Hotel's rate has <strong>increased by £5</strong></>, type: "ADR" },
      { message: <>My subscriber rate has <strong>crossed £1</strong></>, type: "Parity" }
    ],
    isRead: true
  }
]

interface NotificationDrawerProps {
  notificationCount: number
  className?: string
}

export function NotificationDrawer({ notificationCount, className }: NotificationDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(notificationData)
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())
  
  // Multiselect dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedAlertTypes, setSelectedAlertTypes] = useState<string[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Alert type options
  const alertTypeOptions = ['All', 'ADR', 'Parity', 'Rank']
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])
  
  // Handle alert type toggle
  const handleAlertTypeToggle = (alertType: string) => {
    if (alertType === 'All') {
      setSelectedAlertTypes(selectedAlertTypes.includes('All') ? [] : alertTypeOptions)
    } else {
      setSelectedAlertTypes(prev => {
        const newSelection = prev.includes(alertType) 
          ? prev.filter(type => type !== alertType)
          : [...prev.filter(type => type !== 'All'), alertType]
        return newSelection
      })
    }
  }

  // Handle show more/less toggle for each date
  const handleToggleExpanded = (date: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev)
      if (newSet.has(date)) {
        newSet.delete(date)
      } else {
        newSet.add(date)
      }
      return newSet
    })
  }

  // Function to get badge styling based on alert type
  const getAlertTypeBadge = (type: string) => {
    switch (type) {
      case "ADR":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 font-medium hover:bg-blue-100">ADR</Badge>
      case "Parity":
        return <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 font-medium hover:bg-green-100">Parity</Badge>
      case "Rank":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 font-medium hover:bg-purple-100">Rank</Badge>
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-[10px] px-1.5 py-0.5 font-medium hover:bg-gray-100">{type}</Badge>
    }
  }

  const handleNotificationClick = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    )
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "text-blue-100 hover:text-white hover:bg-white/10 relative transition-all duration-200",
            className
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse-glow">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications ({unreadCount})</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="!w-[546px] sm:!w-[681px] p-0 flex flex-col" style={{ width: '546px', minWidth: '546px', maxWidth: '546px' }}>
        {/* Custom Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0 mt-[60px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Alerts
              </h2>
              
              {/* Multiselect Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="h-8 px-3 text-xs font-medium border-gray-300 hover:bg-gray-50"
                >
                  <span className="mr-1">
                    {selectedAlertTypes.length === 0 ? 'All' : 
                     selectedAlertTypes.includes('All') ? 'All' :
                     `${selectedAlertTypes.length} selected`}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </Button>

                {/* Dropdown Content */}
                {isDropdownOpen && (
                  <div className="absolute z-50 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg min-w-[120px]">
                    {/* Alert Types List */}
                    <div className="py-2">
                      {alertTypeOptions.map((alertType) => (
                        <label
                          key={alertType}
                          className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedAlertTypes.includes('All') || selectedAlertTypes.includes(alertType)}
                            onChange={() => handleAlertTypeToggle(alertType)}
                            className="w-4 h-4 mr-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-900">
                            {alertType}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 relative group"
                            onClick={() => {
                              // TODO: Open alert settings modal/page
                              console.log("Open alert settings")
                            }}
                          >
                            <Settings className="h-4 w-4" />
                            {/* Tooltip */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                              Modify/Create Alerts
                            </div>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 relative group"
                          >
                            <X className="h-4 w-4" />
                            {/* Tooltip */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                              Close
                            </div>
                          </Button>
                        </div>
          </div>
        </div>

                    <div className="flex-1 overflow-y-auto">
                      {/* Notifications */}
                      {notifications.map((notification, index) => {
                        const isExpanded = expandedDates.has(notification.date)
                        const alertsToShow = isExpanded ? notification.alerts : notification.alerts.slice(0, 2)
                        const hasMoreAlerts = notification.alerts.length > 2
                        
                        return (
                          <div
                            key={notification.id}
                            className={cn(
                              "px-6 py-2 border-b border-gray-100 dark:border-gray-800 transition-colors",
                              !notification.isRead && "bg-blue-50 dark:bg-blue-900/20",
                              index % 2 === 0 
                                ? "bg-white dark:bg-gray-900" 
                                : "bg-gray-50 dark:bg-gray-800/50"
                            )}
                          >
                            <div className="flex items-start">
                              {/* Date Column - Left Side */}
                              <div className="flex items-center shrink-0 w-18">
                                <div className="flex flex-col">
                                  <span className="text-gray-900 dark:text-gray-100 font-semibold text-sm">
                                    {notification.date}
                                  </span>
                                  {index < 2 && (
                                    <Badge variant="secondary" className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 font-medium hover:bg-red-100 w-fit mt-1">
                                      New
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              {/* Alerts Column - Right Side */}
                              <div className="flex-1">
                                <div className="space-y-2">
                                  {alertsToShow.map((alert, alertIndex) => (
                                    <div key={alertIndex} className="flex items-start justify-between gap-2">
                                      <div className="text-sm text-gray-700 dark:text-gray-300 break-words overflow-wrap-anywhere flex-1">
                                        • {alert.message}
                                      </div>
                                      {getAlertTypeBadge(alert.type)}
                                    </div>
                                  ))}
                                  
                                  {/* Show More/Less Link */}
                                  {hasMoreAlerts && (
                                    <button
                                      onClick={() => handleToggleExpanded(notification.date)}
                                      className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                                    >
                                      {isExpanded ? 'Show less' : 'Show more'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <Button 
            variant="outline" 
            className="w-full text-sm"
            onClick={() => {
              setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            }}
          >
            Mark All as Read
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
