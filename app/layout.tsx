import type { Metadata } from "next";
import { Playfair_Display, Public_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["600", "700", "800"],
    variable: "--font-playfair",
});

const publicSans = Public_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-sans",
});

export const metadata: Metadata = {
    title: {
        default: "NSS Unit 185 — Volunteer Management Portal",
        template: "%s | NSS Unit 185",
    },
    description:
        "Not Me, But You. Empowering youth through community service since 1969.",
    manifest: "/manifest.json",
    metadataBase: new URL("https://nss-gecp.netlify.app/"),
    icons: {
        icon: "/favicon.ico",
        apple: [
            { url: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
            { url: "/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" },
        ],
    },
    openGraph: {
        title: "NSS Unit 185 — Volunteer Management Portal",
        description:
            "Not Me, But You. Empowering youth through community service since 1969.",
        url: "https://nss-gecp.netlify.app/",
        siteName: "NSS Unit 185",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
    },
};

import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import NotificationModal from "@/components/NotificationModal";
import { NotifProvider } from "@/components/NotifContext";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${playfair.variable} ${publicSans.variable}`}
        >
            <head>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                />
                <meta name="apple-mobile-web-app-title" content="NSS GECP" />
                <link
                    rel="apple-touch-icon"
                    sizes="192x192"
                    href="/web-app-manifest-192x192.png"
                />
            </head>
            <body className="min-h-dvh flex flex-col bg-surface text-on-surface pb-12">
                <NotifProvider>
                    <ServiceWorkerRegister />
                    <NotificationModal />
                    {children}
                    <Toaster richColors />
                </NotifProvider>
            </body>
        </html>
    );
}
