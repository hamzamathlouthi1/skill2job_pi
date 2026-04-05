package tn.esprit.gestionpartner.security;

import tn.esprit.gestionpartner.entities.Partner;
import tn.esprit.gestionpartner.entities.PartnerStatus;
import tn.esprit.gestionpartner.entities.User;
import tn.esprit.gestionpartner.repositories.PartnerRepository;
import tn.esprit.gestionpartner.repositories.UserRepository;

import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final PartnerRepository partnerRepository;

    // ✅ Constructeur manuel
    public UserDetailsServiceImpl(UserRepository userRepository, PartnerRepository partnerRepository) {
        this.userRepository = userRepository;
        this.partnerRepository = partnerRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Utilisateur introuvable : " + username)
                );

        // ✅ BLOQUER LOGIN si employer a un Partner SUSPENDED
        partnerRepository.findByEmployer_Id(user.getId()).ifPresent((Partner partner) -> {
            if (partner.getStatus() == PartnerStatus.SUSPENDED) {
                throw new DisabledException("Votre compte partenaire est suspendu. Connexion refusée.");
            }
        });

        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toList());

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                authorities
        );
    }
}