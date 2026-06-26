"use client";

import { useState, useEffect } from "react";
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
  classSubject: {
    subject: { name: string };
  };
}

export default function StudentResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch("/api/student/results");
      if (response.ok) setResults(await response.json());
    } catch (error) { console.error(error); }
    finally { setIsLoading(false); }
  };

  const gradeColor: Record<string, string> = {
    "A+": "bg-emerald-100 text-emerald-700",
    A: "bg-emerald-100 text-emerald-700",
    "A-": "bg-emerald-50 text-emerald-600",
    "B+": "bg-blue-100 text-blue-700",
    B: "bg-blue-100 text-blue-700",
    "B-": "bg-blue-50 text-blue-600",
    "C+": "bg-amber-100 text-amber-700",
    C: "bg-amber-100 text-amber-700",
    F: "bg-red-100 text-red-700",
  };

  const avgPercentage = results.length
    ? Math.round(results.reduce((sum, r) => sum + (r.marksObtained / r.totalMarks) * 100, 0) / results.length)
    : 0;

  const latestResults = results.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">My Results</h1>
        <p className="text-gray-500 mt-1">View your grades and academic performance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        {[
          { label: "Avg. Score", value: `${avgPercentage}%`, icon: TrendingUp, gradient: "from-emerald-500 to-teal-600" },
          { label: "Total Exams", value: results.length, icon: BarChart3, gradient: "from-blue-500 to-indigo-600" },
          { label: "A Grades", value: results.filter((r) => r.grade?.startsWith("A")).length, icon: Award, gradient: "from-amber-500 to-orange-600" },
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

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : results.length === 0 ? (
        <Card className="border-0 shadow-sm bg-white/80">
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No results yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 stagger-children">
          {latestResults.map((result) => {
            const pct = Math.round((result.marksObtained / result.totalMarks) * 100);
            return (
              <Card key={result.id} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
                      pct >= 80 ? "bg-gradient-to-br from-emerald-400 to-teal-500" :
                      pct >= 60 ? "bg-gradient-to-br from-blue-400 to-indigo-500" :
                      "bg-gradient-to-br from-amber-400 to-orange-500"
                    }`}>
                      <span className="text-white font-bold text-sm">{pct}%</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{result.classSubject.subject.name}</p>
                      <p className="text-sm text-gray-500">{result.examType} &middot; {result.term}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{result.marksObtained}/{result.totalMarks}</p>
                    </div>
                    <Badge variant="outline" className={`rounded-full text-xs font-bold px-3 py-1 ${gradeColor[result.grade || ""] || ""}`}>
                      {result.grade || "-"}
                    </Badge>
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
