# backend/schemas.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# --- User ---
class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    class Config:
        from_attributes = True  # Pydantic v2

# --- Auth ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# --- Task ---
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = ""
    deadline: datetime
    completed: bool = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    completed: Optional[bool] = None

class TaskOut(TaskBase):
    id: int
    class Config:
        from_attributes = True
