from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from dependencies import get_db, get_current_user
from services import user_service
from schemas import UserPublic, UserUpdate, PasswordChange

router = APIRouter()


@router.get("/{user_id}", response_model=UserPublic)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user not found")
    return UserPublic.model_validate(user)


@router.put("/me", response_model=UserPublic)
def update_me(data: UserUpdate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    user = user_service.update_user_profile(db, current_user, data)
    return UserPublic.model_validate(user)


@router.put("/me/password")
def change_password(data: PasswordChange, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        user_service.change_password(db, current_user, data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return {"message": "Password changed"}
