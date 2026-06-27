"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
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
  BookOpen,
  Users,
  FileText,
  ClipboardCheck,
  Clock,
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
  totalClasses: number;
  totalStudents: number;
  totalAssignments: number;
  attendanceRate: number;
  todaySchedule: {
    id: string;
    className: string;
    subject: string;
    startTime: string;
    endTime: string;
  }[];
  recentSubmissions: {
    id: string;
    studentName: string;
    assignmentTitle: string;
    grade: number | null;
    submittedAt: string;
  }[];
  classAverages: {
    class: string;
    subject: string;
    average: number;
  }[];
}

export default function TeacherAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (session?.user?.role !== "TEACHER") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/teacher/stats");
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
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const statCards = [
    {
      label: "My Classes",
      value: stats.totalClasses.toLocaleString(),
      icon: BookOpen,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      label: "Total Students",
      value: stats.totalStudents.toLocaleString(),
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      label: "Assignments",
      value: stats.totalAssignments.toLocaleString(),
      icon: FileText,
      gradient: "from-violet-500 to-purple-600",
    },
    {
      label: "Attendance Rate",
      value: `${stats.attendanceRate}%`,
      icon: ClipboardCheck,
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  const assignmentData = stats.recentSubmissions.reduce(
    (acc, sub) => {
      const existing = acc.find((a) => a.name === sub.assignmentTitle);
      if (existing) {
        existing.total++;
        if (sub.grade !== null) existing.graded++;
      } else {
        acc.push({
          name: sub.assignmentTitle,
          total: 1,
          graded: sub.grade !== null ? 1 : 0,
        });
      }
      return acc;
    },
    [] as { name: string; total: number; graded: number }[]
  );

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">
          My Teaching Analytics
        </h1>
        <p className="text-gray-500 mt-1">
          Track your teaching performance and class metrics.
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children" style={{ animationDelay: "0.3s" }}>
        {/* Class Performance */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              Class Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.classAverages.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No class data available
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.classAverages}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="class" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value) => [`${Number(value)}%`, "Average"]}
                  />
                  <Bar dataKey="average" radius={[6, 6, 0, 0]}>
                    {stats.classAverages.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Assignment Submission Rates */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <FileText className="h-5 w-5 text-violet-500" />
              Assignment Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignmentData.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No assignment data available
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={assignmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="total"
                    name="Total"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="graded"
                    name="Graded"
                    fill="#22c55e"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Attendance by Class */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <ClipboardCheck className="h-5 w-5 text-amber-500" />
              Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Present", value: stats.attendanceRate },
                      { name: "Absent", value: Math.max(0, 100 - stats.attendanceRate) },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }: any) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value) => [`${Number(value)}%`, "Rate"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-sm text-emerald-600 font-medium">
                    Overall Attendance Rate
                  </p>
                  <p className="text-3xl font-bold text-emerald-700">
                    {stats.attendanceRate}%
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-sm text-gray-600 font-medium">
                    Classes Taught
                  </p>
                  <p className="text-3xl font-bold text-gray-700">
                    {stats.totalClasses}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-sm text-blue-600 font-medium">
                    Total Students
                  </p>
                  <p className="text-3xl font-bold text-blue-700">
                    {stats.totalStudents}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Clock className="h-5 w-5 text-indigo-500" />
            Today&apos;s Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.todaySchedule.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No classes scheduled for today
            </p>
          ) : (
            <div className="space-y-3">
              {stats.todaySchedule.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="text-xs font-mono text-gray-400 w-28">
                    {slot.startTime} - {slot.endTime}
                  </div>
                  <div className="w-1 h-8 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {slot.subject}
                    </p>
                    <p className="text-xs text-gray-400">{slot.className}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <FileText className="h-5 w-5 text-pink-500" />
            Recent Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentSubmissions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No recent submissions
            </p>
          ) : (
            <div className="space-y-3">
              {stats.recentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                    {sub.studentName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {sub.studentName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {sub.assignmentTitle}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      sub.grade !== null
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {sub.grade !== null ? `Grade: ${sub.grade}` : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
