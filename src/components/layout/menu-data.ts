import type { LucideIcon } from 'lucide-react';
import { BookOpen, Building2, Calendar, Camera, FileText, Phone, Users, Award, BookCopy, HandHelping, PersonStanding, Drama, Trophy, Sparkles, FolderKanban } from 'lucide-react';

export interface MenuItem {
  title: string;
  icon?: LucideIcon;
  href?: string;
  children?: MenuItem[];
}

const offlineCourseChildren: MenuItem[] = [
    { title: 'Age 5–7', href: '#' },
    { title: 'Age 7–10', href: '#' },
    { title: 'Age 10–12', href: '#' },
];

const competitionChildren: MenuItem[] = [
    { title: 'Regional', href: '#' },
    { title: 'National', href: '#' },
    { title: 'International', href: '#' },
];

const mainMenu: MenuItem[] = [
  {
   title: 'Courses',
    icon: BookOpen,
    children: [
      { title: 'Online Course', href: '#', icon: BookCopy },
      { title: 'Offline Course', href: '#', icon: PersonStanding, children: offlineCourseChildren },
      { title: 'Soft Skills', href: '#', icon: HandHelping },
    ],
  },
  {
    title: 'About Us',
    icon: Building2,
    children: [
      { title: 'Brand Stories', href: '/about#story', icon: Sparkles },
      { title: 'Meet the Team', href: '/about#team', icon: Users },
      { title: 'Meet the Founder', href: '/about#founders', icon: PersonStanding },
      { title: 'Join Us', href: '', icon: HandHelping },
    ],
  },
  {
    title: 'Event Stories',
    icon: Calendar,
    children: [
        { title: 'Workshop', href: '#', icon: Drama },
        { title: 'Competition (categorized)', href: '#', icon: Trophy, children: competitionChildren },
        { title: 'Team Huddle', href: '#', icon: Users },
        { title: 'Celebrations', href: '#', icon: Sparkles },
    ],
  },
  {
    title: 'Class Clicks | Behind Scenes',
    icon: Camera,
    children: [
        { title: 'Student Certificate', href: '#', icon: Award },
        { title: 'Student Action', href: '#', icon: FolderKanban },
        { title: 'Student in (Competition) Glory', href: '#', icon: Trophy },
    ],
  },
  {
    title: 'Blogs + Newsletter',
    icon: FileText,
    href: '#',
  },
  {
    title: 'Contact Us',
    icon: Phone,
    href: 'contact-us',
  },
];


export const menuData = {
    mainMenu,
};
