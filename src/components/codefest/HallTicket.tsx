import React from "react";
import {
  CalendarDays,
  ShieldCheck,
  User,
  Trophy,
  GraduationCap,
  Laptop,
  MapPin,
  Monitor,
  BarChart3,
  Clock3,
  Ticket,
  BadgeCheck,
} from "lucide-react";

const hallTicketDetails = [
  {
    label: "Participant",
    value: "Shrikant Gaikwad",
    icon: <User className="h-5 w-5" strokeWidth={2} />,
  },
  {
    label: "Competition",
    value: "Maze Challenge",
    icon: <Trophy className="h-5 w-5" strokeWidth={2} />,
  },
  {
    label: "Grade",
    value: "9",
    icon: <GraduationCap className="h-5 w-5" strokeWidth={2} />,
  },
  {
    label: "Platform",
    value: "Scratch",
    icon: <Monitor className="h-5 w-5" strokeWidth={2} />,
  },
  {
    label: "Venue",
    value: "XYZ, Pune – 412105",
    icon: <MapPin className="h-5 w-5" strokeWidth={2} />,
  },
  {
    label: "Device",
    value: "Laptop",
    icon: <Laptop className="h-5 w-5" strokeWidth={2} />,
  },
  {
    label: "Experience",
    value: "Intermediate",
    icon: <BarChart3 className="h-5 w-5" strokeWidth={2} />,
  },
  {
    label: "Reporting Time",
    value: "09:00 AM",
    icon: <Clock3 className="h-5 w-5" strokeWidth={2} />,
  },
];

const HallTicket = () => {
  return (
    <div className="min-h-screen bg-gray-100 px-3 py-3 sm:px-5">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-white shadow-md">
              <span className="text-2xl font-black">{"</>"}</span>
            </div>

            <div>
              <h1 className="flex items-center gap-2 text-[24px] sm:text-[30px] font-black tracking-tight text-slate-900">
                <span>CODE</span>
                <span className="text-red-600">FEST 1.0</span>
              </h1>

              <p className="text-[13px] font-medium text-slate-500">
                Code. Compete. Create.
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4 border-gray-200 sm:border-l sm:pl-8">
            <div className="flex h-12 w-12 items-center justify-center text-red-600">
              <CalendarDays className="h-7 w-7" strokeWidth={2} />
            </div>

            <div>
              <div className="text-[22px] sm:text-[26px] font-black text-slate-900">
                5 MAY 2026
              </div>

              <div className="text-[12px] font-medium uppercase tracking-wider text-slate-500">
                Tuesday
              </div>
            </div>
          </div>
        </div>

        {/* ================= HERO ================= */}
        <div className="px-4 pt-4 sm:px-8 sm:pt-5">
          <div className="relative overflow-hidden rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 via-white to-red-50 px-5 py-7 text-center sm:px-8 sm:py-9">
            <div className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-gray-100" />
            <div className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-gray-100" />

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-12 bg-red-300" />

                <div className="flex items-center gap-2">
                  <span className="text-red-600">★</span>

                  <p className="text-[11px] font-black tracking-[0.2em] text-red-600">
                    HALL TICKET
                  </p>

                  <span className="text-red-600">★</span>
                </div>

                <div className="h-px w-12 bg-red-300" />
              </div>

              <h2 className="mt-4 break-all text-[34px] sm:text-[58px] font-black tracking-wide text-slate-950">
                CF-838F2CA3
              </h2>

              <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-[11px] font-bold tracking-wider text-white shadow-md">
                <ShieldCheck className="h-4 w-4" strokeWidth={2} />
                YOUR OFFICIAL ENTRY PASS
              </div>
            </div>
          </div>
        </div>

        {/* ================= PERFORATION ================= */}
        <div className="relative my-5">
          <div className="border-t border-dashed border-gray-300" />

          <div className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-gray-100" />
          <div className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-gray-100" />
        </div>

        {/* ================= DETAILS ================= */}
        <div className="grid grid-cols-1 gap-3 px-5 sm:grid-cols-2 sm:px-8">
          {hallTicketDetails.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                  {item.icon}
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {item.label}
                  </div>

                  <div className="mt-0.5 text-[17px] sm:text-[20px] font-bold text-slate-900 leading-tight">
                    {item.value}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= FOOTER ================= */}
        <div className="px-5 py-5 sm:px-8">
          <div className="grid grid-cols-1 gap-3 rounded-3xl bg-red-600 px-5 py-4 text-white sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                text: "Carry valid school ID",
                icon: <BadgeCheck className="h-4 w-4" />,
              },
              {
                text: "Hall ticket is mandatory",
                icon: <Ticket className="h-4 w-4" />,
              },
              {
                text: "Reach venue 30 mins early",
                icon: <Clock3 className="h-4 w-4" />,
              },
              {
                text: "Non-transferable pass",
                icon: <ShieldCheck className="h-4 w-4" />,
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 ${
                  index !== 3 ? "lg:border-r lg:border-white/20 lg:pr-3" : ""
                }`}
              >
                {item.icon}

                <p className="text-[12px] font-semibold leading-4">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 text-center text-[12px] font-semibold text-slate-400">
            Organized by{" "}
            <span className="font-bold text-red-600">CodeFest Team</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallTicket;
