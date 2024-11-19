from sqlalchemy.orm import Session
from .models import User
from bcrypt import hashpw, gensalt, checkpw

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, email: str, password: str, voice_data: bytes):
    hashed_password = hashpw(password.encode('utf-8'), gensalt())
    db_user = User(email=email, password_hash=hashed_password, voice_data=voice_data)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def verify_user_password(db_user: User, password: str):
    return checkpw(password.encode('utf-8'), db_user.password_hash)
