package tn.esprit.gestionpartner.services;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.gestionpartner.dto.NotificationResponse;
import tn.esprit.gestionpartner.entities.Notification;
import tn.esprit.gestionpartner.entities.NotificationType;
import tn.esprit.gestionpartner.entities.User;
import tn.esprit.gestionpartner.repositories.NotificationRepository;
import tn.esprit.gestionpartner.repositories.UserRepository;

import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void push(User receiver, NotificationType type, String message, String link) {
        Notification n = new Notification();
        n.setUser(receiver);
        n.setType(type);
        n.setMessage(message);
        n.setLink(link);
        n.setRead(false);
        notificationRepository.save(n);
    }

    public List<NotificationResponse> myNotifications() {
        User me = getCurrentUser();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(me.getId())
                .stream()
                .map(n -> new NotificationResponse(
                        n.getId(),
                        n.getType(),
                        n.getMessage(),
                        n.getLink(),
                        n.isRead(),
                        n.getCreatedAt()
                ))
                .toList();
    }

    public Map<String, Long> unreadCount() {
        User me = getCurrentUser();
        long c = notificationRepository.countByUserIdAndReadFalse(me.getId());
        return Map.of("unread", c);
    }

    @Transactional
    public void markRead(Long id) {
        User me = getCurrentUser();
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        if (n.getUser() == null || !n.getUser().getId().equals(me.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllRead() {
        User me = getCurrentUser();
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(me.getId());
        for (Notification n : list) n.setRead(true);
        notificationRepository.saveAll(list);
    }

    @Transactional
    public String deleteMyNotification(Long id) {
        User me = getCurrentUser();

        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (n.getUser() == null || !n.getUser().getId().equals(me.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }

        notificationRepository.delete(n);
        return "Notification deleted";
    }

    // ✅ NEW: clear all my notifications
    @Transactional
    public String clearAllMyNotifications() {
        User me = getCurrentUser();
        notificationRepository.deleteByUserId(me.getId());
        return "All notifications cleared";
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated.");
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
    }
}