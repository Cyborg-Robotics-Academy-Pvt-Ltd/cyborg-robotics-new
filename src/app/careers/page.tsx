"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import RoboticsCard from "@/components/ui/robotics-card";
import RoboticsButton from "@/components/ui/robotics-button";
import Dropdown from "@/components/ui/dropdown";
import { DropdownOption } from "@/components/ui/dropdown";
import {
  Send,
  User,
  Mail,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Loader2,
} from "lucide-react";

const CareersPage = () => {
  const careers = [
    {
      id: 1,
      title: "Electronics Engineer",
      department: "Engineering",
      location: "Pune, India",
      type: "Full-time",
      description:
        "Design and develop electronic circuits for our robotics products. Work with cutting-edge technologies in IoT and embedded systems.",
      requirements: [
        "Bachelor's degree in Electronics Engineering or related field",
        "Experience with PCB design tools",
        "Knowledge of embedded systems programming",
        "Familiarity with IoT protocols",
      ],
    },
    {
      id: 2,
      title: "PCB Designer",
      department: "Engineering",
      location: "Pune, India",
      type: "Full-time",
      description:
        "Create printed circuit board layouts for our innovative robotics and IoT products. Collaborate with hardware and firmware teams.",
      requirements: [
        "Diploma/Degree in Electronics/Electrical Engineering",
        "Proficiency in Altium Designer or similar tools",
        "Understanding of high-frequency design principles",
        "Experience with multi-layer PCB design",
      ],
    },
    {
      id: 3,
      title: "Receptionist",
      department: "Administration",
      location: "Pune, India",
      type: "Full-time",
      description:
        "Be the first point of contact for our visitors and callers. Manage front desk operations and provide excellent customer service.",
      requirements: [
        "Graduate with excellent communication skills",
        "Proficient in MS Office",
        "Experience in customer service",
        "Pleasant and professional demeanor",
      ],
    },
    {
      id: 4,
      title: "Robotics Trainer",
      department: "Education",
      location: "Pune, India",
      type: "Full-time",
      description:
        "Teach robotics and programming to students of various age groups. Develop curriculum and conduct hands-on workshops.",
      requirements: [
        "Degree in Computer Science, Electronics or related field",
        "Experience in teaching or training",
        "Knowledge of robotics platforms (LEGO, Arduino, etc.)",
        "Strong communication skills",
      ],
    },
    {
      id: 5,
      title: "Web Developer",
      department: "Technology",
      location: "Pune, India",
      type: "Full-time",
      description:
        "Develop and maintain our web applications and educational platforms. Work with modern technologies like React and Next.js.",
      requirements: [
        "Bachelor's degree in Computer Science or related field",
        "Experience with React/Next.js",
        "Knowledge of TypeScript and modern JavaScript",
        "Understanding of responsive design principles",
      ],
    },
    {
      id: 6,
      title: "Content Writer",
      department: "Marketing",
      location: "Pune, India",
      type: "Full-time",
      description:
        "Create engaging content for our website, blog, and educational materials. Focus on STEM education and technology topics.",
      requirements: [
        "Bachelor's degree in English, Journalism or related field",
        "Excellent writing and editing skills",
        "Understanding of SEO principles",
        "Interest in technology and education",
      ],
    },
  ];

  // Application form state
  const [activeTab, setActiveTab] = useState<"opportunities" | "apply">(
    "opportunities"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    message: "",
    resume: null as File | null,
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    message: "",
  });

  // Experience options
  const experienceOptions: DropdownOption[] = [
    { value: "fresher", label: "Fresher (0 years)" },
    { value: "1-2", label: "1-2 years" },
    { value: "3-5", label: "3-5 years" },
    { value: "5-10", label: "5-10 years" },
    { value: "10+", label: "10+ years" },
  ];

  // Position options
  const positionOptions: DropdownOption[] = careers.map((career) => ({
    value: career.title,
    label: career.title,
  }));

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle dropdown changes
  const handleDropdownChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user selects
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, resume: e.target.files![0] }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {
      name: "",
      email: "",
      phone: "",
      position: "",
      experience: "",
      message: "",
    };

    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10,15}$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    if (!formData.position) {
      errors.position = "Please select a position";
      isValid = false;
    }

    if (!formData.experience) {
      errors.experience = "Please select your experience";
      isValid = false;
    }

    if (!formData.message.trim()) {
      errors.message = "Message is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Prepare form data for submission
      const applicationData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        experience: formData.experience,
        message: formData.message,
      };

      // Send career application to the new API endpoint
      const response = await fetch("/api/careers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          position: "",
          experience: "",
          message: "",
          resume: null,
        });
      } else {
        const errorData = await response.json();
        setSubmitError(
          errorData.error || "Failed to submit application. Please try again."
        );
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      setSubmitError(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);

      // Reset success message after 5 seconds
      if (isSubmitted) {
        setTimeout(() => {
          setIsSubmitted(false);
        }, 5000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Join Our <span className="text-red-800">Team</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our innovative team in robotics and STEM education. We seek
            talented individuals to shape the future of technology learning.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setActiveTab("opportunities")}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === "opportunities"
                  ? "bg-white text-red-800 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Career Opportunities
            </button>
            <button
              onClick={() => setActiveTab("apply")}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === "apply"
                  ? "bg-white text-red-800 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Apply Now
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "opportunities" ? (
          <>
            {/* Career Opportunities */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Career <span className="text-red-800">Opportunities</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {careers.map((career, index) => (
                  <motion.div
                    key={career.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <RoboticsCard variant="elevated" className="h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {career.title}
                          </h3>
                          <p className="text-red-800 font-medium">
                            {career.department}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                          {career.type}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{career.location}</span>
                      </div>

                      <p className="text-gray-700 mb-4">{career.description}</p>

                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Requirements:
                        </h4>
                        <ul className="text-gray-700 space-y-1">
                          {career.requirements.map((req, idx) => (
                            <li key={idx} className="flex items-start">
                              <svg
                                className="w-4 h-4 text-red-800 mt-1 mr-2 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <RoboticsButton
                        variant="primary"
                        className="w-full"
                        onClick={() => {
                          setActiveTab("apply");
                          // Set the position in the form
                          setFormData((prev) => ({
                            ...prev,
                            position: career.title,
                          }));
                        }}
                      >
                        Apply for this Position
                      </RoboticsButton>
                    </RoboticsCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        ) : (
          /* Application Form */
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Job <span className="text-red-800">Application</span>
            </h2>

            <div className="max-w-3xl mx-auto">
              <RoboticsCard variant="elevated">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Application Submitted Successfully!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for your interest in joining our team.
                      We&apos;ll review your application and get back to you
                      soon.
                    </p>
                    <RoboticsButton
                      variant="primary"
                      onClick={() => {
                        setIsSubmitted(false);
                        setActiveTab("opportunities");
                      }}
                    >
                      Back to Opportunities
                    </RoboticsButton>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {submitError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-red-700 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          {submitError}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Full Name <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full bg-gray-50 pl-12 pr-4 py-3 rounded-xl border ${
                              formErrors.name
                                ? "border-red-300 focus:ring-red-500"
                                : "border-gray-200 focus:ring-red-800"
                            } focus:border-transparent focus:outline-none focus:ring-2 transition duration-200`}
                            placeholder="Enter your full name"
                          />
                        </div>
                        {formErrors.name && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.name}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Email Address <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full bg-gray-50 pl-12 pr-4 py-3 rounded-xl border ${
                              formErrors.email
                                ? "border-red-300 focus:ring-red-500"
                                : "border-gray-200 focus:ring-red-800"
                            } focus:border-transparent focus:outline-none focus:ring-2 transition duration-200`}
                            placeholder="Enter your email"
                          />
                        </div>
                        {formErrors.email && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.email}
                          </p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Phone Number <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`w-full bg-gray-50 pl-12 pr-4 py-3 rounded-xl border ${
                              formErrors.phone
                                ? "border-red-300 focus:ring-red-500"
                                : "border-gray-200 focus:ring-red-800"
                            } focus:border-transparent focus:outline-none focus:ring-2 transition duration-200`}
                            placeholder="Enter your phone number"
                          />
                        </div>
                        {formErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.phone}
                          </p>
                        )}
                      </div>

                      {/* Position */}
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Position Applying For{" "}
                          <span className="text-red-600">*</span>
                        </label>
                        <Dropdown
                          options={positionOptions}
                          value={formData.position}
                          onChange={(value) =>
                            handleDropdownChange("position", value)
                          }
                          placeholder="Select a position"
                          error={formErrors.position}
                        />
                      </div>

                      {/* Experience */}
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Years of Experience{" "}
                          <span className="text-red-600">*</span>
                        </label>
                        <Dropdown
                          options={experienceOptions}
                          value={formData.experience}
                          onChange={(value) =>
                            handleDropdownChange("experience", value)
                          }
                          placeholder="Select experience level"
                          error={formErrors.experience}
                        />
                      </div>

                      {/* Resume Upload - Hidden for now as we need to implement file upload API */}
                      {/* <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Resume/CV
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FileText className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="w-full bg-gray-50 pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-red-800 focus:border-transparent focus:outline-none focus:ring-2 transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                          />
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Upload your resume (PDF, DOC, DOCX)
                        </p>
                      </div> */}
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Cover Letter <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={5}
                        className={`w-full bg-gray-50 px-4 py-3 rounded-xl border ${
                          formErrors.message
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-200 focus:ring-red-800"
                        } focus:border-transparent focus:outline-none focus:ring-2 transition duration-200`}
                        placeholder="Tell us why you're interested in this position and what makes you a good fit..."
                      />
                      {formErrors.message && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <RoboticsButton
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Submitting Application...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5" />
                            Submit Application
                          </>
                        )}
                      </RoboticsButton>
                    </div>
                  </form>
                )}
              </RoboticsCard>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CareersPage;
