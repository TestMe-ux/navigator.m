"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  X, 
  Heart, 
  MessageCircle, 
  Sparkles,
  CheckCircle2,
  Send
} from "lucide-react"

interface CSATRatingCardProps {
  onClose?: () => void
}

// CSAT rating options with emoji-style icons and descriptions
const ratingOptions = [
  {
    value: 1,
    emoji: "😞",
    label: "Very Dissatisfied",
    color: "text-red-500",
    bgColor: "bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900",
    borderColor: "border-red-200 dark:border-red-800",
    description: "Needs significant improvement"
  },
  {
    value: 2,
    emoji: "😐",
    label: "Dissatisfied", 
    color: "text-orange-500",
    bgColor: "bg-orange-50 hover:bg-orange-100 dark:bg-orange-950 dark:hover:bg-orange-900",
    borderColor: "border-orange-200 dark:border-orange-800",
    description: "Room for improvement"
  },
  {
    value: 3,
    emoji: "😊",
    label: "Satisfied",
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950 dark:hover:bg-yellow-900", 
    borderColor: "border-yellow-200 dark:border-yellow-800",
    description: "Meets expectations"
  },
  {
    value: 4,
    emoji: "😄",
    label: "Very Satisfied",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900",
    borderColor: "border-emerald-200 dark:border-emerald-800", 
    description: "Exceeds expectations"
  },
  {
    value: 5,
    emoji: "🤩",
    label: "Extremely Satisfied",
    color: "text-blue-500",
    bgColor: "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900",
    borderColor: "border-blue-200 dark:border-blue-800",
    description: "Outstanding experience"
  }
]

export function CSATRatingCard({ onClose }: CSATRatingCardProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [feedback, setFeedback] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const { toast } = useToast()

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating)
    setShowFeedback(true)
    
    // Show appreciation micro-interaction
    if (rating >= 4) {
      setTimeout(() => {
        toast({
          title: "Thank you! 🎉",
          description: "We're thrilled you're enjoying the dashboard!",
          duration: 3000,
        })
      }, 500)
    }
  }

  const handleSubmit = async () => {
    if (!selectedRating) return

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsSubmitted(true)
      
      const selectedOption = ratingOptions.find(option => option.value === selectedRating)
      
      toast({
        title: "Feedback Submitted! ✨",
        description: `Thank you for your ${selectedOption?.label.toLowerCase()} rating. Your input helps us improve!`,
        duration: 5000,
      })

      // Auto-close after successful submission
      setTimeout(() => {
        onClose?.()
      }, 3000)
      
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again in a moment.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const selectedOption = ratingOptions.find(option => option.value === selectedRating)

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Card className="w-80 shadow-2xl border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
          <CardContent className="p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
              Thank You! 
            </h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Your feedback has been submitted successfully.
            </p>
            <div className="flex justify-center mt-4">
              <Sparkles className="w-6 h-6 text-emerald-500 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Card className="w-96 shadow-2xl border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  How's Your Experience?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Help us improve your dashboard
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Rating Options */}
          <div className="mb-6">
            <p className="text-sm font-medium text-foreground mb-4">
              Rate your overall satisfaction:
            </p>
            <div className="grid grid-cols-5 gap-2">
              {ratingOptions.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleRatingSelect(option.value)}
                  className={`
                    relative p-3 rounded-xl border-2 transition-all duration-200
                    ${selectedRating === option.value 
                      ? `${option.bgColor} ${option.borderColor} ring-2 ring-offset-2 ring-offset-background ${option.color.replace('text-', 'ring-')}`
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }
                    hover:scale-105 active:scale-95
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-xs font-medium text-foreground">
                      {option.value}
                    </div>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded-lg px-2 py-1 whitespace-nowrap">
                      {option.label}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            
            {selectedOption && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-center"
              >
                <Badge className={`${selectedOption.bgColor} ${selectedOption.color} border-0`}>
                  {selectedOption.description}
                </Badge>
              </motion.div>
            )}
          </div>

          {/* Feedback Section */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Additional feedback (optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us more about your experience..."
                  className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 dark:bg-slate-800 text-foreground placeholder:text-muted-foreground"
                  rows={3}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          {selectedRating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
} 