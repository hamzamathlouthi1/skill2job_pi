package tn.esprit.gestionpartner.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.gestionpartner.entities.Partner;

import java.util.Optional;

public interface PartnerRepository extends JpaRepository<Partner, Long> {

    Optional<Partner> findByEmployer_Id(Long employerId);
    boolean existsByEmployer_Id(Long employerId);
}