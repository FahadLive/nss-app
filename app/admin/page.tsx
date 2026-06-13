import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TopAppBar from "@/components/TopAppBar";
import BottomNavBar from "@/components/BottomNavBar";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["execom", "admin"].includes(profile.role)) {
    redirect("/");
  }

  const { count: totalVolunteers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("approval_status", "approved");

  const { count: liveEvents } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { data: pendingProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, department, year, created_at")
    .eq("approval_status", "pending")
    .order("created_at", { ascending: true });

  const { data: allEvents } = await supabase
    .from("events")
    .select("*, registrations:registrations(count)")
    .order("event_date", { ascending: false });

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0 pt-16">
      <TopAppBar title="Admin Panel" isAdmin />
      <main className="max-w-7xl mx-auto px-container-margin py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant card-shadow flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider font-bold">
                Total Impact Hours
              </p>
              <h2 className="text-4xl font-bold text-primary">12,480</h2>
              <div className="flex items-center mt-2 text-green-600 gap-1 text-xs font-bold">
                <span className="material-symbols-outlined text-sm">
                  trending_up
                </span>
                <span>+12% this month</span>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <span className="material-symbols-outlined text-[120px]">
                volunteer_activism
              </span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant card-shadow">
            <p className="text-xs font-bold text-on-surface-variant mb-1 uppercase">
              Active Volunteers
            </p>
            <h2 className="text-3xl font-bold text-secondary">
              {totalVolunteers ?? 0}
            </h2>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-4">
              <div
                className="bg-secondary h-1.5 rounded-full"
                style={{
                  width: `${Math.min(((totalVolunteers ?? 0) / 500) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant card-shadow">
            <p className="text-xs font-bold text-on-surface-variant mb-1 uppercase">
              Live Events
            </p>
            <h2 className="text-3xl font-bold text-primary">
              {liveEvents ?? 0}
            </h2>
            <div className="flex items-center mt-4 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-sm mr-1">
                event
              </span>
              Managing all active listings
            </div>
          </div>
        </div>

        <AdminClient
          pendingProfiles={pendingProfiles ?? []}
          allEvents={allEvents ?? []}
        />
      </main>
      <BottomNavBar activeTab="admin" />
    </div>
  );
}
