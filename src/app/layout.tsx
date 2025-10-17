// app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Header from "@/components/layout/header";
import { ReactNode } from "react";
import Footer from "@/components/home/Footer";
import WhatsAppWidget from "@/components/widgets/WhatsAppWidget";
import { Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ScrollButton from "@/components/widgets/ScrollButton";

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
        <AuthProvider>
          <div className="flex min-h-screen w-full flex-col overflow-x-hidden">
            <Header />
            <main className="flex-1 w-full overflow-x-hidden">{children}</main>
            <Footer />
          </div>
          <WhatsAppWidget />
          <ScrollButton />

          <Analytics />
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  );
}
