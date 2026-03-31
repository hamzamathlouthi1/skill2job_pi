package tn.esprit.gestionsession.repositories;

import tn.esprit.gestionsession.entities.ERole;
import tn.esprit.gestionsession.entities.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(ERole name);
}