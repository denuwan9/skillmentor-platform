package com.stemlink.skillmentor.services;

import com.stemlink.skillmentor.dto.SessionDTO;
import com.stemlink.skillmentor.entities.Session;
import com.stemlink.skillmentor.security.UserPrincipal;

import java.util.List;

public interface SessionService {

    Session createNewSession(SessionDTO sessionDTO);

    List<Session> getAllSessions();

    Session getSessionById(Long id);

    Session updateSessionById(Long id, SessionDTO updatedSessionDTO);

    void deleteSession(Long id);

    // dedicated update methods for admin
    Session confirmPayment(Long id);

    Session markComplete(Long id);

    Session updateMeetingLink(Long id, String meetingLink);

    // Frontend enrollment flow — student is resolved from the Clerk JWT
    Session enrollSession(UserPrincipal userPrincipal, SessionDTO sessionDTO);

    List<Session> getSessionsByStudentEmail(String email);

    Session submitReview(Long sessionId, Integer rating, String review);
}
