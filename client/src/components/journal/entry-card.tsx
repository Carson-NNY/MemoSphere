import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, getTextExcerpt, getMoodIcon } from "@/lib/utils";
import { EllipsisVertical, Globe, Lock, Star, Users } from "lucide-react";

interface EntryCardProps {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  mood?: string;
  isPublic: boolean;
  imageUrl?: string | null;
  user?: {
    username: string;
  };
}

export function EntryCard({
  id,
  title,
  content,
  createdAt,
  mood,
  isPublic,
  imageUrl,
  user,
}: EntryCardProps) {
  const moodData = getMoodIcon(mood);

  // Generate a consistent color based on username
  const getAvatarColor = (username: string) => {
    const colors = [
      "#FF6B6B", // Coral Red
      "#4ECDC4", // Turquoise
      "#45B7D1", // Sky Blue
      "#96CEB4", // Sage Green
      "#FFEEAD", // Cream Yellow
      "#D4A5A5", // Dusty Rose
      "#9B59B6", // Purple
      "#3498DB", // Blue
      "#E67E22", // Orange
      "#2ECC71", // Green
    ];
    const index = username
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <Card className="overflow-hidden entry-card transition-all">
      {imageUrl && (
        <div className="h-32 bg-neutral-200 dark:bg-neutral-800 relative">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          {mood && (
            <div className="absolute top-3 right-3">
              <Badge
                variant="outline"
                className={`${moodData.bgColor} ${moodData.darkBgColor} border-0`}
              >
                <i
                  className={`fas fa-${moodData.icon} mr-1 ${moodData.color}`}
                ></i>{" "}
                {mood}
              </Badge>
            </div>
          )}
        </div>
      )}
      <CardContent className={imageUrl ? "p-5" : "p-5 pt-5"}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            {user && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                style={{ backgroundColor: getAvatarColor(user.username) }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              {user && (
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {user.username}
                </span>
              )}
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {formatDate(createdAt)}
              </span>
            </div>
          </div>
          <div className="flex space-x-1 text-neutral-400 dark:text-neutral-500">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-1 hover:text-primary-400"
            >
              <Star className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-1 hover:text-primary-400"
            >
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <h3 className="font-medium text-neutral-800 dark:text-neutral-200 mb-2">
          {title}
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
          {getTextExcerpt(content, 150)}
        </p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-neutral-500 dark:text-neutral-500 flex items-center">
            {isPublic ? (
              <>
                <Users className="h-3 w-3 mr-1 text-primary-400" /> Public
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
