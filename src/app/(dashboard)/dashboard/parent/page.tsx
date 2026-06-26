"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, BarChart3, ClipboardCheck, TrendingUp, ArrowUpRight, AlertCircle } from "lucide-react";

const stats = [
  { label: "Children", value: "2", icon: Users, gradient: "from-rose-500 to-pink-600" },
  { label: "Outstanding Fees", value: "$1,200", icon: DollarSign, gradient: "from-amber-500 to-orange-600" },
  { label: "Avg. Performance", value: "B+", icon: BarChart3, gradient: "from-emerald-500 to-teal-600" },
  { label: "Attendance Rate", value: "96%", icon: ClipboardCheck, gradient: "from-blue-500 to-indigo-600" },
];

export default function ParentDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-rose-900 to-pink-900 bg-clip-text text-transparent">
          Welcome, {session?.user?.name}
        </h1>
        <p className="text-gray-500 mt-1">Overview of your children&apos;s progress.</p>
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
            <h3 className="font-semibold text-gray-900 mb-6">Children Overview</h3>
            <div className="space-y-4">
              {[
                { name: "Alice Brown", grade: "Grade 10", attendance: "95%", avg: "A-", trend: "+5%" },
                { name: "Charlie Brown", grade: "Grade 8", attendance: "92%", avg: "B+", trend: "+3%" },
              ].map((child, i) => (
                <div key={i} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
                      {child.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{child.name}</p>
                      <p className="text-sm text-gray-500">{child.grade}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">Avg: {child.avg}</p>
                      <p className="text-xs text-gray-400">Attendance: {child.attendance}</p>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span className="text-xs font-semibold">{child.trend}</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-rose-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Fee Reminders</h3>
            <div className="space-y-3">
              {[
                { child: "Alice Brown", amount: "$800", due: "Jul 15, 2026", overdue: false },
                { child: "Charlie Brown", amount: "$400", due: "Jul 10, 2026", overdue: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.child}</p>
                    <p className="text-xs text-gray-400">Due: {item.due}</p>
                  </div>
                  <span className="text-sm font-bold text-amber-600">{item.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
