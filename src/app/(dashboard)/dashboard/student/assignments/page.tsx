"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FileText, Calendar, BookOpen, AlertTriangle, CheckCircle2, Send, Upload } from "lucide-react";

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
  submission?: {
    id: string;
    textAnswer: string;
    submittedAt: string;
    grade?: number;
    feedback?: string;
  } | null;
}

export default function StudentAssignmentsPage() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [submitContent, setSubmitContent] = useState("");

  useEffect(() => { fetchAssignments(); }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/student/assignments");
      if (response.ok) setAssignments(await response.json());
    } catch (error) { console.error(error); }
    finally { setIsLoading(false); }
  };

  const handleSubmit = async (assignmentId: string) => {
    if (!submitContent.trim()) {
      toast({ title: "Please enter your submission content", variant: "destructive" });
      return;
    }
    setSubmittingId(assignmentId);
    try {
      const response = await fetch("/api/student/assignments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, content: submitContent }),
      });
      if (response.ok) {
        toast({ title: "Assignment submitted!" });
        setSubmitContent("");
        fetchAssignments();
      } else {
        toast({ title: "Failed to submit", variant: "destructive" });
      }
    } catch {
      toast({ title: "An error occurred", variant: "destructive" });
    } finally { setSubmittingId(null); }
  };

  const now = new Date();

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">My Assignments</h1>
        <p className="text-gray-500 mt-1">View your homework and submit assignments</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2, 3].map((i) => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : assignments.length === 0 ? (
        <Card className="border-0 shadow-sm bg-white/80">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No assignments yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
          {assignments.map((assignment) => {
            const dueDate = new Date(assignment.dueDate);
            const isOverdue = dueDate < now;
            const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const isSubmitted = !!assignment.submission;
            return (
              <Card key={assignment.id} className={`group border-0 shadow-sm backdrop-blur-sm card-hover overflow-hidden ${
                isOverdue && !isSubmitted ? "bg-red-50/50 ring-1 ring-red-100" :
                isSubmitted ? "bg-emerald-50/30 ring-1 ring-emerald-100" : "bg-white/80"
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={isSubmitted ? "default" : isOverdue ? "destructive" : "secondary"} className="rounded-full text-xs">
                        {isSubmitted ? "Submitted" : isOverdue ? "Overdue" : daysLeft <= 2 ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left` : "Upcoming"}
                      </Badge>
                      <Badge variant="outline" className="rounded-full text-xs">{assignment.totalMarks} marks</Badge>
                    </div>
                    {isSubmitted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : isOverdue ? (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    ) : null}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{assignment.title}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{assignment.description}</p>

                  {isSubmitted && assignment.submission && (
                    <div className="mb-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                      <p className="text-xs font-medium text-emerald-700 mb-1">Your Submission</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{assignment.submission.textAnswer || "File submission"}</p>
                      {assignment.submission.feedback && (
                        <p className="text-xs text-blue-600 mt-1">Feedback: {assignment.submission.feedback}</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{assignment.classSubject.subject.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span suppressHydrationWarning>Due: {dueDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                    {!isSubmitted && (
                      <Dialog>
                        <DialogTrigger render={<Button size="sm" className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs" />}>
                          <Upload className="h-3.5 w-3.5 mr-1" />
                          Submit
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Submit: {assignment.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Your Answer</Label>
                              <textarea
                                className="w-full min-h-[150px] px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all"
                                placeholder="Type your answer here..."
                                value={submitContent}
                                onChange={(e) => setSubmitContent(e.target.value)}
                              />
                            </div>
                            <Button
                              onClick={() => handleSubmit(assignment.id)}
                              disabled={submittingId === assignment.id}
                              className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                              {submittingId === assignment.id ? "Submitting..." : "Submit Assignment"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
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
