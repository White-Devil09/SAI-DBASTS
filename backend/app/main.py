from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import SessionLocal, engine
from .models import Base
from .crud import get_user_by_email, create_user, verify_user_password
from .schemas import UserCreate, LoginRequest
from .encryption import encrypt_voice_data, decrypt_voice_data
from .encryption import extract_mfcc, extract_log_mel_spectrogram
# from .antispoof import AntiSpoofingModel
import shutil
from collections import defaultdict
from datetime import datetime, timedelta
import logging
from pythonjsonlogger import jsonlogger

logger = logging.getLogger("voice_auth")
logger.setLevel(logging.INFO)

file_handler = logging.FileHandler("auth_activity.log")
file_handler.setLevel(logging.INFO)

formatter = jsonlogger.JsonFormatter("%(asctime)s %(name)s %(levelname)s %(message)s")
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)


failed_attempts = defaultdict(list)
Base.metadata.create_all(bind=engine)
# anti_spoofing_model = AntiSpoofingModel(model_path="../weights/antispoofing_model.pth")

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
async def register_user(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    audio: UploadFile = Form(...),
    db: Session = Depends(get_db)
):
    # Check if the email is already registered
    existing_user = get_user_by_email(db, email)
    if existing_user:
        return {"message": "User already exist"}
    
    # Read the uploaded audio file
    try:
        audio_data = await audio.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process audio file: {str(e)}")
    
    voice_data = extract_mfcc(audio_data)
    
    # Store the user with the audio data
    create_user(db, username=username, email=email, password=password, voice_data=voice_data)
    
    return {"message": "User registered successfully"}

@app.post("/api/upload-voice")
def upload_voice(email: str, voice_file: UploadFile = File(...), db: Session = Depends(get_db)):
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Save the uploaded voice file temporarily
    file_path = f"audio/{email}_voice.wav"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(voice_file.file, buffer)

    # Extract MFCC features
    voice_features = extract_mfcc(file_path)

    # Encrypt the voice features
    encrypted_voice = encrypt_voice_data(voice_features)

    # Store encrypted data in the database
    user.voice_data = encrypted_voice
    db.commit()

    return {"message": "Voice data encrypted and uploaded successfully"}

@app.post("/api/login/voice")
def login_with_voice(email: str, voice_file: UploadFile = File(...), db: Session = Depends(get_db)):
    global failed_attempts
    now = datetime.now()

    failed_attempts[email] = [t for t in failed_attempts[email] if t > now - timedelta(minutes=15)]

    if len(failed_attempts[email]) >= 5:
        logger.warning({
            "event": "login_rate_limit",
            "email": email,
            "attempt_count": len(failed_attempts[email]),
            "reason": "Too many failed attempts"
        })
        raise HTTPException(status_code=429, detail="Too many failed attempts. Try again later.")

    user = get_user_by_email(db, email)
    if not user:
        logger.warning({"event": "login_failed", "email": email, "reason": "User not found"})
        raise HTTPException(status_code=404, detail="User not found")

    # Save the uploaded voice file temporarily
    file_path = f"audio/{email}_login_voice.wav"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(voice_file.file, buffer)

    log_mel_features = extract_log_mel_spectrogram(file_path)
    # spoof_score = anti_spoofing_model.predict(log_mel_features)
    spoof_score = 0.1  # Placeholder spoof score

    if spoof_score > 0.5:
        logger.warning({
            "event": "spoof_detected",
            "email": email,
            "spoof_score": spoof_score,
            "reason": "High spoof score detected"
        })
        raise HTTPException(status_code=401, detail="Spoofing detected")

    # Extract features from the login voice
    login_voice_features = extract_mfcc(file_path)   # Example vector

    # Decrypt stored voice data
    stored_voice_features = decrypt_voice_data(user.voice_data)

    # Compare the feature vectors (using cosine similarity or another metric)
    similarity = sum(
        (a - b) ** 2 for a, b in zip(stored_voice_features, login_voice_features)
    ) ** 0.5

    if similarity < 0.5:  # Adjust threshold as needed
        logger.info({"event": "login_successful", "email": email})
        return {"message": "Voice login successful"}
    else:
        failed_attempts[email].append(now)
        logger.warning({
            "event": "login_failed",
            "email": email,
            "reason": "Voice authentication failed",
            "attempt_count": len(failed_attempts[email])
        })
        raise HTTPException(status_code=401, detail="Voice authentication failed")

@app.post("/api/login")
def login_user(request: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, request.email)
    if not user or not verify_user_password(user, request.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"message": "Login successful"}