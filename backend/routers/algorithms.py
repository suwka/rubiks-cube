from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import Optional, List
from sqlalchemy.orm import Session

from dependencies import get_db, require_admin
from services import algorithm_service
from schemas import AlgorithmOut

router = APIRouter()


@router.get("/", response_model=List[AlgorithmOut])
def list_algorithms(category: Optional[str] = None, db: Session = Depends(get_db)):
    algs = algorithm_service.get_algorithms(db, category)
    return [AlgorithmOut.model_validate(a) for a in algs]


@router.get("/{algorithm_id}", response_model=AlgorithmOut)
def get_algorithm(algorithm_id: int, db: Session = Depends(get_db)):
    alg = algorithm_service.get_algorithm_by_id(db, algorithm_id)
    if not alg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="algorithm not found")
    return AlgorithmOut.model_validate(alg)


@router.post("/", response_model=AlgorithmOut, status_code=status.HTTP_201_CREATED)
def create_algorithm(
    category: str = Form(...),
    name: str = Form(...),
    moves: str = Form(...),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    try:
        alg = algorithm_service.create_algorithm(db, category, name, moves, description, image)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return AlgorithmOut.model_validate(alg)


@router.put("/{algorithm_id}", response_model=AlgorithmOut)
def update_algorithm(
    algorithm_id: int,
    category: Optional[str] = Form(None),
    name: Optional[str] = Form(None),
    moves: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    try:
        alg = algorithm_service.update_algorithm(
            db=db,
            alg_id=algorithm_id,
            category=category,
            name=name,
            moves=moves,
            description=description,
            image_file=image,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    if not alg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="algorithm not found")
    return AlgorithmOut.model_validate(alg)


@router.delete("/{algorithm_id}")
def delete_algorithm(algorithm_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    try:
        algorithm_service.delete_algorithm(db, algorithm_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    return {"message": "deleted"}
