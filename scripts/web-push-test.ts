import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

webpush.setVapidDetails(
    "mailto:" + process.env.VAPID_MAIL_ID,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
);

async function main() {
    const { data: sub, error } = await supabase
        .from("push_subscriptions")
        .select("subscription")
        .limit(1)
        .single();

    if (error || !sub) {
        console.error("No subscription found:", error);
        return;
    }

    await webpush.sendNotification(
        sub.subscription,
        JSON.stringify({
            title: "NSS 185",
            body: "Test push notification",
        }),
    );

    console.log("Push sent successfully");
}

main().catch(console.error);
