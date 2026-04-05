package tn.esprit.gestionpartner.repositories;

import tn.esprit.gestionpartner.entities.ERole;
import tn.esprit.gestionpartner.entities.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(ERole name);
}