package com.stockmarketanalyzer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class StockMarketAnalyzerApplication {

    public static void main(String[] args) {
        SpringApplication.run(StockMarketAnalyzerApplication.class, args);
    }

}
