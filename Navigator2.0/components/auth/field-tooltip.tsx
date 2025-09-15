"use client"

import React from "react"
import { AlertCircle } from "lucide-react"

/**
 * Field Tooltip Component
 * 
 * Features:
 * - CSS-based error tooltips for form validation
 * - Smooth animations and positioning
 * - Consistent styling across all forms
 * - Icon-based visual indicators
 * - Responsive design
 * 
 * @component
 * @version 1.0.0
 */

interface FieldTooltipProps {
  /** Error message to display */
  message: string
  /** Whether the tooltip should be visible */
  show: boolean
  /** Position relative to the field */
  position?: 'top' | 'bottom' | 'right'
  /** Additional CSS classes */
  className?: string
}

export function FieldTooltip({ 
  message, 
  show, 
  position = 'bottom',
  className = '' 
}: FieldTooltipProps) {
  if (!show || !message) return null

  const positionClasses = {
    top: 'bottom-full mb-2 left-0',
    bottom: 'top-full mt-2 left-0',
    right: 'left-full ml-2 top-0'
  }

  const arrowClasses = {
    top: 'top-full left-4 border-l-transparent border-r-transparent border-b-transparent border-t-red-500',
    bottom: 'bottom-full left-4 border-l-transparent border-r-transparent border-t-transparent border-b-red-500',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-red-500'
  }

  return (
    <div className={`relative ${className}`}>
      {/* Tooltip Container */}
      <div 
        className={`absolute z-50 ${positionClasses[position]} animate-in fade-in-0 zoom-in-95 duration-200`}
        role="alert"
        aria-live="polite"
      >
        <div className="bg-red-500 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg max-w-xs whitespace-nowrap flex items-center space-x-2 border border-red-400">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{message}</span>
        </div>
        
        {/* Arrow */}
        <div 
          className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
          style={{ borderWidth: '4px' }}
        />
      </div>
    </div>
  )
}

/**
 * Input Field with Tooltip Wrapper
 * 
 * Wraps form fields to provide tooltip positioning context
 */
interface InputWithTooltipProps {
  children: React.ReactNode
  error?: string
  tooltipPosition?: 'top' | 'bottom' | 'right'
  className?: string
}

export function InputWithTooltip({ 
  children, 
  error, 
  tooltipPosition = 'bottom',
  className = '' 
}: InputWithTooltipProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      <FieldTooltip 
        message={error || ''} 
        show={!!error} 
        position={tooltipPosition}
      />
    </div>
  )
}

/**
 * Validation Helper Functions
 */
export const ValidationHelpers = {
  email: (value: string) => {
    if (!value.trim()) return "Please enter your email address"
    
    // Check for missing @ symbol
    if (!value.includes("@")) {
      return `Please include an '@' in the email address. '${value}' is missing an '@'.`
    }
    
    // Check for multiple @ symbols
    const atCount = (value.match(/@/g) || []).length
    if (atCount > 1) {
      return "Please enter a valid email address. Only one '@' symbol is allowed."
    }
    
    // Split by @ to check parts
    const parts = value.split("@")
    const [localPart, domainPart] = parts
    
    // Check if local part is empty
    if (!localPart) {
      return `Please enter a part followed by '@'. '${value}' is incomplete.`
    }
    
    // Check if domain part exists
    if (!domainPart) {
      return `Please enter a part following '@'. '${value}' is incomplete.`
    }
    
    // Check for dot in domain
    if (!domainPart.includes(".")) {
      return `Please enter a valid domain. '${domainPart}' is missing a '.' in the domain part.`
    }
    
    // Check domain parts
    const domainParts = domainPart.split(".")
    const lastPart = domainParts[domainParts.length - 1]
    
    // Check if domain ends with dot
    if (!lastPart) {
      return "Please enter a valid email address. The domain cannot end with a '.'."
    }
    
    // Check if top-level domain is too short
    if (lastPart.length < 2) {
      return "Please enter a valid domain extension (e.g., .com, .org)."
    }
    
    // Check for spaces
    if (value.includes(" ")) {
      return "Please enter a valid email address. Spaces are not allowed."
    }
    
    // Check for invalid characters
    const invalidChars = value.match(/[^a-zA-Z0-9@._-]/g)
    if (invalidChars) {
      return `Please enter a valid email address. Invalid character(s): ${[...new Set(invalidChars)].join(", ")}`
    }
    
    // Final regex check for any remaining edge cases
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Please enter a valid email address (e.g., user@example.com)."
    }
    
    return ""
  },
  
  username: (value: string) => {
    if (!value.trim()) return "Please enter your username"
    if (value.length < 3) return "Username must be at least 3 characters"
    return ""
  },
  
  password: (value: string) => {
    if (!value.trim()) return "Please enter your password"
    if (value.length < 6) return "Password must be at least 6 characters"
    return ""
  },
  
  required: (value: string, fieldName: string) => {
    if (!value.trim()) return `Please fill ${fieldName}`
    return ""
  }
}
