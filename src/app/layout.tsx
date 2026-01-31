// app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ReactNode, Suspense } from "react";
import ConditionalHeader from "@/components/layout/conditional-header";

import { Poppins } from "next/font/google";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { WebsiteLoadingProvider } from "@/components/WebsiteLoading";
import toast, { Toaster } from "react-hot-toast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <body
        className="font-body antialiased overflow-x-hidden"
        suppressHydrationWarning={true}
      >
        <WebsiteLoadingProvider>
          <AuthProvider>
            <div className="flex min-h-screen w-full flex-col overflow-x-hidden">
              <Suspense fallback={<div />}>
                <ConditionalHeader />
              </Suspense>
              <main className="flex-1 w-full overflow-x-hidden">
                {children}
              </main>
            </div>

            <Analytics />

            <SpeedInsights />
            <Toaster position="top-right" />
          </AuthProvider>
        </WebsiteLoadingProvider>
      </body>
    </html>
  );
}
