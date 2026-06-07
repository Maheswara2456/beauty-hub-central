import * as React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { TopNav } from "@/components/top-nav";

import CitiesPage from "@/pages/cities";
import ParloursPage from "@/pages/parlours";
import ParlourDetailPage from "@/pages/parlour-detail";
import BookingPage from "@/pages/booking";
import BookingConfirmationPage from "@/pages/booking-confirmation";
import UserBookingsPage from "@/pages/user-bookings";
import OwnerEntryPage from "@/pages/owner";
import OwnerLoginPage from "@/pages/owner-login";
import OwnerDashboardPage from "@/pages/owner-dashboard";
import StaffProfilePage from "@/pages/staff-profile";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import FavoritesPage from "@/pages/favorites";
import AdminDashboardPage from "@/pages/admin-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CitiesPage} />
      <Route path="/cities/:cityId/parlours" component={ParloursPage} />
      <Route path="/parlours/:id" component={ParlourDetailPage} />

      <Route path="/book/parlour/:parlourId" component={BookingPage} />
      <Route path="/book/confirmation/:id" component={BookingConfirmationPage} />

      <Route path="/bookings" component={UserBookingsPage} />
      <Route path="/favorites" component={FavoritesPage} />

      <Route path="/owner" component={OwnerEntryPage} />
      <Route path="/owner/login" component={OwnerLoginPage} />
      <Route path="/owner/dashboard" component={OwnerDashboardPage} />

      <Route path="/staff/:id" component={StaffProfilePage} />

      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />

      <Route path="/admin" component={AdminDashboardPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  React.useEffect(() => {
    const saved = localStorage.getItem("beauty.theme");
    if (saved === "dark") document.documentElement.classList.add("dark");
    if (saved === "light") document.documentElement.classList.remove("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TopNav />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
