import { useQuery } from "@tanstack/react-query";
import { formatDate, getMoodIcon } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, Clock } from "lucide-react";
import { Link } from "wouter";

export function OnThisDay() {
  const { data: memories, isLoading } = useQuery({
    queryKey: ["/api/memories/on-this-day"],
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }
  
  if (!memories || memories.length === 0) {
    return (
      <div className="rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <div className="p-8">
          <h2 className="text-2xl font-heading font-bold mb-2 flex items-center">
            <Clock className="mr-2 h-6 w-6 text-primary-400" /> 
            On This Day
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            You don't have any memories from previous years on this day.
            Keep journaling to build up your memories!
          </p>
        </div>
      </div>
    );
  }
  
  // Get the first memory
  const memory = memories[0];
  const moodData = getMoodIcon(memory.mood);
  
  return (
    <div className="rounded-xl overflow-hidden bg-gradient-to-r from-primary-400 to-accent-400 shadow-lg">
      <div className="p-8 text-white">
        <h2 className="text-2xl font-heading font-bold mb-2 flex items-center">
          <Clock className="mr-2 h-6 w-6" /> 
          On This Day
        </h2>
        
        <p className="text-white/90 mb-6">
          {memory.memorySummary || `${memory.yearDifference} year${memory.yearDifference > 1 ? 's' : ''} ago, you wrote about ${memory.title}`}
        </p>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/20">
          <div className="flex items-start">
            <i className="fas fa-quote-left text-4xl text-white/30 mr-4 mt-1"></i>
            <div>
              <p className="italic text-white/90 accent-font leading-relaxed">
                {memory.content.length > 200 
                  ? `${memory.content.substring(0, 200)}...` 
                  : memory.content}
              </p>
              <div className="flex items-center mt-4">
                <span className="text-xs text-white/80">{formatDate(memory.createdAt)}</span>
                {memory.mood && (
                  <>
                    <span className="mx-3 text-white/40">•</span>
                    <span className="text-xs flex items-center text-white/80">
                      <i className={`fas fa-${moodData.icon} text-yellow-300 mr-1`}></i> {memory.mood}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <Link href={`/entries/${memory.id}`}>
          <Button 
            className="mt-4 bg-white/20 hover:bg-white/30 text-white"
            variant="outline"
          >
            Read Full Entry
          </Button>
        </Link>
      </div>
    </div>
  );
}
