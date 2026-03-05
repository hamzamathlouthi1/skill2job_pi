package tn.esprit.gestionuser.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Salle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Integer capacity;



    private String status;

    @ManyToOne
    @JoinColumn(name = "bloc_id")
    @JsonIgnoreProperties("salles")
    private Bloc bloc;
    //@OneToMany(mappedBy = "salle")
   // @JsonIgnore
   // private List<Sessions> sessions;



}
