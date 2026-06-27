"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { ClipboardCheck, CheckCircle2, XCircle, Clock, AlertCircle, Search, Download } from "lucide-react";

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  student: {
    user: { fullName: string };
    admissionNumber: string;
  };
  class: { name: string };
}

interface Class {
  id: string;
  name: string;
}

export default function AttendancePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      const response = await fetch("/api/admin/attendance");
      if (response.ok) setAttendance(await response.json());
    } catch {
      toast({ title: "Error", description: "Failed to fetch attendance", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/admin/classes");
      if (response.ok) setClasses(await response.json());
    } catch {
      console.error("Failed to fetch classes");
    }
  };

  const filteredAttendance = attendance.filter((a) => {
    const matchesClass = selectedClass === "all" || a.class.name === selectedClass;
    const matchesSearch =
      searchTerm === "" ||
      a.student.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate =
      dateFilter === "" || new Date(a.date).toISOString().split("T")[0] === dateFilter;
    return matchesClass && matchesSearch && matchesDate;
  });

  const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2; bg: string }> = {
    PRESENT: { color: "text-emerald-600", icon: CheckCircle2, bg: "bg-emerald-50" },
    ABSENT: { color: "text-red-600", icon: XCircle, bg: "bg-red-50" },
    LATE: { color: "text-amber-600", icon: Clock, bg: "bg-amber-50" },
    EXCUSED: { color: "text-blue-600", icon: AlertCircle, bg: "bg-blue-50" },
  };

  const stats = {
    total: filteredAttendance.length,
    present: filteredAttendance.filter((a) => a.status === "PRESENT").length,
    absent: filteredAttendance.filter((a) => a.status === "ABSENT").length,
    late: filteredAttendance.filter((a) => a.status === "LATE").length,
    excused: filteredAttendance.filter((a) => a.status === "EXCUSED").length,
  };

  const attendancePercentage = stats.total > 0
    ? Math.round((stats.present / stats.total) * 100)
    : 0;

  useEffect(() => {
    async function loadData() {
      await fetchAttendance();
      await fetchClasses();
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (session?.user?.role !== "ADMIN") {
    router.push("/dashboard");
    return null;
  }

  const handleExport = () => {
    const csvRows: string[] = ["Student Name,Admission Number,Class,Date,Status"];
    filteredAttendance.forEach((record) => {
      csvRows.push(
        `"${record.student.user.fullName}","${record.student.admissionNumber}","${record.class.name}","${formatDate(record.date)}","${record.status}"`
      );
    });
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-report-${dateFilter || "all"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">
            Attendance Overview
          </h1>
          <p className="text-gray-500 mt-1">Monitor student attendance across all classes</p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-11 rounded-xl w-[180px]"
          />
          <Select value={selectedClass || ""} onValueChange={(value) => { if (value) setSelectedClass(value); }}>
            <SelectTrigger className="w-[180px] h-11 rounded-xl">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.name}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 h-11 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 stagger-children">
        {[
          { label: "Total Records", value: stats.total, icon: ClipboardCheck, gradient: "from-gray-500 to-gray-600" },
          { label: "Present", value: stats.present, icon: CheckCircle2, gradient: "from-emerald-500 to-teal-600" },
          { label: "Absent", value: stats.absent, icon: XCircle, gradient: "from-red-500 to-rose-600" },
          { label: "Late", value: stats.late, icon: Clock, gradient: "from-amber-500 to-orange-600" },
          { label: "Attendance %", value: `${attendancePercentage}%`, icon: AlertCircle, gradient: "from-indigo-500 to-violet-600" },
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

      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by student name or admission number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200"
              />
            </div>
            {(dateFilter || selectedClass !== "all" || searchTerm) && (
              <button
                onClick={() => {
                  setDateFilter("");
                  setSelectedClass("all");
                  setSearchTerm("");
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Clear filters
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredAttendance.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No attendance records found</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="rounded-full text-xs">
                  {filteredAttendance.length} records
                </Badge>
                {dateFilter && (
                  <Badge variant="secondary" className="rounded-full text-xs">
                    Date: {formatDate(dateFilter)}
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                {filteredAttendance.map((record) => {
                  const config = statusConfig[record.status] || statusConfig.PRESENT;
                  const StatusIcon = config.icon;
                  return (
                    <div key={record.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                      <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                        <StatusIcon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{record.student.user.fullName}</p>
                        <p className="text-sm text-gray-500">Admission: {record.student.admissionNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{record.class.name}</p>
                        <p className="text-xs text-gray-400" suppressHydrationWarning>
                          {formatDate(record.date)}
                        </p>
                      </div>
                      <Badge
                        variant={record.status === "PRESENT" ? "default" : record.status === "ABSENT" ? "destructive" : "secondary"}
                        className="rounded-full text-xs"
                      >
                        {record.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
