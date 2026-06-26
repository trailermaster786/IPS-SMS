"use client";

import { useState, useEffect, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  GraduationCap,
  Users,
  UserCheck,
  Loader2,
  Sparkles,
  BookOpen,
  School,
} from "lucide-react";

const quickLoginAccounts = [
  {
    role: "Admin",
    email: "admin@school.com",
    password: "admin123",
    icon: Shield,
    gradient: "from-indigo-500 to-violet-600",
    glow: "shadow-indigo-500/25",
    hoverBg: "hover:bg-indigo-50",
    borderHover: "hover:border-indigo-400",
    badge: "ADMIN",
    badgeBg: "bg-gradient-to-r from-indigo-500 to-violet-600",
  },
  {
    role: "Teacher",
    email: "teacher1@school.com",
    password: "teacher123",
    icon: GraduationCap,
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/25",
    hoverBg: "hover:bg-emerald-50",
    borderHover: "hover:border-emerald-400",
    badge: "TEACHER",
    badgeBg: "bg-gradient-to-r from-emerald-500 to-teal-600",
  },
  {
    role: "Student",
    email: "student1@school.com",
    password: "student123",
    icon: Users,
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/25",
    hoverBg: "hover:bg-amber-50",
    borderHover: "hover:border-amber-400",
    badge: "STUDENT",
    badgeBg: "bg-gradient-to-r from-amber-500 to-orange-600",
  },
  {
    role: "Parent",
    email: "parent1@school.com",
    password: "parent123",
    icon: UserCheck,
    gradient: "from-rose-500 to-pink-600",
    glow: "shadow-rose-500/25",
    hoverBg: "hover:bg-rose-50",
    borderHover: "hover:border-rose-400",
    badge: "PARENT",
    badgeBg: "bg-gradient-to-r from-rose-500 to-pink-600",
  },
];

function Particles() {
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.3 + 0.1,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle bg-indigo-400/30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-gradient-to-br from-indigo-400/20 to-violet-400/20 rounded-full blur-3xl animate-float" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: "-6s" }} />
      <div className="absolute bottom-1/3 left-1/4 w-36 h-36 bg-gradient-to-br from-violet-400/15 to-fuchsia-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: "-9s" }} />
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleQuickLogin = useCallback((account: typeof quickLoginAccounts[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setActiveCard(account.role);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        const response = await fetch("/api/auth/session");
        const session = await response.json();

        if (session?.user?.mustChangePassword) {
          router.push("/change-password");
        } else {
          const role = session?.user?.role?.toLowerCase();
          router.push(`/dashboard/${role}`);
        }
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-login-gradient relative flex items-center justify-center p-4 overflow-hidden">
      <Particles />
      <FloatingShapes />

      {/* Background decoration */}
      <div className="absolute inset-0 bg-mesh" />

      <div className={`relative z-10 w-full max-w-lg transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Logo / Header */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-4 animate-float">
            <School className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">
            School Management
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your dashboard</p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl shadow-indigo-500/5 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 animate-fade-in-down">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-gray-200 bg-white/60 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-300"
                required
              />
            </div>

            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-gray-200 bg-white/60 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-300"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 btn-ripple animate-fade-in-up"
              style={{ animationDelay: "0.25s" }}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span>Sign In</span>
                </div>
              )}
            </Button>
          </form>
        </div>

        {/* Quick Login Section */}
        <div className="mt-8 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Quick Access
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-3 stagger-children">
            {quickLoginAccounts.map((account) => {
              const Icon = account.icon;
              const isActive = activeCard === account.role;
              return (
                <button
                  key={account.role}
                  onClick={() => handleQuickLogin(account)}
                  disabled={isLoading}
                  className={`
                    group relative flex items-center gap-3 p-4 rounded-2xl border-2 text-left
                    transition-all duration-300 cursor-pointer
                    ${isActive
                      ? `border-indigo-400 bg-indigo-50/80 shadow-lg ${account.glow} scale-[1.02]`
                      : `border-white/60 bg-white/50 hover:border-gray-300 hover:bg-white/80 hover:shadow-md hover:-translate-y-0.5`
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                    backdrop-blur-sm
                  `}
                >
                  <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${account.gradient} text-white shadow-md ${account.glow} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{account.role}</p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{account.email}</p>
                  </div>
                  <span className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ${account.badgeBg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                    {account.badge}
                  </span>
                  {isActive && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center shadow-md animate-scale-in">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 animate-fade-in-up space-y-2" style={{ animationDelay: "0.5s" }}>
          <p>
            <a href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              &larr; Back to Home
            </a>
          </p>
          <p className="text-xs text-gray-400">
            <BookOpen className="inline h-3 w-3 mr-1" />
            Powered by School Management System v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
