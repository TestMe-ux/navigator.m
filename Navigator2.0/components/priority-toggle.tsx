"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type PriorityOption = {
  id: string
  label: string
}

const options: PriorityOption[] = [
  { id: "cheapest", label: "By Cheapest" },
  { id: "split", label: "By Split" },
  { id: "product", label: "By Product" },
]

export function PriorityToggle() {
  const [selectedOption, setSelectedOption] = React.useState("cheapest")

  return (
    <div className="flex items-center space-x-2">
      {options.map((option) => (
        <label key={option.id} className={cn("flex cursor-pointer items-center space-x-2")}>
          <input
            type="radio"
            name="priority"
            value={option.id}
            checked={selectedOption === option.id}
            onChange={() => setSelectedOption(option.id)}
            className="h-4 w-4 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">{option.label}</span>
        </label>
      ))}
    </div>
  )
}
