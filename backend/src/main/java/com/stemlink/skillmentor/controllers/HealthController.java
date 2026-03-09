package com.stemlink.skillmentor.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Public health check endpoint.
 * Used by external cron jobs (e.g., cron-job.org) to keep the
 * Render free-tier instance warm and prevent cold starts.
 *
 * No authentication is required. Permitted in SecurityConfig via:
 * .requestMatchers("/api/v1/health").permitAll()
 */
@RestController
@RequestMapping("/api/v1")
public class HealthController {

    /**
     * GET /api/v1/health
     * Returns HTTP 200 OK with a simple status payload.
     * Ping this endpoint every 14 minutes to prevent Render spin-down.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "SkillMentor API"));
    }
}
