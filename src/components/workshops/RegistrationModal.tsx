"use client";

import type { ChangeEventHandler, FormEventHandler } from "react";
import Modal from "@/components/ui/Modal";
import { REGISTRATION_FIELDS } from "./constants";
import type { AgeGroup, CampLocation, RegistrationFormData } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeLocation: CampLocation;
  selectedAge: AgeGroup;
  earlyBirdPrice: number;
  formData: RegistrationFormData;
  formError: string;
  isInitiatingPayment: boolean;
  onInputChange: ChangeEventHandler<HTMLInputElement>;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

const inputClassName =
  "w-full border border-[rgba(141,15,17,0.18)] rounded-xl px-[14px] py-3 text-[14px] text-[#222] bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#8D0F11] focus:shadow-[0_0_0_4px_rgba(141,15,17,0.08)]";

const RegistrationModal = ({
  isOpen,
  onClose,
  activeLocation,
  selectedAge,
  earlyBirdPrice,
  formData,
  formError,
  isInitiatingPayment,
  onInputChange,
  onSubmit,
}: Props) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Register - ${activeLocation.name} Summer Camp 2026`}
    >
      <div className="bg-gradient-to-b from-white to-[#fff7f7] p-4 sm:p-5">
        <div className="border border-[rgba(141,15,17,0.12)] rounded-[18px] bg-white shadow-[0_12px_40px_rgba(141,15,17,0.08)] p-4 sm:p-6">
          <div className="mb-5">
            <h3 className="text-2xl font-extrabold text-[#1a1a1a] m-0">
              Summer Camp Registration
            </h3>
            <p className="text-[14px] text-[#5b5b5b] leading-[1.6] mt-[10px] mb-0">
              Register your child for Cyborg Robotics Summer Camp 2026 -{" "}
              {activeLocation.name}.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                `📍 ${activeLocation.name}`,
                `👦 Age: ${selectedAge}`,
                `⏱ ${activeLocation.totalHours}`,
                `🐦 ₹${earlyBirdPrice.toLocaleString("en-IN")}`,
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-[5px] bg-[rgba(141,15,17,0.04)] border border-[rgba(141,15,17,0.1)] rounded-full px-[10px] py-[3px] text-[11px] text-[#666] font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          {formError && (
            <div className="mb-5 rounded-xl border border-red-200/40 bg-red-50/60 px-[14px] py-3 text-[13px] font-semibold text-red-700">
              {formError}
            </div>
          )}
          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-[14px] max-sm:grid-cols-1">
              {REGISTRATION_FIELDS.map((field) => (
                <div
                  key={field.id}
                  className={`flex flex-col gap-[6px] ${
                    field.span === 2 ? "col-span-2 max-sm:col-span-1" : ""
                  }`}
                >
                  <label
                    className="text-[13px] font-bold text-[#2a2a2a]"
                    htmlFor={field.id}
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    min={field.id === "age" ? "4" : undefined}
                    max={field.id === "age" ? "16" : undefined}
                    required
                    placeholder={field.placeholder}
                    value={formData[field.id]}
                    onChange={onInputChange}
                    className={inputClassName}
                  />
                </div>
              ))}
            </div>
            <p className="text-[12px] leading-[1.6] text-[#666] mt-4 mb-4">
              Fill in the details and continue to the integrated payment
              checkout. Contact: <strong>gshrikant199980@gmail.com</strong>
            </p>
            <button
              type="submit"
              disabled={isInitiatingPayment}
              className="w-full bg-gradient-to-br from-[#8D0F11] to-[#B92423] text-white border-0 rounded-2xl py-[14px] px-[18px] text-[15px] font-bold cursor-pointer shadow-[0_10px_26px_rgba(141,15,17,0.26)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(141,15,17,0.35)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isInitiatingPayment
                ? "Connecting to Payment..."
                : `Register Now - ₹${earlyBirdPrice.toLocaleString("en-IN")}`}
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default RegistrationModal;
