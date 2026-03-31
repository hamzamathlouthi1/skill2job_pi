package tn.esprit.gestionsession.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;


import lombok.Data;
import java.util.List;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;  // Add this field
    private String username;
    private String email;
    private List<String> roles;

    public JwtResponse(String token, String type, Long id, String username, String email, List<String> roles) {
        this.token = token;
        this.type = type;
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
    }
}