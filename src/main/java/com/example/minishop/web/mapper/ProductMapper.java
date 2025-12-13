package com.example.minishop.web.mapper;

import com.example.minishop.api.ProductDto;
import com.example.minishop.domain.Currency;
import com.example.minishop.domain.Product;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)

public interface ProductMapper {

    // Entity -> DTO
    @Mapping(target = "currencyCode", source = "currencyCode.code")
    ProductDto toDto(Product product);

    // List mapping
    List<ProductDto> toDto(List<Product> products);

    // DTO -> Entity
    @InheritInverseConfiguration(name = "toDto")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    // String -> Currency
    @Mapping(target = "currencyCode", expression = "java(toCurrency(dto.getCurrencyCode()))")
    Product toEntity(ProductDto dto);

    // Abimeetod: String -> Currency
    default Currency toCurrency(String code) {
        if (code == null) return null;
        Currency c = new Currency();
        c.setCode(code.toUpperCase()); // hoia 3-täheline kood ühtses formaadis
        return c;
    }
}
