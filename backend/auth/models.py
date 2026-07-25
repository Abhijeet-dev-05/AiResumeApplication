from datetime import datetime, timezone
from typing import Optional


def user_document(
    full_name: str,
    email: str,
    hashed_password: str,
    role: str = "user",
) -> dict:
    """
    Returns a MongoDB document dict for a new user.
    Never stores plain-text passwords.
    """
    now = datetime.now(timezone.utc)
    return {
        "full_name":       full_name,
        "email":           email.lower().strip(),
        "password":        hashed_password,   # bcrypt hash only
        "role":            role,              # "user" | "admin"
        "is_active":       True,
        "is_verified":     False,
        "created_at":      now,
        "updated_at":      now,
    }


def serialize_user(doc: dict) -> dict:
    """Convert a MongoDB document to a safe UserResponse-compatible dict."""
    return {
        "id":          str(doc["_id"]),
        "full_name":   doc["full_name"],
        "email":       doc["email"],
        "role":        doc.get("role", "user"),
        "is_active":   doc.get("is_active", True),
        "is_verified": doc.get("is_verified", False),
        "created_at":  doc["created_at"],
        "updated_at":  doc["updated_at"],
    }
