package tn.esprit.gestionpartner.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.gestionpartner.entities.*;

import java.time.LocalDateTime;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    boolean existsByStudentIdAndJobOfferId(Long studentId, Long offerId);

    List<Application> findByStudentIdOrderByAppliedAtDesc(Long studentId);

    List<Application> findByJobOfferIdOrderByAppliedAtDesc(Long offerId);

    @Query("select a from Application a where a.jobOffer.partner.id = :partnerId order by a.appliedAt desc")
    List<Application> findByPartnerId(@Param("partnerId") Long partnerId);

    @Query("select count(a) from Application a where a.jobOffer.partner.id = :partnerId")
    long countByJobOfferPartnerId(@Param("partnerId") Long partnerId);

    @Query("select count(a) from Application a where a.jobOffer.partner.id = :partnerId and a.status = :status")
    long countByJobOfferPartnerIdAndStatus(@Param("partnerId") Long partnerId,
                                           @Param("status") ApplicationStatus status);

    @Query("select a from Application a where a.jobOffer.partner.id = :partnerId order by a.appliedAt desc")
    List<Application> findTop10ByJobOfferPartnerIdOrderByAppliedAtDesc(@Param("partnerId") Long partnerId);

    @Query("""
        select a from Application a
        where a.jobOffer.partner.id = :partnerId
          and a.status = :status
        order by a.interviewAt asc
    """)
    List<Application> findTop10ByJobOfferPartnerIdAndStatusOrderByInterviewAtAsc(
            @Param("partnerId") Long partnerId,
            @Param("status") ApplicationStatus status
    );

    @Query("""
        select count(a) from Application a
        where a.jobOffer.partner.id = :partnerId
          and a.status = :status
          and a.interviewAt > :now
    """)
    long countByJobOfferPartnerIdAndStatusAndInterviewAtAfter(
            @Param("partnerId") Long partnerId,
            @Param("status") ApplicationStatus status,
            @Param("now") LocalDateTime now
    );

    @Query("select avg(a.score) from Application a where a.jobOffer.partner.id = :partnerId")
    Double avgScoreByPartnerId(@Param("partnerId") Long partnerId);

    @Query("""
        select a from Application a
        where a.jobOffer.partner.id = :partnerId
        order by a.score desc, a.appliedAt desc
    """)
    List<Application> findTop5ByJobOfferPartnerIdOrderByScoreDescAppliedAtDesc(@Param("partnerId") Long partnerId);
}