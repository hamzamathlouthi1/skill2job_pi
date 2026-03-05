package tn.esprit.gestionuser.repositories;

import tn.esprit.gestionuser.entities.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
}
