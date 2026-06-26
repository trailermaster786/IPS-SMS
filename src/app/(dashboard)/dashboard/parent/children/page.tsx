"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, ClipboardCheck, BarChart3 } from "lucide-react";

interface Child {
  id: string;
  user: { fullName: string; email: string };
  admissionNumber: string;
  class?: { name: string };
  attendanceRate?: number;
  avgGrade?: string;
}

export default function ParentChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchChildren(); }, []);

  const fetchChildren = async () => {
    try {
      const response = await fetch("/api/parent/children/details");
      if (response.ok) setChildren(await response.json());
    } catch (error) { console.error(error); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-rose-900 to-pink-900 bg-clip-text text-transparent">My Children</h1>
        <p className="text-gray-500 mt-1">Overview of your children&apos;s academic progress</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{[1, 2].map((i) => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : children.length === 0 ? (
        <Card className="border-0 shadow-sm bg-white/80">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No children found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
          {children.map((child) => (
            <Card key={child.id} className="group border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover card-border-gradient overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {child.user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{child.user.fullName}</h3>
                    <p className="text-sm text-gray-500">{child.class?.name || "No class assigned"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl bg-blue-50/50">
                    <ClipboardCheck className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-lg font-bold">{child.attendanceRate || 0}%</p>
                    <p className="text-[10px] text-gray-400">Attendance</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-emerald-50/50">
                    <BarChart3 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-lg font-bold">{child.avgGrade || "N/A"}</p>
                    <p className="text-[10px] text-gray-400">Avg Grade</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-amber-50/50">
                    <TrendingUp className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                    <p className="text-lg font-bold">{child.admissionNumber}</p>
                    <p className="text-[10px] text-gray-400">Adm. No.</p>
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
