import os
from dotenv import load_dotenv

load_dotenv()

# ── MongoDB ────────────────────────────────────────────────
MONGODB_URL     = os.getenv("MONGODB_URL", "")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "resume_genie")

# ── JWT ───────────────────────────────────────────────────
JWT_SECRET_KEY          = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
JWT_REFRESH_SECRET_KEY  = os.getenv("JWT_REFRESH_SECRET_KEY", "change-refresh-in-production")
JWT_ALGORITHM           = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS   = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
