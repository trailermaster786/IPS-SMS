"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  School,
  Shield,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  ClipboardCheck,
  BarChart3,
  DollarSign,
  Megaphone,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Lock,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Four distinct portals for Admin, Teachers, Students, and Parents with secure authentication.",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    icon: Users,
    title: "User Management",
    description: "Full CRUD for managing teachers, students, parents, and administrative staff.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: BookOpen,
    title: "Class & Subject",
    description: "Organize classes, assign subjects, and link teachers to class-subject combinations.",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: Calendar,
    title: "Timetable",
    description: "Weekly schedule management with day-by-day class and teacher assignments.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: ClipboardCheck,
    title: "Attendance",
    description: "Teachers mark daily attendance; students and parents track history.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: BarChart3,
    title: "Results & Grades",
    description: "Enter exam results with auto-grade calculation and performance tracking.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: DollarSign,
    title: "Fee Management",
    description: "Invoice tracking, payment management, and Stripe integration for online payments.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Megaphone,
    title: "Announcements",
    description: "Role-targeted announcements for teachers, students, and parents.",
    gradient: "from-fuchsia-500 to-pink-600",
  },
];

const roles = [
  {
    icon: Shield,
    role: "Admin",
    color: "from-indigo-500 to-violet-600",
    features: ["Full system control", "User management", "Fee oversight", "Announcements"],
  },
  {
    icon: GraduationCap,
    role: "Teacher",
    color: "from-emerald-500 to-teal-600",
    features: ["Mark attendance", "Create assignments", "Enter results", "Post announcements"],
  },
  {
    icon: Users,
    role: "Student",
    color: "from-amber-500 to-orange-600",
    features: ["View timetable", "Track assignments", "Check grades", "View attendance"],
  },
  {
    icon: Users,
    role: "Parent",
    color: "from-rose-500 to-pink-600",
    features: ["Monitor children", "Pay fees online", "View announcements", "Send messages"],
  },
];

const stats = [
  { label: "Active Users", value: "200+" },
  { label: "Classes", value: "8" },
  { label: "Subjects", value: "15" },
  { label: "Teachers", value: "12" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <School className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">SMS</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="rounded-xl text-gray-600 hover:text-gray-900">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/25">
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-login-gradient" />
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-violet-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm mb-8 animate-fade-in-down">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-medium text-gray-700">Modern School Management System</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up">
            <span className="bg-gradient-to-r from-gray-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">
              Manage Your School
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              With Confidence
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            A comprehensive, modern platform for administrators, teachers, students, and parents.
            Streamline attendance, grades, fees, and communication — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-xl shadow-indigo-500/25 text-base font-semibold btn-ripple">
                <Zap className="h-5 w-5 mr-2" />
                Launch Dashboard
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-2xl border-gray-300 text-base font-semibold hover:bg-gray-50">
                Learn More
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-16 stagger-children" style={{ animationDelay: "0.4s" }}>
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A complete suite of tools designed for modern school management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 card-hover">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role Portals Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent mb-4">
              Four Role Portals
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Each user role gets a tailored dashboard with relevant tools and information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {roles.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.role} className="group relative p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${r.color}`} />
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${r.color} flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{r.role}</h3>
                  <ul className="space-y-2">
                    {r.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/login" className="mt-6 block">
                    <Button variant="outline" className="w-full rounded-xl text-sm group-hover:bg-gray-50 transition-colors">
                      Sign in as {r.role}
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative p-12 md:p-16 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white overflow-hidden">
            <div className="absolute inset-0 bg-mesh opacity-20" />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="relative text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your School?</h2>
              <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
                Join hundreds of schools already using SMS to streamline their operations.
              </p>
              <Link href="/login">
                <Button size="lg" className="h-14 px-8 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 shadow-xl text-base font-semibold">
                  <Lock className="h-5 w-5 mr-2" />
                  Access Your Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <School className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">SMS</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
              <Link href="/login" className="hover:text-gray-900 transition-colors">Sign In</Link>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Globe className="h-4 w-4" />
              <span>School Management System v1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
