"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Sparkles } from "lucide-react";
import BookingSidebar from "@/components/workshops/BookingSidebar";
import CTASection from "@/components/workshops/CTASection";
import CoursesSection from "@/components/workshops/CoursesSection";
import FAQSection from "@/components/workshops/FAQSection";
import HeroSection from "@/components/workshops/HeroSection";
import PricingSection from "@/components/workshops/PricingSection";
import ScheduleSection from "@/components/workshops/ScheduleSection";
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

  useEffect(() => {
    if (!formSuccess) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFormSuccess("");
    }, 2400);

    return () => window.clearTimeout(timeoutId);
  }, [formSuccess]);

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

      <div className="lg:mx-auto lg:max-w-[1440px] ">
        <HeroSection
          activeLocation={activeLocation}
          locations={LOCATIONS}
          activeLocationId={activeLocationId}
          onLocationChange={setActiveLocationId}
        />
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
                Choose your location and fill the form to reserve your child&apos;s spot.
              </p>
            </div>

            <BookingSidebar
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

      {!isDesktopFormVisible && (
        <button
          type="button"
          onClick={() => setIsDesktopFormVisible(true)}
          className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 items-center gap-2 rounded-l-2xl rounded-r-md border border-[rgba(141,15,17,0.14)] bg-gradient-to-br from-[#8D0F11] to-[#B92423] px-3 py-3 text-left text-white shadow-[0_12px_34px_rgba(141,15,17,0.28)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1/2 hover:translate-x-[-4px] hover:shadow-[0_18px_42px_rgba(141,15,17,0.34)] active:scale-[0.98] lg:inline-flex"
        >
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/12">
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#ffd4ca] animate-pulse" />
            <Sparkles size={14} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/70">
              Open
            </span>
            <span className="mt-1 text-[12px] font-black uppercase tracking-[0.12em]">
              Book Now
            </span>
          </span>
        </button>
      )}

      {isDesktopFormVisible && (
        <div className="fixed top-24 right-[max(1.5rem,calc((100vw-1440px)/2+1.5rem))] z-40 hidden w-[260px] lg:block">
          <BookingSidebar
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
          />
        </div>
      )}
    </div>
  );
};

export default SummerCampPage;
