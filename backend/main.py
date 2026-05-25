#cubetracker api
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine, SessionLocal
from models import User, Solve, Algorithm
from routers import auth as auth_router
from routers import users as users_router
from routers import solves as solves_router
from routers import algorithms as algorithms_router
from routers import admin as admin_router
from utils.seed import seed_db
from services import admin_cache
from routers import algorithms as algorithms_router

app = FastAPI(title="CubeTracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_origin_regex=r"http://localhost(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    # wykonaj seed bazy danych
    db = SessionLocal()
    try:
        seed_db(db)
        admin_cache.rebuild_users_cache(db)
    finally:
        db.close()
    print("baza danych zainicjalizowana")

@app.get("/")
def read_root():
    return {"status": "ok"}


# mount routers
app.include_router(auth_router.router, prefix="/auth")
app.include_router(users_router.router, prefix="/users")
app.include_router(solves_router.router, prefix="/solves")
app.include_router(algorithms_router.router, prefix="/algorithms")
app.include_router(admin_router.router, prefix="/admin")
