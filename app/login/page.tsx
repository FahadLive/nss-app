"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });
        if (error) console.error(error);
        setLoading(false);
    };

    return (
        <div className=" min-h-screen flex flex-col">
            <main className="flex-grow flex flex-col md:flex-row justify-center">
                <section className="relative w-full md:w-1/2 min-h-[353px] md:min-h-0 flex items-center justify-center overflow-hidden p-12">
                    <div className="text-center z-10">
                        <h1 className="text-5xl font-bold mb-4">
                            NSS GEC Palakkad
                        </h1>
                        <p className="text-xl opacity-80">NSS Unit 185</p>
                        <img
                            className="absolute inset-0 w-full h-full object-cover opacity-10"
                            src="/nss-fam.png"
                            alt="NSS background"
                        />
                    </div>
                </section>
                <section className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-12 bg-white">
                    <div className="w-full max-w-md bg-white rounded-xl border border-outline-variant p-8 shadow-sm transition-all hover:shadow-lg">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-on-surface mb-2">
                                Join the Movement
                            </h1>
                            <p className="text-on-surface-variant">
                                Sign in to start your journey of service.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <button
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="w-full h-14 flex items-center justify-center gap-3 bg-white border border-outline hover:bg-surface-container transition-all active:scale-95 rounded-full px-6 shadow-sm group disabled:opacity-50"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                <span className="font-bold text-on-surface">
                                    {loading
                                        ? "Signing in..."
                                        : "Continue with Google"}
                                </span>
                            </button>
                            <div className="bg-surface-container-low border border-outline-variant/50 rounded-xl p-5">
                                <div className="flex gap-3 items-start">
                                    <span className="material-symbols-outlined text-secondary">
                                        info
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-bold text-on-surface mb-1">
                                            New Volunteers
                                        </h3>
                                        <p className="text-xs text-on-surface-variant leading-relaxed">
                                            First-time users will be prompted to
                                            complete their profile with{" "}
                                            <b>Name, Department, and Year</b>.
                                            And then wait for approval
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
