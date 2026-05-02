package tn.esprit.gestionexam.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Certificate {

    private static final String BRONZE = "BRONZE";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String certificateCode;
    private LocalDate issueDate;

    @OneToOne
    @JoinColumn(name = "evaluation_id")
    @JsonIgnoreProperties("certificate")
    private Evaluation evaluation;

    @JsonProperty("userId")
    public Long getUserId() {
        return evaluation != null ? evaluation.getUserId() : null;
    }

    @JsonProperty("examId")
    public Long getExamId() {
        return evaluation != null && evaluation.getExam() != null
                ? evaluation.getExam().getId() : null;
    }

    @JsonProperty("level")
    public String getLevel() {
        if (evaluation == null) return BRONZE;
        Double score = evaluation.getScore();
        if (score == null) return BRONZE;
        if (score >= 90) return "GOLD";
        if (score >= 70) return "SILVER";
        return BRONZE;
    }

    @JsonProperty("score")
    public Double getScore() {
        return evaluation != null ? evaluation.getScore() : null;
    }
}
