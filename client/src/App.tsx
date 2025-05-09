import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { SearchProvider } from "@/context/search-context";
import { Footer } from "@/components/layout/footer";

// Pages
import DashboardPage from "@/pages/dashboard-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import NewEntryPage from "@/pages/new-entry-page";
import EntryDetailPage from "@/pages/entry-detail-page";
import CalendarPage from "@/pages/calendar-page";
import MoodTrendsPage from "@/pages/mood-trends-page";
import MemoriesPage from "@/pages/memories-page";
import PublicEntriesPage from "@/pages/public-entries-page";
import PersonalEntriesPage from "@/pages/personal-entries-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/new-entry" component={NewEntryPage} />
      <ProtectedRoute path="/entries/:id" component={EntryDetailPage} />
      <ProtectedRoute path="/calendar" component={CalendarPage} />
      <ProtectedRoute path="/mood-trends" component={MoodTrendsPage} />
      <ProtectedRoute path="/memories" component={MemoriesPage} />
      <ProtectedRoute path="/public-entries" component={PublicEntriesPage} />
      <ProtectedRoute
        path="/personal-entries"
        component={PersonalEntriesPage}
      />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <SearchProvider>
            <div className="flex flex-col min-h-screen">
              <div className="flex-1">
                <Router />
              </div>
              <Footer />
            </div>
            <Toaster />
          </SearchProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
