import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kv } from "@vercel/kv";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Track visitor data dynamically
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const page = request.nextUrl.pathname;
    const userAgent = request.headers.get("user-agent") || "unknown";
    const referrer = request.headers.get("referer") || "direct";
    const country = request.geo?.country || "unknown";
    const city = request.geo?.city || "unknown";
    const region = request.geo?.region || "unknown";

    // Generate a unique visitor ID based on IP and user agent
    const visitorId = `${request.ip || "unknown"}_${userAgent.slice(0, 50)}`;
    
    // Track total pageviews
    await kv.incr("total_pageviews");
    
    // Track daily pageviews
    await kv.incr(`daily_pageviews:${today}`);
    
    // Track monthly pageviews
    const month = today.substring(0, 7); // YYYY-MM format
    await kv.incr(`monthly_pageviews:${month}`);
    
    // Track unique visitors for today
    const isNewVisitorToday = await kv.sadd(`daily_visitors:${today}`, visitorId);
    if (isNewVisitorToday) {
      await kv.incr("total_unique_visitors");
      // Track unique visitors for the month
      await kv.sadd(`monthly_visitors:${month}`, visitorId);
    }
    
    // Track page-specific views
    await kv.incr(`page_views:${page}`);
    await kv.incr(`monthly_page_views:${month}:${page}`);
    
    // Track referrer data
    await kv.incr(`referrer:${referrer}`);
    await kv.incr(`monthly_referrer:${month}:${referrer}`);
    
    // Track country data
    await kv.incr(`country:${country}`);
    await kv.incr(`monthly_country:${month}:${country}`);
    
    // Track device type based on user agent
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isTablet = /iPad|Tablet/.test(userAgent);
    const deviceType = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";
    await kv.incr(`device:${deviceType}`);
    await kv.incr(`monthly_device:${month}:${deviceType}`);
    
    // Track browser type
    const browser = userAgent.includes("Chrome") ? "chrome" :
                   userAgent.includes("Safari") ? "safari" :
                   userAgent.includes("Firefox") ? "firefox" :
                   userAgent.includes("Edge") ? "edge" : "other";
    await kv.incr(`browser:${browser}`);
    await kv.incr(`monthly_browser:${month}:${browser}`);
    
    // Store detailed visitor info
    await kv.hset(`visitor:${visitorId}`, {
      lastVisit: new Date().toISOString(),
      page,
      country,
      city,
      region,
      device: deviceType,
      browser,
      referrer,
    });
    
  } catch (error) {
    console.error("Failed to track visitor:", error);
  }

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};