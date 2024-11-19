from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    email: str
    password: str

class VoiceUpload(BaseModel):
    email: str

class LoginRequest(BaseModel):
    email: Optional[str]
    password: Optional[str]
