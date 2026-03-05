package com.stemlink.skillmentor.services.impl;

import com.stemlink.skillmentor.entities.Session;
import com.stemlink.skillmentor.entities.Student;
import com.stemlink.skillmentor.entities.Mentor;
import com.stemlink.skillmentor.entities.Subject;
import com.stemlink.skillmentor.exceptions.SkillMentorException;
import com.stemlink.skillmentor.respositories.SessionRepository;
import com.stemlink.skillmentor.respositories.StudentRepository;
import com.stemlink.skillmentor.respositories.MentorRepository;
import com.stemlink.skillmentor.respositories.SubjectRepository;
import com.stemlink.skillmentor.dto.SessionDTO;
import com.stemlink.skillmentor.security.UserPrincipal;
import com.stemlink.skillmentor.services.SessionService;
import com.stemlink.skillmentor.utils.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionServiceImpl implements SessionService {

    private final SessionRepository sessionRepository;
    private final StudentRepository studentRepository;
    private final MentorRepository mentorRepository;
    private final SubjectRepository subjectRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    @CacheEvict(value = "mentors", allEntries = true)
    public Session createNewSession(SessionDTO sessionDTO) {
        // Fetch the related entities by their IDs
        try {
            Student student = studentRepository.findById(sessionDTO.getStudentId()).orElseThrow(
                    () -> new SkillMentorException("Student not found", HttpStatus.NOT_FOUND));
            Mentor mentor = mentorRepository.findById(sessionDTO.getMentorId()).orElseThrow(
                    () -> new SkillMentorException("Mentor not found with ID: " + sessionDTO.getMentorId(),
                            HttpStatus.NOT_FOUND));
            Subject subject = subjectRepository.findById(sessionDTO.getSubjectId()).orElseThrow(
                    () -> new SkillMentorException("Subject not found", HttpStatus.NOT_FOUND));

            // Checking availability
            ValidationUtils.validateMentorAvailability(mentor, sessionDTO.getSessionAt(),
                    sessionDTO.getDurationMinutes());
            ValidationUtils.validateStudentAvailability(student, sessionDTO.getSessionAt(),
                    sessionDTO.getDurationMinutes());

            // using model mapper
            Session session = modelMapper.map(sessionDTO, Session.class);
            session.setStudent(student);
            session.setMentor(mentor);
            session.setSubject(subject);

            Session savedSession = sessionRepository.save(session);
            sessionRepository.flush(); // Ensure DB sees the new session for counts
            updateMentorStats(mentor.getId());
            updateSubjectStats(subject.getId());
            return savedSession;
        } catch (SkillMentorException skillMentorException) {
            log.error("Dependencies not found to map: {}, Failed to create new session",
                    skillMentorException.getMessage());
            throw skillMentorException;
        } catch (Exception exception) {
            log.error("Failed to create session", exception);
            throw new SkillMentorException("Failed to create new session", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public List<Session> getAllSessions() {
        return sessionRepository.findAll(); // SELECT * FROM sessions
    }

    public Session getSessionById(Long id) {
        return sessionRepository.findById(id).orElseThrow(
                () -> new SkillMentorException("Session not found", HttpStatus.NOT_FOUND));
    }

    @Override
    @Transactional
    @CacheEvict(value = "mentors", allEntries = true)
    public Session updateSessionById(Long id, SessionDTO updatedSessionDTO) {
        Session session = sessionRepository.findById(id).orElseThrow(
                () -> new SkillMentorException("Session not found", HttpStatus.NOT_FOUND));

        // source -> destination
        modelMapper.map(updatedSessionDTO, session);

        // Update the related entities
        if (updatedSessionDTO.getStudentId() != null) {
            Student student = studentRepository.findById(updatedSessionDTO.getStudentId()).get();
            session.setStudent(student);
        }
        if (updatedSessionDTO.getMentorId() != null) {
            Mentor mentor = mentorRepository.findById(updatedSessionDTO.getMentorId())
                    .orElseThrow(() -> new SkillMentorException(
                            "Mentor not found with ID: " + updatedSessionDTO.getMentorId(), HttpStatus.NOT_FOUND));
            session.setMentor(mentor);
        }
        if (updatedSessionDTO.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(updatedSessionDTO.getSubjectId()).get();
            session.setSubject(subject);
        }

        Session savedSession = sessionRepository.save(session);
        sessionRepository.flush();
        updateMentorStats(session.getMentor().getId());
        updateSubjectStats(session.getSubject().getId());
        return savedSession;
    }

    @Override
    @Transactional
    @CacheEvict(value = "mentors", allEntries = true)
    public void deleteSession(Long id) {
        try {
            log.info("Attempting to delete session with ID: {}", id);
            Session session = sessionRepository.findById(id).orElseThrow(
                    () -> new SkillMentorException("Session not found", HttpStatus.NOT_FOUND));

            Long mentorId = session.getMentor().getId();
            Long subjectId = session.getSubject().getId();

            // Use the entity itself for deletion to ensure Hibernate manages the state
            // correctly
            sessionRepository.delete(session);
            sessionRepository.flush();

            // Recalculate stats using helpers
            updateMentorStats(mentorId);
            updateSubjectStats(subjectId);
            log.info("Successfully deleted session {} and updated stats for mentor {} and subject {}", id, mentorId,
                    subjectId);
        } catch (SkillMentorException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to delete session with id: {}", id, e);
            throw new SkillMentorException("Failed to delete booking due to server error: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = "mentors", allEntries = true)
    public Session confirmPayment(Long id) {
        Session session = sessionRepository.findById(id).orElseThrow(() -> new RuntimeException("Session not found"));
        session.setPaymentStatus("confirmed");
        return sessionRepository.save(session);
    }

    @Override
    @Transactional
    @CacheEvict(value = "mentors", allEntries = true)
    public Session markComplete(Long id) {
        Session session = sessionRepository.findById(id).orElseThrow(() -> new RuntimeException("Session not found"));
        session.setSessionStatus("completed");
        return sessionRepository.save(session);
    }

    @Override
    @Transactional
    @CacheEvict(value = "mentors", allEntries = true)
    public Session updateMeetingLink(Long id, String meetingLink) {
        Session session = sessionRepository.findById(id).orElseThrow(() -> new RuntimeException("Session not found"));
        session.setMeetingLink(meetingLink);
        return sessionRepository.save(session);
    }

    @Override
    @Transactional
    @CacheEvict(value = "mentors", allEntries = true)
    public Session enrollSession(UserPrincipal userPrincipal, SessionDTO sessionDTO) {
        // Find student by email from JWT, or auto-create user on first enrollment
        Student student = studentRepository.findByEmail(userPrincipal.getEmail())
                .orElseGet(() -> {
                    Student s = new Student();
                    s.setStudentId(userPrincipal.getId());
                    s.setEmail(userPrincipal.getEmail());
                    s.setFirstName(userPrincipal.getFirstName());
                    s.setLastName(userPrincipal.getLastName());
                    return studentRepository.save(s);
                });

        Mentor mentor = mentorRepository.findById(sessionDTO.getMentorId())
                .orElseThrow(() -> new RuntimeException("Mentor not found with ID: " + sessionDTO.getMentorId()));
        Subject subject = subjectRepository.findById(sessionDTO.getSubjectId())
                .orElseThrow(() -> new SkillMentorException("Subject not found with id: " + sessionDTO.getSubjectId(),
                        HttpStatus.NOT_FOUND));

        // Validation 1: Session time must not be in the past
        if (sessionDTO.getSessionAt().before(new Date())) {
            throw new SkillMentorException("Cannot book a session in the past", HttpStatus.BAD_REQUEST);
        }

        // Validation 2: Double-booking prevention (Mentor and Student availability)
        Integer duration = sessionDTO.getDurationMinutes() != null ? sessionDTO.getDurationMinutes() : 60;
        ValidationUtils.validateMentorAvailability(mentor, sessionDTO.getSessionAt(), duration);
        ValidationUtils.validateStudentAvailability(student, sessionDTO.getSessionAt(), duration);

        // Validation 3: Prevent multiple sessions for the same subject and time window
        // by the same student
        boolean exists = sessionRepository.existsByStudentAndSubjectAndSessionAt(student, subject,
                sessionDTO.getSessionAt());
        if (exists) {
            throw new SkillMentorException("You have already booked a session for this subject at this specific time.",
                    HttpStatus.CONFLICT);
        }

        Session session = new Session();
        session.setStudent(student);
        session.setMentor(mentor);
        session.setSubject(subject);
        session.setSessionAt(sessionDTO.getSessionAt());
        session.setDurationMinutes(sessionDTO.getDurationMinutes() != null ? sessionDTO.getDurationMinutes() : 60);
        session.setSessionStatus("scheduled");
        session.setPaymentStatus("pending");

        Session savedSession = sessionRepository.save(session);
        sessionRepository.flush();
        updateMentorStats(mentor.getId());
        updateSubjectStats(subject.getId());

        return savedSession;
    }

    public List<Session> getSessionsByStudentEmail(String email) {
        return sessionRepository.findByStudent_Email(email);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    @CacheEvict(value = "mentors", allEntries = true)
    public Session submitReview(Long sessionId, Integer rating, String reviewText) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new SkillMentorException("Session not found", HttpStatus.NOT_FOUND));

        if (!"completed".equalsIgnoreCase(session.getSessionStatus())) {
            throw new SkillMentorException("Can only review completed sessions", HttpStatus.BAD_REQUEST);
        }

        session.setStudentRating(rating);
        session.setStudentReview(reviewText);
        Session savedSession = sessionRepository.save(session);

        // Update mentor stats after review
        updateMentorStats(session.getMentor().getId());

        return savedSession;
    }

    private void updateMentorStats(Long mentorId) {
        Mentor mentor = mentorRepository.findById(mentorId).orElse(null);
        if (mentor == null)
            return;

        Double avgRating = sessionRepository.getAverageRatingByMentorId(mentorId);
        long totalReviews = sessionRepository.countTotalReviewsByMentorId(mentorId);
        long positiveReviewsCount = sessionRepository.countPositiveReviewsByMentorId(mentorId);
        long totalEnrollments = sessionRepository.countTotalSessionsByMentorId(mentorId); // Use total bookings

        mentor.setAverageRating(avgRating != null ? avgRating : 0.0);
        mentor.setTotalReviews((int) totalReviews);
        mentor.setTotalEnrollments((int) totalEnrollments);

        if (totalReviews > 0) {
            int positivePercentage = (int) ((positiveReviewsCount * 100) / totalReviews);
            mentor.setPositiveReviews(positivePercentage);
        } else {
            mentor.setPositiveReviews(0);
        }

        mentorRepository.save(mentor);
    }

    private void updateSubjectStats(Long subjectId) {
        Subject subject = subjectRepository.findById(subjectId).orElse(null);
        if (subject == null)
            return;

        long subjectEnrollments = subjectRepository.countEnrollmentsBySubjectId(subjectId);
        subject.setEnrollmentCount((int) subjectEnrollments);
        subjectRepository.save(subject);
    }

}
