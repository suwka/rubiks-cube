#fastapi zaleznosci
from sqlalchemy.orm import Session
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

from database import SessionLocal
