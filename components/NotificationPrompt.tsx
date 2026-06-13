"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function NotificationPrompt() {
    const [status, setStatus] = useState<"idle" | "subscribed" | "denied">(
        "idle",
    );

    const subscribe = async () => {
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

            setStatus("subscribed");
        } catch (err) {
            console.error(err);

            // Development-only recovery for old VAPID keys
            if (
                err instanceof DOMException &&
                err.message.includes("different application server key")
            ) {
                try {
                    const registration = await navigator.serviceWorker.ready;
                    const existing =
                        await registration.pushManager.getSubscription();

                    if (existing) {
                        await existing.unsubscribe();

                        const newSub = await registration.pushManager.subscribe(
                            {
                                userVisibleOnly: true,
                                applicationServerKey: urlBase64ToUint8Array(
                                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ??
                                        "",
                                ),
                            },
                        );

                        console.log("Re-subscribed:", newSub);
                        setStatus("subscribed");
                        return;
                    }
                } catch (retryErr) {
                    console.error(retryErr);
                }
            }

            setStatus("denied");
        }
    };

    if (status === "subscribed") {
        return (
            <button className="w-full bg-tertiary text-on-tertiary font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-xl">
                    check_circle
                </span>
                Notifications Enabled
            </button>
        );
    }

    return (
        <button
            onClick={subscribe}
            className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
            <span className="material-symbols-outlined text-xl">
                notifications_active
            </span>
            Notify me about events
        </button>
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
