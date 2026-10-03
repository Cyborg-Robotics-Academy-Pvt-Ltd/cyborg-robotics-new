"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";

interface Faq {
  readonly question: string;
  readonly answer: string;
}

const CONTENT = {
  kicker: "Parents usually ask",
  title: "Frequently Asked Questions",
  highlight: "Questions",
} as const;

const FAQS: readonly Faq[] = [
  {
    question: "Can a complete beginner join?",
    answer:
      "Yes. Programs are structured by age and learning level, and the trial helps identify the right starting point.",
  },
  {
    question: "What age can my child start?",
    answer:
      "Cyborg offers learning pathways from approximately age 4 through advanced teenage programs.",
  },
  {
    question: "Which course is suitable for my child?",
    answer:
      "You don't need to decide before the trial. Our team can assess the child's level and recommend a suitable pathway.",
  },
  {
    question: "Do you offer online and offline classes?",
    answer:
      "Yes. Cyborg offers both live online and hands-on offline learning options.",
  },
  {
    question: "Can students participate in competitions?",
    answer:
      "Students who progress to advanced levels can explore competition and project pathways based on interest and readiness.",
  },
  {
    question: "What happens after the free trial?",
    answer:
      "The parent receives guidance on the child's level, suitable program and next steps.",
  },
];

const JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
}).replace(/</g, "\\u003c");

export default function FAQ() {
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative scroll-mt-28 overflow-hidden bg-zinc-50 py-16 lg:py-24"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON_LD }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-24 size-96 rounded-full bg-[#ff5a36]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-[900px] px-6">
        <SectionHeader id="faq-heading" {...CONTENT} />

        <ul role="list" className="grid gap-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            const buttonId = `${baseId}-q-${index}`;
            const panelId = `${baseId}-a-${index}`;

            return (
              <li
                key={faq.question}
                className={cn(
                  "overflow-hidden rounded-2xl border transition-[box-shadow,border-color,background-color] duration-300",
                  isOpen
                    ? "border-[#ff5a36]/40 bg-white shadow-lg"
                    : "border-zinc-200 bg-white/70 hover:border-[#ff5a36]/30 hover:bg-white",
                )}
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d63a17] sm:p-6"
                  >
                    <span className="text-base font-bold tracking-tight text-zinc-900 sm:text-lg">
                      {faq.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-full transition-colors duration-300",
                        isOpen
                          ? "bg-[#d63a17] text-white"
                          : "bg-[#ff5a36]/10 text-[#d63a17]",
                      )}
                    >
                      <Plus
                        className={cn(
                          "size-5 transition-transform duration-300",
                          isOpen && "rotate-45",
                        )}
                      />
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.3,
                        ease: "easeOut",
                      }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[60ch] px-5 pb-6 leading-relaxed text-zinc-600 sm:px-6">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
