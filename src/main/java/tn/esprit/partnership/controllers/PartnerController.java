package tn.esprit.partnership.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.partnership.dto.PartnerCreateRequest;
import tn.esprit.partnership.dto.PartnerResponse;
import tn.esprit.partnership.dto.PartnerUpdateRequest;
import tn.esprit.partnership.entities.PartnerStatus;
import tn.esprit.partnership.services.PartnerService;
import java.util.List;


@RestController
@RequestMapping("/api/partners")
@CrossOrigin(origins = "*")
public class PartnerController {

    private final PartnerService partnerService;

    // ✅ Constructor Injection (stable, no Lombok required)
    public PartnerController(PartnerService partnerService) {
        this.partnerService = partnerService;
    }

    // =========================
    // Create Partner Profile (Employer)
    // =========================
    @PostMapping("/employer/{employerId}")
    public ResponseEntity<PartnerResponse> createPartner(
            @PathVariable Long employerId,
            @RequestBody PartnerCreateRequest request
    ) {
        return ResponseEntity.ok(
                partnerService.createPartner(employerId, request)
        );
    }

    // =========================
    // Get My Partner Profile
    // =========================
    @GetMapping("/employer/{employerId}")
    public ResponseEntity<PartnerResponse> getMyPartner(
            @PathVariable Long employerId
    ) {
        return ResponseEntity.ok(
                partnerService.getMyPartner(employerId)
        );
    }

    // =========================
    // Update My Partner Profile
    // =========================
    @PutMapping("/employer/{employerId}")
    public ResponseEntity<PartnerResponse> updateMyPartner(
            @PathVariable Long employerId,
            @RequestBody PartnerUpdateRequest request
    ) {
        return ResponseEntity.ok(
                partnerService.updateMyPartner(employerId, request)
        );
    }

    // =========================
    // Admin: Update Partner Status
    // =========================
    @PutMapping("/{partnerId}/status")
    public ResponseEntity<PartnerResponse> updateStatus(
            @PathVariable Long partnerId,
            @RequestParam PartnerStatus status
    ) {
        return ResponseEntity.ok(
                partnerService.updateStatus(partnerId, status)
        );
    }
    // =========================
// Admin: Get All Partners
// =========================
    @GetMapping("/all")
    public ResponseEntity<List<PartnerResponse>> getAllPartners() {
        return ResponseEntity.ok(partnerService.getAllPartners());
    }

    // EMPLOYER: delete my partner profile
    @DeleteMapping("/employer/{employerId}")
    public ResponseEntity<Void> deleteMyPartner(@PathVariable Long employerId) {
        partnerService.deleteMyPartner(employerId);
        return ResponseEntity.noContent().build();
    }

    // ADMIN: delete partner by id
    @DeleteMapping("/{partnerId}")
    public ResponseEntity<Void> adminDeletePartner(@PathVariable Long partnerId) {
        partnerService.adminDeletePartner(partnerId);
        return ResponseEntity.noContent().build();
    }
    // ADMIN: Get Partner By Id (Details)
    @GetMapping("/{partnerId}")
    public ResponseEntity<PartnerResponse> getPartnerById(@PathVariable Long partnerId) {
        return ResponseEntity.ok(partnerService.getPartnerById(partnerId));
    }



}
