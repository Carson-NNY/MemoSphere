import { useQuery } from "@tanstack/react-query";
import { Brain, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AIInsights() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["/api/insights/monthly"],
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!insights) {
    return (
      <div className="text-center py-6">
        <p className="text-neutral-500 dark:text-neutral-400">
          Unable to generate insights at this time.
        </p>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-heading font-semibold flex items-center">
          <i className="fas fa-lightbulb mr-2 text-accent-400"></i>
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start">
          <div className="w-12 h-12 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center text-accent-500 mr-4 flex-shrink-0">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-medium text-neutral-800 dark:text-neutral-200 mb-2">
              Monthly Reflection
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              {insights.monthlyReflection || "No monthly reflection available."}
              {insights.entryCount && (
                <span className="block mt-2 text-sm">
                  Based on {insights.entryCount} entries from the past month.
                </span>
              )}
            </p>
            
            {insights.suggestions && insights.suggestions.length > 0 && (
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-2">
                  Suggested Focus Areas
                </h4>
                <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {insights.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
