#serwis dla ulozen
from typing import List
from sqlalchemy.orm import Session
import models
from schemas import SolveCreate


def create_solve(db: Session, data: SolveCreate, user_id: int) -> models.Solve:
    """tworzy i zapisuje ulozenie dla usera"""
    solve = models.Solve(
        user_id=user_id,
        time_ms=data.time_ms,
        scramble=data.scramble,
        dnf=data.dnf,
        plus_two=data.plus_two,
    )
    db.add(solve)
    db.commit()
    db.refresh(solve)
    return solve


def get_user_solves(db: Session, user_id: int) -> List[models.Solve]:
    """zwraca wszystkie ulozenia usera posortowane od najnowszego"""
    return db.query(models.Solve).filter(models.Solve.user_id == user_id).order_by(models.Solve.created_at.desc()).all()


def get_user_top10(db: Session, user_id: int) -> List[models.Solve]:
    """zwraca top10 najlepszych czasow (bez DNF), posortowane od najszybszego"""
    qry = db.query(models.Solve).filter(models.Solve.user_id == user_id, models.Solve.dnf == False)
    return qry.order_by(models.Solve.time_ms.asc()).limit(10).all()


def delete_solve(db: Session, solve_id: int, user_id: int) -> None:
    """usuwa ulozenie jesli nalezy do usera, inaczej ValueError"""
    solve = db.query(models.Solve).filter(models.Solve.id == solve_id).first()
    if not solve:
        raise ValueError("ulozenie nie istnieje")
    if solve.user_id != user_id:
        raise ValueError("brak uprawnien do usuniecia ulozenia")
    db.delete(solve)
    db.commit()
    return None
