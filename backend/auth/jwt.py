from datetime import datetime, timedelta, timezone
from typing import Literal

from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status

from .config import (
    JWT_SECRET_KEY, JWT_REFRESH_SECRET_KEY,
    JWT_ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
)
from .security import oauth2_scheme
from .database import get_users_collection
from .models import serialize_user


# ── Create tokens ──────────────────────────────────────────
def _create_token(
    subject: str,
    role: str,
    token_type: Literal["access", "refresh"],
    secret: str,
    expire_delta: timedelta,
) -> str:
    expire = datetime.now(timezone.utc) + expire_delta
    payload = {
        "sub":  subject,
        "role": role,
        "type": token_type,
        "exp":  expire,
        "iat":  datetime.now(timezone.utc),
    }
    return jwt.encode(payload, secret, algorithm=JWT_ALGORITHM)


def create_access_token(user_id: str, role: str = "user") -> str:
    return _create_token(
        subject=user_id,
        role=role,
        token_type="access",
        secret=JWT_SECRET_KEY,
        expire_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def create_refresh_token(user_id: str, role: str = "user") -> str:
    return _create_token(
        subject=user_id,
        role=role,
        token_type="refresh",
        secret=JWT_REFRESH_SECRET_KEY,
        expire_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    )


# ── Decode & verify ────────────────────────────────────────
def _decode_token(token: str, secret: str, expected_type: str) -> dict:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, secret, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise credentials_exc

    if payload.get("type") != expected_type:
        raise credentials_exc

    user_id: str = payload.get("sub")
    if not user_id:
        raise credentials_exc

    return payload


def decode_access_token(token: str) -> dict:
    return _decode_token(token, JWT_SECRET_KEY, "access")


def decode_refresh_token(token: str) -> dict:
    return _decode_token(token, JWT_REFRESH_SECRET_KEY, "refresh")


# ── FastAPI dependency: current user ───────────────────────
async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    user_id = payload["sub"]

    collection = get_users_collection()
    from bson import ObjectId
    doc = await collection.find_one({"_id": ObjectId(user_id)})

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )
    if not doc.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated.",
        )

    return serialize_user(doc)


# ── Dependency: admin only ─────────────────────────────────
async def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return current_user
