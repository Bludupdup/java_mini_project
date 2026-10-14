package com.codepath.platform.config;

import com.codepath.platform.repository.UserRepository;
import com.codepath.platform.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * Runs before every request. If it carries a valid JWT (in the login cookie,
 * or an "Authorization: Bearer ..." header for tools like Postman), the
 * request counts as that user's. Otherwise it continues as a guest, and
 * SecurityConfig decides whether guests may use the route.
 *
 * Created in SecurityConfig rather than as a @Component, so Spring Boot doesn't
 * also register it a second time as a plain servlet filter.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        findToken(request)
                .flatMap(jwtService::readUserId)
                // Look the user up: a token for a deleted account must stop working.
                .flatMap(userRepository::findById)
                .ifPresent(user -> {
                    var principal = new AuthenticatedUser(user.getId(), user.getName(), user.getEmail());
                    var authority = new SimpleGrantedAuthority("ROLE_" + user.getRole());
                    var authentication = new UsernamePasswordAuthenticationToken(principal, null, List.of(authority));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                });

        filterChain.doFilter(request, response);
    }

    private static Optional<String> findToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return Optional.of(header.substring("Bearer ".length()).trim());
        }
        return SessionCookie.read(request);
    }
}
