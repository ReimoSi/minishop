package com.example.minishop.infrastructure.exception;

public class DatabaseConstraintException extends RuntimeException {
    public DatabaseConstraintException(String message) { super(message); }
}
