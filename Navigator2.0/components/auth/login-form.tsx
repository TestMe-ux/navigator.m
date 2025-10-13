"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff, Activity, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { InputWithTooltip, ValidationHelpers } from "@/components/auth/field-tooltip"
import { LocalStorageService, LoginResponse } from "@/lib/localstorage"
import { GetSIDListforUser, GetPackageDetails } from "@/lib/login"

/**
 * Login Form Component
 * 
 * Features:
 * - Email/Username input field
 * - Password field with visibility toggle
 * - Stay logged in checkbox
 * - Reset password link
 * - Navigator branding
 * - Form validation
 * - Accessible design
 * 
 * @component
 * @version 1.0.0
 */
export function LoginForm() {
  const router = useRouter()

  // State management for form fields and UI
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [stayLoggedIn, setStayLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<any>(null)
  const [hotelOptions, setHotelOptions] = useState<any>([])
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: ""
  })

  const [paramSid, setParamSid] = useState<number | null>(null);

  // Override autofill styling with comprehensive CSS
  React.useEffect(() => {
    const style = document.createElement('style')
    style.id = 'login-autofill-override'
    style.textContent = `
      /* Ultra-aggressive autofill override targeting login form specifically */
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
      const existingStyle = document.getElementById('login-autofill-override')
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
   * Set specific field error
   */
  const setFieldError = (field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }))
  }

  /**
   * Validate form fields
   */
  const validateForm = () => {
    const newErrors = {
      email: ValidationHelpers.username(email),
      password: ValidationHelpers.password(password),
      general: ""
    }

    setErrors(newErrors)

    // Return true if no errors
    return !newErrors.email && !newErrors.password
  }

  /**
   * Handle form submission
   * @param {React.FormEvent} e - Form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Import login functions dynamically to avoid SSR issues
      const { Login } = await import('@/lib/login')

      // Prepare login data
      const loginData = {
        username: email,
        password: password,
        checkedStayLoggedIn: stayLoggedIn
      }


      // Make API call with encrypted password
      const response = await Login(loginData)

      // Handle successful login
      const loginSuccess = handleSuccessfulLogin(response, stayLoggedIn)

      if (loginSuccess) {

        // Get SID list for user
        getSIDListforUser();


        if (!response.body.userDetails.operationType) {

          const baseUrl = response.body.userDetails.applicationURL;
          const authToken = response.body.userDetails.accessToken;

          const Sid = paramSid ?? 17535
          const redirectUrl = `${baseUrl}/auth?unifiedauth=${authToken}&sid=${Sid}`;

          console.log("Redirecting to Classic Optima:", redirectUrl);

          // Option 1: Redirect in same tab
          window.location.href = redirectUrl;
        }

      } else {
        setErrors(prev => ({
          ...prev,
          general: response?.message || "Login failed. Please check your credentials and try again."
        }))
      }

    } catch (error) {
      setIsLoading(false)
      console.error('Login error:', error)
      const errorMessage = handleLoginError(error)
      setErrors(prev => ({
        ...prev,
        general: errorMessage
      }))
    } finally {
      setIsLoading(false);
    }
  }
  function handleLoginError(error: any) {
    console.error('Login error:', error);
    LocalStorageService.setLoginStatus(false);

    // Return user-friendly error message
    if (error.response?.status === 401) {
      return "Invalid username or password. Please try again.";
    } else if (error.response?.status === 400) {
      return "Invalid request. Please check your input.";
    } else if (error.response?.status >= 500) {
      return "Server error. Please try again later.";
    } else {
      return "Login failed. Please try again.";
    }
  }
  /**
   * Toggle password visibility
   */
  function handleSuccessfulLogin(response: LoginResponse, stayLoggedIn: boolean = false) {
    if (response.status) {
      // Clear existing localStorage
      LocalStorageService.clear();

      // Store user details
      LocalStorageService.setUserDetails(response.body.userDetails);

      // Store user token
      LocalStorageService.setUserToken(LocalStorageService.getAccessToken() || '');

      // Calculate and store refresh time
      const refreshTime = new Date(response.body.expiration);
      LocalStorageService.setRefreshTime(refreshTime.getTime());

      // Store access token
      LocalStorageService.setAccessToken(response.body.token);

      // Set login status
      LocalStorageService.setLoginStatus(true);

      // Get SID list for user
      // GetSIDListforUser(response.body).catch(error => {
      //     console.error('Error getting SID list:', error);
      // });

      return true;
    } else {
      // Set login status to false on failure
      LocalStorageService.setLoginStatus(false);
      return false;
    }
  }
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }
  const getSIDListforUser = () => {
    debugger;
    const userdetail = LocalStorageService.getUserDetails();
    GetSIDListforUser({ UserID: userdetail?.userId })
      .then((res) => {
        if (res.status) {
          debugger
          LocalStorageService.setItem('Properties', res.body);

          // Find Alhambra Hotel in the properties list, fallback to first property if not found
          const alhambraHotel = res.body.find((property: any) =>
            property.name && property.name.toLowerCase().includes('alhambra')
          );
          const defaultProperty = res.body[0];

          LocalStorageService.setItem('SelectedProperty', defaultProperty);
          setSelectedHotel(defaultProperty);
          setHotelOptions(res.body);

          setParamSid(defaultProperty.sId);
          // Call getPackageDetails after setting properties
          getPackageDetails(res.body[0]);

          router.push('/')
          // setotachannel(res.body);
          // getOTARankOnAllChannels(res.body);
          // setinclusionValues(res.body.map((inclusion: any) => ({ id: inclusion, label: inclusion })));
        }
        setIsLoading(false);
      })
      .catch((err) => console.error(err));
  }

  const getPackageDetails = (property: any) => {
    GetPackageDetails({ sid: property.sid })
      .then((responsePack) => {
        if (responsePack.status) {
          let currentDateUTC = new Date().toISOString();
          LocalStorageService.setItem("packageDetails", JSON.stringify(responsePack.body));
        }
      })
      .catch((err) => console.error(err));
  }
  return (
    <div className="w-full space-y-6">
      {/* Login Form Card */}
      <Card className="shadow-2xl border border-white/20 bg-white/98 dark:bg-slate-900/98 backdrop-blur-lg">
        <CardContent className="p-6">
          {/* Navigator Header - Now inside the form container */}
          <div className="text-left">
            {/* Welcome Text with Small Icon */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-medium text-white">
                Welcome to Navigator
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 transparent-autofill">
            {/* Email/Username Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-white">
                User Name *
              </Label>
              <InputWithTooltip error={errors.email} tooltipPosition="bottom">
                <Input
                  id="email"
                  name="username"
                  type="email"
                  placeholder="Enter Username"
                  value={email}
                  // autoComplete="new-password"
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

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-white">
                Password *
              </Label>
              <InputWithTooltip error={errors.password} tooltipPosition="bottom">
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    value={password}
                    // autoComplete="new-password"
                    data-transparent-bg="true"
                    onChange={(e) => {
                      setPassword(e.target.value)
                      clearFieldError("password") // Clear error when user starts typing
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

            {/* Stay Logged In & Reset Password Row */}
            <div className="flex items-center justify-between mb-6">
              {/* Stay Logged In Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stayLoggedIn"
                  checked={stayLoggedIn}
                  onCheckedChange={(checked) => setStayLoggedIn(!!checked)}
                  className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label
                  htmlFor="stayLoggedIn"
                  className="text-sm text-white cursor-pointer"
                >
                  Stay logged in
                </Label>
              </div>

              {/* Reset Password Link */}
              <Link
                href="/login/reset-password"
                className="text-sm text-white hover:text-gray-200 font-medium transition-colors"
              >
                Reset password
              </Link>
            </div>

            {/* General Error Message */}
            {errors.general && (
              <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                {errors.general}
              </div>
            )}

            {/* Spacer */}
            <div className="h-[18px]"></div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-gradient-brand hover:opacity-90 text-white shadow-brand rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-10"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Login"
              )}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}
