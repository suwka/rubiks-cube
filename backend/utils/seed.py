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
            {"category": "f2l", "name": "basic pair insert", "moves": "U R U' R'", "description": "prosty wklad pary do prawego slotu"},
            {"category": "f2l", "name": "left pair insert", "moves": "U' L' U L", "description": "prosty wklad pary do lewego slotu"},
            {"category": "f2l", "name": "skip insertion", "moves": "U2 R U R'", "description": "wariant dla gotowej pary"},
            {"category": "oll", "name": "sune", "moves": "R U R' U R U2 R'", "description": "jeden z najpopularniejszych przypadkow oll"},
            {"category": "oll", "name": "anti sune", "moves": "R U2 R' U' R U' R'", "description": "odwrocony wariant sune"},
            {"category": "oll", "name": "cross oll", "moves": "F R U R' U' F'", "description": "prosty przypadek orientacji z krzyzem"},
            {"category": "pll", "name": "Ua perm", "moves": "R U' R U R U R U' R' U' R2", "description": "cykl krawedzi dla pll"},
            {"category": "pll", "name": "Ub perm", "moves": "R2 U R U R' U' R' U' R' U R'", "description": "drugi popularny wariant pll"},
            {"category": "pll", "name": "T perm", "moves": "R U R' U' R' F R2 U' R' U' R U R' F'", "description": "czesty przypadek pll do nauki"},
        ]
        for s in samples:
            alg = models.Algorithm(
                category=s["category"],
                name=s["name"],
                moves=s["moves"],
                description=s.get("description"),
            )
            db.add(alg)
        db.commit()
