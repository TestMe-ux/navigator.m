import { clsx, type ClassValue } from "clsx"
import { format, subHours } from "date-fns"
import { twMerge } from "tailwind-merge"
import { formatInTimeZone } from 'date-fns-tz';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function conevrtDateforApi(d: any) {
  return format(new Date(d), "yyyy-MM-dd");
};
export function escapeCSVValue(value: any) {
  if (typeof value === "string") {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
  return value ?? "";
};
export function latestShopDateTime() {
  const istNow = new Date(); // current system time
  const istMinus2Hours = subHours(istNow, 2);
  return formatInTimeZone(istMinus2Hours, 'Asia/Kolkata', "yyyy-MM-dd'T'HH:mm:ssXXX");

};