from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from dependencies import get_db, require_admin
import models
from schemas import AdminStats, UsersPage, UserAdmin

router = APIRouter()


@router.get("/stats", response_model=AdminStats)
def stats(db: Session = Depends(get_db), _=Depends(require_admin)):
    total_users = db.query(models.User).count()
    total_solves = db.query(models.Solve).count()
    total_algorithms = db.query(models.Algorithm).count()
    return AdminStats(total_users=total_users, total_solves=total_solves, total_algorithms=total_algorithms)


@router.get("/users", response_model=UsersPage)
def list_users(db: Session = Depends(get_db), _=Depends(require_admin)):
    users = db.query(models.User).all()
    return UsersPage(users=[UserAdmin.model_validate(u) for u in users], total=len(users))


@router.post("/seed")
def seed(db: Session = Depends(get_db), _=Depends(require_admin)):
    from utils.seed import seed_db
    seed_db(db)
    return {"message": "seeded"}
