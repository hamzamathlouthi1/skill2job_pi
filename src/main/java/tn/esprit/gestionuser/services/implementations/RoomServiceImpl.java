package tn.esprit.gestionuser.services.implementations;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.gestionuser.entities.Room;
import tn.esprit.gestionuser.repositories.RoomRepository;
import tn.esprit.gestionuser.services.interfaces.RoomInterface;

import java.util.List;

@Service
public class RoomServiceImpl implements RoomInterface {
    @Autowired
    private RoomRepository roomRepository;

    @Override
    public List<Room> getRooms() {
        return roomRepository.findAll();
    }
}
