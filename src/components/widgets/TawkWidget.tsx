// components/widgets/TawkWidget.tsx
"use client";

import Script from "next/script";

const TawkWidget = () => {
  return (
    <Script
      id="tawk-to"
      async
      strategy="afterInteractive"
      src={`https://embed.tawk.to/6a782dc9224bc71d4a5394b5/1jvin5n70`}
    />
  );
};

export default TawkWidget;
