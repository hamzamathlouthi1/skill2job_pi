package tn.esprit.gestionuser.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.gestionuser.entities.Salle;

public interface SalleRepository extends JpaRepository<Salle, Long> {
}
