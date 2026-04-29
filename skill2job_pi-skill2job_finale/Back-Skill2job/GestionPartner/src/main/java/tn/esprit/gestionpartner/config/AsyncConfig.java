package tn.esprit.gestionpartner.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * ✅ Enables @Async for EmailService
 * Required so email sending is non-blocking and doesn't slow down API responses.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
    // Spring Boot auto-configures the ThreadPoolTaskExecutor from:
    // spring.task.execution.pool.core-size=2
    // spring.task.execution.pool.max-size=5
}
