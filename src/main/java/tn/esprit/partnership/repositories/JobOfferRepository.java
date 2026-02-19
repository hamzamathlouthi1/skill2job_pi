package tn.esprit.partnership.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.partnership.entities.JobOffer;

import java.util.List;

public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {
    List<JobOffer> findByPartnerId(Long partnerId);
    List<JobOffer> findByStatus(String status); // optional if you want string-based
    List<JobOffer> findByPartner_Id(Long partnerId);
}
