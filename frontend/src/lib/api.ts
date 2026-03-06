import type { Enrollment, Mentor } from "@/types";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

async function fetchWithAuth(
  endpoint: string,
  token: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = `${API_BASE_URL.replace(/\/$/, "")}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const isJson = res.headers.get("content-type")?.includes("application/json");
    const error = isJson ? await res.json() : { message: `HTTP ${res.status}` };
    throw new Error(error.message || "Request failed");
  }

  return res;
}


export async function getPublicMentors(
  page = 0,
  size = 10,
): Promise<{ content: Mentor[]; totalElements: number; totalPages: number }> {
  const url = `${API_BASE_URL.replace(/\/$/, "")}/api/v1/mentors?page=${page}&size=${size}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch mentors");
  return res.json();
}

export async function getMyEnrollments(token: string): Promise<Enrollment[]> {
  const res = await fetchWithAuth("/api/v1/sessions/my-sessions", token);
  return res.json();
}

export async function submitReview(
  token: string,
  sessionId: number,
  rating: number,
  review: string,
): Promise<any> {
  const res = await fetchWithAuth(`/api/v1/sessions/${sessionId}/review`, token, {
    method: "PUT",
    body: JSON.stringify({
      studentRating: rating,
      studentReview: review,
    }),
  });
  return res.json();
}

export async function enrollInSession(
  token: string,
  sessionData: any,
): Promise<any> {
  const res = await fetchWithAuth("/api/v1/sessions/enroll", token, {
    method: "POST",
    body: JSON.stringify(sessionData),
  });
  return res.json();
}