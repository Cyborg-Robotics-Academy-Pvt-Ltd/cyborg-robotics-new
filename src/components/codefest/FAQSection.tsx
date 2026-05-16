"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FAQ {
  q: string;
  a: string;
}

const faqs: FAQ[] = [
  {
    q: "Who can participate in this challenge?",
    a: "The challenge is open to students, professionals, and enthusiasts of all skill levels. Anyone with a passion for problem-solving and innovation is welcome to join.",
  },
  {
    q: "Is coding knowledge required?",
    a: "No prior coding experience is required. Some tracks are specifically designed for beginners, while others cater to advanced participants. We have something for everyone.",
  },
  {
    q: "Is this individual or team challenge?",
    a: "You can participate solo or form a team of up to 4 members. Team registration is encouraged for collaborative tracks, and we'll help you find teammates if needed.",
  },
  {
    q: "What device is required?",
    a: "A laptop or desktop with a stable internet connection is recommended. Mobile devices may be used for certain tracks, but a full keyboard setup is ideal for coding challenges.",
  },
  {
    q: "Will certificates be provided?",
    a: "Yes, all participants who complete the challenge receive a digital certificate. Winners and top performers receive special recognition certificates and exclusive swag.",
  },
  {
    q: "Is the challenge live or recorded?",
    a: "The challenge is conducted live with real-time judging. All sessions are recorded and made available to registered participants for 30 days after the event.",
  },
];

function FAQItem({ faq, index }: { faq: FAQ; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: "easeOut" }}
      className="min-w-0 self-start"
    >
      <AccordionItem
        value={`faq-${index}`}
        className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 transition-colors duration-200 hover:border-gray-300 data-[state=open]:border-[#082c78] data-[state=open]:shadow-[inset_0_0_0_1px_#082c78]"
      >
        <AccordionTrigger className="gap-4 py-5 text-left text-sm font-semibold leading-snug text-gray-900 hover:no-underline data-[state=open]:text-[#082c78] [&>svg]:h-7 [&>svg]:w-7 [&>svg]:rounded-full [&>svg]:bg-gray-100 [&>svg]:p-1.5 [&>svg]:text-gray-500 [&[data-state=open]>svg]:bg-[#082c78] [&[data-state=open]>svg]:text-white">
          <span className="min-w-0">{faq.q}</span>
        </AccordionTrigger>
        <AccordionContent className="border-t border-gray-100 pb-5 pt-4 text-sm leading-relaxed text-gray-600">
          {faq.a}
        </AccordionContent>
      </AccordionItem>
    </motion.div>
  );
}

export default function FAQSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="mb-4 px-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Got questions?
          </p>
          <CardTitle className="text-5xl font-black leading-none text-[#082c78]">
            FREQUENTLY ASKED
            <br />
            QUESTIONS
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0 pt-0">
          <Accordion
            type="single"
            collapsible
            className="grid items-start gap-3 md:[grid-template-columns:repeat(2,minmax(0,1fr))]"
          >
            {faqs.map((faq, i) => (
              <FAQItem key={faq.q} faq={faq} index={i} />
            ))}
          </Accordion>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex items-center gap-4"
          >
            <p className="text-sm text-gray-500">Still have questions?</p>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-[#082c78]/20 px-5 py-2 text-sm font-semibold text-[#082c78] hover:bg-[#082c78] hover:text-white"
            >
              <a href="mailto:support@codefest.dev">
                <MessageCircle size={14} />
                Contact us
              </a>
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </section>
  );
}
