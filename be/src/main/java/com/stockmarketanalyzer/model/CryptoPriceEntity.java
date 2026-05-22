package com.stockmarketanalyzer.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "crypto_price",
       indexes = {
           @Index(name = "idx_name_timestamp", columnList = "name, timestamp"),
           @Index(name = "idx_timestamp", columnList = "timestamp")
       })
public class CryptoPriceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String name;

    @Column(precision = 30, scale = 10)
    private BigDecimal priceUsd;

    @Column(precision = 30, scale = 2)
    private BigDecimal marketCapUsd;

    @Column(precision = 10, scale = 4)
    private BigDecimal change24h;

    @Column(precision = 30, scale = 2)
    private BigDecimal volume24h;

    @Column(nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) timestamp = LocalDateTime.now();
    }

    public CryptoPriceEntity() {}

    public CryptoPriceEntity(String name, BigDecimal priceUsd, BigDecimal marketCapUsd,
                              BigDecimal change24h, BigDecimal volume24h, LocalDateTime timestamp) {
        this.name = name;
        this.priceUsd = priceUsd;
        this.marketCapUsd = marketCapUsd;
        this.change24h = change24h;
        this.volume24h = volume24h;
        this.timestamp = timestamp;
    }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public BigDecimal getPriceUsd() { return priceUsd; }
    public BigDecimal getMarketCapUsd() { return marketCapUsd; }
    public BigDecimal getChange24h() { return change24h; }
    public BigDecimal getVolume24h() { return volume24h; }
    public LocalDateTime getTimestamp() { return timestamp; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setPriceUsd(BigDecimal priceUsd) { this.priceUsd = priceUsd; }
    public void setMarketCapUsd(BigDecimal marketCapUsd) { this.marketCapUsd = marketCapUsd; }
    public void setChange24h(BigDecimal change24h) { this.change24h = change24h; }
    public void setVolume24h(BigDecimal volume24h) { this.volume24h = volume24h; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
