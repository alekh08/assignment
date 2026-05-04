from beanie import Document, PydanticObjectId
from pydantic import Field
from typing import Optional
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    todo = "To Do"
    in_progress = "In Progress"
    done = "Done"


class TaskPriority(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"


class Task(Document):
    title: str
    description: Optional[str] = None
    project_id: PydanticObjectId
    assigned_to: Optional[PydanticObjectId] = None
    created_by: PydanticObjectId
    status: TaskStatus = TaskStatus.todo
    priority: TaskPriority = TaskPriority.medium
    due_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "tasks"
