"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { collection, addDoc } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { db } from "../../../../firebaseConfig";
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
} from "lucide-react";
import Head from "next/head";

interface FormData {
  studentName: string;
  dateOfBirth: string;
  currentAge: string;
  schoolName: string;
  class: string;
  board: string;
  fatherName: string;
  fatherContact: string;
  fatherEmail: string;
  motherName: string;
  motherContact: string;
  motherEmail: string;
  currentAddress: string;
  permanentAddress: string;
  dateOfRegistration: string;
}

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    studentName: "",
    dateOfBirth: "",
    currentAge: "",
    schoolName: "",
    class: "",
    board: "",
    fatherName: "",
    fatherContact: "",
    fatherEmail: "",
    motherName: "",
    motherContact: "",
    motherEmail: "",
    currentAddress: "",
    permanentAddress: "",
    dateOfRegistration: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [sameAsCurrentAddress, setSameAsCurrentAddress] =
    useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
      setFormData((prev) => ({
        ...prev,
        currentAge: age.toString(),
      }));
    }
  }, [formData.dateOfBirth]);

  useEffect(() => {
    if (sameAsCurrentAddress) {
      setFormData((prev) => ({
        ...prev,
        permanentAddress: formData.currentAddress,
      }));
    } else if (formData.permanentAddress === formData.currentAddress) {
      setFormData((prev) => ({
        ...prev,
        permanentAddress: "",
      }));
    }
  }, [
    sameAsCurrentAddress,
    formData.currentAddress,
    formData.permanentAddress,
  ]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
    setSameAsCurrentAddress(e.target.checked);
  };

  const handleTermsCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
    setTermsAccepted(e.target.checked);
  };

  // Validation helpers
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const validatePhone = (phone: string) => {
    return /^\d{10}$/.test(phone);
  };

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
      if (!formData.fatherName.trim())
        newErrors.fatherName = "Father's name is required.";
      if (!formData.fatherContact.trim())
        newErrors.fatherContact = "Father's contact is required.";
      else if (!validatePhone(formData.fatherContact))
        newErrors.fatherContact = "Enter a valid 10-digit phone number.";
      if (!formData.fatherEmail.trim())
        newErrors.fatherEmail = "Father's email is required.";
      else if (!validateEmail(formData.fatherEmail))
        newErrors.fatherEmail = "Enter a valid email address.";
    } else if (stepToValidate === 3) {
      if (!formData.motherName.trim())
        newErrors.motherName = "Mother's name is required.";
      if (!formData.motherContact.trim())
        newErrors.motherContact = "Mother's contact is required.";
      else if (!validatePhone(formData.motherContact))
        newErrors.motherContact = "Enter a valid 10-digit phone number.";
      if (!formData.motherEmail.trim())
        newErrors.motherEmail = "Mother's email is required.";
      else if (!validateEmail(formData.motherEmail))
        newErrors.motherEmail = "Enter a valid email address.";
    } else if (stepToValidate === 4) {
      if (!formData.currentAddress.trim())
        newErrors.currentAddress = "Current address is required.";
      if (!sameAsCurrentAddress && !formData.permanentAddress.trim())
        newErrors.permanentAddress = "Permanent address is required.";
    } else if (stepToValidate === 5) {
      if (!termsAccepted)
        newErrors.termsAccepted = "You must accept the terms and conditions.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateStep(5)) {
      toast.error("Please fix the errors before submitting.", {
        position: "top-center",
        duration: 4000,
        style: {
          background: "#EF4444",
          color: "#FFFFFF",
          fontWeight: "bold",
        },
      });
      return;
    }
    setIsSubmitting(true);
    try {
      // Add current date to the form data
      const formDataWithDate = {
        ...formData,
        dateOfRegistration: new Date().toISOString().split("T")[0], // Format: YYYY-MM-DD
      };
      const docRef = await addDoc(
        collection(db, "registrations"),
        formDataWithDate
      );
      console.log("Document written with ID: ", docRef.id);
      openModal(); // Open the modal
      setFormData({
        studentName: "",
        dateOfBirth: "",
        currentAge: "",
        schoolName: "",
        class: "",
        board: "",
        fatherName: "",
        fatherContact: "",
        fatherEmail: "",
        motherName: "",
        motherContact: "",
        motherEmail: "",
        currentAddress: "",
        permanentAddress: "",
        dateOfRegistration: "",
      });
      setSameAsCurrentAddress(false);
      setTermsAccepted(false);
    } catch (error) {
      console.error("Error adding document: ", error);
      toast.error("Failed to submit form. Please try again.", {
        position: "top-center",
        duration: 4000,
        style: {
          background: "#EF4444",
          color: "#FFFFFF",
          fontWeight: "bold",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    } else {
      toast.error("Please fix the errors before proceeding.", {
        position: "top-center",
        duration: 4000,
        style: {
          background: "#EF4444",
          color: "#FFFFFF",
          fontWeight: "bold",
        },
      });
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  return (
    <>
      <Head>
        <title>New Student Registration | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Register as a new student at Cyborg Robotics Academy with our easy online form."
        />
        <meta
          property="og:title"
          content="New Student Registration | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Register as a new student at Cyborg Robotics Academy with our easy online form."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main
        role="main"
        aria-label="New Student Registration"
        className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 py-8 px-4 sm:px-6 lg:px-8"
      >
        <Toaster />
        <div className="max-w-5xl mx-auto mt-10">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all">
            <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-600 px-6 py-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">
                Student Registration Form
              </h1>
              <p className="text-sm sm:text-base text-red-100 text-center mt-3 max-w-2xl mx-auto">
                Welcome to Cyborg Robotics Academy!
              </p>
            </div>

            <div className="bg-gradient-to-r from-red-800 to-red-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Progress</span>
                <span className="text-white font-medium">
                  {step}/{totalSteps}
                </span>
              </div>
              <div className="w-full bg-red-900 rounded-full h-2.5 mt-2">
                <div
                  className="bg-white h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-3 md:p-6">
              {step === 1 && (
                <div>
                  <SectionTitle number="1" title="Student Information" />
                  <div className="bg-gray-50 rounded-2xl p-5 md:p-8 border border-gray-200 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
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
                  <SectionTitle number="2" title="Father's Information" />
                  <div className="bg-gray-50 rounded-2xl p-5 md:p-8 border border-gray-200 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                      <FormField
                        id="fatherName"
                        label="FATHER'S NAME"
                        type="text"
                        value={formData.fatherName}
                        onChange={handleChange}
                        required
                        placeholder="Enter father's full name"
                        icon="user"
                        error={errors.fatherName}
                      />
                      <FormField
                        id="fatherContact"
                        label="CONTACT NUMBER"
                        type="tel"
                        value={formData.fatherContact}
                        onChange={handleChange}
                        required
                        placeholder="Enter mobile number"
                        icon="phone"
                        error={errors.fatherContact}
                      />
                      <FormField
                        id="fatherEmail"
                        label="EMAIL ID"
                        type="email"
                        value={formData.fatherEmail}
                        onChange={handleChange}
                        required
                        fullWidth
                        placeholder="Enter email address"
                        icon="mail"
                        error={errors.fatherEmail}
                      />
                    </div>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div>
                  <SectionTitle number="3" title="Mother's Information" />
                  <div className="bg-gray-50 rounded-2xl p-5 md:p-8 border border-gray-200 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                      <FormField
                        id="motherName"
                        label="MOTHER'S NAME"
                        type="text"
                        value={formData.motherName}
                        onChange={handleChange}
                        required
                        placeholder="Enter mother's full name"
                        icon="user"
                        error={errors.motherName}
                      />
                      <FormField
                        id="motherContact"
                        label="CONTACT NUMBER"
                        type="tel"
                        value={formData.motherContact}
                        onChange={handleChange}
                        required
                        placeholder="Enter mobile number"
                        icon="phone"
                        error={errors.motherContact}
                      />
                      <FormField
                        id="motherEmail"
                        label="EMAIL ID"
                        type="email"
                        value={formData.motherEmail}
                        onChange={handleChange}
                        required
                        fullWidth
                        placeholder="Enter email address"
                        icon="mail"
                        error={errors.motherEmail}
                      />
                    </div>
                  </div>
                </div>
              )}
              {step === 4 && (
                <div>
                  <SectionTitle number="4" title="Address Information" />
                  <div className="bg-gray-50 rounded-2xl p-5 md:p-8 border border-gray-200 shadow-inner">
                    <div className="grid grid-cols-1 gap-5 md:gap-8">
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

                      <div className="flex items-center px-1 py-2">
                        <input
                          id="sameAddress"
                          type="checkbox"
                          className="w-5 h-5 text-red-800 border-gray-300 rounded focus:outline-none    focus:ring-red-700 transition-all cursor-pointer"
                          checked={sameAsCurrentAddress}
                          onChange={handleAddressCheckbox}
                        />
                        <label
                          htmlFor="sameAddress"
                          className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          Permanent address is same as current address
                        </label>
                      </div>

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
              {step === 5 && (
                <div>
                  <SectionTitle number="5" title="Terms & Conditions" />
                  <div className="bg-gray-50 rounded-2xl p-5 md:p-8 border border-gray-200 shadow-inner">
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-3">
                      <li className="pl-1">
                        Rescheduling must be done at least 24 hours in advance.
                        Last-minute requests will not be accepted.
                      </li>
                      <li className="pl-1">
                        Cover up class will not be provided for uninformed
                        leaves. One day prior intimation is mandatory.
                      </li>
                      <li className="pl-1">
                        Taxes and other applicable charges, if any, will be
                        charged extra.
                      </li>
                      <li className="pl-1">
                        Fees and other charges paid are not refundable.
                      </li>
                      <li className="pl-1">Fees to be paid in advance.</li>
                      <li className="pl-1">
                        I hereby grant permission to Cyborg Robotics Academy Pvt
                        Ltd to use my child photograph and other media such as
                        film and quotations, on Cyborg promotional material,
                        publications, social and electronic media for which it
                        may be suitable.
                      </li>
                    </ul>

                    <div className="flex items-center mt-6 bg-white p-4 rounded-xl border border-gray-200">
                      <input
                        id="termsAccepted"
                        type="checkbox"
                        className="w-5 h-5 text-red-800 border-gray-300 rounded focus:ring-red-700 transition-all cursor-pointer"
                        checked={termsAccepted}
                        onChange={handleTermsCheckbox}
                        required
                      />
                      <label
                        htmlFor="termsAccepted"
                        className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        I have read and agree to the terms and conditions
                      </label>
                    </div>
                    {errors.termsAccepted && (
                      <p className="text-red-600 text-xs mt-2">
                        {errors.termsAccepted}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-200 text-gray-800 font-medium py-2.5 px-8 rounded-xl hover:bg-gray-300 transition-all duration-300 mr-4"
                  >
                    Previous
                  </button>
                )}
                {step < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium py-2.5 px-8 rounded-xl shadow hover:shadow-lg transition-all duration-300"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-red-700 to-red-600 text-white font-medium py-2.5 px-8 rounded-xl shadow hover:shadow-lg transition-all duration-300"
                  >
                    Submit Registration
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Your information will be kept confidential and used only for
              registration purposes.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              &copy; {new Date().getFullYear()} Cyborg Robotics Academy Pvt Ltd.
              All rights reserved.
            </p>
          </div>
        </div>

        {/* Success Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 text-center transform transition-all duration-300 scale-100 opacity-100">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-10 w-10 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
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
                Your registration form has been submitted successfully.
                We&#39;ll contact you shortly to confirm your registration.
              </p>
              <button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  closeModal();
                  router.push("/login");
                }}
              >
                Ok
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

interface SectionTitleProps {
  number: string;
  title: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ number, title }) => (
  <div className="flex items-center mb-6 mt-12 first:mt-6">
    <div className="bg-gradient-to-r from-red-800 to-red-700 h-10 w-10 rounded-full flex items-center justify-center mr-3 shadow-md">
      <span className="text-white font-bold">{number}</span>
    </div>
    <h2 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h2>
    <div className="ml-auto hidden md:block">
      <div className="h-0.5 w-32 bg-gray-200"></div>
    </div>
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
      className="block text-gray-700 text-sm font-semibold mb-2"
      htmlFor={id}
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon === "user" && <User className="h-5 w-5 text-gray-400" />}
          {icon === "calendar" && (
            <Calendar className="h-5 w-5 text-gray-400" />
          )}
          {icon === "clock" && <Clock className="h-5 w-5 text-gray-400" />}
          {icon === "building" && (
            <Building className="h-5 w-5 text-gray-400" />
          )}
          {icon === "book" && <Book className="h-5 w-5 text-gray-400" />}
          {icon === "file" && <File className="h-5 w-5 text-gray-400" />}
          {icon === "phone" && <Phone className="h-5 w-5 text-gray-400" />}
          {icon === "mail" && <Mail className="h-5 w-5 text-gray-400" />}
        </div>
      )}
      <input
        className={`w-full ${icon ? "pl-10" : "pl-4"} py-3 border ${error ? "border-red-500" : "border-gray-300"} rounded-xl focus:ring-2 focus:outline-none focus:ring-red-700 focus:border-red-500 transition-all ${
          readOnly ? "bg-gray-100 text-gray-500" : "bg-white"
        }`}
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
      <p className="text-red-600 text-xs mt-1" id={`${id}-error`}>
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
      className="block text-gray-700 text-sm font-semibold mb-2"
      htmlFor={id}
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute top-3 left-3 flex items-center pointer-events-none">
          {icon === "home" && <Home className="h-5 w-5 text-gray-400" />}
          {icon === "map" && <Map className="h-5 w-5 text-gray-400" />}
        </div>
      )}
      <textarea
        className={`w-full ${icon ? "pl-10" : "pl-4"} py-3 border ${error ? "border-red-500" : "border-gray-300"} rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-500 transition-all ${
          disabled ? "bg-gray-100 text-gray-500" : "bg-white"
        }`}
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
      <p className="text-red-600 text-xs mt-1" id={`${id}-error`}>
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
      className="block text-gray-700 text-sm font-semibold mb-2"
      htmlFor={id}
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon === "file" && <File className="h-5 w-5 text-gray-400" />}
        </div>
      )}
      <select
        className={`w-full ${icon ? "pl-10" : "pl-4"} py-3 border ${error ? "border-red-500" : "border-gray-300"} rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-500 transition-all appearance-none bg-white pr-10`}
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
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
    {error && (
      <p className="text-red-600 text-xs mt-1" id={`${id}-error`}>
        {error}
      </p>
    )}
  </div>
);

export default RegisterPage;
