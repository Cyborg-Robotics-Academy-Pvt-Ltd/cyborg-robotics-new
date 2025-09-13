import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET(request: NextRequest) {
  try {
    // Fetch real-time data from Vercel KV storage
    const [
      totalPageviews,
      totalVisitors,
      pageViewsData,
      referrerData,
      countryData,
      deviceData,
      browserData,
    ] = await Promise.all([
      kv.get("total_pageviews") || 0,
      kv.get("total_unique_visitors") || 0,
      kv.mget(await getPageKeys()),
      kv.mget(await getReferrerKeys()),
      kv.mget(await getCountryKeys()),
      kv.mget(await getDeviceKeys()),
      kv.mget(await getBrowserKeys()),
    ]);

    // Process page views data
    const topPages = Object.entries(pageViewsData)
      .filter(([key, value]) => key.startsWith("page_views:") && value)
      .map(([key, value]) => ({
        page: key.replace("page_views:", ""),
        visitors: Number(value) || 0,
      }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10);

    // Process referrer data
    const referrers = Object.entries(referrerData)
      .filter(([key, value]) => key.startsWith("referrer:") && value)
      .map(([key, value]) => ({
        referrer: key.replace("referrer:", ""),
        visitors: Number(value) || 0,
      }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10);

    // Process country data
    const countries = Object.entries(countryData)
      .filter(([key, value]) => key.startsWith("country:") && value)
      .map(([key, value]) => ({
        country: key.replace("country:", ""),
        visitors: Number(value) || 0,
      }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10);

    // Process device data
    const devices = Object.entries(deviceData)
      .filter(([key, value]) => key.startsWith("device:") && value)
      .map(([key, value]) => ({
        device: key.replace("device:", "").charAt(0).toUpperCase() + key.replace("device:", "").slice(1),
        visitors: Number(value) || 0,
      }))
      .sort((a, b) => b.visitors - a.visitors);

    // Process browser data
    const browsers = Object.entries(browserData)
      .filter(([key, value]) => key.startsWith("browser:") && value)
      .map(([key, value]) => ({
        browser: key.replace("browser:", "").charAt(0).toUpperCase() + key.replace("browser:", "").slice(1),
        visitors: Number(value) || 0,
      }))
      .sort((a, b) => b.visitors - a.visitors);

    const analyticsData = {
      pageviews: Number(totalPageviews) || 0,
      visitors: Number(totalVisitors) || 0,
      topPages,
      referrers,
      countries,
      devices,
      browsers,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}

// Helper functions to get keys for different data types
async function getPageKeys() {
  try {
    const keys = await kv.keys("page_views:*");
    return keys;
  } catch {
    return [];
  }
}

async function getReferrerKeys() {
  try {
    const keys = await kv.keys("referrer:*");
    return keys;
  } catch {
    return [];
  }
}

async function getCountryKeys() {
  try {
    const keys = await kv.keys("country:*");
    return keys;
  } catch {
    return [];
  }
}

async function getDeviceKeys() {
  try {
    const keys = await kv.keys("device:*");
    return keys;
  } catch {
    return [];
  }
}

async function getBrowserKeys() {
  try {
    const keys = await kv.keys("browser:*");
    return keys;
  } catch {
    return [];
  }
}

// Real implementation would look like this:
/*
export async function GET(request: NextRequest) {
  try {
    const vercelToken = process.env.VERCEL_ANALYTICS_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID;
    
    if (!vercelToken || !projectId) {
      return NextResponse.json(
        { error: "Vercel Analytics not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://vercel.com/api/v1/analytics/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${vercelToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch analytics data");
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error fetching Vercel Analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
*/
