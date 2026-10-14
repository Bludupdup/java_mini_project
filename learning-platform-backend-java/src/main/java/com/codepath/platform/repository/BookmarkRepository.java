package com.codepath.platform.repository;

import com.codepath.platform.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    /** Newest first, like the frontend shows them. */
    @Query("SELECT b FROM Bookmark b JOIN FETCH b.topic WHERE b.userId = :userId ORDER BY b.createdAt DESC, b.id DESC")
    List<Bookmark> findAllForUser(Long userId);

    boolean existsByUserIdAndTopicId(Long userId, Long topicId);

    @Modifying
    @Query("DELETE FROM Bookmark b WHERE b.userId = :userId AND b.topic.id = :topicId")
    void deleteOne(Long userId, Long topicId);

    @Modifying
    @Query("DELETE FROM Bookmark b WHERE b.userId = :userId")
    void deleteAllForUser(Long userId);
}
