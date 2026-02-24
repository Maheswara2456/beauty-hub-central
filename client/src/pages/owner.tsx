import * as React from "react";
import { getOwnerSession } from "@/hooks/use-owner";
import OwnerLoginPage from "@/pages/owner-login";
import OwnerDashboardPage from "@/pages/owner-dashboard";

export default function OwnerEntryPage() {
  const session = getOwnerSession();
  if (session) return <OwnerDashboardPage />;
  return <OwnerLoginPage />;
}
