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
import { formatDate } from "@/lib/utils";
import { Plus, Megaphone, Calendar, User, Trash2, Edit } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  audienceRole?: string;
  classId?: string;
  createdAt: string;
  author: { fullName: string };
}

interface Class {
  id: string;
  name: string;
}

export default function AnnouncementsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    audienceRole: "",
    classId: "",
  });

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements");
      if (response.ok) setAnnouncements(await response.json());
    } catch {
      toast({ title: "Error", description: "Failed to fetch announcements", variant: "destructive" });
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

  const resetForm = () => {
    setFormData({ title: "", content: "", audienceRole: "", classId: "" });
    setEditingAnnouncement(null);
  };

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      audienceRole: announcement.audienceRole || "",
      classId: announcement.classId || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingAnnouncement) {
        const response = await fetch(`/api/admin/announcements/${editingAnnouncement.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            content: formData.content,
            audienceRole: formData.audienceRole || null,
            classId: formData.classId || null,
          }),
        });

        if (response.ok) {
          toast({ title: "Announcement Updated", description: "Your changes have been saved" });
          setIsDialogOpen(false);
          resetForm();
          fetchAnnouncements();
        } else {
          const data = await response.json();
          toast({ title: "Error", description: data.error || "Failed to update", variant: "destructive" });
        }
      } else {
        const response = await fetch("/api/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            content: formData.content,
            audienceRole: formData.audienceRole || undefined,
            classId: formData.classId || undefined,
          }),
        });

        if (response.ok) {
          toast({ title: "Announcement Posted", description: "Your announcement has been published" });
          setIsDialogOpen(false);
          resetForm();
          fetchAnnouncements();
        } else {
          const data = await response.json();
          toast({ title: "Error", description: data.error || "Failed to post", variant: "destructive" });
        }
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({ title: "Announcement Deleted", description: "The announcement has been removed" });
        fetchAnnouncements();
      } else {
        toast({ title: "Error", description: "Failed to delete announcement", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete announcement", variant: "destructive" });
    }
  };

  useEffect(() => {
    async function loadData() {
      await fetchAnnouncements();
      await fetchClasses();
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (session?.user?.role !== "ADMIN") {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">
            Announcements
          </h1>
          <p className="text-gray-500 mt-1">Post and manage school announcements</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger render={<Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/25 rounded-xl px-5 h-11" />}>
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium text-gray-700">Content *</Label>
                <textarea
                  id="content"
                  className="w-full min-h-[120px] px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 transition-all"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Target Audience</Label>
                  <Select value={formData.audienceRole} onValueChange={(value) => { if (value !== null) setFormData({ ...formData, audienceRole: value }); }}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Everyone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Everyone</SelectItem>
                      <SelectItem value="TEACHER">Teachers Only</SelectItem>
                      <SelectItem value="STUDENT">Students Only</SelectItem>
                      <SelectItem value="PARENT">Parents Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Specific Class</Label>
                  <Select value={formData.classId} onValueChange={(value) => { if (value !== null) setFormData({ ...formData, classId: value }); }}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="All classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Classes</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
              >
                {isSubmitting
                  ? editingAnnouncement ? "Updating..." : "Posting..."
                  : editingAnnouncement ? "Update Announcement" : "Post Announcement"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <Card className="border-0 shadow-sm bg-white/80">
          <CardContent className="p-12 text-center">
            <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No announcements yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 stagger-children">
          {announcements.map((announcement) => {
            const targetClass = classes.find((c) => c.id === announcement.classId);
            return (
              <Card key={announcement.id} className="group border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <Megaphone className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{announcement.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="rounded-full text-xs">
                            {announcement.audienceRole || "Everyone"}
                          </Badge>
                          {targetClass && (
                            <Badge variant="secondary" className="rounded-full text-xs bg-indigo-100 text-indigo-700">
                              {targetClass.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">{announcement.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{announcement.author.fullName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(announcement.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditDialog(announcement)}
                            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(announcement.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
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
