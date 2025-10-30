"use client";
import React from "react";
import { Shield, Cookie, FileText, Clock, Mail } from "lucide-react";
import Head from "next/head";

const PrivacyPolicy = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Read the privacy policy for Cyborg Robotics Academy and learn how your data is handled."
        />
        <meta
          property="og:title"
          content="Privacy Policy | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Read the privacy policy for Cyborg Robotics Academy and learn how your data is handled."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main
        role="main"
        aria-label="Privacy Policy"
        className="bg-gray-50 min-h-screen md:mt-20"
      >
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-[#991b1b] text-white py-8 px-6">
              <div className="flex items-center justify-center space-x-4">
                <Shield className="w-12 h-12 text-white" />
                <h1 className="text-4xl font-extrabold">Privacy Policy</h1>
              </div>
            </div>

            {/* Content Container */}
            <div className="p-6 md:p-10 space-y-6">
              {/* Introduction Section */}
              <section className="bg-red-50 border-l-4 border-[#991b1b] p-4 rounded-r-lg">
                <p className="text-gray-700 italic">
                  This Privacy Policy outlines how Cyborg Robotics Academy
                  Private Limited collects, uses and protects your personal
                  information.
                </p>
              </section>

              {/* Key Sections */}
              <section>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Consent Section */}
                  <div className="bg-gray-100 p-5 rounded-lg">
                    <h2 className="text-xl font-semibold text-[#991b1b] mb-3 flex items-center">
                      <FileText className="mr-3 text-[#991b1b]" size={24} />
                      Your Consent
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      By using our Website, you consent to the collection and
                      use of your information as described in this Privacy
                      Policy.
                    </p>
                  </div>

                  {/* Cookies Section */}
                  <div className="bg-gray-100 p-5 rounded-lg">
                    <h2 className="text-xl font-semibold text-[#991b1b] mb-3 flex items-center">
                      <Cookie className="mr-3 text-[#991b1b]" size={24} />
                      Cookies
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      We use cookies to analyze web page flow, measure
                      promotional effectiveness and promote trust and safety.
                    </p>
                  </div>
                </div>
              </section>

              {/* Detailed Sections */}
              <section>
                <h2 className="text-2xl font-semibold text-[#991b1b] border-b-2 border-red-200 pb-2 mb-4">
                  Information Collection
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    We collect personally identifiable information through
                    various means, including:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Data collection devices like cookies</li>
                    <li>Information you voluntarily provide</li>
                    <li>Interaction with our website</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#991b1b] border-b-2 border-red-200 pb-2 mb-4">
                  Information Sharing
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may disclose personal information if required by law or in
                  good faith to respond to legal processes such as subpoenas or
                  court orders.
                </p>
              </section>

              {/* Grievance Officer Section */}
              <section className="bg-gray-100 rounded-lg p-6">
                <h3 className="text-2xl font-semibold text-[#991b1b] mb-4 flex items-center">
                  <Mail className="mr-3 text-[#991b1b]" size={28} />
                  Grievance Officer
                </h3>
                <div className="space-y-3">
                  <p className="text-gray-800 font-medium">
                    Cyborg Robotics Academy Private Limited
                  </p>
                  <p className="text-gray-700">
                    Email:{" "}
                    <a
                      href="mailto:info@cyborgrobotics.in"
                      className="text-[#991b1b] hover:underline"
                    >
                      info@cyborgrobotics.in
                    </a>
                  </p>

                  {/* Operating Hours */}
                  <div className="flex items-center space-x-2 mt-4">
                    <Clock className="text-[#991b1b]" size={20} />
                    <div className="text-gray-700">
                      <p>Monday: 11AM - 7PM</p>
                      <p>Wednesday - Sunday: 11AM - 7PM</p>
                      <p className="text-red-600">Tuesday: Closed</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Policy Change Notice */}
              <section className="bg-red-50 border-l-4 border-[#991b1b] p-4 rounded-r-lg">
                <p className="text-gray-700 italic">
                  Our privacy policy is subject to change at any time without
                  notice. Please review this policy periodically to stay
                  informed.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default PrivacyPolicy;
