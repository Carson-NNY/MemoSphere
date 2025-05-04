import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, BarChart, Bar
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO, differenceInCalendarDays, startOfMonth, endOfMonth } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart as LineChartIcon, BarChart as BarChartIcon, Calendar } from "lucide-react";

const moodValues: Record<string, number> = {
  "angry": 1,
  "sad": 2,
  "stressed": 3,
  "nervous": 4,
  "neutral": 5,
  "calm": 6,
  "happy": 7,
  "excited": 8,
};

const moodColors: Record<string, string> = {
  "angry": "#ef4444", // red-500
  "sad": "#8b5cf6", // purple-500
  "stressed": "#f97316", // orange-500
  "nervous": "#3b82f6", // blue-500
  "neutral": "#6b7280", // gray-500
  "calm": "#0ea5e9", // sky-500
  "happy": "#eab308", // yellow-500
  "excited": "#22c55e", // green-500
};

interface MoodTrendsChartProps {
  entries: any[];
}

export function MoodTrendsChart({ entries }: MoodTrendsChartProps) {
  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [dayOfWeekData, setDayOfWeekData] = useState<any[]>([]);
  
  useEffect(() => {
    if (entries?.length) {
      // Process entries for line chart data
      const entriesWithMood = entries.filter((entry) => entry.mood);
      
      const chartData = entriesWithMood.map((entry) => {
        const date = parseISO(entry.createdAt);
        return {
          date: format(date, "yyyy-MM-dd"),
          formattedDate: format(date, "MMM d"),
          mood: moodValues[entry.mood] || 5, // Default to neutral
          actualMood: entry.mood,
        };
      });
      
      // Sort by date
      chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setLineChartData(chartData);
      
      // Process monthly data
      const monthCounts: Record<string, Record<string, number>> = {};
      
      entriesWithMood.forEach((entry) => {
        const date = parseISO(entry.createdAt);
        const monthYear = format(date, "yyyy-MM");
        const mood = entry.mood;
        
        if (!monthCounts[monthYear]) {
          monthCounts[monthYear] = {};
        }
        
        monthCounts[monthYear][mood] = (monthCounts[monthYear][mood] || 0) + 1;
      });
      
      const processedMonthlyData = Object.entries(monthCounts).map(([monthYear, moods]) => {
        const date = parseISO(`${monthYear}-01`);
        
        return {
          month: format(date, "MMM yyyy"),
          ...Object.fromEntries(
            Object.entries(moods).map(([mood, count]) => [mood, count])
          ),
        };
      });
      
      processedMonthlyData.sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
      
      setMonthlyData(processedMonthlyData);
      
      // Process day of week data
      const dayOfWeekCounts: Record<number, Record<string, number>> = {
        0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}
      };
      
      entriesWithMood.forEach((entry) => {
        const date = parseISO(entry.createdAt);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        const mood = entry.mood;
        
        dayOfWeekCounts[dayOfWeek][mood] = (dayOfWeekCounts[dayOfWeek][mood] || 0) + 1;
      });
      
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      
      const processedDayOfWeekData = Object.entries(dayOfWeekCounts).map(([dayNum, moods]) => {
        const dayIndex = parseInt(dayNum);
        
        return {
          day: daysOfWeek[dayIndex],
          dayShort: daysOfWeek[dayIndex].substring(0, 3),
          ...Object.fromEntries(
            Object.entries(moods).map(([mood, count]) => [mood, count])
          ),
        };
      });
      
      setDayOfWeekData(processedDayOfWeekData);
    }
  }, [entries]);
  
  if (!entries || entries.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-10">
          <p className="text-neutral-500 dark:text-neutral-400">
            No entries available yet. Start journaling to track your moods!
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Tabs defaultValue="line" className="space-y-6">
      <TabsList>
        <TabsTrigger value="line">
          <LineChartIcon className="h-4 w-4 mr-2" />
          Mood Timeline
        </TabsTrigger>
        <TabsTrigger value="monthly">
          <BarChartIcon className="h-4 w-4 mr-2" />
          Monthly View
        </TabsTrigger>
        <TabsTrigger value="weekly">
          <Calendar className="h-4 w-4 mr-2" />
          Day of Week
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="line">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mood Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={lineChartData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[1, 8]} 
                    ticks={[1, 2, 3, 4, 5, 6, 7, 8]} 
                    tickFormatter={(value) => {
                      const labels: Record<number, string> = {
                        1: "Angry",
                        2: "Sad",
                        3: "Stressed",
                        4: "Nervous",
                        5: "Neutral",
                        6: "Calm",
                        7: "Happy",
                        8: "Excited"
                      };
                      return labels[value] || "";
                    }}
                    tick={{ fontSize: 12 }}
                    width={70}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={(value, name, props) => {
                      const dataPoint = props.payload;
                      return dataPoint?.actualMood || "Unknown";
                    }}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="monthly">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Mood Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    label={{ value: 'Entry Count', angle: -90, position: 'insideLeft', dy: 50 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Legend />
                  {Object.keys(moodValues).map((mood) => (
                    <Bar 
                      key={mood}
                      dataKey={mood} 
                      stackId="a"
                      fill={moodColors[mood]} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="weekly">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mood by Day of Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dayOfWeekData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="dayShort"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    label={{ value: 'Entry Count', angle: -90, position: 'insideLeft', dy: 50 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Legend />
                  {Object.keys(moodValues).map((mood) => (
                    <Bar 
                      key={mood}
                      dataKey={mood} 
                      stackId="a"
                      fill={moodColors[mood]} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
