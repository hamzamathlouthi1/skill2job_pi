package tn.esprit.gestionuser.controllers;

import tn.esprit.gestionuser.dto.UpdateUserRequest;
import tn.esprit.gestionuser.entities.User;
import tn.esprit.gestionuser.repositories.UserRepository;
import tn.esprit.gestionuser.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

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

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Long id,
                                           @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Utilisateur supprimé avec succès !");
    }

    // ✅ CORRIGÉ : TRAINER peut aussi accéder à cet endpoint
    @GetMapping("/users/trainers")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<List<Map<String, Object>>> getAllTrainers() {
        List<User> trainers = userRepository.findAllTrainers();
        List<Map<String, Object>> result = trainers.stream()
                .map(u -> Map.<String, Object>of(
                        "id",       u.getId(),
                        "username", u.getUsername(),
                        "email",    u.getEmail()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}