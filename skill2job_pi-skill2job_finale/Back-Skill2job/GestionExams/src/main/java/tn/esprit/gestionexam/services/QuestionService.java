package tn.esprit.gestionexam.services;

import org.springframework.stereotype.Service;
import tn.esprit.gestionexam.entities.Examen;
import tn.esprit.gestionexam.entities.Question;
import tn.esprit.gestionexam.repositories.ExamRepository;
import tn.esprit.gestionexam.repositories.QuestionRepository;

import java.util.List;

@Service
public class QuestionService {

    private static final String EXAM_NOT_FOUND = "Exam not found";

    private final QuestionRepository questionRepository;
    private final ExamRepository examRepository;

    public QuestionService(QuestionRepository questionRepository,
                           ExamRepository examRepository) {
        this.questionRepository = questionRepository;
        this.examRepository = examRepository;
    }

    public Question createQuestion(Question question, Long examId) {
        Examen exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found with id: " + examId));
        question.setExam(exam);
        return questionRepository.save(question);
    }

    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    public Question getQuestionById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + id));
    }

    public List<Question> getQuestionsByExamId(Long examId) {
        Examen exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException(EXAM_NOT_FOUND));
        return questionRepository.findByExam(exam);
    }

    public Question updateQuestion(Long id, Question questionDetails) {
        Question existingQuestion = getQuestionById(id);
        existingQuestion.setContent(questionDetails.getContent());
        existingQuestion.setOptionA(questionDetails.getOptionA());
        existingQuestion.setOptionB(questionDetails.getOptionB());
        existingQuestion.setOptionC(questionDetails.getOptionC());
        existingQuestion.setOptionD(questionDetails.getOptionD());
        existingQuestion.setCorrectAnswer(questionDetails.getCorrectAnswer());
        if (questionDetails.getExam() != null && questionDetails.getExam().getId() != null) {
            Examen newExam = examRepository.findById(questionDetails.getExam().getId())
                    .orElseThrow(() -> new IllegalArgumentException(EXAM_NOT_FOUND));
            existingQuestion.setExam(newExam);
        }
        return questionRepository.save(existingQuestion);
    }

    public void deleteQuestion(Long id) {
        Question question = getQuestionById(id);
        questionRepository.delete(question);
    }

    public void deleteQuestionsByExamId(Long examId) {
        Examen exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException(EXAM_NOT_FOUND));
        List<Question> questions = questionRepository.findByExam(exam);
        questionRepository.deleteAll(questions);
    }

    public long countQuestionsByExamId(Long examId) {
        Examen exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException(EXAM_NOT_FOUND));
        return questionRepository.findByExam(exam).size();
    }

    public boolean checkAnswer(Long questionId, String userAnswer) {
        Question question = getQuestionById(questionId);
        return question.getCorrectAnswer().equalsIgnoreCase(userAnswer);
    }
}
