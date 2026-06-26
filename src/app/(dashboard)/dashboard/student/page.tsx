"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, FileText, BarChart3, ClipboardCheck, BookOpen, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const stats = [
  { label: "Attendance", value: "94%", icon: ClipboardCheck, gradient: "from-blue-500 to-indigo-600" },
  { label: "Assignments Due", value: "3", icon: FileText, gradient: "from-amber-500 to-orange-600" },
  { label: "Average Grade", value: "A-", icon: BarChart3, gradient: "from-emerald-500 to-teal-600" },
  { label: "Next Exam", value: "5 days", icon: Calendar, gradient: "from-violet-500 to-purple-600" },
];

export default function StudentDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
          Welcome, {session?.user?.name}
        </h1>
        <p className="text-gray-500 mt-1">Your academic dashboard at a glance.</p>
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Today&apos;s Classes</h3>
              <Calendar className="h-4 w-4 text-blue-500" />
            </div>
            <div className="space-y-3">
              {[
                { time: "8:00 - 9:00", subject: "Mathematics", teacher: "Mr. Johnson", room: "Room 101", icon: BookOpen },
                { time: "9:30 - 10:30", subject: "Physics", teacher: "Dr. Smith", room: "Lab 2", icon: CheckCircle2 },
                { time: "11:00 - 12:00", subject: "English", teacher: "Ms. Davis", room: "Room 205", icon: BookOpen },
                { time: "2:00 - 3:00", subject: "Chemistry", teacher: "Mrs. Wilson", room: "Lab 1", icon: AlertCircle },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="text-xs font-mono text-gray-400 w-24">{item.time}</div>
                  <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-400 to-indigo-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.subject}</p>
                    <p className="text-xs text-gray-400">{item.teacher} &middot; {item.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
            <div className="space-y-3">
              {[
                { title: "Math Problem Set", due: "Tomorrow", urgent: true },
                { title: "Physics Lab Report", due: "In 3 days", urgent: false },
                { title: "English Essay", due: "In 5 days", urgent: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${item.urgent ? "bg-red-500 animate-pulse" : "bg-gray-300"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    <p className={`text-xs ${item.urgent ? "text-red-500 font-medium" : "text-gray-400"}`}>{item.due}</p>
                  </div>
                  {item.urgent && <Clock className="h-3.5 w-3.5 text-red-400" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
