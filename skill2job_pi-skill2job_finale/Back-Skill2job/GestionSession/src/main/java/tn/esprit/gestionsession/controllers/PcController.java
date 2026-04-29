package tn.esprit.gestionsession.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.gestionsession.entities.PcOffer;
import tn.esprit.gestionsession.services.implementations.PcScraperService;

import java.util.List;
import java.util.logging.Logger;
import java.util.logging.Level;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/pc")
public class PcController {

    private static final Logger logger = Logger.getLogger(PcController.class.getName());
    private final PcScraperService pcScraperService;

    public PcController(PcScraperService pcScraperService) {
        this.pcScraperService = pcScraperService;
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam(required = false) Double maxBudget,
            @RequestParam(required = false) Integer minRam
    ) {
        try {
            logger.log(Level.INFO, String.format("PC search request - maxBudget: %s, minRam: %s", maxBudget, minRam));

            long startTime = System.currentTimeMillis();
            List<PcOffer> offers = pcScraperService.scrapeSite();
            long elapsedTime = System.currentTimeMillis() - startTime;
            
            logger.log(Level.INFO, "Scraping completed in " + elapsedTime + "ms, found " + offers.size() + " offers");

            List<PcOffer> filtered = offers.stream()
                    .filter(o -> maxBudget == null || o.getPrice() <= maxBudget)
                    .filter(o -> minRam == null || (o.getRam() != null && o.getRam() >= minRam))
                    .collect(Collectors.toList());

            logger.log(Level.INFO, "After filtering: " + filtered.size() + " offers");
            return ResponseEntity.ok(filtered);

        } catch (RuntimeException e) {
            logger.log(Level.SEVERE, "Scraping runtime error", e);
            return ResponseEntity.status(500).body(
                    "{\"error\": \"Scraping failed: " + e.getMessage() + "\"}"
            );
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error during PC search", e);
            return ResponseEntity.status(500).body(
                    "{\"error\": \"An unexpected error occurred: " + e.getMessage() + "\"}"
            );
        }
    }

   
}