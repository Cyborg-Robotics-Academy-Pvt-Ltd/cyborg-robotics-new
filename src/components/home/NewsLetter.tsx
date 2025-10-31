"use client";
import { useEffect, useState } from "react";
import { Mail, Send, CheckCircle, AlertCircle, User } from "lucide-react";
import Image from "next/image";

type SubmitStatus = "success" | "error" | null;

export default function NewsletterSignup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name: string) => {
    return name.trim().length >= 2;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    const isValid = validateEmail(value);
    setIsEmailValid(isValid);

    if (value && !isValid) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }

    setSubmitStatus(null);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    const isValid = validateName(value);
    setIsNameValid(isValid);

    if (value && !isValid) {
      setNameError("Name must be at least 2 characters");
    } else {
      setNameError("");
    }

    setSubmitStatus(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate before submitting
    const isEmailValid = validateEmail(email);
    const isNameValid = validateName(name);

    setIsEmailValid(isEmailValid);
    setIsNameValid(isNameValid);

    if (!isEmailValid) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (!isNameValid) {
      setNameError("Name must be at least 2 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to Brevo form
      const formData = new FormData();
      formData.append("EMAIL", email);
      formData.append("NAME", name);

      const response = await fetch(
        "https://336aa40a.sibforms.com/serve/MUIFAKDvQGoRuu0cDBIubT4L_Wx47gMM37z0htGNj8ZFQSCPGUbMfGoO14TNi0-taj4gT4Tb7o6uf9b4C2VBf8ELYGiVeloaW-g8wZ8kNLV7EQVjxoklrOmPpCKSHFdfs0A9Or1qPmDQq9AR9UEc1j8Zc-XbJS6siiA_YZzzg4N6tFg8jh47_QFr6QB28AvH6zTVWUABTIShj3IKfw==",
        {
          method: "POST",
          body: formData,
          mode: "no-cors", // Required for cross-origin form submissions
        }
      );

      // Since we're using no-cors, we can't check the actual response
      // but if no error is thrown, we assume success
      setSubmitStatus("success");
      setEmail("");
      setName("");
      setIsEmailValid(false);
      setIsNameValid(false);
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative bg-white mt-4 px-4 overflow-hidden">
      {/* Background Elements */}

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div
          className={`text-center mb-4  transition-all duration-800 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full text-red-700 font-medium border border-red-100">
            <Mail className="w-4 h-4" />
            Newsletter
          </div>
          <h2 className="text-center font-bold text-lg md:text-3xl mt-4 mx-2">
            Stay {""}
            <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              Updated
            </span>
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Subscribe to our newsletter and never miss updates on new courses,
            events, and robotics innovations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 lg:gap-10 items-center">
          {/* Illustration */}
          <div
            className={`flex justify-center lg:justify-start order-2 lg:order-1 transition-all duration-800 delay-400 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-12"
            }`}
          >
            <div className="relative w-full max-w-lg">
              <div className="relative z-10 hidden md:block">
                <Image
                  src="/assets/newsletter.jpeg"
                  alt="Newsletter subscription illustration"
                  width={600}
                  height={500}
                  className="w-full h-auto rounded-2xl "
                />
              </div>
            </div>
          </div>

          {/* Enhanced Form */}
          <div
            className={`order-1 lg:order-2 flex justify-center transition-all duration-800 delay-600 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-12"
            }`}
          >
            <div className="w-full max-w-md">
              {/* Success Message */}
              {submitStatus === "success" && (
                <div
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800 animate-fadeIn"
                  role="alert"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="font-medium">
                    Successfully subscribed! Please check your email to confirm.
                  </span>
                </div>
              )}

              {/* Error Message */}
              {submitStatus === "error" && (
                <div
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 animate-fadeIn"
                  role="alert"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span className="font-medium">
                    Something went wrong. Please try again later.
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  {/* Name Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="NAME"
                      value={name}
                      onChange={handleNameChange}
                      placeholder="Your name"
                      className={`w-full rounded-2xl border-2 pl-10 pr-6 py-4 text-base bg-white transition-all duration-300 focus:outline-none focus:scale-[1.02] ${
                        name
                          ? isNameValid
                            ? "border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                            : "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                          : "border-gray-200 focus:ring-4 focus:ring-red-100"
                      }`}
                      aria-invalid={!isNameValid}
                      aria-describedby={nameError ? "name-error" : undefined}
                    />
                    {name && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {isNameValid ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {nameError && (
                    <p id="name-error" className="text-red-600 text-sm mt-1">
                      {nameError}
                    </p>
                  )}

                  {/* Email Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="EMAIL"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="Your email address"
                      className={`w-full rounded-2xl border-2 pl-10 pr-6 py-4 text-base bg-white transition-all duration-300 focus:outline-none focus:scale-[1.02] ${
                        email
                          ? isEmailValid
                            ? "border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                            : "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                          : "border-gray-200 focus:ring-4 focus:ring-red-100"
                      }`}
                      aria-invalid={!isEmailValid}
                      aria-describedby={emailError ? "email-error" : undefined}
                    />
                    {email && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {isEmailValid ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {emailError && (
                    <p id="email-error" className="text-red-600 text-sm mt-1">
                      {emailError}
                    </p>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!isEmailValid || !isNameValid || isSubmitting}
                    className={`w-full py-4 px-8 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                      !isEmailValid || !isNameValid || isSubmitting
                        ? "bg-gray-400 cursor-not-allowed focus:ring-gray-200"
                        : "shadow-lg hover:shadow-xl focus:ring-red-200"
                    }`}
                    style={
                      !(!isEmailValid || !isNameValid || isSubmitting)
                        ? {
                            backgroundColor: "#b92423",
                          }
                        : {}
                    }
                    onMouseEnter={(e) => {
                      if (!(!isEmailValid || !isNameValid || isSubmitting)) {
                        (e.target as HTMLButtonElement).style.backgroundColor =
                          "#9a1e1d";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!(!isEmailValid || !isNameValid || isSubmitting)) {
                        (e.target as HTMLButtonElement).style.backgroundColor =
                          "#b92423";
                      }
                    }}
                  >
                    <div className="flex items-center justify-center gap-2 ">
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Subscribing...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Subscribe Now
                        </>
                      )}
                    </div>
                  </button>

                  {/* Privacy Notice */}
                  <p className="text-sm text-gray-500 text-center leading-relaxed">
                    By subscribing, you agree to receive marketing emails. You
                    can unsubscribe at any time.
                    <br />
                    <span className="font-medium">
                      We respect your privacy.
                    </span>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
