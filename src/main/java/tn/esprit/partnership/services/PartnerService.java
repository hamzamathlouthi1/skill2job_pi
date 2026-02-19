package tn.esprit.partnership.services;

import tn.esprit.partnership.dto.PartnerCreateRequest;
import tn.esprit.partnership.dto.PartnerResponse;
import tn.esprit.partnership.dto.PartnerUpdateRequest;
import tn.esprit.partnership.entities.PartnerStatus;

import java.util.List;

public interface PartnerService {

    PartnerResponse createPartner(Long employerId, PartnerCreateRequest request);

    PartnerResponse getMyPartner(Long employerId);

    PartnerResponse updateMyPartner(Long employerId, PartnerUpdateRequest request);

    PartnerResponse updateStatus(Long partnerId, PartnerStatus status);

    // ✅ ADMIN: List all partners
    List<PartnerResponse> getAllPartners();
    void deleteMyPartner(Long employerId);
    void adminDeletePartner(Long partnerId);
    PartnerResponse getPartnerById(Long partnerId); // ✅ ADD

}
