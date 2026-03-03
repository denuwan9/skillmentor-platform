import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { CalendarDays } from "lucide-react";
import { StatusPill } from "@/components/StatusPill";
import { getMyEnrollments } from "@/lib/api";
import type { Enrollment } from "@/types";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ReviewModal } from "@/components/ReviewModal";
import { Star } from "lucide-react";

export default function DashboardPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const router = useNavigate();

  useEffect(() => {
    async function fetchEnrollments() {
      if (!user) return;
      const token = await getToken({ template: "skillmentor-auth" });
      if (!token) return;
      try {
        console.log("Fetching enrollments with token:", token);
        const data = await getMyEnrollments(token);
        setEnrollments(data);
      } catch (err) {
        console.error("Failed to fetch enrollments", err);
      }
    }

    if (isLoaded && isSignedIn) {
      fetchEnrollments();
    }
  }, [isLoaded, isSignedIn, getToken, user]);

  const handleReviewSuccess = () => {
    // Refresh enrollments to update UI state if needed
    if (user) {
      getToken({ template: "skillmentor-auth" }).then(token => {
        if (token) getMyEnrollments(token).then(setEnrollments);
      });
    }
  };

  if (!isLoaded) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    router("/login");
    return null;
  }

  if (!enrollments.length) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold tracking-tight mb-6">My Courses</h1>
        <p className="text-muted-foreground">No courses enrolled yet.</p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-6">My Courses</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {enrollments.map((enrollment) => (
          <div
            key={enrollment.id}
            className="rounded-2xl p-4 sm:p-6 relative overflow-hidden bg-linear-to-br from-blue-500 to-blue-600"
          >
            {/* Status Pill */}
            <div className="absolute top-4 right-4">
              <StatusPill
                status={enrollment.sessionStatus === "completed" ? "completed" : enrollment.paymentStatus}
              />
            </div>

            {/* Profile Image */}
            <div className="size-20 sm:size-24 rounded-full bg-white/10 mb-4">
              {enrollment.mentorProfileImageUrl ? (
                <img
                  src={enrollment.mentorProfileImageUrl}
                  alt={enrollment.mentorName}
                  className="w-full h-full rounded-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {enrollment.mentorName.charAt(0)}
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white">
                {enrollment.subjectName}
              </h2>
              <p className="text-blue-100/80">
                Mentor: {enrollment.mentorName}
              </p>
              <div className="flex items-center text-blue-100/80 text-sm mt-2">
                <CalendarDays className="mr-2 h-4 w-4" />
                {enrollment.sessionStatus === "completed" ? "Completed on: " : "Next Session: "}
                {new Date(enrollment.sessionAt).toLocaleDateString()}
              </div>
            </div>

            {/* Review Button */}
            {enrollment.sessionStatus === "completed" && (
              <div className="mt-4 pt-4 border-t border-white/10">
                {enrollment.studentRating ? (
                  <div className="flex items-center gap-1.5 text-white/90 text-sm bg-white/10 w-fit px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>Your Rating: {enrollment.studentRating}/5</span>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full bg-white text-blue-600 hover:bg-white/90"
                    onClick={() => {
                      setSelectedEnrollment(enrollment);
                      setIsReviewModalOpen(true);
                    }}
                  >
                    Write a Review
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedEnrollment && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          sessionId={selectedEnrollment.id}
          mentorName={selectedEnrollment.mentorName}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
