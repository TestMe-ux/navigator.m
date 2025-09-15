"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { InputWithTooltip, ValidationHelpers } from "@/components/auth/field-tooltip"
import { ResetPassword } from "@/lib/login"

/**
 * Reset Password Form Component
 * 
 * Features:
 * - Email input for password reset
 * - Form validation
 * - Navigation back to login
 * - Loading states
 * - Professional branding
 * 
 * @component
 * @version 1.0.0
 */
export function ResetPasswordForm() {
  // State management
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [resendCount, setResendCount] = useState(0)
  const [resendMessage, setResendMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "info" | "">("")
  const [errors, setErrors] = useState({
    email: "",
    general: ""
  })

  // Override autofill styling with comprehensive CSS (same as login form)
  React.useEffect(() => {
    const style = document.createElement('style')
    style.id = 'reset-password-autofill-override'
    style.textContent = `
      /* Ultra-aggressive autofill override targeting reset password form specifically */
      .transparent-autofill input:-webkit-autofill,
      .transparent-autofill input:-webkit-autofill:hover,
      .transparent-autofill input:-webkit-autofill:focus,
      .transparent-autofill input:-webkit-autofill:active,
      form.transparent-autofill input:-webkit-autofill,
      form.transparent-autofill input:-webkit-autofill:hover,
      form.transparent-autofill input:-webkit-autofill:focus,
      form.transparent-autofill input:-webkit-autofill:active,
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
        -webkit-animation: autofill-transparent 0s forwards !important;
        animation: autofill-transparent 0s forwards !important;
        -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
        -webkit-text-fill-color: white !important;
        background-color: transparent !important;
        background-image: none !important;
        background: transparent !important;
        transition: background-color 999999s ease-out !important;
        caret-color: white !important;
        color: white !important;
      }
      
      /* Keyframe animations to force transparency */
      @-webkit-keyframes autofill-transparent {
        0%, 100% {
          background: transparent !important;
          background-color: transparent !important;
          -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
        }
      }
      
      @keyframes autofill-transparent {
        0%, 100% {
          background: transparent !important;
          background-color: transparent !important;
          box-shadow: 0 0 0 1000px transparent inset !important;
        }
      }
      
      /* Force transparent on various pseudo-states */
      .transparent-autofill input:-webkit-autofill::selection,
      input:-webkit-autofill::selection {
        background: rgba(255,255,255,0.2) !important;
      }
      
      .transparent-autofill input:-webkit-autofill::first-line,
      input:-webkit-autofill::first-line {
        color: white !important;
        font-family: inherit !important;
      }
      
      /* Additional browser support */
      input:-moz-ui-invalid,
      input[autocompleted] {
        background-color: transparent !important;
      }
      
      /* Force remove any possible background */
      input[type="email"]:valid,
      input[type="password"]:valid {
        background: transparent !important;
        background-color: transparent !important;
      }
      
      /* Target inputs with data attribute for ultimate transparency */
      input[data-transparent-bg="true"]:-webkit-autofill,
      input[data-transparent-bg="true"]:-webkit-autofill:hover,
      input[data-transparent-bg="true"]:-webkit-autofill:focus,
      input[data-transparent-bg="true"]:-webkit-autofill:active {
        -webkit-box-shadow: inset 0 0 0 1000px transparent !important;
        box-shadow: inset 0 0 0 1000px transparent !important;
        background-color: transparent !important;
        background-image: none !important;
        background: transparent !important;
        -webkit-text-fill-color: white !important;
        color: white !important;
        transition: background-color 999999s ease-out !important;
      }
    `
    document.head.appendChild(style)
    return () => {
      const existingStyle = document.getElementById('reset-password-autofill-override')
      if (existingStyle) {
        document.head.removeChild(existingStyle)
      }
    }
  }, [])

  /**
   * Clear specific field error
   */
  const clearFieldError = (field: string) => {
    setErrors(prev => ({ ...prev, [field]: "", general: "" }))
  }

  /**
   * Render resend message with formatted email
   */
  const renderFormattedMessage = (message: string) => {
    const emailPattern = /help@rategain\.com/g
    const parts = message.split(emailPattern)

    if (parts.length === 1) {
      // No email found, return as is
      return message
    }

    return (
      <>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="font-bold">help@rategain.com</span>
            )}
          </React.Fragment>
        ))}
      </>
    )
  }

  /**
   * Validate form fields
   */
  const validateForm = () => {
    const emailError = ValidationHelpers.email(email)
    const newErrors = {
      email: emailError,
      general: ""
    }

    setErrors(newErrors)
    return !emailError
  }

  /**
   * Handle form submission
   * @param {React.FormEvent} e - Form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call for password reset - fast response
      const response = await ResetPassword({ "uname": email })
      if (response.status) {
        setIsSubmitted(true)
      }
      else {
        if (response.message == "User Not Exist!") {
          setErrors(prev => ({
            ...prev,
            general: "Invalid User! Please try again with your registered email address."
          }))
        }
        else if (response.message === "Unable to send mail, please contact support team.") {
          setErrors(prev => ({
            ...prev,
            general: "Something Went Wrong! Please try after sometime!"
          }))
        }
        else {
          setErrors(prev => ({
            ...prev,
            general: "Something Went Wrong! Failed to send reset email. Please try again."
          }))
        }

      }
      console.log('Password reset requested for:', email)

    } catch (error) {
      console.error('Password reset error:', error)
      setErrors(prev => ({
        ...prev,
        general: "Failed to send reset email. Please try again."
      }))
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle resend functionality with different messages based on attempt count
   */
  const handleResend = async () => {
    setIsLoading(true)
    setResendMessage("") // Clear previous message

    try {
      // Simulate resend API call - fast response
      await new Promise(resolve => setTimeout(resolve, 300))
      console.log('Password reset email resent to:', email)

      const newResendCount = resendCount + 1
      setResendCount(newResendCount)

      if (newResendCount === 1) {
        // First resend - show success message
        setResendMessage("Password reset link sent successfully!")
        setMessageType("success")
      } else {
        // Subsequent resends - show helpful info message
        setResendMessage(
          "We have already sent you a password reset link. Please check your email inbox and junk/spam folder. If you still haven't received the email after a few minutes, please contact our support team at help@rategain.com for assistance."
        )
        setMessageType("info")
      }

      // Clear message after 8 seconds for success, 16 seconds for info
      setTimeout(() => {
        setResendMessage("")
        setMessageType("")
      }, newResendCount === 1 ? 8000 : 16000)

    } catch (error) {
      console.error('Resend error:', error)
      setResendMessage("Failed to resend email. Please try again.")
      setMessageType("info")

      // Clear error message after 16 seconds
      setTimeout(() => {
        setResendMessage("")
        setMessageType("")
      }, 16000)
    } finally {
      setIsLoading(false)
    }
  }

  // If email has been submitted, show confirmation screen
  if (isSubmitted) {
    return (
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-medium text-white">
              Check your email
            </h1>
          </div>
        </div>

        {/* Confirmation Card */}
        <Card className="shadow-2xl border border-white/20 bg-white/98 dark:bg-slate-900/98 backdrop-blur-lg">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-4">
              <p className="text-white">
                We have sent a reset password link to
              </p>
              <p className="font-bold text-white">
                {email}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-white">
                Did not receive email?{" "}
                <button
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-white hover:text-gray-200 font-medium transition-colors disabled:opacity-50 underline"
                >
                  {isLoading ? "Sending..." : "Click to resend"}
                </button>
              </p>

              {/* Resend Message Display */}
              {resendMessage && (
                <div
                  className={`text-sm p-4 rounded-lg border animate-in fade-in-0 slide-in-from-top-2 duration-300 ${messageType === "success"
                    ? "bg-green-500/10 border-green-400/20 text-green-100"
                    : "bg-blue-500/10 border-blue-400/20 text-blue-100"
                    }`}
                  role="alert"
                  aria-live="polite"
                >
                  {messageType === "success" ? (
                    <div className="flex items-start space-x-2">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-medium">{resendMessage}</span>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-2">
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-sm leading-relaxed">{renderFormattedMessage(resendMessage)}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Spacer */}
            <div className="h-[18px]"></div>

            <Button
              onClick={() => window.location.href = '/login/create-password'}
              className="w-full h-12 text-base font-semibold bg-gradient-brand hover:opacity-90 text-white shadow-brand rounded-lg transition-all transform hover:scale-[1.02]"
            >
              Done
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Default reset password form
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-medium text-white">
            Reset Password
          </h1>
          <p className="text-sm text-white">
            Please follow the steps which will be sent to your email id
          </p>
        </div>
      </div>

      {/* Reset Password Form Card */}
      <Card className="shadow-2xl border border-white/20 bg-white/98 dark:bg-slate-900/98 backdrop-blur-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6 transparent-autofill">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-white">
                Enter Registered Email ID *
              </Label>
              <InputWithTooltip error={errors.email} tooltipPosition="bottom">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter registered email id"
                  value={email}
                  autoComplete="new-password"
                  data-transparent-bg="true"
                  onChange={(e) => {
                    setEmail(e.target.value)
                    clearFieldError("email") // Clear error when user starts typing
                  }}
                  className={`h-12 px-4 text-base bg-transparent focus:bg-transparent hover:bg-transparent active:bg-transparent border border-white/30 focus:border-white/60 focus:outline-none rounded-lg transition-all placeholder:font-normal placeholder:text-gray-300 text-white font-semibold hover:border-white/40 ${errors.email ? "border-red-400/70 focus:border-red-400" : ""
                    }`}
                  style={{
                    backgroundColor: 'transparent',
                    WebkitBoxShadow: 'inset 0 0 0 1000px transparent',
                    MozBoxShadow: 'inset 0 0 0 1000px transparent',
                    boxShadow: 'inset 0 0 0 1000px transparent',
                    WebkitTextFillColor: 'white',
                    background: 'transparent',
                    backgroundImage: 'none',
                    color: 'white'
                  }}
                />
              </InputWithTooltip>
            </div>

            {/* General Error Message */}
            {errors.general && (
              <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                {errors.general}
              </div>
            )}

            {/* Spacer */}
            <div className="h-[18px]"></div>

            {/* Reset Password Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-gradient-brand hover:opacity-90 text-white shadow-brand rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                "Reset Password"
              )}
            </Button>

            {/* Back to Login Link */}
            <div className="text-center pt-4">
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 text-white hover:text-gray-200 font-medium text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
