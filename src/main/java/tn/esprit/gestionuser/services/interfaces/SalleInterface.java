package tn.esprit.gestionuser.services.interfaces;



import tn.esprit.gestionuser.entities.Salle;

import java.util.List;

public interface SalleInterface {

    Salle addSalle(Salle salle);

    List<Salle> getAllSalles();

    Salle getSalleById(Long id);

    Salle updateSalle(Long id, Salle salle);

    void deleteSalle(Long id);
}
