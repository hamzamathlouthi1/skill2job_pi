package tn.esprit.gestionuser.repositories;

import org.springframework.data.jpa.repository.Query;
import tn.esprit.gestionuser.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    // récupérer tous les users avec le rôle trainer
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'ROLE_TRAINER'")
    List<User> findAllTrainers();
}