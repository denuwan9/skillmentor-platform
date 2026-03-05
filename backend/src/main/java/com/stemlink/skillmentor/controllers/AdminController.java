package com.stemlink.skillmentor.controllers;

import com.stemlink.skillmentor.entities.Session;
import com.stemlink.skillmentor.services.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController extends AbstractController {

    private final SessionService sessionService;

    @GetMapping("/bookings")
    public ResponseEntity<List<Session>> getAllBookings() {
        return sendOkResponse(sessionService.getAllSessions());
    }

    @PutMapping("/bookings/{id}/confirm-payment")
    public ResponseEntity<Session> confirmPayment(@PathVariable Long id) {
        Session updated = sessionService.confirmPayment(id);
        return sendOkResponse(updated);
    }

    @PutMapping("/bookings/{id}/complete")
    public ResponseEntity<Session> markComplete(@PathVariable Long id) {
        Session updated = sessionService.markComplete(id);
        return sendOkResponse(updated);
    }

    @PutMapping("/bookings/{id}/meeting-link")
    public ResponseEntity<Session> addMeetingLink(@PathVariable Long id, @RequestBody String meetingLink) {
        // Remove literal double quotes if present (sometimes sent by frontend
        // JSON.stringify)
        if (meetingLink != null && meetingLink.startsWith("\"") && meetingLink.endsWith("\"")) {
            meetingLink = meetingLink.substring(1, meetingLink.length() - 1);
        }
        Session updated = sessionService.updateMeetingLink(id, meetingLink);
        return sendOkResponse(updated);
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        sessionService.deleteSession(id);
        return sendNoContentResponse();
    }
}
