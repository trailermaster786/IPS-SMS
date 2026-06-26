"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp, ArrowUpRight, Activity } from "lucide-react";

const stats = [
  { label: "Total Students", value: "150", change: "+12%", icon: GraduationCap, gradient: "from-blue-500 to-indigo-600", bg: "bg-blue-50", textColor: "text-blue-600" },
  { label: "Total Teachers", value: "12", change: "+2", icon: Users, gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-50", textColor: "text-emerald-600" },
  { label: "Active Classes", value: "8", change: "3 grades", icon: BookOpen, gradient: "from-violet-500 to-purple-600", bg: "bg-violet-50", textColor: "text-violet-600" },
  { label: "Fee Collection", value: "$45,200", change: "78%", icon: DollarSign, gradient: "from-amber-500 to-orange-600", bg: "bg-amber-50", textColor: "text-amber-600" },
];

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">
          Welcome back, {session?.user?.name}
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening at your school today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="group border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover card-border-gradient overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold stat-number">{stat.value}</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-xs font-semibold text-emerald-600">{stat.change}</span>
                      <span className="text-xs text-gray-400">this month</span>
                    </div>
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

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-children" style={{ animationDelay: "0.3s" }}>
        <Card className="lg:col-span-2 border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
              <Activity className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="space-y-4">
              {[
                { text: "New student admitted: Alice Brown", time: "2 min ago", color: "bg-blue-500" },
                { text: "Fee payment received: $500", time: "15 min ago", color: "bg-emerald-500" },
                { text: "Assignment created: Physics Lab Report", time: "1 hour ago", color: "bg-violet-500" },
                { text: "Attendance marked: Grade 10A", time: "2 hours ago", color: "bg-amber-500" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className={`w-2 h-2 rounded-full ${item.color} group-hover:scale-150 transition-transform`} />
                  <p className="flex-1 text-sm text-gray-700">{item.text}</p>
                  <span className="text-xs text-gray-400">{item.time}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-500 to-violet-600 text-white card-hover">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {["Add New User", "Create Class", "Post Announcement", "View Reports"].map((action, i) => (
                <button
                  key={action}
                  className="w-full text-left px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium transition-all duration-200 hover:translate-x-1"
                >
                  {action}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
