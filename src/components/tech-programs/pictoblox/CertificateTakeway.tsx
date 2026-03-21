import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Award, CheckCircle2, Trophy } from "lucide-react";

const CertificateTakeway = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div>
      <motion.section
        className="py-10 md:py-14 bg-white relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <div className="pointer-events-none absolute -left-16 top-10 h-52 w-52 rounded-full bg-[#0855AB]/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-8 h-56 w-56 rounded-full bg-[#A81B1E]/10 blur-3xl" />

        <div className="max-w-[1200px] mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            <motion.div className="text-[#062341] text-center" variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#0855AB]/10 border border-[#0855AB]/20 px-4 py-1.5 text-sm font-semibold mb-4">
                <Award size={16} className="text-[#0855AB]" />
                Official Workshop Recognition
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-sans flex items-center justify-center gap-3">
                <Trophy className="text-[#FFD166] mt-1 shrink-0" size={30} />
                <span>Certificate of Completion</span>
              </h2>

              <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Students receive an official robotics program certificate after successfully completing the workshop.
              </p>

              <div className="mt-6 space-y-3 max-w-2xl mx-auto text-left">
                <div className="flex items-start gap-2 text-gray-700">
                  <CheckCircle2 size={18} className="text-[#0855AB] mt-0.5 shrink-0" />
                  <span>Validated completion recognition from Cyborg Robotics.</span>
                </div>
                <div className="flex items-start gap-2 text-gray-700">
                  <CheckCircle2 size={18} className="text-[#0855AB] mt-0.5 shrink-0" />
                  <span>Students also take home their own 3D printed model.</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.15 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "/assets/certificates/cert-1.png",
                  "/assets/certificates/cert-2.png",
                  "/assets/certificates/cert-3.png",
                ].map((src, index) => (
                  <div
                    key={src}
                    className={`rounded-xl overflow-hidden bg-white border border-slate-200 shadow-md ${
                      index === 0 ? "sm:col-span-2" : ""
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`Certificate preview ${index + 1}`}
                      width={900}
                      height={640}
                      className="w-full h-auto object-cover"
                      unoptimized
                      priority={false}
                    />
                  </div>
                ))}
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0855AB] px-4 py-1.5 text-sm font-bold text-white shadow-lg">
                3 Certificate Previews
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default CertificateTakeway;
