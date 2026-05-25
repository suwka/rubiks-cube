#jwt logika autoryzacji
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import os
import uuid
import logging

from passlib.context import CryptContext
from jose import jwt, JWTError

# konfiguracja
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY:
	SECRET_KEY = "cubetracker-dev-secret-key"
	logging.warning("brak SECRET_KEY w env - uzywam stalego klucza dev")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def hash_password(plain: str) -> str:
	"""hashuje haslo (bcrypt)"""
	return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
	"""weryfikuje haslo przeciwko hashowi"""
	return pwd_context.verify(plain, hashed)


def create_access_token(data: Dict[str, Any]) -> str:
	"""tworzy jwt z danymi, wazny ACCESS_TOKEN_EXPIRE_MINUTES"""
	to_encode = data.copy()
	expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
	to_encode.update({"exp": expire, "iat": datetime.utcnow()})
	token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
	return token


def decode_token(token: str) -> Optional[Dict[str, Any]]:
	"""dekoduje token, zwraca payload lub None przy bledzie"""
	try:
		payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
		return payload
	except JWTError:
		return None
