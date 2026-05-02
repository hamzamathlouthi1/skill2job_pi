package tn.esprit.gestionexam.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.gestionexam.dto.*;
import tn.esprit.gestionexam.entities.*;
import tn.esprit.gestionexam.services.*;
import tn.esprit.gestionexam.repositories.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    @Autowired private ExamService examService;
    @Autowired private CertificateService certificateService;
    @Autowired private QuestionService questionService;
    @Autowired private EvaluationService evaluationService;
    @Autowired private ViolationRepository violationRepository;
    @Autowired private UserAnswerRepository userAnswerRepository;

    // ==================== EXAM ENDPOINTS ====================

    @PostMapping("/exams")
    public ExamenDTO createExam(@RequestBody ExamenDTO dto) {
        Examen exam = new Examen();
        exam.setTitle(dto.getTitle());
        exam.setDescription(dto.getDescription());
        exam.setPassScore(dto.getPassScore());
        return EntityMapper.toExamenDTO(examService.createExam(exam));
    }

    @GetMapping("/exams")
    public List<ExamenDTO> getAllExams() {
        return examService.getAllExams().stream()
                .map(EntityMapper::toExamenDTO).collect(Collectors.toList());
    }

    @GetMapping("/exams/{id}")
    public ExamenDTO getExamById(@PathVariable Long id) {
        return EntityMapper.toExamenDTO(examService.getExamById(id));
    }

    @PutMapping("/exams/{id}")
    public ExamenDTO updateExam(@PathVariable Long id, @RequestBody ExamenDTO dto) {
        Examen exam = new Examen();
        exam.setTitle(dto.getTitle());
        exam.setDescription(dto.getDescription());
        exam.setPassScore(dto.getPassScore());
        return EntityMapper.toExamenDTO(examService.updateExam(id, exam));
    }

    @DeleteMapping("/exams/{id}")
    public void deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
    }

    // ==================== QUESTION ENDPOINTS ====================

    @PostMapping("/exams/{examId}/questions")
    public QuestionDTO createQuestion(@RequestBody QuestionDTO dto, @PathVariable Long examId) {
        Question question = new Question();
        question.setContent(dto.getContent());
        question.setOptionA(dto.getOptionA());
        question.setOptionB(dto.getOptionB());
        question.setOptionC(dto.getOptionC());
        question.setOptionD(dto.getOptionD());
        return EntityMapper.toQuestionDTO(questionService.createQuestion(question, examId));
    }

    @GetMapping("/questions")
    public List<QuestionDTO> getAllQuestions() {
        return questionService.getAllQuestions().stream()
                .map(EntityMapper::toQuestionDTO).collect(Collectors.toList());
    }

    @GetMapping("/questions/{id}")
    public QuestionDTO getQuestionById(@PathVariable Long id) {
        return EntityMapper.toQuestionDTO(questionService.getQuestionById(id));
    }

    @GetMapping("/exams/{examId}/questions")
    public List<QuestionDTO> getQuestionsByExamId(@PathVariable Long examId) {
        return questionService.getQuestionsByExamId(examId).stream()
                .map(EntityMapper::toQuestionDTO).collect(Collectors.toList());
    }

    @PutMapping("/questions/{id}")
    public QuestionDTO updateQuestion(@PathVariable Long id, @RequestBody QuestionDTO dto) {
        Question question = new Question();
        question.setContent(dto.getContent());
        question.setOptionA(dto.getOptionA());
        question.setOptionB(dto.getOptionB());
        question.setOptionC(dto.getOptionC());
        question.setOptionD(dto.getOptionD());
        return EntityMapper.toQuestionDTO(questionService.updateQuestion(id, question));
    }

    @DeleteMapping("/questions/{id}")
    public void deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
    }

    @DeleteMapping("/exams/{examId}/questions")
    public void deleteQuestionsByExamId(@PathVariable Long examId) {
        questionService.deleteQuestionsByExamId(examId);
    }

    @GetMapping("/questions/{id}/check")
    public boolean checkAnswer(@PathVariable Long id, @RequestParam String answer) {
        return questionService.checkAnswer(id, answer);
    }

    @GetMapping("/exams/{examId}/questions/count")
    public long countQuestionsByExamId(@PathVariable Long examId) {
        return questionService.countQuestionsByExamId(examId);
    }

    // ==================== EVALUATION ENDPOINTS ====================

    @PostMapping("/exams/{examId}/evaluations")
    public EvaluationDTO createEvaluation(@RequestBody EvaluationDTO dto, @PathVariable Long examId) {
        Evaluation evaluation = new Evaluation();
        evaluation.setUserId(dto.getUserId());
        evaluation.setScore(dto.getScore());
        evaluation.setPassed(dto.getPassed());
        return EntityMapper.toEvaluationDTO(evaluationService.createEvaluation(evaluation, examId));
    }

    @GetMapping("/evaluations")
    public List<EvaluationDTO> getAllEvaluations() {
        return evaluationService.getAllEvaluations().stream()
                .map(EntityMapper::toEvaluationDTO).collect(Collectors.toList());
    }

    @GetMapping("/evaluations/{id}")
    public EvaluationDTO getEvaluationById(@PathVariable Long id) {
        return EntityMapper.toEvaluationDTO(evaluationService.getEvaluationById(id));
    }

    @GetMapping("/exams/{examId}/evaluations")
    public List<EvaluationDTO> getEvaluationsByExamId(@PathVariable Long examId) {
        return evaluationService.getEvaluationsByExamId(examId).stream()
                .map(EntityMapper::toEvaluationDTO).collect(Collectors.toList());
    }

    @GetMapping("/users/{userId}/evaluations")
    public List<EvaluationDTO> getEvaluationsByUserId(@PathVariable Long userId) {
        return evaluationService.getEvaluationsByUserId(userId).stream()
                .map(EntityMapper::toEvaluationDTO).collect(Collectors.toList());
    }

    @PutMapping("/evaluations/{id}")
    public EvaluationDTO updateEvaluation(@PathVariable Long id, @RequestBody EvaluationDTO dto) {
        Evaluation evaluation = new Evaluation();
        evaluation.setUserId(dto.getUserId());
        evaluation.setScore(dto.getScore());
        evaluation.setPassed(dto.getPassed());
        return EntityMapper.toEvaluationDTO(evaluationService.updateEvaluation(id, evaluation));
    }

    @DeleteMapping("/evaluations/{id}")
    public void deleteEvaluation(@PathVariable Long id) {
        evaluationService.deleteEvaluation(id);
    }

    @GetMapping("/evaluations/passed")
    public List<EvaluationDTO> getPassedEvaluations() {
        return evaluationService.getPassedEvaluations().stream()
                .map(EntityMapper::toEvaluationDTO).collect(Collectors.toList());
    }

    @GetMapping("/evaluations/failed")
    public List<EvaluationDTO> getFailedEvaluations() {
        return evaluationService.getFailedEvaluations().stream()
                .map(EntityMapper::toEvaluationDTO).collect(Collectors.toList());
    }

    @GetMapping("/users/{userId}/evaluations/status")
    public List<EvaluationDTO> getEvaluationsByUserAndStatus(
            @PathVariable Long userId,
            @RequestParam Boolean passed) {
        return evaluationService.getEvaluationsByUserAndStatus(userId, passed).stream()
                .map(EntityMapper::toEvaluationDTO).collect(Collectors.toList());
    }

    @GetMapping("/exams/{examId}/evaluations/average")
    public Double getAverageScoreByExamId(@PathVariable Long examId) {
        return evaluationService.getAverageScoreByExamId(examId);
    }

    @GetMapping("/exams/{examId}/evaluations/pass-rate")
    public Double getPassRateByExamId(@PathVariable Long examId) {
        return evaluationService.getPassRateByExamId(examId);
    }

    // ==================== CERTIFICATE ENDPOINTS ====================

    @PostMapping("/evaluations/{evaluationId}/certificate")
    public CertificateDTO createCertificate(@PathVariable Long evaluationId) {
        return EntityMapper.toCertificateDTO(certificateService.createCertificate(evaluationId));
    }

    @GetMapping("/certificates")
    public List<CertificateDTO> getAllCertificates() {
        return certificateService.getAllCertificates().stream()
                .map(EntityMapper::toCertificateDTO).collect(Collectors.toList());
    }

    @GetMapping("/certificates/{id}")
    public CertificateDTO getCertificateById(@PathVariable Long id) {
        return EntityMapper.toCertificateDTO(certificateService.getCertificateById(id));
    }

    @GetMapping("/evaluations/{evaluationId}/certificate")
    public CertificateDTO getCertificateByEvaluationId(@PathVariable Long evaluationId) {
        return EntityMapper.toCertificateDTO(certificateService.getCertificateByEvaluationId(evaluationId));
    }

    @GetMapping("/users/{userId}/certificates")
    public List<CertificateDTO> getCertificatesByUserId(@PathVariable Long userId) {
        return certificateService.getCertificatesByUserId(userId).stream()
                .map(EntityMapper::toCertificateDTO).collect(Collectors.toList());
    }

    @GetMapping("/users/{userId}/exams/{examId}/certificate")
    public CertificateDTO getCertificateByUserAndExam(
            @PathVariable Long userId, @PathVariable Long examId) {
        return EntityMapper.toCertificateDTO(
                certificateService.getCertificateByUserAndExam(userId, examId));
    }

    @PutMapping("/certificates/{id}")
    public CertificateDTO updateCertificate(@PathVariable Long id, @RequestBody CertificateDTO dto) {
        Certificate certificate = new Certificate();
        certificate.setCertificateCode(dto.getCertificateCode());
        certificate.setIssueDate(dto.getIssueDate());
        return EntityMapper.toCertificateDTO(certificateService.updateCertificate(id, certificate));
    }

    @DeleteMapping("/certificates/{id}")
    public void deleteCertificate(@PathVariable Long id) {
        certificateService.deleteCertificate(id);
    }

    @DeleteMapping("/evaluations/{evaluationId}/certificate")
    public void deleteCertificateByEvaluationId(@PathVariable Long evaluationId) {
        certificateService.deleteCertificateByEvaluationId(evaluationId);
    }

    @GetMapping("/certificates/verify/{code}")
    public boolean verifyCertificate(@PathVariable String code) {
        return certificateService.verifyCertificate(code);
    }

    @GetMapping("/certificates/code/{code}")
    public CertificateDTO getCertificateByCode(@PathVariable String code) {
        return EntityMapper.toCertificateDTO(certificateService.getCertificateByCode(code));
    }

    @GetMapping("/users/{userId}/certificates/count")
    public long countCertificatesByUser(@PathVariable Long userId) {
        return certificateService.countCertificatesByUser(userId);
    }

    @PostMapping("/exams/{examId}/certificates/bulk")
    public List<CertificateDTO> createCertificatesForExam(@PathVariable Long examId) {
        return certificateService.createCertificatesForExam(examId).stream()
                .map(EntityMapper::toCertificateDTO).collect(Collectors.toList());
    }

    @PostMapping("/exams/{examId}/submit")
    public SubmitExamResponse submitExam(
            @PathVariable Long examId,
            @RequestBody SubmitExamRequest request) {
        request.setExamId(examId);
        return evaluationService.submitExam(request);
    }

    @GetMapping("/evaluations/{evaluationId}/answers")
    public List<UserAnswerDTO> getAnswersByEvaluationId(@PathVariable Long evaluationId) {
        return userAnswerRepository.findByEvaluationId(evaluationId).stream()
                .map(EntityMapper::toUserAnswerDTO).collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> logViolation(@RequestBody ExamViolationDTO dto) {
        ExamViolation violation = new ExamViolation();
        violation.setExamAttemptId(dto.getExamAttemptId());
        violation.setLearnerId(dto.getLearnerId());
        violation.setType(dto.getType());
        violationRepository.save(violation);
        return ResponseEntity.ok("logged");
    }

    @GetMapping("/attempt/{attemptId}")
    public ResponseEntity<List<ExamViolationDTO>> getViolations(@PathVariable Long attemptId) {
        return ResponseEntity.ok(
                violationRepository.findByExamAttemptId(attemptId).stream()
                        .map(EntityMapper::toViolationDTO).collect(Collectors.toList()));
    }
}
