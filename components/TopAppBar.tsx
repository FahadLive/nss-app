"use client";

import { useRouter } from "next/navigation";
import { useNotif } from "@/components/NotifContext";
import { ArrowLeft, Shield, User, Bell, BellRing } from "lucide-react";

interface TopAppBarProps {
  title?: string;
  showBack?: boolean;
  isAdmin?: boolean;
  avatarUrl?: string | null;
}

export default function TopAppBar({
  title = "NSS Unit 185",
  showBack = false,
  isAdmin = false,
  avatarUrl,
}: TopAppBarProps) {
  const router = useRouter();
  const { subscribed } = useNotif();

    const openModal = () => {
        window.dispatchEvent(new CustomEvent("open-notification-modal"));
    };

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-surface shadow-sm flex justify-between items-center h-16 px-5">
            <div className="flex items-center gap-3">
                {showBack && (
                    <button
                        onClick={() => router.back()}
                        className="p-2 active:scale-95 transition-transform"
                    >
                        <ArrowLeft className="text-primary" size={24} />
                    </button>
                )}
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border border-outline-variant">
                    {isAdmin ? (
                        <Shield className="text-white" size={24} />
                    ) : avatarUrl ? (
                        <img
                            alt="Profile"
                            className="w-full h-full object-cover"
                            src={avatarUrl}
                        />
                    ) : (
                        <User className="text-white" size={24} />
                    )}
                </div>
                <h1 className="text-xl font-bold text-primary">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={openModal}
                    className={`p-2 hover:bg-surface-container-low transition-colors rounded-full ${
                        subscribed ? "text-secondary" : "text-primary"
                    }`}
                >
                    {subscribed ? <BellRing size={24} /> : <Bell size={24} />}
                </button>
            </div>
        </header>
    );
}
