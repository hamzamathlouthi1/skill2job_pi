package tn.esprit.gestionpartner.services;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.gestionpartner.dto.ApplicationResponse;
import tn.esprit.gestionpartner.dto.ScheduleInterviewRequest;
import tn.esprit.gestionpartner.dto.UpdateApplicationStatusRequest;
import tn.esprit.gestionpartner.entities.*;
import tn.esprit.gestionpartner.repositories.ApplicationRepository;
import tn.esprit.gestionpartner.repositories.JobOfferRepository;
import tn.esprit.gestionpartner.repositories.UserRepository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobOfferRepository jobOfferRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.base-url:http://localhost:8089}")
    private String baseUrl;

    @Value("${app.auto-shortlist.enabled:true}")
    private boolean autoShortlistEnabled;

    @Value("${app.auto-shortlist.threshold:75}")
    private int autoShortlistThreshold;

    public ApplicationService(ApplicationRepository applicationRepository,
                              JobOfferRepository jobOfferRepository,
                              UserRepository userRepository,
                              NotificationService notificationService,
                              EmailService emailService) {
        this.applicationRepository = applicationRepository;
        this.jobOfferRepository = jobOfferRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    // =====================================
    // APPLY WITH FILES (PDF CV + PDF motivation)
    // =====================================
    @Transactional
    public String applyWithFiles(Long jobOfferId, MultipartFile cv, MultipartFile motivationPdf) {

        User student = getCurrentUser();

        if (jobOfferId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "jobOfferId is required.");
        }
        if (cv == null || cv.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CV PDF is required.");
        }
        if (motivationPdf == null || motivationPdf.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Motivation PDF is required.");
        }

        if (!isPdf(cv)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CV must be a PDF.");
        }
        if (!isPdf(motivationPdf)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Motivation must be a PDF.");
        }

        JobOffer offer = jobOfferRepository.findByIdWithPartner(jobOfferId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offer not found"));

        if (offer.getStatus() == OfferStatus.CLOSED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This offer is closed.");
        }

        if (offer.getDeadline() != null && offer.getDeadline().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deadline expired.");
        }

        if (applicationRepository.existsByStudentIdAndJobOfferId(student.getId(), offer.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already applied to this offer.");
        }

        if (offer.getPartner() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Offer has no partner.");
        }

        Partner partner = offer.getPartner();

        if (partner.getEmployer() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Partner has no employer.");
        }

        User partnerEmployer = partner.getEmployer();

        // 1) Extract text from PDFs BEFORE saving URLs
        String cvText = extractPdfText(cv);
        String motivationText = extractPdfText(motivationPdf);

        // 2) save files
        String cvUrl = saveFile(cv, "cv", student.getId(), offer.getId());
        String motivationUrl = saveFile(motivationPdf, "motivation", student.getId(), offer.getId());

        Application app = new Application();
        app.setStudent(student);
        app.setJobOffer(offer);
        app.setCvUrl(cvUrl);
        app.setMotivation(motivationUrl);

        int score = calculateAdvancedScore(student, offer, cvText, motivationText);
        app.setScore(score);

        ApplicationStatus initialStatus = ApplicationStatus.SENT;
        boolean autoFlag = false;

        if (autoShortlistEnabled && score >= autoShortlistThreshold) {
            initialStatus = ApplicationStatus.SHORTLISTED;
            autoFlag = true;
        }

        app.setStatus(initialStatus);
        app.setAutoShortlisted(autoFlag);

        applicationRepository.save(app);

        // =========================
        // EMAIL
        // IMPORTANT:
        // EmailService is now safe only if it extracts fields before async.
        // We keep this call, assuming you replaced EmailService with the fixed version.
        // =========================
        emailService.sendNewApplicationEmail(app);

        // =========================
        // NOTIFICATION PARTNER
        // =========================
        String msgPartner = "New application received for the offer: " + offer.getTitle()
                + " (score " + score + "/100)"
                + (initialStatus == ApplicationStatus.SHORTLISTED ? " ✅ Auto-Shortlisted" : "");

        notificationService.push(
                partnerEmployer,
                NotificationType.APPLICATION_RECEIVED,
                msgPartner,
                "/partner/offers/" + offer.getId() + "/applications"
        );

        // =========================
        // NOTIFICATION LEARNER
        // =========================
        String msgLearner = "Your application has been sent for: " + offer.getTitle()
                + (initialStatus == ApplicationStatus.SHORTLISTED ? " ✅ Shortlisted" : "");

        notificationService.push(
                student,
                NotificationType.STATUS_UPDATED,
                msgLearner,
                "/user/applications"
        );

        return "✅ Application submitted successfully.";
    }

    // =====================================
    // MY APPLICATIONS
    // =====================================
    public List<ApplicationResponse> myApplications() {
        User student = getCurrentUser();

        return applicationRepository
                .findByStudentIdOrderByAppliedAtDesc(student.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================
    // PARTNER - VIEW APPLICATIONS FOR OFFER
    // =====================================
    public List<ApplicationResponse> applicationsForOffer(Long offerId) {

        JobOffer offer = jobOfferRepository.findById(offerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offer not found"));

        return applicationRepository
                .findByJobOfferIdOrderByAppliedAtDesc(offer.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================
    // UPDATE STATUS
    // =====================================
    @Transactional
    public String updateStatus(Long applicationId, UpdateApplicationStatusRequest request) {

        if (applicationId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "applicationId is required.");
        }
        if (request == null || request.getStatus() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status is required.");
        }

        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        app.setStatus(request.getStatus());

        if (request.getStatus() == ApplicationStatus.SHORTLISTED) {
            app.setAutoShortlisted(false);
        }

        applicationRepository.save(app);

        emailService.sendStatusChangedEmail(app);

        notificationService.push(
                app.getStudent(),
                NotificationType.STATUS_UPDATED,
                "Application status updated: " + request.getStatus() + " (Offre: " + app.getJobOffer().getTitle() + ")",
                "/user/applications"
        );

        if (app.getJobOffer() != null
                && app.getJobOffer().getPartner() != null
                && app.getJobOffer().getPartner().getEmployer() != null) {

            notificationService.push(
                    app.getJobOffer().getPartner().getEmployer(),
                    NotificationType.STATUS_UPDATED,
                    "You have updated the status of " + app.getStudent().getUsername() + " -> " + request.getStatus(),
                    "/partner/offers/" + app.getJobOffer().getId() + "/applications"
            );
        }

        return "Status updated: " + request.getStatus();
    }

    // =====================================
    // SCHEDULE INTERVIEW
    // =====================================
    @Transactional
    public String scheduleInterview(Long applicationId, ScheduleInterviewRequest request) {

        if (applicationId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "applicationId is required.");
        }
        if (request == null || request.getInterviewAt() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "interviewAt is required.");
        }
        if (request.getMeetLink() == null || request.getMeetLink().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "meetLink is required.");
        }

        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        app.setInterviewAt(request.getInterviewAt());
        app.setInterviewMeetLink(request.getMeetLink().trim());
        app.setInterviewNote(request.getNote() != null ? request.getNote().trim() : null);
        app.setStatus(ApplicationStatus.INTERVIEW);

        applicationRepository.save(app);

        emailService.sendInterviewScheduledEmail(app);

        notificationService.push(
                app.getStudent(),
                NotificationType.INTERVIEW_SCHEDULED,
                "Interview scheduled for the offer: " + app.getJobOffer().getTitle(),
                "/user/applications"
        );

        if (app.getJobOffer() != null
                && app.getJobOffer().getPartner() != null
                && app.getJobOffer().getPartner().getEmployer() != null) {

            notificationService.push(
                    app.getJobOffer().getPartner().getEmployer(),
                    NotificationType.INTERVIEW_SCHEDULED,
                    "Scheduled interview with: " + app.getStudent().getUsername(),
                    "/partner/offers/" + app.getJobOffer().getId() + "/applications"
            );
        }

        return "✅ Interview scheduled successfully.";
    }

    // =====================================
    // HAS APPLIED
    // =====================================
    public Map<String, Boolean> hasApplied(Long offerId) {
        User student = getCurrentUser();
        boolean applied = applicationRepository.existsByStudentIdAndJobOfferId(student.getId(), offerId);
        return Map.of("applied", applied);
    }

    // =====================================
    // MAPPER
    // =====================================
    private ApplicationResponse toResponse(Application a) {

        Partner partner = a.getJobOffer().getPartner();

        String partnerName = (partner.getCompanyName() != null && !partner.getCompanyName().isBlank())
                ? partner.getCompanyName()
                : "Company";

        return new ApplicationResponse(
                a.getId(),
                a.getStatus(),
                a.getAppliedAt(),

                a.getJobOffer().getId(),
                a.getJobOffer().getTitle(),
                a.getJobOffer().getLocation(),

                partner.getId(),
                partnerName,

                a.getStudent().getUsername(),
                a.getStudent().getEmail(),

                a.getCvUrl(),
                a.getMotivation(),
                a.getScore(),
                a.isAutoShortlisted(),

                a.getInterviewAt(),
                a.getInterviewMeetLink(),
                a.getInterviewNote()
        );
    }

    // =====================================
    // SECURITY HELPER
    // =====================================
    private User getCurrentUser() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated.");
        }

        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
    }

    // =====================================
    // FILE UTILS
    // =====================================
    private boolean isPdf(MultipartFile file) {
        String contentType = file.getContentType();
        String name = file.getOriginalFilename();

        boolean byType = contentType != null && contentType.equalsIgnoreCase("application/pdf");
        boolean byName = name != null && name.toLowerCase().endsWith(".pdf");

        return byType || byName;
    }

    private String saveFile(MultipartFile file, String prefix, Long studentId, Long offerId) {
        try {
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String safeName = prefix + "_s" + studentId + "_o" + offerId + "_" + UUID.randomUUID() + ".pdf";
            File dest = new File(dir, safeName);

            Files.write(dest.toPath(), file.getBytes());

            return baseUrl + "/uploads/" + safeName;

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "File upload failed.");
        }
    }

    // =====================================
    // PDF TEXT EXTRACTION (PDFBox)
    // =====================================
    private String extractPdfText(MultipartFile pdf) {
        try (PDDocument doc = PDDocument.load(pdf.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(doc);
            if (text == null) return "";
            return text.replaceAll("\\s+", " ").trim();
        } catch (Exception e) {
            return "";
        }
    }

    // =====================================
    // ADVANCED SCORE (0–100)
    // =====================================
    private int calculateAdvancedScore(User student, JobOffer offer, String cvText, String motivationText) {

        int score = 0;

        String cv = normalize(cvText);
        String mot = normalize(motivationText);

        boolean hasCv = cv != null && !cv.isBlank();
        boolean hasMot = mot != null && !mot.isBlank();

        if (hasCv) score += 5;
        if (hasMot) score += 5;

        if (cv.length() < 120 && mot.length() < 120) {
            return clamp(score);
        }

        score += computeTextQualityScore(cv, mot);
        score += computeRequirementsMatchScore(offer.getRequirements(), cv, mot);

        if (offer.getDeadline() != null) score += 5;
        if (offer.getMode() != null && offer.getMode().name().equalsIgnoreCase("REMOTE")) score += 5;

        return clamp(score);
    }

    private int computeTextQualityScore(String cv, String mot) {
        int s = 0;

        if (cv.length() >= 200) s += 4;
        if (cv.length() >= 600) s += 3;
        if (cv.length() >= 1200) s += 3;

        if (mot.length() >= 200) s += 5;
        if (mot.length() >= 700) s += 5;
        if (mot.length() >= 1200) s += 5;

        return Math.min(s, 25);
    }

    private int computeRequirementsMatchScore(String requirements, String cvText, String motivationText) {

        if (requirements == null || requirements.isBlank()) return 0;

        String req = normalize(requirements);
        String cv = normalize(cvText);
        String mot = normalize(motivationText);

        List<String> keywords = extractKeywords(req);

        if (keywords.isEmpty()) return 0;
        if (cv.length() < 80 && mot.length() < 120) return 0;

        int hitCv = 0;
        int hitMot = 0;

        for (String k : keywords) {
            if (k.isBlank()) continue;
            if (cv.contains(k)) hitCv++;
            if (mot.contains(k)) hitMot++;
        }

        double ratioCv = (double) hitCv / (double) keywords.size();
        double ratioMot = (double) hitMot / (double) keywords.size();
        double combined = (ratioCv * 0.4) + (ratioMot * 0.6);

        if (hitCv + hitMot == 0) return 0;

        return (int) Math.round(combined * 55.0);
    }

    private List<String> extractKeywords(String requirements) {

        String cleaned = requirements
                .toLowerCase()
                .replaceAll("[^a-z0-9+.#\\s,/\\-]", " ");

        String[] parts = cleaned.split("[,\\/\\-\\n\\r]+");

        return java.util.Arrays.stream(parts)
                .map(String::trim)
                .filter(s -> s.length() >= 3)
                .map(this::normalize)
                .distinct()
                .limit(30)
                .toList();
    }

    private String normalize(String s) {
        if (s == null) return "";
        return s.toLowerCase()
                .replaceAll("\\s+", " ")
                .trim();
    }

    private int clamp(int score) {
        if (score > 100) return 100;
        if (score < 0) return 0;
        return score;
    }
}