package com.stockmarketanalyzer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockmarketanalyzer.model.CryptoPriceEntity;
import com.stockmarketanalyzer.repository.CryptoEntityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class CryptoApiService {

    private static final Logger log = LoggerFactory.getLogger(CryptoApiService.class);

    // 20 coins - top by market cap
    public static final List<String> SUPPORTED_COINS = Arrays.asList(
        "bitcoin", "ethereum", "tether", "solana",
        "binancecoin", "ripple", "usd-coin",
        "dogecoin", "tron", "cardano", "avalanche-2",
        "chainlink", "shiba-inu", "polkadot", "wrapped-bitcoin",
        "bitcoin-cash", "near", "litecoin", "uniswap"
    );

    private static final String API_URL =
        "https://api.coingecko.com/api/v3/simple/price" +
        "?ids=" + String.join(",", SUPPORTED_COINS) +
        "&vs_currencies=usd" +
        "&include_market_cap=true" +
        "&include_24hr_vol=true" +
        "&include_24hr_change=true" +
        "&include_last_updated_at=true";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    private CryptoEntityRepository cryptoEntityRepository;

    public CryptoApiService(RestTemplate restTemplate, ObjectMapper objectMapper,
                            CryptoEntityRepository cryptoEntityRepository) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.cryptoEntityRepository = cryptoEntityRepository;
    }

    public List<CryptoPriceEntity> fetchCryptoPrices() {
        List<CryptoPriceEntity> prices = new ArrayList<>();
        try {
            String response = restTemplate.getForObject(API_URL, String.class);
            JsonNode root = objectMapper.readTree(response);
            LocalDateTime now = LocalDateTime.now(java.time.ZoneOffset.UTC);

            for (String coin : SUPPORTED_COINS) {
                JsonNode node = root.get(coin);
                if (node == null) continue;

                BigDecimal price     = safeDecimal(node, "usd");
                BigDecimal marketCap = safeDecimal(node, "usd_market_cap");
                BigDecimal change24h = safeDecimal(node, "usd_24h_change");
                BigDecimal vol24h    = safeDecimal(node, "usd_24h_vol");

                CryptoPriceEntity entity = new CryptoPriceEntity(coin, price, marketCap, change24h, vol24h, now);
                cryptoEntityRepository.save(entity);
                prices.add(entity);
            }
            log.info("Fetched {} coins at {}", prices.size(), now);
        } catch (Exception e) {
            log.error("Error fetching crypto data: {}", e.getMessage());
        }
        return prices;
    }

    private BigDecimal safeDecimal(JsonNode node, String field) {
        JsonNode f = node.get(field);
        return (f != null && !f.isNull()) ? f.decimalValue() : BigDecimal.ZERO;
    }

    // Fetch every 5 minutes (Disabled via @Scheduled because it's now handled by Github Actions)
    // @Scheduled(cron = "0 */1 * * * *")
    public void fetchEvery5Minutes() {
        fetchCryptoPrices();
    }

    public List<String> getSupportedCoins() {
        return SUPPORTED_COINS;
    }
}
