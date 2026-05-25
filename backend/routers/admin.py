from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from dependencies import get_db, require_admin
import models
from schemas import AdminStats, UsersPage, UserAdmin
from schemas import PasswordChange
from services import admin_cache
from services import user_service

router = APIRouter()


@router.get("/stats", response_model=AdminStats)
def stats(db: Session = Depends(get_db), _=Depends(require_admin)):
    total_users = db.query(models.User).count()
    total_solves = db.query(models.Solve).count()
    total_algorithms = db.query(models.Algorithm).count()
    return AdminStats(total_users=total_users, total_solves=total_solves, total_algorithms=total_algorithms)


@router.get("/users", response_model=UsersPage)
def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    _=Depends(require_admin),
):
    users, has_more = admin_cache.get_users_page(page, limit)
    return UsersPage(users=users, has_more=has_more)


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    db.delete(user)
    db.commit()
    admin_cache.remove_user_from_cache(user_id)
    return {"message": "user deleted"}


@router.put("/users/{user_id}/password")
def admin_change_password(user_id: int, data: PasswordChange, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    # validate new password and confirmation
    if data.new_password != data.new_password_confirm:
        raise HTTPException(status_code=400, detail="new password and confirmation do not match")
    # reuse service to set password
    user_service.admin_reset_password(db, user, data.new_password)
    return {"message": "password changed"}


@router.post("/seed")
def seed(db: Session = Depends(get_db), _=Depends(require_admin)):
    from utils.seed import seed_db
    seed_db(db)
    admin_cache.rebuild_users_cache(db)
    return {"message": "seeded"}
