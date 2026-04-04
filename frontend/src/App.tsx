import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import EcosystemDashboard from "./pages/EcosystemDashboard";
import StabilityAnalysis from "./pages/StabilityAnalysis";
import EarlyWarningPage from "./pages/EarlyWarningPage";
import CollapseRiskPage from "./pages/CollapseRiskPage";
import SimulationLab from "./pages/SimulationLab";
import DataExplorerPage from "./pages/DataExplorerPage";
import ExplainabilityPage from "./pages/ExplainabilityPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import { fetchAquatic } from "./api/api";
import { EcosystemProvider } from "@/hooks/useEcosystem";

const queryClient = new QueryClient();

const DashboardRoute = ({ children }: { children: React.ReactNode }) => (
  <DashboardLayout>{children}</DashboardLayout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <EcosystemProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/dashboard"
              element={
                <DashboardRoute>
                  <EcosystemDashboard />
                </DashboardRoute>
              }
            />
            <Route
              path="/stability"
              element={
                <DashboardRoute>
                  <StabilityAnalysis />
                </DashboardRoute>
              }
            />
            <Route
              path="/early-warning"
              element={
                <DashboardRoute>
                  <EarlyWarningPage />
                </DashboardRoute>
              }
            />
            <Route
              path="/collapse-risk"
              element={
                <DashboardRoute>
                  <CollapseRiskPage />
                </DashboardRoute>
              }
            />
            <Route
              path="/simulation"
              element={
                <DashboardRoute>
                  <SimulationLab />
                </DashboardRoute>
              }
            />
            <Route
              path="/data-explorer"
              element={
                <DashboardRoute>
                  <DataExplorerPage />
                </DashboardRoute>
              }
            />
            <Route
              path="/explainability"
              element={
                <DashboardRoute>
                  <ExplainabilityPage />
                </DashboardRoute>
              }
            />
            <Route
              path="/about"
              element={
                <DashboardRoute>
                  <AboutPage />
                </DashboardRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </EcosystemProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
