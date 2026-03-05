package tn.esprit.gestionuser.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.gestionuser.entities.Bloc;
import tn.esprit.gestionuser.repositories.BlocRepository;
import tn.esprit.gestionuser.services.interfaces.BlocInterface;

import java.util.List;

@RestController
@RequestMapping("/api/blocs")
@CrossOrigin("*")
public class BlocController {

    private final BlocInterface blocInterface;

    public BlocController(BlocInterface blocInterface) {
        this.blocInterface = blocInterface;
    }

    @PostMapping("/add")
    public Bloc add(@RequestBody Bloc bloc) {
        return blocInterface.addBloc(bloc);
    }

    @GetMapping("/all")
    public List<Bloc> getAll() {
        return blocInterface.getAllBloc();
    }

    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable Long id) {
        blocInterface.deleteBloc(id);
    }

    @PutMapping("/update/{id}")
    public Bloc update(@RequestBody Bloc bloc, @PathVariable Long id) {
        return blocInterface.updateBloc(id, bloc);
    }
}