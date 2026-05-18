"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, School, TrendingUp } from "lucide-react";
type RegistrationEntry = {
  id: string;
  name: string;
  state: string;
  school: string;
  registeredAt: string;
};
interface CTAProps {
  totalCount?: number;
  onRegister?: () => void;
}

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
}: LeaderboardProps) {
  const avatarColors = [
    "from-blue-400 to-blue-500",
    "from-indigo-400 to-indigo-500",
    "from-cyan-400 to-cyan-500",
    "from-sky-400 to-sky-500",
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Live tag */}
      <div className="flex items-center gap-2 px-1">
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>

          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-600 sm:text-xs">
            Live Preview
          </span>
        </span>
      </div>

      {/* Main Card */}
      <Card className="rounded-2xl border-gray-200 bg-white shadow-sm sm:rounded-3xl">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="min-w-0">
            <CardTitle className="text-xl font-black text-[#082c78] sm:text-2xl">
              LIVE LEADERBOARD
            </CardTitle>

            <p className="mt-1 max-w-full text-[12px] leading-snug text-gray-500 sm:max-w-[260px] sm:text-[13px]">
              Track registrations from across India in real time.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stat Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            {STAT_CARDS.map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className={`
                  flex items-center gap-2 rounded-2xl px-3 py-3
                  sm:gap-3 sm:px-4
                  ${color}
                `}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80 sm:h-5 sm:w-5" />

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70 sm:text-[11px]">
                    {label}
                  </p>

                  <p className="text-base font-black leading-tight sm:text-lg">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gray-100" />

            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 sm:text-[10px]">
              Latest Registrations
            </span>

            <div className="h-px flex-1 bg-gray-100" />
          </div>

          {/* Entries */}
          {loading ? (
            <div className="rounded-2xl border border-dashed border-[#082c78]/20 bg-[#f8fafc] p-5 text-sm font-medium text-gray-500 sm:p-6">
              Loading live registrations...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700 sm:p-6">
              {error}
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#082c78]/20 bg-[#f8fafc] p-5 text-sm font-medium text-gray-500 sm:p-6">
              No registrations yet. Be the first!
            </div>
          ) : (
            <div
              className="
                max-h-[260px] space-y-2 overflow-y-auto pr-1

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
                  className="
                    flex items-center justify-between gap-3
                    rounded-xl border border-gray-100
                    bg-[#fafbff]
                    px-3 py-3
                    transition-all
                    hover:border-[#082c78]/20
                    hover:bg-[#f0f4ff]
                    sm:px-3.5 sm:py-2.5
                  "
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="
                        flex h-8 w-8 shrink-0 items-center justify-center
                        rounded-full bg-[#082c78]
                        text-[10px] font-black text-white sm:text-[11px]
                      "
                    >
                      #{i + 1}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold leading-tight text-[#082c78]">
                        {user.name}
                      </h3>

                      <p className="truncate text-[11px] leading-tight text-gray-400">
                        {user.school}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-semibold text-gray-500 sm:text-[11px]">
                      {user.state}
                    </p>

                    <p className="text-[9px] text-gray-400 sm:text-[10px]">
                      {user.registeredAt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
