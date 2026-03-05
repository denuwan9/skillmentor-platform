package com.stemlink.skillmentor.controllers;

import com.stemlink.skillmentor.dto.ErrorResponse;
import com.stemlink.skillmentor.exceptions.SkillMentorException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Slf4j
public class AbstractController {

    // reusable methods and logic
    protected <T> ResponseEntity<T> sendOkResponse(T response) {
        return ResponseEntity.ok(response);
    }

    protected <T> ResponseEntity<T> sendCreatedResponse(T response) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    protected <T> ResponseEntity<T> sendNotFoundResponse() {
        return ResponseEntity.notFound().build();
    }

    protected <T> ResponseEntity<T> sendNoContentResponse() {
        return ResponseEntity.noContent().build();
    }

    // handle error messages

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            org.springframework.security.access.AccessDeniedException ex) {
        System.err.println("CRITICAL: Access Denied Exception Triggered: " + ex.getMessage());
        log.error("Access denied: {}", ex.getMessage());
        ErrorResponse errorResponse = ErrorResponse.builder()
                .message("Access Denied: You do not have permission to perform this action.")
                .errorCode("FORBIDDEN")
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            org.springframework.security.core.AuthenticationException ex) {
        System.err.println("CRITICAL: Authentication Exception Triggered: " + ex.getMessage());
        log.error("Authentication error: {}", ex.getMessage());
        ErrorResponse errorResponse = ErrorResponse.builder()
                .message("Authentication Failed: Please provide a valid token.")
                .errorCode("UNAUTHORIZED")
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    // common exceptions handling
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex) {
        System.err
                .println("CRITICAL: Generic Exception Triggered: " + ex.getClass().getName() + " - " + ex.getMessage());
        log.error("Unexpected error: ", ex);
        ErrorResponse errorResponse = ErrorResponse.builder()
                .message("An unexpected error occurred: "
                        + (ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName()))
                .errorCode("INTERNAL SERVER ERROR")
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Handles Custom SkillMentor Exceptions
    @ExceptionHandler(SkillMentorException.class)
    public ResponseEntity<ErrorResponse> handleSkillMentorException(
            SkillMentorException ex) {
        System.err
                .println("CRITICAL: SkillMentorException Triggered: " + ex.getMessage() + " Status: " + ex.getStatus());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .message(ex.getMessage())
                .errorCode(ex.getStatus().toString())
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .build();

        return new ResponseEntity<>(errorResponse, ex.getStatus());
    }

    // Validation Exception
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });

        ErrorResponse errorResponse = ErrorResponse.builder()
                .message("Validation failed")
                .errorCode("BAD REQUEST")
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .validationErrors(errors)
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
}
