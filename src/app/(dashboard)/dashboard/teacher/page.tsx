"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ClipboardCheck, FileText, Users, TrendingUp, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";

const stats = [
  { label: "My Classes", value: "4", icon: BookOpen, gradient: "from-emerald-500 to-teal-600" },
  { label: "Total Students", value: "120", icon: Users, gradient: "from-blue-500 to-indigo-600" },
  { label: "Assignments Given", value: "8", icon: FileText, gradient: "from-violet-500 to-purple-600" },
  { label: "Attendance Today", value: "92%", icon: ClipboardCheck, gradient: "from-amber-500 to-orange-600" },
];

export default function TeacherDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">
          Welcome back, {session?.user?.name}
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s your teaching overview for today.</p>
      </div>

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
            <h3 className="font-semibold text-gray-900 mb-6">Today&apos;s Schedule</h3>
            <div className="space-y-3">
              {[
                { time: "8:00 - 9:00", class: "Math - Grade 10A", type: "Lecture", icon: Clock },
                { time: "9:30 - 10:30", class: "Math - Grade 10B", type: "Lecture", icon: Clock },
                { time: "11:00 - 12:00", class: "Physics - Grade 11A", type: "Lab", icon: CheckCircle2 },
                { time: "2:00 - 3:00", class: "Math - Grade 12A", type: "Tutorial", icon: Clock },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="text-xs font-mono text-gray-400 w-28">{item.time}</div>
                  <div className="w-1 h-8 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.class}</p>
                    <p className="text-xs text-gray-400">{item.type}</p>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Submissions</h3>
            <div className="space-y-3">
              {[
                { name: "Alice Brown", assignment: "Calculus Problem Set", status: "Graded" },
                { name: "Bob Wilson", assignment: "Calculus Problem Set", status: "Pending" },
                { name: "Carol Davis", assignment: "Physics Lab Report", status: "Submitted" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                    {item.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 truncate">{item.assignment}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.status === "Graded" ? "bg-emerald-100 text-emerald-700" :
                    item.status === "Pending" ? "bg-amber-100 text-amber-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
