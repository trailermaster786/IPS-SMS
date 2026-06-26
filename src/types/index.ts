export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  employeeId: string;
  department?: string;
  qualification?: string;
  joiningDate: Date;
}

export interface StudentProfile {
  id: string;
  userId: string;
  admissionNumber: string;
  dateOfBirth: Date;
  gender?: string;
  address?: string;
  enrollmentDate: Date;
  classId?: string;
}

export interface ParentProfile {
  id: string;
  userId: string;
  occupation?: string;
  address?: string;
}

export interface Class {
  id: string;
  name: string;
  academicYear: string;
  homeroomTeacherId?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface ClassSubject {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
}

export interface Invoice {
  id: string;
  studentId: string;
  feeStructureId: string;
  amountDue: number;
  amountPaid: number;
  status: "PENDING" | "PAID" | "PARTIAL" | "OVERDUE";
  dueDate: Date;
}

export interface Payment {
  id: string;
  invoiceId: string;
  parentId: string;
  amount: number;
  method: string;
  stripeSessionId?: string;
  status: string;
  paidAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  audienceRole?: string;
  classId?: string;
  authorId: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}
