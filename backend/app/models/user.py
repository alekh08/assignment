from beanie import Document, PydanticObjectId
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class User(Document):
    name: str
    email: EmailStr
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "hashed_password": "hashed...",
            }
        }
