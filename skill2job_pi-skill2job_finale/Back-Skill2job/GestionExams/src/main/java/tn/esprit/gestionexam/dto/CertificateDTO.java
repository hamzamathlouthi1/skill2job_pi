package tn.esprit.gestionexam.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CertificateDTO {
    private Long id;
    private String certificateCode;
    private LocalDate issueDate;
    private Long evaluationId;
    private Long userId;
    private Long examId;
    private Double score;
    private String level;
}
