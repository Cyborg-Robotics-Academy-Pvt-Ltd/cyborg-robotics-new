// components/MeetTheMentors/types.ts
import { ReactNode } from "react";

export interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  tags: string[];
  image?: string;
  linkedinUrl?: string;
  specialtyIcon: ReactNode;
}

export interface Stat {
  icon: ReactNode;
  value: string;
  label: string;
}