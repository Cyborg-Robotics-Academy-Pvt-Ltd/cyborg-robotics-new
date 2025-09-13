import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || new Date().toISOString().substring(0, 7); // Default to current month

    // Fetch monthly data from Vercel KV storage
    const [
      monthlyPageviews,
      monthlyVisitors,
      pageViewsData,
      referrerData,
      countryData,
      deviceData,
      browserData,
      dailyData,
    ] = await Promise.all([
      kv.get(`monthly_pageviews:${month}`) || 0,
      kv.scard(`monthly_visitors:${month}`) || 0,
      kv.mget(await getMonthlyPageKeys(month)),
      kv.mget(await getMonthlyReferrerKeys(month)),
      kv.mget(await getMonthlyCountryKeys(month)),
      kv.mget(await getMonthlyDeviceKeys(month)),
      kv.mget(await getMonthlyBrowserKeys(month)),
      getDailyDataForMonth(month),
    ]);

    // Process page views data
    const topPages = Object.entries(pageViewsData)
      .filter(([key, value]) => key.startsWith(`monthly_page_views:${month}:`) && value)
      .map(([key, value]) => ({
        page: key.replace(`monthly_page_views:${month}:`, ""),
        visitors: Number(value) || 0,
      }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10);

    // Process referrer data
    const referrers = Object.entries(referrerData)
      .filter(([key, value]) => key.startsWith(`monthly_referrer:${month}:`) && value)
      .map(([key, value]) => ({
        referrer: key.replace(`monthly_referrer:${month}:`, ""),
        visitors: Number(value) || 0,
      }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10);

    // Process country data
    const countries = Object.entries(countryData)
      .filter(([key, value]) => key.startsWith(`monthly_country:${month}:`) && value)
      .map(([key, value]) => ({
        country: key.replace(`monthly_country:${month}:`, ""),
        visitors: Number(value) || 0,
      }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10);

    // Process device data
    const devices = Object.entries(deviceData)
      .filter(([key, value]) => key.startsWith(`monthly_device:${month}:`) && value)
      .map(([key, value]) => ({
        device: key.replace(`monthly_device:${month}:`, "").charAt(0).toUpperCase() + 
                key.replace(`monthly_device:${month}:`, "").slice(1),
        visitors: Number(value) || 0,
      }))
      .sort((a, b) => b.visitors - a.visitors);

    // Process browser data
    const browsers = Object.entries(browserData)
      .filter(([key, value]) => key.startsWith(`monthly_browser:${month}:`) && value)
      .map(([key, value]) => ({
        browser: key.replace(`monthly_browser:${month}:`, "").charAt(0).toUpperCase() + 
                 key.replace(`monthly_browser:${month}:`, "").slice(1),
        visitors: Number(value) || 0,
      }))
      .sort((a, b) => b.visitors - a.visitors);

    // Calculate growth metrics
    const previousMonth = getPreviousMonth(month);
    const [previousPageviews, previousVisitors] = await Promise.all([
      kv.get(`monthly_pageviews:${previousMonth}`) || 0,
      kv.scard(`monthly_visitors:${previousMonth}`) || 0,
    ]);

    const pageviewGrowth = Number(previousPageviews) > 0 
      ? ((Number(monthlyPageviews) - Number(previousPageviews)) / Number(previousPageviews)) * 100
      : 0;

    const visitorGrowth = Number(previousVisitors) > 0
      ? ((Number(monthlyVisitors) - Number(previousVisitors)) / Number(previousVisitors)) * 100
      : 0;

    const analyticsData = {
      month,
      pageviews: Number(monthlyPageviews) || 0,
      visitors: Number(monthlyVisitors) || 0,
      pageviewGrowth: Math.round(pageviewGrowth * 100) / 100,
      visitorGrowth: Math.round(visitorGrowth * 100) / 100,
      topPages,
      referrers,
      countries,
      devices,
      browsers,
      dailyData,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error("Error fetching monthly analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly analytics data" },
      { status: 500 }
    );
  }
}

// Helper functions to get monthly keys
async function getMonthlyPageKeys(month: string) {
  try {
    const keys = await kv.keys(`monthly_page_views:${month}:*`);
    return keys;
  } catch {
    return [];
  }
}

async function getMonthlyReferrerKeys(month: string) {
  try {
    const keys = await kv.keys(`monthly_referrer:${month}:*`);
    return keys;
  } catch {
    return [];
  }
}

async function getMonthlyCountryKeys(month: string) {
  try {
    const keys = await kv.keys(`monthly_country:${month}:*`);
    return keys;
  } catch {
    return [];
  }
}

async function getMonthlyDeviceKeys(month: string) {
  try {
    const keys = await kv.keys(`monthly_device:${month}:*`);
    return keys;
  } catch {
    return [];
  }
}

async function getMonthlyBrowserKeys(month: string) {
  try {
    const keys = await kv.keys(`monthly_browser:${month}:*`);
    return keys;
  } catch {
    return [];
  }
}

async function getDailyDataForMonth(month: string) {
  try {
    const dailyData = [];
    const daysInMonth = new Date(month + "-01").getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${month}-${String(day).padStart(2, "0")}`;
      const [pageviews, visitors] = await Promise.all([
        kv.get(`daily_pageviews:${date}`) || 0,
        kv.scard(`daily_visitors:${date}`) || 0,
      ]);
      
      dailyData.push({
        date,
        pageviews: Number(pageviews),
        visitors: Number(visitors),
      });
    }
    
    return dailyData;
  } catch {
    return [];
  }
}

function getPreviousMonth(month: string): string {
  const [year, monthNum] = month.split("-");
  const prevMonth = new Date(parseInt(year), parseInt(monthNum) - 2, 1);
  return `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
}
