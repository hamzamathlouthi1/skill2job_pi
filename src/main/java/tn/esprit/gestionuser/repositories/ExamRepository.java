package tn.esprit.gestionuser.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.gestionuser.entities.Examen;

public interface ExamRepository extends JpaRepository<Examen, Long> {
}



