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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ClipboardCheck,
  BarChart3,
  FileText,
  Calendar,
  Clock,
  BookOpen,
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
  attendancePercentage: number;
  upcomingAssignments: number;
  averageGrade: string;
  upcomingExams: number;
  todayClasses: {
    id: string;
    subject: string;
    startTime: string;
    endTime: string;
  }[];
  recentGrades: {
    id: string;
    subject: string;
    grade: string | null;
    marks: number;
    totalMarks: number;
    examType: string;
    date: string;
  }[];
  attendanceTrend: {
    date: string;
    percentage: number;
  }[];
}

export default function StudentAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (session?.user?.role !== "STUDENT") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/student/stats");
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Attendance",
      value: `${stats.attendancePercentage}%`,
      icon: ClipboardCheck,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      label: "Average Grade",
      value: stats.averageGrade,
      icon: BarChart3,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      label: "Assignments Due",
      value: stats.upcomingAssignments.toLocaleString(),
      icon: FileText,
      gradient: "from-amber-500 to-orange-600",
    },
    {
      label: "Exams Coming",
      value: stats.upcomingExams.toLocaleString(),
      icon: Calendar,
      gradient: "from-violet-500 to-purple-600",
    },
  ];

  const gradePoints: Record<string, number> = {
    "A+": 4.0,
    A: 4.0,
    "B+": 3.5,
    B: 3.0,
    "C+": 2.5,
    C: 2.0,
    D: 1.0,
    F: 0,
  };

  const gradeTrendData = stats.recentGrades
    .slice()
    .reverse()
    .map((g, i) => ({
      name: g.subject,
      points: g.grade ? gradePoints[g.grade] ?? 0 : 0,
      grade: g.grade || "N/A",
      index: i + 1,
    }));

  const subjectPerformance = stats.recentGrades.reduce(
    (acc, g) => {
      const existing = acc.find((a) => a.subject === g.subject);
      if (existing) {
        existing.total += g.marks;
        existing.count += g.totalMarks;
      } else {
        acc.push({
          subject: g.subject,
          total: g.marks,
          count: g.totalMarks,
        });
      }
      return acc;
    },
    [] as { subject: string; total: number; count: number }[]
  ).map((s) => ({
    subject: s.subject,
    percentage: s.count > 0 ? Math.round((s.total / s.count) * 100) : 0,
  }));

  const attendanceFormatted = stats.attendanceTrend.map((d) => {
    const date = new Date(d.date);
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return {
      date: `${monthNames[date.getMonth()]} ${date.getDate()}`,
      percentage: d.percentage,
    };
  });

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
          My Performance
        </h1>
        <p className="text-gray-500 mt-1">
          Track your academic progress and performance.
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
        {/* Grade Trend */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              Grade Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gradeTrendData.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No grade data available
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={gradeTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis
                    domain={[0, 4.5]}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v: number) => {
                      const grades = ["F", "D", "C", "C+", "B", "B+", "A", "A+"];
                      const idx = Math.round(v * 2);
                      return grades[Math.min(idx, grades.length - 1)] || "";
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value, _name, props) => [
                      props?.payload?.grade || "N/A",
                      "Grade",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="points"
                    stroke="#22c55e"
                    strokeWidth={3}
                    dot={{ fill: "#22c55e", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Attendance Trend */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <ClipboardCheck className="h-5 w-5 text-blue-500" />
              Attendance (Last 14 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={attendanceFormatted}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
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
                  dataKey="percentage"
                  stroke="#3b82f6"
                  fill="url(#studentAttendanceGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient
                    id="studentAttendanceGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#3b82f6"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="#3b82f6"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <BookOpen className="h-5 w-5 text-violet-500" />
              Subject Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subjectPerformance.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No subject data available
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value) => [`${Number(value)}%`, "Score"]}
                  />
                  <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                    {subjectPerformance.map((_, index) => (
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
      </div>

      {/* Today's Classes */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Clock className="h-5 w-5 text-indigo-500" />
            Today&apos;s Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.todayClasses.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No classes today
            </p>
          ) : (
            <div className="space-y-3">
              {stats.todayClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="text-xs font-mono text-gray-400 w-28">
                    {cls.startTime} - {cls.endTime}
                  </div>
                  <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-400 to-indigo-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {cls.subject}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Grades */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <BarChart3 className="h-5 w-5 text-pink-500" />
            Recent Grades
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentGrades.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No grades available yet
            </p>
          ) : (
            <div className="space-y-3">
              {stats.recentGrades.map((grade) => (
                <div
                  key={grade.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-xs font-bold text-violet-600">
                    {grade.grade || "-"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {grade.subject}
                    </p>
                    <p className="text-xs text-gray-400">
                      {grade.examType} &middot; {grade.marks}/{grade.totalMarks}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(grade.date).toLocaleDateString()}
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
