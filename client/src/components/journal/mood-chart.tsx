import { useEffect, useState } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { format, parseISO, subDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

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

interface MoodDataPoint {
  date: string;
  formattedDate: string;
  mood: number;
  actualMood: string;
}

interface MoodDistribution {
  mood: string;
  count: number;
  percentage: number;
}

export function MoodChart() {
  const [moodData, setMoodData] = useState<MoodDataPoint[]>([]);
  const [moodDistribution, setMoodDistribution] = useState<MoodDistribution[]>([]);
  
  const { data: entries, isLoading } = useQuery({
    queryKey: ["/api/entries"],
  });
  
  useEffect(() => {
    if (entries?.length) {
      // Process entries for chart data
      const entriesWithMood = entries.filter((entry: any) => entry.mood);
      
      const chartData = entriesWithMood.map((entry: any) => {
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
      
      setMoodData(chartData);
      
      // Calculate mood distribution
      const moodCounts: Record<string, number> = {};
      entriesWithMood.forEach((entry: any) => {
        const mood = entry.mood || "neutral";
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      });
      
      const totalEntries = entriesWithMood.length;
      const distribution = Object.entries(moodCounts).map(([mood, count]) => ({
        mood,
        count,
        percentage: Math.round((count / totalEntries) * 100),
      }));
      
      // Sort by count descending
      distribution.sort((a, b) => b.count - a.count);
      
      setMoodDistribution(distribution);
    }
  }, [entries]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }
  
  if (!moodData.length) {
    return (
      <div className="text-center py-10">
        <p className="text-neutral-500 dark:text-neutral-400">
          No mood data available yet. Start journaling to track your moods!
        </p>
      </div>
    );
  }
  
  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "happy": return "text-yellow-500";
      case "sad": return "text-purple-500";
      case "angry": return "text-red-500";
      case "excited": return "text-green-500";
      case "calm": return "text-blue-500";
      case "nervous": return "text-blue-500";
      case "stressed": return "text-orange-500";
      default: return "text-gray-500";
    }
  };
  
  const getMoodBg = (mood: string) => {
    switch (mood) {
      case "happy": return "bg-yellow-100 dark:bg-yellow-900/30";
      case "sad": return "bg-purple-100 dark:bg-purple-900/30";
      case "angry": return "bg-red-100 dark:bg-red-900/30";
      case "excited": return "bg-green-100 dark:bg-green-900/30";
      case "calm": return "bg-blue-100 dark:bg-blue-900/30";
      case "nervous": return "bg-blue-100 dark:bg-blue-900/30";
      case "stressed": return "bg-orange-100 dark:bg-orange-900/30";
      default: return "bg-gray-100 dark:bg-gray-800";
    }
  };
  
  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "happy": return "fa-face-smile";
      case "sad": return "fa-face-sad-tear";
      case "angry": return "fa-face-angry";
      case "excited": return "fa-face-laugh-beam";
      case "calm": return "fa-face-meh";
      case "nervous": return "fa-face-meh";
      case "stressed": return "fa-face-grimace";
      default: return "fa-face-meh-blank";
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="text-xl font-heading font-semibold">
            <i className="fas fa-chart-simple mr-2 text-primary-400"></i> 
            Your Mood Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={moodData}
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
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-heading font-semibold">
            <i className="fas fa-face-smile mr-2 text-secondary-400"></i> 
            This Month's Moods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {moodDistribution.map((item) => (
              <div key={item.mood} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full ${getMoodBg(item.mood)} flex items-center justify-center ${getMoodColor(item.mood)}`}>
                    <i className={`fas ${getMoodIcon(item.mood)}`}></i>
                  </div>
                  <span className="ml-3 text-neutral-700 dark:text-neutral-300 capitalize">
                    {item.mood}
                  </span>
                </div>
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
