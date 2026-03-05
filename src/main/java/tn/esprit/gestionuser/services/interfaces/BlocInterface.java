package tn.esprit.gestionuser.services.interfaces;

import tn.esprit.gestionuser.entities.Bloc;

import java.util.List;

public interface BlocInterface {
    public Bloc addBloc(Bloc b);


    Bloc updateBloc(long id, Bloc b);

    public void deleteBloc(long id);
    public List<Bloc> getAllBloc();
}
