import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { EntryCard } from "@/components/journal/entry-card";
import { format } from "date-fns";

export default function CalendarPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { data: entries, isLoading } = useQuery({
    queryKey: ["/api/entries"],
  });

  // Function to check if an entry was created on a specific date
  const hasEntryOnDate = (date: Date) => {
    if (!entries) return false;
    
    const dateString = format(date, "yyyy-MM-dd");
    return entries.some((entry: any) => {
      const entryDate = format(new Date(entry.createdAt), "yyyy-MM-dd");
      return entryDate === dateString;
    });
  };

  // Filter entries for the selected date
  const entriesForSelectedDate = selectedDate && entries
    ? entries.filter((entry: any) => {
        const entryDate = format(new Date(entry.createdAt), "yyyy-MM-dd");
        const selectedDateString = format(selectedDate, "yyyy-MM-dd");
        return entryDate === selectedDateString;
      })
    : [];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-neutral-100 dark:bg-neutral-800 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-heading font-bold mb-6 text-neutral-800 dark:text-neutral-200">
              <CalendarIcon className="inline-block mr-2 h-6 w-6 text-primary-400" />
              Journal Calendar
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Calendar Component */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    Select a Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{
                      hasEntry: (date) => hasEntryOnDate(date),
                    }}
                    modifiersClassNames={{
                      hasEntry: "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 font-bold",
                    }}
                  />
                </CardContent>
              </Card>
              
              {/* Entries for Selected Date */}
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">
                      {selectedDate ? (
                        <>Entries for {format(selectedDate, "MMMM d, yyyy")}</>
                      ) : (
                        <>Select a date to view entries</>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : entriesForSelectedDate.length === 0 ? (
                      <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                        {selectedDate ? (
                          <>
                            <p className="mb-2">No entries for this date.</p>
                            <p>Would you like to create a new entry?</p>
                          </>
                        ) : (
                          <p>Please select a date from the calendar.</p>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {entriesForSelectedDate.map((entry: any) => (
                          <EntryCard 
                            key={entry.id}
                            id={entry.id}
                            title={entry.title}
                            content={entry.content}
                            createdAt={entry.createdAt}
                            mood={entry.mood}
                            isPublic={entry.isPublic}
                            imageUrl={entry.imageUrl}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
