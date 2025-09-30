import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUp, ArrowDown } from "lucide-react"

export function PriceDifferenceTable() {
  const data = [
    { hotel: "Soneva Fushi", rate: "$ 2,400", change: null, room: "Soneva Fushi Family Suite with Pool" },
    { hotel: "One&Only Reethi Rah", rate: "$ 2,150", change: null, room: "Beach Villa Two Queen Beds" },
    {
      hotel: "Four Seasons Resort Maldives at Landaa Giraavaru",
      rate: "$ 1,750",
      change: 10,
      room: "Premier Oceanfront King Bungalow with Pool",
    },
    { hotel: "Anantara Kihavah Maldives Villas", rate: "$ 1,563", change: null, room: "Beach Pool Villa" },
    {
      hotel: "Vakkaru Maldives - 30 percent off on seaplane transfers for stays until 19 Dec 2025",
      rate: "$ 817",
      change: -1,
      room: "Over Water Villa - 30% off on Return Seaplane Transfers (Applicable for stays from 11th Jan...)",
    },
    { hotel: "JOALI Maldives", rate: "No flex", change: null, room: "" },
    { hotel: "Six Senses Laamu", rate: "LOS2", change: null, room: "" },
  ]

  return (
    <Card className="bg-white dark:bg-slate-800/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Price difference</CardTitle>
        <a
          href="#"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          See in Rate trend
        </a>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4 mb-4">
          <div className="text-3xl font-bold text-red-500">-58%</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">vs. Compset</div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Hotel name</TableHead>
              <TableHead className="w-[150px]">Rate (vs. Previous Period)</TableHead>
              <TableHead>Room name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.hotel}</TableCell>
                <TableCell className="flex items-center">
                  {row.rate}
                  {row.change !== null && (
                    <span
                      className={`ml-2 flex items-center text-xs ${row.change > 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {row.change > 0 ? `(+${row.change})` : `(${row.change})`}
                      {row.change > 0 ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />}
                    </span>
                  )}
                </TableCell>
                <TableCell>{row.room}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
