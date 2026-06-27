"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Calendar, Clock, User, Plus, Trash2, Edit } from "lucide-react";

interface TimetableSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classId: string;
  class: { name: string };
  classSubject: {
    id: string;
    subject: { name: string };
    teacher: { user: { fullName: string } };
  };
}

interface Class {
  id: string;
  name: string;
}

interface ClassSubject {
  id: string;
  subject: { name: string };
  teacher: { user: { fullName: string } };
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TimetablePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [classFilter, setClassFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    classId: "",
    classSubjectId: "",
    dayOfWeek: "0",
    startTime: "",
    endTime: "",
  });

  const fetchTimetable = async () => {
    try {
      const response = await fetch("/api/admin/timetable");
      if (response.ok) setSlots(await response.json());
    } catch {
      toast({ title: "Error", description: "Failed to fetch timetable", variant: "destructive" });
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

  const fetchClassSubjects = async (classId: string) => {
    try {
      const response = await fetch(`/api/admin/classes/${classId}/subjects`);
      if (response.ok) {
        setClassSubjects(await response.json());
      } else {
        setClassSubjects([]);
      }
    } catch {
      setClassSubjects([]);
    }
  };

  const handleClassChange = async (classId: string) => {
    setFormData({ ...formData, classId, classSubjectId: "" });
    if (classId) {
      await fetchClassSubjects(classId);
    } else {
      setClassSubjects([]);
    }
  };

  const openCreateDialog = () => {
    setEditingSlot(null);
    setFormData({
      classId: "",
      classSubjectId: "",
      dayOfWeek: "0",
      startTime: "",
      endTime: "",
    });
    setClassSubjects([]);
    setIsDialogOpen(true);
  };

  const openEditDialog = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormData({
      classId: slot.classId,
      classSubjectId: slot.classSubject.id,
      dayOfWeek: String(slot.dayOfWeek),
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
    fetchClassSubjects(slot.classId);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingSlot
        ? `/api/admin/timetable/${editingSlot.id}`
        : "/api/admin/timetable";
      const method = editingSlot ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: formData.classId,
          classSubjectId: formData.classSubjectId,
          dayOfWeek: parseInt(formData.dayOfWeek),
          startTime: formData.startTime,
          endTime: formData.endTime,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: editingSlot ? "Slot Updated" : "Slot Created",
          description: editingSlot ? "Timetable slot updated successfully" : "New timetable slot added",
        });
        setIsDialogOpen(false);
        setEditingSlot(null);
        fetchTimetable();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save slot",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Error", description: "Failed to save slot", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (slotId: string) => {
    if (!confirm("Are you sure you want to delete this timetable slot?")) return;

    try {
      const response = await fetch(`/api/admin/timetable/${slotId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({ title: "Slot Deleted", description: "Timetable slot removed" });
        fetchTimetable();
      } else {
        toast({ title: "Error", description: "Failed to delete slot", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete slot", variant: "destructive" });
    }
  };

  useEffect(() => {
    async function loadData() {
      await fetchTimetable();
      await fetchClasses();
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (session?.user?.role !== "ADMIN") {
    router.push("/dashboard");
    return null;
  }

  const filteredSlots = classFilter === "all"
    ? slots
    : slots.filter((s) => s.class.name === classFilter);

  const groupedSlots = daysOfWeek.map((day, index) => ({
    day,
    dayIndex: index,
    slots: filteredSlots.filter((slot) => slot.dayOfWeek === index),
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">
            Timetable
          </h1>
          <p className="text-gray-500 mt-1">Weekly schedule overview for all classes</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={classFilter} onValueChange={(value) => { if (value) setClassFilter(value); }}>
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
          <Button
            onClick={openCreateDialog}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/25 rounded-xl px-5 h-11"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Slot
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6 stagger-children">
          {groupedSlots.map(({ day, slots: daySlots }) => (
            <Card key={day} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover overflow-hidden">
              <CardContent className="p-0">
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    <h3 className="font-bold text-indigo-900">{day}</h3>
                    <Badge variant="outline" className="ml-auto text-xs bg-white/80">
                      {daySlots.length} classes
                    </Badge>
                  </div>
                </div>
                {daySlots.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-400 text-sm">
                    No classes scheduled
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {daySlots.map((slot) => (
                      <div key={slot.id} className="flex items-center gap-6 px-6 py-4 hover:bg-gray-50/50 transition-colors group">
                        <div className="flex items-center gap-2 w-36">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-sm font-mono text-gray-600">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">{slot.classSubject.subject.name}</p>
                          <p className="text-sm text-gray-500">{slot.class.name}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <User className="h-3.5 w-3.5" />
                          <span>{slot.classSubject.teacher.user.fullName}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditDialog(slot)}
                            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                            title="Edit slot"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(slot.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="Delete slot"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingSlot ? "Edit Timetable Slot" : "Add Timetable Slot"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Class *</Label>
              <Select value={formData.classId} onValueChange={(value) => { if (value) handleClassChange(value); }}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Subject & Teacher *</Label>
              <Select
                value={formData.classSubjectId}
                onValueChange={(value) => { if (value) setFormData({ ...formData, classSubjectId: value }); }}
                disabled={!formData.classId}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder={formData.classId ? "Select subject" : "Select class first"} />
                </SelectTrigger>
                <SelectContent>
                  {classSubjects.map((cs) => (
                    <SelectItem key={cs.id} value={cs.id}>
                      {cs.subject.name} - {cs.teacher.user.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Day *</Label>
              <Select value={formData.dayOfWeek} onValueChange={(value) => { if (value) setFormData({ ...formData, dayOfWeek: value }); }}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day, i) => (
                    <SelectItem key={i} value={String(i)}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-medium text-gray-700">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-sm font-medium text-gray-700">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="h-11 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
            >
              {isSubmitting ? "Saving..." : editingSlot ? "Update Slot" : "Create Slot"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
