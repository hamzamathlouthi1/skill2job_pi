package tn.esprit.gestionexam.dto;

import lombok.Data;

@Data
public class PredictionRequest {
    private double previousScore;
    private double attendanceRate;
    private int completedTrainings;
    private double engagementScore;
    private double submissionRate;
}