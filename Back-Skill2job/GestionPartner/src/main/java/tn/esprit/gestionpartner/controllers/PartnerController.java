package tn.esprit.gestionpartner.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.esprit.gestionpartner.dto.PartnerCreateRequest;
import tn.esprit.gestionpartner.dto.PartnerResponse;
import tn.esprit.gestionpartner.dto.PartnerUpdateRequest;
import tn.esprit.gestionpartner.entities.PartnerStatus;
import tn.esprit.gestionpartner.services.PartnerPdfExportService;
import tn.esprit.gestionpartner.services.PartnerService;

import java.util.List;

@RestController
@RequestMapping("/api/partners")
@CrossOrigin(origins = "*")
public class PartnerController {

    private final PartnerPdfExportService partnerPdfExportService;
    private final PartnerService partnerService;

    public PartnerController(PartnerService partnerService,
                             PartnerPdfExportService partnerPdfExportService) {
        this.partnerService = partnerService;
        this.partnerPdfExportService = partnerPdfExportService;
    }

    @PostMapping("/me")
    public ResponseEntity<PartnerResponse> createMyPartner(
            Authentication auth,
            @RequestBody PartnerCreateRequest request
    ) {
        return ResponseEntity.ok(partnerService.createMyPartner(auth.getName(), request));
    }

    @GetMapping("/me")
    public ResponseEntity<PartnerResponse> getMyPartner(Authentication auth) {
        return ResponseEntity.ok(partnerService.getMyPartner(auth.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<PartnerResponse> updateMyPartner(
            Authentication auth,
            @RequestBody PartnerUpdateRequest request
    ) {
        return ResponseEntity.ok(partnerService.updateMyPartner(auth.getName(), request));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyPartner(Authentication auth) {
        partnerService.deleteMyPartner(auth.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{partnerId}/status")
    public ResponseEntity<PartnerResponse> updateStatus(
            @PathVariable("partnerId") Long partnerId,
            @RequestParam("status") PartnerStatus status
    ) {
        return ResponseEntity.ok(partnerService.updateStatus(partnerId, status));
    }

    @GetMapping("/all")
    public ResponseEntity<List<PartnerResponse>> getAllPartners() {
        return ResponseEntity.ok(partnerService.getAllPartners());
    }

    @GetMapping("/{partnerId}")
    public ResponseEntity<PartnerResponse> getPartnerById(@PathVariable("partnerId") Long partnerId) {
        return ResponseEntity.ok(partnerService.getPartnerById(partnerId));
    }

    @DeleteMapping("/{partnerId}")
    public ResponseEntity<Void> adminDeletePartner(@PathVariable("partnerId") Long partnerId) {
        partnerService.adminDeletePartner(partnerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/export/pdf")
    public ResponseEntity<byte[]> exportPartnersPdf() {
        List<PartnerResponse> partners = partnerService.getAllPartners();
        byte[] pdf = partnerPdfExportService.exportPartners(partners);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=partners-premium-report.pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}