"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen, User } from "lucide-react";

interface TimetableSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classSubject: {
    subject: { name: string };
    teacher: { user: { fullName: string } };
  };
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function StudentTimetablePage() {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchTimetable(); }, []);

  const fetchTimetable = async () => {
    try {
      const response = await fetch("/api/student/timetable");
      if (response.ok) setSlots(await response.json());
    } catch (error) { console.error(error); }
    finally { setIsLoading(false); }
  };

  const groupedSlots = daysOfWeek.map((day, i) => ({
    day,
    slots: slots.filter((s) => s.dayOfWeek === i),
  }));

  const today = new Date().getDay();
  const todayIndex = today === 0 ? -1 : today - 1;

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">My Timetable</h1>
        <p className="text-gray-500 mt-1">Your weekly class schedule</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-4 stagger-children">
          {groupedSlots.map(({ day, slots: daySlots }, i) => (
            <Card
              key={day}
              className={`border-0 shadow-sm backdrop-blur-sm card-hover overflow-hidden transition-all ${
                i === todayIndex ? "bg-blue-50/80 ring-2 ring-blue-200 shadow-md" : "bg-white/80"
              }`}
            >
              <CardContent className="p-0">
                <div className={`px-6 py-3 border-b ${
                  i === todayIndex ? "bg-blue-100/50 border-blue-200" : "bg-gray-50/50 border-gray-100"
                }`}>
                  <div className="flex items-center gap-2">
                    <Calendar className={`h-4 w-4 ${i === todayIndex ? "text-blue-600" : "text-gray-400"}`} />
                    <h3 className={`font-bold ${i === todayIndex ? "text-blue-900" : "text-gray-900"}`}>{day}</h3>
                    {i === todayIndex && <Badge className="bg-blue-500 text-white text-[10px] rounded-full px-2">Today</Badge>}
                    <Badge variant="outline" className="ml-auto text-xs">{daySlots.length} classes</Badge>
                  </div>
                </div>
                {daySlots.length === 0 ? (
                  <div className="px-6 py-6 text-center text-gray-400 text-sm">No classes</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {daySlots.map((slot) => (
                      <div key={slot.id} className="flex items-center gap-4 px-6 py-3 hover:bg-white/50 transition-colors">
                        <div className="flex items-center gap-1.5 w-28 text-sm text-gray-500">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="font-mono">{slot.startTime} - {slot.endTime}</span>
                        </div>
                        <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-400 to-indigo-500" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">{slot.classSubject.subject.name}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
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
