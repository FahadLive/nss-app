import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TopAppBar from "@/components/TopAppBar";
import BottomNavBar from "@/components/BottomNavBar";
import EventCard from "@/components/EventCard";

export default async function HomePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("department")
    .eq("id", user.id)
    .single();

  if (!profile?.department) {
    redirect("/setup-profile");
  }

  const { data: activeEvents } = await supabase
    .from("events")
    .select("*, registrations:registrations(count)")
    .eq("status", "active")
    .order("event_date", { ascending: true });

  const { data: closedEvents } = await supabase
    .from("events")
    .select("*, registrations:registrations(count)")
    .eq("status", "closed")
    .order("event_date", { ascending: false });

  return (
    <div className="min-h-screen">
      <TopAppBar />
      <main className="pt-20 pb-24 px-5 max-w-5xl mx-auto">
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-on-surface">
              Active Listings
            </h3>
            <span className="text-xs text-secondary font-bold">LIVE NOW</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeEvents?.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
            {(!activeEvents || activeEvents.length === 0) && (
              <p className="col-span-full text-on-surface-variant text-center py-12">
                No active listings right now.
              </p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-2xl font-bold text-on-surface">
              Closed Listings
            </h3>
            <div className="h-px flex-grow bg-outline-variant" />
          </div>
          <div className="space-y-4">
            {closedEvents?.map((event) => {
              const registered = event.registrations?.[0]?.count ?? 0;
              return (
                <div
                  key={event.id}
                  className="bg-surface-container-low border border-outline-variant rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between opacity-80 gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-surface-container-highest rounded flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined">history</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-on-surface-variant">
                        {event.title}
                      </h5>
                      <p className="text-xs text-on-surface-variant">
                        Completed on{" "}
                        {new Date(event.event_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-right">
                      <span className="block text-sm font-bold text-on-surface-variant">
                        {registered} Volunteers
                      </span>
                      <span className="block text-xs text-secondary">
                        Success
                      </span>
                    </div>
                    <button className="border border-primary text-primary px-4 py-2 rounded text-xs font-bold uppercase tracking-wide hover:bg-primary/5">
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
            {(!closedEvents || closedEvents.length === 0) && (
              <p className="text-on-surface-variant text-center py-8">
                No closed listings.
              </p>
            )}
          </div>
        </section>
      </main>
      <BottomNavBar activeTab="home" />
    </div>
  );
}
