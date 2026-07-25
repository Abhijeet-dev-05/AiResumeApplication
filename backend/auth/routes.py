from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, status

from .schemas import UserCreate, UserLogin, UserUpdate, UserResponse, TokenResponse, RefreshRequest
from .models import user_document, serialize_user
from .security import hash_password, verify_password
from .database import get_users_collection
from .jwt import (
    create_access_token, create_refresh_token,
    decode_refresh_token, get_current_user,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── POST /auth/register ────────────────────────────────────
@router.post("/register", response_model=UserResponse, status_code=201)
async def register(body: UserCreate):
    collection = get_users_collection()

    # Email uniqueness
    existing = await collection.find_one({"email": body.email.lower().strip()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    # Hash password — never store plain text
    hashed = hash_password(body.password)

    doc = user_document(
        full_name=body.full_name,
        email=body.email,
        hashed_password=hashed,
    )

    result = await collection.insert_one(doc)
    created = await collection.find_one({"_id": result.inserted_id})
    return serialize_user(created)


# ── POST /auth/login ───────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin):
    collection = get_users_collection()

    doc = await collection.find_one({"email": body.email.lower().strip()})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(body.password, doc["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not doc.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact support.",
        )

    user_id = str(doc["_id"])
    role    = doc.get("role", "user")

    return TokenResponse(
        access_token=create_access_token(user_id, role),
        refresh_token=create_refresh_token(user_id, role),
    )


# ── POST /auth/refresh ─────────────────────────────────────
@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(body: RefreshRequest):
    payload = decode_refresh_token(body.refresh_token)
    user_id = payload["sub"]
    role    = payload.get("role", "user")

    # Confirm user still exists and is active
    collection = get_users_collection()
    doc = await collection.find_one({"_id": ObjectId(user_id)})
    if not doc or not doc.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or deactivated.",
        )

    return TokenResponse(
        access_token=create_access_token(user_id, role),
        refresh_token=create_refresh_token(user_id, role),
    )


# ── GET /auth/me ───────────────────────────────────────────
@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user


# ── PATCH /auth/me ─────────────────────────────────────────
@router.patch("/me", response_model=UserResponse)
async def update_me(
    body: UserUpdate,
    current_user: dict = Depends(get_current_user),
):
    collection = get_users_collection()
    updates: dict = {"updated_at": datetime.now(timezone.utc)}

    if body.full_name is not None:
        updates["full_name"] = body.full_name.strip()
    if body.password is not None:
        updates["password"] = hash_password(body.password)

    if len(updates) == 1:  # only updated_at — nothing to update
        raise HTTPException(status_code=400, detail="No fields to update.")

    await collection.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": updates},
    )
    doc = await collection.find_one({"_id": ObjectId(current_user["id"])})
    return serialize_user(doc)


# ── POST /auth/logout (client-side token invalidation) ─────
@router.post("/logout")
async def logout():
    # Stateless JWT — client drops tokens.
    # For production, use a token blocklist (Redis) here.
    return {"message": "Logged out successfully."}
