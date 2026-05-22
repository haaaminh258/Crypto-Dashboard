package com.stockmarketanalyzer.controller;

import com.stockmarketanalyzer.model.CryptoPriceEntity;
import com.stockmarketanalyzer.repository.CryptoEntityRepository;
import com.stockmarketanalyzer.service.CryptoApiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@RestController
@RequestMapping("/api/crypto")
@Tag(name = "Crypto API", description = "Cryptocurrency market data endpoints")
public class CryptoController {

    private final CryptoApiService cryptoApiService;
    private final CryptoEntityRepository repo;

    @Autowired
    public CryptoController(CryptoApiService cryptoApiService, CryptoEntityRepository repo) {
        this.cryptoApiService = cryptoApiService;
        this.repo = repo;
    }

    // ── 1. Supported coins list ────────────────────────────────────────────────
    @GetMapping("/coins")
    @Operation(summary = "List all supported coin IDs")
    public List<String> getSupportedCoins() {
        return cryptoApiService.getSupportedCoins();
    }

    // ── 2. Market overview (latest snapshot of all coins) ─────────────────────
    @GetMapping("/market")
    @Operation(summary = "Latest price + stats for all coins")
    public List<CryptoPriceEntity> getMarketOverview() {
        return repo.findLatestPerCoin();
    }

    // ── 3. Single coin latest ─────────────────────────────────────────────────
    @GetMapping("/market/{symbol}")
    @Operation(summary = "Latest data for one coin")
    public ResponseEntity<CryptoPriceEntity> getCoinLatest(@PathVariable String symbol) {
        return repo.findTopByNameIgnoreCaseOrderByTimestampDesc(symbol)
                   .map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    // ── 4. Price history (sampled, max 300 points) ────────────────────────────
    @GetMapping("/history/{symbol}")
    @Operation(summary = "Price history for a coin within a time range")
    public List<CryptoPriceEntity> getHistory(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1d") String range,
            @RequestParam(defaultValue = "200") int maxPoints) {

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime from = switch (range.toLowerCase()) {
            case "1h"  -> now.minusHours(1);
            case "6h"  -> now.minusHours(6);
            case "1d"  -> now.minusDays(1);
            case "1w"  -> now.minusWeeks(1);
            case "1m"  -> now.minusMonths(1);
            case "3m"  -> now.minusMonths(3);
            default    -> throw new IllegalArgumentException("Invalid range: " + range + ". Use: 1h,6h,1d,1w,1m,3m");
        };

        int cap = Math.min(Math.max(maxPoints, 50), 500);
        return repo.findSampledHistory(symbol, from, now, cap);
    }

    // ── 5. Top movers ─────────────────────────────────────────────────────────
    @GetMapping("/movers")
    @Operation(summary = "Top gainers and losers by 24h change")
    public Map<String, List<CryptoPriceEntity>> getTopMovers(
            @RequestParam(defaultValue = "5") int limit) {
        List<CryptoPriceEntity> all = repo.findLatestAllOrderByChange();
        int cap = Math.min(limit, all.size());
        Map<String, List<CryptoPriceEntity>> result = new LinkedHashMap<>();
        result.put("gainers", all.subList(0, cap));
        result.put("losers",  all.subList(Math.max(0, all.size() - cap), all.size())
                                 .stream()
                                 .sorted(Comparator.comparing(CryptoPriceEntity::getChange24h))
                                 .toList());
        return result;
    }

    // ── 6. Multi-coin comparison ───────────────────────────────────────────────
    @GetMapping("/compare")
    @Operation(summary = "Latest data for a comma-separated list of coins")
    public List<CryptoPriceEntity> compareCoins(
            @RequestParam String symbols) {
        List<String> names = Arrays.stream(symbols.split(","))
                                   .map(String::trim)
                                   .filter(s -> !s.isEmpty())
                                   .toList();
        List<CryptoPriceEntity> result = new ArrayList<>();
        for (String name : names) {
            repo.findTopByNameIgnoreCaseOrderByTimestampDesc(name).ifPresent(result::add);
        }
        return result;
    }

    // ── 7. Manual data refresh ────────────────────────────────────────────────
    @PostMapping("/refresh")
    @Operation(summary = "Manually trigger a data fetch from CoinGecko")
    public ResponseEntity<Map<String, Object>> refresh() {
        List<CryptoPriceEntity> saved = cryptoApiService.fetchCryptoPrices();
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("fetched", saved.size());
        resp.put("timestamp", LocalDateTime.now().toString());
        resp.put("coins", saved.stream().map(CryptoPriceEntity::getName).toList());
        return ResponseEntity.ok(resp);
    }

    // ── 8. Legacy endpoints (backward compat) ─────────────────────────────────
    @GetMapping("/prices")
    @Operation(summary = "[Legacy] All stored records")
    public List<CryptoPriceEntity> getAllPrices() {
        return repo.findLatestPerCoin();
    }

    @GetMapping("/prices/by-symbol")
    @Operation(summary = "[Legacy] History by symbol+range")
    public List<CryptoPriceEntity> legacyBySymbol(
            @RequestParam String symbol,
            @RequestParam(defaultValue = "1d") String range) {
        return getHistory(symbol, range, 200);
    }
}
