# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from database import Base, engine, get_db
import models, schemas, crud, auth

# --- DB Init ---
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Management API")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# 🔐 AUTH ROUTES
# =========================
@app.post("/auth/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    return crud.create_user(db, user)

@app.post("/auth/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, user.username)
    if not db_user or not auth.verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth.create_access_token({"sub": db_user.username})
    return {"access_token": token, "token_type": "bearer"}

# Helper: extract username from Bearer token
def get_current_username(authorization: Optional[str] = Header(default=None)) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split()[1]
    username = auth.decode_username_from_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")
    return username

# =========================
# 📌 TASK ROUTES
# =========================
@app.post("/tasks", response_model=schemas.TaskOut)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_username)
):
    user = crud.get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.create_task(db, task, user.id)

@app.get("/tasks", response_model=List[schemas.TaskOut])
def list_my_tasks(
    db: Session = Depends(get_db),
    username: str = Depends(get_current_username)
):
    user = crud.get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.list_tasks(db, user.id)

@app.put("/tasks/{task_id}", response_model=schemas.TaskOut)
def update_my_task(
    task_id: int,
    updates: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_username)
):
    user = crud.get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    updated = crud.update_task(db, task_id, user.id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated

@app.delete("/tasks/{task_id}")
def delete_my_task(
    task_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_username)
):
    user = crud.get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    ok = crud.delete_task(db, task_id, user.id)
    if not ok:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"status": "deleted"}
