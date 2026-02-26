package tn.esprit.gestionuser.config;

import tn.esprit.gestionuser.security.JwtAuthenticationFilter;
import tn.esprit.gestionuser.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final UserDetailsServiceImpl userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints - No authentication required
                        .requestMatchers("/api/auth/**").permitAll()

                        // EXAM ENDPOINTS - Make them public for testing (you can secure them later)
                        .requestMatchers("/api/exams/**").permitAll()
                        .requestMatchers("/api/exams/exams/**").permitAll()
                        .requestMatchers("/api/exams/questions/**").permitAll()
                        .requestMatchers("/api/exams/evaluations/**").permitAll()
                        .requestMatchers("/api/exams/certificates/**").permitAll()

                        // Alternative: If your ExamController is mapped directly
                        .requestMatchers("/api/exams").permitAll()
                        .requestMatchers("/api/exams/*").permitAll()
                        .requestMatchers("/api/exams/*/questions").permitAll()
                        .requestMatchers("/api/users/*/evaluations").permitAll()
                        .requestMatchers("/api/users/*/certificates").permitAll()

                        // Admin endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Trainer endpoints
                        .requestMatchers("/api/trainer/**").hasAnyRole("ADMIN", "TRAINER")

                        // Learner endpoints
                        .requestMatchers("/api/learner/**").hasAnyRole("ADMIN", "TRAINER", "LEARNER")

                        // Partner endpoints
                        .requestMatchers("/api/partner/**").hasAnyRole("ADMIN", "PARTNER")

                        // Any other request requires authentication
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}