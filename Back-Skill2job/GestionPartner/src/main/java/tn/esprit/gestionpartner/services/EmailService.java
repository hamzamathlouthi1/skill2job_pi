package tn.esprit.gestionpartner.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.task.TaskExecutor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import tn.esprit.gestionpartner.entities.Application;
import tn.esprit.gestionpartner.entities.Partner;

import java.time.format.DateTimeFormatter;

/**
 * EmailService — Transactional emails for GestionPartner
 *
 * FIX IMPORTANT:
 * - On n'utilise plus @Async directement sur des méthodes qui reçoivent
 *   des entités Hibernate (Application / Partner).
 * - On extrait d'abord toutes les données simples (String, int, boolean)
 *   dans le thread principal, puis on lance l'envoi async avec TaskExecutor.
 * - Cela évite les erreurs LazyInitialization / Session closed / Hibernate proxy.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("EEEE, MMMM d yyyy 'at' HH:mm");

    private final JavaMailSender mailSender;
    private final TaskExecutor taskExecutor;

    @Value("${spring.mail.from:noreply@skill2job.com}")
    private String fromAddress;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    @Value("${app.email.enabled:true}")
    private boolean emailEnabled;

    public EmailService(JavaMailSender mailSender,
                        @Qualifier("applicationTaskExecutor") TaskExecutor taskExecutor) {
        this.mailSender = mailSender;
        this.taskExecutor = taskExecutor;
    }

    // ═══════════════════════════════════════════════════════════
    //  1. NEW APPLICATION → Partner employer
    // ═══════════════════════════════════════════════════════════
    public void sendNewApplicationEmail(Application app) {
        try {
            // Extraire TOUT avant async
            String to = app.getJobOffer().getPartner().getEmployer().getEmail();
            String offer = app.getJobOffer().getTitle();
            String student = app.getStudent().getUsername();
            String studentEmail = app.getStudent().getEmail();
            int score = app.getScore();
            boolean auto = app.isAutoShortlisted();
            Long offerId = app.getJobOffer().getId();

            String link = frontendUrl + "/partner/offers/" + offerId + "/applications";
            String subject = "New Application — " + offer + " (" + score + "/100)";
            String body = buildApplicationReceivedHtml(offer, student, studentEmail, score, auto, link);

            runAsyncSend(to, subject, body);
        } catch (Exception e) {
            log.error("[EMAIL-PREP-ERROR] sendNewApplicationEmail | {}", e.getMessage(), e);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  2. STATUS CHANGED → Student
    // ═══════════════════════════════════════════════════════════
    public void sendStatusChangedEmail(Application app) {
        try {
            String to = app.getStudent().getEmail();
            String offer = app.getJobOffer().getTitle();
            String company = app.getJobOffer().getPartner().getCompanyName();
            String status = app.getStatus().name();
            String link = frontendUrl + "/user/applications";

            String subject = "Your application for \"" + offer + "\" has been updated";
            String body = buildStatusChangedHtml(offer, company, status, link);

            runAsyncSend(to, subject, body);
        } catch (Exception e) {
            log.error("[EMAIL-PREP-ERROR] sendStatusChangedEmail | {}", e.getMessage(), e);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  3. INTERVIEW SCHEDULED → Student
    // ═══════════════════════════════════════════════════════════
    public void sendInterviewScheduledEmail(Application app) {
        try {
            String to = app.getStudent().getEmail();
            String offer = app.getJobOffer().getTitle();
            String company = app.getJobOffer().getPartner().getCompanyName();
            String dateTime = app.getInterviewAt() != null ? app.getInterviewAt().format(FMT) : "TBD";
            String meetLink = app.getInterviewMeetLink();
            String note = app.getInterviewNote();
            String link = frontendUrl + "/user/applications";

            String subject = "Interview scheduled for \"" + offer + "\" — " + dateTime;
            String body = buildInterviewScheduledHtml(offer, company, dateTime, meetLink, note, link);

            runAsyncSend(to, subject, body);
        } catch (Exception e) {
            log.error("[EMAIL-PREP-ERROR] sendInterviewScheduledEmail | {}", e.getMessage(), e);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  4. PARTNER APPROVED → Employer
    // ═══════════════════════════════════════════════════════════
    public void sendPartnerApprovedEmail(Partner partner) {
        try {
            String to = partner.getEmployer().getEmail();
            String company = partner.getCompanyName();
            String link = frontendUrl + "/partner";

            String subject = "Congratulations! Your partner account has been approved 🎉";
            String body = buildPartnerApprovedHtml(company, link);

            runAsyncSend(to, subject, body);
        } catch (Exception e) {
            log.error("[EMAIL-PREP-ERROR] sendPartnerApprovedEmail | {}", e.getMessage(), e);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  5. PARTNER REJECTED / SUSPENDED → Employer
    // ═══════════════════════════════════════════════════════════
    public void sendPartnerRejectedEmail(Partner partner) {
        try {
            String to = partner.getEmployer().getEmail();
            String company = partner.getCompanyName();

            String subject = "Your partner application for " + company + " was not approved";
            String body = buildPartnerRejectedHtml(company);

            runAsyncSend(to, subject, body);
        } catch (Exception e) {
            log.error("[EMAIL-PREP-ERROR] sendPartnerRejectedEmail | {}", e.getMessage(), e);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  ASYNC EXECUTION
    // ═══════════════════════════════════════════════════════════
    private void runAsyncSend(String to, String subject, String htmlBody) {
        taskExecutor.execute(() -> send(to, subject, htmlBody));
    }

    // ═══════════════════════════════════════════════════════════
    //  SEND HELPER
    // ═══════════════════════════════════════════════════════════
    private void send(String to, String subject, String htmlBody) {
        if (!emailEnabled) {
            log.info("[EMAIL-DISABLED] TO={} | SUBJECT={}", to, subject);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress, "Skill2Job");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("[EMAIL-SENT] TO={} | SUBJECT={}", to, subject);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("[EMAIL-ERROR] TO={} | {}", to, e.getMessage(), e);
        } catch (Exception e) {
            log.error("[EMAIL-ERROR] TO={} | Unexpected: {}", to, e.getMessage(), e);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  HTML TEMPLATES
    // ═══════════════════════════════════════════════════════════

    private String buildApplicationReceivedHtml(
            String offer, String student, String email,
            int score, boolean autoShortlisted, String link) {

        String badge = autoShortlisted
                ? "<span style='background:#d1fae5;color:#065f46;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;'>✅ Auto-Shortlisted</span>"
                : "";

        String scoreColor = score >= 75 ? "#065f46" : score >= 50 ? "#92400e" : "#991b1b";
        String scoreBg = score >= 75 ? "#d1fae5" : score >= 50 ? "#fef3c7" : "#fee2e2";

        return wrap(
                "<h2 style='color:#1e3a5f;margin-bottom:4px;'>New Application Received</h2>" +
                        "<p style='color:#64748b;margin-top:0;'>A candidate has applied to one of your job offers.</p>" +
                        "<div style='background:#f8fafc;border-radius:10px;padding:16px 20px;margin:20px 0;border-left:4px solid #4f46e5;'>" +
                        "<p style='margin:0 0 8px;'><strong>Offer:</strong> " + offer + "</p>" +
                        "<p style='margin:0 0 8px;'><strong>Candidate:</strong> " + student + " (" + email + ")</p>" +
                        "<p style='margin:0;'><strong>Score:</strong> " +
                        "<span style='background:" + scoreBg + ";color:" + scoreColor + ";padding:2px 10px;border-radius:20px;font-size:13px;font-weight:700;'>" +
                        score + "/100</span> &nbsp;" + badge +
                        "</p>" +
                        "</div>" +
                        "<a href='" + link + "' style='display:inline-block;background:#4f46e5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:8px;'>View Application</a>"
        );
    }

    private String buildStatusChangedHtml(String offer, String company, String status, String link) {
        String statusLabel = switch (status) {
            case "SHORTLISTED" -> "<span style='background:#dbeafe;color:#1d4ed8;padding:4px 14px;border-radius:20px;font-size:14px;font-weight:700;'>📋 Shortlisted</span>";
            case "INTERVIEW" -> "<span style='background:#d1fae5;color:#065f46;padding:4px 14px;border-radius:20px;font-size:14px;font-weight:700;'>🎯 Interview Scheduled</span>";
            case "ACCEPTED" -> "<span style='background:#dcfce7;color:#14532d;padding:4px 14px;border-radius:20px;font-size:14px;font-weight:700;'>✅ Accepted</span>";
            case "REJECTED" -> "<span style='background:#fee2e2;color:#991b1b;padding:4px 14px;border-radius:20px;font-size:14px;font-weight:700;'>❌ Not selected</span>";
            default -> "<span style='background:#f1f5f9;color:#475569;padding:4px 14px;border-radius:20px;font-size:14px;font-weight:700;'>" + status + "</span>";
        };

        String msg = switch (status) {
            case "SHORTLISTED" -> "Great news! Your profile caught the recruiter's attention.";
            case "INTERVIEW" -> "Congratulations! You have been invited for an interview.";
            case "ACCEPTED" -> "🎉 Incredible! You have been selected for this position!";
            case "REJECTED" -> "Thank you for your interest. Unfortunately, your application was not selected this time. Keep going!";
            default -> "Your application status has been updated.";
        };

        return wrap(
                "<h2 style='color:#1e3a5f;margin-bottom:4px;'>Application Update</h2>" +
                        "<p style='color:#64748b;margin-top:0;'>Your application for <strong>" + offer + "</strong> at <strong>" + company + "</strong> has been updated.</p>" +
                        "<div style='text-align:center;padding:24px 0;'>" + statusLabel + "</div>" +
                        "<p style='color:#374151;text-align:center;font-size:15px;'>" + msg + "</p>" +
                        "<div style='text-align:center;margin-top:16px;'>" +
                        "<a href='" + link + "' style='display:inline-block;background:#4f46e5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;'>View My Applications</a>" +
                        "</div>"
        );
    }

    private String buildInterviewScheduledHtml(
            String offer, String company, String dateTime,
            String meetLink, String note, String link) {

        String meetBtn = (meetLink != null && !meetLink.isBlank())
                ? "<a href='" + meetLink + "' style='display:inline-block;background:#0f9d58;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-right:12px;'>🎥 Join Google Meet</a>"
                : "";

        String noteBlock = (note != null && !note.isBlank())
                ? "<div style='background:#fffbeb;border-left:4px solid #f59e0b;border-radius:8px;padding:12px 16px;margin-top:16px;'>" +
                "<strong>Note from recruiter:</strong><br/>" + note + "</div>"
                : "";

        return wrap(
                "<h2 style='color:#1e3a5f;margin-bottom:4px;'>🎯 Interview Scheduled!</h2>" +
                        "<p style='color:#64748b;margin-top:0;'>You have been invited to an interview for <strong>" + offer + "</strong> at <strong>" + company + "</strong>.</p>" +
                        "<div style='background:#f0fdf4;border-radius:10px;padding:16px 20px;margin:20px 0;border-left:4px solid #10b981;'>" +
                        "<p style='margin:0 0 8px;font-size:15px;'><strong>📅 Date & Time:</strong> " + dateTime + "</p>" +
                        (meetLink != null ? "<p style='margin:0;font-size:13px;color:#059669;'>🔗 " + meetLink + "</p>" : "") +
                        "</div>" +
                        noteBlock +
                        "<div style='margin-top:20px;'>" + meetBtn +
                        "<a href='" + link + "' style='display:inline-block;background:#e2e8f0;color:#374151;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;'>View Application</a>" +
                        "</div>"
        );
    }

    private String buildPartnerApprovedHtml(String company, String link) {
        return wrap(
                "<h2 style='color:#1e3a5f;margin-bottom:4px;'>🎉 Welcome to Skill2Job, " + company + "!</h2>" +
                        "<p style='color:#64748b;margin-top:0;'>Your partner account has been reviewed and <strong>approved</strong> by our admin team.</p>" +
                        "<div style='background:#f0fdf4;border-radius:10px;padding:20px;margin:20px 0;text-align:center;'>" +
                        "<div style='font-size:48px;'>✅</div>" +
                        "<p style='font-size:16px;color:#065f46;font-weight:600;margin:8px 0 0;'>Account Approved</p>" +
                        "</div>" +
                        "<p>You can now log in and start posting job offers to find the best candidates.</p>" +
                        "<div style='text-align:center;margin-top:20px;'>" +
                        "<a href='" + link + "' style='display:inline-block;background:#4f46e5;color:#fff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;'>Go to Partner Dashboard</a>" +
                        "</div>"
        );
    }

    private String buildPartnerRejectedHtml(String company) {
        return wrap(
                "<h2 style='color:#1e3a5f;margin-bottom:4px;'>Partner Application Update</h2>" +
                        "<p style='color:#64748b;margin-top:0;'>Thank you for registering <strong>" + company + "</strong> on Skill2Job.</p>" +
                        "<div style='background:#fff5f5;border-radius:10px;padding:20px;margin:20px 0;text-align:center;border-left:4px solid #f56565;'>" +
                        "<p style='color:#c53030;font-size:15px;font-weight:600;margin:0;'>Your application was not approved at this time.</p>" +
                        "</div>" +
                        "<p>If you believe this is an error or would like more information, please contact our support team.</p>"
        );
    }

    private String wrap(String content) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'/></head><body style='margin:0;padding:0;background:#f1f5f9;font-family:Inter,Helvetica,Arial,sans-serif;'>" +
                "<table width='100%' cellpadding='0' cellspacing='0' style='padding:40px 20px;'><tr><td>" +
                "<div style='max-width:580px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);'>" +

                "<div style='background:#4f46e5;padding:24px 32px;'>" +
                "<span style='color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;'>SKILL2JOB</span>" +
                "</div>" +

                "<div style='padding:32px;'>" + content + "</div>" +

                "<div style='background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center;'>" +
                "<p style='font-size:12px;color:#94a3b8;margin:0;'>This email was sent automatically. Please do not reply.</p>" +
                "<p style='font-size:12px;color:#94a3b8;margin:4px 0 0;'>© 2025 Skill2Job — All rights reserved.</p>" +
                "</div>" +

                "</div></td></tr></table></body></html>";
    }
}