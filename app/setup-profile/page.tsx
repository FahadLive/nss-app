"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ClipboardEdit } from "lucide-react";

const DEPARTMENTS = [
    "Computer Science and Engineering (CSE)",
    "Electronics and Communication Engineering (ECE)",
    "Information Technology (IT)",
    "Mechanical Engineering (ME)",
    "Electrical and Electronics Engineering (EEE)",
    "Civil Engineering",
] as const;

const BATCHES = ["2024-28", "2025-29"] as const;

function computeYear(batch: string): string {
    const startYear = parseInt(batch.split("-")[0]);
    const currentYear = new Date().getFullYear();
    const yearNum = currentYear - startYear + 1;
    const clamped = Math.max(1, Math.min(4, yearNum));
    return `Year ${clamped}`;
}

export default function SetupProfilePage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [department, setDepartment] = useState("");
    const [batch, setBatch] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!department || !batch) return;
        setLoading(true);

        const year = computeYear(batch);

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            router.push("/login");
            return;
        }

        const { error } = await supabase
            .from("profiles")
            .update({
                department,
                year,
            })
            .eq("id", user.id);

        setLoading(false);

        if (error) {
            alert("Failed to save profile: " + error.message);
        } else {
            router.push("/");
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface-container-lowest rounded-xl border border-outline-variant p-8 shadow-sm">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-fixed rounded-full mb-4">
                        <ClipboardEdit size={32} className="text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-on-surface mb-2">
                        Complete Your Profile
                    </h1>
                    <p className="text-sm text-on-surface-variant">
                        Your details will be verified by the Execom before you
                        can join events.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-on-surface-variant">
                            Department *
                        </label>
                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            required
                            className="w-full h-12 px-4 rounded border border-outline-variant focus:ring-primary focus:border-primary outline-none transition-all text-sm bg-white"
                        >
                            <option value="">Select your department</option>
                            {DEPARTMENTS.map((d) => (
                                <option key={d} value={d}>
                                    {d}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-on-surface-variant">
                            Batch (Year of Admission - Year of Passing) *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {BATCHES.map((b) => (
                                <button
                                    key={b}
                                    type="button"
                                    onClick={() => setBatch(b)}
                                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                                        batch === b
                                            ? "border-secondary bg-secondary-fixed text-on-surface font-bold"
                                            : "border-outline-variant bg-white text-on-surface-variant hover:border-primary"
                                    }`}
                                >
                                    <span className="text-lg font-bold">
                                        {b}
                                    </span>
                                    <br />
                                    <span className="text-xs">
                                        → {computeYear(b)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !department || !batch}
                        className="w-full h-14 bg-primary text-on-primary font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Submit for Verification"}
                    </button>
                </form>
            </div>
        </div>
    );
}
