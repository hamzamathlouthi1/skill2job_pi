package tn.esprit.gestionsession.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.gestionsession.dto.UserDTO;

import java.util.List;

@FeignClient(name = "user-management-service", url = "http://user-management-service:8089/api")
public interface UserClient {

    @GetMapping("/admin/users/by-username/{username}")
    UserDTO getUserByUsername(@PathVariable("username") String username);

    @GetMapping("/admin/users/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);
}
