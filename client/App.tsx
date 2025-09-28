import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { HabitsProvider } from "./contexts/HabitsContext";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Habits from "./pages/Habits";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import PlaceholderPage from "./pages/PlaceholderPage";
import Profile from "./pages/Profile";
import NotificationsPage from "./pages/Notifications";
import Streak from "./pages/Streak";
import Achievements from "./pages/Achievements";
import Today from "./pages/Today";
import Week from "./pages/Week";
import Login from "./pages/Login";
import Register from "./pages/Register";

const queryClient = new QueryClient();

// Patch global fetch to include XSRF token header (double-submit cookie) and include credentials
(function patchFetch() {
  try {
    if (typeof window !== 'undefined' && !(window as any).__patched_fetch__) {
      const original = window.fetch.bind(window);
      function parseCookies(cookieHeader: string | undefined) {
        const obj: Record<string,string> = {};
        if (!cookieHeader) return obj;
        for (const pair of cookieHeader.split(';')) {
          const idx = pair.indexOf('=');
          if (idx < 0) continue;
          const key = pair.slice(0, idx).trim();
          const val = pair.slice(idx+1).trim();
          obj[key] = decodeURIComponent(val);
        }
        return obj;
      }
      window.fetch = (input: RequestInfo, init?: RequestInit) => {
        const method = (init && init.method) || (typeof input === 'string' ? 'GET' : (input as Request).method) || 'GET';
        const unsafe = ['POST','PUT','PATCH','DELETE'];
        const headers = new Headers(init && init.headers ? init.headers as HeadersInit : undefined);
        try {
          const cookies = parseCookies(document.cookie);
          const token = cookies['XSRF-TOKEN'];
          if (token && unsafe.includes(method.toUpperCase())) {
            headers.set('x-xsrf-token', token);
          }
        } catch (e) {}
        const newInit = { ...(init||{}), credentials: 'include', headers } as RequestInit;
        return original(input, newInit as any);
      };
      (window as any).__patched_fetch__ = true;
    }
  } catch (e) {
    // ignore
  }
})();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
      <HabitsProvider>
        <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/streak" element={<Streak />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/today" element={<Today />} />
          <Route path="/week" element={<Week />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
        </TooltipProvider>
      </HabitsProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
