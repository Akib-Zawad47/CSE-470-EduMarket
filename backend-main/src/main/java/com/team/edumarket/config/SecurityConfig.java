package com.team.edumarket.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Explicitly allow public access to the chatbot and its API
                .requestMatchers("/chatbot.html", "/api/chatbot/**", "/css/**", "/js/**").permitAll()
                // For all other pages during development, you can permit all 
                // (or change to .authenticated() later when you build secure routes)
                .anyRequest().permitAll()
            );
            
        return http.build();
    }
}