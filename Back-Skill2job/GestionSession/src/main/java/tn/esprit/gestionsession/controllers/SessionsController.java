package tn.esprit.gestionsession.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import tn.esprit.gestionsession.entities.Sessions;
import tn.esprit.gestionsession.entities.User;
import tn.esprit.gestionsession.repositories.UserRepository;
import tn.esprit.gestionsession.services.interfaces.SessionsInterface;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionsController {

    private final SessionsInterface sessionsService;
    private final UserRepository userRepository;

    @Autowired
    public SessionsController(SessionsInterface sessionsService,
                              UserRepository userRepository) {
        this.sessionsService = sessionsService;
        this.userRepository = userRepository;
    }

    @GetMapping("/test")
    public String test() {
        return "WORKING";
    }

    @PostMapping("/add")
    public Sessions add(@RequestBody Sessions session) {
        return sessionsService.addSession(session);
    }

    @GetMapping("/all")
    public List<Sessions> getAllSessions() {
        return sessionsService.getSessions();
    }

    @DeleteMapping("/delete/{id}")
    public void deleteSession(@PathVariable Long id) {
        sessionsService.removeSession(id);
    }

    @PutMapping("/update/{id}")
    public void updateSession(@RequestBody Sessions session, @PathVariable Long id) {
        sessionsService.updateSession(session, id);
    }

    @GetMapping("/{id}")
    public Sessions getSessionById(@PathVariable Long id) {
        return sessionsService.getSessionById(id);
    }
    @PostMapping("/{id}/join")
    @PreAuthorize("hasRole('LEARNER')")
    public Sessions joinSession(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        System.out.println("🔴 username from token: " + username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        System.out.println("🔴 resolved user id: " + user.getId());

        return sessionsService.joinSession(id, user.getId());
    }
    @PostMapping("/{id}/leave")
    @PreAuthorize("hasRole('LEARNER')")
    public Sessions leaveSession(@PathVariable Long id) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return sessionsService.leaveSession(id, user.getId());
    }


}