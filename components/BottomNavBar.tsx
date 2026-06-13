"use client";

import { useRouter } from "next/navigation";
import { Home, Users, UserCircle } from "lucide-react";

interface BottomNavBarProps {
    activeTab?: "home" | "admin" | "profile";
    isAdmin?: boolean;
}

export default function BottomNavBar({
    activeTab = "home",
    isAdmin = false,
}: BottomNavBarProps) {
    const router = useRouter();

    const tabs = [
        { key: "home", label: "Home", Icon: Home, path: "/" },
        ...(isAdmin
            ? [
                  {
                      key: "admin" as const,
                      label: "Admin",
                      Icon: Users,
                      path: "/admin",
                  },
              ]
            : []),
        {
            key: "profile",
            label: "Profile",
            Icon: UserCircle,
            path: "/profile",
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface border-t border-outline-variant shadow-lg flex justify-around items-center h-20 px-2 pb-2">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                    <button
                        key={tab.key}
                        onClick={() => router.push(tab.path)}
                        className={`flex flex-col items-center justify-center rounded-md px-5 py-1 active:scale-90 transition-all ${
                            isActive
                                ? "bg-secondary-container text-on-secondary-container"
                                : "text-on-surface-variant hover:text-primary"
                        }`}
                    >
                        <tab.Icon
                            size={24}
                            fill={isActive ? "currentColor" : "none"}
                        />
                        <span className="text-xs font-bold">{tab.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
