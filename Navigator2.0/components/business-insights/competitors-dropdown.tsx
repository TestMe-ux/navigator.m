"use client"

import * as React from "react"
import { ChevronDown, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Hotel {
  id: number
  name: string
}

interface CompetitorGroup {
  id: "primary" | "secondary"
  label: string
  hotels: Hotel[]
}

interface CompetitorsDropdownProps {
  selectedHotels?: number[]
  onChange?: (selectedHotels: number[]) => void
  className?: string
}

// Sample data - can be replaced with actual data from props or API
const defaultCompetitors: CompetitorGroup[] = [
  {
    id: "primary",
    label: "Primary",
    hotels: [
      { id: 1, name: "Grand Plaza Hotel & Conference Center" },
      { id: 2, name: "Ocean View Resort & Spa" },
      { id: 3, name: "City Center Inn Downtown" },
      { id: 4, name: "Mountain Lodge & Ski Resort" },
      { id: 5, name: "Beachside Paradise Resort & Marina" },
      { id: 6, name: "The Metropolitan Luxury Hotel" },
      { id: 7, name: "Sunset Beachfront Resort & Conference Center" },
      { id: 8, name: "Historic Downtown Grand Hotel" }
    ]
  },
  {
    id: "secondary",
    label: "Secondary",
    hotels: [
      { id: 9, name: "Downtown Suites & Business Center" },
      { id: 10, name: "Riverside Hotel & Waterfront Restaurant" },
      { id: 11, name: "Garden View Inn & Event Center" },
      { id: 12, name: "Skyline Tower Luxury Apartments" },
      { id: 13, name: "Heritage Manor Historic Boutique Hotel" },
      { id: 14, name: "Coastal Breeze Resort & Wellness Spa" },
      { id: 15, name: "Urban Executive Hotel & Conference Facilities" },
      { id: 16, name: "Seaside Luxury Resort & Beach Club" },
      { id: 17, name: "Platinum Executive Suites & Conference Hall" },
      { id: 18, name: "Emerald Bay Luxury Resort & Golf Club" },
      { id: 19, name: "Crystal Palace Grand Hotel & Convention Center" },
      { id: 20, name: "Royal Crown Hotel & Spa Resort" },
      { id: 21, name: "Diamond View Luxury Apartments & Business Center" },
      { id: 22, name: "Golden Gate Hotel & Conference Facilities" },
      { id: 23, name: "Majestic Towers Premium Resort & Marina" },
      { id: 24, name: "Elite Collection Hotel & Wellness Center" }
    ]
  }
]

export function CompetitorsDropdown({
  selectedHotels = [],
  onChange,
  className
}: CompetitorsDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(
    new Set(["primary", "secondary"])
  )
  
  const [localSelectedHotels, setLocalSelectedHotels] = React.useState<number[]>(selectedHotels)
  
  // Initialize default selection on mount if no selection provided
  React.useEffect(() => {
    if (selectedHotels.length === 0 && localSelectedHotels.length === 0) {
      const primaryGroup = defaultCompetitors.find(g => g.id === "primary")
      const defaultSelection = primaryGroup ? primaryGroup.hotels.map(h => h.id) : []
      setLocalSelectedHotels(defaultSelection)
      onChange?.(defaultSelection)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  // Sync with prop changes
  React.useEffect(() => {
    setLocalSelectedHotels(selectedHotels)
  }, [selectedHotels])

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  // Get the currently selected group (if any)
  const getSelectedGroup = (): "primary" | "secondary" | null => {
    if (localSelectedHotels.length === 0) return null
    
    const primaryGroup = defaultCompetitors.find(g => g.id === "primary")
    const secondaryGroup = defaultCompetitors.find(g => g.id === "secondary")
    const primaryHotelIds = primaryGroup ? primaryGroup.hotels.map(h => h.id) : []
    const secondaryHotelIds = secondaryGroup ? secondaryGroup.hotels.map(h => h.id) : []
    
    const hasPrimarySelection = localSelectedHotels.some(id => primaryHotelIds.includes(id))
    const hasSecondarySelection = localSelectedHotels.some(id => secondaryHotelIds.includes(id))
    
    if (hasPrimarySelection && !hasSecondarySelection) return "primary"
    if (hasSecondarySelection && !hasPrimarySelection) return "secondary"
    return null // Both selected or neither (shouldn't happen with our logic)
  }

  // Handle group checkbox (select/deselect all hotels in group)
  const handleGroupToggle = (groupId: "primary" | "secondary", checked: boolean) => {
    const group = defaultCompetitors.find(g => g.id === groupId)
    if (!group) return

    const groupHotelIds = group.hotels.map(h => h.id)
    
    setLocalSelectedHotels(prev => {
      if (checked) {
        // Always clear all previous selections when selecting a group (mutual exclusivity)
        const newSelection = [...groupHotelIds]
        onChange?.(newSelection)
        return newSelection
      } else {
        // Remove all hotels from this group
        const newSelection = prev.filter(id => !groupHotelIds.includes(id))
        onChange?.(newSelection)
        return newSelection
      }
    })
  }

  // Handle individual hotel checkbox
  const handleHotelToggle = (hotelId: number, checked: boolean, hotelGroupId: "primary" | "secondary") => {
    setLocalSelectedHotels(prev => {
      if (checked) {
        // Determine which group currently has selections
        const primaryGroup = defaultCompetitors.find(g => g.id === "primary")
        const secondaryGroup = defaultCompetitors.find(g => g.id === "secondary")
        const primaryHotelIds = primaryGroup ? primaryGroup.hotels.map(h => h.id) : []
        const secondaryHotelIds = secondaryGroup ? secondaryGroup.hotels.map(h => h.id) : []
        
        const hasPrimarySelection = prev.some(id => primaryHotelIds.includes(id))
        const hasSecondarySelection = prev.some(id => secondaryHotelIds.includes(id))
        const currentGroupHotelIds = hotelGroupId === "primary" ? primaryHotelIds : secondaryHotelIds
        
        // If selecting from a different group than currently selected, clear all and start fresh
        if ((hotelGroupId === "primary" && hasSecondarySelection) || 
            (hotelGroupId === "secondary" && hasPrimarySelection)) {
          // Switching groups - clear all and select only this hotel
          onChange?.( [hotelId] )
          return [hotelId]
        } else {
          // Same group or no current selection - keep existing selections from this group and add this hotel
          const newSelection = prev.filter(id => currentGroupHotelIds.includes(id))
          
          if (!newSelection.includes(hotelId)) {
            newSelection.push(hotelId)
          }
          
          onChange?.(newSelection)
          return newSelection
        }
      } else {
        // Remove this hotel
        const newSelection = prev.filter(id => id !== hotelId)
        onChange?.(newSelection)
        return newSelection
      }
    })
  }

  // Check if all hotels in a group are selected
  const isGroupFullySelected = (groupId: "primary" | "secondary"): boolean => {
    const group = defaultCompetitors.find(g => g.id === groupId)
    if (!group || group.hotels.length === 0) return false
    return group.hotels.every(hotel => localSelectedHotels.includes(hotel.id))
  }

  // Check if some (but not all) hotels in a group are selected
  const isGroupPartiallySelected = (groupId: "primary" | "secondary"): boolean => {
    const group = defaultCompetitors.find(g => g.id === groupId)
    if (!group || group.hotels.length === 0) return false
    const selectedCount = group.hotels.filter(hotel => localSelectedHotels.includes(hotel.id)).length
    return selectedCount > 0 && selectedCount < group.hotels.length
  }

  // Get display text for button
  const getDisplayText = () => {
    const selectedCount = localSelectedHotels.length
    
    if (selectedCount === 0) {
      return "Select Competitors"
    }

    // Count selected hotels per group and check if all are selected
    const groupCounts = defaultCompetitors.map(group => {
      const selectedInGroup = group.hotels.filter(hotel => 
        localSelectedHotels.includes(hotel.id)
      ).length
      const isAllSelected = selectedInGroup === group.hotels.length && group.hotels.length > 0
      return { 
        label: group.label, 
        count: selectedInGroup,
        isAllSelected: isAllSelected
      }
    }).filter(group => group.count > 0)

    // Format: "Primary (All)" or "Primary (4)" based on selection
    if (groupCounts.length > 0) {
      const countsText = groupCounts
        .map(g => g.isAllSelected ? `${g.label} (All)` : `${g.label} (${g.count})`)
        .join(", ")
      return countsText
    }

    return "Select Competitors"
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-2 px-4 font-medium transition-all duration-200 shrink-0 shadow-sm hover:shadow-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
          >
            <Users className="w-4 h-4 shrink-0" />
            {selectedHotels.length > 0 ? (
              <>
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Comp:
                </span>
                <span className="font-semibold">
                  {getDisplayText().replace("Comp: ", "")}
                </span>
              </>
            ) : (
              <span className="font-semibold">
                {getDisplayText()}
              </span>
            )}
            <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-auto p-0 shadow-xl border-slate-200 dark:border-slate-700 z-[60]">
          <div className="flex">
            <div className="w-64">
              <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                Competitors
              </h4>
              <div className="max-h-96 overflow-y-auto">
                {defaultCompetitors.map((group) => {
                  const isExpanded = expandedGroups.has(group.id)
                  const isGroupSelected = isGroupFullySelected(group.id)
                  const isGroupPartial = isGroupPartiallySelected(group.id)

                  return (
                    <div key={group.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      {/* Group Header with Checkbox and Expand/Collapse */}
                      <div 
                        className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => toggleGroup(group.id)}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-0 focus:outline-none mr-3 cursor-pointer"
                          checked={isGroupSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = isGroupPartial && !isGroupSelected
                          }}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleGroupToggle(group.id, e.target.checked)
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                            {group.label}
                          </span>
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200",
                              isExpanded && "rotate-180"
                            )}
                          />
                        </div>
                      </div>

                      {/* Group Hotels List */}
                      {isExpanded && (
                        <div className="bg-gray-50 dark:bg-gray-900/50">
                          {group.hotels.map((hotel) => (
                            <label
                              key={hotel.id}
                              className="px-4 py-2 pl-11 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-0 focus:outline-none mr-3 cursor-pointer"
                                checked={localSelectedHotels.includes(hotel.id)}
                                onChange={(e) => handleHotelToggle(hotel.id, e.target.checked, group.id)}
                              />
                              <span className="font-medium text-sm text-gray-700 dark:text-gray-300 flex-1">
                                {hotel.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

