package tn.esprit.gestionexam.dto;

import tn.esprit.gestionexam.entities.*;

public class EntityMapper {

    private EntityMapper() {
        // utility class — no instantiation
    }

    public static ExamenDTO toExamenDTO(Examen e) {
        ExamenDTO dto = new ExamenDTO();
        dto.setId(e.getId());
        dto.setTitle(e.getTitle());
        dto.setDescription(e.getDescription());
        dto.setPassScore(e.getPassScore());
        if (e.getQuestions() != null)
            dto.setQuestionIds(e.getQuestions().stream().map(Question::getId).toList());
        if (e.getEvaluations() != null)
            dto.setEvaluationIds(e.getEvaluations().stream().map(Evaluation::getId).toList());
        return dto;
    }

    public static QuestionDTO toQuestionDTO(Question q) {
        QuestionDTO dto = new QuestionDTO();
        dto.setId(q.getId());
        dto.setContent(q.getContent());
        dto.setOptionA(q.getOptionA());
        dto.setOptionB(q.getOptionB());
        dto.setOptionC(q.getOptionC());
        dto.setOptionD(q.getOptionD());
        if (q.getExam() != null) dto.setExamId(q.getExam().getId());
        return dto;
    }

    public static EvaluationDTO toEvaluationDTO(Evaluation ev) {
        EvaluationDTO dto = new EvaluationDTO();
        dto.setId(ev.getId());
        dto.setUserId(ev.getUserId());
        dto.setScore(ev.getScore());
        dto.setPassed(ev.getPassed());
        if (ev.getExam() != null) dto.setExamId(ev.getExam().getId());
        if (ev.getAnswers() != null)
            dto.setAnswerIds(ev.getAnswers().stream().map(UserAnswer::getId).toList());
        return dto;
    }

    public static CertificateDTO toCertificateDTO(Certificate c) {
        CertificateDTO dto = new CertificateDTO();
        dto.setId(c.getId());
        dto.setCertificateCode(c.getCertificateCode());
        dto.setIssueDate(c.getIssueDate());
        dto.setUserId(c.getUserId());
        dto.setExamId(c.getExamId());
        dto.setScore(c.getScore());
        dto.setLevel(c.getLevel());
        if (c.getEvaluation() != null) dto.setEvaluationId(c.getEvaluation().getId());
        return dto;
    }

    public static UserAnswerDTO toUserAnswerDTO(UserAnswer ua) {
        UserAnswerDTO dto = new UserAnswerDTO();
        dto.setId(ua.getId());
        dto.setQuestionId(ua.getQuestionId());
        dto.setSelectedOption(ua.getSelectedOption());
        if (ua.getEvaluation() != null) dto.setEvaluationId(ua.getEvaluation().getId());
        return dto;
    }

    public static ExamViolationDTO toViolationDTO(ExamViolation v) {
        ExamViolationDTO dto = new ExamViolationDTO();
        dto.setId(v.getId());
        dto.setExamAttemptId(v.getExamAttemptId());
        dto.setLearnerId(v.getLearnerId());
        dto.setType(v.getType());
        dto.setTimestamp(v.getTimestamp());
        return dto;
    }
}
