package com.smartlogix.bff.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bff/auth")
public class AuthDebugController {

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        Map<String, Object> response = new LinkedHashMap<>();

        response.put("autenticado", authentication != null && authentication.isAuthenticated());
        response.put("name", authentication != null ? authentication.getName() : null);
        response.put("authorities", authentication != null ? authentication.getAuthorities() : null);

        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            response.put("issuer", jwt.getIssuer() != null ? jwt.getIssuer().toString() : null);
            response.put("subject", jwt.getSubject());
            response.put("preferred_username", jwt.getClaimAsString("preferred_username"));
            response.put("realm_access", jwt.getClaim("realm_access"));
            response.put("resource_access", jwt.getClaim("resource_access"));
        }

        return response;
    }
}
