#pydantic dto schematy
from pydantic import BaseModel, EmailStr, Field, ConfigDict, computed_field
from datetime import datetime
from typing import Optional


#user schematy
class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=32, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserUpdate(BaseModel):
    bio: Optional[str] = None
    cube_setup: Optional[str] = None


class PasswordChange(BaseModel):
    old_password: str = Field(min_length=8)
    new_password: str = Field(min_length=8, max_length=128)
    new_password_confirm: str


class AdminPasswordChange(BaseModel):
    new_password: str = Field(min_length=8, max_length=128)
    new_password_confirm: str


class UserPublic(BaseModel):
    id: int
    username: str
    bio: Optional[str]
    cube_setup: Optional[str]
    ao5: Optional[float]
    ao12: Optional[float]
    best_time_ms: Optional[int]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserAdmin(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


#solve schematy
class SolveCreate(BaseModel):
    time_ms: int = Field(gt=0, lt=3600000)
    scramble: str = Field(min_length=1, max_length=500)
    dnf: bool = False
    plus_two: bool = False


class SolveOut(BaseModel):
    id: int
    time_ms: int
    scramble: str
    dnf: bool
    plus_two: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


#algorithm schematy
class AlgorithmOut(BaseModel):
    id: int
    category: str
    name: str
    moves: str
    description: Optional[str]
    image_path: Optional[str] = Field(default=None, exclude=True)
    created_at: datetime

    @computed_field
    @property
    def image_url(self) -> Optional[str]:
        if self.image_path:
            return f"http://localhost:8000/static/algs/{self.image_path}"
        return None

    model_config = ConfigDict(from_attributes=True)


#auth schematy
class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


#admin schematy
class UsersPage(BaseModel):
    users: list[UserAdmin]
    has_more: bool


class AdminStats(BaseModel):
    total_users: int
    total_solves: int
    total_algorithms: int
