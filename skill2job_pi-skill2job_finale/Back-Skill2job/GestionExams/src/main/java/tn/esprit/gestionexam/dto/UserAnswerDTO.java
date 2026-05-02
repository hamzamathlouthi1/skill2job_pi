package tn.esprit.gestionexam.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UserAnswerDTO {
    private Long id;
    private Long questionId;
    private String selectedOption;
    private Long evaluationId;
}
