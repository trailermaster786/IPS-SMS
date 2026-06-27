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
import {
  Plus,
  Search,
  UserPlus,
  Users,
  GraduationCap,
  ChevronDown,
} from "lucide-react";

interface Student {
  id: string;
  admissionNumber: string;
  dateOfBirth: string;
  gender?: string;
  address?: string;
  enrollmentDate: string;
  user: { fullName: string; email: string; createdAt: string };
  class?: { name: string };
  parents: {
    parent: {
      user: { fullName: string; email: string };
    };
    relation?: string;
  }[];
}

interface Class {
  id: string;
  name: string;
}

export default function AdmissionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showParentFields, setShowParentFields] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    admissionNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    classId: "",
    parentEmail: "",
    parentName: "",
    parentPhone: "",
    parentOccupation: "",
    relation: "Parent",
  });

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/admin/admission");
      if (response.ok) setStudents(await response.json());
    } catch {
      toast({ title: "Error", description: "Failed to fetch students", variant: "destructive" });
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

  const generateAdmissionNumber = () => {
    const year = new Date().getFullYear();
    const num = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
    setFormData((prev) => ({ ...prev, admissionNumber: `ADM-${year}-${num}` }));
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
      phone: "",
      admissionNumber: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      classId: "",
      parentEmail: "",
      parentName: "",
      parentPhone: "",
      parentOccupation: "",
      relation: "Parent",
    });
    setShowParentFields(false);
    generateAdmissionNumber();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password || "student123",
        phone: formData.phone || undefined,
        admissionNumber: formData.admissionNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender || undefined,
        address: formData.address || undefined,
        classId: formData.classId || undefined,
      };

      if (showParentFields && formData.parentEmail && formData.parentName) {
        payload.parentEmail = formData.parentEmail;
        payload.parentName = formData.parentName;
        payload.parentPhone = formData.parentPhone || undefined;
        payload.parentOccupation = formData.parentOccupation || undefined;
        payload.relation = formData.relation;
      }

      const response = await fetch("/api/admin/admission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Student Admitted",
          description: `${formData.fullName} has been enrolled as ${formData.admissionNumber}`,
        });
        setIsDialogOpen(false);
        resetForm();
        fetchStudents();
      } else {
        toast({
          title: "Admission Failed",
          description: data.error || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to admit student",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      await fetchStudents();
      await fetchClasses();
      generateAdmissionNumber();
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (session?.user?.role !== "ADMIN") {
    router.push("/dashboard");
    return null;
  }

  const filteredStudents = students.filter(
    (s) =>
      (s.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (classFilter === "all" || s.class?.name === classFilter)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">
            Student Admission & Enrollment
          </h1>
          <p className="text-gray-500 mt-1">Admit new students and manage enrollment</p>
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
            Admit New Student
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Admit New Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@school.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admissionNumber" className="text-sm font-medium text-gray-700">Admission Number *</Label>
                  <Input
                    id="admissionNumber"
                    value={formData.admissionNumber}
                    onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                    className="h-11 rounded-xl font-mono"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Default: student123"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => { if (value) setFormData({ ...formData, gender: value }); }}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Class</Label>
                  <Select value={formData.classId} onValueChange={(value) => { if (value) setFormData({ ...formData, classId: value }); }}>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="Optional"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
                  <Input
                    id="address"
                    placeholder="Optional"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowParentFields(!showParentFields)}
                  className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${showParentFields ? "rotate-180" : ""}`} />
                  {showParentFields ? "Hide" : "Add"} Parent/Guardian Information
                </button>
              </div>

              {showParentFields && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parentName" className="text-sm font-medium text-gray-700">Parent Name</Label>
                      <Input
                        id="parentName"
                        placeholder="Parent full name"
                        value={formData.parentName}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentEmail" className="text-sm font-medium text-gray-700">Parent Email</Label>
                      <Input
                        id="parentEmail"
                        type="email"
                        placeholder="parent@email.com"
                        value={formData.parentEmail}
                        onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parentPhone" className="text-sm font-medium text-gray-700">Parent Phone</Label>
                      <Input
                        id="parentPhone"
                        placeholder="Optional"
                        value={formData.parentPhone}
                        onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentOccupation" className="text-sm font-medium text-gray-700">Occupation</Label>
                      <Input
                        id="parentOccupation"
                        placeholder="Optional"
                        value={formData.parentOccupation}
                        onChange={(e) => setFormData({ ...formData, parentOccupation: e.target.value })}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Relation</Label>
                      <Select value={formData.relation} onValueChange={(value) => { if (value) setFormData({ ...formData, relation: value }); }}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Father">Father</SelectItem>
                          <SelectItem value="Mother">Mother</SelectItem>
                          <SelectItem value="Guardian">Guardian</SelectItem>
                          <SelectItem value="Parent">Parent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
              >
                {isSubmitting ? "Admitting..." : "Admit Student"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        {[
          { label: "Total Admitted", value: students.length, icon: Users, gradient: "from-blue-500 to-indigo-600" },
          { label: "This Month", value: students.filter((s) => {
            const d = new Date(s.enrollmentDate);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).length, icon: UserPlus, gradient: "from-emerald-500 to-teal-600" },
          { label: "Classes", value: classes.length, icon: GraduationCap, gradient: "from-violet-500 to-purple-600" },
          { label: "With Parents", value: students.filter((s) => s.parents.length > 0).length, icon: Users, gradient: "from-amber-500 to-orange-600" },
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

      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, admission number, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200"
              />
            </div>
            <Select value={classFilter} onValueChange={(value) => { if (value) setClassFilter(value); }}>
              <SelectTrigger className="w-[180px] h-11 rounded-xl">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.name}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No students found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {student.user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{student.user.fullName}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{student.admissionNumber}</span>
                      <span>{student.class?.name || "Unassigned"}</span>
                    </div>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-sm text-gray-500">{student.user.email}</p>
                    <p className="text-xs text-gray-400">
                      Enrolled: {formatDate(student.enrollmentDate)}
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-full text-xs">
                    {student.gender || "N/A"}
                  </Badge>
                  {student.parents.length > 0 && (
                    <Badge variant="default" className="rounded-full text-xs bg-emerald-100 text-emerald-700">
                      Parent Linked
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
