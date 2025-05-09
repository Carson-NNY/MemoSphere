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
import { Link, useLocation } from "wouter";
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
import { useSearch } from "@/context/search-context";

interface HeaderProps {
  onToggleSidebar: () => void;
  onNewEntry?: () => void;
}

export function Header({ onToggleSidebar, onNewEntry }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, logoutMutation } = useAuth();
  const { search, setSearch } = useSearch();
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const [localSearchValue, setLocalSearchValue] = useState(search);
  const [isSearching, setIsSearching] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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

  // Update local search value when global search changes
  useEffect(() => {
    setLocalSearchValue(search);
  }, [search]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearchValue);
      // Only navigate if we're actively searching
      if (localSearchValue && isSearching) {
        navigate("/personal-entries");
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, [localSearchValue, setSearch, navigate, isSearching]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchValue(e.target.value);
    setIsSearching(true);
  };

  // Reset searching state when navigating away
  useEffect(() => {
    if (location !== "/personal-entries") {
      setIsSearching(false);
    }
  }, [location]);

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

  // Show global search on Dashboard and Personal Entries pages
  const showGlobalSearch = location === "/" || location === "/personal-entries";

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
      {showGlobalSearch && (
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400 dark:text-neutral-600" />
          <Input
            type="text"
            value={localSearchValue}
            onChange={handleSearchChange}
            placeholder="Search all your entries..."
            className="w-full pl-10 pr-4 bg-neutral-100 dark:bg-neutral-800 border-transparent focus:border-primary-400 dark:focus:border-primary-400 text-neutral-700 dark:text-neutral-300 text-sm"
          />
        </div>
      )}

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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
          </Button>
        </div>

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
                  <AvatarFallback
                    className="text-white font-medium"
                    style={{ backgroundColor: getAvatarColor(user.username) }}
                  >
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
