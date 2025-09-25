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
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/assets/logo.png" />
        <meta name="theme-color" content="#dc2626" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <div className="flex min-h-screen w-full flex-col">
            <Header />
            <main className="flex-1 pt-16">{children}</main>
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
