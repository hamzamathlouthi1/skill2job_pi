package tn.esprit.gestionpartner.services;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.gestionpartner.dto.JwtResponse;
import tn.esprit.gestionpartner.dto.LoginRequest;
import tn.esprit.gestionpartner.dto.RegisterRequest;
import tn.esprit.gestionpartner.entities.ERole;
import tn.esprit.gestionpartner.entities.Role;
import tn.esprit.gestionpartner.entities.User;
import tn.esprit.gestionpartner.repositories.RoleRepository;
import tn.esprit.gestionpartner.repositories.UserRepository;
import tn.esprit.gestionpartner.security.JwtTokenProvider;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    // ──────────────────────────────────────
    // LOGIN
    // ──────────────────────────────────────
    public JwtResponse login(LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.generateToken(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return new JwtResponse(token, "Bearer", userDetails.getUsername(), roles);
    }

    // ──────────────────────────────────────
    // REGISTER (SECURISÉ)
    // ──────────────────────────────────────
    @Transactional
    public String register(RegisterRequest request) {

        if (request == null) throw new RuntimeException("Request vide.");
        if (request.getUsername() == null || request.getUsername().trim().length() < 3)
            throw new RuntimeException("Username invalide (min 3 caractères).");
        if (request.getEmail() == null || request.getEmail().trim().isEmpty())
            throw new RuntimeException("Email obligatoire.");
        if (request.getPassword() == null || request.getPassword().length() < 8)
            throw new RuntimeException("Mot de passe min 8 caractères.");

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Ce nom d'utilisateur est déjà pris.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email est déjà utilisé.");
        }

        Role learnerRole = roleRepository.findByName(ERole.ROLE_LEARNER)
                .orElseThrow(() -> new RuntimeException("ROLE_LEARNER introuvable en BDD."));

        Set<Role> roles = new HashSet<>();
        roles.add(learnerRole);

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(roles);

        userRepository.save(user);

        return "Utilisateur '" + user.getUsername() + "' enregistré avec succès !";
    }
}