from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class MemberRole(str, Enum):
    admin = "admin"
    member = "member"


class ProjectMember(BaseModel):
    user_id: PydanticObjectId
    role: MemberRole = MemberRole.member


class Project(Document):
    name: str
    description: Optional[str] = None
    owner_id: PydanticObjectId
    members: List[ProjectMember] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "projects"
