package tn.esprit.gestionexam.services;

import org.springframework.stereotype.Service;
import tn.esprit.gestionexam.dto.SubmitExamRequest;
import tn.esprit.gestionexam.dto.SubmitExamResponse;
import tn.esprit.gestionexam.entities.*;
import tn.esprit.gestionexam.repositories.EvaluationRepository;
import tn.esprit.gestionexam.repositories.ExamRepository;
import tn.esprit.gestionexam.repositories.QuestionRepository;
import tn.esprit.gestionexam.repositories.UserAnswerRepository;

import java.util.List;

@Service
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final CertificateService certificateService;

    public EvaluationService(EvaluationRepository evaluationRepository,
                              UserAnswerRepository userAnswerRepository,
                              ExamRepository examRepository,
                              QuestionRepository questionRepository,
                              CertificateService certificateService) {
        this.evaluationRepository = evaluationRepository;
        this.userAnswerRepository = userAnswerRepository;
        this.examRepository = examRepository;
        this.questionRepository = questionRepository;
        this.certificateService = certificateService;
    }

    public SubmitExamResponse submitExam(SubmitExamRequest request) {
        Examen exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));

        List<Question> questions = questionRepository.findByExamId(request.getExamId());

        if (questions.isEmpty()) {
            throw new IllegalStateException("Exam has no questions");
        }

        long correct = request.getAnswers().stream()
                .filter(answer -> questions.stream()
                        .anyMatch(q -> q.getId().equals(answer.getQuestionId())
                                && q.getCorrectAnswer().equals(answer.getSelectedOption())))
                .count();

        double score = ((double) correct / questions.size()) * 100;
        boolean passed = score >= exam.getPassScore();

        Evaluation evaluation = new Evaluation();
        evaluation.setUserId(request.getUserId());
        evaluation.setScore(score);
        evaluation.setPassed(passed);
        evaluation.setExam(exam);
        evaluation = evaluationRepository.save(evaluation);

        for (SubmitExamRequest.AnswerDto answerDto : request.getAnswers()) {
            UserAnswer userAnswer = new UserAnswer();
            userAnswer.setQuestionId(answerDto.getQuestionId());
            userAnswer.setSelectedOption(answerDto.getSelectedOption());
            userAnswer.setEvaluation(evaluation);
            userAnswerRepository.save(userAnswer);
        }

        String certificateCode = null;
        if (passed) {
            Certificate cert = certificateService.createCertificate(evaluation.getId());
            certificateCode = cert.getCertificateCode();
        }

        return new SubmitExamResponse(score, passed, evaluation.getId(), certificateCode);
    }

    public List<Evaluation> getAllEvaluations() {
        return evaluationRepository.findAll();
    }

    public Evaluation getEvaluationById(Long id) {
        return evaluationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Evaluation not found"));
    }

    public List<Evaluation> getEvaluationsByExamId(Long examId) {
        return evaluationRepository.findByExamId(examId);
    }

    public List<Evaluation> getEvaluationsByUserId(Long userId) {
        return evaluationRepository.findByUserId(userId);
    }

    public Evaluation updateEvaluation(Long id, Evaluation evaluation) {
        Evaluation existing = getEvaluationById(id);
        existing.setScore(evaluation.getScore());
        existing.setPassed(evaluation.getPassed());
        return evaluationRepository.save(existing);
    }

    public void deleteEvaluation(Long id) {
        evaluationRepository.deleteById(id);
    }

    public List<Evaluation> getPassedEvaluations() {
        return evaluationRepository.findByPassedTrue();
    }

    public List<Evaluation> getFailedEvaluations() {
        return evaluationRepository.findByPassedFalse();
    }

    public List<Evaluation> getEvaluationsByUserAndStatus(Long userId, Boolean passed) {
        return evaluationRepository.findByUserIdAndPassed(userId, passed);
    }

    public Double getAverageScoreByExamId(Long examId) {
        return evaluationRepository.getAverageScoreByExamId(examId);
    }

    public Evaluation createEvaluation(Evaluation evaluation, Long examId) {
        Examen exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
        evaluation.setExam(exam);
        return evaluationRepository.save(evaluation);
    }

    public Double getPassRateByExamId(Long examId) {
        List<Evaluation> all = evaluationRepository.findByExamId(examId);
        if (all.isEmpty()) return 0.0;
        long passed = all.stream().filter(e -> Boolean.TRUE.equals(e.getPassed())).count();
        return ((double) passed / all.size()) * 100;
    }
}
