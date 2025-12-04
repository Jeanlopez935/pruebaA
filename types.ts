
export type Role = 'representante' | 'docente' | 'admin' | 'oficinista';

export interface User {
  id: string;
  name: string;
  role: Role;
  username: string;
  avatar?: string;
}

export interface Student {
  id: string;
  name: string;
  cedula: string;
  grade: string;
  section: string;
  parentId: string;
}

export interface ScheduleItem {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  room: string;
}

export interface Subject {
  id: string;
  name: string;
  grade_level: string;
  section: string;
  teacher: string | null;
  schedules?: ScheduleItem[];
}

export interface Evaluation {
  id: string;
  subjectId: string;
  name: string;
  percentage: number;
  date: string;
  lapso: number;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  evaluationName: string;
  evaluationLapso?: number;
  score: number; // 0-20
  date: string;
}

export interface Payment {
  id: number;
  student: number;
  concept: string;
  amount_usd: string;
  amount_bs: string;
  rate_applied: string;
  date_reported: string;
  reference_number: string;
  proof_image: string | null;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  admin_note?: string;
  // Read-only fields from serializer
  student_name?: string;
  student_lastname?: string;
  student_grade?: string;
  student_section?: string;
  representative_name?: string;
  representative_lastname?: string;
  representative_cedula?: string;
  student_cedula?: string;
  representative_phone?: string;
  representative_email?: string;
  representative_address?: string;
}

export interface Representative {
  id: string;
  name: string;
  cedula: string;
  email: string;
  phone: string;
  address: string;
}

export interface Teacher {
  id: string;
  name: string;
  cedula: string;
}