"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import TopAppBar from "@/components/TopAppBar";
import BottomNavBar from "@/components/BottomNavBar";

export default function CreateListingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"poster" | "emoji">("poster");
  const [loading, setLoading] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("");

  const emojis = [
    "🧘",
    "🩸",
    "🧹",
    "🌳",
    "🍱",
    "📚",
    "🏥",
    "🎨",
    "🚲",
    "🤝",
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    let imageUrl: string | null = null;
    const file = form.get("poster") as File | null;
    if (file && file.size > 0) {
      const ext = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const { data } = await supabase.storage
        .from("event-banners")
        .upload(fileName, file);
      if (data) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("event-banners").getPublicUrl(data.path);
        imageUrl = publicUrl;
      }
    }

    const { error } = await supabase.from("events").insert({
      title: form.get("title") as string,
      description: form.get("description") as string,
      location: form.get("location") as string,
      event_date: form.get("event_date") as string,
      registration_deadline: form.get("registration_deadline") as string,
      max_slots: parseInt(form.get("max_slots") as string) || 30,
      image_url: imageUrl,
      emoji: activeTab === "emoji" ? selectedEmoji : null,
      status: "active",
    });

    setLoading(false);
    if (error) {
      alert("Failed to create listing: " + error.message);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="bg-surface min-h-screen pb-24">
      <TopAppBar title="Create Listing" showBack />
      <main className="px-container-margin py-20 max-w-xl mx-auto">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              className="text-sm font-bold text-on-surface-variant"
              htmlFor="title"
            >
              Listing Title *
            </label>
            <input
              className="w-full h-12 px-4 rounded border border-outline-variant focus:ring-primary focus:border-primary outline-none transition-all text-sm bg-white"
              id="title"
              name="title"
              placeholder="e.g., Yoga Class - Day 6"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-bold text-on-surface-variant"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              className="w-full min-h-[100px] px-4 py-3 rounded border border-outline-variant focus:ring-primary focus:border-primary outline-none transition-all text-sm bg-white resize-y"
              id="description"
              name="description"
              placeholder="Describe the event..."
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-bold text-on-surface-variant"
              htmlFor="location"
            >
              Location
            </label>
            <input
              className="w-full h-12 px-4 rounded border border-outline-variant focus:ring-primary focus:border-primary outline-none transition-all text-sm bg-white"
              id="location"
              name="location"
              placeholder="e.g., Central Lawn, North Campus"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                className="text-sm font-bold text-on-surface-variant"
                htmlFor="event_date"
              >
                Event Date & Time *
              </label>
              <input
                className="w-full h-12 px-4 rounded border border-outline-variant focus:ring-primary focus:border-primary outline-none transition-all text-sm bg-white"
                id="event_date"
                name="event_date"
                type="datetime-local"
                required
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-bold text-on-surface-variant"
                htmlFor="registration_deadline"
              >
                Registration Deadline
              </label>
              <input
                className="w-full h-12 px-4 rounded border border-outline-variant focus:ring-primary focus:border-primary outline-none transition-all text-sm bg-white"
                id="registration_deadline"
                name="registration_deadline"
                type="datetime-local"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-bold text-on-surface-variant"
              htmlFor="max_slots"
            >
              Max Volunteers
            </label>
            <input
              className="w-full h-12 px-4 rounded border border-outline-variant focus:ring-primary focus:border-primary outline-none transition-all text-sm bg-white"
              id="max_slots"
              name="max_slots"
              type="number"
              min={1}
              defaultValue={30}
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-on-surface-variant">
              Visual Representation
            </label>
            <div className="flex p-1 bg-surface-container rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("poster")}
                className={`flex-1 py-2 rounded-lg text-sm transition-all ${activeTab === "poster" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant"}`}
              >
                Add Poster Image
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("emoji")}
                className={`flex-1 py-2 rounded-lg text-sm transition-all ${activeTab === "emoji" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant"}`}
              >
                Use Emoji Icon
              </button>
            </div>
            {activeTab === "poster" ? (
              <label className="relative group cursor-pointer border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center bg-white hover:border-primary transition-colors h-48 overflow-hidden">
                <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">
                  add_photo_alternate
                </span>
                <p className="text-sm text-on-surface-variant">
                  Upload event banner
                </p>
                <input
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  name="poster"
                  type="file"
                  accept="image/*"
                />
              </label>
            ) : (
              <div className="grid grid-cols-5 gap-3 p-4 bg-white rounded-xl border border-outline-variant shadow-sm">
                {emojis.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setSelectedEmoji(e)}
                    className={`aspect-square flex items-center justify-center text-3xl rounded-lg transition-all active:scale-90 ${
                      selectedEmoji === e
                        ? "border-2 border-secondary bg-secondary-fixed"
                        : "border border-transparent hover:border-secondary hover:bg-secondary-fixed"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-on-surface-variant">
              Who can manage this listing?
            </label>
            <div className="space-y-2">
              {["Execom Only", "Specific Volunteers", "Open to All"].map(
                (opt, i) => (
                  <label
                    key={opt}
                    className="flex items-center p-4 rounded-xl border border-outline-variant bg-white cursor-pointer hover:bg-surface-container-low transition-colors group"
                  >
                    <input
                      defaultChecked={i === 0}
                      className="w-5 h-5 text-primary focus:ring-primary border-outline-variant"
                      name="perm"
                      type="radio"
                    />
                    <div className="ml-4">
                      <p className="text-sm font-bold text-on-surface">
                        {opt}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        Manage event visibility and registration.
                      </p>
                    </div>
                  </label>
                )
              )}
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full h-14 bg-secondary text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-50"
            type="submit"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              send
            </span>
            {loading ? "PUBLISHING..." : "PUBLISH LISTING"}
          </button>
        </form>
      </main>
      <BottomNavBar activeTab="home" />
    </div>
  );
}
