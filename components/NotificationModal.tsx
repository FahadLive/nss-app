"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useNotif } from "@/components/NotifContext";
import { Bell, BellRing } from "lucide-react";

const DISMISS_KEY = "notification_modal_dismissed_at";
const DISMISS_DAYS = 7;

export default function NotificationModal() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { subscribed, setSubscribed } = useNotif();

  useEffect(() => {
    const check = async () => {
      const stored = localStorage.getItem(DISMISS_KEY);
      if (stored) {
        const elapsed = Date.now() - parseInt(stored);
        if (elapsed < DISMISS_DAYS * 86400000) return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (subs) {
        setSubscribed(true);
        return;
      }

      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    };

    check();

    const onOpen = () => {
      setVisible(true);
    };
    window.addEventListener("open-notification-modal", onOpen);
    return () => window.removeEventListener("open-notification-modal", onOpen);
  }, [setSubscribed]);

  const subscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      let sub = await registration.pushManager.getSubscription();
      if (!sub) {
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
          ),
        });
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("push_subscriptions").upsert({
        user_id: user.id,
        subscription: sub.toJSON(),
      });

      setSubscribed(true);
      setVisible(false);
    } catch {
      setVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible || subscribed) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setVisible(false)}
      />
      <div className="relative bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-2xl p-8 max-w-sm w-full animate-in fade-in zoom-in-95">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-fixed rounded-full mb-5">
            <Bell size={36} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">
            Stay Updated
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-8">
            Get notified when your profile is approved, when new events are
            posted, and when registration deadlines approach.
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={subscribe}
            disabled={loading}
            className="w-full h-12 bg-primary text-on-primary rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <BellRing size={20} />
            {loading ? "Enabling..." : "Enable Notifications"}
          </button>
          <button
            onClick={dismiss}
            className="w-full py-3 text-sm text-on-surface-variant font-bold hover:text-on-surface transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
