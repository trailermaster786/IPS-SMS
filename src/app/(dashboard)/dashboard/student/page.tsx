"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  FileText,
  BarChart3,
  ClipboardCheck,
  BookOpen,
  Clock,
  Megaphone,
  ArrowRight,
} from "lucide-react";

interface Stats {
  attendancePercentage: number;
  assignmentsDue: number;
  averageGrade: number;
  nextExam: { title: string; dueDate: string } | null;
  todaySchedule: Array<{
    id: string;
    startTime: string;
    endTime: string;
    subject: string;
    teacher: string;
  }>;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    dueDate: string;
    subject: string;
  }>;
  recentAnnouncements: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
    author: { fullName: string };
  }>;
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/student/stats");
      if (response.ok) {
        setStats(await response.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      label: "Attendance",
      value: stats ? `${stats.attendancePercentage}%` : "—",
      icon: ClipboardCheck,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      label: "Assignments Due",
      value: stats ? stats.assignmentsDue.toString() : "—",
      icon: FileText,
      gradient: "from-amber-500 to-orange-600",
    },
    {
      label: "Average Grade",
      value: stats ? `${stats.averageGrade}%` : "—",
      icon: BarChart3,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      label: "Next Exam",
      value: stats?.nextExam
        ? formatDate(stats.nextExam.dueDate)
        : "None",
      icon: Calendar,
      gradient: "from-violet-500 to-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
          Welcome, {session?.user?.name}
        </h1>
        <p className="text-gray-500 mt-1">Your academic dashboard at a glance.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
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
      )}

      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-children"
        style={{ animationDelay: "0.3s" }}
      >
        <Card className="lg:col-span-2 border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Today&apos;s Classes</h3>
              <button
                onClick={() => router.push("/dashboard/student/timetable")}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View All <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : stats?.todaySchedule && stats.todaySchedule.length > 0 ? (
              <div className="space-y-3">
                {stats.todaySchedule.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="text-xs font-mono text-gray-400 w-24">
                      {item.startTime} - {item.endTime}
                    </div>
                    <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-400 to-indigo-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.subject}
                      </p>
                      <p className="text-xs text-gray-400">{item.teacher}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8 text-sm">
                No classes scheduled for today
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Upcoming Deadlines</h3>
              <button
                onClick={() => router.push("/dashboard/student/assignments")}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View All <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : stats?.upcomingDeadlines && stats.upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {stats.upcomingDeadlines.map((item) => {
                  const daysLeft = Math.ceil(
                    (new Date(item.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  const urgent = daysLeft <= 2;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          urgent ? "bg-red-500 animate-pulse" : "bg-gray-300"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-400">{item.subject}</p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xs ${
                            urgent
                              ? "text-red-500 font-medium"
                              : "text-gray-400"
                          }`}
                        >
                          {daysLeft <= 0
                            ? "Overdue"
                            : daysLeft === 1
                            ? "Tomorrow"
                            : `In ${daysLeft} days`}
                        </p>
                        {urgent && (
                          <Clock className="h-3 w-3 text-red-400 ml-auto" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8 text-sm">
                No upcoming deadlines
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {stats?.recentAnnouncements && stats.recentAnnouncements.length > 0 && (
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Announcements</h3>
              <button
                onClick={() => router.push("/dashboard/student/announcements")}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View All <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-3">
              {stats.recentAnnouncements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Megaphone className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{a.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {a.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {a.author.fullName} &middot; {formatDate(a.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
