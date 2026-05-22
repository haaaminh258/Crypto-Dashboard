# Crypto Market Analyzer

A full-stack cryptocurrency monitoring and analytics application built with **Spring Boot**, **MySQL**, and **React.js**.  
It fetches real-time data from the [CoinGecko API](https://www.coingecko.com/) and provides visual analysis via dynamic charts.

## Features

### Backend (Spring Boot)
- Fetches crypto data from CoinGecko API
- Stores historical data in MySQL
- Scheduled auto-fetching (every minute, hour, day, week, month, year)
- REST API endpoints for:
  - Saving data
  - Filtering by symbol and time range
  - Getting combined price history
- Swagger documentation (`/swagger-ui.html`)
- Global exception handling

### Frontend (React + Chart.js)
- Select cryptocurrency (Bitcoin, Ethereum, Tether, Solana)
- Choose time range: 1h / 1d / 1w / 1m
- Live update toggle every 10s
- Interactive line chart with gradient fill
- Responsive UI (Tailwind CSS)

##  Tech Stack

| Layer    | Technology                      |
|----------|----------------------------------|
| Backend  | Java 17, Spring Boot 3.2.x       |
| DB       | MySQL                            |
| Frontend | React.js, Chart.js, Tailwind CSS |
| API      | CoinGecko Public API             |
| Docs     | Swagger (springdoc-openapi)      |


### Backend (Spring Boot)
```bash
# 1. Clone
git clone https://github.com/your-username/crypto-market-analyzer.git
cd backend

# 2. MySQL setup
# Create database: stockmarket
# Update src/main/resources/application.properties

# 3. Run Spring Boot app
./mvnw spring-boot:run
