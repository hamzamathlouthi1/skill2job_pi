package tn.esprit.gestionpartner.services;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.gestionpartner.clients.UserClient;
import tn.esprit.gestionpartner.dto.PartnerDashboardResponse;
import tn.esprit.gestionpartner.dto.UserDTO;
import tn.esprit.gestionpartner.entities.*;
import tn.esprit.gestionpartner.repositories.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PartnerDashboardService {

    private final JobOfferRepository jobOfferRepository;
    private final ApplicationRepository applicationRepository;
    private final UserClient userClient;
    private final PartnerRepository partnerRepository;

    public PartnerDashboardService(JobOfferRepository jobOfferRepository,
                                   ApplicationRepository applicationRepository,
                                   UserClient userClient,
                                   PartnerRepository partnerRepository) {
        this.jobOfferRepository = jobOfferRepository;
        this.applicationRepository = applicationRepository;
        this.userClient = userClient;
        this.partnerRepository = partnerRepository;
    }

    public PartnerDashboardResponse getDashboard() {

        UserDTO currentUser = getCurrentUser();

        Partner partner = partnerRepository.findByEmployerId(currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "You don't have a partner profile yet."
                ));

        Long partnerId = partner.getId();

        PartnerDashboardResponse res = new PartnerDashboardResponse();

        long totalOffers = jobOfferRepository.countByPartnerId(partnerId);
        long openOffers = jobOfferRepository.countByPartnerIdAndStatus(partnerId, OfferStatus.OPEN);
        long closedOffers = jobOfferRepository.countByPartnerIdAndStatus(partnerId, OfferStatus.CLOSED);

        res.setTotalOffers(totalOffers);
        res.setOpenOffers(openOffers);
        res.setClosedOffers(closedOffers);

        LocalDate now = LocalDate.now();
        long expSoon = jobOfferRepository.countByPartnerIdAndDeadlineBetween(
                partnerId,
                now,
                now.plusDays(7)
        );
        res.setOffersExpiringSoonCount(expSoon);

        long totalApps = applicationRepository.countByJobOfferPartnerId(partnerId);
        res.setTotalApplications(totalApps);

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (ApplicationStatus s : ApplicationStatus.values()) {
            byStatus.put(
                    s.name(),
                    applicationRepository.countByJobOfferPartnerIdAndStatus(partnerId, s)
            );
        }
        res.setApplicationsByStatus(byStatus);

        long interviews = applicationRepository.countByJobOfferPartnerIdAndStatus(
                partnerId,
                ApplicationStatus.INTERVIEW
        );
        res.setInterviewsScheduled(interviews);

        long upcoming = applicationRepository.countByJobOfferPartnerIdAndStatusAndInterviewAtAfter(
                partnerId,
                ApplicationStatus.INTERVIEW,
                LocalDateTime.now()
        );
        res.setUpcomingInterviewsCount(upcoming);

        long shortlisted = byStatus.getOrDefault(ApplicationStatus.SHORTLISTED.name(), 0L);
        long accepted = byStatus.getOrDefault(ApplicationStatus.ACCEPTED.name(), 0L);

        double shortlistedRate = totalApps == 0 ? 0 : (shortlisted * 100.0 / totalApps);
        double acceptanceRate = totalApps == 0 ? 0 : (accepted * 100.0 / totalApps);

        res.setShortlistedRate(Math.round(shortlistedRate * 10.0) / 10.0);
        res.setAcceptanceRate(Math.round(acceptanceRate * 10.0) / 10.0);

        Double avgScore = applicationRepository.avgScoreByPartnerId(partnerId);
        res.setAvgScore(avgScore == null ? 0 : (Math.round(avgScore * 10.0) / 10.0));

        List<Application> recent = applicationRepository
                .findTop10ByJobOfferPartnerIdOrderByAppliedAtDesc(partnerId);

        List<PartnerDashboardResponse.RecentApplicationItem> recentItems =
                recent.stream().map(a -> {
                    PartnerDashboardResponse.RecentApplicationItem it =
                            new PartnerDashboardResponse.RecentApplicationItem();

                    it.applicationId = a.getId();
                    it.status = a.getStatus() != null ? a.getStatus().name() : "";
                    it.appliedAt = a.getAppliedAt();

                    if (a.getJobOffer() != null) {
                        it.offerId = a.getJobOffer().getId();
                        it.offerTitle = a.getJobOffer().getTitle();
                    }

                    UserDTO student = safeGetUserById(a.getStudentId());
                    if (student != null) {
                        it.studentUsername = student.getUsername();
                        it.studentEmail = student.getEmail();
                    } else {
                        it.studentUsername = "Unknown";
                        it.studentEmail = "";
                    }

                    it.cvUrl = a.getCvUrl();
                    it.motivation = a.getMotivation();
                    it.score = a.getScore();

                    return it;
                }).toList();

        res.setRecentApplications(recentItems != null ? recentItems : List.of());

        List<Application> upcomingApps = applicationRepository
                .findTop10ByJobOfferPartnerIdAndStatusOrderByInterviewAtAsc(
                        partnerId,
                        ApplicationStatus.INTERVIEW
                );

        List<PartnerDashboardResponse.UpcomingInterviewItem> upItems =
                upcomingApps.stream()
                        .filter(a -> a.getInterviewAt() != null)
                        .map(a -> {
                            PartnerDashboardResponse.UpcomingInterviewItem it =
                                    new PartnerDashboardResponse.UpcomingInterviewItem();

                            it.applicationId = a.getId();
                            it.interviewAt = a.getInterviewAt();
                            it.meetLink = a.getInterviewMeetLink();
                            it.note = a.getInterviewNote();

                            if (a.getJobOffer() != null) {
                                it.offerId = a.getJobOffer().getId();
                                it.offerTitle = a.getJobOffer().getTitle();
                            }

                            UserDTO student = safeGetUserById(a.getStudentId());
                            if (student != null) {
                                it.studentUsername = student.getUsername();
                                it.studentEmail = student.getEmail();
                            } else {
                                it.studentUsername = "Unknown";
                                it.studentEmail = "";
                            }

                            return it;
                        }).toList();

        res.setUpcomingInterviews(upItems != null ? upItems : List.of());

        List<Application> top = applicationRepository
                .findTop5ByJobOfferPartnerIdOrderByScoreDescAppliedAtDesc(partnerId);

        List<PartnerDashboardResponse.TopCandidateItem> topCandidates =
                top.stream().map(a -> {
                    PartnerDashboardResponse.TopCandidateItem it =
                            new PartnerDashboardResponse.TopCandidateItem();

                    it.applicationId = a.getId();

                    if (a.getJobOffer() != null) {
                        it.offerId = a.getJobOffer().getId();
                        it.offerTitle = a.getJobOffer().getTitle();
                    }

                    UserDTO student = safeGetUserById(a.getStudentId());
                    if (student != null) {
                        it.studentUsername = student.getUsername();
                        it.studentEmail = student.getEmail();
                    } else {
                        it.studentUsername = "Unknown";
                        it.studentEmail = "";
                    }

                    it.score = a.getScore();
                    it.status = a.getStatus() != null ? a.getStatus().name() : "";
                    it.appliedAt = a.getAppliedAt();

                    return it;
                }).toList();

        res.setTopCandidates(topCandidates != null ? topCandidates : List.of());

        return res;
    }

    private UserDTO getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || auth.getName() == null || auth.getName().equals("anonymousUser")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated.");
        }

        try {
            UserDTO user = userClient.getUserByUsername(auth.getName());

            if (user == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found.");
            }

            return user;

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User service unavailable or token invalid."
            );
        }
    }

    private UserDTO safeGetUserById(Long userId) {
        if (userId == null) return null;

        try {
            return userClient.getUserById(userId);
        } catch (Exception e) {
            return null;
        }
    }
}