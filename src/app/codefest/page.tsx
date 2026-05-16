// src/app/page.tsx

import {
  HeroSection,
  FeatureBar,
  AboutChallenge,
  HowItWorks,
  Highlights,
  FAQSection,
  FinalCTA,
  Footer,
} from "@/components/codefest/index";
import CodefestLiveSection from "@/components/codefest/CodefestLiveSection";
import Header from "@/components/layout/header";

export default function HomePage() {
  return (
    <main id="top" className="bg-[#f8f8f8] overflow-hidden">
      <Header />
      <HeroSection />
      <FeatureBar />

      <section className="max-w-7xl mx-auto grid lg:grid-cols-[5fr_8fr] gap-3 px-6 py-10 items-stretch">
        <div id="about" className="scroll-mt-24">
          <AboutChallenge />
        </div>
        <div id="how-it-works" className="scroll-mt-24">
          <HowItWorks />
        </div>
      </section>

      <CodefestLiveSection />

      <Highlights />

      <section id="faq" className="scroll-mt-24">
        <FAQSection />
      </section>
      <FinalCTA />
      <Footer />
    </main>
  );
}
