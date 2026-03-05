// Modified to match with backend SubjectResponseDTO
export interface Subject {
  id: number;
  subjectName: string;
  description: string;
  courseImageUrl: string;
  enrollmentCount: number;
}

// Modified to match with backend MentorResponseDTO (from GET /api/v1/mentors)
export interface Mentor {
  id: number;
  mentorId: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  profession: string;
  company: string;
  experienceYears: number;
  bio: string;
  profileImageUrl: string;
  positiveReviews: number;
  totalEnrollments: number;
  averageRating: number;
  totalReviews: number;
  isCertified: boolean;
  startYear: string;
  subjects: Subject[];
  reviews?: any[];
}

// Modified to match with SessionResponseDTO (from GET /api/v1/sessions/my-sessions)
export interface Enrollment {
  id: number;
  mentorName: string;
  mentorProfileImageUrl: string;
  subjectName: string;
  sessionAt: string;
  durationMinutes: number;
  sessionStatus: "scheduled" | "completed" | string;
  paymentStatus: "pending" | "confirmed" | "completed" | "cancelled" | string;
  meetingLink: string | null;
  studentReview?: string;
  studentRating?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
