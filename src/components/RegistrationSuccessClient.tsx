"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  CheckCircle,
  Download,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Clock3,
  UserRound,
  Trophy,
  GraduationCap,
  MonitorSmartphone,
  MapPin,
  LaptopMinimal,
  Brain,
} from "lucide-react";
import { enhancedCourseData } from "@/data/enhancedCourseData";
import Image from "next/image";
import { CODEFEST_COMPETITION } from "@/lib/codefest-registration-validation";
import { readOrderId } from "@/lib/order-id-storage";
import { getWhatsappCommunityInfo } from "@/lib/whatsapp-community";

type PaymentStatus = {
  orderId: string;
  amount?: number;
  status: string;
  transactionReference?: string;
  invoiceNumber?: string;
  courseName?: string;
  studentName?: string;
};

const normalizeText = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "");

export default function RegistrationSuccessClient() {
  const params = useSearchParams();
  const [orderId, setOrderId] = useState("");
  const [orderIdResolved, setOrderIdResolved] = useState(false);

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  useEffect(() => {
    const fromQuery = params.get("orderId") || params.get("order_id") || "";
    setOrderId(fromQuery || readOrderId());
    setOrderIdResolved(true);
  }, [params]);

  const recommendedCourses = (() => {
    const courseName = payment?.courseName?.trim();
    if (!courseName) return [];

    const normalize = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const normalizedName = normalize(courseName);

    const purchasedEntry = Object.entries(enhancedCourseData).find(
      ([, course]) => {
        const t = normalize(course.title);
        return (
          t === normalizedName ||
          normalizedName.includes(t) ||
          t.includes(normalizedName)
        );
      },
    );

    if (!purchasedEntry) return [];

    const [purchasedSlug, purchasedCourse] = purchasedEntry;

    return Object.entries(enhancedCourseData)
      .filter(([slug]) => slug !== purchasedSlug)
      .map(([slug, course]) => {
        let score = 0;
        if (course.category === purchasedCourse.category) score += 5;
        if (course.ageRange === purchasedCourse.ageRange) score += 2;
        return { slug, course, score };
      })
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  })();

  useEffect(() => {
    if (!orderIdResolved) return;

    if (!orderId) {
      setLoading(false);
      setError("Missing order ID.");
      return;
    }

    const controller = new AbortController();
    let pollInterval: NodeJS.Timeout;

    const load = async (isPoll = false) => {
      try {
        if (!isPoll) setLoading(true);

        const res = await fetch(`/api/payment/status?orderId=${orderId}`, {
          signal: controller.signal,
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch payment status");
        }

        const currentPayment = data.payment;
        setPayment(currentPayment);

        if (currentPayment.status === "PENDING") {
          fetch("/api/payment/status", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId }),
          }).catch(() => {});
        } else {
          if (pollInterval) clearInterval(pollInterval);
        }
      } catch (err) {
        if ((err as any).name === "AbortError") return;
        if (!isPoll)
          setError(
            err instanceof Error ? err.message : "Failed to load status",
          );
      } finally {
        if (!isPoll) setLoading(false);
      }
    };

    load();

    let pollCount = 0;
    pollInterval = setInterval(() => {
      pollCount++;
      if (pollCount > 10) {
        clearInterval(pollInterval);
        return;
      }
      load(true);
    }, 3000);

    return () => {
      controller.abort();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [orderId, orderIdResolved]);

  useEffect(() => {
    if (!orderIdResolved) return;

    if (!orderId || payment?.status !== "SUCCESS" || payment?.invoiceNumber)
      return;

    const generateInvoice = async () => {
      try {
        const res = await fetch(
          `/api/payment/invoice?orderId=${orderId}&mode=json`,
        );
        const data = await res.json();

        if (res.ok && data.success && data.invoiceNumber) {
          setPayment((prev) =>
            prev ? { ...prev, invoiceNumber: data.invoiceNumber } : prev,
          );
        }
      } catch {
        // silent fail
      }
    };

    generateInvoice();
  }, [orderId, orderIdResolved, payment?.status, payment?.invoiceNumber]);

  const handleEmailReceipt = async () => {
    if (!orderId) return;

    try {
      setEmailStatus(null);

      const res = await fetch(
        `/api/payment/invoice?orderId=${orderId}&email=true&mode=json`,
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send receipt");
      }

      setEmailStatus("Receipt email sent successfully.");
    } catch (err) {
      setEmailStatus(
        err instanceof Error ? err.message : "Failed to send receipt",
      );
    }
  };

  if (loading || !orderIdResolved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-slate-600 text-center">
          Loading registration status...
        </div>
      </div>
    );
  }

  if (error || !orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md text-center">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <h1 className="text-xl sm:text-2xl font-semibold">
            Registration Status Unavailable
          </h1>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            {error || "Missing order ID."}
          </p>

          <div className="flex gap-3 justify-center mt-6">
            <Link href="/all-courses">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                View Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (payment?.status !== "SUCCESS") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md text-center">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
          <h1 className="text-xl sm:text-2xl font-semibold">
            Payment Not Confirmed
          </h1>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            Status: {payment?.status || "PENDING"}
          </p>
        </div>
      </div>
    );
  }

  const downloadUrl = `/api/payment/invoice?orderId=${orderId}`;
  const normalizedCourseName = normalizeText(payment?.courseName || "");
  const isCodefestCompetition =
    normalizedCourseName === normalizeText(CODEFEST_COMPETITION.name);
  const hallTicketNumber = isCodefestCompetition
    ? `CF-${orderId
        .replace(/[^A-Z0-9]/gi, "")
        .toUpperCase()
        .slice(-8)}`
    : null;
  const issuedOn = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());
  const issuedDateLabel = issuedOn.toUpperCase();
  const issuedWeekdayLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
  })
    .format(new Date())
    .toUpperCase();
  const competitionLabel = payment.courseName?.includes("Maze Challenge")
    ? "Maze Challenge"
    : payment.courseName || "CodeFest Challenge";

  const WhatsAppIcon = () => (
    <svg
      className="w-4 h-4 mr-2 shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );

  const whatsappInfo = getWhatsappCommunityInfo(payment?.courseName);
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 sm:py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold">
            Registration Successful
          </h1>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-6">
          <div className="space-y-2 text-sm break-words">
            <p className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 font-medium text-green-700">
              Payment Successful
            </p>
            <p>
              <b>Order:</b> {orderId}
            </p>
            {payment.amount !== undefined && payment.amount !== null && (
              <p className="text-lg font-semibold text-slate-900">
                ₹{payment.amount.toLocaleString("en-IN")}
              </p>
            )}
            <p>
              <b>Txn:</b> {payment.transactionReference}
            </p>
            <p>
              <b>Invoice:</b> {payment.invoiceNumber || "Generating..."}
            </p>
          </div>
        </div>
        {/* Community card — fixed w-86 (invalid class) replaced with responsive width */}
        {whatsappInfo && (
          <Link
            href={whatsappInfo.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-6 w-full max-w-md mx-auto sm:mx-0"
          >
            <div className="overflow-hidden w-full rounded-2xl border border-green-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="relative h-40 sm:h-48 w-full overflow-hidden">
                <Image
                  src={whatsappInfo.imageSrc}
                  alt={whatsappInfo.imageAlt}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <div className="absolute left-3 top-3 sm:left-4 sm:top-4 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-green-700 shadow-sm">
                  <WhatsAppIcon />
                  WhatsApp Community
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-white">
                  <p className="text-base sm:text-lg font-semibold">
                    {whatsappInfo.title}
                  </p>
                  <p className="text-xs sm:text-sm text-white/90">
                    Stay connected for updates, resources, and support.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 p-3 sm:p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    Join {whatsappInfo.category}
                  </p>
                  <p className="text-xs text-slate-500">
                    Get workshop news and learning updates
                  </p>
                </div>
                <Button className="gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white shrink-0">
                  <WhatsAppIcon />
                  Join Now
                </Button>
              </div>
            </div>
          </Link>
        )}
        {isCodefestCompetition && hallTicketNumber && (
          <section className="bg-[#f3f5f9] px-3 py-6 antialiased sm:px-6 sm:py-10">
            <div
              className="
        ticket-card
        relative
        isolate
        mx-auto
        w-full
        max-w-[980px]
        overflow-hidden
        rounded-[24px]
        sm:rounded-[36px]
        border
        border-[#ececec]
        bg-[linear-gradient(to_bottom_right,#ffffff,#fcfcfd)]
        ring-1
        ring-black/[0.03]
        shadow-[0_30px_100px_rgba(15,23,42,0.14)]
        transition-all
        duration-500
        ease-out
        before:absolute
        before:left-0
        before:top-1/2
        before:h-14
        before:w-14
        before:-translate-x-1/2
        before:-translate-y-1/2
        before:rounded-full
        before:bg-[#f3f5f9]
        after:absolute
        after:right-0
        after:top-1/2
        after:h-14
        after:w-14
        after:translate-x-1/2
        after:-translate-y-1/2
        after:rounded-full
        after:bg-[#f3f5f9]
      "
            >
              <div className="pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-multiply">
                <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,#000_1px,transparent_1px)] bg-[length:18px_18px]" />
              </div>

              {/* HEADER */}
              <div className="relative flex flex-col gap-5 border-b border-[#eeeeee] px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8 sm:py-8">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-2xl bg-[#C73E1D]/20 blur-xl" />
                    <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D84A28] to-[#B92D10] text-[18px] sm:text-[22px] font-black text-white shadow-lg">
                      {"</>"}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h1 className="text-[22px] sm:text-[34px] font-black leading-none tracking-tight text-[#0f172a]">
                      CODE <span className="text-[#C73E1D]">FEST 1.0</span>
                    </h1>
                    <p className="mt-1 text-[13px] sm:text-[14px] font-medium text-[#475569]">
                      Code. Compete. Create.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-[#e5e7eb] sm:border-l sm:pl-6">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff2ef] text-[#C73E1D]">
                    <CalendarDays
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      strokeWidth={1.8}
                    />
                  </div>
                  <div>
                    <div className="text-[14px] sm:text-[16px] font-bold text-[#0f172a]">
                      {issuedDateLabel}
                    </div>
                    <div className="text-[11px] sm:text-[13px] font-medium uppercase tracking-[0.15em] text-[#94a3b8]">
                      {issuedWeekdayLabel}
                    </div>
                  </div>
                </div>
              </div>

              {/* HERO */}
              <div className="px-4 pt-5 sm:px-8 sm:pt-8">
                <div className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] border-2 border-[#f5c9c1] bg-gradient-to-br from-[#fff7f5] via-[#fffafa] to-[#fff1ee] px-4 py-8 text-center sm:px-10 sm:py-14">
                  <div className="absolute -top-20 left-0 h-72 w-72 rounded-full bg-[#C73E1D]/10 blur-3xl" />
                  <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-orange-300/10 blur-3xl" />
                  <div className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-[#f3f5f9]" />
                  <div className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-[#f3f5f9]" />
                  <div className="absolute inset-0 opacity-[0.03]">
                    <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,#C73E1D_1px,transparent_1px)] bg-[length:22px_22px]" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <div className="h-px w-8 sm:w-10 bg-[#C73E1D]/40" />
                      <p className="text-[11px] sm:text-[12px] font-bold tracking-[0.35em] sm:tracking-[0.45em] text-[#C73E1D]">
                        HALL TICKET
                      </p>
                      <div className="h-px w-8 sm:w-10 bg-[#C73E1D]/40" />
                    </div>

                    <h2 className="mt-5 sm:mt-6 break-all font-['Space_Grotesk',sans-serif] text-[26px] font-black leading-none tracking-[0.04em] text-[#020617] drop-shadow-[0_6px_18px_rgba(2,6,23,0.18)] sm:text-[64px] sm:tracking-[0.12em]">
                      {hallTicketNumber}
                    </h2>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] font-bold tracking-[0.14em] sm:tracking-[0.18em] text-[#94a3b8]">
                      <span>VERIFIED PASS</span>
                      <span>•</span>
                      <span>EVENT ACCESS</span>
                      <span>•</span>
                      <span>ID REQUIRED</span>
                    </div>

                    <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#D84A28] to-[#B92D10] px-4 py-2.5 sm:px-5 sm:py-3 text-[11px] sm:text-[12px] font-bold tracking-[0.08em] text-white shadow-lg">
                      <ShieldCheck
                        className="h-4 w-4 shrink-0"
                        strokeWidth={1.8}
                      />
                      YOUR OFFICIAL ENTRY PASS
                    </div>
                  </div>
                </div>
              </div>

              {/* PERFORATION */}
              <div className="relative my-6 sm:my-8">
                <div className="border-t border-dashed border-[#d6d6d6]" />
                <div className="absolute -left-5 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-[#f3f5f9]" />
                <div className="absolute -right-5 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-[#f3f5f9]" />
              </div>
            </div>
          </section>
        )}

        {/* Actions — stack on mobile, row on sm+ */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6">
          <Link href="/codefest" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Registration
            </Button>
          </Link>

          <Link href={downloadUrl} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-red-700 hover:bg-red-800 text-white">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </Link>

          {/* <Button onClick={handleEmailReceipt} disabled={emailSending}>
            <Mail className="w-4 h-4 mr-2" />
            {emailSending ? "Sending..." : "Email"}
          </Button> */}
        </div>

        {emailStatus && (
          <p className="text-center mt-4 text-sm">{emailStatus}</p>
        )}

        {/* Recommended Courses */}
        {recommendedCourses.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-semibold text-slate-700">
                You Might Also Like
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedCourses.map(({ slug, course }) => (
                <Link key={slug} href={`/all-courses/${slug}`}>
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden group h-full flex flex-col">
                    <div className="relative overflow-hidden">
                      <Image
                        width={500}
                        height={300}
                        src={course.imagePath}
                        alt={course.imageAlt}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <span className="inline-block text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-2 w-fit">
                        {course.category}
                      </span>
                      <h3 className="font-semibold text-sm text-slate-800 leading-snug">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 flex-1">
                        {course.subtitle}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                        <p className="text-sm font-bold text-slate-800">
                          ₹{course.price?.toLocaleString("en-IN") || "N/A"}
                        </p>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          Ages {course.ageRange}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
