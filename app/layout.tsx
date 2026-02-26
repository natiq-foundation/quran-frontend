import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { client } from "@ntq/sdk";
import { MushafOptionsProvider } from "@/contexts/mushafOptionsContext";
import { SelectedProvider } from "@/contexts/selectedsContext";
import { PlayOptionsProvider } from "@/contexts/playOptionsContext";
import { Audio } from "@/components/Audio";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Natiq Quran",
    description: "Natiq | Quran",
};

client.setConfig({
    baseURL: process.env.API_URL || "https://api.natiq.net",
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" translate="no" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <PlayOptionsProvider>
                        <MushafOptionsProvider>
                            <SelectedProvider>
                                {children}
                                <Audio />
                                <Toaster position="top-right" offset={{ top: 80 }} />
                            </SelectedProvider>
                        </MushafOptionsProvider>
                    </PlayOptionsProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
