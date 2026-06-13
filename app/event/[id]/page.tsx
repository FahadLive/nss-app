import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TopAppBar from "@/components/TopAppBar";
import EventDetailClient from "./EventDetailClient";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("approval_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.approval_status !== "approved") {
    redirect("/profile");
  }

  const { data: event } = await supabase
    .from("events")
    .select("*, registrations:registrations(count)")
    .eq("id", id)
    .single();

  if (!event) redirect("/");

  const { data: participants } = await supabase
    .from("registrations")
    .select("volunteer_id, profiles:volunteer_id(full_name)")
    .eq("event_id", id);

  const { data: myRegistration } = await supabase
    .from("registrations")
    .select("id")
    .eq("event_id", id)
    .eq("volunteer_id", user.id)
    .maybeSingle();

  return (
    <div className="bg-background text-on-background min-h-screen pb-32">
      <TopAppBar showBack />
      <main className="mt-16 px-5 py-8 max-w-4xl mx-auto">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8 shadow-md border border-outline-variant/30">
          {event.image_url ? (
            <img
              className="w-full h-full object-cover"
              src={event.image_url}
              alt={event.title}
            />
          ) : (
            <div className="w-full h-full bg-primary-container flex flex-col items-center justify-center gap-4 text-on-primary-container">
              <span className="material-symbols-outlined text-6xl opacity-40">
                volunteer_activism
              </span>
              <span className="text-xs uppercase tracking-widest opacity-60">
                NSS Event Banner
              </span>
            </div>
          )}
          <div className="absolute top-4 right-4">
            <span className="bg-primary text-on-primary px-3 py-1 rounded text-xs font-bold uppercase shadow-lg">
              {event.status === "active" ? "Active" : event.status}
            </span>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-3xl font-bold text-primary mb-2">
            {event.title}
          </h2>
          <div className="flex flex-wrap gap-4 text-on-surface-variant text-sm mb-4">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">
                calendar_today
              </span>
              <span>
                {new Date(event.event_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-base">
                  location_on
                </span>
                <span>{event.location}</span>
              </div>
            )}
          </div>
          {event.registration_deadline && (
            <div className="flex items-center gap-1 text-secondary font-bold text-sm mb-6">
              <span className="material-symbols-outlined text-base">timer</span>
              <span>
                Registration Closes:{" "}
                {new Date(event.registration_deadline).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </span>
            </div>
          )}
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-md">
            <h3 className="text-xs font-bold text-primary mb-3 uppercase tracking-wider border-b border-outline-variant pb-2">
              Description
            </h3>
            <p className="text-sm text-on-surface leading-relaxed">
              {event.description ?? "No description provided."}
            </p>
          </div>
        </section>

        <EventDetailClient
          eventId={event.id}
          maxSlots={event.max_slots}
          registeredCount={event.registrations?.[0]?.count ?? 0}
          participants={participants ?? []}
          hasJoined={!!myRegistration}
        />
      </main>
    </div>
  );
}
