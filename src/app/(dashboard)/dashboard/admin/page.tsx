"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Activity,
  UserPlus,
  Calendar,
  ClipboardCheck,
  Megaphone,
  BarChart3,
} from "lucide-react";

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  attendanceRate: number;
  feeCollection: {
    totalCollected: number;
    totalOutstanding: number;
    totalOverdue: number;
  };
  recentActivity: {
    id: string;
    action: string;
    details: string;
    userName: string;
    createdAt: string;
  }[];
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        setStats(await response.json());
      }
    } catch {
      console.error("Failed to fetch stats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      await fetchStats();
    }
    loadData();
  }, []);

  const statCards = [
    {
      label: "Total Students",
      value: stats?.totalStudents ?? 0,
      icon: GraduationCap,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      label: "Total Teachers",
      value: stats?.totalTeachers ?? 0,
      icon: Users,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      label: "Active Classes",
      value: stats?.totalClasses ?? 0,
      icon: BookOpen,
      gradient: "from-violet-500 to-purple-600",
    },
    {
      label: "Attendance Rate",
      value: `${stats?.attendanceRate ?? 0}%`,
      icon: ClipboardCheck,
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  const quickActions = [
    { label: "Admit Student", icon: UserPlus, path: "/dashboard/admin/admission" },
    { label: "Manage Users", icon: Users, path: "/dashboard/admin/users" },
    { label: "Timetable", icon: Calendar, path: "/dashboard/admin/timetable" },
    { label: "Announcements", icon: Megaphone, path: "/dashboard/admin/announcements" },
    { label: "Results", icon: BarChart3, path: "/dashboard/admin/results" },
    { label: "Fee Management", icon: DollarSign, path: "/dashboard/admin/fees" },
  ];

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">
          Welcome back, {session?.user?.name}
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening at your school today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="group border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover card-border-gradient overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold stat-number">
                      {isLoading ? (
                        <span className="inline-block h-8 w-16 bg-gray-200 rounded animate-pulse" />
                      ) : (
                        stat.value
                      )}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-children" style={{ animationDelay: "0.3s" }}>
        <Card className="lg:col-span-2 border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
              <Activity className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="space-y-4">
              {isLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                ))
              ) : (stats?.recentActivity ?? []).length > 0 ? (
                stats!.recentActivity.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className={`w-2 h-2 rounded-full ${i % 4 === 0 ? "bg-blue-500" : i % 4 === 1 ? "bg-emerald-500" : i % 4 === 2 ? "bg-violet-500" : "bg-amber-500"} group-hover:scale-150 transition-transform`} />
                    <p className="flex-1 text-sm text-gray-700">
                      <span className="font-medium">{item.userName}</span> {item.action}
                      {item.details && ` - ${item.details}`}
                    </p>
                    <span className="text-xs text-gray-400" suppressHydrationWarning>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-500 to-violet-600 text-white card-hover">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => router.push(action.path)}
                    className="w-full text-left px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium transition-all duration-200 hover:translate-x-1 flex items-center gap-3"
                  >
                    <Icon className="h-4 w-4" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-children" style={{ animationDelay: "0.4s" }}>
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Outstanding Fees</p>
                <p className="text-2xl font-bold mt-1">
                  ${stats?.feeCollection?.totalOutstanding?.toLocaleString() ?? 0}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-amber-500" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full text-indigo-600 hover:text-indigo-700"
              onClick={() => router.push("/dashboard/admin/fees")}
            >
              View Details
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Collected</p>
                <p className="text-2xl font-bold mt-1">
                  ${stats?.feeCollection?.totalCollected?.toLocaleString() ?? 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full text-indigo-600 hover:text-indigo-700"
              onClick={() => router.push("/dashboard/admin/fees")}
            >
              View Details
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Overdue Fees</p>
                <p className="text-2xl font-bold mt-1">
                  ${stats?.feeCollection?.totalOverdue?.toLocaleString() ?? 0}
                </p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-red-500" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full text-indigo-600 hover:text-indigo-700"
              onClick={() => router.push("/dashboard/admin/fees")}
            >
              View Details
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
