"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import { courseData } from "../../../data/courseData";
import { saveOrderId } from "@/lib/order-id-storage";
import {
  User,
  Calendar,
  Clock,
  Building,
  Book,
  File,
  Phone,
  Mail,
  Home,
  Map,
  ChevronDown,
  Cpu,
  Shield,
  Zap,
} from "lucide-react";
import Image from "next/image";

interface FormData {
  studentName: string;
  dateOfBirth: string;
  currentAge: string;
  schoolName: string;
  class: string;
  board: string;
  primaryParentType: string;
  primaryParentName: string;
  primaryParentContact: string;
  primaryParentEmail: string;
  currentAddress: string;
  permanentAddress: string;
  selectedCourseKey: string;
  paymentType: string;
  paidAmount: string;
  paymentRemark: string;
}

const RegisterPage: React.FC = () => {
  const courseOptions = Object.entries(courseData)
    .map(([key, course]) => ({
      key,
      title: course.title,
      price: course.price ?? 0,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  const [formData, setFormData] = useState<FormData>({
    studentName: "",
    dateOfBirth: "",
    currentAge: "",
    schoolName: "",
    class: "",
    board: "",
    primaryParentType: "",
    primaryParentName: "",
    primaryParentContact: "",
    primaryParentEmail: "",
    currentAddress: "",
    permanentAddress: "",
    selectedCourseKey: "",
    paymentType: "full",
    paidAmount: "",
    paymentRemark: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [sameAsCurrentAddress, setSameAsCurrentAddress] =
    useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [isInitiatingPayment, setIsInitiatingPayment] =
    useState<boolean>(false);
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const selectedCourse = formData.selectedCourseKey
    ? courseData[formData.selectedCourseKey]
    : undefined;

  useEffect(() => {
    if (formData.paymentType === "full") {
      setFormData((prev) => ({
        ...prev,
        paidAmount: selectedCourse?.price ? String(selectedCourse.price) : "",
        paymentRemark: "",
      }));
    }
  }, [formData.paymentType, formData.selectedCourseKey, selectedCourse?.price]);

  useEffect(() => {
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      setFormData((prev) => ({ ...prev, currentAge: age.toString() }));
    }
  }, [formData.dateOfBirth]);

  useEffect(() => {
    if (sameAsCurrentAddress) {
      setFormData((prev) => ({
        ...prev,
        permanentAddress: formData.currentAddress,
      }));
    } else if (formData.permanentAddress === formData.currentAddress) {
      setFormData((prev) => ({ ...prev, permanentAddress: "" }));
    }
  }, [
    sameAsCurrentAddress,
    formData.currentAddress,
    formData.permanentAddress,
  ]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressCheckbox = (e: ChangeEvent<HTMLInputElement>) =>
    setSameAsCurrentAddress(e.target.checked);
  const handleTermsCheckbox = (e: ChangeEvent<HTMLInputElement>) =>
    setTermsAccepted(e.target.checked);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\d{10}$/.test(phone);

  const validateStep = (stepToValidate = step): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (stepToValidate === 1) {
      if (!formData.studentName.trim())
        newErrors.studentName = "Student name is required.";
      if (!formData.dateOfBirth)
        newErrors.dateOfBirth = "Date of birth is required.";
      if (!formData.schoolName.trim())
        newErrors.schoolName = "School name is required.";
      if (!formData.class.trim()) newErrors.class = "Grade is required.";
      if (!formData.board) newErrors.board = "Board is required.";
    } else if (stepToValidate === 2) {
      if (!formData.primaryParentType)
        newErrors.primaryParentType = "Primary parent type is required.";
      if (!formData.primaryParentName.trim())
        newErrors.primaryParentName = "Primary parent name is required.";
      if (!formData.primaryParentContact.trim())
        newErrors.primaryParentContact = "Primary parent contact is required.";
      else if (!validatePhone(formData.primaryParentContact))
        newErrors.primaryParentContact = "Enter a valid 10-digit phone number.";
      if (!formData.primaryParentEmail.trim())
        newErrors.primaryParentEmail = "Primary parent email is required.";
      else if (!validateEmail(formData.primaryParentEmail))
        newErrors.primaryParentEmail = "Enter a valid email address.";
    } else if (stepToValidate === 3) {
      if (!formData.currentAddress.trim())
        newErrors.currentAddress = "Current address is required.";
      if (!sameAsCurrentAddress && !formData.permanentAddress.trim())
        newErrors.permanentAddress = "Permanent address is required.";
    } else if (stepToValidate === 4) {
      if (!formData.selectedCourseKey)
        newErrors.selectedCourseKey = "Please select a course.";
      if (
        formData.paymentType === "installment" ||
        formData.paymentType === "other"
      ) {
        if (!formData.paidAmount.trim())
          newErrors.paidAmount = "Please enter amount to pay.";
        else if (Number(formData.paidAmount) <= 0)
          newErrors.paidAmount = "Amount must be greater than 0.";
      }
    } else if (stepToValidate === 5) {
      if (!termsAccepted)
        newErrors.termsAccepted = "You must accept the terms and conditions.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await handleInitiatePayment();
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    } else {
      toast.error("Please fix the errors before proceeding.", {
        position: "top-center",
        duration: 4000,
        style: { background: "#EF4444", color: "#FFFFFF", fontWeight: "bold" },
      });
    }
  };

  const prevStep = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleInitiatePayment = async () => {
    if (isInitiatingPayment) return;

    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    const step3Valid = validateStep(3);
    const step4Valid = validateStep(4);
    const step5Valid = validateStep(5);

    if (
      !step1Valid ||
      !step2Valid ||
      !step3Valid ||
      !step4Valid ||
      !step5Valid
    ) {
      const issues: string[] = [];
      if (!step1Valid) {
        issues.push("Step 1: Student Information");
        setStep(1);
      } else if (!step2Valid) {
        issues.push("Step 2: Parent Information");
        setStep(2);
      } else if (!step3Valid) {
        issues.push("Step 3: Address Information");
        setStep(3);
      } else if (!step4Valid) {
        issues.push("Step 4: Payment Details");
        setStep(4);
      } else if (!step5Valid) {
        issues.push("Step 5: Terms & Conditions");
        setStep(5);
      }

      toast.error(`Please complete ${issues.join(", ")}.`, {
        position: "top-center",
        duration: 6000,
        style: { background: "#EF4444", color: "#FFFFFF", fontWeight: "bold" },
      });
      return;
    }

    try {
      setIsInitiatingPayment(true);
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: formData.studentName,
          dateOfBirth: formData.dateOfBirth,
          currentAge: formData.currentAge,
          schoolName: formData.schoolName,
          class: formData.class,
          board: formData.board,
          primaryParentType: formData.primaryParentType,
          primaryParentName: formData.primaryParentName,
          primaryParentContact: formData.primaryParentContact,
          primaryParentEmail: formData.primaryParentEmail,
          currentAddress: formData.currentAddress,
          permanentAddress: formData.permanentAddress,
          courseKey: formData.selectedCourseKey,
          paymentType: formData.paymentType,
          installmentAmount:
            formData.paymentType === "installment" ||
            formData.paymentType === "other"
              ? Number(formData.paidAmount)
              : undefined,
          paymentRemark: formData.paymentRemark,
        }),
      });

      const data = await res.json();

      if (data.success && data.paymentUrl) {
        if (data.orderId) saveOrderId(data.orderId);
        window.location.href = data.paymentUrl;
      } else {
        console.error("Payment initiation error:", data);
        toast.error(
          `Payment initiation failed: ${data.message || "Unknown error"}`,
          {
            position: "top-center",
            duration: 5000,
            style: {
              background: "#EF4444",
              color: "#FFFFFF",
              fontWeight: "bold",
            },
          },
        );
      }
    } catch (error) {
      console.error("Payment initiation exception:", error);
      toast.error("Payment initiation failed. Please try again.", {
        position: "top-center",
        duration: 5000,
        style: { background: "#EF4444", color: "#FFFFFF", fontWeight: "bold" },
      });
    } finally {
      setIsInitiatingPayment(false);
    }
  };

  const stepLabels = ["Student", "Parent", "Address", "Payment", "Terms"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=DM+Sans:wght@400;500;600&display=swap');

        .reg-page { font-family: 'DM Sans', sans-serif; }
        .reg-heading { font-family: 'Rajdhani', sans-serif; }

        .brand-header {
          background: linear-gradient(135deg, #7f0000 0%, #a81b1e 40%, #c73e1d 100%);
          position: relative;
          overflow: hidden;
        }
        .brand-header::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 15% 50%, rgba(255,255,255,0.06) 0%, transparent 50%),
            radial-gradient(circle at 85% 20%, rgba(255,255,255,0.04) 0%, transparent 40%);
        }
        .brand-header::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        }

        .circuit-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.04;
          background-image:
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        .logo-ring {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 2px solid rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
        }
        .logo-ring::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px dashed rgba(255,255,255,0.2);
          animation: spin 12s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .logo-inner {
          width: 42px;
          height: 42px;
          background: rgba(255,255,255,0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .academy-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 20px;
          padding: 3px 10px;
          font-size: 11px;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
        }

        .step-bubble {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
          font-family: 'Rajdhani', sans-serif;
        }
        .step-bubble.done { background: #fff; color: #a81b1e; }
        .step-bubble.active { background: #fff; color: #a81b1e; box-shadow: 0 0 0 3px rgba(255,255,255,0.3); }
        .step-bubble.pending { background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.6); border: 1.5px solid rgba(255,255,255,0.2); }

        .step-connector { flex: 1; height: 2px; background: rgba(255,255,255,0.15); transition: background 0.3s; }
        .step-connector.done { background: rgba(255,255,255,0.5); }

        .step-label { font-size: 10px; color: rgba(255,255,255,0.6); margin-top: 4px; font-family: 'DM Sans', sans-serif; text-align: center; }
        .step-label.active { color: #fff; font-weight: 600; }

        .form-card {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 20px 60px -10px rgba(168,27,30,0.08);
        }

        .section-num {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #a81b1e, #c73e1d);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 15px;
          font-family: 'Rajdhani', sans-serif;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(168,27,30,0.3);
        }

        .field-card {
          background: #fafafa;
          border-radius: 16px;
          border: 1px solid #f0f0f0;
          padding: 24px;
        }

        .input-wrapper input,
        .input-wrapper textarea,
        .input-wrapper select {
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-wrapper input:focus,
        .input-wrapper textarea:focus,
        .input-wrapper select:focus {
          border-color: #a81b1e !important;
          box-shadow: 0 0 0 3px rgba(168,27,30,0.1) !important;
          outline: none !important;
        }

        .btn-primary {
          background: linear-gradient(135deg, #a81b1e 0%, #c73e1d 100%);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          padding: 11px 32px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(168,27,30,0.35);
          letter-spacing: 0.02em;
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(168,27,30,0.4); }
        .btn-primary:active { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          padding: 11px 28px;
          border-radius: 12px;
          border: 1.5px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary:hover { background: #e9eaec; }

        .fee-card {
          background: linear-gradient(135deg, #fff5f5, #fff);
          border: 1.5px solid #fecaca;
          border-radius: 14px;
          padding: 18px 20px;
        }

        .terms-box {
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 14px;
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .terms-box:has(input:checked) { border-color: #a81b1e; background: #fff5f5; }

        .divider-line { flex: 1; height: 1px; background: linear-gradient(90deg, #f0f0f0, transparent); }
      `}</style>

      <main
        role="main"
        aria-label="New Student Registration"
        className="reg-page min-h-screen py-8 px-4 sm:px-6 lg:px-8"
        style={{
          background:
            "linear-gradient(160deg, #fdf2f2 0%, #f5f5f5 50%, #eff6ff 100%)",
        }}
      >
        <Toaster />

        <div className="max-w-3xl mx-auto mt-6">
          {/* ─── BRAND HEADER ─── */}
          <div
            className="brand-header rounded-2xl overflow-hidden mb-0"
            style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
          >
            <div className="circuit-pattern" />
            <div className="relative z-10 px-6 py-6 sm:px-8 sm:py-7">
              {/* Logo row */}
              <div className="flex items-center gap-4 mb-4">
                <div className="logo-ring">
                  <div className="logo-inner">
                    {/* Replace this <img> src with your actual logo path */}
                    <Image
                      width={24}
                      height={24}
                      src="/cyborglogo.png"
                      alt="Cyborg Robotics"
                      className="w-8 h-8 object-contain"
                    />
                    {/* <Cpu className="w-6 h-6 text-white" strokeWidth={1.5} /> */}
                  </div>
                </div>

                <div>
                  <div className="academy-badge mb-1.5">
                    <Zap className="w-3 h-3" />
                    Est. 2020 · Pune
                  </div>
                  <h1
                    className="reg-heading text-white font-bold leading-tight"
                    style={{
                      fontSize: "clamp(20px, 4vw, 28px)",
                      letterSpacing: "0.01em",
                    }}
                  >
                    CYBORG ROBOTICS ACADEMY
                  </h1>
                  <p className="text-red-200 text-xs mt-0.5 font-medium tracking-wide">
                    Empowering Young Innovators
                  </p>
                </div>

                {/* Right badge */}
                <div className="ml-auto hidden sm:flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
                  <Shield className="w-4 h-4 text-white/70" />
                  <span className="text-white/80 text-xs font-medium">
                    Secure Registration
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="flex items-center gap-3">
                <div className="divider-line" />
                <h2 className="reg-heading text-white/90 text-sm font-semibold tracking-widest uppercase whitespace-nowrap px-2">
                  Student Registration Form
                </h2>
                <div className="divider-line" />
              </div>
            </div>

            {/* ─── STEP PROGRESS ─── */}
            <div className="relative z-10 px-6 pb-5 sm:px-8">
              <div className="flex items-start gap-0">
                {stepLabels.map((label, i) => {
                  const s = i + 1;
                  const isDone = step > s;
                  const isActive = step === s;
                  return (
                    <React.Fragment key={s}>
                      <div
                        className="flex flex-col items-center"
                        style={{ minWidth: 44 }}
                      >
                        <div
                          className={`step-bubble ${isDone ? "done" : isActive ? "active" : "pending"}`}
                        >
                          {isDone ? "✓" : s}
                        </div>
                        <span
                          className={`step-label ${isActive ? "active" : ""}`}
                        >
                          {label}
                        </span>
                      </div>
                      {i < stepLabels.length - 1 && (
                        <div
                          className={`step-connector mt-[18px] ${isDone ? "done" : ""}`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─── FORM CARD ─── */}
          <div
            className="form-card"
            style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
          >
            <form onSubmit={handleSubmit} className="p-5 md:p-8">
              {step === 1 && (
                <div>
                  <SectionTitle number="1" title="Student Information" />
                  <div className="field-card">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        id="studentName"
                        label="STUDENT NAME"
                        type="text"
                        value={formData.studentName}
                        onChange={handleChange}
                        required
                        placeholder="Enter full name"
                        icon="user"
                        error={errors.studentName}
                      />
                      <FormField
                        id="dateOfBirth"
                        label="DATE OF BIRTH"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
                        icon="calendar"
                        error={errors.dateOfBirth}
                      />
                      <FormField
                        id="currentAge"
                        label="CURRENT AGE"
                        type="text"
                        value={formData.currentAge}
                        onChange={handleChange}
                        readOnly
                        icon="clock"
                      />
                      <FormField
                        id="schoolName"
                        label="SCHOOL NAME"
                        type="text"
                        value={formData.schoolName}
                        onChange={handleChange}
                        required
                        placeholder="Enter school name"
                        icon="building"
                        error={errors.schoolName}
                      />
                      <FormField
                        id="class"
                        label="GRADE"
                        type="text"
                        value={formData.class}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Grade 5"
                        icon="book"
                        error={errors.class}
                      />
                      <DropdownField
                        id="board"
                        label="BOARD"
                        value={formData.board}
                        onChange={handleChange}
                        required
                        options={["CBSE", "ICSE", "State Board", "IB", "Other"]}
                        icon="file"
                        error={errors.board}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <SectionTitle number="2" title="Primary Parent Information" />
                  <div className="field-card">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 text-xs font-semibold mb-2 tracking-wider">
                          PRIMARY PARENT TYPE{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4">
                          {["father", "mother"].map((type) => (
                            <label
                              key={type}
                              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${formData.primaryParentType === type ? "border-red-700 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                            >
                              <input
                                type="radio"
                                name="primaryParentType"
                                value={type}
                                checked={formData.primaryParentType === type}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    primaryParentType: e.target.value,
                                  })
                                }
                                className="w-4 h-4 text-red-800 border-gray-300 focus:ring-red-700"
                                required
                              />
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {type}
                              </span>
                            </label>
                          ))}
                        </div>
                        {errors.primaryParentType && (
                          <p className="text-red-600 text-xs mt-1">
                            {errors.primaryParentType}
                          </p>
                        )}
                      </div>
                      <FormField
                        id="primaryParentName"
                        label={
                          formData.primaryParentType === "father"
                            ? "FATHER'S NAME"
                            : formData.primaryParentType === "mother"
                              ? "MOTHER'S NAME"
                              : "PRIMARY PARENT NAME"
                        }
                        type="text"
                        value={formData.primaryParentName}
                        onChange={handleChange}
                        required
                        placeholder={`Enter ${formData.primaryParentType || "primary parent"}'s full name`}
                        icon="user"
                        error={errors.primaryParentName}
                      />
                      <FormField
                        id="primaryParentContact"
                        label="CONTACT NUMBER"
                        type="tel"
                        value={formData.primaryParentContact}
                        onChange={handleChange}
                        required
                        placeholder="Enter mobile number"
                        icon="phone"
                        error={errors.primaryParentContact}
                      />
                      <FormField
                        id="primaryParentEmail"
                        label="EMAIL ID"
                        type="email"
                        value={formData.primaryParentEmail}
                        onChange={handleChange}
                        required
                        fullWidth
                        placeholder="Enter email address"
                        icon="mail"
                        error={errors.primaryParentEmail}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <SectionTitle number="3" title="Address Information" />
                  <div className="field-card">
                    <div className="grid grid-cols-1 gap-5">
                      <TextareaField
                        id="currentAddress"
                        label="CURRENT ADDRESS"
                        value={formData.currentAddress}
                        onChange={handleChange}
                        required
                        placeholder="Enter complete current address with pin code"
                        icon="home"
                        error={errors.currentAddress}
                      />
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          id="sameAddress"
                          type="checkbox"
                          className="w-4 h-4 text-red-800 border-gray-300 rounded focus:ring-red-700 transition-all"
                          checked={sameAsCurrentAddress}
                          onChange={handleAddressCheckbox}
                        />
                        <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                          Permanent address is same as current address
                        </span>
                      </label>
                      <TextareaField
                        id="permanentAddress"
                        label="PERMANENT ADDRESS"
                        value={formData.permanentAddress}
                        onChange={handleChange}
                        required
                        disabled={sameAsCurrentAddress}
                        placeholder="Enter complete permanent address with pin code"
                        icon="map"
                        error={errors.permanentAddress}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <SectionTitle number="4" title="Payment Details" />
                  <div className="field-card">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <div className="fee-card">
                          <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mb-1">
                            Course Fee
                          </p>
                          <p
                            className="text-3xl font-bold text-gray-900"
                            style={{ fontFamily: "'Rajdhani', sans-serif" }}
                          >
                            {selectedCourse?.price
                              ? `₹ ${selectedCourse.price.toLocaleString("en-IN")}`
                              : "—"}
                          </p>
                          {!selectedCourse && (
                            <p className="text-xs text-gray-400 mt-1">
                              Select a course below to view fee
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            You'll be redirected to bank checkout after Step 5.
                          </p>
                        </div>
                      </div>

                      <DropdownField
                        id="paymentType"
                        label="PAYMENT TYPE"
                        value={formData.paymentType}
                        onChange={handleChange}
                        required
                        options={["full", "installment", "other"]}
                        icon="file"
                      />

                      <div className="md:col-span-2">
                        <label
                          className="block text-gray-700 text-xs font-semibold mb-2 tracking-wider"
                          htmlFor="selectedCourseKey"
                        >
                          COURSE <span className="text-red-500">*</span>
                        </label>
                        <div className="input-wrapper relative">
                          <select
                            id="selectedCourseKey"
                            name="selectedCourseKey"
                            value={formData.selectedCourseKey}
                            onChange={handleChange}
                            className={`w-full py-3 px-4 border ${errors.selectedCourseKey ? "border-red-500" : "border-gray-200"} rounded-xl transition-all appearance-none bg-white text-gray-800 text-sm font-medium focus:outline-none`}
                            required
                          >
                            <option value="">Select Course</option>
                            {courseOptions.map((course) => (
                              <option key={course.key} value={course.key}>
                                {course.title}
                                {course.price
                                  ? ` (₹ ${course.price.toLocaleString("en-IN")})`
                                  : ""}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </div>
                        {errors.selectedCourseKey && (
                          <p className="text-red-600 text-xs mt-1">
                            {errors.selectedCourseKey}
                          </p>
                        )}
                      </div>

                      {(formData.paymentType === "installment" ||
                        formData.paymentType === "other") && (
                        <>
                          <FormField
                            id="paidAmount"
                            label="AMOUNT TO PAY"
                            type="number"
                            value={formData.paidAmount}
                            onChange={handleChange}
                            required
                            placeholder={
                              formData.paymentType === "installment"
                                ? "Enter installment amount"
                                : "Enter amount"
                            }
                            icon="file"
                            error={errors.paidAmount}
                          />
                          <div className="md:col-span-2">
                            <TextareaField
                              id="paymentRemark"
                              label="REMARK"
                              value={formData.paymentRemark}
                              onChange={handleChange}
                              placeholder={
                                formData.paymentType === "installment"
                                  ? "Example: First installment"
                                  : "Example: Scholarship, cash, custom plan"
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div>
                  <SectionTitle number="5" title="Terms & Conditions" />
                  <div className="field-card">
                    <ul className="space-y-3">
                      {[
                        "Rescheduling must be done at least 24 hours in advance. Last-minute requests will not be accepted.",
                        "Cover up class will not be provided for uninformed leaves. One day prior intimation is mandatory.",
                        "Taxes and other applicable charges, if any, will be charged extra.",
                        "Fees and other charges paid are not refundable.",
                        "Fees to be paid in advance.",
                        "I hereby grant permission to Cyborg Robotics Academy Pvt Ltd to use my child photograph and other media such as film and quotations, on Cyborg promotional material, publications, social and electronic media for which it may be suitable.",
                      ].map((term, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-sm text-gray-600 leading-relaxed"
                        >
                          <span className="mt-0.5 w-5 h-5 flex-shrink-0 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-700 text-xs font-bold">
                            {i + 1}
                          </span>
                          {term}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6">
                      <label className="terms-box">
                        <input
                          id="termsAccepted"
                          type="checkbox"
                          className="w-5 h-5 text-red-800 border-gray-300 rounded focus:ring-red-700 transition-all mt-0.5 flex-shrink-0"
                          checked={termsAccepted}
                          onChange={handleTermsCheckbox}
                          required
                        />
                        <span className="text-sm font-medium text-gray-700">
                          I have read and agree to all the terms and conditions
                          above.
                        </span>
                      </label>
                      {errors.termsAccepted && (
                        <p className="text-red-600 text-xs mt-2">
                          {errors.termsAccepted}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── NAV BUTTONS ─── */}
              <div className="flex justify-between items-center mt-8 pt-5 border-t border-gray-100">
                <div>
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="btn-secondary"
                    >
                      ← Previous
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 hidden sm:block">
                    Step {step} of {totalSteps}
                  </span>
                  {step < totalSteps ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn-primary"
                    >
                      Next Step →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isInitiatingPayment}
                      className="btn-primary"
                    >
                      {isInitiatingPayment
                        ? "Connecting to Bank..."
                        : "Submit & Pay →"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              Your information is kept confidential and used only for
              registration purposes.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              &copy; {new Date().getFullYear()} Cyborg Robotics Academy Pvt Ltd.
              All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

// ─── Sub-components (unchanged props/logic) ───

interface SectionTitleProps {
  number: string;
  title: string;
}
const SectionTitle: React.FC<SectionTitleProps> = ({ number, title }) => (
  <div className="flex items-center gap-3 mb-5 mt-2">
    <div className="section-num">{number}</div>
    <h2 className="reg-heading text-xl font-bold text-gray-800 tracking-wide">
      {title}
    </h2>
    <div className="flex-1 h-px bg-gray-100 hidden md:block ml-2" />
  </div>
);

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  icon?: string;
  error?: string;
}
const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  required,
  readOnly,
  fullWidth,
  placeholder,
  icon,
  error,
}) => (
  <div className={fullWidth ? "md:col-span-2" : ""}>
    <label
      className="block text-gray-600 text-xs font-semibold mb-1.5 tracking-wider"
      htmlFor={id}
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="input-wrapper relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon === "user" && <User className="h-4 w-4 text-gray-400" />}
          {icon === "calendar" && (
            <Calendar className="h-4 w-4 text-gray-400" />
          )}
          {icon === "clock" && <Clock className="h-4 w-4 text-gray-400" />}
          {icon === "building" && (
            <Building className="h-4 w-4 text-gray-400" />
          )}
          {icon === "book" && <Book className="h-4 w-4 text-gray-400" />}
          {icon === "file" && <File className="h-4 w-4 text-gray-400" />}
          {icon === "phone" && <Phone className="h-4 w-4 text-gray-400" />}
          {icon === "mail" && <Mail className="h-4 w-4 text-gray-400" />}
        </div>
      )}
      <input
        className={`w-full ${icon ? "pl-10" : "pl-4"} pr-4 py-2.5 border ${error ? "border-red-400 bg-red-50" : "border-gray-200"} rounded-xl text-sm text-gray-800 transition-all focus:outline-none ${readOnly ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white"}`}
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        required={required}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </div>
    {error && (
      <p className="text-red-500 text-xs mt-1" id={`${id}-error`}>
        {error}
      </p>
    )}
  </div>
);

interface TextareaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  icon?: string;
  error?: string;
}
const TextareaField: React.FC<TextareaFieldProps> = ({
  id,
  label,
  value,
  onChange,
  required,
  disabled,
  placeholder,
  icon,
  error,
}) => (
  <div>
    <label
      className="block text-gray-600 text-xs font-semibold mb-1.5 tracking-wider"
      htmlFor={id}
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="input-wrapper relative">
      {icon && (
        <div className="absolute top-3 left-3 flex items-center pointer-events-none">
          {icon === "home" && <Home className="h-4 w-4 text-gray-400" />}
          {icon === "map" && <Map className="h-4 w-4 text-gray-400" />}
        </div>
      )}
      <textarea
        className={`w-full ${icon ? "pl-10" : "pl-4"} pr-4 py-2.5 border ${error ? "border-red-400 bg-red-50" : "border-gray-200"} rounded-xl text-sm text-gray-800 transition-all focus:outline-none ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white"}`}
        id={id}
        name={id}
        rows={3}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </div>
    {error && (
      <p className="text-red-500 text-xs mt-1" id={`${id}-error`}>
        {error}
      </p>
    )}
  </div>
);

interface DropdownFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  options: string[];
  icon?: string;
  error?: string;
}
const DropdownField: React.FC<DropdownFieldProps> = ({
  id,
  label,
  value,
  onChange,
  required,
  options,
  icon,
  error,
}) => (
  <div>
    <label
      className="block text-gray-600 text-xs font-semibold mb-1.5 tracking-wider"
      htmlFor={id}
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="input-wrapper relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon === "file" && <File className="h-4 w-4 text-gray-400" />}
        </div>
      )}
      <select
        className={`w-full ${icon ? "pl-10" : "pl-4"} pr-10 py-2.5 border ${error ? "border-red-400 bg-red-50" : "border-gray-200"} rounded-xl text-sm text-gray-800 transition-all appearance-none bg-white focus:outline-none`}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
    {error && (
      <p className="text-red-500 text-xs mt-1" id={`${id}-error`}>
        {error}
      </p>
    )}
  </div>
);

export default RegisterPage;
