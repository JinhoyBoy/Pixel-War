import redis

# Verbindung zu Redis herstellen
redis_client = redis.Redis(host="redis", port=6379, password='1234', decode_responses=True)
