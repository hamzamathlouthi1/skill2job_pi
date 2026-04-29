package tn.esprit.gestionuser.controllers;

import tn.esprit.gestionuser.dto.UpdateUserRequest;
import tn.esprit.gestionuser.dto.UserDTO;
import tn.esprit.gestionuser.entities.User;
import tn.esprit.gestionuser.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ──────────────────────────────────────
    //  DASHBOARDS
    // ──────────────────────────────────────
    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> adminDashboard() {
        return ResponseEntity.ok("Bienvenue Admin !");
    }

    @GetMapping("/trainer/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<String> trainerDashboard() {
        return ResponseEntity.ok("Bienvenue Trainer !");
    }

    @GetMapping("/learner/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'LEARNER')")
    public ResponseEntity<String> learnerDashboard() {
        return ResponseEntity.ok("Bienvenue Learner !");
    }

    @GetMapping("/partner/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'PARTNER')")
    public ResponseEntity<String> partnerDashboard() {
        return ResponseEntity.ok("Bienvenue Partner !");
    }

    // ──────────────────────────────────────
    //  READ ALL (Admin seulement)
    // ──────────────────────────────────────
    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ──────────────────────────────────────
    //  READ ONE (Admin seulement)
    // ──────────────────────────────────────
    @GetMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/admin/users/by-username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    // ──────────────────────────────────────
    //  UPDATE (Admin seulement)
    // ──────────────────────────────────────
    @PutMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Long id,
                                           @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    // ──────────────────────────────────────
    //  DELETE (Admin seulement)
    // ──────────────────────────────────────
    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Utilisateur supprimé avec succès !");
    }

    // ══════════════════════════════════════════════════════════════════
    //  ENDPOINTS INTERNES — réservés aux appels inter-microservices
    //  (GestionPartner, GestionFormation, GestionExams → GestionUser)
    //
    //  Ces endpoints sont accessibles SANS token car ils sont protégés
    //  côté réseau (Docker internal network) et non exposés au public.
    //  Ils retournent un UserDTO (Set<String> pour les rôles) au lieu
    //  de l'entité User brute, pour éviter les problèmes de sérialisation.
    // ══════════════════════════════════════════════════════════════════

    /**
     * Récupère un UserDTO par ID — utilisé par GestionPartner (Feign).
     * Pas de @PreAuthorize car appelé sans token depuis les microservices.
     */
    @GetMapping("/internal/users/{id}")
    public ResponseEntity<UserDTO> getUserByIdInternal(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(toDTO(user));
    }

    /**
     * Récupère un UserDTO par username — utilisé par GestionPartner (Feign).
     * Pas de @PreAuthorize car appelé sans token depuis les microservices.
     */
    @GetMapping("/internal/users/by-username/{username}")
    public ResponseEntity<UserDTO> getUserByUsernameInternal(@PathVariable String username) {
        User user = userService.getUserByUsername(username);
        return ResponseEntity.ok(toDTO(user));
    }

    // ──────────────────────────────────────
    //  HELPER
    // ──────────────────────────────────────
    private UserDTO toDTO(User user) {
        return new UserDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRoles().stream()
                .map(role -> role.getName().name())   // ex: "ROLE_PARTNER"
                .collect(Collectors.toSet())
        );
    }
    // ================= INTERNAL ROLE UPDATE =================
@PutMapping("/internal/users/{id}/role")
public ResponseEntity<UserDTO> updateUserRoleInternal(
        @PathVariable Long id,
        @RequestBody java.util.Set<String> roles
) {
    UpdateUserRequest req = new UpdateUserRequest();
    req.setRoles(roles);

    User updated = userService.updateUser(id, req);
    return ResponseEntity.ok(toDTO(updated));
}
}