import os
import sys
from pathlib import Path
import pytest

# ensure backend package imports work
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

# ustaw stały secret dla testow (usuwa warning o brakujacym SECRET_KEY)
os.environ.setdefault("SECRET_KEY", "test-secret-for-tests")

from fastapi.testclient import TestClient
from main import app


@pytest.fixture(scope="function")
def client():
    # tworzymy nowy client dla kazdego testu aby uniknac efektow ubocznych
    with TestClient(app) as c:
        yield c
