import React from "react"
import { ChefHat, CircleDot, Slice, Coffee, Bed, Utensils, Wine, Dumbbell, Wifi, Car } from "lucide-react"

/**
 * Priority mapping for inclusion types
 * Lower numbers = higher priority
 */
export const inclusionPriority: Record<string, number> = {
  'all inclusive': 1,
  'full board': 2,
  'half board': 3,
  'breakfast': 4,
  'room only': 5,
  'dinner': 6,
  'bar': 7,
  'spa': 8,
  'wifi': 9,
  'airport transfer': 10,
  'meal': 11,
  'internet': 9, // Alias for wifi
  'parking': 12,
  'gym': 13,
  'fitness': 13, // Alias for gym
}

/**
 * Icon mapping for inclusion types
 */
export const inclusionPriorityIcon: Record<string, JSX.Element> = {
  'all inclusive': <ChefHat className="w-3 h-3 text-gray-600" />,
  'full board': <CircleDot className="w-3 h-3 text-gray-600" />,
  'half board': <Slice className="w-3 h-3 text-gray-600" />,
  'breakfast': <Coffee className="w-3 h-3 text-gray-600" />,
  'room only': <Bed className="w-3 h-3 text-gray-600" />,
  'dinner': <Utensils className="w-3 h-3 text-gray-600" />,
  'bar': <Wine className="w-3 h-3 text-gray-600" />,
  'spa': <Dumbbell className="w-3 h-3 text-gray-600" />,
  'wifi': <Wifi className="w-3 h-3 text-gray-600" />,
  'airport transfer': <Car className="w-3 h-3 text-gray-600" />,
  'meal': <Utensils className="w-3 h-3 text-gray-600" />,
  'internet': <Wifi className="w-3 h-3 text-gray-600" />, // Alias for wifi
  'parking': <Car className="w-3 h-3 text-gray-600" />,
  'gym': <Dumbbell className="w-3 h-3 text-gray-600" />,
  'fitness': <Dumbbell className="w-3 h-3 text-gray-600" />, // Alias for gym
}

/**
 * Get the most appropriate inclusion icon based on inclusion string
 * 
 * @param inclusionsStr - Comma-separated string of inclusions
 * @returns JSX.Element | null - The icon component or null if no valid inclusion found
 * 
 * @example
 * ```tsx
 * const icon = getInclusionIcon("wifi, breakfast, parking")
 * // Returns: <Wifi className="w-3 h-3 text-gray-600" /> (highest priority)
 * ```
 */
export const getInclusionIcon = (inclusionsStr: string): JSX.Element | null => {
  if (!inclusionsStr) return null

  const inclusions = inclusionsStr
    .split(',')
    .map(i => i.trim().toLowerCase())
    .filter(i => inclusionPriority[i])

  if (inclusions.length === 0) return null

  const topPriorityInclusion = inclusions.reduce((best, current) => {
    return inclusionPriority[current] < inclusionPriority[best] ? current : best
  })

  return inclusionPriorityIcon[topPriorityInclusion] || null
}

/**
 * Get inclusion icon with custom styling
 * 
 * @param inclusionsStr - Comma-separated string of inclusions
 * @param className - Custom CSS classes to apply to the icon
 * @returns JSX.Element | null - The icon component with custom styling or null
 * 
 * @example
 * ```tsx
 * const icon = getInclusionIconWithStyle("wifi, breakfast", "w-4 h-4 text-blue-500")
 * ```
 */
export const getInclusionIconWithStyle = (inclusionsStr: string, className: string): JSX.Element | null => {
  if (!inclusionsStr) return null

  const inclusions = inclusionsStr
    .split(',')
    .map(i => i.trim().toLowerCase())
    .filter(i => inclusionPriority[i])

  if (inclusions.length === 0) return null

  const topPriorityInclusion = inclusions.reduce((best, current) => {
    return inclusionPriority[current] < inclusionPriority[best] ? current : best
  })

  // Get the base icon component and apply custom styling
  const baseIcon = inclusionPriorityIcon[topPriorityInclusion]
  if (!baseIcon) return null

  // Clone the element with new className
  return React.cloneElement(baseIcon, { className })
}
