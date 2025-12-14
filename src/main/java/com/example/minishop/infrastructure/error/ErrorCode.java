package com.example.minishop.infrastructure.error;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ErrorCode {

    ACCESS_DENIED("Access denied"),
    DATABASE_CONSTRAINT("Database integrity violation"),
    NAME_CONFLICT("Name already exists"),
    RESOURCE_NOT_FOUND("Resource not found"),
    VALIDATION_FAILED("Validation failed"),
    UNEXPECTED_ERROR("Unexpected error");

    private final String message;
}
