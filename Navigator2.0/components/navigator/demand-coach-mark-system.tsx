"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  HelpCircle,
  X, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle
} from "lucide-react"

interface CoachMark {
  id: string
  title: string
  description: string
  target: string
  position: "top" | "bottom" | "left" | "right"
  category: "navigation" | "data" | "actions" | "insights" | "demand"
  priority: number
  action?: {
    type: "click" | "hover" | "scroll"
    description: string
  }
}

const coachMarks: CoachMark[] = [
  {
    id: "demand-welcome",
    title: "Welcome to Demand Forecast",
    description: "Gain forward-looking insights into market demand and travel activity.\nThis page helps you anticipate booking trends, adjust pricing proactively, and capitalize on peak periods.",
    target: "[data-coach-mark='demand-overview']",
    position: "bottom",
    category: "navigation",
    priority: 1
  },
  {
    id: "demand-calendar",
    title: "Demand Calendar",
    description: "View upcoming months with a color-coded snapshot of expected demand levels.\nIdentify high-demand and event days early to plan rates and availability more effectively.",
    target: "[data-coach-mark='demand-calendar-grid']",
    position: "top",
    category: "insights",
    priority: 2
  },
  {
    id: "demand-summary-cards",
    title: "Market Summary KPIs",
    description: "Monitor key performance indicators — Demand Index, ADR, RevPAR, and Occupancy — to understand market momentum and week-over-week shifts in traveler interest.",
    target: "[data-coach-mark='demand-summary-cards']",
    position: "top",
    category: "data",
    priority: 3
  },
  {
    id: "demand-trends-chart",
    title: "Demand & Air Travel Trends",
    description: "Analyze two powerful insights together — overall demand patterns and inbound air traveler data.\nHover on chart points to see which markets are driving travel and how pricing aligns with demand.",
    target: "[data-coach-mark='demand-trends-header']",
    position: "top",
    category: "insights",
    priority: 4
  },
  {
    id: "events-holidays-table",
    title: "Top Events and Holidays",
    description: "See upcoming local events that could influence booking behavior.\nUse this view to align promotional strategies and adjust pricing ahead of peak travel dates.",
    target: "[data-coach-mark='events-holidays-table']",
    position: "top",
    category: "insights",
    priority: 5
  }
]

interface DemandCoachMarkSystemProps {
  isVisible: boolean
  onClose: () => void
}

export function DemandCoachMarkSystem({ isVisible, onClose }: DemandCoachMarkSystemProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [positionStyles, setPositionStyles] = useState<any>({})

  const currentCoachMark = coachMarks[currentStep]

  // Reset to first coachmark when tour starts
  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0)
      setCompletedSteps(new Set())
      setIsPlaying(false)
      setTargetElement(null)
      
      // Clear any existing highlights
      if (typeof window !== 'undefined') {
        document.querySelectorAll('.demand-coach-mark-highlight-spotlight').forEach(el => {
          el.classList.remove('demand-coach-mark-highlight-spotlight')
        })
      }
    }
  }, [isVisible])

  // Use spotlight highlighting for all coach marks
  const highlightClass = "demand-coach-mark-highlight-spotlight"

  useEffect(() => {
    if (!isVisible || !currentCoachMark) return

    const findTarget = () => {
      if (typeof window === 'undefined') return null
      
      const element = document.querySelector(currentCoachMark.target) as HTMLElement
      if (element) {
        console.log(`✅ Found demand target element: ${currentCoachMark.target}`, element)
        setTargetElement(element)
        
        // Only scroll into view for smaller elements, not for demand-overview
        if (!currentCoachMark.target.includes('demand-overview')) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        
        // Add spotlight highlight class
        element.classList.add(highlightClass)
        return element
      } else {
        console.warn(`❌ Could not find demand target element: ${currentCoachMark.target}`)
      }
      return null
    }

    // Clear previous target element
    setTargetElement(null)

    // Try to find target immediately
    const found = findTarget()
    
    if (found) {
      setTargetElement(found)
    } else {
      // If not found, try multiple times with increasing delays
      const timeouts = [100, 300, 500, 800, 1000]
      
      timeouts.forEach((delay, index) => {
        setTimeout(() => {
          if (!targetElement) { // Only try if we haven't found it yet
            const element = findTarget()
            if (element) {
              console.log(`✅ Found demand target element after ${delay}ms delay`)
              setTargetElement(element)
            } else if (index === timeouts.length - 1) {
              // Last attempt failed, log for debugging
              console.warn(`⚠️ Could not find demand target element: ${currentCoachMark.target}`)
              // Set a flag to use fallback positioning
              setTargetElement(null)
            }
          }
        }, delay)
      })
    }

    return () => {
      // Remove spotlight highlight class from all elements
      if (typeof window !== 'undefined') {
        document.querySelectorAll('.demand-coach-mark-highlight-spotlight').forEach(el => {
          el.classList.remove('demand-coach-mark-highlight-spotlight')
        })
      }
    }
  }, [currentStep, isVisible, currentCoachMark, targetElement])

  // Update position on scroll
  useEffect(() => {
    if (!isVisible || !targetElement) return

    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect()
      const styles = calculatePositionStyles(rect)
      setPositionStyles(styles)
    }

    // Initial position calculation
    updatePosition()

    // Add scroll listener
    window.addEventListener('scroll', updatePosition, { passive: true })
    window.addEventListener('resize', updatePosition, { passive: true })

    return () => {
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isVisible, targetElement, currentCoachMark])

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      if (currentStep < coachMarks.length - 1) {
        handleNext()
      } else {
        setIsPlaying(false)
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [isPlaying, currentStep])

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]))
    if (currentStep < coachMarks.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkipToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  const handleClose = () => {
    setIsPlaying(false)
    if (typeof window !== 'undefined') {
      document.querySelectorAll('.demand-coach-mark-highlight-spotlight').forEach(el => {
        el.classList.remove('demand-coach-mark-highlight-spotlight')
      })
    }
    onClose()
  }

  const handleRestart = () => {
    setCurrentStep(0)
    setCompletedSteps(new Set())
    setIsPlaying(false)
  }

  const calculatePositionStyles = (rect: DOMRect) => {
    if (!targetElement) {
      // Fallback positioning - show in center of screen
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999
      }
    }

    const styles: any = {
      position: 'fixed',
      zIndex: 9999
    }

    // Special handling for demand-overview elements
    // Always center them regardless of position setting
    if (currentCoachMark.target.includes('demand-overview')) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999
      }
    }

    // Standard positioning for normal-sized elements using viewport coordinates
    switch (currentCoachMark.position) {
      case 'top':
        styles.top = `${rect.top - 20}px`
        styles.left = `${rect.left + rect.width / 2}px`
        styles.transform = 'translate(-50%, -100%)'
        break
      case 'bottom':
        styles.top = `${rect.bottom + 20}px`
        styles.left = `${rect.left + rect.width / 2}px`
        styles.transform = 'translateX(-50%)'
        break
      case 'left':
        styles.top = `${rect.top + rect.height / 2}px`
        styles.left = `${rect.left - 20}px`
        styles.transform = 'translate(-100%, -50%)'
        break
      case 'right':
        styles.top = `${rect.top + rect.height / 2}px`
        styles.left = `${rect.right + 20}px`
        styles.transform = 'translateY(-50%)'
        break
    }

    return styles
  }

  const getPositionStyles = () => {
    // Use the state-based position styles that update on scroll
    return positionStyles
  }

  if (!isVisible || !currentCoachMark) return null

  return (
    <>
      {/* Grey Overlay for Welcome Coachmark */}
      {currentStep === 0 && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9998] pointer-events-none"
          style={{ zIndex: 9998 }}
        />
      )}


      {/* Coach Mark Card */}
      <Card 
        className="demand-coach-mark-card max-w-lg shadow-2xl border-2 border-blue-600 dark:border-blue-500 pointer-events-auto bg-white dark:bg-slate-900"
        style={getPositionStyles()}
      >
        <CardContent className="p-4 pointer-events-auto">
          {/* Content */}
          <div className="space-y-3">
            {/* Title with Cancel Button */}
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-foreground text-sm flex-1 pr-2">
                {currentCoachMark.title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0 pointer-events-auto flex-shrink-0"
                style={{ zIndex: 10000 }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pb-5 whitespace-pre-line">
              {currentCoachMark.description}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="h-7 px-2 pointer-events-auto"
                style={{ zIndex: 10000 }}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <span className="text-xs text-muted-foreground">
                {currentStep + 1} of {coachMarks.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="h-7 px-3 text-xs pointer-events-auto"
                style={{ zIndex: 10000 }}
              >
                Skip Tour
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
                className="h-7 px-3 text-xs pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white"
                style={{ zIndex: 10000 }}
              >
                {currentStep === coachMarks.length - 1 ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Indicators */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto" style={{ zIndex: 9998 }}>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-full px-4 py-2 shadow-lg border pointer-events-auto">
          {coachMarks.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSkipToStep(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 pointer-events-auto hover:scale-110 ${
                index === currentStep
                  ? 'bg-blue-600 scale-125'
                  : completedSteps.has(index)
                  ? 'bg-blue-500'
                  : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
              }`}
              title={`Step ${index + 1}: ${coachMarks[index].title}`}
              style={{ zIndex: 10000 }}
            />
          ))}
        </div>
      </div>
    </>
  )
}

// Demand-specific Coach Mark Trigger Button
export function DemandCoachMarkTrigger() {
  const [showCoachMarks, setShowCoachMarks] = useState(false)

  const handleStartTour = () => {
    setShowCoachMarks(true)
  }

  const handleCloseTour = () => {
    setShowCoachMarks(false)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('demand-analysis-tour-completed', 'true')
        localStorage.setItem('demand-analysis-tour-version', '1.0')
      } catch (error) {
        console.warn('Failed to save demand coach mark completion status:', error)
      }
    }
  }

  return (
    <>
      {/* Demand Analysis Tour Button - Clean with black tooltip */}
      <div className="fixed bottom-6 right-6 z-50 group">
          <Button
          onClick={handleStartTour}
            className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 hover:border-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-600 dark:hover:border-slate-500"
            size="sm"
          >
            <HelpCircle className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </Button>
          
          {/* Black Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            Start Product Tour for Demand Analysis
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
          </div>
      </div>

      {/* Demand Coach Mark System */}
      <DemandCoachMarkSystem 
        isVisible={showCoachMarks} 
        onClose={handleCloseTour}
      />
    </>
  )
}
