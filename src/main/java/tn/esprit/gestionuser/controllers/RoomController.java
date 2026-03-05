package tn.esprit.gestionuser.controllers;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.esprit.gestionuser.entities.Room;
import tn.esprit.gestionuser.services.interfaces.RoomInterface;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin("*")
public class RoomController {
    @Autowired
    private RoomInterface roomService;

    @GetMapping("/all")
    public List<Room> getAll() {
        return roomService.getRooms();
    }
}
