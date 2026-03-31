package tn.esprit.gestionexam.repositories;

import tn.esprit.gestionexam.entities.ERole;
import tn.esprit.gestionexam.entities.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(ERole name);
}