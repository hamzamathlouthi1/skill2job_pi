package tn.esprit.gestionexam.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class QuestionDTO {
    private Long id;
    private String content;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private Long examId;
}
