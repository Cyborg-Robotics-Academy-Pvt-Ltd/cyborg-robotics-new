"use client";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import {
  Send,
  User,
  Mail,
  MessageSquare,
  Loader2,
  Phone,
  MailCheck,
  MapPin,
  Clock,
  ExternalLink,
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const Page = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setAnimateIn(true);
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setIsSubmitted(true);
          setFormData({ name: "", email: "", message: "" });
          console.log(
            `Email sent successfully to ${formData.email} from ${formData.name} with message: ${formData.message}`
          );
        } else {
          console.error("Failed to send email");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsSubmitting(false);
        setTimeout(() => {
          setIsSubmitted(false);
        }, 5000);
      }
    }
  };
  return (
    <>
      <main
        role="main"
        aria-label="Contact Us Page"
        className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 "
      >
        {/* Hero Section */}
        <div
          className={`relative overflow-hidden bg-[#8D0F11] mt-16 text-white py-1 px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-in-out ${animateIn ? "opacity-100" : "opacity-0"}`}
        >
          <div className="max-w-7xl mx-auto flex flex-col items-center relative z-10">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center leading-tight mb-2">
              Get in <span className="text-yellow-300">Touch</span>
            </h1>
            <p className="text-base sm:text-md max-w-2xl text-center text-gray-200 mb-2">
              Have questions about our robotics programs? We&apos;re here to
              help.
            </p>
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-yellow-400 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-red-800 rounded-full opacity-30 blur-2xl"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div
              className={`w-full flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-16 transition-all duration-1000 ease-in-out ${animateIn ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              {/* Contact Info Section */}
              <div className="w-full lg:w-1/2 flex flex-col">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 hover:shadow-2xl transition-shadow duration-300">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">
                    <span className="text-[#8D0F11]">Cyborg</span> Robotics
                    Academy
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-yellow-100 p-3 rounded-full">
                        <MapPin className="text-yellow-600 w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-1">
                          Head Office
                        </h3>
                        <p className="text-gray-600">
                          North Court, Office No: 2A, 1st Floor,
                          <br />
                          Opposite Joggers Park, Above Punjab National Bank,
                          <br />
                          Kalyani Nagar, Pune 411 006
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Phone className="text-blue-600 w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-1">
                          Phone
                        </h3>
                        <p className="text-gray-600">+91-9175159292</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        <MailCheck className="text-green-600 w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-1">
                          Email
                        </h3>
                        <p className="text-gray-600">info@cyborgrobotics.in</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-purple-100 p-3 rounded-full">
                        <Clock className="text-purple-600 w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-1">
                          Hours
                        </h3>
                        <p className="text-gray-600">
                          Monday: 11AM - 7PM
                          <br />
                          Wednesday - Sunday: 11AM - 7PM
                          <br />
                          <span className="text-red-600">Tuesday: Closed</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map or Image */}
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden h-96 relative group">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3423.010879595577!2d73.90059166487148!3d18.549219867926492!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c110e47e39a3%3A0x1790569bae5ab0f4!2sNorth%20Court%2C%20Rd%20Number%2012%2C%20Jogger&#39;s%20Park%2C%20Nilanjali%20Society%2C%20Kalyani%20Nagar%2C%20Pune%2C%20Maharashtra%20411006!5e1!3m2!1sen!2sin!4v1746527288561!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                  />
                  <div className="absolute bottom-4 right-4">
                    <a
                      href="https://goo.gl/maps/your-location-link"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-md text-sm font-medium text-[#8D0F11] hover:text-[#6d0b0d] transition-colors"
                    >
                      Open in Google Maps
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form Section */}
              <div className="w-full lg:w-1/2">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-100 rounded-full -mr-20 -mt-20 z-0"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-50 rounded-full -ml-16 -mb-16 z-0"></div>

                  <div className="relative z-10">
                    <div className="flex items-center mb-8">
                      <div className="bg-gradient-to-r from-[#8D0F11] to-red-700 p-3 rounded-xl shadow-md">
                        <MessageSquare className="text-white w-6 h-6" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 ml-4">
                        Send us a Message
                      </h2>
                    </div>

                    {isSubmitted ? (
                      <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center animate-fadeIn">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-green-800 mb-2">
                          Message Sent Successfully!
                        </h3>
                        <p className="text-green-700 mb-4">
                          Thank you for reaching out. We&apos;ll get back to you
                          as soon as possible.
                        </p>
                        <button
                          onClick={() => setIsSubmitted(false)}
                          className="text-sm font-medium text-green-700 hover:text-green-800 transition-colors"
                        >
                          Send another message
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <label
                            className="block text-gray-700 text-sm font-medium mb-2"
                            htmlFor="name"
                          >
                            Name
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              className={`w-full bg-gray-50 pl-12 pr-4 py-4 rounded-xl border ${
                                errors.name
                                  ? "border-red-300 focus:ring-red-500"
                                  : "border-gray-200 focus:ring-[#8D0F11]"
                              } focus:border-transparent focus:outline-none focus:ring-2 transition duration-200`}
                              placeholder="Enter Your Name"
                              type="text"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                            />
                          </div>
                          {errors.name && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              </svg>
                              {errors.name}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            className="block text-gray-700 text-sm font-medium mb-2"
                            htmlFor="email"
                          >
                            Email
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              className={`w-full bg-gray-50 pl-12 pr-4 py-4 rounded-xl border ${
                                errors.email
                                  ? "border-red-300 focus:ring-red-500"
                                  : "border-gray-200 focus:ring-[#8D0F11]"
                              } focus:border-transparent focus:outline-none focus:ring-2 transition duration-200`}
                              placeholder="Enter Your Email"
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                            />
                          </div>
                          {errors.email && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              </svg>
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            className="block text-gray-700 text-sm font-medium mb-2"
                            htmlFor="message"
                          >
                            Message
                          </label>
                          <textarea
                            className={`w-full bg-gray-50 px-4 py-4 rounded-xl border ${
                              errors.message
                                ? "border-red-300 focus:ring-red-500"
                                : "border-gray-200 focus:ring-[#8D0F11]"
                            } focus:border-transparent focus:outline-none focus:ring-2 transition duration-200`}
                            rows={5}
                            placeholder="How can we help you today? Tell us about your requirements..."
                            name="message"
                            id="message"
                            value={formData.message}
                            onChange={handleChange}
                          />
                          {errors.message && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              </svg>
                              {errors.message}
                            </p>
                          )}
                        </div>

                        <button
                          type="submit"
                          className="w-full flex items-center justify-center bg-gradient-to-r from-[#8D0F11] to-red-700 hover:from-[#6d0b0d] hover:to-red-800 text-white py-4 px-6 rounded-xl transition duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-[#8D0F11] focus:ring-offset-2 shadow-md group"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="animate-spin mr-2 h-5 w-5" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                              Send Message
                            </>
                          )}
                        </button>

                        <p className="text-center text-gray-500 text-sm mt-4">
                          We&apos;ll get back to you within 24-48 hours
                        </p>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Added global styles for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>

      <div className="fixed bottom-0 -right-2 p-4">
        <Link
          href="https://www.linkedin.com/in/shrikant11/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/mylogo.png"
            alt="Company Logo"
            width={20}
            height={20}
            loading="lazy"
            quality={75}
            className="opacity-40"
          />
        </Link>
      </div>
    </>
  );
};

export default Page;
