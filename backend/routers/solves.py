from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from dependencies import get_db, get_current_user
from services import solve_service, stats_service
from schemas import SolveCreate, SolveOut

router = APIRouter()


@router.post("/", response_model=SolveOut, status_code=status.HTTP_201_CREATED)
def create_solve(payload: SolveCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    solve = solve_service.create_solve(db, payload, current_user.id)
    # przeliczenie statystyk w tle
    background_tasks.add_task(stats_service.recalculate_stats, db, current_user.id)
    return SolveOut.model_validate(solve)


@router.get("/me", response_model=List[SolveOut])
def get_my_solves(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    solves = solve_service.get_user_solves(db, current_user.id)
    return [SolveOut.model_validate(s) for s in solves]


@router.get("/user/{user_id}", response_model=List[SolveOut])
def get_user_top10(user_id: int, db: Session = Depends(get_db)):
    solves = solve_service.get_user_top10(db, user_id)
    return [SolveOut.model_validate(s) for s in solves]


@router.delete("/{solve_id}")
def delete_solve(solve_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        solve_service.delete_solve(db, solve_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    return {"message": "deleted"}
