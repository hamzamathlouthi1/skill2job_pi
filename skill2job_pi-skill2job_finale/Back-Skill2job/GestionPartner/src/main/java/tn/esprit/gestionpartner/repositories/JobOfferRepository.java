package tn.esprit.gestionpartner.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.gestionpartner.entities.JobOffer;
import tn.esprit.gestionpartner.entities.OfferStatus;

import java.time.LocalDate;
import java.util.List;

public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {

    @Query("select o from JobOffer o where o.partner.id = :partnerId")
    List<JobOffer> findByPartnerId(@Param("partnerId") Long partnerId);

    // ✅ gardée car JobOfferServiceImpl l’utilise déjà
    @Query("select o from JobOffer o where o.partner.id = :partnerId")
    List<JobOffer> findByPartner_Id(@Param("partnerId") Long partnerId);

    List<JobOffer> findByStatus(OfferStatus status);

    @Modifying
    @Query("""
        update JobOffer o
        set o.status = tn.esprit.gestionpartner.entities.OfferStatus.CLOSED
        where o.status = tn.esprit.gestionpartner.entities.OfferStatus.OPEN
          and o.deadline is not null
          and o.deadline < :today
    """)
    int closeExpiredOffers(@Param("today") LocalDate today);

    @Query("select count(o) from JobOffer o where o.partner.id = :partnerId")
    long countByPartnerId(@Param("partnerId") Long partnerId);

    @Query("select count(o) from JobOffer o where o.partner.id = :partnerId and o.status = :status")
    long countByPartnerIdAndStatus(
            @Param("partnerId") Long partnerId,
            @Param("status") OfferStatus status
    );

    @Query("""
        select count(o) from JobOffer o
        where o.partner.id = :partnerId
          and o.deadline between :start and :end
    """)
    long countByPartnerIdAndDeadlineBetween(
            @Param("partnerId") Long partnerId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );
}