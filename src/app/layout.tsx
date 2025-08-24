// app/layout.tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { NavbarDemo } from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthProvider } from "@/lib/auth-context";

// ✅ Import and configure Poppins
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cyborg Robotics Academy",
  description:
    "Cyborg Robotics Academy Private Limited, based in Pune, offers technical courses like Lego Robotics, Electronics, Arduino, IoT, Python, Java, Web Design, App Design, 3D Printing, Animation and Coding. Our hands-on programs emphasize Learning by Doing to develop problem-solving and inquiry skills.",
  openGraph: {
    title: "Cyborg Robotics Academy Private Limited",
    description:
      "Cyborg Robotics Academy Private Limited, based in Pune, offers technical courses like Lego Robotics, Electronics, Arduino, IoT, Python, Java, Web Design, App Design, 3D Printing, Animation and Coding. Our hands-on programs emphasize Learning by Doing to develop problem-solving and inquiry skills.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.className} ${poppins.variable} antialiased`}>
        <AuthProvider>
          <NavbarDemo />
          <div className="mt-24">{children}</div>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
