#sqlalchemy orm modele
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(32), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="user", nullable=False)
    cube_setup = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    ao5 = Column(Float, nullable=True)
    ao12 = Column(Float, nullable=True)
    best_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    solves = relationship("Solve", back_populates="user", cascade="all, delete-orphan")


class Solve(Base):
    __tablename__ = "solves"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    time_ms = Column(Integer, nullable=False)
    scramble = Column(Text, nullable=False)
    dnf = Column(Boolean, default=False, nullable=False)
    plus_two = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="solves")


class Algorithm(Base):
    __tablename__ = "algorithms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(String(20), nullable=False)
    name = Column(String(255), nullable=False)
    moves = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    image_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
