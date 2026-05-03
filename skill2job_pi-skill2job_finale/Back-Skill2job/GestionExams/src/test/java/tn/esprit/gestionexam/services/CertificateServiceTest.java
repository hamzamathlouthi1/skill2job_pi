package tn.esprit.gestionexam.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.gestionexam.entities.Certificate;
import tn.esprit.gestionexam.entities.Evaluation;
import tn.esprit.gestionexam.entities.Examen;
import tn.esprit.gestionexam.repositories.CertificateRepository;
import tn.esprit.gestionexam.repositories.EvaluationRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CertificateService Unit Tests")
class CertificateServiceTest {

    @Mock
    private CertificateRepository certificateRepository;

    @Mock
    private EvaluationRepository evaluationRepository;

    @InjectMocks
    private CertificateService certificateService;

    private Evaluation evaluation;
    private Certificate certificate;
    private Examen exam;

    @BeforeEach
    void setUp() {
        exam = new Examen();
        exam.setId(1L);
        exam.setPassScore(70.0);
        exam.setTitle("Java Exam");

        evaluation = new Evaluation();
        evaluation.setId(1L);
        evaluation.setUserId(10L);
        evaluation.setScore(85.0);
        evaluation.setPassed(true);
        evaluation.setExam(exam);

        certificate = new Certificate();
        certificate.setId(1L);
        certificate.setCertificateCode("CERT-1-10-202505-ABC123");
        certificate.setEvaluation(evaluation);
    }

    @Test
    @DisplayName("Should create certificate when evaluation passed")
    void createCertificate_WhenPassed_ShouldReturnCertificate() {
        when(evaluationRepository.findById(1L)).thenReturn(Optional.of(evaluation));
        when(certificateRepository.findByEvaluation(evaluation)).thenReturn(null);
        when(certificateRepository.save(any(Certificate.class))).thenReturn(certificate);

        Certificate result = certificateService.createCertificate(1L);

        assertThat(result).isNotNull();
        verify(certificateRepository).save(any(Certificate.class));
    }

    @Test
    @DisplayName("Should throw when evaluation not found")
    void createCertificate_WhenEvaluationNotFound_ShouldThrow() {
        when(evaluationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> certificateService.createCertificate(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Evaluation not found");
    }

    @Test
    @DisplayName("Should throw when evaluation not passed")
    void createCertificate_WhenNotPassed_ShouldThrow() {
        evaluation.setPassed(false);
        when(evaluationRepository.findById(1L)).thenReturn(Optional.of(evaluation));

        assertThatThrownBy(() -> certificateService.createCertificate(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("did not pass");
    }

    @Test
    @DisplayName("Should throw when certificate already exists")
    void createCertificate_WhenAlreadyExists_ShouldThrow() {
        when(evaluationRepository.findById(1L)).thenReturn(Optional.of(evaluation));
        when(certificateRepository.findByEvaluation(evaluation)).thenReturn(certificate);

        assertThatThrownBy(() -> certificateService.createCertificate(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    @DisplayName("Should return all certificates")
    void getAllCertificates_ShouldReturnList() {
        when(certificateRepository.findAll()).thenReturn(Arrays.asList(certificate));

        List<Certificate> result = certificateService.getAllCertificates();

        assertThat(result).hasSize(1);
        verify(certificateRepository).findAll();
    }

    @Test
    @DisplayName("Should return certificate by ID")
    void getCertificateById_WhenExists_ShouldReturn() {
        when(certificateRepository.findById(1L)).thenReturn(Optional.of(certificate));

        Certificate result = certificateService.getCertificateById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should throw when certificate not found by ID")
    void getCertificateById_WhenNotFound_ShouldThrow() {
        when(certificateRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> certificateService.getCertificateById(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Certificate not found");
    }

    @Test
    @DisplayName("Should return certificate by evaluation ID")
    void getCertificateByEvaluationId_WhenExists_ShouldReturn() {
        when(evaluationRepository.findById(1L)).thenReturn(Optional.of(evaluation));
        when(certificateRepository.findByEvaluation(evaluation)).thenReturn(certificate);

        Certificate result = certificateService.getCertificateByEvaluationId(1L);

        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should throw when no certificate for evaluation")
    void getCertificateByEvaluationId_WhenNone_ShouldThrow() {
        when(evaluationRepository.findById(1L)).thenReturn(Optional.of(evaluation));
        when(certificateRepository.findByEvaluation(evaluation)).thenReturn(null);

        assertThatThrownBy(() -> certificateService.getCertificateByEvaluationId(1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("No certificate found");
    }

    @Test
    @DisplayName("Should return certificates by user ID")
    void getCertificatesByUserId_ShouldReturnList() {
        when(certificateRepository.findByEvaluationUserId(10L)).thenReturn(Arrays.asList(certificate));

        List<Certificate> result = certificateService.getCertificatesByUserId(10L);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should return certificate by user and exam")
    void getCertificateByUserAndExam_WhenExists_ShouldReturn() {
        when(certificateRepository.findByEvaluationUserId(10L)).thenReturn(Arrays.asList(certificate));

        Certificate result = certificateService.getCertificateByUserAndExam(10L, 1L);

        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should throw when no certificate for user and exam")
    void getCertificateByUserAndExam_WhenNone_ShouldThrow() {
        when(certificateRepository.findByEvaluationUserId(10L)).thenReturn(Arrays.asList());

        assertThatThrownBy(() -> certificateService.getCertificateByUserAndExam(10L, 99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("No certificate found");
    }

    @Test
    @DisplayName("Should update certificate issue date")
    void updateCertificate_ShouldUpdateDate() {
        Certificate details = new Certificate();
        details.setIssueDate(java.time.LocalDate.now());

        when(certificateRepository.findById(1L)).thenReturn(Optional.of(certificate));
        when(certificateRepository.save(any(Certificate.class))).thenAnswer(i -> i.getArgument(0));

        Certificate result = certificateService.updateCertificate(1L, details);

        assertThat(result.getIssueDate()).isNotNull();
        verify(certificateRepository).save(any(Certificate.class));
    }

    @Test
    @DisplayName("Should delete certificate by ID")
    void deleteCertificate_ShouldCallDelete() {
        when(certificateRepository.findById(1L)).thenReturn(Optional.of(certificate));

        certificateService.deleteCertificate(1L);

        verify(certificateRepository).delete(certificate);
    }

    @Test
    @DisplayName("Should delete certificate by evaluation ID")
    void deleteCertificateByEvaluationId_ShouldCallDelete() {
        when(evaluationRepository.findById(1L)).thenReturn(Optional.of(evaluation));
        when(certificateRepository.findByEvaluation(evaluation)).thenReturn(certificate);

        certificateService.deleteCertificateByEvaluationId(1L);

        verify(certificateRepository).delete(certificate);
    }

    @Test
    @DisplayName("Should not delete when no certificate for evaluation")
    void deleteCertificateByEvaluationId_WhenNone_ShouldNotCallDelete() {
        when(evaluationRepository.findById(1L)).thenReturn(Optional.of(evaluation));
        when(certificateRepository.findByEvaluation(evaluation)).thenReturn(null);

        certificateService.deleteCertificateByEvaluationId(1L);

        verify(certificateRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Should return true when certificate code exists")
    void verifyCertificate_WhenExists_ShouldReturnTrue() {
        when(certificateRepository.findByCertificateCode("CERT-1-10-202505-ABC123"))
                .thenReturn(certificate);

        assertThat(certificateService.verifyCertificate("CERT-1-10-202505-ABC123")).isTrue();
    }

    @Test
    @DisplayName("Should return false when certificate code not found")
    void verifyCertificate_WhenNotFound_ShouldReturnFalse() {
        when(certificateRepository.findByCertificateCode("INVALID")).thenReturn(null);

        assertThat(certificateService.verifyCertificate("INVALID")).isFalse();
    }

    @Test
    @DisplayName("Should return certificate by code")
    void getCertificateByCode_WhenExists_ShouldReturn() {
        when(certificateRepository.findByCertificateCode("CERT-1-10-202505-ABC123"))
                .thenReturn(certificate);

        Certificate result = certificateService.getCertificateByCode("CERT-1-10-202505-ABC123");

        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should throw when code not found")
    void getCertificateByCode_WhenNotFound_ShouldThrow() {
        when(certificateRepository.findByCertificateCode("INVALID")).thenReturn(null);

        assertThatThrownBy(() -> certificateService.getCertificateByCode("INVALID"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Certificate not found");
    }

    @Test
    @DisplayName("Should count certificates by user")
    void countCertificatesByUser_ShouldReturnCount() {
        when(certificateRepository.findByEvaluationUserId(10L)).thenReturn(Arrays.asList(certificate));

        long count = certificateService.countCertificatesByUser(10L);

        assertThat(count).isEqualTo(1L);
    }
}
