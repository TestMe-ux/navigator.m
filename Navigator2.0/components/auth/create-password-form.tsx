"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff, ArrowLeft, Loader2, Check, X } from "lucide-react"
import Link from "next/link"
import { InputWithTooltip, ValidationHelpers } from "@/components/auth/field-tooltip"
import { PasswordRecovery } from "@/lib/login"
import { CryptoUtils } from "@/lib/crypto"

/**
 * Create New Password Form Component
 * 
 * Features:
 * - Password creation with complexity validation
 * - Password confirmation field
 * - Real-time password requirements popup
 * - Password visibility toggles
 * - Form validation with detailed error messages
 * - Professional styling consistent with login forms
 * 
 * @component
 * @version 1.0.0
 */
interface CreatePasswordFormProps {
  userId: string;
  token: string;
}

export function CreatePasswordForm({ userId, token }: CreatePasswordFormProps) {
  // State management
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
    general: ""
  })

  // Override autofill styling with comprehensive CSS (same as login form)
  React.useEffect(() => {
    const style = document.createElement('style')
    style.id = 'create-password-autofill-override'
    style.textContent = `
      /* Ultra-aggressive autofill override targeting create password form specifically */
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
      const existingStyle = document.getElementById('create-password-autofill-override')
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
   * Password validation rules
   */
  const passwordRules = [
    {
      id: 'length',
      label: 'At least 8-12 characters',
      test: (pwd: string) => pwd.length >= 8 && pwd.length <= 12
    },
    {
      id: 'uppercase',
      label: '1 uppercase letter (A-Z)',
      test: (pwd: string) => /[A-Z]/.test(pwd)
    },
    {
      id: 'lowercase',
      label: '1 lowercase letter (a-z)',
      test: (pwd: string) => /[a-z]/.test(pwd)
    },
    {
      id: 'number',
      label: '1 number (0-9)',
      test: (pwd: string) => /[0-9]/.test(pwd)
    },
    {
      id: 'special',
      label: '1 special char. (!@#$%^&*)',
      test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    }
  ]

  /**
   * Get password strength score
   */
  const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (pwd.length === 0) return { score: 0, label: '', color: '' }

    const passedRules = passwordRules.filter(rule => rule.test(pwd)).length
    const score = (passedRules / passwordRules.length) * 100

    if (score <= 40) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score <= 80) return { score, label: 'Good', color: 'bg-yellow-500' }
    return { score, label: 'Strong', color: 'bg-green-500' }
  }

  /**
   * Validate password complexity
   */
  const validatePassword = (pwd: string): string => {
    if (!pwd.trim()) return "Please create a password"

    const failedRules = passwordRules.filter(rule => !rule.test(pwd))
    if (failedRules.length > 0) {
      return "Password must meet all requirements shown below"
    }

    return ""
  }

  /**
   * Validate form fields
   */
  const validateForm = () => {
    const newErrors = {
      password: validatePassword(password),
      confirmPassword: "",
      general: ""
    }

    // Validate password confirmation
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== "")
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const passwordEncrypted = CryptoUtils.encryptString(password);
      // API call for password creation using validated userId and token
      const response = await PasswordRecovery({ uid: userId, token: token, pwd: passwordEncrypted })

      if (response.status) {

        if (response.message === "Success") {
          console.log('Password created successfully')
          setIsSubmitted(true)
          // if (this.Identifier == 1) {
          //   this.router.navigate(['welcome'], { queryParams: { userid: this.UserId, token: response.body } });
          // }
        }
        else {
          setErrors(prev => ({
            ...prev,
            general: "Somthing Went Worng Please Try Again!"
          }))
        }

      }
      else {

        if (response.message === "User Already Deleted!") {
          setErrors(prev => ({
            ...prev,
            general: "User is already deleted so cant change their Password!"
          }))
        }
        else if (response.message === "Invalid Auth Token!" || response.message === "Token is Expired!!") {
          setErrors(prev => ({
            ...prev,
            general: "Token Expired! Please Request Again for new Password Change!"
          }))
        }
        else if (response.message === "One of the last two passwords") {
          setErrors(prev => ({
            ...prev,
            general: "Current Password matches with the previous Ones Please try with another One!"
          }))
        }
        else if (response.message === "Unable to send mail, please contact support team.") {
          setErrors(prev => ({
            ...prev,
            general: "Current Password matches with the previous Ones Please try with another One!"
          }))
        }
        else if (password === "empty") {
          if (response.message === "User Verified") {

          }
          else if (response.message != "User Verified") {
            setErrors(prev => ({
              ...prev,
              general: "Please check for Link and Try Again!"
            }))
          }
        }
      }
      console.log('Password created successfully')
      // setIsSubmitted(true)

    } catch (error) {
      console.error('Password creation error:', error)
      setErrors(prev => ({
        ...prev,
        general: "Failed to create password. Please try again."
      }))
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  // Show success screen after password creation
  if (isSubmitted) {
    return (
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-medium text-white">
              Password Created Successfully
            </h1>
            <p className="text-sm text-white">
              Your new password has been set. You can now log in with your new password.
            </p>
          </div>
        </div>

        {/* Success Card */}
        <Card className="shadow-2xl border border-white/20 bg-white/98 dark:bg-slate-900/98 backdrop-blur-lg">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
              <p className="text-white font-medium">
                Your password has been successfully updated!
              </p>
            </div>

            <div className="h-[18px]"></div> {/* Spacer */}

            <Button
              onClick={() => window.location.href = '/login'}
              className="w-full h-12 text-base font-semibold bg-gradient-brand hover:opacity-90 text-white shadow-brand rounded-lg transition-all transform hover:scale-[1.02]"
            >
              Continue to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-medium text-white">
            Create New Password
          </h1>
          <p className="text-sm text-white">
            Create strong password with mix of letters, numbers, and symbols.
          </p>
        </div>
      </div>

      {/* Create Password Form Card */}
      <Card className="shadow-2xl border border-white/20 bg-white/98 dark:bg-slate-900/98 backdrop-blur-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6 transparent-autofill">
            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-white">
                New Password *
              </Label>

              <InputWithTooltip error={errors.password} tooltipPosition="bottom">
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    autoComplete="new-password"
                    data-transparent-bg="true"
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      clearFieldError("password")
                    }}
                    className={`h-12 px-4 pr-12 text-base bg-transparent focus:bg-transparent hover:bg-transparent active:bg-transparent border border-white/30 focus:border-white/60 focus:outline-none rounded-lg transition-all placeholder:font-normal placeholder:text-gray-300 text-white font-semibold hover:border-white/40 ${errors.password ? "border-red-400/70 focus:border-red-400" : ""
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-300 hover:text-white hover:bg-transparent bg-transparent rounded-md transition-all"
                    onClick={togglePasswordVisibility}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </InputWithTooltip>
            </div>

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/90">Password Strength:</span>
                  <span className={`text-sm font-medium ${getPasswordStrength(password).label === 'Strong'
                    ? 'text-green-300'
                    : getPasswordStrength(password).label === 'Good'
                      ? 'text-yellow-300'
                      : 'text-red-300'
                    }`}>
                    {getPasswordStrength(password).label}
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(password).color}`}
                    style={{ width: `${getPasswordStrength(password).score}%` }}
                  />
                </div>
              </div>
            )}

            {/* Password Requirements - Always Visible */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-white/90 leading-tight">
                Password Requirements:
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {passwordRules.map((rule, index) => {
                  const isValid = rule.test(password)
                  const hasValue = password.length > 0

                  return (
                    <div
                      key={rule.id}
                      className={`flex items-center space-x-2 text-xs leading-tight transition-all duration-200 ${hasValue
                        ? isValid
                          ? "opacity-100"
                          : "opacity-100"
                        : "opacity-70"
                        }`}
                    >
                      <div className="flex-shrink-0">
                        {isValid ? (
                          <Check className="w-3 h-3 text-green-300" />
                        ) : (
                          <div className="w-3 h-3 flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-gray-400/50" />
                          </div>
                        )}
                      </div>
                      <span
                        className={
                          isValid
                            ? "text-green-300 font-medium"
                            : hasValue
                              ? "text-white/60"
                              : "text-gray-400"
                        }
                      >
                        {rule.label}
                      </span>
                    </div>
                  )
                })}
              </div>

            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-white">
                Confirm Password *
              </Label>
              <InputWithTooltip error={errors.confirmPassword} tooltipPosition="bottom">
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    autoComplete="new-password"
                    data-transparent-bg="true"
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      clearFieldError("confirmPassword")
                    }}
                    className={`h-12 px-4 pr-12 text-base bg-transparent focus:bg-transparent hover:bg-transparent active:bg-transparent border border-white/30 focus:border-white/60 focus:outline-none rounded-lg transition-all placeholder:font-normal placeholder:text-gray-300 text-white font-semibold hover:border-white/40 ${errors.confirmPassword ? "border-red-400/70 focus:border-red-400" : ""
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-300 hover:text-white hover:bg-transparent bg-transparent rounded-md transition-all"
                    onClick={toggleConfirmPasswordVisibility}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </InputWithTooltip>

              {/* Password Match Indicator */}
              {confirmPassword.length > 0 && (
                <div className="flex items-center space-x-2 text-sm">
                  {password === confirmPassword ? (
                    <>
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-green-300 font-medium">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                        <X className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-red-300">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* General Error Message */}
            {errors.general && (
              <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                {errors.general}
              </div>
            )}


            {/* Create Password Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-gradient-brand hover:opacity-90 text-white shadow-brand rounded-lg transition-all transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 hover:scale-[1.02] mt-10"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Password...</span>
                </div>
              ) : (
                <span>Create Password</span>
              )}
            </Button>

            {/* Back to Login Link */}
            <div className="text-center">
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
