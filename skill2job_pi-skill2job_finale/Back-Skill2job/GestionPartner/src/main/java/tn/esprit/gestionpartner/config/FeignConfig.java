package tn.esprit.gestionpartner.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Configuration Feign pour la propagation du token JWT.
 *
 * PROBLÈME résolu : quand GestionPartner appelle GestionUser via Feign
 * pour des endpoints protégés (ex: PUT /api/admin/users/{id}),
 * GestionUser reçoit la requête sans token → 403 Forbidden.
 *
 * SOLUTION : ce RequestInterceptor injecte automatiquement le header
 * "Authorization: Bearer <token>" dans TOUS les appels Feign sortants,
 * en reprenant le token de la requête HTTP entrante.
 *
 * Cela permet à GestionUser de reconnaître l'appelant comme un admin authentifié.
 */
@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor requestTokenBearerInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                ServletRequestAttributes requestAttributes =
                        (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

                if (requestAttributes != null) {
                    String authorizationHeader =
                            requestAttributes.getRequest().getHeader("Authorization");

                    if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                        template.header("Authorization", authorizationHeader);
                    }
                }
            }
        };
    }
}