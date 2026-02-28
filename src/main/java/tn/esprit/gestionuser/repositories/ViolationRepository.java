package tn.esprit.gestionuser.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.gestionuser.entities.ExamViolation;

import java.util.List;

public interface ViolationRepository extends JpaRepository<ExamViolation, Long> {
    List<ExamViolation> findByExamAttemptId(Long attemptId);
    long countByExamAttemptId(Long attemptId);
}