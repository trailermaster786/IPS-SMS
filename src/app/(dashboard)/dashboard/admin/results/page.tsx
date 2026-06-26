"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Award, BookOpen } from "lucide-react";

interface Result {
  id: string;
  term: string;
  examType: string;
  marksObtained: number;
  totalMarks: number;
  grade?: string;
  student: {
    user: { fullName: string };
    admissionNumber: string;
  };
  classSubject: {
    subject: { name: string };
    class: { name: string };
  };
}

export default function ResultsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch("/api/admin/results");
      if (response.ok) setResults(await response.json());
    } catch (error) { console.error("Failed to fetch results:", error); }
    finally { setIsLoading(false); }
  };

  if (session?.user?.role !== "ADMIN") { router.push("/dashboard"); return null; }

  const gradeColor: Record<string, string> = {
    "A+": "bg-emerald-100 text-emerald-700",
    A: "bg-emerald-100 text-emerald-700",
    "A-": "bg-emerald-50 text-emerald-600",
    "B+": "bg-blue-100 text-blue-700",
    B: "bg-blue-100 text-blue-700",
    "B-": "bg-blue-50 text-blue-600",
    "C+": "bg-amber-100 text-amber-700",
    C: "bg-amber-100 text-amber-700",
    "C-": "bg-amber-50 text-amber-600",
    D: "bg-orange-100 text-orange-700",
    F: "bg-red-100 text-red-700",
  };

  const avgPercentage = results.length
    ? Math.round(results.reduce((sum, r) => sum + (r.marksObtained / r.totalMarks) * 100, 0) / results.length)
    : 0;

  const topPerformers = [...results]
    .sort((a, b) => (b.marksObtained / b.totalMarks) - (a.marksObtained / a.totalMarks))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">Results Overview</h1>
        <p className="text-gray-500 mt-1">Student academic performance at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        {[
          { label: "Total Results", value: results.length, icon: BarChart3, gradient: "from-blue-500 to-indigo-600" },
          { label: "Avg. Score", value: `${avgPercentage}%`, icon: TrendingUp, gradient: "from-emerald-500 to-teal-600" },
          { label: "A Grade Students", value: results.filter((r) => r.grade?.startsWith("A")).length, icon: Award, gradient: "from-amber-500 to-orange-600" },
          { label: "Subjects", value: new Set(results.map((r) => r.classSubject.subject.name)).size, icon: BookOpen, gradient: "from-violet-500 to-purple-600" },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-children" style={{ animationDelay: "0.3s" }}>
        {/* All Results */}
        <Card className="lg:col-span-2 border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">All Results</h3>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No results yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {results.map((result) => {
                  const pct = Math.round((result.marksObtained / result.totalMarks) * 100);
                  return (
                    <div key={result.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{result.student.user.fullName}</p>
                        <p className="text-xs text-gray-500">{result.classSubject.subject.name} &middot; {result.classSubject.class.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{result.marksObtained}/{result.totalMarks}</p>
                        <p className="text-xs text-gray-400">{pct}%</p>
                      </div>
                      <Badge variant="outline" className={`rounded-full text-xs font-bold ${gradeColor[result.grade || ""] || ""}`}>
                        {result.grade || "-"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Top Performers</h3>
            <div className="space-y-3">
              {topPerformers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
              ) : (
                topPerformers.map((result, i) => (
                  <div key={result.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0 ? "bg-amber-100 text-amber-700" :
                      i === 1 ? "bg-gray-100 text-gray-600" :
                      i === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-gray-50 text-gray-400"
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{result.student.user.fullName}</p>
                      <p className="text-xs text-gray-400">{result.classSubject.subject.name}</p>
                    </div>
                    <Badge variant="outline" className={`rounded-full text-xs font-bold ${gradeColor[result.grade || ""] || ""}`}>
                      {result.grade || "-"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
