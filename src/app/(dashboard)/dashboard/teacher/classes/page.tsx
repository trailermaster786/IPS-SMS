"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, GraduationCap } from "lucide-react";

interface ClassSubject {
  id: string;
  class: { name: string };
  subject: { name: string };
  _count: { students: number };
}

export default function TeacherClassesPage() {
  const { data: session } = useSession();
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchClasses(); }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/teacher/classes");
      if (response.ok) setClassSubjects(await response.json());
    } catch (error) { console.error("Failed to fetch classes:", error); }
    finally { setIsLoading(false); }
  };

  const subjectColors = [
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-violet-500 to-purple-600",
  ];

  const totalStudents = classSubjects.reduce((sum, cs) => sum + (cs._count?.students || 0), 0);

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">My Classes</h1>
        <p className="text-gray-500 mt-1">Your assigned classes and subjects</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
        {[
          { label: "Assigned Subjects", value: classSubjects.length, icon: BookOpen, gradient: "from-emerald-500 to-teal-600" },
          { label: "Total Students", value: totalStudents, icon: Users, gradient: "from-blue-500 to-indigo-600" },
          { label: "Unique Classes", value: new Set(classSubjects.map((cs) => cs.class.name)).size, icon: GraduationCap, gradient: "from-violet-500 to-purple-600" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : classSubjects.length === 0 ? (
        <Card className="border-0 shadow-sm bg-white/80">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No classes assigned yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
          {classSubjects.map((cs, i) => (
            <Card key={cs.id} className="group border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover card-border-gradient overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${subjectColors[i % subjectColors.length]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">{cs._count?.students || 0} students</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{cs.subject.name}</h3>
                <p className="text-sm text-gray-500">{cs.class.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
