package tn.esprit.gestionexam.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EvaluationDTO {
    private Long id;
    private Long userId;
    private Double score;
    private Boolean passed;
    private Long examId;
    private List<Long> answerIds;
}
