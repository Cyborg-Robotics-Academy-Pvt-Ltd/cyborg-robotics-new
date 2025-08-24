import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleDownloadSyllabus = (syllabusPath: string, syllabusFileName: string) => {
  const link = document.createElement("a");
  link.href = syllabusPath;
  link.download = syllabusFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: custom * 0.1 },
  }),
};

export const getIconComponent = (iconName: string) => {
  // This function will be implemented in the component that uses it
  // since we need to import Lucide icons dynamically
  return iconName;
};
