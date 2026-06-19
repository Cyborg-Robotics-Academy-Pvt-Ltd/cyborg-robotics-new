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
import CodefestPopup from "@/components/codefest/CodefestPopup";

export default function HomePage() {
  return (
    <main id="top" className="bg-[#f8f8f8] overflow-hidden">
      <CodefestPopup />
      <Header />
      <HeroSection />
      <FeatureBar />
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[5fr_8fr] lg:gap-3 lg:px-6">
        <div id="about" className="scroll-mt-24 w-full">
          <AboutChallenge />
        </div>

        <div id="how-it-works" className="scroll-mt-24 w-full">
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
