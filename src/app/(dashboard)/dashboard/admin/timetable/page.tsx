"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, BookOpen } from "lucide-react";

interface TimetableSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  class: { name: string };
  classSubject: {
    subject: { name: string };
    teacher: { user: { fullName: string } };
  };
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TimetablePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchTimetable(); }, []);

  const fetchTimetable = async () => {
    try {
      const response = await fetch("/api/admin/timetable");
      if (response.ok) setSlots(await response.json());
    } catch (error) { console.error("Failed to fetch timetable:", error); }
    finally { setIsLoading(false); }
  };

  if (session?.user?.role !== "ADMIN") { router.push("/dashboard"); return null; }

  const groupedSlots = daysOfWeek.map((day, index) => ({
    day,
    slots: slots.filter((slot) => slot.dayOfWeek === index),
  }));

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">Timetable</h1>
        <p className="text-gray-500 mt-1">Weekly schedule overview for all classes</p>
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
                    <Badge variant="outline" className="ml-auto text-xs bg-white/80">{daySlots.length} classes</Badge>
                  </div>
                </div>
                {daySlots.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-400 text-sm">No classes scheduled</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {daySlots.map((slot) => (
                      <div key={slot.id} className="flex items-center gap-6 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-2 w-36">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-sm font-mono text-gray-600">{slot.startTime} - {slot.endTime}</span>
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
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
