import type { ReactElement } from "react";
import { MessageCircle, Phone } from "lucide-react";

const TRIAL_PHONE = process.env.NEXT_PUBLIC_TRIAL_PHONE ?? "+919999999999";
const WHATSAPP_NUMBER = TRIAL_PHONE.replace(/\D/g, "");

interface Step {
  title: string;
  description: string;
}

const STEPS: readonly Step[] = [
  {
    title: "Hands-on robotics session",
    description: "Your child builds and programs a real robot.",
  },
  {
    title: "Child assessment",
    description: "We understand their interests, pace and strengths.",
  },
  {
    title: "Parent counselling",
    description: "You get a clear, honest learning path.",
  },
] as const;

export default function TrialCTA(): ReactElement {
  return (
    <section
      id="trial"
      aria-labelledby="trial-heading"
      className="scroll-mt-28 bg-[#d9431f] py-20 text-white md:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2 md:gap-16">
        {/* Left: message + CTA */}
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-orange-100">
            Free trial session
          </p>

          <h2
            id="trial-heading"
            className="mt-4 text-balance text-4xl font-black leading-tight tracking-tight md:text-5xl"
          >
            Experience Cyborg before you decide.
          </h2>

          <p className="mt-5 max-w-md text-pretty text-lg text-white/90">
            See how your child learns, and find the right path with confidence.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={`tel:${TRIAL_PHONE}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-4 text-base font-black text-[#b93820] transition hover:bg-orange-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              Book my free trial
            </a>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/60 px-7 py-4 text-base font-bold transition hover:bg-white/10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              WhatsApp us
            </a>
          </div>

          <p className="mt-5 text-sm text-white/90">
            Online &amp; Offline · Ages 4–18 · No prior experience needed
          </p>
        </div>

        {/* Right: what you get (divided list, no cards) */}
        <ol className="divide-y divide-white/25 border-y border-white/25">
          {STEPS.map(({ title, description }, i) => (
            <li key={title} className="flex items-start gap-5 py-6">
              <span
                aria-hidden="true"
                className="text-4xl font-black leading-none text-white/40"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-1 text-white/85">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
