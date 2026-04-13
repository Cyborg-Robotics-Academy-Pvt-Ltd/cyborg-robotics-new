"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import BookingSidebar from "@/components/workshops/BookingSidebar";
import CTASection from "@/components/workshops/CTASection";
import CoursesSection from "@/components/workshops/CoursesSection";
import FAQSection from "@/components/workshops/FAQSection";
import HeroSection from "@/components/workshops/HeroSection";
import PricingSection from "@/components/workshops/PricingSection";
import StickyBottomBar from "@/components/workshops/StickyBottomBar";
import WhySection from "@/components/workshops/WhySection";
import Header from "@/components/layout/header";
import {
  COURSES,
  DEFAULT_REGISTRATION_FORM_DATA,
  FAQS,
  LOCATIONS,
  WHY_ITEMS,
} from "@/components/workshops/constants";
import type {
  AgeGroup,
  LocationId,
  RegistrationFormData,
} from "@/components/workshops/types";
import Testimonials from "@/components/home/Testimonials/Testimonials";
import OfferSection from "@/components/workshops/OfferSection";
import Features from "@/components/home/Features";

type RegistrationFieldId = keyof RegistrationFormData;

const SummerCampPage = () => {
  const [activeLocationId, setActiveLocationId] =
    useState<LocationId>("magarpatta");
  const [selectedAge, setSelectedAge] = useState<AgeGroup>("7+");
  const [isMobileBookingVisible, setIsMobileBookingVisible] = useState(false);
  const [isDesktopFormVisible, setIsDesktopFormVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formData, setFormData] = useState<RegistrationFormData>(
    DEFAULT_REGISTRATION_FORM_DATA,
  );

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsMobileBookingVisible(true);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileBookingVisible(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobileBookingVisible || window.innerWidth >= 1024) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isMobileBookingVisible]);

  const activeLocation = LOCATIONS.find((location) => {
    return location.id === activeLocationId;
  })!;
  const earlyBirdPrice = activeLocation.fullPackage.earlyBird[selectedAge];

  const scrollToBookingForm = () => {
    if (window.innerWidth >= 1024) {
      setIsDesktopFormVisible(true);
      return;
    }

    setIsMobileBookingVisible(true);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const name = event.target.name as RegistrationFieldId;
    setFormError("");
    setFormSuccess("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setFormError("");
      setFormSuccess("");

      const response = await fetch("/api/workshops/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          locationId: activeLocationId,
          locationName: activeLocation.name,
          ageGroup: selectedAge,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFormSuccess("Booking saved successfully. We will contact you soon.");
        setFormData(DEFAULT_REGISTRATION_FORM_DATA);
        return;
      }

      setFormError(data.message || "Unable to save booking. Please try again.");
    } catch {
      setFormError("Unable to save booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormReset = () => {
    setFormSuccess("");
    setFormData(DEFAULT_REGISTRATION_FORM_DATA);
  };

  return (
    <div className="font-body overflow-x-hidden bg-white">
      <style>{`
        @keyframes blobFloat { from{transform:translateY(0px) scale(1)} to{transform:translateY(-18px) scale(1.04)} }
        @keyframes badgeFloat { from{transform:translateY(0px)} to{transform:translateY(-6px)} }
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      <div className="mb-18">
        <Header />
      </div>

      <div className=" ">
        <HeroSection
          activeLocation={activeLocation}
          onRegister={scrollToBookingForm}
        />
        <div className="mb-18">
          <Features />
        </div>
        <OfferSection />
        <Testimonials />
        <CoursesSection courses={COURSES} />
        <WhySection items={WHY_ITEMS} />

        <PricingSection
          locations={LOCATIONS}
          activeLocationId={activeLocationId}
          selectedAge={selectedAge}
          onSelectLocation={(locationId) => {
            setActiveLocationId(locationId);
            scrollToBookingForm();
          }}
        />
        <FAQSection faqs={FAQS} />
        <CTASection
          activeLocation={activeLocation}
          earlyBirdPrice={earlyBirdPrice}
          onRegister={scrollToBookingForm}
        />
      </div>

      {isMobileBookingVisible && (
        <div className="fixed inset-0 z-50 bg-[rgba(18,10,10,0.72)] px-4 py-5 backdrop-blur-[6px] lg:hidden">
          <div className="mx-auto h-full max-w-[640px] overflow-y-auto pt-6">
            <div className="mb-4 text-center text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                Robotics Summer Camp 2026
              </p>
              <h2 className="mt-2 text-[clamp(1.8rem,7vw,2.5rem)] font-black leading-[1.05]">
                Book Your Summer Camp Seat
              </h2>
              <p className="mx-auto mt-2 max-w-[320px] text-[12px] font-normal leading-[1.6] text-white/75">
                Choose your location and fill the form to reserve your
                child&apos;s spot.
              </p>
            </div>

            <BookingSidebar
              locations={LOCATIONS}
              activeLocationId={activeLocationId}
              onLocationChange={setActiveLocationId}
              formId="workshop-booking-form-mobile"
              showCloseButton
              onClose={() => setIsMobileBookingVisible(false)}
              activeLocation={activeLocation}
              selectedAge={selectedAge}
              formData={formData}
              formError={formError}
              formSuccess={formSuccess}
              isSubmitting={isSubmitting}
              onInputChange={handleInputChange}
              onSubmit={handleFormSubmit}
              onReset={handleFormReset}
            />
          </div>
        </div>
      )}

      {!isMobileBookingVisible && (
        <StickyBottomBar
          activeLocation={activeLocation}
          earlyBirdPrice={earlyBirdPrice}
          onRegister={scrollToBookingForm}
        />
      )}

      {isDesktopFormVisible && (
        <div className="fixed top-24 right-[max(1.5rem,calc((100vw-1440px)/2+1.5rem))] z-40 hidden w-[260px] lg:block">
          <BookingSidebar
            locations={LOCATIONS}
            activeLocationId={activeLocationId}
            onLocationChange={setActiveLocationId}
            formId="workshop-booking-form-desktop"
            showCloseButton
            onClose={() => setIsDesktopFormVisible(false)}
            activeLocation={activeLocation}
            selectedAge={selectedAge}
            formData={formData}
            formError={formError}
            formSuccess={formSuccess}
            isSubmitting={isSubmitting}
            onInputChange={handleInputChange}
            onSubmit={handleFormSubmit}
            onReset={handleFormReset}
          />
        </div>
      )}
    </div>
  );
};

export default SummerCampPage;
