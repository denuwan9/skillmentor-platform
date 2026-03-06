package com.stemlink.skillmentor.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "mentor")
@Data
public class Mentor implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mentor_id", length = 100, nullable = false)
    private String mentorId;

    @Column(name = "first_name", length = 50, nullable = false)
    private String firstName;

    @Column(name = "last_name", length = 50, nullable = false)
    private String lastName;

    @Column(length = 100, unique = true, nullable = false)
    private String email;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "title")
    private String title;

    @Column(name = "profession")
    private String profession;

    @Column(name = "company")
    private String company;

    @Column(name = "experience_years")
    private int experienceYears;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    // Additional fields required for frontend mentor profile displays
    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "positive_reviews")
    private Integer positiveReviews = 0;

    @Column(name = "total_enrollments")
    private Integer totalEnrollments = 0;

    @Column(name = "is_certified")
    private Boolean isCertified;

    @Column(name = "average_rating")
    private Double averageRating = 0.0;

    @Column(name = "total_reviews")
    private Integer totalReviews = 0;

    @Column(name = "start_year", length = 10)
    private String startYear;

    @ElementCollection
    @CollectionTable(name = "mentor_experience_highlights", joinColumns = @JoinColumn(name = "mentor_id"))
    @Column(name = "highlight")
    private List<String> experienceHighlights;

    @ElementCollection
    @CollectionTable(name = "mentor_skills", joinColumns = @JoinColumn(name = "mentor_id"))
    @Column(name = "skill")
    private List<String> skills;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Date createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Date updatedAt;

    @OneToMany(mappedBy = "mentor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Subject> subjects = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "mentor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Session> sessions = new ArrayList<>();

}
