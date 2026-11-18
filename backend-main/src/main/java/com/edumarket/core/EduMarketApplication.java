package com.edumarket.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EduMarketApplication {
    public static void main(String[] args) {
        SpringApplication.run(EduMarketApplication.class, args);
        System.out.println("EduMarket Spring Boot MVC Application Started!");
    }
}