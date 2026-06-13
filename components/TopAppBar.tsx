"use client";

import { useRouter } from "next/navigation";

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

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface shadow-sm flex justify-between items-center h-16 px-container-margin">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="material-symbols-outlined text-primary p-2 active:scale-95 transition-transform"
          >
            arrow_back
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border border-outline-variant">
          {isAdmin ? (
            <span className="material-symbols-outlined text-white">
              admin_panel_settings
            </span>
          ) : avatarUrl ? (
            <img
              alt="Profile"
              className="w-full h-full object-cover"
              src={avatarUrl}
            />
          ) : (
            <span className="material-symbols-outlined text-white">person</span>
          )}
        </div>
        <h1 className="text-xl font-bold text-primary">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="material-symbols-outlined text-primary p-2 hover:bg-surface-container-low transition-colors rounded-full">
          notifications
        </button>
      </div>
    </header>
  );
}
