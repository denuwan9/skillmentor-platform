package com.stemlink.skillmentor.services.impl;

import com.stemlink.skillmentor.entities.Mentor;
import com.stemlink.skillmentor.exceptions.SkillMentorException;
import com.stemlink.skillmentor.respositories.MentorRepository;
import com.stemlink.skillmentor.respositories.SessionRepository;
import com.stemlink.skillmentor.respositories.SubjectRepository;
import com.stemlink.skillmentor.services.MentorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MentorServiceImpl implements MentorService {

    private final MentorRepository mentorRepository;
    private final SessionRepository sessionRepository;
    private final SubjectRepository subjectRepository;
    private final ModelMapper modelMapper;

    @CacheEvict(value = "mentors", allEntries = true)
    public Mentor createNewMentor(Mentor mentor) {
        try {
            return mentorRepository.save(mentor);
        } catch (DataIntegrityViolationException e) {
            log.error("Data integrity violation while creating mentor: {}", e.getMessage());
            throw new SkillMentorException("Mentor with this email already exists", HttpStatus.CONFLICT);
        } catch (Exception exception) {
            log.error("Failed to create new mentor", exception);
            throw new SkillMentorException("Failed to create new mentor", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Cacheable(value = "mentors", key = "(#name ?: '') + '_' + #pageable.pageNumber + '_' + #pageable.pageSize")
    public Page<Mentor> getAllMentors(String name, Pageable pageable) {
        try {
            log.debug("getting mentors with name: {}", name);
            if (name != null && !name.isEmpty()) {
                return mentorRepository.findByName(name, pageable);
            }
            return mentorRepository.findAll(pageable); // SELECT * FROM mentor
        } catch (Exception exception) {
            log.error("Failed to get all mentors", exception);
            throw new SkillMentorException("Failed to get all mentors", HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @Cacheable(value = "mentors", key = "#id")
    public Mentor getMentorById(Long id) {
        try {

            Mentor mentor = mentorRepository.findById(id).orElseThrow(
                    () -> new SkillMentorException("Mentor Not found", HttpStatus.NOT_FOUND));
            log.info("Successfully fetched mentor {}", id);
            return mentor;
        } catch (SkillMentorException skillMentorException) {
            // System.err.println("Mentor not found " + skillMentorException.getMessage());
            // LOG LEVELS
            // DEBUG, INFO, WARN, ERROR
            // env - dev, prod
            log.warn("Mentor not found with id: {} to fetch", id, skillMentorException);
            throw new SkillMentorException("Mentor Not found", HttpStatus.NOT_FOUND);
        } catch (Exception exception) {
            log.error("Error getting mentor", exception);
            throw new SkillMentorException("Failed to get mentor", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @CacheEvict(value = "mentors", allEntries = true)
    public Mentor updateMentorById(Long id, Mentor updatedMentor) {
        try {
            Mentor mentor = mentorRepository.findById(id).orElseThrow(
                    () -> new SkillMentorException("Mentor Not found", HttpStatus.NOT_FOUND));
            modelMapper.map(updatedMentor, mentor);
            return mentorRepository.save(mentor);
        } catch (SkillMentorException skillMentorException) {
            log.warn("Mentor not found with id: {} to update", id, skillMentorException);
            throw new SkillMentorException("Mentor Not found", HttpStatus.NOT_FOUND);
        } catch (Exception exception) {
            log.error("Error updating mentor", exception);
            throw new SkillMentorException("Failed to update mentor", HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteMentor(Long id) {
        try {
            Mentor mentor = mentorRepository.findById(id).orElseThrow(
                    () -> new SkillMentorException("Mentor not found with ID: " + id, HttpStatus.NOT_FOUND));
            mentorRepository.delete(mentor);
            log.info("Successfully deleted mentor with id {} and all associated data", id);
        } catch (SkillMentorException e) {
            throw e;
        } catch (Exception exception) {
            log.error("Failed to delete mentor with id {}", id, exception);
            throw new SkillMentorException("Failed to delete mentor due to associated data constraints",
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public Mentor getMentorProfile(Long id) {
        // Use JOIN FETCH query to eagerly load subjects in a single DB call.
        // We do NOT reuse getMentorById() here because that method is @Cacheable
        // and may return a cached entity whose lazy 'subjects' collection is
        // already detached and will deserialize as empty.
        return mentorRepository.findByIdWithSubjects(id)
                .orElseThrow(() -> new SkillMentorException("Mentor Not found", HttpStatus.NOT_FOUND));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    @CacheEvict(value = "mentors", allEntries = true)
    public void syncAllMentorStats() {
        log.info("Starting synchronization of all mentor and subject statistics...");

        java.util.List<Mentor> mentors = mentorRepository.findAll();
        for (Mentor mentor : mentors) {
            Double avgRating = sessionRepository.getAverageRatingByMentorId(mentor.getId());
            long totalReviews = sessionRepository.countTotalReviewsByMentorId(mentor.getId());
            long positiveReviewsCount = sessionRepository.countPositiveReviewsByMentorId(mentor.getId());
            long totalEnrollments = sessionRepository.countTotalSessionsByMentorId(mentor.getId());

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
            log.debug("Synced stats for mentor: {}", mentor.getLastName());
        }

        java.util.List<com.stemlink.skillmentor.entities.Subject> subjects = subjectRepository.findAll();
        for (com.stemlink.skillmentor.entities.Subject subject : subjects) {
            long subjectEnrollments = subjectRepository.countEnrollmentsBySubjectId(subject.getId());
            subject.setEnrollmentCount((int) subjectEnrollments);
            subjectRepository.save(subject);
        }
        log.info("Successfully synchronized statistics for {} mentors and {} subjects.", mentors.size(),
                subjects.size());
    }
}
