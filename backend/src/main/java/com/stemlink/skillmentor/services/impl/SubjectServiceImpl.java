package com.stemlink.skillmentor.services.impl;

import com.stemlink.skillmentor.entities.Mentor;
import com.stemlink.skillmentor.entities.Subject;
import com.stemlink.skillmentor.respositories.MentorRepository;
import com.stemlink.skillmentor.respositories.SubjectRepository;
import com.stemlink.skillmentor.respositories.SessionRepository;
import com.stemlink.skillmentor.services.MentorService;
import com.stemlink.skillmentor.services.SubjectService;
import com.stemlink.skillmentor.exceptions.SkillMentorException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository subjectRepository;
    private final MentorRepository mentorRepository;
    private final SessionRepository sessionRepository;
    private final MentorService mentorService;

    public List<Subject> getAllSubjects() {
        try {
            return subjectRepository.findAll();
        } catch (Exception exception) {
            log.error("Failed to get all subjects", exception);
            throw new SkillMentorException("Failed to get all subjects", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @CacheEvict(value = "mentors", allEntries = true)
    public Subject addNewSubject(Long mentorId, Subject subject) {
        try {
            log.info("Attempting to add new subject with lead mentor ID: {}", mentorId);
            Mentor mentor = mentorRepository.findById(mentorId).orElseThrow(
                    () -> {
                        log.error("MENTOR NOT FOUND in database for ID: {}", mentorId);
                        return new SkillMentorException("Mentor not found with ID: " + mentorId, HttpStatus.NOT_FOUND);
                    });
            subject.setMentor(mentor);
            log.info("Mentor found: {} {}. Saving subject...", mentor.getFirstName(), mentor.getLastName());
            return subjectRepository.save(subject);
        } catch (SkillMentorException e) {
            throw e;
        } catch (DataIntegrityViolationException e) {
            log.error("Data integrity violation while adding subject: {}", e.getMessage());
            throw new SkillMentorException("Subject already exists or database constraint violation",
                    HttpStatus.CONFLICT);
        } catch (Exception exception) {
            log.error("Failed to add new subject", exception);
            throw new SkillMentorException("Failed to add new subject", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public Subject getSubjectById(Long id) {
        return subjectRepository.findById(id).orElseThrow(
                () -> new SkillMentorException("Subject not found", HttpStatus.NOT_FOUND));
    }

    @CacheEvict(value = "mentors", allEntries = true)
    public Subject updateSubjectById(Long id, Subject updatedSubject) {
        try {
            Subject subject = subjectRepository.findById(id).orElseThrow(
                    () -> new SkillMentorException("Subject not found", HttpStatus.NOT_FOUND));

            // Basic field updates
            subject.setSubjectName(updatedSubject.getSubjectName());
            subject.setDescription(updatedSubject.getDescription());
            if (updatedSubject.getCourseImageUrl() != null) {
                subject.setCourseImageUrl(updatedSubject.getCourseImageUrl());
            }

            // Handle Mentor update if mentor ID is provided (via mapped entity)
            if (updatedSubject.getMentor() != null && updatedSubject.getMentor().getId() != null) {
                Long mentorId = updatedSubject.getMentor().getId();
                Mentor mentor = mentorRepository.findById(mentorId).orElseThrow(
                        () -> new SkillMentorException("Mentor not found with ID: " + mentorId, HttpStatus.NOT_FOUND));
                subject.setMentor(mentor);
            }

            return subjectRepository.save(subject);
        } catch (SkillMentorException e) {
            throw e;
        } catch (DataIntegrityViolationException e) {
            log.error("Data integrity violation while updating subject: {}", e.getMessage());
            throw new SkillMentorException("Database constraint violation", HttpStatus.CONFLICT);
        } catch (Exception exception) {
            log.error("Error updating subject", exception);
            throw new SkillMentorException("Failed to update subject", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = "mentors", allEntries = true)
    public void deleteSubject(Long id) {
        try {
            log.info("Attempting to delete subject with ID: {}", id);

            // 1. Delete all associated sessions first to avoid foreign key constraints
            log.info("Deleting all sessions associated with subject: {}", id);
            sessionRepository.deleteBySubjectId(id);

            // 2. Delete the subject itself
            subjectRepository.deleteById(id);
            subjectRepository.flush();

            // 3. Sync mentor stats as the enrollment counts and ratings might have changed
            log.info("Triggering background stats sync after subject deletion");
            mentorService.syncAllMentorStats();

            log.info("Successfully deleted subject {} and all related bookings", id);
        } catch (Exception exception) {
            log.error("Failed to delete subject with id {}", id, exception);
            throw new SkillMentorException("Failed to delete subject due to database constraints or server error",
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
