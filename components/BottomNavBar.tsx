"use client";

import { useRouter } from "next/navigation";

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
        { key: "home", label: "Home", icon: "home", path: "/" },
        ...(isAdmin
            ? [
                  {
                      key: "admin" as const,
                      label: "Admin",
                      icon: "diversity_1",
                      path: "/admin",
                  },
              ]
            : []),
        {
            key: "profile",
            label: "Profile",
            icon: "account_circle",
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
                        <span
                            className="material-symbols-outlined"
                            style={{
                                fontVariationSettings: `'FILL' ${isActive ? 1 : 0}`,
                            }}
                        >
                            {tab.icon}
                        </span>
                        <span className="text-xs font-bold">{tab.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
