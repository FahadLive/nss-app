import webpush from "web-push";
import { createAdminClient } from "@/utils/supabase/admin";

webpush.setVapidDetails(
    "mailto:admin@nss185.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
);

export async function sendPushToUser(
    userId: string,
    title: string,
    body: string,
    url?: string,
) {
    const supabase = createAdminClient();

    const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("subscription")
        .eq("user_id", userId);

    if (!subs || subs.length === 0) return;

    const payload = JSON.stringify({
        title,
        body,
        url: url ?? "/",
        timestamp: Date.now(),
    });

    for (const { subscription } of subs) {
        try {
            await webpush.sendNotification(subscription as never, payload);

            console.log("Push sent");
        } catch (err: any) {
            console.error("Push failed", err);

            if ([404, 410].includes(err.statusCode)) {
                await supabase
                    .from("push_subscriptions")
                    .delete()
                    .eq("user_id", userId)
                    .eq("subscription", subscription as never);
            }
        }
    }
}
