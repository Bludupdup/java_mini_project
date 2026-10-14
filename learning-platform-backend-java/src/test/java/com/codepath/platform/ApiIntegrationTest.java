package com.codepath.platform;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Runs the whole app (controllers, security, services, PostgreSQL) and talks
 * to it the way the React app does. Needs PostgreSQL running with the
 * settings in .env.local; the data goes in a separate it_test schema.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiIntegrationTest {

    @TestConfiguration
    static class CleanDatabase {
        // Start every test run from empty tables plus the seeded catalog.
        @Bean
        FlywayMigrationStrategy cleanThenMigrate() {
            return flyway -> {
                flyway.clean();
                flyway.migrate();
            };
        }
    }

    @Autowired
    private MockMvc mvc;

    private static String uniqueEmail() {
        return "sam-" + UUID.randomUUID() + "@example.com";
    }

    private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder request, String body) {
        return request.contentType(MediaType.APPLICATION_JSON).content(body);
    }

    /** Registers a new account and returns its login cookie. */
    private Cookie register(String email) throws Exception {
        MvcResult result = mvc.perform(json(post("/api/auth/register"),
                        "{\"name\":\"Sam\",\"email\":\"" + email + "\",\"password\":\"correct horse\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.name").value("Sam"))
                .andExpect(jsonPath("$.user.email").value(email.toLowerCase()))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.token").doesNotExist())
                .andReturn();

        Cookie cookie = result.getResponse().getCookie("dsa_session");
        assertThat(cookie).isNotNull();
        assertThat(cookie.isHttpOnly()).isTrue();
        return cookie;
    }

    @Test
    void servesTheSeededCatalogWithoutALogin() throws Exception {
        mvc.perform(get("/api/topics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.topics", hasSize(24)))
                .andExpect(jsonPath("$.topics[0].id").value("arrays"))
                .andExpect(jsonPath("$.topics[0].icon").value("Brackets"))
                .andExpect(jsonPath("$.topics[0].steps", hasSize(5)))
                .andExpect(jsonPath("$.topics[0].complexity[0].value").value("O(1)"))
                .andExpect(jsonPath("$.topics[0].problems[0].id").value("two-sum"));

        mvc.perform(get("/api/topics/dijkstra"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Dijkstra's Algorithm"))
                .andExpect(jsonPath("$.problems[*].id", hasItem("network-delay-time")));

        mvc.perform(get("/api/topics/graphs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Graphs"))
                .andExpect(jsonPath("$.resources[*].source", hasItem("YouTube · Abdul Bari")));

        mvc.perform(get("/api/topics/no-such-topic"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value(containsString("no-such-topic")));
    }

    @Test
    void servesTheAlgorithmLibraryLinkedToTopics() throws Exception {
        mvc.perform(get("/api/algorithms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.algorithms", hasSize(18)))
                .andExpect(jsonPath("$.algorithms[*].id", hasItems("merge-sort", "dijkstra-algorithm", "rabin-karp-algorithm")))
                .andExpect(jsonPath("$.algorithms[*].topic", everyItem(notNullValue())));

        mvc.perform(get("/api/algorithms/dijkstra-algorithm"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Dijkstra Algorithm"))
                .andExpect(jsonPath("$.topic.id").value("dijkstra"))
                .andExpect(jsonPath("$.cppCode").value(containsString("int main()")))
                .andExpect(jsonPath("$.output").value(containsString("3 -> 4")))
                .andExpect(jsonPath("$.complexity.average").value("O((V + E) log V)"))
                .andExpect(jsonPath("$.leetcode.difficulty").value("Medium"));

        // Each topic lists its algorithms, so its page can link to them.
        mvc.perform(get("/api/topics/backtracking"))
                .andExpect(jsonPath("$.algorithms[*].id", contains("n-queen-problem", "graph-coloring")));

        mvc.perform(get("/api/algorithms/no-such-algorithm"))
                .andExpect(status().isNotFound());
    }

    @Test
    void registersLogsInAndOut() throws Exception {
        String email = uniqueEmail();
        Cookie cookie = register(email);

        mvc.perform(get("/api/auth/me").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value(email));

        // The same email again, even in capitals, is the same account.
        mvc.perform(json(post("/api/auth/register"),
                        "{\"name\":\"Sam\",\"email\":\"" + email.toUpperCase() + "\",\"password\":\"correct horse\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.fields.email").exists());

        mvc.perform(json(post("/api/auth/login"), "{\"email\":\"" + email + "\",\"password\":\"wrong password\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("That email and password don't match."));

        mvc.perform(json(post("/api/auth/login"), "{\"email\":\" " + email + " \",\"password\":\"correct horse\"}"))
                .andExpect(status().isOk())
                .andExpect(cookie().httpOnly("dsa_session", true));

        mvc.perform(post("/api/auth/logout").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("dsa_session", 0));
    }

    @Test
    void explainsInvalidRegistrationsFieldByField() throws Exception {
        mvc.perform(json(post("/api/auth/register"), "{\"name\":\" \",\"email\":\"sam@\",\"password\":\"short\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.name").value("Enter your name."))
                .andExpect(jsonPath("$.fields.email").value("Enter a valid email address, like sam@example.com."))
                .andExpect(jsonPath("$.fields.password").value("Use at least 8 characters."));
    }

    @Test
    void locksLoginAfterFiveWrongPasswords() throws Exception {
        String email = uniqueEmail();
        register(email);
        String wrong = "{\"email\":\"" + email + "\",\"password\":\"wrong password\"}";

        for (int i = 0; i < 5; i++) {
            mvc.perform(json(post("/api/auth/login"), wrong)).andExpect(status().isUnauthorized());
        }
        mvc.perform(json(post("/api/auth/login"), "{\"email\":\"" + email + "\",\"password\":\"correct horse\"}"))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void rejectsRequestsWithoutAValidLogin() throws Exception {
        mvc.perform(get("/api/learning"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("You're not logged in."));

        mvc.perform(get("/api/auth/me").cookie(new Cookie("dsa_session", "forged.token.value")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void savesAndReadsBackALearnersProgress() throws Exception {
        Cookie cookie = register(uniqueEmail());

        mvc.perform(get("/api/learning").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookmarks", hasSize(0)))
                .andExpect(jsonPath("$.preferences.playbackSpeed").value("normal"));

        mvc.perform(post("/api/learning/topics/arrays/visit").cookie(cookie).header("X-Time-Zone", "Asia/Kolkata"))
                .andExpect(status().isNoContent());
        mvc.perform(json(put("/api/learning/topics/arrays/visualization").cookie(cookie), "{\"step\":3,\"total\":8}"))
                .andExpect(status().isNoContent());
        mvc.perform(json(put("/api/learning/topics/arrays/visualization").cookie(cookie), "{\"step\":1,\"total\":8}"))
                .andExpect(status().isNoContent());
        mvc.perform(json(put("/api/learning/topics/graphs/completed").cookie(cookie), "{\"completed\":true}"))
                .andExpect(status().isNoContent());
        mvc.perform(put("/api/learning/bookmarks/trees").cookie(cookie)).andExpect(status().isNoContent());
        mvc.perform(put("/api/learning/bookmarks/graphs").cookie(cookie)).andExpect(status().isNoContent());
        mvc.perform(put("/api/learning/bookmarks/graphs").cookie(cookie)).andExpect(status().isNoContent());
        mvc.perform(json(put("/api/learning/problems/two-sum/solved").cookie(cookie), "{\"solved\":true}"))
                .andExpect(status().isNoContent());
        mvc.perform(json(put("/api/learning/problems/coin-change/note").cookie(cookie), "{\"note\":\"Try DP\"}"))
                .andExpect(status().isNoContent());
        mvc.perform(json(post("/api/learning/achievements").cookie(cookie), "{\"ids\":[\"first-steps\"]}"))
                .andExpect(status().isNoContent());
        mvc.perform(json(patch("/api/learning/preferences").cookie(cookie), "{\"name\":\"Sammy\",\"playbackSpeed\":\"fast\"}"))
                .andExpect(status().isNoContent());

        mvc.perform(get("/api/learning").cookie(cookie))
                .andExpect(status().isOk())
                // Newest bookmark first, no duplicates.
                .andExpect(jsonPath("$.bookmarks", contains("graphs", "trees")))
                .andExpect(jsonPath("$.topics.arrays.visitedAt", greaterThan(0L)))
                // The furthest step is kept: step 3 of 8 means 4 seen.
                .andExpect(jsonPath("$.topics.arrays.visualization.seen").value(4))
                .andExpect(jsonPath("$.topics.arrays.visualization.total").value(8))
                .andExpect(jsonPath("$.topics.graphs.completedAt", greaterThan(0L)))
                .andExpect(jsonPath("$.problems.two-sum.solvedAt", greaterThan(0L)))
                .andExpect(jsonPath("$.problems.coin-change.note").value("Try DP"))
                .andExpect(jsonPath("$.problems.coin-change.solvedAt").doesNotExist())
                .andExpect(jsonPath("$.activityDays", hasSize(1)))
                .andExpect(jsonPath("$.achievements.first-steps", greaterThan(0L)))
                .andExpect(jsonPath("$.preferences.name").value("Sammy"))
                .andExpect(jsonPath("$.preferences.playbackSpeed").value("fast"));

        // Reset progress keeps saved topics, notes and preferences.
        mvc.perform(delete("/api/learning/progress").cookie(cookie)).andExpect(status().isNoContent());
        mvc.perform(get("/api/learning").cookie(cookie))
                .andExpect(jsonPath("$.topics", anEmptyMap()))
                .andExpect(jsonPath("$.bookmarks", contains("graphs", "trees")))
                .andExpect(jsonPath("$.problems.two-sum").doesNotExist())
                .andExpect(jsonPath("$.problems.coin-change.note").value("Try DP"))
                .andExpect(jsonPath("$.achievements", anEmptyMap()))
                .andExpect(jsonPath("$.preferences.name").value("Sammy"));
    }

    @Test
    void keepsEachUsersDataSeparate() throws Exception {
        Cookie sam = register(uniqueEmail());
        Cookie alex = register(uniqueEmail());

        mvc.perform(put("/api/learning/bookmarks/arrays").cookie(sam)).andExpect(status().isNoContent());

        mvc.perform(get("/api/learning").cookie(alex))
                .andExpect(jsonPath("$.bookmarks", hasSize(0)));
    }

    @Test
    void importsAFileAndSkipsWhatDoesntFit() throws Exception {
        Cookie cookie = register(uniqueEmail());
        String file = """
                {
                  "bookmarks": ["graphs", "no-such-topic", "arrays"],
                  "topics": {
                    "arrays": { "visitedAt": 1760000000000, "visualization": { "seen": 2, "total": 5 } },
                    "no-such-topic": { "visitedAt": 1760000000000 }
                  },
                  "problems": { "two-sum": { "solvedAt": 1760000000000, "note": "Hash map" } },
                  "activityDays": ["2026-10-01", "not a day", "2026-10-02"],
                  "achievements": { "first-steps": 1760000000000, "Bad Id!": 1 },
                  "notificationsSeenAt": 0,
                  "preferences": { "name": "Imported", "playbackSpeed": "warp", "reduceMotion": true }
                }
                """;

        mvc.perform(json(put("/api/learning").cookie(cookie), file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookmarks", contains("graphs", "arrays")))
                .andExpect(jsonPath("$.topics.arrays.visualization.seen").value(2))
                .andExpect(jsonPath("$.topics.no-such-topic").doesNotExist())
                .andExpect(jsonPath("$.problems.two-sum.note").value("Hash map"))
                .andExpect(jsonPath("$.activityDays", contains("2026-10-01", "2026-10-02")))
                .andExpect(jsonPath("$.achievements.first-steps").value(1760000000000L))
                .andExpect(jsonPath("$.preferences.name").value("Imported"))
                .andExpect(jsonPath("$.preferences.playbackSpeed").value("normal"))
                .andExpect(jsonPath("$.preferences.reduceMotion").value(true));

        mvc.perform(delete("/api/learning").cookie(cookie)).andExpect(status().isNoContent());
        mvc.perform(get("/api/learning").cookie(cookie))
                .andExpect(jsonPath("$.bookmarks", hasSize(0)))
                .andExpect(jsonPath("$.problems", anEmptyMap()))
                .andExpect(jsonPath("$.preferences.name").value(""));
    }

    // Two tabs (or React's double-run in development) importing at the same
    // moment used to collide on the unique keys and fail with 409.
    @Test
    void handlesTheSameUsersChangesArrivingAtOnce() throws Exception {
        Cookie cookie = register(uniqueEmail());
        String file = "{\"bookmarks\":[\"graphs\",\"arrays\"],\"preferences\":{\"name\":\"Twin\"}}";
        ExecutorService pool = Executors.newFixedThreadPool(4);

        try {
            List<Future<Integer>> results = new ArrayList<>();
            for (int i = 0; i < 4; i++) {
                results.add(pool.submit(() -> mvc.perform(json(put("/api/learning").cookie(cookie), file))
                        .andReturn().getResponse().getStatus()));
            }
            for (Future<Integer> result : results) assertThat(result.get()).isEqualTo(200);
        } finally {
            pool.shutdown();
        }

        mvc.perform(get("/api/learning").cookie(cookie))
                .andExpect(jsonPath("$.bookmarks", contains("graphs", "arrays")))
                .andExpect(jsonPath("$.preferences.name").value("Twin"));
    }

    @Test
    void rejectsBadValuesWithAClearMessage() throws Exception {
        Cookie cookie = register(uniqueEmail());

        mvc.perform(json(put("/api/learning/topics/arrays/visualization").cookie(cookie), "{\"step\":8,\"total\":8}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("\"step\" must be smaller than \"total\"."));
        mvc.perform(json(put("/api/learning/topics/arrays/completed").cookie(cookie), "{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.completed").exists());
        mvc.perform(json(patch("/api/learning/preferences").cookie(cookie), "{\"playbackSpeed\":\"warp\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(json(put("/api/learning/problems/no-such-problem/solved").cookie(cookie), "{\"solved\":true}"))
                .andExpect(status().isNotFound());
        mvc.perform(json(put("/api/learning/topics/arrays/completed").cookie(cookie), "not json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("The request body must be valid JSON."));
    }
}
