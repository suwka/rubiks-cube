#serwis user
from typing import Optional
from sqlalchemy.orm import Session

import models
from auth import hash_password, verify_password
from schemas import UserCreate, UserUpdate, PasswordChange
from services import admin_cache


def create_user(db: Session, data: UserCreate) -> models.User:
    """tworzy uzytkownika

    sprawdza czy username i email sa wolne (rzuca ValueError jesli nie),
    hashujes haslo i zapisuje do bazy
    """
    # sprawdz username
    if db.query(models.User).filter(models.User.username == data.username).first():
        raise ValueError("username zajety")
    # sprawdz email
    if db.query(models.User).filter(models.User.email == data.email).first():
        raise ValueError("email juz zarejestrowany")

    hashed = hash_password(data.password)
    user = models.User(
        username=data.username,
        email=data.email,
        password_hash=hashed,
        role=getattr(data, 'role', 'user')
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    admin_cache.rebuild_users_cache(db)
    return user


def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    """zwraca usera po id lub None"""
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    """zwraca usera po username lub None"""
    return db.query(models.User).filter(models.User.username == username).first()


def authenticate_user(db: Session, username: str, password: str) -> Optional[models.User]:
    """wierzy haslo i zwraca usera jesli ok, inaczej None"""
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def update_user_profile(db: Session, user: models.User, data: UserUpdate) -> models.User:
    """aktualizuje bio i/lub cube_setup, zwraca usera"""
    updated = False
    if data.bio is not None:
        user.bio = data.bio
        updated = True
    if data.cube_setup is not None:
        user.cube_setup = data.cube_setup
        updated = True
    if updated:
        db.add(user)
        db.commit()
        db.refresh(user)
        # profile changes do not affect admin list contents
    return user


def change_password(db: Session, user: models.User, data: PasswordChange) -> None:
    """zmienia haslo uzytkownika

    weryfikuje stare haslo (rzuca ValueError jesli nieprawidlowe),
    sprawdza zgodnosc new_password i new_password_confirm (rzuca ValueError),
    zapisuje nowe zahashowane haslo
    """
    if not verify_password(data.old_password, user.password_hash):
        raise ValueError("stare haslo nieprawidlowe")
    if data.new_password != data.new_password_confirm:
        raise ValueError("nowe haslo i potwierdzenie sie nie zgadzaja")
    user.password_hash = hash_password(data.new_password)
    db.add(user)
    db.commit()
    return None


def admin_reset_password(db: Session, user: models.User, new_password: str) -> None:
    """Forcefully set a new password for a user (admin action)."""
    user.password_hash = hash_password(new_password)
    db.add(user)
    db.commit()
    return None
