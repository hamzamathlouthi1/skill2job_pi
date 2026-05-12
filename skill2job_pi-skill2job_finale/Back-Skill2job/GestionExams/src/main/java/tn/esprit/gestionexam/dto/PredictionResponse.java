package tn.esprit.gestionexam.dto;

import lombok.Data;

@Data
public class PredictionResponse {
    private String prediction;
    private double successProbability;
    private double failProbability;
}