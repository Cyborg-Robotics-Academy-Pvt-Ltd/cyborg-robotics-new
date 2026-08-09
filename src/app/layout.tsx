// app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ReactNode, Suspense } from "react";
import ConditionalHeader from "@/components/layout/conditional-header";

import { Poppins } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { WebsiteLoadingProvider } from "@/components/WebsiteLoading";
import { Toaster } from "react-hot-toast";
import { GoogleTagManager } from "@next/third-parties/google";
import TawkWidget from "@/components/widgets/TawkWidget";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={poppins.variable}
      data-scroll-behavior="smooth"
    >
      <body
        className="font-body antialiased overflow-x-hidden"
        suppressHydrationWarning={true}
      >
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1572120400594440');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1572120400594440&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        {/* Google Tag Manager */}
        <GoogleTagManager gtmId="GTM-TBX67M44" />

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
            <TawkWidget />
          </AuthProvider>
        </WebsiteLoadingProvider>
      </body>
    </html>
  );
}
