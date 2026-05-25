from typing import Optional
import os
import uuid
import shutil

from sqlalchemy.orm import Session
from fastapi import UploadFile

from models import Algorithm

ALLOWED_CONTENT_TYPES = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
}
MAX_IMAGE_SIZE = 2 * 1024 * 1024  # 2MB


def _static_dir() -> str:
    base = os.path.dirname(os.path.dirname(__file__))
    path = os.path.join(base, "static", "algs")
    os.makedirs(path, exist_ok=True)
    return path


def get_algorithms(db: Session, category: str) -> list[Algorithm]:
    """Zwraca listę algorytmow dla danej kategorii."""
    return db.query(Algorithm).filter(Algorithm.category == category).order_by(Algorithm.name).all()


def get_algorithm_by_id(db: Session, alg_id: int) -> Optional[Algorithm]:
    """Zwraca Algorithm lub None."""
    return db.query(Algorithm).filter(Algorithm.id == alg_id).first()


def _save_upload_file(upload: UploadFile) -> str:
    """Zapisuje UploadFile do static/algs i zwraca relative path (filename).

    Rzuca ValueError przy nietypowym content_type lub jesli plik za duzy.
    """
    if upload.content_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError("Nieobslugiwany typ pliku")

    ext = ALLOWED_CONTENT_TYPES[upload.content_type]
    data = upload.file.read()
    size = len(data)
    if size > MAX_IMAGE_SIZE:
        raise ValueError("Plik za duzy")

    filename = f"{uuid.uuid4().hex}.{ext}"
    dest = os.path.join(_static_dir(), filename)
    with open(dest, "wb") as f:
        f.write(data)
    return filename


def _remove_file_if_exists(filename: Optional[str]) -> None:
    if not filename:
        return
    try:
        os.remove(os.path.join(_static_dir(), filename))
    except FileNotFoundError:
        pass


def create_algorithm(
    db: Session,
    category: str,
    name: str,
    moves: str,
    description: Optional[str] = None,
    image_file: Optional[UploadFile] = None,
) -> Algorithm:
    """Tworzy nowy Algorithm. Moze zapisac opcjonalny obrazek.

    Rzuca ValueError przy blednym pliku (typ/rozmiar).
    """
    image_path = None
    if image_file is not None:
        image_path = _save_upload_file(image_file)

    alg = Algorithm(
        category=category,
        name=name,
        moves=moves,
        description=description,
        image_path=image_path,
    )
    db.add(alg)
    db.commit()
    db.refresh(alg)
    return alg


def update_algorithm(
    db: Session,
    alg_id: int,
    category: Optional[str] = None,
    name: Optional[str] = None,
    moves: Optional[str] = None,
    description: Optional[str] = None,
    image_file: Optional[UploadFile] = None,
) -> Algorithm:
    """Aktualizuje algorithm. Jesli przekazano image_file, zamienia plik na dysku."""
    alg = get_algorithm_by_id(db, alg_id)
    if alg is None:
        return None

    if category is not None:
        alg.category = category
    if name is not None:
        alg.name = name
    if moves is not None:
        alg.moves = moves
    if description is not None:
        alg.description = description

    if image_file is not None:
        # zapisz nowy plik, usun stary
        new_filename = _save_upload_file(image_file)
        _remove_file_if_exists(alg.image_path)
        alg.image_path = new_filename

    db.add(alg)
    db.commit()
    db.refresh(alg)
    return alg


def delete_algorithm(db: Session, alg_id: int) -> None:
    """Usuwa algorithm i plik z dysku (jesli istnieje)."""
    alg = get_algorithm_by_id(db, alg_id)
    if alg is None:
        return
    _remove_file_if_exists(alg.image_path)
    db.delete(alg)
    db.commit()
