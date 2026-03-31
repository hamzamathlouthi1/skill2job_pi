package tn.esprit.gestionsession.config;

import tn.esprit.gestionsession.entities.ERole;
import tn.esprit.gestionsession.entities.Role;
import tn.esprit.gestionsession.repositories.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        for (ERole eRole : ERole.values()) {
            if (roleRepository.findByName(eRole).isEmpty()) {
                roleRepository.save(new Role(null, eRole));
                log.info("✅ Rôle inséré : {}", eRole);
            }
        }
    }
}