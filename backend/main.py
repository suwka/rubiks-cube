#cubetracker api
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from models import User, Solve, Algorithm

app = FastAPI(title="CubeTracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    print("baza danych zainicjalizowana")

@app.get("/")
def read_root():
    return {"status": "ok"}
