"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { approveUser, rejectUser, closeEventAction } from "./actions";

interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
    department: string | null;
    year: string | null;
    created_at: string;
}

interface Event {
    id: string;
    title: string;
    event_date: string;
    max_slots: number;
    image_url?: string | null;
    status: string;
    registrations?: { count: number }[];
}

export default function AdminClient({
    pendingProfiles,
    allEvents,
}: {
    pendingProfiles: Profile[];
    allEvents: Event[];
}) {
    const router = useRouter();

    const handleApprove = (userId: string) => {
        toast.promise(approveUser(userId), {
            loading: "Approving volunteer...",
            success: "Volunteer approved",
            error: (e) => e.message ?? "Failed to approve volunteer",
        });
    };

    const handleReject = (userId: string) => {
        if (!confirm("Reject this volunteer?")) return;

        toast.promise(rejectUser(userId), {
            loading: "Rejecting volunteer...",
            success: "Volunteer rejected",
            error: (e) => e.message ?? "Failed to reject volunteer",
        });
    };

    const copyToWhatsApp = async (title: string) => {
        try {
            await navigator.clipboard.writeText(
                `🔴 *NSS UNIT 185 EVENT ALERT* 🔴

    Event: *${title}*

    Check details and register now!`,
            );

            toast.success("Copied to clipboard");
        } catch {
            toast.error("Failed to copy");
        }
    };

    const closeEvent = (eventId: string) => {
        if (!confirm("Close registrations for this event?")) return;

        toast.promise(closeEventAction(eventId), {
            loading: "Closing event...",
            success: "Event closed",
            error: "Failed to close event",
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <section className="lg:col-span-7">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-on-surface">
                            Pending Approvals
                        </h3>
                        <p className="text-sm text-on-surface-variant">
                            Review and verify new registrations.
                        </p>
                    </div>
                    {pendingProfiles.length > 0 && (
                        <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-xs font-bold">
                            {pendingProfiles.length} NEW
                        </span>
                    )}
                </div>
                <div className="space-y-4">
                    {pendingProfiles.map((v) => {
                        const initial =
                            v.full_name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase() ?? "?";
                        return (
                            <div
                                key={v.id}
                                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 card-shadow hover:shadow-md"
                            >
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary">
                                        {initial}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-on-surface">
                                            {v.full_name ?? "Unknown"}
                                        </h4>
                                        <div className="flex gap-2 text-xs text-on-surface-variant">
                                            <span>{v.department ?? "N/A"}</span>
                                            <span>•</span>
                                            <span>{v.year ?? "N/A"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <button
                                        onClick={() => handleReject(v.id)}
                                        className="flex-1 md:flex-none px-4 py-2 border border-error text-error rounded-lg font-bold hover:bg-error-container transition-colors"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(v.id)}
                                        className="flex-1 md:flex-none px-6 py-2 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90"
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {pendingProfiles.length === 0 && (
                        <p className="text-on-surface-variant text-center py-8">
                            No pending approvals.
                        </p>
                    )}
                </div>
            </section>

            <aside className="lg:col-span-5">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-on-surface">
                        Listing Management
                    </h3>
                    <button
                        onClick={() => router.push("/create")}
                        className="bg-primary-container text-on-primary-container p-2 rounded-full flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined">add</span>
                    </button>
                </div>
                <div className="space-y-6">
                    {allEvents.map((l) => {
                        const registered = l.registrations?.[0]?.count ?? 0;
                        return (
                            <div
                                key={l.id}
                                className="group relative bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant"
                            >
                                <div
                                    className="h-24 bg-cover bg-center relative"
                                    style={{
                                        backgroundImage: l.image_url
                                            ? `url(${l.image_url})`
                                            : undefined,
                                        backgroundColor: l.image_url
                                            ? undefined
                                            : "var(--color-surface-container-high)",
                                    }}
                                >
                                    <div className="absolute inset-0 bg-black/40" />
                                    <span
                                        className={`absolute top-3 right-3 ${l.status === "active" ? "bg-green-500" : "bg-outline"} text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter`}
                                    >
                                        {l.status}
                                    </span>
                                </div>
                                <div className="p-4">
                                    <h4 className="font-bold text-on-surface mb-1">
                                        {l.title}
                                    </h4>
                                    <div className="flex items-center text-xs text-on-surface-variant mb-4">
                                        <span className="material-symbols-outlined text-sm mr-1">
                                            group
                                        </span>
                                        {registered} / {l.max_slots} Registered
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() =>
                                                copyToWhatsApp(l.title)
                                            }
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-surface-container-highest rounded-lg text-xs font-bold text-primary hover:bg-primary-fixed"
                                        >
                                            <span className="material-symbols-outlined text-lg">
                                                content_copy
                                            </span>
                                            WhatsApp
                                        </button>
                                        {l.status === "active" && (
                                            <button
                                                onClick={() => closeEvent(l.id)}
                                                className="px-4 py-2 bg-on-surface text-surface rounded-lg text-xs font-bold"
                                            >
                                                Close
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {allEvents.length === 0 && (
                        <p className="text-on-surface-variant text-center py-8">
                            No listings yet.
                        </p>
                    )}
                </div>
            </aside>
        </div>
    );
}
