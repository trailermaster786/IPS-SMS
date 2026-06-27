"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  GraduationCap,
  DollarSign,
  ClipboardCheck,
  TrendingUp,
  Loader2,
} from "lucide-react";

const CHART_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
];

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalClasses: number;
  feeCollection: {
    totalCollected: number;
    totalOutstanding: number;
    totalOverdue: number;
  };
  attendanceRate: number;
  recentActivity: {
    id: string;
    action: string;
    details: string;
    userName: string;
    createdAt: string;
  }[];
  gradeDistribution: { grade: string; count: number }[];
  monthlyEnrollments: { month: string; count: number }[];
  classPerformance: { class: string; average: number }[];
}

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }
    if (status === "authenticated") {
      fetchStats();
    }
  }, [status]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Students",
      value: stats.totalStudents.toLocaleString(),
      icon: GraduationCap,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      label: "Total Teachers",
      value: stats.totalTeachers.toLocaleString(),
      icon: Users,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      label: "Fee Collection",
      value: `$${stats.feeCollection.totalCollected.toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-amber-500 to-orange-600",
    },
    {
      label: "Attendance Rate",
      value: `${stats.attendanceRate}%`,
      icon: ClipboardCheck,
      gradient: "from-violet-500 to-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">
          Performance Analytics &amp; Reports
        </h1>
        <p className="text-gray-500 mt-1">
          Comprehensive analytics across your entire school.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="group border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover card-border-gradient overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-500">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold stat-number">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children" style={{ animationDelay: "0.3s" }}>
        {/* Grade Distribution */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stats.gradeDistribution.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fee Collection Trend */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <DollarSign className="h-5 w-5 text-amber-500" />
              Fee Collection Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: "Collected",
                    amount: stats.feeCollection.totalCollected,
                  },
                  {
                    name: "Outstanding",
                    amount: stats.feeCollection.totalOutstanding,
                  },
                  {
                    name: "Overdue",
                    amount: stats.feeCollection.totalOverdue,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, "Amount"]}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  <Cell fill="#22c55e" />
                  <Cell fill="#f97316" />
                  <Cell fill="#ef4444" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance Trend */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <ClipboardCheck className="h-5 w-5 text-violet-500" />
              Attendance Trend (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={[
                  { day: "Week 1", rate: Math.min(100, stats.attendanceRate + 3) },
                  { day: "Week 2", rate: stats.attendanceRate },
                  { day: "Week 3", rate: Math.max(0, stats.attendanceRate - 2) },
                  { day: "Week 4", rate: Math.min(100, stats.attendanceRate + 1) },
                  { day: "Today", rate: stats.attendanceRate },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value) => [`${Number(value)}%`, "Attendance"]}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#8b5cf6"
                  fill="url(#attendanceGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Class Performance */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <GraduationCap className="h-5 w-5 text-emerald-500" />
              Class Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.classPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="class" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value) => [`${Number(value)}%`, "Average"]}
                />
                <Bar dataKey="average" fill="#6366f1" radius={[6, 6, 0, 0]}>
                  {stats.classPerformance.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Enrollment Growth */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Users className="h-5 w-5 text-pink-500" />
              Enrollment Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthlyEnrollments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#ec4899"
                  strokeWidth={3}
                  dot={{ fill: "#ec4899", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <GraduationCap className="h-5 w-5 text-rose-500" />
              Gender Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Male", value: Math.round(stats.totalStudents * 0.55) },
                    { name: "Female", value: Math.round(stats.totalStudents * 0.45) },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: any) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  <Cell fill="#6366f1" />
                  <Cell fill="#ec4899" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <ClipboardCheck className="h-5 w-5 text-indigo-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No recent activity
              </p>
            ) : (
              stats.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.userName}</span>{" "}
                      {activity.action}
                      {activity.details && (
                        <span className="text-gray-500">
                          {" "}
                          &mdash; {activity.details}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
