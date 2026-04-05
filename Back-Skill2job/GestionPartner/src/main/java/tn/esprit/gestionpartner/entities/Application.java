package tn.esprit.gestionpartner.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "applications",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_student_offer", columnNames = {"student_id", "job_offer_id"})
        }
)
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Student = User
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_offer_id", nullable = false)
    private JobOffer jobOffer;

    @Column(nullable = false, length = 2000)
    private String motivation;

    @Column(length = 500)
    private String cvUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status = ApplicationStatus.SENT;

    // ✅ INTERVIEW (NEW)
    private LocalDateTime interviewAt;

    @Column(length = 700)
    private String interviewMeetLink;

    @Column(length = 1200)
    private String interviewNote;

    @Column(nullable = false, updatable = false)
    private LocalDateTime appliedAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        appliedAt = LocalDateTime.now();
        updatedAt = appliedAt;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    // ✅ SCORE (NEW)
    @Column(nullable = false)
    private Integer score = 0;
    // ✅ AUTO SHORTLIST FLAG
    @Column(nullable = false)
    private boolean autoShortlisted = false;

    public boolean isAutoShortlisted() { return autoShortlisted; }
    public void setAutoShortlisted(boolean autoShortlisted) { this.autoShortlisted = autoShortlisted; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    // ===== Getters/Setters =====
    public Long getId() { return id; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public JobOffer getJobOffer() { return jobOffer; }
    public void setJobOffer(JobOffer jobOffer) { this.jobOffer = jobOffer; }

    public String getMotivation() { return motivation; }
    public void setMotivation(String motivation) { this.motivation = motivation; }

    public String getCvUrl() { return cvUrl; }
    public void setCvUrl(String cvUrl) { this.cvUrl = cvUrl; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public LocalDateTime getInterviewAt() { return interviewAt; }
    public void setInterviewAt(LocalDateTime interviewAt) { this.interviewAt = interviewAt; }

    public String getInterviewMeetLink() { return interviewMeetLink; }
    public void setInterviewMeetLink(String interviewMeetLink) { this.interviewMeetLink = interviewMeetLink; }

    public String getInterviewNote() { return interviewNote; }
    public void setInterviewNote(String interviewNote) { this.interviewNote = interviewNote; }

    public LocalDateTime getAppliedAt() { return appliedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}