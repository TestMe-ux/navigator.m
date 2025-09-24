"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Info, X } from "lucide-react"
import { Button } from "./button"

interface SnackbarProps {
  isOpen: boolean
  onClose: () => void
  message: string
  type?: 'info' | 'success'
  className?: string
}

export function Snackbar({ isOpen, onClose, message, type = 'info', className }: SnackbarProps) {
  if (!isOpen) return null

  const isSuccess = type === 'success'
  const bgColor = isSuccess ? 'bg-green-600' : 'bg-blue-600'
  const iconColor = isSuccess ? 'text-green-600' : 'text-blue-600'
  const buttonColor = isSuccess ? 'hover:bg-green-700' : 'hover:bg-blue-700'

  return (
    <div className={cn(
      "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50",
      "text-white rounded-lg shadow-lg",
      "flex items-center gap-4 px-6 py-3",
      "w-auto max-w-[calc(100vw-2rem)] min-w-96",
      "animate-in slide-in-from-bottom-2 duration-300",
      bgColor,
      className
    )}>
      {/* Icon */}
      <div className="flex-shrink-0">
        <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          {isSuccess ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      
      {/* Message */}
      <div className="flex-1 text-sm font-medium leading-relaxed whitespace-nowrap">
        {message}
      </div>
      
      {/* Close Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onClose}
        className={cn(
          "flex-shrink-0 bg-white border-white hover:bg-gray-100 px-4 py-1 h-8 text-sm font-medium",
          isSuccess ? "text-green-600" : "text-blue-600"
        )}
      >
        {isSuccess ? "DONE" : "OK"}
      </Button>
    </div>
  )
}
