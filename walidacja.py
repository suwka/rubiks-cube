from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent / "backend"))

from schemas import UserCreate
from pydantic import ValidationError

#prawidlowo
try:
    u = UserCreate(username="test123", email="test@test.com", password="haslo12345")
    print("UserCreate ok:", u)
except ValidationError as e:
    print("blad:", e)

#zle - username za krotki
try:
    u = UserCreate(username="ab", email="test@test.com", password="haslo12345")
except ValidationError as e:
    print("walidacja catch:", e.error_count(), "bledow")

#zle - haslo za krotkie
try:
    u = UserCreate(username="test123", email="test@test.com", password="haslo")
except ValidationError as e:
    print("haslo za krotkie - catch ok")