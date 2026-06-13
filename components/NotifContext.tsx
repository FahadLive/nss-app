"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface NotifContextValue {
  subscribed: boolean;
  setSubscribed: (v: boolean) => void;
}

const NotifContext = createContext<NotifContextValue | null>(null);

export function NotifProvider({ children }: { children: ReactNode }) {
  const [subscribed, setSubscribed] = useState(false);
  return (
    <NotifContext.Provider value={{ subscribed, setSubscribed }}>
      {children}
    </NotifContext.Provider>
  );
}

export function useNotif(): NotifContextValue {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error("useNotif must be used within NotifProvider");
  return ctx;
}
