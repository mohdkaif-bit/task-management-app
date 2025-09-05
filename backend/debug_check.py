from database import SessionLocal
from models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db = SessionLocal()
user = db.query(User).first()
print("Username:", user.username)
print("Password in DB:", user.password)

# Test if raw password "your_password_here" matches
print("Password match?", pwd_context.verify("12345", user.password))
