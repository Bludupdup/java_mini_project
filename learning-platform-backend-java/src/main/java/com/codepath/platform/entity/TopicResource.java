package com.codepath.platform.entity;

import jakarta.persistence.Embeddable;

/** A link for further reading or watching. */
@Embeddable
public class TopicResource {

    private String title;
    private String source;
    private String url;

    protected TopicResource() {}

    public String getTitle() { return title; }
    public String getSource() { return source; }
    public String getUrl() { return url; }
}
