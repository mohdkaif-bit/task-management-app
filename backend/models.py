# backend/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id       = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    tasks    = relationship("Task", back_populates="owner", cascade="all, delete")

class Task(Base):
    __tablename__ = "tasks"
    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    description = Column(String, default="")
    deadline    = Column(DateTime, nullable=False, default=datetime.utcnow)  # ✅ pass callable
    completed   = Column(Boolean, default=False)
    owner_id    = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner       = relationship("User", back_populates="tasks")
