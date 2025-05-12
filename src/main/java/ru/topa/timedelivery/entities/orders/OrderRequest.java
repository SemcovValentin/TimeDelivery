package ru.topa.timedelivery.entities.orders;

import java.util.Map;

public class OrderRequest {
    private Map<String, Integer> items;

    public Map<String, Integer> getItems() {
        return items;
    }

    public void setItems(Map<String, Integer> items) {
        this.items = items;
    }

    public OrderRequest() { }

    public OrderRequest(Map<String, Integer> items) {
        this.items = items;
    }
}

