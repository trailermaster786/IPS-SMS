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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Plus, Megaphone, Calendar, User, Search, Trash2 } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  audienceRole?: string;
  createdAt: string;
  author: { fullName: string };
}

interface ClassOption {
  id: string;
  name: string;
}

export default function TeacherAnnouncementsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    audienceRole: "STUDENT",
    classId: "",
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchClasses();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements");
      if (response.ok) setAnnouncements(await response.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/teacher/classes");
      if (response.ok) setClasses(await response.json());
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          audienceRole: formData.audienceRole,
          classId: formData.classId || undefined,
        }),
      });
      if (response.ok) {
        setIsDialogOpen(false);
        setFormData({ title: "", content: "", audienceRole: "STUDENT", classId: "" });
        fetchAnnouncements();
        toast({ title: "Announcement posted!" });
      } else {
        toast({ title: "Failed to post", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(query) ||
        a.content.toLowerCase().includes(query) ||
        a.author.fullName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const audienceBadgeColor = (role?: string) => {
    switch (role) {
      case "ALL":
        return "bg-blue-100 text-blue-700";
      case "STUDENT":
        return "bg-emerald-100 text-emerald-700";
      case "TEACHER":
        return "bg-amber-100 text-amber-700";
      case "PARENT":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">
            Announcements
          </h1>
          <p className="text-gray-500 mt-1">Post announcements for your students</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger
            render={
              <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 rounded-xl px-5 h-11" />
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Post Announcement
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="h-11 rounded-xl"
                  placeholder="Announcement title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Content
                </Label>
                <textarea
                  className="w-full min-h-[120px] px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 transition-all"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Write your announcement..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Audience
                </Label>
                <select
                  value={formData.audienceRole}
                  onChange={(e) =>
                    setFormData({ ...formData, audienceRole: e.target.value })
                  }
                  className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400"
                >
                  <option value="STUDENT">Students</option>
                  <option value="PARENT">Parents</option>
                  <option value="ALL">Everyone</option>
                </select>
              </div>
              {classes.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Specific Class (Optional)
                  </Label>
                  <select
                    value={formData.classId}
                    onChange={(e) =>
                      setFormData({ ...formData, classId: e.target.value })
                    }
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400"
                  >
                    <option value="">All classes</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                Post Announcement
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          placeholder="Search announcements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 h-10 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 transition-all"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <Card className="border-0 shadow-sm bg-white/80">
          <CardContent className="p-12 text-center">
            <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No announcements yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 stagger-children">
          {filteredAnnouncements.map((a) => (
            <Card
              key={a.id}
              className="group border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <Megaphone className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {a.title}
                      </h3>
                      <Badge
                        className={`rounded-full text-xs ${audienceBadgeColor(
                          a.audienceRole
                        )}`}
                      >
                        {a.audienceRole || "Everyone"}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      {a.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{a.author.fullName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(a.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
