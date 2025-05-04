import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { OnThisDay } from "@/components/journal/on-this-day";
import { MoodChart } from "@/components/journal/mood-chart";
import { AIInsights } from "@/components/journal/ai-insights";
import { EntryCard } from "@/components/journal/entry-card";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { data: entries, isLoading } = useQuery({
    queryKey: ["/api/entries"],
  });
  
  // Recent entries (most recent first)
  const recentEntries = entries ? [...entries].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }).slice(0, 3) : [];
  
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
            {/* "On This Day" Section */}
            <section className="mb-8">
              <OnThisDay />
            </section>
            
            {/* Mood Summary */}
            <section className="mb-8">
              <MoodChart />
            </section>
            
            {/* Recent Entries */}
            <section className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-heading font-semibold text-neutral-800 dark:text-neutral-200">
                  <i className="fas fa-book mr-2 text-primary-400"></i> 
                  Recent Entries
                </h2>
                <Link href="/calendar">
                  <a className="text-sm text-primary-400 hover:text-primary-500 dark:text-primary-300 dark:hover:text-primary-200 font-medium">
                    View All <i className="fas fa-arrow-right ml-1"></i>
                  </a>
                </Link>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : recentEntries.length === 0 ? (
                <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-10 text-center">
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    You haven't created any journal entries yet.
                  </p>
                  <Link href="/new-entry">
                    <a className="inline-flex items-center justify-center px-4 py-2 bg-primary-400 hover:bg-primary-500 text-white rounded-lg font-medium text-sm shadow-sm transition-colors duration-150">
                      <i className="fas fa-plus mr-2"></i> Create Your First Entry
                    </a>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentEntries.map((entry) => (
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
            </section>
            
            {/* AI Insights */}
            <section className="mb-8">
              <AIInsights />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
