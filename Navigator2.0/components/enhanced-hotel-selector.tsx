"use client"

import * as React from "react"
import { Search, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FilterOption {
  id: string
  name: string
  count?: number
}

interface HotelData {
  regions: FilterOption[]
  countries: Record<string, FilterOption[]>
  cities: Record<string, FilterOption[]>
  hotels: Record<string, FilterOption[]>
}

// Updated mock data structure with proper relationships
const hotelData: HotelData = {
  regions: [
    { id: "africa", name: "Africa", count: 1 },
    { id: "asia", name: "Asia", count: 3 },
    { id: "australia", name: "Australia", count: 0 },
    { id: "europe", name: "Europe", count: 2 },
    { id: "usa", name: "USA", count: 1 },
  ],
  countries: {
    asia: [
      { id: "china", name: "China", count: 0 },
      { id: "indonesia", name: "Indonesia", count: 2 },
      { id: "india", name: "India", count: 1 },
    ],
    europe: [
      { id: "uk", name: "United Kingdom", count: 2 },
      { id: "germany", name: "Germany", count: 0 },
      { id: "france", name: "France", count: 0 },
    ],
    usa: [
      { id: "california", name: "California", count: 0 },
      { id: "newyork", name: "New York", count: 1 },
      { id: "florida", name: "Florida", count: 0 },
    ],
    africa: [{ id: "namibia", name: "Namibia", count: 1 }],
  },
  cities: {
    indonesia: [
      { id: "jakarta", name: "Jakarta", count: 1 },
      { id: "bandung", name: "Bandung", count: 0 },
      { id: "purwokerto", name: "Purwokerto", count: 1 },
    ],
    uk: [
      { id: "london", name: "London", count: 1 },
      { id: "newcastle", name: "Newcastle", count: 1 },
    ],
    china: [
      { id: "beijing", name: "Beijing", count: 0 },
      { id: "shanghai", name: "Shanghai", count: 0 },
    ],
    india: [
      { id: "mumbai", name: "Mumbai", count: 0 },
      { id: "delhi", name: "Delhi", count: 1 },
    ],
    namibia: [{ id: "windhoek", name: "Windhoek", count: 1 }],
    newyork: [{ id: "manhattan", name: "Manhattan", count: 1 }],
  },
  hotels: {
    jakarta: [{ id: "grand-mercure-jakarta", name: "Grand Mercure Jakarta" }],
    newcastle: [{ id: "copthorne-newcastle", name: "Copthorne Hotel Newcastle" }],
    purwokerto: [{ id: "aston-imperium", name: "Aston Imperium Purwokerto" }],
    london: [{ id: "hilton-london", name: "Hilton London" }],
    windhoek: [{ id: "avani-windhoek", name: "Avani Windhoek Hotel & Casino" }],
    delhi: [{ id: "hotel-delhi", name: "Hotel Delhi" }],
    manhattan: [{ id: "hotel-manhattan", name: "Hotel Manhattan" }],
  },
}

interface EnhancedHotelSelectorProps {
  value?: string[]
  onChange?: (hotels: string[]) => void
  className?: string
}

export function EnhancedHotelSelector({ value = [], onChange, className }: EnhancedHotelSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedRegions, setSelectedRegions] = React.useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = React.useState<string[]>([])
  const [selectedCities, setSelectedCities] = React.useState<string[]>([])
  const [selectedHotels, setSelectedHotels] = React.useState<string[]>(value)

  const [regionSearch, setRegionSearch] = React.useState("")
  const [countrySearch, setCountrySearch] = React.useState("")
  const [citySearch, setCitySearch] = React.useState("")
  const [hotelSearch, setHotelSearch] = React.useState("")

  // Filter functions
  const filteredRegions = hotelData.regions.filter((region) =>
    region.name.toLowerCase().includes(regionSearch.toLowerCase()),
  )

  const availableCountries =
    selectedRegions.length === 0
      ? Object.values(hotelData.countries).flat()
      : selectedRegions.flatMap((regionId) => hotelData.countries[regionId] || [])

  const filteredCountries = availableCountries.filter((country) =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()),
  )

  const availableCities =
    selectedCountries.length === 0
      ? Object.values(hotelData.cities).flat()
      : selectedCountries.flatMap((countryId) => hotelData.cities[countryId] || [])

  const filteredCities = availableCities.filter((city) => city.name.toLowerCase().includes(citySearch.toLowerCase()))

  const availableHotels =
    selectedCities.length === 0
      ? Object.values(hotelData.hotels).flat()
      : selectedCities.flatMap((cityId) => hotelData.hotels[cityId] || [])

  const filteredHotels = availableHotels.filter((hotel) => hotel.name.toLowerCase().includes(hotelSearch.toLowerCase()))

  // Selection handlers
  const handleRegionToggle = (regionId: string, checked: boolean) => {
    if (regionId === "all") {
      setSelectedRegions(checked ? hotelData.regions.map((r) => r.id) : [])
    } else {
      setSelectedRegions((prev) => (checked ? [...prev, regionId] : prev.filter((id) => id !== regionId)))
    }
  }

  const handleCountryToggle = (countryId: string, checked: boolean) => {
    if (countryId === "all") {
      setSelectedCountries(checked ? availableCountries.map((c) => c.id) : [])
    } else {
      setSelectedCountries((prev) => (checked ? [...prev, countryId] : prev.filter((id) => id !== countryId)))
    }
  }

  const handleCityToggle = (cityId: string, checked: boolean) => {
    if (cityId === "all") {
      setSelectedCities(checked ? availableCities.map((c) => c.id) : [])
    } else {
      setSelectedCities((prev) => (checked ? [...prev, cityId] : prev.filter((id) => id !== cityId)))
    }
  }

  const handleHotelToggle = (hotelId: string, checked: boolean) => {
    if (hotelId === "all") {
      setSelectedHotels(checked ? availableHotels.map((h) => h.id) : [])
    } else {
      setSelectedHotels((prev) => (checked ? [...prev, hotelId] : prev.filter((id) => id !== hotelId)))
    }
  }

  const handleSubmit = () => {
    onChange?.(selectedHotels)
    setIsOpen(false)
  }

  const handleReset = () => {
    setSelectedRegions([])
    setSelectedCountries([])
    setSelectedCities([])
    setSelectedHotels([])
    setRegionSearch("")
    setCountrySearch("")
    setCitySearch("")
    setHotelSearch("")
  }

  const handleCancel = () => {
    setIsOpen(false)
  }

  const getDisplayText = () => {
    if (selectedHotels.length === 0) return "All Hotels"
    if (selectedHotels.length === 1) {
      const hotel = availableHotels.find((h) => h.id === selectedHotels[0])
      return hotel?.name || "1 hotel selected"
    }
    return `${selectedHotels.length} hotels selected`
  }

  const FilterColumn = ({
    title,
    count,
    searchValue,
    onSearchChange,
    items,
    selectedItems,
    onToggle,
  }: {
    title: string
    count: number
    searchValue: string
    onSearchChange: (value: string) => void
    items: FilterOption[]
    selectedItems: string[]
    onToggle: (id: string, checked: boolean) => void
  }) => (
    <div className="flex-1 border-r last:border-r-0 border-gray-200">
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm text-gray-700">
            {title} ({count})
          </h3>
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <ScrollArea className="h-64">
        <div className="p-2 space-y-1">
          <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
            <Checkbox
              id={`${title}-all`}
              checked={selectedItems.length === items.length && items.length > 0}
              onCheckedChange={(checked) => onToggle("all", checked as boolean)}
              className="border-gray-300 text-blue-600 focus:ring-blue-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <label htmlFor={`${title}-all`} className="text-sm font-medium cursor-pointer text-gray-700">
              All
            </label>
          </div>

          {items.map((item) => (
            <div key={item.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
              <Checkbox
                id={`${title}-${item.id}`}
                checked={selectedItems.includes(item.id)}
                onCheckedChange={(checked) => onToggle(item.id, checked as boolean)}
                className="border-gray-300 text-blue-600 focus:ring-blue-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <label htmlFor={`${title}-${item.id}`} className="text-sm cursor-pointer flex-1 text-gray-700">
                {item.name}
              </label>
              {item.count !== undefined && <span className="text-xs text-gray-500">({item.count})</span>}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-8 w-[140px] justify-between font-normal bg-white border-gray-300", className)}
        >
          <span className="truncate">{getDisplayText()}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[800px] p-0" align="start">
        <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
          <FilterColumn
            title="Regions"
            count={filteredRegions.length}
            searchValue={regionSearch}
            onSearchChange={setRegionSearch}
            items={filteredRegions}
            selectedItems={selectedRegions}
            onToggle={handleRegionToggle}
          />

          <FilterColumn
            title="Countries"
            count={filteredCountries.length}
            searchValue={countrySearch}
            onSearchChange={setCountrySearch}
            items={filteredCountries}
            selectedItems={selectedCountries}
            onToggle={handleCountryToggle}
          />

          <FilterColumn
            title="Cities"
            count={filteredCities.length}
            searchValue={citySearch}
            onSearchChange={setCitySearch}
            items={filteredCities}
            selectedItems={selectedCities}
            onToggle={handleCityToggle}
          />

          <FilterColumn
            title="Hotels"
            count={filteredHotels.length}
            searchValue={hotelSearch}
            onSearchChange={setHotelSearch}
            items={filteredHotels}
            selectedItems={selectedHotels}
            onToggle={handleHotelToggle}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600">{selectedHotels.length} hotels selected</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-gray-600 hover:text-gray-800">
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancel} className="border-gray-300 text-gray-700">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
              Submit
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
