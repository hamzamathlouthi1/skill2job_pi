package tn.esprit.gestionuser.services.implementations;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tn.esprit.gestionuser.entities.*;
import tn.esprit.gestionuser.repositories.*;
import tn.esprit.gestionuser.services.interfaces.SessionsInterface;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@Service
public class SessionsServiceImpl implements SessionsInterface {

    private final SessionsRepository sessionsRepository;
    private final EquipmentRepository equipmentRepository;
    private final SessionEquipmentRepository sessionEquipmentRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final RoomRepository roomRepository;

    @Autowired
    public SessionsServiceImpl(
            SessionsRepository sessionsRepository,
            EquipmentRepository equipmentRepository,
            SessionEquipmentRepository sessionEquipmentRepository,
            UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate,
            RoomRepository roomRepository
    ) {
        this.sessionsRepository = sessionsRepository;
        this.equipmentRepository = equipmentRepository;
        this.sessionEquipmentRepository = sessionEquipmentRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
        this.roomRepository = roomRepository;

    }

    @Override
    @Transactional
    public Sessions addSession(Sessions session) {

        LocalDateTime start = session.getStartAt();
        LocalDateTime end   = session.getEndAt();

        long minutes = java.time.Duration.between(start, end).toMinutes();

        if (minutes <= 0 || minutes > 120) {
            throw new RuntimeException("Session cannot exceed 2 hours");
        }

        if (session.getType() == SessionType.ONLINE) {

            Room room = new Room();
            room.setRoomCode(UUID.randomUUID().toString());
            room.setMeetingLink("http://localhost:4200/live/" + room.getRoomCode());
            room.setStartAt(start);
            room.setEndAt(end);

            // SAVE ROOM FIRST ✅
            roomRepository.save(room);

            room.setSession(session);
            session.setRoom(room);
        }

        if (session.getType() == SessionType.ONSITE) {
            if (session.getSalle() == null) {
                throw new RuntimeException("OFFLINE session must have a salle");
            }

            LocalDateTime startWithBuffer = start.minusHours(1);
            LocalDateTime endWithBuffer   = end.plusHours(1);

            boolean salleBusy = sessionsRepository.existsSalleConflictWithBuffer(
                    session.getSalle().getId(), startWithBuffer, endWithBuffer);

            if (salleBusy) {
                throw new RuntimeException("Salle requires 1 hour buffer between sessions");
            }

            if (session.getSessionEquipments() != null) {
                for (SessionEquipment se : session.getSessionEquipments()) {

                    Equipment equipment = equipmentRepository.findById(se.getEquipment().getId())
                            .orElseThrow(() -> new RuntimeException("Equipment not found"));

                    Integer reserved = sessionEquipmentRepository.sumReservedEquipment(
                            equipment.getId(), start, end);

                    int available = equipment.getQuantity() - reserved;

                    if (se.getQuantityUsed() > available) {
                        throw new RuntimeException(
                                equipment.getName() + " only " + available + " available during this time"
                        );
                    }

                    se.setSession(session);
                }
            }
        }

        return sessionsRepository.save(session);
    }

    @Override
    public void removeSession(Long id) {
        sessionsRepository.deleteById(id);
    }

    @Override
    public void updateSession(Sessions updatedSession, Long id) {
        Sessions existing = sessionsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        existing.setStartAt(updatedSession.getStartAt());
        existing.setEndAt(updatedSession.getEndAt());

        if (existing.getRoom() != null) {
            existing.getRoom().setStartAt(updatedSession.getStartAt());
            existing.getRoom().setEndAt(updatedSession.getEndAt());
        }

        sessionsRepository.save(existing);
    }

    @Override
    public List<Sessions> getSessions() {
        return sessionsRepository.findAllWithRoomAndSalle();
    }

    // ✅ FIXED - uses native INSERT + countParticipant to bypass Hibernate cache
    @Override
    @Transactional
    public Sessions joinSession(Long sessionId, Long userId) {

        boolean alreadyJoined = sessionsRepository.countParticipant(sessionId, userId) > 0;

        if (alreadyJoined) {
            return sessionsRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found"));
        }

        sessionsRepository.addParticipant(sessionId, userId);

        return sessionsRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
    }

    // ✅ FIXED - uses native DELETE + countParticipant to bypass Hibernate cache
    @Override
    @Transactional
    public Sessions leaveSession(Long sessionId, Long userId) {

        boolean isJoined = sessionsRepository.countParticipant(sessionId, userId) > 0;

        if (!isJoined) {
            throw new RuntimeException("User is not in this session");
        }

        sessionsRepository.removeParticipant(sessionId, userId);

        Sessions session = sessionsRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (session.getRoom() != null) {
            messagingTemplate.convertAndSend(
                    "/topic/room/" + session.getRoom().getRoomCode(),
                    java.util.Map.of(
                            "type", "LEAVE",
                            "username", userRepository.findById(userId)
                                    .map(User::getUsername)
                                    .orElse("unknown")
                    )
            );
        }

        return session;
    }

    @Override
    public Sessions getSessionById(Long id) {
        return sessionsRepository.findByIdWithRoom(id);
    }
}