import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Gauge,
  GraduationCap,
  ListChecks,
  Mail,
  Settings,
  ShieldCheck,
} from "lucide-react";

export const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Gauge,
  },
  {
    title: "Competitions",
    href: "/competitions",
    icon: ShieldCheck,
  },
  {
    title: "Students",
    href: "/students",
    icon: GraduationCap,
  },
  {
    title: "Activities",
    href: "/activities",
    icon: Activity,
  },
  {
    title: "Timeline",
    href: "/timeline",
    icon: CalendarDays,
  },
  {
    title: "Student Timeline",
    href: "/student-timeline",
    icon: ListChecks,
  },
  {
    title: "Conflicts",
    href: "/conflicts",
    icon: AlertTriangle,
  },
  {
    title: "Notices",
    href: "/notices",
    icon: Mail,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
] as const;
