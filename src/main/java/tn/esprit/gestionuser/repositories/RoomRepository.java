package tn.esprit.gestionuser.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.gestionuser.entities.Room;

public interface RoomRepository extends JpaRepository<Room, Long> {
}
