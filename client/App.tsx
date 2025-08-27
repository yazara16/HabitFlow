import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import PlaceholderPage from "./pages/PlaceholderPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/habits"
            element={
              <PlaceholderPage
                title="Gestión de Hábitos"
                description="Aquí podrás crear, editar y organizar todos tus hábitos por categorías."
              />
            }
          />
          <Route
            path="/calendar"
            element={
              <PlaceholderPage
                title="Calendario Interactivo"
                description="Planifica y visualiza tus hábitos en un calendario con funcionalidad drag & drop."
              />
            }
          />
          <Route
            path="/settings"
            element={
              <PlaceholderPage
                title="Configuración"
                description="Personaliza tu experiencia, notificaciones y preferencias de la aplicación."
              />
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
