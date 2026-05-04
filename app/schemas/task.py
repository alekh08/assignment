from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.task import TaskStatus, TaskPriority


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: str
    assigned_to: Optional[str] = None
    priority: TaskPriority = TaskPriority.medium
    due_date: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Fix login bug",
                "description": "Users can't login with Google",
                "project_id": "64abc...",
                "priority": "High",
                "due_date": "2024-12-31T00:00:00",
            }
        }


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    project_id: str
    assigned_to: Optional[str]
    created_by: str
    status: str
    priority: str
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    is_overdue: bool = False
