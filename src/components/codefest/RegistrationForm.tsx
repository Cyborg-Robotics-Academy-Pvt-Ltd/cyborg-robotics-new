"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  GraduationCap,
  Laptop,
  Mail,
  MapPin,
  Phone,
  School,
  ShieldCheck,
  Trophy,
  User,
} from "lucide-react";

import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { saveOrderId } from "@/lib/order-id-storage";
import {
  CODEFEST_COMPETITION,
  normalizeCodefestRegistrationForm,
  validateCodefestRegistrationForm,
  type CodefestRegistrationFormData,
  type CodefestRegistrationFormErrors,
} from "@/lib/codefest-registration-validation";

const textFields = [
  {
    id: "fullName",
    label: "Student Full Name",
    placeholder: "Enter student full name",
    icon: User,
    type: "text",
  },
  {
    id: "gradeClass",
    label: "Grade / Class",
    placeholder: "Enter grade or class",
    icon: GraduationCap,
    type: "text",
  },
  {
    id: "cityState",
    label: "City & State",
    placeholder: "Enter city and state",
    icon: MapPin,
    type: "text",
  },
  {
    id: "parentGuardianName",
    label: "Parent / Guardian Name",
    placeholder: "Enter parent or guardian name",
    icon: User,
    type: "text",
  },
  {
    id: "emailAddress",
    label: "Email Address",
    placeholder: "Enter email address",
    icon: Mail,
    type: "email",
  },
  {
    id: "parentGuardianContactNumber",
    label: "Parent / Guardian Contact Number",
    placeholder: "Enter 10-digit number",
    icon: Phone,
    type: "tel",
  },
  {
    id: "emergencyContactNumber",
    label: "Emergency Contact Number",
    placeholder: "Enter 10-digit number",
    icon: Phone,
    type: "tel",
  },
] as const;

const inputClassName =
  "h-14 rounded-2xl border border-gray-200 bg-white pl-12 pr-4 text-[15px] font-500 shadow-none transition-all duration-200 placeholder:text-gray-400 focus-visible:border-[#b3202a] focus-visible:ring-0 focus-visible:shadow-[0_0_0_3px_rgba(179,32,42,0.1)] hover:border-gray-300";

const selectTriggerClassName =
  "h-14 w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-10 text-left text-[14px] sm:text-[15px] font-medium text-gray-700 shadow-none transition-all duration-200 focus:border-[#b3202a] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(179,32,42,0.1)]hover:border-gray-300  overflow-hidden";
const textareaClassName =
  "min-h-[112px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] font-500 text-gray-700 shadow-none transition-all duration-200 placeholder:text-gray-400 focus-visible:border-[#b3202a] focus-visible:ring-0 focus-visible:shadow-[0_0_0_3px_rgba(179,32,42,0.1)] hover:border-gray-300";

const initialFormData: CodefestRegistrationFormData = {
  fullName: "",
  gradeClass: "",
  cityState: "",
  fullResidentialAddress: "",
  parentGuardianName: "",
  emailAddress: "",
  parentGuardianContactNumber: "",
  emergencyContactNumber: "",
  preferredCodingPlatform: "",
  agreedToTerms: false,
};

interface RegistrationFormProps {
  initiallyOpen?: boolean;
}

export default function RegistrationForm({
  initiallyOpen = false,
}: RegistrationFormProps) {
  const [isModalOpen, setIsModalOpen] = useState(initiallyOpen);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formErrors, setFormErrors] = useState<CodefestRegistrationFormErrors>(
    {},
  );
  const [formData, setFormData] =
    useState<CodefestRegistrationFormData>(initialFormData);

  useEffect(() => {
    const openRegistrationForm = () => {
      setFormError("");
      setIsModalOpen(true);
    };

    window.addEventListener("open-codefest-registration", openRegistrationForm);

    return () => {
      window.removeEventListener(
        "open-codefest-registration",
        openRegistrationForm,
      );
    };
  }, []);

  const openModal = () => {
    setFormError("");
    setIsModalOpen(true);
  };

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;
    setFormError("");
    setFormErrors((current) => ({ ...current, [name]: "" }));
    setFormData((current) => ({
      ...current,
      [name]:
        name === "parentGuardianContactNumber" ||
        name === "emergencyContactNumber"
          ? value.replace(/\D/g, "").slice(0, 10)
          : value,
    }));
  };

  const handleTermsChange = (checked: boolean) => {
    setFormError("");
    setFormErrors((current) => ({ ...current, agreedToTerms: "" }));
    setFormData((current) => ({ ...current, agreedToTerms: checked }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    try {
      const normalizedFormData = normalizeCodefestRegistrationForm(formData);
      const validationErrors =
        validateCodefestRegistrationForm(normalizedFormData);

      setFormData(normalizedFormData);
      setFormErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        setFormError("Please fix the highlighted fields and try again.");
        return;
      }

      setIsSubmitting(true);
      setFormError("");

      const response = await fetch("/api/payment/initiate-competition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedFormData),
      });

      const data = await response.json();

      if (response.ok && data.success && data.paymentUrl) {
        if (data.orderId) {
          saveOrderId(data.orderId);
        }
        window.location.href = data.paymentUrl;
        return;
      }

      if (data.errors) {
        setFormErrors(data.errors);
      }

      setFormError(
        data.message || "Unable to start payment. Please try again.",
      );
    } catch (error) {
      console.error("Competition payment initiation failed:", error);
      setFormError("Unable to start payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
        
        * {
          font-family: "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .glow-on-focus {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .input-icon {
          transition: color 0.3s ease;
        }

        input:focus ~ .input-icon,
        textarea:focus ~ .input-icon {
          color: #b3202a;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .card-header-glow {
          background: linear-gradient(135deg, rgba(179, 32, 42, 0.03) 0%, rgba(199, 61, 29, 0.02) 100%);
        }

        .feature-card {
          background: linear-gradient(135deg, #ffffff 0%, #fafaf9 100%);
          border: 1px solid #f3f0ed;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          border-color: #e0e0e0;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }

        .cta-button {
          background: linear-gradient(135deg, #b3202a 0%, #a80f1d 100%);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 16px rgba(179, 32, 42, 0.2);
          border: none;
        }

        .cta-button:hover {
          box-shadow: 0 8px 32px rgba(179, 32, 42, 0.3);
          transform: translateY(-2px);
        }

        .cta-button:active {
          transform: translateY(0);
        }

        .form-section {
          animation: fadeIn 0.4s ease-out forwards;
        }

        .error-badge {
          animation: slideUp 0.3s ease-out;
        }

        .badge-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 16px;
          background: linear-gradient(135deg, #b3202a 0%, #a80f1d 100%);
          color: white;
          transition: all 0.3s ease;
        }

        .feature-card:hover .badge-icon {
          transform: scale(1.05);
        }
      `}</style>
      <Card className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-white to-gray-50/50 shadow-md sm:rounded-[28px]">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-br from-[#b3202a]/[0.03] to-[#c73e1d]/[0.02] px-4 py-5 sm:px-6 sm:py-5">
          <div className="max-w-4xl space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#b3202a]/70 sm:text-xs">
              🚀 Competition Registration
            </p>

            <CardTitle className="text-2xl font-black leading-[0.95] tracking-tight text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl">
              READY TO PARTICIPATE?
              <br />
              <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent font-bold">
                CodeFest?
              </span>
            </CardTitle>

            <p className="pt-1 text-sm leading-relaxed text-gray-600 sm:text-[15px]">
              Register now for CODE FEST 1.0 and secure your spot in India’s
              exciting block-based coding competition for young innovators.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 px-4 py-5 sm:px-6 sm:py-7">
          {/* Feature Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                label: "Entry Fee",
                value: `Rs. ${CODEFEST_COMPETITION.amount}`,
                icon: "₹",
              },
              {
                label: "Platforms",
                value: "Scratch & PictoBlox",
                icon: "🖥️",
              },
              {
                label: "Hall Ticket",
                value: "Auto Generated",
                icon: "🎫",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-red-100 bg-gradient-to-br from-white to-[#fafaf9] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
              >
                <div className="text-2xl">{item.icon}</div>

                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">
                  {item.label}
                </p>

                <p className="mt-2 text-sm font-bold leading-snug text-gray-900 sm:text-[15px]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Secure Payment */}
          <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-green-50/40 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow-sm">
                <ShieldCheck size={20} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold uppercase tracking-[0.1em] text-green-900">
                  Secure Payment Flow
                </p>

                <p className="mt-1.5 text-sm leading-relaxed text-green-800/80">
                  Your details are securely encrypted. After successful payment,
                  your competition ID and hall ticket are generated instantly.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={openModal}
            className="cta-button h-[58px] w-full rounded-2xl text-[16px] font-bold text-white transition-all duration-300"
          >
            Open Registration Form
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="CodeFest Competition Registration"
      >
        <div className="space-y-4 bg-gradient-to-b from-white via-white to-gray-50/30 p-4 sm:p-6">
          <style>{`
            .modal-title {
              background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }

            .field-group {
              position: relative;
            }

            .field-group input:focus + .field-icon,
            .field-group textarea:focus + .field-icon {
              color: #b3202a;
              transform: scale(1.1);
            }

            .field-icon {
              transition: all 0.3s ease;
            }

            .required-asterisk {
              color: #b3202a;
              font-weight: 700;
            }
          `}</style>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="mb-6 space-y-2">
              <h3 className="modal-title text-2xl font-black">
                {CODEFEST_COMPETITION.name}
              </h3>
              <p className="text-[14px] leading-relaxed text-gray-600">
                All fields are required. Your hall ticket will be generated
                immediately after successful payment confirmation.
              </p>
            </div>

            {formError && (
              <div className="error-badge mb-5 rounded-xl border border-red-200/50 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700 shadow-[0_2px_8px_rgba(220,38,38,0.1)]">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {textFields.map(
                  ({ id, label, placeholder, icon: Icon, type }) => (
                    <div
                      key={id}
                      className={
                        id === "emailAddress"
                          ? "space-y-2.5 md:col-span-2"
                          : "space-y-2.5"
                      }
                    >
                      <Label
                        htmlFor={id}
                        className="text-xs font-bold uppercase tracking-[0.15em] text-gray-700"
                      >
                        {label}
                        {id !== "emergencyContactNumber" && (
                          <span className="required-asterisk"> *</span>
                        )}
                      </Label>
                      <div className="field-group relative">
                        <Input
                          id={id}
                          name={id}
                          type={type}
                          placeholder={placeholder}
                          value={
                            formData[
                              id as keyof CodefestRegistrationFormData
                            ] as string
                          }
                          onChange={handleInputChange}
                          className={inputClassName}
                          aria-invalid={Boolean(
                            formErrors[
                              id as keyof CodefestRegistrationFormData
                            ],
                          )}
                        />
                        <Icon
                          size={18}
                          className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                      </div>
                      {formErrors[id as keyof CodefestRegistrationFormData] && (
                        <p className="error-badge text-xs text-red-600 font-medium">
                          ✗{" "}
                          {formErrors[id as keyof CodefestRegistrationFormData]}
                        </p>
                      )}
                    </div>
                  ),
                )}

                <div className="space-y-2.5 md:col-span-2">
                  <Label
                    htmlFor="fullResidentialAddress"
                    className="text-xs font-bold uppercase tracking-[0.15em] text-gray-700"
                  >
                    Full Residential Address
                    <span className="required-asterisk"> *</span>
                  </Label>
                  <div className="field-group relative">
                    <Textarea
                      id="fullResidentialAddress"
                      name="fullResidentialAddress"
                      placeholder="Street address, city, state, postal code"
                      value={formData.fullResidentialAddress}
                      onChange={handleInputChange}
                      className={textareaClassName}
                      aria-invalid={Boolean(formErrors.fullResidentialAddress)}
                    />
                    <MapPin
                      size={18}
                      className="field-icon absolute right-4 top-3 text-gray-400"
                    />
                  </div>
                  {formErrors.fullResidentialAddress && (
                    <p className="error-badge text-xs text-red-600 font-medium">
                      ✗ {formErrors.fullResidentialAddress}
                    </p>
                  )}
                </div>

                {[
                  {
                    id: "preferredCodingPlatform",
                    label: "Preferred Coding Platform",
                    icon: Laptop,
                    options: [
                      { value: "scratch", label: "Scratch" },
                      { value: "pictoblox", label: "PictoBlox" },
                    ],
                  },
                ].map(({ id, label, icon: Icon, options }) => (
                  <div key={id} className="space-y-2.5 md:col-span-2">
                    <Label
                      htmlFor={id}
                      className="text-xs font-bold uppercase tracking-[0.15em] text-gray-700"
                    >
                      {label}
                      <span className="required-asterisk"> *</span>
                    </Label>
                    <div className="field-group relative">
                      <Select
                        value={
                          formData[
                            id as keyof CodefestRegistrationFormData
                          ] as string
                        }
                        onValueChange={(value) => {
                          setFormError("");
                          setFormErrors((current) => ({
                            ...current,
                            [id]: "",
                          }));
                          setFormData((current) => ({
                            ...current,
                            [id]: value,
                          }));
                        }}
                      >
                        <SelectTrigger
                          id={id}
                          className={selectTriggerClassName}
                          aria-invalid={Boolean(
                            formErrors[
                              id as keyof CodefestRegistrationFormErrors
                            ],
                          )}
                        >
                          <SelectValue
                            placeholder={`Select ${label.toLowerCase()}`}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Icon
                        size={18}
                        className="field-icon pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>
                    {formErrors[id as keyof CodefestRegistrationFormErrors] && (
                      <p className="error-badge text-xs text-red-600 font-medium">
                        ✗{" "}
                        {formErrors[id as keyof CodefestRegistrationFormErrors]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onCheckedChange={(checked) =>
                      handleTermsChange(Boolean(checked))
                    }
                    className="mt-0.5 border-gray-300 data-[state=checked]:border-[#b3202a] data-[state=checked]:bg-[#b3202a]"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="agreedToTerms"
                      className="text-sm leading-relaxed text-gray-700"
                    >
                      I agree to the{" "}
                      <span className="font-bold text-[#b3202a]">
                        Terms & Conditions
                      </span>
                      <span className="required-asterisk"> *</span>
                    </Label>
                    {formErrors.agreedToTerms && (
                      <p className="error-badge mt-2 text-xs text-red-600 font-medium">
                        ✗ {formErrors.agreedToTerms}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="cta-button h-[58px] w-full rounded-2xl text-[16px] font-bold text-white"
                >
                  {isSubmitting
                    ? "🔄 Processing..."
                    : `✓ Proceed to Pay Rs. ${CODEFEST_COMPETITION.amount}`}
                  {!isSubmitting && <ArrowRight size={18} className="ml-2" />}
                </Button>

                <p className="text-center text-[13px] font-semibold text-gray-500">
                  Note : Competition ID / Hall Ticket will be available after
                  registration
                </p>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}
