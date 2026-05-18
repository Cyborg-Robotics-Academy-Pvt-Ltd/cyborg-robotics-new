"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface FAQ {
  q: string;
  a: string;
  category: "general" | "technical" | "logistics" | "prizes";
}

const faqs: FAQ[] = [
  {
    q: "Who can participate in this challenge?",
    a: "The challenge is open to students, professionals, and enthusiasts of all skill levels. Anyone with a passion for problem-solving and innovation is welcome to join.",
    category: "general",
  },
  {
    q: "Is coding knowledge required?",
    a: "No prior coding experience is required. Some tracks are specifically designed for beginners, while others cater to advanced participants. We have something for everyone.",
    category: "general",
  },
  {
    q: "Is this individual or team challenge?",
    a: "You can participate solo or form a team of up to 4 members. Team registration is encouraged for collaborative tracks, and we'll help you find teammates if needed.",
    category: "technical",
  },
  {
    q: "What device is required?",
    a: "A laptop or desktop with a stable internet connection is recommended. Mobile devices may be used for certain tracks, but a full keyboard setup is ideal for coding challenges.",
    category: "technical",
  },
  {
    q: "Will certificates be provided?",
    a: "Yes, all participants who complete the challenge receive a digital certificate. Winners and top performers receive special recognition certificates and exclusive swag.",
    category: "prizes",
  },
  {
    q: "Is the challenge live or recorded?",
    a: "The challenge is conducted live with real-time judging. All sessions are recorded and made available to registered participants for 30 days after the event.",
    category: "logistics",
  },
];

const categories = [
  { id: "all", label: "All questions" },
  { id: "general", label: "General" },
  { id: "technical", label: "Technical" },
  { id: "logistics", label: "Logistics" },
  { id: "prizes", label: "Prizes" },
];

function FAQItem({
  faq,
  index,
  isHighlighted,
}: {
  faq: FAQ;
  index: number;
  isHighlighted: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: "easeOut",
      }}
      className={`min-w-0 self-start transition-all ${
        isHighlighted ? "ring-2 ring-[#082c78]/30" : ""
      }`}
    >
      <AccordionItem
        value={`faq-${index}`}
        className="
          min-w-0 overflow-hidden
          rounded-2xl border border-gray-200
          bg-white
          px-4

          transition-all duration-200
          hover:border-gray-300 hover:shadow-sm

          data-[state=open]:border-[#082c78]
          data-[state=open]:shadow-[0_4px_12px_rgba(8,44,120,0.1)]

          sm:px-6
        "
      >
        <AccordionTrigger
          className="
            gap-3 py-4
            text-left
            text-[14px] font-semibold leading-snug text-gray-900
            hover:no-underline

            data-[state=open]:text-[#082c78]

            [&>svg]:h-6
            [&>svg]:w-6
            [&>svg]:shrink-0
            [&>svg]:rounded-full
            [&>svg]:bg-gray-100
            [&>svg]:p-1.5
            [&>svg]:text-gray-500
            [&>svg]:transition-all

            [&[data-state=open]>svg]:rotate-180
            [&[data-state=open]>svg]:bg-[#082c78]
            [&[data-state=open]>svg]:text-white

            sm:gap-4
            sm:py-5
            sm:text-sm

            sm:[&>svg]:h-7
            sm:[&>svg]:w-7
          "
        >
          <span className="min-w-0">{faq.q}</span>
        </AccordionTrigger>

        <AccordionContent
          className="
            border-t border-gray-100
            pb-4 pt-4
            text-[13px] leading-relaxed text-gray-600

            sm:pb-5
            sm:text-sm
          "
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {faq.a}
          </motion.p>
        </AccordionContent>
      </AccordionItem>
    </motion.div>
  );
}

export default function FAQSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === "all" || faq.category === activeCategory;
      const matchesSearch =
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  const hasResults = filteredFaqs.length > 0;

  return (
    <section
      className="
        mx-auto max-w-7xl
        px-4 py-12

        sm:px-6 sm:py-16
      "
    >
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="mb-6 px-0">
          <p
            className="
              mb-3
              text-[10px] font-semibold uppercase
              tracking-[0.2em]
              text-gray-400

              sm:text-xs sm:tracking-widest
            "
          >
            Got questions?
          </p>

          <CardTitle
            className="
              text-[2rem] font-black leading-[0.95]
              text-[#082c78]

              sm:text-4xl
              md:text-5xl
            "
          >
            FREQUENTLY ASKED
            <br />
            QUESTIONS
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0 pt-0">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 sm:px-5"
          >
            <Search size={18} className="shrink-0 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                min-w-0 flex-1
                bg-transparent text-sm outline-none
                placeholder:text-gray-400
                sm:text-base
              "
            />
            {searchQuery && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setSearchQuery("")}
                className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={16} />
              </motion.button>
            )}
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8 flex flex-wrap gap-2 sm:gap-3"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`
                  inline-flex items-center rounded-full px-4 py-2
                  text-sm font-medium transition-all duration-200
                  sm:px-5 sm:py-2.5

                  ${
                    activeCategory === cat.id
                      ? "bg-[#082c78] text-white shadow-md"
                      : "border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </motion.div>

          {/* FAQ List */}
          <Accordion
            type="single"
            collapsible
            className="
              grid items-start gap-3

              md:[grid-template-columns:repeat(2,minmax(0,1fr))]
            "
          >
            <AnimatePresence mode="wait">
              {hasResults ? (
                filteredFaqs.map((faq, i) => (
                  <FAQItem
                    key={`${activeCategory}-${faq.q}`}
                    faq={faq}
                    index={i}
                    isHighlighted={searchQuery.length > 0}
                  />
                ))
              ) : (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="
                    col-span-full
                    rounded-xl border border-gray-200 bg-gray-50
                    px-6 py-12 text-center
                    sm:py-16
                  "
                >
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    No questions found
                  </p>
                  <p className="text-sm text-gray-500">
                    Try adjusting your search or filters
                  </p>
                  {(searchQuery || activeCategory !== "all") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setActiveCategory("all");
                      }}
                      className="
                        mt-4 text-sm font-medium text-[#082c78]
                        hover:underline
                      "
                    >
                      Clear filters
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Accordion>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="
              mt-8 flex flex-col items-start gap-3

              sm:mt-10 sm:flex-row sm:items-center sm:gap-4
            "
          >
            <p className="text-sm text-gray-500">Still have questions?</p>

            <Button
              asChild
              variant="outline"
              className="rounded-full border-[#082c78]/20 px-5 py-2 text-sm font-semibold text-[#082c78] hover:bg-[#082c78] hover:text-white"
            >
              <Link className="mx-2 gap-2 " href="mailto:support@codefest.dev">
                <MessageCircle size={14} />
                Contact us
              </Link>
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </section>
  );
}
