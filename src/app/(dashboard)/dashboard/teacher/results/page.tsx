"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, BarChart3, TrendingUp, Award, Users } from "lucide-react";

interface ClassSubject {
  id: string;
  class: { name: string };
  subject: { name: string };
}

interface Student {
  id: string;
  user: { fullName: string };
  admissionNumber: string;
}

export default function TeacherResultsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassSubject, setSelectedClassSubject] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    term: "",
    examType: "",
    totalMarks: "100",
    marks: {} as Record<string, string>,
  });

  useEffect(() => { fetchClassSubjects(); }, []);

  useEffect(() => {
    if (selectedClassSubject) fetchStudents(selectedClassSubject);
  }, [selectedClassSubject]);

  const fetchClassSubjects = async () => {
    try {
      const response = await fetch("/api/teacher/classes");
      if (response.ok) setClassSubjects(await response.json());
    } catch (error) { console.error("Failed:", error); }
    finally { setIsLoading(false); }
  };

  const fetchStudents = async (csId: string) => {
    try {
      const response = await fetch(`/api/teacher/class-subjects/${csId}/students`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        const initial: Record<string, string> = {};
        data.forEach((s: Student) => { initial[s.id] = ""; });
        setFormData((prev) => ({ ...prev, marks: initial }));
      }
    } catch (error) { console.error("Failed:", error); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const results = Object.entries(formData.marks)
        .filter(([, marks]) => marks !== "")
        .map(([studentId, marks]) => ({
          studentId,
          classSubjectId: selectedClassSubject,
          term: formData.term,
          examType: formData.examType,
          marksObtained: parseInt(marks),
          totalMarks: parseInt(formData.totalMarks),
        }));

      const response = await fetch("/api/teacher/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results }),
      });
      if (response.ok) {
        setIsDialogOpen(false);
        setFormData({ term: "", examType: "", totalMarks: "100", marks: {} });
        toast({ title: "Results submitted successfully!" });
      } else {
        toast({ title: "Failed to submit results", variant: "destructive" });
      }
    } catch {
      toast({ title: "An error occurred", variant: "destructive" });
    }
  };

  const currentClass = classSubjects.find((cs) => cs.id === selectedClassSubject);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">Results Entry</h1>
          <p className="text-gray-500 mt-1">Enter and manage student exam results</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 rounded-xl px-5 h-11" />}>
            <Plus className="h-4 w-4 mr-2" />
            Enter Results
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Enter Results</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Class & Subject</Label>
                <Select value={selectedClassSubject} onValueChange={(v) => { if (v) setSelectedClassSubject(v); }}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select class & subject" /></SelectTrigger>
                  <SelectContent>
                    {classSubjects.map((cs) => (
                      <SelectItem key={cs.id} value={cs.id}>{cs.class.name} &mdash; {cs.subject.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Term</Label>
                  <Input placeholder="e.g. Term 1" value={formData.term} onChange={(e) => setFormData({ ...formData, term: e.target.value })} className="h-11 rounded-xl" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Exam Type</Label>
                  <Input placeholder="e.g. Midterm" value={formData.examType} onChange={(e) => setFormData({ ...formData, examType: e.target.value })} className="h-11 rounded-xl" required />
                </div>
              </div>
              {students.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Student Marks (out of {formData.totalMarks})</Label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {students.map((student) => {
                      const marks = parseInt(formData.marks[student.id] || "0");
                      const total = parseInt(formData.totalMarks);
                      const pct = total > 0 ? (marks / total) * 100 : 0;
                      const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : "F";
                      return (
                        <div key={student.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{student.user.fullName}</p>
                          </div>
                          <Input
                            type="number"
                            min="0"
                            max={formData.totalMarks}
                            placeholder="0"
                            value={formData.marks[student.id] || ""}
                            onChange={(e) => setFormData({ ...formData, marks: { ...formData.marks, [student.id]: e.target.value } })}
                            className="w-20 h-9 rounded-lg text-center"
                          />
                          {marks > 0 && (
                            <Badge variant={pct >= 50 ? "default" : "destructive"} className="rounded-full text-xs w-10 text-center">
                              {grade}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                Submit Results
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm animate-fade-in-up">
        <CardContent className="p-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Select Class to Enter Results</Label>
            <Select value={selectedClassSubject || ""} onValueChange={(v) => { if (v) setSelectedClassSubject(v); }}>
              <SelectTrigger className="h-11 rounded-xl max-w-md"><SelectValue placeholder="Choose a class & subject" /></SelectTrigger>
              <SelectContent>
                {classSubjects.map((cs) => (
                  <SelectItem key={cs.id} value={cs.id}>{cs.class.name} &mdash; {cs.subject.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedClassSubject && students.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">{currentClass?.class.name} &mdash; {currentClass?.subject.name} ({students.length} students)</h3>
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
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-4 text-center">Click &quot;Enter Results&quot; to submit marks for these students</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
