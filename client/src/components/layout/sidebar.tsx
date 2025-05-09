import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Cog,
  Home,
  PenSquare,
  Calendar,
  LineChart,
  Heart,
  Users,
  BookOpen,
  Lock,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  const routes = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/",
    },
    {
      icon: PenSquare,
      label: "New Entry",
      href: "/new-entry",
    },
    {
      icon: Calendar,
      label: "Calendar",
      href: "/calendar",
    },
    {
      icon: LineChart,
      label: "Mood Trends",
      href: "/mood-trends",
    },
    {
      icon: Heart,
      label: "Memories",
      href: "/memories",
    },
    {
      icon: Lock,
      label: "Personal Entries",
      href: "/personal-entries",
    },
    {
      icon: Users,
      label: "Public Entries",
      href: "/public-entries",
    },
  ];

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40 transition-all"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed md:sticky top-0 z-40 md:z-0 h-screen w-64 flex-col bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700 transition-all duration-300 ease-in-out",
          isOpen ? "left-0" : "-left-64 md:left-0"
        )}
      >
        {/* Logo & App Name */}
        <div className="px-6 py-8">
          <h1 className="text-2xl font-heading font-bold text-primary dark:text-primary-300 flex items-center">
            <BookOpen className="mr-2 h-6 w-6" />
            MemoSphere
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Your AI-Powered Journal
          </p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 mt-4">
          <div className="space-y-1">
            {routes.map((route) => (
              <Link key={route.href} href={route.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start px-4 py-6 h-auto text-sm rounded-lg font-medium",
                    location === route.href
                      ? "bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setIsOpen(false);
                    }
                  }}
                >
                  <route.icon className="h-5 w-5 mr-3" />
                  {route.label}
                </Button>
              </Link>
            ))}
          </div>
        </nav>

        {/* User Area */}
        <div className="px-4 py-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <Avatar>
              <AvatarFallback className="bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {user.username}
              </p>
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-xs text-neutral-500 dark:text-neutral-500 hover:text-primary-500 dark:hover:text-primary-400"
                onClick={() => logoutMutation.mutate()}
              >
                Sign out
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
              title="User settings"
            >
              <Cog className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
