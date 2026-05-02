package tn.esprit.gestionexam.services;

import org.springframework.stereotype.Service;
import tn.esprit.gestionexam.entities.Certificate;
import tn.esprit.gestionexam.entities.Evaluation;
import tn.esprit.gestionexam.repositories.CertificateRepository;
import tn.esprit.gestionexam.repositories.EvaluationRepository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final EvaluationRepository evaluationRepository;

    public CertificateService(CertificateRepository certificateRepository,
                               EvaluationRepository evaluationRepository) {
        this.certificateRepository = certificateRepository;
        this.evaluationRepository = evaluationRepository;
    }

    public Certificate createCertificate(Long evaluationId) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new IllegalArgumentException("Evaluation not found with id: " + evaluationId));

        if (!evaluation.getPassed()) {
            throw new IllegalStateException("Cannot generate certificate: User did not pass the exam (Score: "
                    + evaluation.getScore() + ", Required: " + evaluation.getExam().getPassScore() + ")");
        }

        Certificate existingCert = certificateRepository.findByEvaluation(evaluation);
        if (existingCert != null) {
            throw new IllegalStateException("Certificate already exists for this evaluation with code: "
                    + existingCert.getCertificateCode());
        }

        Certificate certificate = new Certificate();
        certificate.setEvaluation(evaluation);
        certificate.setIssueDate(LocalDate.now());
        certificate.setCertificateCode(generateCertificateCode(evaluation));
        return certificateRepository.save(certificate);
    }

    public List<Certificate> getAllCertificates() {
        return certificateRepository.findAll();
    }

    public Certificate getCertificateById(Long id) {
        return certificateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Certificate not found with id: " + id));
    }

    public Certificate getCertificateByEvaluationId(Long evaluationId) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new IllegalArgumentException("Evaluation not found with id: " + evaluationId));
        Certificate certificate = certificateRepository.findByEvaluation(evaluation);
        if (certificate == null) {
            throw new IllegalArgumentException("No certificate found for evaluation id: " + evaluationId);
        }
        return certificate;
    }

    public List<Certificate> getCertificatesByUserId(Long userId) {
        return certificateRepository.findByEvaluationUserId(userId);
    }

    public Certificate getCertificateByUserAndExam(Long userId, Long examId) {
        List<Certificate> userCertificates = certificateRepository.findByEvaluationUserId(userId);
        return userCertificates.stream()
                .filter(cert -> cert.getEvaluation().getExam().getId().equals(examId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "No certificate found for user " + userId + " and exam " + examId));
    }

    public Certificate updateCertificate(Long id, Certificate certificateDetails) {
        Certificate existingCertificate = getCertificateById(id);
        if (certificateDetails.getIssueDate() != null) {
            existingCertificate.setIssueDate(certificateDetails.getIssueDate());
        }
        return certificateRepository.save(existingCertificate);
    }

    public void deleteCertificate(Long id) {
        Certificate certificate = getCertificateById(id);
        certificateRepository.delete(certificate);
    }

    public void deleteCertificateByEvaluationId(Long evaluationId) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new IllegalArgumentException("Evaluation not found"));
        Certificate certificate = certificateRepository.findByEvaluation(evaluation);
        if (certificate != null) {
            certificateRepository.delete(certificate);
        }
    }

    public boolean verifyCertificate(String certificateCode) {
        return certificateRepository.findByCertificateCode(certificateCode) != null;
    }

    public Certificate getCertificateByCode(String certificateCode) {
        Certificate certificate = certificateRepository.findByCertificateCode(certificateCode);
        if (certificate == null) {
            throw new IllegalArgumentException("Certificate not found with code: " + certificateCode);
        }
        return certificate;
    }

    public long countCertificatesByUser(Long userId) {
        return certificateRepository.findByEvaluationUserId(userId).size();
    }

    private String generateCertificateCode(Evaluation evaluation) {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        String examPart = evaluation.getExam().getId().toString();
        String userPart = evaluation.getUserId().toString();
        String uniquePart = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return String.format("CERT-%s-%s-%s-%s", examPart, userPart, datePart, uniquePart);
    }

    public List<Certificate> createCertificatesForExam(Long examId) {
        List<Evaluation> passedEvaluations = evaluationRepository.findByExamIdAndPassed(examId, true);
        return passedEvaluations.stream()
                .filter(eval -> certificateRepository.findByEvaluation(eval) == null)
                .map(eval -> {
                    Certificate cert = new Certificate();
                    cert.setEvaluation(eval);
                    cert.setIssueDate(LocalDate.now());
                    cert.setCertificateCode(generateCertificateCode(eval));
                    return certificateRepository.save(cert);
                })
                .toList();
    }
}
