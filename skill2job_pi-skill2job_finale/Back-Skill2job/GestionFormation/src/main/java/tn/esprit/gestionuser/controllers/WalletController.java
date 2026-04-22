package tn.esprit.gestionuser.controllers;

import tn.esprit.gestionuser.entities.SpinHistory;
import tn.esprit.gestionuser.entities.Wallet;
import tn.esprit.gestionuser.entities.WalletTransaction;
import tn.esprit.gestionuser.services.WalletService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    private String getUsername(Authentication auth) {
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            throw new RuntimeException("Unauthenticated — no username in security context");
        }
        return auth.getName();
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyAuthority('ROLE_LEARNER', 'ROLE_ADMIN')")
    public ResponseEntity<?> getMyWallet(Authentication auth) {
        try {
            Wallet wallet = walletService.getWalletByUsername(getUsername(auth));
            return ResponseEntity.ok(wallet);
        } catch (Exception e) {
            log.error("GET /wallet/me failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/balance")
    @PreAuthorize("hasAnyAuthority('ROLE_LEARNER', 'ROLE_ADMIN')")
    public ResponseEntity<?> getBalance(Authentication auth) {
        try {
            return ResponseEntity.ok(Map.of("balance", walletService.getBalance(getUsername(auth))));
        } catch (Exception e) {
            log.error("GET /wallet/balance failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasAnyAuthority('ROLE_LEARNER', 'ROLE_ADMIN')")
    public ResponseEntity<?> getTransactions(Authentication auth) {
        try {
            List<WalletTransaction> txs = walletService.getTransactions(getUsername(auth));
            return ResponseEntity.ok(txs);
        } catch (Exception e) {
            log.error("GET /wallet/transactions failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/can-spin")
    @PreAuthorize("hasAnyAuthority('ROLE_LEARNER', 'ROLE_ADMIN')")
    public ResponseEntity<?> canSpin(Authentication auth) {
        try {
            return ResponseEntity.ok(Map.of("canSpin", walletService.canSpinToday(getUsername(auth))));
        } catch (Exception e) {
            log.error("GET /wallet/can-spin failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/spin")
    @PreAuthorize("hasAnyAuthority('ROLE_LEARNER', 'ROLE_ADMIN')")
    public ResponseEntity<?> spinWheel(Authentication auth) {
        try {
            Integer pointsWon = walletService.spinWheel(getUsername(auth));
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "pointsWon", pointsWon,
                    "message", "You won " + pointsWon + " points!"));
        } catch (Exception e) {
            log.error("POST /wallet/spin failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/spin-history")
    @PreAuthorize("hasAnyAuthority('ROLE_LEARNER', 'ROLE_ADMIN')")
    public ResponseEntity<?> getSpinHistory(Authentication auth) {
        try {
            List<SpinHistory> history = walletService.getSpinHistory(getUsername(auth));
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            log.error("GET /wallet/spin-history failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/add-credit")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> addCredit(@RequestBody Map<String, Object> request) {
        try {
            String username = (String) request.get("username");
            Double amount = Double.valueOf(request.get("amount").toString());
            String description = (String) request.getOrDefault("description", "Credit added by admin");
            walletService.credit(username, amount, description, WalletTransaction.TransactionType.CREDIT);
            return ResponseEntity.ok(Map.of("message", "Credit added successfully"));
        } catch (Exception e) {
            log.error("POST /wallet/add-credit failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}