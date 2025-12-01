
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

export interface Subject {
  id: string;
  name: string;
  grade: string;
  section: string;
  teacherId: string;
  schedule?: ScheduleItem[];
}

export interface ScheduleItem {
  day: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface Grade {
  studentId: string;
  subjectId: string;
  evaluationName: string;
  score: number; // 0-20
  date: string;
}

export interface Payment {
  id: string;
  studentId: string;
  concept: string;
  amountUsd: number;
  amountBs: number;
  status: 'pending' | 'verified' | 'rejected' | 'unpaid';
  date: string;
  reference?: string;
  adminNote?: string;
  exchangeRate?: number; // Historical rate for the payment
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