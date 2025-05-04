import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Heart, CalendarDays, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { OnThisDay } from "@/components/journal/on-this-day";
import { formatDate, getMoodIcon, getTextExcerpt } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function MemoriesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { data: entries, isLoading } = useQuery({
    queryKey: ["/api/entries"],
  });
  
  const { data: memories, isLoading: isLoadingMemories } = useQuery({
    queryKey: ["/api/memories/on-this-day"],
  });

  // Get entries from 1 month, 3 months, 6 months, and 1 year ago
  const getMemoriesByTimeframe = () => {
    if (!entries || entries.length === 0) return [];
    
    const now = new Date();
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const memories = [];
    
    // Check for entries from approximately 1 month ago
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const oneMonthRange = sortedEntries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      const diffDays = Math.abs((oneMonthAgo.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7; // Within a week of the target date
    })[0];
    
    if (oneMonthRange) {
      memories.push({
        ...oneMonthRange,
        timeframe: "1 month ago"
      });
    }
    
    // Check for entries from approximately 3 months ago
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    const threeMonthRange = sortedEntries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      const diffDays = Math.abs((threeMonthsAgo.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7; // Within a week of the target date
    })[0];
    
    if (threeMonthRange) {
      memories.push({
        ...threeMonthRange,
        timeframe: "3 months ago"
      });
    }
    
    // Check for entries from approximately 6 months ago
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    const sixMonthRange = sortedEntries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      const diffDays = Math.abs((sixMonthsAgo.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7; // Within a week of the target date
    })[0];
    
    if (sixMonthRange) {
      memories.push({
        ...sixMonthRange,
        timeframe: "6 months ago"
      });
    }
    
    return memories;
  };
  
  const timeframeMemories = getMemoriesByTimeframe();
  
  const hasOnThisDayMemories = memories && memories.length > 0;
  const hasOtherMemories = timeframeMemories.length > 0;
  
  if (isLoading || isLoadingMemories) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto bg-neutral-100 dark:bg-neutral-800 p-6">
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </main>
        </div>
      </div>
    );
  }

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
              <Heart className="inline-block mr-2 h-6 w-6 text-primary-400" />
              Your Memories
            </h1>
            
            {/* On This Day Section */}
            <section className="mb-8">
              {hasOnThisDayMemories ? (
                <OnThisDay />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Clock className="h-5 w-5 mr-2 text-primary-400" />
                      On This Day
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center py-8">
                    <div className="mb-4">
                      <CalendarDays className="h-16 w-16 mx-auto text-neutral-300 dark:text-neutral-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Memories Yet</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
                      You don't have any journal entries from previous years on this day. 
                      Keep journaling to build your collection of memories!
                    </p>
                    <Link href="/new-entry">
                      <Button>Create a New Memory</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </section>
            
            {/* Other Memories Section */}
            <section className="mb-8">
              <h2 className="text-xl font-heading font-semibold mb-6 text-neutral-800 dark:text-neutral-200">
                <i className="fas fa-clock-rotate-left mr-2 text-accent-400"></i>
                Looking Back
              </h2>
              
              {hasOtherMemories ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {timeframeMemories.map((memory, index) => {
                    const moodData = getMoodIcon(memory.mood);
                    
                    return (
                      <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                        {memory.imageUrl && (
                          <div className="h-40 bg-neutral-200 dark:bg-neutral-800">
                            <img src={memory.imageUrl} alt={memory.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <CardContent className={memory.imageUrl ? "p-5" : "p-5 pt-5"}>
                          <div className="flex justify-between items-center mb-2">
                            <Badge variant="outline" className="text-accent-500 bg-accent-50 dark:bg-accent-900/20 border-0">
                              {memory.timeframe}
                            </Badge>
                            {memory.mood && (
                              <Badge variant="outline" className={`${moodData.bgColor} ${moodData.darkBgColor} border-0`}>
                                <i className={`fas fa-${moodData.icon} mr-1 ${moodData.color}`}></i> {memory.mood}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium text-neutral-800 dark:text-neutral-200 mb-2">
                            {memory.title}
                          </h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                            {formatDate(memory.createdAt)}
                          </p>
                          <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-3">
                            {getTextExcerpt(memory.content, 120)}
                          </p>
                          <div className="mt-4">
                            <Link href={`/entries/${memory.id}`}>
                              <Button variant="link" className="p-0 h-auto text-primary-400 hover:text-primary-500">
                                Read Memory
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <div className="mb-4">
                      <Heart className="h-16 w-16 mx-auto text-neutral-300 dark:text-neutral-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Past Memories Yet</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
                      You don't have entries from 1, 3, or 6 months ago yet. 
                      Continue your journaling journey to create memories you can look back on!
                    </p>
                    <Link href="/calendar">
                      <Button variant="outline">
                        <CalendarDays className="h-4 w-4 mr-2" /> 
                        View Journal Calendar
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </section>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">
                  <i className="fas fa-lightbulb mr-2 text-yellow-500"></i>
                  Journal Prompts for New Memories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg">
                    <p className="font-medium mb-2">Reflect on Growth</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      How have you changed in the past year? What lessons have you learned that you're grateful for?
                    </p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg">
                    <p className="font-medium mb-2">Capture Happy Moments</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      What made you smile today? Write about a moment of joy, no matter how small it seemed.
                    </p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg">
                    <p className="font-medium mb-2">Record Achievements</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      What are you proud of accomplishing recently? Celebrate your wins, big and small.
                    </p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg">
                    <p className="font-medium mb-2">Capture Daily Life</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      What does your typical day look like right now? Future you might enjoy remembering these details.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
