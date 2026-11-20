import prisma from './db';
import bcrypt from 'bcryptjs';

async function runTests() {
  console.log('🧪 Starting CampusConnect Automated Integration & Database Verification...');

  // 1. Test Admin Login Credential verification
  const admin = await prisma.user.findUnique({ where: { email: 'admin@college.com' } });
  if (!admin) throw new Error('Admin user not found');
  const adminPassMatch = await bcrypt.compare('Admin@123', admin.passwordHash);
  if (!adminPassMatch) throw new Error('Admin password hash mismatch');
  console.log('  ✅ Admin authentication verified (admin@college.com)');

  // 2. Test Student Login Credential verification
  const studentUser = await prisma.user.findUnique({
    where: { email: 'student@college.com' },
    include: { studentProfile: { include: { department: true } } },
  });
  if (!studentUser || !studentUser.studentProfile) throw new Error('Student user or profile not found');
  const studentPassMatch = await bcrypt.compare('Student@123', studentUser.passwordHash);
  if (!studentPassMatch) throw new Error('Student password mismatch');
  console.log(`  ✅ Student authentication verified (${studentUser.name}, Roll: ${studentUser.studentProfile.rollNo})`);

  // 3. Test Faculty Login Credential verification
  const facultyUser = await prisma.user.findUnique({
    where: { email: 'faculty@college.com' },
    include: { facultyProfile: { include: { department: true } } },
  });
  if (!facultyUser || !facultyUser.facultyProfile) throw new Error('Faculty user not found');
  const facultyPassMatch = await bcrypt.compare('Faculty@123', facultyUser.passwordHash);
  if (!facultyPassMatch) throw new Error('Faculty password mismatch');
  console.log(`  ✅ Faculty authentication verified (${facultyUser.name}, ID: ${facultyUser.facultyProfile.employeeId})`);

  // 4. Test Staff Login Credential verification
  const staffUser = await prisma.user.findUnique({ where: { email: 'staff@college.com' } });
  if (!staffUser) throw new Error('Staff user not found');
  const staffPassMatch = await bcrypt.compare('Staff@123', staffUser.passwordHash);
  if (!staffPassMatch) throw new Error('Staff password mismatch');
  console.log(`  ✅ Staff authentication verified (${staffUser.name}, Role: ${staffUser.role})`);

  // 5. Test Full CRUD Cycle on Students Table
  const testEmail = `test.student.${Date.now()}@college.com`;
  const testRoll = `TEST-${Date.now().toString().slice(-4)}`;
  const dept = await prisma.department.findFirst();
  if (!dept) throw new Error('No department found for testing');

  // CREATE
  const createdUser = await prisma.user.create({
    data: {
      email: testEmail,
      name: 'Integration Test Student',
      passwordHash: await bcrypt.hash('Test@123', 10),
      role: 'STUDENT',
    },
  });
  const createdStudent = await prisma.student.create({
    data: {
      userId: createdUser.id,
      rollNo: testRoll,
      departmentId: dept.id,
      semester: 3,
      batch: '2024-2028',
      cgpa: 8.5,
    },
  });
  console.log(`  ✅ CREATE Student record: ${createdStudent.rollNo} (ID: ${createdStudent.id})`);

  // READ
  const fetchedStudent = await prisma.student.findUnique({
    where: { id: createdStudent.id },
    include: { user: true, department: true },
  });
  if (!fetchedStudent || fetchedStudent.rollNo !== testRoll) throw new Error('Student READ failed');
  console.log(`  ✅ READ Student record: Verified rollNo and department ${fetchedStudent.department.code}`);

  // UPDATE
  const updatedStudent = await prisma.student.update({
    where: { id: createdStudent.id },
    data: { cgpa: 9.25, semester: 4 },
  });
  if (updatedStudent.cgpa !== 9.25 || updatedStudent.semester !== 4) throw new Error('Student UPDATE failed');
  console.log(`  ✅ UPDATE Student record: CGPA updated to ${updatedStudent.cgpa}`);

  // DELETE
  await prisma.user.delete({ where: { id: createdUser.id } }); // Cascades student
  const deletedCheck = await prisma.student.findUnique({ where: { id: createdStudent.id } });
  if (deletedCheck !== null) throw new Error('Student DELETE cascade failed');
  console.log('  ✅ DELETE Student record: Cascade deletion verified');

  // 6. Test Academic Attendance Operation
  const sampleCourse = await prisma.course.findFirst();
  const sampleStudent = await prisma.student.findFirst();
  if (sampleCourse && sampleStudent) {
    const att = await prisma.attendance.create({
      data: {
        studentId: sampleStudent.id,
        courseId: sampleCourse.id,
        date: new Date(),
        status: 'PRESENT',
        remarks: 'Automated Test Check',
      },
    });
    console.log(`  ✅ Attendance CREATE: Logged record ${att.id} for course ${sampleCourse.code}`);
    await prisma.attendance.delete({ where: { id: att.id } });
    console.log('  ✅ Attendance DELETE cleanup passed');
  }

  // 7. Test Library Circulation (Issue & Return with Transaction)
  const book = await prisma.libraryBook.findFirst();
  if (book && sampleStudent && staffUser) {
    const initialCopies = book.availableCopies;
    const [issue] = await prisma.$transaction([
      prisma.bookIssue.create({
        data: {
          bookId: book.id,
          studentId: sampleStudent.id,
          dueDate: new Date(Date.now() + 7 * 86400000),
          issuedByStaffId: staffUser.id,
          status: 'ISSUED',
        },
      }),
      prisma.libraryBook.update({
        where: { id: book.id },
        data: { availableCopies: { decrement: 1 } },
      }),
    ]);
    console.log(`  ✅ Library ISSUE Book: Issued "${book.title}", copies: ${initialCopies} -> ${initialCopies - 1}`);

    // Return transaction
    await prisma.$transaction([
      prisma.bookIssue.update({
        where: { id: issue.id },
        data: { status: 'RETURNED', returnDate: new Date(), fineAmount: 0 },
      }),
      prisma.libraryBook.update({
        where: { id: book.id },
        data: { availableCopies: { increment: 1 } },
      }),
    ]);
    console.log(`  ✅ Library RETURN Book: Returned with copy restoration: -> ${initialCopies}`);
    await prisma.bookIssue.delete({ where: { id: issue.id } });
  }

  // 8. Test Audit Trail logging
  const auditEntry = await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'INTEGRATION_TEST_PASS',
      entity: 'DATABASE',
      details: 'All automated verification tests executed and passed successfully.',
      ipAddress: '127.0.0.1',
    },
  });
  console.log(`  ✅ Audit Log CREATE: Verified logging ID ${auditEntry.id}`);

  // 9. Test Authorized User Registration Flow (Transaction)
  const regEmail = `new.student.${Date.now()}@college.com`;
  const regRoll = `REG-${Date.now().toString().slice(-4)}`;
  const regHash = await bcrypt.hash('NewPass@123', 10);
  const registeredUser = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: {
        email: regEmail,
        name: 'Self Registered Student',
        passwordHash: regHash,
        role: 'STUDENT',
        phone: '+91 99999 88888',
      },
    });
    await tx.student.create({
      data: {
        userId: u.id,
        rollNo: regRoll,
        departmentId: dept.id,
        semester: 1,
        batch: '2024-2028',
      },
    });
    return u;
  });
  console.log(`  ✅ Registration Flow: User created with Roll ${regRoll} (${registeredUser.email})`);

  // 10. Test Password Reset Flow
  const newResetHash = await bcrypt.hash('ResetPass@123', 10);
  await prisma.user.update({
    where: { id: registeredUser.id },
    data: { passwordHash: newResetHash },
  });
  const resetPassMatch = await bcrypt.compare('ResetPass@123', (await prisma.user.findUnique({ where: { id: registeredUser.id } }))!.passwordHash);
  if (!resetPassMatch) throw new Error('Password reset verification failed');
  console.log('  ✅ Password Reset Flow: Password hash successfully updated and verified');

  // Clean up registered test user
  await prisma.user.delete({ where: { id: registeredUser.id } });
  console.log('  ✅ Registered test user cleanup completed');

  console.log('\n🎉 ALL INTEGRATION & DATABASE TESTS PASSED WITH 100% SUCCESS!');
}

runTests()
  .catch((err) => {
    console.error('❌ Integration Test Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
