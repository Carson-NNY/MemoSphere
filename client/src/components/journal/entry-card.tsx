import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, getTextExcerpt, getMoodIcon } from "@/lib/utils";
import { EllipsisVertical, Globe, Lock, Star } from "lucide-react";

interface EntryCardProps {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  mood?: string;
  isPublic: boolean;
  imageUrl?: string | null;
}

export function EntryCard({
  id,
  title,
  content,
  createdAt,
  mood,
  isPublic,
  imageUrl
}: EntryCardProps) {
  const moodData = getMoodIcon(mood);
  
  return (
    <Card className="overflow-hidden entry-card transition-all">
      {imageUrl && (
        <div className="h-32 bg-neutral-200 dark:bg-neutral-800 relative">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          {mood && (
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className={`${moodData.bgColor} ${moodData.darkBgColor} border-0`}>
                <i className={`fas fa-${moodData.icon} mr-1 ${moodData.color}`}></i> {mood}
              </Badge>
            </div>
          )}
        </div>
      )}
      <CardContent className={imageUrl ? "p-5" : "p-5 pt-5"}>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {formatDate(createdAt)}
          </span>
          <div className="flex space-x-1 text-neutral-400 dark:text-neutral-500">
            <Button variant="ghost" size="icon" className="h-6 w-6 p-1 hover:text-primary-400">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 p-1 hover:text-primary-400">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <h3 className="font-medium text-neutral-800 dark:text-neutral-200 mb-2">{title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
          {getTextExcerpt(content, 150)}
        </p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-neutral-500 dark:text-neutral-500 flex items-center">
            {isPublic ? (
              <>
                <Globe className="h-3 w-3 mr-1" /> Public
              </>
            ) : (
              <>
                <Lock className="h-3 w-3 mr-1" /> Private
              </>
            )}
          </span>
          <Link href={`/entries/${id}`}>
            <Button 
              variant="link" 
              className="text-sm text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium p-0"
            >
              Read More
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
