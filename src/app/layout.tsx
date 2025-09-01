// app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Header from "@/components/layout/header";
import { ReactNode } from "react";
import Footer from "@/components/Footer";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <head></head>
      <body className="font-body antialiased">
        <AuthProvider>
          <div className="flex min-h-screen w-full flex-col">
            <Header />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
