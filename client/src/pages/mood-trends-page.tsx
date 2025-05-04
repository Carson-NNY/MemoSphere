import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoodChart } from "@/components/journal/mood-chart";
import { BarChart, LineChart } from "lucide-react";

export default function MoodTrendsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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
              <LineChart className="inline-block mr-2 h-6 w-6 text-primary-400" />
              Mood Trends
            </h1>
            
            <Tabs defaultValue="overview" className="mb-8">
              <TabsList className="mb-6">
                <TabsTrigger value="overview" className="px-6">
                  <BarChart className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="detailed" className="px-6">
                  <LineChart className="h-4 w-4 mr-2" />
                  Detailed Analysis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <MoodChart />
              </TabsContent>
              
              <TabsContent value="detailed">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Mood by Time of Day
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-72 flex items-center justify-center">
                      <div className="text-center text-neutral-500 dark:text-neutral-400">
                        <i className="fas fa-chart-line text-6xl mb-4 text-neutral-300 dark:text-neutral-700"></i>
                        <p>Time-based mood analysis will be available when you have more entries.</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Mood by Day of Week
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-72 flex items-center justify-center">
                      <div className="text-center text-neutral-500 dark:text-neutral-400">
                        <i className="fas fa-chart-bar text-6xl mb-4 text-neutral-300 dark:text-neutral-700"></i>
                        <p>Weekly mood patterns will be available when you have more entries.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Mood Correlations with Journal Topics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-80 flex items-center justify-center">
                    <div className="text-center text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
                      <i className="fas fa-brain text-6xl mb-4 text-neutral-300 dark:text-neutral-700"></i>
                      <p className="mb-2">AI analysis of your mood correlations with journal topics will be available once you have more entries.</p>
                      <p>Continue journaling to unlock deeper insights into your emotional patterns.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Understanding Your Mood Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  Tracking your moods over time can help you identify patterns and triggers that affect your emotional wellbeing. 
                  Here are some ways to make the most of your mood data:
                </p>
                <ul>
                  <li>Look for connections between activities and mood changes</li>
                  <li>Notice if certain days of the week tend to bring specific emotions</li>
                  <li>Reflect on how your mood fluctuates throughout the month</li>
                  <li>Use these insights to plan activities that boost your positive emotions</li>
                </ul>
                <p>
                  The more consistently you journal and record your moods, the more accurate and helpful these visualizations will become.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
