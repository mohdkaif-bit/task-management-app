# backend/crud.py
from sqlalchemy.orm import Session
import models
import schemas
import auth

# --- Users ---
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        username=user.username,
        password=auth.hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Tasks ---
def create_task(db: Session, task: schemas.TaskCreate, owner_id: int):
    db_task = models.Task(**task.dict(), owner_id=owner_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def list_tasks(db: Session, owner_id: int):
    return (
        db.query(models.Task)
        .filter(models.Task.owner_id == owner_id)
        .order_by(models.Task.deadline)
        .all()
    )

def get_task(db: Session, task_id: int, owner_id: int):
    return (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.owner_id == owner_id)
        .first()
    )

def update_task(db: Session, task_id: int, owner_id: int, updates: schemas.TaskUpdate):
    task = get_task(db, task_id, owner_id)
    if not task:
        return None
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, task_id: int, owner_id: int):
    task = get_task(db, task_id, owner_id)
    if not task:
        return False
    db.delete(task)
    db.commit()
    return True
