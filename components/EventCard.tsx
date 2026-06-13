"use client";

import { useRouter } from "next/navigation";

interface Event {
  id: string;
  title: string;
  event_date: string;
  max_slots: number;
  image_url?: string | null;
  emoji?: string | null;
  registrations?: { count: number }[];
}

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const router = useRouter();
  const registered =
    event.registrations?.[0]?.count ?? 0;
  const isUrgent = event.max_slots - registered <= 10;

  const dateStr = new Date(event.event_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      onClick={() => router.push(`/event/${event.id}`)}
      className="cursor-pointer bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden card-shadow flex flex-col transition-transform active:scale-[0.98]"
    >
      <div className="relative h-40 bg-surface-dim">
        {event.image_url ? (
          <img
            className="w-full h-full object-cover"
            src={event.image_url}
            alt={event.title}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-container/20">
            <span className="text-5xl">
              {event.emoji ?? "🤝"}
            </span>
          </div>
        )}
        {isUrgent && (
          <span className="absolute top-3 right-3 bg-secondary/10 text-secondary px-3 py-1 rounded text-xs font-bold uppercase backdrop-blur-md border border-secondary/20">
            URGENT
          </span>
        )}
      </div>
      <div className="p-5 flex-grow">
        <h4 className="text-xl font-bold text-primary mb-2">{event.title}</h4>
        <div className="flex items-center gap-2 text-on-surface-variant mb-4 text-sm">
          <span className="material-symbols-outlined text-lg">
            calendar_today
          </span>
          <span>{dateStr}</span>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant mb-6 text-sm">
          <span className="material-symbols-outlined text-lg">group</span>
          <span>
            {registered} / {event.max_slots} Volunteers Joined
          </span>
        </div>
        <button className="w-full bg-secondary text-on-secondary py-3 rounded text-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-md">
          Join Now
        </button>
      </div>
    </div>
  );
}
