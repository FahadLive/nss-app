"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Copy, CheckCircle, UserPlus, UserMinus } from "lucide-react";

interface Participant {
  volunteer_id: string;
  profiles: { full_name: string | null }[] | { full_name: string | null };
}

export default function EventDetailClient({
  eventId,
  maxSlots,
  registeredCount,
  participants,
  hasJoined: initiallyJoined,
}: {
  eventId: string;
  maxSlots: number;
  registeredCount: number;
  participants: Participant[];
  hasJoined: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [joined, setJoined] = useState(initiallyJoined);
  const [count, setCount] = useState(registeredCount);
  const [loading, setLoading] = useState(false);

  const toggleJoin = async () => {
    setLoading(true);
    if (joined) {
      await supabase
        .from("registrations")
        .delete()
        .eq("event_id", eventId)
        .eq("volunteer_id", (await supabase.auth.getUser()).data.user?.id);
      setJoined(false);
      setCount((c) => c - 1);
    } else {
      await supabase.from("registrations").insert({
        event_id: eventId,
        volunteer_id: (await supabase.auth.getUser()).data.user?.id,
      });
      setJoined(true);
      setCount((c) => c + 1);
    }
    setLoading(false);
    router.refresh();
  };

  const getName = (p: Participant) => {
    const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
    return profile?.full_name ?? "Volunteer";
  };

  const copyWhatsapp = () => {
    const list = participants
      .map((p, i) => `${i + 1}. ${getName(p)}`)
      .join("\n");
    navigator.clipboard.writeText(`*Event Participants*\n${list}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div className="space-y-6">
        <div className="bg-primary-container text-white p-6 rounded-xl shadow-md">
          <h4 className="text-xs font-bold uppercase opacity-80 mb-1">
            Registered
          </h4>
          <p className="text-2xl font-bold">
            {count} <span className="text-xs opacity-60">/ {maxSlots}</span>
          </p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant p-6 rounded-xl">
          <h4 className="text-xs font-bold uppercase text-on-surface-variant mb-4">
            Admin Tools
          </h4>
          <button
            onClick={copyWhatsapp}
            className="w-full flex items-center justify-center gap-2 bg-on-tertiary-fixed text-white py-3 rounded-lg text-xs font-bold hover:bg-tertiary-container transition-colors"
          >
            <Copy size={16} />
            WhatsApp Format
          </button>
        </div>
      </div>
      <div className="md:col-span-2">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
            <h3 className="text-xs font-bold text-primary uppercase">
              Participant List
            </h3>
            <span className="bg-secondary text-on-secondary px-2 py-0.5 rounded-full text-[10px] font-bold">
              {count}/{maxSlots} Filled
            </span>
          </div>
          <ul className="divide-y divide-outline-variant/30">
            {participants.map((p, i) => (
              <li
                key={p.volunteer_id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-surface-container transition-colors"
              >
                <span className="text-xs text-on-surface-variant w-6 text-right">
                  {i + 1}.
                </span>
                <div className="flex-grow">
                  <p className="text-sm font-bold text-on-surface">
                    {getName(p)}
                  </p>
                  <p className="text-[10px] text-on-surface-variant">
                    Volunteer
                  </p>
                </div>
                <CheckCircle size={20} className="text-outline-variant" />
              </li>
            ))}
            {participants.length === 0 && (
              <li className="px-6 py-8 text-center text-on-surface-variant text-sm">
                No participants yet. Be the first to join!
              </li>
            )}
          </ul>
        </div>
      </div>
      <footer className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-md border-t border-outline-variant p-4 z-50 flex gap-4">
        <button
          onClick={toggleJoin}
          disabled={loading}
          className={`flex-grow ${joined ? "bg-outline opacity-80" : "bg-secondary"} text-on-secondary h-14 rounded-xl font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50`}
        >
          {joined ? <UserMinus size={24} /> : <UserPlus size={24} />}
          <span>{joined ? "Leave Event" : "Join Event"}</span>
        </button>
      </footer>
    </div>
  );
}
