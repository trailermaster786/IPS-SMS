"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, CheckCircle2, XCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  class: { name: string };
}

export default function StudentAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchAttendance(); }, []);

  const fetchAttendance = async () => {
    try {
      const response = await fetch("/api/student/attendance");
      if (response.ok) setAttendance(await response.json());
    } catch (error) { console.error(error); }
    finally { setIsLoading(false); }
  };

  const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
    PRESENT: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    ABSENT: { icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
    LATE: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    EXCUSED: { icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50" },
  };

  const total = attendance.length;
  const present = attendance.filter((a) => a.status === "PRESENT").length;
  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">My Attendance</h1>
        <p className="text-gray-500 mt-1">Track your attendance history</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        {[
          { label: "Attendance Rate", value: `${attendanceRate}%`, icon: TrendingUp, gradient: "from-emerald-500 to-teal-600" },
          { label: "Present", value: present, icon: CheckCircle2, gradient: "from-blue-500 to-indigo-600" },
          { label: "Absent", value: attendance.filter((a) => a.status === "ABSENT").length, icon: XCircle, gradient: "from-red-500 to-rose-600" },
          { label: "Late", value: attendance.filter((a) => a.status === "LATE").length, icon: Clock, gradient: "from-amber-500 to-orange-600" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : attendance.length === 0 ? (
        <Card className="border-0 shadow-sm bg-white/80">
          <CardContent className="p-12 text-center">
            <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No attendance records yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Attendance History</h3>
            <div className="space-y-2">
              {attendance.map((record) => {
                const config = statusConfig[record.status] || statusConfig.PRESENT;
                const StatusIcon = config.icon;
                return (
                  <div key={record.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                      <StatusIcon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{record.class?.name || "N/A"}</p>
                      <p className="text-xs text-gray-400" suppressHydrationWarning>{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={record.status === "PRESENT" ? "default" : record.status === "ABSENT" ? "destructive" : "secondary"} className="rounded-full text-xs">
                      {record.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
