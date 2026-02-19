package tn.esprit.partnership.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.partnership.dto.PartnerCreateRequest;
import tn.esprit.partnership.dto.PartnerResponse;
import tn.esprit.partnership.dto.PartnerUpdateRequest;
import tn.esprit.partnership.entities.Partner;
import tn.esprit.partnership.entities.PartnerStatus;
import tn.esprit.partnership.repositories.PartnerRepository;
import java.util.List;
import java.util.stream.Collectors;


@Service
@Transactional
public class PartnerServiceImpl implements PartnerService {

    private final PartnerRepository partnerRepository;

    public PartnerServiceImpl(PartnerRepository partnerRepository) {
        this.partnerRepository = partnerRepository;
    }

    @Override
    public PartnerResponse createPartner(Long employerId, PartnerCreateRequest request) {
        if (partnerRepository.existsByEmployerId(employerId)) {
            throw new IllegalStateException("Partner profile already exists for this employer.");
        }

        Partner partner = new Partner();
        partner.setEmployerId(employerId);
        partner.setCompanyName(request.getCompanyName());
        partner.setIndustry(request.getIndustry());
        partner.setCompanyEmail(request.getCompanyEmail());
        partner.setPhone(request.getPhone());
        partner.setAddress(request.getAddress());
        partner.setWebsite(request.getWebsite());
        partner.setDescription(request.getDescription());
        partner.setStatus(PartnerStatus.PENDING);

        Partner saved = partnerRepository.save(partner);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PartnerResponse getMyPartner(Long employerId) {
        Partner partner = partnerRepository.findByEmployerId(employerId)
                .orElseThrow(() -> new IllegalStateException("Partner profile not found."));
        return toResponse(partner);
    }

    @Override
    public PartnerResponse updateMyPartner(Long employerId, PartnerUpdateRequest request) {
        Partner partner = partnerRepository.findByEmployerId(employerId)
                .orElseThrow(() -> new IllegalStateException("Partner profile not found."));

        partner.setCompanyName(request.getCompanyName());
        partner.setIndustry(request.getIndustry());
        partner.setCompanyEmail(request.getCompanyEmail());
        partner.setPhone(request.getPhone());
        partner.setAddress(request.getAddress());
        partner.setWebsite(request.getWebsite());
        partner.setDescription(request.getDescription());

        return toResponse(partner);
    }

    @Override
    public PartnerResponse updateStatus(Long partnerId, PartnerStatus status) {
        Partner partner = partnerRepository.findById(partnerId)
                .orElseThrow(() -> new IllegalStateException("Partner not found."));
        partner.setStatus(status);
        return toResponse(partner);
    }

    private PartnerResponse toResponse(Partner p) {
        PartnerResponse res = new PartnerResponse();
        res.setId(p.getId());
        res.setEmployerId(p.getEmployerId());
        res.setCompanyName(p.getCompanyName());
        res.setIndustry(p.getIndustry());
        res.setCompanyEmail(p.getCompanyEmail());
        res.setPhone(p.getPhone());
        res.setAddress(p.getAddress());
        res.setWebsite(p.getWebsite());
        res.setDescription(p.getDescription());
        res.setStatus(p.getStatus().name());
        res.setCreatedAt(p.getCreatedAt());
        res.setUpdatedAt(p.getUpdatedAt());
        return res;
    }
    @Override
    @Transactional(readOnly = true)
    public List<PartnerResponse> getAllPartners() {
        return partnerRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    @Override
    public void deleteMyPartner(Long employerId) {
        Partner partner = partnerRepository.findByEmployerId(employerId)
                .orElseThrow(() -> new IllegalStateException("Partner profile not found."));
        partnerRepository.delete(partner);
    }

    @Override
    public void adminDeletePartner(Long partnerId) {
        Partner partner = partnerRepository.findById(partnerId)
                .orElseThrow(() -> new IllegalStateException("Partner not found."));
        partnerRepository.delete(partner);
    }
    @Override
    @Transactional(readOnly = true)
    public PartnerResponse getPartnerById(Long partnerId) {
        Partner partner = partnerRepository.findById(partnerId)
                .orElseThrow(() -> new IllegalStateException("Partner not found."));
        return toResponse(partner);
    }

}
