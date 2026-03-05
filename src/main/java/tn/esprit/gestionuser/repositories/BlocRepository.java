package tn.esprit.gestionuser.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.gestionuser.entities.Bloc;

public interface BlocRepository extends JpaRepository<Bloc, Long> {
}
