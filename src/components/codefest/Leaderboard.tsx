"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, School, TrendingUp } from "lucide-react";

type RegistrationEntry = {
  id: string;
  name: string;
  state: string;
  school: string;
  registeredAt: string;
};

type LeaderboardProps = {
  entries?: RegistrationEntry[];
  loading?: boolean;
  error?: string | null;
  totalCount?: number;
  stateCount?: number;
  schoolCount?: number;
};

const DEMO_ENTRIES: RegistrationEntry[] = [
  {
    id: "1",
    name: "Aarav Mehta",
    state: "Maharashtra",
    school: "DPS Pune",
    registeredAt: "2m ago",
  },
  {
    id: "2",
    name: "Diya Sharma",
    state: "Delhi",
    school: "Kendriya Vidyalaya",
    registeredAt: "5m ago",
  },
  {
    id: "3",
    name: "Rohan Verma",
    state: "Karnataka",
    school: "National Public School",
    registeredAt: "9m ago",
  },
  {
    id: "4",
    name: "Ananya Patel",
    state: "Gujarat",
    school: "Zydus School",
    registeredAt: "14m ago",
  },
  {
    id: "5",
    name: "Kiran Nair",
    state: "Kerala",
    school: "Bhavan's Vidyalaya",
    registeredAt: "21m ago",
  },
];

const STAT_CARDS = [
  {
    icon: Users,
    label: "Registered",
    value: "1,000+",
    color: "bg-blue-50 text-[#082c78]",
  },
  {
    icon: MapPin,
    label: "States",
    value: "24",
    color: "bg-yellow-50 text-yellow-700",
  },
  {
    icon: School,
    label: "Schools",
    value: "180+",
    color: "bg-green-50 text-green-700",
  },
  {
    icon: TrendingUp,
    label: "This Week",
    value: "+320",
    color: "bg-red-50 text-red-700",
  },
];

export default function Leaderboard({
  entries = DEMO_ENTRIES,
  loading = false,
  error = null,
  totalCount = 1000,
}: LeaderboardProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Small tag above */}
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-green-600">
            Live Preview
          </span>
        </span>
      </div>

      {/* Main Card */}
      <Card className="rounded-3xl border-gray-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-2xl font-black text-[#082c78]">
              LIVE LEADERBOARD
            </CardTitle>
            <p className="mt-1 text-[13px] text-gray-500 leading-snug max-w-[260px]">
              Track registrations from across India in real time.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stat Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {STAT_CARDS.map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${color}`}
              >
                <Icon className="h-5 w-5 shrink-0 opacity-80" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                    {label}
                  </p>
                  <p className="text-lg font-black leading-tight">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Latest Registrations
            </span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          {/* Entries */}
          {loading ? (
            <div className="rounded-2xl border border-dashed border-[#082c78]/20 bg-[#f8fafc] p-6 text-sm font-medium text-gray-500">
              Loading live registrations...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#082c78]/20 bg-[#f8fafc] p-6 text-sm font-medium text-gray-500">
              No registrations yet. Be the first!
            </div>
          ) : (
            <div
              className="
                space-y-2 overflow-y-auto max-h-[260px] pr-1
                [&::-webkit-scrollbar]:w-[5px]
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-track]:bg-[#E8EDF7]
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-[#082c78]/40
                hover:[&::-webkit-scrollbar-thumb]:bg-[#082c78]/70
                [scrollbar-width:thin]
                [scrollbar-color:#082c7866_#E8EDF7]
              "
            >
              {entries.map((user, i) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#fafbff] px-3.5 py-2.5 transition-all hover:border-[#082c78]/20 hover:bg-[#f0f4ff]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#082c78] text-[11px] font-black text-white shrink-0">
                      #{i + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#082c78] leading-tight">
                        {user.name}
                      </h3>
                      <p className="text-[11px] text-gray-400 leading-tight">
                        {user.school}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-semibold text-gray-500">
                      {user.state}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {user.registeredAt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* FOMO Section below */}
      <div className="rounded-3xl border border-[#082c78]/10 bg-gradient-to-br from-[#082c78] to-[#1A4DB8] px-6 py-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-200">
              Don't miss out
            </p>
            <h3 className="mt-1 text-[18px] font-black leading-tight">
              JOIN {totalCount.toLocaleString()}+ STUDENTS
              <br />
              ACROSS INDIA
            </h3>
            <p className="mt-2 text-[13px] leading-snug text-blue-100 max-w-[220px]">
              Students from multiple schools and cities are already
              participating. Register now and secure your spot before
              registrations close.
            </p>
          </div>

          {/* Avatar stack */}
          <div className="shrink-0 flex flex-col items-center gap-1.5 pt-1">
            <div className="flex -space-x-2">
              {["AM", "DS", "RV", "AP"].map((initials, i) => (
                <div
                  key={i}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#1A4DB8] bg-blue-300 text-[10px] font-black text-[#082c78]"
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-[10px] font-semibold text-blue-200">
              +996 joined
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
