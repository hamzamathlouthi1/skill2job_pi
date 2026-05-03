package tn.esprit.gestionexam.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.gestionexam.entities.*;
import tn.esprit.gestionexam.repositories.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EvaluationService Unit Tests")
class EvaluationServiceTest {

    @Mock private EvaluationRepository evaluationRepository;
    @Mock private UserAnswerRepository userAnswerRepository;
    @Mock private ExamRepository examRepository;
    @Mock private QuestionRepository questionRepository;
    @Mock private CertificateService certificateService;

    @InjectMocks
    private EvaluationService evaluationService;

    private Evaluation evaluation;
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
    }

    @Test
    @DisplayName("Should return all evaluations")
    void getAllEvaluations_ShouldReturnList() {
        when(evaluationRepository.findAll()).thenReturn(Arrays.asList(evaluation));

        List<Evaluation> result = evaluationService.getAllEvaluations();

        assertThat(result).hasSize(1);
        verify(evaluationRepository).findAll();
    }

    @Test
    @DisplayName("Should return evaluation by ID")
    void getEvaluationById_WhenExists_ShouldReturn() {
        when(evaluationRepository.findById(1L)).thenReturn(Optional.of(evaluation));

        Evaluation result = evaluationService.getEvaluationById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should throw when evaluation not found")
    void getEvaluationById_WhenNotFound_ShouldThrow() {
        when(evaluationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> evaluationService.getEvaluationById(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Evaluation not found");
    }

    @Test
    @DisplayName("Should return evaluations by exam ID")
    void getEvaluationsByExamId_ShouldReturnList() {
        when(evaluationRepository.findByExamId(1L)).thenReturn(Arrays.asList(evaluation));

        List<Evaluation> result = evaluationService.getEvaluationsByExamId(1L);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should return evaluations by user ID")
    void getEvaluationsByUserId_ShouldReturnList() {
        when(evaluationRepository.findByUserId(10L)).thenReturn(Arrays.asList(evaluation));

        List<Evaluation> result = evaluationService.getEvaluationsByUserId(10L);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should update evaluation successfully")
    void updateEvaluation_ShouldReturnUpdated() {
        Evaluation updated = new Evaluation();
        updated.setScore(90.0);
        updated.setPassed(true);

        when(evaluationRepository.findById(1L)).thenReturn(Optional.of(evaluation));
        when(evaluationRepository.save(any(Evaluation.class))).thenAnswer(i -> i.getArgument(0));

        Evaluation result = evaluationService.updateEvaluation(1L, updated);

        assertThat(result.getScore()).isEqualTo(90.0);
        verify(evaluationRepository).save(any(Evaluation.class));
    }

    @Test
    @DisplayName("Should delete evaluation by ID")
    void deleteEvaluation_ShouldCallRepository() {
        evaluationService.deleteEvaluation(1L);

        verify(evaluationRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should return passed evaluations")
    void getPassedEvaluations_ShouldReturnList() {
        when(evaluationRepository.findByPassedTrue()).thenReturn(Arrays.asList(evaluation));

        List<Evaluation> result = evaluationService.getPassedEvaluations();

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should return failed evaluations")
    void getFailedEvaluations_ShouldReturnList() {
        evaluation.setPassed(false);
        when(evaluationRepository.findByPassedFalse()).thenReturn(Arrays.asList(evaluation));

        List<Evaluation> result = evaluationService.getFailedEvaluations();

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should return evaluations by user and status")
    void getEvaluationsByUserAndStatus_ShouldReturnList() {
        when(evaluationRepository.findByUserIdAndPassed(10L, true)).thenReturn(Arrays.asList(evaluation));

        List<Evaluation> result = evaluationService.getEvaluationsByUserAndStatus(10L, true);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should return 100% pass rate when all passed")
    void getPassRateByExamId_WhenAllPassed_ShouldReturn100() {
        when(evaluationRepository.findByExamId(1L)).thenReturn(Arrays.asList(evaluation));

        Double rate = evaluationService.getPassRateByExamId(1L);

        assertThat(rate).isEqualTo(100.0);
    }

    @Test
    @DisplayName("Should return 0 pass rate when no evaluations")
    void getPassRateByExamId_WhenEmpty_ShouldReturnZero() {
        when(evaluationRepository.findByExamId(1L)).thenReturn(Arrays.asList());

        Double rate = evaluationService.getPassRateByExamId(1L);

        assertThat(rate).isEqualTo(0.0);
    }

    @Test
    @DisplayName("Should create evaluation linked to exam")
    void createEvaluation_ShouldLinkExam() {
        when(examRepository.findById(1L)).thenReturn(Optional.of(exam));
        when(evaluationRepository.save(any(Evaluation.class))).thenReturn(evaluation);

        Evaluation result = evaluationService.createEvaluation(evaluation, 1L);

        assertThat(result).isNotNull();
        verify(evaluationRepository).save(any(Evaluation.class));
    }

    @Test
    @DisplayName("Should throw when exam not found on create evaluation")
    void createEvaluation_WhenExamNotFound_ShouldThrow() {
        when(examRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> evaluationService.createEvaluation(evaluation, 99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Exam not found");
    }

    @Test
    @DisplayName("Should return average score by exam ID")
    void getAverageScoreByExamId_ShouldReturnValue() {
        when(evaluationRepository.getAverageScoreByExamId(1L)).thenReturn(85.0);

        Double avg = evaluationService.getAverageScoreByExamId(1L);

        assertThat(avg).isEqualTo(85.0);
    }
}
