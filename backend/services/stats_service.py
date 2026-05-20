#serwis statystyk
from sqlalchemy.orm import Session
import models
import logging
from statistics import mean


def recalculate_stats(db: Session, user_id: int) -> None:
    """przelicza best_time_ms, ao5, ao12 dla usera

    funkcja nie powinna rzucac nieobsluzonych wyjatkow (uzywana jako background task)
    """
    try:
        solves = db.query(models.Solve).filter(models.Solve.user_id == user_id, models.Solve.dnf == False).order_by(models.Solve.created_at.desc()).all()

        if not solves:
            # brak ulozen - ustaw pola na None/zero
            user = db.query(models.User).filter(models.User.id == user_id).first()
            if user:
                user.best_time_ms = None
                user.ao5 = None
                user.ao12 = None
                db.add(user)
                db.commit()
            return

        times = [s.time_ms for s in solves]
        best = min(times) if times else None

        ao5 = None
        if len(times) >= 5:
            last5 = times[:5]
            sorted5 = sorted(last5)
            middle3 = sorted5[1:4]
            ao5 = mean(middle3)

        ao12 = None
        if len(times) >= 12:
            last12 = times[:12]
            sorted12 = sorted(last12)
            middle10 = sorted12[1:11]
            ao12 = mean(middle10)

        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            user.best_time_ms = int(best) if best is not None else None
            user.ao5 = float(ao5) if ao5 is not None else None
            user.ao12 = float(ao12) if ao12 is not None else None
            db.add(user)
            db.commit()
    except Exception:
        logging.exception("blad przy przeliczaniu statystyk dla usera %s", user_id)
        # nie rzuac dalej
        return
