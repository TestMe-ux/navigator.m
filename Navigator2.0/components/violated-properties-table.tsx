"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type Property = {
  name: string
  loss: number
  meet: number
  win: number
  violations: number
  revenueLoss: string
}

const properties: Property[] = [
  {
    name: "Copthorne Hotel Newcastle",
    loss: 100,
    meet: 0,
    win: 0,
    violations: 30,
    revenueLoss: "$125.4K",
  },
  {
    name: "Aston Imperium Purwokerto",
    loss: 100,
    meet: 0,
    win: 0,
    violations: 30,
    revenueLoss: "$98.2K",
  },
  {
    name: "Grand Mercure Jakarta",
    loss: 85,
    meet: 15,
    win: 0,
    violations: 22,
    revenueLoss: "$76.5K",
  },
  {
    name: "Hilton London",
    loss: 70,
    meet: 25,
    win: 5,
    violations: 18,
    revenueLoss: "$62.3K",
  },
]

export function ViolatedPropertiesTable() {
  return (
    <Tabs defaultValue="violation">
      <div className="flex items-center justify-between">
        <TabsList className="h-8">
          <TabsTrigger value="violation" className="text-xs">
            Violation
          </TabsTrigger>
          <TabsTrigger value="loss-meet-win" className="text-xs">
            Loss/Meet/Win
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="violation" className="mt-2">
        <div className="max-h-[250px] overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white text-left text-xs font-medium text-gray-500">
              <tr>
                <th className="pb-2 pl-1">Property</th>
                <th className="pb-2 text-right">Loss %</th>
                <th className="pb-2 text-right">Violations</th>
                <th className="pb-2 text-right">Revenue Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {properties.map((property) => (
                <tr key={property.name} className="hover:bg-gray-50">
                  <td className="py-2 pl-1 font-medium">{property.name}</td>
                  <td className="py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span
                        className={cn(
                          "font-medium",
                          property.loss > 80 ? "text-red-600" : property.loss > 50 ? "text-amber-600" : "text-gray-600",
                        )}
                      >
                        {property.loss}%
                      </span>
                      <div className="w-16">
                        <Progress
                          value={property.loss}
                          className="h-1.5"
                          indicatorClassName={cn(
                            property.loss > 80 ? "bg-red-500" : property.loss > 50 ? "bg-amber-500" : "bg-gray-500",
                          )}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2 text-right font-medium">{property.violations}</td>
                  <td className="py-2 text-right font-medium text-red-600">{property.revenueLoss}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TabsContent>

      <TabsContent value="loss-meet-win">
        <div className="flex h-[250px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Loss/Meet/Win view coming soon</p>
        </div>
      </TabsContent>
    </Tabs>
  )
}
