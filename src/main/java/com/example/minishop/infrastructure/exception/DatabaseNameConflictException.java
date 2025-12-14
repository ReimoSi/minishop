package com.example.minishop.infrastructure.exception;

public class DatabaseNameConflictException extends RuntimeException {
    public DatabaseNameConflictException(String message) { super(message); }
}
