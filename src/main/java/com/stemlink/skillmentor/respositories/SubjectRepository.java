package com.stemlink.skillmentor.respositories;

import com.stemlink.skillmentor.entities.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    // custom queries
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(s) FROM Session s WHERE s.subject.id = :subjectId")
    long countEnrollmentsBySubjectId(@org.springframework.data.repository.query.Param("subjectId") Long subjectId);
}
