import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("Seeding database...");

  const adminPassword = await hashPassword("admin123");
  const teacherPassword = await hashPassword("teacher123");
  const studentPassword = await hashPassword("student123");
  const parentPassword = await hashPassword("parent123");

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@school.com" },
    update: {},
    create: {
      email: "admin@school.com",
      password: adminPassword,
      role: "ADMIN",
      fullName: "System Administrator",
      phone: "+1234567890",
      mustChangePassword: false,
    },
  });
  console.log("Created admin:", admin.email);

  // Create Teachers
  const teacher1User = await prisma.user.upsert({
    where: { email: "teacher1@school.com" },
    update: {},
    create: {
      email: "teacher1@school.com",
      password: teacherPassword,
      role: "TEACHER",
      fullName: "John Smith",
      phone: "+1234567891",
      mustChangePassword: false,
    },
  });

  const teacher1 = await prisma.teacher.upsert({
    where: { userId: teacher1User.id },
    update: {},
    create: {
      userId: teacher1User.id,
      employeeId: "TCH001",
      department: "Science",
      qualification: "M.Sc. Physics",
      joiningDate: new Date("2024-01-15"),
    },
  });

  const teacher2User = await prisma.user.upsert({
    where: { email: "teacher2@school.com" },
    update: {},
    create: {
      email: "teacher2@school.com",
      password: teacherPassword,
      role: "TEACHER",
      fullName: "Sarah Johnson",
      phone: "+1234567892",
      mustChangePassword: false,
    },
  });

  const teacher2 = await prisma.teacher.upsert({
    where: { userId: teacher2User.id },
    update: {},
    create: {
      userId: teacher2User.id,
      employeeId: "TCH002",
      department: "Mathematics",
      qualification: "M.Sc. Mathematics",
      joiningDate: new Date("2024-02-01"),
    },
  });
  console.log("Created teachers:", teacher1User.email, teacher2User.email);

  // Create Classes
  const class1 = await prisma.class.upsert({
    where: { id: "class-1" },
    update: {},
    create: {
      id: "class-1",
      name: "Grade 10A",
      academicYear: "2026/2027",
      homeroomTeacherId: teacher1.id,
    },
  });

  const class2 = await prisma.class.upsert({
    where: { id: "class-2" },
    update: {},
    create: {
      id: "class-2",
      name: "Grade 10B",
      academicYear: "2026/2027",
      homeroomTeacherId: teacher2.id,
    },
  });
  console.log("Created classes:", class1.name, class2.name);

  // Create Subjects
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { code: "PHY" },
      update: {},
      create: { name: "Physics", code: "PHY" },
    }),
    prisma.subject.upsert({
      where: { code: "MATH" },
      update: {},
      create: { name: "Mathematics", code: "MATH" },
    }),
    prisma.subject.upsert({
      where: { code: "ENG" },
      update: {},
      create: { name: "English", code: "ENG" },
    }),
    prisma.subject.upsert({
      where: { code: "CHEM" },
      update: {},
      create: { name: "Chemistry", code: "CHEM" },
    }),
    prisma.subject.upsert({
      where: { code: "BIO" },
      update: {},
      create: { name: "Biology", code: "BIO" },
    }),
  ]);
  console.log("Created subjects:", subjects.map((s: { name: string }) => s.name).join(", "));

  // Create ClassSubjects
  const classSubjects = await Promise.all([
    prisma.classSubject.upsert({
      where: { classId_subjectId: { classId: class1.id, subjectId: subjects[0].id } },
      update: {},
      create: {
        classId: class1.id,
        subjectId: subjects[0].id,
        teacherId: teacher1.id,
      },
    }),
    prisma.classSubject.upsert({
      where: { classId_subjectId: { classId: class1.id, subjectId: subjects[1].id } },
      update: {},
      create: {
        classId: class1.id,
        subjectId: subjects[1].id,
        teacherId: teacher2.id,
      },
    }),
    prisma.classSubject.upsert({
      where: { classId_subjectId: { classId: class1.id, subjectId: subjects[2].id } },
      update: {},
      create: {
        classId: class1.id,
        subjectId: subjects[2].id,
        teacherId: teacher1.id,
      },
    }),
    prisma.classSubject.upsert({
      where: { classId_subjectId: { classId: class2.id, subjectId: subjects[0].id } },
      update: {},
      create: {
        classId: class2.id,
        subjectId: subjects[0].id,
        teacherId: teacher1.id,
      },
    }),
    prisma.classSubject.upsert({
      where: { classId_subjectId: { classId: class2.id, subjectId: subjects[1].id } },
      update: {},
      create: {
        classId: class2.id,
        subjectId: subjects[1].id,
        teacherId: teacher2.id,
      },
    }),
    prisma.classSubject.upsert({
      where: { classId_subjectId: { classId: class2.id, subjectId: subjects[3].id } },
      update: {},
      create: {
        classId: class2.id,
        subjectId: subjects[3].id,
        teacherId: teacher1.id,
      },
    }),
  ]);
  console.log("Created class-subject assignments");

  // Create Students
  const studentData = [
    { email: "student1@school.com", name: "Alice Brown", admission: "ADM001", classId: class1.id, gender: "Female" },
    { email: "student2@school.com", name: "Bob Wilson", admission: "ADM002", classId: class1.id, gender: "Male" },
    { email: "student3@school.com", name: "Carol Davis", admission: "ADM003", classId: class1.id, gender: "Female" },
    { email: "student4@school.com", name: "David Lee", admission: "ADM004", classId: class2.id, gender: "Male" },
    { email: "student5@school.com", name: "Emma Garcia", admission: "ADM005", classId: class2.id, gender: "Female" },
  ];

  const students = [];
  for (const data of studentData) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        password: studentPassword,
        role: "STUDENT",
        fullName: data.name,
        mustChangePassword: false,
      },
    });

    const student = await prisma.student.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        admissionNumber: data.admission,
        dateOfBirth: new Date("2010-01-15"),
        gender: data.gender,
        classId: data.classId,
      },
    });
    students.push(student);
  }
  console.log("Created students:", studentData.map((s) => s.name).join(", "));

  // Create Parents
  const parent1User = await prisma.user.upsert({
    where: { email: "parent1@school.com" },
    update: {},
    create: {
      email: "parent1@school.com",
      password: parentPassword,
      role: "PARENT",
      fullName: "Michael Brown",
      phone: "+1234567893",
      mustChangePassword: false,
    },
  });

  const parent1 = await prisma.parent.upsert({
    where: { userId: parent1User.id },
    update: {},
    create: {
      userId: parent1User.id,
      occupation: "Engineer",
      address: "123 Main St",
    },
  });

  const parent2User = await prisma.user.upsert({
    where: { email: "parent2@school.com" },
    update: {},
    create: {
      email: "parent2@school.com",
      password: parentPassword,
      role: "PARENT",
      fullName: "Jennifer Wilson",
      phone: "+1234567894",
      mustChangePassword: false,
    },
  });

  const parent2 = await prisma.parent.upsert({
    where: { userId: parent2User.id },
    update: {},
    create: {
      userId: parent2User.id,
      occupation: "Doctor",
      address: "456 Oak Ave",
    },
  });

  const parent3User = await prisma.user.upsert({
    where: { email: "parent3@school.com" },
    update: {},
    create: {
      email: "parent3@school.com",
      password: parentPassword,
      role: "PARENT",
      fullName: "Robert Lee",
      phone: "+1234567895",
      mustChangePassword: false,
    },
  });

  const parent3 = await prisma.parent.upsert({
    where: { userId: parent3User.id },
    update: {},
    create: {
      userId: parent3User.id,
      occupation: "Lawyer",
      address: "789 Pine Rd",
    },
  });
  console.log("Created parents:", parent1User.email, parent2User.email, parent3User.email);

  // Link Parents to Students
  await prisma.parentStudent.upsert({
    where: { parentId_studentId: { parentId: parent1.id, studentId: students[0].id } },
    update: {},
    create: { parentId: parent1.id, studentId: students[0].id, relation: "Father" },
  });

  await prisma.parentStudent.upsert({
    where: { parentId_studentId: { parentId: parent2.id, studentId: students[1].id } },
    update: {},
    create: { parentId: parent2.id, studentId: students[1].id, relation: "Mother" },
  });

  await prisma.parentStudent.upsert({
    where: { parentId_studentId: { parentId: parent3.id, studentId: students[3].id } },
    update: {},
    create: { parentId: parent3.id, studentId: students[3].id, relation: "Father" },
  });

  await prisma.parentStudent.upsert({
    where: { parentId_studentId: { parentId: parent2.id, studentId: students[4].id } },
    update: {},
    create: { parentId: parent2.id, studentId: students[4].id, relation: "Mother" },
  });
  console.log("Created parent-student links");

  // Create Fee Structures
  const feeStructure1 = await prisma.feeStructure.create({
    data: {
      classId: class1.id,
      name: "Term 1 Tuition - Grade 10A",
      amount: 500,
      term: "Term 1",
      dueDate: new Date("2026-03-31"),
    },
  });

  const feeStructure2 = await prisma.feeStructure.create({
    data: {
      classId: class2.id,
      name: "Term 1 Tuition - Grade 10B",
      amount: 500,
      term: "Term 1",
      dueDate: new Date("2026-03-31"),
    },
  });
  console.log("Created fee structures");

  // Create Invoices
  await prisma.invoice.create({
    data: {
      studentId: students[0].id,
      feeStructureId: feeStructure1.id,
      amountDue: 500,
      amountPaid: 500,
      status: "PAID",
      dueDate: new Date("2026-03-31"),
    },
  });

  await prisma.invoice.create({
    data: {
      studentId: students[1].id,
      feeStructureId: feeStructure1.id,
      amountDue: 500,
      amountPaid: 250,
      status: "PARTIAL",
      dueDate: new Date("2026-03-31"),
    },
  });

  await prisma.invoice.create({
    data: {
      studentId: students[2].id,
      feeStructureId: feeStructure1.id,
      amountDue: 500,
      amountPaid: 0,
      status: "PENDING",
      dueDate: new Date("2026-03-31"),
    },
  });

  await prisma.invoice.create({
    data: {
      studentId: students[3].id,
      feeStructureId: feeStructure2.id,
      amountDue: 500,
      amountPaid: 0,
      status: "OVERDUE",
      dueDate: new Date("2025-12-31"),
    },
  });

  await prisma.invoice.create({
    data: {
      studentId: students[4].id,
      feeStructureId: feeStructure2.id,
      amountDue: 500,
      amountPaid: 500,
      status: "PAID",
      dueDate: new Date("2026-03-31"),
    },
  });
  console.log("Created invoices");

  // Create Timetable Slots
  const timetableSlots = [
    { classId: class1.id, classSubjectId: classSubjects[0].id, dayOfWeek: 0, startTime: "08:00", endTime: "08:45" },
    { classId: class1.id, classSubjectId: classSubjects[1].id, dayOfWeek: 0, startTime: "08:45", endTime: "09:30" },
    { classId: class1.id, classSubjectId: classSubjects[2].id, dayOfWeek: 0, startTime: "09:45", endTime: "10:30" },
    { classId: class1.id, classSubjectId: classSubjects[0].id, dayOfWeek: 1, startTime: "08:00", endTime: "08:45" },
    { classId: class1.id, classSubjectId: classSubjects[1].id, dayOfWeek: 1, startTime: "08:45", endTime: "09:30" },
    { classId: class2.id, classSubjectId: classSubjects[3].id, dayOfWeek: 0, startTime: "08:00", endTime: "08:45" },
    { classId: class2.id, classSubjectId: classSubjects[4].id, dayOfWeek: 0, startTime: "08:45", endTime: "09:30" },
    { classId: class2.id, classSubjectId: classSubjects[3].id, dayOfWeek: 1, startTime: "08:00", endTime: "08:45" },
    { classId: class2.id, classSubjectId: classSubjects[4].id, dayOfWeek: 1, startTime: "08:45", endTime: "09:30" },
  ];

  for (const slot of timetableSlots) {
    await prisma.timetableSlot.create({ data: slot });
  }
  console.log("Created timetable slots");

  // Create Announcements
  await prisma.announcement.create({
    data: {
      title: "Welcome to the New Term",
      content: "We welcome all students and staff to the new academic term. Let's make it a productive one!",
      authorId: admin.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: "Science Fair - Grade 10A",
      content: "The annual science fair will be held next Friday. All Grade 10A students are encouraged to participate.",
      audienceRole: "STUDENT",
      classId: class1.id,
      authorId: teacher1User.id,
    },
  });
  console.log("Created announcements");

  // Create Attendance records
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    for (const student of students) {
      await prisma.attendance.create({
        data: {
          studentId: student.id,
          classId: student.classId!,
          date,
          status: i === 0 ? "PRESENT" : Math.random() > 0.2 ? "PRESENT" : "ABSENT",
        },
      });
    }
  }
  console.log("Created attendance records");

  // Create Library Books
  const books = await Promise.all([
    prisma.book.upsert({
      where: { isbn: "978-0-13-468599-1" },
      update: {},
      create: {
        title: "Introduction to Algorithms",
        author: "Thomas H. Cormen",
        isbn: "978-0-13-468599-1",
        category: "Computer Science",
        publisher: "MIT Press",
        publishYear: 2009,
        totalCopies: 3,
        availableCopies: 2,
      },
    }),
    prisma.book.upsert({
      where: { isbn: "978-0-06-112008-4" },
      update: {},
      create: {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        isbn: "978-0-06-112008-4",
        category: "Literature",
        publisher: "Harper Perennial",
        publishYear: 1960,
        totalCopies: 5,
        availableCopies: 4,
      },
    }),
    prisma.book.upsert({
      where: { isbn: "978-0-13-213080-6" },
      update: {},
      create: {
        title: "Physics for Scientists and Engineers",
        author: "Raymond A. Serway",
        isbn: "978-0-13-213080-6",
        category: "Science",
        publisher: "Cengage Learning",
        publishYear: 2013,
        totalCopies: 4,
        availableCopies: 3,
      },
    }),
    prisma.book.upsert({
      where: { isbn: "978-0-32-112521-7" },
      update: {},
      create: {
        title: "Calculus: Early Transcendentals",
        author: "James Stewart",
        isbn: "978-0-32-112521-7",
        category: "Mathematics",
        publisher: "Cengage Learning",
        publishYear: 2015,
        totalCopies: 4,
        availableCopies: 4,
      },
    }),
    prisma.book.upsert({
      where: { isbn: "978-0-14-028329-7" },
      update: {},
      create: {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "978-0-14-028329-7",
        category: "Literature",
        publisher: "Scribner",
        publishYear: 1925,
        totalCopies: 6,
        availableCopies: 5,
      },
    }),
  ]);
  console.log("Created library books:", books.map((b: { title: string }) => b.title).join(", "));

  // Create Book Copies
  for (const book of books) {
    for (let i = 1; i <= book.totalCopies; i++) {
      await prisma.bookCopy.upsert({
        where: { barcode: `${book.isbn}-${i}` },
        update: {},
        create: {
          bookId: book.id,
          barcode: `${book.isbn}-${i}`,
          status: i <= book.availableCopies ? "AVAILABLE" : "BORROWED",
        },
      });
    }
  }
  console.log("Created book copies");

  // Create Vehicles
  const vehicle1 = await prisma.vehicle.upsert({
    where: { plateNumber: "SCH-001" },
    update: {},
    create: {
      name: "School Bus Alpha",
      plateNumber: "SCH-001",
      capacity: 40,
      driverName: "James Wilson",
      driverPhone: "+1234567800",
      type: "Bus",
    },
  });

  const vehicle2 = await prisma.vehicle.upsert({
    where: { plateNumber: "SCH-002" },
    update: {},
    create: {
      name: "School Bus Beta",
      plateNumber: "SCH-002",
      capacity: 30,
      driverName: "Mary Thompson",
      driverPhone: "+1234567801",
      type: "Bus",
    },
  });
  console.log("Created vehicles:", vehicle1.name, vehicle2.name);

  // Create Routes
  const route1 = await prisma.route.create({
    data: {
      name: "North Route",
      vehicleId: vehicle1.id,
      stops: "Main St & 1st Ave, Oak Park, Elm Street, School Gate",
      departureTime: "07:00",
      arrivalTime: "07:45",
    },
  });

  const route2 = await prisma.route.create({
    data: {
      name: "South Route",
      vehicleId: vehicle2.id,
      stops: "Central Station, River Rd, Pine Valley, School Gate",
      departureTime: "07:15",
      arrivalTime: "07:55",
    },
  });
  console.log("Created routes:", route1.name, route2.name);

  // Assign students to routes
  await prisma.studentRoute.create({
    data: { studentId: students[0].id, routeId: route1.id, stopName: "Oak Park" },
  });
  await prisma.studentRoute.create({
    data: { studentId: students[1].id, routeId: route1.id, stopName: "Main St & 1st Ave" },
  });
  await prisma.studentRoute.create({
    data: { studentId: students[2].id, routeId: route2.id, stopName: "Central Station" },
  });
  await prisma.studentRoute.create({
    data: { studentId: students[3].id, routeId: route2.id, stopName: "River Rd" },
  });
  console.log("Created student-route assignments");

  // Create Audit Log entries
  await prisma.auditLog.create({
    data: { userId: admin.id, action: "USER_CREATED", details: "Seeded admin user" },
  });
  await prisma.auditLog.create({
    data: { userId: admin.id, action: "CLASS_CREATED", details: "Seeded classes" },
  });
  await prisma.auditLog.create({
    data: { userId: admin.id, action: "FEE_STRUCTURE_CREATED", details: "Seeded fee structures" },
  });
  console.log("Created audit log entries");

  console.log("\nSeed completed successfully!");
  console.log("\nTest accounts:");
  console.log("Admin: admin@school.com / admin123");
  console.log("Teacher: teacher1@school.com / teacher123");
  console.log("Teacher: teacher2@school.com / teacher123");
  console.log("Student: student1@school.com / student123");
  console.log("Parent: parent1@school.com / parent123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
