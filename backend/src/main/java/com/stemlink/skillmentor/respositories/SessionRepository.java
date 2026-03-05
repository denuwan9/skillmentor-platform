package com.stemlink.skillmentor.respositories;

import com.stemlink.skillmentor.entities.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
        List<Session> findByStudent_Email(String email);

        @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT s.student.id) FROM Session s WHERE s.mentor.id = :mentorId")
        long countUniqueStudentsByMentorId(@org.springframework.data.repository.query.Param("mentorId") Long mentorId);

        @org.springframework.data.jpa.repository.Query("SELECT COUNT(s) FROM Session s WHERE s.mentor.id = :mentorId")
        long countTotalSessionsByMentorId(@org.springframework.data.repository.query.Param("mentorId") Long mentorId);

        @org.springframework.data.jpa.repository.Query("SELECT AVG(s.studentRating) FROM Session s WHERE s.mentor.id = :mentorId AND s.studentRating IS NOT NULL")
        Double getAverageRatingByMentorId(@org.springframework.data.repository.query.Param("mentorId") Long mentorId);

        @org.springframework.data.jpa.repository.Query("SELECT COUNT(s) FROM Session s WHERE s.mentor.id = :mentorId AND s.studentRating >= 4")
        long countPositiveReviewsByMentorId(@org.springframework.data.repository.query.Param("mentorId") Long mentorId);

        @org.springframework.data.jpa.repository.Query("SELECT COUNT(s) FROM Session s WHERE s.mentor.id = :mentorId AND s.studentRating IS NOT NULL")
        long countTotalReviewsByMentorId(@org.springframework.data.repository.query.Param("mentorId") Long mentorId);

        @org.springframework.data.jpa.repository.Modifying
        @org.springframework.data.jpa.repository.Query("DELETE FROM Session s WHERE s.subject.id = :subjectId")
        void deleteBySubjectId(@org.springframework.data.repository.query.Param("subjectId") Long subjectId);

        boolean existsByStudentAndSubjectAndSessionAt(com.stemlink.skillmentor.entities.Student student,
                        com.stemlink.skillmentor.entities.Subject subject, java.util.Date sessionAt);
}
