"use client"

import * as React from "react"
import { X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { GetTagInclusions, GetTagProducts } from "@/lib/mapping"
import { useEffect } from "react"
import localStorageService from "@/lib/localstorage"
import { set } from "date-fns"


export type FilterValue = {
  lengthOfStay: string | null // Radio button - single selection
  rateTypes: string   // Radio button - single selection
  roomTypes: string   // Radio button - single selection
  inclusions: string[] // Checkbox - multi-selection
  device: string[]     // Checkbox - multi-selection
  guest: string | null // Radio button - single selection
  rateViewBy: any // Optional field for rate view by
}

const defaultFilters: FilterValue = {
  lengthOfStay: "All",
  guest: "All",
  rateTypes: "low",
  roomTypes: "",
  inclusions: [],
  device: ["All", "desktop", "mobile"],
  rateViewBy: {
    RestrictionText: "All",
    PromotionText: "All",
    QualificationText: "All",
    Restriction: null,
    Qualification: null,
    Promotion: null
  }
}

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: FilterValue) => void
  initialFilters?: Partial<FilterValue>
  losGuest: { "Los": [], "Guest": [] }
}

export function FilterSidebar({ isOpen, onClose, onApply, initialFilters = {}, losGuest }: FilterSidebarProps) {
  const [selectedProperty, setSelectedProperty] = React.useState<any>(localStorageService.get('SelectedProperty'))
  const [filters, setFilters] = React.useState<FilterValue>({
    ...defaultFilters,
    ...initialFilters,
  })
  const [inclusionValues, setinclusionValues] = React.useState<any>([])
  const [roomTypeOptions, setroomTypeOptions] = React.useState<any>([])
  useEffect(() => {
    getInclusion();
    getTagProduct();
  }, []);
  const getInclusion = () => {
    GetTagInclusions({ SID: selectedProperty?.sid })
      .then((res) => {
        if (res.status) {
          const inclusionValuesData = res.body.map((inclusion: any) => ({ id: inclusion, label: inclusion }));
          const combineInclusion = [{ id: "All", label: "Any" }, ...inclusionValuesData]
          setinclusionValues(combineInclusion);

          // setFilters(res.body.map((inclusion: any) => (inclusion)));
          filters.inclusions = combineInclusion.map((inclusion: any) => inclusion.id);
        }
      })
      .catch((err) => console.error(err));
  }
  const getTagProduct = () => {
    GetTagProducts({ SID: selectedProperty?.sid })
      .then((res) => {
        if (res.status) {
          const roomTypeOptionsData = res.body.map((roomType: any) => ({ id: roomType.tagID, label: roomType.tagName + " (" + roomType.abbreviation + ")" }));
          const combineRoomType = [{ id: "All", label: "Any" }, ...roomTypeOptionsData]
          setroomTypeOptions(combineRoomType);
          filters.roomTypes = "All";
        }
      })
      .catch((err) => console.error(err));
  }
  // Handler for checkbox filters (multi-select)
  const handleCheckboxChange = (category: keyof FilterValue, value: string) => {
    setFilters((prev) => {
      const currentValues = prev[category] as string[]
      return {
        ...prev,
        [category]: currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value],
      }
    })
  }

  // Handler for radio button filters (single-select)
  const handleRadioChange = (category: keyof FilterValue, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: value,
    }))
  }

  const handleReset = () => {
    setFilters(defaultFilters)
  }

  const handleApply = () => {
    filters.guest = filters.guest === "All" ? null : filters.guest;
    filters.lengthOfStay = filters.lengthOfStay === "All" ? null : filters.lengthOfStay;
    filters.device = filters.device.filter((device) => device !== "All");
    filters.inclusions = filters.inclusions.includes("All") ? ["All"] : filters.inclusions;
    filters.rateViewBy = filters.rateTypes === "low" ? {
      RestrictionText: "All",
      PromotionText: "All",
      QualificationText: "All",
      Restriction: null,
      Qualification: null,
      Promotion: null
    } : {
      RestrictionText: "Un-Restricted",
      PromotionText: "Non-Promotional",
      QualificationText: "Un-Qualified",
      Restriction: false,
      Qualification: false,
      Promotion: false
    };
    onApply(filters)
    onClose()
  }

  const lengthOfStayOptions = [
    { id: "All", label: "Any" }, ...losGuest?.Los.map((los: any) => ({ id: los, label: los }))
  ]

  const guestOptions = [
    { id: "All", label: "Any" }, ...losGuest?.Guest.map((guest: any) => ({ id: guest, label: guest }))
  ]

  const deviceOptions = [
    { id: "All", label: "Any" },
    { id: "desktop", label: "Desktop" },
    { id: "mobile", label: "Mobile" },
  ]

  const rateTypeOptions = [
    // { id: "any", label: "Any" },
    { id: "low", label: "Lowest (LOW)" },
    { id: "bar", label: "Best Available Rate (BAR)" },
    // { id: "qlf", label: "Qualified (QLF)" },
    // { id: "rst", label: "Restricted (RST)" },
    // { id: "prm", label: "Promotional (PRM)" },
    // { id: "uql", label: "Un-Qualified (UQL)" },
  ]

  // const roomTypeOptions = [
  //   { id: "any", label: "Any" },
  //   { id: "apt", label: "Apartment (APT)" },
  //   { id: "dlx", label: "Deluxe Room (DLX)" },
  //   { id: "std", label: "Standard Room (STD)" },
  //   { id: "stu", label: "Studio (STU)" },
  //   { id: "ste", label: "Suite (STE)" },
  //   { id: "sup", label: "Superior Room (SUP)" },
  //   { id: "vll", label: "Villa (VLL)" },
  // ]



  return (
    <>
      {/* Backdrop Overlay - Click to close */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Filter Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-80 transform bg-white dark:bg-slate-900 shadow-xl transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-slate-700 flex flex-col backdrop-blur-md",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header - Fixed at top */}
        <div className="flex items-center justify-between p-6 flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">More Filters</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors rounded-md">
            <X className="h-5 w-5 text-gray-500 dark:text-slate-400" />
          </Button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Filters Heading */}
          <div className="px-6 pt-3 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Filters</h3>
          </div>

          {/* Edge to edge separator */}
          <Separator className="border-gray-200 dark:border-slate-700" />

          <div className="px-6 space-y-6 pb-24 pt-6">
            {/* Rate Types */}
            <FilterSection title="Rate Types">
              <div className="space-y-1">
                {rateTypeOptions.map((option) => (
                  <label key={option.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="rateTypes"
                      value={option.id}
                      checked={filters.rateTypes === option.id}
                      onChange={() => handleRadioChange("rateTypes", option.id)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-0 focus:outline-none"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>
            {/* Room Types */}
            <FilterSection title="Room Types">
              <div className="space-y-1">
                {roomTypeOptions.map((option: any) => (
                  <label key={option.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="roomTypes"
                      value={option.id}
                      checked={filters.roomTypes === option.id}
                      onChange={() => handleRadioChange("roomTypes", option.id)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-0 focus:outline-none"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>
            {/* Length of Stay */}
            <FilterSection title="Guest">
              <div className="space-y-1">
                {guestOptions.map((option) => (
                  <label key={option.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="guest"
                      value={option.id}
                      checked={filters.guest === option.id}
                      onChange={() => handleRadioChange("guest", option.id)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-0 focus:outline-none"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>
            {/* Length of Stay */}
            <FilterSection title="Length of Stay">
              <div className="space-y-1">
                {lengthOfStayOptions.map((option) => (
                  <label key={option.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="lengthOfStay"
                      value={option.id}
                      checked={filters.lengthOfStay === option.id}
                      onChange={() => handleRadioChange("lengthOfStay", option.id)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-0 focus:outline-none"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>




            {/* Inclusions */}
            <FilterSection title="Inclusions">
              <div className="space-y-1">
                {inclusionValues.map((option: any) => (
                  <label key={option.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      value={option.id}
                      checked={filters.inclusions.includes(option.id)}
                      onChange={() => handleCheckboxChange("inclusions", option.id)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-0 focus:outline-none"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Device */}
            <FilterSection title="Device">
              <div className="space-y-1">
                {deviceOptions.map((option) => (
                  <label key={option.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      value={option.id}
                      checked={filters.device.includes(option.id)}
                      onChange={() => handleCheckboxChange("device", option.id)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-0 focus:outline-none"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>

          </div>
        </div>

        {/* Sticky Footer with Buttons */}
        <div className="flex-shrink-0 p-6 border-t border-gray-100 bg-gray-50 shadow-lg">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button className="flex-1 bg-[#4f46e5] hover:bg-[#4338ca] text-white" onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

interface FilterSectionProps {
  title: string
  children: React.ReactNode
}

function FilterSection({ title, children }: FilterSectionProps) {
  const [isOpen, setIsOpen] = React.useState(true)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-gray-200 bg-white">
        <CollapsibleTrigger asChild>
          <div className="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-md transition-colors">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">{title}</h3>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-gray-500 dark:text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-slate-400" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Separator className="border-gray-200 dark:border-slate-700" />
          <div className="p-4">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
