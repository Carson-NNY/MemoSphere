import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

interface HeaderProps {
  onToggleSidebar: () => void;
  onNewEntry?: () => void;
}

export function Header({ onToggleSidebar, onNewEntry }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, logoutMutation } = useAuth();

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const [isDark, setIsDark] = useState(() => {
    // 1) if user has a saved preference, use that...
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") {
      return saved === "dark";
    }
    // 2) otherwise default to dark:
    return true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const handleLogout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  if (!user) return null;

  // Get initial letter for avatar fallback
  const getInitials = () => {
    if (user.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    } else if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return "U";
  };

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
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 relative"
          aria-label="Notifications"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-secondary-400 text-white rounded-full p-0 text-xs">
              0
            </Badge>
          </motion.div>
        </Button>

        {/* New Entry Button */}
        {onNewEntry ? (
          <Button
            size="sm"
            className="bg-primary-600 hover:bg-primary-700 text-black dark:text-white rounded-lg shadow-sm"
            onClick={onNewEntry}
          >
            <Plus className="h-4 w-4 mr-1" /> New Entry
          </Button>
        ) : (
          <Link href="/new-entry">
            <Button
              size="sm"
              className="bg-primary-600 hover:bg-primary-700 text-black dark:text-white rounded-lg shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1" /> New Entry
            </Button>
          </Link>
        )}

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center"
              >
                <Avatar className="h-9 w-9 border-2 border-primary-200">
                  <AvatarImage
                    src={user.photoURL || undefined}
                    alt={user.displayName || user.username}
                  />
                  <AvatarFallback className="bg-primary-100 text-primary-700 font-medium">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.displayName || user.username}
                </p>
                {user.email && (
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-500 focus:text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
