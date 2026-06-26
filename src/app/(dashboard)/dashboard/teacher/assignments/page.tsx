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
import { Plus, FileText, Calendar, BookOpen, Clock } from "lucide-react";

interface ClassSubject {
  id: string;
  class: { name: string };
  subject: { name: string };
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
  classSubject: {
    class: { name: string };
    subject: { name: string };
  };
}

export default function TeacherAssignmentsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    classSubjectId: "",
    title: "",
    description: "",
    dueDate: "",
    totalMarks: "100",
  });

  useEffect(() => {
    fetchClassSubjects();
    fetchAssignments();
  }, []);

  const fetchClassSubjects = async () => {
    try {
      const response = await fetch("/api/teacher/classes");
      if (response.ok) setClassSubjects(await response.json());
    } catch (error) { console.error("Failed to fetch classes:", error); }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/teacher/assignments");
      if (response.ok) setAssignments(await response.json());
    } catch (error) { console.error("Failed to fetch assignments:", error); }
    finally { setIsLoading(false); }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          totalMarks: parseInt(formData.totalMarks),
        }),
      });
      if (response.ok) {
        setIsDialogOpen(false);
        setFormData({ classSubjectId: "", title: "", description: "", dueDate: "", totalMarks: "100" });
        fetchAssignments();
        toast({ title: "Assignment created successfully!" });
      } else {
        toast({ title: "Failed to create assignment", variant: "destructive" });
      }
    } catch {
      toast({ title: "An error occurred", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">Assignments</h1>
          <p className="text-gray-500 mt-1">Create and manage class assignments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 rounded-xl px-5 h-11" />}>
            <Plus className="h-4 w-4 mr-2" />
            New Assignment
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create Assignment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Class & Subject</Label>
                <Select value={formData.classSubjectId} onValueChange={(v) => { if (v) setFormData({ ...formData, classSubjectId: v }); }}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select class & subject" /></SelectTrigger>
                  <SelectContent>
                    {classSubjects.map((cs) => (
                      <SelectItem key={cs.id} value={cs.id}>{cs.class.name} &mdash; {cs.subject.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="h-11 rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                <textarea
                  id="description"
                  className="w-full min-h-[80px] px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 transition-all"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">Due Date</Label>
                  <Input id="dueDate" type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="h-11 rounded-xl" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalMarks" className="text-sm font-medium text-gray-700">Total Marks</Label>
                  <Input id="totalMarks" type="number" value={formData.totalMarks} onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })} className="h-11 rounded-xl" required />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">Create Assignment</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <Card className="border-0 shadow-sm bg-white/80">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No assignments yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
          {assignments.map((assignment, i) => {
            const isOverdue = new Date(assignment.dueDate) < new Date();
            return (
              <Card key={assignment.id} className="group border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={isOverdue ? "destructive" : "default"} className="rounded-full text-xs">
                        {isOverdue ? "Overdue" : "Active"}
                      </Badge>
                      <Badge variant="outline" className="rounded-full text-xs">
                        {assignment.totalMarks} marks
                      </Badge>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{assignment.title}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{assignment.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      <span>{assignment.classSubject.class.name} &mdash; {assignment.classSubject.subject.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span suppressHydrationWarning>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
