import React from "react";
import { Users, ShieldCheck, Award, Headphones } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
  titleColor: string;
}

const FEATURES: Feature[] = [
  {
    icon: Users,
    title: "Expert Mentors",
    description: "Learn from industry professionals",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    titleColor: "text-purple-700",
  },
  {
    icon: ShieldCheck,
    title: "Hands-on Projects",
    description: "Build real-world projects and boost skills",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    titleColor: "text-green-700",
  },
  {
    icon: Award,
    title: "Certificate of Completion",
    description: "Earn certificates to showcase your achievements",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    titleColor: "text-orange-700",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "We're here to help you every step of the way",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    titleColor: "text-blue-700",
  },
];

const FeatureHighlights = () => {
  return (
    <div className="rounded-2xl border border-gray-200/70 bg-gradient-to-r from-purple-50 via-orange-50/60 to-orange-50 px-6 py-8 sm:px-10 sm:py-10">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(
          ({
            icon: Icon,
            title,
            description,
            iconBg,
            iconColor,
            titleColor,
          }) => (
            <div key={title} className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBg}`}
              >
                <Icon className={`h-6 w-6 ${iconColor}`} strokeWidth={2} />
              </div>
              <div>
                <h3 className={`text-base font-semibold ${titleColor}`}>
                  {title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default FeatureHighlights;
