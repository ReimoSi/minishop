package com.example.minishop.infrastructure.error;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiError {
    private OffsetDateTime timestamp;
    private HttpStatus status;
    private Integer errorCode;      // = status.value()
    private String message;         // inimloetav selgitus
    private String path;            // request URI
    private ErrorCode code;         // rakendusesisene kood
    private List<ApiErrorDetail> errors; // väljavead (nt @Valid)

    public static ApiError of(HttpStatus status, String message, String path, ErrorCode code, List<ApiErrorDetail> errors) {
        return new ApiError(OffsetDateTime.now(), status, status.value(), message, path, code, errors);
    }
}
