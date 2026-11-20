package ru.volmax.ai_for_developers_project_386.config;

import java.time.Clock;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApplicationConfiguration {

    @Bean
    Clock clock() {
        return Clock.systemDefaultZone();
    }
}
