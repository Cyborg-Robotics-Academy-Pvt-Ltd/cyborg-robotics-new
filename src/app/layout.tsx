// app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ReactNode, Suspense } from "react";
import ConditionalHeader from "@/components/layout/conditional-header";

import { Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { WebsiteLoadingProvider } from "@/components/WebsiteLoading";

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
      <head>
        {/* Performance optimizations */}
        <title>
          Robotics & Coding Classes For Kids | STEM & Coding Academy
        </title>
        <meta
          name="description"
          content="Discover engaging robotics and coding courses for kids. Build STEM skills, innovate, and learn through hands-on projects in a fun environment."
        />
        <meta
          name="keywords"
          content="robotics academy for kids, kids robotics classes, robotics classes in Pune / your city, STEM classes for kids, coding classes for kids, robotics training for children, kids technology academy, robotics and coding for kids, STEM education for kids, child robotics workshops"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://assets.aceternity.com" />

        {/* App icons and meta */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/assets/logo.png" />
        <meta name="theme-color" content="#dc2626" />

        {/* Performance meta tags */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1"
        />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      </head>
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
          </AuthProvider>
        </WebsiteLoadingProvider>
      </body>
    </html>
  );
}
