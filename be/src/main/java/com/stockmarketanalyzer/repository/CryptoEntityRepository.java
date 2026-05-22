package com.stockmarketanalyzer.repository;

import com.stockmarketanalyzer.model.CryptoPriceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CryptoEntityRepository extends JpaRepository<CryptoPriceEntity, Long> {

    List<CryptoPriceEntity> findByTimestampBetween(LocalDateTime from, LocalDateTime to);

    List<CryptoPriceEntity> findByNameIgnoreCaseAndTimestampBetweenOrderByTimestampAsc(
        String name, LocalDateTime from, LocalDateTime to);

    // Latest record per coin
    @Query("SELECT c FROM CryptoPriceEntity c WHERE c.timestamp = " +
           "(SELECT MAX(c2.timestamp) FROM CryptoPriceEntity c2 WHERE c2.name = c.name)")
    List<CryptoPriceEntity> findLatestPerCoin();

    // Latest record for one coin
    Optional<CryptoPriceEntity> findTopByNameIgnoreCaseOrderByTimestampDesc(String name);

    // Top gainers/losers (latest snapshot)
    @Query(value = """
        SELECT c.* FROM crypto_price c
        INNER JOIN (
            SELECT name, MAX(timestamp) AS max_ts FROM crypto_price GROUP BY name
        ) latest ON c.name = latest.name AND c.timestamp = latest.max_ts
        ORDER BY c.change24h DESC
        """, nativeQuery = true)
    List<CryptoPriceEntity> findLatestAllOrderByChange();

    // Sampled history for large ranges (every Nth record to reduce payload)
    @Query(value = """
        SELECT * FROM (
            SELECT c.*, ROW_NUMBER() OVER (ORDER BY c.timestamp ASC) AS rn,
                   COUNT(*) OVER () AS total
            FROM crypto_price c
            WHERE LOWER(c.name) = LOWER(:name)
              AND c.timestamp BETWEEN :from AND :to
        ) t
        WHERE t.rn = 1 OR (t.rn % GREATEST(1, FLOOR(t.total / :maxPoints)) = 0)
        ORDER BY t.timestamp ASC
        """, nativeQuery = true)
    List<CryptoPriceEntity> findSampledHistory(
        @Param("name") String name,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to,
        @Param("maxPoints") int maxPoints);
}
