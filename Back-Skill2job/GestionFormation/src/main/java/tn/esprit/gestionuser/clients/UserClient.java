package tn.esprit.gestionuser.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.gestionuser.dto.UserDTO;

@FeignClient(name = "gestionuser", url = "http://gestionuser:8089/api/admin/users")
public interface UserClient {

    @GetMapping("/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);

    @GetMapping("/by-username/{username}")
    UserDTO getUserByUsername(@PathVariable("username") String username);
}
