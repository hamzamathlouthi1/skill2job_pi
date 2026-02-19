package tn.esprit.partnership.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.partnership.dto.JobOfferCreateRequest;
import tn.esprit.partnership.dto.JobOfferResponse;
import tn.esprit.partnership.dto.JobOfferUpdateRequest;
import tn.esprit.partnership.entities.OfferStatus;
import tn.esprit.partnership.services.JobOfferService;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/offers")
@CrossOrigin(origins = "*")
public class JobOfferController {

    private final JobOfferService service;

    public JobOfferController(JobOfferService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<JobOfferResponse> create(@Valid @RequestBody JobOfferCreateRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PutMapping("/{offerId}")
    public ResponseEntity<JobOfferResponse> update(@PathVariable Long offerId,
                                                   @Valid @RequestBody JobOfferUpdateRequest request) {
        return ResponseEntity.ok(service.update(offerId, request));
    }
    @GetMapping("/{offerId}")
    public ResponseEntity<JobOfferResponse> getById(@PathVariable Long offerId) {
        return ResponseEntity.ok(service.getById(offerId));
    }

    @GetMapping
    public ResponseEntity<List<JobOfferResponse>> listAll() {
        return ResponseEntity.ok(service.listAll());
    }

    @GetMapping("/partner/{partnerId}")
    public ResponseEntity<List<JobOfferResponse>> listByPartner(@PathVariable Long partnerId) {
        return ResponseEntity.ok(service.listByPartner(partnerId));
    }

    @DeleteMapping("/{offerId}")
    public ResponseEntity<Void> delete(@PathVariable Long offerId) {
        service.delete(offerId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{offerId}/status")
    public ResponseEntity<JobOfferResponse> updateStatus(@PathVariable Long offerId,
                                                         @RequestParam OfferStatus status) {
        return ResponseEntity.ok(service.updateStatus(offerId, status));
    }
}
