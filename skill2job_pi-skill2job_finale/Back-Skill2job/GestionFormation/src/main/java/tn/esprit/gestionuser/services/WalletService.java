package tn.esprit.gestionuser.services;

import tn.esprit.gestionuser.clients.UserClient;
import tn.esprit.gestionuser.dto.UserDTO;
import tn.esprit.gestionuser.entities.SpinHistory;
import tn.esprit.gestionuser.entities.Wallet;
import tn.esprit.gestionuser.entities.WalletTransaction;
import tn.esprit.gestionuser.entities.WalletTransaction.TransactionType;
import tn.esprit.gestionuser.repositories.SpinHistoryRepository;
import tn.esprit.gestionuser.repositories.WalletRepository;
import tn.esprit.gestionuser.repositories.WalletTransactionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;
    private final UserClient userClient;
    private final SpinHistoryRepository spinHistoryRepository;

    // ─── resolve user, with clear error messages ──────────────────────────────
    private UserDTO resolveUserByUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new RuntimeException("Username is missing from authentication context");
        }
        try {
            UserDTO user = userClient.getUserByUsername(username);
            if (user == null || user.getId() == null) {
                throw new RuntimeException("User not found for username: " + username);
            }
            return user;
        } catch (RuntimeException e) {
            throw e; // re-throw our own exceptions as-is
        } catch (Exception e) {
            log.error("Feign call to user-service failed for username '{}': {}", username, e.getMessage());
            throw new RuntimeException(
                "Could not reach user-service to resolve username '" + username + "'. " +
                "Ensure gestionuser is registered in Eureka. Cause: " + e.getMessage(), e
            );
        }
    }

    // ─── get or auto-create wallet ────────────────────────────────────────────
    @Transactional
    public Wallet getOrCreateWallet(Long userId) {
        return walletRepository.findByUserId(userId)
            .orElseGet(() -> {
                log.info("No wallet found for userId={}, creating one with welcome bonus.", userId);
                Wallet wallet = new Wallet();
                wallet.setUserId(userId);
                wallet.setBalance(50.0);
                wallet.setCurrency("USD");
                Wallet saved = walletRepository.save(wallet);

                WalletTransaction bonus = new WalletTransaction();
                bonus.setWalletId(saved.getId());
                bonus.setUserId(userId);
                bonus.setType(TransactionType.WELCOME_BONUS);
                bonus.setAmount(50.0);
                bonus.setDescription("Welcome bonus — 50 free credits");
                transactionRepository.save(bonus);

                return saved;
            });
    }

    @Transactional
    public Wallet getWalletByUsername(String username) {
        UserDTO user = resolveUserByUsername(username);
        return getOrCreateWallet(user.getId());
    }

    // ─── kept for backward compat ─────────────────────────────────────────────
    @Transactional
    public Wallet createWallet(String username) {
        return getWalletByUsername(username);
    }

    // ─── debit ────────────────────────────────────────────────────────────────
    @Transactional
    public void debit(String username, Double amount, String description) {
        if (amount == null || amount <= 0) throw new RuntimeException("Debit amount must be > 0");

        Wallet wallet = getWalletByUsername(username);
        if (wallet.getBalance() < amount) throw new RuntimeException("Insufficient balance");

        wallet.setBalance(wallet.getBalance() - amount);
        walletRepository.save(wallet);

        WalletTransaction tx = new WalletTransaction();
        tx.setWalletId(wallet.getId());
        tx.setUserId(wallet.getUserId());
        tx.setType(TransactionType.DEBIT);
        tx.setAmount(amount);
        tx.setDescription(description);
        transactionRepository.save(tx);
    }

    // ─── credit ───────────────────────────────────────────────────────────────
    @Transactional
    public void credit(String username, Double amount, String description, TransactionType type) {
        if (amount == null || amount <= 0) throw new RuntimeException("Credit amount must be > 0");

        Wallet wallet = getWalletByUsername(username);
        wallet.setBalance(wallet.getBalance() + amount);
        walletRepository.save(wallet);

        WalletTransaction tx = new WalletTransaction();
        tx.setWalletId(wallet.getId());
        tx.setUserId(wallet.getUserId());
        tx.setType(type);
        tx.setAmount(amount);
        tx.setDescription(description);
        transactionRepository.save(tx);
    }

    // ─── read-only queries ────────────────────────────────────────────────────
    public Double getBalance(String username) {
        return getWalletByUsername(username).getBalance();
    }

    public List<WalletTransaction> getTransactions(String username) {
        UserDTO user = resolveUserByUsername(username);
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    // ─── spin wheel ───────────────────────────────────────────────────────────
    @Transactional
    public Integer spinWheel(String username) {
        UserDTO user = resolveUserByUsername(username);
        LocalDate today = LocalDate.now();

        if (spinHistoryRepository.existsByUserIdAndSpinDate(user.getId(), today)) {
            throw new RuntimeException("Already spun today. Come back tomorrow!");
        }

        int[] possiblePoints = {5, 10, 15, 20, 25, 50, 100};
        int pointsWon = possiblePoints[new Random().nextInt(possiblePoints.length)];

        credit(username, (double) pointsWon, "Daily spin wheel reward", TransactionType.CREDIT);

        SpinHistory spin = new SpinHistory();
        spin.setUserId(user.getId());
        spin.setSpinDate(today);
        spin.setPointsWon(pointsWon);
        spinHistoryRepository.save(spin);

        return pointsWon;
    }

    public boolean canSpinToday(String username) {
        UserDTO user = resolveUserByUsername(username);
        return !spinHistoryRepository.existsByUserIdAndSpinDate(user.getId(), LocalDate.now());
    }

    public List<SpinHistory> getSpinHistory(String username) {
        UserDTO user = resolveUserByUsername(username);
        return spinHistoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }
}