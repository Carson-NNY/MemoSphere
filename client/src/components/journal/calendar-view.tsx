import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface CalendarViewProps {
  entries: any[];
  onSelectDate: (date: Date | undefined) => void;
}

export function CalendarView({ entries, onSelectDate }: CalendarViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Function to check if an entry was created on a specific date
  const hasEntryOnDate = (date: Date) => {
    if (!entries) return false;
    
    const dateString = format(date, "yyyy-MM-dd");
    return entries.some((entry) => {
      const entryDate = format(new Date(entry.createdAt), "yyyy-MM-dd");
      return entryDate === dateString;
    });
  };
  
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    onSelectDate(newDate);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-primary-400" />
          Journal Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateChange}
          className="rounded-md border"
          modifiers={{
            hasEntry: (date) => hasEntryOnDate(date),
          }}
          modifiersClassNames={{
            hasEntry: "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 font-bold",
          }}
        />
        
        <div className="mt-4 flex items-center justify-center text-sm">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 rounded-full bg-primary-100 dark:bg-primary-900/30 border border-primary-400 mr-1"></div>
            <span className="text-neutral-600 dark:text-neutral-400">Has entries</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 mr-1"></div>
            <span className="text-neutral-600 dark:text-neutral-400">No entries</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
