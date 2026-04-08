export type AgeGroup = "4+" | "7+" | "10+";
export type LocationId = "magarpatta" | "kalyani" | "kharadi";

export interface RegistrationFormData {
  childName: string;
  age: string;
  contactNumber: string;
}

export interface RegistrationField {
  id: keyof RegistrationFormData;
  label: string;
  type: "tel" | "text" | "number";
  placeholder: string;
  span: 1 | 2;
}

export interface WeekSchedule {
  week: string;
  dates: string;
  course: string;
  tag: string;
  icon: string;
  prices: Record<AgeGroup, number>;
}

export interface CampSlide {
  emoji: string;
  label: string;
  sublabel: string;
}

export interface HeroImageSlide {
  src: string;
  alt: string;
}

export interface CampLocation {
  id: LocationId;
  name: string;
  emoji: string;
  days: string;
  totalHours: string;
  packageDates: string;
  schedule: WeekSchedule[];
  fullPackage: {
    prices: Record<AgeGroup, number>;
    earlyBird: Record<AgeGroup, number>;
  };
  slides: CampSlide[];
}

export interface Course {
  id: string;
  icon: string;
  name: string;
  subtitle: string;
  color: string;
  bg: string;
  border: string;
  description: string;
  outcomes: string[];
  image: string;
  duration: string;
  ageGroup: string;
  highlight?: boolean;
}

export interface WhyItem {
  icon: string;
  title: string;
  desc: string;
}

export interface FAQItem {
  q: string;
  a: string;
}
