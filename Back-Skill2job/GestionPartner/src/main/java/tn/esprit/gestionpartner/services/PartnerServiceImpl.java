package tn.esprit.gestionpartner.services;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.gestionpartner.dto.PartnerCreateRequest;
import tn.esprit.gestionpartner.dto.PartnerResponse;
import tn.esprit.gestionpartner.dto.PartnerUpdateRequest;
import tn.esprit.gestionpartner.entities.*;
import tn.esprit.gestionpartner.repositories.PartnerRepository;
import tn.esprit.gestionpartner.repositories.RoleRepository;
import tn.esprit.gestionpartner.repositories.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PartnerServiceImpl implements PartnerService {

    private final PartnerRepository partnerRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public PartnerServiceImpl(PartnerRepository partnerRepository,
                              UserRepository userRepository,
                              RoleRepository roleRepository) {
        this.partnerRepository = partnerRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public PartnerResponse createMyPartner(String username, PartnerCreateRequest request) {

        User employer = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable : " + username));

        if (partnerRepository.existsByEmployer_Id(employer.getId())) {
            throw new IllegalStateException("Partner profile already exists for this employer.");
        }

        Partner partner = new Partner();
        partner.setEmployer(employer);
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
    public PartnerResponse getMyPartner(String username) {
        User employer = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable : " + username));

        Partner partner = partnerRepository.findByEmployer_Id(employer.getId())
                .orElseThrow(() -> new IllegalStateException("Partner profile not found."));

        return toResponse(partner);
    }

    @Override
    public PartnerResponse updateMyPartner(String username, PartnerUpdateRequest request) {
        User employer = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable : " + username));

        Partner partner = partnerRepository.findByEmployer_Id(employer.getId())
                .orElseThrow(() -> new IllegalStateException("Partner profile not found."));

        partner.setCompanyName(request.getCompanyName());
        partner.setIndustry(request.getIndustry());
        partner.setCompanyEmail(request.getCompanyEmail());
        partner.setPhone(request.getPhone());
        partner.setAddress(request.getAddress());
        partner.setWebsite(request.getWebsite());
        partner.setDescription(request.getDescription());

        Partner saved = partnerRepository.save(partner);
        return toResponse(saved);
    }

    @Override
    public void deleteMyPartner(String username) {
        User employer = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable : " + username));

        Partner partner = partnerRepository.findByEmployer_Id(employer.getId())
                .orElseThrow(() -> new IllegalStateException("Partner profile not found."));

        partnerRepository.delete(partner);
    }

    // ADMIN
    @Override
    public PartnerResponse updateStatus(Long partnerId, PartnerStatus status) {

        Partner partner = partnerRepository.findById(partnerId)
                .orElseThrow(() -> new IllegalStateException("Partner not found."));

        partner.setStatus(status);

        if (status == PartnerStatus.APPROVED) {

            User employer = partner.getEmployer();

            Role partnerRole = roleRepository.findByName(ERole.ROLE_PARTNER)
                    .orElseThrow(() -> new IllegalStateException("ROLE_PARTNER not found in DB"));

            employer.getRoles().clear();          // ✅ supprime tous les rôles
            employer.getRoles().add(partnerRole); // ✅ met فقط PARTNER

            userRepository.save(employer);
        }

        Partner saved = partnerRepository.save(partner);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PartnerResponse> getAllPartners() {
        return partnerRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void adminDeletePartner(Long partnerId) {

        Partner partner = partnerRepository.findById(partnerId)
                .orElseThrow(() -> new IllegalStateException("Partner not found."));

        // ✅ récupérer l’employer AVANT suppression
        User employer = partner.getEmployer();

        // ✅ 1) supprimer le partner (pour éviter contrainte FK)
        partnerRepository.delete(partner);
        partnerRepository.flush(); // ✅ important

        // ✅ 2) supprimer le user qui a créé ce partner
        if (employer != null) {
            userRepository.deleteById(employer.getId());
            userRepository.flush();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PartnerResponse getPartnerById(Long partnerId) {
        Partner partner = partnerRepository.findById(partnerId)
                .orElseThrow(() -> new IllegalStateException("Partner not found."));
        return toResponse(partner);
    }

    private PartnerResponse toResponse(Partner p) {
        PartnerResponse res = new PartnerResponse();
        res.setId(p.getId());
        res.setEmployerId(p.getEmployer() != null ? p.getEmployer().getId() : null);
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
}