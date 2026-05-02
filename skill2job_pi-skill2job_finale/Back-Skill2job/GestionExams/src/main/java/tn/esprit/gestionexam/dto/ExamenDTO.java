package tn.esprit.gestionexam.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ExamenDTO {
    private Long id;
    private String title;
    private String description;
    private Double passScore;
    private List<Long> questionIds;
    private List<Long> evaluationIds;
}
