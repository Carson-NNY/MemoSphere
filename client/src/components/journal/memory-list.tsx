import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Clock, CalendarDays } from "lucide-react";
import { formatDate, getMoodIcon, getTextExcerpt } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MemoryListProps {
  memories: any[];
  title?: string;
  emptyMessage?: string;
}

export function MemoryList({ 
  memories, 
  title = "Your Memories", 
  emptyMessage = "No memories found for this timeframe."
}: MemoryListProps) {
  if (!memories || memories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Clock className="h-5 w-5 mr-2 text-primary-400" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="mb-4">
            <CalendarDays className="h-16 w-16 mx-auto text-neutral-300 dark:text-neutral-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Memories Found</h3>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
            {emptyMessage}
          </p>
          <Link href="/new-entry">
            <Button>Create a New Memory</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {memories.map((memory, index) => {
        const moodData = getMoodIcon(memory.mood);
        
        return (
          <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{memory.title}</CardTitle>
                {memory.timeframe && (
                  <Badge variant="outline" className="text-accent-500 bg-accent-50 dark:bg-accent-900/20 border-0">
                    {memory.timeframe}
                  </Badge>
                )}
              </div>
              <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                <span>{formatDate(memory.createdAt)}</span>
                {memory.mood && (
                  <Badge variant="outline" className={`ml-2 ${moodData.bgColor} ${moodData.darkBgColor} border-0`}>
                    <i className={`fas fa-${moodData.icon} mr-1 ${moodData.color}`}></i> {memory.mood}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {memory.imageUrl && (
                <div className="mb-4 rounded-md overflow-hidden">
                  <img src={memory.imageUrl} alt={memory.title} className="w-full h-48 object-cover" />
                </div>
              )}
              
              <div className="mb-4">
                {memory.memorySummary ? (
                  <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-md text-neutral-700 dark:text-neutral-300 italic mb-4">
                    <i className="fas fa-quote-left text-2xl text-primary-300 dark:text-primary-700 mr-2"></i>
                    {memory.memorySummary}
                  </div>
                ) : (
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {getTextExcerpt(memory.content, 200)}
                  </p>
                )}
              </div>
              
              <div className="flex justify-end">
                <Link href={`/entries/${memory.id}`}>
                  <Button variant="outline" size="sm">
                    Read Full Memory
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
