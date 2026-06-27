"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Megaphone, Calendar, User, Search, Filter } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  audienceRole?: string;
  createdAt: string;
  author: { fullName: string };
}

export default function StudentNoticeBoardPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/noticeboard?role=STUDENT");
      if (response.ok) setAnnouncements(await response.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch = searchQuery
      ? a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.author.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesFilter =
      filterRole === "ALL" || a.audienceRole === filterRole || !a.audienceRole;

    return matchesSearch && matchesFilter;
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
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
          Notice Board
        </h1>
        <p className="text-gray-500 mt-1">All school announcements</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 h-10 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="h-10 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400"
          >
            <option value="ALL">All Audiences</option>
            <option value="STUDENT">Students</option>
            <option value="TEACHER">Teachers</option>
            <option value="PARENT">Parents</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <Card className="border-0 shadow-sm bg-white/80">
          <CardContent className="p-12 text-center">
            <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No announcements on the notice board</p>
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
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
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
