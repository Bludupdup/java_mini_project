package com.codepath.platform.repository;

import com.codepath.platform.entity.UserPreferences;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPreferencesRepository extends JpaRepository<UserPreferences, Long> {
}
