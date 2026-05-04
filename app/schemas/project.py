from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class MemberAction(BaseModel):
    user_id: str


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {"name": "My Project", "description": "A cool project"}
        }


class ProjectMemberOut(BaseModel):
    user_id: str
    role: str


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    owner_id: str
    members: List[ProjectMemberOut]
    created_at: datetime
