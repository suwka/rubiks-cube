from sqlalchemy.orm import Session
import os

import models
from auth import hash_password


def seed_db(db: Session):
    # domyslne dane admina z env lub fallback
    admin_username = os.getenv("ADMIN_USERNAME", "admin")
    admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "adminpass")

    # utworz admina jesli brak
    admin = db.query(models.User).filter(models.User.role == 'admin').first()
    if not admin:
        if not db.query(models.User).filter(models.User.username == admin_username).first():
            u = models.User(
                username=admin_username,
                email=admin_email,
                password_hash=hash_password(admin_password),
                role='admin'
            )
            db.add(u)
            db.commit()

    # dodaj proste algorytmy przy pustej tabeli
    if db.query(models.Algorithm).count() == 0:
        samples = [
            {"category": "pll", "name": "Ua", "moves": "R U' R' U' R U R' F' R U R' U' R' F R"},
            {"category": "oll", "name": "sune", "moves": "R U R' U R U2 R'"},
            {"category": "f2l", "name": "basic", "moves": "U R U' R'"},
        ]
        for s in samples:
            alg = models.Algorithm(category=s["category"], name=s["name"], moves=s["moves"], description=None)
            db.add(alg)
        db.commit()
