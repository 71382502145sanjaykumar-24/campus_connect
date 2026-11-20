import { GradeLetter } from '../types/schema';

export function calculateGrade(totalMarks: number): GradeLetter {
  if (totalMarks >= 90) return 'O';
  if (totalMarks >= 80) return 'A+';
  if (totalMarks >= 70) return 'A';
  if (totalMarks >= 60) return 'B+';
  if (totalMarks >= 50) return 'B';
  if (totalMarks >= 45) return 'C';
  if (totalMarks >= 40) return 'P';
  return 'F';
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function generateAttendanceDocId(studentId: string, subjectId: string, date: string, hour: number): string {
  // Deterministic document ID ensures native deduplication at the database level!
  const cleanDate = date.replace(/[^0-9]/g, '');
  return `ATT_${studentId}_${subjectId}_${cleanDate}_H${hour}`;
}

export function generateStudentDocId(registerNumber: string): string {
  return `STU_${registerNumber.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
}

export function generateFacultyDocId(employeeId: string): string {
  return `FAC_${employeeId.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
}
