"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ClipboardCheck, CheckCircle2, XCircle, Clock, Users, Save } from "lucide-react";

interface Student {
  id: string;
  user: { fullName: string };
  admissionNumber: string;
}

interface ClassSubject {
  id: string;
  class: { name: string };
  subject: { name: string };
}

export default function TeacherAttendancePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassSubject, setSelectedClassSubject] = useState<string>("");
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetchClassSubjects();
  }, []);

  useEffect(() => {
    if (selectedClassSubject) {
      fetchStudents(selectedClassSubject);
    }
  }, [selectedClassSubject]);

  const fetchClassSubjects = async () => {
    try {
      const response = await fetch("/api/teacher/classes");
      if (response.ok) setClassSubjects(await response.json());
    } catch (error) { console.error("Failed to fetch classes:", error); }
    finally { setIsLoading(false); }
  };

  const fetchStudents = async (classSubjectId: string) => {
    try {
      const response = await fetch(`/api/teacher/class-subjects/${classSubjectId}/students`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        const initial: Record<string, string> = {};
        data.forEach((s: Student) => { initial[s.id] = "PRESENT"; });
        setAttendance(initial);
      }
    } catch (error) { console.error("Failed to fetch students:", error); }
  };

  const handleSubmit = async () => {
    if (!selectedClassSubject) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classSubjectId: selectedClassSubject,
          date: todayDate,
          attendance: Object.entries(attendance).map(([studentId, status]) => ({ studentId, status })),
        }),
      });
      if (response.ok) {
        toast({ title: "Attendance marked successfully!", description: `${students.length} students recorded for ${todayDate}` });
      } else {
        toast({ title: "Failed to mark attendance", variant: "destructive" });
      }
    } catch {
      toast({ title: "An error occurred", variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  const statusOptions = [
    { value: "PRESENT", label: "Present", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { value: "ABSENT", label: "Absent", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
    { value: "LATE", label: "Late", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { value: "EXCUSED", label: "Excused", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  const currentClass = classSubjects.find((cs) => cs.id === selectedClassSubject);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">Mark Attendance</h1>
          <p className="text-gray-500 mt-1">Record student attendance for your classes</p>
        </div>
        <Select value={selectedClassSubject || ""} onValueChange={(value) => { if (value) { setSelectedClassSubject(value); setStudents([]); setAttendance({}); } }}>
          <SelectTrigger className="w-[260px] h-11 rounded-xl">
            <SelectValue placeholder="Select a class & subject" />
          </SelectTrigger>
          <SelectContent>
            {classSubjects.map((cs) => (
              <SelectItem key={cs.id} value={cs.id}>
                {cs.class.name} &mdash; {cs.subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedClassSubject ? (
        <Card className="border-0 shadow-sm bg-white/80">
          <CardContent className="p-12 text-center">
            <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Select a class to start marking attendance</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm animate-fade-in-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900">{currentClass?.class.name} &mdash; {currentClass?.subject.name}</h3>
                <p className="text-sm text-gray-500">{students.length} students &middot; {todayDate}</p>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || students.length === 0}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl px-5"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Attendance"}
              </Button>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No students in this class</p>
              </div>
            ) : (
              <div className="space-y-2">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {student.user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{student.user.fullName}</p>
                      <p className="text-xs text-gray-400">{student.admissionNumber}</p>
                    </div>
                    <div className="flex gap-1">
                      {statusOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isActive = attendance[student.id] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setAttendance({ ...attendance, [student.id]: opt.value })}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                              isActive
                                ? `${opt.bg} ${opt.color} shadow-sm`
                                : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
