"use client";

import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  ChevronDown,
  File,
  Mail,
  MapPin,
  Phone,
  Search,
  type LucideIcon,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { saveOrderId } from "@/lib/order-id-storage";
import { db } from "../../../lib/firebase";

interface FormData {
  studentName: string;
  contactNumber: string;
  parentEmail: string;
  preferredDay: string[];
  preferredBatch: string;
  studentRegistrationNo: string;
  center: string;
  location: string;
  selectedCourseName: string;
  dateOfRegistration: string;
  paidAmount: string;
  paymentRemark: string;
}

interface StudentSuggestion {
  id: string;
  name: string;
  prn: string;
  email: string;
  contactNumber: string;
  center: string;
  location: string;
  courses: string[];
}

const stepLabels = ["Renewal", "Payment"];
const totalSteps = stepLabels.length;
const courseOptions = [
  "Regular Course",
  "Summer Camp",
  "Year-Long Program",
];

const Page: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    studentName: "",
    contactNumber: "",
    parentEmail: "",
    preferredDay: [],
    preferredBatch: "",
    studentRegistrationNo: "",
    center: "",
    location: "",
    selectedCourseName: "",
    dateOfRegistration: "",
    paidAmount: "",
    paymentRemark: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allStudents, setAllStudents] = useState<StudentSuggestion[]>([]);
  const [studentSuggestions, setStudentSuggestions] = useState<
    StudentSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      try {
        const snapshot = await getDocs(collection(db, "students"));
        const students: StudentSuggestion[] = [];

        snapshot.forEach((studentDoc) => {
          const data = studentDoc.data();
          const name = String(
            data.fullName || data.name || data.studentName || data.username || "",
          ).trim();
          const prn = String(data.PrnNumber || data.prnNumber || "").trim();
          const studentCourses = Array.isArray(data.courses)
            ? data.courses
                .map((course: unknown) => {
                  if (typeof course === "string") return course;
                  if (course && typeof course === "object") {
                    const courseData = course as Record<string, unknown>;
                    return String(
                      courseData.name ||
                        courseData.course ||
                        courseData.title ||
                        "",
                    ).trim();
                  }
                  return "";
                })
                .filter(Boolean)
            : [];

          if (!name && !prn) return;

          students.push({
            id: studentDoc.id,
            name,
            prn,
            email: String(
              data.primaryParentEmail ||
                data.parentEmail ||
                data.email ||
                data.studentEmail ||
                "",
            ).trim(),
            contactNumber: String(
              data.primaryParentContact ||
                data.parentPhone ||
                data.contactNumber ||
                data.phone ||
                data.mobile ||
                "",
            ).trim(),
            center: String(data.center || data.branch || "").trim(),
            location: String(
              data.location ||
                data.area ||
                data.city ||
                data.currentAddress ||
                "",
            ).trim(),
            courses: [
              ...studentCourses,
              String(data.selectedCourseName || data.courseName || "").trim(),
            ].filter(Boolean),
          });
        });

        setAllStudents(students);
      } catch (error) {
        console.error("Error loading students for renewal:", error);
        toast.error("Unable to load student list. You can enter details manually.", {
          position: "top-center",
        });
      } finally {
        setIsLoadingStudents(false);
      }
    };

    void fetchStudents();
  }, []);

  const filterStudentSuggestions = (value: string) => {
    const searchValue = value.trim().toLowerCase();
    if (!searchValue) {
      setStudentSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = allStudents
      .filter(
        (student) =>
          student.name.toLowerCase().includes(searchValue) ||
          student.prn.toLowerCase().includes(searchValue),
      )
      .slice(0, 8);

    setStudentSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox" && name === "preferredDay") {
      const checkbox = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        preferredDay: checkbox.checked
          ? [...prev.preferredDay, value]
          : prev.preferredDay.filter((day) => day !== value),
      }));
      setErrors((prev) => ({ ...prev, preferredDay: "" }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "studentName") {
      filterStudentSuggestions(value);
    }
  };

  const handleStudentSelect = (student: StudentSuggestion) => {
    setFormData((prev) => ({
      ...prev,
      studentName: student.name,
      studentRegistrationNo: student.prn,
      contactNumber: student.contactNumber || prev.contactNumber,
      parentEmail: student.email || prev.parentEmail,
      center: student.center || prev.center,
      location: student.location || prev.location,
      selectedCourseName: prev.selectedCourseName,
    }));
    setErrors((prev) => ({
      ...prev,
      studentName: "",
      studentRegistrationNo: "",
      contactNumber: "",
      parentEmail: "",
    }));
    setStudentSuggestions([]);
    setShowSuggestions(false);
  };

  const validateStep = (stepToValidate = step) => {
    const newErrors: Record<string, string> = {};

    if (stepToValidate === 1) {
      if (!formData.studentName.trim())
        newErrors.studentName = "Please enter the name of the child.";
      if (!formData.studentRegistrationNo.trim())
        newErrors.studentRegistrationNo =
          "Please select or enter the student PRN number.";
      if (!formData.contactNumber.trim())
        newErrors.contactNumber = "Please enter the contact number.";
      else if (!/^\d{10}$/.test(formData.contactNumber))
        newErrors.contactNumber = "Please enter a valid 10-digit contact number.";
      if (!formData.parentEmail.trim())
        newErrors.parentEmail = "Please enter the email ID for payment.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail))
        newErrors.parentEmail = "Please enter a valid email ID.";
    }

    if (stepToValidate === 2) {
      if (!formData.selectedCourseName.trim())
        newErrors.selectedCourseName = "Please select a course.";
      if (!formData.paidAmount.trim())
        newErrors.paidAmount = "Please enter amount to pay.";
      else if (Number(formData.paidAmount) <= 0)
        newErrors.paidAmount = "Amount must be greater than 0.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(1)) {
      toast.error("Please fix the errors before proceeding.", {
        position: "top-center",
      });
      return;
    }
    setStep(2);
  };

  const prevStep = () => {
    if (step > 1) setStep((current) => current - 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateStep(2)) {
      toast.error("Please fix the payment details before proceeding.", {
        position: "top-center",
      });
      return;
    }

    setIsSubmitting(true);

    const submissionData = {
      ...formData,
      dateOfRegistration: new Date().toISOString().split("T")[0],
    };

    try {
      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...submissionData,
          paymentFlow: "renewal",
          paidAmount: Number(formData.paidAmount),
        }),
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        if (data.orderId) saveOrderId(data.orderId);
        window.location.href = data.paymentUrl;
        return;
      }

      toast.error(data.message || "Payment initiation failed.", {
        position: "top-center",
      });
    } catch (error) {
      console.error("Renewal payment initiation failed:", error);
      toast.error("Payment initiation failed. Please try again later.", {
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Student Renewal Form | Cyborg Robotics Academy</title>
      </Head>

      <style>{`
        .renewal-page { font-family: 'DM Sans', sans-serif; }
        .renewal-heading { font-family: 'Rajdhani', sans-serif; }
        .renewal-header {
          background: linear-gradient(135deg, #7f0000 0%, #a81b1e 40%, #c73e1d 100%);
          position: relative;
          overflow: hidden;
        }
        .renewal-header::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 15% 50%, rgba(255,255,255,0.08) 0%, transparent 45%),
            radial-gradient(circle at 85% 20%, rgba(255,255,255,0.05) 0%, transparent 40%);
        }
        .step-bubble {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }
        .step-bubble.done,
        .step-bubble.active {
          background: #fff;
          color: #a81b1e;
        }
        .step-bubble.active {
          box-shadow: 0 0 0 3px rgba(255,255,255,0.3);
        }
        .step-bubble.pending {
          background: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.65);
          border: 1.5px solid rgba(255,255,255,0.2);
        }
        .step-connector {
          flex: 1;
          height: 2px;
          background: rgba(255,255,255,0.18);
          transition: background 0.3s;
        }
        .step-connector.done {
          background: rgba(255,255,255,0.55);
        }
        .step-label {
          font-size: 10px;
          color: rgba(255,255,255,0.65);
          margin-top: 4px;
          text-align: center;
        }
        .step-label.active {
          color: #fff;
          font-weight: 700;
        }
        .form-card {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 20px 60px -10px rgba(168,27,30,0.08);
        }
        .field-card {
          background: #fafafa;
          border-radius: 16px;
          border: 1px solid #f0f0f0;
          padding: 24px;
        }
        .section-num {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #a81b1e, #c73e1d);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 15px;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(168,27,30,0.3);
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
          font-weight: 600;
          padding: 11px 32px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(168,27,30,0.35);
        }
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(168,27,30,0.4);
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          font-weight: 600;
          padding: 11px 28px;
          border-radius: 12px;
          border: 1.5px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          background: #e9eaec;
        }
      `}</style>

      <main
        className="renewal-page min-h-screen px-4 py-8 sm:px-6 lg:px-8"
        style={{
          background:
            "linear-gradient(160deg, #fdf2f2 0%, #f5f5f5 50%, #eff6ff 100%)",
        }}
      >
        <Toaster />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-6 max-w-3xl"
        >
          <div
            className="renewal-header rounded-2xl overflow-hidden"
            style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
          >
            <div className="relative z-10 px-6 py-6 sm:px-8">
              <h1 className="renewal-heading text-center text-2xl font-bold text-white sm:text-3xl">
                Student Renewal Form
              </h1>
              <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-red-100">
                Complete renewal details, then continue to payment.
              </p>
            </div>

            <div className="relative z-10 px-6 pb-5 sm:px-8">
              <div className="flex items-start gap-0">
                {stepLabels.map((label, index) => {
                  const stepNumber = index + 1;
                  const isDone = step > stepNumber;
                  const isActive = step === stepNumber;

                  return (
                    <React.Fragment key={label}>
                      <div className="flex min-w-11 flex-col items-center">
                        <div
                          className={`step-bubble ${
                            isDone ? "done" : isActive ? "active" : "pending"
                          }`}
                        >
                          {isDone ? "✓" : stepNumber}
                        </div>
                        <span
                          className={`step-label ${isActive ? "active" : ""}`}
                        >
                          {label}
                        </span>
                      </div>
                      {index < stepLabels.length - 1 && (
                        <div
                          className={`step-connector mt-[18px] ${
                            isDone ? "done" : ""
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            className="form-card"
            style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
          >
            <form onSubmit={handleSubmit} className="p-5 md:p-8">
              {step === 1 && (
                <div>
                  <SectionTitle number="1" title="Renewal Details" />
                  <div className="field-card">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div className="relative">
                        <FormField
                          id="studentName"
                          label="SEARCH STUDENT NAME"
                          value={formData.studentName}
                          onChange={handleChange}
                          placeholder={
                            isLoadingStudents
                              ? "Loading student list..."
                              : "Type student name or PRN"
                          }
                          icon={Search}
                          error={errors.studentName}
                          required
                        />
                        {showSuggestions && (
                          <div className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                            {studentSuggestions.map((student) => (
                              <button
                                key={student.id}
                                type="button"
                                onClick={() => handleStudentSelect(student)}
                                className="w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-red-50"
                              >
                                <span className="block text-sm font-semibold text-gray-800">
                                  {student.name || "Unnamed student"}
                                </span>
                        <span className="block text-xs text-gray-500">
                          PRN: {student.prn || "Not assigned"}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {[student.center, student.location, student.email]
                            .filter(Boolean)
                            .join(" | ")}
                        </span>
                      </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <FormField
                        id="studentRegistrationNo"
                        label="STUDENT REGISTRATION NO. (PRN)"
                        value={formData.studentRegistrationNo}
                        onChange={handleChange}
                        placeholder="Student Registration No."
                        error={errors.studentRegistrationNo}
                        required
                      />
                      <FormField
                        id="contactNumber"
                        label="CONTACT NUMBER"
                        type="tel"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        placeholder="Contact Number"
                        icon={Phone}
                        error={errors.contactNumber}
                        required
                      />
                      <FormField
                        id="parentEmail"
                        label="EMAIL ID FOR PAYMENT"
                        type="email"
                        value={formData.parentEmail}
                        onChange={handleChange}
                        placeholder="Email ID"
                        icon={Mail}
                        error={errors.parentEmail}
                        required
                      />
                      <FormField
                        id="center"
                        label="CENTER"
                        value={formData.center}
                        onChange={handleChange}
                        placeholder="Center"
                        icon={MapPin}
                      />
                      <FormField
                        id="location"
                        label="LOCATION"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="City / Area"
                        icon={MapPin}
                      />

                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <SectionTitle number="2" title="Payment Details" />
                  <div className="field-card">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label
                          htmlFor="selectedCourseName"
                          className="mb-2 block text-xs font-semibold tracking-wider text-gray-700"
                        >
                          COURSE <span className="text-red-500">*</span>
                        </label>
                        <div className="input-wrapper relative">
                          <select
                            id="selectedCourseName"
                            name="selectedCourseName"
                            value={formData.selectedCourseName}
                            onChange={handleChange}
                            className={`w-full appearance-none rounded-xl border bg-white px-4 py-3 pr-10 text-sm font-medium text-gray-800 transition-all ${
                              errors.selectedCourseName
                                ? "border-red-400 bg-red-50"
                                : "border-gray-200"
                            }`}
                            required
                          >
                            <option value="">Select Course</option>
                            {courseOptions.map((courseName) => (
                              <option key={courseName} value={courseName}>
                                {courseName}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        </div>
                        {errors.selectedCourseName && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.selectedCourseName}
                          </p>
                        )}
                      </div>

                      <FormField
                        id="paidAmount"
                        label="AMOUNT TO PAY"
                        type="number"
                        value={formData.paidAmount}
                        onChange={handleChange}
                        placeholder="Enter amount"
                        icon={File}
                        error={errors.paidAmount}
                        required
                      />

                      <div className="md:col-span-2">
                        <TextareaField
                          id="paymentRemark"
                          label="REMARK"
                          value={formData.paymentRemark}
                          onChange={handleChange}
                          placeholder="e.g. Renewal payment, balance payment, custom plan"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-5">
                <div>
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="btn-secondary"
                    >
                      Previous
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden text-xs text-gray-400 sm:block">
                    Step {step} of {totalSteps}
                  </span>
                  {step < totalSteps ? (
                    <button type="button" onClick={nextStep} className="btn-primary">
                      Next Step
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary"
                    >
                      {isSubmitting ? "Connecting to Payment..." : "Submit & Pay"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Need assistance? Contact us at info@cyborgrobotics.in
          </p>
        </motion.div>
      </main>
    </>
  );
};

interface SectionTitleProps {
  number: string;
  title: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ number, title }) => (
  <div className="mb-5 mt-2 flex items-center gap-3">
    <div className="section-num">{number}</div>
    <h2 className="renewal-heading text-xl font-bold tracking-wide text-gray-800">
      {title}
    </h2>
    <div className="ml-2 hidden h-px flex-1 bg-gray-100 md:block" />
  </div>
);

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  icon?: LucideIcon;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  required,
  placeholder,
  icon: Icon,
  error,
}) => (
  <div>
    <label
      htmlFor={id}
      className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-600"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="input-wrapper relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      )}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`w-full rounded-xl border py-2.5 pr-4 text-sm text-gray-800 transition-all ${
          Icon ? "pl-10" : "pl-4"
        } ${
          error
            ? "border-red-400 bg-red-50"
            : "border-gray-200 bg-white"
        }`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </div>
    {error && (
      <p id={`${id}-error`} className="mt-1 text-xs text-red-500">
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
  placeholder?: string;
  error?: string;
}

const TextareaField: React.FC<TextareaFieldProps> = ({
  id,
  label,
  value,
  onChange,
  required,
  placeholder,
  error,
}) => (
  <div>
    <label
      htmlFor={id}
      className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-600"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="input-wrapper">
      <textarea
        id={id}
        name={id}
        rows={3}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-800 transition-all ${
          error ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
        }`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </div>
    {error && (
      <p id={`${id}-error`} className="mt-1 text-xs text-red-500">
        {error}
      </p>
    )}
  </div>
);

export default Page;
