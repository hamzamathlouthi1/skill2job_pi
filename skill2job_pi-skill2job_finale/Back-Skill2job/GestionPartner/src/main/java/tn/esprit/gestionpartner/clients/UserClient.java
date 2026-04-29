package tn.esprit.gestionpartner.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import tn.esprit.gestionpartner.config.FeignConfig;
import tn.esprit.gestionpartner.dto.UpdateUserRequest;
import tn.esprit.gestionpartner.dto.UserDTO;

import java.util.Set;

@FeignClient(
    name = "gestionuser",
    configuration = FeignConfig.class
)
public interface UserClient {

    @GetMapping("/api/internal/users/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);

    @GetMapping("/api/internal/users/by-username/{username}")
    UserDTO getUserByUsername(@PathVariable("username") String username);

    // ✅ NEW (IMPORTANT)
    @PutMapping("/api/internal/users/{id}/role")
    void updateUserRole(
            @PathVariable("id") Long id,
            @RequestBody Set<String> roles
    );

    // (optionnel, tu peux garder)
    @PutMapping("/api/admin/users/{id}")
    UserDTO updateUser(@PathVariable("id") Long id, @RequestBody UpdateUserRequest request);

    @DeleteMapping("/api/admin/users/{id}")
    void deleteUser(@PathVariable("id") Long id);
}