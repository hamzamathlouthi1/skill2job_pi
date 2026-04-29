package tn.esprit.gestionuser.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/**
 * DTO retourné par les endpoints /internal/ de UserController.
 *
 * Contrairement à l'entité User (qui expose Set<Role> avec des objets complexes),
 * ce DTO retourne les rôles sous forme de Set<String> (ex: "ROLE_PARTNER")
 * ce qui correspond exactement à ce qu'attend GestionPartner dans son propre UserDTO.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private Set<String> roles;
}