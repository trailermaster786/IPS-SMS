"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  ClipboardCheck,
  BarChart3,
  DollarSign,
  Megaphone,
  MessageSquare,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronRight,
  School,
} from "lucide-react";
import { useState } from "react";

const navConfig: Record<string, { label: string; icon: typeof LayoutDashboard; href: string }[]> = {
  admin: [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard/admin" },
    { label: "Users", icon: Users, href: "/dashboard/admin/users" },
    { label: "Classes", icon: BookOpen, href: "/dashboard/admin/classes" },
    { label: "Subjects", icon: GraduationCap, href: "/dashboard/admin/subjects" },
    { label: "Timetable", icon: Calendar, href: "/dashboard/admin/timetable" },
    { label: "Attendance", icon: ClipboardCheck, href: "/dashboard/admin/attendance" },
    { label: "Results", icon: BarChart3, href: "/dashboard/admin/results" },
    { label: "Fees", icon: DollarSign, href: "/dashboard/admin/fees" },
    { label: "Announcements", icon: Megaphone, href: "/dashboard/admin/announcements" },
  ],
  teacher: [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard/teacher" },
    { label: "My Classes", icon: BookOpen, href: "/dashboard/teacher/classes" },
    { label: "Attendance", icon: ClipboardCheck, href: "/dashboard/teacher/attendance" },
    { label: "Assignments", icon: FileText, href: "/dashboard/teacher/assignments" },
    { label: "Results", icon: BarChart3, href: "/dashboard/teacher/results" },
    { label: "Announcements", icon: Megaphone, href: "/dashboard/teacher/announcements" },
    { label: "Messages", icon: MessageSquare, href: "/dashboard/teacher/messages" },
  ],
  student: [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard/student" },
    { label: "Timetable", icon: Calendar, href: "/dashboard/student/timetable" },
    { label: "Assignments", icon: FileText, href: "/dashboard/student/assignments" },
    { label: "Results", icon: BarChart3, href: "/dashboard/student/results" },
    { label: "Attendance", icon: ClipboardCheck, href: "/dashboard/student/attendance" },
    { label: "Announcements", icon: Megaphone, href: "/dashboard/student/announcements" },
  ],
  parent: [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard/parent" },
    { label: "My Children", icon: Users, href: "/dashboard/parent/children" },
    { label: "Fees & Payments", icon: DollarSign, href: "/dashboard/parent/fees" },
    { label: "Announcements", icon: Megaphone, href: "/dashboard/parent/announcements" },
    { label: "Messages", icon: MessageSquare, href: "/dashboard/parent/messages" },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = session?.user?.role?.toLowerCase() || "";
  const navItems = navConfig[role] || [];
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50/80">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex flex-col",
        "bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950",
        "border-r border-white/5 sidebar-glow",
        "transition-all duration-300 ease-out",
        "lg:relative lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 animate-pulse-glow">
            <School className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">SMS</h1>
            <p className="text-[10px] text-indigo-300/70 uppercase tracking-widest font-medium">{role} Portal</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto lg:hidden text-white/60 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <Link
            href="/"
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/5 mb-2"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-all duration-200">
              <School className="h-4 w-4" />
            </div>
            <span className="flex-1">Home</span>
          </Link>
          <div className="h-px bg-white/5 my-2" />
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "nav-item group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/10 text-white shadow-lg shadow-indigo-500/10"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-br from-indigo-400 to-violet-500 text-white shadow-md shadow-indigo-500/20"
                    : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight className="h-4 w-4 text-indigo-300 animate-fade-in-right" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="p-3 border-t border-white/5">
          <DropdownMenu>
            <DropdownMenuTrigger render={<button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer" />}>
              <Avatar className="h-9 w-9 ring-2 ring-indigo-400/30">
                <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-violet-500 text-white text-xs font-bold">
                  {getInitials(session?.user?.name || "User")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{session?.user?.email}</p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-gray-200 shadow-xl">
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar (Mobile) */}
        <div className="sticky top-0 z-30 lg:hidden glass border-b border-gray-200/50 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <School className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">SMS</span>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
