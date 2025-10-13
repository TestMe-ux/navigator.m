"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronDown, UserCircle, Search, Bell, Menu, X, Activity } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { GetSIDListforUser } from "@/lib/login"
import { LocalStorageService } from "@/lib/localstorage"
import { useSelectedProperty, useUserDetail } from "@/hooks/use-local-storage"
import { getAccessurl, saveSwitchAccessUrl } from "@/lib/userManagement"
import { toast } from "@/hooks/use-toast"

/**
 * Navigation Configuration
 * Centralized navigation structure for maintainability
 */
const navItems: Array<{ name: string; href: string; dropdown?: boolean; items?: Array<{ name: string; href: string; description?: string }> }> = [];



/**
 * Enhanced Header Component
 * 
 * A professional navigation header with:
 * - Brand gradient design system
 * - Responsive navigation with dropdowns
 * - Advanced hotel search functionality
 * - User notifications and settings
 * - Dark/light mode toggle
 * - Mobile-optimized responsive design
 * 
 * @component
 * @version 2.0.0
 */
export function Header() {
  // Hooks for navigation and state management
  const didFetch = useRef(false);
  const pathname = usePathname()
  const [selectedHotel, setSelectedHotel] = useState<any>(null)
  const [hotelOptions, setHotelOptions] = useState<any>([])
  const [hotelSearch, setHotelSearch] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notificationCount] = useState(3) // Mock notification count
  const [userDetail] = useUserDetail();
  const [selectedProperty] = useSelectedProperty()


  useEffect(() => {
    if (didFetch.current || typeof window === 'undefined') return;

    didFetch.current = true;
    const selectedProperty = LocalStorageService.getItem('SelectedProperty');
    const properties = LocalStorageService.getItem('Properties');
    if (selectedProperty) {
      setSelectedHotel(selectedProperty);
      setHotelOptions(properties)
      return
    }

  }, [])

  /**
   * Determine active navigation tab based on current route
   * @returns {string} Active tab name
   */
  const getActiveTab = useCallback(() => {
    if (pathname === "/") return "Overview"
    if (pathname.startsWith("/rate-trend") || pathname.startsWith("/demand")) return "Analytics"
    return "Overview"
  }, [pathname])

  const activeTab = getActiveTab()

  /**
   * Filter hotels based on search query
   * Memoized for performance optimization
   */
  const filteredHotels = useMemo(() => {
    if (!hotelSearch.trim()) return hotelOptions

    const searchLower = hotelSearch.toLowerCase()
    return hotelOptions.filter((hotel: any) =>
      hotel?.name?.toLowerCase().includes(searchLower) ||
      hotel?.city?.toLowerCase().includes(searchLower) ||
      hotel?.country?.toLowerCase().includes(searchLower)
    )
  }, [hotelSearch, hotelOptions])

  /**
   * Handle hotel selection with debugging
   * @param {Object} hotel - Selected hotel object
   */
  const handleHotelSelect = useCallback((hotel: any) => {
    try {
      setSelectedHotel(hotel);
      LocalStorageService.setItem('SelectedProperty', hotel);
      setHotelSearch("");
      console.log(`🏨 Hotel selected: ${hotel.name} (ID: ${hotel?.hmid})`);

      // Trigger a page reload to ensure all components get the updated property data
      // This is necessary because some components rely on localStorage and need a full refresh
      window.location.reload();

    } catch (error) {
      console.error("❌ Error selecting hotel:", error);
    }
  }, []);

  /**
   * Toggle mobile menu visibility
   */
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev)
  }, [])

  /**
   * Truncate text with ellipsis after specified length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length before truncation
   * @returns {string} Truncated text with ellipsis
   */
  const truncateText = useCallback((text: string, maxLength: number) => {
    if (text?.length <= maxLength) return text
    return text?.substring(0, maxLength) + '...'
  }, [])

  //handle Switch To Classic URL
  const handleSwitchToClassic = async () => {
    debugger
    try {
      // 🟢 Validate user and property before continuing
      if (!userDetail?.accessToken || !userDetail?.userId || !selectedProperty?.sid) {
        console.error("Missing user details or selected property");
        toast({
          title: "Validate user detail ",
          description: "Missing user details or selected property",
          variant: "error",
          duration: 5000,
        });
        return;
      }

      const paramUnifiedAuth = userDetail.accessToken;
      const paramSId = selectedProperty.sid;

      // 🟢 Prepare payload for saving switch access
      const switchAccUrlUser = {
        accessToken: paramUnifiedAuth,
        userID: Number(userDetail.userId),
        sId: paramSId,
        isSwitching: 1, // 2 = New Navigator → Old Navigator
        iPAddress: "",
      };

      console.log("Saving switch access data:", switchAccUrlUser);

      // 🟢 Save switch access URL
      const response = await saveSwitchAccessUrl(switchAccUrlUser);

      if (response?.status && response?.body) {
        console.log("✅ SwitchAccessUrlData saved successfully");

        // 🟢 Fetch the new access URL for Classic Optima
        const resAcc = await getAccessurl({
          unifiedauth: paramUnifiedAuth,
          flagOptima: 3, // 2 = Navigator
        });

        if (resAcc?.status && resAcc?.body) {

          const baseUrl = resAcc.body.userDetails.applicationURL;
          const redirectUrl = `${baseUrl}auth?unifiedauth=${paramUnifiedAuth}&sid=${paramSId}`;
          //const redirectUrl = resAcc.body.userDetails.applicationURL + `auth?unifiedauth=${paramUnifiedAuth}&sid=${paramSId}`;
          LocalStorageService.clear();

          console.log("Redirecting to Classic Optima:", redirectUrl);

          window.location.href = redirectUrl;

          // 🟢 Option 2: Open in new tab
          // window.open(redirectUrl, "_blank");
        } else {
          console.error("❌ Failed to fetch access URL for Classic Optima");
        }
      } else {
        console.error("❌ Failed to save switch access URL data");
      }
    } catch (error) {
      console.error("🚨 Error switching to Classic Optima:", error);
    }
  };


  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] w-full bg-gradient-brand text-white border-b border-white/10 shadow-brand-lg"
      data-component-name="Header"
    >
      {/* Main Navigation Container */}
      <div className="flex h-16 items-center justify-between px-1 sm:px-2 lg:px-3">

        {/* Left Side - Application Branding */}
        <Link href="/login" className="flex-shrink-0 flex items-center gap-3 justify-center pl-1 hover:opacity-80 transition-opacity">
          <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-white">Navigator</h1>
          </div>
        </Link>

        {/* Desktop Navigation Menu */}
        <nav className="hidden md:flex items-center space-x-1 flex-grow justify-center">
          {navItems.map((item) =>
            item.dropdown ? (
              <DropdownMenu key={item.name}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all duration-200 hover:bg-white/10 ${activeTab === item.name
                      ? "text-white bg-white/20 shadow-sm"
                      : "text-blue-100 hover:text-white"
                      }`}
                  >
                    {item.name}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-brand-lg min-w-[280px]"
                  align="center"
                >
                  {(item.items?.length ?? 0) > 0 ? (
                    item.items?.map((subItem: { name: string; href: string; description?: string }, index: number) => (
                      <div key={subItem.name}>
                        <DropdownMenuItem asChild>
                          <Link
                            href={subItem.href}
                            className={`block px-4 py-3 text-sm hover:bg-gradient-brand-subtle transition-colors ${pathname === subItem.href
                              ? "font-semibold text-brand-600 dark:text-brand-400 bg-gradient-brand-subtle"
                              : "text-slate-700 dark:text-slate-300"
                              }`}
                          >
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">{subItem.name}</span>
                              {subItem.description && (
                                <span className="text-sm text-muted-foreground">{subItem.description}</span>
                              )}
                            </div>
                          </Link>
                        </DropdownMenuItem>
                        {index < (item.items?.length ?? 0) - 1 && <DropdownMenuSeparator />}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">No sub-items available.</div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button key={item.name} variant="ghost" asChild>
                <Link
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium relative transition-all duration-200 hover:bg-white/10 ${activeTab === item.name
                    ? "text-white bg-white/20 shadow-sm"
                    : "text-blue-100 hover:text-white"
                    }`}
                >
                  {item.name}
                </Link>
              </Button>
            )
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">

          {/* Hotel Selector */}
          <TooltipProvider>
            <Tooltip>
              <DropdownMenu>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-sm text-blue-100 hover:text-white hover:bg-white/10 max-w-[200px] sm:max-w-[280px] flex items-center text-left transition-all duration-200"
                    >
                      <div className="flex flex-col items-start max-w-full">
                        <span className="truncate text-white font-medium">{truncateText(selectedHotel?.name || 'Select Hotel', 32)}</span>
                        <span className="truncate text-xs text-blue-200">{selectedHotel?.city || 'City'}, {selectedHotel?.country || 'Country'}</span>
                      </div>
                      <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                {selectedHotel?.name?.length > 35 && (
                  <TooltipContent>
                    <p>{selectedHotel?.name}</p>
                  </TooltipContent>
                )}
                <DropdownMenuContent
                  className="bg-white dark:bg-slate-900 w-80 sm:w-96 shadow-brand-lg"
                  align="end"
                >
                  {/* Search Header */}
                  <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search hotels, locations..."
                        value={hotelSearch}
                        onChange={(e) => setHotelSearch(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="pl-10 w-full text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-brand-500 focus:border-brand-500"
                      />
                    </div>
                  </div>

                  {/* Hotel List */}
                  <div className="max-h-72 overflow-y-auto">
                    {filteredHotels?.length > 0 ? (
                      filteredHotels?.map((hotel: any) => (
                        <DropdownMenuItem
                          key={hotel.hmid}
                          onSelect={() => handleHotelSelect(hotel)}
                          className={`cursor-pointer px-4 py-3 transition-colors ${selectedHotel.hmid === hotel.hmid
                            ? "bg-gradient-brand-subtle text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                        >
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm truncate">{hotel?.name || 'Unknown Hotel'}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{hotel?.city || 'City'}, {hotel?.country || 'Country'}</span>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <div className="text-sm text-slate-500 dark:text-slate-400">No hotels found.</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          Try adjusting your search criteria
                        </div>
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </Tooltip>
          </TooltipProvider>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-100 hover:text-white hover:bg-white/10 relative transition-all duration-200"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse-glow">
                {notificationCount}
              </span>
            )}
            <span className="sr-only">Notifications ({notificationCount})</span>
          </Button>

          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>



          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-100 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                {userDetail?.imagePath ? (
                  <img
                    src={userDetail?.imagePath}
                    alt="Profile"
                    className="h-5 w-5 object-cover rounded-full group-hover:opacity-50 transition-opacity duration-200"
                  />
                ) : (
                  <UserCircle className="h-5 w-5" />)}
                <span className="sr-only">User Profile</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-brand-lg min-w-[200px]"
              align="end"
            >
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 mb-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{userDetail?.firstName + " " + userDetail?.lastName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{userDetail?.email}</p>
              </div>
              <DropdownMenuItem asChild>
                <Link
                  href="/my-account"
                  className="block px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4 transition-colors" />
                    My Account
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSwitchToClassic}
                className="cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-2">
                  <span>Switch to Navigator</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-white dark:hover:bg-white cursor-pointer">
                <div className="flex items-center gap-2" onClick={() => {
                  LocalStorageService.logout();
                  window.location.href = '/login'
                }}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="text-blue-100 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-gradient-brand">
          <div className="px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <div key={item.name}>
                {item.dropdown ? (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-blue-100 px-3 py-2">
                      {item.name}
                    </div>
                    {item.items?.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`block px-6 py-2 text-sm transition-colors ${pathname === subItem.href
                          ? "text-white bg-white/20 rounded-lg font-medium"
                          : "text-blue-100 hover:text-white hover:bg-white/10 rounded-lg"
                          }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`block px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === item.name
                      ? "text-white bg-white/20 font-medium"
                      : "text-blue-100 hover:text-white hover:bg-white/10"
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
