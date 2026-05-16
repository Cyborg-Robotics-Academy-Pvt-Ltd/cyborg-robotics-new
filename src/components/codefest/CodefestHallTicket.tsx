"use client";

import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  Code2,
  ShieldCheck,
  Ticket,
} from "lucide-react";

type CodefestHallTicketProps = {
  hallTicketNumber: string;
  issuedDateLabel: string;
  issuedWeekdayLabel: string;
  participantName: string;
  competitionLabel: string;
};

export default function CodefestHallTicket({
  hallTicketNumber,
  issuedDateLabel,
  issuedWeekdayLabel,
  participantName,
  competitionLabel,
}: CodefestHallTicketProps) {
  const hallTicketDetails = [
    {
      label: "PARTICIPANT",
      value: participantName,
      highlight: false,
      icon: <BadgeCheck className="h-7 w-7" strokeWidth={1.8} />,
    },
    {
      label: "COMPETITION",
      value: competitionLabel,
      highlight: false,
      icon: <Ticket className="h-7 w-7" strokeWidth={1.8} />,
    },
    {
      label: "GRADE",
      value: "To be shared",
      highlight: true,
      icon: <Code2 className="h-7 w-7" strokeWidth={1.8} />,
    },
    {
      label: "PLATFORM",
      value: "Scratch / PictoBlox",
      highlight: false,
      icon: <Code2 className="h-7 w-7" strokeWidth={1.8} />,
    },
    {
      label: "VENUE",
      value: "Shared on registered email",
      highlight: false,
      icon: <CalendarDays className="h-7 w-7" strokeWidth={1.8} />,
    },
    {
      label: "DEVICE",
      value: "Laptop / Desktop",
      highlight: false,
      icon: <Code2 className="h-7 w-7" strokeWidth={1.8} />,
    },
    {
      label: "EXPERIENCE",
      value: "All skill levels",
      highlight: false,
      icon: <BadgeCheck className="h-7 w-7" strokeWidth={1.8} />,
    },
    {
      label: "REPORTING TIME",
      value: "Shared on registered email",
      highlight: false,
      icon: <Clock3 className="h-7 w-7" strokeWidth={1.8} />,
    },
  ];

  return (
    <section className="bg-[#f3f5f9] px-4 py-6 antialiased sm:px-6 sm:py-10">
      <div className="relative isolate mx-auto w-full max-w-[1020px] overflow-hidden rounded-[36px] border border-[#ececec] bg-[linear-gradient(to_bottom_right,#ffffff,#fcfcfd)] ring-1 ring-black/[0.03] shadow-[0_30px_100px_rgba(15,23,42,0.14)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-multiply">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,#000_1px,transparent_1px)] bg-[length:18px_18px]" />
        </div>

        <div className="relative flex flex-col gap-6 border-b border-[#ececec] bg-white px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-8">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div
                className="flex h-[78px] w-[78px] items-center justify-center bg-[#d71920] text-white shadow-[0_10px_30px_rgba(215,25,32,0.25)]"
                style={{
                  clipPath:
                    "polygon(25% 6%,75% 6%,100% 50%,75% 94%,25% 94%,0% 50%)",
                }}
              >
                <span className="text-[38px] font-black tracking-[-0.08em]">
                  {"</>"}
                </span>
              </div>
            </div>

            <div>
              <h1 className="flex items-baseline gap-2 text-[34px] font-black leading-none tracking-[-0.03em] text-[#0b132b] sm:text-[42px]">
                <span>CODE</span>
                <span className="text-[#d71920]">FEST 1.0</span>
              </h1>
              <p className="mt-2 text-[18px] font-medium tracking-[0.01em] text-[#667085]">
                Code. Compete. Create.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 border-[#e5e7eb] sm:border-l sm:pl-10">
            <div className="flex h-[68px] w-[68px] items-center justify-center rounded-2xl text-[#d71920]">
              <CalendarDays className="h-10 w-10" strokeWidth={2} />
            </div>

            <div>
              <div className="text-[34px] font-black leading-none tracking-[-0.03em] text-[#0b132b]">
                {issuedDateLabel}
              </div>
              <div className="mt-2 text-[18px] font-medium uppercase tracking-[0.08em] text-[#667085]">
                {issuedWeekdayLabel}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pt-5 sm:px-8 sm:pt-8">
          <div className="relative overflow-hidden rounded-[30px] border border-[#efb3b3] bg-[linear-gradient(135deg,#fff7f7_0%,#fffdfd_45%,#fff3f3_100%)] px-5 py-10 text-center sm:px-10 sm:py-14">
            <div className="absolute inset-0 opacity-[0.06]">
              <div className="absolute left-[-10%] top-0 h-full w-[120%] bg-[radial-gradient(circle_at_left,#d71920_1px,transparent_1px)] bg-[length:22px_22px]" />
            </div>

            <div className="absolute -left-5 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-[#f3f5f9]" />
            <div className="absolute -right-5 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-[#f3f5f9]" />

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-16 bg-[#d71920]/50" />
                <div className="flex items-center gap-3">
                  <span className="text-[#d71920]">★</span>
                  <p className="text-[14px] font-black tracking-[0.38em] text-[#d71920]">
                    HALL TICKET
                  </p>
                  <span className="text-[#d71920]">★</span>
                </div>
                <div className="h-px w-16 bg-[#d71920]/50" />
              </div>

              <h2 className="mt-8 break-all font-['Space_Grotesk',sans-serif] text-[52px] font-black leading-none tracking-[0.04em] text-[#06122d] drop-shadow-[0_6px_18px_rgba(2,6,23,0.12)] sm:text-[84px]">
                {hallTicketNumber}
              </h2>

              <div className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-[#d71920] px-6 py-4 text-[13px] font-bold tracking-[0.08em] text-white shadow-[0_10px_30px_rgba(215,25,32,0.28)]">
                <ShieldCheck className="h-5 w-5" strokeWidth={2} />
                YOUR OFFICIAL ENTRY PASS
              </div>
            </div>
          </div>
        </div>

        <div className="relative my-8">
          <div className="border-t border-dashed border-[#d6d6d6]" />
          <div className="absolute -left-5 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-[#f3f5f9]" />
          <div className="absolute -right-5 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-[#f3f5f9]" />
        </div>

        <div className="grid grid-cols-1 gap-4 px-5 pb-2 sm:grid-cols-2 sm:gap-5 sm:px-8">
          {hallTicketDetails.map((item) => (
            <div
              key={item.label}
              className="relative overflow-hidden rounded-[24px] border border-[#edf0f4] bg-gradient-to-br from-white to-[#fafafa] p-5 shadow-[0_10px_25px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)]"
            >
              <div className="absolute left-0 top-6 h-10 w-[4px] rounded-r-full bg-[#d71920]" />

              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff1f1] text-[#d71920]">
                  {item.icon}
                </div>

                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#94a3b8]">
                    {item.label}
                  </div>
                  <div
                    className={`mt-2 break-words leading-tight ${
                      item.highlight
                        ? "text-[28px] font-black text-[#d71920]"
                        : "text-[22px] font-bold text-[#0f172a]"
                    }`}
                  >
                    {item.value}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 pb-5 sm:px-8 sm:pb-8">
          <div className="grid grid-cols-1 gap-4 rounded-[24px] bg-[#d71920] px-5 py-5 text-white shadow-[0_15px_40px_rgba(215,25,32,0.25)] sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Carry valid school ID",
              "Hall ticket is mandatory",
              "Reach venue 30 mins early",
              "Non-transferable pass",
            ].map((item, index) => (
              <div
                key={item}
                className={`flex items-center gap-3 ${
                  index !== 3 ? "lg:border-r lg:border-white/20 lg:pr-4" : ""
                }`}
              >
                <ShieldCheck
                  className="h-[18px] w-[18px] shrink-0"
                  strokeWidth={1.8}
                />
                <p className="text-[13px] font-semibold leading-6">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 text-center text-[13px] font-semibold text-[#94a3b8]">
            Organized by{" "}
            <span className="font-bold text-[#d71920]">CodeFest Team</span>
          </div>
        </div>
      </div>
    </section>
  );
}
