"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const reports = [
  { value: "154568", label: "154568" },
  { value: "154567", label: "154567" },
  { value: "154566", label: "154566" },
  { value: "154565", label: "154565" },
]

export function ReportSelector() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("154568")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          size="sm"
          className="h-8 justify-between font-normal"
        >
          {value ? reports.find((report) => report.value === value)?.label : "Select report..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search reports..." />
          <CommandList>
            <CommandEmpty>No report found.</CommandEmpty>
            <CommandGroup>
              {reports.map((report) => (
                <CommandItem
                  key={report.value}
                  value={report.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === report.value ? "opacity-100" : "opacity-0")} />
                  {report.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
