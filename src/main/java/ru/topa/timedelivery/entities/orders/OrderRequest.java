package ru.topa.timedelivery.entities.orders;

import java.util.Map;

public class OrderRequest {
    private Map<String, Integer> items;
    private String comment;

    public Map<String, Integer> getItems() {
        return items;
    }

    public void setItems(Map<String, Integer> items) {
        this.items = items;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public OrderRequest() { }

    public OrderRequest(Map<String, Integer> items, String comment) {
        this.items = items;
        this.comment = comment;
    }
}
