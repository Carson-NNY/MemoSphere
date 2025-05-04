import { useCallback } from "react";
import { Bell, Menu, Moon, Plus, Search, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface HeaderProps {
  onToggleSidebar: () => void;
  onNewEntry?: () => void;
}

export function Header({ onToggleSidebar, onNewEntry }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  
  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);
  
  if (!user) return null;
  
  return (
    <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 py-4 px-6 flex items-center sticky top-0 z-10">
      {/* Mobile Menu Button */}
      <Button 
        variant="ghost" 
        size="icon"
        className="md:hidden text-neutral-600 dark:text-neutral-400 hover:text-primary-400 mr-4"
        onClick={onToggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400 dark:text-neutral-600" />
        <Input 
          type="text" 
          placeholder="Search your journal entries..." 
          className="w-full pl-10 pr-4 bg-neutral-100 dark:bg-neutral-800 border-transparent focus:border-primary-400 dark:focus:border-primary-400 text-neutral-700 dark:text-neutral-300 text-sm"
        />
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center ml-auto space-x-4">
        {/* Dark Mode Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400" 
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 relative" 
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-secondary-400 text-white rounded-full p-0 text-xs">
            2
          </Badge>
        </Button>
        
        {/* New Entry Button */}
        {onNewEntry ? (
          <Button 
            size="sm"
            className="bg-primary-400 hover:bg-primary-500 text-white rounded-lg shadow-sm" 
            onClick={onNewEntry}
          >
            <Plus className="h-4 w-4 mr-1" /> New Entry
          </Button>
        ) : (
          <Link href="/new-entry">
            <Button 
              size="sm"
              className="bg-primary-400 hover:bg-primary-500 text-white rounded-lg shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1" /> New Entry
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
