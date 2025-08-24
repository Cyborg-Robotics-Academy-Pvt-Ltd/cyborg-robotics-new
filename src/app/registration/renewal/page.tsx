"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { collection, addDoc } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { db } from "../../../../firebaseConfig";
import { User, Phone } from "lucide-react";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";

interface FormData {
  studentName: string;
  contactNumber: string;
  preferredDay: string[];
  preferredBatch: string;
  studentRegistrationNo: string;
  location: string;
  dateOfRegistration: string;
}

const Page: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    studentName: "",
    contactNumber: "",
    preferredDay: [],
    preferredBatch: "",
    studentRegistrationNo: "",
    location: "",
    dateOfRegistration: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.studentName) {
      toast.error("Please enter the name of the child.", {
        position: "top-center",
      });
      setIsSubmitting(false);
      return;
    }
    if (!formData.contactNumber) {
      toast.error("Please enter the contact number.", {
        position: "top-center",
      });
      setIsSubmitting(false);
      return;
    }
    if (!formData.preferredDay.length) {
      toast.error("Please select at least one preferred day.", {
        position: "top-center",
      });
      setIsSubmitting(false);
      return;
    }
    if (!formData.preferredBatch) {
      toast.error("Please select a preferred batch.", {
        position: "top-center",
      });
      setIsSubmitting(false);
      return;
    }

    const submissionData = {
      ...formData,
      preferredTime: formData.preferredBatch,
      preferredBatch: formData.preferredBatch,
      dateOfRegistration: new Date().toISOString().split("T")[0],
    };

    try {
      await addDoc(collection(db, "renewals"), submissionData);
      toast.success("Renewal submitted successfully!", {
        position: "top-center",
      });
      setFormData({
        studentName: "",
        contactNumber: "",
        preferredDay: [],
        preferredBatch: "",
        studentRegistrationNo: "",
        location: "",
        dateOfRegistration: "",
      });
      setIsModalOpen(true);
    } catch {
      toast.error("Submission failed. Please try again later.", {
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <Head>
        <title>Student Renewal Form | Cyborg Robotics Academy</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 py-8 px-4">
        <Toaster />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto mt-16"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-gray-800">
              Student Renewal Form
            </h1>
            <p className="mt-2 text-gray-600">
              Complete your registration in just a few steps
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200">
            <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  id="studentName"
                  label="Name of the Child"
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="Name of the Child"
                  icon={User}
                  required
                />
                <FormField
                  id="studentRegistrationNo"
                  label="Student Registration No. (PRN)"
                  value={formData.studentRegistrationNo}
                  onChange={handleChange}
                  placeholder="Student Registration No."
                />
                <FormField
                  id="contactNumber"
                  label="Contact Number"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder=" Contact Number"
                  icon={Phone}
                  required
                />
                <FormField
                  id="location"
                  label="Location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City / Area"
                />
              </div>

              {/* Preferred Day */}
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-2 block">
                  📆 Preferred Day <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day, idx) => (
                      <label
                        key={idx}
                        className={`px-4 py-2 rounded-full border cursor-pointer select-none ${
                          formData.preferredDay.includes(day)
                            ? "bg-red-700 text-white border-red-700"
                            : "bg-gray-100 text-gray-700 border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="preferredDay"
                          value={day}
                          checked={formData.preferredDay.includes(day)}
                          onChange={handleChange}
                          className="hidden"
                        />
                        {day}
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Preferred Batch */}
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-2 block">
                  ⏰ Preferred Batch <span className="text-red-500">*</span>
                </label>
                <select
                  id="preferredBatch"
                  name="preferredBatch"
                  value={formData.preferredBatch}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a batch</option>
                  <option value="10:00 AM - 12:00 PM">
                    10:00 AM - 12:00 PM
                  </option>
                  <option value="12:00 PM - 2:00 PM">12:00 PM - 2:00 PM</option>
                  <option value="3:00 PM - 5:00 PM">3:00 PM - 5:00 PM</option>
                  <option value="5:00 PM - 7:00 PM">5:00 PM - 7:00 PM</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium py-2.5 px-8 rounded-xl shadow hover:shadow-lg transform transition-all duration-300 hover:scale-105 ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Processing..." : "Submit Renewal"}
                </button>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Need assistance? Contact us at info@cyborgrobotics.in
          </p>
        </motion.div>

        {/* Success Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 text-center"
              >
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg
                    className="h-10 w-10 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Thank You!
                </h2>
                <p className="text-gray-600 mb-6">
                  Your renewal form has been submitted successfully. We will
                  contact you shortly.
                </p>
                <button
                  onClick={closeModal}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium py-3 px-6 rounded-xl hover:shadow-lg transform transition-all duration-300 hover:scale-105"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
};

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  icon?: React.ElementType;
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
}) => (
  <div>
    <label
      htmlFor={id}
      className="flex items-center text-gray-700 text-sm font-semibold mb-2"
    >
      {Icon && <Icon className="h-4 w-4 mr-2" />}
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={id}
      name={id}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all"
    />
  </div>
);

export default Page;
