package tn.esprit.gestionpartner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GestionPartnerApplication {
    public static void main(String[] args) {
        SpringApplication.run(GestionPartnerApplication.class, args);
    }
}