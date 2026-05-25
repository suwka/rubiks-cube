#fastapi zaleznosci
from types import SimpleNamespace
from typing import Generator, Optional
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from database import SessionLocal
from auth import decode_token
import models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db() -> Generator[Session, None, None]:
	"""generator sesji db"""
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
	"""zwraca zalogowanego usera lub 401"""
	payload = decode_token(token)
	if not payload:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="nieprawidlowy token")
	username = payload.get("sub")
	if not username:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="nieprawidlowy token")
	user = db.query(models.User).filter(models.User.username == username).first()
	if not user:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="uzytkownik nie znaleziony")
	return user


def get_current_user_fast(token: str = Depends(oauth2_scheme)) -> models.User:
	"""zwraca minimalnego usera z samego JWT bez pytania do bazy"""
	payload = decode_token(token)
	if not payload:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="nieprawidlowy token")
	username = payload.get("sub")
	if not username:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="nieprawidlowy token")
	role = payload.get("role") or "user"
	return SimpleNamespace(username=username, role=role)


def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[models.User]:
	"""zwraca usera lub None jesli brak tokena/niewazny"""
	if not token:
		return None
	payload = decode_token(token)
	if not payload:
		return None
	username = payload.get("sub")
	if not username:
		return None
	return db.query(models.User).filter(models.User.username == username).first()


def require_admin(current_user: models.User = Depends(get_current_user_fast)) -> models.User:
	"""sprawdza czy user ma role admin - rzuca 403 jesli nie"""
	if getattr(current_user, "role", None) != "admin":
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="brak uprawnien")
	return current_user
