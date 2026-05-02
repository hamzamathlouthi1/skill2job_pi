package tn.esprit.gestionexam.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "exam_violations")
@Getter
@Setter
@NoArgsConstructor
public class ExamViolation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long examAttemptId;
    private Long learnerId;

    @Enumerated(EnumType.STRING)
    private ViolationType type;

    private LocalDateTime timestamp;

    @PrePersist
    public void prePersist() {
        this.timestamp = LocalDateTime.now();
    }
}
