"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import { ChevronDown, File, User } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { saveOrderId } from "@/lib/order-id-storage";
interface FormData {
  studentName: string;
  selectedCourseName: string;
  paidAmount: string;
  paymentRemark: string;
}

const courseOptions = ["Regular Course", "Summer Camp", "Year-Long Program"];

export default function OtherRegistrationPage() {
  const [formData, setFormData] = useState<FormData>({
    studentName: "",
    selectedCourseName: "",
    paidAmount: "",
    paymentRemark: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!formData.studentName.trim())
      nextErrors.studentName = "Please enter student name.";
    if (!formData.selectedCourseName)
      nextErrors.selectedCourseName = "Please select a course.";
    if (!formData.paidAmount.trim())
      nextErrors.paidAmount = "Please enter amount to pay.";
    else if (Number(formData.paidAmount) <= 0)
      nextErrors.paidAmount = "Amount must be greater than 0.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the payment details before submitting.", {
        position: "top-center",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: formData.studentName.trim(),
          selectedCourseName: formData.selectedCourseName,
          paidAmount: Number(formData.paidAmount),
          paymentRemark: formData.paymentRemark.trim(),
          paymentFlow: "other", // distinguishes this flow on the API side
          dateOfRegistration: new Date().toISOString().split("T")[0],
        }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

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
      console.error("Other payment initiation failed:", error);
      toast.error("Payment initiation failed. Please try again later.", {
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"
      style={{
        background:
          "linear-gradient(160deg, #fdf2f2 0%, #f5f5f5 50%, #eff6ff 100%)",
      }}
    >
      <Toaster />
      <style>{`
        .other-card {
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
      `}</style>

      <div className="mx-auto mt-6 max-w-3xl">
        <div className="overflow-hidden rounded-t-2xl bg-gradient-to-r from-red-800 via-red-700 to-red-600 px-6 py-6 text-center sm:px-8">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Other</h1>
          <p className="mt-2 text-sm text-red-100">Payment Details</p>
        </div>

        <div
          className="other-card"
          style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
        >
          <form onSubmit={handleSubmit} className="p-5 md:p-8">
            <div className="mb-5 mt-2 flex items-center gap-3">
              <div className="section-num">2</div>
              <h2 className="text-xl font-bold tracking-wide text-gray-800">
                Payment Details
              </h2>
              <div className="ml-2 hidden h-px flex-1 bg-gray-100 md:block" />
            </div>

            <div className="field-card">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="studentName"
                    className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-600"
                  >
                    STUDENT NAME <span className="text-red-500">*</span>
                  </label>
                  <div className="input-wrapper relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="studentName"
                      name="studentName"
                      type="text"
                      value={formData.studentName}
                      onChange={handleChange}
                      required
                      placeholder="Enter student name"
                      className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-gray-800 transition-all ${
                        errors.studentName
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 bg-white"
                      }`}
                    />
                  </div>
                  {errors.studentName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.studentName}
                    </p>
                  )}
                </div>

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

                <div>
                  <label
                    htmlFor="paidAmount"
                    className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-600"
                  >
                    AMOUNT TO PAY <span className="text-red-500">*</span>
                  </label>
                  <div className="input-wrapper relative">
                    <File className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="paidAmount"
                      name="paidAmount"
                      type="number"
                      value={formData.paidAmount}
                      onChange={handleChange}
                      required
                      placeholder="Enter amount"
                      className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-gray-800 transition-all ${
                        errors.paidAmount
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 bg-white"
                      }`}
                    />
                  </div>
                  {errors.paidAmount && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.paidAmount}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="paymentRemark"
                    className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-600"
                  >
                    REMARK
                  </label>
                  <div className="input-wrapper">
                    <textarea
                      id="paymentRemark"
                      name="paymentRemark"
                      rows={3}
                      value={formData.paymentRemark}
                      onChange={handleChange}
                      placeholder="e.g. Renewal payment, balance payment, custom plan"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-5">
              <Link href="/registration" className="btn-secondary">
                Previous
              </Link>
              <div className="flex items-center gap-3">
                <span className="hidden text-xs text-gray-400 sm:block">
                  Step 2 of 2
                </span>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Pay & Submit "}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
