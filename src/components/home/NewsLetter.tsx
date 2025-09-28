"use client";
import { useEffect, useState } from "react";
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";

type SubmitStatus = "success" | "error" | null;

export default function NewsletterSignup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);
  const [isEmailValid, setIsEmailValid] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsEmailValid(validateEmail(value));
    setSubmitStatus(null);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isEmailValid) return;

    setIsSubmitting(true);

    try {
      // Submit to Brevo form
      const formData = new FormData();
      formData.append("EMAIL", email);

      await fetch(
        "https://f169c0e5.sibforms.com/serve/MUIFAM4LPnfV2EMOYZCSpcO6nK2-pzZSXufUL9HmbXFa6tMCRA-GyfeTkcC2St_fa-jwzNBtkZ3cfu1hgvGi3DxGMTvYz2ePIk4Bx4lNDEyS-HeqNQ77q_IsEQch9D1DPs8atrnaWN_0M4dqk1L94iTO5iQgJuWdCwseIRDyRUFAnGumCJuQ-_9FAsrpT3uGPCZkyoL9Iz9PWfe_",
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
      setIsEmailValid(false);
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative bg-white py-20 px-4 overflow-hidden">
      {/* Background Elements */}

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-800 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-red-50 rounded-full text-red-700 font-medium border border-red-100">
            <Mail className="w-4 h-4" />
            Newsletter
          </div>
          <h2 className="text-center font-bold text-lg md:text-3xl mt-4 md:mt-6 mx-2">
            Stay {""}
            <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              Updated
            </span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Illustration */}
          <div
            className={`flex justify-center lg:justify-start order-2 lg:order-1 transition-all duration-800 delay-400 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-12"
            }`}
          >
            <div className="relative w-full max-w-lg">
              <div className="relative z-10   ">
                <Image
                  src="/assets/newsletter.png"
                  alt="Newsletter subscription illustration"
                  width={600}
                  height={500}
                  className="w-full h-auto"
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
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">
                    Successfully subscribed! Check your email.
                  </span>
                </div>
              )}

              {/* Error Message */}
              {submitStatus === "error" && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium">
                    Something went wrong. Please try again.
                  </span>
                </div>
              )}

              <div className="space-y-4">
                {/* Email Input */}
                <div className="relative">
                  <input
                    type="email"
                    name="EMAIL"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email address"
                    className={`w-full rounded-2xl border-2 px-6 py-4 text-base bg-white transition-all duration-300 focus:outline-none focus:scale-105 ${
                      email
                        ? isEmailValid
                          ? "border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                          : "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : `border-gray-200 focus:ring-4 focus:ring-red-100`
                    }`}
                    onFocus={(e) => {
                      if (!email) {
                        e.target.style.borderColor = "#b92423";
                      }
                    }}
                    onBlur={(e) => {
                      if (!email) {
                        e.target.style.borderColor = "#d1d5db";
                      }
                    }}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {email &&
                      (isEmailValid ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!isEmailValid || isSubmitting}
                  className={`w-full py-4 px-8 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 ${
                    !isEmailValid || isSubmitting
                      ? "bg-gray-400 cursor-not-allowed focus:ring-gray-200"
                      : "shadow-lg hover:shadow-xl focus:ring-red-200"
                  }`}
                  style={
                    !(!isEmailValid || isSubmitting)
                      ? {
                          backgroundColor: "#b92423",
                        }
                      : {}
                  }
                  onMouseEnter={(e) => {
                    if (!(!isEmailValid || isSubmitting)) {
                      (e.target as HTMLButtonElement).style.backgroundColor =
                        "#9a1e1d";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(!isEmailValid || isSubmitting)) {
                      (e.target as HTMLButtonElement).style.backgroundColor =
                        "#b92423";
                    }
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
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
                  By subscribing, you agree to receive marketing emails. You can
                  unsubscribe at any time.
                  <br />
                  <span className="font-medium">We respect your privacy.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
