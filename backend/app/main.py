from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import SessionLocal, engine
from .models import Base, User
from .crud import get_user_by_email, create_user, verify_user_password
from .schemas import LoginRequest
from .encryption import  decrypt_voice_data, encrypt_voice_data
from .encryption import extract_mfcc
from .antispoof import AntiSpoofing
from collections import defaultdict
import shutil
from datetime import datetime
import logging
from pythonjsonlogger import jsonlogger

logger = logging.getLogger("voice_auth")
logger.setLevel(logging.INFO)

file_handler = logging.FileHandler("auth_activity.log")
file_handler.setLevel(logging.INFO)

formatter = jsonlogger.JsonFormatter("%(asctime)s %(name)s %(levelname)s %(message)s")
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)


activity_log = defaultdict(list)
Base.metadata.create_all(bind=engine)
anti_spoofing_model = AntiSpoofing()

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/register")
async def register_user(username: str = Form(...), email: str = Form(...), password: str = Form(...), audio: UploadFile = Form(...), db: Session = Depends(get_db)):  
    existing_user = get_user_by_email(db, email)
    if existing_user:
        raise HTTPException(status_code=409, detail="User already exists")
    
    try:
        audio_data = await audio.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process audio file: {str(e)}")
    
    if anti_spoofing_model.predict(audio_data)[0] == "FAKE":
        raise HTTPException(status_code=400, detail="Spoofing detected")
    
    voice_data = extract_mfcc(audio_data)
    
    create_user(db, username=username, email=email, password=password, voice_data=voice_data)
    
    return {"message": "User registered successfully"}

@app.post("/api/login")
def login_user(request: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, request.email)
    if not user or not verify_user_password(user, request.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"message": "Login successful"}

@app.post("/api/login/voice")
async def login_with_voice(audio: UploadFile = File(...), db: Session = Depends(get_db)):
    global activity_log
    now = datetime.now()

    try:
        audio_data = await audio.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process audio file: {str(e)}")
    

    spoof_score = anti_spoofing_model.predict(audio_data)
    if spoof_score[0] == "FAKE":
        logger.info(f"Spoofing detected for voice login attempt at {now}")
        raise HTTPException(status_code=400, detail="Spoofing detected")
    
    voice_data = extract_mfcc(audio_data)
    users = db.query(User).all()
    for user in users:
        decrypted_voice = decrypt_voice_data(user.voice_data)
        if decrypted_voice == voice_data:
            logger.info(f"Successful voice login attempt for user {user.email} at {now}")
            return {"message": "Login successful"}
        
    logger.info(f"Failed voice login attempt at {now}")
    raise HTTPException(status_code=401, detail="No voice match Login failed")
