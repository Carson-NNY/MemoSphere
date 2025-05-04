import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "MMMM d, yyyy");
  } catch (error) {
    return "";
  }
}

export function formatTimeAgo(date: Date | string): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return "";
  }
}

export function getMoodIcon(mood: string | undefined): {
  icon: string;
  color: string;
  bgColor: string;
  darkBgColor: string;
} {
  switch (mood?.toLowerCase()) {
    case "happy":
      return {
        icon: "face-smile",
        color: "text-yellow-500",
        bgColor: "bg-yellow-100",
        darkBgColor: "dark:bg-yellow-900/30"
      };
    case "sad":
      return {
        icon: "face-sad-tear",
        color: "text-purple-500",
        bgColor: "bg-purple-100",
        darkBgColor: "dark:bg-purple-900/30"
      };
    case "angry":
      return {
        icon: "face-angry",
        color: "text-red-500",
        bgColor: "bg-red-100",
        darkBgColor: "dark:bg-red-900/30"
      };
    case "excited":
      return {
        icon: "face-laugh-beam",
        color: "text-green-500",
        bgColor: "bg-green-100",
        darkBgColor: "dark:bg-green-900/30"
      };
    case "nervous":
      return {
        icon: "face-meh",
        color: "text-blue-500",
        bgColor: "bg-blue-100",
        darkBgColor: "dark:bg-blue-900/30"
      };
    case "calm":
      return {
        icon: "face-meh",
        color: "text-blue-500",
        bgColor: "bg-blue-100",
        darkBgColor: "dark:bg-blue-900/30"
      };
    case "stressed":
      return {
        icon: "face-grimace",
        color: "text-orange-500",
        bgColor: "bg-orange-100",
        darkBgColor: "dark:bg-orange-900/30"
      };
    default:
      return {
        icon: "face-meh-blank",
        color: "text-gray-500",
        bgColor: "bg-gray-100",
        darkBgColor: "dark:bg-gray-800"
      };
  }
}

export function getTextExcerpt(text: string, maxLength: number = 150): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  
  const excerpt = text.substring(0, maxLength);
  return excerpt + "...";
}

// Local storage helper for anonymous journaling
export function getAnonymousEntries() {
  const entriesString = localStorage.getItem("anonymousEntries");
  if (!entriesString) return [];
  try {
    return JSON.parse(entriesString);
  } catch (error) {
    return [];
  }
}

export function saveAnonymousEntry(entry: any) {
  const entries = getAnonymousEntries();
  const newEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
  
  localStorage.setItem("anonymousEntries", JSON.stringify([newEntry, ...entries]));
  return newEntry;
}

export function removeAnonymousEntry(id: string) {
  const entries = getAnonymousEntries();
  const filteredEntries = entries.filter((entry: any) => entry.id !== id);
  localStorage.setItem("anonymousEntries", JSON.stringify(filteredEntries));
}
