import { useEffect, useState } from "react";
import { MentorCard } from "@/components/MentorCard";
import { getPublicMentors } from "@/lib/api";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/clerk-react";
import type { Mentor } from "@/types";

export default function HomePage() {
  const { isSignedIn } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    // Increase size to get more mentors for pagination demonstration if needed, 
    // but here we fetch a reasonable amount and do frontend pagination 
    getPublicMentors(0, 50)
      .then((data) => setMentors(data.content))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Flatten all subjects from all mentors
  const allSubjects = mentors.flatMap((mentor) =>
    mentor.subjects.map((subject) => ({
      mentor,
      subject,
    }))
  );

  const totalPages = Math.ceil(allSubjects.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSubjects = allSubjects.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  return (
    <div className="py-10">
      <div className="flex flex-col items-center justify-center space-y-8 text-center py-8">
        <div className="space-y-2">
          <h1 className="text-5xl tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Find your SkillMentor
          </h1>
          <p className="mx-auto text-gray-500 md:text-xl dark:text-gray-400 max-w-xs sm:max-w-full">
            Empower your career with personalized mentorship for AWS Developer{" "}
            <br className="hidden sm:block" />
            Associate, Interview Prep, and more.
          </p>
        </div>

        {isSignedIn ? (
          <Link to="/dashboard">
            <Button size="lg" className="text-xl">
              Go to Dashboard
            </Button>
          </Link>
        ) : (
          <Link to="/login">
            <Button size="lg" className="text-xl">
              Sign up to see all tutors
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-8 mt-8 container bg-background">
        <h1 className="lg:text-5xl md:text-4xl sm:text-3xl text-3xl">
          Schedule a Call
        </h1>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground">
            Loading mentors...
          </div>
        ) : allSubjects.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No mentors available yet.
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedSubjects.map(({ mentor, subject }) => (
                <MentorCard
                  key={`${mentor.id}-${subject.id}`}
                  mentor={mentor}
                  subject={subject}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 py-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="w-10"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
