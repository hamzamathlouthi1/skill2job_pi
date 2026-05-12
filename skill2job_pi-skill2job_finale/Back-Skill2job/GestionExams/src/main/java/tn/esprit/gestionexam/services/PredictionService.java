package tn.esprit.gestionexam.services;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import tn.esprit.gestionexam.dto.PredictionRequest;
import tn.esprit.gestionexam.dto.PredictionResponse;

@Service
public class PredictionService {

private static final String FLASK_URL = "http://ml-service:5000/predict";

    public PredictionResponse predict(PredictionRequest request) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<PredictionRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<PredictionResponse> response = restTemplate.exchange(
            FLASK_URL,
            HttpMethod.POST,
            entity,
            PredictionResponse.class
        );

        return response.getBody();
    }
}