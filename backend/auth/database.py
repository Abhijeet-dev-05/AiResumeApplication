from motor.motor_asyncio import AsyncIOMotorClient
from .config import MONGODB_URL, MONGODB_DB_NAME

# Single Motor client shared across the app lifecycle
_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(MONGODB_URL)
    return _client


def get_database():
    return get_client()[MONGODB_DB_NAME]


def get_users_collection():
    return get_database()["users"]


async def close_connection():
    global _client
    if _client is not None:
        _client.close()
        _client = None
