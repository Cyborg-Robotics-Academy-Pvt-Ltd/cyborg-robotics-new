import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ClipboardList, HelpCircle, RefreshCw } from "lucide-react";

const registrationOptions = [
  {
    title: "Registration",
    href: "/registration/new",
    icon: ClipboardList,
  },
  {
    title: "Renewal",
    href: "/registration/renewal",
    icon: RefreshCw,
  },
  {
    title: "Other",
    href: "/registration/other",
    icon: HelpCircle,
  },
];

export default function RegistrationOptionsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-100 px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col">
        <section className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-3xl rounded-2xl border border-red-100 bg-white p-6 shadow-xl sm:p-10">
            <div className="mb-8 flex flex-col items-center text-center">
              <Image
                src="/assets/Cyborg-logo.png"
                alt="Cyborg Robotics Logo"
                width={120}
                height={120}
                className="mb-4"
                priority
              />
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Select Registration Type
              </h1>
              <p className="mt-2 max-w-xl text-sm text-gray-600 sm:text-base">
                Choose the option that matches your request.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {registrationOptions.map((option) => {
                const Icon = option.icon;

                return (
                  <Link
                    key={option.title}
                    href={option.href}
                    className="group flex min-h-36 flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50/50 p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-red-300 hover:bg-white hover:shadow-lg"
                  >
                    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-800 text-white transition-colors group-hover:bg-red-900">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {option.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
