
import { Student, Payment, Representative, Teacher, Subject, Grade } from './types';

export const BCV_RATE = 36.5; // Example current rate

// Images
export const LOGO_URL = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiiq_XQJqgw_vQJDQj-1vCNzvvQvbQhYQW_rWqZ-xO_zP7_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x/s1600/logo-ueagru.png"; 
export const BG_IMAGE_URL = "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2586&auto=format&fit=crop"; 

// Mock Data
export const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'Sofía Rodríguez', cedula: '32.123.456', grade: '5to Grado', section: 'A', parentId: 'r1' },
  { id: 's2', name: 'Mateo Rodríguez', cedula: '33.987.654', grade: '2do Año', section: 'B', parentId: 'r1' },
  { id: 's3', name: 'Andrea Pérez', cedula: '32.456.789', grade: '5to Grado', section: 'A', parentId: 'r2' },
  { id: 's4', name: 'Gabriel García', cedula: '32.111.222', grade: '5to Grado', section: 'A', parentId: 'r3' },
  { id: 's5', name: 'Lucía Fernández', cedula: '32.333.444', grade: '5to Grado', section: 'A', parentId: 'r4' },
  { id: 's6', name: 'Diego Martínez', cedula: '32.555.666', grade: '5to Grado', section: 'A', parentId: 'r5' },
  { id: 's7', name: 'Valentina López', cedula: '32.777.888', grade: '5to Grado', section: 'A', parentId: 'r6' },
  { id: 's8', name: 'Samuel González', cedula: '32.999.000', grade: '5to Grado', section: 'A', parentId: 'r7' },
  { id: 's9', name: 'Camila Hernández', cedula: '32.121.212', grade: '5to Grado', section: 'A', parentId: 'r8' },
  { id: 's10', name: 'Sebastián Ruiz', cedula: '32.343.434', grade: '5to Grado', section: 'A', parentId: 'r9' },
  { id: 's11', name: 'Isabella Torres', cedula: '32.565.656', grade: '5to Grado', section: 'A', parentId: 'r10' },
  { id: 's12', name: 'Alejandro Vargas', cedula: '32.787.878', grade: '5to Grado', section: 'A', parentId: 'r11' },
  { id: 's13', name: 'Mariana Castillo', cedula: '32.909.090', grade: '5to Grado', section: 'A', parentId: 'r12' },
  { id: 's14', name: 'Daniel Romero', cedula: '32.131.313', grade: '5to Grado', section: 'A', parentId: 'r13' },
  { id: 's15', name: 'Victoria Mendoza', cedula: '32.353.535', grade: '5to Grado', section: 'A', parentId: 'r14' },
  { id: 's16', name: 'Andrés Silva', cedula: '32.575.757', grade: '5to Grado', section: 'A', parentId: 'r15' },
  { id: 's17', name: 'Natalia Flores', cedula: '32.797.979', grade: '5to Grado', section: 'A', parentId: 'r16' },
  { id: 's18', name: 'Leonardo Rojas', cedula: '32.242.424', grade: '5to Grado', section: 'A', parentId: 'r17' },
  { id: 's19', name: 'Paula Medina', cedula: '32.464.646', grade: '5to Grado', section: 'A', parentId: 'r18' },
  { id: 's20', name: 'Javier Castro', cedula: '32.686.868', grade: '5to Grado', section: 'A', parentId: 'r19' },
  { id: 's21', name: 'Elena Ortiz', cedula: '32.808.080', grade: '5to Grado', section: 'A', parentId: 'r20' },
  { id: 's22', name: 'Ricardo Morales', cedula: '32.151.515', grade: '5to Grado', section: 'A', parentId: 'r21' },
  { id: 's23', name: 'Gabriela Nuñez', cedula: '32.373.737', grade: '5to Grado', section: 'A', parentId: 'r22' },
  { id: 's24', name: 'Manuel Jiménez', cedula: '32.595.959', grade: '5to Grado', section: 'A', parentId: 'r23' },
  { id: 's25', name: 'Daniela Peña', cedula: '32.818.181', grade: '5to Grado', section: 'A', parentId: 'r24' },
  { id: 's26', name: 'Carlos Ramos', cedula: '32.262.626', grade: '5to Grado', section: 'A', parentId: 'r25' },
  { id: 's27', name: 'Sara Alvarado', cedula: '32.484.848', grade: '5to Grado', section: 'A', parentId: 'r26' },
  { id: 's28', name: 'Luis Cordero', cedula: '32.606.060', grade: '5to Grado', section: 'A', parentId: 'r27' },
  { id: 's29', name: 'Clara Méndez', cedula: '32.929.292', grade: '5to Grado', section: 'A', parentId: 'r28' },
  { id: 's30', name: 'Miguel Salazar', cedula: '32.141.414', grade: '5to Grado', section: 'A', parentId: 'r29' },
];

export const MOCK_REPRESENTATIVES: Representative[] = [
  { id: 'r1', name: 'Ana María Rojas', cedula: '12.345.678', email: 'ana@test.com', phone: '0414-1234567', address: 'Av. Principal, Casa 12' },
  { id: 'r2', name: 'Carlos Pérez', cedula: '15.987.654', email: 'carlos@test.com', phone: '0412-1234567', address: 'Calle 3, Urb. Centro' },
  { id: 'r3', name: 'Luisa Hernández', cedula: '18.123.456', email: 'luisa@test.com', phone: '0416-7654321', address: 'Av. Bolívar, Res. Flor' },
];

export const MOCK_PAYMENTS: Payment[] = [
  { 
    id: 'p1', 
    studentId: 's1', 
    concept: 'Mensualidad Octubre', 
    amountUsd: 45, 
    amountBs: 45 * 35.0, // Calculated with old rate
    status: 'verified', 
    date: '05/10/2025 08:30 AM',
    exchangeRate: 35.0 // Historical Rate
  },
  { 
    id: 'p2', 
    studentId: 's2', 
    concept: 'Mensualidad Octubre', 
    amountUsd: 55, 
    amountBs: 55 * 35.0, // Calculated with old rate
    status: 'pending', 
    date: '06/10/2025 02:20 PM'
    // No exchangeRate yet because it's pending/current
  },
  { 
    id: 'p3', 
    studentId: 's1', 
    concept: 'Seguro Escolar', 
    amountUsd: 20, 
    amountBs: 20 * 36.5, 
    status: 'rejected', 
    date: '15/09/2025 09:00 AM', 
    adminNote: 'El comprobante de pago es ilegible. Por favor, suba una imagen más clara.',
    exchangeRate: 36.5 
  },
  { 
    id: 'p4', 
    studentId: 's1', 
    concept: 'Mensualidad Noviembre', 
    amountUsd: 45, 
    amountBs: 45 * 36.5, // Will be recalculated in UI based on current rate
    status: 'pending', // En revisión
    date: '05/11/2025 10:00 AM',
    reference: '12345678'
  },
  { 
    id: 'p5', 
    studentId: 's1', 
    concept: 'Mensualidad Diciembre', 
    amountUsd: 45, 
    amountBs: 45 * 36.5, // Will be recalculated in UI based on current rate
    status: 'unpaid', // Pendiente por pagar
    date: '-', 
  },
];

export const MOCK_TEACHERS: Teacher[] = [
  { id: 't1', name: 'Prof. Carlos Sánchez', cedula: '10.111.222' },
  { id: 't2', name: 'Prof. María González', cedula: '12.333.444' },
  { id: 't3', name: 'Prof. Pedro López', cedula: '14.555.666' },
];

// Expanded subjects for the schedule grid
export const MOCK_SUBJECTS: Subject[] = [
  { 
    id: 'sub1', name: 'Matemáticas', grade: '5to Grado', section: 'A', teacherId: 't1',
    schedule: [
      { day: 'Lunes', startTime: '07:00 AM', endTime: '08:30 AM', room: 'A-1' }, 
      { day: 'Miércoles', startTime: '07:00 AM', endTime: '08:30 AM', room: 'A-1' },
      { day: 'Viernes', startTime: '07:00 AM', endTime: '08:30 AM', room: 'A-1' }
    ]
  },
  { 
    id: 'sub2', name: 'Historia', grade: '5to Grado', section: 'A', teacherId: 't1',
    schedule: [
      { day: 'Martes', startTime: '07:00 AM', endTime: '08:30 AM', room: 'A-1' },
      { day: 'Jueves', startTime: '07:00 AM', endTime: '08:30 AM', room: 'A-1' }
    ]
  },
  { 
    id: 'sub3', name: 'Lenguaje', grade: '5to Grado', section: 'A', teacherId: 't1',
    schedule: [
      { day: 'Martes', startTime: '08:30 AM', endTime: '09:15 AM', room: 'A-1' },
      { day: 'Jueves', startTime: '08:30 AM', endTime: '09:15 AM', room: 'A-1' }
    ]
  },
  { 
    id: 'sub4', name: 'Ciencias', grade: '5to Grado', section: 'A', teacherId: 't1',
    schedule: [
      { day: 'Lunes', startTime: '08:30 AM', endTime: '09:15 AM', room: 'Lab-1' },
      { day: 'Miércoles', startTime: '08:30 AM', endTime: '09:15 AM', room: 'Lab-1' },
      { day: 'Viernes', startTime: '08:30 AM', endTime: '09:15 AM', room: 'Lab-1' }
    ]
  },
  { 
    id: 'sub5', name: 'Inglés', grade: '5to Grado', section: 'A', teacherId: 't1',
    schedule: [
      { day: 'Lunes', startTime: '10:30 AM', endTime: '12:00 PM', room: 'A-1' },
      { day: 'Miércoles', startTime: '10:30 AM', endTime: '12:00 PM', room: 'A-1' }
    ]
  },
  { 
    id: 'sub6', name: 'Deportes', grade: '5to Grado', section: 'A', teacherId: 't1',
    schedule: [
      { day: 'Martes', startTime: '10:30 AM', endTime: '12:00 PM', room: 'Cancha' },
      { day: 'Jueves', startTime: '10:30 AM', endTime: '12:00 PM', room: 'Cancha' }
    ]
  },
  { 
    id: 'sub7', name: 'Geografía', grade: '5to Grado', section: 'A', teacherId: 't1',
    schedule: [
      { day: 'Lunes', startTime: '12:00 PM', endTime: '12:45 PM', room: 'A-1' },
      { day: 'Miércoles', startTime: '12:00 PM', endTime: '12:45 PM', room: 'A-1' }
    ]
  },
  { 
    id: 'sub8', name: 'Física', grade: '5to Grado', section: 'A', teacherId: 't1',
    schedule: [
      { day: 'Martes', startTime: '12:00 PM', endTime: '12:45 PM', room: 'A-1' },
      { day: 'Jueves', startTime: '12:00 PM', endTime: '12:45 PM', room: 'A-1' },
      { day: 'Viernes', startTime: '12:00 PM', endTime: '12:45 PM', room: 'A-1' }
    ]
  },
  { 
    id: 'sub9', name: 'Arte', grade: '5to Grado', section: 'A', teacherId: 't1',
    schedule: [
      { day: 'Viernes', startTime: '10:30 AM', endTime: '12:00 PM', room: 'Taller' }
    ]
  },
  { 
    id: 'sub10', name: 'Biología', grade: '5to Grado', section: 'A', teacherId: 't1',
    schedule: [
      { day: 'Lunes', startTime: '12:45 PM', endTime: '01:30 PM', room: 'Lab-2' }
    ]
  },
  {
    id: 'sub11', name: 'GHC', grade: '5to Grado', section: 'A', teacherId: 't1',
    schedule: [
      { day: 'Miércoles', startTime: '12:45 PM', endTime: '01:30 PM', room: 'A-1' }
    ]
  },
  {
    id: 'sub12', name: 'Orientación', grade: '5to Grado', section: 'A', teacherId: 't1',
    schedule: [
      { day: 'Viernes', startTime: '12:45 PM', endTime: '01:30 PM', room: 'A-1' },
      { day: 'Lunes', startTime: '09:15 AM', endTime: '09:45 AM', room: 'A-1' }
    ]
  }
];

export const MOCK_GRADES: Grade[] = [
  { studentId: 's1', subjectId: 'sub1', evaluationName: 'Examen Parcial 1', score: 18, date: '2025-10-15' },
  { studentId: 's1', subjectId: 'sub2', evaluationName: 'Trabajo Investigación', score: 16, date: '2025-10-20' },
];
