package com.stemlink.skillmentor.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Public health-check endpoint used to keep the Render free-tier
 * instance alive. Cron-job.org (or any external pinger) hits
 * GET /api/v1/health every 14 minutes so the dyno never idles.
 */
@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    /**
     * Returns HTTP 200 OK with a small JSON payload.
     * No authentication is required (see SecurityConfig).
     */
    @GetMapping
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "SkillMentor API"));
    }
}
