"use client"

import { useState, useEffect, useCallback } from "react"

interface UseScrollDetectionOptions {
  threshold?: number // Percentage from bottom to trigger (0-1)
  minScrollDistance?: number // Minimum scroll distance before considering
  debounceMs?: number // Debounce delay in milliseconds
  oncePerSession?: boolean // Only trigger once per session
}

interface ScrollDetectionResult {
  isNearBottom: boolean
  scrollPercentage: number
  hasTriggered: boolean
  resetTrigger: () => void
}

const SESSION_STORAGE_KEY = "csat-scroll-triggered"

export function useScrollDetection({
  threshold = 0.85, // Trigger when 85% scrolled (closer to bottom)
  minScrollDistance = 1000, // Minimum 1000px scroll
  debounceMs = 200,
  oncePerSession = true
}: UseScrollDetectionOptions = {}): ScrollDetectionResult {
  const [isNearBottom, setIsNearBottom] = useState(false)
  const [scrollPercentage, setScrollPercentage] = useState(0)
  const [hasTriggered, setHasTriggered] = useState(false)
  const [sessionTriggered, setSessionTriggered] = useState(false)

  // Check session storage on mount
  useEffect(() => {
    if (oncePerSession && typeof window !== "undefined") {
      const triggered = sessionStorage.getItem(SESSION_STORAGE_KEY) === "true"
      setSessionTriggered(triggered)
      if (triggered) {
        setHasTriggered(true)
      }
    }
  }, [oncePerSession])

  // Debounced scroll handler
  const handleScroll = useCallback(() => {
    if (typeof window === "undefined") return

    const scrollTop = window.scrollY
    const documentHeight = document.documentElement.scrollHeight
    const windowHeight = window.innerHeight
    const maxScroll = documentHeight - windowHeight

    // Only proceed if there's actual content to scroll
    if (maxScroll <= 0) return

    // Calculate scroll percentage
    const percentage = scrollTop / maxScroll
    setScrollPercentage(percentage)

    // More strict bottom detection: within 50px of actual bottom OR >= threshold
    const pixelsFromBottom = maxScroll - scrollTop
    const reallyNearBottom = pixelsFromBottom <= 50 || percentage >= threshold
    const sufficientScroll = scrollTop >= minScrollDistance
    
    const nearBottom = reallyNearBottom && sufficientScroll
    setIsNearBottom(nearBottom)

    // Trigger only once when conditions are met
    if (
      nearBottom && 
      !hasTriggered && 
      (!oncePerSession || !sessionTriggered)
    ) {
      console.log('🎯 CSAT triggered at', Math.round(percentage * 100) + '%', 'scroll')
      setHasTriggered(true)
      
      if (oncePerSession) {
        setSessionTriggered(true)
        sessionStorage.setItem(SESSION_STORAGE_KEY, "true")
      }
    }
  }, [threshold, minScrollDistance, hasTriggered, oncePerSession, sessionTriggered])

  // Set up scroll listener with debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const debouncedHandler = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, debounceMs)
    }

    // Initial call to set current state
    handleScroll()

    window.addEventListener("scroll", debouncedHandler, { passive: true })
    
    return () => {
      window.removeEventListener("scroll", debouncedHandler)
      clearTimeout(timeoutId)
    }
  }, [handleScroll, debounceMs])

  // Reset trigger function
  const resetTrigger = useCallback(() => {
    setHasTriggered(false)
    setSessionTriggered(false)
    if (oncePerSession && typeof window !== "undefined") {
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
    }
  }, [oncePerSession])

  return {
    isNearBottom,
    scrollPercentage,
    hasTriggered,
    resetTrigger
  }
} 