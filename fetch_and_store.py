import os
import pymysql
import requests
import json
from datetime import datetime

# 19 coins from the backend
SUPPORTED_COINS = [
    "bitcoin", "ethereum", "tether", "solana",
    "binancecoin", "ripple", "usd-coin",
    "dogecoin", "tron", "cardano", "avalanche-2",
    "chainlink", "shiba-inu", "polkadot", "wrapped-bitcoin",
    "bitcoin-cash", "near", "litecoin", "uniswap"
]

# --- 1. Hàm kết nối đến Aiven Database (Yêu Cầu SSL) ---
def get_db_connection():
    return pymysql.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        port=int(os.environ.get('DB_PORT', 3306)),
        user=os.environ.get('DB_USER', 'root'),
        password=os.environ.get('DB_PASS', ''),
        database=os.environ.get('DB_NAME', 'defaultdb'),
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor,
        # Chỉ check SSL nếu chạy trên Github Actions, nếu test local thì bỏ qua
        ssl={'ca': 'ca.pem'} if os.path.exists('ca.pem') else None
    )

# --- 2. Hàm fetch dữ liệu mới nhất từ CoinGecko API ---
def fetch_latest_crypto_data():
    url = 'https://api.coingecko.com/api/v3/simple/price'
    params = {
        'ids': ",".join(SUPPORTED_COINS),
        'vs_currencies': 'usd',
        'include_market_cap': 'true',
        'include_24hr_vol': 'true',
        'include_24hr_change': 'true',
        'include_last_updated_at': 'true'
    }
    response = requests.get(url, params=params)
    response.raise_for_status() # Raise error nếu API tạch
    return response.json()

# --- 3. Hàm lưu dữ liệu vào MySQL ---
def insert_price_data(cursor, data):
    # Đảm bảo bảng đã tồn tại cho đúng schema backend Spring Boot (JPA)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS crypto_price (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(64) NOT NULL,
            price_usd DECIMAL(30, 10),
            market_cap_usd DECIMAL(30, 2),
            change24h DECIMAL(10, 4),
            volume24h DECIMAL(30, 2),
            timestamp DATETIME NOT NULL
        )
    """)
    
    # Tạo index nếu chưa có
    try:
        cursor.execute("CREATE INDEX idx_name_timestamp ON crypto_price(name, timestamp)")
        cursor.execute("CREATE INDEX idx_timestamp ON crypto_price(timestamp)")
    except pymysql.err.OperationalError:
        pass # Index đã tồn tại thì bỏ qua

    # Lặp qua tất cả support coins để lưu, nếu API không trả về thì lưu 0
    for coin_id in SUPPORTED_COINS:
        coin_data = data.get(coin_id, {})
        cursor.execute("""
            INSERT INTO crypto_price 
            (name, price_usd, market_cap_usd, change24h, volume24h, timestamp)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            coin_id,
            coin_data.get('usd', 0),
            coin_data.get('usd_market_cap', 0),
            coin_data.get('usd_24h_change', 0),
            coin_data.get('usd_24h_vol', 0),
            datetime.utcnow() # timestamp sử dụng UTC
        ))

# --- 4. Main: Fetch và Lưu dữ liệu ---
def main():
    print("Starting fetching process...")
    try:
        connection = get_db_connection()
    except Exception as e:
        print(f"Failed to connect to database: {e}")
        return

    try:
        with connection.cursor() as cursor:
            data = fetch_latest_crypto_data()
            insert_price_data(cursor, data)
            connection.commit()
            print(f"Successfully inserted {len(SUPPORTED_COINS)} records.")
    except Exception as e:
        print(f"An error occurred while fetching or inserting data: {e}")
    finally:
        connection.close()

if __name__ == "__main__":
    main()
