// app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ReactNode, Suspense } from "react";
import ConditionalHeader from "@/components/layout/conditional-header";

import { Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { WebsiteLoadingProvider } from "@/components/WebsiteLoading";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];
          w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
          var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
          j.async=true;
          j.src='https://www.googletagmanager.com/gtm.js?id=GTM-TBX67M44'+dl;
          f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-TBX67M44');
        `,
          }}
        />
      </head>
      <body
        className="font-body antialiased overflow-x-hidden"
        suppressHydrationWarning={true}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TBX67M44"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

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
