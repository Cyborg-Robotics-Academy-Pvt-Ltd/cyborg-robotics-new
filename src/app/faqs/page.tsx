"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import Link from "next/link";

export default function FAQPage() {
  const faqs = [
    {
      question: "What age groups do your robotics courses cater to?",
      answer:
        "Our robotics courses are designed for children aged 5-18 years. We have specialized programs for different age groups: Bambino Coding for ages 5-7, Animation Coding for ages 7-10, and advanced robotics courses like EV3 and Spike Prime for ages 10-18. Each program is tailored to the cognitive and developmental stages of the respective age groups.",
    },
    {
      question: "Do you offer both online and offline classes?",
      answer:
        "Yes, we offer both online and offline classes to accommodate different preferences and needs. Our offline classes are conducted at our state-of-the-art facility in Kalyani Nagar, Pune, where students can interact with physical robots and equipment. Our online classes provide the same quality education through virtual platforms, allowing students to learn from anywhere. Both formats follow the same curriculum and are taught by our expert instructors.",
    },
    {
      question:
        "What kind of certification do students receive after completing a course?",
      answer:
        "Upon successful completion of our courses, students receive internationally recognized certification from our partners. Additionally, we provide our own Cyborg Robotics Academy certificates that detail the skills and knowledge acquired during the course. For our competition preparation courses, students also receive participation certificates and awards based on their performance in various robotics competitions.",
    },
    {
      question: "How experienced are your instructors?",
      answer:
        "Our instructors are highly qualified professionals with backgrounds in robotics, computer science, and engineering. Many of our instructors have industry experience and have participated in or mentored robotics competitions. They undergo continuous training to stay updated with the latest technologies and teaching methodologies.",
    },
    {
      question: "What equipment or software do I need for online classes?",
      answer:
        "For online classes, you&#39;ll need a computer or tablet with a stable internet connection, a webcam, and a microphone. We provide access to all necessary software and simulation tools through our learning platform. For hands-on projects, we may ship robotics kits to your home when required for specific courses.",
    },
    {
      question:
        "How long are the courses and what is the duration of each session?",
      answer:
        "Our courses typically range from 3 to 6 months in duration. Each session is 1.5 to 2 hours long, depending on the age group and complexity of the material. Younger students (5-10 years) have shorter sessions, while older students (11-18 years) have longer sessions to accommodate more complex projects.",
    },
    {
      question: "Do you provide robotics kits for students?",
      answer:
        "Yes, we provide age-appropriate robotics kits for all our courses. These kits are specially designed for our curriculum and are yours to keep after completing the course. For online students, we ship the kits directly to your home. Offline students use the kits during class and can take them home for project work.",
    },
    {
      question: "Can I try a class before enrolling?",
      answer:
        "Yes, we offer trial classes for all our courses. You can experience our teaching methodology and interact with the instructor before making a commitment. Please contact our admissions team to schedule a trial class that fits your schedule.",
    },
    {
      question: "What is your refund policy?",
      answer:
        "We offer a 100% money-back guarantee if you&#39;re not satisfied with your first class. For ongoing courses, we provide prorated refunds based on the remaining sessions. Please refer to our complete refund policy on our website or contact our support team for specific details.",
    },
    {
      question: "How do you ensure safety during hands-on activities?",
      answer:
        "Safety is our top priority. All our equipment is regularly maintained and safety-checked. Students receive safety training before using any tools or equipment. Our classrooms have first-aid facilities, and instructors are trained in safety protocols. For online classes, we provide detailed safety instructions for home-based activities.",
    },
    {
      question: "Do you prepare students for robotics competitions?",
      answer:
        "Yes, we have a dedicated competition preparation program. Our students regularly participate in national and international robotics competitions like FIRST LEGO League, VEX Robotics, and World Robot Olympiad. We provide specialized training, mentorship, and support for competition participants.",
    },
    {
      question: "How do you assess student progress?",
      answer:
        "We use a combination of continuous assessment methods including project evaluations, quizzes, peer reviews, and portfolio assessments. Students receive regular feedback and progress reports. We also conduct monthly parent-teacher meetings to discuss student development and areas for improvement.",
    },
    {
      question: "Can parents monitor their child&#39;s progress?",
      answer:
        "Absolutely! Parents have access to our online learning portal where they can track their child&#39;s attendance, assignments, grades, and progress reports. We also send monthly progress updates via email and encourage parents to participate in our quarterly review sessions.",
    },
    {
      question: "What programming languages do you teach?",
      answer:
        "We start with visual programming languages like Scratch for younger students (5-10 years) and gradually introduce text-based languages like Python and JavaScript. For advanced courses, we teach C++, Java, and other industry-standard languages depending on the robotics platform being used.",
    },
    {
      question: "How do you handle different skill levels in the same class?",
      answer:
        "We group students by skill level and age to ensure an optimal learning environment. Within each group, we use differentiated instruction techniques to accommodate varying skill levels. Advanced students can work on additional challenges while beginners receive extra support.",
    },
    {
      question: "What happens if I miss a class?",
      answer:
        "If you miss a class, we provide recorded sessions and materials to help you catch up. For offline classes, you can attend a makeup session in another batch if available. For online classes, we offer flexible scheduling options to accommodate rescheduling needs.",
    },
    {
      question: "Do you offer summer camps or holiday programs?",
      answer:
        "Yes, we organize special summer camps and holiday programs throughout the year. These intensive programs focus on specific themes like AI, drone technology, or advanced robotics. They're designed to provide immersive learning experiences during school breaks.",
    },
    {
      question: "How do I enroll in a course?",
      answer:
        "You can enroll through our website by selecting the course and filling out the registration form. Alternatively, you can visit our center or call our admissions team. After registration, you'll receive a confirmation email with payment instructions and course details.",
    },
    {
      question: "Are there any prerequisites for joining advanced courses?",
      answer:
        "Most of our advanced courses require completion of prerequisite courses or equivalent experience. We conduct assessment tests to determine the appropriate level for each student. Our team can help you identify the right starting point based on your experience and goals.",
    },
    {
      question:
        "What support do you offer for students struggling with concepts?",
      answer:
        "We provide multiple support options including one-on-one mentoring sessions, additional practice materials, and peer study groups. Our instructors are available for extra help during designated hours. We also offer remedial classes for students who need focused attention on specific topics.",
    },
    {
      question: "Do you offer career guidance related to STEM fields?",
      answer:
        "Yes, we provide comprehensive career guidance including information about STEM careers, college admissions, scholarship opportunities, and internship programs. We organize career counseling sessions with industry professionals and alumni to help students make informed decisions about their future.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#8D0F11] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Frequently Asked{" "}
              <span className="text-yellow-300">Questions</span>
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl max-w-2xl mx-auto text-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Find answers to common questions about our robotics programs and
              courses
            </motion.p>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-64 h-64 bg-yellow-400 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-64 h-64 bg-red-800 rounded-full opacity-30 blur-3xl"></div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                General Questions
              </h2>
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border border-gray-200 rounded-xl px-4 hover:border-[#8D0F11] transition-colors"
                  >
                    <AccordionTrigger className="py-4 text-left text-lg font-medium text-gray-800 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Additional Info */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              If you can&#39;t find the answer you&#39;re looking for, please
              contact our support team. We&#39;re here to help you with any
              questions about our robotics programs.
            </p>
            <Link
              href="/contact-us"
              className="inline-flex items-center px-6 py-3 bg-[#8D0F11] text-white font-medium rounded-xl hover:bg-red-800 transition-colors shadow-md hover:shadow-lg"
            >
              Contact Us
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
