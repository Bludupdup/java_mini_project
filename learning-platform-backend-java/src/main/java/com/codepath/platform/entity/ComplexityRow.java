package com.codepath.platform.entity;

import jakarta.persistence.Embeddable;

/** One row of a topic's complexity table, e.g. "Search", "O(n)", "Linear scan". */
@Embeddable
public class ComplexityRow {

    private String label;
    private String value;
    private String note;

    protected ComplexityRow() {}

    public String getLabel() { return label; }
    public String getValue() { return value; }
    public String getNote() { return note; }
}
