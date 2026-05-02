package tn.esprit.gestionexam.dto;

import lombok.*;
import tn.esprit.gestionexam.entities.ViolationType;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ExamViolationDTO {
    private Long id;
    private Long examAttemptId;
    private Long learnerId;
    private ViolationType type;
    private LocalDateTime timestamp;
}
