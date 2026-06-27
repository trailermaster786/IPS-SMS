"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  Users,
  DollarSign,
  BarChart3,
  ClipboardCheck,
  TrendingUp,
  ArrowUpRight,
  Megaphone,
  ArrowRight,
} from "lucide-react";

interface ChildData {
  id: string;
  name: string;
  className: string;
  attendancePercentage: number;
  averageGrade: number;
  totalDue: number;
  hasUnpaidFees: boolean;
}

interface Stats {
  children: ChildData[];
  totalChildren: number;
  totalOutstanding: number;
  recentAnnouncements: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
    author: { fullName: string };
  }>;
}

export default function ParentDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/parent/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        if (data.children.length > 0) {
          setSelectedChild(data.children[0].id);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeChild = stats?.children.find((c) => c.id === selectedChild);

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-rose-900 to-pink-900 bg-clip-text text-transparent">
          Welcome, {session?.user?.name}
        </h1>
        <p className="text-gray-500 mt-1">Overview of your children&apos;s progress.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {stats && stats.children.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Viewing:</span>
              <div className="flex gap-2">
                {stats.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChild(child.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedChild === child.id
                        ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {child.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
            {[
              {
                label: "Children",
                value: stats?.totalChildren || 0,
                icon: Users,
                gradient: "from-rose-500 to-pink-600",
              },
              {
                label: "Outstanding Fees",
                value: formatCurrency(stats?.totalOutstanding || 0),
                icon: DollarSign,
                gradient: "from-amber-500 to-orange-600",
              },
              {
                label: "Avg. Performance",
                value: activeChild ? `${activeChild.averageGrade}%` : "—",
                icon: BarChart3,
                gradient: "from-emerald-500 to-teal-600",
              },
              {
                label: "Attendance Rate",
                value: activeChild ? `${activeChild.attendancePercentage}%` : "—",
                icon: ClipboardCheck,
                gradient: "from-blue-500 to-indigo-600",
              },
            ].map((stat) => {
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

          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-children"
            style={{ animationDelay: "0.3s" }}
          >
            <Card className="lg:col-span-2 border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900">Children Overview</h3>
                  <button
                    onClick={() => router.push("/dashboard/parent/children")}
                    className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1"
                  >
                    View All <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                {stats?.children && stats.children.length > 0 ? (
                  <div className="space-y-4">
                    {stats.children.map((child) => (
                      <div
                        key={child.id}
                        onClick={() => setSelectedChild(child.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedChild === child.id
                            ? "border-rose-200 bg-rose-50/50 shadow-sm"
                            : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
                            {child.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {child.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {child.className}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              Avg: {child.averageGrade}%
                            </p>
                            <p className="text-xs text-gray-400">
                              Attendance: {child.attendancePercentage}%
                            </p>
                          </div>
                          {child.hasUnpaidFees && (
                            <Badge
                              variant="destructive"
                              className="rounded-full text-xs"
                            >
                              Fees Due
                            </Badge>
                          )}
                          <ArrowUpRight className="h-4 w-4 text-gray-300" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-8 text-sm">
                    No children found
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Fee Reminders</h3>
                  <button
                    onClick={() => router.push("/dashboard/parent/fees")}
                    className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1"
                  >
                    View All <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                {stats?.children &&
                stats.children.some((c) => c.hasUnpaidFees) ? (
                  <div className="space-y-3">
                    {stats.children
                      .filter((c) => c.hasUnpaidFees)
                      .map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {child.name}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-amber-600">
                            {formatCurrency(child.totalDue)}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-8 text-sm">
                    No outstanding fees
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
                    onClick={() => router.push("/dashboard/parent/announcements")}
                    className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1"
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
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                        <Megaphone className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {a.title}
                        </p>
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
        </>
      )}
    </div>
  );
}
