package com.example.minishop.web.mapper;

import com.example.minishop.api.CurrencyDto;
import com.example.minishop.domain.Currency;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(
        componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface CurrencyMapper {
    CurrencyDto toDto(Currency entity);
    List<CurrencyDto> toDto(List<Currency> entities);
}
