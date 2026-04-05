package tn.esprit.gestionpartner.services;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.gestionpartner.dto.UpdateUserRequest;
import tn.esprit.gestionpartner.entities.ERole;
import tn.esprit.gestionpartner.entities.Role;
import tn.esprit.gestionpartner.entities.User;
import tn.esprit.gestionpartner.repositories.RoleRepository;
import tn.esprit.gestionpartner.repositories.UserRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    // ✅ Constructeur manuel
    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ──────────────────────────────────────
    // READ ALL
    // ──────────────────────────────────────
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ──────────────────────────────────────
    // READ ONE
    // ──────────────────────────────────────
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'id : " + id));
    }

    // ──────────────────────────────────────
    // UPDATE
    // ──────────────────────────────────────
    @Transactional
    public User updateUser(Long id, UpdateUserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'id : " + id));

        if (request.getUsername() != null && !request.getUsername().isEmpty()) {
            if (!request.getUsername().equals(user.getUsername())
                    && userRepository.existsByUsername(request.getUsername())) {
                throw new RuntimeException("Ce username est déjà pris.");
            }
            user.setUsername(request.getUsername());
        }

        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            if (!request.getEmail().equals(user.getEmail())
                    && userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Cet email est déjà utilisé.");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            user.setRoles(resolveRoles(request.getRoles()));
        }

        return userRepository.save(user);
    }

    // ──────────────────────────────────────
    // DELETE
    // ──────────────────────────────────────
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur introuvable avec l'id : " + id);
        }
        userRepository.deleteById(id);
    }

    // ──────────────────────────────────────
    // HELPER
    // ──────────────────────────────────────
    private Set<Role> resolveRoles(Set<String> requestedRoles) {
        Set<Role> roles = new HashSet<>();

        for (String roleStr : requestedRoles) {
            switch (roleStr.toLowerCase()) {
                case "admin"   -> roles.add(findRole(ERole.ROLE_ADMIN));
                case "trainer" -> roles.add(findRole(ERole.ROLE_TRAINER));
                case "partner" -> roles.add(findRole(ERole.ROLE_PARTNER));
                case "learner" -> roles.add(findRole(ERole.ROLE_LEARNER));
                default -> throw new RuntimeException("Rôle inconnu : " + roleStr);
            }
        }
        return roles;
    }

    private Role findRole(ERole eRole) {
        return roleRepository.findByName(eRole)
                .orElseThrow(() -> new RuntimeException("Rôle introuvable : " + eRole));
    }
}