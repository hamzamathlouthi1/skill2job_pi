package tn.esprit.gestionexam.services;

import org.springframework.stereotype.Service;
import tn.esprit.gestionexam.entities.Examen;
import tn.esprit.gestionexam.repositories.ExamRepository;

import java.util.List;

@Service
public class ExamService {

    private final ExamRepository examRepository;

    public ExamService(ExamRepository examRepository) {
        this.examRepository = examRepository;
    }

    public Examen createExam(Examen exam) {
        return examRepository.save(exam);
    }

    public List<Examen> getAllExams() {
        return examRepository.findAll();
    }

    public Examen getExamById(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found with id: " + id));
    }

    public Examen updateExam(Long id, Examen examDetails) {
        Examen existingExam = getExamById(id);
        existingExam.setTitle(examDetails.getTitle());
        existingExam.setDescription(examDetails.getDescription());
        existingExam.setPassScore(examDetails.getPassScore());
        return examRepository.save(existingExam);
    }

    public void deleteExam(Long id) {
        Examen exam = getExamById(id);
        examRepository.delete(exam);
    }

    public boolean existsById(Long id) {
        return examRepository.existsById(id);
    }
}
