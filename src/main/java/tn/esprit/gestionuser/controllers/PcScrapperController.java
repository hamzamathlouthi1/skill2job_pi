package tn.esprit.gestionuser.controllers;

import org.springframework.web.bind.annotation.*;
import tn.esprit.gestionuser.entities.PcOffer;
import tn.esprit.gestionuser.services.implementations.PcScraperService;

import java.util.List;

@RestController
@RequestMapping("/pc")
@CrossOrigin(origins = "*") // allow Angular access
public class PcScrapperController {

    private final PcScraperService scraper;

    public PcScrapperController(PcScraperService scraper) {
        this.scraper = scraper;
    }

    @GetMapping("/search")
    public List<PcOffer> search(
            @RequestParam(required = false) Double maxBudget,
            @RequestParam(required = false) Integer minRam) {

        List<PcOffer> offers = scraper.scrapeSite();

        return offers.stream()
                .filter(pc -> maxBudget == null || pc.getPrice() <= maxBudget)
                .filter(pc -> minRam == null ||
                        (pc.getRam() != null && pc.getRam() >= minRam))
                .toList();
    }
}