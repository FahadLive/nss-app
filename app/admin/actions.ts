"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { sendPushToUser } from "@/lib/push";

export async function approveUser(userId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: admin } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!admin || !["execom", "admin"].includes(admin.role ?? "")) {
    throw new Error("Forbidden");
  }

  await supabase
    .from("profiles")
    .update({ approval_status: "approved" })
    .eq("id", userId);

  await sendPushToUser(
    userId,
    "Profile Approved 🎉",
    `Your NSS profile has been approved by ${admin.full_name ?? "the Execom"}! You can now join events.`,
    "/",
  );

  revalidatePath("/admin");
}

export async function rejectUser(userId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: admin } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!admin || !["execom", "admin"].includes(admin.role ?? "")) {
    throw new Error("Forbidden");
  }

  await supabase
    .from("profiles")
    .update({ approval_status: "rejected" })
    .eq("id", userId);

  await sendPushToUser(
    userId,
    "Profile Update",
    "Your NSS profile was not approved. Please contact the Execom for more information.",
    "/profile",
  );

  revalidatePath("/admin");
}

export async function closeEventAction(eventId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: admin } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!admin || !["execom", "admin"].includes(admin.role ?? "")) {
    throw new Error("Forbidden");
  }

  await supabase
    .from("events")
    .update({ status: "closed" })
    .eq("id", eventId);

  revalidatePath("/admin");
}
