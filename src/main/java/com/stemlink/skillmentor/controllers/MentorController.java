package com.stemlink.skillmentor.controllers;

import com.stemlink.skillmentor.dto.MentorDTO;
import com.stemlink.skillmentor.entities.Mentor;
import com.stemlink.skillmentor.security.UserPrincipal;
import com.stemlink.skillmentor.services.MentorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.stemlink.skillmentor.constants.UserRoles.*;

@RestController
@RequestMapping(path = "/api/v1/mentors")
@RequiredArgsConstructor
@Validated
// @PreAuthorize("isAuthenticated()") // Allow all authenticated users to access
// mentor endpoints, but specific actions are further restricted by method-level
// security annotations
public class MentorController extends AbstractController {

    private final MentorService mentorService;
    private final ModelMapper modelMapper;

    @GetMapping
    public ResponseEntity<Page<Mentor>> getAllMentors(
            @RequestParam(required = false) String name,
            Pageable pageable) {
        Page<Mentor> mentors = mentorService.getAllMentors(name, pageable);

        // Populate stats for each mentor DTO if needed
        // (Mentor entity already has these fields, assuming they are updated elsewhere
        // or should be calculated)

        return sendOkResponse(mentors);
    }

    @GetMapping("{id}/stats")
    public ResponseEntity<?> getMentorStats(@PathVariable Long id) {
        Mentor mentor = mentorService.getMentorById(id);
        // Simple mock of stats calculation or just return entity fields
        return ResponseEntity.ok(java.util.Map.of(
                "totalEnrollments", mentor.getSessions() != null ? mentor.getSessions().size() : 0,
                "positiveReviews", mentor.getPositiveReviews() != null ? mentor.getPositiveReviews() : 0,
                "yearsExperience", mentor.getExperienceYears()));
    }

    @GetMapping("{id}")
    public ResponseEntity<Mentor> getMentorById(@PathVariable Long id) {
        Mentor mentor = mentorService.getMentorById(id);
        return sendOkResponse(mentor);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('" + ROLE_ADMIN + "', '" + ROLE_MENTOR + "')")
    public ResponseEntity<Mentor> createMentor(@Valid @RequestBody MentorDTO mentorDTO, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        Mentor mentor = modelMapper.map(mentorDTO, Mentor.class);

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            // MENTOR role - force identity from JWT claims
            mentor.setMentorId(userPrincipal.getId());
            mentor.setFirstName(userPrincipal.getFirstName());
            mentor.setLastName(userPrincipal.getLastName());
            mentor.setEmail(userPrincipal.getEmail());
        } else {
            // ADMIN role - use provided fields or fallback
            if (mentor.getMentorId() == null || mentor.getMentorId().isEmpty()) {
                mentor.setMentorId(java.util.UUID.randomUUID().toString());
            }
            if (mentor.getFirstName() == null)
                mentor.setFirstName(userPrincipal.getFirstName());
            if (mentor.getLastName() == null)
                mentor.setLastName(userPrincipal.getLastName());
            if (mentor.getEmail() == null)
                mentor.setEmail(userPrincipal.getEmail());
        }

        Mentor createdMentor = mentorService.createNewMentor(mentor);

        return sendCreatedResponse(createdMentor);
    }

    @PutMapping("{id}")
    @PreAuthorize("hasAnyRole('" + ROLE_ADMIN + "', '" + ROLE_MENTOR + "')")
    public ResponseEntity<Mentor> updateMentor(@PathVariable Long id, @Valid @RequestBody MentorDTO updatedMentorDTO) {
        Mentor mentor = modelMapper.map(updatedMentorDTO, Mentor.class);
        Mentor updatedMentor = mentorService.updateMentorById(id, mentor);
        return sendOkResponse(updatedMentor);

    }

    @DeleteMapping("{id}")
    @PreAuthorize("hasAnyRole('" + ROLE_ADMIN + "')")
    public ResponseEntity<Mentor> deleteMentor(@PathVariable Long id) {
        mentorService.deleteMentor(id);
        return sendNoContentResponse();
    }
}
