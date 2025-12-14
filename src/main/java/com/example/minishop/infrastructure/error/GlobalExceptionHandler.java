package com.example.minishop.infrastructure.error;

import com.example.minishop.infrastructure.exception.AccessDeniedException;
import com.example.minishop.infrastructure.exception.DatabaseConstraintException;
import com.example.minishop.infrastructure.exception.NameConflictException;
import com.example.minishop.infrastructure.exception.NotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> notFound(NotFoundException ex, HttpServletRequest req) {
        return body(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND, ex.getMessage(), req, null);
    }

    @ExceptionHandler({NameConflictException.class})
    public ResponseEntity<ApiError> conflict(RuntimeException ex, HttpServletRequest req) {
        return body(HttpStatus.CONFLICT, ErrorCode.NAME_CONFLICT, ex.getMessage(), req, null);
    }

    @ExceptionHandler({IllegalArgumentException.class, HttpMessageNotReadableException.class})
    public ResponseEntity<ApiError> badRequest(RuntimeException ex, HttpServletRequest req) {
        return body(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED, ex.getMessage(), req, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> beanValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        List<ApiErrorDetail> details = new ArrayList<>();
        ex.getBindingResult().getFieldErrors().forEach(fe ->
                details.add(new ApiErrorDetail(fe.getField(), fe.getDefaultMessage())));
        return body(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED, "Validation failed", req, details);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> pathParamValidation(ConstraintViolationException ex, HttpServletRequest req) {
        List<ApiErrorDetail> details = new ArrayList<>();
        ex.getConstraintViolations().forEach(cv ->
                details.add(new ApiErrorDetail(cv.getPropertyPath().toString(), cv.getMessage())));
        return body(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED, "Validation failed", req, details);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> forbidden(AccessDeniedException ex, HttpServletRequest req) {
        return body(HttpStatus.FORBIDDEN, ErrorCode.ACCESS_DENIED, ex.getMessage(), req, null);
    }

    @ExceptionHandler({DataIntegrityViolationException.class, DatabaseConstraintException.class})
    public ResponseEntity<ApiError> dbConstraint(Exception ex, HttpServletRequest req) {
        return body(HttpStatus.CONFLICT, ErrorCode.DATABASE_CONSTRAINT, "Database integrity violation", req, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> any(Exception ex, HttpServletRequest req) {
        return body(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.UNEXPECTED_ERROR, "Unexpected error", req, null);
    }

    private ResponseEntity<ApiError> body(HttpStatus http, ErrorCode code, String msg, HttpServletRequest req, List<ApiErrorDetail> details) {
        return ResponseEntity.status(http).body(ApiError.of(http, msg, req.getRequestURI(), code, details));
    }
}