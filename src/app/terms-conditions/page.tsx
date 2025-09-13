"use client";
import Footer from "@/components/home/Footer";
import React from "react";
import Head from "next/head";

const TermsPage = () => {
  return (
    <>
      <Head>
        <title>Terms and Conditions | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Read the terms and conditions for using Cyborg Robotics Academy's website and services."
        />
        <meta
          property="og:title"
          content="Terms and Conditions | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Read the terms and conditions for using Cyborg Robotics Academy's website and services."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main
        role="main"
        aria-label="Terms and Conditions"
        className="bg-gray-50 min-h-screen md:mt-14"
      >
        {/* TODO: Add loading and error states for better UX. */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-red-800 text-white py-6 px-6">
              <h1 className="text-3xl font-extrabold text-center">
                Terms and Conditions
              </h1>
            </div>

            {/* Content Container */}
            <div className="p-6 md:p-10 space-y-6">
              {/* Introduction Section */}
              <section className="bg-red-50 border-l-4 border-red-800 p-4 rounded-r-lg">
                <p className="text-gray-700 italic">
                  These Terms of Use govern your use of the content and services
                  offered through www.cyborgrobotics.in (&quot;Site&quot;). By
                  using the Site, you agree to be bound by these terms.
                </p>
              </section>

              {/* Main Content Sections */}
              <section>
                <h2 className="text-2xl font-semibold text-red-800 border-b-2 border-red-800 pb-2 mb-4">
                  Definitions
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  &quot;Account&quot; means the User account created free of
                  charge for using the Site. &quot;Products&quot; means the
                  goods and services displayed on the Site and offered for
                  sale/use. &quot;Site&quot; means www.cyborgrobotics.in owned
                  and operated by Cyborg Robotics Academy Private Limited.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-red-800 border-b-2 border-red-800 pb-2 mb-4">
                  User&apos;s Obligations
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  You are responsible for all activities under your account.
                  This includes:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2 ml-4">
                  <li>Keeping your password secure and confidential</li>
                  <li>
                    Immediately notifying Cyborg Robotics Academy of any
                    unauthorized use
                  </li>
                  <li>Maintaining the accuracy of your account information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-red-800 border-b-2 border-red-800 pb-2 mb-4">
                  Disclaimer of Warranties
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Your use of the Site is at your own risk. All content is
                  provided &quot;AS IS&quot; without warranties and should not
                  be relied upon for making critical decisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-red-800 border-b-2 border-red-800 pb-2 mb-4">
                  Governing Law
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  These Terms of Use are governed by the laws of India and any
                  disputes shall be subject to the exclusive jurisdiction of the
                  courts in New Delhi.
                </p>
              </section>

              {/* Contact Information */}
              <section className="bg-gray-100 rounded-lg p-4 mt-6">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Contact Information
                </h3>
                <p className="text-gray-700">
                  For any concerns or copyright issues, please contact our
                  Grievance Officer at:{" "}
                  <a
                    href="mailto:info@cyborgrobotics.in"
                    className="text-red-800 hover:underline"
                  >
                    info@cyborgrobotics.in
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
};

export default TermsPage;
