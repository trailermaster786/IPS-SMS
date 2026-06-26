import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(1, "Full name is required"),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT", "PARENT"]),
  phone: z.string().optional(),
});

export const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  homeroomTeacherId: z.string().optional(),
});

export const createSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().min(1, "Subject code is required"),
});

export const createClassSubjectSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  subjectId: z.string().min(1, "Subject is required"),
  teacherId: z.string().min(1, "Teacher is required"),
});

export const createAssignmentSchema = z.object({
  classSubjectId: z.string().min(1, "Class subject is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  attachmentUrl: z.string().optional(),
});

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  audienceRole: z.enum(["ADMIN", "TEACHER", "STUDENT", "PARENT"]).optional(),
  classId: z.string().optional(),
});

export const markAttendanceSchema = z.object({
  studentId: z.string().min(1),
  classId: z.string().min(1),
  date: z.string().min(1),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
});

export const enterResultSchema = z.object({
  studentId: z.string().min(1),
  classSubjectId: z.string().min(1),
  term: z.string().min(1),
  examType: z.string().min(1),
  marksObtained: z.number().min(0),
  totalMarks: z.number().min(1),
  grade: z.string().optional(),
  remarks: z.string().optional(),
});

export const createFeeStructureSchema = z.object({
  classId: z.string().optional(),
  name: z.string().min(1),
  amount: z.number().min(0),
  currency: z.string().default("USD"),
  term: z.string().min(1),
  dueDate: z.string().min(1),
});

export const createMessageSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
