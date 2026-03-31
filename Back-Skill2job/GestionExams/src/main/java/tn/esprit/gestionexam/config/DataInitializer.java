package tn.esprit.gestionexam.config;

import tn.esprit.gestionexam.entities.ERole;
import tn.esprit.gestionexam.entities.Role;
import tn.esprit.gestionexam.repositories.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component  // Only this annotation, NO @Entity
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final RoleRepository roleRepository;



    public DataInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) {
        for (ERole eRole : ERole.values()) {
            if (roleRepository.findByName(eRole).isEmpty()) {
                Role role = new Role();
                role.setName(eRole);
                roleRepository.save(role);
                log.info("✅ Rôle inséré : {}", eRole);
            }
        }
    }
}