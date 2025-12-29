package com.example.minishop.web;

import com.example.minishop.api.ProductDto;
import com.example.minishop.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@Tag(name = "Products", description = "Product CRUD endpoints")
@RestController
@RequestMapping(value = "/api/products", produces = MediaType.APPLICATION_JSON_VALUE)
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(
            summary = "Search & list products (paged)",
            description = """
            Päring toetab otsingut ja sortimist.
            Otsing: q — match name või sku (contains, ignore-case).
            Sort: korduv 'sort' parameeter, nt ?sort=price,desc&sort=name,asc
            Lubatud võtmed: price, name, sku, created, updated, id.
            """
    )
    @Parameter(
            name = "sort",
            description = "Sorteerimine: 'key,asc|desc'. Võib korduda.",
            in = ParameterIn.QUERY
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "400", description = "Vale sort võti või suund")
    })
    public Page<ProductDto> searchAndList(
            @RequestParam(value = "q", required = false) String q,
            @ParameterObject @PageableDefault(size = 20) Pageable pageable
    ) {
        Pageable safe = SortUtil.sanitize(pageable); // whitelist + tiebreak id ASC
        return service.search(q, safe);
    }

    @GetMapping("/all")
    @Operation(summary = "List all products (NO paging)", description = "ADMIN/use only — võib olla suur.")
    public List<ProductDto> listAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by id", description = "Returns product by id")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public ProductDto get(@PathVariable @Min(1) Long id) {
        return service.get(id);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create product", description = "Creates a new product")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Created"),
            @ApiResponse(responseCode = "400", description = "Validation error"),
            @ApiResponse(responseCode = "409", description = "SKU already exists")
    })
    public ResponseEntity<ProductDto> create(@Valid @RequestBody ProductDto dto) {
        ProductDto created = service.create(dto);
        return ResponseEntity
                .created(URI.create("/api/products/" + created.getId()))
                .body(created);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Update product", description = "Updates an existing product")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "400", description = "Validation error"),
            @ApiResponse(responseCode = "404", description = "Product not found"),
            @ApiResponse(responseCode = "409", description = "SKU already exists")
    })
    public ProductDto update(@PathVariable @Min(1) Long id, @Valid @RequestBody ProductDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete product", description = "Deletes a product by id")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Deleted"),
            @ApiResponse(responseCode = "404", description = "Product not found"),
            @ApiResponse(responseCode = "409", description = "Product is referenced and cannot be deleted")
    })
    public ResponseEntity<Void> delete(@PathVariable @Min(1) Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
