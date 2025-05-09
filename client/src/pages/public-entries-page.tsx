import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Globe, Filter, Loader2 } from "lucide-react";
import { EntryCard } from "@/components/journal/entry-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PublicEntriesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState("all");

  const { data: publicEntries, isLoading } = useQuery<any[]>({
    queryKey: ["/api/entries/public"],
  });

  const filteredEntries = publicEntries
    ? publicEntries
        .filter((entry: any) => {
          if (localSearch) {
            const query = localSearch.toLowerCase();
            return (
              entry.title.toLowerCase().includes(query) ||
              entry.content.toLowerCase().includes(query)
            );
          }
          return true;
        })
        .filter((entry: any) => {
          // Apply mood filter
          if (moodFilter && moodFilter !== "all") {
            return entry.mood === moodFilter;
          }
          return true;
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
              <h1 className="text-2xl font-heading font-bold text-neutral-800 dark:text-neutral-200">
                <Users className="inline-block mr-2 h-6 w-6 text-primary-400" />
                Public Journal Entries
              </h1>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400 dark:text-neutral-600" />
                  <Input
                    placeholder="Search entries..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex-shrink-0">
                  <Select value={moodFilter} onValueChange={setMoodFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Moods</SelectItem>
                      <SelectItem value="happy">Happy</SelectItem>
                      <SelectItem value="sad">Sad</SelectItem>
                      <SelectItem value="angry">Angry</SelectItem>
                      <SelectItem value="excited">Excited</SelectItem>
                      <SelectItem value="calm">Calm</SelectItem>
                      <SelectItem value="nervous">Nervous</SelectItem>
                      <SelectItem value="stressed">Stressed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Card className="mb-6">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="bg-primary-50 dark:bg-primary-900/30 p-3 rounded-full">
                    <Globe className="h-6 w-6 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-1">
                      Community Space
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                      Explore journal entries shared by the MemoSphere
                      community. Connect through shared experiences and
                      insights.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="hidden md:flex"
                    onClick={() => setMoodFilter("all")}
                  >
                    View All Entries
                  </Button>
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-10 text-center">
                <Globe className="h-12 w-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-700" />
                {localSearch || moodFilter !== "all" ? (
                  <>
                    <h3 className="text-lg font-medium mb-2">
                      No matching entries found
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                      Try adjusting your search or filters to see more entries.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setLocalSearch("");
                        setMoodFilter("all");
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium mb-2">
                      No public entries yet
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                      Be the first to share a journal entry with the community!
                    </p>
                    <Button>Create a Public Entry</Button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEntries.map((entry: any) => (
                  <EntryCard
                    key={entry.id}
                    id={entry.id}
                    title={entry.title}
                    content={entry.content}
                    createdAt={entry.createdAt}
                    mood={entry.mood}
                    isPublic={entry.isPublic}
                    imageUrl={entry.imageUrl}
                    user={entry.user}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
