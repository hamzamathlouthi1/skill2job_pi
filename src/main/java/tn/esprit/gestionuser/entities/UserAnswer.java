package tn.esprit.gestionuser.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long questionId;
    private String selectedOption;

    @ManyToOne
    @JoinColumn(name = "evaluation_id")
    @JsonIgnoreProperties({"answers", "certificate", "exam"})  // ← break circular ref

    private Evaluation evaluation;
}