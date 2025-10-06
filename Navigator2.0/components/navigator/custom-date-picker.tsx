"use client"

import React, { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface CustomDatePickerProps {
  value: string
  onChange: (date: string) => void
  placeholder?: string
  className?: string
  minDate?: string
  maxDate?: string
}

export function CustomDatePicker({ value, onChange, placeholder = "Select start date", className, minDate, maxDate }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const today = new Date()
  const selectedDate = value ? new Date(value) : null
  
  // Use provided minDate/maxDate or default to today and 1 year from today
  const minDateObj = minDate ? new Date(minDate) : today
  const maxDateObj = maxDate ? new Date(maxDate) : new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }
  
  const handleDateSelect = (date: Date) => {
    debugger;
    const dateString = format(date, 'yyyy-MM-dd')
    onChange(dateString)
    setIsOpen(false)
  }
  
  const handlePreviousMonth = () => {
    const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    // Don't allow navigation to months before min date month
    if (previousMonth >= new Date(minDateObj.getFullYear(), minDateObj.getMonth())) {
      setCurrentMonth(previousMonth)
    }
  }
  
  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    // Don't allow navigation beyond the month containing the max date
    if (nextMonth <= new Date(maxDateObj.getFullYear(), maxDateObj.getMonth())) {
      setCurrentMonth(nextMonth)
    }
  }
  
  const isSelected = (date: Date) => {
    return selectedDate && 
           date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear()
  }
  
  const isToday = (date: Date) => {
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }
  
  const isPastDate = (date: Date) => {
    const minDateStart = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), minDateObj.getDate())
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    return dateStart < minDateStart
  }
  
  const isFutureDate = (date: Date) => {
    const maxDateStart = new Date(maxDateObj.getFullYear(), maxDateObj.getMonth(), maxDateObj.getDate())
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    return dateStart > maxDateStart
  }
  
  const isDateDisabled = (date: Date) => {
    return isPastDate(date) || isFutureDate(date)
  }
  
  const days = getDaysInMonth(currentMonth)
  
  return (
    <div className="relative">
      <div
        className={cn(
          "w-full h-10 bg-white dark:bg-white border border-gray-300 dark:border-gray-600 rounded-md px-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-50",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className={cn(
            "text-sm",
            value ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
          )}>
            {value ? format(new Date(value), "d MMM ''yy") : placeholder}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-500" />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4 min-w-[280px]">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePreviousMonth}
              disabled={currentMonth <= new Date(minDateObj.getFullYear(), minDateObj.getMonth())}
              className={cn(
                "p-1 rounded transition-colors",
                currentMonth <= new Date(minDateObj.getFullYear(), minDateObj.getMonth())
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <button
              onClick={handleNextMonth}
              disabled={currentMonth >= new Date(maxDateObj.getFullYear(), maxDateObj.getMonth())}
              className={cn(
                "p-1 rounded transition-colors",
                currentMonth >= new Date(maxDateObj.getFullYear(), maxDateObj.getMonth())
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={index} className="h-8" />
              }
              
              return (
                <button
                  key={index}
                  onClick={() => !isDateDisabled(date) && handleDateSelect(date)}
                  disabled={isDateDisabled(date)}
                  className={cn(
                    "h-8 w-8 text-sm rounded-md flex items-center justify-center transition-colors",
                    isSelected(date) && "bg-blue-600 text-white font-medium",
                    !isSelected(date) && !isDateDisabled(date) && "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
                    isDateDisabled(date) && "text-gray-400 dark:text-gray-600 cursor-not-allowed",
                    isToday(date) && !isSelected(date) && !isDateDisabled(date) && "font-semibold text-blue-600 dark:text-blue-400"
                  )}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Overlay to close calendar when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
