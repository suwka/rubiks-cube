from threading import RLock
from typing import List

from sqlalchemy.orm import Session

import models
from schemas import UserAdmin

_cache_lock = RLock()
_users_cache: List[UserAdmin] = []


def rebuild_users_cache(db: Session) -> None:
    rows = (
        db.query(
            models.User.id,
            models.User.username,
            models.User.email,
            models.User.role,
            models.User.created_at,
        )
        .order_by(models.User.id.desc())
        .all()
    )
    with _cache_lock:
        _users_cache.clear()
        _users_cache.extend(
            UserAdmin(
                id=row.id,
                username=row.username,
                email=row.email,
                role=row.role,
                created_at=row.created_at,
            )
            for row in rows
        )


def get_users_page(page: int, limit: int) -> tuple[list[UserAdmin], bool]:
    with _cache_lock:
        start = (page - 1) * limit
        end = start + limit
        users = _users_cache[start:end]
        has_more = end < len(_users_cache)
        return list(users), has_more


def remove_user_from_cache(user_id: int) -> None:
    with _cache_lock:
        _users_cache[:] = [user for user in _users_cache if user.id != user_id]
