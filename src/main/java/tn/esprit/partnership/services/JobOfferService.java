package tn.esprit.partnership.services;

import tn.esprit.partnership.dto.JobOfferCreateRequest;
import tn.esprit.partnership.dto.JobOfferResponse;
import tn.esprit.partnership.dto.JobOfferUpdateRequest;
import tn.esprit.partnership.entities.OfferStatus;

import java.util.List;

public interface JobOfferService {
    JobOfferResponse create(JobOfferCreateRequest request);
    JobOfferResponse update(Long offerId, JobOfferUpdateRequest request);
    JobOfferResponse getById(Long offerId);
    List<JobOfferResponse> listAll();
    List<JobOfferResponse> listByPartner(Long partnerId);
    void delete(Long offerId);
    JobOfferResponse updateStatus(Long offerId, OfferStatus status);
}
