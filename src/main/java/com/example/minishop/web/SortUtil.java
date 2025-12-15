package com.example.minishop.web;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.*;

public final class SortUtil {
    private SortUtil() {}

    // API võtmed -> JPA property nimed (NB: price -> priceCents)
    private static final Map<String, String> ALLOWED = Map.ofEntries(
            Map.entry("price", "priceCents"),
            Map.entry("name", "name"),
            Map.entry("sku", "sku"),
            Map.entry("id", "id")
            // Kui entiteedis on olemas, lisa ka:
            // Map.entry("created", "createdAt"),
            // Map.entry("updated", "updatedAt")
    );

    // Vaikimisi hoia see väga ohutu:
    public static final Sort DEFAULT_SORT = Sort.by(Sort.Order.asc("id"));

    public static Pageable sanitize(Pageable incoming) {
        if (incoming == null) {
            return PageRequest.of(0, 20, DEFAULT_SORT);
        }
        Sort safe = sanitize(incoming.getSort(), DEFAULT_SORT);
        return PageRequest.of(incoming.getPageNumber(), incoming.getPageSize(), safe);
    }

    public static Sort sanitize(Sort incoming, Sort fallback) {
        if (incoming == null || incoming.isUnsorted()) {
            return fallback;
        }
        List<Sort.Order> out = new ArrayList<>();
        boolean hasId = false;

        for (Sort.Order o : incoming) {
            String key = Optional.ofNullable(o.getProperty()).orElse("")
                    .trim().toLowerCase(Locale.ROOT);
            String prop = ALLOWED.get(key);
            if (prop == null) {
                throw new IllegalArgumentException("Unsupported sort: " + key);
            }
            if ("id".equals(prop)) hasId = true;
            Sort.Direction dir = o.getDirection() == null ? Sort.Direction.ASC : o.getDirection();
            out.add(new Sort.Order(dir, prop).nullsLast());
        }
        if (out.isEmpty()) return fallback;
        if (!hasId) out.add(Sort.Order.asc("id")); // stabiilne tiebreak
        return Sort.by(out);
    }
}
